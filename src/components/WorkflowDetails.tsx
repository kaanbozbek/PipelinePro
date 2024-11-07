import React, { useState, useEffect } from 'react';
import { fetchWorkflowLogs } from '../services/github';
import type { WorkflowRun } from '../types';
import { Loader2, AlertCircle, Terminal, Search } from 'lucide-react';

interface Props {
  workflow: WorkflowRun;
  owner: string;
  repo: string;
  onAnalyzeLogs: (logs: string[]) => void;
}

export const WorkflowDetails: React.FC<Props> = ({ workflow, owner, repo, onAnalyzeLogs }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      setError(undefined);
      try {
        const result = await fetchWorkflowLogs(owner, repo, workflow.id);
        setLogs(result.logs);
        setError(result.error);
      } catch (err) {
        setError('Failed to load workflow logs');
        console.error('Error loading workflow logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, [workflow.id, owner, repo]);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700 flex items-center">
          <Terminal className="h-4 w-4 mr-2" />
          Workflow Logs
        </h4>
        {logs.length > 0 && (
          <button
            onClick={() => onAnalyzeLogs(logs)}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Search className="h-4 w-4 mr-1" />
            Analyze Logs
          </button>
        )}
      </div>
      
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-400">Loading logs...</span>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-yellow-400 p-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : logs.length > 0 ? (
          <div className="p-4 max-h-96 overflow-auto">
            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
              {logs.join('\n')}
            </pre>
          </div>
        ) : (
          <div className="text-gray-400 text-center py-6 text-sm">
            No logs available for this workflow
          </div>
        )}
      </div>
    </div>
  );
};