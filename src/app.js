const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res
    .status(200)
    .json({ status: 'success', message: 'Server is healthy and running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// Handle Unhandled Routes (404)
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
