// "use client"

// import { useEffect, useState } from "react"
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "./Tabs"
// import { useParams, useNavigate } from "react-router-dom"
// import { FaTags, FaStar, FaRegStar } from "react-icons/fa"
// import { MdTimer } from "react-icons/md"
// import { IoArrowRedoCircleSharp } from "react-icons/io5"
// import { MdEdit } from "react-icons/md"
// import { MdShare } from "react-icons/md"
// import "../BookDetails.css"
// import ReadingTimerDialog from "./ReadingTimerDialog"
// import BookQuotes from "./BookQuotes"
// import Reread from "./Reread"
// import LendingDialog from "./LendingDialog"
// import LendingInfo from "./LendingInfo"
// import axios from "axios"

// const BookDetails = () => {
//   const { id } = useParams()
//   const [book, setBook] = useState(null)
//   const [rating, setRating] = useState(0)
//   const [review, setReview] = useState("")
//   const [isUpdating, setIsUpdating] = useState(false)
//   const [isTimerOpen, setIsTimerOpen] = useState(false)
//   const [tags, setTags] = useState([])
//   const [summary, setSummary] = useState("")
//   const [loadingSummary, setLoadingSummary] = useState(false)
//   const [newTag, setNewTag] = useState("")
//   const [isAddingTag, setIsAddingTag] = useState(false)
//   const [isLendingOpen, setIsLendingOpen] = useState(false)
//   const [isBorrowingOpen, setIsBorrowingOpen] = useState(false)
//   const [isLentOut, setIsLentOut] = useState(false)
//   const [isBorrowed, setIsBorrowed] = useState(false)
//   const navigate = useNavigate()
//   const [activeTab, setActiveTab] = useState('details')

//   useEffect(() => {
//     fetch(`http://localhost:8000/book/${id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         setBook(data.book)
//         setTags(data.tags || [])
//         setRating(data.book.book_rating || 0)
//         setReview(data.book.book_review || "")
//       })
//       .catch((error) => console.error("Error fetching book details:", error))

//     // Check if book is lent out or borrowed
//     checkLendingStatus()
//     checkBorrowingStatus()
//   }, [id])

//   const checkLendingStatus = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8000/lending/${id}?status=lent`)
//       setIsLentOut(response.data && response.data.status === "lent")
//     } catch (error) {
//       if (error.response && error.response.status !== 404) {
//         console.error("Error checking lending status:", error)
//       }
//       setIsLentOut(false)
//     }
//   }

//   const checkBorrowingStatus = async () => {
//     try {
//       const response = await axios.get(`http://localhost:8000/lending/${id}?status=borrowed`)
//       setIsBorrowed(response.data && response.data.status === "borrowed")
//     } catch (error) {
//       if (error.response && error.response.status !== 404) {
//         console.error("Error checking borrowing status:", error)
//       }
//       setIsBorrowed(false)
//     }
//   }

//   const handleAddTag = async () => {
//     if (!newTag.trim()) return
    
//     // Validate tag contains only letters
//     if (!/^[a-zA-Z\u00C0-\u017F'-]+$/.test(newTag.trim())) {
//       alert("Tags can only contain letters. Numbers, spaces, and special characters are not allowed.");
//       return;
//     }
  
//     try {
//       const response = await fetch(`http://localhost:8000/book/${book.bookid}/tags`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tag: newTag.trim() }),
//       })
  
//       if (response.ok) {
//         setTags([...tags, { tag: newTag.trim() }])
//         setNewTag("")
//       } else {
//         console.error("Failed to add tag")
//       }
//     } catch (error) {
//       console.error("Error adding tag:", error)
//     }
//   }
//   const handleTagInputChange = (e) => {
//     const value = e.target.value;
//     // Only update state if the input contains only letters or is empty
//     if (value === '' || /^[a-zA-Z\u00C0-\u017F'-]+$/.test(value)) {
//       setNewTag(value);
//     }
//   }
//   // Add this function to handle tag deletion
//   const handleDeleteTag = async (tagToDelete) => {
//     try {
//       const response = await fetch(`http://localhost:8000/book/${book.bookid}/tags`, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tag: tagToDelete }),
//       })

