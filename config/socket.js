const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/TokenBlacklist');
const { logger } = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware: authenticate socket connections
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      // Check if token is blacklisted
      const blacklisted = await TokenBlacklist.findOne({ token });
      if (blacklisted) return next(new Error('Token revoked'));

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      logger.error('Socket auth error', err);
      next(new Error('Invalid token'));
    }
  });

  // Connection
  io.on('connection', (socket) => {
    logger.info(`User ${socket.userId} connected via WebSocket`);

    // User joins project room
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${socket.userId} joined project room: project:${projectId}`);
      io.to(`project:${projectId}`).emit('user-joined', { userId: socket.userId, projectId });
    });

    // User leaves project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
      logger.info(`User ${socket.userId} left project room: project:${projectId}`);
      io.to(`project:${projectId}`).emit('user-left', { userId: socket.userId, projectId });
    });

    // User joins task room
    socket.on('join-task', (taskId) => {
      socket.join(`task:${taskId}`);
      logger.info(`User ${socket.userId} joined task room: task:${taskId}`);
      io.to(`task:${taskId}`).emit('user-joined-task', { userId: socket.userId, taskId });
    });

    // User leaves task room
    socket.on('leave-task', (taskId) => {
      socket.leave(`task:${taskId}`);
      logger.info(`User ${socket.userId} left task room: task:${taskId}`);
      io.to(`task:${taskId}`).emit('user-left-task', { userId: socket.userId, taskId });
    });

    // User typing (for comments)
    socket.on('start-typing', (taskId, userName) => {
      socket.broadcast.to(`task:${taskId}`).emit('user-typing', { userId: socket.userId, userName, taskId });
    });

    socket.on('stop-typing', (taskId) => {
      socket.broadcast.to(`task:${taskId}`).emit('user-stop-typing', { userId: socket.userId, taskId });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initializeSocket, getIO };
