/**
 * Application configuration
 */
const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Elasticsearch configuration
  elasticsearchUrl: process.env.ELASTICSEARCH_URL || 'http://10.52.1.17:9200',
  elasticsearchIndex: process.env.ELASTICSEARCH_INDEX || 'nuxeo2023-audit',
  
  // API configuration
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Request timeout in milliseconds
  requestTimeout: 30000
};

module.exports = { config };