//       if (response.ok) {
//         setTags(tags.filter((tagObj) => tagObj.tag !== tagToDelete))
//       } else {
//         console.error("Failed to delete tag")
//       }
//     } catch (error) {
//       console.error("Error deleting tag:", error)
//     }
//   }

//   const handleCoverUpload = async (e) => {
//     const file = e.target.files[0]
//     if (!file) return

//     const formData = new FormData()
//     formData.append("cover", file)

//     try {
//       const res = await fetch(`http://localhost:8000/book/${book.bookid}/upload-cover`, {
//         method: "POST",
//         body: formData,
//       })

//       if (!res.ok) throw new Error("Upload failed")
//       const data = await res.json()

//       setBook((prev) => ({ ...prev, cover_image: data.cover_image }))
//       alert("Cover uploaded successfully!")
//     } catch (err) {
//       console.error("Upload error:", err)
//       alert("Failed to upload cover image.")
//     }
//   }

//   // const handleGenerateSummary = async () => {
//   //   setLoadingSummary(true)
//   //   try {
//   //     const response = await fetch("http://localhost:8000/api/summary", {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({
//   //         bookName: book.book_name,
//   //         authorName: book.author_name,
//   //       }),
//   //     })

//   //     const data = await response.json()
//   //     setSummary(data.summary)
//   //   } catch (err) {
//   //     console.error("Failed to generate summary", err)
//   //     setSummary("Failed to generate summary. Please try again.")
//   //   } finally {
//   //     setLoadingSummary(false)
//   //   }
//   // }

//   const handleGenerateSummary = async () => {
//     setLoadingSummary(true);
//     try {
//       const response = await fetch("http://localhost:8000/api/summary", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           bookName: book.book_name,
//           authorName: book.author_name,
//         }),
//       });
  
//       const data = await response.json();
//       setSummary(data.summary);
//     } catch (err) {
//       console.error("Failed to generate summary", err);
//       setSummary("Failed to generate summary. Please try again.");
//     } finally {
//       setLoadingSummary(false);
//     }
//   };

//   const updateReview = async () => {
//     setIsUpdating(true)
//     try {
//       const response = await fetch(`http://localhost:8000/book/${id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ book_rating: rating, book_review: review }),
//       })

//       if (response.ok) {
//         const updatedBook = await response.json()
//         setBook(updatedBook.book)
//       } else {
//         console.error("Failed to update book review")
//       }
//     } catch (error) {
//       console.error("Error updating review:", error)
//     }
//     setIsUpdating(false)
//   }

//   const handleReread = async () => {
//     try {
//       const res = await fetch(`http://localhost:8000/book/${book.bookid}/reread`, {
//         method: "POST",
//       })

//       const data = await res.json()
//       if (res.ok) {
//         alert("Reread started successfully!")
//         // Optionally: trigger a refresh or state update here
//       } else {
//         alert(data.error)
//       }
//     } catch (err) {
//       console.error(err)
//       alert("Something went wrong")
//     }
//   }

//   const handleOpenTimer = () => {
//     if (isLentOut) {
//       alert("This book is currently lent out. You cannot log reading sessions until it is returned.")
//       return
//     }
//     setIsTimerOpen(true)
//   }

//   const handleLendingComplete = () => {
//     setIsLentOut(true)
//     checkLendingStatus()
//   }

//   const handleBorrowingComplete = () => {
//     setIsBorrowed(true)
//     checkBorrowingStatus()
//   }

//   const handleLendingCleared = () => {
//     setIsLentOut(false)
//   }

//   const handleBorrowingCleared = () => {
//     setIsBorrowed(false)
//   }

//   if (!book) {
//     return <p>Loading book details...</p>
//   }

