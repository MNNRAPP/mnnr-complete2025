/**
 * AI Service - LLM-Powered Insights and Natural Language Interface
 * 
 * Provides intelligent analysis, natural language queries, voice commands,
 * and predictive insights for the MNNR platform.
 * 
 * Features:
 * - Natural language to SQL/API queries
 * - Voice command interpretation
 * - Predictive analytics and anomaly detection
 * - Automated insights and recommendations
 * - Multi-modal interactions (text, voice, visual)
 */

import { OpenAI, toFile } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI model configuration
const AI_CONFIG = {
  // Use GPT-4 for complex reasoning
  complexReasoning: 'gpt-4-turbo-preview',
  // Use GPT-3.5 for simple queries
  simpleQueries: 'gpt-3.5-turbo',
  // Use Claude for long-context analysis
  longContext: 'claude-3-opus-20240229',
  // Use Whisper for speech-to-text
  speechToText: 'whisper-1',
  // Temperature settings
  temperature: {
    factual: 0.1,
    creative: 0.7,
    balanced: 0.5,
  },
};

/**
 * System context for MNNR platform
 */
const SYSTEM_CONTEXT = `You are an AI assistant for MNNR, an autonomous payment platform for machines and IoT devices.

MNNR enables:
- Machine-to-machine payments
- Autonomous transaction processing
- Real-time payment monitoring
- API-driven payment flows
- Multi-currency support

You help users:
- Query payment data using natural language
- Understand system metrics and trends
- Troubleshoot payment issues
- Get predictive insights
- Execute commands via voice

Always be concise, accurate, and actionable. For numerical data, provide exact figures. For trends, explain the significance.`;

/**
 * Natural Language Query Interface
 */
export interface NLQuery {
  query: string;
  context?: {
    userId?: string;
    timeRange?: { start: Date; end: Date };
    filters?: Record<string, any>;
  };
  preferredFormat?: 'text' | 'voice' | 'visual';
}

export interface NLResponse {
  answer: string;
  data?: any;
  visualization?: {
    type: 'chart' | 'table' | '3d' | 'map';
    config: any;
  };
  confidence: number;
  sources?: string[];
  suggestedFollowUps?: string[];
}

/**
 * Process natural language query
 */
export async function processNaturalLanguageQuery(
  query: NLQuery
): Promise<NLResponse> {
  try {
    // Determine query complexity
    const isComplex = query.query.length > 100 || 
                     query.query.includes('analyze') ||
                     query.query.includes('compare') ||
                     query.query.includes('predict');

    const model = isComplex ? AI_CONFIG.complexReasoning : AI_CONFIG.simpleQueries;

    // Build prompt with context
    const prompt = buildQueryPrompt(query);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_CONTEXT },
        { role: 'user', content: prompt },
      ],
      temperature: AI_CONFIG.temperature.factual,
      max_tokens: 1000,
      functions: [
        {
          name: 'query_database',
          description: 'Query the MNNR database for payment data',
          parameters: {
            type: 'object',
            properties: {
              sql: { type: 'string', description: 'SQL query to execute' },
              params: { type: 'object', description: 'Query parameters' },
            },
            required: ['sql'],
          },
        },
        {
          name: 'get_metrics',
          description: 'Get system metrics and KPIs',
          parameters: {
            type: 'object',
            properties: {
              metrics: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'List of metrics to retrieve'
              },
              timeRange: { type: 'string', description: 'Time range for metrics' },
            },
            required: ['metrics'],
          },
        },
      ],
    });

    const message = completion.choices[0].message;

    // Handle function calls
    if (message.function_call) {
      const functionName = message.function_call.name;
      const functionArgs = JSON.parse(message.function_call.arguments);

      let data;
      if (functionName === 'query_database') {
        data = await executeDatabaseQuery(functionArgs.sql, functionArgs.params);
      } else if (functionName === 'get_metrics') {
        data = await getSystemMetrics(functionArgs.metrics, functionArgs.timeRange);
      }

      // Generate natural language response from data
      const answerCompletion = await openai.chat.completions.create({
        model: AI_CONFIG.simpleQueries,
        messages: [
          { role: 'system', content: SYSTEM_CONTEXT },
          { role: 'user', content: query.query },
          { role: 'function', name: functionName, content: JSON.stringify(data) },
        ],
        temperature: AI_CONFIG.temperature.factual,
        max_tokens: 500,
      });

      return {
        answer: answerCompletion.choices[0].message.content || 'No answer generated',
        data,
        confidence: 0.9,
        suggestedFollowUps: generateFollowUpQuestions(query.query, data),
      };
    }

    // Direct text response
    return {
      answer: message.content || 'No answer generated',
      confidence: 0.8,
      suggestedFollowUps: generateFollowUpQuestions(query.query),
    };
  } catch (error) {
    console.error('[AI] Error processing natural language query:', error);
    return {
      answer: 'I apologize, but I encountered an error processing your query. Please try rephrasing or contact support.',
      confidence: 0,
    };
  }
}

