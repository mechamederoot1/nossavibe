import { API_BASE_URL } from '../config/api';
import { mockAuthAPI } from '../config/mock-api';

interface CacheEntry {
  data: any;
  timestamp: number;
  expiry: number;
}

class ApiService {
  private backendAvailable: boolean | null = null;
  private checkingBackend = false;
  private cache: Map<string, CacheEntry> = new Map();
  private retryAttempts = 3;
  private retryDelay = 1000;

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

  private generateCacheKey(endpoint: string, options: RequestInit = {}): string {
    const method = options.method || 'GET';
    const body = options.body || '';
    const auth = (options.headers as any)?.Authorization || '';
    return `${method}:${endpoint}:${body}:${auth.slice(-8)}`;
  }

  private shouldCache(endpoint: string, method: string = 'GET'): boolean {
    // Cache apenas GET requests para endpoints específicos
    if (method !== 'GET') return false;

    const cacheableEndpoints = ['/auth/me', '/posts', '/users/profile', '/stories'];
    return cacheableEndpoints.some(cacheable => endpoint.includes(cacheable));
  }

  private getFromCache(cacheKey: string): any | null {
    const entry = this.cache.get(cacheKey);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.data;
  }

  private setCache(cacheKey: string, data: any, ttl: number = 300000): void {
    // TTL padrão de 5 minutos
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl
    });

    // Limitar tamanho do cache
    if (this.cache.size > 100) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }
  }

  private async makeRequestWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      const response = await fetch(url, {
        ...options,
        timeout: 10000, // 10 segundos
      });

      // Se o response não for ok e pudermos tentar novamente
      if (!response.ok && attempt < this.retryAttempts && response.status >= 500) {
        console.log(`🔄 Retrying request to ${url}, attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.makeRequestWithRetry(url, options, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < this.retryAttempts) {
        console.log(`🔄 Retrying request to ${url} after error, attempt ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.makeRequestWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async makeRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const method = options.method || 'GET';
    const cacheKey = this.generateCacheKey(endpoint, options);

    // Verificar cache para GET requests
    if (this.shouldCache(endpoint, method)) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        console.log(`📱 Cache hit for ${endpoint}`);
        return new Response(JSON.stringify(cached), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' }
        });
      }
    }

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
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      ...options.headers,
    };

    const response = await this.makeRequestWithRetry(url, {
      ...options,
      headers: defaultHeaders,
    });

    // Cache response se aplicável
    if (this.shouldCache(endpoint, method) && response.ok) {
      try {
        const data = await response.clone().json();
        this.setCache(cacheKey, data);
        console.log(`💾 Cached response for ${endpoint}`);
      } catch (e) {
        // Ignorar erros de cache
      }
    }

    return response;
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ API cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }
}

export const apiService = new ApiService();

// Limpar cache periodicamente
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of apiService['cache'].entries()) {
    if (now > entry.expiry) {
      apiService['cache'].delete(key);
    }
  }
}, 60000); // A cada minuto
