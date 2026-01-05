-- ============================================================================
-- SEED SAMPLE PROJECTS
-- Version: 1.0.0
-- Description: Adds 3 sample Seattle transportation projects for testing
-- ============================================================================

-- Insert 3 sample projects with realistic Seattle data

-- Project 1: RapidRide J Line (Official SDOT, In Progress)
INSERT INTO public.projects (
  title,
  description,
  source,
  status,
  category_id,
  geometry,
  geometry_type,
  location_name,
  affected_streets,
  neighborhood,
  external_id,
  external_url,
  vote_score,
  comment_count
) VALUES (
  'RapidRide J Line - Roosevelt to Downtown',
  'The RapidRide J Line is a new transit corridor connecting Roosevelt Station to downtown Seattle via Eastlake Ave E. This project includes bus-only lanes, queue jumps, upgraded stations with real-time arrival information, and improved pedestrian connections. The J Line will provide faster, more reliable transit service with buses arriving every 10 minutes during peak hours.',
  'official_sdot',
  'in_progress',
  (SELECT id FROM public.categories WHERE slug = 'transit'),
  ST_GeomFromText('POINT(-122.3250 47.6435)', 4326), -- Eastlake Ave E & E Newton St
  'point',
  'Eastlake Ave E & E Newton St',
  'Eastlake Ave E from NE 65th St to Stewart St',
  'Eastlake',
  'SDOT-2023-J-LINE',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/transit-program/transit-plus-multimodal-corridor-program/rapidride-j-line',
  127,
  23
);

-- Project 2: Beacon Hill Protected Bike Lane (Official SDOT, Completed)
INSERT INTO public.projects (
  title,
  description,
  source,
  status,
  category_id,
  geometry,
  geometry_type,
  location_name,
  affected_streets,
  neighborhood,
  external_id,
  external_url,
  vote_score,
  comment_count
) VALUES (
  'Beacon Hill Protected Bike Lane',
  'A recently completed protected bike lane connecting 15th Ave S to Beacon Ave S in the Beacon Hill neighborhood. This project provides safer cycling infrastructure with physical separation from vehicle traffic, improved intersection crossings, and new bike-friendly traffic signals. The lane serves as a vital east-west connection for cyclists in South Seattle.',
  'official_sdot',
  'completed',
  (SELECT id FROM public.categories WHERE slug = 'bike-infrastructure'),
  ST_GeomFromText('POINT(-122.3122 47.5764)', 4326), -- 15th Ave S & S Beacon St area
  'point',
  '15th Ave S & S Beacon St',
  '15th Ave S to Beacon Ave S',
  'Beacon Hill',
  'SDOT-2024-BEACON-BIKE',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/bike-program/protected-bike-lanes',
  156,
  31
);

-- Project 3: NW 83rd St Pedestrian Crossing (User Suggestion, Proposed)
INSERT INTO public.projects (
  title,
  description,
  source,
  status,
  category_id,
  geometry,
  geometry_type,
  location_name,
  affected_streets,
  neighborhood,
  vote_score,
  comment_count
) VALUES (
  'Painted Crosswalk at NW 83rd St & 8th Ave NW',
  'Install a painted crosswalk with warning signs at the intersection of NW 83rd St and 8th Ave NW. This busy intersection lacks marked pedestrian crossings, forcing residents to cross unmarked roadways. Adding high-visibility crosswalk markings and "Stop for Pedestrians" warning signs would significantly improve safety for people walking in the neighborhood, especially children walking to nearby schools.',
  'user_suggestion',
  'proposed',
  (SELECT id FROM public.categories WHERE slug = 'pedestrian-safety'),
  ST_GeomFromText('POINT(-122.3660 47.6910)', 4326), -- NW 83rd St & 8th Ave NW
  'point',
  'NW 83rd St & 8th Ave NW',
  'NW 83rd St at 8th Ave NW',
  'Crown Hill',
  42,
  8
);

-- Add upcoming project dates for RapidRide J Line
INSERT INTO public.project_dates (
  project_id,
  date_type,
  date,
  title,
  description,
  url
) VALUES
-- Public meeting next week
(
  (SELECT id FROM public.projects WHERE external_id = 'SDOT-2023-J-LINE'),
  'public_meeting',
  CURRENT_DATE + INTERVAL '9 days',
  'RapidRide J Line Community Open House',
  'Join SDOT staff to learn about construction progress, upcoming work, and ask questions about the RapidRide J Line project. Light refreshments provided.',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/transit-program/transit-plus-multimodal-corridor-program/rapidride-j-line'
),
-- Comment deadline this week
(
  (SELECT id FROM public.projects WHERE external_id = 'SDOT-2023-J-LINE'),
  'comment_deadline',
  CURRENT_DATE + INTERVAL '5 days',
  'Public Comment Period Closes',
  'Last day to submit comments on proposed bus stop locations and station amenities. Your feedback helps shape the final design.',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/transit-program/transit-plus-multimodal-corridor-program/rapidride-j-line'
),
-- Construction milestone next month
(
  (SELECT id FROM public.projects WHERE external_id = 'SDOT-2023-J-LINE'),
  'construction_start',
  CURRENT_DATE + INTERVAL '35 days',
  'Eastlake Station Construction Begins',
  'Construction begins on the Eastlake Ave station platform and passenger amenities. Expect temporary lane closures and detours in the area.',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/transit-program/transit-plus-multimodal-corridor-program/rapidride-j-line'
),
-- Expected completion
(
  (SELECT id FROM public.projects WHERE external_id = 'SDOT-2023-J-LINE'),
  'construction_end',
  CURRENT_DATE + INTERVAL '180 days',
  'RapidRide J Line Opening Day',
  'Anticipated opening date for RapidRide J Line service. Exact date subject to change based on construction progress.',
  'https://www.seattle.gov/transportation/projects-and-programs/programs/transit-program/transit-plus-multimodal-corridor-program/rapidride-j-line'
);
