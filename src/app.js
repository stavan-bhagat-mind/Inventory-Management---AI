const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const notFound = require('./middlewares/notFound');
const env = require('./config/env');

const app = express();

// Security and standard middlewares
app.use(helmet());
app.use(cors());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Mount API routes
app.use('/api', routes);

// 404 handler
app.use(notFound);

// Global centralized error handler
app.use(errorHandler);

module.exports = app;
