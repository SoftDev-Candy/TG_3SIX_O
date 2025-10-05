/**
 * Live Delays Panel - Shows all reports in real-time
 * Integrated voting and status indicators
 */

'use client';

import { useState } from 'react';
import { DelayReport, VoteStats } from '@/types';
import ReportCard from '../cards/ReportCard';
import { X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveDelaysPanelProps {
  reports: DelayReport[];
  onVote: (reportId: string, voteType: 'upvote' | 'downvote') => void;
  onClose: () => void;
  currentUserId?: string;
}

export default function LiveDelaysPanel({
  reports,
  onVote,
  onClose,
  currentUserId,
}: LiveDelaysPanelProps) {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredReports = reports.filter(report => {
    if (filterStatus === 'all') return true;
    return report.status === filterStatus;
  });

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    verified: reports.filter(r => r.status === 'verified').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="absolute bottom-20 left-0 right-0 z-[1001] animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl mx-4 rounded-t-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-lg">Live Delays</h3>
            <p className="text-sm text-gray-500">{stats.total} active reports</p>
          </div>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-100 shrink-0">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-xs text-gray-500">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.resolved}</div>
            <div className="text-xs text-gray-500">Resolved</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 py-2 border-b border-gray-100 overflow-x-auto shrink-0">
          {['all', 'pending', 'verified', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Reports List - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No {filterStatus !== 'all' ? filterStatus : ''} reports yet</p>
              <p className="text-sm mt-1">Be the first to report a delay!</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReportCard
                    report={report}
                    voteStats={{
                      upvotes: report.upvotes,
                      downvotes: report.downvotes,
                      netScore: report.upvotes - report.downvotes,
                      userVote: null, // TODO: Get from user votes
                    }}
                    onVote={(voteType) => onVote(report.id, voteType)}
                    compact
                    showVoting={true}
                    currentUserId={currentUserId}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
