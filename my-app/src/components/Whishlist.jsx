import { useState, useEffect } from "react";

const Wishlist = () => {
    const [wishlistBooks, setWishlistBooks] = useState([]);

    useEffect(() => {
        fetch("http://localhost:5000/api/books/wishlist")
            .then((res) => res.json())
            .then((data) => setWishlistBooks(data))
            .catch((error) => console.error("Error fetching wishlist books:", error));
    }, []);

    return (
        <div className="page">
            <h1>Wishlist</h1>
            <div className="book-list">
                {wishlistBooks.length === 0 ? (
                    <p>No books in wishlist.</p>
                ) : (
                    wishlistBooks.map((book) => (
                        <div key={book._id} className="book-card">
                            <h3>{book.book_name}</h3>
                            <p><strong>Author:</strong> {book.author_name}</p>
                            <p><strong>Genre:</strong> {book.genre}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Wishlist;
