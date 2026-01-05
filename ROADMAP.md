# Streetwise Development Roadmap

**Last Updated**: January 4, 2026
**Current Version**: 0.1.0
**Status**: Foundation Complete

---

## Completed Foundation (v0.1.0)

- [x] Database schema with PostGIS support
- [x] Supabase authentication configuration
- [x] Google OAuth setup
- [x] Interactive Mapbox map with project markers
- [x] Dark mode with grayscale map styles
- [x] Sample project data (3 projects)
- [x] Basic home page
- [x] Login page
- [x] Map page with category-colored markers

---

## Phase 1: Core User Experience (v0.2.0) - PRIORITY

### 1.1 Project Detail Page
**Route**: `/projects/[id]`
**Priority**: HIGH

- [ ] Create dynamic route for individual projects
- [ ] Display full project information:
  - [ ] Title, description, category, status
  - [ ] Location with embedded mini-map
  - [ ] Vote score and voting UI (read-only for now)
  - [ ] Comment count and comment section (read-only for now)
  - [ ] External links (SDOT/WADOT pages)
- [ ] Show all project dates with urgency indicators:
  - [ ] Upcoming meetings (red/yellow/green badges)
  - [ ] Construction milestones
  - [ ] Comment deadlines
- [ ] Add "Follow Project" button placeholder
- [ ] Breadcrumb navigation
- [ ] Share button (copy link)
- [ ] Related projects section

### 1.2 Project List/Grid View
**Route**: `/projects`
**Priority**: HIGH

- [ ] Create project list page with card grid layout
- [ ] Project card component:
  - [ ] Category color indicator
  - [ ] Title and truncated description
  - [ ] Location badge
  - [ ] Status badge
  - [ ] Vote score and comment count
  - [ ] Urgency indicator for nearest deadline
  - [ ] Click to navigate to detail page
- [ ] Sidebar filters:
  - [ ] Filter by category (checkboxes)
  - [ ] Filter by status (checkboxes)
  - [ ] Filter by source (official vs user suggestions)
  - [ ] Filter by urgency (show only urgent)
- [ ] Sort options:
  - [ ] Most recent
  - [ ] Most votes
  - [ ] Most comments
  - [ ] Nearest deadline
- [ ] Pagination or infinite scroll
- [ ] Empty state when no projects match filters
- [ ] Mobile responsive grid (1 col mobile, 2 col tablet, 3 col desktop)

### 1.3 Navigation & Layout
**Priority**: HIGH

- [ ] Add global navigation header to all pages
- [ ] Add theme toggle to all pages (currently only on map)
- [ ] Create reusable page layout component
- [ ] Update home page with links to /projects and /map
- [ ] Add footer with About/Privacy/Terms links
- [ ] Improve mobile navigation (hamburger menu)

### 1.4 User Suggestion Form
**Route**: `/suggest`
**Priority**: MEDIUM

- [ ] Create authenticated-only route
- [ ] Form fields:
  - [ ] Project title (required)
  - [ ] Description (required, min 100 chars)
  - [ ] Category selection (dropdown)
  - [ ] Location picker:
    - [ ] Map click to set point
    - [ ] Or address search/geocoding
  - [ ] Affected streets (optional text)
  - [ ] Neighborhood (optional)
- [ ] Form validation with error messages
- [ ] Submit handler that creates project with source='user_suggestion'
- [ ] Success message and redirect to new project page
- [ ] Draft saving to localStorage
- [ ] Image upload for context (future enhancement)

---

## Phase 2: Engagement Features (v0.3.0)

### 2.1 Authentication Flow
**Priority**: HIGH

- [ ] Complete signup flow:
  - [ ] Email/password signup page
  - [ ] Email verification
  - [ ] Profile completion (display name, avatar)
- [ ] Logout functionality
- [ ] User profile page (`/profile`)
- [ ] Edit profile page
- [ ] Password reset flow
- [ ] Account deletion
- [ ] Session management and auto-logout

### 2.2 Voting System
**Priority**: HIGH

- [ ] Vote button component (up/down or just up)
- [ ] Real-time vote score updates
- [ ] User vote state (voted up, down, or none)
- [ ] Optimistic UI updates
- [ ] Vote trigger updates to vote_score
- [ ] Prevent multiple votes per user (database constraint)
- [ ] Show user's vote history on profile
- [ ] Vote analytics (most voted projects)

### 2.3 Comment System
**Priority**: HIGH

