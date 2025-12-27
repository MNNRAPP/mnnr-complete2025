/**
 * Admin Users Content Component
 * 
 * Created: 2025-12-27 00:08:00 EST
 * Part of 2-hour completion plan
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  status: string;
  role: string;
  created_at: string;
}

interface UsersContentProps {
  users: User[];
  totalCount: number;
  currentPage: number;
  limit: number;
  searchQuery?: string;
  statusFilter?: string;
}

export default function UsersContent({
  users,
  totalCount,
  currentPage,
  limit,
  searchQuery = '',
  statusFilter = '',
}: UsersContentProps) {
  const router = useRouter();
  const [search, setSearch] = useState(searchQuery);
  const [status, setStatus] = useState(statusFilter);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const totalPages = Math.ceil(totalCount / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    router.push(`/admin/users?${params.toString()}`);
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
      active: 'success',
      inactive: 'warning',
      suspended: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === 'admin' ? 'info' : 'default'}>
        {role}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <Button type="submit">Search</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch('');
                setStatus('');
                router.push('/admin/users');
              }}
            >
              Reset
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUsers.length} user(s) selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Export Selected
                </Button>
                <Button variant="outline" size="sm">
                  Suspend Selected
                </Button>
                <Button variant="destructive" size="sm">
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Users ({totalCount})
            </CardTitle>
            <Button>Export All</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatar_url && (
                          <img
                            src={user.avatar_url}
                            alt={user.email}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="p-4">{user.full_name || '-'}</td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          Suspend
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  No users found
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {(currentPage - 1) * limit + 1} to{' '}
                {Math.min(currentPage * limit, totalCount)} of {totalCount} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (page > totalPages) return null;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
