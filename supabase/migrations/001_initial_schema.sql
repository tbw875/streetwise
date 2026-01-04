-- ============================================================================
-- STREETWISE DATABASE SCHEMA
-- Version: 1.0.0
-- Description: Complete database schema for Seattle transportation project tracker
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- User roles for access control
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

-- Source of the project data
CREATE TYPE project_source AS ENUM (
  'official_sdot',      -- Seattle DOT official project
  'official_wadot',     -- Washington State DOT project
  'user_suggestion'     -- Community submitted suggestion
);

-- Project lifecycle status
CREATE TYPE project_status AS ENUM (
  'proposed',           -- User suggestion, not yet reviewed
  'under_review',       -- Being evaluated by moderators/admins
  'planned',            -- Officially planned for implementation
  'in_progress',        -- Construction/implementation underway
  'completed',          -- Project finished
  'rejected',           -- Will not move forward
  'on_hold'             -- Temporarily paused
);

-- Types of important dates/milestones
CREATE TYPE date_type AS ENUM (
  'public_meeting',     -- Community meeting
  'comment_deadline',   -- Public comment period ends
  'construction_start', -- Work begins
  'construction_end',   -- Expected completion
  'council_vote',       -- City council decision
  'funding_deadline',   -- Grant or budget deadline
  'other'               -- Miscellaneous milestone
);

-- Geometry types for map rendering hints
CREATE TYPE geometry_type AS ENUM (
  'point',              -- Single location marker
  'line',               -- Street segment (future)
  'polygon'             -- Area (future)
);

-- Moderation action types for audit trail
CREATE TYPE mod_action_type AS ENUM (
  'delete_comment',
  'edit_comment',
  'hide_project',
  'unhide_project',
  'mark_duplicate',
  'change_status',
  'merge_projects'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS (extends Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ----------------------------------------------------------------------------
-- CATEGORIES
-- ----------------------------------------------------------------------------
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#6b7280', -- Hex color for UI
  icon TEXT, -- Lucide icon name
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default categories
INSERT INTO public.categories (name, slug, description, color, icon, display_order) VALUES
  ('Road Repair', 'road-repair', 'Potholes, paving, and road surface improvements', '#78716c', 'construction', 1),
  ('Bike Infrastructure', 'bike-infrastructure', 'Bike lanes, protected paths, and cycling facilities', '#22c55e', 'bike', 2),
  ('Pedestrian Safety', 'pedestrian-safety', 'Crosswalks, sidewalks, and pedestrian improvements', '#3b82f6', 'footprints', 3),
  ('Transit', 'transit', 'Bus stops, transit lanes, and public transportation', '#8b5cf6', 'bus', 4),
  ('Traffic Signals', 'traffic-signals', 'New signals, timing changes, and intersection improvements', '#f59e0b', 'traffic-cone', 5),
  ('Bridge & Structure', 'bridge-structure', 'Bridge repairs, overpasses, and structural work', '#64748b', 'landmark', 6),
  ('Accessibility', 'accessibility', 'ADA improvements, curb ramps, and accessible routes', '#06b6d4', 'accessibility', 7),
  ('Vision Zero', 'vision-zero', 'Safety corridor improvements and crash reduction', '#ef4444', 'shield-alert', 8),
  ('Other', 'other', 'Other transportation-related projects', '#6b7280', 'more-horizontal', 99);

-- ----------------------------------------------------------------------------
-- PROJECTS (core table for both official projects and suggestions)
-- ----------------------------------------------------------------------------
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT,
  
  -- Classification
  source project_source NOT NULL DEFAULT 'user_suggestion',
  status project_status NOT NULL DEFAULT 'proposed',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Location data
  geometry GEOGRAPHY(GEOMETRY, 4326), -- Supports point/line/polygon
  geometry_type geometry_type NOT NULL DEFAULT 'point',
  location_name TEXT, -- Human readable (e.g., "Aurora Ave N & N 85th St")
  affected_streets TEXT, -- For future line highlighting (e.g., "Aurora Ave N from N 85th St to N 145th St")
  neighborhood TEXT, -- Seattle neighborhood name
  
  -- External references (for official projects)
  external_id TEXT, -- SDOT project ID, etc.
  external_url TEXT, -- Link to official project page
  
  -- Engagement metrics (denormalized for performance)
  vote_score INT NOT NULL DEFAULT 0, -- Computed: upvotes - downvotes
  comment_count INT NOT NULL DEFAULT 0,
  follower_count INT NOT NULL DEFAULT 0,
  
  -- Metadata
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE, -- For moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_projects_source ON public.projects(source);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_category ON public.projects(category_id);
CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_projects_vote_score ON public.projects(vote_score DESC);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_geometry ON public.projects USING GIST(geometry);
CREATE INDEX idx_projects_hidden ON public.projects(is_hidden) WHERE is_hidden = FALSE;

-- Full text search index
CREATE INDEX idx_projects_search ON public.projects USING GIN(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(location_name, ''))
);

-- ----------------------------------------------------------------------------
-- PROJECT DATES (milestones and deadlines)
-- ----------------------------------------------------------------------------
CREATE TABLE public.project_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  
  date_type date_type NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT, -- Link to meeting info, etc.
  
  -- For recurring events
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  recurrence_rule TEXT, -- iCal RRULE format (future)
  
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_dates_project ON public.project_dates(project_id);
CREATE INDEX idx_project_dates_date ON public.project_dates(date);
CREATE INDEX idx_project_dates_type ON public.project_dates(date_type);
CREATE INDEX idx_project_dates_upcoming ON public.project_dates(date) WHERE date >= CURRENT_DATE;

-- ----------------------------------------------------------------------------
-- VOTES
-- ----------------------------------------------------------------------------
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)), -- -1 = downvote, 1 = upvote
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One vote per user per project
  UNIQUE(user_id, project_id)
);

