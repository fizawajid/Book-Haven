import React, { useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./AdminAccountMenu.css";

const AdminAccountMenu = ({ userData, onLogout }) => {
  const reader = userData?.reader;
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(reader?.profilePicUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const [firstName, setFirstName] = useState(reader?.first_name || "");
  const [lastName, setLastName] = useState(reader?.last_name || "");
  const [email, setEmail] = useState(reader?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const token = sessionStorage.getItem("token");

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "" }), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      if (!file.type.startsWith('image/')) {
        showNotification("Please upload an image file", "error");
        return;
      }
      setImage(file);
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
    if (/\s/.test(pass)) return false;
    if (pass.length < 6) return false;
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(pass);
  };

  const validateFields = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!validateName(firstName)) {
      newErrors.firstName = "First name can only contain letters and spaces.";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (!validateName(lastName)) {
      newErrors.lastName = "Last name can only contain letters and spaces.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (showPasswordModal) {
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

      if (image) {
        const formData = new FormData();
        formData.append("image", image);
        formData.append("readerId", reader.reader_id);

        const imgRes = await fetch("http://localhost:8000/profile-pic/upload-profile", {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!imgRes.ok) {
          const error = await imgRes.json();
          throw new Error(error.error || "Failed to upload image");
        }

        const data = await imgRes.json();
        setPreviewUrl(data.profilePicUrl);
      }

      const infoRes = await fetch("http://localhost:8000/profile-pic/update-reader-info", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          readerId: reader.reader_id,
          first_name: firstName,
          last_name: lastName,
          email: email,
        })
      });

      if (!infoRes.ok) {
        const error = await infoRes.json();
        throw new Error(error.error || "Failed to update user info");
      }

      if (showPasswordModal && password) {
        try {
          const passwordResponse = await fetch("http://localhost:8000/profile-pic/update-password", {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              currentPassword,
              newPassword: password,
            })
          });
          
          if (!passwordResponse.ok) {
            const error = await passwordResponse.json();
            throw new Error(error.error || "Failed to update password");
          }
        } catch (error) {
          setErrors(prev => ({ ...prev, currentPassword: error.message }));
          passwordUpdateSuccessful = false;
          updateSuccessful = false;
        }
      }

      if (updateSuccessful) {
        showNotification("Profile updated successfully!");
        window.location.reload();
      } else if (!passwordUpdateSuccessful) {
        showNotification("Profile updated but password change failed", "error");
      } else {
        showNotification("Update failed. Please try again.", "error");
      }
    } catch (error) {
      console.error(error);
      showNotification(error.message || "Update failed. Please try again.", "error");
    } finally {
      setUploading(false);
      setShowMenu(false);
      setShowPasswordModal(false);
    }
  };

  const handleRemove = async () => {
    if (!reader?.reader_id) return;

    try {
      const response = await fetch("http://localhost:8000/profile-pic/remove-profile", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          readerId: reader.reader_id,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove profile picture");
      }

      setPreviewUrl(null);
      showNotification("Profile picture removed successfully!");
    } catch (error) {
      console.error(error);
      showNotification(error.message || "Failed to remove profile picture", "error");
    } finally {
      setShowMenu(false);
    }
  };

  const deleteAccount = async () => {
    if (!reader?.reader_id) return;

    const confirmDelete = window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const response = await fetch("http://localhost:8000/profile-pic/delete-account", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reader_id: reader.reader_id,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      showNotification("Your account has been deleted successfully.");
      onLogout();
    } catch (error) {
      console.error("Error deleting account:", error);
      showNotification(error.message || "Failed to delete account", "error");
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setShowMenu(!showMenu);
  };

  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    fileInputRef.current.click();
  };

  return (
    <div className="admin-account-menu">
      <div className="account-trigger" onClick={handleMenuClick}>
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="profile-image" />
        ) : (
          <FaUserCircle className="default-user-icon" />
        )}
      </div>

      {showMenu && (
        <div className="account-dropdown" onClick={(e) => e.stopPropagation()}>
          <div className="dropdown-header">
            <div className="profile-pic-wrapper">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="profile-image" />
              ) : (
                <FaUserCircle className="default-user-icon" />
              )}
              <div className="edit-icon-wrapper" onClick={handleImageClick}>
                <MdEdit className="edit-icon" />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-input"
              />
            </div>
            <div className="user-info">
              <h3>{`${firstName} ${lastName}`}</h3>
              <p>{email}</p>
            </div>
          </div>

          <div className="dropdown-content">
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

            {!showPasswordModal ? (
              <button 
                className="change-password-btn"
                onClick={() => setShowPasswordModal(true)}
              >
                Change Password
              </button>
            ) : (
              <div className="password-section">
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

                <button 
                  className="cancel-password-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassword("");
                    setConfirmPassword("");
                    setCurrentPassword("");
                    setErrors({});
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="dropdown-actions">
              <button onClick={handleSave} disabled={uploading} className="save-btn">
                {uploading ? "Saving..." : "Save Changes"}
              </button>
              <button onClick={deleteAccount} className="delete-btn">
                Delete Account
              </button>
              <button onClick={onLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification ${notification.type}`} onClick={(e) => e.stopPropagation()}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdminAccountMenu; 