import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalizedField<T extends Record<string, any>>(
  obj: T | null | undefined,
  baseField: string,
  language: string
): string {
  if (!obj) return '';
  if (language === 'ar' && obj[`${baseField}_ar`]) return obj[`${baseField}_ar`];
  if (language === 'en' && obj[`${baseField}_en`]) return obj[`${baseField}_en`];
  return obj[`${baseField}_fr`] || obj[baseField] || '';
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    eleve: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    enseignant: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    admin_ecole: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    parent: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    ministere: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };
  return colors[role] || 'bg-gray-100 text-gray-700';
}

export function getCycleColor(cycle: string): string {
  const colors: Record<string, string> = {
    primaire: 'from-amber-400 to-orange-500',
    college: 'from-blue-500 to-indigo-600',
    lycee: 'from-emerald-500 to-teal-600'
  };
  return colors[cycle] || 'from-gray-400 to-gray-500';
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

export function formatDate(date: string, locale = 'fr'): string {
  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-TN' : locale === 'en' ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
