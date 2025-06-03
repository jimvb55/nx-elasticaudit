import axios from 'axios';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for handling requests
apiClient.interceptors.request.use(
  config => {
    // You can add authorization headers or other modifications here
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Handle errors globally
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default {
  /**
   * Get audit events by document UUID
   * @param {string} uuid - Document UUID
   * @param {Object} options - Query options
   * @returns {Promise} - Promise with API response
   */
  getAuditByUuid(uuid, options = {}) {
    return apiClient.get(`/audit/by-uuid/${uuid}`, { params: options });
  },

  /**
   * Get audit events by document title
   * @param {string} title - Document title
   * @param {Object} options - Query options
   * @returns {Promise} - Promise with API response
   */
  getAuditByTitle(title, options = {}) {
    return apiClient.get(`/audit/by-title/${encodeURIComponent(title)}`, { params: options });
  },

  /**
   * Get summary of events for a document
   * @param {string} uuid - Document UUID
   * @returns {Promise} - Promise with API response
   */
  getAuditSummary(uuid) {
    return apiClient.get(`/audit/summary/${uuid}`);
  },

  /**
   * Get timeline data for visualization
   * @param {string} uuid - Document UUID
   * @returns {Promise} - Promise with API response
   */
  getAuditTimeline(uuid) {
    return apiClient.get(`/audit/timeline/${uuid}`);
  },

  /**
   * Get all available event types
   * @returns {Promise} - Promise with API response
   */
  getEventTypes() {
    return apiClient.get('/audit/event-types');
  },

  /**
   * Search for documents by query string
   * @param {string} query - Search query
   * @param {Object} options - Query options
   * @returns {Promise} - Promise with API response
   */
  search(query, options = {}) {
    return apiClient.get(`/audit/search`, { 
      params: { 
        q: query,
        ...options
      } 
    });
  }
};
