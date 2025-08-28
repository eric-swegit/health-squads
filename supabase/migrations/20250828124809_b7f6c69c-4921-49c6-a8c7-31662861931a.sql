-- Create filtered profiles function that only includes users active after 2025-08-27
-- and only counts points from activities after that date
CREATE OR REPLACE FUNCTION public.get_profiles_filtered()
RETURNS TABLE (
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
  SELECT DISTINCT
    p.id,
    p.name,
    p.email,
    p.profile_image_url,
    p.created_at,
    -- Calculate total points only from activities after 2025-08-27
    COALESCE(
      (SELECT SUM(a.points)
       FROM public.claimed_activities ca
       JOIN public.activities a ON ca.activity_id = a.id
       WHERE ca.user_id = p.id 
       AND ca.created_at >= '2025-08-27'::date),
      0
    ) as total_points,
    -- Calculate daily points only from today's activities after 2025-08-27
    COALESCE(
      (SELECT SUM(a.points)
       FROM public.claimed_activities ca
       JOIN public.activities a ON ca.activity_id = a.id
       WHERE ca.user_id = p.id 
       AND ca.created_at >= '2025-08-27'::date
       AND ca.date = CURRENT_DATE),
      0
    ) as daily_points
  FROM public.profiles p
  WHERE EXISTS (
    -- Only include users who have at least one activity after 2025-08-27
    SELECT 1 FROM public.claimed_activities ca
    WHERE ca.user_id = p.id 
    AND ca.created_at >= '2025-08-27'::date
  )
  ORDER BY total_points DESC, daily_points DESC;
$function$