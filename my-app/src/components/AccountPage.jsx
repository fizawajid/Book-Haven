import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../AccountPage.css";

const AccountPage = ({ userData, onLogout }) => {
  const reader = userData?.reader;
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(reader?.profilePicUrl || null);
  const [uploading, setUploading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef();
  
  const [firstName, setFirstName] = useState(reader?.first_name || "");
  const [lastName, setLastName] = useState(reader?.last_name || "");
  const [email, setEmail] = useState(reader?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");

  const [errors, setErrors] = useState({});
  
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (reader?.profilePicUrl) setPreviewUrl(reader.profilePicUrl);
    setFirstName(reader?.first_name || "");
    setLastName(reader?.last_name || "");
    setEmail(reader?.email || "");
  }, [reader]);
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Validation functions
  const validateName = (name) => {
    return /^[A-Za-z\s]+$/.test(name);
  };

  const validateEmail = (email) => {
    return /^[A-Za-z]+[A-Za-z0-9]*@[A-Za-z]+\.[A-Za-z]+$/.test(email);
  };

  const validatePassword = (pass) => {
    if (/\s/.test(pass)) return false; // No spaces allowed
    if (pass.length < 6) return false;
    // Must contain at least one lowercase, one uppercase, one number and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(pass);
  };
  
  const validateFields = () => {
    const newErrors = {};
    
    // First name validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!validateName(firstName)) {
      newErrors.firstName = "First name can only contain letters and spaces.";
    }
    
    // Last name validation
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (!validateName(lastName)) {
      newErrors.lastName = "Last name can only contain letters and spaces.";
    }
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
  
    // Password validation
    if (changePasswordMode) {
      if (!currentPassword && (password || confirmPassword)) {
        newErrors.currentPassword = "Current password is required.";
      }
      
      if (currentPassword && (!password || !confirmPassword)) {
        newErrors.password = "New password and confirmation are required.";
      } else if (password || confirmPassword) {
        if (password !== confirmPassword) {
          newErrors.password = "Passwords do not match.";
        } else if (!validatePassword(password)) {
          newErrors.password = "Password must be at least 6 characters long and contain uppercase, lowercase, number, and special character.";
        }
      }
    }    
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSave = async () => {
    if (!reader?.reader_id) return;
    if (!validateFields()) return;
  
    try {
      setUploading(true);
      let updateSuccessful = true;
      let passwordUpdateSuccessful = true;
  
      // Upload new profile image if available
      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("readerId", reader.reader_id);
  
        const imgRes = await axios.post(
          "http://localhost:8000/profile-pic/upload-profile",
          formData
        );
        setPreviewUrl(imgRes.data.profilePicUrl);
      }
  
      // Save updated reader info
      await axios.post("http://localhost:8000/profile-pic/update-reader-info", {
        readerId: reader.reader_id,
        first_name: firstName,
        last_name: lastName,
        email: email,
      });
  
      // If password is set, send update request for password
      if (changePasswordMode && password) {
        try {
          const passwordResponse = await axios.post("http://localhost:8000/profile-pic/update-password", {
            currentPassword,
            newPassword: password,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
          
          if (passwordResponse.data.error) {
            setErrors(prev => ({ ...prev, currentPassword: passwordResponse.data.error }));
            passwordUpdateSuccessful = false;
            updateSuccessful = false;
          }
        } catch (error) {
          if (error.response && error.response.data.error === "Current password is incorrect.") {
            setErrors(prev => ({ ...prev, currentPassword: "Current password is incorrect." }));
            passwordUpdateSuccessful = false;
            updateSuccessful = false;
          } else {
            throw error;
          }
        }
      }
  
      if (updateSuccessful) {
        alert("Profile updated successfully!");
        window.location.reload();
      } else if (!passwordUpdateSuccessful) {
        // Don't show alert here - error is already displayed in form
      } else {
        alert("Update failed. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Update failed. Please try again.");
    } finally {
      setUploading(false);
      setShowOptions(false);
    }
  };
  
  const handleRemove = async () => {
    if (!reader?.reader_id) return;
  
    try {
      await axios.post("http://localhost:8000/profile-pic/remove-profile", {
        readerId: reader.reader_id,
      });
  
      setPreviewUrl(null);
      alert("Profile picture removed!");
    } catch (error) {
      console.error(error);
      alert("Remove failed");
    } finally {
      setShowOptions(false);
    }
  };

  const deleteAccount = async () => {
    if (!reader?.reader_id) return;

    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account?");
    if (!confirmDelete) return;

    try {
      await axios.post("http://localhost:8000/profile-pic/delete-account", {
        reader_id: reader.reader_id,
      });

      alert("Your account has been deleted.");
      onLogout();       // this clears session and user state
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Something went wrong while deleting your account.");
    }
  };  
  
  return (
    <div className="account-container">
      <h2 className="account-title">Edit Account Details</h2>
  
      <div className="profile-pic-wrapper-user">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="profile-image-user" />
        ) : (
          <FaUserCircle className="default-user-icon" />
        )}
  
        <div className="edit-icon-wrapper" onClick={() => setShowOptions(!showOptions)}>
          <MdEdit className="edit-icon" />
        </div>
  
        {showOptions && (
          <div className="edit-options-dropdown">
            <div 
              onClick={() => {
                fileInputRef.current.click();
                setShowOptions(false);
              }} 
              className="dropdown-option"
            >
              Edit Photo
            </div>
            <div 
              onClick={() => {
                handleRemove();
                setShowOptions(false);
              }} 
              className="dropdown-option remove"
            >
              Remove Photo
            </div>
          </div>
        )}
  
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden-input"
        />
      </div>
  
      <div className="input-group">
        <label>First Name</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        {errors.firstName && <p className="error-text">{errors.firstName}</p>}
      </div>
  
      <div className="input-group">
        <label>Last Name</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        {errors.lastName && <p className="error-text">{errors.lastName}</p>}
      </div>
  
      <div className="input-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error-text">{errors.email}</p>}
      </div>
  
      <div className="account-links">
        {!changePasswordMode ? (
          <p 
            className="change-password-link" 
            onClick={() => {
              setChangePasswordMode(true);
              setErrors({});
            }}
          >
            Change Password?
          </p>
        ) : (
        <>
          <div className="input-group">
            <label>Current Password</label>
            <div className="password-input-container">
              <input
                type={currentPasswordVisible ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
              >
                {currentPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.currentPassword && <p className="error-text">{errors.currentPassword}</p>}
          </div>

          <div className="input-group">
            <label>New Password</label>
            <div className="password-input-container">
              <input
                type={newPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setNewPasswordVisible(!newPasswordVisible)}
              >
                {newPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <div className="password-input-container">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              >
                {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>
          <p 
            className="change-password-link" 
            onClick={() => {
              setChangePasswordMode(false);
              setPassword("");
              setConfirmPassword("");
              setCurrentPassword("");
              setErrors({});
            }}
            style={{ marginTop: '10px' }}
          >
            Cancel Password Change
          </p>
        </>
      )}

        <p onClick={deleteAccount} className="delete-acc-link">Delete Account?</p>
      </div>

      <div className="upload-btn-container">
        <button onClick={handleSave} disabled={uploading} className="upload-btn">
          {uploading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AccountPage;
