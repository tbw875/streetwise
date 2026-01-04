# Database Schema

## Overview
Streetwise uses Supabase (PostgreSQL) with PostGIS extension for spatial queries.

## Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────────┐       ┌─────────────────┐
│     profiles    │       │      projects       │       │   categories    │
├─────────────────┤       ├─────────────────────┤       ├─────────────────┤
│ id (PK, FK)     │──┐    │ id (PK)             │    ┌──│ id (PK)         │
│ email           │  │    │ title               │    │  │ name            │
│ display_name    │  │    │ description         │    │  │ slug            │
│ avatar_url      │  │    │ source              │    │  │ color           │
│ role            │  │    │ status              │    │  │ icon            │
│ bio             │  │    │ category_id (FK)────│────┘  │ display_order   │
│ created_at      │  │    │ geometry            │       │ created_at      │
│ updated_at      │  └────│ created_by (FK)     │       └─────────────────┘
└─────────────────┘       │ vote_score          │
       │                  │ comment_count       │       ┌─────────────────┐
       │                  │ follower_count      │       │  project_dates  │
       │                  │ is_hidden           │       ├─────────────────┤
       │                  │ created_at          │    ┌──│ id (PK)         │
       │                  │ updated_at          │    │  │ project_id (FK) │──┐
       │                  └─────────────────────┘    │  │ date_type       │  │
       │                           │                 │  │ date            │  │
       ▼                           ▼                 │  │ title           │  │
┌─────────────────┐       ┌─────────────────────┐    │  │ description     │  │
│     votes       │       │      comments       │    │  │ url             │  │
├─────────────────┤       ├─────────────────────┤    │  │ created_at      │  │
│ id (PK)         │       │ id (PK)             │    │  └─────────────────┘  │
│ user_id (FK)────│───────│ project_id (FK)─────│────┴───────────────────────┘
│ project_id (FK) │───────│ user_id (FK)        │
│ value (+1/-1)   │       │ parent_id (FK,self) │
│ created_at      │       │ content             │
│ UNIQUE(user,prj)│       │ is_edited           │
└─────────────────┘       │ is_deleted          │
                          │ created_at          │
                          │ updated_at          │
                          └─────────────────────┘
