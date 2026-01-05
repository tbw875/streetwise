# ProjectMap Component

## Overview
Client-side interactive map component using Mapbox GL JS to display transportation projects on a map of Seattle.

## Location
`/src/components/ProjectMap.tsx`

## Usage
```tsx
import ProjectMap from '@/components/ProjectMap';

<ProjectMap
  projects={projectsWithCategories}
  initialCenter={[-122.3321, 47.6062]}  // Optional: [lng, lat]
  initialZoom={11}                       // Optional: zoom level
/>
```

## Props

### ProjectMapProps Interface
```typescript
interface ProjectMapProps {
  projects: ProjectWithCategory[];
  initialCenter?: [number, number];  // Default: Seattle [-122.3321, 47.6062]
  initialZoom?: number;               // Default: 11
}
```

### ProjectWithCategory Interface
```typescript
interface ProjectWithCategory {
  id: string;
  title: string;
  description: string | null;
  status: string;
  geometry: GeoJSON.Geometry | null;
  geometry_type: string;
  location_name: string | null;
  vote_score: number;
  comment_count: number;
  category: Category | null;
}
```

## Features

### Map Initialization
- Centered on Seattle by default
- Mapbox Streets style (`mapbox://styles/mapbox/streets-v12`)
- Navigation controls (zoom, rotate) in top-right
- Scale control in bottom-left

### Geometry Support
- **Point**: Places marker at exact coordinates
- **LineString**: Places marker at midpoint of line
- **Polygon**: Places marker at first coordinate (approximation)

### Markers
- Custom circular markers styled with category colors
- 32px diameter with 3px white border
- Drop shadow for depth
- White dot icon in center
- Clickable to open popup

### Popups
- Category color indicator
- Project title and category name
- Description (truncated to 150 chars)
- Location name with pin emoji
- Vote score and comment count
- Status badge
- "View Details" link to `/projects/[id]`

### States

#### Loading State
- Gray background with pulsing map pin icon
- "Loading map..." text
- Displayed until map fires 'load' event

#### Error State
- Red alert icon
- Error message
- Helpful instructions for fixing (token setup)
- Link to Mapbox token creation

#### Loaded State
- Full interactive map
- All project markers visible
- Navigation and scale controls active

## Configuration

### Environment Variables Required
```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

### Theme Support
The map automatically adapts to the app's theme:
- **Light mode**: Uses `mapbox://styles/mapbox/light-v11` (grayscale)
- **Dark mode**: Uses `mapbox://styles/mapbox/dark-v11` (dark grayscale)
- Switches dynamically when user toggles theme
- Uses `next-themes` for theme detection

### Error Handling
- Missing token: Shows error state with setup instructions
- Map initialization failure: Shows generic error message
- Mapbox API errors: Caught and displayed to user

## Implementation Notes

### Client-Side Only
- Uses `'use client'` directive
- Required for Mapbox GL JS DOM manipulation
- Cannot be server-rendered

### Memory Management
- Map instance stored in ref to prevent re-initialization
- Cleanup function removes map on unmount
- Prevents memory leaks and duplicate maps

### Performance
- Initializes only once per component mount
- Skips re-initialization if map already exists
- Efficient marker creation using forEach

## Dependencies
- `mapbox-gl` - Mapbox GL JS library
- `mapbox-gl/dist/mapbox-gl.css` - Required styles
- `lucide-react` - Icons (MapPin, AlertCircle)
- `@/lib/types` - TypeScript interfaces

## CSS Classes Used
- Standard Tailwind utility classes
- Custom `.custom-marker` class on marker elements
- `.badge-{status}` classes for status indicators

## Future Enhancements
- Cluster markers when zoomed out
- Filter markers by category
- Fit bounds to show all markers
- Custom marker icons per category
- Polyline/polygon rendering for geometry
- Click to select/highlight project

## Last Updated
January 4, 2026 - v0.1.0
