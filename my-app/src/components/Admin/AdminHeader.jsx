import React from 'react';
import { MdNotifications } from 'react-icons/md';
import "../../main.css";
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";
const AdminHeader = ({ toggleTheme, isDarkMode }) => {
  return (
    <header className="header">
      <h1 className="header-title">Admin Panel</h1>
      <div className="header-buttons">
        <button onClick={toggleTheme} className="theme-toggle">
          {isDarkMode ? <BsFillSunFill /> : <BsFillMoonFill />}
        </button>
        <button className="notification-btn">
          <MdNotifications />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
