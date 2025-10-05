/**
 * Report routes
 */

import { FastifyPluginAsync } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { dataStore } from '../storage/data-store';
import { requireAuth, getUserFromRequest } from '../utils/auth';
import { pointsService } from '../services/points-service';
import { verificationService } from '../services/verification-service';
import type { DelayReport, CreateReportInput, VoteStats, Vote, ReportFlag } from '../types';

export const reportRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Create delay report
  fastify.post<{ Body: CreateReportInput }>('/api/reports', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const input = request.body;

      // Determine if this is the first reporter for this incident
      // For hackathon: Simple logic - check if similar report exists in last hour
      const recentReports = dataStore.getReports({
        transportType: input.transportType,
      }).filter(r => {
        const age = Date.now() - new Date(r.createdAt).getTime();
        return age < 60 * 60 * 1000; // 1 hour
      });

      const reporterOrder = recentReports.length + 1;
      const isFirstReporter = reporterOrder === 1;

      // Create report
      const report: DelayReport = {
        id: uuidv4(),
        userId: authUser.userId,
        ...input,
        photos: [], // Handle photo upload separately if needed
        status: 'pending',
        upvotes: 0,
        downvotes: 0,
        reporterOrder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dataStore.createReport(report);

      // Award points
      await pointsService.awardReportPoints(report.id, authUser.userId, isFirstReporter);

      // Mock API verification (optional, async)
      setTimeout(() => {
        verificationService.mockApiVerification(report.id).catch(console.error);
      }, 3000);

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create report',
      };
    }
  });

  // Get all reports with filters
  fastify.get('/api/reports', async (request, reply) => {
    try {
      const { transportType, severity, status, page = '1', limit = '20' } = request.query as any;

      const reports = dataStore.getReports({
        transportType,
        severity,
        status,
      });

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const startIndex = (pageNum - 1) * limitNum;
      const items = reports.slice(startIndex, startIndex + limitNum);

      return {
        success: true,
        data: {
          items,
          total: reports.length,
          page: pageNum,
          limit: limitNum,
          hasMore: startIndex + limitNum < reports.length,
        },
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch reports',
      };
    }
  });

  // Get single report
  fastify.get<{ Params: { id: string } }>('/api/reports/:id', async (request, reply) => {
    try {
      const report = dataStore.getReportById(request.params.id);

      if (!report) {
        reply.status(404);
        return { success: false, error: 'Report not found' };
      }

      return {
        success: true,
        data: report,
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch report',
      };
    }
  });

  // Vote on report
  fastify.patch<{ 
    Params: { id: string };
    Body: { voteType: 'upvote' | 'downvote' };
  }>('/api/reports/:id/vote', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const { id: reportId } = request.params;
      const { voteType } = request.body;

      const report = dataStore.getReportById(reportId);
      if (!report) {
        reply.status(404);
        return { success: false, error: 'Report not found' };
      }

      // Users cannot vote on own reports
      if (report.userId === authUser.userId) {
        reply.status(403);
        return { success: false, error: 'Cannot vote on your own report' };
      }

      // Check existing vote
      const existingVote = dataStore.getVote(authUser.userId, reportId);

      if (existingVote) {
        // Toggle vote logic
        if (existingVote.voteType === voteType) {
          // Remove vote
          dataStore.deleteVote(authUser.userId, reportId);
          
          // Update report counts
          const updates: Partial<DelayReport> = 
            voteType === 'upvote'
              ? { upvotes: report.upvotes - 1 }
              : { downvotes: report.downvotes - 1 };
          
          dataStore.updateReport(reportId, updates);
        } else {
          // Change vote
          dataStore.updateVote(authUser.userId, reportId, voteType);
          
          // Update report counts
          const updates: Partial<DelayReport> = 
            voteType === 'upvote'
              ? { upvotes: report.upvotes + 1, downvotes: report.downvotes - 1 }
              : { upvotes: report.upvotes - 1, downvotes: report.downvotes + 1 };
          
          dataStore.updateReport(reportId, updates);
          
          // Award points for upvote
          if (voteType === 'upvote') {
            await pointsService.updatePointsFromVote(reportId, voteType);
          }
        }
      } else {
        // Create new vote
        const vote: Vote = {
          id: uuidv4(),
          userId: authUser.userId,
          reportId,
          voteType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        dataStore.createVote(vote);

        // Update report counts
        const updates: Partial<DelayReport> = 
          voteType === 'upvote'
            ? { upvotes: report.upvotes + 1 }
            : { downvotes: report.downvotes + 1 };
        
        dataStore.updateReport(reportId, updates);

        // Award points for upvote
        if (voteType === 'upvote') {
          await pointsService.updatePointsFromVote(reportId, voteType);
        }
      }

      // Check for auto-verification
      await verificationService.checkAutoVerification(reportId);

      // Get updated report and vote stats
      const updatedReport = dataStore.getReportById(reportId);
      const userVote = dataStore.getVote(authUser.userId, reportId);

      const voteStats: VoteStats = {
        upvotes: updatedReport?.upvotes || 0,
        downvotes: updatedReport?.downvotes || 0,
        netScore: (updatedReport?.upvotes || 0) - (updatedReport?.downvotes || 0),
        userVote: userVote?.voteType || null,
      };

      return {
        success: true,
        data: {
          report: updatedReport,
          voteStats,
        },
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to vote',
      };
    }
  });

  // Get vote stats for report
  fastify.get<{ Params: { id: string } }>('/api/reports/:id/votes', async (request, reply) => {
    try {
      const { id: reportId } = request.params;
      const report = dataStore.getReportById(reportId);

      if (!report) {
        reply.status(404);
        return { success: false, error: 'Report not found' };
      }

      const authUser = getUserFromRequest(request);
      const userVote = authUser ? dataStore.getVote(authUser.userId, reportId) : null;

      const voteStats: VoteStats = {
        upvotes: report.upvotes,
        downvotes: report.downvotes,
        netScore: report.upvotes - report.downvotes,
        userVote: userVote?.voteType || null,
      };

      return {
        success: true,
        data: voteStats,
      };
    } catch (error) {
      reply.status(500);
      return {
        success: false,
        error: 'Failed to fetch vote stats',
      };
    }
  });

  // Flag report
  fastify.post<{
    Params: { id: string };
    Body: { reason: 'spam' | 'inappropriate' | 'duplicate' | 'inaccurate'; description?: string };
  }>('/api/reports/:id/flag', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const { id: reportId } = request.params;
      const { reason, description } = request.body;

      const report = dataStore.getReportById(reportId);
      if (!report) {
        reply.status(404);
        return { success: false, error: 'Report not found' };
      }

      // Check if user already flagged
      if (dataStore.hasUserFlagged(authUser.userId, reportId)) {
        reply.status(400);
        return { success: false, error: 'You have already flagged this report' };
      }

      // Create flag
      const flag: ReportFlag = {
        id: uuidv4(),
        reportId,
        userId: authUser.userId,
        reason,
        description,
        createdAt: new Date().toISOString(),
      };

      dataStore.createFlag(flag);

      // Check if should auto-reject
      await verificationService.checkFlagThreshold(reportId);

      return {
        success: true,
        data: flag,
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to flag report',
      };
    }
  });

  // Delete report (user's own report only)
  fastify.delete<{ Params: { id: string } }>('/api/reports/:id', async (request, reply) => {
    try {
      const authUser = requireAuth(request);
      const report = dataStore.getReportById(request.params.id);

      if (!report) {
        reply.status(404);
        return { success: false, error: 'Report not found' };
      }

      if (report.userId !== authUser.userId) {
        reply.status(403);
        return { success: false, error: 'Cannot delete another user\'s report' };
      }

      dataStore.deleteReport(request.params.id);

      return {
        success: true,
        data: { message: 'Report deleted successfully' },
      };
    } catch (error) {
      reply.status(error instanceof Error && error.message === 'Unauthorized' ? 401 : 500);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete report',
      };
    }
  });
};
