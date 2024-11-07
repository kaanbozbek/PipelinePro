import { useState, useEffect } from 'react';
import { Pipeline, Metric } from '../types';
import { fetchWorkflowRuns } from '../services/github';
import { analyzeError } from '../services/openai';

const POLL_INTERVAL = 30000; // 30 seconds

export function useGitHubData(owner: string, repo: string) {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);

  useEffect(() => {
    let mounted = true;
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const runs = await fetchWorkflowRuns(owner, repo);
        
        // For failed pipelines, get AI analysis
        const runsWithAnalysis = await Promise.all(
          runs.map(async (run) => {
            if (run.status === 'failed' && run.logs && run.logs.length > 0) {
              const analysis = await analyzeError(run.logs);
              return { ...run, aiAnalysis: analysis };
            }
            return run;
          })
        );

        if (mounted) {
          setPipelines(runsWithAnalysis);
          
          // Calculate metrics
          const successRate = runs.filter(r => r.status === 'success').length / runs.length * 100;
          const avgDuration = runs
            .filter(r => r.endTime)
            .reduce((acc, run) => {
              const duration = new Date(run.endTime!).getTime() - new Date(run.startTime).getTime();
              return acc + duration;
            }, 0) / runs.length;

          setMetrics([
            {
              id: '1',
              name: 'Success Rate',
              value: Math.round(successRate),
              unit: '%',
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Active Workflows',
              value: runs.filter(r => r.status === 'running').length,
              unit: '',
              timestamp: new Date().toISOString()
            },
            {
              id: '3',
              name: 'Avg Duration',
              value: Math.round(avgDuration / 1000 / 60),
              unit: 'min',
              timestamp: new Date().toISOString()
            },
            {
              id: '4',
              name: 'Total Runs',
              value: runs.length,
              unit: '',
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to fetch GitHub data');
          console.error('Error fetching GitHub data:', err);
        }
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [owner, repo]);

  return { pipelines, metrics, error };
}