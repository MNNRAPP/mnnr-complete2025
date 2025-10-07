'use client';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error('Global error boundary triggered', error);
  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '28rem',
            padding: '2rem',
            textAlign: 'center',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            backgroundColor: '#fef2f2'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7f1d1d', marginBottom: '1rem' }}>
              Something went wrong!
            </h2>
            <p style={{ color: '#b91c1c', marginBottom: '1.5rem' }}>
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
