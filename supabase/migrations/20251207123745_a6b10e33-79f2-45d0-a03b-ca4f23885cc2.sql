-- Add gratitude_summary column to profiles table for caching AI-generated summaries
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gratitude_summary TEXT,
ADD COLUMN IF NOT EXISTS gratitude_summary_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS wrapped_generated_at TIMESTAMP WITH TIME ZONE;