/**
 * Swagger UI mounted at /docs/api-reference.
 *
 * Why nested under /docs:
 *   `/docs` is the existing marketing/links landing page (kept untouched).
 *   The interactive API explorer lives one level deeper so both work.
 *
 * Source spec: /openapi.json (served as a static asset out of /public).
 *
 * Why dynamic import + ssr:false:
 *   swagger-ui-react relies on browser-only globals. Dynamic-import keeps
 *   it client-only.
 *
 * Why this file is intentionally tiny:
 *   The spec (openapi.yaml / public/openapi.json) is the source of truth.
 *   Any change to documented routes should land in the spec — nothing
 *   about this file needs to be touched.
 */
'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiReference() {
  return (
    <main style={{ minHeight: '100vh', background: '#fafafa' }}>
      <SwaggerUI url="/openapi.json" docExpansion="list" deepLinking />
    </main>
  );
}
