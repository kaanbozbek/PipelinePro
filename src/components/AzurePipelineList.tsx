import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Play, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { PipelineRun } from '../types';
import { analyzeError } from '../services/openai';

interface Props {
  pipelineRuns: PipelineRun[];
  onAnalyzeLog: (runId: number) => Promise<void>;
}

export function AzurePipelineList({ pipelineRuns, onAnalyzeLog }: Props) {
  const [expandedRun, setExpandedRun] = useState<number | null>(null);

  const getStatusIcon = (state: string, result: string) => {
    if (state === 'inProgress') return <Play className="h-5 w-5 text-blue-500" />;
    if (result === 'succeeded') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (result === 'failed') return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusColor = (state: string, result: string) => {
    if (state === 'inProgress') return 'border-blue-200 bg-blue-50';
    if (result === 'succeeded') return 'border-green-200 bg-green-50';
    if (result === 'failed') return 'border-red-200 bg-red-50';
    return 'border-yellow-200 bg-yellow-50';
  };

  return (
    <div className="space-y-4">
      {pipelineRuns.map((run) => (
        <div
          key={run.id}
          className={`border rounded-lg ${getStatusColor(run.state, run.result)}`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(run.state, run.result)}
                <div>
                  <h3 className="font-medium text-gray-900">{run.name}</h3>
                  <p className="text-sm text-gray-500">
                    Started {formatDistanceToNow(new Date(run.createdDate), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {run.result === 'failed' && (
                  <button
                    onClick={() => onAnalyzeLog(run.id)}
                    className="px-3 py-1 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Analyze Log
                  </button>
                )}
                <button
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  {expandedRun === run.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {expandedRun === run.id && (
              <div className="mt-4 border-t pt-4">
                {run.aiAnalysis && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-800 mb-2">AI Analysis</h4>
                    <p className="text-sm text-blue-900">{run.aiAnalysis}</p>
                  </div>
                )}
                {run.logs && (
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                      {run.logs}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {pipelineRuns.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No pipeline runs found.
        </div>
      )}
    </div>
  );
}