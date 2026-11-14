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
  const currentScenario = comparisonData?.scenario_id || 'contested';
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);
  const [activeTab, setActiveTab] = useState('dp'); // 'fcfs' | 'greedy' | 'dp'
  const [decisionTab, setDecisionTab] = useState('dp'); // 'fcfs' | 'greedy' | 'dp'
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
                background: selectedScenario === 'contested' ? '#FEF3C7' : '#E2E8F0',
                color: selectedScenario === 'contested' ? '#92400E' : '#1E293B',
                fontWeight: '700',
                fontSize: '11px',
              }}
            >
              {selectedScenario === 'contested' ? 'STRESS BENCHMARK' : 'STANDARD SNAPSHOT'}
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
              id="btn-scenario-contested"
              className={`scenario-btn ${selectedScenario === 'contested' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('contested')}
              disabled={loading}
              title="Multi-corridor competition benchmark proving DP superiority over Greedy and FCFS"
            >
              Stress Benchmark (Divergent)
            </button>
            <button
              id="btn-scenario-default"
              className={`scenario-btn ${selectedScenario === 'default' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('default')}
              disabled={loading}
              title="Official 20-Task PBL Baseline with hard corridor physical ceilings"
            >
              Default Dataset (20 Tasks)
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
                <th style={{ width: '22%' }}>Primary Metric</th>
                <th style={{ width: '16%' }}>1. FCFS (Queue Arrival Order)</th>
                <th style={{ width: '16%' }}>2. Greedy (Earliest Start Time)</th>
                <th style={{ width: '16%' }}>3. Dynamic Programming (WIS)</th>
                <th style={{ width: '30%' }}>Mathematical Definition & Operational Meaning</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData?.comparison_table?.map((row) => (
                <tr key={row.metric}>
                  <td style={{ fontWeight: '700', color: 'var(--c-text-primary)' }}>
                    {row.metric}
                  </td>
                  <td className="cell-mono" style={{ fontWeight: '600' }}>
                    {row.fcfs}
                  </td>
                  <td className="cell-mono" style={{ fontWeight: '600' }}>
                    {row.greedy}
                  </td>
                  <td
                    className="cell-mono"
                    style={{
                      fontWeight: '700',
                      color: '#24613B',
                      backgroundColor: '#F0F7F2',
                    }}
                  >
                    {row.dp}
                  </td>
                  <td style={{ color: 'var(--c-text-secondary)', fontSize: '11.5px', whiteSpace: 'normal' }}>
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          {selectedScenario === 'default' ? (
            <>
              <strong style={{ color: 'var(--c-text-primary)' }}>Why do all three algorithms yield 13 scheduled tasks / 3 blocks on the default dataset?</strong>
              <br />
              In this operational snapshot, 4 of the 7 authorized corridors (<code>BLK-102</code>, <code>BLK-103</code>, <code>BLK-105</code>, <code>BLK-107</code>) have hard train collisions with Rajdhani, Vande Bharat, Sanghamitra, and Freight trains. Track 4 has zero authorized windows. Exactly 13 tasks request the remaining 3 clear corridors (<code>BLK-101</code> on Track 1, <code>BLK-104</code> on Track 2, <code>BLK-106</code> on Track 3), and all 13 fit within those windows. Consequently, all three algorithms reach the physical problem ceiling for this dataset.
              <br />
              <span style={{ color: 'var(--c-text-primary)', fontWeight: '600' }}>
                👉 Tip: Click the "Contested Stress Benchmark" button above to evaluate multi-corridor competition where DP proves superior to Greedy!
              </span>
            </>
          ) : (
            <>
              <strong style={{ color: '#92400E' }}>Contested Stress Benchmark Divergence Analysis:</strong>
              <br />
              Under corridor contention (overlapping windows on the same physical track), <strong>Greedy suffers from local short-sightedness</strong>: it commits early narrow corridors (e.g. BLK-C101, BLK-C103) that block high-capacity multi-department windows, scheduling only {comparisonData?.greedy?.metrics?.tasks_scheduled || 5} tasks.
              In contrast, <strong>Dynamic Programming solves the Bellman recurrence W(i) + DP[p(i)]</strong> across all candidate intervals, successfully scheduling {comparisonData?.dp?.metrics?.tasks_scheduled || 11} tasks with {comparisonData?.dp?.metrics?.clubbed_tasks || 9} clubbed tasks!
            </>
          )}
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

      {/* SECTION E: Schedule Inspection & Track Occupancy */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section E: Schedule Inspection & Track Possession Timeline</div>

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

      {/* SECTION F: Algorithmic Foundations Panel */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Section F: Algorithmic Foundations & Theoretical Principles</div>
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
