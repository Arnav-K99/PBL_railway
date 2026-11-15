import React from 'react';

export default function Sidebar({ activePage, setActivePage }) {
  const sections = [
    {
      heading: 'OPERATIONS',
      items: [
        { id: 'operations', label: 'Operations Center', badge: 'LIVE' },
      ],
    },
    {
      heading: 'PLANNING',
      items: [
        { id: 'maintenance', label: 'Maintenance Requests' },
        { id: 'optimizer', label: 'Block Planner' },
        { id: 'blocks', label: 'Generated Blocks' },
      ],
    },
    {
      heading: 'ANALYSIS',
      items: [
        { id: 'comparison', label: 'Algorithm Comparison' },
      ],
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          RAILWAY<br />OPERATIONS
        </div>
        <div className="sidebar-logo-sub">MAINTENANCE & TRAIN PLANNING</div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((sec) => (
          <div key={sec.heading} style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '700',
                letterSpacing: '0.08em',
                color: '#6E7681',
                padding: '4px 12px 6px',
                textTransform: 'uppercase',
              }}
            >
              {sec.heading}
            </div>
            {sec.items.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-link ${activePage === item.id ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '9.5px',
                      background: '#16A34A',
                      color: '#FFFFFF',
                      padding: '1px 5px',
                      borderRadius: '2px',
                      fontWeight: '700',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div>TRACKS: 1 · 2 · 3 · 4 (SECTION A–B)</div>
        <div className="system-status-indicator" style={{ marginTop: '6px' }}>
          <span className="status-dot-active"></span>
          <span>SIMULATION ONLINE</span>
        </div>
      </div>
    </aside>
  );
}