- [ ] Comment input component (authenticated users only)
- [ ] Display comment threads on project detail page:
  - [ ] User avatar and display name
  - [ ] Comment text with formatting
  - [ ] Timestamp (relative: "2 hours ago")
  - [ ] Edit/delete own comments
  - [ ] Moderator delete any comment
- [ ] Nested replies (threading) - optional for v1
- [ ] Comment sorting (newest, oldest, most relevant)
- [ ] Comment count auto-updates via trigger
- [ ] Mention users with @username
- [ ] Report comment button
- [ ] Pagination for long threads

### 2.4 Follow Projects
**Priority**: MEDIUM

- [ ] Follow/Unfollow button on project detail page
- [ ] User's followed projects page (`/profile/following`)
- [ ] Email notifications for followed projects:
  - [ ] New upcoming dates added
  - [ ] Status changes
  - [ ] New comments (optional, user preference)
- [ ] Follower count display
- [ ] Follower list (who's following this project)

### 2.5 Deadline Notifications
**Priority**: MEDIUM

- [ ] Email digest of upcoming deadlines:
  - [ ] Daily digest option
  - [ ] Weekly digest option
- [ ] In-app notification center:
  - [ ] Bell icon with unread count
  - [ ] Dropdown notification list
  - [ ] Mark as read/unread
- [ ] Notification preferences page
- [ ] Push notifications (future enhancement)

---

## Phase 3: Admin & Moderation (v0.4.0)

### 3.1 Admin Dashboard
**Route**: `/admin`
**Priority**: MEDIUM

- [ ] Restrict access to admin role only
- [ ] Dashboard overview:
  - [ ] Total projects, users, comments
  - [ ] Recent activity feed
  - [ ] Pending user suggestions (under review)
  - [ ] Flagged content
- [ ] Project management:
  - [ ] Create official SDOT/WADOT projects
  - [ ] Edit any project
  - [ ] Change project status
  - [ ] Hide/unhide projects
  - [ ] Bulk actions
- [ ] User management:
  - [ ] View all users
  - [ ] Change user roles
  - [ ] Ban/unban users
  - [ ] View user activity logs

### 3.2 Moderator Tools
**Priority**: MEDIUM

- [ ] Moderator dashboard (subset of admin)
- [ ] Review user suggestions:
  - [ ] Approve → change status to 'under_review'
  - [ ] Reject → change status to 'rejected'
  - [ ] Edit and approve
- [ ] Comment moderation:
  - [ ] Delete inappropriate comments
  - [ ] Ban users who violate terms
  - [ ] Moderation log (audit trail)
- [ ] Merge duplicate projects
- [ ] Flag management (review user reports)

### 3.3 Search & Discovery
**Priority**: MEDIUM

- [ ] Global search bar in header
- [ ] Search across:
  - [ ] Project titles
  - [ ] Descriptions
  - [ ] Locations/neighborhoods
  - [ ] Comments (future)
- [ ] Search results page with filters
- [ ] Search suggestions/autocomplete
- [ ] Recent searches
- [ ] Full-text search with PostgreSQL
- [ ] Save searches (authenticated users)

---

## Phase 4: Data Integration (v0.5.0)

### 4.1 SDOT Socrata API Integration
**Priority**: LOW (Manual entry sufficient for MVP)

- [ ] Create scheduled job to fetch SDOT data
- [ ] Map SDOT fields to our schema
- [ ] Deduplicate existing projects
- [ ] Update existing official projects
- [ ] Import new projects automatically
- [ ] Handle API rate limits
- [ ] Error handling and retry logic
- [ ] Admin page to trigger manual sync
- [ ] Sync status indicator

### 4.2 Data Quality
**Priority**: LOW

- [ ] Geocoding for addresses (if API provides addresses but not coordinates)
- [ ] Validate geometry data
- [ ] Detect and merge duplicates
- [ ] Flag missing required fields
- [ ] Data quality dashboard for admins

---

## Phase 5: Polish & Performance (v1.0.0)

### 5.1 SEO & Metadata
**Priority**: MEDIUM

- [ ] Dynamic meta tags for all pages
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card tags
- [ ] Sitemap generation
- [ ] robots.txt
- [ ] Structured data (JSON-LD) for projects
- [ ] Canonical URLs

### 5.2 Error Handling & Edge Cases
**Priority**: MEDIUM

- [ ] Custom 404 page
- [ ] Custom 500 error page
- [ ] Error boundaries for React errors
- [ ] Graceful degradation when services are down
- [ ] Rate limiting on API routes
- [ ] Input sanitization (XSS prevention)
- [ ] CSRF protection

### 5.3 Performance Optimization
**Priority**: MEDIUM

- [ ] Implement React Server Components where applicable
- [ ] Lazy load images and maps
- [ ] Add loading skeletons for all data fetching
- [ ] Optimize Mapbox tile loading
- [ ] Database query optimization (indexes)
- [ ] Cache frequently accessed data
- [ ] Image optimization (Next.js Image component)
- [ ] Bundle size analysis and reduction
- [ ] Lighthouse score > 90

### 5.4 Accessibility (A11y)
**Priority**: MEDIUM

- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators
- [ ] Color contrast compliance (WCAG AA)
- [ ] Alt text for all images
- [ ] Form labels and error messages
- [ ] Skip to main content link
- [ ] Accessible map controls

### 5.5 Mobile Experience
**Priority**: HIGH

- [ ] Fully responsive design (all breakpoints)
- [ ] Touch-friendly map controls
- [ ] Mobile navigation menu
- [ ] Optimize form inputs for mobile keyboards
- [ ] Test on iOS and Android devices
- [ ] PWA support (future):
  - [ ] Service worker
  - [ ] Offline fallback
  - [ ] Install prompt

### 5.6 Analytics & Monitoring
**Priority**: LOW

- [ ] Add analytics (privacy-friendly option like Plausible)
- [ ] Track page views, popular projects
- [ ] Error monitoring (Sentry or similar)
- [ ] Performance monitoring
- [ ] User behavior analytics
- [ ] Conversion funnel (signup → suggest project)

---

## Phase 6: Advanced Features (v2.0.0+)

### 6.1 Enhanced Map Features
**Priority**: LOW

- [ ] Draw LineString and Polygon geometries for projects
- [ ] Highlight affected streets on map
- [ ] Cluster markers when zoomed out
- [ ] Heatmap of project density
- [ ] Filter projects directly on map
- [ ] Save custom map views
- [ ] Export map as image

### 6.2 Community Features
**Priority**: LOW

- [ ] User reputation/badges system
- [ ] Leaderboard (most active users)
- [ ] Project champions (power users assigned to projects)
- [ ] Community guidelines page
- [ ] Discussion forums (beyond project comments)
- [ ] User messaging system

### 6.3 Calendar & Events
**Priority**: LOW

- [ ] Calendar view of all upcoming dates
- [ ] Add to personal calendar (iCal export)
- [ ] RSVP to public meetings
- [ ] Meeting notes and summaries
- [ ] Recurring events support

### 6.4 Email Campaigns
**Priority**: LOW

- [ ] Newsletter system for announcements
- [ ] Targeted emails by neighborhood
- [ ] Email templates
- [ ] Unsubscribe management
- [ ] Email analytics

---

## Technical Debt & Maintenance

### Ongoing Tasks
- [ ] Write unit tests for critical functions
- [ ] Write integration tests for API routes
- [ ] E2E tests with Playwright or Cypress
- [ ] Update dependencies regularly
- [ ] Security audits
- [ ] Performance benchmarking
- [ ] Database backup strategy
- [ ] Disaster recovery plan
- [ ] Documentation updates

### Code Quality
- [ ] Set up ESLint rules and enforce
- [ ] Set up Prettier for consistent formatting
- [ ] TypeScript strict mode compliance
- [ ] Remove console.logs in production
- [ ] Code review checklist
- [ ] Component library/design system

---

## Deployment & DevOps

### Pre-Launch Checklist
- [ ] Set up production environment (Vercel)
- [ ] Configure environment variables
- [ ] Set up production database (Supabase production project)
- [ ] Configure custom domain
- [ ] SSL certificate
- [ ] Set up staging environment
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Database migrations strategy
- [ ] Rollback plan
- [ ] Monitoring and alerts

### Legal & Compliance
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie policy (if using cookies)
- [ ] GDPR compliance (if applicable)
- [ ] Content moderation policy
- [ ] DMCA takedown process

---

## Success Metrics (Post-Launch)

- [ ] Define KPIs (users, projects, engagement)
- [ ] User feedback collection
- [ ] Feature usage analytics
- [ ] Iteration based on user feedback
- [ ] A/B testing framework

---

**Notes**:
- This roadmap is a living document and will be updated as priorities shift
- Version numbers are approximate and may change based on feature bundling
- Community feedback will influence prioritization post-launch
- Critical bug fixes take precedence over roadmap items
