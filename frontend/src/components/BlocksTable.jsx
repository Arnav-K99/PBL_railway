import React from 'react';

export default function BlocksTable({ availableBlocks }) {
  if (!availableBlocks || availableBlocks.length === 0) {
    return <div className="empty-state">No available block windows loaded.</div>;
  }

  return (
    <div className="content-card">
      <div className="card-title">
        <span>Authorized Available Block Windows ({availableBlocks.length})</span>
        <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
          Standard engineering traffic corridors
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Block ID</th>
              <th>Track Section</th>
              <th>Date</th>
              <th>Window Start</th>
              <th>Window End</th>
              <th>Total Capacity</th>
            </tr>
          </thead>
          <tbody>
            {availableBlocks.map((blk) => {
              const startParts = blk.start_time.split(':').map(Number);
              const endParts = blk.end_time.split(':').map(Number);
              const capHours = ((endParts[0] * 60 + endParts[1]) - (startParts[0] * 60 + startParts[1])) / 60;

              return (
                <tr key={blk.block_id}>
                  <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                    {blk.block_id}
                  </td>
                  <td>
                    <span className="section-tag">{blk.section}</span>
                  </td>
                  <td>{blk.date}</td>
                  <td>{blk.start_time}</td>
                  <td>{blk.end_time}</td>
                  <td style={{ fontWeight: '600' }}>
                    {capHours > 0 ? `${capHours.toFixed(1)} hrs` : 'N/A'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
