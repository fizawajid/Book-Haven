"use client"
import { useState, useEffect } from "react"

const BookAnimation = ({ onAnimationComplete }) => {
  const [animationState, setAnimationState] = useState("closed")
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Start the animation sequence with extended timing
    const openBook = setTimeout(() => {
      setAnimationState("opening")
    }, 500)

    const midAnimation = setTimeout(() => {
      setAnimationState("opened")
    }, 2000)

    // Animation stays on screen for 5 seconds total before starting fade out
    const startFadeOut = setTimeout(() => {
      setFadeOut(true)
    }, 4500)

    // Complete animation after fade out finishes
    const completeAnimation = setTimeout(() => {
      setAnimationState("complete")
      onAnimationComplete()
    }, 5500)

    return () => {
      clearTimeout(openBook)
      clearTimeout(midAnimation)
      clearTimeout(startFadeOut)
      clearTimeout(completeAnimation)
    }
  }, [onAnimationComplete])

  return (
    <div className={`book-animation-container ${fadeOut ? 'fade-out' : ''}`}>
      <div className={`book ${animationState}`}>
        <div className="book-cover left-cover"></div>
        <div className="book-page">
          {/* Quill and handwriting content */}
          {(animationState === "opening" || animationState === "opened") && (
            <div className="book-content">
              <img src="/quillhand.jpeg" alt="Quill pen with handwritten text" className="quill-image" />
            </div>
          )}
        </div>
        <div className="book-cover right-cover"></div>
      </div>
      <div className="animation-text">{animationState === "opened" && <span>Welcome to BookHaven</span>}</div>

      <style jsx>{`
        .book-animation-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #f5f5f5;
          z-index: 100;
          opacity: 1;
          transition: opacity 1s ease-in-out;
        }
        
        .book-animation-container.fade-out {
          opacity: 0;
        }
        
        .book {
          position: relative;
          width: 200px;
          height: 280px;
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .book-cover, .book-page {
          position: absolute;
          width: 100%;
          height: 100%;
          transform-origin: left center;
          transition: transform 1.4s ease-in-out;
          border-radius: 2px;
        }
        
        .left-cover {
          background: #000000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        
        .left-cover::after {
          content: "BOOKHAVEN";
          position: absolute;
          font-family: 'serif';
        }
        
        .book-page {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          z-index: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          padding: 0;
        }
        
        .book-content {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          opacity: 0;
          animation: fadeIn 0.8s ease-in-out forwards;
          animation-delay: 0.5s;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .quill-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .right-cover {
          background: #1a1a1a;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          z-index: 0;
        }
        
        .book.closed .left-cover {
          transform: rotateY(0deg);
        }
        
        .book.opening .left-cover {
          transform: rotateY(-120deg);
        }
        
        .book.opened .left-cover {
          transform: rotateY(-180deg);
        }
        
        .animation-text {
          margin-top: 40px;
          font-size: 24px;
          font-weight: bold;
          color: #000000;
          opacity: 0;
          transition: opacity 0.8s ease-in-out;
        }
        
        .book.opened + .animation-text {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default BookAnimation