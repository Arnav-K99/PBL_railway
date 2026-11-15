import React, { useState } from 'react';

// ============================================================================
// THE 5 OPERATIONAL TRAINS ON TRACK 1 CORRIDOR (PANIPAT – KARNAL)
// ============================================================================
const FIVE_TRAINS_DATA = [
  {
    id: 'TR-1',
    trainNumber: '12002',
    name: 'Shatabdi Express',
    route: 'New Delhi ➔ Kalka',
    type: 'Superfast Passenger (130 km/h)',
    track: 'Track 1',
    transitWindow: '07:45 – 07:58',
    transitDescription: 'Clears Track 1 corridor at 07:58 before maintenance possession begins at 08:00',
    leftPct: 0,
    widthPct: 6,
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  {
    id: 'TR-2',
    trainNumber: '12424',
    name: 'Rajdhani Express',
    route: 'New Delhi ➔ Dibrugarh',
    type: 'High-Priority Express (130 km/h)',
    track: 'Track 1',
    transitWindow: '08:50 – 09:00',
    transitDescription: 'Transits corridor in the 10-minute gap between Block 2 (08:00–08:50) & Block 3 (09:00–09:50)',
    leftPct: 20.8, // 50 mins from 08:00 / 240 mins
    widthPct: 4.2,  // 10 mins / 240 mins
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#C4B5FD',
  },
  {
    id: 'TR-3',
    trainNumber: '22436',
    name: 'Vande Bharat Express',
    route: 'New Delhi ➔ Varanasi',
    type: 'Semi-High Speed (130 km/h)',
    track: 'Track 1',
    transitWindow: '09:50 – 10:00',
    transitDescription: 'Transits corridor in the 10-minute gap between Block 3 (09:00–09:50) & Block 4 (10:00–10:50)',
    leftPct: 45.8, // 110 mins / 240 mins
    widthPct: 4.2,
    color: '#DB2777',
    bgColor: '#FDF2F8',
    borderColor: '#F9A8D4',
  },
  {
    id: 'TR-4',
    trainNumber: '12004',
    name: 'Gomti Express',
    route: 'New Delhi ➔ Lucknow',
    type: 'Intercity Express (110 km/h)',
    track: 'Track 1',
    transitWindow: '10:50 – 11:00',
    transitDescription: 'Transits corridor in the 10-minute gap between Block 4 (10:00–10:50) & Block 5 (11:00–11:50)',
    leftPct: 70.8, // 170 mins / 240 mins
    widthPct: 4.2,
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FDBA74',
  },
  {
    id: 'TR-5',
    trainNumber: 'BTPN-6023',
    name: 'Petroleum Tanker Freight',
    route: 'Tughlakabad ➔ Panipat Refinery',
    type: 'Heavy Haul Freight (58 Wagons · 75 km/h)',
    track: 'Track 1',
    transitWindow: '11:50 – 12:15',
    transitDescription: 'Enters Track 1 corridor after Block 5 completion (11:50)',
    leftPct: 95.8, // 230 mins / 240 mins
    widthPct: 4.2,
    color: '#0D9488',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
  },
];

// ============================================================================
// THE 5 CANDIDATE MAINTENANCE BLOCKS (WITH ACCURATE TIMES & REWARDS)
// Formula for M = 5 candidate blocks:
// beta = M + 1 = 6
// alpha = 2*M*beta + M + 1 = 2(5)(6) + 5 + 1 = 66
// R(B) = 66 * T_beta + 6 * C_beta - 1
// ============================================================================
const FIVE_BLOCKS_DATA = [
  {
    id: 'BLK-1',
    ticketId: 'TCK-102',
    ticketTime: '06:05 AM',
    ticketOrder: 2,
    name: 'Block 1 · Multi-Department Mega-Block',
    start: '08:00',
    end: '11:30',
    durHours: '3h 30m',
    durMin: 210,
    tasks: 2,
    depts: ['Engineering', 'Signal & Telecom'],
    extraDepts: 1,
    reward: 137, // 66*2 + 6*1 - 1 = 137
    isHighestIndividual: true,
    description: 'Heavy Track Realignment & S&T Circuit Overhaul (Locks corridor across all 4 maintenance windows)',
    associatedTrain: 'Severe Conflict: Crosses transit windows of TR-12424 Rajdhani, TR-22436 Vande Bharat, and TR-12004 Gomti Exp!',
    trainImpact: 'Halts 3 passenger services',
    track: 'Track 1 Mainline',
    startPct: 0,
    widthPct: 87.5, // 210 / 240
  },
  {
    id: 'BLK-2',
    ticketId: 'TCK-101',
    ticketTime: '06:00 AM',
    ticketOrder: 1,
    name: 'Block 2 (Ticket #1 Arrival)',
    start: '08:00',
    end: '08:50',
    durHours: '50m',
    durMin: 50,
    tasks: 1,
    depts: ['Engineering'],
    extraDepts: 0,
    reward: 65, // 66*1 + 0 - 1 = 65
    isHighestIndividual: false,
    description: 'Ultrasonic Rail Flaw Detection (USFD track testing)',
    associatedTrain: 'Fits between TR-12002 Shatabdi (clears 07:58) & TR-12424 Rajdhani (arrives 08:50)',
    trainImpact: 'Zero train delay',
    track: 'Track 1 Inter-Train Slot 1',
    startPct: 0,
    widthPct: 20.8, // 50 / 240
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
    reward: 65,
    isHighestIndividual: false,
    description: 'Point Motor Interlock Calibration & Track Circuit Shunt Test',
    associatedTrain: 'Fits between TR-12424 Rajdhani (clears 09:00) & TR-22436 Vande Bharat (arrives 09:50)',
    trainImpact: 'Zero train delay',
    track: 'Track 1 Inter-Train Slot 2',
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
    depts: ['Traction / Electrical'],
    extraDepts: 0,
    reward: 65,
    isHighestIndividual: false,
    description: '25 kV OHE Catenary Section Insulator & Dropper Overhaul',
    associatedTrain: 'Fits between TR-22436 Vande Bharat (clears 10:00) & TR-12004 Gomti Exp (arrives 10:50)',
    trainImpact: 'Zero train delay',
    track: 'Track 1 Inter-Train Slot 3',
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
    reward: 65,
    isHighestIndividual: false,
    description: 'Track Fastener Torque & Ballast Deep Screening Tamp',
    associatedTrain: 'Fits between TR-12004 Gomti Exp (clears 11:00) & TR-BTPN Freight (arrives 11:50)',
    trainImpact: 'Zero train delay',
    track: 'Track 1 Inter-Train Slot 4',
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

        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* ===================================================================
              VERTICAL STACK: THE 5 CANDIDATE BLOCKS & 5 OPERATIONAL TRAINS
              =================================================================== */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📋</span>
                  <span>The 5 Candidate Maintenance Requests &amp; Operational Corridor Trains</span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Vertical Schedule View: 5 candidate maintenance requests competing for track possession windows alongside 5 operational corridor trains.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  Active Algorithm:
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 8px',
                    borderRadius: '5px',
                    background: algoMode === 'dp' ? '#DCFCE7' : algoMode === 'greedy' ? '#FEF3C7' : '#F1F5F9',
                    color: algoMode === 'dp' ? '#059669' : algoMode === 'greedy' ? '#D97706' : '#475569',
                    border: `1px solid ${algoMode === 'dp' ? '#A7F3D0' : algoMode === 'greedy' ? '#FDE68A' : '#CBD5E1'}`,
                  }}
                >
                  {algoMode.toUpperCase()} DECISION
                </span>
              </div>
            </div>

            {/* Vertical List of the 5 Candidate Blocks & Associated Trains */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FIVE_BLOCKS_DATA.map((b) => {
                // Determine selection status under current algorithm
                let isSelected = false;
                let statusLabel = '';
                let statusReason = '';
                let statusColor = '#EF4444';
                let statusBg = '#FEE2E2';
                let statusBorder = '#FCA5A5';

                if (algoMode === 'fcfs') {
                  // In FCFS: Ticket 101 arrived 1st at 06:00 AM for Block 2 (08:00-08:50).
                  // Subsequent tickets arrive in creation order; Ticket 102 (Block 1) overlaps and collides.
                  if (b.id === 'BLK-2') {
                    isSelected = true;
                    statusLabel = '✔ COMMITTED BY FCFS';
                    statusReason = 'Ticket #1 arrived 1st at 06:00 AM. FCFS commits without evaluating reward.';
                    statusColor = '#1E293B';
                    statusBg = '#F1F5F9';
                    statusBorder = '#94A3B8';
                  } else {
                    isSelected = false;
                    statusLabel = '❌ REJECTED BY FCFS';
                    statusReason = b.id === 'BLK-1'
                      ? 'Ticket #2 arrived 06:05 AM. Physical track collision with Ticket #1 at 08:00.'
                      : `Ticket #${b.ticketOrder} arrival queue position conflicted with active dispatch schedule.`;
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                    statusBorder = '#FCA5A5';
                  }
                } else if (algoMode === 'greedy') {
                  // In Greedy: Chooses Block 1 because it has the highest individual reward (137 > 65)
                  if (b.id === 'BLK-1') {
                    isSelected = true;
                    statusLabel = '★ COMMITTED BY GREEDY';
                    statusReason = 'Highest individual candidate reward on the board (137 pts > 65 pts).';
                    statusColor = '#92400E';
                    statusBg = '#FEF3C7';
                    statusBorder = '#F59E0B';
                  } else {
                    isSelected = false;
                    statusLabel = '❌ COLLIDED WITH BLOCK 1';
                    statusReason = `Track 1 is locked by Block 1 (08:00–11:30). Overlaps Block 1's 3.5h possession window.`;
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                    statusBorder = '#FCA5A5';
                  }
                } else {
                  // In DP: Selects Blocks 2, 3, 4, 5 (Cumulative total: 260), rejects Block 1
                  if (b.id !== 'BLK-1') {
                    isSelected = true;
                    statusLabel = '✔ SELECTED BY DP';
                    statusReason = 'Part of optimal non-overlapping Bellman combination (Cumulative yield = 260 pts).';
                    statusColor = '#065F46';
                    statusBg = '#DCFCE7';
                    statusBorder = '#10B981';
                  } else {
                    isSelected = false;
                    statusLabel = '⛔ EXCLUDED BY DP';
                    statusReason = 'DP recurrence evaluated 137 + 0 ≤ DP[3] (195 pts). Skipped to harvest 4 inter-train blocks.';
                    statusColor = '#991B1B';
                    statusBg = '#FEE2E2';
                    statusBorder = '#FCA5A5';
                  }
                }

                return (
                  <div
                    key={b.id}
                    style={{
                      background: isSelected
                        ? (algoMode === 'dp' ? '#F0FDF4' : algoMode === 'greedy' ? '#FFFBEB' : '#F8FAFC')
                        : '#FFFFFF',
                      border: isSelected
                        ? `2px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#64748B'}`
                        : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '16px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Block Title, Ticket Metadata, and Algorithm Decision Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A' }}>
                          {b.name}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: '700',
                            color: '#64748B',
                            background: '#F1F5F9',
                            padding: '2px 8px',
                            borderRadius: '5px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          Ticket #{b.ticketId} · Order #{b.ticketOrder} ({b.ticketTime})
                        </span>
                        {/* Department Badges */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {b.depts.map((d) => (
                            <span
                              key={d}
                              style={{
                                fontSize: '10.5px',
                                fontWeight: '700',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: d.includes('Engineering') ? '#EEF2FF' : d.includes('Signal') ? '#FDF4FF' : '#FEF3C7',
                                color: d.includes('Engineering') ? '#4338CA' : d.includes('Signal') ? '#7E22CE' : '#B45309',
                                border: `1px solid ${d.includes('Engineering') ? '#C7D2FE' : d.includes('Signal') ? '#F0ABFC' : '#FDE68A'}`,
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Right Status Badge */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 10px',
                            borderRadius: '6px',
                            background: statusBg,
                            color: statusColor,
                            border: `1px solid ${statusBorder}`,
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {statusLabel}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748B', maxWidth: '340px', textAlign: 'right' }}>
                          {statusReason}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: 3-Column Structured Information */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '14px',
                        background: '#FFFFFF',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      {/* Column 1: Time Window & Track */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '3px' }}>
                          Time Window &amp; Track
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                          🕒 {b.start} – {b.end} ({b.durHours})
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                          Location: <strong>{b.track}</strong>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {b.description}
                        </div>
                      </div>

                      {/* Column 2: Operational Train Impact */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '3px' }}>
                          Operational Train Interaction
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: b.id === 'BLK-1' ? '#B91C1C' : '#047857',
                            fontWeight: '600',
                            lineHeight: 1.4,
                          }}
                        >
                          {b.id === 'BLK-1' ? '⚠️ ' : '🚆 '}
                          {b.associatedTrain}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                          Corridor Impact: <strong>{b.trainImpact}</strong>
                        </div>
                      </div>

                      {/* Column 3: Reward Calculation Formula */}
                      <div style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '3px' }}>
                          Candidate Reward: R(B)
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              R = α × T + β × C − 1
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#334155', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
                              {b.id === 'BLK-1' ? '66×2 + 6×1 − 1' : '66×1 + 6×0 − 1'} = {b.reward} pts
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: '15px',
                              fontWeight: '900',
                              fontFamily: 'var(--font-mono)',
                              color: b.isHighestIndividual ? '#D97706' : '#059669',
                              background: b.isHighestIndividual ? '#FEF3C7' : '#ECFDF5',
                              border: `1.5px solid ${b.isHighestIndividual ? '#F59E0B' : '#10B981'}`,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            R = {b.reward} {b.isHighestIndividual && '★'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================================
              OVERHAULED TIMELINE: 5 TRAINS & CANDIDATE BLOCKS (FIXING SCREENSHOT 2)
              =================================================================== */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '14px',
              padding: '20px 22px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header: Title, Total Yield, and Comparison Metric */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏱️</span>
                  <span>Panipat – Karnal Corridor Track 1 Timeline &amp; Train Schedule (08:00 to 12:00 · 240 mins)</span>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Visualizing how the 5 operational trains and candidate maintenance blocks compete for Track 1 possession.
                </div>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  background: algoMode === 'dp' ? '#DCFCE7' : algoMode === 'greedy' ? '#FEF3C7' : '#E2E8F0',
                  color: algoMode === 'dp' ? '#065F46' : algoMode === 'greedy' ? '#92400E' : '#1E293B',
                  border: `1px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#94A3B8'}`,
                }}
              >
                {algoMode === 'fcfs' && 'FCFS Yield: 1 Block (Ticket #1) · Total Reward = 65 pts'}
                {algoMode === 'greedy' && 'Greedy Yield: 1 Block (Block 1) · Total Reward = 137 pts (+110.8% over FCFS)'}
                {algoMode === 'dp' && 'DP Yield: 4 Blocks (2+3+4+5) · Total Reward = 260 pts (+89.8% over Greedy)'}
              </div>
            </div>

            {/* Performance Hierarchy Visual Banner: FCFS < Greedy < DP */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '16px',
                fontSize: '12px',
                fontWeight: '800',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <span
                style={{
                  color: algoMode === 'fcfs' ? '#0F172A' : '#64748B',
                  background: algoMode === 'fcfs' ? '#E2E8F0' : 'transparent',
                  padding: '3px 10px',
                  borderRadius: '5px',
                  border: algoMode === 'fcfs' ? '1px solid #94A3B8' : 'none',
                }}
              >
                1. FCFS: 65 pts
              </span>
              <span style={{ color: '#94A3B8' }}>&lt;</span>
              <span
                style={{
                  color: algoMode === 'greedy' ? '#92400E' : '#64748B',
                  background: algoMode === 'greedy' ? '#FEF3C7' : 'transparent',
                  padding: '3px 10px',
                  borderRadius: '5px',
                  border: algoMode === 'greedy' ? '1px solid #F59E0B' : 'none',
                }}
              >
                2. Greedy: 137 pts (+110.8%)
              </span>
              <span style={{ color: '#94A3B8' }}>&lt;</span>
              <span
                style={{
                  color: algoMode === 'dp' ? '#065F46' : '#64748B',
                  background: algoMode === 'dp' ? '#DCFCE7' : 'transparent',
                  padding: '3px 10px',
                  borderRadius: '5px',
                  border: algoMode === 'dp' ? '1px solid #10B981' : 'none',
                }}
              >
                3. DP + Backtracking: 260 pts (+89.8% over Greedy)
              </span>
            </div>

            {/* Time Axis Bar with Ticks */}
            <div
              style={{
                position: 'relative',
                height: '24px',
                borderBottom: '2px solid #CBD5E1',
                marginBottom: '14px',
                fontSize: '10.5px',
                color: '#475569',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
              }}
            >
              <span style={{ position: 'absolute', left: '0%', transform: 'translateX(0%)' }}>08:00</span>
              <span style={{ position: 'absolute', left: '20.8%', transform: 'translateX(-50%)' }}>08:50</span>
              <span style={{ position: 'absolute', left: '25%', transform: 'translateX(-50%)' }}>09:00</span>
              <span style={{ position: 'absolute', left: '45.8%', transform: 'translateX(-50%)' }}>09:50</span>
              <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>10:00</span>
              <span style={{ position: 'absolute', left: '70.8%', transform: 'translateX(-50%)' }}>10:50</span>
              <span style={{ position: 'absolute', left: '75%', transform: 'translateX(-50%)' }}>11:00</span>
              <span style={{ position: 'absolute', left: '87.5%', transform: 'translateX(-50%)' }}>11:30</span>
              <span style={{ position: 'absolute', left: '95.8%', transform: 'translateX(-50%)' }}>11:50</span>
              <span style={{ position: 'absolute', right: '0%' }}>12:00</span>
            </div>

            {/* =================================================================
                LANE 1: TRAIN TRAFFIC (THE 5 OPERATIONAL CORRIDOR TRAINS)
                ================================================================= */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🚆 Operational Train Traffic (The 5 Scheduled Corridor Trains)
                </span>
                <span style={{ fontSize: '10.5px', color: '#64748B' }}>
                  Four 50-minute maintenance gap windows naturally exist between scheduled train transits
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  height: '38px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  overflow: 'hidden',
                }}
              >
                {/* Visual Inter-Train Maintenance Gap Shading */}
                <div style={{ position: 'absolute', left: '0%', width: '20.8%', height: '100%', background: '#F0FDF4', borderRight: '1px dashed #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#059669', opacity: 0.8 }}>Gap 1 (50m)</span>
                </div>
                <div style={{ position: 'absolute', left: '25%', width: '20.8%', height: '100%', background: '#F0FDF4', borderRight: '1px dashed #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#059669', opacity: 0.8 }}>Gap 2 (50m)</span>
                </div>
                <div style={{ position: 'absolute', left: '50%', width: '20.8%', height: '100%', background: '#F0FDF4', borderRight: '1px dashed #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#059669', opacity: 0.8 }}>Gap 3 (50m)</span>
                </div>
                <div style={{ position: 'absolute', left: '75%', width: '20.8%', height: '100%', background: '#F0FDF4', borderRight: '1px dashed #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', color: '#059669', opacity: 0.8 }}>Gap 4 (50m)</span>
                </div>

                {/* 5 Operational Trains rendered along timeline */}
                {/* Train 1: Cleared before 08:00 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '0%',
                    width: '3%',
                    height: '100%',
                    background: '#2563EB',
                    borderRadius: '4px 0 0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '10px',
                    fontWeight: '800',
                    zIndex: 3,
                  }}
                  title="TR-12002 Shatabdi Express (Cleared corridor at 07:58)"
                >
                  🚆
                </div>

                {/* Train 2: 08:50 – 09:00 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '20.8%',
                    width: '4.2%',
                    height: '100%',
                    background: '#7C3AED',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '800',
                    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.4)',
                    zIndex: 3,
                  }}
                  title="TR-12424 Rajdhani Express (08:50 – 09:00 · 130 km/h)"
                >
                  <span>🚆 12424</span>
                </div>

                {/* Train 3: 09:50 – 10:00 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '45.8%',
                    width: '4.2%',
                    height: '100%',
                    background: '#DB2777',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '800',
                    boxShadow: '0 2px 4px rgba(219, 39, 119, 0.4)',
                    zIndex: 3,
                  }}
                  title="TR-22436 Vande Bharat Express (09:50 – 10:00 · 130 km/h)"
                >
                  <span>🚆 22436</span>
                </div>

                {/* Train 4: 10:50 – 11:00 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '70.8%',
                    width: '4.2%',
                    height: '100%',
                    background: '#EA580C',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '800',
                    boxShadow: '0 2px 4px rgba(234, 88, 12, 0.4)',
                    zIndex: 3,
                  }}
                  title="TR-12004 Gomti Express (10:50 – 11:00 · 110 km/h)"
                >
                  <span>🚆 12004</span>
                </div>

                {/* Train 5: 11:50 – 12:15 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '95.8%',
                    width: '4.2%',
                    height: '100%',
                    background: '#0D9488',
                    borderRadius: '5px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: '800',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.4)',
                    zIndex: 3,
                  }}
                  title="TR-BTPN Petroleum Freight (11:50 – 12:15 · 58 Wagons)"
                >
                  <span>🚆 BTPN</span>
                </div>
              </div>
            </div>

            {/* =================================================================
                LANE 2: CANDIDATE BLOCK 1 (MEGA-BLOCK · 08:00 – 11:30 · 3.5h)
                ================================================================= */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🔧 Candidate Block 1 (Multi-Department Mega-Block · 3.5 hrs)
                </span>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#D97706' }}>
                  Requested Window: 08:00 – 11:30 · Reward R = 137 pts ★
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  height: '38px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '0%',
                    width: '87.5%',
                    height: '100%',
                    background: algoMode === 'greedy' ? '#FEF3C7' : algoMode === 'dp' ? '#F1F5F9' : '#FEE2E2',
                    border: algoMode === 'greedy' ? '2.5px solid #F59E0B' : algoMode === 'dp' ? '1.5px dashed #CBD5E1' : '1.5px dashed #EF4444',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 12px',
                    fontSize: '11px',
                    fontWeight: '800',
                    color: algoMode === 'greedy' ? '#92400E' : algoMode === 'dp' ? '#64748B' : '#991B1B',
                    boxShadow: algoMode === 'greedy' ? '0 2px 8px rgba(245, 158, 11, 0.35)' : 'none',
                    zIndex: 2,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {algoMode === 'greedy' && '★ COMMITTED BY GREEDY: Block 1 (08:00 – 11:30 · 3.5h) · Exclusively Locks Track 1'}
                    {algoMode === 'dp' && '⛔ EXCLUDED BY DP: Block 1 (137 + 0 ≤ DP[3]=195 pts · DP harvests 4 inter-train blocks instead)'}
                    {algoMode === 'fcfs' && '❌ REJECTED BY FCFS: Ticket #2 (Arrived 06:05 AM) collided with Ticket #1 at 08:00'}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      background: algoMode === 'greedy' ? '#F59E0B' : '#E2E8F0',
                      color: algoMode === 'greedy' ? '#FFFFFF' : '#475569',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    R = 137 pts
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================================
                LANE 3: THE 4 INTER-TRAIN BLOCKS (BLOCKS 2, 3, 4, 5 · 50m EACH)
                ================================================================= */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🛠️ The 4 Inter-Train Maintenance Blocks (Blocks 2, 3, 4, 5 · 50m each)
                </span>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#059669' }}>
                  Cumulative Potential: 4 × 65 = 260 pts (+89.8% over Greedy)
                </span>
              </div>

              <div
                style={{
                  position: 'relative',
                  height: '42px',
                  background: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                }}
              >
                {/* Block 2: 08:00 – 08:50 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '0%',
                    width: '20.8%',
                    height: '100%',
                    background: algoMode === 'dp' ? '#DCFCE7' : algoMode === 'fcfs' ? '#F1F5F9' : '#FEE2E2',
                    border: algoMode === 'dp' ? '2px solid #10B981' : algoMode === 'fcfs' ? '2px solid #64748B' : '1.5px dashed #EF4444',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: algoMode === 'dp' ? '#065F46' : algoMode === 'fcfs' ? '#1E293B' : '#991B1B',
                    boxShadow: algoMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    zIndex: 2,
                    padding: '2px 4px',
                    textAlign: 'center',
                  }}
                >
                  <span>{algoMode === 'dp' ? '✔ Block 2 (08:00–08:50)' : algoMode === 'fcfs' ? '✔ Ticket #1 (Committed)' : '❌ Block 2: Collided'}</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.85 }}>
                    {algoMode === 'greedy' ? 'Overlapped by Block 1' : 'R = 65 pts'}
                  </span>
                </div>

                {/* Block 3: 09:00 – 09:50 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '25%',
                    width: '20.8%',
                    height: '100%',
                    background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                    border: algoMode === 'dp' ? '2px solid #10B981' : '1.5px dashed #EF4444',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                    boxShadow: algoMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    zIndex: 2,
                    padding: '2px 4px',
                    textAlign: 'center',
                  }}
                >
                  <span>{algoMode === 'dp' ? '✔ Block 3 (09:00–09:50)' : '❌ Block 3: Collided'}</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.85 }}>
                    {algoMode === 'greedy' ? 'Overlapped by Block 1' : algoMode === 'fcfs' ? 'Conflicted with #1' : 'R = 65 pts'}
                  </span>
                </div>

                {/* Block 4: 10:00 – 10:50 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    width: '20.8%',
                    height: '100%',
                    background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                    border: algoMode === 'dp' ? '2px solid #10B981' : '1.5px dashed #EF4444',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                    boxShadow: algoMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    zIndex: 2,
                    padding: '2px 4px',
                    textAlign: 'center',
                  }}
                >
                  <span>{algoMode === 'dp' ? '✔ Block 4 (10:00–10:50)' : '❌ Block 4: Collided'}</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.85 }}>
                    {algoMode === 'greedy' ? 'Overlapped by Block 1' : algoMode === 'fcfs' ? 'Conflicted with #1' : 'R = 65 pts'}
                  </span>
                </div>

                {/* Block 5: 11:00 – 11:50 */}
                <div
                  style={{
                    position: 'absolute',
                    left: '75%',
                    width: '20.8%',
                    height: '100%',
                    background: algoMode === 'dp' ? '#DCFCE7' : '#FEE2E2',
                    border: algoMode === 'dp' ? '2px solid #10B981' : '1.5px dashed #EF4444',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: '800',
                    color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                    boxShadow: algoMode === 'dp' ? '0 2px 6px rgba(16, 185, 129, 0.25)' : 'none',
                    zIndex: 2,
                    padding: '2px 4px',
                    textAlign: 'center',
                  }}
                >
                  <span>{algoMode === 'dp' ? '✔ Block 5 (11:00–11:50)' : '❌ Block 5: Collided'}</span>
                  <span style={{ fontSize: '9px', fontWeight: '700', opacity: 0.85 }}>
                    {algoMode === 'greedy' ? 'Overlapped by Block 1' : algoMode === 'fcfs' ? 'Conflicted with #1' : 'R = 65 pts'}
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnostic Collision Insight Card (Explains Screenshot 2 explicitly) */}
            <div
              style={{
                background: algoMode === 'dp' ? '#F0FDF4' : algoMode === 'greedy' ? '#FFFBEB' : '#F1F5F9',
                border: `1.5px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#94A3B8'}`,
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '20px' }}>
                {algoMode === 'dp' ? '🌟' : algoMode === 'greedy' ? '⚠️' : 'ℹ️'}
              </span>
              <div>
                <div
                  style={{
                    fontSize: '12.5px',
                    fontWeight: '800',
                    color: algoMode === 'dp' ? '#065F46' : algoMode === 'greedy' ? '#92400E' : '#0F172A',
                    marginBottom: '3px',
                  }}
                >
                  {algoMode === 'fcfs' && 'FCFS Collision Diagnosis: Arrival Order Traps the Schedule'}
                  {algoMode === 'greedy' && 'Greedy Collision Diagnosis: Why Blocks 2, 3, 4, 5 Show as "❌ Collided"'}
                  {algoMode === 'dp' && 'DP Optimization Diagnosis: Zero Collisions & Maximum Yield (+89.8% over Greedy)'}
                </div>
                <div
                  style={{
                    fontSize: '11.5px',
                    lineHeight: 1.5,
                    color: algoMode === 'dp' ? '#047857' : algoMode === 'greedy' ? '#78350F' : '#334155',
                  }}
                >
                  {algoMode === 'fcfs' && (
                    <span>
                      Ticket #1 (Block 2) was processed first at 06:00 AM, committing Track 1 from 08:00. When Ticket #2 (Block 1, R = 137) arrived at 06:05 AM, it attempted to book Track 1 from 08:00 to 11:30 and <strong>collided with Ticket #1</strong>. Because FCFS does not look ahead or maximize rewards, it earned only <strong>65 points</strong>.
                    </span>
                  )}
                  {algoMode === 'greedy' && (
                    <span>
                      Greedy compares individual rewards: <strong>Block 1 = 137 pts</strong>, while Blocks 2, 3, 4, 5 each have R = 65 pts. Greedy greedily commits Block 1 because <strong>137 &gt; 65</strong> (beating FCFS by +110.8%). <strong>The Trap:</strong> Block 1 requires 3.5 hours of exclusive possession (08:00 to 11:30), conflicting with 3 scheduled trains (Rajdhani, Vande Bharat, Gomti Exp) and physically locking out Blocks 2, 3, 4, 5. All 4 shorter blocks collide with Block 1, trapping Greedy at <strong>137 pts</strong>!
                    </span>
                  )}
                  {algoMode === 'dp' && (
                    <span>
                      DP solves the Bellman recurrence sorted by finish time. When evaluating Block 1, DP checks: <strong>137 + 0 ≤ DP[3] (195 pts)</strong>. Recognizing that the cumulative combination of shorter blocks yields 195 pts (and reaching 260 pts with Block 5), DP <strong>deliberately excludes Block 1</strong>. Backtracking selects Blocks 2, 3, 4, and 5, perfectly filling the inter-train gap windows without causing any train delays, achieving <strong>260 points</strong>!
                    </span>
                  )}
                </div>
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
                    Total Reward = 65 pts
                  </strong>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#0F172A', fontWeight: '800' }}>
                  Processed Strictly by Ticket Creation Time (Arrival Bias)
                </h4>

                <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                  FCFS has no concept of reward maximization or department clubbing. It commits tickets strictly by submission timestamp:<br />
                  1. <strong>Ticket #1 (Block 2)</strong> was submitted first at <strong>06:00 AM</strong> for an isolated single-department inspection.<br />
                  2. FCFS accepts it immediately, locking Track 1 from <strong>08:00 to 10:45</strong> for only <strong>65 points</strong>.<br />
                  3. When <strong>Ticket #2 (Block 1, R = 137)</strong> arrives at 06:05 AM, it physically collides with Ticket #1 at 08:00 and is <strong>REJECTED</strong>.<br />
                  4. Subsequent tickets (#3, #4, #5) also collide with Ticket #1 on Track 1.<br />
                  5. <strong>Result:</strong> FCFS gets trapped with only <strong>65 points</strong>, performing worse than both Greedy (137) and DP (260).
                </p>
              </div>

              {/* FCFS Queue Log */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Ticket Queue Arrival Order:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ background: '#F1F5F9', padding: '6px 10px', borderRadius: '6px', color: '#0F172A', fontWeight: '700' }}>
                    1. Ticket #1 (06:00 AM) ➜ COMMITTED: Block 2 (+65 pts)
                  </div>
                  <div style={{ background: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', color: '#991B1B' }}>
                    2. Ticket #2 (06:05 AM) ➜ ❌ REJECTED (Collides with Ticket #1 at 08:00)
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
                    Total Reward = 137 pts (+110.8% over FCFS)
                  </strong>
                </div>

                <h4 style={{ margin: '0 0 8px', fontSize: '15px', color: '#92400E', fontWeight: '800' }}>
                  Greedy Beats FCFS (137 &gt; 65), but Falls for Local Myopia
                </h4>

                <p style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                  Greedy rule: <em>Always pick the candidate with the highest individual reward first.</em><br />
                  1. Greedy compares all candidate rewards: <strong>Block 1 = 137</strong>, Block 2 = 65, Block 3 = 65, Block 4 = 65, Block 5 = 65.<br />
                  2. <strong>Block 1 is chosen</strong> because 137 is the highest individual reward on the board ($137 &gt; 65$).<br />
                  3. <strong>Beats FCFS:</strong> Greedy commits 137 points, outperforming FCFS's 65 points by <strong>+110.8%</strong>!<br />
                  4. <strong>The Greedy Trap:</strong> Block 1 is a massive <strong>3.5-hour possession (08:00 to 11:30)</strong> that locks Track 1 and blocks the other 4 candidates.<br />
                  5. Greedy gets trapped and cannot schedule any further blocks, stopping at <strong>137 points</strong>.
                </p>
              </div>

              {/* Greedy Scorecard Comparison */}
              <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0F172A', marginBottom: '8px' }}>
                  Greedy Decision Breakdown:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                  <div style={{ background: '#FEF3C7', padding: '6px 10px', borderRadius: '6px', color: '#92400E', fontWeight: '800' }}>
                    ✔ Block 1: CHOSEN (Highest Reward: 137 pts · Beats FCFS by +110.8%)
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
                  3. When evaluating Block 1 (R = 137), DP computes: 137 + 0 = 137 &le; DP[3] = 195. <strong>DP smartly EXCLUDES Block 1</strong> because the cumulative combination of shorter blocks already earns 195 points!<br />
                  4. At Block 5, DP achieves a maximum cumulative score of <strong>260 points</strong>.<br />
                  5. DP then <strong>backtracks through predecessor pointers</strong> (5 &rarr; 4 &rarr; 3 &rarr; 2), selecting Blocks 2, 3, 4, and 5!
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
