import { WorkflowRun } from '../types';
import { analyzeError } from './openai';

export interface PipelineAnalysis {
  healthScores: {
    security: number;
    performance: number;
    optimization: number;
  };
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
    effort: 'High' | 'Medium' | 'Low';
  }>;
  anomalies: Array<{
    id: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
  }>;
}

function calculateSecurityScore(workflow: WorkflowRun, logs: string): number {
  let score = 70; // Base score

  // Check for security scanning steps
  const hasSecurityScan = logs.toLowerCase().includes('security scan') || 
                         logs.toLowerCase().includes('vulnerability') ||
                         logs.toLowerCase().includes('sast');
  if (hasSecurityScan) score += 10;

  // Check for dependency scanning
  const hasDependencyScan = logs.toLowerCase().includes('dependency') || 
                           logs.toLowerCase().includes('npm audit') ||
                           logs.toLowerCase().includes('yarn audit');
  if (hasDependencyScan) score += 10;

  // Check for secrets scanning
  const hasSecretsScanning = logs.toLowerCase().includes('secrets') || 
                            logs.toLowerCase().includes('credential scan');
  if (hasSecretsScanning) score += 10;

  // Penalize for security warnings
  const securityWarnings = (logs.match(/security|vulnerability|exploit/gi) || []).length;
  score -= Math.min(20, securityWarnings * 2);

  // If workflow is successful, give a minimum baseline score
  if (workflow.conclusion === 'success') {
    score = Math.max(score, 75);
  }

  return Math.max(0, Math.min(100, score));
}

function calculatePerformanceScore(workflow: WorkflowRun, allWorkflows: WorkflowRun[]): number {
  // Calculate success rate
  const recentWorkflows = allWorkflows.slice(0, 10); // Look at last 10 runs
  const successRate = recentWorkflows.filter(w => w.conclusion === 'success').length / recentWorkflows.length;

  // Calculate build time trend
  const buildTimes = recentWorkflows.map(w => {
    const start = new Date(w.created_at).getTime();
    const end = new Date(w.updated_at).getTime();
    return end - start;
  });

  const avgBuildTime = buildTimes.reduce((a, b) => a + b, 0) / buildTimes.length;
  const optimalBuildTime = 5 * 60 * 1000; // 5 minutes as optimal
  const buildTimeScore = Math.max(0, 100 - (avgBuildTime / optimalBuildTime * 50));

  // If workflow is successful, give a minimum baseline score
  if (workflow.conclusion === 'success') {
    return Math.max(Math.round((successRate * 60) + (buildTimeScore * 0.4)), 80);
  }

  return Math.round((successRate * 60) + (buildTimeScore * 0.4));
}

function calculateOptimizationScore(workflow: WorkflowRun, logs: string): number {
  let score = 60; // Base score for successful workflows

  // Check for caching
  const hasCaching = logs.toLowerCase().includes('cache hit') || 
                    logs.toLowerCase().includes('restore cache');
  if (hasCaching) score += 15;

  // Check for parallel execution
  const hasParallelJobs = logs.toLowerCase().includes('parallel') || 
                         logs.toLowerCase().includes('matrix');
  if (hasParallelJobs) score += 15;

  // Check for build optimization
  const hasBuildOptimization = logs.toLowerCase().includes('optimization') || 
                              logs.toLowerCase().includes('minimize');
  if (hasBuildOptimization) score += 10;

  // If workflow is successful, give a minimum baseline score
  if (workflow.conclusion === 'success') {
    score = Math.max(score, 70);
  }

  return Math.max(0, Math.min(100, score));
}

export async function analyzePipeline(
  currentWorkflow: WorkflowRun,
  allWorkflows: WorkflowRun[],
  logs: string
): Promise<PipelineAnalysis> {
  // Get AI analysis of the logs
  const aiAnalysis = await analyzeError([logs]);
  
  // Calculate scores using AI-enhanced data
  const securityScore = calculateSecurityScore(currentWorkflow, logs);
  const performanceScore = calculatePerformanceScore(currentWorkflow, allWorkflows);
  const optimizationScore = calculateOptimizationScore(currentWorkflow, logs);

  const suggestions = [];
  const anomalies = [];

  // Generate AI-driven suggestions
  if (aiAnalysis.analysis) {
    const analysisText = aiAnalysis.analysis.toLowerCase();
    
    if (analysisText.includes('security') || securityScore < 70) {
      suggestions.push({
        id: 'sec-1',
        title: 'Enhance Security Measures',
        description: 'Add comprehensive security scanning and vulnerability checks to your pipeline.',
        impact: 'High',
        effort: 'Medium'
      });
    }

    if (analysisText.includes('performance') || performanceScore < 70) {
      suggestions.push({
        id: 'perf-1',
        title: 'Optimize Build Performance',
        description: 'Implement build caching and parallel job execution to improve pipeline speed.',
        impact: 'High',
        effort: 'Medium'
      });
    }

    if (analysisText.includes('optimization') || optimizationScore < 70) {
      suggestions.push({
        id: 'opt-1',
        title: 'Improve Pipeline Efficiency',
        description: 'Optimize test execution and implement smart caching strategies.',
        impact: 'Medium',
        effort: 'Medium'
      });
    }
  }

  // Detect anomalies
  const recentFailures = allWorkflows
    .slice(0, 5)
    .filter(w => w.conclusion === 'failure').length;

  if (recentFailures >= 3) {
    anomalies.push({
      id: 'anom-1',
      description: 'High failure rate detected in recent workflows',
      severity: 'High'
    });
  }

  if (performanceScore < 50) {
    anomalies.push({
      id: 'anom-2',
      description: 'Significant performance degradation detected',
      severity: 'Medium'
    });
  }

  return {
    healthScores: {
      security: securityScore,
      performance: performanceScore,
      optimization: optimizationScore
    },
    suggestions,
    anomalies
  };
}