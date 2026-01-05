'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Project, Category } from '@/lib/types';
import { MapPin, AlertCircle } from 'lucide-react';

interface ProjectWithCategory {
  id: string;
  title: string;
  description: string | null;
  status: string;
  geometry: GeoJSON.Geometry | null;
  geometry_type: string;
  location_name: string | null;
  vote_score: number;
  comment_count: number;
  category: Category | null;
}

interface ProjectMapProps {
  projects: ProjectWithCategory[];
  initialCenter?: [number, number]; // [lng, lat]
  initialZoom?: number;
}

export default function ProjectMap({
  projects,
  initialCenter = [-122.3321, 47.6062], // Seattle
  initialZoom = 11,
}: ProjectMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      setError('Mapbox token not found. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.');
      setIsLoading(false);
      return;
    }

    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.current.on('load', () => {
        if (map.current) {
          map.current.resize();
        }
        setIsLoading(false);

        projects.forEach((project) => {
          if (!project.geometry || !map.current) return;

          // Extract coordinates based on geometry type
          let coordinates: [number, number] | null = null;

          if (project.geometry.type === 'Point') {
            const coords = project.geometry.coordinates as [number, number];
            coordinates = coords;
          } else if (project.geometry.type === 'LineString') {
            // Use midpoint of line
            const coords = project.geometry.coordinates as [number, number][];
            if (coords.length > 0) {
              const midIndex = Math.floor(coords.length / 2);
              coordinates = coords[midIndex];
            }
          } else if (project.geometry.type === 'Polygon') {
            // Use centroid approximation (first point)
            const coords = project.geometry.coordinates as [number, number][][];
            if (coords.length > 0 && coords[0].length > 0) {
              coordinates = coords[0][0];
            }
          }

          if (!coordinates) return;

          // Create marker element with category color
          const markerEl = document.createElement('div');
          markerEl.className = 'custom-marker';
          markerEl.style.width = '32px';
          markerEl.style.height = '32px';
          markerEl.style.borderRadius = '50%';
          markerEl.style.backgroundColor = project.category?.color || '#16a34a';
          markerEl.style.border = '3px solid white';
          markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          markerEl.style.cursor = 'pointer';
          markerEl.style.display = 'flex';
          markerEl.style.alignItems = 'center';
          markerEl.style.justifyContent = 'center';

          // Add icon (simplified - using a dot)
          const iconEl = document.createElement('div');
          iconEl.style.width = '12px';
          iconEl.style.height = '12px';
          iconEl.style.borderRadius = '50%';
          iconEl.style.backgroundColor = 'white';
          markerEl.appendChild(iconEl);

          // Create popup
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
          }).setHTML(`
            <div style="padding: 12px; min-width: 250px;">
              <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${project.category?.color || '#16a34a'}; margin-top: 4px; flex-shrink: 0;"></div>
                <div style="flex: 1;">
                  <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #111827; line-height: 1.4;">
                    ${project.title}
                  </h3>
                  ${project.category ? `
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #6b7280;">
                      ${project.category.name}
                    </p>
                  ` : ''}
                </div>
              </div>

              ${project.description ? `
                <p style="margin: 8px 0; font-size: 14px; color: #374151; line-height: 1.5;">
                  ${project.description.substring(0, 150)}${project.description.length > 150 ? '...' : ''}
                </p>
              ` : ''}

              ${project.location_name ? `
                <p style="margin: 8px 0 4px 0; font-size: 13px; color: #6b7280;">
                  📍 ${project.location_name}
                </p>
              ` : ''}

              <div style="display: flex; gap: 12px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #6b7280;">
                <span>👍 ${project.vote_score}</span>
                <span>💬 ${project.comment_count}</span>
                <span class="badge-${project.status}" style="padding: 2px 8px; border-radius: 12px; font-size: 11px; background-color: #f3f4f6;">
                  ${project.status.replace('_', ' ')}
                </span>
              </div>

              <a
                href="/projects/${project.id}"
                style="display: block; margin-top: 12px; padding: 8px 12px; background-color: #16a34a; color: white; text-align: center; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;"
              >
                View Details
              </a>
            </div>
          `);

          // Add marker to map
          new mapboxgl.Marker(markerEl)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map.current!);
        });
      });

      map.current.on('error', () => {
        setError('Failed to load map. Please check your Mapbox token.');
        setIsLoading(false);
      });

    } catch (err) {
      setError('Failed to initialize map. Please check your configuration.');
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [projects, initialCenter, initialZoom]);

  return (
    <div className="absolute inset-0">
      {/* Map container - always rendered */}
      <div ref={mapContainer} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-400">Loading map...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
          <div className="text-center max-w-md p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Error</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="bg-gray-100 rounded-lg p-4 text-left">
              <p className="text-xs font-medium text-gray-700 mb-2">To fix this:</p>
              <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                <li>Get a free token from <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">Mapbox</a></li>
                <li>Add to .env.local: NEXT_PUBLIC_MAPBOX_TOKEN=your_token</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
