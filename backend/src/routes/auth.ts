/**
 * Authentication routes
 */

import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../storage/data-store';
import { hashPassword, comparePassword, generateToken, requireAuth } from '../utils/auth';
import type { RegisterRequest, LoginRequest, User } from '../types';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Register new user
  fastify.post<{ Body: RegisterRequest }>('/api/auth/register', async (request, reply) => {
    try {
      const { email, username, password } = request.body;

      // Validate input
      if (!email || !username || !password) {
        reply.status(400);
        return { success: false, error: 'Missing required fields' };
      }

      // Check if user exists
      if (dataStore.getUserByEmail(email)) {
        reply.status(400);
        return { success: false, error: 'Email already registered' };
      }

      if (dataStore.getUserByUsername(username)) {
        reply.status(400);
        return { success: false, error: 'Username already taken' };
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create user
      const user: User = {
        id: uuidv4(),
        email,
        username,
        passwordHash,
        points: 0,
        level: 1,
        totalReports: 0,
        verifiedReports: 0,
        rejectedReports: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dataStore.createUser(user);

      // Generate token
      const token = generateToken(user.id, user.username);

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      return {
        success: true,
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  });

  // Login
  fastify.post<{ Body: LoginRequest }>('/api/auth/login', async (request, reply) => {
    try {
      const { email, username, password } = request.body;

      // Find user
      let user: User | undefined;
      if (email) {
        user = dataStore.getUserByEmail(email);
      } else if (username) {
        user = dataStore.getUserByUsername(username);
      }

      if (!user) {
        reply.status(401);
        return { success: false, error: 'Invalid credentials' };
      }

      // Verify password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        reply.status(401);
        return { success: false, error: 'Invalid credentials' };
      }

      // Generate token
      const token = generateToken(user.id, user.username);

      // Remove password hash from response
      const { passwordHash: _, ...userResponse } = user;

      return {
        success: true,
        data: {
          user: userResponse,
          token,
        },
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  });

  // Get current user
  fastify.get('/api/auth/me', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const user = dataStore.getUserById(authUser.userId);

      if (!user) {
        reply.status(404);
        return { success: false, error: 'User not found' };
      }

      const { passwordHash: _, ...userResponse } = user;

      return {
        success: true,
        data: userResponse,
      };
    } catch (error) {
      reply.status(401);
      return {
        success: false,
        error: 'Unauthorized',
      };
    }
  });

  // Logout (client-side only for now)
  fastify.post('/api/auth/logout', async (request, reply) => {
    return { success: true };
  });
};
