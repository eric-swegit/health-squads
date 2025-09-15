-- Reset all user points to 0
UPDATE public.profiles SET total_points = 0, daily_points = 0;

-- Update the get_profiles_filtered function to use 2025-09-15 as cutoff date
CREATE OR REPLACE FUNCTION public.get_profiles_filtered()
RETURNS TABLE(id uuid, name text, email text, profile_image_url text, created_at timestamp with time zone, total_points bigint, daily_points bigint)
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
    -- Calculate total points only from activities after 2025-09-15
    COALESCE(
      (SELECT SUM(a.points)
       FROM public.claimed_activities ca
       JOIN public.activities a ON ca.activity_id = a.id
       WHERE ca.user_id = p.id 
       AND ca.created_at >= '2025-09-15'::date),
      0
    ) as total_points,
    -- Calculate daily points only from today's activities after 2025-09-15
    COALESCE(
      (SELECT SUM(a.points)
       FROM public.claimed_activities ca
       JOIN public.activities a ON ca.activity_id = a.id
       WHERE ca.user_id = p.id 
       AND ca.created_at >= '2025-09-15'::date
       AND ca.date = CURRENT_DATE),
      0
    ) as daily_points
  FROM public.profiles p
  WHERE EXISTS (
    -- Only include users who have at least one activity after 2025-09-15
    SELECT 1 FROM public.claimed_activities ca
    WHERE ca.user_id = p.id 
    AND ca.created_at >= '2025-09-15'::date
  )
  ORDER BY total_points DESC, daily_points DESC;
$function$;

-- Hide 20000 steg activity (assuming it exists)
UPDATE public.activities 
SET name = 'HIDDEN_20000_steg' 
WHERE name = '20000 steg';

-- Update 5000 steg to give 2 points
UPDATE public.activities 
SET points = 2 
WHERE name = '5000 steg';

-- Update 10000 steg to give 4 points  
UPDATE public.activities 
SET points = 4 
WHERE name = '10000 steg';