const userController = require('../controllers/userController');
const User = require('../models/user');

// Mock dependencies
jest.mock('../models/user');

describe('User Controller Tests', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    test('should create a new user and redirect to login page', async () => {
      // Arrange
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          mobile: '1234567890',
          gender: 'male',
          password: 'password123',
          confirmPassword: 'password123'
        },
        session: {}
      };
      
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      // Mock User.findOne to return null (no existing user)
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Mock User constructor and save method
      const mockUserInstance = {
        _id: 'user123',
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        save: jest.fn().mockResolvedValue(true)
      };
      
      User.mockImplementation(() => mockUserInstance);

      // Act
      await userController.signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(req.session.user).toBeDefined();
      expect(req.session.user.id).toBe('user123');
      expect(res.redirect).toHaveBeenCalledWith('/index');
    });

    test('should return error when passwords do not match', async () => {
      // Arrange
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          mobile: '1234567890',
          gender: 'male',
          password: 'password123',
          confirmPassword: 'different123'
        },
        session: {}
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };

      // Act
      await userController.signup(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('signup', {
        error: 'Passwords do not match',
        formData: expect.objectContaining({})
      });
    });

    test('should return error when email already exists', async () => {
      // Arrange
      const req = {
        body: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          mobile: '1234567890',
          gender: 'male',
          password: 'password123',
          confirmPassword: 'password123'
        },
        session: {}
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      // Mock User.findOne to return an existing user
      User.findOne = jest.fn().mockResolvedValue({ email: 'existing@example.com' });

      // Act
      await userController.signup(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('signup', {
        error: 'Email already registered',
        formData: expect.objectContaining({
          email: req.body.email
        })
      });
    });
  });

  describe('login', () => {
    test('should authenticate user and redirect to welcome page', async () => {
      // Arrange
      const req = {
        body: {
          email: 'john@example.com',
          password: 'password123'
        },
        session: {}
      };
      
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      // Mock user in database
      const mockUser = {
        _id: 'user123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act
      await userController.login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: req.body.email });
      expect(req.session.userId).toBe('user123');
      expect(req.session.user).toBeDefined();
      expect(res.redirect).toHaveBeenCalledWith('/welcome');
    });

    test('should return error for invalid email', async () => {
      // Arrange
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        },
        session: {}
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      User.findOne = jest.fn().mockResolvedValue(null);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('index', {
        error: 'Invalid email or password',
        formData: { email: req.body.email }
      });
    });

    test('should return error for invalid password', async () => {
      // Arrange
      const req = {
        body: {
          email: 'john@example.com',
          password: 'wrongpassword'
        },
        session: {}
      };
      
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      // Mock user in database with different password
      const mockUser = {
        _id: 'user123',
        email: 'john@example.com',
        password: 'password123'
      };
      
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Act
      await userController.login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.render).toHaveBeenCalledWith('index', {
        error: 'Invalid email or password',
        formData: { email: req.body.email }
      });
    });
  });

  describe('logout', () => {
    test('should destroy session and redirect to home page', () => {
      // Arrange
      const req = {
        session: {
          destroy: jest.fn(callback => callback())
        }
      };
      
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Act
      userController.logout(req, res);

      // Assert
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith('/');
    });

    test('should handle error during session destruction', () => {
      // Arrange
      const req = {
        session: {
          destroy: jest.fn(callback => callback(new Error('Session destroy error')))
        }
      };
      
      const res = {
        redirect: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };

      // Act
      userController.logout(req, res);

      // Assert
      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith('Error logging out');
    });
  });
});
