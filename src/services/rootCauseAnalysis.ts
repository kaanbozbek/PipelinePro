import { analyzeError } from './openai';

export interface RootCause {
  id: string;
  issue: string;
  cause: string;
  solution: string;
  confidence: number;
  dependencies: string[];
  impactedStages: string[];
}

export async function analyzeRootCause(logs: string[]): Promise<RootCause> {
  try {
    const { analysis } = await analyzeError(logs);
    
    // Process AI analysis into structured root cause data
    const rootCause: RootCause = {
      id: Date.now().toString(),
      issue: 'Build Failure',
      cause: analysis || 'Unknown cause',
      solution: 'Implementing recommended fixes',
      confidence: 0.85,
      dependencies: ['node_modules', 'build scripts'],
      impactedStages: ['build', 'test']
    };

    return rootCause;
  } catch (error) {
    console.error('Error analyzing root cause:', error);
    throw error;
  }
}