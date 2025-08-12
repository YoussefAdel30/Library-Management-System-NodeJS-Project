// tests/books/book.test.js

const bookController = require('../../controllers/bookController');
const Book = require('../../models/bookModel');

// Mock all methods used in bookController from bookModel
// This replaces actual DB calls with mock functions that we can control
jest.mock('../../models/bookModel');

describe('Books Controller', () => {
  // Declare reusable variables for mock req, res, next
  let req, res, next;

  beforeEach(() => {
    // Reset req, res, next before each test
    req = {};
    res = {
      // Mock res.status to return res to allow chaining: res.status(...).json(...)
      status: jest.fn().mockReturnThis(),
      json: jest.fn(), // mock res.json to track calls and arguments
    };
    next = jest.fn(); // mock next middleware for error handling
    jest.clearAllMocks(); // clear any previous mocks to avoid test pollution
  });

  // Test suite for the getAll controller method
  describe('getAll', () => {
    it('should return all books', async () => {
      // Setup fake data to be returned by mocked Book.findAll
      const fakeBooks = [{ book_id: 1, title: 'Book1' }, { book_id: 2, title: 'Book2' }];
      Book.findAll.mockResolvedValue(fakeBooks); // mock successful DB call returning fakeBooks

      await bookController.getAll(req, res, next); // call controller method

      expect(Book.findAll).toHaveBeenCalled(); // assert Book.findAll was called
      expect(res.json).toHaveBeenCalledWith(fakeBooks); // assert res.json called with fakeBooks
      expect(next).not.toHaveBeenCalled(); // no errors, so next should not be called
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      Book.findAll.mockRejectedValue(error); // mock DB call that rejects with an error

      await bookController.getAll(req, res, next);

      expect(next).toHaveBeenCalledWith(error); // expect error passed to next()
    });
  });

  // Test suite for getById controller method
  describe('getById', () => {
    it('should return book when found', async () => {
      req.params = { id: 1 };
      const book = { book_id: 1, title: 'Book1' };
      Book.findById.mockResolvedValue(book); // mock findById returns a book

      await bookController.getById(req, res, next);

      expect(Book.findById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(book);
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 404 if book not found', async () => {
      req.params = { id: 99 };
      Book.findById.mockResolvedValue(null); // mock not found

      await bookController.getById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book not found' });
    });

    it('should call next on error', async () => {
      const error = new Error('DB error');
      Book.findById.mockRejectedValue(error);
      req.params = { id: 1 };

      await bookController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // Test suite for create controller method
  describe('create', () => {
    it('should create a new book and return 201', async () => {
      const newBook = { title: 'New Book', author: 'Author', isbn: '1234567890123', available_quantity: 5 };
      req.body = newBook;
      const createdBook = { ...newBook, book_id: 1 };
      Book.create.mockResolvedValue(createdBook); // mock successful creation

      await bookController.create(req, res, next);

      expect(Book.create).toHaveBeenCalledWith(newBook);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdBook);
    });

    it('should handle duplicate ISBN error with 409', async () => {
      const newBook = { title: 'New Book', author: 'Author', isbn: '1234567890123', available_quantity: 5 };
      req.body = newBook;
      const err = { code: '23505' }; // simulate Postgres unique violation error code
      Book.create.mockRejectedValue(err);

      await bookController.create(req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'ISBN or unique field already exists' });
    });

    it('should call next on other errors', async () => {
      const err = new Error('DB error');
      Book.create.mockRejectedValue(err);
      req.body = { title: 'Fail Book' };

      await bookController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // Test suite for update controller method
  describe('update', () => {
    it('should update book if found', async () => {
      req.params = { id: 1 };
      req.body = { title: 'Updated Title' };
      const updatedBook = { book_id: 1, title: 'Updated Title' };
      Book.update.mockResolvedValue(updatedBook);

      await bookController.update(req, res, next);

      expect(Book.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith(updatedBook);
    });

    it('should return 404 if book not found', async () => {
      req.params = { id: 99 };
      Book.update.mockResolvedValue(null);

      await bookController.update(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book not found' });
    });

    it('should call next on error', async () => {
      const err = new Error('DB error');
      Book.update.mockRejectedValue(err);
      req.params = { id: 1 };
      req.body = { title: 'Fail Update' };

      await bookController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // Test suite for remove controller method
  describe('remove', () => {
    it('should delete book if found', async () => {
      req.params = { id: 1 };
      Book.remove.mockResolvedValue(true); // mock successful delete

      await bookController.remove(req, res, next);

      expect(Book.remove).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({ message: 'Book deleted' });
    });

    it('should return 404 if book not found', async () => {
      req.params = { id: 99 };
      Book.remove.mockResolvedValue(false); // mock book not found

      await bookController.remove(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Book not found' });
    });

    it('should call next on error', async () => {
      const err = new Error('DB error');
      Book.remove.mockRejectedValue(err);
      req.params = { id: 1 };

      await bookController.remove(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  // Test suite for search controller method
  describe('search', () => {
    it('should return search results', async () => {
      req.query = { title: 'Test' };
      const results = [{ book_id: 1, title: 'Test Book' }];
      Book.search.mockResolvedValue(results);

      await bookController.search(req, res, next);

      expect(Book.search).toHaveBeenCalledWith({ title: 'Test', author: undefined, isbn: undefined });
      expect(res.json).toHaveBeenCalledWith(results);
    });

    it('should call next on error', async () => {
      const err = new Error('DB error');
      Book.search.mockRejectedValue(err);
      req.query = { title: 'Fail' };

      await bookController.search(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
