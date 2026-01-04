/**
 * Database types for Streetwise
 * 
 * These types mirror the Supabase schema.
 * Run `npm run db:types` to regenerate from live database.
 */

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'admin';

export type ProjectSource = 'official_sdot' | 'official_wadot' | 'user_suggestion';

export type ProjectStatus = 
  | 'proposed'
  | 'under_review'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'rejected'
  | 'on_hold';

export type DateType = 
  | 'public_meeting'
  | 'comment_deadline'
  | 'construction_start'
  | 'construction_end'
  | 'council_vote'
  | 'funding_deadline'
  | 'other';

export type GeometryType = 'point' | 'line' | 'polygon';

export type ModActionType = 
  | 'delete_comment'
  | 'edit_comment'
  | 'hide_project'
  | 'unhide_project'
  | 'mark_duplicate'
  | 'change_status'
  | 'merge_projects';

export type UrgencyColor = 'red' | 'yellow' | 'green' | 'gray';

// ============================================================================
// DATABASE TABLES
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  display_order: number;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  source: ProjectSource;
  status: ProjectStatus;
  category_id: string | null;
  geometry: GeoJSON.Geometry | null;
  geometry_type: GeometryType;
  location_name: string | null;
  affected_streets: string | null;
  neighborhood: string | null;
  external_id: string | null;
  external_url: string | null;
  vote_score: number;
  comment_count: number;
  follower_count: number;
  created_by: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectDate {
  id: string;
  project_id: string;
  date_type: DateType;
  date: string; // ISO date string
  title: string;
  description: string | null;
  url: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  user_id: string;
  project_id: string;
  value: -1 | 1;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFollow {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
}

export interface ModAction {
  id: string;
  moderator_id: string;
  action: ModActionType;
  target_type: string;
  target_id: string;
  reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ============================================================================
// JOINED/EXTENDED TYPES
// ============================================================================

export interface ProjectWithCategory extends Project {
  category: Category | null;
}

export interface ProjectWithDetails extends ProjectWithCategory {
  creator: Profile | null;
  next_date: ProjectDate | null;
  urgency_color: UrgencyColor | null;
  user_vote?: Vote | null;
  is_following?: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: Profile;
}

export interface ProjectDateWithUrgency extends ProjectDate {
  urgency_color: UrgencyColor;
}

// ============================================================================
// API/FORM TYPES
// ============================================================================

export interface CreateProjectInput {
  title: string;
  description?: string;
  category_id?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  affected_streets?: string;
  neighborhood?: string;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  category_id?: string;
  location_name?: string;
  affected_streets?: string;
  neighborhood?: string;
  external_id?: string;
  external_url?: string;
  is_hidden?: boolean;
}

export interface CreateProjectDateInput {
  project_id: string;
  date_type: DateType;
  date: string;
  title: string;
  description?: string;
  url?: string;
}

export interface CreateCommentInput {
  project_id: string;
  content: string;
  parent_id?: string;
}

// ============================================================================
// MAP TYPES
// ============================================================================

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  status: ProjectStatus;
  source: ProjectSource;
  category_color: string;
  urgency_color?: UrgencyColor;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ProjectFilters {
  search?: string;
  source?: ProjectSource[];
  status?: ProjectStatus[];
  category_id?: string[];
  neighborhood?: string[];
  has_upcoming_date?: boolean;
  urgency?: UrgencyColor[];
  sort_by?: 'newest' | 'oldest' | 'most_votes' | 'most_comments' | 'upcoming_date';
}

// ============================================================================
// SUPABASE DATABASE TYPE (for client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      projects: {
        Row: Project;
        Insert: Omit<Project, 'id' | 'vote_score' | 'comment_count' | 'follower_count' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Project, 'id' | 'created_at'>>;
      };
      project_dates: {
        Row: ProjectDate;
        Insert: Omit<ProjectDate, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProjectDate, 'id' | 'created_at'>>;
      };
      votes: {
        Row: Vote;
        Insert: Omit<Vote, 'id' | 'created_at'>;
        Update: Partial<Omit<Vote, 'id' | 'created_at'>>;
      };
      comments: {
        Row: Comment;
        Insert: Omit<Comment, 'id' | 'is_edited' | 'is_deleted' | 'deleted_at' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>;
      };
      user_follows: {
        Row: UserFollow;
        Insert: Omit<UserFollow, 'id' | 'created_at'>;
        Update: never;
      };
      mod_actions: {
        Row: ModAction;
        Insert: Omit<ModAction, 'id' | 'created_at'>;
        Update: never;
      };
    };
    Enums: {
      user_role: UserRole;
      project_source: ProjectSource;
      project_status: ProjectStatus;
      date_type: DateType;
      geometry_type: GeometryType;
      mod_action_type: ModActionType;
    };
  };
}
