// Core Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  created_at: string;
  avatar_url?: string;
}

export interface CoverImage {
  id: string;
  user_id: string;
  image_name: string;
  image_url: string;
  image_size: number;
  width?: number;
  height?: number;
  created_at: string;
}

export interface AudioFile {
  id: string;
  user_id: string;
  audio_name: string;
  audio_url: string;
  audio_size: number;
  duration: number;
  format?: string;
  created_at: string;
}

export interface StegoImage {
  id: string;
  user_id: string;
  cover_image_name: string;
  audio_file_name: string;
  stego_image_url: string;
  psnr: number;
  ssim: number;
  mse: number;
  capacity_used: number;
  capacity_total: number;
  ga_generations: number;
  ga_population_size: number;
  best_fitness: number;
  execution_time: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface ExtractionLog {
  id: string;
  user_id: string;
  stego_id?: string;
  stego_image_name: string;
  audio_name?: string;
  audio_url?: string;
  extracted_audio_size: number;
  original_audio_size?: number;
  extraction_time: number;
  execution_time?: number;
  status: 'success' | 'failed';
  error_message?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  description: string;
  ip_address?: string;
  created_at: string;
}

// Processing Types
export interface EmbeddingRequest {
  cover_image: File;
  audio_file: File;
  encryption_key: string;
  ga_generations?: number;
  ga_population_size?: number;
}

export interface EmbeddingResponse {
  stego_image_url: string;
  stego_image_base64: string;
  stego_id?: string;
  metrics: QualityMetrics;
  ga_results: GAResults;
  execution_time: number;
}

export interface ExtractionRequest {
  stego_image: File;
  encryption_key: string;
}

export interface ExtractionResponse {
  audio_url: string;
  audio_base64: string;
  audio_name: string;
  audio_size: number;
  execution_time: number;
  success: boolean;
}

export interface QualityMetrics {
  psnr: number;
  mse: number;
  ssim: number;
  capacity_used: number;
  capacity_total: number;
}

export interface GAResults {
  best_fitness: number;
  generations: number;
  population_size: number;
  convergence_data: number[];
  optimized_positions: number[];
  mode?: 'fast_lsb' | 'genetic_algorithm';
}

// Dashboard Types
export interface DashboardStats {
  total_hidden_files: number;
  extracted_files: number;
  images_processed: number;
  average_psnr: number;
  security_level: number;
}

export interface ActivityData {
  date: string;
  embeddings: number;
  extractions: number;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UploadProgress {
  file_name: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
}
