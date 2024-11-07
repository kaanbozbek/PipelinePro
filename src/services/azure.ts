import { WorkItem, Build, Repository, Pipeline, PipelineRun } from '../types';
import { analyzeError } from './openai';

const AZURE_PAT = import.meta.env.VITE_AZURE_PAT;
const ORGANIZATION = import.meta.env.VITE_AZURE_ORG;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Basic ${btoa(`:${AZURE_PAT}`)}`,
};

const baseUrl = `https://dev.azure.com/${ORGANIZATION}`;

export async function fetchAzureProjects(): Promise<Repository[]> {
  try {
    const response = await fetch(`${baseUrl}/_apis/projects?api-version=7.0`, { headers });
    const data = await response.json();
    
    return data.value.map((project: any) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      provider: 'azure'
    }));
  } catch (error) {
    console.error('Error fetching Azure projects:', error);
    return [];
  }
}

export async function fetchAzurePipelines(project: string): Promise<Pipeline[]> {
  try {
    const response = await fetch(
      `${baseUrl}/${project}/_apis/pipelines?api-version=7.0`,
      { headers }
    );
    const data = await response.json();
    
    return data.value.map((pipeline: any) => ({
      id: pipeline.id,
      name: pipeline.name,
      folder: pipeline.folder,
      revision: pipeline.revision,
      provider: 'azure'
    }));
  } catch (error) {
    console.error('Error fetching Azure pipelines:', error);
    return [];
  }
}

export async function fetchPipelineRuns(project: string, pipelineId: string): Promise<PipelineRun[]> {
  try {
    const response = await fetch(
      `${baseUrl}/${project}/_apis/pipelines/${pipelineId}/runs?api-version=7.0`,
      { headers }
    );
    const data = await response.json();
    
    return data.value.map((run: any) => ({
      id: run.id,
      name: run.name,
      state: run.state,
      result: run.result,
      createdDate: run.createdDate,
      finishedDate: run.finishedDate,
      url: run.url,
      provider: 'azure'
    }));
  } catch (error) {
    console.error('Error fetching pipeline runs:', error);
    return [];
  }
}

export async function analyzePipelineRun(project: string, runId: number): Promise<string> {
  try {
    const response = await fetch(
      `${baseUrl}/${project}/_apis/build/builds/${runId}/logs?api-version=7.0`,
      { headers }
    );
    const logs = await response.text();
    return await analyzeError([logs]);
  } catch (error) {
    console.error('Error analyzing pipeline run:', error);
    return 'Failed to analyze pipeline run';
  }
}