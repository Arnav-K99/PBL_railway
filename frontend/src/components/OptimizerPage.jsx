import React, { useState, useMemo } from 'react';
import StatusBadge from './StatusBadge';

export default function OptimizerPage({
  tasks = [],
  scheduleResult,
  onGeneratePlan,
  loading,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlanActive, setIsPlanActive] = useState(true); // Default to active if scheduleResult has blocks
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');

  // Trigger automated generation
  const handleGenerate = async () => {
    setIsProcessing(true);
    try {
      if (onGeneratePlan) {
        await onGeneratePlan();
      }
      setIsPlanActive(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset plan to initial unassigned state
  const handleReset = () => {
    setIsPlanActive(false);
  };

  const scheduledBlocks = isPlanActive ? (scheduleResult?.blocks || []) : [];
  const unscheduled = isPlanActive ? (scheduleResult?.unscheduled || []) : [];
  const metrics = isPlanActive ? scheduleResult?.metrics : null;

  // Map task_id -> assigned block
  const taskToBlockMap = useMemo(() => {
    const map = new Map();
    if (isPlanActive && scheduledBlocks.length > 0) {
      for (const blk of scheduledBlocks) {
        for (const t of blk.tasks) {
          map.set(t.task_id, blk);
        }
      }
    }
    return map;
  }, [isPlanActive, scheduledBlocks]);

  // Filter tasks table (view only; does not alter algorithm input)
  const filteredTasks = (tasks || []).filter((task) => {
    const matchesSearch =
      task.task_id.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      deptFilter === 'ALL' || task.department.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesTrack = trackFilter === 'ALL' || task.track === trackFilter;
    return matchesSearch && matchesDept && matchesTrack;
  });

  return (
    <div>
      {/* Top Header & Operational Actions */}
      <div className="optimizer-hero">
        <div className="optimizer-hero-text">
          <h3>Maintenance Optimizer</h3>
          <p>Automatically consolidate compatible multi-department maintenance activities into available railway blocks.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            id="reset-plan-btn"
            className="btn-reset"
            onClick={handleReset}
            disabled={!isPlanActive || isProcessing || loading}
            title="Reset plan to initial unassigned state"
          >
            Reset Plan
          </button>

          <button
            id="generate-plan-btn"
            className="btn-generate"
            onClick={handleGenerate}
            disabled={isProcessing || loading}
          >
            <span>{isProcessing || loading ? 'Generating Block Plan...' : 'GENERATE BLOCK PLAN'}</span>
          </button>
        </div>
      </div>

      {/* Concise Processing State */}
      {(isProcessing || loading) && (
        <div className="processing-banner">
          <span style={{ fontSize: '15px' }}>⚙️</span>
          <div>
            <strong>Generating block plan...</strong>
            <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Checking maintenance windows... Checking train movements... Grouping compatible work... Creating maintenance blocks...
            </div>
          </div>
        </div>
      )}

      {/* Results Summary (Visible when plan is active) */}
      {metrics && isPlanActive && (
        <div className="kpi-row">
          <div className="kpi-card">
            <div className="kpi-number">{metrics.total_tasks}</div>
            <div className="kpi-label">Total Tasks</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: 'var(--status-sched-fg)' }}>
              {metrics.scheduled_tasks}
            </div>
            <div className="kpi-label">Scheduled</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number" style={{ color: metrics.unscheduled_tasks > 0 ? 'var(--status-warn-fg)' : 'inherit' }}>
              {metrics.unscheduled_tasks}
            </div>
            <div className="kpi-label">Unscheduled</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-number">{metrics.blocks_used}</div>
            <div className="kpi-label">Blocks Created</div>
          </div>
        </div>
      )}

      {/* Side-by-Side Main Section: Maintenance Tasks Table (Left) + Generated Blocks (Right) */}
      <div className="optimizer-v4-grid">
        {/* Left Column: Maintenance Tasks Table */}
        <div className="ops-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header" style={{ flexWrap: 'wrap', gap: '8px' }}>
            <div className="panel-title">
              Maintenance Tasks ({filteredTasks.length} of {tasks.length})
            </div>

            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search task or description..."
                className="input-text"
                style={{ width: '180px' }}
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
                <option value="Signal">Signal & Telecom</option>
                <option value="Traction">Traction</option>
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
                  <th>Task</th>
                  <th>Department</th>
                  <th>Track</th>
                  <th>Requested Time</th>
                  <th>Duration</th>
                  <th>Block</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--c-text-muted)' }}>
                      No maintenance tasks match the filter.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => {
                    const assignedBlock = taskToBlockMap.get(task.task_id);
                    const isScheduled = !!assignedBlock;

                    return (
                      <tr
                        key={task.task_id}
                        className={isScheduled ? 'row-scheduled' : ''}
                      >
                        <td className="cell-mono" style={{ fontWeight: '700' }}>
                          {task.task_id}
                        </td>
                        <td>
                          <span className="badge-tag">{task.department}</span>
                        </td>
                        <td>
                          <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                            {task.track || 'Track 1'}
                          </span>
                        </td>
                        <td className="cell-mono">
                          {task.earliest_start}–{task.latest_end}
                        </td>
                        <td className="cell-mono" style={{ fontWeight: '600' }}>
                          {task.duration}h
                        </td>
                        <td className="cell-mono">
                          {assignedBlock ? (
                            <span className="block-tag-badge">
                              {assignedBlock.block_id}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--c-text-muted)' }}>—</span>
                          )}
                        </td>
                        <td>
                          {!isPlanActive ? (
                            <span style={{ color: 'var(--c-text-muted)', fontSize: '11px' }}>—</span>
                          ) : isScheduled ? (
                            <StatusBadge status="Scheduled" label="Scheduled" />
                          ) : (
                            <StatusBadge status="Unscheduled" label="Unscheduled" />
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

        {/* Right Column: Generated Blocks Panel */}
        <div className="ops-panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-title">
              Generated Blocks ({scheduledBlocks.length})
            </div>
            <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {isPlanActive ? 'AUTHORIZED WINDOWS' : 'INITIAL STATE'}
            </span>
          </div>

          <div className="panel-body">
            {!isPlanActive || scheduledBlocks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--c-text-secondary)' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '600', marginBottom: '6px', color: 'var(--c-text-primary)' }}>
                  No Blocks Generated
                </div>
                <p style={{ fontSize: '11.5px', lineHeight: '1.5' }}>
                  Click <strong>GENERATE BLOCK PLAN</strong> above to automatically process all 20 maintenance tasks, club compatible activities across departments, and create maintenance blocks.
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', marginBottom: '12px' }}>
                  Multi-department work clubbed into shared track possession corridors:
                </p>

                {scheduledBlocks.map((blk) => {
                  // Group tasks by department for clear clubbing demonstration
                  const deptGroups = {};
                  blk.tasks.forEach((t) => {
                    if (!deptGroups[t.department]) deptGroups[t.department] = [];
                    deptGroups[t.department].push(t);
                  });

                  return (
                    <div key={blk.block_id} className="compact-block-card">
                      <div className="compact-block-header">
                        <div className="compact-block-title">
                          {blk.block_id} &nbsp;·&nbsp; {blk.track || 'Track 1'}
                        </div>
                        <StatusBadge status="Scheduled" label="Scheduled" />
                      </div>

                      <div className="compact-block-body">
                        <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                          CORRIDOR: {blk.start_time} — {blk.end_time}
                        </div>

                        {Object.entries(deptGroups).map(([dept, dTasks]) => (
                          <div key={dept} className="compact-dept-row">
                            <div className="compact-dept-name">{dept}</div>
                            <div className="compact-dept-tasks">
                              {dTasks.map((t) => (
                                <span key={t.task_id} style={{ marginRight: '6px' }}>
                                  <strong>{t.task_id}</strong>
                                  <span style={{ color: 'var(--c-text-secondary)', fontSize: '10.5px' }}> ({t.duration}h)</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="compact-block-footer">
                        <span>{blk.tasks.length} Tasks · {blk.departments.length} Depts</span>
                        <span>
                          Simultaneous: <strong>{blk.block_duration} hrs</strong>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Unscheduled Tasks (Visible when plan is active and unscheduled tasks exist) */}
      {isPlanActive && unscheduled.length > 0 && (
        <div className="ops-panel">
          <div className="panel-header">
            <div className="panel-title">
              Unscheduled Tasks ({unscheduled.length})
            </div>
            <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
              OPERATIONAL CONSTRAINT DIAGNOSTICS
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
                  <th>Duration</th>
                  <th>Work Description</th>
                  <th>Constraint Reason</th>
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
                      {task.earliest_start}–{task.latest_end}
                    </td>
                    <td className="cell-mono" style={{ fontWeight: '600' }}>
                      {task.duration}h
                    </td>
                    <td>{task.description}</td>
                    <td style={{ maxWidth: '420px', whiteSpace: 'normal', color: 'var(--status-warn-fg)', fontSize: '11.5px' }}>
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
