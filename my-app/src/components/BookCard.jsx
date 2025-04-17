const BookCard = ({ book }) => {
    return (
      <div className="book-card">
        <h3>{book.title}</h3>
        <p>Author: {book.author}</p>
        <p>Genre: {book.genre}</p>
      </div>
    );
  };
  
  export default BookCard;
  