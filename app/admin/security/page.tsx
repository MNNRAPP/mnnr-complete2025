/**
 * Security Monitoring Dashboard
 * Real-time security metrics and alerts
 * Access: Admin only
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SecurityDashboard } from '@/components/SecurityDashboard';

export const metadata = {
  title: 'Security Dashboard | MNNR',
  description: 'Real-time security monitoring and metrics',
};

async function getSecurityMetrics() {
  const supabase = createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  // Check if user is admin (implement your own logic)
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Get security metrics from audit logs
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Failed login attempts (last 24h)
  const { count: failedLogins } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'user.login.failed')
    .gte('timestamp', twentyFourHoursAgo);

  // Successful logins (last 24h)
  const { count: successfulLogins } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'user.login')
    .gte('timestamp', twentyFourHoursAgo);

  // MFA enrollments
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: mfaEnabledUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .not('mfa_secret', 'is', null);

  // Passkey enrollments
  const { count: passkeyUsers } = await supabase
    .from('passkeys')
    .select('user_id', { count: 'exact', head: true });

  // Suspicious IPs (failed logins > 5)
  const { data: suspiciousIPs } = await supabase
    .from('audit_logs')
    .select('ip_address')
    .eq('event_type', 'user.login.failed')
    .gte('timestamp', twentyFourHoursAgo);

  const ipCounts: Record<string, number> = {};
  suspiciousIPs?.forEach((log) => {
    if (log.ip_address) {
      ipCounts[log.ip_address] = (ipCounts[log.ip_address] || 0) + 1;
    }
  });

  const suspiciousIPsList = Object.entries(ipCounts)
    .filter(([, count]) => count > 5)
    .map(([ip, count]) => ({ ip, attempts: count }))
    .sort((a, b) => b.attempts - a.attempts);

  // Security alerts (last 24h)
  const { data: securityAlerts } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('event_type', 'security.alert')
    .gte('timestamp', twentyFourHoursAgo)
    .order('timestamp', { ascending: false })
    .limit(10);

  // Data access events (last 24h)
  const { count: dataAccessCount } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'data.accessed')
    .gte('timestamp', twentyFourHoursAgo);

  // Active sessions
  const { count: activeSessions } = await supabase
    .from('audit_logs')
    .select('user_id', { count: 'exact', head: true })
    .eq('event_type', 'user.login')
    .gte('timestamp', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // Last 30 min

  return {
    failedLogins: failedLogins || 0,
    successfulLogins: successfulLogins || 0,
    totalUsers: totalUsers || 0,
    mfaEnabledUsers: mfaEnabledUsers || 0,
    passkeyUsers: passkeyUsers || 0,
    mfaEnrollmentRate: totalUsers ? Math.round((mfaEnabledUsers! / totalUsers) * 100) : 0,
    passkeyEnrollmentRate: totalUsers ? Math.round((passkeyUsers! / totalUsers) * 100) : 0,
    suspiciousIPs: suspiciousIPsList,
    securityAlerts: securityAlerts || [],
    dataAccessCount: dataAccessCount || 0,
    activeSessions: activeSessions || 0,
  };
}

export default async function SecurityPage() {
  const metrics = await getSecurityMetrics();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Security Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time security metrics and monitoring
          </p>
        </div>

        <SecurityDashboard metrics={metrics} />
      </div>
    </div>
  );
}
