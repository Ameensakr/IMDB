const filmController = require('../controllers/filmController');
const Film = require('../models/film');

// Mock dependencies
jest.mock('../models/film');

describe('Film Controller', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllFilms', () => {
    test('should render welcome view with films sorted by rating', async () => {
      // Arrange
      const mockFilms = [
        { 
          _id: 'film1',
          title: 'The Dark Knight',
          rating: 9.0
        },
        { 
          _id: 'film2',
          title: 'The Godfather',
          rating: 9.2
        }
      ];

      // Mock the Film.find() chain
      const mockSort = jest.fn().mockResolvedValue(mockFilms);
      Film.find = jest.fn().mockReturnValue({
        sort: mockSort
      });

      const req = {
        session: { 
          user: { name: 'Test User' },
          userId: 'user123'
        }
      };
      
      const res = {
        render: jest.fn()
      };

      // Act
      await filmController.getAllFilms(req, res);

      // Assert
      expect(Film.find).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ rating: -1 });
      expect(res.render).toHaveBeenCalledWith('welcome', {
        films: mockFilms,
        user: req.session.user
      });
    });

    test('should handle errors and render welcome with error message', async () => {
      // Arrange
      const errorMessage = 'Database error';
      Film.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      const req = { session: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };
      
      console.error = jest.fn(); // Mock console.error

      // Act
      await filmController.getAllFilms(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.render).toHaveBeenCalledWith('welcome', {
        error: 'Error fetching films'
      });
      expect(console.error).toHaveBeenCalled();
    });

    test('should use null user when session has no user', async () => {
      // Arrange
      const mockFilms = [{ title: 'Test Film' }];
      Film.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockFilms)
      });

      const req = { session: {} }; // No user in session
      const res = { render: jest.fn() };

      // Act
      await filmController.getAllFilms(req, res);

      // Assert
      expect(res.render).toHaveBeenCalledWith('welcome', {
        films: mockFilms,
        user: null
      });
    });
  });

  // Additional test for initializeFilms could be added here
  // But since it's called when the module is loaded and doesn't expose a return value,
  // it's more challenging to test in isolation
});
