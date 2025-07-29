// Mock service para desenvolvimento - simula login e dados do usuário
export class MockAuthService {
  private static instance: MockAuthService;
  private mockUser = {
    id: 1,
    name: "Usuario Teste",
    email: "teste@mail.com",
    first_name: "Usuario",
    last_name: "Teste",
    username: "usuario_teste",
    bio: "Este é um usuário de teste para desenvolvimento. Pode navegar livremente pela aplicação!",
    location: "São Paulo, Brasil",
    website: "https://exemplo.com",
    work: "Desenvolvedor",
    education: "Universidade de Exemplo",
    avatar: null,
    cover_photo: null,
    verified: true,
    is_active: true,
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    token: "mock_token_12345",
    friends_count: 42,
    posts_count: 15,
    followers_count: 128,
    following_count: 89
  };

  public static getInstance(): MockAuthService {
    if (!MockAuthService.instance) {
      MockAuthService.instance = new MockAuthService();
    }
    return MockAuthService.instance;
  }

  public async mockLogin(email: string, password: string) {
    console.log("🎭 Using MOCK AUTH SERVICE");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password ? "***" : "empty");

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Aceitar qualquer email/senha para desenvolvimento
    if (email && password) {
      console.log("✅ Mock login successful!");
      return {
        success: true,
        user: this.mockUser,
        token: this.mockUser.token
      };
    } else {
      console.log("❌ Mock login failed - missing credentials");
      throw new Error("Email e senha são obrigatórios");
    }
  }

  public async mockRegister(userData: any) {
    console.log("🎭 Using MOCK REGISTER SERVICE");
    console.log("👤 User data:", userData);

    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));

    const newUser = {
      ...this.mockUser,
      first_name: userData.first_name || "Novo",
      last_name: userData.last_name || "Usuario",
      email: userData.email || "novo@mail.com",
      name: `${userData.first_name || "Novo"} ${userData.last_name || "Usuario"}`
    };

    console.log("✅ Mock register successful!");
    return {
      success: true,
      user: newUser,
      token: newUser.token
    };
  }

  public getMockUser() {
    return this.mockUser;
  }

  public generateMockPosts() {
    return [
      {
        id: 1,
        author: {
          id: this.mockUser.id,
          first_name: this.mockUser.first_name,
          last_name: this.mockUser.last_name,
          avatar: this.mockUser.avatar
        },
        content: "Este é um post de exemplo! 🎉 Testando a interface do Vibe Social.",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        reactions_count: 15,
        comments_count: 3,
        shares_count: 2,
        post_type: "post",
        media_type: null,
        media_url: null
      },
      {
        id: 2,
        author: {
          id: 2,
          first_name: "Maria",
          last_name: "Silva",
          avatar: null
        },
        content: "Bom dia pessoal! Como estão? ☀️",
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        reactions_count: 8,
        comments_count: 1,
        shares_count: 0,
        post_type: "post",
        media_type: null,
        media_url: null
      },
      {
        id: 3,
        author: {
          id: 3,
          first_name: "João",
          last_name: "Santos",
          avatar: null
        },
        content: "Compartilhando uma foto incrível que tirei hoje! 📸",
        created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        reactions_count: 23,
        comments_count: 7,
        shares_count: 4,
        post_type: "post",
        media_type: "image",
        media_url: "https://picsum.photos/600/400?random=1"
      }
    ];
  }

  public generateMockStories() {
    return [
      {
        id: "1",
        author: {
          id: this.mockUser.id,
          first_name: this.mockUser.first_name,
          last_name: this.mockUser.last_name,
          avatar: this.mockUser.avatar
        },
        content: "Testando stories! 🎊",
        media_type: "text",
        media_url: null,
        background_color: "#667eea",
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        views_count: 12,
        viewed_by_user: false
      },
      {
        id: "2",
        author: {
          id: 2,
          first_name: "Maria",
          last_name: "Silva",
          avatar: null
        },
        content: "Meu café da manhã! ☕",
        media_type: "image",
        media_url: "https://picsum.photos/400/600?random=2",
        background_color: null,
        created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
        views_count: 8,
        viewed_by_user: true
      }
    ];
  }

  public generateMockFriends() {
    return [
      {
        id: 2,
        first_name: "Maria",
        last_name: "Silva",
        username: "maria_silva",
        avatar: null,
        is_verified: false,
        mutual_friends: 5
      },
      {
        id: 3,
        first_name: "João",
        last_name: "Santos",
        username: "joao_santos",
        avatar: null,
        is_verified: true,
        mutual_friends: 12
      },
      {
        id: 4,
        first_name: "Ana",
        last_name: "Costa",
        username: "ana_costa",
        avatar: null,
        is_verified: false,
        mutual_friends: 3
      }
    ];
  }
}

export const mockAuthService = MockAuthService.getInstance();
