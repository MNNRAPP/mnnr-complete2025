-- PAY-020: Stripe Events Idempotency Table
-- This table stores processed Stripe event IDs to prevent duplicate processing

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  event_type TEXT,
  processed_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_events_created_at ON public.stripe_events(created_at DESC);

-- Enable RLS (locked down - only service role can write)
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Policy: Service role only (no public access)
CREATE POLICY "Service role only" ON public.stripe_events
  USING (false);

-- Retention: Auto-delete events older than 90 days
-- (Keep for audit/debugging purposes, then clean up)
CREATE OR REPLACE FUNCTION cleanup_old_stripe_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.stripe_events
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Optional: Create a scheduled job to run cleanup monthly
-- This requires pg_cron extension (enable in Supabase dashboard if needed)
-- SELECT cron.schedule('cleanup-stripe-events', '0 0 1 * *', 'SELECT cleanup_old_stripe_events()');

COMMENT ON TABLE public.stripe_events IS 'Stores processed Stripe webhook event IDs for idempotency checking';
COMMENT ON COLUMN public.stripe_events.id IS 'Stripe event ID (evt_...)';
COMMENT ON COLUMN public.stripe_events.event_type IS 'Type of Stripe event (e.g., customer.subscription.created)';
COMMENT ON COLUMN public.stripe_events.processed_at IS 'When the event was successfully processed';
