const request = require('supertest');
const express = require('express');
const uploadProfileRoutes = require('../routes/uploadProfile');
const cloudinary = require('cloudinary').v2;
const Reader = require('../models/Reader'); // Keep this import
const bcrypt = require('bcryptjs');

const Book = require('../models/Book');
const Favorite = require('../models/Favorite');
const LendingTracker = require('../models/LendingTracker');
const Quote = require('../models/Quote');
const ReadingGoal = require('../models/ReadingGoal');
const Rereader = require('../models/Rereader');
const Tag = require('../models/Tag');
const Timer = require('../models/Timer');
const Trash = require('../models/Trash');
// Remove this line: const Reader = require('../models/Reader');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use(uploadProfileRoutes);

// Mock cloudinary, Reader model, and bcrypt
// jest.mock('cloudinary');
jest.mock('../models/Reader');
// jest.mock('bcryptjs');

jest.mock('cloudinary', () => ({
    v2: {
      uploader: {
        upload_stream: jest.fn((options, callback) => {
          return {
            end: () => {
              callback(null, { secure_url: 'https://fake-cloudinary-url.com/profile.jpg' });
            }
          };
        })
      }
    }
  }));


  jest.mock('../middleware/auth', () => (req, res, next) => {
    req.user = { id: 'mockReaderId' }; // whatever matches your Reader's reader_id
    next();
  });

  
  jest.mock('bcryptjs', () => ({
    compare: jest.fn(() => Promise.resolve(true)), // assume password matches
    genSalt: jest.fn(() => Promise.resolve('salt')),
    hash: jest.fn(() => Promise.resolve('newHashedPassword'))
  }));
  


describe('UploadProfile Routes', () => {

  describe('POST /upload-profile', () => {
    it('should upload a profile picture successfully', async () => {
      // Mock cloudinary upload
      cloudinary.uploader = {
        upload_stream: jest.fn((options, callback) => {
          return {
            end: () => callback(null, { secure_url: 'https://fakeurl.com/profile.jpg' }),
          };
        }),
      };

      // Mock Reader update
      Reader.updateOne.mockResolvedValue({ nModified: 1 });

      const res = await request(app)
        .post('/upload-profile')
        .field('readerId', 'testreader123')
        .attach('image', Buffer.from('fakeimage'), { filename: 'profile.jpg' });

      expect(res.statusCode).toBe(200);
      expect(res.body.profilePicUrl).toBe('https://fakeurl.com/profile.jpg');
    });

    it('should return 400 if readerId or image is missing', async () => {
      const res = await request(app)
        .post('/upload-profile')
        .send({ readerId: '' }); // Missing file

      expect(res.statusCode).toBe(400);
    });

    it('should return 500 if cloudinary upload fails', async () => {
      cloudinary.uploader = {
        upload_stream: jest.fn((options, callback) => {
          return {
            end: () => callback(new Error('Upload failed')),
          };
        }),
      };

      const res = await request(app)
        .post('/upload-profile')
        .field('readerId', 'testreader123')
        .attach('image', Buffer.from('fakeimage'), { filename: 'profile.jpg' });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('POST /remove-profile', () => {
    it('should remove profile picture successfully', async () => {
      Reader.updateOne.mockResolvedValue({ nModified: 1 });

      const res = await request(app)
        .post('/remove-profile')
        .send({ readerId: 'testreader123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Profile picture removed');
    });

    it('should return 400 if readerId is missing', async () => {
      const res = await request(app)
        .post('/remove-profile')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /update-reader-info', () => {
    it('should update reader info successfully', async () => {
      Reader.updateOne.mockResolvedValue({ nModified: 1 });

      const res = await request(app)
        .post('/update-reader-info')
        .send({ readerId: 'testreader123', first_name: 'John', last_name: 'Doe', email: 'john@example.com' });

      expect(res.statusCode).toBe(200);
    });

    it('should return 400 if fields are missing', async () => {
      const res = await request(app)
        .post('/update-reader-info')
        .send({ readerId: 'testreader123' }); // Missing other fields

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /update-password', () => {
    beforeEach(() => {
      bcrypt.compare.mockReset();
      bcrypt.hash.mockReset();
      bcrypt.genSalt.mockReset();
    });

    it('should update password successfully', async () => {
      Reader.findOne = jest.fn().mockResolvedValue({ reader_id: 'testreader123', password: 'oldhashedpassword' });
      bcrypt.compare.mockResolvedValue(true);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('newhashedpassword');
      Reader.updateOne.mockResolvedValue({ nModified: 1 });

      const res = await request(app)
        .post('/update-password')
        .set('Authorization', 'Bearer dummyToken') // if your auth middleware expects token
        .send({ currentPassword: 'oldpassword', newPassword: 'newpassword' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Password updated successfully.');
    });

    it('should fail if current password is incorrect', async () => {
      Reader.findOne = jest.fn().mockResolvedValue({ reader_id: 'testreader123', password: 'oldhashedpassword' });
      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/update-password')
        .set('Authorization', 'Bearer dummyToken')
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /delete-account', () => {
    it('should delete account successfully', async () => {
      // Mock all models delete
      const deleteSuccess = Promise.resolve();
      Book.find = jest.fn().mockResolvedValue([{ bookid: 'book1' }, { bookid: 'book2' }]);
      Favorite.deleteMany = jest.fn(() => deleteSuccess);
      LendingTracker.deleteMany = jest.fn(() => deleteSuccess);
      Quote.deleteMany = jest.fn(() => deleteSuccess);
      ReadingGoal.deleteOne = jest.fn(() => deleteSuccess);
      Rereader.deleteMany = jest.fn(() => deleteSuccess);
      Tag.deleteMany = jest.fn(() => deleteSuccess);
      Timer.deleteMany = jest.fn(() => deleteSuccess);
      Trash.deleteMany = jest.fn(() => deleteSuccess);
      Book.deleteMany = jest.fn(() => deleteSuccess);
      Reader.deleteOne = jest.fn(() => deleteSuccess);

      const res = await request(app)
        .post('/delete-account')
        .send({ reader_id: 'testreader123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Reader and related data deleted successfully.');
    });

    it('should return 400 if reader_id missing', async () => {
      const res = await request(app)
        .post('/delete-account')
        .send({});

      expect(res.statusCode).toBe(400);
    });
  });

});