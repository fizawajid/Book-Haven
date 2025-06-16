import { useState, useEffect } from "react";
import "../ReadingTimerDialog.css";
import { FaPlaneDeparture } from "react-icons/fa";

const ReadingTimerDialog = ({ onClose, curr_book }) => {

    const [duration, setDuration] = useState(0);
    const [pagesRead, setPagesRead] = useState("");
    const [timeLeft, setTimeLeft] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSaving, setIsSaving] = useState(false);  // Loading state for save button
    const [startTime, setStartTime] = useState(null);
    const [hasTimeEnded, setHasTimeEnded] = useState(false);
    const [accumulatedTime, setAccumulatedTime] = useState(0);

    const readerId = sessionStorage.getItem("reader_id");
    const bookId = curr_book.bookid;
    useEffect(() => {
        let timer;
    
        if (isRunning && timeLeft !== null && timeLeft > 0) {
            timer = setTimeout(() => {
                setTimeLeft(prev => prev - 1);
                setAccumulatedTime(prev => prev + 1); // Add 1 second only if timer is running
            }, 1000);
        } else if (timeLeft === 0 && !hasTimeEnded) {
            setHasTimeEnded(true);
            const audio = new Audio("/sounds/levelup.mp3");
            audio.play().catch((e) => console.error("Audio playback failed:", e));
    
            setIsRunning(false);
    
            setTimeout(() => {
                alert("Time is up! 🎉");
            }, 500);
        }
    
        return () => clearTimeout(timer);
    }, [isRunning, timeLeft, hasTimeEnded]);
       

    // Prevent scrolling when dialog is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const startTimer = () => {
        if (timeLeft === null && duration > 0) {
            setAccumulatedTime(0);
            setTimeLeft(duration * 60);
            setStartTime(Date.now());
            setHasTimeEnded(false); // Reset alert trigger
        }
        setIsRunning(true);
    };    

    const stopTimer = () => {
        setIsRunning(false);
    };

    const saveReadingProgress = async () => {
        if (!bookId) {
            alert("Error: Book ID is missing.");
            return;
        }
    
        if (!pagesRead || Number(pagesRead) <= 0) {
            alert("Please enter a valid number of pages.");
            return;
        }
    
        const plannedDuration = Number(duration) * 60; // in seconds
       
        const actualTime = accumulatedTime;

        setIsSaving(true);
    
        try {
            // Update book pages (already existing)
            await fetch(`http://localhost:8000/book/${bookId}/update-pages`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pagesRead: Number(pagesRead) }),
            });
    
            // Save timer session
            const timerResponse = await fetch("http://localhost:8000/timer/log", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reader_id: readerId,
                    bookId,
                    duration: plannedDuration,
                    real_time: actualTime,
                    pages_read: Number(pagesRead)
                })
            });
    
            const timerData = await timerResponse.json();
    
            if (timerResponse.ok) {
                alert("Reading session saved successfully!");
            } else {
                alert(`Timer save failed: ${timerData.message}`);
            }
        } catch (error) {
            console.error("Error saving session:", error);
            alert("Failed to save reading session. Please try again.");
        }
    
        setIsSaving(false);
        onClose();
    };
    

    return (
        <>
            {/* Overlay background */}
            <div className="dialog-overlay" onClick={onClose}></div>
            
            {/* Dialog box */}
            <div className="dialog-box">
                <button className="close-btn" onClick={onClose}>✖</button>

                <h2>Log Reading Session</h2>
                <p>Track your reading time and progress</p>

                <div className="timer-section">
                    <strong>Reading Timer:</strong> <span id="timer">
                        {timeLeft !== null ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : "00:00"}
                    </span>
                    <div className="timer-buttons">
                        <button className="start-timer" onClick={startTimer} disabled={isRunning}>Start Timer</button>
                        <button className="stop-timer" onClick={stopTimer} disabled={!isRunning}>Stop Timer</button>
                    </div>
                </div>

                <div className="input-section">
                    <label htmlFor="duration">Duration (min):</label>
                    {/* <input 
                        type="number" 
                        id="duration" 
                        name="duration"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        disabled={isRunning}
                    /> */}
                    <input 
                        type="number" 
                        id="duration" 
                        name="duration"
                        value={duration}
                        onChange={(e) => {
                            const newDuration = Number(e.target.value);
                            if (newDuration >= 0) {
                                setDuration(newDuration);
                            } else {
                                alert("Duration must be greater than or equal 0.");
                            }
                        }}
                        disabled={isRunning}
                    />

                    <label htmlFor="pages-read">Pages Read:</label>
                    <input 
                        type="number" 
                        id="pages-read" 
                        name="pages-read"
                        value={pagesRead}

                        onChange={(e) => {
                            const newPages = Number(e.target.value);
                            if (newPages < 0) {
                                alert("Pages read cannot be negative.");
                                return;
                            }
                            if (newPages + curr_book.currently_read <= curr_book.total_pages) {
                                setPagesRead(newPages);
                            } else {
                                alert("Total pages read cannot exceed total pages of the book.");
                            }
                        }}
                    />
                </div>

                <button 
                    className="save-session" 
                    onClick={saveReadingProgress} 
                    disabled={isSaving}
                >
                    {isSaving ? "Saving..." : "Save Session"}
                </button>
            </div>
        </>
    );
};

export default ReadingTimerDialog;