import React, { useState, useEffect } from 'react';
import StatusBadge from './StatusBadge';
import DeptBadge from './DeptBadge';

function timeToMin(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

export default function ComparisonPage({
  comparisonData,
  onRunComparison,
  loading = false,
  trains = [],
}) {
  const currentScenario = comparisonData?.scenario_id || 'showcase';
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);
  const [activeTab, setActiveTab] = useState('dp'); // 'fcfs' | 'greedy' | 'dp'
  const [decisionTab, setDecisionTab] = useState('dp'); // 'fcfs' | 'greedy' | 'dp'
  const [beforeAfterAlgo, setBeforeAfterAlgo] = useState('dp'); // 'fcfs' | 'greedy' | 'dp'
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [timelineTrack, setTimelineTrack] = useState('Track 1');

  // Synchronize scenario state when comparisonData updates from backend
  useEffect(() => {
    if (comparisonData?.scenario_id) {
      setSelectedScenario(comparisonData.scenario_id);
    }
  }, [comparisonData?.scenario_id]);

  // Handle scenario switch
  const handleScenarioChange = (scenarioId) => {
    setSelectedScenario(scenarioId);
    if (onRunComparison) {
      onRunComparison(scenarioId);
    }
  };

  const activeResult = comparisonData ? comparisonData[activeTab] : null;
  const scheduledBlocks = activeResult?.blocks || [];
  const unscheduledTasks = activeResult?.unscheduled || [];

  const decisionResult = comparisonData ? comparisonData[decisionTab] : null;
  const decisionSteps = decisionResult?.decision_steps || [];

  const baResult = comparisonData ? comparisonData[beforeAfterAlgo] : null;
  const baBlocks = baResult?.blocks || [];
  const baUnscheduled = baResult?.unscheduled || [];

  // Extract all unique input tasks from scheduled and unscheduled
  const baInputTasks = [
    ...baBlocks.flatMap((b) =>
      b.tasks.map((t) => ({ ...t, isScheduled: true, assignedBlock: b.block_id }))
    ),
    ...baUnscheduled.map((u) => ({
      ...u.task,
      isScheduled: false,
      assignedBlock: null,
      rejectReason: u.reason,
    })),
  ].sort((a, b) => (a.task_id > b.task_id ? 1 : -1));

  const totalRawHours = baInputTasks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalPossessionHours = baBlocks.reduce((acc, b) => acc + (b.block_duration || 0), 0);
  const netHoursSaved = Math.max(0, totalRawHours - totalPossessionHours);
  const consolidationSavingsPct =
    totalRawHours > 0 ? Math.round((netHoursSaved / totalRawHours) * 100) : 0;

  // Pick currently inspected block or default to first
  const currentBlock =
    scheduledBlocks.find((b) => b.block_id === selectedBlockId) || scheduledBlocks[0];

  // Timeline bounds: 06:00 (360m) to 22:00 (1320m)
  const T_START = 360;
  const T_END = 1320;
  const T_SPAN = T_END - T_START;

  const getPosition = (startStr, endStr) => {
    const s = Math.max(T_START, timeToMin(startStr));
    const e = Math.min(T_END, timeToMin(endStr));
    if (e <= s) return null;
    const left = ((s - T_START) / T_SPAN) * 100;
    const width = Math.max(2, ((e - s) / T_SPAN) * 100);
    return { left: `${left}%`, width: `${width}%` };
  };

  const hourMarkers = ['06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
  const trackTrains = (trains || []).filter((t) => t.track === timelineTrack);
  const trackBlocks = scheduledBlocks.filter((b) => b.track === timelineTrack);

  const opDate = comparisonData?.operation_date || '2026-09-20';
  const execTime = comparisonData?.execution_timestamp || comparisonData?.snapshot_timestamp || 'Initial Load';
  const scenarioName = comparisonData?.scenario_name || 'Official PBL Operations Snapshot (20 Tasks)';

  return (
    <div className="anim-fade-in">
      {/* Top Operations Header Row */}
      <div className="page-title-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Algorithm Comparison</h2>
            <span
              className="badge-tag"
              style={{
                background:
                  selectedScenario === 'showcase'
                    ? '#ECFDF5'
                    : selectedScenario === 'contested'
                    ? '#FEF3C7'
                    : '#E2E8F0',
                color:
                  selectedScenario === 'showcase'
                    ? '#065F46'
                    : selectedScenario === 'contested'
                    ? '#92400E'
                    : '#1E293B',
                fontWeight: '700',
                fontSize: '11px',
              }}
            >
              {selectedScenario === 'showcase'
                ? 'SHOWCASE BENCHMARK (A–B)'
                : selectedScenario === 'contested'
                ? 'STRESS BENCHMARK'
                : 'STANDARD SNAPSHOT'}
            </span>
          </div>
          <div className="page-description">
            Empirical benchmark of FCFS, Greedy, and Dynamic Programming (Weighted Interval Scheduling) on isolated railway snapshots
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Scenario Selector Switcher */}
          <div className="scenario-selector">
            <button
              id="btn-scenario-showcase"
              className={`scenario-btn ${selectedScenario === 'showcase' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('showcase')}
              disabled={loading}
              title="Controlled Single-Section A-B Benchmark (07:45-12:15, 7 Candidate Blocks, 10 Tasks) demonstrating exact algorithmic divergence"
            >
              PBL Showcase Benchmark (A–B)
            </button>
            <button
              id="btn-scenario-default"
              className={`scenario-btn ${selectedScenario === 'default' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('default')}
              disabled={loading}
              title="Official 20-Task PBL Baseline with hard corridor physical ceilings"
            >
              Actual Dataset (20 Tasks)
            </button>
            <button
              id="btn-scenario-contested"
              className={`scenario-btn ${selectedScenario === 'contested' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('contested')}
              disabled={loading}
              title="Multi-corridor competition benchmark proving DP superiority over Greedy and FCFS"
            >
              Contested Stress Test
            </button>
          </div>

          <button
            id="btn-run-comparison"
            className="btn btn-primary"
            onClick={() => onRunComparison && onRunComparison(selectedScenario)}
            disabled={loading}
            style={{ minWidth: '190px' }}
          >
            {loading ? 'BENCHMARKING...' : 'RE-RUN BENCHMARK'}
          </button>
        </div>
      </div>

      {/* Snapshot Information & Scenario Metadata Banner */}
      <div
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '10px 16px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: 'var(--c-text-secondary)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span>
            SCENARIO: <strong style={{ color: 'var(--c-text-primary)' }}>{scenarioName}</strong>
          </span>
          <span>
            OPERATIONAL DATE: <strong style={{ color: 'var(--c-text-primary)' }}>{opDate}</strong>
          </span>
          <span>
            TASKS SNAPSHOT: <strong style={{ color: 'var(--c-text-primary)' }}>{comparisonData?.total_input_tasks || 20} Tasks</strong>
          </span>
          <span>
            CORRIDORS: <strong style={{ color: 'var(--c-text-primary)' }}>{comparisonData?.total_available_corridors || 7} Windows</strong>
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-text-muted)' }}>
          BENCHMARK TIMESTAMP: <span style={{ color: 'var(--c-text-primary)', fontWeight: '600' }}>{execTime}</span>
        </div>
      </div>

      {/* SECTION A: Benchmark Overview (Compact KPI Strip) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div className="kpi-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            1. Tasks Scheduled
          </div>
          <div className="kpi-number" style={{ fontSize: '22px', color: '#24613B', marginTop: '2px' }}>
            {activeResult?.metrics?.tasks_scheduled ?? '-'}
            <span style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', fontWeight: '500', marginLeft: '4px' }}>
              / {comparisonData?.total_input_tasks ?? '-'} {activeResult?.metrics?.tasks_scheduled != null && comparisonData?.total_input_tasks ? `(${Math.round((activeResult.metrics.tasks_scheduled / comparisonData.total_input_tasks) * 100)}%)` : ''}
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
            Assigned to clear blocks
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            2. Tasks Unscheduled
          </div>
          <div className="kpi-number" style={{ fontSize: '22px', color: '#B45309', marginTop: '2px' }}>
            {activeResult?.metrics?.tasks_unscheduled ?? '-'}
            <span style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', fontWeight: '500', marginLeft: '4px' }}>
              / {comparisonData?.total_input_tasks ?? '-'}
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
            Operational conflicts diagnosed
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            3. Blocks Generated
          </div>
          <div className="kpi-number" style={{ fontSize: '22px', color: 'var(--c-text-primary)', marginTop: '2px' }}>
            {activeResult?.metrics?.blocks_generated ?? '-'}
            <span style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', fontWeight: '500', marginLeft: '4px' }}>
              / {comparisonData?.total_available_corridors ?? '-'} corridors
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
            Active physical possessions
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            4. Block Utilization
          </div>
          <div className="kpi-number" style={{ fontSize: '22px', color: '#2563EB', marginTop: '2px' }}>
            {activeResult?.metrics?.active_block_utilization_pct ?? 0}%
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
            {activeResult?.metrics?.total_occupied_duration ?? 0}h active / scheduled capacity
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            5. Clubbing
          </div>
          <div className="kpi-number" style={{ fontSize: '22px', color: '#0D9488', marginTop: '2px' }}>
            {activeResult?.metrics?.clubbed_tasks ?? 0}
            <span style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', fontWeight: '500', marginLeft: '4px' }}>
              tasks · {activeResult?.metrics?.cross_department_blocks ?? 0} blocks
            </span>
          </div>
          <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
            Multi-department co-location
          </div>
        </div>
      </div>

      {/* SECTION B: Algorithm Comparison Matrix */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section B: Empirical Comparison Matrix (The 5 Primary Metrics)</div>
          <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', textTransform: 'uppercase' }}>
            Strict Snapshot Isolation · Real Algorithm Execution
          </span>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Primary Metric</th>
                <th style={{ width: '18%' }}>1. FCFS (Queue Arrival Order)</th>
                <th style={{ width: '20%' }}>2. Greedy (Earliest Start Time)</th>
                <th style={{ width: '20%' }}>3. Dynamic Programming (WIS)</th>
                <th style={{ width: '22%' }}>Mathematical Definition & Operational Meaning</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData?.comparison_table?.map((row) => {
                const isUtil = row.metric === 'Block Utilization';
                const fcfsHours = comparisonData?.fcfs?.metrics?.total_occupied_duration || 0;
                const greedyHours = comparisonData?.greedy?.metrics?.total_occupied_duration || 0;
                const dpHours = comparisonData?.dp?.metrics?.total_occupied_duration || 0;

                const fcfsTasks = comparisonData?.fcfs?.metrics?.tasks_scheduled || 0;
                const greedyTasks = comparisonData?.greedy?.metrics?.tasks_scheduled || 0;
                const dpTasks = comparisonData?.dp?.metrics?.tasks_scheduled || 0;

                const fcfsProd = (fcfsTasks / Math.max(0.1, fcfsHours)).toFixed(2);
                const greedyProd = (greedyTasks / Math.max(0.1, greedyHours)).toFixed(2);
                const dpProd = (dpTasks / Math.max(0.1, dpHours)).toFixed(2);

                return (
                  <tr key={row.metric}>
                    <td style={{ fontWeight: '700', color: 'var(--c-text-primary)' }}>
                      {row.metric}
                    </td>

                    {/* FCFS Cell */}
                    <td className="cell-mono" style={{ fontWeight: '600' }}>
                      <div>{row.fcfs}</div>
                      {isUtil && (
                        <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '3px' }}>
                          {fcfsHours}h occupied · {fcfsProd} tasks/h
                        </div>
                      )}
                    </td>

                    {/* Greedy Cell */}
                    <td className="cell-mono" style={{ fontWeight: '600' }}>
                      <div>{row.greedy}</div>
                      {isUtil && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              background: '#FEF3C7',
                              color: '#92400E',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              display: 'inline-block',
                            }}
                          >
                            ⚠️ {greedyHours}h Closed · {greedyProd} tasks/h (Track Hoarding)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* DP Cell */}
                    <td
                      className="cell-mono"
                      style={{
                        fontWeight: '700',
                        color: '#065F46',
                        backgroundColor: '#F0FDF4',
                      }}
                    >
                      <div>{row.dp}</div>
                      {isUtil && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              background: '#DCFCE7',
                              color: '#15803D',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                              display: 'inline-block',
                            }}
                          >
                            ✓ {dpHours}h Active · {dpProd} tasks/h (Optimal Efficiency)
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Description Cell */}
                    <td style={{ color: 'var(--c-text-secondary)', fontSize: '11.5px', whiteSpace: 'normal', lineHeight: 1.45 }}>
                      {isUtil ? (
                        <span>
                          <strong>Corridor Possession Ratio:</strong> Ratio of track possession time occupied. Note that 100% in Greedy represents line hoarding (locking track for {greedyHours}h for only {greedyTasks} tasks). DP's {row.dp} accomplishes {dpTasks} tasks in {dpHours}h ({dpProd} tasks/h), leaving track open for train traffic.
                        </span>
                      ) : (
                        row.description
                      )}
                    </td>
                  </tr>
                );
              })}

              {/* AUXILIARY ROW: WORK PRODUCTIVITY (TASKS PER HOUR OF TRACK CLOSURE) */}
              {(() => {
                const fcfsHours = comparisonData?.fcfs?.metrics?.total_occupied_duration || 1;
                const greedyHours = comparisonData?.greedy?.metrics?.total_occupied_duration || 1;
                const dpHours = comparisonData?.dp?.metrics?.total_occupied_duration || 1;

                const fcfsTasks = comparisonData?.fcfs?.metrics?.tasks_scheduled || 0;
                const greedyTasks = comparisonData?.greedy?.metrics?.tasks_scheduled || 0;
                const dpTasks = comparisonData?.dp?.metrics?.tasks_scheduled || 0;

                const fcfsProd = (fcfsTasks / Math.max(0.1, fcfsHours)).toFixed(2);
                const greedyProd = (greedyTasks / Math.max(0.1, greedyHours)).toFixed(2);
                const dpProd = (dpTasks / Math.max(0.1, dpHours)).toFixed(2);

                return (
                  <tr style={{ background: '#FAF5FF', borderTop: '2px solid #E9D5FF' }}>
                    <td style={{ fontWeight: '800', color: '#6B21A8' }}>
                      ⚡ Work Productivity (Throughput Density)
                    </td>
                    <td className="cell-mono" style={{ fontWeight: '700', color: '#4B5563' }}>
                      {fcfsProd} tasks / hr
                    </td>
                    <td className="cell-mono" style={{ fontWeight: '700', color: '#92400E' }}>
                      {greedyProd} tasks / hr
                    </td>
                    <td className="cell-mono" style={{ fontWeight: '800', color: '#15803D', background: '#DCFCE7' }}>
                      ★ {dpProd} tasks / hr
                    </td>
                    <td style={{ color: '#6B21A8', fontSize: '11.5px', fontWeight: '500' }}>
                      Unique maintenance activities completed per hour of physical track possession. <strong>DP achieves {(Number(dpProd) / Math.max(0.1, Number(greedyProd))).toFixed(1)}× higher efficiency</strong> than Greedy!
                    </td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Operational Reality Infobox: Why 66.7% DP Beats 100% Greedy */}
        <div
          style={{
            margin: '14px 16px',
            padding: '14px 18px',
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>💡</span>
            <strong style={{ fontSize: '13px', color: '#166534' }}>
              Operational Interpretation: Why DP's 66.7% Utilization Outperforms Greedy's 100.0%
            </strong>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#14532D', lineHeight: 1.55 }}>
            In railway track operations, <strong>100% block possession is NOT always desirable</strong>. Greedy achieved 100% utilization simply by locking the physical track for 4.5 continuous hours for a single block with only 2 tasks, shutting down traffic and stranding 8 tasks (<strong>0.44 tasks/hr</strong>). Dynamic Programming achieved <strong>6 tasks scheduled (300% higher throughput)</strong> with <strong>2.00 tasks/hr productivity</strong>, while intentionally leaving 1.5 hours of track time open as commercial train transit slots.
          </p>
        </div>

        {/* Dataset Explanation Callout */}
        <div
          style={{
            margin: '14px 16px',
            padding: '12px 14px',
            background: 'var(--c-surface-alt)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--radius-xs)',
            fontSize: '11.5px',
            color: 'var(--c-text-secondary)',
            lineHeight: 1.5,
          }}
        >
          {selectedScenario === 'showcase' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ color: '#065F46', fontSize: '12.5px' }}>
                  ★ Controlled Showcase Scenario: Section A–B Corridor (07:45–12:15, 270 Min Window, 7 Candidate Blocks, 10 Tasks)
                </strong>
                <span className="badge-tag" style={{ background: '#ECFDF5', color: '#065F46', fontWeight: '700' }}>
                  DETERMINISTIC EMPIRICAL PROOF
                </span>
              </div>
              <div>
                Seven candidate maintenance blocks (<code>BLK-A</code> through <code>BLK-G</code>) compete for the same physical track corridor on Section A–B. Ten unique tasks across Engineering, S&T, and Traction are requested. Submission arrival order: <code>B → C → A → D → E → F → G</code>.
              </div>
              <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontWeight: '700', color: '#1E293B', marginBottom: '4px' }}>
                    1. FCFS: 2 Sched / 2 Blocks (61.1% Util)
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                    Evaluates arrival order: accepts <code>BLK-B</code> (08:30–09:45) and <code>BLK-C</code> (10:00–11:30). These two blocks create track occupancy deadlocks that overlap and reject all other 5 candidates.
                  </div>
                </div>
                <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                  <div style={{ fontWeight: '700', color: '#B45309', marginBottom: '4px' }}>
                    2. Greedy: 2 Sched / 1 Block (100.0% Util)
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.4 }}>
                    Sorts by earliest start: <code>BLK-A</code> starts earliest at 07:45 and spans the entire 270 min (12:15). Greedily locks Section A–B for all 4.5h, rejecting all remaining 6 candidates despite their higher collective task count.
                  </div>
                </div>
                <div style={{ background: '#F0FDF4', padding: '10px 12px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                  <div style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>
                    3. DP: 6 Sched / 4 Blocks (66.7% Util) 🏆
                  </div>
                  <div style={{ fontSize: '11px', color: '#166534', lineHeight: 1.4 }}>
                    Solves Bellman recurrence: selects 4 non-overlapping intervals (<code>BLK-D</code>, <code>BLK-E</code>, <code>BLK-F</code>, <code>BLK-G</code>). Yields <strong>6 tasks scheduled (+200% over Greedy/FCFS)</strong> with 3 clubbed tasks!
                  </div>
                </div>
              </div>
            </>
          ) : selectedScenario === 'default' ? (
            <>
              <strong style={{ color: 'var(--c-text-primary)' }}>Why do all three algorithms yield 13 scheduled tasks / 3 blocks on the default dataset?</strong>
              <br />
              In this operational snapshot, 4 of the 7 authorized corridors (<code>BLK-102</code>, <code>BLK-103</code>, <code>BLK-105</code>, <code>BLK-107</code>) have hard train collisions with Rajdhani, Vande Bharat, Sanghamitra, and Freight trains. Track 4 has zero authorized windows. Exactly 13 tasks request the remaining 3 clear corridors (<code>BLK-101</code> on Track 1, <code>BLK-104</code> on Track 2, <code>BLK-106</code> on Track 3), and all 13 fit within those windows. Consequently, all three algorithms reach the physical problem ceiling for this dataset.
              <br />
              <span style={{ color: 'var(--c-text-primary)', fontWeight: '600' }}>
                👉 Tip: Switch to the "PBL Showcase Benchmark (A–B)" button above to observe controlled single-corridor algorithmic divergence!
              </span>
            </>
          ) : (
            <>
              <strong style={{ color: '#92400E' }}>Contested Stress Benchmark Divergence Analysis:</strong>
              <br />
              Under corridor contention (overlapping windows on the same physical track), <strong>Greedy suffers from local short-sightedness</strong>: it commits early narrow corridors (e.g. BLK-C101, BLK-C103) that block high-capacity multi-department windows, scheduling only {comparisonData?.greedy?.metrics?.tasks_scheduled ?? 5} tasks.
              In contrast, <strong>Dynamic Programming solves the Bellman recurrence W(i) + DP[p(i)]</strong> across all candidate intervals, successfully scheduling {comparisonData?.dp?.metrics?.tasks_scheduled ?? 11} tasks with {comparisonData?.dp?.metrics?.clubbed_tasks ?? 9} clubbed tasks!
            </>
          )}
        </div>

        {/* GREEDY vs DP HEAD-TO-HEAD ARCHITECTURAL CONTRAST */}
        <div
          style={{
            margin: '0 16px 16px 16px',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--radius-xs)',
            background: 'var(--c-surface)',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-primary)' }}>
              Head-to-Head Deep Dive: Greedy vs Dynamic Programming (WIS)
            </div>
            <span
              className="badge-tag"
              style={{ background: '#EFF6FF', color: '#1E40AF', fontWeight: '700', fontSize: '11px' }}
            >
              ALGORITHMIC DIVERGENCE ROOT CAUSE
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginBottom: '14px',
            }}
          >
            {/* Greedy Column */}
            <div
              style={{
                border: '1px solid #CBD5E1',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: '#F8FAFC',
                borderLeft: '4px solid #475569',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '13px' }}>
                  Greedy Approach (Earliest-Start)
                </span>
                <span className="cell-mono" style={{ fontSize: '11px', color: '#B45309', fontWeight: '700' }}>
                  {comparisonData?.greedy?.metrics?.tasks_scheduled ?? 2} Sched / {comparisonData?.greedy?.metrics?.tasks_unscheduled ?? 8} Dropped
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#334155', lineHeight: 1.6 }}>
                <li>
                  <strong>Decision Rule:</strong> Locally sorts tasks by earliest start time using Merge Sort O(N log N) and assigns to the first available fitting window.
                </li>
                {selectedScenario === 'showcase' ? (
                  <>
                    <li>
                      <strong>Action on Section A–B:</strong> Commits massive block <code>BLK-A</code> (07:45–12:15, 270m) because its start time 07:45 is the earliest of all candidates.
                    </li>
                    <li>
                      <strong>Fatal Flaw (Local Monopolization):</strong> Locking Section A–B for all 4.5 hours leaves zero window for candidate blocks B, C, D, E, F, G!
                    </li>
                    <li>
                      <strong>Downstream Impact:</strong> Eight tasks (80% of requests) are <strong>REJECTED</strong>. The high utilization (100%) hides severe operational under-servicing.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Action on Track 1:</strong> Commits early narrow corridor <code>BLK-C101</code> (08:00–10:00) for single task <code>TS-01</code>.
                    </li>
                    <li>
                      <strong>Fatal Flaw (Local Short-Sightedness):</strong> Locking Track 1 until 10:00 makes <code>BLK-C102</code> (09:30–13:30) physically unfeasible due to track possession overlap!
                    </li>
                    <li>
                      <strong>Downstream Impact:</strong> Tasks <code>TS-02</code>, <code>TS-03</code>, and <code>TS-04</code> are <strong>REJECTED</strong>. High-capacity 3-department clubbing is permanently lost.
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* DP Column */}
            <div
              style={{
                border: '1px solid #86EFAC',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: '#F0FDF4',
                borderLeft: '4px solid #16A34A',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: '700', color: '#14532D', fontSize: '13px' }}>
                  Dynamic Programming (WIS)
                </span>
                <span className="cell-mono" style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
                  {comparisonData?.dp?.metrics?.tasks_scheduled ?? 6} Sched / {comparisonData?.dp?.metrics?.tasks_unscheduled ?? 4} Dropped (+200%)
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#166534', lineHeight: 1.6 }}>
                <li>
                  <strong>Decision Rule:</strong> Evaluates all candidate block combinations using Bellman recurrence: <code>DP[i] = max(DP[i-1], W(i) + DP[p(i)])</code>.
                </li>
                {selectedScenario === 'showcase' ? (
                  <>
                    <li>
                      <strong>Action on Section A–B:</strong> Sorts by finish time and evaluates all non-overlapping chains. Identifies that selecting <code>BLK-D</code> (3 tasks), <code>BLK-E</code> (1 task), <code>BLK-F</code> (1 task), and <code>BLK-G</code> (1 task) yields Weight = 6.
                    </li>
                    <li>
                      <strong>Optimal Substructure:</strong> Discards monopolistic <code>BLK-A</code> (Weight = 2) in favor of the 4 synchronized 45-minute possessions.
                    </li>
                    <li>
                      <strong>Synergy Multiplier:</strong> Schedules 6 total tasks (including 3-department clubbing in BLK-D), delivering 3× the maintenance throughput of Greedy!
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong>Action on Track 1:</strong> Compares Candidate 1 (W = 1.5) vs Candidate 2 (W = 6.0 + 3.0 = 9.0). Selects Candidate 2!
                    </li>
                    <li>
                      <strong>Optimal Substructure:</strong> Recognizes that sacrificing early single-task <code>TS-01</code> allows opening high-capacity <code>BLK-C102</code> (09:30–13:30).
                    </li>
                    <li>
                      <strong>Synergy Multiplier:</strong> Simultaneously clubs <code>TS-02</code> (Eng), <code>TS-03</code> (S&T), and <code>TS-04</code> (Traction) in one track possession.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Quick Summary Pill Row */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              fontSize: '11.5px',
              padding: '10px 14px',
              background: 'var(--c-surface-alt)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--c-border-light)',
            }}
          >
            <span>⚡ <strong>Tasks Scheduled:</strong> Greedy: {comparisonData?.greedy?.metrics?.tasks_scheduled ?? '-'} vs DP: {comparisonData?.dp?.metrics?.tasks_scheduled ?? '-'} (<strong style={{ color: '#16A34A' }}>+{(comparisonData?.dp?.metrics?.tasks_scheduled && comparisonData?.greedy?.metrics?.tasks_scheduled) ? Math.round(((comparisonData.dp.metrics.tasks_scheduled - comparisonData.greedy.metrics.tasks_scheduled) / comparisonData.greedy.metrics.tasks_scheduled) * 100) : 0}% Gain</strong>)</span>
            <span>⚡ <strong>Blocks Generated:</strong> Greedy: {comparisonData?.greedy?.metrics?.blocks_generated ?? '-'} vs DP: {comparisonData?.dp?.metrics?.blocks_generated ?? '-'}</span>
            <span>⚡ <strong>Active Utilization:</strong> Greedy: {comparisonData?.greedy?.metrics?.active_block_utilization_pct ?? 0}% vs DP: {comparisonData?.dp?.metrics?.active_block_utilization_pct ?? 0}%</span>
            <span>⚡ <strong>Clubbed Tasks:</strong> Greedy: {comparisonData?.greedy?.metrics?.clubbed_tasks ?? 0} vs DP: {comparisonData?.dp?.metrics?.clubbed_tasks ?? 0}</span>
            <span>⚡ <strong>Optimality Guarantee:</strong> Greedy = Local Heuristic | DP = Globally Optimal (WIS)</span>
          </div>
        </div>
      </div>

      {/* SECTION C: Visual Comparison */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section C: Visual Metric Comparison</div>
          <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
            Consistent Units & Scales (FCFS vs Greedy vs DP)
          </span>
        </div>

        <div className="panel-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}
          >
            {/* Chart 1: Tasks Scheduled vs Unscheduled */}
            <div
              style={{
                border: '1px solid var(--c-border-light)',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: 'var(--c-surface-alt)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                1. Tasks Scheduled vs Unscheduled
              </div>

              {['fcfs', 'greedy', 'dp'].map((algoKey) => {
                const item = comparisonData?.[algoKey];
                const sched = item?.metrics?.tasks_scheduled ?? 0;
                const unsched = item?.metrics?.tasks_unscheduled ?? 0;
                const total = sched + unsched || 1;
                const pct = Math.round((sched / total) * 100);
                const name = algoKey === 'fcfs' ? 'FCFS' : algoKey === 'greedy' ? 'Greedy' : 'DP (WIS)';

                return (
                  <div key={algoKey} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                      <span className="cell-mono">
                        {sched} sched ({pct}%) · {unsched} unsched
                      </span>
                    </div>
                    <div style={{ display: 'flex', height: '14px', borderRadius: '2px', overflow: 'hidden', background: '#E2E8F0' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          background: algoKey === 'dp' ? '#24613B' : '#374151',
                          transition: 'width 0.4s ease',
                        }}
                        title={`Scheduled: ${sched}`}
                      />
                      <div
                        style={{
                          width: `${100 - pct}%`,
                          background: '#8C959F',
                          transition: 'width 0.4s ease',
                        }}
                        title={`Unscheduled: ${unsched}`}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ display: 'flex', gap: '14px', fontSize: '10.5px', color: 'var(--c-text-secondary)', marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#24613B', display: 'inline-block' }} />
                  Scheduled
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', background: '#8C959F', display: 'inline-block' }} />
                  Unscheduled
                </span>
              </div>
            </div>

            {/* Chart 2: Blocks Generated */}
            <div
              style={{
                border: '1px solid var(--c-border-light)',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: 'var(--c-surface-alt)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                2. Blocks Generated (Corridors Possessed)
              </div>

              {['fcfs', 'greedy', 'dp'].map((algoKey) => {
                const item = comparisonData?.[algoKey];
                const blocks = item?.metrics?.blocks_generated ?? 0;
                const totalAvail = comparisonData?.total_available_corridors || 7;
                const pct = Math.round((blocks / totalAvail) * 100);
                const name = algoKey === 'fcfs' ? 'FCFS' : algoKey === 'greedy' ? 'Greedy' : 'DP (WIS)';

                return (
                  <div key={algoKey} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                      <span className="cell-mono">
                        {blocks} blocks of {totalAvail} corridors ({pct}%)
                      </span>
                    </div>
                    <div style={{ height: '14px', borderRadius: '2px', background: '#E2E8F0', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          background: algoKey === 'dp' ? '#1D4ED8' : '#21262D',
                          height: '100%',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ fontSize: '10.5px', color: 'var(--c-text-secondary)', marginTop: '8px' }}>
                Distinct track possessions opened without collision.
              </div>
            </div>

            {/* Chart 3: Block Utilization (%) */}
            <div
              style={{
                border: '1px solid var(--c-border-light)',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: 'var(--c-surface-alt)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                3. Active Block Utilization (%)
              </div>

              {['fcfs', 'greedy', 'dp'].map((algoKey) => {
                const item = comparisonData?.[algoKey];
                const activeUtil = item?.metrics?.active_block_utilization_pct ?? 0;
                const occupied = item?.metrics?.total_occupied_duration ?? 0;
                const name = algoKey === 'fcfs' ? 'FCFS' : algoKey === 'greedy' ? 'Greedy' : 'DP (WIS)';

                return (
                  <div key={algoKey} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                      <span className="cell-mono">
                        {activeUtil}% ({occupied}h occupied)
                      </span>
                    </div>
                    <div style={{ height: '14px', borderRadius: '2px', background: '#E2E8F0', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, activeUtil)}%`,
                          background: '#2563EB',
                          height: '100%',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ fontSize: '10.5px', color: 'var(--c-text-secondary)', marginTop: '8px' }}>
                Total occupied duration / Total scheduled window capacity.
              </div>
            </div>

            {/* Chart 4: Clubbing Effectiveness */}
            <div
              style={{
                border: '1px solid var(--c-border-light)',
                borderRadius: 'var(--radius-xs)',
                padding: '14px',
                background: 'var(--c-surface-alt)',
              }}
            >
              <div style={{ fontSize: '11.5px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '10px' }}>
                4. Clubbing Effectiveness (Tasks & Blocks)
              </div>

              {['fcfs', 'greedy', 'dp'].map((algoKey) => {
                const item = comparisonData?.[algoKey];
                const clubbed = item?.metrics?.clubbed_tasks ?? 0;
                const sched = item?.metrics?.tasks_scheduled ?? 0;
                const crossDepts = item?.metrics?.cross_department_blocks ?? 0;
                const pct = sched > 0 ? Math.round((clubbed / sched) * 100) : 0;
                const name = algoKey === 'fcfs' ? 'FCFS' : algoKey === 'greedy' ? 'Greedy' : 'DP (WIS)';

                return (
                  <div key={algoKey} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: '600' }}>{name}</span>
                      <span className="cell-mono">
                        {clubbed} Tasks ({pct}%) · {crossDepts} Cross-Dept
                      </span>
                    </div>
                    <div style={{ height: '14px', borderRadius: '2px', background: '#E2E8F0', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          background: '#0D9488',
                          height: '100%',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={{ fontSize: '10.5px', color: 'var(--c-text-secondary)', marginTop: '8px' }}>
                Tasks co-located in multi-task blocks across departments.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION D: Algorithm Decision Explanation (Step-by-Step Presentation Trace) */}
      <div className="ops-panel anim-slide-in">
        <div className="panel-header">
          <div>
            <div className="panel-title">Section D: Algorithm Decision Explanation (Step-by-Step Audit)</div>
            <div style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Traces why each algorithm accepted, clubbed, scheduled, or rejected tasks/intervals under physical railway constraints
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              id="btn-trace-fcfs"
              className={`btn-seg ${decisionTab === 'fcfs' ? 'active' : ''}`}
              onClick={() => setDecisionTab('fcfs')}
            >
              FCFS Arrival Queue ({comparisonData?.fcfs?.decision_steps?.length || 0} steps)
            </button>
            <button
              id="btn-trace-greedy"
              className={`btn-seg ${decisionTab === 'greedy' ? 'active' : ''}`}
              onClick={() => setDecisionTab('greedy')}
            >
              Greedy Earliest-Start ({comparisonData?.greedy?.decision_steps?.length || 0} steps)
            </button>
            <button
              id="btn-trace-dp"
              className={`btn-seg ${decisionTab === 'dp' ? 'active' : ''}`}
              onClick={() => setDecisionTab('dp')}
            >
              DP Recurrence & Backtrack ({comparisonData?.dp?.decision_steps?.length || 0} steps)
            </button>
          </div>
        </div>

        <div className="panel-body">
          {/* Decision Mechanism Header Note */}
          <div
            style={{
              padding: '10px 14px',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border-light)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '14px',
              fontSize: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong style={{ color: 'var(--c-text-primary)' }}>
                {decisionTab === 'fcfs'
                  ? 'FIFO Queue Ordering Rule:'
                  : decisionTab === 'greedy'
                  ? 'Earliest Start Time Greedy Rule:'
                  : 'Weighted Interval Scheduling Recurrence & Backtracking:'}
              </strong>{' '}
              <span style={{ color: 'var(--c-text-secondary)' }}>
                {decisionTab === 'fcfs'
                  ? 'Evaluates requests sequentially in customer submission order. Assigns to earliest compatible active block or opens earliest unconflicted corridor.'
                  : decisionTab === 'greedy'
                  ? 'Sorts all tasks by earliest start time using Merge Sort O(N log N). Progressively clubs into active blocks before opening new corridors.'
                  : 'Generates candidate blocks with clubbed tasks, evaluates predecessor p(i), solves DP[i] = max(DP[i-1], W(i)+DP[p(i)]), and reconstructs optimal schedule via backtracking.'}
              </span>
            </div>
            <span className="cell-mono" style={{ fontSize: '11px', color: 'var(--c-text-secondary)', flexShrink: 0, marginLeft: '12px' }}>
              LATENCY: {decisionResult?.execution_time_ms} ms
            </span>
          </div>

          {/* Decision Steps Table */}
          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Step #</th>
                  <th style={{ width: '110px' }}>Entity ID</th>
                  <th style={{ width: '180px' }}>Decision Key / Interval</th>
                  <th style={{ width: '160px' }}>Algorithmic Action</th>
                  <th style={{ width: '110px' }}>Block Target</th>
                  <th style={{ width: '220px' }}>State / Recurrence Detail</th>
                  <th>Operational Rationale & Constraint Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {decisionSteps.map((step) => {
                  let badgeClass = 'decision-badge-alloc';
                  if (step.action.includes('CLUBBED') || step.action.includes('ASSIGNED')) {
                    badgeClass = 'decision-badge-club';
                  } else if (step.action.includes('REJECTED')) {
                    badgeClass = 'decision-badge-reject';
                  } else if (step.action.includes('DP') || step.action.includes('OPTIMAL')) {
                    badgeClass = 'decision-badge-dp';
                  }

                  return (
                    <tr key={step.step_number}>
                      <td className="cell-mono" style={{ fontWeight: '700', color: 'var(--c-text-secondary)' }}>
                        #{step.step_number}
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '700', color: 'var(--c-text-primary)' }}>
                        {step.entity_id}
                      </td>
                      <td className="cell-mono" style={{ fontSize: '11px' }}>
                        {step.key_attribute}
                      </td>
                      <td>
                        <span className={`decision-badge ${badgeClass}`}>
                          {step.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>
                        {step.block_id || '—'}
                      </td>
                      <td className="cell-mono" style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
                        {step.state_detail || '—'}
                      </td>
                      <td style={{ fontSize: '11.5px', color: 'var(--c-text-primary)', whiteSpace: 'normal' }}>
                        {step.rationale}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION E: Before vs After Scheduling (Request Consolidation Impact) */}
      <div className="ops-panel anim-slide-in">
        <div className="panel-header">
          <div>
            <div className="panel-title">Section E: Before vs After Scheduling (Request Consolidation Impact)</div>
            <div style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Contrasts unconsolidated departmental requests against consolidated maintenance blocks generated by the algorithm
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              id="btn-ba-fcfs"
              className={`btn-seg ${beforeAfterAlgo === 'fcfs' ? 'active' : ''}`}
              onClick={() => setBeforeAfterAlgo('fcfs')}
            >
              FCFS Consolidation ({comparisonData?.fcfs?.metrics?.blocks_generated ?? 0} blocks)
            </button>
            <button
              id="btn-ba-greedy"
              className={`btn-seg ${beforeAfterAlgo === 'greedy' ? 'active' : ''}`}
              onClick={() => setBeforeAfterAlgo('greedy')}
            >
              Greedy Consolidation ({comparisonData?.greedy?.metrics?.blocks_generated ?? 0} blocks)
            </button>
            <button
              id="btn-ba-dp"
              className={`btn-seg ${beforeAfterAlgo === 'dp' ? 'active' : ''}`}
              onClick={() => setBeforeAfterAlgo('dp')}
            >
              DP (WIS) Consolidation ({comparisonData?.dp?.metrics?.blocks_generated ?? 0} blocks)
            </button>
          </div>
        </div>

        <div className="panel-body">
          {/* Consolidation Impact KPI Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <div style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '10px 14px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
                Unconsolidated Track Time Requested
              </div>
              <div className="cell-mono" style={{ fontSize: '20px', fontWeight: '700', color: '#B45309', marginTop: '3px' }}>
                {totalRawHours.toFixed(1)} hrs
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
                {baInputTasks.length} separate isolated requests
              </div>
            </div>

            <div style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '10px 14px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
                Consolidated Track Windows Opened
              </div>
              <div className="cell-mono" style={{ fontSize: '20px', fontWeight: '700', color: '#2563EB', marginTop: '3px' }}>
                {totalPossessionHours.toFixed(1)} hrs
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
                {baBlocks.length} synchronized physical possessions
              </div>
            </div>

            <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--radius-xs)', padding: '10px 14px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#166534', fontWeight: '600' }}>
                Net Possession Time Saved
              </div>
              <div className="cell-mono" style={{ fontSize: '20px', fontWeight: '700', color: '#16A34A', marginTop: '3px' }}>
                {netHoursSaved.toFixed(1)} hrs ({consolidationSavingsPct}%)
              </div>
              <div style={{ fontSize: '10.5px', color: '#15803D', marginTop: '2px' }}>
                Downtime saved by multi-department clubbing
              </div>
            </div>

            <div style={{ background: 'var(--c-surface-alt)', border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '10px 14px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
                Simultaneous Clubbed Tasks
              </div>
              <div className="cell-mono" style={{ fontSize: '20px', fontWeight: '700', color: '#0D9488', marginTop: '3px' }}>
                {baResult?.metrics?.clubbed_tasks ?? 0} tasks
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '2px' }}>
                In {baResult?.metrics?.cross_department_blocks ?? 0} cross-department block(s)
              </div>
            </div>
          </div>

          {/* Side-by-Side Before vs After Layout */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {/* BEFORE: Raw Unconsolidated Departmental Requests */}
            <div style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--c-border-light)', paddingBottom: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', color: '#B45309' }}>
                  BEFORE: Unconsolidated Requests ({baInputTasks.length})
                </div>
                <span className="badge-tag" style={{ background: '#FEF3C7', color: '#92400E', fontWeight: '700', fontSize: '10.5px' }}>
                  DISJOINT POSSESSIONS
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--c-text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Individual requests submitted independently by Engineering, S&T, and Traction departments. Without clubbing, each requires a dedicated line block, multiplying track closure hours.
              </p>

              <div className="ops-table-container" style={{ maxHeight: '380px', overflowY: 'auto' }}>
                <table className="ops-table" style={{ fontSize: '11px' }}>
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Dept</th>
                      <th>Window</th>
                      <th>Dur</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {baInputTasks.map((t) => (
                      <tr key={t.task_id}>
                        <td className="cell-mono" style={{ fontWeight: '700' }}>{t.task_id}</td>
                        <td><DeptBadge department={t.department} /></td>
                        <td className="cell-mono" style={{ fontSize: '10.5px' }}>{t.earliest_start}–{t.latest_end}</td>
                        <td className="cell-mono">{t.duration}h</td>
                        <td>
                          {t.isScheduled ? (
                            <span className="decision-badge decision-badge-club" style={{ fontSize: '10px' }}>
                              In {t.assignedBlock}
                            </span>
                          ) : (
                            <span className="decision-badge decision-badge-reject" style={{ fontSize: '10px' }}>
                              Unscheduled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AFTER: Consolidated Maintenance Blocks Schedule */}
            <div style={{ border: '1px solid var(--c-border)', borderRadius: 'var(--radius-xs)', background: '#FFFFFF', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid var(--c-border-light)', paddingBottom: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', color: '#166534' }}>
                  AFTER: Consolidated Blocks ({baBlocks.length})
                </div>
                <span className="badge-tag" style={{ background: '#DCFCE7', color: '#166534', fontWeight: '700', fontSize: '10.5px' }}>
                  SYNCHRONIZED POSSESSIONS
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--c-text-secondary)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                Synchronized work windows where concurrent tasks run simultaneously under single safety possession (non-additive duration rule).
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                {baBlocks.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--c-text-muted)', fontSize: '12px' }}>
                    No blocks generated by this algorithm.
                  </div>
                ) : (
                  baBlocks.map((blk) => {
                    const taskDurSum = blk.tasks.reduce((sum, t) => sum + t.duration, 0);
                    const savedInBlock = Math.max(0, taskDurSum - blk.block_duration);
                    return (
                      <div
                        key={blk.block_id}
                        style={{
                          border: '1px solid var(--c-border-light)',
                          borderRadius: '4px',
                          padding: '10px 12px',
                          background: 'var(--c-surface-alt)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span className="cell-mono" style={{ fontWeight: '700', color: 'var(--c-text-primary)' }}>
                            {blk.block_id} ({blk.track || 'Track 1'})
                          </span>
                          <span className="cell-mono" style={{ fontSize: '11px', fontWeight: '600', color: '#1D4ED8' }}>
                            {blk.start_time} – {blk.end_time} ({blk.block_duration}h possession)
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                          {blk.departments.map((dept) => (
                            <DeptBadge key={dept} department={dept} />
                          ))}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--c-text-primary)', marginBottom: '4px' }}>
                          <strong>Clubbed Tasks ({blk.tasks.length}):</strong>{' '}
                          {blk.tasks.map((t) => `${t.task_id} (${t.duration}h)`).join(', ')}
                        </div>

                        {blk.tasks.length > 1 && (
                          <div style={{ fontSize: '10.5px', color: '#166534', background: '#F0FDF4', padding: '3px 6px', borderRadius: '2px', border: '1px solid #BBF7D0' }}>
                            ✓ Concurrent execution saved {savedInBlock.toFixed(2)}h of separate track possession!
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION F: Schedule Inspection & Track Occupancy */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section F: Schedule Inspection & Track Possession Timeline</div>

          {/* Algorithm Selector Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              id="tab-fcfs-inspect"
              className={`btn-seg ${activeTab === 'fcfs' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('fcfs');
                setSelectedBlockId(null);
              }}
            >
              FCFS Schedule ({comparisonData?.fcfs?.metrics?.tasks_scheduled ?? '-'} tasks)
            </button>
            <button
              id="tab-greedy-inspect"
              className={`btn-seg ${activeTab === 'greedy' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('greedy');
                setSelectedBlockId(null);
              }}
            >
              Greedy Schedule ({comparisonData?.greedy?.metrics?.tasks_scheduled ?? '-'} tasks)
            </button>
            <button
              id="tab-dp-inspect"
              className={`btn-seg ${activeTab === 'dp' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dp');
                setSelectedBlockId(null);
              }}
            >
              DP Schedule ({comparisonData?.dp?.metrics?.tasks_scheduled ?? '-'} tasks)
            </button>
          </div>
        </div>

        <div className="panel-body">
          {/* Active Algorithm Profile Card */}
          <div
            style={{
              padding: '12px 16px',
              background: 'var(--c-surface-alt)',
              border: '1px solid var(--c-border-light)',
              borderRadius: 'var(--radius-xs)',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--c-text-primary)' }}>
                {activeResult?.algorithm_name}
              </div>
              <span className="cell-mono" style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
                EXECUTION TIME: {activeResult?.execution_time_ms} ms
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)', marginBottom: '8px' }}>
              {activeResult?.algorithm_description}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--c-text-secondary)' }}>
              {activeResult?.dsa_notes?.map((note, idx) => (
                <span key={idx} style={{ background: '#FFFFFF', padding: '2px 8px', border: '1px solid var(--c-border-light)', borderRadius: '2px' }}>
                  • {note}
                </span>
              ))}
            </div>
          </div>

          {/* Authorized Blocks Table */}
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            Generated Maintenance Blocks ({scheduledBlocks.length}) · Select row to inspect details
          </div>

          <div className="ops-table-container" style={{ marginBottom: '18px' }}>
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Block ID</th>
                  <th>Track</th>
                  <th>Date</th>
                  <th>Window</th>
                  <th>Block Duration</th>
                  <th>Capacity</th>
                  <th>Utilization</th>
                  <th>Departments Involved</th>
                  <th>Tasks Clubbed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scheduledBlocks.map((blk) => {
                  const isSelected = currentBlock?.block_id === blk.block_id;
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
                        {blk.block_duration} hrs (max)
                      </td>
                      <td className="cell-mono">{blk.window_capacity_hours} hrs</td>
                      <td className="cell-mono">{blk.utilization_percentage}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {blk.departments.map((dept) => (
                            <DeptBadge key={dept} department={dept} />
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className="cell-mono" style={{ fontWeight: '700', color: blk.tasks.length > 1 ? '#0D9488' : 'inherit' }}>
                          {blk.tasks.map((t) => t.task_id).join(', ')} ({blk.tasks.length} tasks)
                        </span>
                      </td>
                      <td>
                        <StatusBadge status="Scheduled" label="Scheduled" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Block Inspection Card */}
          {currentBlock && (
            <div
              style={{
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px',
                background: '#FFFFFF',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--c-border-light)', paddingBottom: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>
                  Detailed Task Clubbing Inspection: {currentBlock.block_id} ({currentBlock.track})
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
                    WINDOW: {currentBlock.start_time} – {currentBlock.end_time} ({currentBlock.window_capacity_hours}h)
                  </span>
                  <StatusBadge status="Scheduled" label="Authorized" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '14px', fontSize: '12px' }}>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Simultaneous Duration</span>
                  <div className="cell-mono" style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>
                    {currentBlock.block_duration} hrs
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Capacity Utilization</span>
                  <div className="cell-mono" style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px' }}>
                    {currentBlock.utilization_percentage}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Clubbed Work Items</span>
                  <div className="cell-mono" style={{ fontWeight: '700', fontSize: '14px', marginTop: '2px', color: '#0D9488' }}>
                    {currentBlock.tasks.length} Concurrent Tasks
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>Departments Involved</span>
                  <div style={{ marginTop: '2px', fontWeight: '600' }}>
                    {currentBlock.departments.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Clubbing savings notice */}
              {currentBlock.tasks.length > 1 && (
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    color: '#166534',
                    padding: '8px 12px',
                    borderRadius: '2px',
                    fontSize: '11.5px',
                    marginBottom: '12px',
                  }}
                >
                  ✓ <strong>Multi-Department Clubbing Achieved:</strong> {currentBlock.tasks.length} tasks executing concurrently inside {currentBlock.block_id}. Non-additive duration rule prevented track closure of{' '}
                  {(currentBlock.tasks.reduce((acc, t) => acc + t.duration, 0)).toFixed(1)} hrs down to only {currentBlock.block_duration} hrs (saved{' '}
                  {(currentBlock.tasks.reduce((acc, t) => acc + t.duration, 0) - currentBlock.block_duration).toFixed(1)} hrs of track blockage).
                </div>
              )}

              <div className="ops-table-container">
                <table className="ops-table">
                  <thead>
                    <tr>
                      <th>Task ID</th>
                      <th>Department</th>
                      <th>Track</th>
                      <th>Required Window</th>
                      <th>Duration</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentBlock.tasks.map((t) => (
                      <tr key={t.task_id}>
                        <td className="cell-mono" style={{ fontWeight: '700' }}>{t.task_id}</td>
                        <td><DeptBadge department={t.department} /></td>
                        <td>
                          <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '600' }}>
                            {t.track || currentBlock.track}
                          </span>
                        </td>
                        <td className="cell-mono">{t.earliest_start} – {t.latest_end}</td>
                        <td className="cell-mono" style={{ fontWeight: '600' }}>{t.duration} hrs</td>
                        <td>{t.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline View */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                Track Occupancy & Scheduled Corridors Timeline ({activeResult?.algorithm_name})
              </div>
              <div className="timeline-section-selector">
                {['Track 1', 'Track 2', 'Track 3', 'Track 4'].map((trk) => (
                  <button
                    key={trk}
                    className={`btn-seg ${timelineTrack === trk ? 'active' : ''}`}
                    onClick={() => setTimelineTrack(trk)}
                  >
                    {trk}
                  </button>
                ))}
              </div>
            </div>

            <div className="timeline-wrapper">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '6px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--c-text-secondary)' }}>
                {hourMarkers.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>

              {/* Train movements lane */}
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-secondary)', marginBottom: '4px' }}>
                Train Timetable Movements ({timelineTrack})
              </div>
              <div className="timeline-track-lane">
                {trackTrains.map((tr) => {
                  const pos = getPosition(tr.arrival_time, tr.departure_time);
                  if (!pos) return null;
                  return (
                    <div
                      key={tr.train_id}
                      className="timeline-bar timeline-train"
                      style={pos}
                      title={`${tr.train_name} (${tr.train_id}): ${tr.arrival_time} - ${tr.departure_time}`}
                    >
                      {tr.train_id} ({tr.arrival_time}–{tr.departure_time})
                    </div>
                  );
                })}
              </div>

              {/* Algorithm Scheduled Blocks lane */}
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-secondary)', marginTop: '14px', marginBottom: '4px' }}>
                {activeTab.toUpperCase()} Scheduled Maintenance Blocks ({timelineTrack})
              </div>
              <div className="timeline-track-lane">
                {trackBlocks.map((blk) => {
                  const pos = getPosition(blk.start_time, blk.end_time);
                  if (!pos) return null;
                  return (
                    <div
                      key={blk.block_id}
                      className="timeline-bar timeline-window"
                      style={{
                        ...pos,
                        background: '#24613B',
                        color: '#FFFFFF',
                        border: '1px solid #166534',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedBlockId(blk.block_id)}
                      title={`${blk.block_id}: ${blk.start_time} - ${blk.end_time} (${blk.tasks.length} tasks: ${blk.tasks.map((t) => t.task_id).join(', ')})`}
                    >
                      BLOCK {blk.block_id} ({blk.start_time}–{blk.end_time}) · {blk.tasks.length} tasks
                    </div>
                  );
                })}
              </div>

              <div className="timeline-legend">
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: '#2D333B' }}></span>
                  <span>Train Movement (Track Occupied)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-swatch" style={{ background: '#24613B' }}></span>
                  <span>Scheduled Maintenance Block (Clear Corridor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Unscheduled Tasks Table */}
          <div style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            Unscheduled Tasks & Operational Constraint Breakdown ({unscheduledTasks.length})
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
                  <th>Operational Constraint Reason</th>
                </tr>
              </thead>
              <tbody>
                {unscheduledTasks.map(({ task, reason }) => (
                  <tr key={task.task_id}>
                    <td className="cell-mono" style={{ fontWeight: '700' }}>{task.task_id}</td>
                    <td><DeptBadge department={task.department} /></td>
                    <td>
                      <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                        {task.track || 'Track 1'}
                      </span>
                    </td>
                    <td className="cell-mono">{task.earliest_start} – {task.latest_end}</td>
                    <td className="cell-mono" style={{ fontWeight: '600' }}>{task.duration} hrs</td>
                    <td style={{ color: 'var(--c-text-primary)', fontSize: '11.5px', whiteSpace: 'normal', maxWidth: '600px' }}>
                      {reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECTION G: Algorithmic Foundations Panel */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section G: Algorithmic Foundations & Theoretical Principles</div>
          <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)' }}>
            DSA FOUNDATIONS · TIME & SPACE COMPLEXITY
          </span>
        </div>

        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '12px', lineHeight: 1.5 }}>
            <div style={{ borderLeft: '3px solid #6E7681', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-primary)', marginBottom: '4px' }}>
                FCFS (First Come First Served)
              </div>
              <p style={{ color: 'var(--c-text-secondary)', marginBottom: '6px' }}>
                Processes requests in their exact queue/arrival order without earliest-start sorting. Assigns each task to the earliest compatible active block or opens the earliest feasible authorized corridor.
              </p>
              <div className="cell-mono" style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
                Time Complexity: O(N · M)<br />
                Ordering: FIFO Arrival Sequence<br />
                Clubbing: Opportunistic
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #21262D', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-primary)', marginBottom: '4px' }}>
                Greedy (Earliest Start Time)
              </div>
              <p style={{ color: 'var(--c-text-secondary)', marginBottom: '6px' }}>
                Sorts tasks by earliest start time using Merge Sort O(N log N). Progressively clubs tasks into active blocks to avoid opening new possessions. When required, allocates new clear corridors.
              </p>
              <div className="cell-mono" style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
                Time Complexity: O(N log N + N · M)<br />
                Sorting: Merge Sort by earliest start<br />
                Clubbing: Max duration simultaneous
              </div>
            </div>

            <div style={{ borderLeft: '3px solid #24613B', paddingLeft: '12px' }}>
              <div style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-primary)', marginBottom: '4px' }}>
                Dynamic Programming (WIS)
              </div>
              <p style={{ color: 'var(--c-text-secondary)', marginBottom: '6px' }}>
                Generates candidate blocks with clubbed tasks, evaluates hard safety constraints upfront, sorts candidate intervals by finish time, and solves the recurrence:
              </p>
              <div className="cell-mono" style={{ fontSize: '11px', background: 'var(--c-surface-alt)', padding: '4px 8px', borderRadius: '2px', marginBottom: '4px', fontWeight: '700' }}>
                DP[i] = max(DP[i - 1], W(i) + DP[p(i)])
              </div>
              <p style={{ color: 'var(--c-text-secondary)', fontSize: '11px' }}>
                Backtracking reconstructs the optimal schedule. Task uniqueness is strictly enforced to solve the Set Packing constraint across candidate blocks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