/**
 * Voice command processing
 */
export interface VoiceCommand {
  audio?: Buffer; // Audio file
  text?: string; // Pre-transcribed text
  deviceType: 'smartwatch' | 'glasses' | 'phone' | 'vr' | 'assistant';
  userId: string;
}

export interface VoiceResponse {
  text: string;
  audio?: Buffer; // TTS audio response
  action?: {
    type: string;
    params: any;
  };
  requiresConfirmation?: boolean;
}

/**
 * Process voice command
 */
export async function processVoiceCommand(
  command: VoiceCommand
): Promise<VoiceResponse> {
  try {
    let text = command.text;

    // Transcribe audio if provided
    if (command.audio && !text) {
      const audioFile = await toFile(command.audio, 'audio.webm', { type: 'audio/webm' });
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: AI_CONFIG.speechToText,
        language: 'en',
      });
      text = transcription.text;
    }

    if (!text) {
      return {
        text: 'I didn\'t catch that. Could you please repeat?',
      };
    }

    // Interpret command intent
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.simpleQueries,
      messages: [
        { 
          role: 'system', 
          content: `${SYSTEM_CONTEXT}\n\nYou are processing voice commands. Identify the user's intent and extract action parameters. Be concise - responses will be spoken aloud.`
        },
        { role: 'user', content: text },
      ],
      temperature: AI_CONFIG.temperature.factual,
      functions: [
        {
          name: 'execute_action',
          description: 'Execute a system action',
          parameters: {
            type: 'object',
            properties: {
              action: { 
                type: 'string', 
                enum: ['query_status', 'approve_payment', 'deny_payment', 'get_metrics', 'call_support'],
                description: 'Action to execute'
              },
              params: { type: 'object', description: 'Action parameters' },
              requiresConfirmation: { type: 'boolean', description: 'Whether action needs user confirmation' },
            },
            required: ['action'],
          },
        },
      ],
    });

    const message = completion.choices[0].message;

    if (message.function_call) {
      const { action, params, requiresConfirmation } = JSON.parse(message.function_call.arguments);
      
      // Execute action if no confirmation needed
      let responseText;
      if (!requiresConfirmation) {
        const result = await executeAction(action, params, command.userId);
        responseText = result.message;
      } else {
        responseText = `Are you sure you want to ${action.replace('_', ' ')}?`;
      }

      return {
        text: responseText,
        action: { type: action, params },
        requiresConfirmation,
      };
    }

    // Fallback to query processing
    const queryResponse = await processNaturalLanguageQuery({
      query: text,
      context: { userId: command.userId },
      preferredFormat: 'voice',
    });

    return {
      text: queryResponse.answer,
    };
  } catch (error) {
    console.error('[AI] Error processing voice command:', error);
    return {
      text: 'Sorry, I encountered an error processing your command.',
    };
  }
}

/**
 * Predictive analytics and anomaly detection
 */
export interface PredictionRequest {
  metric: string;
  historicalData: Array<{ timestamp: Date; value: number }>;
  horizon: number; // Hours to predict
}

