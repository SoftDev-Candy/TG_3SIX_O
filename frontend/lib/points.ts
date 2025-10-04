import { PointsCalculation, DelayReport } from '@/types';

/**
 * Calculate points for a report based on the user story requirements:
 * - 1st user gets 1 point and 1 additional point for each upvote
 * - 2nd user gets 1 point
 * - Additional users get points based on verification and helpfulness
 */
export function calculateReportPoints(
  report: DelayReport,
  isFirstReporter: boolean = false,
  upvotes: number = 0,
  isVerified: boolean = false
): PointsCalculation {
  let basePoints = 1; // Base point for submission
  let upvoteBonus = upvotes; // 1 point per upvote
  let firstReporterBonus = 0;
  
  // First reporter gets additional benefits
  if (isFirstReporter) {
    firstReporterBonus = 2; // Extra bonus for being first
  }
  
  // Verified reports get bonus points
  if (isVerified && report.status === 'verified') {
    basePoints += 1;
  }
  
  // Penalty for rejected reports
  if (report.status === 'rejected') {
    basePoints = 0;
    upvoteBonus = 0;
    firstReporterBonus = 0;
  }
  
  const total = basePoints + upvoteBonus + firstReporterBonus;
  
  return {
    basePoints,
    upvoteBonus,
    firstReporterBonus,
    total: Math.max(0, total), // Ensure non-negative
  };
}

/**
 * Calculate points for voting on reports
 */
export function calculateVotePoints(
  voteType: 'upvote' | 'downvote',
  reportWasVerified: boolean = false
): number {
  // Users get small points for helpful voting
  if (voteType === 'upvote' && reportWasVerified) {
    return 0.5; // Half point for helpful upvote
  }
  
  if (voteType === 'downvote' && !reportWasVerified) {
    return 0.5; // Half point for helpful downvote
  }
  
  return 0;
}

/**
 * Format points for display
 */
export function formatPoints(points: number): string {
  if (points === 0) return '0';
  if (points < 1) return points.toFixed(1);
  return Math.floor(points).toString();
}

/**
 * Get user level based on total points
 */
export function getUserLevel(totalPoints: number): {
  level: number;
  title: string;
  nextLevelPoints: number;
  progress: number;
} {
  const levels = [
    { level: 1, title: 'New Reporter', minPoints: 0, maxPoints: 9 },
    { level: 2, title: 'Active Reporter', minPoints: 10, maxPoints: 24 },
    { level: 3, title: 'Trusted Reporter', minPoints: 25, maxPoints: 49 },
    { level: 4, title: 'Expert Reporter', minPoints: 50, maxPoints: 99 },
    { level: 5, title: 'Community Leader', minPoints: 100, maxPoints: 199 },
    { level: 6, title: 'Transit Guardian', minPoints: 200, maxPoints: Infinity },
  ];
  
  const currentLevel = levels.find(l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints) || levels[0];
  const nextLevel = levels.find(l => l.level === currentLevel.level + 1);
  
  const progress = nextLevel 
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  
  return {
    level: currentLevel.level,
    title: currentLevel.title,
    nextLevelPoints: nextLevel?.minPoints || 0,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

/**
 * Get badge/achievement based on user activity
 */
export function getUserBadges(userStats: {
  totalReports: number;
  verifiedReports: number;
  totalUpvotes: number;
  helpfulVotes: number;
  consecutiveDays: number;
}): string[] {
  const badges: string[] = [];
  
  // Reporting badges
  if (userStats.totalReports >= 1) badges.push('First Reporter');
  if (userStats.totalReports >= 10) badges.push('Regular Reporter');
  if (userStats.totalReports >= 50) badges.push('Super Reporter');
  
  // Accuracy badges
  const accuracyRate = userStats.totalReports > 0 ? userStats.verifiedReports / userStats.totalReports : 0;
  if (accuracyRate >= 0.8 && userStats.totalReports >= 5) badges.push('Accurate Reporter');
  if (accuracyRate >= 0.95 && userStats.totalReports >= 10) badges.push('Precision Expert');
  
  // Community badges
  if (userStats.totalUpvotes >= 25) badges.push('Community Favorite');
  if (userStats.helpfulVotes >= 50) badges.push('Helpful Voter');
  
  // Streak badges
  if (userStats.consecutiveDays >= 7) badges.push('Weekly Warrior');
  if (userStats.consecutiveDays >= 30) badges.push('Monthly Master');
  
  return badges;
}
