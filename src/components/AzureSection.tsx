import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Repository, Pipeline, PipelineRun } from '../types';
import { AzurePipelineList } from './AzurePipelineList';
import { 
  fetchAzureProjects, 
  fetchAzureRepositories, 
  fetchAzurePipelines,
  fetchPipelineRuns,
  analyzePipelineRun 
} from '../services/azure';

export function AzureSection() {
  const [projects, setProjects] = useState<Repository[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineRuns, setPipelineRuns] = useState<PipelineRun[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [selectedPipeline, setSelectedPipeline] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState({
    projects: false,
    repos: false,
    pipelines: false,
    runs: false
  });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadRepositories(selectedProject);
      loadPipelines(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (selectedProject && selectedPipeline) {
      loadPipelineRuns(selectedProject, selectedPipeline);
    }
  }, [selectedProject, selectedPipeline]);

  const loadProjects = async () => {
    setLoading(prev => ({ ...prev, projects: true }));
    try {
      const fetchedProjects = await fetchAzureProjects();
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
    setLoading(prev => ({ ...prev, projects: false }));
  };

  const loadRepositories = async (projectId: string) => {
    setLoading(prev => ({ ...prev, repos: true }));
    try {
      const fetchedRepos = await fetchAzureRepositories(projectId);
      setRepositories(fetchedRepos);
    } catch (error) {
      console.error('Error loading repositories:', error);
    }
    setLoading(prev => ({ ...prev, repos: false }));
  };

  const loadPipelines = async (projectId: string) => {
    setLoading(prev => ({ ...prev, pipelines: true }));
    try {
      const fetchedPipelines = await fetchAzurePipelines(projectId);
      setPipelines(fetchedPipelines);
    } catch (error) {
      console.error('Error loading pipelines:', error);
    }
    setLoading(prev => ({ ...prev, pipelines: false }));
  };

  const loadPipelineRuns = async (projectId: string, pipelineId: string) => {
    setLoading(prev => ({ ...prev, runs: true }));
    try {
      const runs = await fetchPipelineRuns(projectId, pipelineId);
      setPipelineRuns(runs);
    } catch (error) {
      console.error('Error loading pipeline runs:', error);
    }
    setLoading(prev => ({ ...prev, runs: false }));
  };

  const handleAnalyzeLog = async (runId: number) => {
    if (!selectedProject) return;
    const analysis = await analyzePipelineRun(selectedProject, runId);
    setPipelineRuns(prev => 
      prev.map(run => 
        run.id === runId ? { ...run, aiAnalysis: analysis } : run
      )
    );
  };

  const filteredRepos = repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Azure DevOps Dashboard</h2>
          <p className="text-sm text-gray-500">Monitor your Azure DevOps pipelines and repositories</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search repositories..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium text-gray-900 mb-4">Projects</h3>
            {loading.projects ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => setSelectedProject(project.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedProject === project.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {project.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProject && (
            <div className="mt-4 bg-white rounded-lg shadow p-4">
              <h3 className="font-medium text-gray-900 mb-4">Repositories</h3>
              {loading.repos ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredRepos.map((repo) => (
                    <button
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo.id)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedRepo === repo.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {repo.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="col-span-9">
          {selectedProject && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-medium text-gray-900 mb-4">Pipelines</h3>
                {loading.pipelines ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pipelines.map((pipeline) => (
                      <button
                        key={pipeline.id}
                        onClick={() => setSelectedPipeline(pipeline.id)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedPipeline === pipeline.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pipeline.name}
                      </button>
                    ))}
                    {pipelines.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No pipelines found</p>
                    )}
                  </div>
                )}
              </div>

              {selectedPipeline && (
                <div className="bg-white rounded-lg shadow p-4">
                  <h3 className="font-medium text-gray-900 mb-4">Pipeline Runs</h3>
                  {loading.runs ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <AzurePipelineList
                      pipelineRuns={pipelineRuns}
                      onAnalyzeLog={handleAnalyzeLog}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}