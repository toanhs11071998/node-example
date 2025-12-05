require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const connectDB = require('./config/database');
const errorMiddleware = require('./middleware/errorHandler');
const { morganMiddleware } = require('./config/logger');
const { initializeSocket } = require('./config/socket');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Global rate limiter (basic)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // limit login/register attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const teamRoutes = require('./routes/teamRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const activityRoutes = require('./routes/activityRoutes');

const app = express();

// Middleware bảo mật
app.use(helmet());
app.use(cors());
// Logging
app.use(morganMiddleware);
// Apply global limiter to all API routes
app.use('/api', limiter);


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
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks/:taskId/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/projects/:projectId/tasks/:taskId/attachments', attachmentRoutes);
app.use('/api/activity', activityRoutes);

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
      // Create HTTP server for Socket.io
      const server = http.createServer(app);
      initializeSocket(server);
      server.listen(PORT, () => {
        console.log(`Server đang chạy trên port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`WebSocket ready`);
      });
    } catch (err) {
      console.error('Failed to start server', err);
      process.exit(1);
    }
  })();
}
