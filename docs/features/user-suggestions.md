# User Suggestions Feature

## Overview
The user suggestions feature allows authenticated users to submit their own transportation project ideas to the Streetwise platform. Suggestions are treated as first-class projects with status "proposed" and can be voted on, commented on, and followed by the community.

## User Flow

1. **Access Form**:
   - Authenticated users click "Suggest" button in navigation
   - Unauthenticated users are redirected to login with return URL

2. **Fill Out Form**:
   - Enter project title (required)
   - Add detailed description (optional but encouraged)
   - Select category from dropdown (optional)
   - Click on map to set location (required)
   - Provide location name, affected streets, neighborhood (all optional)

3. **Submit**:
   - Form validates required fields
   - Server creates project with user as creator
   - User is redirected to new project detail page

4. **After Submission**:
   - Project appears on map and in projects list
   - Project marked as "Community Suggestion" badge
   - Status is "Proposed"
   - Community can vote, comment, follow

## Form Fields

### Required Fields
| Field | Type | Validation | Notes |
|-------|------|------------|-------|
| Title | Text input | Max 200 chars, not empty | Clear, concise project name |
| Location | Map picker | Valid lat/lng | Click on map to set marker |

### Optional Fields
| Field | Type | Max Length | Notes |
|-------|------|------------|-------|
| Description | Textarea | Unlimited | Detailed explanation of suggestion |
| Category | Dropdown | - | Helps with discoverability |
| Location Name | Text input | 200 chars | Human-readable location |
| Affected Streets | Textarea | Unlimited | Streets or areas involved |
| Neighborhood | Text input | 100 chars | Seattle neighborhood |

## Technical Implementation

### Files
- `/src/app/suggest/page.tsx` - Server component, auth check, category fetch
- `/src/app/suggest/actions.ts` - Server action for form submission
- `/src/components/SuggestForm.tsx` - Client component with map picker

### Authentication
- Uses `createClient()` from `@/lib/supabase/server`
- Checks `supabase.auth.getUser()` before rendering page
- Redirects to `/login?next=/suggest` if not authenticated
- Form action re-checks authentication server-side

### Map Integration
- Uses Mapbox GL JS for interactive map
- Centered on Seattle (47.6062°N, 122.3321°W) at zoom 11
- Streets style for clarity
- Click anywhere to place blue marker
- Shows lat/lng coordinates below map
- Marker can be repositioned by clicking elsewhere

### Data Model
Projects created from suggestions have:
```typescript
{
  source: 'user_suggestion',          // Enum value
  status: 'proposed',                  // Initial status
  geometry_type: 'point',              // Only points for now
  geometry: 'POINT(lng lat)',          // PostGIS WKT format
  created_by: user.id,                 // Creator's profile ID
  is_hidden: false,                    // Visible by default
  // All other fields from form
}
```

### Server Action Validation
The `suggestProject` action validates:
1. User is authenticated
2. Title is not empty after trimming
3. Latitude is between -90 and 90
4. Longitude is between -180 and 180
5. All optional fields are trimmed or set to null

### PostGIS Geometry
- Creates WKT (Well-Known Text) format: `POINT(longitude latitude)`
- Note: PostGIS uses (lng, lat) order, not (lat, lng)
- Stored in `geography` column with SRID 4326 (WGS84)

## User Experience Features

### Helpful Guidance
- Info box with tips for good suggestions
- Placeholder text in all fields
- Help text below each field
- Visual indicator when location is set (green checkmark)

### Form Validation
- Client-side: Submit button disabled until title and location set
- Server-side: Comprehensive validation with error messages
- Error messages displayed at top of form in red alert box

### Loading States
- Submit button shows spinner and "Submitting..." text
- Button disabled during submission
- Cancel button also disabled during submission

### Success Flow
- Automatic redirect to newly created project detail page
- Pages revalidated (`/projects` and `/map`) so new project appears immediately

### Error Handling
- Network errors caught and displayed
- Database errors caught and logged
- User-friendly error messages (not raw database errors)
- Form remains filled out on error (user doesn't lose work)

## Database Impact

### Row Level Security
RLS policy allows authenticated users to insert into `projects` table when:
- `source = 'user_suggestion'`
- `created_by = auth.uid()`

### Triggers
After project insert:
- `updated_at` automatically set via trigger
- Project appears in map queries immediately
- Project appears in list queries immediately

### Revalidation
After successful submission:
- `/projects` path revalidated (list page shows new project)
- `/map` path revalidated (map shows new marker)
- New project page (`/projects/[id]`) generated on first visit

## Access Control

### Who Can Suggest
- Any authenticated user with `user`, `moderator`, or `admin` role
- Email must be verified (Supabase default)

### Who Can See Suggestions
- Everyone (authenticated or not) can view suggestions
- Suggestions appear alongside official projects
- Marked with "Community Suggestion" badge on cards

### Moderation
- Moderators can hide inappropriate suggestions (`is_hidden = true`)
- Moderators can change status to `rejected` or `under_review`
- Admins can delete suggestions entirely

## Future Enhancements

1. **Draft Suggestions**: Save form progress, submit later
2. **Image Upload**: Attach photos or diagrams
3. **Duplicate Detection**: Warn if similar suggestion exists
4. **Address Autocomplete**: Google Places API for location name
5. **Neighborhood Auto-detect**: Reverse geocode to get neighborhood
6. **Multi-point Locations**: Support for line segments and areas
7. **Template Suggestions**: Common types with pre-filled fields
8. **Suggestion Templates**: "Add bike lane", "Fix pothole", etc.
9. **Email Notifications**: Notify user when status changes
10. **Edit Suggestions**: Allow creator to edit before moderator review

## Examples of Good Suggestions

**Example 1: Bike Infrastructure**
```
Title: Protected bike lane on Broadway E (Roy to Denny)
Description: Broadway E between Roy St and Denny Way lacks safe bike infrastructure.
Current painted bike lane is frequently blocked by parked cars and delivery trucks.
A protected bike lane would connect the Capitol Hill bike network to the Seattle U area.
Category: Bike Infrastructure
Location: Broadway E and E Roy St (marker)
Affected Streets: Broadway E from E Roy St to Denny Way
Neighborhood: Capitol Hill
```

**Example 2: Pedestrian Safety**
```
Title: Leading pedestrian interval at 15th Ave NE & NE 45th St
Description: This intersection near UW campus has heavy pedestrian traffic but pedestrians
and cars get green lights simultaneously. A leading pedestrian interval (LPI) would give
pedestrians a 3-5 second head start, improving safety.
Category: Pedestrian Safety
Location: 15th Ave NE & NE 45th St (marker)
Affected Streets: 15th Ave NE at NE 45th St
Neighborhood: University District
```

## Metrics to Track

Future analytics could include:
- Number of suggestions submitted per day/week/month
- Average time to first comment on new suggestion
- Most common categories for suggestions
- Geographic distribution of suggestions (which neighborhoods)
- Conversion rate: suggestions → under_review → planned
- User retention: users who suggest vs users who only vote/comment

## Related Features

- **Project Detail Page**: Where users view their submitted suggestions
- **Voting System**: Community can upvote suggestions (Phase 2)
- **Comments**: Discussion on suggestions (Phase 2)
- **Following**: Get notified about suggestion updates (Phase 2)
- **Map View**: Suggestions appear as markers with distinct styling

## Last Updated
January 4, 2026 - v0.1.0
