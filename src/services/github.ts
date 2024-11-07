import { Octokit } from 'octokit';
import { Repository, WorkflowRun, Commit } from '../types';
import JSZip from 'jszip';

const octokit = new Octokit({
  auth: import.meta.env.VITE_GITHUB_TOKEN
});

export async function fetchUserRepositories(): Promise<Repository[]> {
  try {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100
    });

    return data.map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || undefined,
      owner: repo.owner.login,
      repo: repo.name,
      provider: 'github' as const
    }));
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}

export async function searchRepositories(query: string): Promise<Repository[]> {
  try {
    const { data } = await octokit.rest.search.repos({
      q: query,
      sort: 'updated',
      per_page: 50
    });

    return data.items.map(repo => ({
      id: repo.id.toString(),
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || undefined,
      owner: repo.owner.login,
      repo: repo.name,
      provider: 'github' as const
    }));
  } catch (error) {
    console.error('Error searching repositories:', error);
    return [];
  }
}

export async function fetchWorkflowRuns(owner: string, repo: string): Promise<WorkflowRun[]> {
  try {
    const { data } = await octokit.rest.actions.listWorkflowRunsForRepo({
      owner,
      repo,
      per_page: 100
    });

    return data.workflow_runs.map(run => ({
      id: run.id,
      name: run.name || run.display_title || 'Unnamed workflow',
      status: run.status,
      conclusion: run.conclusion || null,
      created_at: run.created_at,
      updated_at: run.updated_at,
      html_url: run.html_url,
      head_sha: run.head_sha,
      head_branch: run.head_branch,
      repository: {
        owner: { login: owner },
        name: repo
      }
    }));
  } catch (error) {
    console.error('Error fetching workflow runs:', error);
    return [];
  }
}

export async function fetchCommits(owner: string, repo: string): Promise<Commit[]> {
  try {
    const { data } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100
    });

    return data.map(item => ({
      sha: item.sha,
      commit: {
        author: {
          name: item.commit.author?.name || '',
          email: item.commit.author?.email || '',
          date: item.commit.author?.date || ''
        },
        message: item.commit.message
      },
      html_url: item.html_url,
      created_at: item.commit.author?.date || ''
    }));
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

export async function fetchWorkflowLogs(owner: string, repo: string, runId: number) {
  try {
    if (!owner || !repo || !runId) {
      console.warn('fetchWorkflowLogs: Missing required parameters', { owner, repo, runId });
      return {
        logs: [],
        error: 'Missing required parameters: owner, repo, or runId'
      };
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/logs`,
      {
        headers: {
          Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const zip = await JSZip.loadAsync(blob);
    
    const logFiles = Object.keys(zip.files);
    const logContents = await Promise.all(
      logFiles.map(async (filename) => {
        const file = zip.files[filename];
        const content = await file.async('string');
        return content;
      })
    );

    const cleanedLogs = logContents
      .join('\n')
      .split('\n')
      .map(line => line.replace(/\x1b\[[0-9;]*[mGKH]/g, '')) // Remove ANSI escape codes
      .filter(line => line.trim()); // Remove empty lines

    return {
      logs: cleanedLogs,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error fetching workflow logs:', error);
    return {
      logs: [],
      error: `Failed to fetch workflow logs: ${error.message}`
    };
  }
}