require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Step 1: Connect to MongoDB Database
connectDB();

// Step 2: Start Express Server
const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Step 3: Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ UNHANDLED REJECTION Error: ${err.message}`);
  console.log('Shutting down server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});

// Step 4: Handle Termination Signals (Ctrl + C)
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    console.log('🍃 MongoDB connection closed successfully.');
    process.exit(0);
  });
});
