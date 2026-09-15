import React from 'react';
import DeptBadge from './DeptBadge';

export default function UnscheduledView({ unscheduled }) {
  if (!unscheduled || unscheduled.length === 0) {
    return (
      <div className="content-card empty-state">
        <p style={{ fontSize: '15px', color: 'var(--success-text)', fontWeight: '600' }}>
          ✓ All maintenance tasks have been successfully scheduled into compatible blocks!
        </p>
      </div>
    );
  }

  return (
    <div className="content-card">
      <div className="card-title">
        <span>Unscheduled Maintenance Tasks ({unscheduled.length})</span>
        <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
          Could not be placed due to operational constraints
        </span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        These tasks were not clubbed into any railway block because either a conflicting train movement occupies the track section, or no authorized maintenance window is open for that time and section.
      </p>

      {unscheduled.map(({ task, reason }) => {
        const isTrainConflict = reason.toLowerCase().includes('train conflict');

        return (
          <div key={task.task_id} className="unscheduled-card">
            <div className="unscheduled-header">
              <div className="unscheduled-title">
                <span>⚠️ Task {task.task_id}</span>
                <DeptBadge department={task.department} />
                <span className="section-tag">{task.section}</span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                📅 {task.date} &nbsp;|&nbsp; ⏰ {task.earliest_start} – {task.latest_end} ({task.duration}h)
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
              <strong>Description:</strong> {task.description}
            </div>

            <div className="unscheduled-reason">
              <strong>Constraint Breakdown:</strong> {reason}
            </div>
          </div>
        );
      })}
    </div>
  );
}
