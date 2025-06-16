// import "../main.css";
// import axios from "axios";
// import { useState } from "react";
// import { useEffect } from "react";
// import { AiOutlineClose } from "react-icons/ai";
 
// const AddBookModal = ({ isOpen, closeModal, readerId }) => {
//   const [title, setTitle] = useState("");
//   const [author, setAuthor] = useState("");
//   const [genre, setGenre] = useState("");
//   const [totalPages, setTotalPages] = useState("");
//   const [currentlyRead, setCurrentlyRead] = useState("");
//   const [year, setYear] = useState(new Date().getFullYear());
//   const [status, setStatus] = useState("");
//   const [isWishlist, setIsWishlist] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [hoverRating, setHoverRating] = useState(0);
//   const [coverName, setCoverName] = useState("");
//   const [tags, setTags] = useState([]);
//   const [tagInput, setTagInput] = useState("");
//   const [notes, setNotes] = useState("");
//   const [errors, setErrors] = useState({});
//   const [coverFile, setCoverFile] = useState(null);
//   console.log("Reader ID in AddBookModal:", readerId); // Debugging
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

//   // Validation function to check if string contains numbers
//   const containsNumbers = (text) => {
//     return /\d/.test(text);
//   };

//   useEffect(() => {
//     if (isWishlist) {
//       setStatus("To Read");
//     } else {
//       setStatus(""); // Reset if not Wishlist
//     }
//   }, [isWishlist]);
//   if (!isOpen) return null;
//   const handleCloseModal = () => {
//     setTitle("");
//     setAuthor("");
//     setGenre("");
//     setTotalPages("");
//     setYear(new Date().getFullYear());
//     setStatus("");
//     setIsWishlist(false);
//     setRating(0);
//     setHoverRating(0);
//     setCoverName("");
//     setTags([]);
//     setTagInput("");
//     setNotes("");
//     setErrors({});
//     setStartDate(""); // Reset start date
//     setEndDate("");
//     closeModal();
//   };

//   const handleCoverUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setCoverFile(file);
//       setCoverName(file.name);
//     }
//   };
  
//   const removeTag = (index) => {
//     setTags(tags.filter((_, i) => i !== index));
//   };
//   const isValidTag = (tag) => {
//     // Only allow letters (including non-English), hyphens, and apostrophes
//     return tag.trim() !== "" && /^[a-zA-Z\u00C0-\u017F'-]+$/.test(tag);
//   };
//   const handleAddTag = () => {
//     const trimmedTag = tagInput.trim();
    
//     if (trimmedTag === "") {
//       setErrors({...errors, tagInput: "Tag cannot be empty"});
//       return;
//     }
  
//     // Check if tag contains invalid characters
//     if (!isValidTag(trimmedTag)) {
//       setErrors({...errors, tagInput: "Tags can only contain letters, hyphens (-), and apostrophes (')"});
//       return;
//     }
  
//     // Check if tag already exists (case insensitive)
//     if (tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
//       setErrors({...errors, tagInput: "This tag already exists"});
//       return;
//     }
  
//     // If all validations pass
//     setTags([...tags, trimmedTag]);
//     setTagInput("");
    
//     // Clear any existing errors
//     if (errors.tagInput) {
//       const newErrors = {...errors};
//       delete newErrors.tagInput;
//       setErrors(newErrors);
//     }
//   };

//   const handleAddBook = async () => {
//     const newErrors = {};
    
//     // Validate text fields don't contain numbers
//     if (!title.trim()) {
//       newErrors.title = "Title is required.";
//     }
    
//     if (!author.trim()) {
//       newErrors.author = "Author is required.";
//     } else if (containsNumbers(author)) {
//       newErrors.author = "Author should not contain numbers.";
//     }
    
//     if (!genre.trim()) {
//       newErrors.genre = "Genre is required.";
//     } else if (containsNumbers(genre)) {
//       newErrors.genre = "Genre should not contain numbers.";
//     }
    
//     // Validate tags don't contain numbers
//     const invalidTags = tags.filter(tag => !isValidTag(tag));
//   if (invalidTags.length > 0) {
//     newErrors.tags = "Tags can only contain letters, hyphens (-), and apostrophes (')";
//   }
    
