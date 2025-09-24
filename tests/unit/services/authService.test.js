const authService = require('../../../src/services/authService');

describe('AuthService', () => {
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      const token = authService.generateToken(user);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user data in token payload', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);
      
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);
      
      expect(decoded.id).toBe(user.id);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      // Generate token with very short expiry
      const token = authService.generateToken(user);
      
      // Mock Date.now to simulate time passing
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 25 * 60 * 60 * 1000); // 25 hours later

      expect(() => {
        authService.verifyToken(token);
      }).toThrow('Invalid token');

      Date.now = originalNow;
    });
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'testpassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'testpassword123';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hash = await authService.hashPassword(password);
      
      const isValid = await authService.comparePassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const authHeader = `Bearer ${token}`;
      
      const extractedToken = authService.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBe(token);
    });

    it('should return null for invalid Authorization header', () => {
      const authHeader = 'InvalidHeader token';
      const extractedToken = authService.extractTokenFromHeader(authHeader);
      expect(extractedToken).toBeNull();
    });

    it('should return null for missing Authorization header', () => {
      const extractedToken = authService.extractTokenFromHeader(null);
      expect(extractedToken).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      const extractedToken = authService.extractTokenFromHeader('');
      expect(extractedToken).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      const refreshToken = authService.generateRefreshToken(user);
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      expect(refreshToken.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include user ID and type in refresh token', () => {
      const user = {
        id: 1,
        email: 'test@example.com',
        role: 'NGO'
      };

      const refreshToken = authService.generateRefreshToken(user);
      const decoded = authService.verifyToken(refreshToken);
      
      expect(decoded.id).toBe(user.id);
      expect(decoded.type).toBe('refresh');
    });
  });
});