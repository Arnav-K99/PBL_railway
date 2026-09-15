import React from 'react';
import DeptBadge from './DeptBadge';

export default function PlanView({ blocks }) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="content-card empty-state">
        <p style={{ fontSize: '16px', fontWeight: '500' }}>No maintenance blocks scheduled yet.</p>
        <p style={{ marginTop: '6px', fontSize: '13px' }}>
          Click <strong>"Run Greedy Scheduler"</strong> above to generate the optimal clubbed plan.
        </p>
      </div>
    );
  }

  return (
    <div className="blocks-grid">
      {blocks.map((block) => (
        <div key={block.block_id} className="block-card">
          {/* Header */}
          <div className="block-header">
            <div className="block-id-badge">
              <span style={{ fontSize: '18px' }}>🚆</span>
              <span>BLOCK {block.block_id}</span>
              <span className="section-tag">{block.section}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                📅 {block.date} &nbsp;|&nbsp; ⏰ {block.start_time} – {block.end_time}
              </span>
              <span className="status-badge-scheduled">
                ● {block.status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="block-body">
            {/* Visual Clubbing Row */}
            <div className="clubbed-row">
              <span className="clubbed-label">Clubbed Departments:</span>
              {block.departments.map((dept) => (
                <DeptBadge key={dept} department={dept} />
              ))}
            </div>

            {/* Metrics & Simultaneous Execution Explanation */}
            <div className="block-metrics-pill-row">
              <div className="metric-pill-item">
                Block Duration: <strong>{block.block_duration} hrs</strong>
              </div>
              <div className="metric-pill-item">
                Available Window: <strong>{block.window_capacity_hours} hrs</strong>
              </div>
              <div className="metric-pill-item">
                Capacity Utilization: <strong>{block.utilization_percentage}%</strong>
              </div>
              <div className="metric-pill-item">
                Clubbed Tasks Count: <strong>{block.tasks.length} tasks</strong>
              </div>
            </div>

            <div className="note-box">
              💡 <strong>Simultaneous Execution:</strong> Tasks from Engineering, S&T, and Traction are executed concurrently during this single possession window. Total block duration is calculated as <strong>{block.block_duration}h</strong> (the maximum task duration), rather than summing individual durations.
            </div>

            {/* Tasks in this block */}
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Department</th>
                    <th>Required Window</th>
                    <th>Duration</th>
                    <th>Activity Description</th>
                  </tr>
                </thead>
                <tbody>
                  {block.tasks.map((task) => (
                    <tr key={task.task_id}>
                      <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                        {task.task_id}
                      </td>
                      <td>
                        <DeptBadge department={task.department} />
                      </td>
                      <td>
                        {task.earliest_start} – {task.latest_end}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {task.duration} hrs
                      </td>
                      <td>
                        {task.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
