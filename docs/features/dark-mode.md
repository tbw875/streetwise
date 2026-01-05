# Dark Mode Feature

## Overview
Streetwise supports system-wide dark mode with automatic detection and manual toggle. The map uses Mapbox's grayscale styles that adapt to the theme.

## Implementation

### Theme Provider
- **Package**: `next-themes` v0.4.4
- **Location**: `/src/components/ThemeProvider.tsx`
- **Configuration**:
  - `attribute="class"` - Uses Tailwind's class-based dark mode
  - `defaultTheme="system"` - Respects user's system preferences
  - `enableSystem` - Allows system theme detection
  - `disableTransitionOnChange` - Prevents flash during theme switch

### Theme Toggle Component
- **Location**: `/src/components/ThemeToggle.tsx`
- **Icons**: Sun (light mode) and Moon (dark mode) from lucide-react
- **Behavior**: Toggles between light and dark themes
- **Placement**: Map page header (can be added to other pages)

### Map Styles
The map automatically switches between Mapbox's monochrome styles:

| Theme | Mapbox Style | Description |
|-------|-------------|-------------|
| Light | `mapbox://styles/mapbox/light-v11` | Clean grayscale with white background |
| Dark | `mapbox://styles/mapbox/dark-v11` | Dark grayscale with dark background |

### How It Works

#### Initial Load
1. ThemeProvider reads system preference or localStorage
2. Applies `dark` class to `<html>` element if needed
3. ProjectMap reads `resolvedTheme` from `useTheme()` hook
4. Initializes map with appropriate style

#### Theme Switch
1. User clicks ThemeToggle button
2. `next-themes` updates theme state and HTML class
3. ProjectMap's `useEffect` detects theme change
4. Calls `map.setStyle()` to switch Mapbox style
5. Markers and controls persist during transition

## Usage

### Adding Theme Toggle to a Page
```tsx
import { ThemeToggle } from '@/components/ThemeToggle';

export default function MyPage() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

### Using Theme in Components
```tsx
'use client';

import { useTheme } from 'next-themes';

export default function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-900">
      Current theme: {resolvedTheme}
    </div>
  );
}
```

### Dark Mode Styling
Use Tailwind's `dark:` variant:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content adapts to theme
</div>
```

## Files Modified

### New Files
- `/src/components/ThemeProvider.tsx` - Next.js theme provider wrapper
- `/src/components/ThemeToggle.tsx` - Theme toggle button component
- `/docs/features/dark-mode.md` - This file

### Modified Files
- `/src/app/layout.tsx` - Added ThemeProvider and dark mode body class
- `/src/app/map/page.tsx` - Added ThemeToggle and dark mode header styles
- `/src/components/ProjectMap.tsx` - Added theme detection and style switching
- `/tailwind.config.ts` - Added `darkMode: 'class'` configuration
- `/package.json` - Added `next-themes` dependency

## Configuration

### Tailwind Config
```typescript
const config: Config = {
  darkMode: 'class', // Enable class-based dark mode
  // ...
};
```

### Global CSS
Dark mode variables are defined in `globals.css`:
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
  --ring: 142.1 70.6% 45.3%;
}
```

## Technical Notes

### Preventing Hydration Mismatch
- `suppressHydrationWarning` on `<html>` prevents React warnings
- ThemeToggle shows placeholder during SSR (prevents flash)
- `mounted` state in ProjectMap prevents theme-dependent rendering until client-side

### Map Style Switching
- `map.setStyle()` preserves map position and zoom
- Markers are re-added after style loads
- Style change is smooth without flash

### Performance
- Theme preference saved to localStorage
- No unnecessary re-renders
- Map style only changes when theme changes

## Future Enhancements
- Add theme toggle to all pages (home, login, etc.)
- Create custom Mapbox styles with brand colors
- Add transition animations for theme switch
- Support more theme options (auto, light, dark, high contrast)
- Remember user preference across sessions (already works via localStorage)

## Last Updated
January 4, 2026 - v0.1.0
