// /security/sbom.cdx.json — Next.js App Router handler
//
// Purpose: Serve the canonical CycloneDX 1.5 SBOM at the URL promised by
//          /.well-known/ucp ("sbom_url": "https://mnnr.app/security/sbom.cdx.json").
//          The path was previously returning the SPA HTML fallback per the
//          2026-06-20 free pre-audit security sweep (App-surface gap A-2).
//
// Source artifact: public/sbom.cdx.json (regenerate via `syft dir:. -o cyclonedx-json > public/sbom.cdx.json`)
// CI: see .github/workflows/sbom.yml
// Companion route: app/sbom.cdx.json/route.ts (same body, root alias)

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
