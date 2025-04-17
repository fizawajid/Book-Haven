const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const express = require("express");
const Book = require("../models/Book");
const Trash = require("../models/Trash"); // Add this line at the top
const Tags = require("../models/Tag");
const Favorite = require("../models/Favorite");
const Quote = require("../models/Quote");
const Rereader = require("../models/Rereader")

const router = express.Router();

// Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "book_covers", // Folder name in Cloudinary
        allowed_formats: ["jpg", "jpeg", "png"],
    },
});

const upload = multer({ storage });

//Get All Books
router.get("/", async (req, res) => {
    try {
        const { readerid } = req.query; // Extract readerid from query params

        if (!readerid) {
            return res.status(400).json({ message: "Reader ID is required" });
        }

        const books = await Book.find({ readerid: Number(readerid) });
        res.json({ books });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Error fetching books", error });
    }
});


router.get("/:id/quotes", async (req, res) => {
    try {
      const { id } = req.params;
      const Quote = require("../models/Quote"); // Import Quote model
      
      const quotes = await Quote.find({ bookId: Number(id) }).sort({ createdAt: -1 });
      res.status(200).json(quotes);
    } catch (error) {
      console.error("Error fetching quotes:", error);
      res.status(500).json({ message: "Error fetching quotes", error });
    }
  });
  // Add a tag to a book
router.post('/:bookid/tags', async (req, res) => {
    try {
        const { bookid } = req.params;
        const { tag } = req.body;

        // Check if book exists
        const book = await Book.findOne({ bookid: parseInt(bookid) });
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Create new tag
        const newTag = new Tags({
            bookid: parseInt(bookid),
            tag: tag.trim()
        });

        await newTag.save();

        res.status(201).json(newTag);
    } catch (error) {
        console.error('Error adding tag:', error);
        res.status(500).json({ error: 'Failed to add tag' });
    }
});

// Remove a tag from a book
router.delete('/:bookid/tags', async (req, res) => {
    try {
        const { bookid } = req.params;
        const { tag } = req.body;

        // Check if tag exists for this book
        const existingTag = await Tags.findOneAndDelete({ 
            bookid: parseInt(bookid), 
            tag: tag 
        });

        if (!existingTag) {
            return res.status(404).json({ error: 'Tag not found for this book' });
        }

        res.status(200).json({ message: 'Tag deleted successfully' });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ error: 'Failed to delete tag' });
    }
});

// Get all tags for a book
router.get('/:bookid/tags', async (req, res) => {
    try {
        const { bookid } = req.params;
        const tags = await Tags.find({ bookid: parseInt(bookid) });
        res.status(200).json(tags);
    } catch (error) {
        console.error('Error fetching tags:', error);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

  // Add a new quote
  router.post("/:id/quotes", async (req, res) => {
    try {
      const { id } = req.params;
      const { quote } = req.body;
      const Quote = require("../models/Quote"); // Import Quote model
      
      // Validate required fields
      if (!quote) {
        return res.status(400).json({ message: "Quote text is required" });
      }
  
      // Create new quote
      const newQuote = new Quote({
        bookId: Number(id),
        quote
      });
  
      const savedQuote = await newQuote.save();
      res.status(201).json(savedQuote);
    } catch (error) {
      console.error("Error adding quote:", error);
      res.status(500).json({ message: "Error adding quote", error });
    }
  });
  
  // Delete a quote
  router.delete("/quotes/:quoteId", async (req, res) => {
    try {
      const { quoteId } = req.params;
      console.log("Delete request received for quote ID:", quoteId); // Add this log
      
      const Quote = require("../models/Quote");
      
      // Make sure we're looking for a Number, not a String
      const result = await Quote.findOneAndDelete({ quoteId: Number(quoteId) });
      
      console.log("Delete result:", result); // Add this log
      
      if (!result) {
        return res.status(404).json({ message: "Quote not found" });
      }
      
      res.status(200).json({ message: "Quote deleted successfully" });
    } catch (error) {
      console.error("Error deleting quote:", error);
      res.status(500).json({ message: "Error deleting quote", error });
    }
  });




// Add these routes to your books.js router file

// Toggle favorite status
router.post("/favorite", async (req, res) => {
    const { bookId, readerId } = req.body;

    try {
        // Check if book exists
        const book = await Book.findOne({ bookid: bookId, readerid: readerId });
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }

        // Check if already in favorites
        const existingFavorite = await Favorite.findOne({ bookId, readerId });
        
        if (existingFavorite) {
            // Remove from favorites
            await Favorite.deleteOne({ bookId, readerId });
            return res.status(200).json({ 
                message: "Book removed from favorites", 
                isFavorite: false 
            });
        } else {
            // Add to favorites
            const favorite = new Favorite({
                bookId,
                readerId,
                status: "active"
            });
            await favorite.save();
            return res.status(200).json({ 
                message: "Book added to favorites", 
                isFavorite: true 
            });
        }
    } catch (error) {
        console.error("Error updating favorite status:", error);
        res.status(500).json({ error: "Server error while updating favorite status" });
    }
});
// In your backend routes
/*For duplicate books check*/
router.get('/check', async (req, res) => {
    try {
      const { readerId, title, author } = req.query;
      
      const existingBook = await Book.findOne({
        readerid: readerId,
        book_name: { $regex: new RegExp(`^${title}$`, 'i') },
        author_name: { $regex: new RegExp(`^${author}$`, 'i') },
        reading_status: { $ne: "Trash" } // Exclude books with status "Trash"
      });
  
      res.json({ exists: !!existingBook });
    } catch (error) {
      console.error('Error checking for duplicate book:', error);
      res.status(500).json({ error: 'Error checking for duplicate book' });
    }
  });
 /***************************/ 
// Get favorites for a reader
router.get("/favorites", async (req, res) => {
    const { readerid } = req.query;
    
    try {
        if (!readerid) {
            return res.status(400).json({ message: "Reader ID is required" });
        }

        // Get all favorites for this reader
        const favorites = await Favorite.find({ readerId: readerid });
        
        // Get book details for each favorite
        const favoriteBookIds = favorites.map(favorite => favorite.bookId);
        const favoriteBooks = await Book.find({ bookid: { $in: favoriteBookIds } });
        
        // Add isFavorite flag to each book
        const booksWithFavoriteFlag = favoriteBooks.map(book => ({
            ...book.toObject(),
            isFavorite: true
        }));
        
        res.status(200).json(booksWithFavoriteFlag);
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ message: "Error fetching favorites", error });
    }
});