//     // Fixed: Check if totalPages is empty instead of using trim()
//     if (totalPages === "") {
//       newErrors.totalPages = "Total Pages is required.";
//     }
    
//     if (!year) newErrors.year = "Year of publication is required.";
//     if (!isWishlist && !status) newErrors.status = "Status is required.";
  
//     // Validate dates based on status
//     if (status === "Reading" && (!currentlyRead || currentlyRead < 1)) {
//       newErrors.currentlyRead = "Please enter pages read for 'Reading' status.";
//     }
    
//     if (status === "Completed" && currentlyRead !== totalPages) {
//       newErrors.currentlyRead = "For 'Completed' status, pages read must be equal to total pages.";
//     }
     
//     if (status === "Reading" || status === "Completed") {
//       if (!startDate) {
//         newErrors.startDate = "Start date is required.";
//       } else if (startDate > today) {
//         newErrors.startDate = "Start date cannot be in the future.";
//       }
//     }

//     if (status === "Completed") {
//       if (!endDate) {
//         newErrors.endDate = "End date is required.";
//       } else if (endDate > today) {
//         newErrors.endDate = "End date cannot be in the future.";
//       } else if (startDate && endDate < startDate) {
//         newErrors.endDate = "End date cannot be earlier than start date.";
//       }
//     }

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     console.log("Submitting with Reader ID:", readerId); // Debugging

//     if (!readerId) {
//       alert("Error: Reader ID is missing. Please log in again.");
//       return;
//     }
//     /*Check for duplicate book*/
//     try {
//       // First check for existing books
//       const checkResponse = await axios.get(`http://localhost:8000/book/check`, {
//         params: {
//           readerId,
//           title: title.trim().toLowerCase(),
//           author: author.trim().toLowerCase()
//         }
//       });
  
//       if (checkResponse.data.exists) {
//         alert("You already have a book with this title and author in your collection.");
//         return;
//       }
//     /**************************************/
//     const formData = new FormData();
//     formData.append("book_name", title);
//     formData.append("author_name", author);
//     formData.append("genre", genre);
//     formData.append("total_pages", totalPages);
//     formData.append("year_of_publication", year);
//     formData.append("reading_status", isWishlist ? "To Read" : status);
//     formData.append("book_rating", rating);
//     formData.append("book_review", notes);
//     formData.append("start_date", startDate || ""); // Add start_date
//     formData.append("end_date", endDate || ""); // Add end_date
//     formData.append("add_date", today);
//     formData.append("currently_read", currentlyRead || "0");
//     formData.append("tags", tags); // Add tags to form data

//     if (coverFile) {
//       formData.append("cover_image", coverFile); // Attach file
//     }
//     // Add readerId to associate the book with a specific reader
//     if (readerId) {
//       formData.append("readerid", readerId);
//     }
  
    
//       const response = await axios.post("http://localhost:8000/book/add", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });
  
//       console.log("Book Added:", response.data);
//       alert("Book added successfully!");
//       handleCloseModal();
//     } catch (error) {
//       console.error("Error adding book:", error);
//       alert("Failed to add book. Please try again.");
//     }
//   };

//   // Generate years from 1900 to the current year
//   const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i);

//   return (
//     <div className="modal-overlay">
//       <div className="modal-container">
//         <button className="close-button" onClick={handleCloseModal}>
//           <AiOutlineClose />
//         </button>

//         <h2 className="modal-title">Add New Book</h2>

//         {/* Cover Upload (Optional) */}
//         <div className="cover-upload">
//           <input type="file" accept="image/*" onChange={handleCoverUpload} />
//           {coverName && <p className="cover-name">Uploaded: {coverName}</p>}
//         </div>

//         {/* Form Fields (Required) */}
//         <input
//           type="text"
//           placeholder="Title"
//           className={`input-field ${errors.title ? "input-error" : ""}`}
//           value={title}
//           onChange={(e) => {
//             const val = e.target.value;
//             setTitle(val);
//             // Clear error when typing
//             if (errors.title) {
//               const newErrors = {...errors};
//               delete newErrors.title;
//               setErrors(newErrors);
//             }
//           }}
//         />
//         {errors.title && <p className="error-text">{errors.title}</p>}

