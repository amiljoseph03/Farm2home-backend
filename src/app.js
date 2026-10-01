const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // 1. Product Routes ഇമ്പോർട്ട് ചെയ്തു

const equipmentRoutes = require('./routes/equipmentRoutes');

const bookingRoutes = require('./routes/bookingRoutes');
const cartRouter = require('./routes/cartRoutes');


const orderRouter = require('./routes/orderRoutes');


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
app.use('/api/v1/products', productRoutes); // 2. Product Route ഇവിടെ ചേർത്തു
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);  


// Handle Unhandled Routes (404)
app.all('/{*splat}', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handling Middleware

// app.use(errorMiddleware);

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 🔴 exact error ടെർമിനലിൽ പ്രിന്റ് ചെയ്യാൻ വേണ്ടി ചേർക്കുന്നത്:
  console.log('--- EXACT SERVER ERROR ---');
  console.error(err);
  console.log('---------------------------');

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

module.exports = app;