//   return (
//     <div className="book-details">
//       <button onClick={() => navigate(-1)} className="bookDetails-back-button">
//         ← Back
//       </button>
//       <h1 className="BookDetails-h1">{book.book_name}</h1>
//       <div className="book-container">
//         <div className="book-image-container">
//           {/* <div className="cover-with-edit">
//             <img
//               src={book.cover_image || "https://via.placeholder.com/150"}
//               alt={book.book_name}
//               className="book-cover-large"
//               onError={(e) => {
//                 e.target.onerror = null
//                 e.target.src = "/empty.png"
//               }}
//             />
//             <label htmlFor="cover-upload" className="edit-cover-button">
//               <MdEdit className="edit-icon" />
//             </label>
//           </div> */}
//         <div className="cover-with-edit">
//   {book.cover_image ? (
//     <img
//       src={book.cover_image}
//       alt={book.book_name}
//       className="book-cover-large"
//       onError={(e) => {
//         e.target.style.display = 'none';
//         e.target.nextSibling.style.display = 'flex';
//       }}
//     />
//   ) : null}
  
//   <div 
//     className="no-cover-large" 
//     style={{ 
//       display: book.cover_image ? 'none' : 'flex',
//       width: '195px', // Adjust to match your book-cover-large width
//       height: '300px', 
//       backgroundColor: '#f0f0f0',
//       border: '2px solid #ddd',
//       borderRadius: '8px',
//       alignItems: 'center',
//       justifyContent: 'center',
//       fontSize: '3rem',
//       fontWeight: 'bold',
//       color: '#666',
//       //textTransform: 'uppercase'
//     }}
//   >
//     <span>{book.book_name.charAt(0)}</span>
//   </div>
  
//   <label htmlFor="cover-upload" className="edit-cover-button">
//     <MdEdit className="edit-icon" />
//   </label>
// </div>



//           {/* Log Reading Session Button */}
//           <button onClick={handleOpenTimer} className="log-reading-button">
//             <MdTimer style={{ marginBottom: "-2px" }} /> Log Reading Session
//           </button>
//           {book.reading_status === "Completed" && (
//             <button onClick={() => handleReread()} className="re-read-button">
//               <IoArrowRedoCircleSharp style={{ marginBottom: "-2px" }} /> Re-Read
//             </button>
//           )}

//           {/* Lending & Borrowing Section */}
//           <div className="lending-borrowing-section">
//             {isLentOut ? (
//               <LendingInfo bookId={book.bookid} onStatusCleared={handleLendingCleared} mode="lend" />
//             ) : isBorrowed ? (
//               <LendingInfo bookId={book.bookid} onStatusCleared={handleBorrowingCleared} mode="borrow" />
//             ) : (
//               <div className="lending-borrowing-buttons">
//                 <button onClick={() => setIsLendingOpen(true)} className="lend-button" disabled={isBorrowed}>
//                   <MdShare style={{ marginBottom: "-2px" }} /> Lend Book
//                 </button>
//                 <button onClick={() => setIsBorrowingOpen(true)} className="borrow-buttonn" disabled={isLentOut}>
//                   <MdShare style={{ marginBottom: "-2px" }} /> Borrow Book
//                 </button>
//               </div>
//             )}
//           </div>

//           <input
//             type="file"
//             accept="image/*"
//             id="cover-upload"
//             style={{ display: "none" }}
//             onChange={handleCoverUpload}
//           />

//           {/* Add Tags Button and Input */}
//           <div className="tags-section">
//             <button onClick={() => setIsAddingTag(!isAddingTag)} className="add-tags-button">
//               <>
//                 <FaTags className="icon-spacing" /> Add Tags
//               </>
//             </button>

//             {isAddingTag && (
//               <div className="tag-input-container">
//                 <input
//                   type="text"
//                   value={newTag}
//                   onChange={handleTagInputChange}
//                   placeholder="Enter a tag (letters only)"
//                   className="tag-input"
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter" && newTag.trim()) {
//                       handleAddTag()
//                     }
//                   }}
//                 />
//                 <button onClick={handleAddTag} disabled={!newTag.trim()} className="save-tag-button">
//                   Add
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Timer Dialog */}
//           {isTimerOpen && <ReadingTimerDialog onClose={() => setIsTimerOpen(false)} curr_book={book} />}

//           {/* Lending Dialog */}
//           {isLendingOpen && (
//             <div className="dialog-overlay">
//               <LendingDialog
//                 onClose={() => setIsLendingOpen(false)}
//                 bookId={book.bookid}
//                 onLendingComplete={handleLendingComplete}
//                 mode="lend"
//               />
//             </div>
//           )}

