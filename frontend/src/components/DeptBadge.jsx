import React from 'react';

export default function DeptBadge({ department }) {
  const deptLower = (department || '').toLowerCase();
  let className = 'badge-dept';

  if (deptLower.includes('eng')) {
    className += ' dept-engineering';
  } else if (deptLower.includes('signal') || deptLower.includes('s&t')) {
    className += ' dept-sandt';
  } else if (deptLower.includes('tract') || deptLower.includes('elec')) {
    className += ' dept-traction';
  } else {
    className += ' dept-engineering';
  }

  return <span className={className}>{department}</span>;
}
