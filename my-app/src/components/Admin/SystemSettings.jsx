import React, { useState, useEffect } from 'react';
import './SystemSettings.css';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    isDowntimeEnabled: false,
    downtimeMessage: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin/system-settings', {
        credentials: 'include'
      });
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setMessage('Error fetching settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/admin/system-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      setSettings(data);
      setMessage('Settings updated successfully');
    } catch (error) {
      setMessage('Error updating settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="system-settings-container">
      <h1 className="system-settings-title">System Settings</h1>
      
      <div className="settings-card">
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <label>
              <input
                type="checkbox"
                checked={settings.isDowntimeEnabled}
                onChange={(e) => setSettings({
                  ...settings,
                  isDowntimeEnabled: e.target.checked
                })}
              />
              Enable System Downtime
            </label>
            <p className="description">
              When enabled, only administrators will be able to access the system. Regular users will see a maintenance message.
            </p>
          </div>

          <div className="settings-section">
            <label>Downtime Message:</label>
            <textarea
              value={settings.downtimeMessage}
              onChange={(e) => setSettings({
                ...settings,
                downtimeMessage: e.target.value
              })}
              placeholder="Enter message to display during downtime"
              className="message-input"
            />
            <p className="description">
              This message will be shown to users when they try to log in during system downtime.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="save-button"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
