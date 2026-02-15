'use client';

import { useEffect, useState } from 'react';
import { getStripe } from '@/utils/stripe/client';

interface PaymentConfirmationProps {
  clientSecret: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  returnUrl?: string;
}

/**
 * PaymentConfirmation handles 3D Secure / SCA authentication.
 *
 * When a subscription or payment requires additional authentication
 * (e.g., 3D Secure), pass the clientSecret from the PaymentIntent
 * and this component will invoke Stripe's confirmation flow.
 */
export default function PaymentConfirmation({
  clientSecret,
  onSuccess,
  onError,
  returnUrl,
}: PaymentConfirmationProps) {
  const [status, setStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!clientSecret) return;

    async function confirmPayment() {
      setStatus('processing');

      try {
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          return_url: returnUrl || window.location.href,
        });

        if (error) {
          setStatus('failed');
          const msg = error.message || 'Payment confirmation failed';
          setErrorMessage(msg);
          onError?.(msg);
        } else if (paymentIntent?.status === 'succeeded') {
          setStatus('succeeded');
          onSuccess?.();
        } else if (paymentIntent?.status === 'requires_action') {
          // Stripe will handle the redirect for 3DS — this state means
          // the popup/redirect was shown but the user hasn't completed it yet
          setStatus('processing');
        } else {
          setStatus('processing');
        }
      } catch (err) {
        setStatus('failed');
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
        setErrorMessage(msg);
        onError?.(msg);
      }
    }

    confirmPayment();
  }, [clientSecret, returnUrl, onSuccess, onError]);

  if (status === 'idle') return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {status === 'processing' && (
        <>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          <p className="text-gray-300">Confirming your payment...</p>
          <p className="text-gray-500 text-sm">
            You may be redirected to your bank for additional verification.
          </p>
        </>
      )}
      {status === 'succeeded' && (
        <>
          <div className="text-emerald-500 text-4xl">&#10003;</div>
          <p className="text-white font-semibold">Payment confirmed!</p>
        </>
      )}
      {status === 'failed' && (
        <>
          <div className="text-red-500 text-4xl">&#10007;</div>
          <p className="text-white font-semibold">Payment failed</p>
          {errorMessage && (
            <p className="text-red-400 text-sm">{errorMessage}</p>
          )}
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}
