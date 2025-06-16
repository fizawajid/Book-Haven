// "use client"

// import { useEffect, useState } from "react"
// import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaTrash } from "react-icons/fa"
// import axios from "axios"
// import { useNavigate } from "react-router-dom"

// import "../allbooks.css"

// const StarRating = ({ rating }) => {
//   return (
//     <div className="star-rating">
//       {[...Array(5)].map((_, i) => (i < rating ? <FaStar key={i} color="gold" /> : <FaRegStar key={i} />))}
//     </div>
//   )
// }

// const AllBooks = ({ statusFilter }) => {
//   const [books, setBooks] = useState([])
//   const [filteredBooks, setFilteredBooks] = useState([])
//   const [searchQuery, setSearchQuery] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [lentBooks, setLentBooks] = useState([])
//   const [borrowedBooks, setBorrowedBooks] = useState([])
//   const navigate = useNavigate()

//   useEffect(() => {
//     const fetchBooks = async () => {
//       try {
//         const readerId = sessionStorage.getItem("reader_id")

//         if (!readerId) {
//           console.error("No reader ID found.")
//           return
//         }

//         const response = await axios.get(`http://localhost:8000/book?readerid=${readerId}`)
//         let fetchedBooks = response.data.books.filter((book) => book.reading_status !== "Trash")

//         // Fetch favorite status for all books
//         const favoritesResponse = await axios.get(`http://localhost:8000/book/favorites?readerid=${readerId}`)
//         const favoriteBooks = favoritesResponse.data
//         const favoriteBookIds = favoriteBooks.map((book) => book.bookid)

//         // Fetch lending status for all books
//         const lendingResponse = await axios.get(`http://localhost:8000/lending?readerid=${readerId}&status=lent`)
//         const lentBooksData = lendingResponse.data || []
//         const lentBookIds = lentBooksData.map((item) => item.bookId)

//         // Fetch borrowing status for all books
//         const borrowingResponse = await axios.get(`http://localhost:8000/lending?readerid=${readerId}&status=borrowed`)
//         const borrowedBooksData = borrowingResponse.data || []
//         const borrowedBookIds = borrowedBooksData.map((item) => item.bookId)

//         setLentBooks(lentBookIds)
//         setBorrowedBooks(borrowedBookIds)

//         // Add isFavorite, isLentOut, and isBorrowed flags to each book
//         fetchedBooks = fetchedBooks.map((book) => ({
//           ...book,
//           isFavorite: favoriteBookIds.includes(book.bookid),
//           isLentOut: lentBookIds.includes(book.bookid),
//           isBorrowed: borrowedBookIds.includes(book.bookid),
//         }))

//         if (statusFilter === "Lent Out") {
//           fetchedBooks = fetchedBooks.filter((book) => lentBookIds.includes(book.bookid))
//         } else if (statusFilter === "Borrowed") {
//           fetchedBooks = fetchedBooks.filter((book) => borrowedBookIds.includes(book.bookid))
//         } else if (statusFilter) {
//           fetchedBooks = fetchedBooks.filter((book) => book.reading_status === statusFilter)
//         }

//         setBooks(fetchedBooks)
//         setFilteredBooks(fetchedBooks)
//         setLoading(false)
//       } catch (error) {
//         console.error("Error fetching books:", error)
//         setLoading(false)
//       }
//     }

//     fetchBooks()
//   }, [statusFilter])

//   useEffect(() => {
//     if (searchQuery.trim() === "") {
//       setFilteredBooks(books)
//     } else {
//       setFilteredBooks(
//         books.filter(
//           (book) =>
//             book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             book.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
//         ),
//       )
//     }
//   }, [searchQuery, books])

//   const handleFavoriteToggle = async (e, book) => {
//     e.stopPropagation() // prevent navigation

//     try {
//       const readerId = sessionStorage.getItem("reader_id")
//       const response = await axios.post("http://localhost:8000/book/favorite", {
//         bookId: book.bookid,
//         readerId: readerId,
//       })

//       // Update book in state with new favorite status
//       const updatedBooks = books.map((b) =>
//         b.bookid === book.bookid ? { ...b, isFavorite: response.data.isFavorite } : b,
//       )

//       setBooks(updatedBooks)
//       setFilteredBooks(
//         updatedBooks.filter(
//           (book) =>
//             searchQuery.trim() === "" ||
//             book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             book.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
//         ),
//       )
//     } catch (err) {
//       console.error("Error updating favorite status:", err)
//     }
//   }

//   const renderBookList = () => {
//     if (loading) {
//       return <p>Loading books...</p>
//     }

//     if (filteredBooks.length === 0) {
//       return <p>No books found for {statusFilter || "all books"}.</p>
//     }

