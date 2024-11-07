import React, { useState, useEffect } from 'react';
import { Play, Settings, AlertCircle, CheckCircle2, Clock, Activity } from 'lucide-react';
import { JenkinsJob, JenkinsBuild } from '../types/jenkins';
import { fetchJenkinsJobs, fetchJobBuilds, triggerBuild } from '../services/jenkins';
import { config } from '../config';
import { formatDistanceToNow } from 'date-fns';

export function JenkinsSection() {
  const [jobs, setJobs] = useState<JenkinsJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [builds, setBuilds] = useState<JenkinsBuild[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedJob) {
      loadBuilds(selectedJob);
    }
  }, [selectedJob]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!config.jenkinsUrl || !config.jenkinsToken) {
        setError('Jenkins credentials not configured. Please check your environment variables.');
        return;
      }
      const fetchedJobs = await fetchJenkinsJobs();
      setJobs(fetchedJobs);
    } catch (err) {
      setError('Failed to load Jenkins jobs');
    } finally {
      setLoading(false);
    }
  };

  const loadBuilds = async (jobName: string) => {
    try {
      const jobBuilds = await fetchJobBuilds(jobName);
      setBuilds(jobBuilds);
    } catch (err) {
      console.error('Error loading builds:', err);
    }
  };

  const handleTriggerBuild = async (jobName: string) => {
    try {
      const success = await triggerBuild(jobName);
      if (success) {
        setTimeout(() => loadBuilds(jobName), 1000);
      }
    } catch (err) {
      console.error('Error triggering build:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'building':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'building':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!config.jenkinsUrl) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-center gap-2 text-yellow-700">
          <Settings className="h-5 w-5" />
          <p>Jenkins integration not configured. Please set up Jenkins credentials in your environment variables.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Jenkins Pipelines</h2>
        <button
          onClick={() => loadJobs()}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-lg border p-4 ${getStatusColor(job.status)}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(job.status)}
                  <h3 className="font-medium text-gray-900">{job.name}</h3>
                </div>
                <button
                  onClick={() => handleTriggerBuild(job.name)}
                  className="p-2 text-blue-600 hover:text-blue-500 rounded-full hover:bg-blue-50"
                >
                  <Play className="h-5 w-5" />
                </button>
              </div>

              {job.lastBuild && (
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex justify-between">
                    <span>Last Build</span>
                    <span>#{job.lastBuild.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="capitalize">{job.lastBuild.result}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span>{Math.round(job.lastBuild.duration / 1000)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span>
                      {formatDistanceToNow(job.lastBuild.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedJob(job.name)}
                className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500 border border-blue-200 rounded-md hover:bg-blue-50"
              >
                View Build History
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedJob && builds.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Build History - {selectedJob}</h3>
          <div className="bg-white rounded-lg border border-gray-200 divide-y">
            {builds.map((build) => (
              <div key={build.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(build.building ? 'building' : build.result)}
                    <div>
                      <h4 className="font-medium text-gray-900">Build #{build.number}</h4>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(build.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {Math.round(build.duration / 1000)}s
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}