"use client"

import { useState, useEffect, useCallback } from "react"
import { Routes, Route, useNavigate } from "react-router-dom"
import { IoLibrary } from "react-icons/io5";

import Header from "./components/Header"
import AddBookModal from "./components/AddBookModal"
import Auth from "./components/Auth"
import Sidebar from "./components/TempSidebar"
import PlaceholderPage from "./components/PlaceholderPage"
import AllBooks from "./components/AllBooks"
import BookDetails from "./components/BookDetails"
import Dashboard from "./components/DashBoard"
import Genre from "./components/Genre"
import Trash from "./components/Trash"
import Favorites from "./components/Favorites"
import BookAnimation from "./components/BookAnimation"
import Recommendations from "./components/Recommendations"
import LentOut from "./components/LentOut"
import Borrowed from "./components/Borrowed"
import AccountPage from "./components/AccountPage"
import SessionHandler from "./components/SessionHandler"
import AdminSidebar from "./components/Admin/AdminSidebar"
import AdminHeader from "./components/Admin/AdminHeader"
import AdminWelcomePage from "./components/Admin/AdminWelcomePage"
import UserManagement from "./components/Admin/UserManagement"
import RoleManagement from "./components/Admin/RoleManagement"
import SystemSettings from "./components/Admin/SystemSettings"

