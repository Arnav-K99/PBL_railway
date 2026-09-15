import React from 'react';

export default function Sidebar({ activePage, setActivePage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'trains', label: 'Trains' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'optimizer', label: 'Optimizer' },
    { id: 'blocks', label: 'Blocks' },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          RAILWAY<br />BLOCK PLANNER
        </div>
        <div className="sidebar-logo-sub">OPERATIONS CONTROL</div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`nav-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>TRACKS: 1 · 2 · 3 · 4</div>
        <div className="system-status-indicator">
          <span className="status-dot-active"></span>
          <span>SYSTEM ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
