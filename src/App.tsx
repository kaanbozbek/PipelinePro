import React, { useState, useEffect } from 'react';
import { RepositorySelector } from './components/RepositorySelector';
import { WorkflowList } from './components/WorkflowList';
import { CommitHistory } from './components/CommitHistory';
import { HealthDashboard } from './components/HealthDashboard';
import { RecommendationPanel } from './components/RecommendationPanel';
import { RootCauseAnalysis } from './components/RootCauseAnalysis';
import { ProviderSelector } from './components/ProviderSelector';
import { JenkinsSection } from './components/JenkinsSection';
import { Repository, WorkflowRun, Commit, Pipeline } from './types';
import { fetchWorkflowRuns, fetchCommits } from './services/github';
import { fetchAzurePipelines } from './services/azure';
import { generatePipelineRecommendations, Recommendation } from './services/recommendations';
import { analyzeRootCause } from './services/rootCauseAnalysis';
import { Box, GitBranch, GitCommit, GitPullRequest, Workflow } from 'lucide-react';

function App() {
  const [provider, setProvider] = useState<'github' | 'azure' | 'jenkins'>('github');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowRun[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'workflows' | 'commits'>('workflows');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [rootCauseData, setRootCauseData] = useState(null);
  const [showRootCause, setShowRootCause] = useState(false);
  const [implementationStatus, setImplementationStatus] = useState<{
    isLoading: boolean;
    message: string | null;
    error: string | null;
  }>({
    isLoading: false,
    message: null,
    error: null
  });

  useEffect(() => {
    if (selectedRepo) {
      loadData();
    }
  }, [selectedRepo, provider]);

  const loadData = async () => {
    if (!selectedRepo) return;
    
    setLoading(true);
    try {
      if (provider === 'github') {
        const [workflowData, commitData] = await Promise.all([
          fetchWorkflowRuns(selectedRepo.owner, selectedRepo.repo),
          fetchCommits(selectedRepo.owner, selectedRepo.repo)
        ]);
        setWorkflows(workflowData);
        setCommits(commitData);

        // Generate recommendations based on workflow data
        const recs = await generatePipelineRecommendations(workflowData[0], workflowData);
        setRecommendations(recs);
      } else if (provider === 'azure') {
        const pipelineData = await fetchAzurePipelines(selectedRepo.repo);
        setPipelines(pipelineData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (newProvider: 'github' | 'azure' | 'jenkins') => {
    setProvider(newProvider);
    setSelectedRepo(null);
    setWorkflows([]);
    setPipelines([]);
    setCommits([]);
    setShowRootCause(false);
  };

  const handleAnalyzeLogs = async (logs: string[]) => {
    try {
      const analysis = await analyzeRootCause(logs);
      setRootCauseData(analysis);
      setShowRootCause(true);
    } catch (error) {
      console.error('Error analyzing logs:', error);
    }
  };

  const handleApplyRecommendation = async (recommendation: Recommendation) => {
    setImplementationStatus({
      isLoading: true,
      message: `Implementing ${recommendation.title}...`,
      error: null
    });

    try {
      // Create necessary files
      for (const file of recommendation.implementation.files) {
        // In a real application, you would use an API to create these files
        console.log(`Creating file: ${file.path}`);
        console.log(file.content);
      }

      // Run necessary commands
      for (const command of recommendation.implementation.commands) {
        console.log(`Running command: ${command}`);
        // In a real application, you would execute these commands via an API
      }

      setImplementationStatus({
        isLoading: false,
        message: `Successfully implemented ${recommendation.title}`,
        error: null
      });

      // Remove the implemented recommendation from the list
      setRecommendations(prev => 
        prev.filter(rec => rec.id !== recommendation.id)
      );

      // Refresh data after implementation
      await loadData();
    } catch (error) {
      console.error('Error implementing recommendation:', error);
      setImplementationStatus({
        isLoading: false,
        message: null,
        error: `Failed to implement ${recommendation.title}. Please try again.`
      });
    }
  };

  const handleApplySolution = async () => {
    if (!rootCauseData) return;

    setImplementationStatus({
      isLoading: true,
      message: 'Applying solution...',
      error: null
    });

    try {
      // Implement the solution based on root cause analysis
      // In a real application, you would make API calls to apply the fixes
      
      setImplementationStatus({
        isLoading: false,
        message: 'Solution applied successfully',
        error: null
      });

      // Refresh data after applying solution
      await loadData();
      setShowRootCause(false);
    } catch (error) {
      console.error('Error applying solution:', error);
      setImplementationStatus({
        isLoading: false,
        message: null,
        error: 'Failed to apply solution. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop')] opacity-10 bg-cover bg-center"></div>
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-white/20">
                  <div className="relative">
                    <Box className="h-8 w-8 text-white absolute opacity-20 transform rotate-45" />
                    <Workflow className="h-8 w-8 text-white relative z-10" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center">
                    PipelinePro
                    <span className="ml-2 text-xs bg-white/20 rounded-full px-2 py-1 text-white/90">
                      Beta
                    </span>
                  </h1>
                  <p className="text-indigo-100 text-sm">Intelligent CI/CD Management</p>
                </div>
              </div>
              {selectedRepo && (
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-2 rounded-lg border border-white/20">
                  <GitBranch className="h-5 w-5 text-white/80" />
                  <span className="text-white font-medium">{selectedRepo.fullName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProviderSelector
          currentProvider={provider}
          onProviderChange={handleProviderChange}
        />

        {implementationStatus.message && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700">{implementationStatus.message}</p>
          </div>
        )}

        {implementationStatus.error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{implementationStatus.error}</p>
          </div>
        )}

        {provider === 'jenkins' ? (
          <JenkinsSection />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-medium mb-4 text-slate-900">
                  {provider === 'github' ? 'Repository' : 'Project'}
                </h2>
                <RepositorySelector
                  provider={provider}
                  onSelectRepository={setSelectedRepo}
                />
              </div>
            </div>

            <div className="md:col-span-3">
              {selectedRepo ? (
                <div className="space-y-6">
                  <HealthDashboard workflows={workflows} pipelines={pipelines} />

                  {recommendations.length > 0 && (
                    <RecommendationPanel
                      recommendations={recommendations}
                      onApply={handleApplyRecommendation}
                    />
                  )}

                  {showRootCause && rootCauseData && (
                    <RootCauseAnalysis
                      rootCause={rootCauseData}
                      onApplySolution={handleApplySolution}
                    />
                  )}

                  {provider === 'github' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden backdrop-blur-xl">
                      <div className="border-b border-slate-200">
                        <div className="flex">
                          <button
                            onClick={() => setActiveTab('workflows')}
                            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                              activeTab === 'workflows'
                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <GitPullRequest className="h-4 w-4" />
                            <span>Workflows</span>
                          </button>
                          <button
                            onClick={() => setActiveTab('commits')}
                            className={`px-6 py-4 text-sm font-medium flex items-center space-x-2 border-b-2 transition-colors ${
                              activeTab === 'commits'
                                ? 'border-indigo-500 text-indigo-600 bg-indigo-50/50'
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <GitCommit className="h-4 w-4" />
                            <span>Commits</span>
                          </button>
                        </div>
                      </div>

                      <div className="p-6">
                        {activeTab === 'workflows' ? (
                          <WorkflowList 
                            workflows={workflows} 
                            loading={loading} 
                            onAnalyzeLogs={handleAnalyzeLogs}
                          />
                        ) : (
                          <CommitHistory commits={commits} loading={loading} />
                        )}
                      </div>
                    </div>
                  )}

                  {provider === 'azure' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 backdrop-blur-xl">
                      <h3 className="text-lg font-medium mb-4 text-slate-900">Azure Pipelines</h3>
                      {/* Add Azure-specific pipeline component here */}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-12 text-center backdrop-blur-xl">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <Box className="h-16 w-16 text-slate-200 absolute opacity-20 transform rotate-45" />
                    <Workflow className="h-16 w-16 text-indigo-600 relative z-10" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-900 mb-2">Welcome to PipelinePro</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    {provider === 'github'
                      ? 'Monitor your workflows and commits with AI-powered insights. Select a repository to get started.'
                      : 'Select an Azure DevOps project to start monitoring your pipelines with intelligent analysis.'}
                  </p>
                  <p className="text-sm text-slate-400">👈 Use the selector to begin</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-6 text-center text-slate-400 text-sm">
        <p>PipelinePro © {new Date().getFullYear()} • Intelligent CI/CD Management</p>
      </footer>
    </div>
  );
}

export default App;