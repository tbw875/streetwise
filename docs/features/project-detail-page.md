# Project Detail Page

## Overview
The project detail page displays comprehensive information about a single transportation project or community suggestion, including metadata, upcoming deadlines, and read-only comments.

## Route
`/projects/[id]` - Dynamic route that accepts a project UUID

## Features Implemented

### 1. Header Section
- **Breadcrumb Navigation**: Home > Projects > [Project Title]
- **Category Badge**: Color-coded badge from project category
- **Status Badge**: Current project status (proposed, in_progress, completed, etc.)
- **Source Badge**: Indicates if project is official SDOT/WADOT or community suggestion
- **Project Title**: Large, prominent H1
- **Location Information**:
  - Location name (e.g., "Eastlake Ave E & E Newton St")
  - Neighborhood (e.g., "Eastlake")
- **Creator Information**:
  - Avatar or initials
  - Display name
  - Date added
  - Only shown if `created_by` is not null

### 2. Engagement Metrics
Three-column grid displaying:
- **Votes**: Total vote score (upvotes - downvotes)
- **Comments**: Total comment count
- **Following**: Number of users following the project

### 3. Action Buttons (Placeholder)
- **Vote Button**: Disabled, will be functional in Phase 2
- **Follow Button**: Disabled, will be functional in Phase 2
- **Share Button**: Disabled, will be functional in Phase 2

### 4. Description Section
Full project description in prose format with proper line breaks preserved.

### 5. Affected Area Section
Displays the `affected_streets` field if present (e.g., "Eastlake Ave E from NE 65th St to Stewart St").

### 6. Upcoming Dates & Deadlines
- **Only shows future dates** (date >= current date)
- Sorted by date (ascending)
- Each date card includes:
  - Urgency color indicator (red/yellow/green/gray border and background)
  - Date badge with formatted date
  - Date type label (Public Meeting, Comment Deadline, Construction Start, etc.)
  - Event title
  - Description
  - External link (if provided)
- **Urgency Color Rules**:
  - Red: This week
  - Yellow: Next week
  - Green: Rest of this month
  - Gray: More than a month away

### 7. External Links Section
- Official project page link (if `external_url` exists)
- Project ID display (if `external_id` exists)

### 8. Comments Section (Read-Only)
- Displays comment count in header
- "Read-only" label to indicate functionality coming in Phase 2
- Each comment shows:
  - Author avatar or initials
  - Author display name
  - Relative timestamp (e.g., "2 days ago")
  - "(edited)" indicator if comment was edited
  - Comment content with preserved line breaks
- Empty state when no comments exist
- Limited to 50 most recent comments

## Data Fetching

### Main Query
```typescript
const { data: project } = await supabase
  .from('projects')
  .select(`
    *,
    category:categories(*),
    creator:profiles!projects_created_by_fkey(*)
  `)
  .eq('id', params.id)
  .eq('is_hidden', false)
  .single();
```

### Upcoming Dates Query
```typescript
const { data: upcomingDates } = await supabase
  .from('project_dates')
  .select('*')
  .eq('project_id', params.id)
  .gte('date', new Date().toISOString().split('T')[0])
  .order('date', { ascending: true });
```

### Comments Query
```typescript
const { data: comments } = await supabase
  .from('comments')
  .select(`
    *,
    author:profiles!comments_user_id_fkey(*)
  `)
  .eq('project_id', params.id)
  .eq('is_deleted', false)
  .order('created_at', { ascending: false })
  .limit(50);
```

## Styling

### Components Used
- `.card` - Main content containers
- `.badge` - Category, status, and source badges
- `.btn-primary`, `.btn-outline` - Action buttons
- Existing urgency color utilities from `utils.ts`

### Layout
- Max-width 4xl (56rem) for optimal readability
- Responsive padding and spacing
- Card-based sections with consistent 6px spacing between

### Icons
Using Lucide React icons:
- `MapPin` - Location and branding
- `MapPinned` - Specific location indicator
- `Building2` - Neighborhood indicator
- `ArrowUp` - Vote count
- `MessageCircle` - Comment count
- `Eye` - Follower count
- `ExternalLink` - External links
- `Calendar` - Dates
- `ChevronRight` - Breadcrumb separator
- `Home` - Home breadcrumb

## Edge Cases Handled

1. **Project Not Found**: Returns Next.js `notFound()` page
2. **Hidden Projects**: Filtered out via `is_hidden = false`
3. **No Creator**: Creator section not displayed if `created_by` is null
4. **No Future Dates**: Upcoming dates section not displayed
5. **No Affected Streets**: Affected area section not displayed
6. **No External URL**: External links section not displayed
7. **No Comments**: Empty state with helpful message
8. **No Avatar**: Display initials based on user's display name

## TypeScript Types

### Extended Types Used
```typescript
interface ProjectWithDetails extends Project {
  category: Category | null;
  creator: Profile | null;
}

interface ProjectDateWithUrgency extends ProjectDate {
  urgency_color: string;
}

interface CommentWithAuthor extends Comment {
  author: Profile;
}
```

## Dependencies
- `@/lib/supabase/server` - Server-side Supabase client
- `@/lib/utils` - Utility functions for formatting and styling
- `@/lib/types` - TypeScript type definitions
- `next/navigation` - `notFound()` function
- `next/link` - Navigation
- `lucide-react` - Icon components
- `date-fns` - Date manipulation (via utils.ts)

## Navigation

### Inbound Links
- Home page > "View All Projects"
- Map page > Project markers (future)
- `/projects` list page > Project cards

### Outbound Links
- Breadcrumb > Home, Projects list
- Header > Map, Projects list, Login
- External links > Official project pages
- Footer > About, Privacy, Terms

## Future Enhancements (Phase 2)
- Functional voting system
- Functional follow/unfollow
- Share functionality (copy link, social media)
- Comment posting and editing
- Mini map showing project location
- Related projects section
- Project edit button (for admins/moderators/creators)
- Delete project button (for admins)

## Implementation Files
- `/src/app/projects/[id]/page.tsx` - Main detail page
- `/src/app/projects/page.tsx` - Projects list page (for navigation)

## Last Updated
January 4, 2026 - v0.1.0
