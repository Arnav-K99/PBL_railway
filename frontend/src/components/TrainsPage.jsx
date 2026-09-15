import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function TrainsPage({ trains }) {
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [densityList, setDensityList] = useState([]);
  const [densityTrackFilter, setDensityTrackFilter] = useState('ALL');

  useEffect(() => {
    async function loadDensity() {
      try {
        const res = await fetch('/api/traffic-density');
        const data = await res.json();
        setDensityList(data);
      } catch (e) {
        console.error('Failed to load traffic density', e);
      }
    }
    loadDensity();
  }, []);

  const filteredTrains = (trains || []).filter((train) => {
    const matchesSearch =
      train.train_id.toLowerCase().includes(search.toLowerCase()) ||
      train.train_name.toLowerCase().includes(search.toLowerCase());
    const matchesTrack = trackFilter === 'ALL' || train.track === trackFilter;
    return matchesSearch && matchesTrack;
  });

  const filteredDensity = (densityList || []).filter((item) => {
    return densityTrackFilter === 'ALL' || item.track === densityTrackFilter;
  });

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Train Movements & Traffic Density</h2>
          <div className="page-description">Registered train traffic across railway tracks (Track 1, Track 2, Track 3, Track 4)</div>
        </div>
      </div>

      {/* Traffic Density & Optimal Maintenance Windows Panel */}
      <div className="ops-panel">
        <div className="panel-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div className="panel-title">Track Traffic Density & Maintenance Window Feasibility</div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Identifies optimal zero-traffic windows and flags high-traffic slots where track possession is strictly not possible
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="select-box"
              value={densityTrackFilter}
              onChange={(e) => setDensityTrackFilter(e.target.value)}
            >
              <option value="ALL">All Tracks</option>
              <option value="Track 1">Track 1</option>
              <option value="Track 2">Track 2</option>
              <option value="Track 3">Track 3</option>
              <option value="Track 4">Track 4</option>
            </select>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Track</th>
                <th>Time Window</th>
                <th>Train Count</th>
                <th>Scheduled Trains in Window</th>
                <th>Block Feasibility & Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {filteredDensity.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: 'var(--c-text-muted)' }}>
                    Loading traffic density data...
                  </td>
                </tr>
              ) : (
                filteredDensity.map((item, idx) => {
                  const isZero = item.train_count === 0;
                  const isLow = item.train_count === 1;
                  const isHigh = item.train_count >= 2;
                  return (
                    <tr
                      key={`${item.track}-${item.time_window}-${idx}`}
                      className={isZero ? 'row-scheduled' : ''}
                      style={isHigh ? { background: '#FFF5F5' } : {}}
                    >
                      <td>
                        <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                          {item.track}
                        </span>
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>{item.time_window}</td>
                      <td className="cell-mono" style={{ fontWeight: '700' }}>
                        {item.train_count} {item.train_count === 1 ? 'Train' : 'Trains'}
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', maxWidth: '320px' }}>
                        {item.trains.length > 0 ? item.trains.join(', ') : '— (No trains scheduled)'}
                      </td>
                      <td>
                        {isZero ? (
                          <div>
                            <span className="status-indicator status-scheduled">
                              <span className="status-dot"></span>
                              <span style={{ fontWeight: '600' }}>Optimal for Block (Zero Disruption)</span>
                            </span>
                            <div style={{ fontSize: '11px', color: '#2D3748', marginTop: '2px' }}>
                              Clear corridor — Safe to sanction multi-department block
                            </div>
                          </div>
                        ) : isLow ? (
                          <div>
                            <span className="status-indicator status-conflict">
                              <span className="status-dot"></span>
                              <span style={{ fontWeight: '600' }}>Feasible with Caution (Low Traffic)</span>
                            </span>
                            <div style={{ fontSize: '11px', color: '#4A5568', marginTop: '2px' }}>
                              1 train scheduled — Minor delay or short block duration
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="status-indicator status-unscheduled" style={{ color: '#991B1B' }}>
                              <span className="status-dot" style={{ background: '#DC2626' }}></span>
                              <span style={{ fontWeight: '700' }}>BLOCK NOT POSSIBLE (High Traffic)</span>
                            </span>
                            <div style={{ fontSize: '11px', color: '#DC2626', marginTop: '2px', fontWeight: '600' }}>
                              {item.train_count} trains occupying — Track possession strictly prohibited
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Train Movements Timetable */}
      <div className="ops-panel">
        <div className="panel-header" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <div className="panel-title">Active Train Movements ({filteredTrains.length})</div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search train ID or name..."
              className="input-text"
              style={{ width: '180px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="select-box"
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
            >
              <option value="ALL">All Tracks</option>
              <option value="Track 1">Track 1</option>
              <option value="Track 2">Track 2</option>
              <option value="Track 3">Track 3</option>
              <option value="Track 4">Track 4</option>
            </select>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Train ID</th>
                <th>Train Name</th>
                <th>Track</th>
                <th>Date</th>
                <th>Arrival Time</th>
                <th>Departure Time</th>
                <th>Occupancy Window</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrains.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--c-text-muted)' }}>
                    No train movements match the specified filter.
                  </td>
                </tr>
              ) : (
                filteredTrains.map((train) => (
                  <tr key={train.train_id}>
                    <td className="cell-mono" style={{ fontWeight: '700' }}>{train.train_id}</td>
                    <td style={{ fontWeight: '600' }}>{train.train_name}</td>
                    <td>
                      <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                        {train.track}
                      </span>
                    </td>
                    <td className="cell-mono">{train.date}</td>
                    <td className="cell-mono">{train.arrival_time}</td>
                    <td className="cell-mono">{train.departure_time}</td>
                    <td className="cell-mono">
                      {train.arrival_time} – {train.departure_time}
                    </td>
                    <td>
                      <StatusBadge status="Scheduled" label="Scheduled" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
