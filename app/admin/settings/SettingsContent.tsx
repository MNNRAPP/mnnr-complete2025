/**
 * Admin Settings Content Component
 * 
 * Created: 2025-12-27 00:23:00 EST
 * Part of 2-hour completion plan - Phase 3
 */

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Settings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenanceMode: boolean;
  };
  features: {
    signupEnabled: boolean;
    trialEnabled: boolean;
    trialDays: number;
    apiAccessEnabled: boolean;
    webhooksEnabled: boolean;
  };
  limits: {
    maxUsersPerAccount: number;
    maxApiRequestsPerMinute: number;
    maxStoragePerUser: number;
    maxFileSize: number;
  };
  email: {
    provider: string;
    fromEmail: string;
    fromName: string;
    replyTo: string;
  };
  integrations: {
    stripeEnabled: boolean;
    sentryEnabled: boolean;
    analyticsEnabled: boolean;
  };
}

interface SettingsContentProps {
  settings: Settings;
}

export default function SettingsContent({ settings: initialSettings }: SettingsContentProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setIsSaving(true);
    // TODO: Implement save logic
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(initialSettings);
  };

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'features', label: 'Features' },
    { id: 'limits', label: 'Limits' },
    { id: 'email', label: 'Email' },
    { id: 'integrations', label: 'Integrations' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      {activeTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, siteName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Site URL
                </label>
                <input
                  type="url"
                  value={settings.general.siteUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, siteUrl: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Support Email
                </label>
                <input
                  type="email"
                  value={settings.general.supportEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, supportEmail: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.general.maintenanceMode}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      general: { ...settings.general, maintenanceMode: e.target.checked },
                    })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium">
                  Maintenance Mode
                </label>
                {settings.general.maintenanceMode && (
                  <Badge variant="warning">Active</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Flags */}
      {activeTab === 'features' && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">User Signup</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Allow new users to sign up
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.signupEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, signupEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Trial Period</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Enable trial period for new subscriptions
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.trialEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, trialEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              {settings.features.trialEnabled && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Trial Days
                  </label>
                  <input
                    type="number"
                    value={settings.features.trialDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        features: { ...settings.features, trialDays: parseInt(e.target.value) },
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">API Access</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Enable API access for users
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.apiAccessEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, apiAccessEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Webhooks</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Enable webhook functionality
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.features.webhooksEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      features: { ...settings.features, webhooksEnabled: e.target.checked },
                    })
                  }
                  className="w-4 h-4"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Limits */}
      {activeTab === 'limits' && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Limits & Quotas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Users Per Account
                </label>
                <input
                  type="number"
                  value={settings.limits.maxUsersPerAccount}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxUsersPerAccount: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max API Requests Per Minute
                </label>
                <input
                  type="number"
                  value={settings.limits.maxApiRequestsPerMinute}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxApiRequestsPerMinute: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Storage Per User (MB)
                </label>
                <input
                  type="number"
                  value={settings.limits.maxStoragePerUser}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxStoragePerUser: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={settings.limits.maxFileSize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      limits: { ...settings.limits, maxFileSize: parseInt(e.target.value) },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Provider
                </label>
                <select
                  value={settings.email.provider}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, provider: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="postmark">Postmark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Reply-To Email
                </label>
                <input
                  type="email"
                  value={settings.email.replyTo}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      email: { ...settings.email, replyTo: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integrations */}
      {activeTab === 'integrations' && (
        <Card>
          <CardHeader>
            <CardTitle>Third-Party Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">Stripe</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Payment processing
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={settings.integrations.stripeEnabled ? 'success' : 'default'}>
                    {settings.integrations.stripeEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <input
                    type="checkbox"
                    checked={settings.integrations.stripeEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, stripeEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">Sentry</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Error tracking and monitoring
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={settings.integrations.sentryEnabled ? 'success' : 'default'}>
                    {settings.integrations.sentryEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <input
                    type="checkbox"
                    checked={settings.integrations.sentryEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, sentryEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Usage analytics and tracking
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={settings.integrations.analyticsEnabled ? 'success' : 'default'}>
                    {settings.integrations.analyticsEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <input
                    type="checkbox"
                    checked={settings.integrations.analyticsEnabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        integrations: { ...settings.integrations, analyticsEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save/Reset Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleReset}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
