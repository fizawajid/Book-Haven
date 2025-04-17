// import "../global.css";

// import React, { useState } from "react";

// const Auth = ({ setIsAuthenticated, onLogin }) => {
//   const [activeTab, setActiveTab] = useState("login");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);

//     const form = new FormData(e.target);
//     const email = form.get("email");
//     const password = form.get("password");

//     // Determine API endpoint based on login or register
//     const endpoint = activeTab === "login" ? "/reader/login" : "/reader/register";

//     // Prepare user data
//     const userData = { email, password };

//     if (activeTab === "register") {
//       userData.first_name = form.get("firstName");
//       userData.last_name = form.get("lastName");
//       userData.date_of_birth = form.get("dateOfBirth");
//     }

//     try {
//       const response = await fetch(`http://localhost:8000${endpoint}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(userData),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert(data.message);
//         if (activeTab === "login") {
//           sessionStorage.setItem("reader_id", data.reader_id); // Store reader_id
//           setIsAuthenticated(true);
//           if (onLogin) onLogin(data.reader_id); // Call onLogin function
//         }
//       } else {
//         alert(data.message);
//       }
//     } catch (error) {
//       console.error("Authentication error:", error);
//       alert("Server error. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="auth-form">
//       <div className="tabs">
//         <button
//           className={`tab ${activeTab === "login" ? "active" : ""}`}
//           onClick={() => setActiveTab("login")}
//         >
//           Login
//         </button>
//         <button
//           className={`tab ${activeTab === "register" ? "active" : ""}`}
//           onClick={() => setActiveTab("register")}
//         >
//           Register
//         </button>
//       </div>

//       <form onSubmit={handleSubmit} className="form">
//         {activeTab === "login" ? (
//           <>
//             <div className="form-group">
//               <label>Email</label>
//               <input type="email" name="email" className="input" required />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input type="password" name="password" className="input" required />
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="form-group">
//               <label>First Name</label>
//               <input type="text" name="firstName" placeholder="John" className="input" required />
//             </div>
//             <div className="form-group">
//               <label>Last Name</label>
//               <input type="text" name="lastName" placeholder="Doe" className="input" required />
//             </div>
//             <div className="form-group">
//               <label>Email</label>
//               <input type="email" name="email" placeholder="name@example.com" className="input" required />
//             </div>
//             <div className="form-group">
//               <label>Password</label>
//               <input type="password" name="password" className="input" required />
//             </div>
//             <div className="form-group">
//               <label>Date of Birth</label>
//               <input type="date" name="dateOfBirth" className="input" required />
//             </div>
//           </>
//         )}

//         <button type="submit" className="button" disabled={isLoading}>
//           {isLoading ? "Loading..." : activeTab === "login" ? "Sign In →" : "Sign Up →"}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Auth;



import "../global.css";
import { useNavigate } from "react-router-dom";

import React, { useState } from "react";

const Auth = ({ setIsAuthenticated, onLogin }) => {
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    // Determine API endpoint based on login or register
    const endpoint = activeTab === "login" ? "/reader/login" : "/reader/register";

    // Prepare user data
    const userData = { email, password };

    if (activeTab === "register") {
      userData.first_name = form.get("firstName");
      userData.last_name = form.get("lastName");
      userData.date_of_birth = form.get("dateOfBirth");
    }

    try {
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        if (activeTab === "login") {
          sessionStorage.setItem("reader_id", data.reader_id); // Store reader_id
          if (onLogin) onLogin(data.reader_id); // Call onLogin function which will trigger animation
          navigate("/");
        } else {
          alert(data.message); // Show message for registration
        }
      } else {
        alert(data.message);
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
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" className="input" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" className="input" required />
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>First Name</label>
              <input type="text" name="firstName" placeholder="John" className="input" required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" name="lastName" placeholder="Doe" className="input" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="name@example.com" className="input" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" className="input" required />
            </div>
            <div className="form-group">
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