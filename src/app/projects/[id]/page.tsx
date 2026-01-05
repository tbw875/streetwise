import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Home,
  ChevronRight,
  ArrowUp,
  MessageCircle,
  Eye,
  ExternalLink,
  Calendar,
  MapPinned,
  Building2,
  User,
  Users,
  FileText,
  Construction,
  CheckCircle,
  Vote,
  DollarSign
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import Navigation from '@/components/Navigation';
import {
  getStatusLabel,
  getStatusColorClass,
  formatDate,
  formatRelativeTime,
  getUrgencyColor,
  getUrgencyColorClass,
  getInitials
} from '@/lib/utils';
import type {
  Project,
  Category,
  Profile,
  ProjectDate,
  Comment,
  DateType,
  ProjectSource
} from '@/lib/types';

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

// Map date type to display label
const dateTypeLabels: Record<DateType, string> = {
  public_meeting: 'Public Meeting',
  comment_deadline: 'Comment Deadline',
  construction_start: 'Construction Start',
  construction_end: 'Construction End',
  council_vote: 'Council Vote',
  funding_deadline: 'Funding Deadline',
  other: 'Event',
};

// Helper function to get icon component for date type
function getDateTypeIcon(dateType: DateType) {
  switch (dateType) {
    case 'public_meeting':
      return Users;
    case 'comment_deadline':
      return FileText;
    case 'construction_start':
      return Construction;
    case 'construction_end':
      return CheckCircle;
    case 'council_vote':
      return Vote;
    case 'funding_deadline':
      return DollarSign;
    case 'other':
      return Calendar;
  }
}

// Map source to display label
const sourceLabels: Record<ProjectSource, string> = {
  official_sdot: 'SDOT Official Project',
  official_wadot: 'WADOT Official Project',
  user_suggestion: 'Community Suggestion',
};

