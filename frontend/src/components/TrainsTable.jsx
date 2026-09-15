import React from 'react';

export default function TrainsTable({ trains }) {
  if (!trains || trains.length === 0) {
    return <div className="empty-state">No train schedules loaded.</div>;
  }

  return (
    <div className="content-card">
      <div className="card-title">
        <span>Train Timetable Schedule ({trains.length})</span>
        <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
          Track possession constraint baseline
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Train ID</th>
              <th>Train Name</th>
              <th>Track Section</th>
              <th>Date</th>
              <th>Arrival Time</th>
              <th>Departure Time</th>
              <th>Occupancy Window</th>
            </tr>
          </thead>
          <tbody>
            {trains.map((train) => (
              <tr key={train.train_id}>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  {train.train_id}
                </td>
                <td style={{ fontWeight: '600' }}>{train.train_name}</td>
                <td>
                  <span className="section-tag">{train.section}</span>
                </td>
                <td>{train.date}</td>
                <td>{train.arrival_time}</td>
                <td>{train.departure_time}</td>
                <td>
                  <span style={{ color: 'var(--danger-text)', fontWeight: '600', fontSize: '12px' }}>
                    {train.arrival_time} – {train.departure_time}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
