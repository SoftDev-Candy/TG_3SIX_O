/**
 * Report verification service
 * Handles auto-verification logic and status transitions
 */

import { dataStore } from '../storage/data-store';
import { pointsService } from './points-service';
import type { DelayReport } from '../types';

export class VerificationService {
  private readonly AUTO_VERIFY_THRESHOLD = 3; // upvotes needed
  private readonly AUTO_REJECT_THRESHOLD = 5; // downvotes needed
  private readonly FLAG_THRESHOLD = 3; // flags needed

  /**
   * Check if report should auto-verify based on votes
   */
  async checkAutoVerification(reportId: string): Promise<void> {
    const report = dataStore.getReportById(reportId);
    if (!report || report.status !== 'pending') return;

    // Auto-verify if >= 3 upvotes
    if (report.upvotes >= this.AUTO_VERIFY_THRESHOLD) {
      await this.verifyReport(reportId, 'auto');
    }
    // Auto-reject if >= 5 downvotes
    else if (report.downvotes >= this.AUTO_REJECT_THRESHOLD) {
      await this.rejectReport(reportId, 'auto');
    }
  }

  /**
   * Verify a report (manual or auto)
   */
  async verifyReport(reportId: string, source: 'auto' | 'admin' | 'api' = 'auto'): Promise<DelayReport | undefined> {
    const report = dataStore.getReportById(reportId);
    if (!report) return undefined;

    // Update report status
    const updated = dataStore.updateReport(reportId, {
      status: 'verified',
    });

    if (updated) {
      // Award verification bonus to reporter
      await pointsService.awardVerificationBonus(reportId);

      // Award points to helpful voters
      const votes = dataStore.getVotesByReport(reportId);
      for (const vote of votes) {
        if (vote.voteType === 'upvote') {
          await pointsService.awardVotePoints(vote.userId, 'upvote', true);
        }
      }

      console.log(`✅ Report ${reportId} verified (${source})`);
    }

    return updated;
  }

  /**
   * Reject a report (manual or auto)
   */
  async rejectReport(reportId: string, source: 'auto' | 'admin' | 'flags' = 'auto'): Promise<DelayReport | undefined> {
    const report = dataStore.getReportById(reportId);
    if (!report) return undefined;

    // Update report status
    const updated = dataStore.updateReport(reportId, {
      status: 'rejected',
    });

    if (updated) {
      // Revoke reporter's points
      await pointsService.revokeReportPoints(reportId);

      // Award points to helpful downvoters
      const votes = dataStore.getVotesByReport(reportId);
      for (const vote of votes) {
        if (vote.voteType === 'downvote') {
          await pointsService.awardVotePoints(vote.userId, 'downvote', false);
        }
      }

      console.log(`❌ Report ${reportId} rejected (${source})`);
    }

    return updated;
  }

  /**
   * Check if report should be rejected due to flags
   */
  async checkFlagThreshold(reportId: string): Promise<void> {
    const flags = dataStore.getFlagsByReport(reportId);
    
    if (flags.length >= this.FLAG_THRESHOLD) {
      await this.rejectReport(reportId, 'flags');
    }
  }

  /**
   * Resolve a verified report (after incident is over)
   */
  async resolveReport(reportId: string): Promise<DelayReport | undefined> {
    const report = dataStore.getReportById(reportId);
    if (!report || report.status !== 'verified') return undefined;

    return dataStore.updateReport(reportId, {
      status: 'resolved',
    });
  }

  /**
   * Mock API verification (70% success rate for demo)
   */
  async mockApiVerification(reportId: string): Promise<boolean> {
    const report = dataStore.getReportById(reportId);
    if (!report) return false;

    // 70% chance of API confirming delay
    const isConfirmed = Math.random() < 0.7;

    if (isConfirmed) {
      console.log(`🔍 Mock API confirmed delay for report ${reportId}`);
      await this.verifyReport(reportId, 'api');
      return true;
    } else {
      console.log(`🔍 Mock API did not confirm delay for report ${reportId}`);
      return false;
    }
  }
}

export const verificationService = new VerificationService();
