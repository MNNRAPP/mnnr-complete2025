/**
 * API v1 - Users Endpoint
 * Versioned API for user management with audit logging and rate limiting
 */

import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitConfigs, createRateLimitResponse, getClientIp } from '@/utils/rate-limit';
import { logAuditEvent, AuditEventType, getClientInfo } from '@/utils/audit-logger';
import { logger } from '@/utils/logger';

/**
 * GET /api/v1/users - Get current user profile
 */
export async function GET(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.api);

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime);
  }

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.ACCESS_DENIED, {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
        action: 'GET /api/v1/users',
        status: 'failure',
        errorMessage: 'Unauthorized'
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, full_name, avatar_url, billing_address, payment_method')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Failed to fetch user profile', profileError, { userId: user.id });
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    // Audit log
    await logAuditEvent(AuditEventType.DATA_ACCESSED, {
      userId: user.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent'),
      resourceType: 'user',
      resourceId: user.id,
      action: 'GET /api/v1/users',
      status: 'success'
    });

    return NextResponse.json({
      data: {
        id: profile.id,
        email: user.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        billing_address: profile.billing_address,
        payment_method: profile.payment_method
      }
    });

  } catch (error) {
    logger.error('API v1 users GET error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/users - Update current user profile
 */
export async function PATCH(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.api);

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime);
  }

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.ACCESS_DENIED, {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
        action: 'PATCH /api/v1/users',
        status: 'failure',
        errorMessage: 'Unauthorized'
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, avatar_url, billing_address, payment_method } = body;

    // Update profile
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name,
        avatar_url,
        billing_address,
        payment_method
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      logger.error('Failed to update user profile', error, { userId: user.id });

      await logAuditEvent(AuditEventType.DATA_UPDATED, {
        userId: user.id,
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
        resourceType: 'user',
        resourceId: user.id,
        action: 'PATCH /api/v1/users',
        status: 'error',
        errorMessage: error.message
      });

      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Audit log
    await logAuditEvent(AuditEventType.DATA_UPDATED, {
      userId: user.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent'),
      resourceType: 'user',
      resourceId: user.id,
      action: 'PATCH /api/v1/users',
      status: 'success',
      metadata: { updated_fields: Object.keys(body) }
    });

    return NextResponse.json({
      data: {
        id: data.id,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        billing_address: data.billing_address,
        payment_method: data.payment_method
      }
    });

  } catch (error) {
    logger.error('API v1 users PATCH error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/users - Delete current user account (GDPR compliance)
 */
export async function DELETE(request: NextRequest) {
  // Rate limiting
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp, rateLimitConfigs.api);

  if (!rateLimit.allowed) {
    return createRateLimitResponse(rateLimit.resetTime);
  }

  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      await logAuditEvent(AuditEventType.ACCESS_DENIED, {
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
        action: 'DELETE /api/v1/users',
        status: 'failure',
        errorMessage: 'Unauthorized'
      });

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete user data (GDPR compliance)
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id);

    if (deleteError) {
      logger.error('Failed to delete user', deleteError, { userId: user.id });

      await logAuditEvent(AuditEventType.DATA_DELETED, {
        userId: user.id,
        ipAddress: clientIp,
        userAgent: request.headers.get('user-agent'),
        resourceType: 'user',
        resourceId: user.id,
        action: 'DELETE /api/v1/users',
        status: 'error',
        errorMessage: deleteError.message
      });

      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Delete auth user
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (authDeleteError) {
      logger.error('Failed to delete auth user', authDeleteError, { userId: user.id });
    }

    // Audit log
    await logAuditEvent(AuditEventType.DATA_DELETED, {
      userId: user.id,
      ipAddress: clientIp,
      userAgent: request.headers.get('user-agent'),
      resourceType: 'user',
      resourceId: user.id,
      action: 'DELETE /api/v1/users - Account deletion',
      status: 'success'
    });

    return NextResponse.json({
      message: 'Account deleted successfully'
    });

  } catch (error) {
    logger.error('API v1 users DELETE error', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
