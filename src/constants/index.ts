// Application Constants
export const APP_NAME = 'StegaGen Secure';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Audio Steganography with Genetic Algorithm Optimization';

// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_PROCESSING_ENGINE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  EMBED: '/api/embed',
  EXTRACT: '/api/extract',
  ANALYZE: '/api/analyze',
  HEALTH: '/api/health',
} as const;

// File Constraints
export const FILE_CONSTRAINTS = {
  MAX_IMAGE_SIZE: 100 * 1024 * 1024, // 100MB (increased for large stego images)
  MAX_AUDIO_SIZE: 20 * 1024 * 1024, // 20MB (increased from 10MB)
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB (increased from 2MB)
  SUPPORTED_IMAGE_FORMATS: ['image/png', 'image/jpeg', 'image/jpg'],
  SUPPORTED_AUDIO_FORMATS: ['audio/wav', 'audio/mp3', 'audio/mpeg'],
  MIN_IMAGE_DIMENSION: 512,
} as const;

// Genetic Algorithm Defaults (Optimized for speed)
export const GA_DEFAULTS = {
  POPULATION_SIZE: 20,
  GENERATIONS: 30,
  MUTATION_RATE: 0.1,
  CROSSOVER_RATE: 0.8,
  TOURNAMENT_SIZE: 3,
} as const;

// Quality Thresholds
export const QUALITY_THRESHOLDS = {
  PSNR_EXCELLENT: 40,
  PSNR_GOOD: 35,
  PSNR_ACCEPTABLE: 30,
  SSIM_EXCELLENT: 0.95,
  SSIM_GOOD: 0.90,
  SSIM_ACCEPTABLE: 0.85,
} as const;

// Color Palette
export const COLORS = {
  primary: '#2563EB',
  secondary: '#0F172A',
  accent: '#06B6D4',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8FAFC',
  cardBg: 'rgba(255, 255, 255, 0.8)',
  cardBgDark: 'rgba(15, 23, 42, 0.8)',
} as const;

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  EMBED: '/embed',
  EXTRACT: '/extract',
  HISTORY: '/history',
  ADMIN: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];

// User Roles
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

// Storage Buckets
export const STORAGE_BUCKETS = {
  IMAGES: 'images',
  AUDIO: 'audio',
  STEGO: 'stego-images',
} as const;

// Table Names
export const TABLES = {
  USERS: 'users',
  IMAGES: 'images',
  AUDIO_FILES: 'audio_files',
  STEGO_IMAGES: 'stego_images',
  EXTRACTION_LOGS: 'extraction_logs',
  AUDIT_LOGS: 'audit_logs',
} as const;

// Toast Duration
export const TOAST_DURATION = 5000;

// Pagination
export const ITEMS_PER_PAGE = 10;
