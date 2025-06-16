const request = require('supertest');
const express = require('express');

// Mock modules before importing routes
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn()
  }
}));

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('multer', () => {
  return jest.fn().mockImplementation(() => ({
    single: jest.fn().mockImplementation(() => (req, res, next) => {
      req.file = { path: 'http://example.com/image.jpg' };
      next();
    })
  }));
});

// Mock the models
jest.mock('../models/Book', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({})
  }));
});

jest.mock('../models/Trash', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({})
  }));
});

jest.mock('../models/Tag', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({})
  }));
});

jest.mock('../models/Favorite', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({})
  }));
});

jest.mock('../models/Quote', () => {
    return jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({})
    }));
  });  

jest.mock('../models/Rereader', () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue({})
  }));
});

// Now import the router
const bookRoutes = require('../routes/books');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/books', bookRoutes);

// Mock models with static methods
const Book = require('../models/Book');
const Trash = require('../models/Trash');
const Tags = require('../models/Tag');
const Favorite = require('../models/Favorite');
const Quote = require('../models/Quote');
const Rereader = require('../models/Rereader');

// Add static methods to mocks
Book.find = jest.fn();
Book.findOne = jest.fn();
Book.findById = jest.fn();
Book.findOneAndUpdate = jest.fn();
Book.deleteMany = jest.fn();

Trash.find = jest.fn();
Trash.findOne = jest.fn();
Trash.deleteOne = jest.fn();
Trash.deleteMany = jest.fn();

Tags.find = jest.fn();
Tags.findOneAndDelete = jest.fn();
Tags.deleteMany = jest.fn();

Favorite.find = jest.fn();
Favorite.findOne = jest.fn();
Favorite.deleteOne = jest.fn();

Quote.find = jest.fn().mockImplementation(() => ({
  sort: jest.fn().mockResolvedValue([])
}));
Quote.findOneAndDelete = jest.fn();

Rereader.find = jest.fn().mockImplementation(() => ({
  sort: jest.fn().mockResolvedValue([])
}));