// GET /book/trash?readerid=123
router.get("/trash", async (req, res) => {
    const readerid = req.query.readerid;
    try {
        const trashedBooks = await Trash.find({ readerId: readerid });

        // Fetch full book details for each trashed book
        const booksWithDetails = await Promise.all(
            trashedBooks.map(async (trash) => {
                const book = await Book.findOne({ bookid: trash.bookId });
                if (!book) return null; // skip if book not found
                return {
                    ...trash.toObject(),
                    ...book.toObject()
                };
            })
        );
        
        res.status(200).json(booksWithDetails.filter(Boolean));
        
    } catch (err) {
        // Log the actual error for debugging
        console.error("Error fetching trash:", err);
        res.status(500).json({ message: "Error fetching trash", error: err });
    }
});



// 🗑 Move a book to trash
router.post("/trash", async (req, res) => {
    const { bookId, readerId } = req.body;

    try {
        // Check if book exists
        const book = await Book.findOne({ bookid: bookId, readerid: readerId });
        if (!book) {
            return res.status(404).json({ error: "Book not found" });
        }

        // Check if already in trash
        const alreadyTrashed = await Trash.findOne({ bookId, readerId });
        if (alreadyTrashed) {
            return res.status(409).json({ message: "Book is already in trash" });
        }

        // Save in Trash collection
        const trashEntry = new Trash({
            bookId,
            readerId,
            prevReadingStatus: book.reading_status, // 👈 store the current reading status
        });
        await trashEntry.save();

        // Optionally mark the book as "Trash" (you can also use this to filter in frontend)
        book.reading_status = "Trash";
        await book.save();

        res.status(200).json({ message: "Book moved to trash successfully" });
    } catch (error) {
        console.error("Error moving book to trash:", error);
        res.status(500).json({ error: "Server error while moving book to trash" });
    }
});

// Restore Multiple Trashed Books
router.post("/trash/restore", async (req, res) => {
    const { bookIds } = req.body; // Array of book IDs to restore
    try {
        // Fetch trashed books to restore their original reading status
        const trashedBooks = await Trash.find({ bookId: { $in: bookIds } });
        
        if (trashedBooks.length !== bookIds.length) {
            return res.status(404).json({ message: "One or more books not found in trash" });
        }

        // Restore each book
        for (const trashedBook of trashedBooks) {
            const book = await Book.findOne({ bookid: trashedBook.bookId });
            if (!book) {
                return res.status(404).json({ message: `Book with ID ${trashedBook.bookId} not found` });

            }

            // Restore the original reading status
            book.reading_status = trashedBook.prevReadingStatus;
            await book.save();

            // Delete from trash after restoring
            await Trash.deleteOne({ bookId: trashedBook.bookId });
        }

        res.status(200).json({ message: "Books restored successfully" });
    } catch (error) {
        console.error("Error restoring books:", error);
        res.status(500).json({ message: "Error restoring books", error });
    }
});

router.post("/trash/delete", async (req, res) => {
    const { bookIds } = req.body;
    try {
      await Trash.deleteMany({ bookId: { $in: bookIds } });
      await Book.deleteMany({ bookid: { $in: bookIds } });
      await Tags.deleteMany({ bookid: { $in: bookIds } });

    res.status(200).send("Books and related tags permanently deleted.");
  } catch (err) {
    console.error("Error deleting books and tags:", err);
    res.status(500).send("Error deleting books and related tags.");
  }
});