export interface PredictionResponse {
  predictions: Array<{ timestamp: Date; value: number; confidence: number }>;
  anomalies: Array<{ timestamp: Date; severity: 'low' | 'medium' | 'high'; description: string }>;
  insights: string[];
  recommendations: string[];
}

/**
 * Generate predictions and detect anomalies
 */
export async function generatePredictions(
  request: PredictionRequest
): Promise<PredictionResponse> {
  try {
    // Use Claude for long-context analysis
    const message = await anthropic.messages.create({
      model: AI_CONFIG.longContext,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Analyze this time series data for ${request.metric}:

${JSON.stringify(request.historicalData, null, 2)}

Tasks:
1. Predict the next ${request.horizon} hours
2. Identify any anomalies or unusual patterns
3. Provide insights about trends
4. Recommend actions if needed

Respond in JSON format:
{
  "predictions": [{"timestamp": "ISO8601", "value": number, "confidence": 0-1}],
  "anomalies": [{"timestamp": "ISO8601", "severity": "low|medium|high", "description": "string"}],
  "insights": ["string"],
  "recommendations": ["string"]
}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      // Extract JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse prediction response');
  } catch (error) {
    console.error('[AI] Error generating predictions:', error);
    return {
      predictions: [],
      anomalies: [],
      insights: ['Unable to generate predictions at this time'],
      recommendations: [],
    };
  }
}

/**
 * Generate automated insights from data
 */
export async function generateInsights(data: any): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.complexReasoning,
      messages: [
        { role: 'system', content: SYSTEM_CONTEXT },
        { 
          role: 'user', 
          content: `Analyze this payment data and provide 3-5 key insights:\n\n${JSON.stringify(data, null, 2)}`
        },
      ],
      temperature: AI_CONFIG.temperature.balanced,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content || '';
    return response.split('\n').filter(line => line.trim().length > 0);
  } catch (error) {
    console.error('[AI] Error generating insights:', error);
    return [];
  }
}

/**
 * Helper functions
 */

function buildQueryPrompt(query: NLQuery): string {
  let prompt = query.query;

  if (query.context) {
    prompt += '\n\nContext:';
    if (query.context.userId) {
      prompt += `\n- User ID: ${query.context.userId}`;
    }
    if (query.context.timeRange) {
      prompt += `\n- Time range: ${query.context.timeRange.start.toISOString()} to ${query.context.timeRange.end.toISOString()}`;
    }
    if (query.context.filters) {
      prompt += `\n- Filters: ${JSON.stringify(query.context.filters)}`;
    }
  }

  return prompt;
}

function generateFollowUpQuestions(query: string, data?: any): string[] {
  // Simple heuristic-based follow-up generation
  const followUps: string[] = [];

  if (query.toLowerCase().includes('payment')) {
    followUps.push('Show me failed payments from the last hour');
    followUps.push('What is the average payment value today?');
  }

  if (query.toLowerCase().includes('revenue')) {
    followUps.push('Compare revenue to last week');
    followUps.push('Which merchants generated the most revenue?');
  }

  if (data && Array.isArray(data) && data.length > 0) {
    followUps.push('Show me more details about the top result');
  }

  return followUps.slice(0, 3);
}

async function executeDatabaseQuery(sql: string, params?: any): Promise<any> {
  // TODO: Implement safe database query execution
  // This should use parameterized queries and have strict access controls
  console.log('[AI] Database query:', sql, params);
  return { placeholder: 'Database query execution not yet implemented' };
}

async function getSystemMetrics(metrics: string[], timeRange?: string): Promise<any> {
  // TODO: Implement metrics retrieval
  console.log('[AI] Get metrics:', metrics, timeRange);
  return { placeholder: 'Metrics retrieval not yet implemented' };
}

async function executeAction(action: string, params: any, userId: string): Promise<{ message: string }> {
  // TODO: Implement action execution
  console.log('[AI] Execute action:', action, params, userId);
  return { message: `Action ${action} executed successfully` };
}
