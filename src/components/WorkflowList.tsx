import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { GitBranch, Clock, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { WorkflowRun } from '../types';
import { WorkflowDetails } from './WorkflowDetails';
import { LogAnalysisModal } from './LogAnalysisModal';
import { PipelineAnalytics } from './PipelineAnalytics';
import { analyzePipeline } from '../services/pipelineAnalysis';
import { generatePipelineRecommendations } from '../services/recommendations';

interface Props {
  workflows: WorkflowRun[];
  loading: boolean;
  onAnalyzeLogs: (logs: string[]) => void;
}

export function WorkflowList({ workflows, loading, onAnalyzeLogs }: Props) {
  const [expandedWorkflow, setExpandedWorkflow] = useState<number | null>(null);
  const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<{
    analysis: string | null;
    error: string | null;
    roadmap: string[] | null;
  }>({ analysis: null, error: null, roadmap: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineAnalysis, setPipelineAnalysis] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const generateAnalysis = async () => {
      if (workflows.length > 0) {
        try {
          const [analysis, recs] = await Promise.all([
            analyzePipeline(workflows[0], workflows, ''),
            generatePipelineRecommendations(workflows[0], workflows)
          ]);
          setPipelineAnalysis(analysis);
          setRecommendations(recs);
        } catch (error) {
          console.error('Error generating analysis:', error);
        }
      } else {
        setPipelineAnalysis(null);
        setRecommendations([]);
      }
    };

    generateAnalysis();
  }, [workflows]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') return <Clock className="h-5 w-5 text-yellow-500" />;
    if (conclusion === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (conclusion === 'failure') return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-gray-500" />;
  };

  const getStatusColor = (status: string, conclusion: string | null) => {
    if (status === 'in_progress') return 'border-yellow-200 bg-yellow-50';
    if (conclusion === 'success') return 'border-green-200 bg-green-50';
    if (conclusion === 'failure') return 'border-red-200 bg-red-50';
    return 'border-gray-200 bg-gray-50';
  };

  return (
    <>
      <PipelineAnalytics 
        analysis={pipelineAnalysis} 
        hasWorkflows={workflows.length > 0}
      />

      <div className="mt-6 space-y-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`border rounded-lg transition-shadow ${getStatusColor(workflow.status, workflow.conclusion)}`}
          >
            <button
              onClick={() => setExpandedWorkflow(expandedWorkflow === workflow.id ? null : workflow.id)}
              className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(workflow.status, workflow.conclusion)}
                  <div>
                    <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <div className="flex items-center space-x-1">
                        <GitBranch className="h-4 w-4" />
                        <span>{workflow.head_branch}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDistanceToNow(new Date(workflow.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a
                    href={workflow.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 p-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </a>
                  {expandedWorkflow === workflow.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {expandedWorkflow === workflow.id && (
              <div className="border-t px-4 py-3">
                <WorkflowDetails
                  workflow={workflow}
                  owner={workflow.repository?.owner.login || ''}
                  repo={workflow.repository?.name || ''}
                  onAnalyzeLogs={onAnalyzeLogs}
                />
              </div>
            )}
          </div>
        ))}

        {workflows.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No workflows found for this repository.
          </div>
        )}
      </div>

      <LogAnalysisModal
        isOpen={analysisModalOpen}
        onClose={() => setAnalysisModalOpen(false)}
        analysis={currentAnalysis.analysis}
        error={currentAnalysis.error}
        roadmap={currentAnalysis.roadmap}
        isLoading={isAnalyzing}
      />
    </>
  );
}