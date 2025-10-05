/**
 * Points and rewards routes
 */

import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../storage/data-store';
import { requireAuth } from '../utils/auth';
import { pointsService } from '../services/points-service';
import type { RewardRedemption } from '../types';

export const pointsRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Get points history
  fastify.get('/api/points/history', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const { page = '1', limit = '20' } = request.query as any;

      const history = await pointsService.getPointsHistory(
        authUser.userId,
        parseInt(page),
        parseInt(limit)
      );

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch history',
      };
    }
  });

  // Get available rewards
  fastify.get('/api/points/rewards', async (request, reply) => {
    try {
      const rewards = dataStore.getAllRewards();

      return {
        success: true,
        data: rewards,
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch rewards',
      };
    }
  });

  // Redeem reward
  fastify.post<{ Body: { rewardId: string } }>('/api/points/redeem', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const { rewardId } = request.body;

      // Get reward
      const reward = dataStore.getRewardById(rewardId);
      if (!reward) {
        reply.status(404);
        return { success: false, error: 'Reward not found' };
      }

      if (!reward.isActive) {
        reply.status(400);
        return { success: false, error: 'Reward is no longer available' };
      }

      // Check stock
      if (reward.stockAvailable !== -1 && reward.stockAvailable <= 0) {
        reply.status(400);
        return { success: false, error: 'Reward is out of stock' };
      }

      // Get user
      const user = dataStore.getUserById(authUser.userId);
      if (!user) {
        reply.status(404);
        return { success: false, error: 'User not found' };
      }

      // Check if user has enough points
      if (user.points < reward.pointsCost) {
        reply.status(400);
        return {
          success: false,
          error: `Insufficient points. Need ${reward.pointsCost}, have ${user.points}`,
        };
      }

      // Generate coupon code
      const couponCode = `${reward.partnerName.substring(0, 3).toUpperCase()}-TG360-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Create redemption
      const redemption: RewardRedemption = {
        id: uuidv4(),
        userId: authUser.userId,
        rewardId,
        couponCode,
        pointsSpent: reward.pointsCost,
        redeemedAt: new Date().toISOString(),
        expiresAt: reward.expiresAt,
      };

      dataStore.createRedemption(redemption);

      // Deduct points
      dataStore.updateUser(authUser.userId, {
        points: user.points - reward.pointsCost,
      });

      // Create negative transaction
      const transaction = {
        id: uuidv4(),
        userId: authUser.userId,
        amount: -reward.pointsCost,
        reason: `Redeemed: ${reward.title}`,
        createdAt: new Date().toISOString(),
      };
      dataStore.createPointsTransaction(transaction);

      return {
        success: true,
        data: {
          couponCode: redemption.couponCode,
          expiresAt: redemption.expiresAt,
          instructions: `Show this code at ${reward.partnerName}`,
        },
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to redeem reward',
      };
    }
  });

  // Get user's redemptions
  fastify.get('/api/points/redemptions', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const redemptions = dataStore.getUserRedemptions(authUser.userId);

      return {
        success: true,
        data: redemptions,
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: 'Failed to fetch redemptions',
      };
    }
  });
};
