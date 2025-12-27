/**
 * Admin Users API Endpoint
 * 
 * Created: 2025-12-26 22:53:00 EST
 * Action #9 in 19-hour optimization
 * 
 * Purpose: Administrative user management (list, search, update, delete)
 * 
 * Endpoints:
 * - GET /api/admin/users - List all users with pagination
 * - PATCH /api/admin/users/[id] - Update user details
 * - DELETE /api/admin/users/[id] - Delete/deactivate user
 * 
 * Security: Requires admin role
 */

import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Check if user has admin role
 */
async function isAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single();
  
  return !!data;
}

/**
 * GET /api/admin/users
 * List all users with pagination and filtering
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - search: Search query (email, name)
 * - status: Filter by status (active, inactive)
 * - sort: Sort field (created_at, email, full_name)
 * - order: Sort order (asc, desc)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permission
    const hasAdminAccess = await isAdmin(supabase, user.id);
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20'),
      100
    );
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'created_at';
    const order = (searchParams.get('order') || 'desc') as 'asc' | 'desc';

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query
    let query = supabase
      .from('users')
      .select('*, customers(stripe_customer_id)', { count: 'exact' })
      .range(from, to)
      .order(sort, { ascending: order === 'asc' });

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    const { data: users, error, count } = await query;

    if (error) {
      console.error('Users fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Admin users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
