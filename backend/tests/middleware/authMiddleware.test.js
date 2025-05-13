const { protect, authorize } = require('../../src/middleware/authMiddleware');
const { verifyToken } = require('../../src/utils/jwtUtils');

jest.mock('../../src/utils/jwtUtils', () => ({
  verifyToken: jest.fn(),
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  // === protect ===
  describe('protect', () => {
    it('should return 401 if no token is provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'No token provided' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid_token';
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await protect(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('invalid_token');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should set req.user and call next if token is valid', async () => {
      req.headers.authorization = 'Bearer valid_token';
      const decodedUser = { id: 'user123', role: 'ADMIN' };
      verifyToken.mockReturnValue(decodedUser);

      await protect(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith('valid_token');
      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  // === authorize ===
  describe('authorize', () => {
    it('should return 403 if user role is not authorized', async () => {
      req.user = { id: 'user123', role: 'CUSTOMER' };
      const middleware = authorize('ADMIN');

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is authorized', async () => {
      req.user = { id: 'user123', role: 'ADMIN' };
      const middleware = authorize('ADMIN');

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user role is not in multiple authorized roles', async () => {
      req.user = { id: 'user123', role: 'CUSTOMER' };
      const middleware = authorize('ADMIN', 'MODERATOR');

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next if user role is in multiple authorized roles', async () => {
      req.user = { id: 'user123', role: 'MODERATOR' };
      const middleware = authorize('ADMIN', 'MODERATOR');

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});