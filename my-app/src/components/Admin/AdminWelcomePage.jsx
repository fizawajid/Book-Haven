import { useEffect, useState } from 'react';
import { MdPeople, MdAdminPanelSettings, MdWarning, MdMenuBook, MdCheckCircle, MdError } from 'react-icons/md';
import './AdminWelcomePage.css';

const AdminWelcomePage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalBooks: 0,
    recentActivities: []
  });

  const [systemStatus, setSystemStatus] = useState({
    database: false,
    metrics: {
      database: {
        totalConnections: 0,
        activeConnections: 0,
        databaseName: '',
        databaseState: ''
      },
      lastChecked: ''
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const readerId = sessionStorage.getItem("reader_id");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!readerId) {
      console.error("Reader ID is missing from sessionStorage.");
      setIsLoading(false);
      return;
    }

    fetchDashboardData();
    // Set up polling for system status
    const statusInterval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds
    return () => clearInterval(statusInterval);
  }, [readerId, token]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard data
      const dashboardResponse = await fetch('http://localhost:8000/admin/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setStats({
          totalUsers: dashboardData.totalUsers,
          totalAdmins: dashboardData.totalAdmins,
          totalBooks: dashboardData.totalBooks,
          recentActivities: dashboardData.recentActivities
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/system-status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      // Set all statuses to false on error
      setSystemStatus(prev => ({
        ...prev,
        database: false
      }));
    }
  };

  const StatusIndicator = ({ status, label, metrics }) => {
    const isOnline = status === true;
    return (
      <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
        <span className="status-dot"></span>
        <div className="status-content">
          <div className="status-label">{label}</div>
          {metrics && (
            <div className="status-metrics">
              <div className="metric">
                <span className="metric-label">State:</span>
                <span className="metric-value">{metrics.databaseState}</span>
              </div>
              {metrics.connectionDetails && (
                <>
                  <div className="metric">
                    <span className="metric-label">Current Connections:</span>
                    <span className="metric-value">{metrics.connectionDetails.current}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Active Connections:</span>
                    <span className="metric-value">{metrics.connectionDetails.active}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Available Connections:</span>
                    <span className="metric-value">{metrics.connectionDetails.available}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Pending Connections:</span>
                    <span className="metric-value">{metrics.connectionDetails.pending}</span>
                  </div>
                </>
              )}
              <div className="metric">
                <span className="metric-label">Database:</span>
                <span className="metric-value">{metrics.databaseName}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="system-status">
          <StatusIndicator 
            status={systemStatus.database} 
            label="Database"
            metrics={systemStatus.metrics?.database}
          />
          {systemStatus.metrics?.lastChecked && (
            <div className="last-checked">
              Last checked: {new Date(systemStatus.metrics.lastChecked).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <MdPeople />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.totalUsers}</p>
            <p className="stat-label">Registered Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdAdminPanelSettings />
          </div>
          <div className="stat-content">
            <h3>Admin Users</h3>
            <p className="stat-value">{stats.totalAdmins}</p>
            <p className="stat-label">System Administrators</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <MdMenuBook />
          </div>
          <div className="stat-content">
            <h3>Total Books</h3>
            <p className="stat-value">{stats.totalBooks}</p>
            <p className="stat-label">Books in Library</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          {stats.recentActivities.length === 0 ? (
            <p className="no-data">No recent activity</p>
          ) : (
            <div className="activity-list">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'user' ? <MdPeople /> : 
                     activity.type === 'admin' ? <MdAdminPanelSettings /> :
                     <MdWarning />}
                  </div>
                  <div className="activity-details">
                    <p className="activity-text">{activity.description}</p>
                    <span className="activity-time">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button onClick={() => window.location.href = '/admin/users'}>
              Manage Users
            </button>
            <button onClick={() => window.location.href = '/admin/roles'}>
              Manage Roles
            </button>
            <button onClick={() => window.location.href = '/admin/settings'}>
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminWelcomePage;
