import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  endOfWeek, 
  addWeeks, 
  endOfMonth, 
  isWithinInterval, 
  parseISO,
  startOfDay
} from 'date-fns';
import type { UrgencyColor, ProjectStatus } from './types';

/**
 * Merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate urgency color based on date proximity
 * 
 * @param date - The deadline/event date (ISO string or Date)
 * @returns UrgencyColor - 'red' | 'yellow' | 'green' | 'gray'
 * 
 * Rules:
 * - Red: This week (through Sunday)
 * - Yellow: Next week
 * - Green: Rest of this month
 * - Gray: More than a month away
 */
export function getUrgencyColor(date: string | Date): UrgencyColor {
  const targetDate = typeof date === 'string' ? parseISO(date) : date;
  const now = startOfDay(new Date());
  const target = startOfDay(targetDate);
  
  // If date is in the past, show as gray
  if (target < now) {
    return 'gray';
  }
  
  const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Monday start
  const nextWeekEnd = addWeeks(thisWeekEnd, 1);
  const thisMonthEnd = endOfMonth(now);
  
  // This week (red)
  if (isWithinInterval(target, { start: now, end: thisWeekEnd })) {
    return 'red';
  }
  
  // Next week (yellow)
  if (isWithinInterval(target, { start: thisWeekEnd, end: nextWeekEnd })) {
    return 'yellow';
  }
  
  // This month (green)
  if (isWithinInterval(target, { start: nextWeekEnd, end: thisMonthEnd })) {
    return 'green';
  }
  
  // More than a month away (gray)
  return 'gray';
}

/**
 * Get display label for urgency
 */
export function getUrgencyLabel(color: UrgencyColor): string {
  switch (color) {
    case 'red':
      return 'This week';
    case 'yellow':
      return 'Next week';
    case 'green':
      return 'This month';
    case 'gray':
      return 'Later';
  }
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ProjectStatus): string {
  const labels: Record<ProjectStatus, string> = {
    proposed: 'Proposed',
    under_review: 'Under Review',
    planned: 'Planned',
    in_progress: 'In Progress',
    completed: 'Completed',
    rejected: 'Rejected',
    on_hold: 'On Hold',
  };
  return labels[status];
}

/**
 * Get Tailwind color class for status
 */
export function getStatusColorClass(status: ProjectStatus): string {
  const colors: Record<ProjectStatus, string> = {
    proposed: 'bg-violet-100 text-violet-800',
    under_review: 'bg-amber-100 text-amber-800',
    planned: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
    rejected: 'bg-red-100 text-red-800',
    on_hold: 'bg-gray-100 text-gray-800',
  };
  return colors[status];
}

/**
 * Get Tailwind color class for urgency
 */
export function getUrgencyColorClass(color: UrgencyColor): string {
  const colors: Record<UrgencyColor, string> = {
    red: 'bg-red-100 text-red-800 border-red-300',
    yellow: 'bg-amber-100 text-amber-800 border-amber-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[color];
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
  
  return formatDate(d);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