//         <input
//           type="text"
//           placeholder="Author"
//           className={`input-field ${errors.author ? "input-error" : ""}`}
//           value={author}
//           onChange={(e) => {
//             const val = e.target.value;
//             setAuthor(val);
//             // Clear error when typing
//             if (errors.author) {
//               const newErrors = {...errors};
//               delete newErrors.author;
//               setErrors(newErrors);
//             }
//           }}
//         />
//         {errors.author && <p className="error-text">{errors.author}</p>}

//         <input
//           type="text"
//           placeholder="Genre"
//           className={`input-field ${errors.genre ? "input-error" : ""}`}
//           value={genre}
//           onChange={(e) => {
//             const val = e.target.value;
//             setGenre(val);
//             // Clear error when typing
//             if (errors.genre) {
//               const newErrors = {...errors};
//               delete newErrors.genre;
//               setErrors(newErrors);
//             }
//           }}
//         />
//         {errors.genre && <p className="error-text">{errors.genre}</p>}

//         <div className="flex-row">
//           {/* Year Dropdown (Required) */}
//           <select
//             className={`input-field small ${errors.year ? "input-error" : ""}`}
//             value={year}
//             onChange={(e) => setYear(e.target.value)}
//           >
//             <option value="" disabled>
//               Select Year
//             </option>
//             {years.map((yr) => (
//               <option key={yr} value={yr}>
//                 {yr}
//               </option>
//             ))}
//           </select>
//           {errors.year && <p className="error-text">{errors.year}</p>}

//           <input
//             type="number"
//             placeholder="Total Pages"
//             className={`input-field small ${errors.totalPages ? "input-error" : ""}`}
//             value={totalPages}
//             onChange={(e) => {
//               const value = parseInt(e.target.value, 10);
//               if (!isNaN(value) && value > 0) {  // Ensure value is positive
//                 setTotalPages(value);
//               } else if (e.target.value === "") {
//                 setTotalPages("");  // Allow empty string for clearing the field
//               }
              
//               // Clear error when typing
//               if (errors.totalPages) {
//                 const newErrors = {...errors};
//                 delete newErrors.totalPages;
//                 setErrors(newErrors);
//               }
//             }}
//           />
//         </div>
//         {errors.totalPages && <p className="error-text">{errors.totalPages}</p>}

//         {/* Wishlist or Library Toggle */}
//         <div className="toggle-container">
//           <button
//             className={`toggle-button ${isWishlist ? "active" : ""}`}
//             onClick={() => setIsWishlist(true)}
//           >
//             Wishlist
//           </button>
//           <button
//             className={`toggle-button ${!isWishlist ? "active" : ""}`}
//             onClick={() => setIsWishlist(false)}
//           >
//             Library
//           </button>
//         </div>

//         {/* Status (Required if not Wishlist) */}
//         {!isWishlist && (
//           <>
//             <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
//               <option value="">Select Status</option>
//               <option>Reading</option>
//               <option>Completed</option>
//             </select>
//             {errors.status && <p className="error-text">{errors.status}</p>}

//             {/* Show Currently Read input if status is 'Reading' or 'Completed' */}
//             {(status === "Reading") && (
//               <>
//                 <p className="date-heading">Start Date</p>
//                 <input
//                     type="date"
//                     placeholder="Start Date"
//                     className={`input-field ${errors.startDate ? "input-error" : ""}`}
//                     value={startDate}
//                     onChange={(e) => setStartDate(e.target.value)}
//                 />
//                 {errors.startDate && <p className="error-text">{errors.startDate}</p>}
                
//                 <p className="date-heading">Pages Read</p>
//                 <input
//                   type="number"
//                   placeholder="Enter pages read"
//                   className={`input-field ${errors.currentlyRead ? "input-error" : ""}`}
//                   value={currentlyRead}
//                   onChange={(e) => {
//                     const value = parseInt(e.target.value, 10);
//                     if (!isNaN(value) && value > 0 && value <= totalPages) {  // Ensure value is positive
//                       setCurrentlyRead(value);
//                     } else if (e.target.value === "") {
//                       setCurrentlyRead("");  // Allow empty string for clearing the field
//                     }
                    
