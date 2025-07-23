import { API_BASE_URL } from '../config/api';
import { mockAuthAPI } from '../config/mock-api';

class ApiService {
  private backendAvailable: boolean | null = null;
  private checkingBackend = false;

  async checkBackendHealth(): Promise<boolean> {
    if (this.checkingBackend) {
      // Wait for existing check
      while (this.checkingBackend) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return this.backendAvailable || false;
    }

    this.checkingBackend = true;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      this.backendAvailable = response.ok;
      console.log(`🔌 Backend health check: ${this.backendAvailable ? 'OK' : 'FAILED'}`);
    } catch (error) {
      console.log('🔌 Backend not available, using mock API');
      this.backendAvailable = false;
    } finally {
      this.checkingBackend = false;
    }
    
    return this.backendAvailable;
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const isBackendAvailable = await this.checkBackendHealth();
    
    if (!isBackendAvailable) {
      // Use mock API for auth endpoints
      if (endpoint.includes('/auth/register') && options.method === 'POST') {
        const userData = JSON.parse(options.body as string);
        return await mockAuthAPI.register(userData);
      }
      
      if (endpoint.includes('/auth/login') && options.method === 'POST') {
        const loginData = JSON.parse(options.body as string);
        return await mockAuthAPI.login(loginData.email, loginData.password);
      }
      
      if (endpoint.includes('/email-verification/verify-code') && options.method === 'POST') {
        const verifyData = JSON.parse(options.body as string);
        return await mockAuthAPI.verifyEmail(verifyData.code);
      }
      
      // For other endpoints, throw error
      throw new Error('Backend not available and no mock implemented for this endpoint');
    }
    
    // Use real backend
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return await fetch(url, {
      ...options,
      headers: defaultHeaders,
    });
  }
}

export const apiService = new ApiService();
