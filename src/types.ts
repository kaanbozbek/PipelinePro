export type DevOpsProvider = {
  name: 'github' | 'azure';
  label: string;
  icon: string;
};

export type Repository = {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  provider: 'github' | 'azure';
  repo: string;
};

export type PipelineRun = {
  id: number;
  name: string;
  state: string;
  result: string;
  createdDate: string;
  finishedDate?: string;
  url: string;
  logs?: string;
  aiAnalysis?: string;
  provider: 'github' | 'azure';
};

export type Pipeline = {
  id: string;
  name: string;
  folder?: string;
  revision?: number;
  url?: string;
};