export default async function ProjectDetailPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = await createClient();

  // Fetch project with category and creator
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(`
      *,
      category:categories(*),
      creator:profiles!projects_created_by_fkey(*)
    `)
    .eq('id', params.id)
    .eq('is_hidden', false)
    .single<ProjectWithDetails>();

  if (projectError || !project) {
    notFound();
  }

  // Fetch future project dates
  const { data: upcomingDates } = await supabase
    .from('project_dates')
    .select('*')
    .eq('project_id', params.id)
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true });

  // Add urgency color to dates
  const datesWithUrgency: ProjectDateWithUrgency[] = (upcomingDates || []).map(date => ({
    ...date,
    urgency_color: getUrgencyColor(date.date),
  }));

  // Fetch comments with authors (read-only for now)
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

  const commentsWithAuthors = comments as unknown as CommentWithAuthor[] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <Navigation showViewToggle />

      {/* Breadcrumb */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href="/projects"
              className="text-gray-500 hover:text-gray-900"
            >
              Projects
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {project.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="card p-6 sm:p-8 mb-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {project.category && (
              <span
                className="badge text-white"
                style={{ backgroundColor: project.category.color }}
              >
                {project.category.name}
              </span>
            )}
            <span className={`badge ${getStatusColorClass(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
            <span className="badge bg-gray-100 text-gray-700">
              {sourceLabels[project.source]}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {project.title}
          </h1>

          {/* Location & Neighborhood */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
            {project.location_name && (
              <div className="flex items-center gap-1.5">
                <MapPinned className="h-4 w-4" />
                <span className="text-sm">{project.location_name}</span>
              </div>
            )}
            {project.neighborhood && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span className="text-sm">{project.neighborhood}</span>
              </div>
            )}
          </div>

          {/* Creator Info */}
          {project.creator && (
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 text-sm font-medium">
                {project.creator.avatar_url ? (
                  <img
                    src={project.creator.avatar_url}
                    alt={project.creator.display_name || 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  getInitials(project.creator.display_name)
                )}
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Added by </span>
                <span className="font-medium text-gray-900">
                  {project.creator.display_name || 'Anonymous'}
                </span>
                <span className="text-gray-600"> on {formatDate(project.created_at)}</span>
              </div>
            </div>
          )}

          {/* Engagement Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center gap-2 text-gray-900 font-bold text-2xl">
                <ArrowUp className="h-5 w-5" />
                {project.vote_score}
              </div>
              <div className="text-sm text-gray-600 mt-1">Votes</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center gap-2 text-gray-900 font-bold text-2xl">
                <MessageCircle className="h-5 w-5" />
                {project.comment_count}
              </div>
              <div className="text-sm text-gray-600 mt-1">Comments</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gray-50">
              <div className="flex items-center justify-center gap-2 text-gray-900 font-bold text-2xl">
                <Eye className="h-5 w-5" />
                {project.follower_count}
              </div>
              <div className="text-sm text-gray-600 mt-1">Following</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              disabled
              className="btn-primary btn-md flex-1 sm:flex-none opacity-50 cursor-not-allowed"
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              Vote
            </button>
            <button
              disabled
              className="btn-outline btn-md flex-1 sm:flex-none opacity-50 cursor-not-allowed"
            >
              <Eye className="h-4 w-4 mr-2" />
              Follow
            </button>
            <button
              disabled
              className="btn-outline btn-md flex-1 sm:flex-none opacity-50 cursor-not-allowed"
            >
              Share
            </button>
          </div>
        </div>

        {/* Description */}
        {project.description && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          </div>
        )}

        {/* Affected Area */}
        {project.affected_streets && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Affected Area</h2>
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-brand-600" />
              <p>{project.affected_streets}</p>
            </div>
          </div>
        )}

        {/* Upcoming Dates & Deadlines */}
        {datesWithUrgency.length > 0 && (
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Upcoming Dates & Deadlines
              </h2>
              <span className="text-sm text-gray-500">
                {datesWithUrgency.length} upcoming
              </span>
            </div>

            <div className="space-y-3">
              {datesWithUrgency.map((date) => {
                const DateIcon = getDateTypeIcon(date.date_type);
                return (
                  <div
                    key={date.id}
                    className={`border-l-4 rounded-lg p-4 ${
                      date.urgency_color === 'red' ? 'border-red-500 bg-red-50' :
                      date.urgency_color === 'yellow' ? 'border-amber-500 bg-amber-50' :
                      date.urgency_color === 'green' ? 'border-green-500 bg-green-50' :
                      'border-gray-500 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <DateIcon className="h-5 w-5 text-gray-700" />
                          <span className={`badge ${getUrgencyColorClass(date.urgency_color as any)}`}>
                            {formatDate(date.date)}
                          </span>
                          <span className="text-xs font-medium text-gray-600 uppercase">
                            {dateTypeLabels[date.date_type]}
                          </span>
                        </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {date.title}
                      </h3>
                      {date.description && (
                        <p className="text-sm text-gray-700 mb-2">
                          {date.description}
                        </p>
                      )}
                      {date.url && (
                        <a
                          href={date.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                        >
                          View Details
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* External Links */}
        {project.external_url && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">External Links</h2>
            <a
              href={project.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
            >
              <ExternalLink className="h-4 w-4" />
              Official Project Page
            </a>
            {project.external_id && (
              <p className="text-sm text-gray-500 mt-2">
                Project ID: {project.external_id}
              </p>
            )}
          </div>
        )}

        {/* Comments Section (Read-only) */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Comments ({project.comment_count})
            </h2>
            <span className="text-sm text-gray-500">Read-only</span>
          </div>

          {commentsWithAuthors.length > 0 ? (
            <div className="space-y-6">
              {commentsWithAuthors.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-medium">
                      {comment.author.avatar_url ? (
                        <img
                          src={comment.author.avatar_url}
                          alt={comment.author.display_name || 'User'}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        getInitials(comment.author.display_name)
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.author.display_name || 'Anonymous'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(comment.created_at)}
                      </span>
                      {comment.is_edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Be the first to share your thoughts (coming soon)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Streetwise</span>
            </div>
            <p className="text-sm text-gray-500">
              A community project for Seattle transportation advocacy.
            </p>
            <div className="flex gap-6">
              <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900">
                About
              </Link>
              <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