//                     // Clear error when typing
//                     if (errors.currentlyRead) {
//                       const newErrors = {...errors};
//                       delete newErrors.currentlyRead;
//                       setErrors(newErrors);
//                     }
//                   }}
//                 />
//                 {errors.currentlyRead && <p className="error-text">{errors.currentlyRead}</p>}
//               </>
//             )}

//             {/* End Date Input (Required for Completed) */}
//             {status === "Completed" && (
//               <>
//                 <p className="date-heading">Start Date</p>
//                 <input
//                   type="date"
//                   placeholder="Start Date"
//                   className={`input-field ${errors.startDate ? "input-error" : ""}`}
//                   value={startDate}
//                   onChange={(e) => setStartDate(e.target.value)}
//                 />
//                 {errors.startDate && <p className="error-text">{errors.startDate}</p>}

//                 <p className="date-heading">End Date</p>
//                 <input
//                   type="date"
//                   placeholder="End Date"
//                   className={`input-field ${errors.endDate ? "input-error" : ""}`}
//                   value={endDate}
//                   onChange={(e) => {
//                     setEndDate(e.target.value);
//                     setCurrentlyRead(totalPages); // ✅ Automatically set currentlyRead when End Date is selected
//                   }}
//                 />
//                 {errors.endDate && <p className="error-text">{errors.endDate}</p>}
//               </>
//             )}

//             {/* Star Rating (Optional) */}
//             <div className="rating-container">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <span
//                   key={star}
//                   className={`star ${star <= (hoverRating || rating) ? "filled" : ""}`}
//                   onClick={() => setRating(star)}
//                   onMouseEnter={() => setHoverRating(star)}
//                   onMouseLeave={() => setHoverRating(0)}
//                 >
//                   ★
//                 </span>
//               ))}
//             </div>

//             {/* Notes (Optional) */}
//             <textarea
//               placeholder="Notes"
//               className="input-field textarea"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//             ></textarea>
//           </>
//         )}
        
//         {/* Tags Input (Optional) */}
//         <div className="tag-input-container">
//         <input
//             type="text"
//             placeholder="Add a tag"
//             className={`input-field tag-input ${errors.tagInput ? "input-error" : ""}`}
//             value={tagInput}
//             onChange={(e) => {
//               setTagInput(e.target.value);
//               if (errors.tagInput) {
//                 const newErrors = {...errors};
//                 delete newErrors.tagInput;
//                 setErrors(newErrors);
//               }
//             }}
//             onKeyDown={(e) => {
//               if (e.key === 'Enter') {
//                 e.preventDefault();
//                 handleAddTag();
//               }
//             }}
//           />
//           <button className="add-tag-btn" onClick={handleAddTag}>
//             Add
//           </button>
//         </div>
//         {errors.tagInput && <p className="error-text">{errors.tagInput}</p>}

//         {/* Display Added Tags */}
//         <div className="tags-display">
//           {tags.map((tag, index) => (
//             <span key={index} className="tag">
//               {tag}
//               <button className="remove-tag-btn" onClick={() => removeTag(index)}>✖</button>
//             </span>
//           ))}
//         </div>
//         {errors.tags && <p className="error-text">{errors.tags}</p>}

//         {/* Buttons */}
//         <div className="modal-footer">
//           <button className="cancel-btn" onClick={handleCloseModal}>
//             Cancel
//           </button>
//           <button className="add-btn" onClick={handleAddBook}>
//             Add Book
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddBookModal;











import "../main.css";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import { AiOutlineClose } from "react-icons/ai";
 
