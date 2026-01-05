import Link from 'next/link';
import { MapPin, ArrowUp, MessageCircle, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getStatusLabel, getStatusColorClass } from '@/lib/utils';
import type { Project, Category } from '@/lib/types';

interface ProjectWithCategory extends Project {
  category: Category | null;
}

export default async function ProjectsPage() {
  const supabase = await createClient();

  // Fetch all projects with categories
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  const projectsWithCategory = projects as unknown as ProjectWithCategory[] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Streetwise</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/map"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Explore Map
            </Link>
            <Link
              href="/projects"
              className="text-sm font-medium text-gray-900"
            >
              Projects
            </Link>
            <Link
              href="/login"
              className="btn-primary btn-sm"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Projects</h1>
          <p className="text-gray-600">
            Explore transportation projects and community suggestions across Seattle
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsWithCategory.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="card-hover p-6 group"
            >
              {/* Category & Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
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
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                {project.title}
              </h2>

              {/* Description Preview */}
              {project.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Location */}
              {project.location_name && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{project.location_name}</span>
                </div>
              )}

              {/* Engagement Metrics */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <ArrowUp className="h-4 w-4" />
                  <span>{project.vote_score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{project.comment_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{project.follower_count}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {projectsWithCategory.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </main>
    </div>
  );
}
