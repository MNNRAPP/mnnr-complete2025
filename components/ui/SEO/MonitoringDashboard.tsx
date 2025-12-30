'use client';

import { useState, useEffect } from 'react';

interface KeywordRanking {
  keyword: string;
  perplexity: number | null;
  chatgpt: boolean;
  claude: boolean;
  googleRank: number | null;
  impressions: number;
  ctr: number;
}

interface SEOMetrics {
  totalIndexedPages: number;
  avgRankingPosition: number;
  totalImpressions: number;
  totalClicks: number;
  avgCTR: number;
  lastUpdated: string;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<SEOMetrics>({
    totalIndexedPages: 0,
    avgRankingPosition: 0,
    totalImpressions: 0,
    totalClicks: 0,
    avgCTR: 0,
    lastUpdated: new Date().toLocaleString(),
  });

  const [rankings, setRankings] = useState<KeywordRanking[]>([
    { keyword: 'AI agent billing', perplexity: null, chatgpt: false, claude: false, googleRank: null, impressions: 0, ctr: 0 },
    { keyword: 'LLM billing', perplexity: null, chatgpt: false, claude: false, googleRank: null, impressions: 0, ctr: 0 },
    { keyword: 'GPT billing', perplexity: null, chatgpt: false, claude: false, googleRank: null, impressions: 0, ctr: 0 },
    { keyword: 'AI API monetization', perplexity: null, chatgpt: false, claude: false, googleRank: null, impressions: 0, ctr: 0 },
    { keyword: 'machine economy payments', perplexity: null, chatgpt: false, claude: false, googleRank: null, impressions: 0, ctr: 0 },
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'guide'>('overview');

  useEffect(() => {
    // Simulate data fetching from GSC API
    // In production, this would fetch real data from Google Search Console
    const timer = setTimeout(() => {
      setMetrics({
        totalIndexedPages: 42,
        avgRankingPosition: 12.5,
        totalImpressions: 1250,
        totalClicks: 156,
        avgCTR: 12.5,
        lastUpdated: new Date().toLocaleString(),
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getRankColor = (rank: number | null) => {
    if (rank === null) return 'text-gray-400';
    if (rank <= 3) return 'text-emerald-400';
    if (rank <= 10) return 'text-cyan-400';
    if (rank <= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRankLabel = (rank: number | null) => {
    if (rank === null) return 'Not ranked';
    if (rank <= 3) return `Top 3 (#${rank})`;
    if (rank <= 10) return `Top 10 (#${rank})`;
    if (rank <= 30) return `Top 30 (#${rank})`;
    return `#${rank}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">SEO Monitoring Dashboard</h1>
        <p className="text-white/50">Track MNNR's visibility in Google Search and AI search engines</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('keywords')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'keywords'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Keyword Rankings
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'guide'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Setup Guide
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="text-sm text-white/50 mb-2">Indexed Pages</div>
              <div className="text-3xl font-bold text-emerald-400">{metrics.totalIndexedPages}</div>
              <div className="text-xs text-white/30 mt-2">Pages in Google Search</div>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="text-sm text-white/50 mb-2">Avg. Ranking Position</div>
              <div className="text-3xl font-bold text-cyan-400">{metrics.avgRankingPosition.toFixed(1)}</div>
              <div className="text-xs text-white/30 mt-2">Lower is better</div>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <div className="text-sm text-white/50 mb-2">Click-Through Rate</div>
              <div className="text-3xl font-bold text-purple-400">{metrics.avgCTR.toFixed(1)}%</div>
              <div className="text-xs text-white/30 mt-2">From search results</div>
            </div>
          </div>

          {/* Search Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Search Impressions</h3>
              <div className="text-4xl font-bold text-emerald-400 mb-2">{metrics.totalImpressions}</div>
              <p className="text-white/50 text-sm">Times MNNR appeared in search results</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Total Clicks</h3>
              <div className="text-4xl font-bold text-cyan-400 mb-2">{metrics.totalClicks}</div>
              <p className="text-white/50 text-sm">Clicks from search results to mnnr.app</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Next Steps</h3>
            <div className="space-y-3 text-white/70">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold mt-0.5">1.</span>
                <div>
                  <strong>Submit to Google Search Console</strong>
                  <p className="text-sm text-white/50 mt-1">
                    Go to <a href="https://search.google.com/search-console" className="text-emerald-400 hover:underline">Google Search Console</a> and submit the sitemap at https://mnnr.app/sitemap.xml
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-0.5">2.</span>
                <div>
                  <strong>Validate Structured Data</strong>
                  <p className="text-sm text-white/50 mt-1">
                    Use <a href="https://search.google.com/test/rich-results" className="text-cyan-400 hover:underline">Google Rich Results Test</a> to verify all 6 schemas are valid
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-0.5">3.</span>
                <div>
                  <strong>Monitor AI Search Rankings</strong>
                  <p className="text-sm text-white/50 mt-1">
                    Test MNNR visibility on <a href="https://www.perplexity.ai/" className="text-purple-400 hover:underline">Perplexity</a>, <a href="https://chat.openai.com/" className="text-purple-400 hover:underline">ChatGPT</a>, and <a href="https://claude.ai/" className="text-purple-400 hover:underline">Claude</a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <p className="text-xs text-white/30 text-center">Last updated: {metrics.lastUpdated}</p>
        </div>
      )}

      {/* Keywords Tab */}
      {activeTab === 'keywords' && (
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Keyword</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Google Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Perplexity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">ChatGPT</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Claude</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Impressions</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {rankings.map((ranking, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-white">{ranking.keyword}</td>
                      <td className={`px-6 py-4 font-semibold ${getRankColor(ranking.googleRank)}`}>
                        {getRankLabel(ranking.googleRank)}
                      </td>
                      <td className="px-6 py-4">
                        {ranking.perplexity ? (
                          <span className="text-emerald-400">#{ranking.perplexity}</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ranking.chatgpt ? (
                          <span className="text-emerald-400">✓ Cited</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {ranking.claude ? (
                          <span className="text-emerald-400">✓ Cited</span>
                        ) : (
                          <span className="text-white/30">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-white/70">{ranking.impressions}</td>
                      <td className="px-6 py-4 text-white/70">{ranking.ctr.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-white/30 text-center">
            Data syncs from Google Search Console. Manual testing required for AI search engines.
          </p>
        </div>
      )}

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Setup Instructions</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold text-sm">1</span>
                  <h4 className="text-lg font-semibold text-white">Google Search Console</h4>
                </div>
                <p className="text-white/70 ml-11 mb-3">
                  Verify your domain and submit the sitemap for indexing.
                </p>
                <div className="ml-11 bg-black/40 rounded-lg p-4 text-sm text-white/60 font-mono">
                  1. Go to search.google.com/search-console<br/>
                  2. Add property: mnnr.app<br/>
                  3. Verify ownership via DNS TXT record<br/>
                  4. Submit sitemap: https://mnnr.app/sitemap.xml
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500 flex items-center justify-center text-cyan-400 font-bold text-sm">2</span>
                  <h4 className="text-lg font-semibold text-white">Validate Structured Data</h4>
                </div>
                <p className="text-white/70 ml-11 mb-3">
                  Test all 6 JSON-LD schemas using Google's Rich Results Test.
                </p>
                <div className="ml-11 bg-black/40 rounded-lg p-4 text-sm text-white/60 font-mono">
                  1. Go to search.google.com/test/rich-results<br/>
                  2. Enter: https://mnnr.app<br/>
                  3. Verify all schemas pass validation<br/>
                  4. Check for any errors or warnings
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400 font-bold text-sm">3</span>
                  <h4 className="text-lg font-semibold text-white">Monitor AI Search Rankings</h4>
                </div>
                <p className="text-white/70 ml-11 mb-3">
                  Test MNNR visibility on AI search engines.
                </p>
                <div className="ml-11 space-y-2">
                  <div className="bg-black/40 rounded-lg p-3 text-sm text-white/60">
                    <strong className="text-white">Perplexity:</strong> Search "AI agent billing"
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 text-sm text-white/60">
                    <strong className="text-white">ChatGPT:</strong> Ask "What's the best AI billing platform?"
                  </div>
                  <div className="bg-black/40 rounded-lg p-3 text-sm text-white/60">
                    <strong className="text-white">Claude:</strong> Search "AI agent monetization"
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8">
            <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
            <div className="space-y-3">
              <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                → Google Search Console
              </a>
              <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                → Google Rich Results Test
              </a>
              <a href="https://www.perplexity.ai/" target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                → Perplexity AI
              </a>
              <a href="https://chat.openai.com/" target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                → ChatGPT
              </a>
              <a href="https://claude.ai/" target="_blank" rel="noopener noreferrer" className="block text-emerald-400 hover:text-emerald-300 transition-colors">
                → Claude AI
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
