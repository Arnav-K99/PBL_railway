import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function MaintenancePage({ tasks, scheduledTaskIds = new Set() }) {
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesDept =
      deptFilter === 'ALL' ||
      task.department.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesTrack =
      trackFilter === 'ALL' || task.track === trackFilter;
    const matchesSearch =
      task.task_id.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesTrack && matchesSearch;
  });

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Maintenance Tasks Registry</h2>
          <div className="page-description">
            Track possession requisitions submitted by Engineering, S&T, and Traction departments
          </div>
        </div>
      </div>

      <div className="ops-panel">
        <div className="panel-header" style={{ gap: '12px', flexWrap: 'wrap' }}>
          <div className="panel-title">Registered Requisitions ({filteredTasks.length})</div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter task or description..."
              className="input-text"
              style={{ width: '200px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="select-box"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Signal">Signal & Telecom (S&T)</option>
              <option value="Traction">Traction / Electrical</option>
            </select>

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
                <th>Task ID</th>
                <th>Department</th>
                <th>Track</th>
                <th>Date</th>
                <th>Earliest Start</th>
                <th>Latest End</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--c-text-muted)' }}>
                    No maintenance tasks found matching filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isScheduled = scheduledTaskIds.has(task.task_id);
                  return (
                    <tr
                      key={task.task_id}
                      className={isScheduled ? 'row-scheduled' : ''}
                    >
                      <td className="cell-mono" style={{ fontWeight: '700' }}>{task.task_id}</td>
                      <td>
                        <span className="badge-tag">{task.department}</span>
                      </td>
                      <td>
                        <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                          {task.track || 'Track 1'}
                        </span>
                      </td>
                      <td className="cell-mono">{task.date}</td>
                      <td className="cell-mono">{task.earliest_start}</td>
                      <td className="cell-mono">{task.latest_end}</td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>{task.duration} hrs</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>{task.description}</td>
                      <td>
                        {isScheduled ? (
                          <StatusBadge status="Scheduled" label="Scheduled" />
                        ) : (
                          <StatusBadge status="Pending" label="Pending" />
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
    </div>
  );
}
