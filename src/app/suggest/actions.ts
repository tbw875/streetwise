'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export interface SuggestProjectInput {
  title: string;
  description?: string;
  category_id?: string;
  latitude: number;
  longitude: number;
  location_name?: string;
  affected_streets?: string;
  neighborhood?: string;
}

export interface SuggestProjectResult {
  success: boolean;
  error?: string;
  projectId?: string;
}

export async function suggestProject(
  data: SuggestProjectInput
): Promise<SuggestProjectResult> {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'You must be logged in to suggest a project' };
  }

  // Validate required fields
  if (!data.title?.trim()) {
    return { success: false, error: 'Title is required' };
  }

  if (!data.latitude || !data.longitude) {
    return { success: false, error: 'Location is required. Click on the map to set a location.' };
  }

  // Validate latitude and longitude ranges
  if (data.latitude < -90 || data.latitude > 90) {
    return { success: false, error: 'Invalid latitude value' };
  }

  if (data.longitude < -180 || data.longitude > 180) {
    return { success: false, error: 'Invalid longitude value' };
  }

  // Create PostGIS point geometry from lat/lng
  const geometryWKT = `POINT(${data.longitude} ${data.latitude})`;

  // Insert project
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      source: 'user_suggestion',
      status: 'proposed',
      category_id: data.category_id || null,
      geometry: geometryWKT,
      geometry_type: 'point',
      location_name: data.location_name?.trim() || null,
      affected_streets: data.affected_streets?.trim() || null,
      neighborhood: data.neighborhood?.trim() || null,
      created_by: user.id,
      is_hidden: false,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating project:', error);
    return { success: false, error: 'Failed to create project. Please try again.' };
  }

  // Revalidate relevant pages
  revalidatePath('/projects');
  revalidatePath('/map');

  return { success: true, projectId: project.id };
}
