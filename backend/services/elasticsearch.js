const axios = require('axios');
const { config } = require('../config');

// Create axios instance with default configuration
const elasticsearchClient = axios.create({
  baseURL: config.elasticsearchUrl,
  timeout: config.requestTimeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Get audit events by document UUID
 * @param {string} uuid - Document UUID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Elasticsearch response
 */
async function getAuditByUuid(uuid, options = {}) {
  const { size = 100, from = 0, sort = 'eventDate:asc' } = options;
  
  const [sortField, sortOrder] = sort.split(':');
  
  const query = {
    size,
    from,
    sort: [
      { [sortField]: { order: sortOrder || 'asc' } }
    ],
    query: {
      match: {
        docUUID: uuid
      }
    }
  };
  
  try {
    const response = await elasticsearchClient.post(
      `/${config.elasticsearchIndex}/_search`,
      query
    );
    
    return {
      total: response.data.hits.total.value,
      events: response.data.hits.hits.map(hit => hit._source)
    };
  } catch (error) {
    console.error('Elasticsearch error:', error.message);
    throw new Error(`Failed to retrieve audit events: ${error.message}`);
  }
}

/**
 * Get audit events by document title
 * @param {string} title - Document title
 * @param {Object} options - Query options
 * @returns {Promise<Object>} - Elasticsearch response
 */
async function getAuditByTitle(title, options = {}) {
  const { size = 100, from = 0, sort = 'eventDate:asc' } = options;
  
  const [sortField, sortOrder] = sort.split(':');
  
  // Using multi_match to search across multiple fields that might contain the title
  const query = {
    size,
    from,
    sort: [
      { [sortField]: { order: sortOrder || 'asc' } }
    ],
    query: {
      multi_match: {
        query: title,
        fields: ["comment^3", "comment.fulltext^2", "extended.title"]
      }
    }
  };
  
  try {
    const response = await elasticsearchClient.post(
      `/${config.elasticsearchIndex}/_search`,
      query
    );
    
    // Get unique document IDs from the search results
    const docIds = [...new Set(response.data.hits.hits.map(hit => hit._source.docUUID))];
    
    // If we found document IDs, get all audit events for these documents
    if (docIds.length > 0) {
      const auditQuery = {
        size: 1000, // Get more events to ensure we have complete history
        sort: [
          { [sortField]: { order: sortOrder || 'asc' } }
        ],
        query: {
          bool: {
            should: docIds.map(id => ({
              match: {
                docUUID: id
              }
            })),
            minimum_should_match: 1
          }
        }
      };
      
      const auditResponse = await elasticsearchClient.post(
        `/${config.elasticsearchIndex}/_search`,
        auditQuery
      );
      
      return {
        total: auditResponse.data.hits.total.value,
        events: auditResponse.data.hits.hits.map(hit => hit._source),
        searchResults: docIds
      };
    }
    
    return {
      total: response.data.hits.total.value,
      events: response.data.hits.hits.map(hit => hit._source),
      searchResults: docIds
    };
  } catch (error) {
    console.error('Elasticsearch error:', error.message);
    throw new Error(`Failed to retrieve audit events by title: ${error.message}`);
  }
}

/**
 * Get summary of events for a document
 * @param {string} uuid - Document UUID
 * @returns {Promise<Object>} - Summary of events
 */
async function getAuditSummary(uuid) {
  try {
    // First get all events for the document
    const { events } = await getAuditByUuid(uuid, { size: 1000 });
    
    if (events.length === 0) {
      return { uuid, events: 0, summary: [] };
    }
    
    // Group events by eventId
    const eventGroups = events.reduce((acc, event) => {
      const { eventId } = event;
      if (!acc[eventId]) {
        acc[eventId] = [];
      }
      acc[eventId].push(event);
      return acc;
    }, {});
    
    // Create summary by event type
    const summary = Object.keys(eventGroups).map(eventId => {
      const eventsOfType = eventGroups[eventId];
      return {
        eventId,
        count: eventsOfType.length,
        firstOccurrence: eventsOfType.reduce((min, e) => 
          new Date(e.eventDate) < new Date(min.eventDate) ? e : min, eventsOfType[0]),
        lastOccurrence: eventsOfType.reduce((max, e) => 
          new Date(e.eventDate) > new Date(max.eventDate) ? e : max, eventsOfType[0])
      };
    });
    
    // Sort by first occurrence date
    summary.sort((a, b) => new Date(a.firstOccurrence.eventDate) - new Date(b.firstOccurrence.eventDate));
    
    return {
      uuid,
      events: events.length,
      summary,
      firstEvent: events.reduce((min, e) => 
        new Date(e.eventDate) < new Date(min.eventDate) ? e : min, events[0]),
      lastEvent: events.reduce((max, e) => 
        new Date(e.eventDate) > new Date(max.eventDate) ? e : max, events[0])
    };
  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error(`Failed to generate audit summary: ${error.message}`);
  }
}

/**
 * Get timeline data for visualization
 * @param {string} uuid - Document UUID
 * @returns {Promise<Object>} - Timeline data
 */
async function getAuditTimeline(uuid) {
  try {
    // First get all events for the document
    const { events } = await getAuditByUuid(uuid, { size: 1000, sort: 'eventDate:asc' });
    
    if (events.length === 0) {
      return { uuid, events: 0, timeline: [] };
    }
    
    // Group events by type and calculate durations
    const timeline = [];
    let previousEvent = null;
    
    for (const event of events) {
      if (previousEvent) {
        const startTime = new Date(previousEvent.eventDate);
        const endTime = new Date(event.eventDate);
        const durationMs = endTime - startTime;
        
        timeline.push({
          startEvent: previousEvent,
          endEvent: event,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          durationMs,
          durationFormatted: formatDuration(durationMs)
        });
      }
      
      previousEvent = event;
    }
    
    // Calculate total duration
    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];
    const totalDurationMs = new Date(lastEvent.eventDate) - new Date(firstEvent.eventDate);
    
    return {
      uuid,
      events: events.length,
      timeline,
      firstEvent,
      lastEvent,
      totalDurationMs,
      totalDurationFormatted: formatDuration(totalDurationMs)
    };
  } catch (error) {
    console.error('Error generating timeline:', error.message);
    throw new Error(`Failed to generate audit timeline: ${error.message}`);
  }
}

/**
 * Get all available event types
 * @returns {Promise<Array>} - List of event types
 */
async function getEventTypes() {
  try {
    const query = {
      size: 0,
      aggs: {
        event_types: {
          terms: {
            field: "eventId",
            size: 100
          }
        }
      }
    };
    
    const response = await elasticsearchClient.post(
      `/${config.elasticsearchIndex}/_search`,
      query
    );
    
    return response.data.aggregations.event_types.buckets.map(bucket => ({
      eventId: bucket.key,
      count: bucket.doc_count
    }));
  } catch (error) {
    console.error('Elasticsearch error:', error.message);
    throw new Error(`Failed to retrieve event types: ${error.message}`);
  }
}

/**
 * Format duration in milliseconds to a human-readable string
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  
  return `${seconds}s`;
}

module.exports = {
  getAuditByUuid,
  getAuditByTitle,
  getAuditSummary,
  getAuditTimeline,
  getEventTypes
};