//     return (
//       <div className="book-list">
//         {filteredBooks.map((book) => {
//           const progress = book.total_pages ? ((book.currently_read || 0) / book.total_pages) * 100 : 0
//           const progressText = book.total_pages
//             ? `${book.currently_read || 0} / ${book.total_pages} pages`
//             : "Not Started"

//           return (
//             <div
//               key={book.bookid || book._id}
//               className="book-card"
//               onClick={() => navigate(`/book/${book.bookid || book._id}`)}
//               style={{ cursor: "pointer" }}
//             >
//               {book.isFavorite ? (
//                 <FaHeart
//                   className="favorite-icon"
//                   color="red"
//                   onClick={(e) => handleFavoriteToggle(e, book)}
//                   title="Remove from Favorites"
//                 />
//               ) : (
//                 <FaRegHeart
//                   className="favorite-icon"
//                   onClick={(e) => handleFavoriteToggle(e, book)}
//                   title="Add to Favorites"
//                 />
//               )}

//               <FaTrash
//                 className="trash-icon"
//                 onClick={(e) => {
//                   e.stopPropagation() // prevent navigation
//                   if (window.confirm("Are you sure you want to delete this book?")) {
//                     axios
//                       .post("http://localhost:8000/book/trash", {
//                         bookId: book.bookid,
//                         readerId: sessionStorage.getItem("reader_id"),
//                       })
//                       .then(() => {
//                         setBooks(books.filter((b) => b.bookid !== book.bookid))
//                         setFilteredBooks(filteredBooks.filter((b) => b.bookid !== book.bookid))
//                       })
//                       .catch((err) => console.error("Error trashing book:", err))
//                   }
//                 }}
//                 title="Move to Trash"
//               />
//               <img
//                 src={book.cover_image || "/empty.png"}
//                 alt={book.book_name}
//                 className="book-cover"
//                 onError={(e) => {
//                   e.target.onerror = null
//                   e.target.src = "/empty.png"
//                 }}
//               />
//               <div className="book-info">
//                 <h3>{book.book_name}</h3>
//                 <p>
//                   {book.author_name}, {book.year_of_publication}
//                 </p>
//                 <StarRating rating={book.book_rating || 0} />
//                 <div className={`status-badge ${book.reading_status}`}>{book.reading_status}</div>
//                 {book.isLentOut && <div className="lent-badge">Lent Out</div>}
//                 {book.isBorrowed && <div className="borrowed-badge">Borrowed</div>}
//                 <p>Progress: {progressText}</p>
//                 <div className="progress-bar">
//                   <div className="progress-fill" style={{ width: `${progress}%` }}></div>
//                 </div>
//               </div>
//             </div>
//           )
//         })}
//       </div>
//     )
//   }

//   return (
//     <div className="all-books">
//       <h1>{statusFilter ? `${statusFilter} Books` : "All Books"}</h1>
//       <p>Browse and manage your entire book collection.</p>

//       {/* Search Input */}
//       <input
//         type="text"
//         placeholder="Search books..."
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//         className="search-bar"
//       />

//       {/* Book List or Status Messages */}
//       {renderBookList()}
//     </div>
//   )
// }

// export default AllBooks




"use client"

import { useEffect, useState } from "react"
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaTrash } from "react-icons/fa"
import axios from "axios"
import { useNavigate } from "react-router-dom"

import "../allbooks.css"

const StarRating = ({ rating }) => {
  return (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (i < rating ? <FaStar key={i} color="gold" /> : <FaRegStar key={i} />))}
    </div>
  )
}

