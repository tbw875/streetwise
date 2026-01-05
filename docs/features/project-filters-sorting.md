# Project Filters and Sorting

## Overview
The projects list page (`/projects`) features comprehensive filtering and sorting capabilities to help users find relevant transportation projects. Filters persist via URL parameters, enabling shareable links and browser history navigation.

## Features Implemented

### 1. Filter Options

**Category Filter**
- Multi-select checkboxes
- Shows all 9 project categories (Transit, Bike Infrastructure, Pedestrian Safety, etc.)
- Categories fetched from database with proper ordering

**Status Filter**
- Multi-select checkboxes
- Options: Proposed, Under Review, Planned, In Progress, Completed, Rejected, On Hold
- Uses proper status labels via `getStatusLabel()` utility

**Source Filter**
- Multi-select checkboxes
- Options: SDOT Official, WADOT Official, Community Suggestion
- Filters by `project_source` enum

**Neighborhood Filter**
- Multi-select checkboxes
- Dynamically populated from distinct neighborhoods in projects table
- Only displayed if projects have neighborhoods defined
- Alphabetically sorted
- Scrollable list if many neighborhoods

### 2. Sort Options

Dropdown with 5 sorting options:
- **Newest** (default) - Most recently created projects first
- **Oldest** - Oldest projects first
- **Most Votes** - Highest vote_score first
- **Most Comments** - Most comment_count first
- **Nearest Deadline** - Projects with upcoming dates (future enhancement)

### 3. URL Parameter System

**Query String Format**
```
/projects?category=transit&category=bike&status=in_progress&sort=votes
```

**Parameters**:
- `category` - Category slug(s) (can be multiple)
- `status` - Status value(s) (can be multiple)
- `source` - Source value(s) (can be multiple)
- `neighborhood` - Neighborhood name(s) (can be multiple)
- `sort` - Sort option (single value, defaults to 'newest')

**Benefits**:
- Shareable URLs with active filters
- Browser back/forward button works correctly
- Bookmarkable filtered views
- Direct linking to specific filter combinations

### 4. Filter Behavior

**Multi-Select Logic**:
- Filters within a category use OR logic (Transit OR Bike Infrastructure)
- Filters across categories use AND logic (Transit AND In Progress)
- Empty filter category = show all (no filtering for that category)

**Filter Combinations**:
- Users can combine any number of filters
- Active filter count displayed on mobile filter button
- "Clear All Filters" button removes all filters and returns to default view

### 5. Responsive Design

**Desktop (lg and up)**:
- Fixed sidebar on left (4-column grid, sidebar takes 1 column)
- Sticky positioning (follows scroll)
- Always visible filter options
- Sort dropdown in sidebar

**Mobile (< lg)**:
- Filter button with active count badge in header
- Sort dropdown in header
- Slide-over panel for filters (overlays content)
- Full-height panel with scroll
- "Apply Filters" and "Clear All" action buttons at bottom

### 6. Empty States

**No Projects at All**:
```
Icon: MapPin (gray)
Message: "No projects found"
```

**No Projects Match Filters**:
```
Icon: MapPin (gray)
Message: "No projects match your filters"
Hint: "Try adjusting your selection"
Button: "Clear All Filters" (if filters active)
```

## Technical Implementation

### Architecture

**Server Component** (`/src/app/projects/page.tsx`):
- Accepts `searchParams` prop from Next.js
- Parses URL parameters into filter arrays
- Fetches filter options (categories, neighborhoods)
- Builds Supabase query with filters applied
- Performs server-side filtering and sorting
- Passes data to client component

**Client Component** (`/src/components/ProjectsClient.tsx`):
- Handles filter UI interactions
- Manages local filter state
- Updates URL via `useRouter` on filter changes
- Renders filter sidebar, project grid, mobile slide-over
- Does NOT perform filtering (all server-side)

### Data Flow

1. User clicks filter checkbox
2. Client component updates local state
3. Client component builds new query string
4. Client component calls `router.push()` with new URL
5. Next.js re-renders page with new `searchParams`
6. Server component re-fetches with new filters
7. Page re-renders with filtered results

### Query Building

**Category Filter Implementation**:
```typescript
if (categoryFilters.length > 0) {
  const categoryIds = categories
    .filter((c) => categoryFilters.includes(c.slug))
    .map((c) => c.id);
  query = query.in('category_id', categoryIds);
}
```

**Status Filter Implementation**:
```typescript
if (statusFilters.length > 0) {
  query = query.in('status', statusFilters);
}
```

**Sort Implementation**:
```typescript
switch (sortBy) {
  case 'oldest':
    query = query.order('created_at', { ascending: true });
    break;
  case 'votes':
    query = query.order('vote_score', { ascending: false });
    break;
  // ...
}
```

## Components Created

### `/src/app/projects/page.tsx` (Server Component)
- Exports `FilterOptions` interface
- Accepts `searchParams` prop
- Fetches and prepares filter data
- Applies filters to Supabase query
- Renders header and `ProjectsClient`

### `/src/components/ProjectsClient.tsx` (Client Component)
- Main filter UI component
- Manages filter state
- Handles URL updates
- Renders desktop sidebar
- Renders mobile slide-over
- Renders project grid
- Handles empty states

## Styling

### Desktop Filter Sidebar
- Card-based sections for each filter category
- Hover states on checkbox labels
- Sticky positioning with `top-24` offset
- Proper spacing between filter groups

### Mobile Slide-over
- Fixed positioning with backdrop overlay
- Slides in from right
- Full-height with scroll
- Sticky action buttons at bottom
- Close on backdrop click or X button

### Filter UI Elements
- Native checkboxes styled with Tailwind
- Brand color accent (`text-brand-600`)
- Hover states on all interactive elements
- Clear visual hierarchy

## Performance Considerations

1. **Server-Side Filtering**: All filtering happens in database, not client-side array filtering
2. **Minimal State**: Client only tracks UI state, not data
3. **Efficient Re-renders**: Only re-fetches when URL changes
4. **Indexed Queries**: Database indexes on `category_id`, `status`, `source` for fast filtering
5. **Static Filter Options**: Categories fetched once per page load

## Future Enhancements

1. **Nearest Deadline Sort**: Join with `project_dates` table to sort by upcoming deadlines
2. **Filter Chips**: Show active filters as removable chips above results
3. **Save Filter Presets**: Allow users to save and name filter combinations
4. **Filter Analytics**: Track popular filter combinations
5. **Advanced Filters**:
   - Date range filtering
   - Vote score range
   - Has upcoming dates
   - Has comments
6. **Search**: Full-text search across title and description

## Usage Examples

**Show only Transit projects in progress**:
```
/projects?category=transit&status=in_progress
```

**Show SDOT and WADOT official projects, sorted by votes**:
```
/projects?source=official_sdot&source=official_wadot&sort=votes
```

**Show Bike and Pedestrian projects in Eastlake**:
```
/projects?category=bike-infrastructure&category=pedestrian-safety&neighborhood=Eastlake
```

## Dependencies
- `next/navigation` - `useRouter`, `useSearchParams`
- `@/lib/supabase/server` - Server-side data fetching
- `@/lib/utils` - Status label formatting
- Lucide React - Icons (Filter, X, ChevronDown, etc.)

## Last Updated
January 4, 2026 - v0.1.0
