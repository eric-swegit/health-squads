-- Create gratitude_entries table
CREATE TABLE public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  claimed_activity_id UUID NOT NULL REFERENCES public.claimed_activities(id) ON DELETE CASCADE,
  gratitude_1 TEXT NOT NULL,
  gratitude_2 TEXT NOT NULL,
  gratitude_3 TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can insert their own gratitude entries"
  ON public.gratitude_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own gratitude entries"
  ON public.gratitude_entries FOR SELECT
  USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_gratitude_entries_user_id ON public.gratitude_entries(user_id);
CREATE INDEX idx_gratitude_entries_claimed_activity_id ON public.gratitude_entries(claimed_activity_id);

-- Insert the gratitude activity
INSERT INTO public.activities (name, points, requires_photo, type) 
VALUES ('Skriv ner 3 saker du är tacksam för idag', 1, false, 'common');