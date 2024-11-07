# PipelinePro - Intelligent CI/CD Management

A comprehensive DevOps dashboard that integrates with GitHub, Azure DevOps, and Jenkins, providing real-time monitoring of workflows, pipelines, and deployments with AI-powered analysis of failures.

## Features

- 🔄 Real-time pipeline monitoring
- 🤖 AI-powered failure analysis
- 📊 Pipeline health metrics
- 🔍 Intelligent recommendations
- 🛡️ Security scanning integration
- 🔄 Multi-provider support (GitHub, Azure DevOps, Jenkins)

## Environment Variables

The application requires several environment variables to function properly. Create a `.env` file in the root directory with the following variables:

```env
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GITHUB_TOKEN=your_github_token
VITE_AZURE_PAT=your_azure_devops_pat
VITE_AZURE_ORG=your_azure_organization
VITE_JENKINS_URL=your_jenkins_url
VITE_JENKINS_USER=your_jenkins_username
VITE_JENKINS_TOKEN=your_jenkins_token
```

## Quick Start

### Using Docker

1. Build the image:
```bash
docker build -t pipelinepro .
```

2. Run with environment variables:
```bash
docker run -d -p 80:80 \
  -e VITE_OPENAI_API_KEY=your_openai_api_key \
  -e VITE_GITHUB_TOKEN=your_github_token \
  -e VITE_AZURE_PAT=your_azure_devops_pat \
  -e VITE_AZURE_ORG=your_azure_organization \
  -e VITE_JENKINS_URL=your_jenkins_url \
  -e VITE_JENKINS_USER=your_jenkins_username \
  -e VITE_JENKINS_TOKEN=your_jenkins_token \
  pipelinepro
```

### Using Docker Compose

1. Create a `.env` file with your environment variables
2. Run:
```bash
docker-compose up -d
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

## Environment Variable Details

- `VITE_OPENAI_API_KEY`: OpenAI API key for AI-powered analysis
  - Get it from: https://platform.openai.com/api-keys
  - Required for: AI analysis features

- `VITE_GITHUB_TOKEN`: GitHub Personal Access Token
  - Get it from: https://github.com/settings/tokens
  - Required scopes: `repo`, `workflow`
  - Required for: GitHub integration

- `VITE_AZURE_PAT`: Azure DevOps Personal Access Token
  - Get it from: https://dev.azure.com/[organization]/_usersSettings/tokens
  - Required scopes: `Build`, `Code`, `Release`
  - Required for: Azure DevOps integration

- `VITE_JENKINS_TOKEN`: Jenkins API Token
  - Get it from: Jenkins Dashboard > People > [Your User] > Configure > API Token
  - Required for: Jenkins integration

## Security Notes

- Store sensitive environment variables securely
- Use appropriate token permissions (principle of least privilege)
- Regularly rotate access tokens
- Never commit `.env` file to version control
- Consider using a secrets management service in production

## License

MIT