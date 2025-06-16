"use client"

import { useState } from "react"
import axios from "axios"
import "../BookDetails.css"

const LendingDialog = ({ onClose, bookId, onLendingComplete, mode = "lend" }) => {
  const [personName, setPersonName] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLendMode = mode === "lend"
  const titleld = isLendMode ? "Lend Book" : "Borrow Book"
  const label = isLendMode ? "Lend to:" : "Borrowed from:"
  const buttonText = isLendMode ? "Lend Book" : "Record Borrowed Book"
  const submittingText = isLendMode ? "Lending..." : "Recording..."
  const status = isLendMode ? "lent" : "borrowed"

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate name: must start with a letter, and only contain letters, numbers, spaces
    const trimmedName = personName.trim()
    const nameRegex = /^[A-Za-z][A-Za-z0-9\s]*$/
    if (!nameRegex.test(trimmedName)) {
      alert("Please enter a valid name. It should start with a letter and cannot be only numbers.")
      return
    }

    // Convert the selected date to a date object without time
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)
    
    // Get today's date without time
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Allow today's date, but not future dates
    if (selectedDate > today) {
      alert("You cannot select a future date.")
      return
    }

    setIsSubmitting(true)
    try {
      await axios.post("http://localhost:8000/lending", {
        bookId,
        personName: personName.trim(),
        status,
        date,
      })

      onLendingComplete()
      onClose()
    } catch (error) {
      console.error(`Error ${status} book:`, error)
      alert(`Failed to ${status} book. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dialog-overlay">
      <div className="dialog-container book-action-dialog">
        <h2>{titleld}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="personName">{label}</label>
            <input
              type="text"
              id="personName"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder={`Enter person's name`}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">{isLendMode ? "Lending" : "Borrowing"} Date:</label>
            <input 
              type="date" 
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              max={new Date().toISOString().split("T")[0]} // Prevent future dates in the date picker
              required 
            />
          </div>
          <div className="dialog-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className="action-button"
              disabled={isSubmitting || !personName.trim()}
            >
              {isSubmitting ? submittingText : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LendingDialog