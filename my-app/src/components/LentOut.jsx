"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import "../allbooks.css" // Assuming you want to reuse styling from AllBooks

const LentOut = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchLentBooks = async () => {
      try {
        const readerId = sessionStorage.getItem("reader_id")
        if (!readerId) {
          setError("No reader ID found. Please log in again.")
          setLoading(false)
          return
        }
        
        const response = await axios.get(`http://localhost:8000/lending/lent-out?readerid=${readerId}`)
        setBooks(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching lent books:", err)
        setError("Failed to load lent books")
        setLoading(false)
      }
    }
    
    fetchLentBooks()
  }, [])
  
  if (loading) return <div className="loading">Loading your lent books...</div>
  if (error) return <div className="error-message">{error}</div>
  if (books.length === 0) return <div className="no-books">You don't have any books lent out at the moment.</div>
  
  return (
    <div className="all-books-container">
      <h2>Lent Out Books</h2>
      <div className="books-grid">
        {books.map((book) => (
          <Link to={`/book/${book.bookid}`} key={book.bookid} className="book-card">
            <div className="book-image">
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} />
              ) : (
                <div className="placeholder-cover">
                  <span>{book.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="book-info">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">{book.author}</p>
              <div className="lending-badge">
                Lent to: {book.lendingInfo.personName}
              </div>
              <div className="lending-date">
                On: {new Date(book.lendingInfo.date).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default LentOut