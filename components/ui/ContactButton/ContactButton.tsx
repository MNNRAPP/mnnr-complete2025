'use client';

import { useEffect, useState } from 'react';
import { analytics } from '@/providers/PostHogProvider';

interface ContactButtonProps {
  className?: string;
  children: React.ReactNode;
  source?: string;
}

export default function ContactButton({ className, children, source = 'unknown' }: ContactButtonProps) {
  const [mailtoLink, setMailtoLink] = useState('mailto:pilot@mnnr.app');

  useEffect(() => {
    // Generate mailto link with pre-filled fields
    const toEmail = 'pilot@mnnr.app';
    const subject = encodeURIComponent('MNNR Platform Support Request');
    
    // Get user context
    const currentPage = window.location.href;
    const browserInfo = navigator.userAgent;
    const timestamp = new Date().toISOString();
    
    const body = encodeURIComponent(`Hello MNNR Team,

I need assistance with the MNNR platform.

Details:
- Current Page: ${currentPage}
- Browser: ${browserInfo}
- Timestamp: ${timestamp}

Issue Description:
[Please describe your issue or question here]

Best regards`);

    const fullMailtoLink = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    setMailtoLink(fullMailtoLink);
  }, []);

  const handleClick = () => {
    // Track the contact request in analytics
    analytics.business.pilotContactRequested(source);
  };

  return (
    <a
      href={mailtoLink}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
    >
      {children}
    </a>
  );
}