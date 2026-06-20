// /sbom.cdx.json — root-alias Next.js App Router handler
//
// Purpose: Mirror of /security/sbom.cdx.json at the bare root path so
//          consumers that probe `/sbom.cdx.json` directly (per common
//          SBOM-discovery conventions) get the same payload without a
//          redirect. Closes app-surface gap A-2a in the 2026-06-20 free
//          pre-audit security sweep.
//
// Canonical source: public/sbom.cdx.json
// Canonical URL:    https://mnnr.app/security/sbom.cdx.json

import { NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const dynamic = 'force-static';
export const revalidate = 86400; // 24h

export async function GET() {
  try {
    const path = join(process.cwd(), 'public', 'sbom.cdx.json');
    const body = await readFile(path, 'utf-8');
    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': 'application/vnd.cyclonedx+json; version=1.5',
        'cache-control': 'public, max-age=86400, immutable',
        'x-content-type-options': 'nosniff',
        'access-control-allow-origin': '*',
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        error: 'SBOM not yet published',
        regenerate:
          'syft dir:. -o cyclonedx-json > public/sbom.cdx.json',
      },
      {
        status: 503,
        headers: { 'x-content-type-options': 'nosniff' },
      }
    );
  }
}
