import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../GenrePage.css"; 

const Genre = () => {
  const [genres, setGenres] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGenres = async () => {
      const readerId = sessionStorage.getItem("reader_id");
      if (!readerId) {
        setError("You need to be logged in to view genres");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8000/book?readerid=${readerId}`);
        
        // Extract unique genres
        const allBooks = response.data.books.filter(book => book.reading_status !== "Trash");
        setBooks(allBooks);
        
        // Create array of unique genres
        const uniqueGenres = [...new Set(allBooks.map(book => book.genre))].filter(Boolean);
        
        // Count books per genre
        const genresWithCount = uniqueGenres.map(genre => ({
          name: genre,
          count: allBooks.filter(book => book.genre === genre).length
        }));
        
        setGenres(genresWithCount);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching genres:", err);
        setError("Failed to load genres. Please try again later.");
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
  };

  const filteredBooks = selectedGenre 
    ? books.filter(book => book.genre === selectedGenre) 
    : [];

  if (loading) return <div className="loading">Loading genres...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="genre-container">
      <h1 className="page-title">Genres</h1>
      
      {genres.length === 0 ? (
        <div className="no-genres">
          <p>You haven't added any books with genres yet.</p>
          <p>Add books with genres to see them listed here.</p>
        </div>
      ) : (
        <div className="genre-content">
          <div className="genre-list">
            {genres.map((genre, index) => (
              <div 
                key={index} 
                className={`genre-card ${selectedGenre === genre.name ? 'selected' : ''}`}
                onClick={() => handleGenreClick(genre.name)}
              >
                <h3 className="genre-name">{genre.name}</h3>
                <span className="genre-count">{genre.count} {genre.count === 1 ? 'book' : 'books'}</span>
              </div>
            ))}
          </div>
          
          {selectedGenre && (
            <div className="genre-books">
              <h2>Books in {selectedGenre}</h2>
              {filteredBooks.length > 0 ? (
                <div className="books-grid">
                  {filteredBooks.map((book) => (
                    <Link to={`/book/${book.bookid}`} key={book.bookid} className="book-card">
                      <div className="book-cover">
                        {book.cover_image ? (
                          <img src={book.cover_image} alt={book.book_name} />
                        ) : (
                          <div className="no-cover">
                            <span>{book.book_name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="book-info">
                        <h3 className="book-title">{book.book_name}</h3>
                        <p className="book-author">{book.author_name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>No books found in this genre.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Genre;