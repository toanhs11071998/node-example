require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/errorHandler');

// Import routes
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware bảo mật
app.use(helmet());
app.use(cors());

// Middleware parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server đang chạy',
  });
});

// API Routes
app.use('/api/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại',
    data: null,
  });
});

// Error middleware
app.use(errorMiddleware);

// Export app for serverless usage and local server
module.exports = app;

// If run directly, connect DB and start server
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Server đang chạy trên port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
      });
    } catch (err) {
      console.error('Failed to start server', err);
      process.exit(1);
    }
  })();
}
