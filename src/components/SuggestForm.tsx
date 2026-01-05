'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { suggestProject, type SuggestProjectInput } from '@/app/suggest/actions';
import type { Category } from '@/lib/types';

interface SuggestFormProps {
  categories: Category[];
}

export default function SuggestForm({ categories }: SuggestFormProps) {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  // Form state
  const [formData, setFormData] = useState<SuggestProjectInput>({
    title: '',
    description: '',
    category_id: '',
    latitude: 0,
    longitude: 0,
    location_name: '',
    affected_streets: '',
    neighborhood: '',
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSet, setLocationSet] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Track component mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mounted || map.current || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      setMapError('Mapbox token not configured. Please contact support.');
      setMapLoading(false);
      return;
    }

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-122.3321, 47.6062], // Seattle center
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setMapLoading(false);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please refresh the page.');
        setMapLoading(false);
      });

      // Add click handler to set location
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;

        // Update marker
        if (marker.current) {
          marker.current.setLngLat([lng, lat]);
        } else {
          marker.current = new mapboxgl.Marker({ color: '#2563eb' })
            .setLngLat([lng, lat])
            .addTo(map.current!);
        }

        // Update form state
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setLocationSet(true);
        setError(null);
      });
    } catch (err) {
      console.error('Map initialization error:', err);
      setMapError('Failed to initialize map. Please refresh the page.');
      setMapLoading(false);
    }

    return () => {
      map.current?.remove();
    };
  }, [mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await suggestProject(formData);

      if (result.success && result.projectId) {
        // Redirect to the new project page
        router.push(`/projects/${result.projectId}`);
      } else {
        setError(result.error || 'Failed to submit suggestion');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-2">
          Project Title <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          maxLength={200}
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Add protected bike lane on Broadway"
          className="input w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          A clear, concise title for your suggestion
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your project suggestion in detail. What problem does it solve? What would it look like?"
          className="input w-full resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Provide details about what you're suggesting and why it's needed
        </p>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category_id" className="block text-sm font-medium text-gray-900 mb-2">
          Category
        </label>
        <select
          id="category_id"
          name="category_id"
          value={formData.category_id}
          onChange={handleInputChange}
          className="input w-full"
        >
          <option value="">Select a category (optional)</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Help others find your suggestion by selecting a category
        </p>
      </div>

      {/* Location Map */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Location <span className="text-red-600">*</span>
        </label>
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden relative">
          <div ref={mapContainer} className="w-full h-96" />

          {/* Map Loading State */}
          {mapLoading && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading map...</p>
              </div>
            </div>
          )}

          {/* Map Error State */}
          {mapError && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <div className="text-center p-6">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">Map Error</h3>
                <p className="text-sm text-gray-600">{mapError}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {locationSet ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700">
                Location set: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
              </p>
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                Click anywhere on the map to set the project location
              </p>
            </>
          )}
        </div>
      </div>

      {/* Location Name */}
      <div>
        <label htmlFor="location_name" className="block text-sm font-medium text-gray-900 mb-2">
          Location Name
        </label>
        <input
          type="text"
          id="location_name"
          name="location_name"
          maxLength={200}
          value={formData.location_name}
          onChange={handleInputChange}
          placeholder="e.g., Broadway and Pine Street"
          className="input w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          A recognizable name or intersection for the location
        </p>
      </div>

      {/* Affected Streets */}
      <div>
        <label htmlFor="affected_streets" className="block text-sm font-medium text-gray-900 mb-2">
          Affected Streets
        </label>
        <textarea
          id="affected_streets"
          name="affected_streets"
          rows={3}
          value={formData.affected_streets}
          onChange={handleInputChange}
          placeholder="e.g., Broadway between Pine and Pike, including the intersection at Pike"
          className="input w-full resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Which streets or areas would be affected by this project?
        </p>
      </div>

      {/* Neighborhood */}
      <div>
        <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-900 mb-2">
          Neighborhood
        </label>
        <input
          type="text"
          id="neighborhood"
          name="neighborhood"
          maxLength={100}
          value={formData.neighborhood}
          onChange={handleInputChange}
          placeholder="e.g., Capitol Hill"
          className="input w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          The Seattle neighborhood where this project would be located
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-outline btn-md"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.title.trim() || !locationSet}
          className="btn-primary btn-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Suggestion'
          )}
        </button>
      </div>
    </form>
  );
}