const AddBookModal = ({ isOpen, closeModal, readerId }) => {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [totalPages, setTotalPages] = useState("");
  const [currentlyRead, setCurrentlyRead] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [status, setStatus] = useState("");
  const [isWishlist, setIsWishlist] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [coverName, setCoverName] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [coverFile, setCoverFile] = useState(null);
  console.log("Reader ID in AddBookModal:", readerId); // Debugging
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

  // Validation function to check if string contains numbers
  const containsNumbers = (text) => {
    return /\d/.test(text);
  };

  useEffect(() => {
    if (isWishlist) {
      setStatus("To Read");
    } else {
      setStatus(""); // Reset if not Wishlist
    }
  }, [isWishlist]);
  if (!isOpen) return null;
  const handleCloseModal = () => {
    setTitle("");
    setAuthor("");
    setGenre("");
    setTotalPages("");
    setYear(new Date().getFullYear());
    setStatus("");
    setIsWishlist(false);
    setRating(0);
    setHoverRating(0);
    setCoverName("");
    setTags([]);
    setTagInput("");
    setNotes("");
    setErrors({});
    setStartDate(""); // Reset start date
    setEndDate("");
    setCoverFile(null); // Reset cover file
    closeModal();
    setGenre(""); 
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverName(file.name);
    }
  };

  // New function to remove the selected cover
  const handleRemoveCover = () => {
    setCoverFile(null);
    setCoverName("");
    // Clear the file input value
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  
  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  const isValidTag = (tag) => {
    // Only allow letters (including non-English), hyphens, and apostrophes
    return tag.trim() !== "" && /^[a-zA-Z\u00C0-\u017F'-]+$/.test(tag);
  };
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (trimmedTag === "") {
      setErrors({...errors, tagInput: "Tag cannot be empty"});
      return;
    }
  
    // Check if tag contains invalid characters
    if (!isValidTag(trimmedTag)) {
      setErrors({...errors, tagInput: "Tags can only contain letters, hyphens (-), and apostrophes (')"});
      return;
    }
  
    // Check if tag already exists (case insensitive)
    if (tags.some(t => t.toLowerCase() === trimmedTag.toLowerCase())) {
      setErrors({...errors, tagInput: "This tag already exists"});
      return;
    }
  
    // If all validations pass
    setTags([...tags, trimmedTag]);
    setTagInput("");
    
    // Clear any existing errors
    if (errors.tagInput) {
      const newErrors = {...errors};
      delete newErrors.tagInput;
      setErrors(newErrors);
    }
  };

  const handleAddBook = async () => {
    const newErrors = {};
    
    // Validate text fields don't contain numbers
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }
    
    if (!author.trim()) {
      newErrors.author = "Author is required.";
    } else if (containsNumbers(author)) {
      newErrors.author = "Author should not contain numbers.";
    }
    
    // if (!genre.trim()) {
    //   newErrors.genre = "Genre is required.";
    // } else if (containsNumbers(genre)) {
    //   newErrors.genre = "Genre should not contain numbers.";
    // }

    // Only validate genre if it's provided
      if (genre.trim() && containsNumbers(genre)) {
        newErrors.genre = "Genre should not contain numbers.";
      }
    
    // Validate tags don't contain numbers
    const invalidTags = tags.filter(tag => !isValidTag(tag));
  if (invalidTags.length > 0) {
    newErrors.tags = "Tags can only contain letters, hyphens (-), and apostrophes (')";
  }
    
    // Fixed: Check if totalPages is empty instead of using trim()
    if (totalPages === "") {
      newErrors.totalPages = "Total Pages is required.";
    }
    
    if (!year) newErrors.year = "Year of publication is required.";
    if (!isWishlist && !status) newErrors.status = "Status is required.";
  
    // Validate dates based on status
    if (status === "Reading" && (!currentlyRead || currentlyRead < 1)) {
      newErrors.currentlyRead = "Please enter pages read for 'Reading' status.";
    }
    
    if (status === "Completed" && currentlyRead !== totalPages) {
      newErrors.currentlyRead = "For 'Completed' status, pages read must be equal to total pages.";
    }
     
    if (status === "Reading" || status === "Completed") {
      if (!startDate) {
        newErrors.startDate = "Start date is required.";
      } else if (startDate > today) {
        newErrors.startDate = "Start date cannot be in the future.";
      }
    }

    if (status === "Completed") {
      if (!endDate) {
        newErrors.endDate = "End date is required.";
      } else if (endDate > today) {
        newErrors.endDate = "End date cannot be in the future.";
      } else if (startDate && endDate < startDate) {
        newErrors.endDate = "End date cannot be earlier than start date.";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log("Submitting with Reader ID:", readerId); // Debugging

    if (!readerId) {
      alert("Error: Reader ID is missing. Please log in again.");
      return;
    }
    /*Check for duplicate book*/
    try {
      // First check for existing books
      const checkResponse = await axios.get(`http://localhost:8000/book/check`, {
        params: {
          readerId,
          title: title.trim().toLowerCase(),
          author: author.trim().toLowerCase()
        }
      });
  
      if (checkResponse.data.exists) {
        alert("You already have a book with this title and author in your collection.");
        return;
      }
    /**************************************/
    const formData = new FormData();
    formData.append("book_name", title);
    formData.append("author_name", author);
    formData.append("genre", genre);
    formData.append("total_pages", totalPages);
    formData.append("year_of_publication", year);
    formData.append("reading_status", isWishlist ? "To Read" : status);
    formData.append("book_rating", rating);
    formData.append("book_review", notes);
    formData.append("start_date", startDate || ""); // Add start_date
    formData.append("end_date", endDate || ""); // Add end_date
    formData.append("add_date", today);
    formData.append("currently_read", currentlyRead || "0");
    formData.append("tags", tags); // Add tags to form data

    if (coverFile) {
      formData.append("cover_image", coverFile); // Attach file
    }
    // Add readerId to associate the book with a specific reader
    if (readerId) {
      formData.append("readerid", readerId);
    }
  
    
      const response = await axios.post("http://localhost:8000/book/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      console.log("Book Added:", response.data);
      alert("Book added successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error adding book:", error);
      alert("Failed to add book. Please try again.");
    }
  };

  // Generate years from 1900 to the current year
  const years = Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => 1900 + i);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-button" onClick={handleCloseModal}>
          <AiOutlineClose />
        </button>

        <h2 className="modal-title">Add New Book</h2>

        {/* Cover Upload (Optional) */}
        <div className="cover-upload">
          <input type="file" accept="image/*" onChange={handleCoverUpload} />
          {coverName && (
            <div className="cover-selected">
              <p className="cover-name">Uploaded: {coverName}</p>
              <button className="remove-cover-btn" onClick={handleRemoveCover} title="Remove cover image">
                <AiOutlineClose />
              </button>
            </div>
          )}
        </div>

        {/* Form Fields (Required) */}
        <input
          type="text"
          placeholder="Title"
          className={`input-field ${errors.title ? "input-error" : ""}`}
          value={title}
          onChange={(e) => {
            const val = e.target.value;
            setTitle(val);
            // Clear error when typing
            if (errors.title) {
              const newErrors = {...errors};
              delete newErrors.title;
              setErrors(newErrors);
            }
          }}
        />
        {errors.title && <p className="error-text">{errors.title}</p>}

        <input
          type="text"
          placeholder="Author"
          className={`input-field ${errors.author ? "input-error" : ""}`}
          value={author}
          onChange={(e) => {
            const val = e.target.value;
            setAuthor(val);
            // Clear error when typing
            if (errors.author) {
              const newErrors = {...errors};
              delete newErrors.author;
              setErrors(newErrors);
            }
          }}
        />
        {errors.author && <p className="error-text">{errors.author}</p>}

        <input
          type="text"
          placeholder="Genre (optional)"
          className={`input-field ${errors.genre ? "input-error" : ""}`}
          value={genre}
          onChange={(e) => {
            const val = e.target.value;
            setGenre(val);
            // Clear error when typing
            if (errors.genre) {
              const newErrors = {...errors};
              delete newErrors.genre;
              setErrors(newErrors);
            }
          }}
        />
        {errors.genre && <p className="error-text">{errors.genre}</p>}

        <div className="flex-row">
          {/* Year Dropdown (Required) */}
          <select
            className={`input-field small ${errors.year ? "input-error" : ""}`}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="" disabled>
              Select Year
            </option>
            {years.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
          {errors.year && <p className="error-text">{errors.year}</p>}

          <input
            type="number"
            placeholder="Total Pages"
            className={`input-field small ${errors.totalPages ? "input-error" : ""}`}
            value={totalPages}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10);
              if (!isNaN(value) && value > 0) {  // Ensure value is positive
                setTotalPages(value);
              } else if (e.target.value === "") {
                setTotalPages("");  // Allow empty string for clearing the field
              }
              
              // Clear error when typing
              if (errors.totalPages) {
                const newErrors = {...errors};
                delete newErrors.totalPages;
                setErrors(newErrors);
              }
            }}
          />
        </div>
        {errors.totalPages && <p className="error-text">{errors.totalPages}</p>}

        {/* Wishlist or Library Toggle */}
        <div className="toggle-container">
          <button
            className={`toggle-button ${isWishlist ? "active" : ""}`}
            onClick={() => setIsWishlist(true)}
          >
            Wishlist
          </button>
          <button
            className={`toggle-button ${!isWishlist ? "active" : ""}`}
            onClick={() => setIsWishlist(false)}
          >
            Library
          </button>
        </div>

        {/* Status (Required if not Wishlist) */}
        {!isWishlist && (
          <>
            <select className="input-field" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Select Status</option>
              <option>Reading</option>
              <option>Completed</option>
            </select>
            {errors.status && <p className="error-text">{errors.status}</p>}

            {/* Show Currently Read input if status is 'Reading' or 'Completed' */}
            {(status === "Reading") && (
              <>
                <p className="date-heading">Start Date</p>
                <input
                    type="date"
                    placeholder="Start Date"
                    className={`input-field ${errors.startDate ? "input-error" : ""}`}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <p className="error-text">{errors.startDate}</p>}
                
                <p className="date-heading">Pages Read</p>
                <input
                  type="number"
                  placeholder="Enter pages read"
                  className={`input-field ${errors.currentlyRead ? "input-error" : ""}`}
                  value={currentlyRead}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    if (!isNaN(value) && value > 0 && value <= totalPages) {  // Ensure value is positive
                      setCurrentlyRead(value);
                    } else if (e.target.value === "") {
                      setCurrentlyRead("");  // Allow empty string for clearing the field
                    }
                    
                    // Clear error when typing
                    if (errors.currentlyRead) {
                      const newErrors = {...errors};
                      delete newErrors.currentlyRead;
                      setErrors(newErrors);
                    }
                  }}
                />
                {errors.currentlyRead && <p className="error-text">{errors.currentlyRead}</p>}
              </>
            )}

            {/* End Date Input (Required for Completed) */}
            {status === "Completed" && (
              <>
                <p className="date-heading">Start Date</p>
                <input
                  type="date"
                  placeholder="Start Date"
                  className={`input-field ${errors.startDate ? "input-error" : ""}`}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                {errors.startDate && <p className="error-text">{errors.startDate}</p>}

                <p className="date-heading">End Date</p>
                <input
                  type="date"
                  placeholder="End Date"
                  className={`input-field ${errors.endDate ? "input-error" : ""}`}
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentlyRead(totalPages); // ✅ Automatically set currentlyRead when End Date is selected
                  }}
                />
                {errors.endDate && <p className="error-text">{errors.endDate}</p>}
              </>
            )}

            {/* Star Rating (Optional) */}
            <div className="rating-container">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`star ${star <= (hoverRating || rating) ? "filled" : ""}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>

            {/* Notes (Optional) */}
            <textarea
              placeholder="Notes"
              className="input-field textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </>
        )}
        
        {/* Tags Input (Optional) */}
        <div className="tag-input-container">
        <input
            type="text"
            placeholder="Add a tag"
            className={`input-field tag-input ${errors.tagInput ? "input-error" : ""}`}
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              if (errors.tagInput) {
                const newErrors = {...errors};
                delete newErrors.tagInput;
                setErrors(newErrors);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <button className="add-tag-btn" onClick={handleAddTag}>
            Add
          </button>
        </div>
        {errors.tagInput && <p className="error-text">{errors.tagInput}</p>}

        {/* Display Added Tags */}
        <div className="tags-display">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
              <button className="remove-tag-btn" onClick={() => removeTag(index)}>✖</button>
            </span>
          ))}
        </div>
        {errors.tags && <p className="error-text">{errors.tags}</p>}

        {/* Buttons */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={handleCloseModal}>
            Cancel
          </button>
          <button className="add-btn" onClick={handleAddBook}>
            Add Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBookModal;