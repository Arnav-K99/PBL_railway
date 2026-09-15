import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function BlocksPage({ scheduledBlocks = [], unscheduled = [], onGeneratePlan, loading }) {
  const [selectedBlockId, setSelectedBlockId] = useState(
    scheduledBlocks.length > 0 ? scheduledBlocks[0].block_id : null
  );

  const selectedBlock = scheduledBlocks.find((b) => b.block_id === selectedBlockId) || scheduledBlocks[0];

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Scheduled Blocks</h2>
          <div className="page-description">
            Authorized multi-department maintenance windows & track closure authorizations
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-outline"
            onClick={onGeneratePlan}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {/* Main Scheduled Blocks Table */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Authorized Blocks ({scheduledBlocks.length})</div>
          <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
            STATUS: ACTIVE
          </span>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Block ID</th>
                <th>Track</th>
                <th>Date</th>
                <th>Time Window</th>
                <th>Block Duration</th>
                <th>Capacity</th>
                <th>Departments</th>
                <th>Tasks Included</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {scheduledBlocks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: 'var(--c-text-muted)' }}>
                    No blocks currently scheduled. Open the <strong>Optimizer</strong> to generate the plan.
                  </td>
                </tr>
              ) : (
                scheduledBlocks.map((blk) => {
                  const isSelected = selectedBlock?.block_id === blk.block_id;
                  return (
                    <tr
                      key={blk.block_id}
                      className={isSelected ? 'selected-row' : ''}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedBlockId(blk.block_id)}
                    >
                      <td className="cell-mono" style={{ fontWeight: '700' }}>
                        {blk.block_id}
                      </td>
                      <td>
                        <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                          {blk.track || 'Track 1'}
                        </span>
                      </td>
                      <td className="cell-mono">{blk.date}</td>
                      <td className="cell-mono">{blk.start_time} – {blk.end_time}</td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>
                        {blk.block_duration} hrs
                      </td>
                      <td className="cell-mono">{blk.window_capacity_hours} hrs</td>
                      <td>
                        <span style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)' }}>
                          {blk.departments.join(' · ')}
                        </span>
                      </td>
                      <td>
                        <span className="cell-mono" style={{ fontWeight: '600' }}>
                          {blk.tasks.map((t) => t.task_id).join(', ')}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status="Scheduled" label="Scheduled" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Block Inspection Detail */}
      {selectedBlock && (
        <div className="ops-panel">
          <div className="panel-header">
            <div className="panel-title">
              Block Inspection: {selectedBlock.block_id} ({selectedBlock.track || 'Track 1'})
            </div>
            <StatusBadge status="Scheduled" label="Scheduled" />
          </div>

          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--c-border)', paddingBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Track</div>
                <div className="cell-mono" style={{ fontWeight: '700', marginTop: '2px' }}>{selectedBlock.track || 'Track 1'}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Time Window</div>
                <div className="cell-mono" style={{ marginTop: '2px' }}>{selectedBlock.start_time} – {selectedBlock.end_time} ({selectedBlock.window_capacity_hours}h)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Block Duration</div>
                <div className="cell-mono" style={{ fontWeight: '700', marginTop: '2px' }}>{selectedBlock.block_duration} hrs (Simultaneous)</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Capacity Utilization</div>
                <div className="cell-mono" style={{ marginTop: '2px' }}>{selectedBlock.utilization_percentage}%</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Departments</div>
                <div style={{ marginTop: '2px' }}>{selectedBlock.departments.join(' · ')}</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Maintenance Work ({selectedBlock.tasks.length} activities executing simultaneously)
            </div>

            <div className="ops-table-container">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Department</th>
                    <th>Track</th>
                    <th>Required Window</th>
                    <th>Duration</th>
                    <th>Work Description</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBlock.tasks.map((task) => (
                    <tr key={task.task_id}>
                      <td className="cell-mono" style={{ fontWeight: '700' }}>{task.task_id}</td>
                      <td>
                        <span className="badge-tag">{task.department}</span>
                      </td>
                      <td>
                        <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '600' }}>
                          {task.track || selectedBlock.track || 'Track 1'}
                        </span>
                      </td>
                      <td className="cell-mono">{task.earliest_start} – {task.latest_end}</td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>{task.duration} hrs</td>
                      <td>{task.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Unscheduled Tasks Section */}
      {unscheduled && unscheduled.length > 0 && (
        <div className="ops-panel">
          <div className="panel-header">
            <div className="panel-title">Unscheduled Tasks & Operational Constraints ({unscheduled.length})</div>
            <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
              DIAGNOSTIC REASONS
            </span>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Task ID</th>
                  <th>Department</th>
                  <th>Track</th>
                  <th>Requested Window</th>
                  <th>Operational Constraint Reason</th>
                </tr>
              </thead>
              <tbody>
                {unscheduled.map(({ task, reason }) => (
                  <tr key={task.task_id}>
                    <td className="cell-mono" style={{ fontWeight: '700' }}>{task.task_id}</td>
                    <td>
                      <span className="badge-tag">{task.department}</span>
                    </td>
                    <td>
                      <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                        {task.track || 'Track 1'}
                      </span>
                    </td>
                    <td className="cell-mono">
                      {task.earliest_start} – {task.latest_end} ({task.duration}h)
                    </td>
                    <td style={{ color: 'var(--c-text-primary)', fontSize: '11.5px', whiteSpace: 'normal', maxWidth: '500px' }}>
                      {reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
