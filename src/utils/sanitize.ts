/**
 * Input Sanitization Utilities
 * Prevents XSS attacks and ensures clean user input
 */
import DOMPurify from 'dompurify';

// ============================================
// SANITIZATION CONFIG
// ============================================

/**
 * Strict config - strips all HTML
 */
const STRICT_CONFIG = {
  ALLOWED_TAGS: [] as string[],
  ALLOWED_ATTR: [] as string[],
};

/**
 * Basic config - allows basic formatting
 */
const BASIC_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
  ALLOWED_ATTR: [] as string[],
};

/**
 * Rich config - allows more formatting for descriptions
 */
const RICH_CONFIG = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'target'],
};

// ============================================
// SANITIZATION FUNCTIONS
// ============================================

/**
 * Sanitize plain text input - removes ALL HTML
 * Use for: titles, names, single-line inputs
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), STRICT_CONFIG);
}

/**
 * Sanitize with basic formatting allowed
 * Use for: short descriptions, notes
 */
export function sanitizeBasic(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), BASIC_CONFIG);
}

/**
 * Sanitize with rich formatting
 * Use for: long descriptions, rich text content
 */
export function sanitizeRich(input: string): string {
  if (typeof input !== 'string') return '';
  return DOMPurify.sanitize(input.trim(), RICH_CONFIG);
}

/**
 * Sanitize URL - ensures valid and safe URL
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== 'string') return '';
  
  const trimmed = input.trim();
  
  // Check for javascript: or data: URLs (XSS vectors)
  const lowerUrl = trimmed.toLowerCase();
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('vbscript:')
  ) {
    console.warn('Blocked potentially malicious URL:', trimmed);
    return '';
  }
  
  // Validate URL structure
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    // If not a valid absolute URL, check if it's a relative path
    if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
      return trimmed;
    }
    // Try adding https://
    try {
      new URL(`https://${trimmed}`);
      return `https://${trimmed}`;
    } catch {
      return '';
    }
  }
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== 'string') return '';
  
  const trimmed = input.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (emailRegex.test(trimmed)) {
    return trimmed;
  }
  return '';
}

/**
 * Sanitize number input
 */
export function sanitizeNumber(
  input: string | number,
  options: { min?: number; max?: number; defaultValue?: number } = {}
): number {
  const { min = -Infinity, max = Infinity, defaultValue = 0 } = options;
  
  const num = typeof input === 'number' ? input : parseFloat(input);
  
  if (isNaN(num)) return defaultValue;
  return Math.min(Math.max(num, min), max);
}

/**
 * Sanitize color hex code
 */
export function sanitizeHexColor(input: string): string {
  if (typeof input !== 'string') return '#007AFF';
  
  const trimmed = input.trim();
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  
  if (hexRegex.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Try to fix common issues
  if (trimmed.match(/^[0-9A-Fa-f]{6}$/)) {
    return `#${trimmed.toUpperCase()}`;
  }
  
  return '#007AFF'; // Default accent color
}

/**
 * Escape HTML entities for display (not removal)
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  
  return input.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Truncate string with ellipsis
 */
export function truncate(input: string, maxLength: number): string {
  if (typeof input !== 'string') return '';
  if (input.length <= maxLength) return input;
  return `${input.slice(0, maxLength - 3)}...`;
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(input: string): string {
  if (typeof input !== 'string') return 'file';
  
  // Remove or replace invalid filename characters
  return input
    .trim()
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 255); // Max filename length
}

/**
 * Create a sanitized object from form data
 */
export function sanitizeFormData<T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, 'text' | 'basic' | 'rich' | 'url' | 'email' | 'number'>
): T {
  const result = { ...data };
  
  for (const [key, type] of Object.entries(schema) as [keyof T, string][]) {
    const value = data[key];
    
    switch (type) {
      case 'text':
        result[key] = sanitizeText(String(value)) as T[keyof T];
        break;
      case 'basic':
        result[key] = sanitizeBasic(String(value)) as T[keyof T];
        break;
      case 'rich':
        result[key] = sanitizeRich(String(value)) as T[keyof T];
        break;
      case 'url':
        result[key] = sanitizeUrl(String(value)) as T[keyof T];
        break;
      case 'email':
        result[key] = sanitizeEmail(String(value)) as T[keyof T];
        break;
      case 'number':
        result[key] = sanitizeNumber(value as string | number) as T[keyof T];
        break;
    }
  }
  
  return result;
}

export default {
  sanitizeText,
  sanitizeBasic,
  sanitizeRich,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeNumber,
  sanitizeHexColor,
  escapeHtml,
  truncate,
  sanitizeFilename,
  sanitizeFormData,
};
