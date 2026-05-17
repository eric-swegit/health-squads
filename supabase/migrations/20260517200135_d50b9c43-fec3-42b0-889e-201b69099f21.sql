
UPDATE public.profiles p SET 
  total_points = COALESCE((SELECT SUM(a.points) FROM public.claimed_activities ca JOIN public.activities a ON a.id=ca.activity_id WHERE ca.user_id=p.id),0),
  daily_points = COALESCE((SELECT SUM(a.points) FROM public.claimed_activities ca JOIN public.activities a ON a.id=ca.activity_id WHERE ca.user_id=p.id AND ca.date=CURRENT_DATE),0);
