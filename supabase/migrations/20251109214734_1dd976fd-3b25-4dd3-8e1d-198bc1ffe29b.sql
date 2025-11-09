-- Add photo_metadata column to claimed_activities for storing EXIF data
ALTER TABLE public.claimed_activities 
ADD COLUMN photo_metadata JSONB;