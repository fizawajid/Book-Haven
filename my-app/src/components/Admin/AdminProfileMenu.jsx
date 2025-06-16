import React, { useState, useRef, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { MdEdit, MdLogout, MdLock, MdDelete } from 'react-icons/md';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminProfileMenu.css';

const AdminProfileMenu = ({ userData, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [errors, setErrors] = useState({});
  const menuRef = useRef(null);
  const fileInputRef = useRef(null);

  const reader = userData?.reader;
  const [profilePic, setProfilePic] = useState(reader?.profilePicUrl || null);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(reader?.profilePicUrl || null);
  const [uploading, setUploading] = useState(false);

  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const validatePassword = (pass) => {
    if (/\s/.test(pass)) return false; // No spaces allowed
    if (pass.length < 6) return false;
    // Must contain at least one lowercase, one uppercase, one number and one special character
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/.test(pass);
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('Image size should be less than 5MB', 'error');
      return;
    }

    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("image", file);
    formData.append("readerId", reader.reader_id);

    try {
      const response = await fetch('http://localhost:8000/profile-pic/upload-profile', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePic(data.profilePicUrl);
        showNotification('Profile picture updated successfully');
      } else {
        throw new Error('Failed to upload profile picture');
      }
    } catch (error) {
      showNotification('Failed to upload profile picture', 'error');
      setPreviewUrl(profilePic); // Revert to previous image on error
    }
  };

  const handlePasswordChange = async () => {
    const newErrors = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }
    
    if (!newPassword || !confirmPassword) {
      newErrors.password = "New password and confirmation are required.";
    } else if (newPassword !== confirmPassword) {
      newErrors.password = "Passwords do not match.";
    } else if (!validatePassword(newPassword)) {
      newErrors.password = "Password must be at least 6 characters long and contain uppercase, lowercase, number, and special character.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/profile-pic/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (response.ok) {
        showNotification('Password updated successfully');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      } else {
        const data = await response.json();
        if (data.error === "Current password is incorrect.") {
          setErrors({ currentPassword: "Current password is incorrect." });
        } else {
          throw new Error('Failed to update password');
        }
      }
    } catch (error) {
      showNotification('Failed to update password', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentPassword) {
      showNotification('Please enter your password to confirm deletion', 'error');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/profile-pic/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ reader_id: reader.reader_id })
      });

      if (response.ok) {
        onLogout();
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      showNotification('Failed to delete account', 'error');
    }
  };

  return (
    <div className="admin-profile-menu" ref={menuRef}>
      <div className="profile-trigger" onClick={() => setIsOpen(!isOpen)}>
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="profile-image" />
        ) : (
          <FaUserCircle className="default-avatar" />
        )}
        <span className="profile-name">{`${reader?.first_name} ${reader?.last_name}`}</span>
      </div>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-pic-container">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile" className="profile-image" />
              ) : (
                <FaUserCircle className="default-avatar" />
              )}
              <div className="edit-overlay" onClick={() => fileInputRef.current?.click()}>
                <MdEdit />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleProfilePicChange}
                className="hidden-input"
              />
            </div>
            <div className="profile-info">
              <h3>{`${reader?.first_name} ${reader?.last_name}`}</h3>
              <p>{reader?.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button onClick={() => setShowPasswordModal(true)}>
              <MdLock /> Change Password
            </button>
            <button onClick={() => setShowDeleteModal(true)}>
              <MdDelete /> Delete Account
            </button>
            <button onClick={onLogout}>
              <MdLogout /> Logout
            </button>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Change Password</h2>
            <div className="password-input-container">
              <input
                type={currentPasswordVisible ? "text" : "password"}
                placeholder="Current Password"
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
            
            <div className="password-input-container">
              <input
                type={newPasswordVisible ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setNewPasswordVisible(!newPasswordVisible)}
              >
                {newPasswordVisible ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <div className="password-input-container">
              <input
                type={confirmPasswordVisible ? "text" : "password"}
                placeholder="Confirm New Password"
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
            
            <div className="modal-actions">
              <button onClick={() => {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setErrors({});
              }}>Cancel</button>
              <button onClick={handlePasswordChange}>Update Password</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Delete Account</h2>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="password-input-container">
              <input
                type={currentPasswordVisible ? "text" : "password"}
                placeholder="Enter your password to confirm"
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
            <div className="modal-actions">
              <button onClick={() => {
                setShowDeleteModal(false);
                setCurrentPassword('');
              }}>Cancel</button>
              <button onClick={handleDeleteAccount} className="delete-button">Delete Account</button>
            </div>
          </div>
        </div>
      )}

      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default AdminProfileMenu; 