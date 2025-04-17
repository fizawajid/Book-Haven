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
    if (!personName.trim()) return

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
      <div className={`dialog-content ${isLendMode ? "lending-dialog" : "borrowing-dialog"}`}>
        {/* <h2>{titleld}</h2> */}
        <h2 className="always-white">{titleld}</h2>

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
            <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="dialog-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button
              type="submit"
              className={isLendMode ? "lend-button" : "borrow-button"}
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
