import React, { useState, useEffect } from 'react';
import './RoleManagement.css';

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchUsers();
    // Get current user info from localStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setCurrentUser(userInfo);
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      
      // Filter out the current user and sort admins to the top
      const filteredUsers = data.users
        .filter(user => user.reader_id !== currentUser?.id)
        .sort((a, b) => {
          if (a.isAdmin === b.isAdmin) return 0;
          return a.isAdmin ? -1 : 1;
        });
      
      setUsers(filteredUsers);
    } catch (error) {
      showNotification('Failed to fetch users', 'error');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    setShowPasswordModal(true);
  };

  const confirmRoleChange = async () => {
    try {
      // First verify admin password
      const verifyResponse = await fetch('http://localhost:8000/admin/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ password })
      });

      if (!verifyResponse.ok) {
        throw new Error('Failed to verify password');
      }

      const verifyData = await verifyResponse.json();
      if (!verifyData.verified) {
        showNotification('Incorrect password', 'error');
        return;
      }

      // Update user role
      const updateResponse = await fetch(`http://localhost:8000/admin/users/${selectedUser.reader_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          isAdmin: !selectedUser.isAdmin
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update user role');
      }

      showNotification(`Successfully ${selectedUser.isAdmin ? 'removed admin privileges from' : 'made'} ${selectedUser.first_name} ${selectedUser.last_name}`);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      showNotification('Failed to update user role', 'error');
      console.error('Error updating user role:', error);
    } finally {
      setShowPasswordModal(false);
      setPassword('');
      setSelectedUser(null);
    }
  };

  if (loading) {
    return (
      <div className="role-management">
        <h1>Role Management</h1>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="role-management">
      <h1>Role Management</h1>
      
      {/* Notification */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Admin Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.reader_id}>
                <td>{user.reader_id}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`admin-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleRoleChange(user)}
                    className={`action-button ${user.isAdmin ? 'remove-admin' : 'make-admin'}`}
                  >
                    {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirm Action</h2>
            <p>
              Please enter your admin password to {selectedUser.isAdmin ? 'remove admin privileges from' : 'make'} {selectedUser.first_name} {selectedUser.last_name} an admin.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div className="modal-buttons">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedUser(null);
                }}
                className="cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={confirmRoleChange}
                className="confirm-button"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManagement;
