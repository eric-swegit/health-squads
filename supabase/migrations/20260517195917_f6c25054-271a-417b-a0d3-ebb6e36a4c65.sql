
UPDATE public.activities SET points = 3 WHERE id = '4a1cfeaa-4879-4e65-a600-cd1b87aaaed0';
UPDATE public.activities SET points = 4 WHERE id = '8c5fc434-578e-4e2d-91a4-7cbf9ef9abeb';
UPDATE public.activities SET name = 'Gör 10 situps' WHERE id = 'd9cf4ce0-ca37-4eb3-abd5-43a406e85eab';
UPDATE public.activities SET name = 'Borsta Zoes tänder' WHERE id = '2bd903e0-d6f0-4611-92a7-e8e90f8d9e23';
UPDATE public.activities SET name = 'Plocka undan kläder från golvet' WHERE id = '996516c9-a231-4495-8301-7ef1738a394c';
INSERT INTO public.activities (name, points, requires_photo, type, user_id) VALUES
  ('Köra en duolingo lektion', 1, false, 'personal', '46b71018-004a-416b-bf27-a898c04b1a4f'),
  ('Lära sig en ny random fakta', 1, false, 'personal', '46b71018-004a-416b-bf27-a898c04b1a4f');