const App = () => {
  const [theme, setTheme] = useState("light")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentReaderId, setCurrentReaderId] = useState(null)
  const [userData, setUserData] = useState(null)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showMainContent, setShowMainContent] = useState(false)
  const [mainContentVisible, setMainContentVisible] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const checkAdminStatus = async () => {
      const readerId = sessionStorage.getItem("reader_id");
      if (readerId) {
        try {
          const response = await fetch(`http://localhost:8000/reader/${readerId}`, {
            method: "GET",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            credentials: 'include'
          });

          if (response.ok) {
            const data = await response.json();
            setUserData(data);
            setIsAdmin(data.reader.isAdmin || false);
            setIsAuthenticated(true);
            setShowMainContent(true);
            setMainContentVisible(true);
            
            if (data.reader.isAdmin && !window.location.pathname.startsWith('/admin')) {
              navigate('/admin/dashboard');
            }
          } else {
            handleLogout();
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          handleLogout();
        }
      }
      setIsInitializing(false);
    };

    checkAdminStatus();
  }, [navigate, token]);

  const handleLogin = async (readerId) => {
    try {
      const response = await fetch(`http://localhost:8000/reader/${readerId}`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentReaderId(readerId);
        setUserData(data);
        setIsAdmin(data.reader.isAdmin || false);
        sessionStorage.setItem("reader_id", readerId);
        setShowAnimation(true);
        
        if (data.reader.isAdmin) {
          navigate('/admin/dashboard');
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error during login:", error);
      handleLogout();
    }
  };
  
  const handleAnimationComplete = () => {
    setShowAnimation(false);
    setIsAuthenticated(true);
    setShowMainContent(true);

    setTimeout(() => {
      setMainContentVisible(true);
    }, 100);
  }

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentReaderId(null);
    setUserData(null);
    setShowMainContent(false);
    setMainContentVisible(false);
    setShowAnimation(false);
    sessionStorage.clear();
    navigate("/");
  }

  const fetchUserData = async (readerId) => {
    try {
      const response = await fetch(`http://localhost:8000/reader/${readerId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
         },
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data)
      } else {
        console.error("Failed to fetch user data")
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:8000/reader/check-session', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isAuthenticated && data.readerId) {
          return data.readerId;
        }
      }
      return null;
    } catch (error) {
      console.error('Session check failed:', error);
      return null;
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      const storedTheme = localStorage.getItem("theme") || "light"
      setTheme(storedTheme)
      document.documentElement.classList.toggle("dark", storedTheme === "dark")

      const readerId = await checkSession()
      const storedReaderId = sessionStorage.getItem("reader_id")

      if (readerId) {
        setCurrentReaderId(readerId)
        await fetchUserData(readerId)
        setIsAuthenticated(true)
        setShowMainContent(true)
      } else if (storedReaderId) {
        setCurrentReaderId(storedReaderId)
        await fetchUserData(storedReaderId)
        setIsAuthenticated(true)
        setShowMainContent(true)
      } else {
        handleLogout()
      }

      setIsInitializing(false)
    }

    initializeApp()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <div className={theme === "dark" ? "bg-gray-900 text-white min-h-screen" : "bg-white text-black min-h-screen"}>
        {showAnimation && <BookAnimation onAnimationComplete={handleAnimationComplete} />}
        <SessionHandler userData={userData} onLogout={handleLogout} />
        {!isInitializing && !isAuthenticated && !showAnimation ? (
          <div className="app">
            <SiteHeader toggleTheme={toggleTheme} theme={theme} />
            <main className="main flex flex-col justify-center p-4">
              <div className="w-full flex flex-col">
                <div className="w-full max-w-md text-left mb-8">
                  <h1 className="Welcome-h1">Welcome</h1>
                  <p className="AccountSignIn">Sign in to your account to continue</p>
                </div>
                <div className="w-full max-w-md">
                  <Auth setIsAuthenticated={setIsAuthenticated} onLogin={handleLogin} />
                </div>
              </div>
            </main>
          </div>
        ) : (
          showMainContent && !showAnimation && (
            <div className={`app-container flex transition-opacity duration-1000 ease-in-out ${mainContentVisible ? "opacity-100" : "opacity-0"}`}>
              {isAdmin ? (
                <AdminSidebar userData={userData} onLogout={handleLogout} />
              ) : (
                <Sidebar userData={userData} onLogout={handleLogout} />
              )}
              <div className="content flex-grow">
                {isAdmin ? (
                  <AdminHeader
                    toggleTheme={toggleTheme}
                    isDarkMode={theme === "dark"}
                  />
                ) : (
                  <Header
                    toggleTheme={toggleTheme}
                    theme={theme}
                    openModal={openModal}
                    userData={userData}
                    onLogout={handleLogout}
                  />
                )}
                <AddBookModal isOpen={isModalOpen} closeModal={closeModal} readerId={currentReaderId} />
                <Routes>
                  {isAdmin ? (
                    <>
                      <Route path="/admin/dashboard" element={<AdminWelcomePage />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/roles" element={<RoleManagement />} />
                      <Route path="/admin/settings" element={<SystemSettings />} />
                    </>
                  ) : (
                    <>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/all-books" element={<AllBooks />} />
                      <Route path="/recommendations" element={<Recommendations />} />
                      <Route path="/book/:id" element={<BookDetails />} />
                      <Route path="/currently-reading" element={<AllBooks statusFilter="Reading" />} />
                      <Route path="/completed" element={<AllBooks statusFilter="Completed" />} />
                      <Route path="/wishlist" element={<AllBooks statusFilter="To Read" />} />
                      <Route path="/lent-out" element={<LentOut />} />
                      <Route path="/borrowed" element={<Borrowed />} />
                      <Route path="/genre" element={<Genre />} />
                      <Route path="/trash" element={<Trash />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/account" element={<AccountPage userData={userData} onLogout={handleLogout} />} />
                    </>
                  )}
                  <Route path="/login" element={<Auth />} />
                </Routes>
              </div>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}

const SiteHeader = ({ toggleTheme, theme }) => (
  <header className="gheader">
    <div className="container">
      <a href="/" className="logo">

       <IoLibrary style={{ marginBottom: '-2px'}}/> BookHaven
      </a>
      <div className="theme-toggle-container">
        <button onClick={toggleTheme} className="theme-toggle">
          {theme === "light" ? "🌙" : "☀"}
        </button>
      </div>
    </div>
  </header>
)

export default App