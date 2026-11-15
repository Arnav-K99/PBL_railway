import React, { useState } from 'react';

// ============================================================================
// THE 5 MAINTENANCE BLOCKS LIVE EXAMPLE (WITH ACCURATE TIMES & REWARDS)
// Formula for M = 5 candidate blocks:
// beta = M + 1 = 6
// alpha = 2*M*beta + M + 1 = 2(5)(6) + 5 + 1 = 66
// R(B) = 66 * T_beta + 6 * C_beta - 1
// ============================================================================
const FIVE_BLOCKS_DATA = [
  {
    id: 'BLK-1',
    ticketId: 'TCK-101',
    ticketTime: '06:00 AM',
    ticketOrder: 1,
    name: 'Block 1',
    start: '08:00',
    end: '11:30',
    durHours: '3.5h',
    durMin: 210,
    tasks: 2,
    depts: ['Engineering', 'Signal & Telecom'],
    extraDepts: 1,
    reward: 137, // 66*2 + 6*1 - 1 = 137
    isHighestIndividual: true,
    description: 'Heavy Track Realignment & S&T Circuit Overhaul',
    track: 'Track 1',
    startPct: 0,
    widthPct: 87.5, // 210 / 240
  },
  {
    id: 'BLK-2',
    ticketId: 'TCK-102',
    ticketTime: '06:05 AM',
    ticketOrder: 2,
    name: 'Block 2',
    start: '08:00',
    end: '08:50',
    durHours: '50m',
    durMin: 50,
    tasks: 1,
    depts: ['Engineering'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    isHighestIndividual: false,
    description: 'Ultrasonic Rail Flaw Detection',
    track: 'Track 1',
    startPct: 0,
    widthPct: 20.8,
  },
  {
    id: 'BLK-3',
    ticketId: 'TCK-103',
    ticketTime: '06:10 AM',
    ticketOrder: 3,
    name: 'Block 3',
    start: '09:00',
    end: '09:50',
    durHours: '50m',
    durMin: 50,
    tasks: 1,
    depts: ['Signal & Telecom'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    isHighestIndividual: false,
    description: 'Point Motor Interlock Test',
    track: 'Track 1',
    startPct: 25,
    widthPct: 20.8,
  },
  {
    id: 'BLK-4',
    ticketId: 'TCK-104',
    ticketTime: '06:15 AM',
    ticketOrder: 4,
    name: 'Block 4',
    start: '10:00',
    end: '10:50',
    durHours: '50m',
    durMin: 50,
    tasks: 1,
    depts: ['Traction'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    isHighestIndividual: false,
    description: 'OHE Catenary Section Insulator Check',
    track: 'Track 1',
    startPct: 50,
    widthPct: 20.8,
  },
  {
    id: 'BLK-5',
    ticketId: 'TCK-105',
    ticketTime: '06:20 AM',
    ticketOrder: 5,
    name: 'Block 5',
    start: '11:00',
    end: '11:50',
    durHours: '50m',
    durMin: 50,
    tasks: 1,
    depts: ['Engineering'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    isHighestIndividual: false,
    description: 'Track Fastener Torque & Ballast Tamp',
    track: 'Track 1',
    startPct: 75,
    widthPct: 20.8,
  },
];

// DP Bellman Table for the 5-block example (Sorted by finish time)
const DP_RECURRENCE_ROWS = [
  {
    i: 1,
    block: 'Block 2',
    time: '08:00 – 08:50',
    reward: 65,
    pred: 'Base 0',
    formula: '65 + DP[0] = 65',
    dpVal: 65,
    action: 'INCLUDE',
  },
  {
    i: 2,
    block: 'Block 3',
    time: '09:00 – 09:50',
    reward: 65,
    pred: 'Block 2 (p=1)',
    formula: '65 + DP[1] = 130',
    dpVal: 130,
    action: 'INCLUDE',
  },
  {
    i: 3,
    block: 'Block 4',
    time: '10:00 – 10:50',
    reward: 65,
    pred: 'Block 3 (p=2)',
    formula: '65 + DP[2] = 195',
    dpVal: 195,
    action: 'INCLUDE',
  },
  {
    i: 4,
    block: 'Block 1',
    time: '08:00 – 11:30',
    reward: 137,
    pred: 'Base 0 (p=0)',
    formula: '137 + DP[0] = 137 <= DP[3]=195',
    dpVal: 195,
    action: 'EXCLUDE',
  },
  {
    i: 5,
    block: 'Block 5',
    time: '11:00 – 11:50',
    reward: 65,
    pred: 'Block 4 (p=3)',
    formula: '65 + DP[3] = 260',
    dpVal: 260,
    action: 'INCLUDE',
  },
];

export default function ComparisonPage({
  comparisonData,
  onRunComparison,
  loading = false,
}) {
  // Live example simulation mode: 'fcfs' | 'greedy' | 'dp'
  const [algoMode, setAlgoMode] = useState('dp');

  // Metrics from default operational dataset
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

  // Clean 5-Metric Table (without Block Utilization)
  const filteredTable = (comparisonData?.comparison_table || []).filter(
    (row) => row.metric !== 'Block Utilization'
  );

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* =========================================================================
          1. TOP HEADER (CLEAN - NO SCENARIO SWITCHERS)
          ========================================================================= */}
      <div className="page-title-row" style={{ alignItems: 'center' }}>
        <div>
          <h2 className="page-title" style={{ margin: 0, marginBottom: '4px' }}>
            Algorithm Comparison
          </h2>
          <div className="page-description">
            Head-to-head empirical evaluation of First-Come First-Served (FCFS), Greedy, and Dynamic Programming (WIS)
          </div>
        </div>

        <button
          onClick={() => onRunComparison && onRunComparison('default')}
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
            boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
          }}
        >
          {loading ? 'Benchmarking...' : '↻ Re-Run Benchmark'}
        </button>
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
                2. Best Immediate Heuristic
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
          5. THE 5-MAINTENANCE BLOCKS LIVE REWARD SIMULATOR
             (Clear 3-way comparison: FCFS vs Greedy vs DP)
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
        {/* Header & 3-Mode Selector */}
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
                Live 5-Maintenance Block Scenario: Algorithm Decision Comparison
              </h2>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
              Compare how FCFS (ticket creation order), Greedy (highest individual reward), and DP (cumulative best + backtracking) schedule 5 candidate maintenance requests
            </div>
          </div>

          {/* 3 Algorithm Selector Buttons */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '10px', gap: '6px' }}>
            <button
              onClick={() => setAlgoMode('fcfs')}
              style={{
                border: 'none',
                padding: '7px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                background: algoMode === 'fcfs' ? '#475569' : 'transparent',
                color: algoMode === 'fcfs' ? '#FFFFFF' : '#475569',
                boxShadow: algoMode === 'fcfs' ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              1. FCFS (Ticket Creation Order)
            </button>
            <button
              onClick={() => setAlgoMode('greedy')}
              style={{
                border: 'none',
                padding: '7px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                background: algoMode === 'greedy' ? '#F59E0B' : 'transparent',
                color: algoMode === 'greedy' ? '#FFFFFF' : '#D97706',
                boxShadow: algoMode === 'greedy' ? '0 2px 6px rgba(245, 158, 11, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              2. Greedy (Highest Reward Block)
            </button>
            <button
              onClick={() => setAlgoMode('dp')}
              style={{
                border: 'none',
                padding: '7px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: '800',
                cursor: 'pointer',
                background: algoMode === 'dp' ? '#10B981' : 'transparent',
                color: algoMode === 'dp' ? '#FFFFFF' : '#059669',
                boxShadow: algoMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              3. DP (Cumulative Backtracking)
            </button>
          </div>
        </div>

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* ===================================================================
              THE 5 MAINTENANCE CANDIDATES ON TRACK (PROPER EXAMPLE WITH REWARDS)
              =================================================================== */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                The 5 Candidate Maintenance Requests (Track 1 Corridor: 08:00 – 12:00)
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                Active View: <strong>{algoMode.toUpperCase()} DECISION</strong>
              </span>
            </div>

            {/* List of the 5 Candidate Blocks with their times and rewards on the side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {FIVE_BLOCKS_DATA.map((b) => {
                // Determine selection status under current algorithm
                let isSelected = false;
                let statusLabel = '';
                let statusColor = '#EF4444';
                let statusBg = '#FEE2E2';

                if (algoMode === 'fcfs') {
                  // In FCFS: Ticket 101 arrived 1st at 06:00 AM, commits 08:00-11:30.
                  // All subsequent tickets (102, 103, 104, 105) collide with it.
                  if (b.id === 'BLK-1') {
                    isSelected = true;
                    statusLabel = 'TICKET #1 (ARRIVED 1ST) • COMMITTED';
                    statusColor = '#475569';
                    statusBg = '#F1F5F9';
                  } else {
                    isSelected = false;
                    statusLabel = `TICKET #${b.ticketOrder} • COLLIDED WITH #1`;
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                  }
                } else if (algoMode === 'greedy') {
                  // In Greedy: Chooses Block 1 because it has the highest individual reward (137 > 65)
                  if (b.id === 'BLK-1') {
                    isSelected = true;
                    statusLabel = '★ HIGHEST REWARD (137) • COMMITTED';
                    statusColor = '#92400E';
                    statusBg = '#FEF3C7';
                  } else {
                    isSelected = false;
                    statusLabel = 'COLLIDED WITH BLOCK 1';
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                  }
                } else {
                  // In DP: Selects Blocks 2, 3, 4, 5 (Cumulative total: 260), rejects Block 1
                  if (b.id !== 'BLK-1') {
                    isSelected = true;
                    statusLabel = '✔ SELECTED BY DP (CUMULATIVE)';
                    statusColor = '#065F46';
                    statusBg = '#DCFCE7';
                  } else {
                    isSelected = false;
                    statusLabel = '⛔ EXCLUDED (137 < 195 CUMULATIVE)';
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                  }
                }

                return (
                  <div
                    key={b.id}
                    style={{
                      background: isSelected ? (algoMode === 'dp' ? '#F0FDF4' : algoMode === 'greedy' ? '#FFFBEB' : '#F8FAFC') : '#FFFFFF',
                      border: isSelected
                        ? `2px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#64748B'}`
                        : '1px solid #CBD5E1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <div>
                      {/* Top Row: Ticket ID & Time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#64748B' }}>
                          {b.ticketId} · Created {b.ticketTime}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: statusBg,
                            color: statusColor,
                          }}
                        >
                          {isSelected ? 'SELECTED' : 'REJECTED'}
                        </span>
                      </div>

                      <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', marginBottom: '2px' }}>
                        {b.name}
                      </div>

                      <div style={{ fontSize: '12px', color: '#0F172A', fontWeight: '700', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                        {b.start} – {b.end} ({b.durHours})
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.35, marginBottom: '8px' }}>
                        {b.description} ({b.depts.join(' + ')})
                      </div>
                    </div>

                    {/* Reward on the side/bottom of each block */}
                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Candidate Reward:</span>
                      <strong
                        style={{
                          fontSize: '14px',
                          fontFamily: 'var(--font-mono)',
                          color: b.isHighestIndividual ? '#D97706' : '#059669',
                          background: b.isHighestIndividual ? '#FEF3C7' : '#ECFDF5',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        R = {b.reward} pts {b.isHighestIndividual && '★'}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================
              VISUAL TIMELINE OCCUPANCY & TRACK COLLISION MAP
              =================================================================== */}
          <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#0F172A' }}>
                Track 1 Corridor Timeline (08:00 to 12:00 · 240 mins)
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                {algoMode === 'fcfs' && 'FCFS Yield: 1 Block · Total Reward = 137'}
                {algoMode === 'greedy' && 'Greedy Yield: 1 Block (Block 1) · Total Reward = 137'}
                {algoMode === 'dp' && 'DP Yield: 4 Blocks (2+3+4+5) · Total Reward = 260 (+89.8%)'}
              </span>
            </div>

            {/* Time labels */}
            <div style={{ position: 'relative', height: '18px', borderBottom: '1px solid #CBD5E1', marginBottom: '10px', fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
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

            {/* Lane 1: Block 1 */}
            <div style={{ position: 'relative', height: '32px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', marginBottom: '6px' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '0%',
                  width: '87.5%',
                  height: '100%',
                  background: algoMode === 'dp' ? '#F1F5F9' : '#FEF3C7',
                  border: algoMode === 'dp' ? '1px dashed #CBD5E1' : '2px solid #F59E0B',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 10px',
                  fontSize: '11px',
                  fontWeight: '800',
                  color: algoMode === 'dp' ? '#94A3B8' : '#92400E',
                }}
              >
                <span>
                  {algoMode === 'dp' ? '⛔ EXCLUDED BY DP: ' : '★ COMMITTED: '}
                  Block 1 (08:00 – 11:30 · 3.5h)
                </span>
                <span>R = 137</span>
              </div>
            </div>

            {/* Lane 2: Sub-blocks 2, 3, 4, 5 */}
            <div style={{ position: 'relative', height: '32px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              {/* Block 2 */}
              <div
                style={{
                  position: 'absolute',
                  left: '0%',
                  width: '20.8%',
                  height: '100%',
                  background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                  border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                }}
              >
                {algoMode === 'dp' ? '✔ Block 2 (65)' : '❌ Collided'}
              </div>

              {/* Block 3 */}
              <div
                style={{
                  position: 'absolute',
                  left: '25%',
                  width: '20.8%',
                  height: '100%',
                  background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                  border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                }}
              >
                {algoMode === 'dp' ? '✔ Block 3 (65)' : '❌ Collided'}
              </div>

              {/* Block 4 */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  width: '20.8%',
                  height: '100%',
                  background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                  border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                }}
              >
                {algoMode === 'dp' ? '✔ Block 4 (65)' : '❌ Collided'}
              </div>

              {/* Block 5 */}
              <div
                style={{
                  position: 'absolute',
                  left: '75%',
                  width: '20.8%',
                  height: '100%',
                  background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                  border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '800',
                  color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                }}
              >
                {algoMode === 'dp' ? '✔ Block 5 (65)' : '❌ Collided'}
              </div>
            </div>
          </div>

          {/* ===================================================================
              ALGORITHM EXPLANATION & MECHANISM (ACCORDING TO USER SPECIFICATION)
              =================================================================== */}

          {/* SECTION 1: FCFS MODE */}
          {algoMode === 'fcfs' && (
            <div className="anim-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div style={{ background: '#F8FAFC', border: '1.5px solid #64748B', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#64748B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    FCFS DECISION MECHANISM
                  </span>
                  <strong style={{ color: '#0F172A', fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                    Total Reward = 137
                  </strong>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#0F172A', fontWeight: '800' }}>
                  Processed Strictly by Ticket Creation Time
                </h4>

                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  FCFS has no concept of reward scores or duration optimization. It operates purely on queue arrival order:<br />
                  1. <strong>Ticket #1 (Block 1)</strong> was submitted first at <strong>06:00 AM</strong>. FCFS accepts it immediately into the timetable.<br />
                  2. Block 1 reserves the track from <strong>08:00 to 11:30</strong> (3.5 hours).<br />
                  3. When <strong>Tickets #2, #3, #4, and #5</strong> arrive later (06:05–06:20 AM), they are checked sequentially.<br />
                  4. Every subsequent ticket physically collides with the already-committed Block 1 on Track 1.<br />
                  5. <strong>Result:</strong> FCFS schedules only Ticket #1, rejecting all others due to arrival order collision.
                </p>
              </div>

              {/* FCFS Queue Log */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Ticket Queue Arrival Order:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', color: '#0F172A', fontWeight: '700' }}>
                    1. Ticket #1 (06:00 AM) ➜ COMMITTED: Block 1 (+137 pts)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    2. Ticket #2 (06:05 AM) ➜ ❌ REJECTED (Collides with Ticket #1)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    3. Ticket #3 (06:10 AM) ➜ ❌ REJECTED (Collides with Ticket #1)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    4. Ticket #4 (06:15 AM) ➜ ❌ REJECTED (Collides with Ticket #1)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    5. Ticket #5 (06:20 AM) ➜ ❌ REJECTED (Collides with Ticket #1)
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: GREEDY MODE (NO DP FORMULAS MENTIONED!) */}
          {algoMode === 'greedy' && (
            <div className="anim-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div style={{ background: '#FFFBEB', border: '1.5px solid #F59E0B', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#F59E0B', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    GREEDY DECISION MECHANISM
                  </span>
                  <strong style={{ color: '#D97706', fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                    Total Reward = 137
                  </strong>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#92400E', fontWeight: '800' }}>
                  Trapped by Choosing the Single Highest Reward Block
                </h4>

                <p style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  Greedy rule: <em>Always pick the candidate with the highest individual reward first.</em><br />
                  1. Greedy compares all 5 candidate rewards: <strong>Block 1 = 137</strong>, Block 2 = 65, Block 3 = 65, Block 4 = 65, Block 5 = 65.<br />
                  2. <strong>Block 1 is chosen</strong> because 137 is the highest individual reward on the board ($137 &gt; 65$).<br />
                  3. Greedy commits Block 1 immediately to Track 1.<br />
                  4. However, Block 1 is a massive <strong>3.5-hour possession (08:00 to 11:30)</strong>.<br />
                  5. Blocks 2, 3, 4, and 5 all fall inside that time window, causing direct physical track overlap!<br />
                  6. <strong>Greedy gets trapped:</strong> It cannot schedule any other block and ends with only <strong>137 points</strong>.
                </p>
              </div>

              {/* Greedy Scorecard Comparison */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Greedy Decision Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ background: '#FEF3C7', padding: '6px 10px', borderRadius: '6px', color: '#92400E', fontWeight: '800' }}>
                    ✔ Block 1: CHOSEN (Highest Reward: 137 pts)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    ❌ Block 2 (R = 65): Overlapped by Block 1
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    ❌ Block 3 (R = 65): Overlapped by Block 1
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    ❌ Block 4 (R = 65): Overlapped by Block 1
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    ❌ Block 5 (R = 65): Overlapped by Block 1
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: DP MODE (FULL FORMULA & RECURRENCE TABLE & BACKTRACKING) */}
          {algoMode === 'dp' && (
            <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F0FDF4', border: '1.5px solid #10B981', borderRadius: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#10B981', color: '#FFFFFF', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                    DYNAMIC PROGRAMMING (WIS) OPTIMIZATION
                  </span>
                  <strong style={{ color: '#059669', fontSize: '16px', fontFamily: 'var(--font-mono)' }}>
                    Total Cumulative Reward = 260 (+89.8% over Greedy)
                  </strong>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#065F46', fontWeight: '800' }}>
                  Evaluates Cumulative Non-Overlapping Combinations and Backtracks the Global Best
                </h4>

                <p style={{ fontSize: '12px', color: '#065F46', lineHeight: 1.5, margin: 0 }}>
                  DP does not fall for Block 1's high individual score. Instead:<br />
                  1. It sorts candidate blocks by <strong>finish time</strong> (Block 2, Block 3, Block 4, Block 1, Block 5).<br />
                  2. It solves the Bellman recurrence: <strong>DP[i] = max( DP[i-1], R(i) + DP[p(i)] )</strong>.<br />
                  3. When evaluating Block 1 ($R = 137$), DP computes $137 + 0 = 137 \le \text{DP}[3] = 195$. <strong>DP smartly EXCLUDES Block 1</strong> because the cumulative combination of shorter blocks already earns 195 points!<br />
                  4. At Block 5, DP achieves a maximum cumulative score of <strong>260 points</strong>.<br />
                  5. DP then <strong>backtracks through predecessor pointers</strong> ($5 \to 4 \to 3 \to 2$), selecting Blocks 2, 3, 4, and 5!
                </p>
              </div>

              {/* DP Recurrence Table */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#0F172A' }}>
                    DP Bellman Recurrence Table: DP[i] = max( DP[i-1], R(i) + DP[p(i)] )
                  </span>
                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                    Sorted by Finish Time
                  </span>
                </div>

                <div className="ops-table-container" style={{ margin: 0 }}>
                  <table className="ops-table" style={{ fontSize: '11.5px' }}>
                    <thead>
                      <tr>
                        <th>i</th>
                        <th>Candidate (Finish Time)</th>
                        <th>R(i)</th>
                        <th>Compatible Predecessor p(i)</th>
                        <th>Recurrence Evaluation</th>
                        <th>DP[i]</th>
                        <th>Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {DP_RECURRENCE_ROWS.map((row) => (
                        <tr key={row.i} style={{ background: row.action === 'INCLUDE' ? '#F0FDF4' : '#FFF1F2' }}>
                          <td className="cell-mono" style={{ fontWeight: '700' }}>{row.i}</td>
                          <td style={{ fontWeight: '700', color: row.action === 'INCLUDE' ? '#059669' : '#BE123C' }}>
                            {row.block} ({row.time})
                          </td>
                          <td className="cell-mono">{row.reward}</td>
                          <td className="cell-mono">{row.pred}</td>
                          <td className="cell-mono" style={{ fontWeight: '600' }}>{row.formula}</td>
                          <td className="cell-mono" style={{ fontWeight: '800', color: '#0F172A' }}>{row.dpVal}</td>
                          <td>
                            <span
                              style={{
                                background: row.action === 'INCLUDE' ? '#DCFCE7' : '#FEE2E2',
                                color: row.action === 'INCLUDE' ? '#15803D' : '#991B1B',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '800',
                                fontSize: '10px',
                              }}
                            >
                              {row.action}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Backtracking Trace Visual Cards */}
              <div style={{ background: '#F8FAFC', border: '1.5px solid #10B981', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#065F46', marginBottom: '10px' }}>
                  Backtracking Trace (Reverse Step Jump):
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>1. INSPECT i=5 (Block 5)</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '2px' }}>✔ SELECT Block 5 ➜ Jump to p(5) = Block 4</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>2. INSPECT i=3 (Block 4)</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '2px' }}>✔ SELECT Block 4 ➜ Jump to p(3) = Block 3</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>3. INSPECT i=2 (Block 3)</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '800', marginTop: '2px' }}>✔ SELECT Block 3 ➜ Jump to p(2) = Block 2</div>
                  </div>
                  <div style={{ background: '#DCFCE7', border: '2px solid #10B981', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#065F46', fontWeight: '800' }}>4. INSPECT i=1 (Block 2)</div>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: '900', marginTop: '2px' }}>★ SELECT Block 2 ➜ Base 0 Reached!</div>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #D1FAE5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: '#065F46' }}>
                    Reconstructed Optimal Solution: <strong>Block 2 (65) + Block 3 (65) + Block 4 (65) + Block 5 (65)</strong>
                  </span>
                  <strong style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>
                    Total DP Reward = 260 pts (+89.8% over Greedy's 137 pts)
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
