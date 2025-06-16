import React from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../../side.css";
import { 
  MdDashboard, 
  MdPeople, 
  MdAdminPanelSettings, 
  MdSettings 
} from "react-icons/md";
import AdminProfileMenu from "./AdminProfileMenu";

const AdminSidebar = ({ userData, onLogout }) => {
  const navigate = useNavigate();

  const categories = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <MdDashboard /> },
    { name: "User Management", path: "/admin/users", icon: <MdPeople /> },
    { name: "Role Management", path: "/admin/roles", icon: <MdAdminPanelSettings /> },
    { name: "System Settings", path: "/admin/settings", icon: <MdSettings /> },
  ];

  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>
      <ul>
        {categories.map((category, index) => (
          <li key={index}>
            <Link to={category.path}>
              <span className="icon">{category.icon}</span>
              <span className="label">{category.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      
      {/* Profile Menu at bottom */}
      <div className="sidebar-footer">
        <AdminProfileMenu userData={userData} onLogout={onLogout} />
      </div>
    </div>
  );
};

export default AdminSidebar;
