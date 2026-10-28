import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { Members } from './pages/Members';
import { Loans } from './pages/Loans';
import { Admin } from './pages/Admin';
import { About } from './pages/About';

const pageTitles = {
  '/': { title: 'Dashboard Overview', subtitle: 'Real-time overview of library assets, members, and transactions' },
  '/books': { title: 'Books Inventory', subtitle: 'Manage library catalog, stock availability, and classifications' },
  '/members': { title: 'Member Directory', subtitle: 'Student, faculty, and staff library card management' },
  '/loans': { title: 'Circulation & Loans', subtitle: 'Issue books, monitor due dates, and process returns' },
  '/admin': { title: 'Database & Role Administration', subtitle: 'MongoDB RBAC, shell commands, and security guidelines' },
  '/about': { title: 'About Mini-Project', subtitle: 'College DBMS mini-project details, technology stack, and architecture' },
};

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentMeta = pageTitles[location.pathname] || {
    title: 'Library Management System',
    subtitle: 'DBMS Project Dashboard',
  };

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        <header className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <div>
              <h2>{currentMeta.title}</h2>
              <p>{currentMeta.subtitle}</p>
            </div>
          </div>
        </header>

        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
            <Route path="/members" element={<Members />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </ToastProvider>
  );
}
