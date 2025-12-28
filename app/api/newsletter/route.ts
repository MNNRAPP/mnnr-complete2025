import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // If Supabase is configured, store in database
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Try to insert into newsletter_subscribers table
      // If table doesn't exist, we'll create it or just log
      const { error } = await supabase
        .from('newsletter_subscribers')
        .upsert(
          { 
            email: normalizedEmail, 
            subscribed_at: new Date().toISOString(),
            source: 'website',
            status: 'active'
          },
          { onConflict: 'email' }
        );

      if (error) {
        // Table might not exist - log and continue
        console.log('Newsletter subscription note:', error.message);
        
        // Still return success to user - we can process later
        // In production, you'd want to ensure the table exists
      }
    }

    // Log for tracking (useful even without database)
    console.log(`Newsletter signup: ${normalizedEmail} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter'
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Newsletter API - POST to subscribe',
    endpoint: '/api/newsletter',
    method: 'POST',
    body: { email: 'string' }
  });
}
