import type { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import DocsLayout from '@/components/docs/DocsLayout';

export const metadata: Metadata = {
  title: 'Docs – MNNR',
  description: 'Documentation for MNNR: quick start, API, deployment, security, and enterprise guides.'
};

export default function DocsSectionLayout({ children }: PropsWithChildren) {
  return <DocsLayout>{children}</DocsLayout>;
}
