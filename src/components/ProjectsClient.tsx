'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  ArrowUp,
  MessageCircle,
  Eye,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  getStatusLabel,
  getStatusColorClass,
} from '@/lib/utils';
import type {
  Project,
  Category,
  ProjectSource,
  ProjectStatus,
} from '@/lib/types';
import type { FilterOptions } from '@/app/projects/page';

interface ProjectWithCategory extends Project {
  category: Category | null;
}

interface ProjectsClientProps {
  projects: ProjectWithCategory[];
  filterOptions: FilterOptions;
  initialFilters: {
    categories: string[];
    statuses: string[];
    sources: string[];
    neighborhoods: string[];
    sort: string;
  };
}

const sourceLabels: Record<ProjectSource, string> = {
  official_sdot: 'SDOT Official',
  official_wadot: 'WADOT Official',
  user_suggestion: 'Community Suggestion',
};

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'votes', label: 'Most Votes' },
  { value: 'comments', label: 'Most Comments' },
  { value: 'deadline', label: 'Nearest Deadline' },
];

export default function ProjectsClient({
  projects,
  filterOptions,
  initialFilters,
}: ProjectsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Current filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialFilters.categories
  );
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    initialFilters.statuses
  );
  const [selectedSources, setSelectedSources] = useState<string[]>(
    initialFilters.sources
  );
  const [selectedNeighborhoods, setSelectedNeighborhoods] = useState<string[]>(
    initialFilters.neighborhoods
  );
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort);

  // Build URL query string from current filters
  const buildQueryString = (
    categories: string[],
    statuses: string[],
    sources: string[],
    neighborhoods: string[],
    sort: string
  ) => {
    const params = new URLSearchParams();

    categories.forEach((cat) => params.append('category', cat));
    statuses.forEach((status) => params.append('status', status));
    sources.forEach((source) => params.append('source', source));
    neighborhoods.forEach((hood) => params.append('neighborhood', hood));

    if (sort && sort !== 'newest') {
      params.set('sort', sort);
    }

    return params.toString();
  };

  // Update URL when filters change
  const updateFilters = (
    categories: string[],
    statuses: string[],
    sources: string[],
    neighborhoods: string[],
    sort: string
  ) => {
    setSelectedCategories(categories);
    setSelectedStatuses(statuses);
    setSelectedSources(sources);
    setSelectedNeighborhoods(neighborhoods);
    setSelectedSort(sort);

    const queryString = buildQueryString(
      categories,
      statuses,
      sources,
      neighborhoods,
      sort
    );
    router.push(`/projects${queryString ? `?${queryString}` : ''}`);
  };

  // Toggle category filter
  const toggleCategory = (slug: string) => {
    const newCategories = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    updateFilters(
      newCategories,
      selectedStatuses,
      selectedSources,
      selectedNeighborhoods,
      selectedSort
    );
  };

  // Toggle status filter
  const toggleStatus = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    updateFilters(
      selectedCategories,
      newStatuses,
      selectedSources,
      selectedNeighborhoods,
      selectedSort
    );
  };

  // Toggle source filter
  const toggleSource = (source: string) => {
    const newSources = selectedSources.includes(source)
      ? selectedSources.filter((s) => s !== source)
      : [...selectedSources, source];
    updateFilters(
      selectedCategories,
      selectedStatuses,
      newSources,
      selectedNeighborhoods,
      selectedSort
    );
  };

  // Toggle neighborhood filter
  const toggleNeighborhood = (neighborhood: string) => {
    const newNeighborhoods = selectedNeighborhoods.includes(neighborhood)
      ? selectedNeighborhoods.filter((n) => n !== neighborhood)
      : [...selectedNeighborhoods, neighborhood];
    updateFilters(
      selectedCategories,
      selectedStatuses,
      selectedSources,
      newNeighborhoods,
      selectedSort
    );
  };

  // Change sort
  const handleSortChange = (sort: string) => {
    updateFilters(
      selectedCategories,
      selectedStatuses,
      selectedSources,
      selectedNeighborhoods,
      sort
    );
  };

  // Clear all filters
  const clearFilters = () => {
    updateFilters([], [], [], [], 'newest');
  };

  // Count active filters
  const activeFilterCount =
    selectedCategories.length +
    selectedStatuses.length +
    selectedSources.length +
    selectedNeighborhoods.length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Projects</h1>
        <p className="text-gray-600">
          Explore transportation projects and community suggestions across
          Seattle
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Sort */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
              <select
                value={selectedSort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input w-full"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
              <div className="space-y-2">
                {filterOptions.categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.slug)}
                      onChange={() => toggleCategory(category.slug)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
              <div className="space-y-2">
                {filterOptions.statuses.map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">
                      {getStatusLabel(status as ProjectStatus)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div className="card p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Source</h3>
              <div className="space-y-2">
                {filterOptions.sources.map((source) => (
                  <label
                    key={source}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(source)}
                      onChange={() => toggleSource(source)}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm text-gray-700">
                      {sourceLabels[source as ProjectSource]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Neighborhood Filter (only if > 0 neighborhoods) */}
            {filterOptions.neighborhoods.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Neighborhood
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filterOptions.neighborhoods.map((neighborhood) => (
                    <label
                      key={neighborhood}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-1"
                    >
                      <input
                        type="checkbox"
                        checked={selectedNeighborhoods.includes(neighborhood)}
                        onChange={() => toggleNeighborhood(neighborhood)}
                        className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-sm text-gray-700">
                        {neighborhood}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="btn-outline btn-sm w-full"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Mobile Controls */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="btn-outline btn-sm flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="badge bg-brand-600 text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={selectedSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="input input-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-600">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </div>

          {/* Projects Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
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
                  <span
                    className={`badge ${getStatusColorClass(project.status)}`}
                  >
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

          {/* Empty State */}
          {projects.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-2">No projects match your filters</p>
              <p className="text-sm text-gray-400 mb-4">
                Try adjusting your selection
              </p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="btn-primary btn-sm">
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Slide-over */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn-ghost btn-icon"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {filterOptions.categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.slug)}
                          onChange={() => toggleCategory(category.slug)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Status</h3>
                  <div className="space-y-2">
                    {filterOptions.statuses.map((status) => (
                      <label
                        key={status}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">
                          {getStatusLabel(status as ProjectStatus)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Source</h3>
                  <div className="space-y-2">
                    {filterOptions.sources.map((source) => (
                      <label
                        key={source}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSources.includes(source)}
                          onChange={() => toggleSource(source)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-sm text-gray-700">
                          {sourceLabels[source as ProjectSource]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Neighborhood Filter */}
                {filterOptions.neighborhoods.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Neighborhood
                    </h3>
                    <div className="space-y-2">
                      {filterOptions.neighborhoods.map((neighborhood) => (
                        <label
                          key={neighborhood}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedNeighborhoods.includes(
                              neighborhood
                            )}
                            onChange={() => toggleNeighborhood(neighborhood)}
                            className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          />
                          <span className="text-sm text-gray-700">
                            {neighborhood}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Filter Actions */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 mt-6 -mx-4 px-4 flex gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="btn-outline btn-md flex-1"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="btn-primary btn-md flex-1"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
