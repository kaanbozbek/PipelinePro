export interface JenkinsJob {
  id: string;
  name: string;
  url: string;
  status: string;
  lastBuild: JenkinsBuild | null;
  provider: 'jenkins';
}

export interface JenkinsBuild {
  id: number;
  number: number;
  result: string;
  timestamp: number;
  duration: number;
  url: string;
  building: boolean;
  provider: 'jenkins';
}

export interface JenkinsCredentials {
  url: string;
  user: string;
  token: string;
}