```

## Enums

### user_role
- `user` - Regular authenticated user
- `moderator` - Can manage content
- `admin` - Full system access

### project_source
- `official_sdot` - Seattle DOT project
- `official_wadot` - Washington State DOT project
- `user_suggestion` - Community submitted

### project_status
- `proposed` - Initial suggestion state
- `under_review` - Being evaluated
- `planned` - Approved for implementation
- `in_progress` - Currently being built
- `completed` - Finished
- `rejected` - Will not proceed
- `on_hold` - Temporarily paused

### date_type
- `public_meeting` - Community meeting
- `comment_deadline` - Public comment closes
- `construction_start` - Work begins
- `construction_end` - Expected completion
- `council_vote` - City council decision
- `funding_deadline` - Grant/budget deadline
- `other` - Miscellaneous

### geometry_type
- `point` - Single marker (MVP)
- `line` - Street segment (future)
- `polygon` - Area (future)

## Tables

### profiles
Extends Supabase auth.users with application-specific data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK, FK) | References auth.users.id |
| email | TEXT | User's email |
| display_name | TEXT | Display name |
| avatar_url | TEXT | Profile image URL |
| role | user_role | Permission level |
| bio | TEXT | Optional bio |
| created_at | TIMESTAMPTZ | Account creation |
| updated_at | TIMESTAMPTZ | Last profile update |

### categories
Project classification taxonomy.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| name | TEXT | Display name |
| slug | TEXT | URL-safe identifier |
| description | TEXT | Category description |
| color | TEXT | Hex color for UI |
| icon | TEXT | Lucide icon name |
| display_order | INT | Sort order |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Default Categories:**
1. Road Repair
2. Bike Infrastructure
3. Pedestrian Safety
4. Transit
5. Traffic Signals
6. Bridge & Structure
7. Accessibility
8. Vision Zero
9. Other

### projects
Core table for both official projects and user suggestions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| title | TEXT | Project name |
| description | TEXT | Detailed description |
| source | project_source | Origin of project |
| status | project_status | Current state |
| category_id | UUID (FK) | References categories |
| geometry | GEOGRAPHY | PostGIS geometry |
| geometry_type | geometry_type | Rendering hint |
| location_name | TEXT | Human-readable location |
| affected_streets | TEXT | Street description |
| neighborhood | TEXT | Seattle neighborhood |
| external_id | TEXT | SDOT project ID |
| external_url | TEXT | Official project page |
| vote_score | INT | Upvotes minus downvotes |
| comment_count | INT | Number of comments |
| follower_count | INT | Number of followers |
| created_by | UUID (FK) | Creator's profile |
| is_hidden | BOOLEAN | Moderation flag |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

### project_dates
Important milestones and deadlines.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| project_id | UUID (FK) | References projects |
| date_type | date_type | Type of milestone |
| date | DATE | The date |
| title | TEXT | Event name |
| description | TEXT | Details |
| url | TEXT | Link to more info |
| is_recurring | BOOLEAN | Repeating event |
| recurrence_rule | TEXT | iCal RRULE (future) |
| created_by | UUID (FK) | Who added this |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update |

### votes
User votes on projects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | Voter's profile |
| project_id | UUID (FK) | Voted project |
| value | SMALLINT | +1 (up) or -1 (down) |
| created_at | TIMESTAMPTZ | Vote timestamp |

**Constraints:** UNIQUE(user_id, project_id)

### comments
Discussion threads on projects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| project_id | UUID (FK) | Parent project |
| user_id | UUID (FK) | Author |
| parent_id | UUID (FK) | Parent comment (future threading) |
| content | TEXT | Comment text |
| is_edited | BOOLEAN | Has been modified |
| is_deleted | BOOLEAN | Soft delete flag |
| deleted_at | TIMESTAMPTZ | When deleted |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last edit |

### user_follows
Track which users follow which projects.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| user_id | UUID (FK) | Follower |
| project_id | UUID (FK) | Followed project |
| created_at | TIMESTAMPTZ | Follow timestamp |

**Constraints:** UNIQUE(user_id, project_id)

### mod_actions
Audit trail for moderation activities.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| moderator_id | UUID (FK) | Who performed action |
| action | mod_action_type | Type of action |
| target_type | TEXT | 'project' or 'comment' |
| target_id | UUID | ID of affected item |
| reason | TEXT | Explanation |
| metadata | JSONB | Additional context |
| created_at | TIMESTAMPTZ | Action timestamp |

## Triggers

### update_updated_at
Automatically updates `updated_at` on row modification for: profiles, projects, project_dates, comments.

### update_project_vote_score
Updates `projects.vote_score` when votes are inserted, updated, or deleted.

### update_project_comment_count
Updates `projects.comment_count` when comments are inserted or deleted.

### update_project_follower_count
Updates `projects.follower_count` when follows are inserted or deleted.

### handle_new_user
Creates a profile record when a new user signs up via Supabase Auth.

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:

### Public Access
- Anyone can view non-hidden projects
- Anyone can view categories
- Anyone can view profiles
- Anyone can view non-deleted comments

### Authenticated Users
- Can create suggestions (source = 'user_suggestion')
- Can vote on projects
- Can comment on projects
- Can follow projects
- Can update their own profile

### Moderators
- Can view hidden projects
- Can update any project status
- Can soft-delete comments
- Can add project dates

### Admins
- All moderator permissions
- Can create official projects
- Can delete projects
- Can change user roles
- Can manage categories

## Indexes

Performance indexes are created for:
- Foreign key columns
- Status and source filters
- Vote score (for sorting)
- Created at (for sorting)
- Geometry (spatial queries)
- Full text search on title/description

## Last Updated
January 2025