// Route to add a new book with an image
router.post("/add", upload.single("cover_image"), async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        console.log("Received File:", req.file); // Check if file is correctly received
        const { book_name, author_name, genre, total_pages, year_of_publication, reading_status, book_rating, book_review, start_date, end_date, add_date, readerid,currently_read, tags } = req.body;

        if (!readerid) {
            return res.status(400).json({ message: "Reader ID is required" });
        }

        const newBook = new Book({
            book_name,
            author_name,
            genre,
            total_pages,
            year_of_publication,
            reading_status,
            book_rating,
            book_review,
            start_date,
            end_date,
            add_date,
            cover_image: req.file ? req.file.path : "",
            readerid: Number(readerid),// Associate the book with the reader
            currently_read
        });

        const savedBook = await newBook.save();

        // Save tags if they exist
        if (tags && tags.length > 0) {
            // Parse tags if they're sent as a string (e.g., "tag1,tag2")
            const tagsArray = typeof tags === 'string' ? tags.split(',') : tags;
            
            // Create tag documents for each tag
            const tagPromises = tagsArray.map(tag => {
                return new Tags({
                    bookid: savedBook.bookid, // Use the auto-generated bookid
                    tag: tag.trim() // Trim whitespace
                }).save();
            });

            await Promise.all(tagPromises);
        }

        res.status(201).json({ 
            message: "Book added successfully!", 
            book: savedBook 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add book", error });
    }
});


// Get Single Book by ID + Tags
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findOne({ bookid: req.params.id }) || await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Fetch tags related to this book
        const tags = await Tags.find({ bookid: book.bookid });

        res.json({ book, tags });
    } catch (error) {
        console.error("Error fetching book:", error);
        res.status(500).json({ message: "Error fetching book details", error });
    }
});
// Get Single Book by ID + Tags


// Update Book Rating & Review
router.put("/:id", async (req, res) => {
    try {
        const { book_rating, book_review } = req.body;
        const updatedBook = await Book.findOneAndUpdate(
            { bookid: req.params.id },
            { book_rating, book_review },
            { new: true }
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json({ message: "Book updated successfully!", book: updatedBook });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ message: "Error updating book details", error });
    }
});
router.post("/:id/upload-cover", upload.single("cover"), async (req, res) => {
    try {
        const bookId = req.params.id;
        const coverUrl = req.file.path;

        // Assuming you're using Mongoose:
        const updated = await Book.findOneAndUpdate(
            { bookid: bookId },
            { cover_image: coverUrl },
            { new: true }
        );

        res.json({ message: "Cover uploaded successfully", cover_image: updated.cover_image });
    } catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Cover upload failed" });
    }
});
router.put("/:id/update-pages", async (req, res) => {
    try {
        console.log("Received request to update pages for book:", req.params.id);
        console.log("Request body:", req.body);

        const { pagesRead } = req.body;

        if (!pagesRead || pagesRead < 1) {
            return res.status(400).json({ message: "Invalid pages read count" });
        }

        // Find the book by bookid (ensure bookid is stored correctly)
        const book = await Book.findOne({ bookid: Number(req.params.id) });

        if (!book) {
            return res.status(404).json({ message: "Book not found." });
        }

        console.log("Current book details before update:", book);

        // Ensure currently_read field exists in the database
        if (!book.currently_read) {
            book.currently_read = 0;
        }
        if(book.currently_read == 0 && pagesRead > 0){
            book.reading_status = "Reading";
            book.start_date = new Date().toISOString().split('T')[0];
        }
        // Update currently_read and ensure it doesn't exceed total_pages
        book.currently_read = Math.min(book.currently_read + pagesRead, book.total_pages);
        
        if (book.currently_read >= book.total_pages) {
            book.reading_status = "Completed";
            book.end_date = new Date().toISOString().split('T')[0];
            
        }

        console.log("Updated book details before saving:", book);

        await book.save();

        res.json({ message: "Reading progress updated!", book });
    } catch (error) {
        console.error("Error updating pages read:", error);
        res.status(500).json({ message: "Error updating reading progress", error });
    }
});
//Rereading routes:
router.post('/:id/reread', async (req, res) => {
    try {
        const book = await Book.findOne({ bookid: Number(req.params.id) });
        if (!book || book.reading_status !== 'Completed') {
            return res.status(400).json({ error: 'Book not found or not completed.' });
        }
        console.log("the book to reread is",book)
        const rereadEntry = new Rereader({
            bookid: book.bookid,
            startDate: book.start_date,
            endDate: book.end_date
        });

        await rereadEntry.save();

        // Reset book fields
        book.start_date = null;
        book.end_date = null;
        book.reading_status = 'To Read';
        book.currently_read = 0;

        await book.save();

        res.status(200).json({ message: 'Reread recorded successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id/rereads', async (req, res) => {
    try {
        const bookid = Number(req.params.id);  // Get bookid from the URL params
        console.log("Fetching reread history for bookid:", bookid);

        // Fetch rereading history by matching bookid in Rereader
        const history = await Rereader.find({ bookid }).sort({ reread_id: 1 }); // Optional sorting by reread_id
        
        if (history.length === 0) {
            return res.status(404).json({ error: 'No reread history found for this book.' });
        }

        res.status(200).json(history);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch reread history' });
    }
});  

module.exports = router;