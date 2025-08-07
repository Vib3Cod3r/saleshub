import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format name (first + last)
export function formatName(firstName: string, lastName: string) {
  if (!firstName && !lastName) return 'Unknown User';
  return `${firstName || ''} ${lastName || ''}`.trim();
}

// Get initials from name
export function getInitials(firstName: string, lastName: string) {
  if (!firstName && !lastName) return 'U';
  
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  return (first + last) || 'U';
}

// Format currency
export function formatCurrency(amount: number, currency = 'USD') {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Format percentage
export function formatPercentage(value: number, decimals = 1) {
  if (value === null || value === undefined) return '0%';
  
  return `${(value * 100).toFixed(decimals)}%`;
}

// Format date
export function formatDate(date: Date | string, format = 'short') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return d.toLocaleTimeString();
    case 'datetime':
      return d.toLocaleString();
    default:
      return d.toLocaleDateString();
  }
} 