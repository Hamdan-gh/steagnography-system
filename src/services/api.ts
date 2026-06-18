import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/** Production Render API — used when env var is not set on Vercel. */
const PRODUCTION_API_URL = 'https://stegagen-api.onrender.com';

class APIService {
  private client: AxiosInstance;

  constructor() {
    const baseURL =
      import.meta.env.VITE_PROCESSING_ENGINE_URL ||
      (import.meta.env.PROD ? PRODUCTION_API_URL : 'http://localhost:5000');

    this.client = axios.create({
      baseURL,
      timeout: 600000, // 10 minutes for processing (increased from 5)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('supabase_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Check health of processing engine
  async checkHealth(): Promise<{ status: string; version: string }> {
    return this.get('/api/health');
  }
}

export const apiService = new APIService();
