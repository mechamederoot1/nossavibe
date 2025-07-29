// Interceptor para APIs que retorna dados mock quando backend não está disponível
import { mockAuthService } from './MockAuthService';

export class MockInterceptor {
  static shouldUseMock(url: string): boolean {
    // Usar mock se for token mock ou se estiver em desenvolvimento
    const token = localStorage.getItem('token');
    return token?.startsWith('mock_token') || false;
  }

  static async mockFetch(url: string, options: any = {}): Promise<Response> {
    console.log(`🎭 Mocking API call: ${url}`);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    // Stories
    if (url.includes('/stories/')) {
      const stories = mockAuthService.generateMockStories();
      return new Response(JSON.stringify(stories), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Posts do usuário
    if (url.includes('/posts') || url.includes('/users/') && url.includes('/posts')) {
      const posts = mockAuthService.generateMockPosts();
      return new Response(JSON.stringify(posts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Depoimentos
    if (url.includes('/testimonials')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Perfil do usuário
    if (url.includes('/users/') && url.includes('/profile')) {
      const mockUser = mockAuthService.getMockUser();
      const profileData = {
        ...mockUser,
        first_name: mockUser.first_name,
        last_name: mockUser.last_name,
        is_verified: mockUser.verified,
        is_own_profile: true,
        is_friend: false,
        created_at: new Date().toISOString()
      };
      return new Response(JSON.stringify(profileData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Amigos
    if (url.includes('/friendships') || url.includes('/friends')) {
      const friends = mockAuthService.generateMockFriends();
      return new Response(JSON.stringify(friends), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Follow status
    if (url.includes('/follow/status')) {
      return new Response(JSON.stringify({ is_following: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Friendship status
    if (url.includes('/friendships/status')) {
      return new Response(JSON.stringify({ status: 'none' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Notificações
    if (url.includes('/notifications')) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Upload de arquivos
    if (options.method === 'POST' && url.includes('/upload')) {
      const mockUrl = 'https://picsum.photos/400/400?random=' + Date.now();
      return new Response(JSON.stringify({ 
        success: true, 
        file_path: mockUrl,
        url: mockUrl,
        avatar_url: mockUrl,
        cover_photo_url: mockUrl
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Atualização de perfil
    if (options.method === 'PUT' && url.includes('/users/me')) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Perfil atualizado com sucesso! (MOCK)',
        user: mockAuthService.getMockUser()
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Criação de posts/stories
    if (options.method === 'POST' && (url.includes('/posts') || url.includes('/stories'))) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Criado com sucesso! (MOCK)',
        id: Math.floor(Math.random() * 1000)
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default response
    console.log(`🚫 No mock available for: ${url}`);
    return new Response(JSON.stringify({ 
      error: 'Mock not implemented for this endpoint',
      url: url,
      method: options.method || 'GET'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Interceptar fetch global
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input.toString();
  
  // Se for uma requisição para localhost:8000 e temos token mock, usar mock
  if (url.includes('localhost:8000') && MockInterceptor.shouldUseMock(url)) {
    try {
      return await MockInterceptor.mockFetch(url, init);
    } catch (error) {
      console.error('Mock fetch error:', error);
      // Fallback para fetch original se mock falhar
    }
  }
  
  // Se não for mock ou falhar, usar fetch original
  try {
    return await originalFetch(input, init);
  } catch (error) {
    // Se fetch original falhar e temos um endpoint que podemos mockar, tentar mock
    if (url.includes('localhost:8000')) {
      console.log('🎭 Original fetch failed, trying mock as fallback...');
      return await MockInterceptor.mockFetch(url, init);
    }
    throw error;
  }
};

export default MockInterceptor;
