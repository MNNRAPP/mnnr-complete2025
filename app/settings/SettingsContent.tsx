/**
 * Settings Content Component
 * 
 * Created: 2025-12-26 23:13:00 EST  
 * Action #19 in 19-hour optimization
 */

'use client';

import { useState } from 'react';
import { useUpdateProfile } from '@/hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toasts/toasts';

interface SettingsContentProps {
  user: any;
  profile: any;
}

export default function SettingsContent({ user, profile: initialProfile }: SettingsContentProps) {
  const [profile, setProfile] = useState(initialProfile || {});
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateProfile, loading } = useUpdateProfile({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Profile updated successfully' });
      setIsEditing(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profile);
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-800"
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed here. Contact support to update.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={profile.company || ''}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100 dark:disabled:bg-gray-800"
              />
            </div>

            <div className="flex gap-2">
              {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setProfile(initialProfile);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your password and security preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Password</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Last changed: Never
              </p>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Active Sessions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Manage devices where you're currently signed in
              </p>
              <Button variant="outline">View Sessions</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Choose what updates you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'billing', label: 'Billing updates', description: 'Invoices and payment notifications' },
              { id: 'product', label: 'Product updates', description: 'New features and improvements' },
              { id: 'security', label: 'Security alerts', description: 'Important security notifications' },
              { id: 'marketing', label: 'Marketing emails', description: 'Tips, offers, and news' },
            ].map((item) => (
              <div key={item.id} className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{item.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={item.id !== 'marketing'}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Delete Account</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Permanently delete your account and all associated data
              </p>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
