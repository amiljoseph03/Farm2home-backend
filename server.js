require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
});

// Unhandled Rejections Handling (e.g. database connection failures)
process.on('unhandledRejection', (err) => {
  console.error(`ERROR: ${err.message}`);
  console.log('Shutting down server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});
