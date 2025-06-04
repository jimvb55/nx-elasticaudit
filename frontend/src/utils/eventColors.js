/**
 * Event color scheme for Nuxeo audit visualization
 * 
 * This module provides consistent colors for event types across charts
 * with vibrant colors for commonly viewed events and distinct colors
 * for filtered events.
 */

// Main events (shown by default in filtered view)
const mainEventColors = {
  'documentCreated': '#4CAF50',      // Green
  'documentModified': '#2196F3',     // Blue
  'documentPublished': '#9C27B0',    // Purple
  'documentCheckedIn': '#FF9800',    // Orange
  'documentCheckedOut': '#F44336',   // Red
  'documentLocked': '#607D8B',       // Blue Grey
  'documentUnlocked': '#8BC34A',     // Light Green
  'documentMoved': '#FF5722',        // Deep Orange
  'documentVersioned': '#795548',    // Brown
  'documentRemoved': '#9E9E9E',      // Grey
  'workflowTaskCompleted': '#FFEB3B', // Yellow
  'commentAdded': '#00BCD4',         // Cyan
  'loginSuccess': '#673AB7',         // Deep Purple
  'downloadRequest': '#3F51B5',      // Indigo
};

// Filtered events (hidden by default in filtered view)
const filteredEventColors = {
  'securityUpdated': '#E91E63',      // Pink
  'documentSecurityUpdated': '#F06292', // Light Pink
  'Chain Called': '#9FA8DA',         // Light Indigo
  'Sub-WF Changed': '#7986CB',       // Indigo 300
  'rootRegistered': '#A5D6A7',       // Light Green 300
  'rootUnregistered': '#81C784',     // Light Green 400
};

// Additional event types that might be encountered
const additionalEventColors = {
  'blobUpdated': '#80CBC4',          // Teal 200
  'documentRestored': '#26A69A',     // Teal 400
  'documentImported': '#EF5350',     // Red 400
  'documentExported': '#EC407A',     // Pink 400
  'workflowStarted': '#AB47BC',      // Purple 400
  'workflowEnded': '#7E57C2',        // Deep Purple 400
  'auditLogUpdated': '#78909C',      // Blue Grey 400
  'versionRemoved': '#BDBDBD',       // Grey 400
  'relationCreated': '#FF8A65',      // Deep Orange 300
  'relationRemoved': '#FFAB91',      // Deep Orange 200
  // Common Nuxeo event types that may not be covered
  'document': '#5D4037',             // Brown 700
  'eventDocumentCategory': '#827717', // Lime 900
  'documentLifeCycle': '#1B5E20',    // Green 900
  'workflowInstance': '#880E4F',     // Pink 900
  'documentACEUpdated': '#D81B60',   // Pink 600
  'lifecycle': '#2E7D32',            // Green 800
  'comment': '#0097A7',              // Cyan 700
  'download': '#303F9F',             // Indigo 700
  'NuxeoAuthentication': '#6A1B9A',  // Purple 800
  'search': '#5E35B1',               // Deep Purple 600
  'user': '#0288D1',                 // Light Blue 700
};

// Default color for any unspecified event types
const defaultColor = '#1976D2';      // Default Blue

// Combine all color mappings
const eventColors = {
  ...mainEventColors,
  ...filteredEventColors,
  ...additionalEventColors
};

/**
 * Get the color for a specific event ID
 * @param {string} eventId - The event identifier
 * @returns {string} - Hex color code
 */
export function getEventColor(eventId) {
  // If eventId is null or undefined, return the default color
  if (!eventId) {
    console.log(`getEventColor called with null/undefined eventId, returning default color: ${defaultColor}`);
    return defaultColor;
  }
  
  // First try exact match
  if (eventColors[eventId]) {
    console.log(`getEventColor exact match for '${eventId}': ${eventColors[eventId]}`);
    return eventColors[eventId];
  }
  
  // Check if any of our keys is a substring of the eventId
  for (const [key, color] of Object.entries(eventColors)) {
    if (eventId.includes(key)) {
      console.log(`getEventColor substring match: '${eventId}' contains '${key}', returning: ${color}`);
      return color;
    }
  }
  
  // Check for common types with different capitalization
  const lowerEventId = eventId.toLowerCase();
  for (const [key, color] of Object.entries(eventColors)) {
    if (lowerEventId.includes(key.toLowerCase())) {
      console.log(`getEventColor case-insensitive match: '${eventId}' contains '${key}', returning: ${color}`);
      return color;
    }
  }
  
  // No match found, return default color
  console.log(`getEventColor no match for '${eventId}', returning default color: ${defaultColor}`);
  return defaultColor;
}

/**
 * Get list of filtered event types
 * @returns {string[]} - Array of event IDs that are filtered by default
 */
export function getFilteredEventTypes() {
  // Enhanced function to also detect partial matches with filtered events
  const exactMatches = Object.keys(filteredEventColors);
  
  // Log what we're filtering
  console.log('Filtered event types (exact matches):', exactMatches);
  
  return exactMatches;
}

/**
 * Check if an event type is a filtered event
 * @param {string} eventId - The event identifier
 * @returns {boolean} - True if the event is in the filtered list
 */
export function isFilteredEvent(eventId) {
  // If eventId is null or undefined, it's not filtered
  if (!eventId) return false;
  
  // First check for exact match
  if (Object.keys(filteredEventColors).includes(eventId)) {
    console.log(`Event ${eventId} is filtered (exact match)`);
    return true;
  }
  
  // Also check for partial matches to be consistent with our color matching
  const lowerEventId = eventId.toLowerCase();
  for (const key of Object.keys(filteredEventColors)) {
    if (lowerEventId.includes(key.toLowerCase())) {
      console.log(`Event ${eventId} is filtered (contains ${key})`);
      return true;
    }
  }
  
  return false;
}

/**
 * Get all available event colors
 * @returns {Object} - Map of all event IDs to their colors
 */
export function getAllEventColors() {
  return { ...eventColors };
}

export default {
  getEventColor,
  getFilteredEventTypes,
  isFilteredEvent,
  getAllEventColors
};
