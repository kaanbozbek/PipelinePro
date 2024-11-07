interface Config {
  githubToken: string;
  openaiApiKey: string;
  azurePat: string;
  azureOrg: string;
  jenkinsUrl: string;
  jenkinsUser: string;
  jenkinsToken: string;
}

export const config: Config = {
  githubToken: import.meta.env.VITE_GITHUB_TOKEN || '',
  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  azurePat: import.meta.env.VITE_AZURE_PAT || '',
  azureOrg: import.meta.env.VITE_AZURE_ORG || '',
  jenkinsUrl: import.meta.env.VITE_JENKINS_URL || '',
  jenkinsUser: import.meta.env.VITE_JENKINS_USER || '',
  jenkinsToken: import.meta.env.VITE_JENKINS_TOKEN || ''
};