describe('Book Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('GET /books', () => {
    it('should return all books for a reader', async () => {
      const mockBooks = [
        { bookid: 1, book_name: 'Test Book 1', author_name: 'Author 1' },
        { bookid: 2, book_name: 'Test Book 2', author_name: 'Author 2' }
      ];
      
      Book.find.mockResolvedValue(mockBooks);
      
      const response = await request(app)
        .get('/books')
        .query({ readerid: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ books: mockBooks });
      expect(Book.find).toHaveBeenCalledWith({ readerid: 123 });
    });
    
    it('should return 400 if readerid is not provided', async () => {
      const response = await request(app).get('/books');
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Reader ID is required' });
    });
    
    it('should return 500 if database error occurs', async () => {
      Book.find.mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .get('/books')
        .query({ readerid: 123 });
      
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error fetching books');
    });
  });

  describe('GET /books/:id', () => {
    it('should return a book and its tags by ID', async () => {
      const mockBook = { bookid: 1, book_name: 'Test Book', author_name: 'Author' };
      const mockTags = [{ bookid: 1, tag: 'fiction' }, { bookid: 1, tag: 'mystery' }];
      
      Book.findOne.mockResolvedValue(mockBook);
      Tags.find.mockResolvedValue(mockTags);
      
      const response = await request(app).get('/books/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ book: mockBook, tags: mockTags });
      expect(Book.findOne).toHaveBeenCalledWith({ bookid: '1' });
      expect(Tags.find).toHaveBeenCalledWith({ bookid: 1 });
    });
    
    it('should return 404 if book not found', async () => {
      Book.findOne.mockResolvedValue(null);
      Book.findById.mockResolvedValue(null);
      
      const response = await request(app).get('/books/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Book not found' });
    });
  });

  describe('POST /books/add', () => {
    it('should return 400 if readerid is missing', async () => {
      const response = await request(app)
        .post('/books/add')
        .field('book_name', 'New Book')
        .field('author_name', 'New Author');
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Reader ID is required' });
    });
  });

  describe('PUT /books/:id', () => {
    it('should update book rating and review', async () => {
      const mockBook = {
        bookid: 1,
        book_name: 'Test Book',
        book_rating: 4,
        book_review: 'Updated review'
      };
      
      Book.findOneAndUpdate.mockResolvedValue(mockBook);
      
      const response = await request(app)
        .put('/books/1')
        .send({ book_rating: 4, book_review: 'Updated review' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Book updated successfully!', book: mockBook });
      expect(Book.findOneAndUpdate).toHaveBeenCalledWith(
        { bookid: '1' },
        { book_rating: 4, book_review: 'Updated review' },
        { new: true }
      );
    });
    
    it('should return 404 if book not found for update', async () => {
      Book.findOneAndUpdate.mockResolvedValue(null);
      
      const response = await request(app)
        .put('/books/999')
        .send({ book_rating: 4, book_review: 'Updated review' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Book not found' });
    });
  });

  describe('PUT /books/:id/update-pages', () => {
    it('should update pages read', async () => {
      const mockBook = {
        bookid: 1,
        book_name: 'Test Book',
        total_pages: 300,
        currently_read: 50,
        reading_status: 'Reading',
        save: jest.fn().mockResolvedValue({})
      };
      
      Book.findOne.mockResolvedValue(mockBook);
      
      const response = await request(app)
        .put('/books/1/update-pages')
        .send({ pagesRead: 20 });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reading progress updated!');
      expect(mockBook.save).toHaveBeenCalled();
    });
    
    it('should update status to "Completed" when all pages are read', async () => {
      const mockBook = {
        bookid: 1,
        book_name: 'Test Book',
        total_pages: 100,
        currently_read: 80,
        reading_status: 'Reading',
        save: jest.fn().mockResolvedValue({})
      };
      
      Book.findOne.mockResolvedValue(mockBook);
      
      const response = await request(app)
        .put('/books/1/update-pages')
        .send({ pagesRead: 30 });
      
      expect(response.status).toBe(200);
      expect(mockBook.reading_status).toBe('Completed');
      expect(mockBook.currently_read).toBe(100); // Should be capped at total_pages
      expect(mockBook.save).toHaveBeenCalled();
    });
  });

  describe('POST /books/trash', () => {
    it('should move a book to trash', async () => {
      const mockBook = {
        bookid: 1,
        readerid: 123,
        reading_status: 'Reading',
        save: jest.fn().mockResolvedValue({})
      };
      
      Book.findOne.mockResolvedValue(mockBook);
      Trash.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/books/trash')
        .send({ bookId: 1, readerId: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Book moved to trash successfully' });
      expect(mockBook.reading_status).toBe('Trash');
      expect(mockBook.save).toHaveBeenCalled();
    });
    
    it('should return 404 if book not found', async () => {
      Book.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/books/trash')
        .send({ bookId: 999, readerId: 123 });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Book not found' });
    });
  });

  describe('POST /books/trash/restore', () => {
    it('should restore books from trash', async () => {
      const mockTrashedBooks = [
        { bookId: 1, readerId: 123, prevReadingStatus: 'Reading' },
        { bookId: 2, readerId: 123, prevReadingStatus: 'To Read' }
      ];
      
      const mockBooks = [
        { 
          bookid: 1, 
          reading_status: 'Trash',
          save: jest.fn().mockResolvedValue({})
        },
        { 
          bookid: 2, 
          reading_status: 'Trash',
          save: jest.fn().mockResolvedValue({})
        }
      ];
      
      Trash.find.mockResolvedValue(mockTrashedBooks);
      Book.findOne.mockImplementation((query) => {
        const bookId = query.bookid;
        return mockBooks.find(book => book.bookid === bookId);
      });
      Trash.deleteOne.mockResolvedValue({});
      
      const response = await request(app)
        .post('/books/trash/restore')
        .send({ bookIds: [1, 2] });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Books restored successfully' });
      expect(mockBooks[0].reading_status).toBe('Reading');
      expect(mockBooks[1].reading_status).toBe('To Read');
      expect(Trash.deleteOne).toHaveBeenCalledTimes(2);
    });
  });

  describe('POST /books/trash/delete', () => {
    it('should permanently delete books', async () => {
      Trash.deleteMany.mockResolvedValue({});
      Book.deleteMany.mockResolvedValue({});
      Tags.deleteMany.mockResolvedValue({});
      
      const response = await request(app)
        .post('/books/trash/delete')
        .send({ bookIds: [1, 2] });
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('Books and related tags permanently deleted.');
      expect(Trash.deleteMany).toHaveBeenCalledWith({ bookId: { $in: [1, 2] } });
      expect(Book.deleteMany).toHaveBeenCalledWith({ bookid: { $in: [1, 2] } });
      expect(Tags.deleteMany).toHaveBeenCalledWith({ bookid: { $in: [1, 2] } });
    });
  });

  describe('POST /books/favorite', () => {
    it('should add a book to favorites', async () => {
      const mockBook = { bookid: 1, readerid: 123 };
      
      Book.findOne.mockResolvedValue(mockBook);
      Favorite.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/books/favorite')
        .send({ bookId: 1, readerId: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 
        message: 'Book added to favorites',
        isFavorite: true 
      });
    });
    
    it('should remove a book from favorites', async () => {
      const mockBook = { bookid: 1, readerid: 123 };
      const mockFavorite = { bookId: 1, readerId: 123 };
      
      Book.findOne.mockResolvedValue(mockBook);
      Favorite.findOne.mockResolvedValue(mockFavorite);
      Favorite.deleteOne.mockResolvedValue({});
      
      const response = await request(app)
        .post('/books/favorite')
        .send({ bookId: 1, readerId: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ 
        message: 'Book removed from favorites',
        isFavorite: false 
      });
      expect(Favorite.deleteOne).toHaveBeenCalledWith({ bookId: 1, readerId: 123 });
    });
  });

  describe('GET /books/:id/quotes', () => {
    it('should get quotes for a book', async () => {
      const mockQuotes = [
        { quoteId: 1, bookId: 1, quote: 'Test quote 1' },
        { quoteId: 2, bookId: 1, quote: 'Test quote 2' }
      ];
      
      // Reset the mock implementation for this test
      Quote.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockQuotes)
      });
      
      const response = await request(app).get('/books/1/quotes');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockQuotes);
    });
  });

  describe('POST /books/:id/quotes', () => {
    it('should add a quote to a book', async () => {
      const mockQuote = { 
        quoteId: 1, 
        bookId: 1, 
        quote: 'Test quote' 
      };
      
      // Create a new Quote instance with a save method that returns the mockQuote
      const QuoteInstance = new Quote();
      QuoteInstance.save = jest.fn().mockResolvedValue(mockQuote);
      
      // Mock the Quote constructor to return our instance
      Quote.mockImplementation(() => QuoteInstance);
      
      const response = await request(app)
        .post('/books/1/quotes')
        .send({ quote: 'Test quote' });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockQuote);
    });
    
    it('should return 400 if quote text is not provided', async () => {
      const response = await request(app)
        .post('/books/1/quotes')
        .send({});
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Quote text is required' });
    });
  });

  describe('DELETE /books/quotes/:quoteId', () => {
    it('should delete a quote', async () => {
      Quote.findOneAndDelete.mockResolvedValue({ quoteId: 1 });
      
      const response = await request(app).delete('/books/quotes/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Quote deleted successfully' });
    });
    
    it('should return 404 if quote not found', async () => {
      Quote.findOneAndDelete.mockResolvedValue(null);
      
      const response = await request(app).delete('/books/quotes/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Quote not found' });
    });
  });

  describe('POST /books/:id/tags', () => {
    it('should add a tag to a book', async () => {
      const mockBook = { bookid: 1 };
      const mockTag = { bookid: 1, tag: 'fiction' };
      
      Book.findOne.mockResolvedValue(mockBook);
      
      // Create a new Tags instance with a save method that returns the mockTag
      const TagsInstance = new Tags();
      TagsInstance.save = jest.fn().mockResolvedValue(TagsInstance);
      
      // Mock the Tags constructor to return our instance
      Tags.mockImplementation(() => TagsInstance);
      
      // Mock the toObject method to return the mockTag
      TagsInstance.toObject = jest.fn().mockReturnValue(mockTag);
      
      // Also mock the JSON method to return the mockTag
      TagsInstance.toJSON = jest.fn().mockReturnValue(mockTag);
      
      const response = await request(app)
        .post('/books/1/tags')
        .send({ tag: 'fiction' });
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockTag);
    });
    
    it('should return 404 if book not found', async () => {
      Book.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/books/999/tags')
        .send({ tag: 'fiction' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Book not found' });
    });
  });

  describe('DELETE /books/:id/tags', () => {
    it('should delete a tag from a book', async () => {
      Tags.findOneAndDelete.mockResolvedValue({ bookid: 1, tag: 'fiction' });
      
      const response = await request(app)
        .delete('/books/1/tags')
        .send({ tag: 'fiction' });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Tag deleted successfully' });
    });
    
    it('should return 404 if tag not found', async () => {
      Tags.findOneAndDelete.mockResolvedValue(null);
      
      const response = await request(app)
        .delete('/books/1/tags')
        .send({ tag: 'nonexistent' });
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Tag not found for this book' });
    });
  });

  describe('POST /books/:id/reread', () => {
    it('should mark a book for rereading', async () => {
      const mockBook = {
        bookid: 1,
        reading_status: 'Completed',
        start_date: '2023-01-01',
        end_date: '2023-01-15',
        save: jest.fn().mockResolvedValue({})
      };
      
      Book.findOne.mockResolvedValue(mockBook);
      
      const response = await request(app).post('/books/1/reread');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Reread recorded successfully.' });
      expect(mockBook.reading_status).toBe('To Read');
      expect(mockBook.currently_read).toBe(0);
      expect(mockBook.save).toHaveBeenCalled();
    });
    
    it('should return 400 if book is not completed', async () => {
      const mockBook = { bookid: 1, reading_status: 'Reading' };
      
      Book.findOne.mockResolvedValue(mockBook);
      
      const response = await request(app).post('/books/1/reread');
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Book not found or not completed.' });
    });
  });

  describe('GET /books/:id/rereads', () => {
    it('should get reread history for a book', async () => {
      const mockHistory = [
        { bookid: 1, startDate: '2023-01-01', endDate: '2023-01-15' },
        { bookid: 1, startDate: '2023-03-01', endDate: '2023-03-15' }
      ];
      
      // Reset the mock implementation for this test
      Rereader.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHistory)
      });
      
      const response = await request(app).get('/books/1/rereads');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockHistory);
    });
    
    it('should return 404 if no reread history found', async () => {
      // Reset the mock implementation for this test
      Rereader.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });
      
      const response = await request(app).get('/books/1/rereads');
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'No reread history found for this book.' });
    });
  });
  
  describe('GET /books/check', () => {
    it('should check for duplicate books', async () => {
      Book.findOne.mockResolvedValue({ bookid: 1, book_name: 'Existing Book' });
      
      const response = await request(app)
        .get('/books/check')
        .query({ 
          readerId: 123, 
          title: 'Existing Book', 
          author: 'Author' 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ exists: true });
      expect(Book.findOne).toHaveBeenCalled();
    });
    
    it('should return false if book does not exist', async () => {
      Book.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/books/check')
        .query({ 
          readerId: 123, 
          title: 'New Book', 
          author: 'Author' 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ exists: false });
    });
  });
  
  describe('GET /books/trash', () => {
    it('should get trashed books for a reader', async () => {
      const mockTrashedBooks = [
        { bookId: 1, readerId: 123 },
        { bookId: 2, readerId: 123 }
      ];
      
      const mockBooks = [
        { 
          bookid: 1, 
          book_name: 'Book 1',
          toObject: () => ({ bookid: 1, book_name: 'Book 1' })
        },
        { 
          bookid: 2, 
          book_name: 'Book 2',
          toObject: () => ({ bookid: 2, book_name: 'Book 2' })
        }
      ];
      
      Trash.find.mockResolvedValue(mockTrashedBooks);
      Book.findOne.mockImplementation((query) => {
        const bookid = query.bookid;
        return mockBooks.find(book => book.bookid === bookid);
      });
      
      const response = await request(app)
        .get('/books/trash')
        .query({ readerid: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });
  });
  
  describe('GET /books/favorites', () => {
    it('should get favorites for a reader', async () => {
      const mockFavorites = [
        { bookId: 1, readerId: 123 },
        { bookId: 2, readerId: 123 }
      ];
      
      const mockBooks = [
        { 
          bookid: 1, 
          book_name: 'Book 1',
          toObject: () => ({ bookid: 1, book_name: 'Book 1' })
        },
        { 
          bookid: 2, 
          book_name: 'Book 2',
          toObject: () => ({ bookid: 2, book_name: 'Book 2' })
        }
      ];
      
      Favorite.find.mockResolvedValue(mockFavorites);
      Book.find.mockResolvedValue(mockBooks);
      
      const response = await request(app)
        .get('/books/favorites')
        .query({ readerid: 123 });
      
      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].isFavorite).toBe(true);
    });
  });
});