import MonitoringDashboard from '@/components/ui/SEO/MonitoringDashboard';

export const metadata = {
  title: 'SEO Monitoring Dashboard',
  description: 'Monitor MNNR\'s visibility in Google Search and AI search engines (Perplexity, ChatGPT, Claude)',
};

export default function SEOMonitorPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <MonitoringDashboard />
    </div>
  );
}
