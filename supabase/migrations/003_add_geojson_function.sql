-- ============================================================================
-- ADD GEOJSON CONVERSION FUNCTION
-- Version: 1.0.0
-- Description: Creates RPC function to return projects with GeoJSON geometry
-- ============================================================================

CREATE OR REPLACE FUNCTION get_projects_with_geojson()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  source project_source,
  status project_status,
  geometry TEXT,
  geometry_type geometry_type,
  location_name TEXT,
  vote_score INT,
  comment_count INT,
  category JSONB
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    p.id,
    p.title,
    p.description,
    p.source,
    p.status,
    ST_AsGeoJSON(p.geometry)::TEXT as geometry,
    p.geometry_type,
    p.location_name,
    p.vote_score,
    p.comment_count,
    jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'color', c.color,
      'icon', c.icon
    ) as category
  FROM public.projects p
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE p.is_hidden = false
  ORDER BY p.created_at DESC;
$$;