-- Indexes
CREATE INDEX idx_votes_project ON public.votes(project_id);
CREATE INDEX idx_votes_user ON public.votes(user_id);

-- ----------------------------------------------------------------------------
-- COMMENTS (flat structure with optional parent for future threading)
-- ----------------------------------------------------------------------------
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- For future nested replies
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  
  content TEXT NOT NULL,
  
  -- Moderation
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Soft delete
  deleted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_project ON public.comments(project_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
CREATE INDEX idx_comments_created ON public.comments(created_at DESC);
CREATE INDEX idx_comments_not_deleted ON public.comments(project_id) WHERE is_deleted = FALSE;

-- ----------------------------------------------------------------------------
-- USER FOLLOWS (watch projects for updates)
-- ----------------------------------------------------------------------------
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, project_id)
);

-- Indexes
CREATE INDEX idx_follows_user ON public.user_follows(user_id);
CREATE INDEX idx_follows_project ON public.user_follows(project_id);

-- ----------------------------------------------------------------------------
-- MODERATION ACTIONS (audit trail)
-- ----------------------------------------------------------------------------
CREATE TABLE public.mod_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  moderator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  action mod_action_type NOT NULL,
  target_type TEXT NOT NULL, -- 'project', 'comment', etc.
  target_id UUID NOT NULL,
  
  reason TEXT,
  metadata JSONB, -- Additional context
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mod_actions_moderator ON public.mod_actions(moderator_id);
CREATE INDEX idx_mod_actions_target ON public.mod_actions(target_type, target_id);
CREATE INDEX idx_mod_actions_created ON public.mod_actions(created_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Auto-update updated_at timestamp
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_project_dates_updated_at
  BEFORE UPDATE ON public.project_dates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------------------
-- Update vote_score on projects when votes change
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_vote_score()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects
    SET vote_score = vote_score + NEW.value
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET vote_score = vote_score - OLD.value
    WHERE id = OLD.project_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.projects
    SET vote_score = vote_score - OLD.value + NEW.value
    WHERE id = NEW.project_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_votes_update_score
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_project_vote_score();

-- ----------------------------------------------------------------------------
-- Update comment_count on projects
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects
    SET comment_count = comment_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET comment_count = comment_count - 1
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_comments_update_count
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_project_comment_count();

-- ----------------------------------------------------------------------------
-- Update follower_count on projects
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_project_follower_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.projects
    SET follower_count = follower_count + 1
    WHERE id = NEW.project_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.projects
    SET follower_count = follower_count - 1
    WHERE id = OLD.project_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_follows_update_count
  AFTER INSERT OR DELETE ON public.user_follows
  FOR EACH ROW EXECUTE FUNCTION update_project_follower_count();

-- ----------------------------------------------------------------------------
-- Create profile on user signup
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mod_actions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES policies
-- ----------------------------------------------------------------------------
-- Everyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'user'); -- Can't self-promote

-- Admins can update any profile (including role changes)
CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- CATEGORIES policies
-- ----------------------------------------------------------------------------
-- Everyone can view categories
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

-- Only admins can modify categories
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- PROJECTS policies
-- ----------------------------------------------------------------------------
-- Everyone can view non-hidden projects
CREATE POLICY "Public projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (is_hidden = FALSE);

-- Moderators and admins can view hidden projects
CREATE POLICY "Mods can view hidden projects"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Authenticated users can create suggestions
CREATE POLICY "Authenticated users can create suggestions"
  ON public.projects FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND source = 'user_suggestion'
    AND created_by = auth.uid()
  );

