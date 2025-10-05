/**
 * Report Panel - Slide-up panel for submitting delay reports
 * Matches the LiveDelaysPanel design
 */

'use client';

import { X } from 'lucide-react';
import ReportDelayForm from '@/components/forms/ReportDelayForm';
import { CreateReportInput } from '@/types';

interface ReportPanelProps {
  onSubmit: (data: CreateReportInput) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
}

export default function ReportPanel({ onSubmit, isSubmitting, onClose }: ReportPanelProps) {
  return (
    <div className="absolute bottom-20 left-0 right-0 z-[1001] animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-sm shadow-2xl mx-4 rounded-t-2xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-lg">Report Transit Delay</h3>
          <button 
            className="btn btn-ghost btn-sm btn-circle"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-4">
          <ReportDelayForm 
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
}
