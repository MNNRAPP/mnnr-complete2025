import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY || 're_eE4ZM9xZ_9439bS3mLZJYUAhLjxfTkzoT');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

// Welcome email HTML template
const getWelcomeEmailHtml = () => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MNNR</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 40px;">
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="color: #10b981; font-size: 32px; margin: 0; font-weight: 700;">MNNR</h1>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0 0 0;">Machine Economy Billing Infrastructure</p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0;">Welcome to the Machine Economy! 🚀</h2>
              <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0;">
                You're now part of an exclusive group of developers building the future of autonomous agent commerce.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 24px;">
              <div style="background: rgba(16, 185, 129, 0.1); border-radius: 12px; padding: 24px;">
                <h3 style="color: #10b981; font-size: 18px; margin: 0 0 16px 0;">What's Next?</h3>
                <ul style="color: #d1d5db; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li><strong style="color: #ffffff;">Explore the Docs</strong> - Learn about streaming payments, escrow, and x402</li>
                  <li><strong style="color: #ffffff;">Get Your API Keys</strong> - Start integrating in minutes</li>
                  <li><strong style="color: #ffffff;">Join the Community</strong> - Connect with other builders</li>
                  <li><strong style="color: #ffffff;">Build Something Amazing</strong> - Your agents are waiting</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <a href="https://mnnr.app/docs/quick-start" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                Get Started →
              </a>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid rgba(107, 114, 128, 0.3); padding-top: 24px;">
              <p style="color: #6b7280; font-size: 12px; margin: 0; text-align: center;">
                You're receiving this because you signed up at mnnr.app<br>
                © 2025 MNNR. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

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
        console.log('Newsletter subscription note:', error.message);
      }
    }

    // Send welcome email via Resend
    try {
      const { data, error } = await resend.emails.send({
        from: 'MNNR <onboarding@resend.dev>',
        to: [normalizedEmail],
        subject: "Welcome to MNNR - Let's Build the Machine Economy! 🚀",
        html: getWelcomeEmailHtml(),
      });

      if (error) {
        console.error('Resend error:', error);
      } else {
        console.log('Welcome email sent:', data?.id);
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Still return success - email is captured even if welcome email fails
    }

    // Log for tracking
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
