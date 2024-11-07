// Common types
export interface Repository {
  id?: string;
  name?: string;
  fullName?: string;
  owner?: string;
  repo?: string;
  description?: string;
  provider: 'github' | 'azure' | 'jenkins';
}

// GitHub specific types
export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  created_at: string;
}

export interface WorkflowRun {
  id: number;
  name?: string;
  status: string;
  conclusion?: string;
  created_at: string;
  updated_at: string;
  html_url?: string;
  head_sha: string;
  head_branch?: string;
  aiAnalysis?: string;
  repository?: {
    owner: {
      login: string;
    };
    name: string;
  };
}

// Azure DevOps specific types
export interface WorkItem {
  id: number;
  title: string;
  state: string;
  type: string;
  assignedTo?: string;
  provider: 'azure';
}

export interface Build {
  id: number;
  number: string;
  status: string;
  result: string;
  startTime: string;
  finishTime: string;
  provider: 'azure';
}

export interface Pipeline {
  id: string;
  name: string;
  folder: string;
  revision: number;
  provider: 'azure' | 'jenkins';
}

export interface PipelineRun {
  id: number;
  name: string;
  state: string;
  result: string;
  createdDate: string;
  finishedDate: string;
  url: string;
  provider: 'azure' | 'jenkins';
}

export interface DevOpsProvider {
  name: 'github' | 'azure' | 'jenkins';
  label: string;
  icon: string;
}

// Jenkins specific types
export * from './jenkins';