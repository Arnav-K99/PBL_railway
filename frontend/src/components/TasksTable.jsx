import React from 'react';
import DeptBadge from './DeptBadge';

export default function TasksTable({ tasks }) {
  if (!tasks || tasks.length === 0) {
    return <div className="empty-state">No maintenance tasks loaded.</div>;
  }

  return (
    <div className="content-card">
      <div className="card-title">
        <span>Input Maintenance Tasks ({tasks.length})</span>
        <span style={{ fontSize: '13px', fontWeight: 'normal', color: 'var(--text-muted)' }}>
          Requested track possession activities
        </span>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Task ID</th>
              <th>Department</th>
              <th>Section</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.task_id}>
                <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  {task.task_id}
                </td>
                <td>
                  <DeptBadge department={task.department} />
                </td>
                <td>
                  <span className="section-tag">{task.section}</span>
                </td>
                <td>{task.date}</td>
                <td>{task.earliest_start}</td>
                <td>{task.latest_end}</td>
                <td style={{ fontWeight: '600' }}>{task.duration} hrs</td>
                <td>{task.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
