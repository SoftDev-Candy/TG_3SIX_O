/**
 * Seed demo data for hackathon presentation
 * Creates realistic users, reports, votes, and points transactions
 */

import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../storage/data-store';
import { hashPassword } from './auth';
import type { User, DelayReport, Vote, PointsTransaction } from '../types';

export async function seedDemoData() {
  console.log('🌱 Seeding demo data...');

  // Create demo users
  const demoUsers: User[] = [
    {
      id: 'demo-user-1',
      email: 'anna@example.com',
      username: 'anna_transit',
      passwordHash: await hashPassword('demo123'),
      points: 45,
      level: 3,
      totalReports: 8,
      verifiedReports: 6,
      rejectedReports: 1,
      totalUpvotes: 24,
      totalDownvotes: 2,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-user-2',
      email: 'piotr@example.com',
      username: 'piotr_commuter',
      passwordHash: await hashPassword('demo123'),
      points: 28,
      level: 2,
      totalReports: 5,
      verifiedReports: 4,
      rejectedReports: 0,
      totalUpvotes: 15,
      totalDownvotes: 1,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-user-3',
      email: 'kasia@example.com',
      username: 'kasia_krakow',
      passwordHash: await hashPassword('demo123'),
      points: 62,
      level: 4,
      totalReports: 12,
      verifiedReports: 10,
      rejectedReports: 0,
      totalUpvotes: 38,
      totalDownvotes: 3,
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  demoUsers.forEach(user => dataStore.createUser(user));

  // Create demo reports showing different statuses
  const demoReports: DelayReport[] = [
    {
      id: 'demo-report-1',
      userId: 'demo-user-1',
      transportType: 'tram',
      line: '8',
      location: {
        lat: 50.0614,
        lng: 19.9372,
        address: 'Main Square, Kraków',
        stopId: 'main-square',
      },
      severity: 'moderate',
      issueCategory: 'mechanical',
      description: 'Tram 8 stuck at Main Square due to door malfunction. Passengers being transferred to next tram.',
      photos: [],
      status: 'verified',
      upvotes: 5,
      downvotes: 0,
      reporterOrder: 1,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-report-2',
      userId: 'demo-user-2',
      transportType: 'bus',
      line: '194',
      location: {
        lat: 50.0778,
        lng: 19.8956,
        address: 'AGH University, Kraków',
        stopId: 'agh-university',
      },
      severity: 'minor',
      issueCategory: 'crowding',
      description: 'Bus 194 extremely crowded during rush hour. Consider adding extra service.',
      photos: [],
      status: 'pending',
      upvotes: 2,
      downvotes: 0,
      reporterOrder: 1,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-report-3',
      userId: 'demo-user-3',
      transportType: 'tram',
      line: '52',
      location: {
        lat: 50.067472,
        lng: 19.991694,
        address: 'Tauron Arena, Kraków',
        stopId: 'tauron-arena',
      },
      severity: 'severe',
      issueCategory: 'signal',
      description: 'Signal failure at Tauron Arena intersection. Trams backing up in both directions.',
      photos: [],
      status: 'verified',
      upvotes: 8,
      downvotes: 1,
      reporterOrder: 1,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'demo-report-4',
      userId: 'demo-user-1',
      transportType: 'train',
      line: 'S1',
      location: {
        lat: 50.0677,
        lng: 19.9445,
        address: 'Kraków Główny Station',
        stopId: 'krakow-glowny',
      },
      severity: 'moderate',
      issueCategory: 'weather',
      description: 'Train S1 delayed due to weather conditions. Expected 20 minute delay.',
      photos: [],
      status: 'resolved',
      upvotes: 3,
      downvotes: 0,
      reporterOrder: 1,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date().toISOString(),
    },
  ];

  demoReports.forEach(report => dataStore.createReport(report));

  // Create votes
  const demoVotes: Vote[] = [
    // Votes for report 1
    { id: uuidv4(), userId: 'demo-user-2', reportId: 'demo-report-1', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), userId: 'demo-user-3', reportId: 'demo-report-1', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    
    // Votes for report 2
    { id: uuidv4(), userId: 'demo-user-1', reportId: 'demo-report-2', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), userId: 'demo-user-3', reportId: 'demo-report-2', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    
    // Votes for report 3
    { id: uuidv4(), userId: 'demo-user-1', reportId: 'demo-report-3', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: uuidv4(), userId: 'demo-user-2', reportId: 'demo-report-3', voteType: 'upvote', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  demoVotes.forEach(vote => dataStore.createVote(vote));

  // Create points transactions
  const demoTransactions: PointsTransaction[] = [
    // Anna's transactions
    { id: uuidv4(), userId: 'demo-user-1', amount: 3, reason: 'First reporter bonus + base report', relatedReportId: 'demo-report-1', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-1', amount: 5, reason: 'Report upvoted (5 upvotes)', relatedReportId: 'demo-report-1', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-1', amount: 2, reason: 'Report verified - bonus points', relatedReportId: 'demo-report-1', createdAt: new Date(Date.now() - 80 * 60 * 1000).toISOString() },
    
    // Piotr's transactions
    { id: uuidv4(), userId: 'demo-user-2', amount: 3, reason: 'First reporter bonus + base report', relatedReportId: 'demo-report-2', createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-2', amount: 2, reason: 'Report upvoted (2 upvotes)', relatedReportId: 'demo-report-2', createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString() },
    
    // Kasia's transactions
    { id: uuidv4(), userId: 'demo-user-3', amount: 3, reason: 'First reporter bonus + base report', relatedReportId: 'demo-report-3', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-3', amount: 8, reason: 'Report upvoted (8 upvotes)', relatedReportId: 'demo-report-3', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-3', amount: 2, reason: 'Report verified - bonus points', relatedReportId: 'demo-report-3', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: uuidv4(), userId: 'demo-user-3', amount: 0.5, reason: 'Helpful vote', createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  ];

  demoTransactions.forEach(tx => dataStore.createPointsTransaction(tx));

  console.log('✅ Demo data seeded successfully!');
  console.log(`   - ${demoUsers.length} demo users`);
  console.log(`   - ${demoReports.length} demo reports`);
  console.log(`   - ${demoVotes.length} demo votes`);
  console.log(`   - ${demoTransactions.length} points transactions`);
  console.log('\n📝 Demo Login Credentials:');
  console.log('   Email: anna@example.com | Password: demo123');
  console.log('   Email: piotr@example.com | Password: demo123');
  console.log('   Email: kasia@example.com | Password: demo123');
}
