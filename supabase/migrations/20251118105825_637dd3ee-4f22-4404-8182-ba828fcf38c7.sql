-- Create function to reset progress tracking daily
CREATE OR REPLACE FUNCTION public.reset_progress_tracking_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  DELETE FROM public.progress_tracking;
END;
$function$;

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Unschedule existing job if it exists (to avoid duplicates)
SELECT cron.unschedule('reset-progress-tracking-midnight-cet') 
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'reset-progress-tracking-midnight-cet'
);

-- Schedule daily progress tracking reset at midnight CET (23:00 UTC during winter)
-- Note: During CEST (summer time), this will run at 01:00 instead of 00:00
SELECT cron.schedule(
  'reset-progress-tracking-midnight-cet',
  '0 23 * * *',
  $$
  SELECT public.reset_progress_tracking_cron();
  $$
);