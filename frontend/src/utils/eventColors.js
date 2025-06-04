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
  const color = eventColors[eventId] || defaultColor;
  console.log(`getEventColor called for '${eventId}', returning color: ${color}`);
  return color;
}

/**
 * Get list of filtered event types
 * @returns {string[]} - Array of event IDs that are filtered by default
 */
export function getFilteredEventTypes() {
  return Object.keys(filteredEventColors);
}

/**
 * Check if an event type is a filtered event
 * @param {string} eventId - The event identifier
 * @returns {boolean} - True if the event is in the filtered list
 */
export function isFilteredEvent(eventId) {
  return Object.keys(filteredEventColors).includes(eventId);
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
