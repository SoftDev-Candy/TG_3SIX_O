/**
 * User routes
 */

import { FastifyPluginAsync } from 'fastify';
import { dataStore } from '../storage/data-store';
import { requireAuth } from '../utils/auth';
import { pointsService } from '../services/points-service';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Get user profile
  fastify.get<{ Params: { id: string } }>('/api/users/:id', async (request, reply) => {
    try {
      const user = dataStore.getUserById(request.params.id);

      if (!user) {
        reply.status(404);
        return { success: false, error: 'User not found' };
      }

      // Remove password hash
      const { passwordHash: _, ...userResponse } = user;

      return {
        success: true,
        data: userResponse,
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch user',
      };
    }
  });

  // Update current user profile
  fastify.patch('/api/users/me', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const updates = request.body as any;

      // Don't allow updating sensitive fields
      delete updates.id;
      delete updates.passwordHash;
      delete updates.points;
      delete updates.level;

      const updated = dataStore.updateUser(authUser.userId, updates);

      if (!updated) {
        reply.status(404);
        return { success: false, error: 'User not found' };
      }

      const { passwordHash: _, ...userResponse } = updated;

      return {
        success: true,
        data: userResponse,
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  });

  // Get leaderboard
  fastify.get('/api/users/leaderboard', async (request, reply) => {
    try {
      const { limit = '10', period = 'all-time' } = request.query as any;
      
      const allUsers = dataStore.getAllUsers();
      
      // Sort by points (for all-time)
      // TODO: Add period filtering for weekly/monthly
      const sorted = allUsers
        .map(user => {
          const { passwordHash: _, ...userResponse } = user;
          return userResponse;
        })
        .sort((a, b) => b.points - a.points)
        .slice(0, parseInt(limit));

      return {
        success: true,
        data: sorted.map((user, index) => ({
          rank: index + 1,
          ...user,
        })),
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch leaderboard',
      };
    }
  });

  // Get user votes
  fastify.get('/api/votes/me', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const { page = '1', limit = '20' } = request.query as any;

      const votes = dataStore.getVotesByUser(authUser.userId);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const items = votes.slice(startIndex, startIndex + limitNum);

      return {
        success: true,
        data: {
          items,
          total: votes.length,
          page: pageNum,
          limit: limitNum,
          hasMore: startIndex + limitNum < votes.length,
        },
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: 'Failed to fetch votes',
      };
    }
  });

  // Get user votes by user ID
  fastify.get<{ Params: { userId: string } }>('/api/votes/user/:userId', async (request, reply) => {
    try {
      const { page = '1', limit = '20' } = request.query as any;

      const votes = dataStore.getVotesByUser(request.params.userId);
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const items = votes.slice(startIndex, startIndex + limitNum);

      return {
        success: true,
        data: {
          items,
          total: votes.length,
          page: pageNum,
          limit: limitNum,
          hasMore: startIndex + limitNum < votes.length,
        },
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch votes',
      };
    }
  });
};
