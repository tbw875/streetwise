-- ============================================================================
-- FIX RAPIDRIDE J LOCATION
-- Version: 1.0.0
-- Description: Updates RapidRide J coordinates to correct Eastlake & Newton St
-- ============================================================================

-- Update RapidRide J Line to correct coordinates
UPDATE public.projects
SET geometry = ST_GeomFromText('POINT(-122.3250 47.6435)', 4326)
WHERE external_id = 'SDOT-2023-J-LINE';
