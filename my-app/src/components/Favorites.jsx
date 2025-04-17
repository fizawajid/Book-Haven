import { useEffect, useState } from "react";
import { FaStar, FaRegStar, FaHeart, FaTrash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../allbooks.css"; // Reuse the allbooks styles

const StarRating = ({ rating }) => {
    return (
        <div className="star-rating">
            {[...Array(5)].map((_, i) => (
                i < rating ? <FaStar key={i} color="gold" /> : <FaRegStar key={i} />
            ))}
        </div>
    );
};

const Favorites = () => {
    const [favoriteBooks, setFavoriteBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredBooks, setFilteredBooks] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const readerId = sessionStorage.getItem("reader_id");
                
                if (!readerId) {
                    console.error("No reader ID found.");
                    return;
                }
                
                const response = await axios.get(`http://localhost:8000/book/favorites?readerid=${readerId}`);
                setFavoriteBooks(response.data);
                setFilteredBooks(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching favorite books:", error);
                setLoading(false);
            }
        };
        
        fetchFavorites();
    }, []);
    
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredBooks(favoriteBooks);
        } else {
            setFilteredBooks(
                favoriteBooks.filter((book) =>
                    book.book_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    book.author_name.toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }
    }, [searchQuery, favoriteBooks]);

    const handleRemoveFromFavorites = async (e, book) => {
        e.stopPropagation(); // prevent navigation
        
        try {
            const readerId = sessionStorage.getItem("reader_id");
            await axios.post("http://localhost:8000/book/favorite", {
                bookId: book.bookid,
                readerId: readerId
            });
            
            // Remove book from favorites list
            setFavoriteBooks(favoriteBooks.filter(b => b.bookid !== book.bookid));
            setFilteredBooks(filteredBooks.filter(b => b.bookid !== book.bookid));
        } catch (err) {
            console.error("Error removing book from favorites:", err);
        }
    };

    const renderFavoriteBooks = () => {
        if (loading) {
            return <p>Loading favorite books...</p>;
        }
        
        if (filteredBooks.length === 0) {
            return searchQuery.trim() !== "" 
                ? <p>No favorite books found matching your search.</p>
                : <p>You haven't added any books to your favorites yet.</p>;
        }

        return (
            <div className="book-list">
                {filteredBooks.map((book) => {
                    const progress = book.total_pages
                        ? ((book.currently_read || 0) / book.total_pages) * 100
                        : 0;
                    const progressText = book.total_pages
                        ? `${book.currently_read || 0} / ${book.total_pages} pages`
                        : "Not Started";

                    return (
                        <div
                            key={book.bookid || book._id}
                            className="book-card"
                            onClick={() => navigate(`/book/${book.bookid || book._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <FaHeart
                                className="favorite-icon"
                                color="red"
                                onClick={(e) => handleRemoveFromFavorites(e, book)}
                                title="Remove from Favorites"
                            />

                            <FaTrash
                                className="trash-icon"
                                onClick={(e) => {
                                    e.stopPropagation(); // prevent navigation
                                    if (window.confirm("Are you sure you want to delete this book?")) {
                                        const readerId = sessionStorage.getItem("reader_id");
                                        axios.post("http://localhost:8000/book/trash", {
                                            bookId: book.bookid,
                                            readerId: readerId
                                        })
                                        .then(() => {
                                            setFavoriteBooks(favoriteBooks.filter(b => b.bookid !== book.bookid));
                                            setFilteredBooks(filteredBooks.filter(b => b.bookid !== book.bookid));
                                        })
                                        .catch(err => console.error("Error trashing book:", err));
                                    }
                                }}
                                title="Move to Trash"
                            />
                            <img
                                src={book.cover_image || "https://via.placeholder.com/150"}
                                alt={book.book_name}
                                className="book-cover"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/empty.png";
                                }}
                            />
                            <div className="book-info">
                                <h3>{book.book_name}</h3>
                                <p>{book.author_name}, {book.year_of_publication}</p>
                                <StarRating rating={book.book_rating || 0} />
                                <div className={`status-badge ${book.reading_status}`}>
                                    {book.reading_status}
                                </div>
                                <p>Progress: {progressText}</p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="all-books">
            <h1>Favorite Books</h1>
            <p>Browse and manage your favorite books collection.</p>

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search favorite books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-bar"
            />

            {/* Book List or Status Messages */}
            {renderFavoriteBooks()}
        </div>
    );
};

export default Favorites;