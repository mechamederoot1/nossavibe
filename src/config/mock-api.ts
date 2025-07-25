// Mock API for development when backend is not available
export const mockAuthAPI = {
  async register(userData: any) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful registration
    const mockUser = {
      id: Math.floor(Math.random() * 1000),
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      is_active: true,
      is_verified: false,
      created_at: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      display_id: Math.random().toString(36).substring(2, 12)
    };
    
    // Store in localStorage for demo
    localStorage.setItem('mock_user_id', mockUser.id.toString());
    localStorage.setItem('pendingVerificationUser', JSON.stringify(mockUser));
    localStorage.setItem('pendingVerificationEmail', userData.email);
    
    console.log('📧 Mock: Verification email would be sent to:', userData.email);
    console.log('📧 Mock: Verification code: 123456');
    
    return { ok: true, json: () => Promise.resolve(mockUser) };
  },

  async login(email: string, password: string) {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user exists in localStorage
    const mockUserId = localStorage.getItem('mock_user_id');
    if (mockUserId) {
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36);
      return {
        ok: true,
        json: () => Promise.resolve({
          access_token: mockToken,
          token_type: 'bearer'
        })
      };
    }
    
    throw new Error('User not found');
  },

  async verifyEmail(code: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (code === '123456') {
      const user = JSON.parse(localStorage.getItem('pendingVerificationUser') || '{}');
      user.is_verified = true;
      
      // Clear pending verification data
      localStorage.removeItem('pendingVerificationUser');
      localStorage.removeItem('pendingVerificationEmail');
      
      return { ok: true, json: () => Promise.resolve({ success: true, message: 'Email verified!' }) };
    }
    
    throw new Error('Invalid verification code');
  }
};

export const API_ENDPOINTS = {
  register: '/auth/register',
  login: '/auth/login',
  verifyEmail: '/email-verification/verify-code'
};
