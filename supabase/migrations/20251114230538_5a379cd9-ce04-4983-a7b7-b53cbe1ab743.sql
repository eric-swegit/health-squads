-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily points reset at midnight CET (23:00 UTC during winter, 22:00 UTC during summer)
-- Using 23:00 UTC which corresponds to 00:00 CET (winter time)
-- Note: During CEST (summer time), this will run at 01:00 instead of 00:00
SELECT cron.schedule(
  'reset-daily-points-midnight-cet',
  '0 23 * * *', -- Every day at 23:00 UTC (midnight CET)
  $$
  SELECT public.reset_daily_points_cron();
  $$
);