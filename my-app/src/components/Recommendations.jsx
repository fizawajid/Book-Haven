import { useState} from "react";
import "../Recommendation.css"; // Optional for styling

const genres = [
  "Fiction", "Fantasy", "Science Fiction", "Romance", "Mystery",
  "Thriller", "Biography", "History", "Philosophy", "Horror",
  "Health", "Travel", "Comics", "Education", "Art", "Religion",
  "Poetry", "Drama", "Adventure", "Technology"
];

const Recommendations= () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (genre) => {
    setLoading(true);
    try {
      const apiKey = 'AIzaSyDC-ghoqFWOso7cMD0pl7_ea9rt5tRzMx0';
      const randomStartIndex = Math.floor(Math.random() * 30);
      const query = `subject:${encodeURIComponent(genre)}`;
      const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${randomStartIndex}&maxResults=10&key=${apiKey}`;
  
      const res = await fetch(url);
      const data = await res.json();
  
      const books = data.items?.map(item => ({
        title: item.volumeInfo.title || "No title available",
        authors: item.volumeInfo.authors || ["Unknown Author"],
        description: item.volumeInfo.description || "No description available",
        image: item.volumeInfo.imageLinks?.thumbnail,
        previewLink: item.volumeInfo.previewLink,
      })) || [];
  
      setRecommendations(books);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenreClick = (genre) => {
    setSelectedGenre(genre);
    fetchRecommendations(genre);
  };

  return (
    <div className="recommendations-container-r">
     <div className="recommendation-header-r">
      <h1 > Recommendations </h1>
      <p>Get recommendations and browse for your favorite genre</p>
      </div>
     <div className="genre-selector-r">
        {genres.map((genre) => (
          <button
            key={genre}
            className={genre === selectedGenre ? "active-genre" : ""}
            onClick={() => handleGenreClick(genre)}
          >
            {genre}
          </button>
        ))}
      </div>  
      
     <div className="fetched-books-r">
    

      {loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <div className="recommendation-results-r">
          {recommendations.length === 0 && selectedGenre && (
            <p>No recommendations found for "{selectedGenre}"</p>
          )}
          <ul className="recommendation-list-r">
            {recommendations.map((book, index) => (
              <li key={index} className="recommendation-item-r">
                <div className="book-image-container-r">
                  {book.image && (
                    <img src={book.image} alt={book.title} className="book-cover-r" />
                  )}
                </div>
                <div className="book-details-r">
                  <h3>{book.title}</h3>
                  <p><strong>Author(s):</strong> {book.authors.join(", ")}</p>
                  <p>{book.description}</p>
                  {book.previewLink && (
                    <a href={book.previewLink} target="_blank" rel="noopener noreferrer">
                      🔗 Preview Book
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
     </div>
      
    </div>
  );
}
export default Recommendations;