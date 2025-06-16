"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "../BookDetails.css"

const LendingInfo = ({ bookId, onStatusCleared, mode = "lend" }) => {
  const [lendingData, setLendingData] = useState(null)
  const [isClearing, setIsClearing] = useState(false)

  const isLendMode = mode === "lend"
  const status = isLendMode ? "lent" : "borrowed"
  const title = isLendMode ? "Book Currently Lent" : "Book Currently Borrowed"
  const label = isLendMode ? "Lent to:" : "Borrowed from:"
  const buttonText = isLendMode ? "Clear Lending Status" : "Clear Borrowing Status"

  useEffect(() => {
    const fetchLendingInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/lending/${bookId}?status=${status}`)
        if (response.data && response.data.status === status) {
          setLendingData(response.data)
        } else {
          setLendingData(null)
        }
      } catch (error) {
        console.error(`Error fetching ${status} info:`, error)
        setLendingData(null)
      }
    }

    fetchLendingInfo()
  }, [bookId, status])

  const handleClearStatus = async () => {
    if (
      !window.confirm(
        `Are you sure you want to clear the ${status} status? This will remove the record from the database.`,
      )
    ) {
      return
    }

    setIsClearing(true)
    try {
      await axios.delete(`http://localhost:8000/lending/${bookId}?status=${status}`)
      setLendingData(null)
      onStatusCleared()
    } catch (error) {
      console.error(`Error clearing ${status} status:`, error)
      alert(`Failed to clear ${status} status. Please try again.`)
    } finally {
      setIsClearing(false)
    }
  }

  if (!lendingData) return null

  return (
    <div className={isLendMode ? "lending-info" : "borrowing-info"}>
      <h3>{title}</h3>
      <p>
        <strong>{label}</strong> {lendingData.personName}
      </p>
      <p>
        <strong>Date:</strong> {new Date(lendingData.date).toLocaleDateString()}
      </p>
      <button
        onClick={handleClearStatus}
        className={isLendMode ? "clear-lending-button" : "clear-borrowing-button"}
        disabled={isClearing}
      >
        {isClearing ? "Clearing..." : buttonText}
      </button>
    </div>
  )
}

export default LendingInfo