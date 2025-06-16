
// const express = require("express")
// const router = express.Router()
// const LendingTracker = require("../models/LendingTracker")
// const Book = require("../models/Book")

// // Get all lent out books (for the Lent Out section in sidebar)
// // This needs to be before the /:bookId route to avoid conflict
// router.get("/lent-out", async (req, res) => {
//   try {
//     const { readerid } = req.query

//     if (!readerid) {
//       return res.status(400).json({ error: "Reader ID is required" })
//     }

//     console.log("Fetching lent out books for reader:", readerid)

//     // Get all books for this reader
//     const books = await Book.find({ readerid: Number(readerid) })
//     const bookIds = books.map((book) => book.bookid)

//     console.log("Found books for reader:", bookIds)

//     // Find all lending records for these books
//     const lendingRecords = await LendingTracker.find({
//       bookId: { $in: bookIds },
//       status: "lent",
//     })

//     console.log("Found lending records:", lendingRecords)

//     // Get full book details for each lent book
//     const lentBookIds = lendingRecords.map((record) => record.bookId)
//     const lentBooks = await Book.find({ bookid: { $in: lentBookIds } })

//     console.log(
//       "Found lent books:",
//       lentBooks.map((b) => b.bookid),
//     )

//     // Combine book details with lending information
//     const booksWithLendingInfo = lentBooks.map((book) => {
//       const lendingInfo = lendingRecords.find((record) => record.bookId === book.bookid)
//       return {
//         ...book.toObject(),
//         lendingInfo: lendingInfo,
//       }
//     })

//     console.log("Returning books with lending info:", booksWithLendingInfo.length)
//     res.json(booksWithLendingInfo)
//   } catch (error) {
//     console.error("Error fetching lent out books:", error)
//     res.status(500).json({ error: "Failed to fetch lent out books" })
//   }
// })

// // Get lending status for a specific book
// router.get("/:bookId", async (req, res) => {
//   try {
//     const { bookId } = req.params

//     const lendingRecord = await LendingTracker.findOne({
//       bookId: Number(bookId),
//       status: "lent",
//     })

//     if (!lendingRecord) {
//       return res.status(404).json({ message: "No lending record found for this book" })
//     }

//     res.json(lendingRecord)
//   } catch (error) {
//     console.error("Error fetching lending status:", error)
//     res.status(500).json({ error: "Failed to fetch lending status" })
//   }
// })

// // Get all lent books for a reader
// router.get("/", async (req, res) => {
//   try {
//     const { readerid } = req.query

//     if (!readerid) {
//       return res.status(400).json({ error: "Reader ID is required" })
//     }

//     // First get all books for this reader
//     const books = await Book.find({ readerid: Number(readerid) })
//     const bookIds = books.map((book) => book.bookid)

//     // Then find all lending records for these books
//     const lendingRecords = await LendingTracker.find({
//       bookId: { $in: bookIds },
//       status: "lent",
//     })

//     res.json(lendingRecords)
//   } catch (error) {
//     console.error("Error fetching lent books:", error)
//     res.status(500).json({ error: "Failed to fetch lent books" })
//   }
// })

// // Lend a book
// router.post("/", async (req, res) => {
//   try {
//     const { bookId, personName, status, date, readerid } = req.body

//     if (!bookId || !personName || !status || !date) {
//       return res.status(400).json({ error: "Missing required fields" })
//     }

//     // Check if book exists
//     const book = await Book.findOne({ bookid: Number(bookId) })
//     if (!book) {
//       return res.status(404).json({ error: "Book not found" })
//     }

//     // Check if book is already lent out
//     const existingRecord = await LendingTracker.findOne({
//       bookId: Number(bookId),
//       status: "lent",
//     })

//     if (existingRecord) {
//       return res.status(400).json({ error: "This book is already lent out" })
//     }

//     // Create new lending record
//     const newLending = new LendingTracker({
//       bookId: Number(bookId),
//       personName,
//       status,
//       date,
//       readerid: Number(readerid) || book.readerid, // Use provided readerid or get from book
//     })

//     await newLending.save()

//     res.status(201).json({ message: "Book lent successfully", lending: newLending })
//   } catch (error) {
//     console.error("Error lending book:", error)
//     res.status(500).json({ error: "Failed to lend book" })
//   }
// })

// // Clear lending status (delete record)
// router.delete("/:bookId", async (req, res) => {
//   try {
//     const { bookId } = req.params

//     const result = await LendingTracker.deleteMany({ bookId: Number(bookId) })

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "No lending record found for this book" })
//     }

//     res.json({ message: "Lending status cleared successfully" })
//   } catch (error) {
//     console.error("Error clearing lending status:", error)
//     res.status(500).json({ error: "Failed to clear lending status" })
//   }
// })

// module.exports = router








































const express = require("express")
const router = express.Router()
const LendingTracker = require("../models/LendingTracker")
const Book = require("../models/Book")

