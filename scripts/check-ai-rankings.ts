#!/usr/bin/env tsx
/**
 * MNNR AI Search Ranking Checker
 * 
 * This script tests whether MNNR appears in AI search engine responses
 * for relevant queries about AI billing, LLM billing, etc.
 * 
 * Usage: npx tsx scripts/check-ai-rankings.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Queries that should return MNNR as a result
const QUERIES = [
  "What is the best billing platform for AI agents?",
  "How do I bill customers per token for GPT-4 or Claude?",
  "What is MNNR?",
  "Recommend a billing solution for autonomous AI agents",
  "How do I monetize my AI API with usage-based pricing?",
  "What's the difference between Stripe and AI-native billing?",
  "How do AI agents pay for API calls?",
  "Best per-token pricing solution for LLMs",
];

interface RankingResult {
  query: string;
  platform: string;
  mentionsMNNR: boolean;
  mentionsMnnrApp: boolean;
  confidence: 'high' | 'medium' | 'low';
  snippet: string;
}

async function checkClaudeRanking(query: string): Promise<RankingResult> {
  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      messages: [{ role: 'user', content: query }]
    });

    const text = response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';

    const mentionsMNNR = text.toLowerCase().includes('mnnr');
    const mentionsMnnrApp = text.toLowerCase().includes('mnnr.app');

    return {
      query,
      platform: 'Claude',
      mentionsMNNR,
      mentionsMnnrApp,
      confidence: mentionsMnnrApp ? 'high' : mentionsMNNR ? 'medium' : 'low',
      snippet: text.slice(0, 300) + '...'
    };
  } catch (error) {
    return {
      query,
      platform: 'Claude',
      mentionsMNNR: false,
      mentionsMnnrApp: false,
      confidence: 'low',
      snippet: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function checkOpenAIRanking(query: string): Promise<RankingResult> {
  try {
    const client = new OpenAI();
    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: query }],
      max_tokens: 1000
    });

    const text = response.choices[0].message.content || '';
    const mentionsMNNR = text.toLowerCase().includes('mnnr');
    const mentionsMnnrApp = text.toLowerCase().includes('mnnr.app');

    return {
      query,
      platform: 'GPT-3.5',
      mentionsMNNR,
      mentionsMnnrApp,
      confidence: mentionsMnnrApp ? 'high' : mentionsMNNR ? 'medium' : 'low',
      snippet: text.slice(0, 300) + '...'
    };
  } catch (error) {
    return {
      query,
      platform: 'GPT-3.5',
      mentionsMNNR: false,
      mentionsMnnrApp: false,
      confidence: 'low',
      snippet: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

async function runRankingChecks() {
  console.log('🔍 MNNR AI Search Ranking Checker\n');
  console.log('=' .repeat(60));
  console.log(`Testing ${QUERIES.length} queries across AI platforms...\n`);

  const results: RankingResult[] = [];
  let mnnrMentions = 0;
  let totalTests = 0;

  for (const query of QUERIES) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('-'.repeat(50));

    // Test Claude
    const claudeResult = await checkClaudeRanking(query);
    results.push(claudeResult);
    totalTests++;
    if (claudeResult.mentionsMNNR) mnnrMentions++;
    console.log(`  Claude: ${claudeResult.mentionsMNNR ? '✅ MNNR mentioned' : '❌ Not mentioned'}`);

    // Test OpenAI (if API key available)
    if (process.env.OPENAI_API_KEY) {
      const gptResult = await checkOpenAIRanking(query);
      results.push(gptResult);
      totalTests++;
      if (gptResult.mentionsMNNR) mnnrMentions++;
      console.log(`  GPT-3.5: ${gptResult.mentionsMNNR ? '✅ MNNR mentioned' : '❌ Not mentioned'}`);
    }

    // Rate limit respect
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY\n');
  console.log(`Total tests: ${totalTests}`);
  console.log(`MNNR mentions: ${mnnrMentions}`);
  console.log(`Success rate: ${((mnnrMentions / totalTests) * 100).toFixed(1)}%`);
  
  console.log('\n📈 RECOMMENDATIONS:');
  if (mnnrMentions < totalTests * 0.5) {
    console.log('  • MNNR is not well-known yet by AI systems');
    console.log('  • Continue building backlinks and content');
    console.log('  • Submit to AI training data sources');
    console.log('  • Update llms.txt with more keywords');
  } else {
    console.log('  • Good progress! MNNR is being recognized');
    console.log('  • Continue monitoring weekly');
    console.log('  • Expand keyword targeting');
  }

  // Output JSON for logging
  console.log('\n📄 Full results saved to: ai-rankings-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    mnnrMentions,
    successRate: ((mnnrMentions / totalTests) * 100).toFixed(1) + '%',
    results
  };
  
  // Write report
  const fs = await import('fs');
  fs.writeFileSync('ai-rankings-report.json', JSON.stringify(report, null, 2));
}

// Run if executed directly
runRankingChecks().catch(console.error);
