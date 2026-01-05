import { createClient } from '@/lib/supabase/server';
import type { Project, Category, ProjectSource, ProjectStatus } from '@/lib/types';
import Navigation from '@/components/Navigation';
import ProjectsClient from '@/components/ProjectsClient';

interface ProjectWithCategory extends Project {
  category: Category | null;
}

export interface FilterOptions {
  categories: Category[];
  statuses: ProjectStatus[];
  sources: ProjectSource[];
  neighborhoods: string[];
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();

  // Parse search params
  const categoryFilters = searchParams.category
    ? Array.isArray(searchParams.category)
      ? searchParams.category
      : [searchParams.category]
    : [];

  const statusFilters = searchParams.status
    ? Array.isArray(searchParams.status)
      ? searchParams.status
      : [searchParams.status]
    : [];

  const sourceFilters = searchParams.source
    ? Array.isArray(searchParams.source)
      ? searchParams.source
      : [searchParams.source]
    : [];

  const neighborhoodFilters = searchParams.neighborhood
    ? Array.isArray(searchParams.neighborhood)
      ? searchParams.neighborhood
      : [searchParams.neighborhood]
    : [];

  const sortBy = (searchParams.sort as string) || 'newest';

  // Fetch all categories for filter options
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');

  // Fetch distinct neighborhoods for filter options
  const { data: neighborhoodData } = await supabase
    .from('projects')
    .select('neighborhood')
    .not('neighborhood', 'is', null)
    .eq('is_hidden', false);

  const neighborhoods = Array.from(
    new Set(
      (neighborhoodData || [])
        .map((p) => p.neighborhood)
        .filter((n): n is string => n !== null)
    )
  ).sort();

  // Build projects query with filters
  let query = supabase
    .from('projects')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('is_hidden', false);

  // Apply category filter
  if (categoryFilters.length > 0) {
    // Get category IDs from slugs
    const categoryIds = (categories || [])
      .filter((c) => categoryFilters.includes(c.slug))
      .map((c) => c.id);
    if (categoryIds.length > 0) {
      query = query.in('category_id', categoryIds);
    }
  }

  // Apply status filter
  if (statusFilters.length > 0) {
    query = query.in('status', statusFilters as ProjectStatus[]);
  }

  // Apply source filter
  if (sourceFilters.length > 0) {
    query = query.in('source', sourceFilters as ProjectSource[]);
  }

  // Apply neighborhood filter
  if (neighborhoodFilters.length > 0) {
    query = query.in('neighborhood', neighborhoodFilters);
  }

  // Apply sorting
  switch (sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'votes':
      query = query.order('vote_score', { ascending: false });
      break;
    case 'comments':
      query = query.order('comment_count', { ascending: false });
      break;
    case 'deadline':
      // For now, just sort by created_at desc
      // In future, join with project_dates to sort by nearest upcoming date
      query = query.order('created_at', { ascending: false });
      break;
    default: // newest
      query = query.order('created_at', { ascending: false });
  }

  const { data: projects } = await query;

  const projectsWithCategory =
    (projects as unknown as ProjectWithCategory[]) || [];

  // Prepare filter options
  const filterOptions: FilterOptions = {
    categories: categories || [],
    statuses: [
      'proposed',
      'under_review',
      'planned',
      'in_progress',
      'completed',
      'rejected',
      'on_hold',
    ],
    sources: ['official_sdot', 'official_wadot', 'user_suggestion'],
    neighborhoods,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <Navigation showViewToggle />

      {/* Main Content */}
      <ProjectsClient
        projects={projectsWithCategory}
        filterOptions={filterOptions}
        initialFilters={{
          categories: categoryFilters,
          statuses: statusFilters,
          sources: sourceFilters,
          neighborhoods: neighborhoodFilters,
          sort: sortBy,
        }}
      />
    </div>
  );
}
