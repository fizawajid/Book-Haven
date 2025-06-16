import "../global.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Auth = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    if (/\s/.test(pass)) return false; // No spaces allowed
    if (pass.length < 6) return false;
    // Must contain at least one lowercase, one uppercase, one number and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const form = new FormData(e.target);
    const email = form.get("email").trim();
    const password = form.get("password").trim();
  
    // Validate email format
    const emailRegex = /^[A-Za-z]+[A-Za-z0-9]*@[A-Za-z]+\.[A-Za-z]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }
  
    // Enhanced password validation
    if (!validatePassword(password)) {
      alert("Password must be at least 6 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character. Spaces are not allowed.");
      setIsLoading(false);
      return;
    }
  
    // Additional fields for registration
    let userData = { email, password };
    if (activeTab === "register") {
      const first_name = form.get("firstName").trim();
      const last_name = form.get("lastName").trim();
      const date_of_birth = form.get("dateOfBirth");
  
      const nameRegex = /^[A-Za-z\s]+$/; // allows only alphabets and spaces

      if (!first_name || !last_name) {
        alert("First and last names are required.");
        setIsLoading(false);
        return;
      }
      
      if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
        alert("Names must only contain letters and spaces. Numbers are not allowed.");
        setIsLoading(false);
        return;
      }
  
      const birthDate = new Date(date_of_birth);
      if (isNaN(birthDate) || birthDate >= new Date()) {
        alert("Please enter a valid date of birth in the past.");
        setIsLoading(false);
        return;
      }
  
      userData = { email, password, first_name, last_name, date_of_birth };
    }
  
    // Fetch API call
    const endpoint = activeTab === "login" ? "/reader/login" : "/reader/register";
  
    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (activeTab === "login") {
          // Only set session data on successful login
          sessionStorage.setItem("reader_id", data.reader_id);
          sessionStorage.setItem("token", data.token);
          
          // Update last_login date
          await fetch(`http://localhost:8000/reader/update-last-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ reader_id: data.reader_id })
          });
          
          // Call the onLogin callback to update the app state
          if (onLogin) onLogin(data.reader_id);
          
          // Redirect based on admin status
          if (data.isAdmin) {
            navigate("/admin/AdminWelcomePage");
          } else {
            navigate("/dashboard");
          }
        } else {
          alert(data.message);
        }
      } else {
        // Handle system downtime message
        if (data.isDowntime) {
          alert(data.message);
        } else {
          alert(data.message);
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      alert("Server error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="auth-form">
      <div className="tabs">
        <button
          className={`tab ${activeTab === "login" ? "active" : ""}`}
          onClick={() => setActiveTab("login")}
        >
          Login
        </button>
        <button
          className={`tab ${activeTab === "register" ? "active" : ""}`}
          onClick={() => setActiveTab("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {activeTab === "login" ? (
          <>
            <div className="form-group-auth">
              <label>Email</label>
              <input type="email" name="email" className="input" required />
            </div>
            <div className="form-group-auth">
              <label>Password</label>
              <input type="password" name="password" className="input" required />
            </div>
          </>
        ) : (
          <>
            <div className="form-group-auth">
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="John" className="input" required />
            </div>
            <div className="form-group-auth">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Doe" className="input" required />
            </div>
            <div className="form-group-auth">
              <label>Email</label>
              <input type="email" name="email" placeholder="name@example.com" className="input" required />
            </div>
            <div className="form-group-auth">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                className="input" 
                required 
                placeholder="Min 6 chars, with uppercase, lowercase, number & special char"
              />
            </div>
            <div className="form-group-auth">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" className="input" required />
            </div>
          </>
        )}

        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? "Loading..." : activeTab === "login" ? "Sign In →" : "Sign Up →"}
        </button>
      </form>
    </div>
  );
};

export default Auth;