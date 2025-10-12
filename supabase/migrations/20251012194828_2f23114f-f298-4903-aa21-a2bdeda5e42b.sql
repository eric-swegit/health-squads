-- Create RPC function to batch fetch likes summary
CREATE OR REPLACE FUNCTION public.get_likes_summary(ids uuid[], in_user uuid)
RETURNS TABLE (claimed_activity_id uuid, likes_count integer, user_liked boolean)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    l.claimed_activity_id,
    COUNT(*)::int AS likes_count,
    BOOL_OR(l.user_id = in_user) AS user_liked
  FROM public.likes l
  WHERE l.claimed_activity_id = ANY(ids)
  GROUP BY l.claimed_activity_id;
$$;

-- Create RPC function to batch fetch comments summary
CREATE OR REPLACE FUNCTION public.get_comments_summary(ids uuid[])
RETURNS TABLE (claimed_activity_id uuid, comments_count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    c.claimed_activity_id,
    COUNT(*)::int AS comments_count
  FROM public.comments c
  WHERE c.claimed_activity_id = ANY(ids)
  GROUP BY c.claimed_activity_id;
$$;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_claimed_activities_created_at ON public.claimed_activities (created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_likes_claimed_activity ON public.likes (claimed_activity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique ON public.likes (user_id, claimed_activity_id);
CREATE INDEX IF NOT EXISTS idx_comments_claimed_activity ON public.comments (claimed_activity_id, created_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comment_likes_unique ON public.comment_likes (user_id, comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes (comment_id);