//           {/* Borrowing Dialog */}
//           {isBorrowingOpen && (
//             <div className="dialog-overlay">
//               <LendingDialog
//                 onClose={() => setIsBorrowingOpen(false)}
//                 bookId={book.bookid}
//                 onLendingComplete={handleBorrowingComplete}
//                 mode="borrow"
//               />
//             </div>
//           )}
//         </div>
//         <div className="Book-Segment">
//           <div className="tab-navigation">
//             <input 
//               type="button" 
//               value="Details" 
//               onClick={() => setActiveTab('details')} 
//               className={activeTab === 'details' ? 'active' : ''}
//             />
//             <input 
//               type="button" 
//               value="Quotes" 
//               onClick={() => setActiveTab('quotes')} 
//               className={activeTab === 'quotes' ? 'active' : ''}
//             />
//             <input 
//               type="button" 
//               value="Reread History" 
//               onClick={() => setActiveTab('reread')} 
//               className={activeTab === 'reread' ? 'active' : ''}
//             />
//             <input 
//               type="button" 
//               value="AI Summary" 
//               onClick={() => setActiveTab('ai')} 
//               className={activeTab === 'ai' ? 'active' : ''}
//             />
//           </div>

//           <div className="tab-content">
//             {activeTab === 'details' && (
//               <div className="space-y-4">
//                 <div className="mybook-info">
//                   <p>
//                     <strong>Author:</strong> {book.author_name}
//                   </p>
//                   <p>
//                     <strong>Genre:</strong> {book.genre}
//                   </p>
//                   <p>
//                     <strong>Year of Publication:</strong> {book.year_of_publication}
//                   </p>
//                   <p>
//                     <strong>Pages:</strong> {book.total_pages}
//                   </p>
//                   <p>
//                     <strong>Pages Read:</strong> {book.currently_read} / {book.total_pages}
//                   </p>
//                   {/* Render Tags */}
//                   {tags.length > 0 && (
//                     <div className="tag-container">
//                       {tags.map((tagObj, index) => (
//                         <span key={index} className="tag-pill">
//                           {tagObj.tag}
//                           <button onClick={() => handleDeleteTag(tagObj.tag)} className="delete-tag-button">
//                             ×
//                           </button>
//                         </span>
//                       ))}
//                     </div>
//                   )}
//                   {/* Rating */}
//                   <p className="rating-container">
//                     <strong>Rating:</strong>
//                     {[...Array(5)].map((_, index) => {
//                       const starIndex = index + 1
//                       return (
//                         <span
//                           key={starIndex}
//                           onClick={() => setRating(starIndex)}
//                           className={`star ${starIndex <= rating ? "filled" : "empty"}`}
//                         >
//                           {starIndex <= rating ? <FaStar /> : <FaRegStar />}
//                         </span>
//                       )
//                     })}
//                   </p>

//                   {/* Review */}
//                   <p>
//                     <strong>Review:</strong>
//                   </p>
//                   <textarea
//                     value={review}
//                     onChange={(e) => setReview(e.target.value)}
//                     className="review-textarea"
//                     rows="2"
//                   ></textarea>
//                   <button onClick={updateReview} className="save-review-button" disabled={isUpdating}>
//                     {isUpdating ? "Saving..." : "Save"}
//                   </button>

//                   {/* Date Fields Row */}
//                   <div className="date-fields-row">
//                     <div className="date-field">
//                       <strong>Added on:</strong> {book.add_date}
//                     </div>
//                     <div className="date-field">
//                       <strong>Started:</strong> {book.start_date}
//                     </div>
//                     <div className="date-field">
//                       <strong>Completed:</strong> {book.end_date}
//                     </div>
//                   </div>

                  
//                 </div>
//               </div>
//             )}

//             {activeTab === 'quotes' && (
//               <div className="space-y-4">
//                 <BookQuotes bookId={book.bookid} />
//               </div>
//             )}

//             {activeTab === 'reread' && (
//               <div className="space-y-4">
//                 <Reread bookid={book.bookid} />
//               </div>
//             )}

