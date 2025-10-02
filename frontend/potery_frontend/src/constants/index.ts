// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Pottery Store',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Khám phá thế giới gốm sứ nghệ thuật',
  VERSION: '1.0.0',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
} as const;

// Product Configuration
export const PRODUCT_CONFIG = {
  MAX_IMAGES: 5,
  MIN_RATING: 1,
  MAX_RATING: 5,
  DEFAULT_CURRENCY: 'VND',
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
} as const;
