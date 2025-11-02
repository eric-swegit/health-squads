-- Update the get_profiles_filtered function to only show activities after 2025-11-02
CREATE OR REPLACE FUNCTION public.get_profiles_filtered()
 RETURNS TABLE(id uuid, name text, email text, profile_image_url text, created_at timestamp with time zone, total_points bigint, daily_points bigint)
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
    COALESCE(SUM(CASE WHEN ca.created_at >= '2025-11-02' THEN a.points ELSE 0 END), 0) as total_points,
    COALESCE(SUM(CASE WHEN ca.created_at >= '2025-11-02' AND ca.date = CURRENT_DATE THEN a.points ELSE 0 END), 0) as daily_points
  FROM public.profiles p
  LEFT JOIN public.claimed_activities ca ON ca.user_id = p.id AND ca.created_at >= '2025-11-02'
  LEFT JOIN public.activities a ON ca.activity_id = a.id
  GROUP BY p.id, p.name, p.email, p.profile_image_url, p.created_at
  HAVING COUNT(ca.id) > 0
  ORDER BY total_points DESC, daily_points DESC;
$function$;