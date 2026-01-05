# Navigation Component

## Overview
The Navigation component provides a consistent global header across all pages of the Streetwise application. It adapts its content based on the page context while maintaining visual consistency.

## Location
`/src/components/Navigation.tsx`

## Usage

### Basic Usage (Home Page)
```tsx
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div>
      <Navigation />
      {/* Page content */}
    </div>
  );
}
```

### With View Toggle (Map and Projects Pages)
```tsx
import Navigation from '@/components/Navigation';

export default function ProjectsPage() {
  return (
    <div>
      <Navigation showViewToggle />
      {/* Page content */}
    </div>
  );
}
```

## Props

### `showViewToggle?: boolean`
- **Default**: `false`
- **Purpose**: Controls whether to show the Map/List view toggle or regular navigation links
- **Behavior**:
  - `true`: Shows Map/List toggle buttons with active state highlighting
  - `false`: Shows regular navigation links (Explore Map, Projects)

## Features

### Automatic Active State Detection
The component uses Next.js `usePathname()` hook to automatically detect the current page and highlight the active navigation item:
- Map page (`/map`): Map button is highlighted
- Projects pages (`/projects` or `/projects/[id]`): List button is highlighted

### Consistent Branding
- Streetwise logo with brand color
- Consistent spacing and typography
- Sticky positioning at top of viewport

### Responsive Design
- Logo text hidden on small screens
- View toggle button text hidden on small screens (`sm:inline`)
- Maintains consistent height (h-16) across all viewport sizes

## Component Structure

```tsx
<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
  <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
    {/* Logo */}
    <Link href="/">...</Link>

    {/* Navigation - conditional based on showViewToggle prop */}
    <div className="flex items-center gap-4">
      {showViewToggle ? (
        /* Map/List Toggle */
      ) : (
        /* Regular Nav Links */
      )}

      {/* Sign In Button - always present */}
      <Link href="/login">...</Link>
    </div>
  </nav>
</header>
```

## Styling

### Header
- Sticky positioning with high z-index (z-50)
- Semi-transparent white background with backdrop blur
- Bottom border for visual separation

### Logo
- Brand-colored background (bg-brand-600)
- Rounded corners (rounded-lg)
- MapPin icon from Lucide React

### View Toggle
- Border container with padding
- Active state: brand-colored background with white text
- Inactive state: gray text with hover effect
- Rounded buttons (rounded-md)

### Regular Nav Links
- Gray text with hover effect
- Font weight medium
- Consistent sizing

### Sign In Button
- Uses global btn-primary and btn-sm classes
- Consistent styling across all navigation variants

## Pages Using Navigation

1. **Home Page** (`/src/app/page.tsx`)
   - Uses: `<Navigation />`
   - Shows: Regular nav links (Explore Map, Projects, Sign In)

2. **Map Page** (`/src/app/map/page.tsx`)
   - Uses: `<Navigation showViewToggle />`
   - Shows: Map/List toggle (Map active) + Sign In
   - Additional: Custom controls bar below navigation

3. **Projects List** (`/src/app/projects/page.tsx`)
   - Uses: `<Navigation showViewToggle />`
   - Shows: Map/List toggle (List active) + Sign In

4. **Project Detail** (`/src/app/projects/[id]/page.tsx`)
   - Uses: `<Navigation showViewToggle />`
   - Shows: Map/List toggle (List active) + Sign In

## Dependencies
- `next/link` - Client-side navigation
- `next/navigation` - usePathname hook for active state detection
- `lucide-react` - MapPin and List icons
- Tailwind CSS - Styling

## Implementation Notes

### Client Component
The Navigation component is marked with `'use client'` because it uses:
- `usePathname()` hook to detect current route
- Client-side navigation with Link components

### Active State Logic
```typescript
const pathname = usePathname();
const isMapPage = pathname === '/map';
const isProjectsPage = pathname?.startsWith('/projects') || false;
```
- Map page: Exact match on `/map`
- Projects pages: Prefix match on `/projects` (includes `/projects` and `/projects/[id]`)

### Accessibility
- Semantic HTML with `<header>` and `<nav>` elements
- Interactive elements are links and buttons (keyboard accessible)
- Clear visual indication of active navigation item

## Future Enhancements
1. Add user profile dropdown when authenticated
2. Add notifications indicator
3. Add mobile menu for small screens
4. Add search functionality
5. Support for additional navigation items via props
6. Integration with user session state for personalized navigation

## Related Components
- `ThemeToggle` - Used on map page for dark mode
- `ProjectsClient` - Uses similar filter UI patterns

## Last Updated
January 4, 2026 - v0.1.0
