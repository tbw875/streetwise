# Streetwise - Project Context

## Overview
Streetwise is a civic engagement platform for tracking Seattle transportation projects (SDOT/WADOT) and community suggestions. Users can view projects on an interactive map, suggest improvements, vote, comment, and stay informed about deadlines.

## Current Status
**Version**: 0.1.0 (Initial Setup)
**Phase**: Phase 1 - Core User Experience (In Progress)
**Last Updated**: January 4, 2026

## Technical Decisions

### Stack
| Technology | Choice | Rationale |
|------------|--------|-----------|
| Framework | Next.js 14 (App Router) | Server components, excellent DX, Vercel deployment |
| Database | Supabase (PostgreSQL + PostGIS) | Free tier, built-in auth, real-time, spatial queries |
| Map | Mapbox GL JS | Generous free tier, supports all geometry types |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Hosting | Vercel | Free tier, seamless Next.js integration |

### Database Design
- **PostGIS geography column** supports point/line/polygon (future-proof)
- **MVP uses points only** with `affected_streets` text field for descriptions
- **Denormalized counts** on projects (vote_score, comment_count, follower_count) updated via triggers
- **RLS policies** enforce role-based access (user, moderator, admin)

### Authentication
- **Primary**: Google OAuth (user preference)
- **Secondary**: Email/password and magic links via Supabase Auth
- **Profiles table** extends auth.users with display_name, avatar, role

### Urgency Color System
| Color | Timeframe | Use Case |
|-------|-----------|----------|
| Red | This week | Immediate attention needed |
| Yellow | Next week | Coming up soon |
| Green | This month | Plan ahead |
| Gray | > 1 month | No urgency |

## Architecture Notes

### Project Sources
1. **official_sdot** - Seattle DOT projects (manual entry initially, future API import)
2. **official_wadot** - Washington State DOT projects
3. **user_suggestion** - Community submitted ideas

### User Roles
1. **user** - Can suggest, vote, comment, follow
2. **moderator** - Can edit/hide content, manage suggestions
3. **admin** - Full access, create official projects, manage users

## What's Next

### Immediate (This Session)
- [x] Project structure
- [x] Database schema
- [x] Basic pages (home, login, map placeholder)
- [x] Mapbox integration with project markers (cleaned up)
- [x] Dark mode with grayscale map styles

### Phase 1 (In Progress)
- [x] Project detail page (`/projects/[id]`)
- [x] Projects list page (`/projects`)
- [ ] List/tile view with filters and sorting
- [ ] User suggestion form
- [ ] Global navigation header on all pages

### Phase 2 (Engagement)
- [ ] Voting system
- [ ] Comments/discussion
- [ ] Follow projects
- [ ] Deadline notifications

### Phase 3 (Data)
- [ ] Admin dashboard
- [ ] SDOT Socrata API import
- [ ] Search functionality

## Environment Requirements
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## File Structure
```
streetwise/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── auth/callback/      # OAuth callback
│   │   ├── login/              # Login page
│   │   ├── map/                # Map view
│   │   ├── projects/           # Projects pages
│   │   │   ├── [id]/           # Project detail (dynamic)
│   │   │   └── page.tsx        # Projects list
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── ProjectMap.tsx      # Mapbox map component
│   │   └── ThemeToggle.tsx     # Dark mode toggle
│   └── lib/
│       ├── supabase/           # Supabase clients
│       ├── types.ts            # TypeScript types
│       └── utils.ts            # Utility functions
├── supabase/
│   └── migrations/             # SQL migrations
├── docs/                       # Documentation
│   ├── features/               # Feature documentation
│   ├── sessions/               # Session summaries
│   └── database/               # Database schema docs
└── public/                     # Static assets
```

## Known Limitations
1. Map requires Mapbox token to function
2. No search implemented yet
3. No email notifications
4. Manual data entry only (no SDOT API integration)
