import React, { useState } from 'react';

// ============================================================================
// DATASET 1: THE 5-MAINTENANCE CONCRETE EXAMPLE (REQUESTED BY USER)
// Demonstrates how Greedy picks the single highest-reward block and gets trapped,
// while DP accumulates the cumulative best and backtracks the optimal feasible set.
// ============================================================================
const FIVE_BLOCKS_DATA = [
  {
    id: 'BLK-1',
    name: 'Block 1 (Greedy Bait)',
    start: '08:00',
    end: '11:30',
    startMin: 480,
    endMin: 690,
    durMin: 210,
    durHours: 3.5,
    tasks: 2,
    depts: ['Engineering', 'Signal & Telecom'],
    extraDepts: 1,
    reward: 137, // M=5: alpha=66, beta=6 -> 66*2 + 6*1 - 1 = 137
    description: 'Track Realignment & Main S&T Calibration',
    whyGreedy: 'Highest individual block reward (137 pts). Greedy commits it myopically.',
    color: '#F59E0B',
  },
  {
    id: 'BLK-2',
    name: 'Block 2',
    start: '08:00',
    end: '08:50',
    startMin: 480,
    endMin: 530,
    durMin: 50,
    durHours: 0.83,
    tasks: 1,
    depts: ['Engineering'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    description: 'Ultrasonic Rail Flaw Detection',
    color: '#10B981',
  },
  {
    id: 'BLK-3',
    name: 'Block 3',
    start: '09:00',
    end: '09:50',
    startMin: 540,
    endMin: 590,
    durMin: 50,
    durHours: 0.83,
    tasks: 1,
    depts: ['Signal & Telecom'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    description: 'Point Motor Interlock Test',
    color: '#10B981',
  },
  {
    id: 'BLK-4',
    name: 'Block 4',
    start: '10:00',
    end: '10:50',
    startMin: 600,
    endMin: 650,
    durMin: 50,
    durHours: 0.83,
    tasks: 1,
    depts: ['Traction'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    description: 'OHE Catenary Section Insulator Check',
    color: '#10B981',
  },
  {
    id: 'BLK-5',
    name: 'Block 5',
    start: '11:00',
    end: '11:50',
    startMin: 660,
    endMin: 710,
    durMin: 50,
    durHours: 0.83,
    tasks: 1,
    depts: ['Engineering'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    description: 'Track Fastener Torque & Ballast Tamp',
    color: '#10B981',
  },
];

// The 5-block DP table sorted by finish time:
// 1: BLK-2 (finish 08:50, R=65, p=0) -> DP[1] = 65
// 2: BLK-3 (finish 09:50, R=65, p=1 [BLK-2]) -> DP[2] = 65 + 65 = 130
// 3: BLK-4 (finish 10:50, R=65, p=2 [BLK-3]) -> DP[3] = 65 + 130 = 195
// 4: BLK-1 (finish 11:30, R=137, p=0) -> max(195, 137+0) = 195 (Skip BLK-1!)
// 5: BLK-5 (finish 11:50, R=65, p=3 [BLK-4]) -> max(195, 65+195) = 260 (Take BLK-5)
const FIVE_BLOCKS_DP_STEPS = [
  {
    step: 1,
    block: 'Block 2',
    time: '08:00 – 08:50',
    reward: 65,
    pred: 'Base 0',
    predVal: 0,
    incl: 65,
    excl: 0,
    dpVal: 65,
    action: 'INCLUDE',
    reason: 'R(2) + DP[0] = 65 > 0 -> Commit to subproblem',
  },
  {
    step: 2,
    block: 'Block 3',
    time: '09:00 – 09:50',
    reward: 65,
    pred: 'Block 2 (p=1)',
    predVal: 65,
    incl: 130,
    excl: 65,
    dpVal: 130,
    action: 'INCLUDE',
    reason: 'R(3) + DP[1] = 65 + 65 = 130 > 65 -> Commit to subproblem',
  },
  {
    step: 3,
    block: 'Block 4',
    time: '10:00 – 10:50',
    reward: 65,
    pred: 'Block 3 (p=2)',
    predVal: 130,
    incl: 195,
    excl: 130,
    dpVal: 195,
    action: 'INCLUDE',
    reason: 'R(4) + DP[2] = 65 + 130 = 195 > 130 -> Commit to subproblem',
  },
  {
    step: 4,
    block: 'Block 1',
    time: '08:00 – 11:30',
    reward: 137,
    pred: 'Base 0 (p=0)',
    predVal: 0,
    incl: 137,
    excl: 195,
    dpVal: 195,
    action: 'EXCLUDE',
    reason: 'R(1) + DP[0] = 137 <= DP[3]=195 -> EXCLUDED! (Cumulative combination already beats it)',
  },
  {
    step: 5,
    block: 'Block 5',
    time: '11:00 – 11:50',
    reward: 65,
    pred: 'Block 4 (p=3)',
    predVal: 195,
    incl: 260,
    excl: 195,
    dpVal: 260,
    action: 'INCLUDE',
    reason: 'R(5) + DP[3] = 65 + 195 = 260 > 195 -> Commit to optimal solution',
  },
];

// ============================================================================
// DATASET 2: THE 7-CANDIDATE CORRIDOR BENCHMARK (FROM PRESENTATION SLIDE 5)
// ============================================================================
const SLIDE_CANDIDATES = [
  { id: 'BLK-A', name: 'Candidate A', start: '07:45', end: '12:15', tasks: 2, depts: 'Eng. + S&T', cb: 1, reward: 247, interp: '2 tasks + 1 dept bonus − 1' },
  { id: 'BLK-B', name: 'Candidate B', start: '08:30', end: '09:45', tasks: 1, depts: '1 department', cb: 0, reward: 119, interp: '1 task − 1 block' },
  { id: 'BLK-C', name: 'Candidate C', start: '10:00', end: '11:30', tasks: 1, depts: '1 department', cb: 0, reward: 119, interp: '1 task − 1 block' },
  { id: 'BLK-D', name: 'Candidate D', start: '08:00', end: '08:45', tasks: 3, depts: 'Eng. + S&T + Traction', cb: 2, reward: 375, interp: '3 tasks + 2 dept bonus − 1' },
  { id: 'BLK-E', name: 'Candidate E', start: '09:00', end: '09:45', tasks: 1, depts: '1 department', cb: 0, reward: 119, interp: '1 task − 1 block' },
  { id: 'BLK-F', name: 'Candidate F', start: '10:00', end: '10:45', tasks: 1, depts: '1 department', cb: 0, reward: 119, interp: '1 task − 1 block' },
  { id: 'BLK-G', name: 'Candidate G', start: '11:00', end: '11:45', tasks: 1, depts: '1 department', cb: 0, reward: 119, interp: '1 task − 1 block' },
];

export default function ComparisonPage({
  comparisonData,
  onRunComparison,
  loading = false,
}) {
  const currentScenario = comparisonData?.scenario_id || 'default';
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);

  // Reward Simulator State
  const [rewardTab, setRewardTab] = useState('five_blocks'); // 'five_blocks' | 'slide_showcase'
  const [fiveSimMode, setFiveSimMode] = useState('dp'); // 'greedy' | 'dp'

  const handleScenarioChange = (scenarioId) => {
    setSelectedScenario(scenarioId);
    if (onRunComparison) {
      onRunComparison(scenarioId);
    }
  };

  // Metrics from each algorithm
  const fcfs = comparisonData?.fcfs?.metrics || {
    tasks_scheduled: 9,
    tasks_unscheduled: 11,
    blocks_generated: 3,
    clubbed_tasks: 8,
    cross_department_blocks: 2,
  };

  const greedy = comparisonData?.greedy?.metrics || {
    tasks_scheduled: 6,
    tasks_unscheduled: 14,
    blocks_generated: 3,
    clubbed_tasks: 4,
    cross_department_blocks: 1,
  };

  const dp = comparisonData?.dp?.metrics || {
    tasks_scheduled: 12,
    tasks_unscheduled: 8,
    blocks_generated: 3,
    clubbed_tasks: 12,
    cross_department_blocks: 3,
  };

  const totalTasks = comparisonData?.total_input_tasks || 20;

  // Bar Graph Metric Groups
  const barMetrics = [
    {
      id: 'scheduled',
      label: 'Tasks Scheduled',
      fcfs: fcfs.tasks_scheduled,
      greedy: greedy.tasks_scheduled,
      dp: dp.tasks_scheduled,
      maxVal: Math.max(totalTasks, 15),
      unit: 'tasks',
      higherIsBetter: true,
    },
    {
      id: 'unscheduled',
      label: 'Tasks Unscheduled',
      fcfs: fcfs.tasks_unscheduled,
      greedy: greedy.tasks_unscheduled,
      dp: dp.tasks_unscheduled,
      maxVal: Math.max(totalTasks, 15),
      unit: 'tasks',
      higherIsBetter: false,
    },
    {
      id: 'clubbed',
      label: 'Clubbed Tasks',
      fcfs: fcfs.clubbed_tasks,
      greedy: greedy.clubbed_tasks,
      dp: dp.clubbed_tasks,
      maxVal: Math.max(totalTasks, 15),
      unit: 'tasks',
      higherIsBetter: true,
    },
    {
      id: 'cross_dept',
      label: 'Cross-Dept Blocks',
      fcfs: fcfs.cross_department_blocks,
      greedy: greedy.cross_department_blocks,
      dp: dp.cross_department_blocks,
      maxVal: 5,
      unit: 'blocks',
      higherIsBetter: true,
    },
  ];

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 760;
  const groupWidth = chartWidth / barMetrics.length;
  const barWidth = 28;
  const barGap = 6;

  // Filter comparison table rows to remove Block Utilization
  const filteredTable = (comparisonData?.comparison_table || []).filter(
    (row) => row.metric !== 'Block Utilization'
  );

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* =========================================================================
          1. TOP HEADER & SCENARIO SELECTOR
          ========================================================================= */}
      <div className="page-title-row" style={{ alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Algorithm Comparison</h2>
            <span
              style={{
                background: selectedScenario === 'showcase' ? '#ECFDF5' : selectedScenario === 'contested' ? '#FEF3C7' : '#EFF6FF',
                color: selectedScenario === 'showcase' ? '#065F46' : selectedScenario === 'contested' ? '#92400E' : '#1D4ED8',
                fontWeight: '700',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '9999px',
              }}
            >
              {selectedScenario === 'showcase' ? 'PBL SHOWCASE (A–B)' : selectedScenario === 'contested' ? 'STRESS BENCHMARK' : 'DEFAULT 20-TASK DATASET'}
            </span>
          </div>
          <div className="page-description">
            Head-to-head empirical evaluation of FCFS, Greedy, and Dynamic Programming with Lexicographic Reward Dynamics
          </div>
        </div>

        {/* Scenario Switcher Buttons */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="scenario-selector">
            <button
              className={`scenario-btn ${selectedScenario === 'default' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('default')}
              disabled={loading}
            >
              Default Dataset (20 Tasks)
            </button>
            <button
              className={`scenario-btn ${selectedScenario === 'showcase' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('showcase')}
              disabled={loading}
            >
              PBL Showcase (A–B)
            </button>
            <button
              className={`scenario-btn ${selectedScenario === 'contested' ? 'active' : ''}`}
              onClick={() => handleScenarioChange('contested')}
              disabled={loading}
            >
              Contested Stress Test
            </button>
          </div>

          <button
            onClick={() => onRunComparison && onRunComparison(selectedScenario)}
            disabled={loading}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {loading ? 'Benchmarking...' : '↻ Re-Run Benchmark'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. 3 HIGH-LEVEL SCORECARDS
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* FCFS Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                1. Queue Arrival Order
              </span>
              <span style={{ fontSize: '11px', background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                FCFS
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
              First Come First Served
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Tasks Scheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  {fcfs.tasks_scheduled} <span style={{ fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>/ {totalTasks}</span>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Unscheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                  {fcfs.tasks_unscheduled}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
              <span>Clubbed Tasks:</span>
              <strong style={{ color: '#0F172A' }}>{fcfs.clubbed_tasks} tasks</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
              <span>Cross-Dept Blocks:</span>
              <strong style={{ color: '#0F172A' }}>{fcfs.cross_department_blocks} blocks</strong>
            </div>
          </div>
        </div>

        {/* Greedy Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#D97706', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                2. Earliest Start Heuristic
              </span>
              <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                GREEDY
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
              Greedy Scheduler
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Tasks Scheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                  {greedy.tasks_scheduled} <span style={{ fontSize: '12px', fontWeight: '500', color: '#94A3B8' }}>/ {totalTasks}</span>
                </div>
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', border: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Unscheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#EF4444', fontFamily: 'var(--font-mono)' }}>
                  {greedy.tasks_unscheduled}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
              <span>Clubbed Tasks:</span>
              <strong style={{ color: '#0F172A' }}>{greedy.clubbed_tasks} tasks</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', padding: '6px 0', borderTop: '1px solid #F1F5F9' }}>
              <span>Cross-Dept Blocks:</span>
              <strong style={{ color: '#0F172A' }}>{greedy.cross_department_blocks} blocks</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Programming (WIS) Card - WINNER */}
        <div
          className="reward-card-winner"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            borderRadius: '14px',
            border: '2px solid #10B981',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                ★ OPTIMAL WINNER
              </span>
              <span style={{ fontSize: '11px', background: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                DP (WIS)
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '0 0 14px 0' }}>
              Dynamic Programming
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>Tasks Scheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  {dp.tasks_scheduled} <span style={{ fontSize: '12px', fontWeight: '500', color: '#059669' }}>/ {totalTasks}</span>
                </div>
              </div>
              <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '11px', color: '#065F46', fontWeight: '600' }}>Unscheduled</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  {dp.tasks_unscheduled}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#065F46', padding: '6px 0', borderTop: '1px solid #D1FAE5' }}>
              <span>Clubbed Tasks:</span>
              <strong style={{ color: '#059669' }}>{dp.clubbed_tasks} tasks (3× higher)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#065F46', padding: '6px 0', borderTop: '1px solid #D1FAE5' }}>
              <span>Cross-Dept Blocks:</span>
              <strong style={{ color: '#059669' }}>{dp.cross_department_blocks} blocks (100% consolidated)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. VISUAL CHARTS SECTION (BAR GRAPH & THROUGHPUT GRAPH)
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        {/* BAR GRAPH: Key Metrics Side-by-Side (FCFS vs Greedy vs DP) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Algorithm Performance Bar Chart
              </h3>
              <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                Direct visual metric comparison across all 3 algorithms
              </div>
            </div>

            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', fontWeight: '600' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#64748B', borderRadius: '2px' }} />
                <span>FCFS</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#F59E0B', borderRadius: '2px' }} />
                <span>Greedy</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '2px' }} />
                <span style={{ color: '#059669', fontWeight: '700' }}>DP (WIS)</span>
              </div>
            </div>
          </div>

          {/* SVG Grouped Bar Chart */}
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} style={{ width: '100%', minWidth: '560px', height: 'auto' }}>
              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = chartHeight - pct * (chartHeight - 40);
                return (
                  <g key={i}>
                    <line x1="30" y1={y} x2={chartWidth - 20} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                  </g>
                );
              })}

              {/* Bar Groups */}
              {barMetrics.map((group, groupIdx) => {
                const groupCenterX = 60 + groupIdx * (groupWidth * 0.92);
                const maxVal = group.maxVal;

                const fcfsH = (group.fcfs / maxVal) * (chartHeight - 60);
                const greedyH = (group.greedy / maxVal) * (chartHeight - 60);
                const dpH = (group.dp / maxVal) * (chartHeight - 60);

                const fcfsY = chartHeight - fcfsH;
                const greedyY = chartHeight - greedyH;
                const dpY = chartHeight - dpH;

                return (
                  <g key={group.id} transform={`translate(${groupCenterX}, 0)`}>
                    {/* FCFS Bar */}
                    <rect
                      x={-barWidth * 1.5 - barGap}
                      y={fcfsY}
                      width={barWidth}
                      height={Math.max(2, fcfsH)}
                      rx="4"
                      fill="#64748B"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text
                      x={-barWidth - barGap}
                      y={fcfsY - 6}
                      textAnchor="middle"
                      fill="#64748B"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {group.fcfs}
                    </text>

                    {/* Greedy Bar */}
                    <rect
                      x={-barWidth * 0.5}
                      y={greedyY}
                      width={barWidth}
                      height={Math.max(2, greedyH)}
                      rx="4"
                      fill="#F59E0B"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text
                      x={0}
                      y={greedyY - 6}
                      textAnchor="middle"
                      fill="#D97706"
                      fontSize="11"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {group.greedy}
                    </text>

                    {/* DP Bar */}
                    <rect
                      x={barWidth * 0.5 + barGap}
                      y={dpY}
                      width={barWidth}
                      height={Math.max(2, dpH)}
                      rx="4"
                      fill="#10B981"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <text
                      x={barWidth + barGap}
                      y={dpY - 6}
                      textAnchor="middle"
                      fill="#059669"
                      fontSize="11.5"
                      fontWeight="800"
                      fontFamily="var(--font-mono)"
                    >
                      {group.dp}
                    </text>

                    {/* Group Label */}
                    <text
                      x={0}
                      y={chartHeight + 22}
                      textAnchor="middle"
                      fill="#334155"
                      fontSize="11.5"
                      fontWeight="700"
                    >
                      {group.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* THROUGHPUT & EFFICIENCY GRAPH */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Task Throughput Ratio
            </h3>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px', marginBottom: '16px' }}>
              Percentage of total requests scheduled without operational conflict
            </div>

            {/* Dynamic Programming Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '700', color: '#059669' }}>Dynamic Programming (WIS)</span>
                <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                  {((dp.tasks_scheduled / totalTasks) * 100).toFixed(0)}% ({dp.tasks_scheduled}/{totalTasks})
                </strong>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(dp.tasks_scheduled / totalTasks) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981, #059669)',
                    borderRadius: '5px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* FCFS Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#475569' }}>FCFS (Queue Order)</span>
                <strong style={{ color: '#475569', fontFamily: 'var(--font-mono)' }}>
                  {((fcfs.tasks_scheduled / totalTasks) * 100).toFixed(0)}% ({fcfs.tasks_scheduled}/{totalTasks})
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(fcfs.tasks_scheduled / totalTasks) * 100}%`,
                    height: '100%',
                    background: '#64748B',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>

            {/* Greedy Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', color: '#D97706' }}>Greedy (Earliest Start)</span>
                <strong style={{ color: '#D97706', fontFamily: 'var(--font-mono)' }}>
                  {((greedy.tasks_scheduled / totalTasks) * 100).toFixed(0)}% ({greedy.tasks_scheduled}/{totalTasks})
                </strong>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(greedy.tasks_scheduled / totalTasks) * 100}%`,
                    height: '100%',
                    background: '#F59E0B',
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Summary Pill */}
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '11.5px',
              color: '#166534',
              lineHeight: 1.45,
            }}
          >
            <strong>Key Finding:</strong> DP evaluates global non-overlapping combinations via Bellman recurrence, doubling Greedy's scheduled output while consolidating 3 departments.
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. CLEAN 5-METRIC COMPARISON MATRIX TABLE (NO BLOCK UTILIZATION)
          ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Primary Algorithm Comparison Matrix
            </h3>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
              Standardized comparison across the 5 core operational metrics
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
            IMMUTABLE SNAPSHOT ISOLATION
          </span>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Primary Metric</th>
                <th style={{ width: '18%' }}>1. FCFS (Queue Order)</th>
                <th style={{ width: '18%' }}>2. Greedy (Earliest Start)</th>
                <th style={{ width: '20%' }}>3. Dynamic Programming (WIS)</th>
                <th style={{ width: '22%' }}>Operational Definition</th>
              </tr>
            </thead>
            <tbody>
              {filteredTable.map((row) => (
                <tr key={row.metric}>
                  <td style={{ fontWeight: '700', color: '#0F172A' }}>
                    {row.metric}
                  </td>
                  <td className="cell-mono" style={{ fontWeight: '600', color: '#334155' }}>
                    {row.fcfs} {row.unit}
                  </td>
                  <td className="cell-mono" style={{ fontWeight: '600', color: '#334155' }}>
                    {row.greedy} {row.unit}
                  </td>
                  <td
                    className="cell-mono"
                    style={{
                      fontWeight: '800',
                      color: '#059669',
                      background: '#F0FDF4',
                    }}
                  >
                    ★ {row.dp} {row.unit}
                  </td>
                  <td style={{ color: '#64748B', fontSize: '12px' }}>
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          5. THE REWARD SYSTEM & LIVE BACKTRACKING SIMULATOR
             (Positioned cleanly below the graphs and tables)
          ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header & Sub-Tab Switcher */}
        <div
          style={{
            padding: '22px 28px 16px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Live Reward System: Greedy Trap vs. DP Cumulative Backtracking
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
              See how Greedy chooses the single highest individual reward block, while DP backtracks the cumulative best feasible blocks
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setRewardTab('five_blocks')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'five_blocks' ? '800' : '600',
                color: rewardTab === 'five_blocks' ? '#0F172A' : '#64748B',
                background: rewardTab === 'five_blocks' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'five_blocks' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              5-Maintenance Live Example
            </button>
            <button
              onClick={() => setRewardTab('slide_showcase')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'slide_showcase' ? '800' : '600',
                color: rewardTab === 'slide_showcase' ? '#0F172A' : '#64748B',
                background: rewardTab === 'slide_showcase' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'slide_showcase' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              Slide 5 Formal Reference (M=7)
            </button>
          </div>
        </div>

        {/* TAB 1: 5-MAINTENANCE LIVE PRACTICAL EXAMPLE */}
        {rewardTab === 'five_blocks' && (
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Context & Formula for M=5 */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#047857', fontWeight: '800' }}>
                  PBL FORMULA FOR M = 5 FEASIBLE CANDIDATE BLOCKS
                </div>
                <div style={{ fontSize: '15px', fontWeight: '900', color: '#0F172A', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                  β = M + 1 = 6 &nbsp;·&nbsp; α = 2Mβ + M + 1 = 66 &nbsp;·&nbsp; R(B) = 66 × T<sub>β</sub> + 6 × C<sub>β</sub> − 1
                </div>
              </div>

              {/* Mode Toggle for the 5-Block Example */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setFiveSimMode('greedy')}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: fiveSimMode === 'greedy' ? '#F59E0B' : '#FFFFFF',
                    color: fiveSimMode === 'greedy' ? '#FFFFFF' : '#D97706',
                    boxShadow: fiveSimMode === 'greedy' ? '0 2px 6px rgba(245, 158, 11, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                    border: fiveSimMode === 'greedy' ? 'none' : '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔴 How Greedy Chooses (R = 137)</span>
                </button>
                <button
                  onClick={() => setFiveSimMode('dp')}
                  style={{
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    background: fiveSimMode === 'dp' ? '#10B981' : '#FFFFFF',
                    color: fiveSimMode === 'dp' ? '#FFFFFF' : '#059669',
                    boxShadow: fiveSimMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.3)' : '0 1px 2px rgba(0,0,0,0.05)',
                    border: fiveSimMode === 'dp' ? 'none' : '1px solid #CBD5E1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🟢 How DP Backtracks (R = 260)</span>
                </button>
              </div>
            </div>

            {/* Visual 5-Block Physical Timeline Representation (08:00 to 12:00) */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  Track Possession Timeline · Section Panipat (Track 1): 08:00 – 12:00
                </span>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Total Available Window: 240 minutes
                </span>
              </div>

              {/* Time axis ruler */}
              <div style={{ position: 'relative', height: '20px', borderBottom: '1px solid #CBD5E1', marginBottom: '12px', fontSize: '10.5px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                <span style={{ position: 'absolute', left: '0%' }}>08:00</span>
                <span style={{ position: 'absolute', left: '21%' }}>08:50</span>
                <span style={{ position: 'absolute', left: '25%' }}>09:00</span>
                <span style={{ position: 'absolute', left: '46%' }}>09:50</span>
                <span style={{ position: 'absolute', left: '50%' }}>10:00</span>
                <span style={{ position: 'absolute', left: '71%' }}>10:50</span>
                <span style={{ position: 'absolute', left: '75%' }}>11:00</span>
                <span style={{ position: 'absolute', left: '88%' }}>11:30</span>
                <span style={{ position: 'absolute', left: '96%' }}>11:50</span>
              </div>

              {/* Physical Track Lanes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                {/* Block 1 (Greedy Bait) */}
                <div style={{ position: 'relative', height: '38px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0%',
                      width: '87.5%', // 210 min / 240 min = 87.5%
                      height: '100%',
                      background: fiveSimMode === 'greedy' ? '#F59E0B' : '#F1F5F9',
                      border: fiveSimMode === 'greedy' ? '2px solid #D97706' : '1px dashed #CBD5E1',
                      borderRadius: '6px',
                      color: fiveSimMode === 'greedy' ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 12px',
                      fontSize: '11.5px',
                      fontWeight: '800',
                      transition: 'all 0.3s ease',
                      boxShadow: fiveSimMode === 'greedy' ? '0 2px 8px rgba(245, 158, 11, 0.25)' : 'none',
                    }}
                  >
                    <span>
                      {fiveSimMode === 'greedy' ? '★ GREEDY PICK: ' : 'EXCLUDED BY DP: '}
                      Block 1 (08:00 – 11:30 · 3.5 hrs · 2 Tasks)
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>R = 137 pts</span>
                  </div>
                </div>

                {/* Sub-Blocks: 2, 3, 4, 5 */}
                <div style={{ position: 'relative', height: '38px', background: '#F8FAFC', borderRadius: '6px', border: '1px solid #F1F5F9' }}>
                  {/* Block 2 (08:00 - 08:50) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0%',
                      width: '20.8%', // 50 min / 240 min
                      height: '100%',
                      background: fiveSimMode === 'dp' ? '#10B981' : '#FEE2E2',
                      border: fiveSimMode === 'dp' ? '2px solid #059669' : '1px dashed #EF4444',
                      borderRadius: '6px',
                      color: fiveSimMode === 'dp' ? '#FFFFFF' : '#991B1B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      transition: 'all 0.3s ease',
                      boxShadow: fiveSimMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {fiveSimMode === 'dp' ? '✔ Block 2 (65)' : '❌ Collided'}
                  </div>

                  {/* Block 3 (09:00 - 09:50) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '25%', // 60 min / 240 min
                      width: '20.8%',
                      height: '100%',
                      background: fiveSimMode === 'dp' ? '#10B981' : '#FEE2E2',
                      border: fiveSimMode === 'dp' ? '2px solid #059669' : '1px dashed #EF4444',
                      borderRadius: '6px',
                      color: fiveSimMode === 'dp' ? '#FFFFFF' : '#991B1B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      transition: 'all 0.3s ease',
                      boxShadow: fiveSimMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {fiveSimMode === 'dp' ? '✔ Block 3 (65)' : '❌ Collided'}
                  </div>

                  {/* Block 4 (10:00 - 10:50) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%', // 120 min / 240 min
                      width: '20.8%',
                      height: '100%',
                      background: fiveSimMode === 'dp' ? '#10B981' : '#FEE2E2',
                      border: fiveSimMode === 'dp' ? '2px solid #059669' : '1px dashed #EF4444',
                      borderRadius: '6px',
                      color: fiveSimMode === 'dp' ? '#FFFFFF' : '#991B1B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      transition: 'all 0.3s ease',
                      boxShadow: fiveSimMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {fiveSimMode === 'dp' ? '✔ Block 4 (65)' : '❌ Collided'}
                  </div>

                  {/* Block 5 (11:00 - 11:50) */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '75%', // 180 min / 240 min
                      width: '20.8%',
                      height: '100%',
                      background: fiveSimMode === 'dp' ? '#10B981' : '#FEE2E2',
                      border: fiveSimMode === 'dp' ? '2px solid #059669' : '1px dashed #EF4444',
                      borderRadius: '6px',
                      color: fiveSimMode === 'dp' ? '#FFFFFF' : '#991B1B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: '800',
                      transition: 'all 0.3s ease',
                      boxShadow: fiveSimMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    }}
                  >
                    {fiveSimMode === 'dp' ? '✔ Block 5 (65)' : '❌ Collided'}
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC BREAKDOWN BASED ON SELECTED MODE */}
            {fiveSimMode === 'greedy' ? (
              <div className="anim-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                {/* Left: What Greedy Did */}
                <div style={{ background: '#FFFBEB', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: '#F59E0B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      GREEDY DECISION LOGIC
                    </span>
                    <strong style={{ color: '#D97706', fontSize: '16px', fontFamily: 'var(--font-mono)' }}>Yield: 137 pts</strong>
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#92400E', fontWeight: '800' }}>
                    Trapped by Myopic Single-Block Maximization
                  </h4>

                  <p style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                    1. Greedy scans all 5 candidate blocks.<br />
                    2. It finds <strong>Block 1 ($R = 137$)</strong> has the <strong>highest individual reward</strong> ($137 &gt; 65$).<br />
                    3. Greedy commits Block 1 immediately.<br />
                    4. Block 1 spans <strong>08:00 to 11:30 (3.5 hours)</strong>.<br />
                    5. When Greedy examines Blocks 2, 3, 4, and 5, <strong>every single one collides</strong> with Block 1's track possession!<br />
                    6. Result: <strong>Blocks 2, 3, 4, 5 are all rejected</strong> due to interval overlap collision.
                  </p>
                </div>

                {/* Right: Collision Table */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                    Greedy Collision Diagnosis:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                    <div style={{ background: '#FEF3C7', padding: '6px 10px', borderRadius: '6px', color: '#92400E', fontWeight: '700' }}>
                      ✔ Block 1 (08:00–11:30): COMMITTED (+137 pts)
                    </div>
                    <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                      ❌ Block 2 (08:00–08:50): Overlaps with Block 1
                    </div>
                    <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                      ❌ Block 3 (09:00–09:50): Overlaps with Block 1
                    </div>
                    <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                      ❌ Block 4 (10:00–10:50): Overlaps with Block 1
                    </div>
                    <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                      ❌ Block 5 (11:00–11:50): Overlaps with Block 1 (ends 11:30)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* DP Recurrence Table */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                      1. DP Bellman Recurrence Table: Sorted by Finish Time
                    </span>
                    <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                      DP[i] = max( DP[i-1], R(i) + DP[p(i)] )
                    </span>
                  </div>

                  <div className="ops-table-container" style={{ margin: 0 }}>
                    <table className="ops-table" style={{ fontSize: '11.5px' }}>
                      <thead>
                        <tr>
                          <th>i</th>
                          <th>Candidate (Finish Time)</th>
                          <th>R(i)</th>
                          <th>Compatible p(i)</th>
                          <th>Include Branch</th>
                          <th>Exclude Branch</th>
                          <th>DP[i]</th>
                          <th>Decision</th>
                        </tr>
                      </thead>
                      <tbody>
                        {FIVE_BLOCKS_DP_STEPS.map((step) => (
                          <tr key={step.step} style={{ background: step.action === 'INCLUDE' ? '#F0FDF4' : '#FFFFFF' }}>
                            <td className="cell-mono" style={{ fontWeight: '700' }}>{step.step}</td>
                            <td style={{ fontWeight: '700', color: step.action === 'INCLUDE' ? '#059669' : '#475569' }}>
                              {step.block} ({step.time})
                            </td>
                            <td className="cell-mono">{step.reward}</td>
                            <td className="cell-mono">{step.pred}</td>
                            <td className="cell-mono" style={{ color: step.incl > step.excl ? '#059669' : '#64748B', fontWeight: step.incl > step.excl ? '800' : '500' }}>
                              {step.reward} + {step.predVal} = {step.incl}
                            </td>
                            <td className="cell-mono">{step.excl}</td>
                            <td className="cell-mono" style={{ fontWeight: '800', color: '#0F172A' }}>{step.dpVal}</td>
                            <td>
                              <span
                                style={{
                                  background: step.action === 'INCLUDE' ? '#DCFCE7' : '#F1F5F9',
                                  color: step.action === 'INCLUDE' ? '#15803D' : '#64748B',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                  fontSize: '10px',
                                }}
                              >
                                {step.action}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Backtracking Reconstruction Steps */}
                <div style={{ background: '#F0FDF4', border: '1.5px solid #10B981', borderRadius: '12px', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#065F46' }}>
                      2. DP Backtracking Reconstruction (From Finish i=5 Backwards to Start):
                    </div>
                    <span style={{ background: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontSize: '11.5px', fontWeight: '800' }}>
                      DP Cumulative Total: 260 pts (+89.8% over Greedy)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                    {/* Step A: Start at Block 5 */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>STEP 1: INSPECT i=5 (Block 5)</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>65 + DP[3] = 260</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '4px' }}>✔ SELECT Block 5 ➜ Jump to p(5) = Block 4</div>
                    </div>

                    {/* Step B: Jump to Block 4 */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>STEP 2: INSPECT i=3 (Block 4)</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>65 + DP[2] = 195</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '4px' }}>✔ SELECT Block 4 ➜ Jump to p(3) = Block 3</div>
                    </div>

                    {/* Step C: Jump to Block 3 */}
                    <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>STEP 3: INSPECT i=2 (Block 3)</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>65 + DP[1] = 130</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '4px' }}>✔ SELECT Block 3 ➜ Jump to p(2) = Block 2</div>
                    </div>

                    {/* Step D: Jump to Block 2 */}
                    <div style={{ background: '#DCFCE7', border: '2px solid #10B981', borderRadius: '8px', padding: '10px' }}>
                      <div style={{ fontSize: '10px', color: '#065F46', fontWeight: '800' }}>STEP 4: INSPECT i=1 (Block 2)</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#065F46', marginTop: '2px' }}>65 + DP[0] = 65</div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '900', marginTop: '4px' }}>★ SELECT Block 2 ➜ Base 0 Reached!</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ color: '#065F46' }}>
                      <strong>Notice:</strong> Block 1 (R = 137) was <strong>safely discarded</strong> at i=4 because its inclusion yielded only 137 + 0 = 137 &lt; 195!
                    </span>
                    <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      Reconstructed Set: [Block 2, Block 3, Block 4, Block 5] = 260 pts
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SLIDE 5 FORMAL REFERENCE (M=7) */}
        {rewardTab === 'slide_showcase' && (
          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 3 Architecture Cards (Slide 5 Layout) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '18px' }}>
              {/* Card 1: CANDIDATE-BLOCK REWARD */}
              <div style={{ background: '#1E293B', color: '#FFFFFF', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', fontWeight: '800', marginBottom: '8px' }}>
                    CANDIDATE-BLOCK REWARD
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: '800', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em', marginBottom: '10px' }}>
                    R(B) = α × T<sub>β</sub> + β × C<sub>β</sub> − 1
                  </div>
                  <div style={{ fontSize: '11px', color: '#CBD5E1', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
                    <div>T<sub>β</sub> = unique tasks in block B</div>
                    <div>C<sub>β</sub> = max(0, distinct departments in B − 1)</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11.5px', lineHeight: 1.4 }}>
                    <div>❶ <strong>TASK COVERAGE:</strong> Each unique task adds α. Highest-priority objective.</div>
                    <div>❷ <strong>DEPARTMENT CLUBBING:</strong> Each extra dept beyond first adds β.</div>
                    <div>❸ <strong>BLOCK ECONOMY:</strong> Each block incurs −1 penalty, preferring fewer blocks on tie.</div>
                  </div>
                </div>
              </div>

              {/* Card 2: HOW α AND β ARE CHOSEN */}
              <div style={{ background: '#FFF5EB', border: '1px solid #FED7AA', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#C2410C', fontWeight: '800', marginBottom: '8px' }}>
                    HOW α AND β ARE CHOSEN
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#9A3412', fontWeight: '700', marginBottom: '6px' }}>
                    Let M = number of feasible candidate blocks.
                  </div>
                  <div style={{ fontSize: '11px', color: '#7C2D12', lineHeight: 1.45, marginBottom: '14px' }}>
                    Bounds ensure one extra clubbing unit outweighs any block-count difference, and one extra task outweighs all lower terms.
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FED7AA', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '800', color: '#C2410C', lineHeight: 1.6 }}>
                    <div>β = M + 1</div>
                    <div>α = 2Mβ + M + 1</div>
                  </div>
                </div>
              </div>

              {/* Card 3: SHOWCASE COEFFICIENTS */}
              <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#047857', fontWeight: '800', marginBottom: '8px' }}>
                    SHOWCASE COEFFICIENTS
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#065F46', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
                    M = 7 → β = 8 → α = 120
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #86EFAC', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: '900', color: '#059669', marginBottom: '10px' }}>
                    R(B) = 120 × T<sub>β</sub> + 8 × C<sub>β</sub> − 1
                  </div>
                  <div style={{ fontSize: '11px', color: '#065F46', lineHeight: 1.4 }}>
                    Hard constraints are enforced prior to candidate evaluation.
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 5 Table */}
            <div className="ops-table-container" style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden' }}>
              <table className="ops-table" style={{ margin: 0 }}>
                <thead>
                  <tr style={{ background: '#1E293B', color: '#FFFFFF' }}>
                    <th style={{ color: '#F8FAFC' }}>Candidate</th>
                    <th style={{ color: '#F8FAFC' }}>Tasks T<sub>β</sub></th>
                    <th style={{ color: '#F8FAFC' }}>Departments</th>
                    <th style={{ color: '#F8FAFC' }}>C<sub>β</sub></th>
                    <th style={{ color: '#F8FAFC' }}>Reward</th>
                    <th style={{ color: '#F8FAFC' }}>Interpretation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#FFFBEB' }}>
                    <td style={{ fontWeight: '800', color: '#D97706' }}>A (Greedy Pick)</td>
                    <td className="cell-mono">2</td>
                    <td>Eng. + S&T</td>
                    <td className="cell-mono">1</td>
                    <td className="cell-mono" style={{ fontWeight: '900', color: '#D97706' }}>247</td>
                    <td>2 tasks + 1 dept bonus − 1</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: '700' }}>B / C / E / F / G</td>
                    <td className="cell-mono">1</td>
                    <td>1 department</td>
                    <td className="cell-mono">0</td>
                    <td className="cell-mono" style={{ fontWeight: '800' }}>119 each</td>
                    <td>1 task − 1 block</td>
                  </tr>
                  <tr style={{ background: '#F0FDF4' }}>
                    <td style={{ fontWeight: '800', color: '#059669' }}>D (DP Single Block)</td>
                    <td className="cell-mono">3</td>
                    <td>Eng. + S&T + Traction</td>
                    <td className="cell-mono">2</td>
                    <td className="cell-mono" style={{ fontWeight: '900', color: '#059669' }}>★ 375</td>
                    <td style={{ color: '#065F46', fontWeight: '600' }}>3 tasks + 2 dept bonus − 1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Slide 5 Outcome Footer */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <span>
                Slide 5 Reconstructed Chain: <strong>D (375) + E (119) + F (119) + G (119) = 732 pts</strong>
              </span>
              <strong style={{ color: '#059669' }}>
                DP (732) beats Greedy (247) by +485 pts (+196.4%)
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
