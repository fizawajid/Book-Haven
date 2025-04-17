import { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

const BookQuotes = ({ bookId }) => {
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quotes when component mounts
  useEffect(() => {
    fetchQuotes();
  }, [bookId]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/book/${bookId}/quotes`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setQuotes(data);
    } catch (err) {
      console.error("Error fetching quotes:", err);
      setError("Failed to load quotes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuote = async (e) => {
    e.preventDefault();
    
    if (!newQuote.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`http://localhost:8000/book/${bookId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: newQuote.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedQuote = await response.json();
      setQuotes(prevQuotes => [savedQuote, ...prevQuotes]);
      setNewQuote("");
    } catch (err) {
      console.error("Error adding quote:", err);
      setError("Failed to add quote. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    try {
      console.log(`Attempting to delete quote with ID: ${quoteId}`);
      
      const response = await fetch(`http://localhost:8000/book/quotes/${quoteId}`, {
        method: "DELETE"
      });
      
      console.log("Delete response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Remove deleted quote from state
      setQuotes(prevQuotes => prevQuotes.filter(quote => quote.quoteId !== quoteId));
    } catch (err) {
      console.error("Error deleting quote:", err);
      setError("Failed to delete quote. Please try again.");
    }
  };

  if (loading) {
    return <div className="quote-loading">Loading quotes...</div>;
  }

  return (
    <div className="quotes-container">
      {error && <div className="quotes-error">{error}</div>}
      
      <form onSubmit={handleAddQuote} className="quote-form">
        <div className="quote-form-row">
          <div className="quote-input-group">
            <textarea
              value={newQuote}
              onChange={(e) => setNewQuote(e.target.value)}
              placeholder="Add a new quote..."
              className="quote-textarea"
              required
            />
          </div>
          <div className="quote-form-bottom">
            <button 
              type="submit" 
              className="add-quote-button"
              disabled={isSubmitting || !newQuote.trim()}
            >
              {isSubmitting ? "Adding..." : "Add Quote"}
            </button>
          </div>
        </div>
      </form>
      
      <div className="quotes-list">
        {quotes.length === 0 ? (
          <p className="no-quotes">No quotes added yet. Add your first quote!</p>
        ) : (
            quotes.map((quote) => (
                <div key={quote.quoteId} className="quote-item">
                  <div className="quote-text">"{quote.quote}"</div>
                  <div className="quote-date">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => {
                      console.log("Delete button clicked for quote:", quote); // Add this
                      handleDeleteQuote(quote.quoteId);
                    }}
                    className="delete-quote-button"
                    aria-label="Delete quote"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
        )}
      </div>
    </div>
  );
};

export default BookQuotes;