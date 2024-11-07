import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import type { Pipeline } from '../types';

interface Props {
  pipeline: Pipeline;
}

const statusIcons = {
  running: <PlayCircle className="w-5 h-5 text-blue-500" />,
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  failed: <AlertCircle className="w-5 h-5 text-red-500" />,
  pending: <Clock className="w-5 h-5 text-yellow-500" />
};

const statusColors = {
  running: 'bg-blue-100 border-blue-200',
  success: 'bg-green-100 border-green-200',
  failed: 'bg-red-100 border-red-200',
  pending: 'bg-yellow-100 border-yellow-200'
};

export const PipelineCard: React.FC<Props> = ({ pipeline }) => {
  return (
    <div className={`rounded-lg p-4 border ${statusColors[pipeline.status]} transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusIcons[pipeline.status]}
          <h3 className="font-semibold text-gray-800">{pipeline.name}</h3>
        </div>
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(pipeline.startTime), { addSuffix: true })}
        </span>
      </div>
      
      {pipeline.status === 'failed' && pipeline.aiAnalysis && (
        <div className="mt-3 p-3 bg-white rounded-md border border-red-200">
          <h4 className="font-medium text-red-600 mb-1">AI Analysis</h4>
          <p className="text-sm text-gray-700">{pipeline.aiAnalysis}</p>
        </div>
      )}
      
      {pipeline.logs && pipeline.logs.length > 0 && (
        <div className="mt-3">
          <div className="max-h-32 overflow-y-auto font-mono text-xs bg-gray-800 text-gray-200 p-2 rounded">
            {pipeline.logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};