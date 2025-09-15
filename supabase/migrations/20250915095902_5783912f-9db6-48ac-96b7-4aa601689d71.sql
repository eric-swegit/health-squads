-- Fix activity names and points based on user feedback
-- Hide 20K steg activity
UPDATE public.activities 
SET name = 'HIDDEN_20K_steg' 
WHERE name = '20K steg';

-- Update 5K steg to give 2 points
UPDATE public.activities 
SET points = 2 
WHERE name = '5K steg';

-- Update 10K steg to give 4 points  
UPDATE public.activities 
SET points = 4 
WHERE name = '10K steg';