//             {activeTab === 'ai' && (
//               <div className="space-y-4">
//                 <div className="ai-summary-container">
//                   <h3 className="asummary-title">AI-Generated Book Summary</h3>
//                   <p className="summary-description">
//                     Get an AI-generated summary of "{book.book_name}" by {book.author_name}.
//                     {/* This summary is created using Google's Gemini AI model. */}
//                   </p>
                  
//                   <button 
//                     onClick={handleGenerateSummary} 
//                     className="generate-summary-button" 
//                     disabled={loadingSummary}
//                   >
//                     {loadingSummary ? 
//                       <><span className="spinner"></span> Generating...</> : 
//                       "Generate Summary"}
//                   </button>

//                   {summary && (
//                     <div className="summary-output">
//                       <h4 className="asummary-heading">Summary:</h4>
//                       <div className="summary-content">
//                         {summary.split('\n').map((paragraph, idx) => (
//                           paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default BookDetails


"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FaTags, FaStar, FaRegStar } from "react-icons/fa"
import { MdTimer } from "react-icons/md"
import { IoArrowRedoCircleSharp } from "react-icons/io5"
import { MdEdit } from "react-icons/md"
import { MdShare } from "react-icons/md"
import "../BookDetails.css"
import ReadingTimerDialog from "./ReadingTimerDialog"
import BookQuotes from "./BookQuotes"
import Reread from "./Reread"
import LendingDialog from "./LendingDialog"
import LendingInfo from "./LendingInfo"
import axios from "axios"

