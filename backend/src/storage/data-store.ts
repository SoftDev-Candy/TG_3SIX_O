/**
 * In-memory data store for hackathon demo
 * TODO: Replace with PostgreSQL/MongoDB for production
 */

import type {
  User,
  DelayReport,
  Vote,
  PointsTransaction,
  ReportFlag,
  Reward,
  RewardRedemption,
} from '../types';

export class DataStore {
  private users: Map<string, User> = new Map();
  private reports: Map<string, DelayReport> = new Map();
  private votes: Map<string, Vote> = new Map(); // key: userId-reportId
  private pointsTransactions: Map<string, PointsTransaction> = new Map();
  private reportFlags: Map<string, ReportFlag> = new Map();
  private rewards: Map<string, Reward> = new Map();
  private redemptions: Map<string, RewardRedemption> = new Map();

  constructor() {
    this.seedMockData();
  }

  // User operations
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  getUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Report operations
  getReportById(id: string): DelayReport | undefined {
    return this.reports.get(id);
  }

  createReport(report: DelayReport): DelayReport {
    this.reports.set(report.id, report);
    return report;
  }

  updateReport(id: string, updates: Partial<DelayReport>): DelayReport | undefined {
    const report = this.reports.get(id);
    if (!report) return undefined;
    const updated = { ...report, ...updates, updatedAt: new Date().toISOString() };
    this.reports.set(id, updated);
    return updated;
  }

  getReports(filters?: {
    transportType?: string;
    severity?: string;
    status?: string;
    userId?: string;
  }): DelayReport[] {
    let reports = Array.from(this.reports.values());
    
    if (filters?.transportType) {
      reports = reports.filter(r => r.transportType === filters.transportType);
    }
    if (filters?.severity) {
      reports = reports.filter(r => r.severity === filters.severity);
    }
    if (filters?.status) {
      reports = reports.filter(r => r.status === filters.status);
    }
    if (filters?.userId) {
      reports = reports.filter(r => r.userId === filters.userId);
    }
    
    return reports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  deleteReport(id: string): boolean {
    return this.reports.delete(id);
  }

  // Vote operations
  getVote(userId: string, reportId: string): Vote | undefined {
    return this.votes.get(`${userId}-${reportId}`);
  }

  createVote(vote: Vote): Vote {
    const key = `${vote.userId}-${vote.reportId}`;
    this.votes.set(key, vote);
    return vote;
  }

  updateVote(userId: string, reportId: string, voteType: 'upvote' | 'downvote'): Vote | undefined {
    const key = `${userId}-${reportId}`;
    const vote = this.votes.get(key);
    if (!vote) return undefined;
    const updated = { ...vote, voteType, updatedAt: new Date().toISOString() };
    this.votes.set(key, updated);
    return updated;
  }

  deleteVote(userId: string, reportId: string): boolean {
    return this.votes.delete(`${userId}-${reportId}`);
  }

  getVotesByUser(userId: string): Vote[] {
    return Array.from(this.votes.values()).filter(v => v.userId === userId);
  }

  getVotesByReport(reportId: string): Vote[] {
    return Array.from(this.votes.values()).filter(v => v.reportId === reportId);
  }

  // Points operations
  createPointsTransaction(transaction: PointsTransaction): PointsTransaction {
    this.pointsTransactions.set(transaction.id, transaction);
    return transaction;
  }

  getPointsHistory(userId: string): PointsTransaction[] {
    return Array.from(this.pointsTransactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Flag operations
  createFlag(flag: ReportFlag): ReportFlag {
    this.reportFlags.set(flag.id, flag);
    return flag;
  }

  getFlagsByReport(reportId: string): ReportFlag[] {
    return Array.from(this.reportFlags.values()).filter(f => f.reportId === reportId);
  }

  hasUserFlagged(userId: string, reportId: string): boolean {
    return Array.from(this.reportFlags.values()).some(
      f => f.userId === userId && f.reportId === reportId
    );
  }

  // Reward operations
  getAllRewards(): Reward[] {
    return Array.from(this.rewards.values()).filter(r => r.isActive);
  }

  getRewardById(id: string): Reward | undefined {
    return this.rewards.get(id);
  }

  createRedemption(redemption: RewardRedemption): RewardRedemption {
    this.redemptions.set(redemption.id, redemption);
    return redemption;
  }

  getUserRedemptions(userId: string): RewardRedemption[] {
    return Array.from(this.redemptions.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.redeemedAt).getTime() - new Date(a.redeemedAt).getTime());
  }

  // Seed mock data for demo
  private seedMockData() {
    // Seed some rewards
    const rewards: Reward[] = [
      {
        id: 'reward-1',
        title: 'MPK Kraków 10% Discount',
        description: '10% off your next monthly transit pass',
        pointsCost: 50,
        partnerName: 'MPK Kraków',
        imageUrl: '/rewards/mpk.jpg',
        stockAvailable: -1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'reward-2',
        title: 'Coffee at Café Bunkier',
        description: 'Free coffee at Café Bunkier near Main Square',
        pointsCost: 30,
        partnerName: 'Café Bunkier',
        stockAvailable: 50,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'reward-3',
        title: 'PKP Intercity 15% Off',
        description: '15% discount on intercity train tickets',
        pointsCost: 75,
        partnerName: 'PKP Intercity',
        stockAvailable: -1,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];

    rewards.forEach(r => this.rewards.set(r.id, r));
  }
}

// Export singleton instance
export const dataStore = new DataStore();
