import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/books', label: 'Books', icon: '📚' },
  { path: '/members', label: 'Members', icon: '👥' },
  { path: '/loans', label: 'Loans & Issues', icon: '🔖' },
  { path: '/admin', label: 'Database Admin', icon: '⚙️' },
  { path: '/about', label: 'About Project', icon: 'ℹ️' },
];

export const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">📖</div>
          <h1>LibraryMS</h1>
          <p>DBMS College Mini-Project</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Management</div>
          {navItems.slice(0, 4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
              end={item.path === '/'}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="nav-label">DBMS & System</div>
          {navItems.slice(4).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div>Connected to <strong>MongoDB</strong></div>
          <div style={{ marginTop: '4px', opacity: 0.7 }}>Mongoose v7 • Node/Express</div>
        </div>
      </aside>
    </>
  );
};
