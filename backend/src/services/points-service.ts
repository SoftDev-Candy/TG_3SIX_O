/**
 * Points calculation service
 * Implements the points logic from the user story
 */

import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../storage/data-store';
import type { PointsTransaction, DelayReport, User } from '../types';

export class PointsService {
  /**
   * Award points for submitting a report
   * 1st reporter: 1 base + 2 first reporter bonus = 3 points initially
   * 2nd+ reporter: 1 base point
   */
  async awardReportPoints(
    reportId: string,
    userId: string,
    isFirstReporter: boolean
  ): Promise<void> {
    const basePoints = 1;
    const firstReporterBonus = isFirstReporter ? 2 : 0;
    const totalPoints = basePoints + firstReporterBonus;

    // Create transaction
    const transaction: PointsTransaction = {
      id: uuidv4(),
      userId,
      amount: totalPoints,
      reason: isFirstReporter 
        ? 'First reporter bonus + base report'
        : 'Report submitted',
      relatedReportId: reportId,
      createdAt: new Date().toISOString(),
    };

    dataStore.createPointsTransaction(transaction);

    // Update user points
    const user = dataStore.getUserById(userId);
    if (user) {
      dataStore.updateUser(userId, {
        points: user.points + totalPoints,
        totalReports: user.totalReports + 1,
      });
    }
  }

  /**
   * Award points when report receives upvotes
   * 1st reporter gets +1 point per upvote
   */
  async updatePointsFromVote(
    reportId: string,
    voteType: 'upvote' | 'downvote'
  ): Promise<void> {
    const report = dataStore.getReportById(reportId);
    if (!report) return;

    // Only 1st reporter gets points from upvotes
    if (report.reporterOrder === 1 && voteType === 'upvote') {
      const transaction: PointsTransaction = {
        id: uuidv4(),
        userId: report.userId,
        amount: 1,
        reason: 'Report upvoted',
        relatedReportId: reportId,
        createdAt: new Date().toISOString(),
      };

      dataStore.createPointsTransaction(transaction);

      // Update user points
      const user = dataStore.getUserById(report.userId);
      if (user) {
        dataStore.updateUser(report.userId, {
          points: user.points + 1,
        });
      }
    }
  }

  /**
   * Award points for helpful voting
   * Upvoter: 0.5 points if report gets verified
   * Downvoter: 0.5 points if report gets rejected
   */
  async awardVotePoints(
    userId: string,
    voteType: 'upvote' | 'downvote',
    reportWasVerified: boolean
  ): Promise<void> {
    const shouldAward = 
      (voteType === 'upvote' && reportWasVerified) ||
      (voteType === 'downvote' && !reportWasVerified);

    if (!shouldAward) return;

    const transaction: PointsTransaction = {
      id: uuidv4(),
      userId,
      amount: 0.5,
      reason: 'Helpful vote',
      createdAt: new Date().toISOString(),
    };

    dataStore.createPointsTransaction(transaction);

    const user = dataStore.getUserById(userId);
    if (user) {
      dataStore.updateUser(userId, {
        points: user.points + 0.5,
      });
    }
  }

  /**
   * Revoke points when report is rejected
   */
  async revokeReportPoints(reportId: string): Promise<void> {
    const report = dataStore.getReportById(reportId);
    if (!report) return;

    const user = dataStore.getUserById(report.userId);
    if (!user) return;

    // Calculate how many points to revoke
    const transactions = dataStore.getPointsHistory(report.userId)
      .filter(t => t.relatedReportId === reportId && t.amount > 0);
    
    const totalToRevoke = transactions.reduce((sum, t) => sum + t.amount, 0);

    if (totalToRevoke > 0) {
      const transaction: PointsTransaction = {
        id: uuidv4(),
        userId: report.userId,
        amount: -totalToRevoke,
        reason: 'Report rejected - points revoked',
        relatedReportId: reportId,
        createdAt: new Date().toISOString(),
      };

      dataStore.createPointsTransaction(transaction);

      dataStore.updateUser(report.userId, {
        points: Math.max(0, user.points - totalToRevoke),
        rejectedReports: user.rejectedReports + 1,
      });
    }
  }

  /**
   * Award bonus points when report is verified
   */
  async awardVerificationBonus(reportId: string): Promise<void> {
    const report = dataStore.getReportById(reportId);
    if (!report) return;

    // Bonus points for first reporter on verification
    if (report.reporterOrder === 1) {
      const bonusPoints = 2;
      
      const transaction: PointsTransaction = {
        id: uuidv4(),
        userId: report.userId,
        amount: bonusPoints,
        reason: 'Report verified - bonus points',
        relatedReportId: reportId,
        createdAt: new Date().toISOString(),
      };

      dataStore.createPointsTransaction(transaction);

      const user = dataStore.getUserById(report.userId);
      if (user) {
        dataStore.updateUser(report.userId, {
          points: user.points + bonusPoints,
          verifiedReports: user.verifiedReports + 1,
        });
      }
    }
  }

  /**
   * Get user's total points
   */
  async getUserPoints(userId: string): Promise<number> {
    const user = dataStore.getUserById(userId);
    return user?.points || 0;
  }

  /**
   * Get points transaction history
   */
  async getPointsHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ items: PointsTransaction[]; total: number; page: number; limit: number; hasMore: boolean }> {
    const allTransactions = dataStore.getPointsHistory(userId);
    const total = allTransactions.length;
    const startIndex = (page - 1) * limit;
    const items = allTransactions.slice(startIndex, startIndex + limit);
    
    return {
      items,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
    };
  }

  /**
   * Calculate user level based on points
   */
  calculateUserLevel(points: number): number {
    if (points < 10) return 1;
    if (points < 50) return 2;
    if (points < 150) return 3;
    if (points < 300) return 4;
    if (points < 500) return 5;
    return 6;
  }
}

export const pointsService = new PointsService();
