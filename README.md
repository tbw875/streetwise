# Streetwise 🗺️

A civic engagement platform for tracking Seattle transportation projects and community suggestions.

## Features

- 📍 **Interactive Map** - View all projects and suggestions on a Mapbox-powered map
- 🗳️ **Community Input** - Submit suggestions and vote on others' ideas
- 📅 **Stay Updated** - Track deadlines, meetings, and construction timelines
- 💬 **Discussion** - Comment on projects and engage with neighbors

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Maps**: Mapbox GL JS
- **Styling**: Tailwind CSS
- **Hosting**: Vercel

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Supabase account (free tier works)
- A Mapbox account (free tier works)

### 1. Clone and Install

```bash
# Clone the repository (or copy files)
cd streetwise

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** → **API** and copy:
   - Project URL
   - `anon` public key

3. Go to **SQL Editor** and run the migration:
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into SQL Editor and click "Run"

4. Enable Google OAuth (optional but recommended):
   - Go to **Authentication** → **Providers** → **Google**
   - Follow the setup instructions to add your Google OAuth credentials
   - Add authorized redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 3. Set Up Mapbox

1. Create an account at [mapbox.com](https://www.mapbox.com)
2. Go to **Account** → **Access tokens**
3. Copy your default public token (starts with `pk.`)

### 4. Configure Environment

```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your values
```

Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
streetwise/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/callback/      # OAuth callback handler
│   │   ├── login/              # Login page
│   │   ├── map/                # Map view
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   └── lib/
│       ├── supabase/           # Supabase client utilities
│       │   ├── client.ts       # Browser client
│       │   ├── server.ts       # Server client
│       │   └── middleware.ts   # Session middleware
│       ├── types.ts            # TypeScript types
│       └── utils.ts            # Utility functions
├── supabase/
│   └── migrations/             # Database migrations
├── docs/                       # Documentation
├── public/                     # Static assets
├── .env.local.example          # Environment template
├── next.config.js              # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
```

## Database Schema

See [docs/database/schema.md](docs/database/schema.md) for full documentation.

Key tables:
- `profiles` - User accounts
- `projects` - Transportation projects and suggestions
- `categories` - Project categories
- `project_dates` - Milestones and deadlines
- `votes` - User votes
- `comments` - Discussion threads

## User Roles

| Role | Capabilities |
|------|-------------|
| **user** | View, suggest, vote, comment, follow |
| **moderator** | + Edit content, manage suggestions, hide items |
| **admin** | + Create official projects, manage users, full access |

## Development

### Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:types     # Generate TypeScript types from Supabase
```

### Adding a New Feature

1. Create components in `src/components/`
2. Add pages in `src/app/`
3. Update types in `src/lib/types.ts`
4. Document in `docs/features/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your-mapbox-token
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Roadmap

### Phase 1 (MVP)
- [x] Project structure
- [x] Database schema
- [x] Authentication
- [ ] Interactive map with markers
- [ ] Project detail page
- [ ] List view with filters

### Phase 2 (Engagement)
- [ ] Voting system
- [ ] Comments/discussion
- [ ] Follow projects
- [ ] Deadline notifications

### Phase 3 (Data)
- [ ] Admin dashboard
- [ ] SDOT API integration
- [ ] Search functionality

## Contributing

Contributions are welcome! Please read the contributing guidelines first.

## License

MIT

---

Built with ❤️ for Seattle
