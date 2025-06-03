const express = require('express');
const router = express.Router();
const elasticsearchService = require('../services/elasticsearch');

/**
 * Get audit events by document UUID
 * @route GET /api/audit/by-uuid/:uuid
 */
router.get('/by-uuid/:uuid', async (req, res, next) => {
  try {
    const { uuid } = req.params;
    const { size = 100, from = 0, sort = 'eventDate:asc' } = req.query;
    
    const result = await elasticsearchService.getAuditByUuid(uuid, {
      size: parseInt(size),
      from: parseInt(from),
      sort
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get audit events by document title (requires full-text search)
 * @route GET /api/audit/by-title/:title
 */
router.get('/by-title/:title', async (req, res, next) => {
  try {
    const { title } = req.params;
    const { size = 100, from = 0, sort = 'eventDate:asc' } = req.query;
    
    const result = await elasticsearchService.getAuditByTitle(title, {
      size: parseInt(size),
      from: parseInt(from),
      sort
    });
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get summary of events for a document
 * @route GET /api/audit/summary/:uuid
 */
router.get('/summary/:uuid', async (req, res, next) => {
  try {
    const { uuid } = req.params;
    
    const result = await elasticsearchService.getAuditSummary(uuid);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get timeline data for visualization
 * @route GET /api/audit/timeline/:uuid
 */
router.get('/timeline/:uuid', async (req, res, next) => {
  try {
    const { uuid } = req.params;
    
    const result = await elasticsearchService.getAuditTimeline(uuid);
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all available event types
 * @route GET /api/audit/event-types
 */
router.get('/event-types', async (req, res, next) => {
  try {
    const result = await elasticsearchService.getEventTypes();
    
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
