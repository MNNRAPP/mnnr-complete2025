'use client';

import ApiKeysManager from '@/components/dashboard/ApiKeysManager';

interface DashboardContentProps {
  user: any;
  profile: any;
  subscription: any;
}

export default function DashboardContent({
  user,
  profile,
  subscription,
}: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <ApiKeysManager userId={user.id} />
    </div>
  );
}
