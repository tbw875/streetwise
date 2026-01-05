import { Suspense } from 'react';
import Link from 'next/link';
import { MapPin, List, Filter, Plus, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProjectMap from '@/components/ProjectMap';
import { ThemeToggle } from '@/components/ThemeToggle';

// Loading skeleton for map
function MapSkeleton() {
  return (
    <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
        <p className="text-gray-400">Loading map...</p>
      </div>
    </div>
  );
}

// Server component that fetches initial data
async function MapPageContent() {
  const supabase = await createClient();
  
  // Get user session
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch categories for filter sidebar
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('display_order');
  
  // Fetch initial projects with geometry converted to GeoJSON
  const { data: rawProjects } = await supabase
    .rpc('get_projects_with_geojson', {})
    .limit(100);

  // Transform the data to match our interface
  const projects = rawProjects?.map((p: any) => ({
    ...p,
    geometry: p.geometry ? JSON.parse(p.geometry) : null,
  })) || [];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="flex-none border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 z-10">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">Streetwise</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <ThemeToggle />

            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-brand-600 text-white rounded-md">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </button>
              <Link
                href="/projects"
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Link>
            </div>
            
            {/* Filter button */}
            <button className="btn-outline btn-sm">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Filter</span>
            </button>
            
            {/* Add suggestion button */}
            {user ? (
              <Link href="/suggest" className="btn-primary btn-sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Suggest</span>
              </Link>
            ) : (
              <Link href="/login?next=/suggest" className="btn-primary btn-sm">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative">
        {/* Mapbox map */}
        <div className="absolute inset-0">
          <ProjectMap projects={projects || []} />
        </div>

        {/* Mobile menu button */}
        <button className="absolute bottom-4 right-4 sm:hidden btn-primary btn-icon shadow-lg">
          <Menu className="h-5 w-5" />
        </button>
      </main>
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense fallback={<MapSkeleton />}>
      <MapPageContent />
    </Suspense>
  );
}
