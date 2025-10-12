-- Drop the old function
DROP FUNCTION IF EXISTS public.get_profiles_filtered();

-- Create optimized function with JOIN instead of subqueries
CREATE OR REPLACE FUNCTION public.get_profiles_filtered()
RETURNS TABLE(
  id uuid,
  name text,
  email text,
  profile_image_url text,
  created_at timestamp with time zone,
  total_points bigint,
  daily_points bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT 
    p.id,
    p.name,
    p.email,
    p.profile_image_url,
    p.created_at,
    COALESCE(SUM(CASE WHEN ca.created_at >= '2025-09-15' THEN a.points ELSE 0 END), 0) as total_points,
    COALESCE(SUM(CASE WHEN ca.created_at >= '2025-09-15' AND ca.date = CURRENT_DATE THEN a.points ELSE 0 END), 0) as daily_points
  FROM public.profiles p
  LEFT JOIN public.claimed_activities ca ON ca.user_id = p.id AND ca.created_at >= '2025-09-15'
  LEFT JOIN public.activities a ON ca.activity_id = a.id
  GROUP BY p.id, p.name, p.email, p.profile_image_url, p.created_at
  HAVING COUNT(ca.id) > 0
  ORDER BY total_points DESC, daily_points DESC;
$function$;

-- Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_claimed_activities_user_created 
ON public.claimed_activities(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_claimed_activities_date 
ON public.claimed_activities(date);