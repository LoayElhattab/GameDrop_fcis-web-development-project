// tests/controllers/authController.test.js
const { registerUser, loginUser } = require('../../src/controllers/authController');
const prisma = require('../../src/config/db');
const passwordUtils = require('../../src/utils/passwordUtils');
const jwtUtils = require('../../src/utils/jwtUtils');

// Mock الدوال الخارجية
jest.mock('../../src/config/db', () => ({
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
}));

jest.mock('../../src/utils/passwordUtils', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../../src/utils/jwtUtils', () => ({
  generateToken: jest.fn(),
}));

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // === registerUser ===
  describe('registerUser', () => {
    it('should register a new user and return token', async () => {
      req.body = {
        username: 'test',
        email: 'test@example.com',
        password: 'password123'
      };

      passwordUtils.hashPassword.mockResolvedValue('hashed123');
      prisma.user.create.mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        role: 'CUSTOMER'
      });
      jwtUtils.generateToken.mockReturnValue('token123');

      await registerUser(req, res, next);

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('password123');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          username: 'test',
          email: 'test@example.com',
          password_hash: 'hashed123',
          role: 'CUSTOMER'
        }
      });
      expect(jwtUtils.generateToken).toHaveBeenCalledWith({ id: '1', role: 'CUSTOMER' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User registered',
        token: 'token123'
      }));
    });

    it('should handle duplicate email/username error (P2002)', async () => {
      req.body = {
        username: 'test',
        email: 'test@example.com',
        password: 'password123'
      };

      passwordUtils.hashPassword.mockResolvedValue('hashed123');
      prisma.user.create.mockRejectedValue({ code: 'P2002' });

      await registerUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Username or email already exists' });
    });
  });

  // === loginUser ===
  describe('loginUser', () => {
    it('should login existing user with correct password', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      prisma.user.findUnique.mockResolvedValue({
        id: '1',
        username: 'test',
        email: 'test@example.com',
        password_hash: 'hashed123',
        role: 'CUSTOMER'
      });

      passwordUtils.comparePassword.mockResolvedValue(true);
      jwtUtils.generateToken.mockReturnValue('token456');

      await loginUser(req, res, next);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith('password123', 'hashed123');
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Login successful',
        token: 'token456'
      }));
    });

    it('should return 401 if user not found or password is wrong', async () => {
      req.body = {
        email: 'wrong@example.com',
        password: 'wrongpass'
      };

      prisma.user.findUnique.mockResolvedValue(null); // no user

      await loginUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'invalid email or password' });
    });
  });
});