const BookDetails = () => {
  const { id } = useParams()
  const [book, setBook] = useState(null)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTimerOpen, setIsTimerOpen] = useState(false)
  const [tags, setTags] = useState([])
  const [summary, setSummary] = useState("")
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isLendingOpen, setIsLendingOpen] = useState(false)
  const [isBorrowingOpen, setIsBorrowingOpen] = useState(false)
  const [isLentOut, setIsLentOut] = useState(false)
  const [isBorrowed, setIsBorrowed] = useState(false)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("details")

  // New state for genre editing
  const [isEditingGenre, setIsEditingGenre] = useState(false)
  const [editGenre, setEditGenre] = useState("")
  const [genreError, setGenreError] = useState("")

  useEffect(() => {
    fetch(`http://localhost:8000/book/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBook(data.book)
        setTags(data.tags || [])
        setRating(data.book.book_rating || 0)
        setReview(data.book.book_review || "")
        setEditGenre(data.book.genre || "") // Initialize edit genre
      })
      .catch((error) => console.error("Error fetching book details:", error))

    // Check if book is lent out or borrowed
    checkLendingStatus()
    checkBorrowingStatus()
  }, [id])

  const checkLendingStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/lending/${id}?status=lent`)
      setIsLentOut(response.data && response.data.status === "lent")
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error("Error checking lending status:", error)
      }
      setIsLentOut(false)
    }
  }

  const checkBorrowingStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/lending/${id}?status=borrowed`)
      setIsBorrowed(response.data && response.data.status === "borrowed")
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error("Error checking borrowing status:", error)
      }
      setIsBorrowed(false)
    }
  }

  // Function to validate genre (no numbers allowed)
  const containsNumbers = (text) => {
    return /\d/.test(text)
  }

  // Function to handle genre edit
  const handleEditGenre = () => {
    setIsEditingGenre(true)
    setEditGenre(book.genre || "")
    setGenreError("")
  }

  // Function to save genre
  const handleSaveGenre = async () => {
    const trimmedGenre = editGenre.trim()

    // Validate genre
    if (trimmedGenre && containsNumbers(trimmedGenre)) {
      setGenreError("Genre should not contain numbers.")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/book/${id}/genre`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genre: trimmedGenre }),
      })

      if (response.ok) {
        //const updatedData = await response.json()
        setBook((prev) => ({ ...prev, genre: trimmedGenre }))
        setIsEditingGenre(false)
        setGenreError("")
      } else {
        console.error("Failed to update genre")
        setGenreError("Failed to update genre. Please try again.")
      }
    } catch (error) {
      console.error("Error updating genre:", error)
      setGenreError("Error updating genre. Please try again.")
    }
  }

  // Function to cancel genre edit
  const handleCancelGenreEdit = () => {
    setIsEditingGenre(false)
    setEditGenre(book.genre || "")
    setGenreError("")
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    // Validate tag contains only letters
    if (!/^[a-zA-Z\u00C0-\u017F'-]+$/.test(newTag.trim())) {
      alert("Tags can only contain letters. Numbers, spaces, and special characters are not allowed.")
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/book/${book.bookid}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: newTag.trim() }),
      })

      if (response.ok) {
        setTags([...tags, { tag: newTag.trim() }])
        setNewTag("")
      } else {
        console.error("Failed to add tag")
      }
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }
  const handleTagInputChange = (e) => {
    const value = e.target.value
    // Only update state if the input contains only letters or is empty
    if (value === "" || /^[a-zA-Z\u00C0-\u017F'-]+$/.test(value)) {
      setNewTag(value)
    }
  }
  // Add this function to handle tag deletion
  const handleDeleteTag = async (tagToDelete) => {
    try {
      const response = await fetch(`http://localhost:8000/book/${book.bookid}/tags`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tagToDelete }),
      })

      if (response.ok) {
        setTags(tags.filter((tagObj) => tagObj.tag !== tagToDelete))
      } else {
        console.error("Failed to delete tag")
      }
    } catch (error) {
      console.error("Error deleting tag:", error)
    }
  }

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("cover", file)

    try {
      const res = await fetch(`http://localhost:8000/book/${book.bookid}/upload-cover`, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Upload failed")
      const data = await res.json()

      setBook((prev) => ({ ...prev, cover_image: data.cover_image }))
      alert("Cover uploaded successfully!")
    } catch (err) {
      console.error("Upload error:", err)
      alert("Failed to upload cover image.")
    }
  }

  const handleGenerateSummary = async () => {
    setLoadingSummary(true)
    try {
      const response = await fetch("http://localhost:8000/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookName: book.book_name,
          authorName: book.author_name,
        }),
      })

      const data = await response.json()
      setSummary(data.summary)
    } catch (err) {
      console.error("Failed to generate summary", err)
      setSummary("Failed to generate summary. Please try again.")
    } finally {
      setLoadingSummary(false)
    }
  }

  const updateReview = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`http://localhost:8000/book/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_rating: rating, book_review: review }),
      })

      if (response.ok) {
        const updatedBook = await response.json()
        setBook(updatedBook.book)
      } else {
        console.error("Failed to update book review")
      }
    } catch (error) {
      console.error("Error updating review:", error)
    }
    setIsUpdating(false)
  }

  const handleReread = async () => {
    try {
      const res = await fetch(`http://localhost:8000/book/${book.bookid}/reread`, {
        method: "POST",
      })

      const data = await res.json()
      if (res.ok) {
        alert("Reread started successfully!")
        // Optionally: trigger a refresh or state update here
      } else {
        alert(data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Something went wrong")
    }
  }

  const handleOpenTimer = () => {
    if (isLentOut) {
      alert("This book is currently lent out. You cannot log reading sessions until it is returned.")
      return
    }
    setIsTimerOpen(true)
  }

  const handleLendingComplete = () => {
    setIsLentOut(true)
    checkLendingStatus()
  }

  const handleBorrowingComplete = () => {
    setIsBorrowed(true)
    checkBorrowingStatus()
  }

  const handleLendingCleared = () => {
    setIsLentOut(false)
  }

  const handleBorrowingCleared = () => {
    setIsBorrowed(false)
  }

  if (!book) {
    return <p>Loading book details...</p>
  }

  return (
    <div className="book-details">
      <button onClick={() => navigate(-1)} className="bookDetails-back-button">
        ← Back
      </button>
      <h1 className="BookDetails-h1">{book.book_name}</h1>
      <div className="book-container">
        <div className="book-image-container">
          <div className="cover-with-edit">
            {book.cover_image ? (
              <img
                src={book.cover_image || "/placeholder.svg"}
                alt={book.book_name}
                className="book-cover-large"
                onError={(e) => {
                  e.target.style.display = "none"
                  e.target.nextSibling.style.display = "flex"
                }}
              />
            ) : null}

            <div
              className="no-cover-large"
              style={{
                display: book.cover_image ? "none" : "flex",
                width: "195px",
                height: "300px",
                backgroundColor: "#f0f0f0",
                border: "2px solid #ddd",
                borderRadius: "8px",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "3rem",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              <span>{book.book_name.charAt(0)}</span>
            </div>

            <label htmlFor="cover-upload" className="edit-cover-button">
              <MdEdit className="edit-icon" />
            </label>
          </div>

          {/* Log Reading Session Button */}
          <button onClick={handleOpenTimer} className="log-reading-button">
            <MdTimer style={{ marginBottom: "-2px" }} /> Log Reading Session
          </button>
          {book.reading_status === "Completed" && (
            <button onClick={() => handleReread()} className="re-read-button">
              <IoArrowRedoCircleSharp style={{ marginBottom: "-2px" }} /> Re-Read
            </button>
          )}

          {/* Lending & Borrowing Section */}
          <div className="lending-borrowing-section">
            {isLentOut ? (
              <LendingInfo bookId={book.bookid} onStatusCleared={handleLendingCleared} mode="lend" />
            ) : isBorrowed ? (
              <LendingInfo bookId={book.bookid} onStatusCleared={handleBorrowingCleared} mode="borrow" />
            ) : (
              <div className="lending-borrowing-buttons">
                <button onClick={() => setIsLendingOpen(true)} className="lend-button" disabled={isBorrowed}>
                  <MdShare style={{ marginBottom: "-2px" }} /> Lend Book
                </button>
                <button onClick={() => setIsBorrowingOpen(true)} className="borrow-buttonn" disabled={isLentOut}>
                  <MdShare style={{ marginBottom: "-2px" }} /> Borrow Book
                </button>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            id="cover-upload"
            style={{ display: "none" }}
            onChange={handleCoverUpload}
          />

          {/* Add Tags Button and Input */}
          <div className="tags-section">
            <button onClick={() => setIsAddingTag(!isAddingTag)} className="add-tags-button">
              <>
                <FaTags className="icon-spacing" /> Add Tags
              </>
            </button>

            {isAddingTag && (
              <div className="tag-input-container">
                <input
                  type="text"
                  value={newTag}
                  onChange={handleTagInputChange}
                  placeholder="Enter a tag (letters only)"
                  className="tag-input"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTag.trim()) {
                      handleAddTag()
                    }
                  }}
                />
                <button onClick={handleAddTag} disabled={!newTag.trim()} className="save-tag-button">
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Timer Dialog */}
          {isTimerOpen && <ReadingTimerDialog onClose={() => setIsTimerOpen(false)} curr_book={book} />}

          {/* Lending Dialog */}
          {isLendingOpen && (
            <div className="dialog-overlay">
              <LendingDialog
                onClose={() => setIsLendingOpen(false)}
                bookId={book.bookid}
                onLendingComplete={handleLendingComplete}
                mode="lend"
              />
            </div>
          )}

          {/* Borrowing Dialog */}
          {isBorrowingOpen && (
            <div className="dialog-overlay">
              <LendingDialog
                onClose={() => setIsBorrowingOpen(false)}
                bookId={book.bookid}
                onLendingComplete={handleBorrowingComplete}
                mode="borrow"
              />
            </div>
          )}
        </div>
        <div className="Book-Segment">
          <div className="tab-navigation">
            <input
              type="button"
              value="Details"
              onClick={() => setActiveTab("details")}
              className={activeTab === "details" ? "active" : ""}
            />
            <input
              type="button"
              value="Quotes"
              onClick={() => setActiveTab("quotes")}
              className={activeTab === "quotes" ? "active" : ""}
            />
            <input
              type="button"
              value="Reread History"
              onClick={() => setActiveTab("reread")}
              className={activeTab === "reread" ? "active" : ""}
            />
            <input
              type="button"
              value="AI Summary"
              onClick={() => setActiveTab("ai")}
              className={activeTab === "ai" ? "active" : ""}
            />
          </div>

          <div className="tab-content">
            {activeTab === "details" && (
              <div className="space-y-4">
                <div className="mybook-info">
                  <p>
                    <strong>Author:</strong> {book.author_name}
                  </p>

                  {/* Editable Genre Section */}
                  <div className="genre-section">
                    <p>
                      <strong>Genre:</strong>
                      {!isEditingGenre ? (
                        <span className="genre-display">
                          {book.genre || "Not specified"}
                          <button onClick={handleEditGenre} className="edit-genre-button" title="Edit genre">
                            <MdEdit className="edit-icon-small" />
                          </button>
                        </span>
                      ) : (
                        <div className="genre-edit-container">
                          <input
                            type="text"
                            value={editGenre}
                            onChange={(e) => {
                              setEditGenre(e.target.value)
                              if (genreError) setGenreError("")
                            }}
                            placeholder="Enter genre"
                            className={`genre-input ${genreError ? "input-error" : ""}`}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveGenre()
                              } else if (e.key === "Escape") {
                                handleCancelGenreEdit()
                              }
                            }}
                            autoFocus
                          />
                          <div className="genre-buttons">
                            <button onClick={handleSaveGenre} className="save-genre-button">
                              Save
                            </button>
                            <button onClick={handleCancelGenreEdit} className="cancel-genre-button">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </p>
                    {genreError && <p className="error-text">{genreError}</p>}
                  </div>

                  <p>
                    <strong>Year of Publication:</strong> {book.year_of_publication}
                  </p>
                  <p>
                    <strong>Pages:</strong> {book.total_pages}
                  </p>
                  <p>
                    <strong>Pages Read:</strong> {book.currently_read} / {book.total_pages}
                  </p>
                  {/* Render Tags */}
                  {tags.length > 0 && (
                    <div className="tag-container">
                      {tags.map((tagObj, index) => (
                        <span key={index} className="tag-pill">
                          {tagObj.tag}
                          <button onClick={() => handleDeleteTag(tagObj.tag)} className="delete-tag-button">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Rating */}
                  <p className="rating-container">
                    <strong>Rating:</strong>
                    {[...Array(5)].map((_, index) => {
                      const starIndex = index + 1
                      return (
                        <span
                          key={starIndex}
                          onClick={() => setRating(starIndex)}
                          className={`star ${starIndex <= rating ? "filled" : "empty"}`}
                        >
                          {starIndex <= rating ? <FaStar /> : <FaRegStar />}
                        </span>
                      )
                    })}
                  </p>

                  {/* Review */}
                  <p>
                    <strong>Review:</strong>
                  </p>
                  <textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="review-textarea"
                    rows="2"
                  ></textarea>
                  <button onClick={updateReview} className="save-review-button" disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save"}
                  </button>

                  {/* Date Fields Row */}
                  <div className="date-fields-row">
                    <div className="date-field">
                      <strong>Added on:</strong> {book.add_date}
                    </div>
                    <div className="date-field">
                      <strong>Started:</strong> {book.start_date}
                    </div>
                    <div className="date-field">
                      <strong>Completed:</strong> {book.end_date}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "quotes" && (
              <div className="space-y-4">
                <BookQuotes bookId={book.bookid} />
              </div>
            )}

            {activeTab === "reread" && (
              <div className="space-y-4">
                <Reread bookid={book.bookid} />
              </div>
            )}

            {activeTab === "ai" && (
              <div className="space-y-4">
                <div className="ai-summary-container">
                  <h3 className="asummary-title">AI-Generated Book Summary</h3>
                  <p className="summary-description">
                    Get an AI-generated summary of "{book.book_name}" by {book.author_name}.
                  </p>

                  <button onClick={handleGenerateSummary} className="generate-summary-button" disabled={loadingSummary}>
                    {loadingSummary ? (
                      <>
                        <span className="spinner"></span> Generating...
                      </>
                    ) : (
                      "Generate Summary"
                    )}
                  </button>

                  {summary && (
                    <div className="summary-output">
                      <h4 className="asummary-heading">Summary:</h4>
                      <div className="summary-content">
                        {summary
                          .split("\n")
                          .map((paragraph, idx) => (paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetails
