/**
 * Travel Guardian 360 - Fastify Backend Server
 * Main entry point for the API
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from 'dotenv';

// Load environment variables
config();

// Import routes
import { authRoutes } from './routes/auth';
import { reportRoutes } from './routes/reports';
import { pointsRoutes } from './routes/points';
import { userRoutes } from './routes/users';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Register plugins
fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Register routes
fastify.register(authRoutes);
fastify.register(reportRoutes);
fastify.register(pointsRoutes);
fastify.register(userRoutes);

// Health check endpoint
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
  };
});

// Root endpoint
fastify.get('/', async () => {
  return {
    name: 'Travel Guardian 360 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/*',
      reports: '/api/reports/*',
      points: '/api/points/*',
      users: '/api/users/*',
    },
  };
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  reply.status(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal server error',
    statusCode: error.statusCode || 500,
  });
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log('\n🚀 Travel Guardian 360 Backend Server Started');
    console.log(`📡 Server listening on http://${host}:${port}`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\n📚 Available endpoints:');
    console.log('   - GET  /health');
    console.log('   - POST /api/auth/register');
    console.log('   - POST /api/auth/login');
    console.log('   - GET  /api/auth/me');
    console.log('   - POST /api/reports');
    console.log('   - GET  /api/reports');
    console.log('   - PATCH /api/reports/:id/vote');
    console.log('   - POST /api/reports/:id/flag');
    console.log('   - GET  /api/points/history');
    console.log('   - GET  /api/points/rewards');
    console.log('   - POST /api/points/redeem');
    console.log('   - GET  /api/users/leaderboard');
    console.log('\n✨ Ready for demo!\n');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  console.log('✅ Server closed successfully');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
start();