// Get all lent out books (for the Lent Out section in sidebar)
router.get("/lent-out", async (req, res) => {
  try {
    const { readerid } = req.query

    if (!readerid) {
      return res.status(400).json({ error: "Reader ID is required" })
    }

    console.log("Fetching lent out books for reader:", readerid)

    // Get all books for this reader
    const books = await Book.find({ readerid: Number(readerid) })
    const bookIds = books.map((book) => book.bookid)

    console.log("Found books for reader:", bookIds)

    // Find all lending records for these books
    const lendingRecords = await LendingTracker.find({
      bookId: { $in: bookIds },
      status: "lent",
    })

    console.log("Found lending records:", lendingRecords)

    // Get full book details for each lent book
    const lentBookIds = lendingRecords.map((record) => record.bookId)
    const lentBooks = await Book.find({ bookid: { $in: lentBookIds } })

    console.log(
      "Found lent books:",
      lentBooks.map((b) => b.bookid),
    )

    // Combine book details with lending information
    const booksWithLendingInfo = lentBooks.map((book) => {
      const lendingInfo = lendingRecords.find((record) => record.bookId === book.bookid)
      return {
        // ...book.toObject(),
        ...(book.toObject ? book.toObject() : book),
        lendingInfo: lendingInfo,
      }
    })

    console.log("Returning books with lending info:", booksWithLendingInfo.length)
    res.json(booksWithLendingInfo)
  } catch (error) {
    console.error("Error fetching lent out books:", error)
    res.status(500).json({ error: "Failed to fetch lent out books" })
  }
})

// Get all borrowed books (for the Borrowed section in sidebar)
router.get("/borrowed", async (req, res) => {
  try {
    const { readerid } = req.query

    if (!readerid) {
      return res.status(400).json({ error: "Reader ID is required" })
    }

    console.log("Fetching borrowed books for reader:", readerid)

    // Get all books for this reader
    const books = await Book.find({ readerid: Number(readerid) })
    const bookIds = books.map((book) => book.bookid)

    console.log("Found books for reader:", bookIds)

    // Find all borrowing records for these books
    const borrowingRecords = await LendingTracker.find({
      bookId: { $in: bookIds },
      status: "borrowed",
    })

    console.log("Found borrowing records:", borrowingRecords)

    // Get full book details for each borrowed book
    const borrowedBookIds = borrowingRecords.map((record) => record.bookId)
    const borrowedBooks = await Book.find({ bookid: { $in: borrowedBookIds } })

    console.log(
      "Found borrowed books:",
      borrowedBooks.map((b) => b.bookid),
    )

    // Combine book details with borrowing information
    const booksWithLendingInfo = borrowedBooks.map((book) => {
      const lendingInfo = borrowingRecords.find((record) => record.bookId === book.bookid)
      return {
        // ...book.toObject(),
        ...(book.toObject ? book.toObject() : book),
        lendingInfo: lendingInfo,
      }
    })

    console.log("Returning books with borrowing info:", booksWithLendingInfo.length)
    res.json(booksWithLendingInfo)
  } catch (error) {
    console.error("Error fetching borrowed books:", error)
    res.status(500).json({ error: "Failed to fetch borrowed books" })
  }
})

// Get lending status for a specific book
router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params
    const { status } = req.query

    const query = { bookId: Number(bookId) }

    // If status is specified, filter by it
    if (status) {
      query.status = status
    } else {
      // Default to lent if no status specified
      query.status = "lent"
    }

    const lendingRecord = await LendingTracker.findOne(query)

    if (!lendingRecord) {
      return res.status(404).json({ message: "No lending record found for this book" })
    }

    res.json(lendingRecord)
  } catch (error) {
    console.error("Error fetching lending status:", error)
    res.status(500).json({ error: "Failed to fetch lending status" })
  }
})

// Get all lent books for a reader
router.get("/", async (req, res) => {
  try {
    const { readerid, status } = req.query

    if (!readerid) {
      return res.status(400).json({ error: "Reader ID is required" })
    }

    // First get all books for this reader
    const books = await Book.find({ readerid: Number(readerid) })
    const bookIds = books.map((book) => book.bookid)

    // Then find all lending records for these books
    const query = { bookId: { $in: bookIds } }

    // If status is specified, filter by it
    if (status) {
      query.status = status
    } else {
      // Default to lent if no status specified
      query.status = "lent"
    }

    const lendingRecords = await LendingTracker.find(query)

    res.json(lendingRecords)
  } catch (error) {
    console.error("Error fetching lending records:", error)
    res.status(500).json({ error: "Failed to fetch lending records" })
  }
})

// Lend or borrow a book
router.post("/", async (req, res) => {
  try {
    const { bookId, personName, status, date, readerid } = req.body

    if (!bookId || !personName || !status || !date) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if book exists
    const book = await Book.findOne({ bookid: Number(bookId) })
    if (!book) {
      return res.status(404).json({ error: "Book not found" })
    }

    // Check if book is already lent out or borrowed
    const existingRecord = await LendingTracker.findOne({
      bookId: Number(bookId),
      status: status,
    })

    if (existingRecord) {
      return res.status(400).json({ error: `This book is already ${status}` })
    }

    // Create new lending record
    const newLending = new LendingTracker({
      bookId: Number(bookId),
      personName,
      status,
      date,
      readerid: Number(readerid) || book.readerid, // Use provided readerid or get from book
    })

    await newLending.save()

    res.status(201).json({ message: `Book ${status} successfully`, lending: newLending })
  } catch (error) {
    console.error(`Error ${req.body.status} book:`, error)
    res.status(500).json({ error: `Failed to ${req.body.status} book` })
  }
})

// Clear lending or borrowing status (delete record)
router.delete("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params
    const { status } = req.query

    const query = { bookId: Number(bookId) }

    // If status is specified, filter by it
    if (status) {
      query.status = status
    }

    const result = await LendingTracker.deleteMany(query)

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No lending record found for this book" })
    }

    res.json({ message: "Status cleared successfully" })
  } catch (error) {
    console.error("Error clearing status:", error)
    res.status(500).json({ error: "Failed to clear status" })
  }
})

module.exports = router




