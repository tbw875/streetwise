import { Suspense } from 'react';
import Link from 'next/link';
import { MapPin, Filter, Plus, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import ProjectMap from '@/components/ProjectMap';
import Navigation from '@/components/Navigation';
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
      {/* Navigation with map controls */}
      <div className="flex-none">
        <Navigation
          showViewToggle
          leftControls={
            <>
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Filter button */}
              <button className="btn-outline btn-sm">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Filter</span>
              </button>

              {/* Add suggestion button */}
              {user && (
                <Link href="/suggest" className="btn-primary btn-sm">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline ml-1">Suggest</span>
                </Link>
              )}
            </>
          }
        />
      </div>

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
