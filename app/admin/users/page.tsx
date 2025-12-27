/**
 * Admin Users Page
 * 
 * Created: 2025-12-27 00:07:00 EST
 * Part of 2-hour completion plan
 * 
 * Purpose: Admin user management with full CRUD operations
 */

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import UsersContent from './UsersContent';

export const metadata = {
  title: 'User Management | Admin | MNNR',
  description: 'Manage users and permissions',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?redirect=/admin/users');
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch users with pagination
  const page = parseInt(searchParams.page || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply search filter
  if (searchParams.search) {
    query = query.or(
      `email.ilike.%${searchParams.search}%,full_name.ilike.%${searchParams.search}%`
    );
  }

  // Apply status filter
  if (searchParams.status) {
    query = query.eq('status', searchParams.status);
  }

  const { data: users, count } = await query;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage users, permissions, and account status
          </p>
        </div>

        <UsersContent
          users={users || []}
          totalCount={count || 0}
          currentPage={page}
          limit={limit}
          searchQuery={searchParams.search}
          statusFilter={searchParams.status}
        />
      </div>
    </div>
  );
}
