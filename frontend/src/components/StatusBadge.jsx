import React from 'react';

export default function StatusBadge({ status = 'Scheduled', label }) {
  const sLower = (status || '').toLowerCase();
  let typeClass = 'status-scheduled';
  let displayLabel = label || 'Scheduled';

  if (sLower.includes('conflict')) {
    typeClass = 'status-conflict';
    displayLabel = label || 'Conflict';
  } else if (sLower.includes('unsched') || sLower.includes('pending')) {
    typeClass = 'status-unscheduled';
    displayLabel = label || (sLower.includes('pending') ? 'Pending' : 'Unscheduled');
  }

  return (
    <span className={`status-indicator ${typeClass}`}>
      <span className="status-dot"></span>
      <span>{displayLabel}</span>
    </span>
  );
}