const AllBooks = ({ statusFilter }) => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [lentBooks, setLentBooks] = useState([])
  const [borrowedBooks, setBorrowedBooks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const readerId = sessionStorage.getItem("reader_id")

        if (!readerId) {
          console.error("No reader ID found.")
          return
        }

        const response = await axios.get(`http://localhost:8000/book?readerid=${readerId}`)
        let fetchedBooks = response.data.books.filter((book) => book.reading_status !== "Trash")

        // Fetch favorite status for all books
        const favoritesResponse = await axios.get(`http://localhost:8000/book/favorites?readerid=${readerId}`)
        const favoriteBooks = favoritesResponse.data
        const favoriteBookIds = favoriteBooks.map((book) => book.bookid)

        // Fetch lending status for all books
        const lendingResponse = await axios.get(`http://localhost:8000/lending?readerid=${readerId}&status=lent`)
        const lentBooksData = lendingResponse.data || []
        const lentBookIds = lentBooksData.map((item) => item.bookId)

        // Fetch borrowing status for all books
        const borrowingResponse = await axios.get(`http://localhost:8000/lending?readerid=${readerId}&status=borrowed`)
        const borrowedBooksData = borrowingResponse.data || []
        const borrowedBookIds = borrowedBooksData.map((item) => item.bookId)

        setLentBooks(lentBookIds)
        setBorrowedBooks(borrowedBookIds)

        // Add isFavorite, isLentOut, and isBorrowed flags to each book
        fetchedBooks = fetchedBooks.map((book) => ({
          ...book,
          isFavorite: favoriteBookIds.includes(book.bookid),
          isLentOut: lentBookIds.includes(book.bookid),
          isBorrowed: borrowedBookIds.includes(book.bookid),
        }))

        if (statusFilter === "Lent Out") {
          fetchedBooks = fetchedBooks.filter((book) => lentBookIds.includes(book.bookid))
        } else if (statusFilter === "Borrowed") {
          fetchedBooks = fetchedBooks.filter((book) => borrowedBookIds.includes(book.bookid))
        } else if (statusFilter) {
          fetchedBooks = fetchedBooks.filter((book) => book.reading_status === statusFilter)
        }

        setBooks(fetchedBooks)
        setFilteredBooks(fetchedBooks)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching books:", error)
        setLoading(false)
      }
    }

    fetchBooks()
  }, [statusFilter])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books)
    } else {
      setFilteredBooks(
        books.filter(
          (book) =>
            book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    }
  }, [searchQuery, books])

  const handleFavoriteToggle = async (e, book) => {
    e.stopPropagation() // prevent navigation

    try {
      const readerId = sessionStorage.getItem("reader_id")
      const response = await axios.post("http://localhost:8000/book/favorite", {
        bookId: book.bookid,
        readerId: readerId,
      })

      // Update book in state with new favorite status
      const updatedBooks = books.map((b) =>
        b.bookid === book.bookid ? { ...b, isFavorite: response.data.isFavorite } : b,
      )

      setBooks(updatedBooks)
      setFilteredBooks(
        updatedBooks.filter(
          (book) =>
            searchQuery.trim() === "" ||
            book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author_name.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    } catch (err) {
      console.error("Error updating favorite status:", err)
    }
  }

  const renderBookList = () => {
    if (loading) {
      return <p>Loading books...</p>
    }

    if (filteredBooks.length === 0) {
      return <p>No books found for {statusFilter || "all books"}.</p>
    }

    return (
      <div className="book-list">
        {filteredBooks.map((book) => {
          const progress = book.total_pages ? ((book.currently_read || 0) / book.total_pages) * 100 : 0
          const progressText = book.total_pages
            ? `${book.currently_read || 0} / ${book.total_pages} pages`
            : "Not Started"

          return (
            <div
              key={book.bookid || book._id}
              className="book-card"
              onClick={() => navigate(`/book/${book.bookid || book._id}`)}
              style={{ cursor: "pointer" }}
            >
              {book.isFavorite ? (
                <FaHeart
                  className="favorite-icon"
                  color="red"
                  onClick={(e) => handleFavoriteToggle(e, book)}
                  title="Remove from Favorites"
                />
              ) : (
                <FaRegHeart
                  className="favorite-icon"
                  onClick={(e) => handleFavoriteToggle(e, book)}
                  title="Add to Favorites"
                />
              )}

              <FaTrash
                className="trash-icon"
                onClick={(e) => {
                  e.stopPropagation() // prevent navigation
                  if (window.confirm("Are you sure you want to delete this book?")) {
                    axios
                      .post("http://localhost:8000/book/trash", {
                        bookId: book.bookid,
                        readerId: sessionStorage.getItem("reader_id"),
                      })
                      .then(() => {
                        setBooks(books.filter((b) => b.bookid !== book.bookid))
                        setFilteredBooks(filteredBooks.filter((b) => b.bookid !== book.bookid))
                      })
                      .catch((err) => console.error("Error trashing book:", err))
                  }
                }}
                title="Move to Trash"
              />
              
              {/* Updated book cover section with first letter fallback */}
              <div className="book-cover">
                {book.cover_image ? (
                  <img
                    src={book.cover_image}
                    alt={book.book_name}
                    className="book-cover-image"
                    onError={(e) => {
                      // Hide the image and show the fallback when image fails to load
                      e.target.style.display = 'none'
                      e.target.nextElementSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div 
                  className="no-cover" 
                  style={{ display: book.cover_image ? 'none' : 'flex' }}
                >
                  <span>{book.book_name.charAt(0)}</span>
                </div>
              </div>

              <div className="book-info">
                <h3>{book.book_name}</h3>
                <p>
                  {book.author_name}, {book.year_of_publication}
                </p>
                <StarRating rating={book.book_rating || 0} />
                <div className={`status-badge ${book.reading_status}`}>{book.reading_status}</div>
                {book.isLentOut && <div className="lent-badge">Lent Out</div>}
                {book.isBorrowed && <div className="borrowed-badge">Borrowed</div>}
                <p>Progress: {progressText}</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="all-books">
      <h1>{statusFilter ? `${statusFilter} Books` : "All Books"}</h1>
      <p>Browse and manage your entire book collection.</p>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />

      {/* Book List or Status Messages */}
      {renderBookList()}
    </div>
  )
}

export default AllBooks