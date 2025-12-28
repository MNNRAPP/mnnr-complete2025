/**
 * Agent Marketplace API
 * 
 * THE KILLER FEATURE THAT PAID.AI DOESN'T HAVE
 * 
 * This enables:
 * - Agents listing their services for hire
 * - Price discovery and bidding
 * - Agent-to-agent transactions
 * - Reputation-based matching
 * - Revenue sharing for agent creators
 * 
 * This transforms MNNR from a billing tool into an ECONOMY.
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Listing Schema
const CreateListingSchema = z.object({
  agent_id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  category: z.enum([
    'text_generation',
    'image_generation',
    'code_generation',
    'data_analysis',
    'research',
    'translation',
    'summarization',
    'classification',
    'extraction',
    'custom',
  ]),
  pricing_model: z.enum(['per_request', 'per_token', 'per_minute', 'fixed', 'auction']),
  base_price_usd: z.number().min(0.001),
  capabilities: z.array(z.string()),
  input_schema: z.record(z.string(), z.any()).optional(),
  output_schema: z.record(z.string(), z.any()).optional(),
  sla: z.object({
    max_latency_ms: z.number().optional(),
    availability_percent: z.number().min(0).max(100).optional(),
    support_level: z.enum(['none', 'basic', 'premium']).optional(),
  }).optional(),
  tags: z.array(z.string()).optional(),
});

// Bid Schema
const CreateBidSchema = z.object({
  listing_id: z.string(),
  buyer_agent_id: z.string().optional(),
  bid_amount_usd: z.number().min(0.001),
  requirements: z.string().optional(),
  deadline: z.string().datetime().optional(),
});

/**
 * GET /api/marketplace - Browse agent listings
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const minReputation = searchParams.get('min_reputation');
    const sortBy = searchParams.get('sort') || 'reputation';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Demo listings (in production, these come from database)
    const demoListings = [
      {
        id: 'listing_1',
        agent: {
          id: 'agent_gpt4_writer',
          name: 'GPT-4 Content Writer',
          reputation_score: 95,
          total_jobs: 1250,
          success_rate: 99.2,
        },
        title: 'Professional Blog Post Generation',
        description: 'High-quality, SEO-optimized blog posts on any topic. Includes research, outline, and final draft.',
        category: 'text_generation',
        pricing_model: 'per_request',
        base_price_usd: 0.50,
        capabilities: ['research', 'seo', 'long_form', 'citations'],
        sla: {
          max_latency_ms: 30000,
          availability_percent: 99.9,
        },
        stats: {
          total_revenue_usd: 12500,
          avg_rating: 4.8,
          response_time_avg_ms: 15000,
        },
        tags: ['writing', 'blog', 'seo', 'content'],
        created_at: '2025-01-15T00:00:00Z',
      },
      {
        id: 'listing_2',
        agent: {
          id: 'agent_claude_analyst',
          name: 'Claude Data Analyst',
          reputation_score: 92,
          total_jobs: 890,
          success_rate: 98.5,
        },
        title: 'Financial Data Analysis & Insights',
        description: 'Deep analysis of financial data with actionable insights. Supports CSV, JSON, and API data sources.',
        category: 'data_analysis',
        pricing_model: 'per_minute',
        base_price_usd: 0.02,
        capabilities: ['financial', 'visualization', 'forecasting', 'anomaly_detection'],
        sla: {
          max_latency_ms: 60000,
          availability_percent: 99.5,
        },
        stats: {
          total_revenue_usd: 8900,
          avg_rating: 4.7,
          response_time_avg_ms: 45000,
        },
        tags: ['finance', 'analysis', 'data', 'insights'],
        created_at: '2025-01-10T00:00:00Z',
      },
      {
        id: 'listing_3',
        agent: {
          id: 'agent_stable_diffusion',
          name: 'Stable Diffusion Artist',
          reputation_score: 88,
          total_jobs: 5600,
          success_rate: 97.8,
        },
        title: 'Custom Image Generation',
        description: 'High-quality image generation from text prompts. Supports various styles, aspect ratios, and refinement.',
        category: 'image_generation',
        pricing_model: 'per_request',
        base_price_usd: 0.05,
        capabilities: ['photorealistic', 'artistic', 'logo', 'illustration'],
        sla: {
          max_latency_ms: 15000,
          availability_percent: 99.0,
        },
        stats: {
          total_revenue_usd: 28000,
          avg_rating: 4.6,
          response_time_avg_ms: 8000,
        },
        tags: ['image', 'art', 'design', 'creative'],
        created_at: '2025-01-05T00:00:00Z',
      },
      {
        id: 'listing_4',
        agent: {
          id: 'agent_codex_dev',
          name: 'Codex Developer',
          reputation_score: 94,
          total_jobs: 2100,
          success_rate: 99.0,
        },
        title: 'Code Generation & Review',
        description: 'Generate, review, and refactor code in any language. Includes tests and documentation.',
        category: 'code_generation',
        pricing_model: 'per_token',
        base_price_usd: 0.00002,
        capabilities: ['python', 'javascript', 'rust', 'go', 'testing', 'documentation'],
        sla: {
          max_latency_ms: 20000,
          availability_percent: 99.9,
        },
        stats: {
          total_revenue_usd: 42000,
          avg_rating: 4.9,
          response_time_avg_ms: 12000,
        },
        tags: ['code', 'development', 'programming', 'review'],
        created_at: '2025-01-01T00:00:00Z',
      },
      {
        id: 'listing_5',
        agent: {
          id: 'agent_research_bot',
          name: 'Deep Research Agent',
          reputation_score: 91,
          total_jobs: 450,
          success_rate: 98.0,
        },
        title: 'Comprehensive Research Reports',
        description: 'In-depth research on any topic with citations, analysis, and recommendations.',
        category: 'research',
        pricing_model: 'fixed',
        base_price_usd: 5.00,
        capabilities: ['academic', 'market_research', 'competitive_analysis', 'citations'],
        sla: {
          max_latency_ms: 300000,
          availability_percent: 98.0,
        },
        stats: {
          total_revenue_usd: 22500,
          avg_rating: 4.8,
          response_time_avg_ms: 180000,
        },
        tags: ['research', 'analysis', 'reports', 'academic'],
        created_at: '2024-12-20T00:00:00Z',
      },
    ];

    // Filter listings
    let filteredListings = demoListings;

    if (category) {
      filteredListings = filteredListings.filter(l => l.category === category);
    }

    if (minPrice) {
      filteredListings = filteredListings.filter(l => l.base_price_usd >= parseFloat(minPrice));
    }

    if (maxPrice) {
      filteredListings = filteredListings.filter(l => l.base_price_usd <= parseFloat(maxPrice));
    }

    if (minReputation) {
      filteredListings = filteredListings.filter(l => l.agent.reputation_score >= parseInt(minReputation));
    }

    // Sort listings
    switch (sortBy) {
      case 'price_low':
        filteredListings.sort((a, b) => a.base_price_usd - b.base_price_usd);
        break;
      case 'price_high':
        filteredListings.sort((a, b) => b.base_price_usd - a.base_price_usd);
        break;
      case 'rating':
        filteredListings.sort((a, b) => b.stats.avg_rating - a.stats.avg_rating);
        break;
      case 'jobs':
        filteredListings.sort((a, b) => b.agent.total_jobs - a.agent.total_jobs);
        break;
      case 'reputation':
      default:
        filteredListings.sort((a, b) => b.agent.reputation_score - a.agent.reputation_score);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const paginatedListings = filteredListings.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      listings: paginatedListings,
      pagination: {
        page,
        limit,
        total: filteredListings.length,
        total_pages: Math.ceil(filteredListings.length / limit),
      },
      filters: {
        categories: [
          'text_generation',
          'image_generation',
          'code_generation',
          'data_analysis',
          'research',
          'translation',
          'summarization',
          'classification',
          'extraction',
          'custom',
        ],
        pricing_models: ['per_request', 'per_token', 'per_minute', 'fixed', 'auction'],
        sort_options: ['reputation', 'price_low', 'price_high', 'rating', 'jobs'],
      },
      marketplace_stats: {
        total_listings: 5,
        total_agents: 5,
        total_transactions_24h: 1250,
        total_volume_24h_usd: 8500,
        avg_success_rate: 98.5,
      },
      message: 'Agent Marketplace - Demo data (tables pending migration)',
    });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/marketplace - Create a listing or place a bid
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { operation } = body;

    if (operation === 'create_listing') {
      const validationResult = CreateListingSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: validationResult.error.issues },
          { status: 400 }
        );
      }

      // In production, this would insert into database
      return NextResponse.json({
        success: true,
        listing: {
          id: `listing_${Date.now()}`,
          ...validationResult.data,
          status: 'active',
          created_at: new Date().toISOString(),
        },
        message: 'Listing created (demo - tables pending migration)',
      });
    }

    if (operation === 'place_bid') {
      const validationResult = CreateBidSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          { error: 'Invalid request', details: validationResult.error.issues },
          { status: 400 }
        );
      }

      // In production, this would insert into database and notify seller
      return NextResponse.json({
        success: true,
        bid: {
          id: `bid_${Date.now()}`,
          ...validationResult.data,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        message: 'Bid placed (demo - tables pending migration)',
      });
    }

    if (operation === 'hire_agent') {
      const { listing_id, task_description, budget_usd } = body;

      // In production, this would:
      // 1. Verify buyer has sufficient balance
      // 2. Create escrow for the payment
      // 3. Notify the agent
      // 4. Create a job record

      return NextResponse.json({
        success: true,
        job: {
          id: `job_${Date.now()}`,
          listing_id,
          buyer_id: user.id,
          task_description,
          budget_usd,
          status: 'pending_acceptance',
          escrow_id: `escrow_${Date.now()}`,
          created_at: new Date().toISOString(),
        },
        message: 'Agent hired - awaiting acceptance (demo - tables pending migration)',
      });
    }

    return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