-- Users can update their own suggestions (if still proposed)
CREATE POLICY "Users can update own proposed suggestions"
  ON public.projects FOR UPDATE
  USING (
    auth.uid() = created_by
    AND source = 'user_suggestion'
    AND status = 'proposed'
  );

-- Moderators and admins can update any project
CREATE POLICY "Mods can update any project"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Only admins can delete projects
CREATE POLICY "Admins can delete projects"
  ON public.projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create official projects
CREATE POLICY "Admins can create official projects"
  ON public.projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- PROJECT_DATES policies
-- ----------------------------------------------------------------------------
-- Everyone can view dates for visible projects
CREATE POLICY "Project dates are viewable"
  ON public.project_dates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id AND is_hidden = FALSE
    )
  );

-- Moderators and admins can manage dates
CREATE POLICY "Mods can manage project dates"
  ON public.project_dates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Project creators can add dates to their own suggestions
CREATE POLICY "Creators can add dates to own projects"
  ON public.project_dates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_id
        AND created_by = auth.uid()
        AND source = 'user_suggestion'
    )
  );

-- ----------------------------------------------------------------------------
-- VOTES policies
-- ----------------------------------------------------------------------------
-- Users can view their own votes
CREATE POLICY "Users can view own votes"
  ON public.votes FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can change their vote
CREATE POLICY "Users can update own vote"
  ON public.votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can remove their vote
CREATE POLICY "Users can delete own vote"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- COMMENTS policies
-- ----------------------------------------------------------------------------
-- Everyone can view non-deleted comments
CREATE POLICY "Comments are viewable"
  ON public.comments FOR SELECT
  USING (is_deleted = FALSE);

-- Moderators can view deleted comments
CREATE POLICY "Mods can view deleted comments"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Authenticated users can comment
CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can edit their own comments
CREATE POLICY "Users can edit own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Moderators can edit/soft-delete any comment
CREATE POLICY "Mods can moderate comments"
  ON public.comments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Only admins can hard delete
CREATE POLICY "Admins can delete comments"
  ON public.comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- USER_FOLLOWS policies
-- ----------------------------------------------------------------------------
-- Users can view their own follows
CREATE POLICY "Users can view own follows"
  ON public.user_follows FOR SELECT
  USING (auth.uid() = user_id);

-- Users can follow projects
CREATE POLICY "Users can follow projects"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can unfollow
CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- MOD_ACTIONS policies
-- ----------------------------------------------------------------------------
-- Only moderators and admins can view mod actions
CREATE POLICY "Mods can view mod actions"
  ON public.mod_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );

-- Moderators and admins can create mod actions
CREATE POLICY "Mods can create mod actions"
  ON public.mod_actions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
    AND moderator_id = auth.uid()
  );

-- ============================================================================
-- VIEWS (for convenience)
-- ============================================================================

-- Projects with upcoming deadlines
CREATE OR REPLACE VIEW public.projects_with_upcoming_dates AS
SELECT 
  p.*,
  pd.id AS next_date_id,
  pd.date AS next_date,
  pd.date_type AS next_date_type,
  pd.title AS next_date_title,
  CASE
    WHEN pd.date <= CURRENT_DATE + INTERVAL '7 days' THEN 'red'
    WHEN pd.date <= CURRENT_DATE + INTERVAL '14 days' THEN 'yellow'
    WHEN pd.date <= (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE THEN 'green'
    ELSE 'gray'
  END AS urgency_color
FROM public.projects p
LEFT JOIN LATERAL (
  SELECT id, date, date_type, title
  FROM public.project_dates
  WHERE project_id = p.id AND date >= CURRENT_DATE
  ORDER BY date ASC
  LIMIT 1
) pd ON true
WHERE p.is_hidden = FALSE;

-- ============================================================================
-- SEED DATA (Optional test data - remove in production)
-- ============================================================================

-- Uncomment below to add sample data for testing
/*
INSERT INTO public.projects (title, description, source, status, category_id, geometry, geometry_type, location_name, affected_streets, neighborhood)
SELECT
  'Aurora Ave Safety Improvements',
  'Comprehensive safety improvements along Aurora Ave N corridor including new crosswalks, improved lighting, and traffic calming measures.',
  'official_sdot',
  'in_progress',
  (SELECT id FROM public.categories WHERE slug = 'vision-zero'),
  ST_SetSRID(ST_MakePoint(-122.3472, 47.6838), 4326)::geography,
  'point',
  'Aurora Ave N & N 85th St',
  'Aurora Ave N from N 85th St to N 145th St',
  'Greenwood';
*/
