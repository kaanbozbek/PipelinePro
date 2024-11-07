import { config } from '../config';
import { JenkinsJob, JenkinsBuild, JenkinsCredentials } from '../types';

const headers = {
  'Authorization': `Basic ${btoa(`${config.jenkinsUser}:${config.jenkinsToken}`)}`,
  'Content-Type': 'application/json',
};

export async function fetchJenkinsJobs(): Promise<JenkinsJob[]> {
  try {
    if (!config.jenkinsUrl || !config.jenkinsToken) {
      return [];
    }

    const response = await fetch(`${config.jenkinsUrl}/api/json?tree=jobs[name,url,color,lastBuild[number,result,timestamp,duration]]`, {
      headers
    });
    const data = await response.json();

    return data.jobs.map((job: any) => ({
      id: job.name,
      name: job.name,
      url: job.url,
      status: parseJobStatus(job.color),
      lastBuild: job.lastBuild ? {
        number: job.lastBuild.number,
        result: job.lastBuild.result?.toLowerCase() || 'unknown',
        timestamp: job.lastBuild.timestamp,
        duration: job.lastBuild.duration
      } : null,
      provider: 'jenkins'
    }));
  } catch (error) {
    console.error('Error fetching Jenkins jobs:', error);
    return [];
  }
}

export async function fetchJobBuilds(jobName: string): Promise<JenkinsBuild[]> {
  try {
    if (!config.jenkinsUrl || !config.jenkinsToken) {
      return [];
    }

    const response = await fetch(`${config.jenkinsUrl}/job/${jobName}/api/json?tree=builds[number,result,timestamp,duration,url,building]`, {
      headers
    });
    const data = await response.json();

    return data.builds.map((build: any) => ({
      id: build.number,
      number: build.number,
      result: build.result?.toLowerCase() || 'unknown',
      timestamp: build.timestamp,
      duration: build.duration,
      url: build.url,
      building: build.building,
      provider: 'jenkins'
    }));
  } catch (error) {
    console.error('Error fetching job builds:', error);
    return [];
  }
}

export async function fetchBuildLogs(jobName: string, buildNumber: number): Promise<string> {
  try {
    if (!config.jenkinsUrl || !config.jenkinsToken) {
      return '';
    }

    const response = await fetch(`${config.jenkinsUrl}/job/${jobName}/${buildNumber}/consoleText`, {
      headers
    });
    return await response.text();
  } catch (error) {
    console.error('Error fetching build logs:', error);
    return '';
  }
}

export async function triggerBuild(jobName: string): Promise<boolean> {
  try {
    if (!config.jenkinsUrl || !config.jenkinsToken) {
      return false;
    }

    const response = await fetch(`${config.jenkinsUrl}/job/${jobName}/build`, {
      method: 'POST',
      headers
    });
    return response.ok;
  } catch (error) {
    console.error('Error triggering build:', error);
    return false;
  }
}

function parseJobStatus(color: string): string {
  switch (color) {
    case 'blue':
      return 'success';
    case 'red':
      return 'failed';
    case 'yellow':
      return 'unstable';
    case 'grey':
    case 'disabled':
      return 'disabled';
    case 'anime':
      return 'building';
    default:
      return 'unknown';
  }
}