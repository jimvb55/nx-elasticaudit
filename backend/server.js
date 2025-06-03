const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { config } = require('./config');
const auditRoutes = require('./routes/audit');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // In production, specify allowed origins more restrictively
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/audit', auditRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Server error', 
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred' 
  });
});

const PORT = config.port || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Elasticsearch endpoint: ${config.elasticsearchUrl}`);
});
