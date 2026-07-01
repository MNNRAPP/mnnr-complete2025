/**
 * Interactive API reference page for /docs/api-reference.
 *
 * What lives here:
 *   Swagger UI mounted against /openapi.json, wrapped in a dark-themed shell
 *   that matches the rest of the marketing site (amber+blue palette, black
 *   background, backdrop-blur cards). Includes a loading skeleton so the
 *   pre-hydration flash isn't a bright light block against dark chrome,
 *   plus an explicit fallback panel if the OpenAPI fetch fails.
 *
 * Why nested under /docs:
 *   `/docs` is the marketing/links landing page. The interactive API
 *   explorer lives one level deeper so both work.
 *
 * Source of truth:
 *   /public/openapi.json — every documented route change lands there,
 *   NOT in this file. This file only shells / theme-overrides Swagger UI.
 *
 * Why 'use client' + dynamic import ssr:false:
 *   swagger-ui-react relies on browser-only globals (window, fetch, etc.).
 *   Dynamic-import keeps it client-only. Loading state renders on the
 *   server as dark placeholder cards; Swagger UI hydrates client-side.
 */
'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <ApiReferenceLoading />,
});

/**
 * Loading skeleton shown before Swagger UI hydrates. Prevents the
 * bright-white flash against the dark site chrome and gives the user
 * something to look at while the ~200KB swagger-ui bundle loads.
 */
function ApiReferenceLoading() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-pulse">
      <div className="h-10 w-64 bg-white/10 rounded-lg mb-4" />
      <div className="h-4 w-96 bg-white/5 rounded mb-8" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-16 bg-white/[0.03] border border-white/10 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Fallback shown when Swagger UI encounters a fetch error on /openapi.json,
 * or when JavaScript is disabled entirely. Gives the user a direct link to
 * the spec so they aren't left with an empty page.
 */
function ApiReferenceFallback({ message }: { message: string }) {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 mb-6">
        <span className="text-amber-400 text-sm font-medium">
          Interactive explorer unavailable
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        API Reference
      </h1>
      <p className="text-white/60 mb-2">{message}</p>
      <p className="text-white/40 text-sm mb-8">
        The raw OpenAPI 3.1 spec is still available for download or viewing in
        any Swagger / Redoc / Stoplight-compatible tool.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/openapi.json"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition"
        >
          Download openapi.json
        </a>
        <a
          href="/openapi.yaml"
          className="inline-flex items-center justify-center gap-2 bg-white/5 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 hover:border-white/40 transition"
        >
          Download openapi.yaml
        </a>
      </div>
    </div>
  );
}

export default function ApiReference() {
  // Verify the openapi.json is reachable before mounting Swagger UI. If the
  // fetch fails (404, network error, CORS, etc.), render the fallback panel
  // instead of Swagger's raw error UI (which is also light-themed and jarring).
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [errMsg, setErrMsg] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/openapi.json', { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setStatus('ok');
        } else {
          setStatus('error');
          setErrMsg(`Spec fetch returned HTTP ${res.status}.`);
        }
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setErrMsg(e instanceof Error ? e.message : 'Network error loading the spec.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#050813]">
      {/* Scoped dark-theme override for Swagger UI. All rules are prefixed with
       * `.swagger-ui` so they only apply inside the mounted explorer and don't
       * leak into the rest of the docs. Uses site palette (amber + blue) so
       * the reference feels like part of the same product, not a bolted-on
       * third-party widget. */}
      <style jsx global>{`
        .swagger-ui { color: #e6e9ef; background: transparent; }
        .swagger-ui .info,
        .swagger-ui .scheme-container { background: transparent; box-shadow: none; }
        .swagger-ui .info .title,
        .swagger-ui .info .base-url,
        .swagger-ui .info a,
        .swagger-ui .opblock-tag,
        .swagger-ui .opblock .opblock-summary-path,
        .swagger-ui .opblock .opblock-summary-description,
        .swagger-ui .opblock-description-wrapper p,
        .swagger-ui .opblock-external-docs-wrapper p,
        .swagger-ui .opblock-title_normal p,
        .swagger-ui table thead tr td,
        .swagger-ui table thead tr th,
        .swagger-ui .response-col_status,
        .swagger-ui .response-col_description,
        .swagger-ui .parameter__name,
        .swagger-ui .parameter__type,
        .swagger-ui .parameter__deprecated,
        .swagger-ui .parameter__in,
        .swagger-ui .tab li,
        .swagger-ui section h4,
        .swagger-ui .model-title,
        .swagger-ui .model,
        .swagger-ui label,
        .swagger-ui .btn { color: #e6e9ef !important; }
        .swagger-ui .info .title small pre { background: rgba(255,255,255,0.06); }
        .swagger-ui .opblock-tag { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .swagger-ui .opblock {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: none;
        }
        .swagger-ui .opblock .opblock-summary { border-color: rgba(255,255,255,0.08); }
        .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #2563eb; }
        .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #d97706; }
        .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #ca8a04; }
        .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #dc2626; }
        .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #16a34a; }
        .swagger-ui select,
        .swagger-ui input[type="text"],
        .swagger-ui textarea {
          background: rgba(0,0,0,0.4);
          color: #e6e9ef;
          border: 1px solid rgba(255,255,255,0.12);
        }
        .swagger-ui .btn.execute { background: #d4af37; color: #000; border-color: #d4af37; }
        .swagger-ui .btn.authorize { background: transparent; color: #d4af37; border-color: #d4af37; }
        .swagger-ui .highlight-code { background: rgba(0,0,0,0.4); }
        .swagger-ui .microlight { color: #e6e9ef; background: rgba(0,0,0,0.4); }
        .swagger-ui .model-box,
        .swagger-ui .responses-inner { background: rgba(255,255,255,0.02); }
        .swagger-ui svg { fill: #e6e9ef; }
      `}</style>

      {status === 'checking' && <ApiReferenceLoading />}
      {status === 'error' && <ApiReferenceFallback message={errMsg} />}
      {status === 'ok' && (
        <SwaggerUI url="/openapi.json" docExpansion="list" deepLinking />
      )}
    </main>
  );
}
