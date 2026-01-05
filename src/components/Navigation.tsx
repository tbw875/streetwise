'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, List } from 'lucide-react';

interface NavigationProps {
  showViewToggle?: boolean;
  leftControls?: React.ReactNode;
}

export default function Navigation({ showViewToggle = false, leftControls }: NavigationProps) {
  const pathname = usePathname();
  const isMapPage = pathname === '/map';
  const isProjectsPage = pathname?.startsWith('/projects') || false;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:bg-gray-800/80 dark:border-gray-700">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">Streetwise</span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {/* Optional left controls (theme toggle, filter, etc.) */}
          {leftControls && (
            <>
              {leftControls}
            </>
          )}

          {showViewToggle ? (
            /* Map/List Toggle */
            <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 p-1">
              <Link
                href="/map"
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md ${
                  isMapPage
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Map</span>
              </Link>
              <Link
                href="/projects"
                className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md ${
                  isProjectsPage
                    ? 'bg-brand-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Link>
            </div>
          ) : (
            /* Regular Nav Links */
            <>
              <Link
                href="/map"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Explore Map
              </Link>
              <Link
                href="/projects"
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Projects
              </Link>
            </>
          )}

          {/* Sign In */}
          <Link href="/login" className="btn-primary btn-sm">
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}
