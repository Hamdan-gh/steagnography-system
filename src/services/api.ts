import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants';

class APIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
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
    try {
      return await this.get('/api/health');
    } catch (err: any) {
      // If proxied request failed (502 Bad Gateway) and a direct backend URL
      // is configured in Vercel env, attempt a direct call as a fallback.
      const isProxy502 = err?.response?.status === 502;
      const directBackend = (import.meta as any).env?.VITE_PROCESSING_ENGINE_URL;
      if (isProxy502 && directBackend && API_BASE_URL === '') {
        try {
          const resp = await axios.get(`${directBackend}/api/health`, { timeout: 10000 });
          return resp.data as { status: string; version: string };
        } catch (err2) {
          // Fall through to reject original error below
        }
      }
      return Promise.reject(err);
    }
  }
}

export const apiService = new APIService();
