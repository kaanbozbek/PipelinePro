import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
  dangerouslyAllowBrowser: true
});

const MAX_CHUNK_SIZE = 4000;
const MAX_CHUNKS = 3;

export interface AnalysisResult {
  analysis: string | null;
  error: string | null;
  roadmap?: string[] | null;
}

function chunkLogs(logs: string[]): string[] {
  const combinedLogs = logs.join('\n');
  const chunks: string[] = [];
  
  // Get the most relevant parts of the logs
  const errorLines = logs.filter(line => 
    line.toLowerCase().includes('error') || 
    line.toLowerCase().includes('failed') ||
    line.toLowerCase().includes('exception')
  );

  // Add error lines as the first chunk
  if (errorLines.length > 0) {
    chunks.push(errorLines.join('\n'));
  }

  // Add the last portion of logs if there's space
  const remainingLogs = combinedLogs.slice(-MAX_CHUNK_SIZE);
  if (remainingLogs && !chunks.includes(remainingLogs)) {
    chunks.push(remainingLogs);
  }

  return chunks.slice(0, MAX_CHUNKS);
}

export async function analyzeError(logs: string[]): Promise<AnalysisResult> {
  try {
    if (!config.openaiApiKey) {
      return {
        analysis: null,
        error: 'OpenAI API key is not configured. Please add your API key to the environment variables.',
        roadmap: null
      };
    }

    if (!logs || logs.length === 0) {
      return {
        analysis: null,
        error: 'No logs provided for analysis.',
        roadmap: null
      };
    }

    const logChunks = chunkLogs(logs);
    const analyses: string[] = [];

    // First pass: Analyze each chunk for errors
    for (const chunk of logChunks) {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a DevOps expert analyzing CI/CD pipeline failures. Focus on identifying the root cause and providing specific, actionable solutions. Be concise and direct."
          },
          {
            role: "user",
            content: `Analyze these pipeline logs and identify the root cause and solution:\n\n${chunk}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      const analysis = response.choices[0]?.message?.content;
      if (analysis) {
        analyses.push(analysis);
      }
    }

    if (analyses.length === 0) {
      return {
        analysis: null,
        error: 'Could not generate meaningful analysis from the logs.',
        roadmap: null
      };
    }

    // Second pass: Generate a roadmap
    const roadmapResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Create a step-by-step roadmap to fix the identified issues. Be specific and actionable."
        },
        {
          role: "user",
          content: `Based on this analysis, create a detailed roadmap to fix the issues:\n\n${analyses.join('\n\n')}`
        }
      ],
      max_tokens: 200,
      temperature: 0.5
    });

    const roadmap = roadmapResponse.choices[0]?.message?.content
      ?.split('\n')
      .filter(step => step.trim())
      .map(step => step.replace(/^\d+\.\s*/, '').trim());

    // Final pass: Consolidate analysis
    const finalAnalysis = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a DevOps expert providing a final, consolidated analysis. Be concise and actionable."
        },
        {
          role: "user",
          content: `Combine and summarize these analyses into a single, coherent recommendation:\n\n${analyses.join('\n\n')}`
        }
      ],
      max_tokens: 150,
      temperature: 0.5
    });

    return {
      analysis: finalAnalysis.choices[0]?.message?.content || analyses[0],
      error: null,
      roadmap
    };

  } catch (error: any) {
    console.error('Error analyzing logs with OpenAI:', error);
    
    if (error.error?.type === 'insufficient_quota') {
      return {
        analysis: null,
        error: 'OpenAI API quota exceeded. Please check your billing details or try again later.',
        roadmap: null
      };
    }
    
    if (error.status === 429) {
      return {
        analysis: null,
        error: 'Rate limit exceeded. Please try again in a few moments.',
        roadmap: null
      };
    }

    if (error.error?.code === 'context_length_exceeded') {
      return {
        analysis: null,
        error: 'Log content is too large. Trying to analyze the most relevant parts.',
        roadmap: null
      };
    }

    return {
      analysis: null,
      error: 'Failed to analyze logs. Please try again later.',
      roadmap: null
    };
  }
}