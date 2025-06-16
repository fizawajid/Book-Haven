import React, { useState, useEffect } from 'react';
import './UserManagement.css';

const UserManagement = () => {
  const [readers, setReaders] = useState([]);
  const [filteredReaders, setFilteredReaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdminsOnly, setShowAdminsOnly] = useState(false);
  const [sortByLastLogin, setSortByLastLogin] = useState(false);
  const [selectedReaders, setSelectedReaders] = useState([]);

  useEffect(() => {
    fetchReaders();
  }, []);

  const fetchReaders = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/users', { credentials: 'include' });
      const data = await response.json();
      setReaders(data.users);
      setFilteredReaders(data.users);
    } catch (error) {
      console.error('Error fetching readers:', error);
    }
  };

  useEffect(() => {
    let result = readers;
    if (searchTerm) {
      result = result.filter(reader => 
        reader.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reader.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reader.reader_id.toString().includes(searchTerm) ||
        reader.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (showAdminsOnly) {
      result = result.filter(reader => reader.isAdmin);
    }
    if (sortByLastLogin) {
      result = [...result].sort((a, b) => new Date(b.last_login) - new Date(a.last_login));
    }
    setFilteredReaders(result);
  }, [readers, searchTerm, showAdminsOnly, sortByLastLogin]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleAdmins = () => {
    setShowAdminsOnly(!showAdminsOnly);
  };

  const handleSortByLastLogin = () => {
    setSortByLastLogin(!sortByLastLogin);
  };

  const handleSelectReader = (readerId) => {
    setSelectedReaders(prev => 
      prev.includes(readerId) ? prev.filter(id => id !== readerId) : [...prev, readerId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedReaders.length === 0) return;
    if (!window.confirm('Are you sure you want to delete the selected users?')) return;

    try {
      for (const readerId of selectedReaders) {
        await fetch(`http://localhost:8000/admin/delete-account`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ reader_id: readerId })
        });
      }
      fetchReaders();
      setSelectedReaders([]);
    } catch (error) {
      console.error('Error deleting readers:', error);
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by name, ID, or email"
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="filters">
        <button 
          onClick={handleToggleAdmins}
          className={`filter-btn ${showAdminsOnly ? 'active' : ''}`}
        >
          {showAdminsOnly ? 'Show All' : 'Show Admins Only'}
        </button>
        <button 
          onClick={handleSortByLastLogin}
          className={`filter-btn ${sortByLastLogin ? 'active' : ''}`}
        >
          {sortByLastLogin ? 'Unsort' : 'Sort by Last Login'}
        </button>
        <button 
          onClick={handleDeleteSelected} 
          disabled={selectedReaders.length === 0}
          className={`delete-btn ${selectedReaders.length === 0 ? 'disabled' : ''}`}
        >
          Delete Selected ({selectedReaders.length})
        </button>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Reader ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Admin</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReaders.map(reader => (
              <tr key={reader.reader_id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedReaders.includes(reader.reader_id)}
                    onChange={() => handleSelectReader(reader.reader_id)}
                    className="checkbox"
                  />
                </td>
                <td>{reader.reader_id}</td>
                <td>{reader.first_name}</td>
                <td>{reader.last_name}</td>
                <td>{reader.email}</td>
                <td>
                  <span className={`admin-badge ${reader.isAdmin ? 'admin' : 'user'}`}>
                    {reader.isAdmin ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>{!reader.isAdmin && reader.last_login ? new Date(reader.last_login).toLocaleString() : 'N/A'}</td>
                <td>
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this user?')) {
                        handleDeleteSelected([reader.reader_id]);
                      }
                    }}
                    className="delete-user-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
