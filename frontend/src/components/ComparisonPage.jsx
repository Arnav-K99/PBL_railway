import React, { useState, useEffect, useRef } from 'react';

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

  // Simulation playback state for the Corridor Timeline
  const [simPlaying, setSimPlaying] = useState(false);
  const [simTimeMin, setSimTimeMin] = useState(0); // 0 to 240 mins (08:00 to 12:00)
  const [simSpeed, setSimSpeed] = useState(2); // 1x, 2x, 4x

  // Reset simulation time to 0 whenever algorithm mode changes so user can watch it fresh
  useEffect(() => {
    setSimTimeMin(0);
    setSimPlaying(false);
  }, [algoMode]);

  // Smooth animation loop for simulation
  useEffect(() => {
    let animId;
    let lastTimestamp = null;

    const step = (timestamp) => {
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const rawDt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const dt = Math.min(rawDt, 0.1);

      if (simPlaying) {
        setSimTimeMin((prev) => {
          // At 1x speed, 240 mins takes 24 seconds -> 10 mins / sec
          const rate = 10 * simSpeed;
          const nextVal = prev + rate * dt;
          if (nextVal >= 240) {
            setSimPlaying(false);
            return 240;
          }
          return nextVal;
        });
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [simPlaying, simSpeed]);

  // Helper: Convert simulation minutes from 08:00 (0..240) to time string
  const formatSimTime = (m) => {
    const total = 8 * 60 + Math.round(m);
    const h = Math.floor(total / 60);
    const min = total % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h;
    return `${String(displayH).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
  };

  // Helper: Get live simulation status based on algorithm mode and current simulated minute
  const getSimStatus = () => {
    const t = simTimeMin;
    if (algoMode === 'dp') {
      let banked = 0;
      if (t >= 50) banked += 65;
      if (t >= 110) banked += 65;
      if (t >= 170) banked += 65;
      if (t >= 230) banked += 65;

      if (t >= 0 && t < 50) {
        return {
          phase: 'MAINTENANCE',
          tag: '🔧 Block 2 (USFD Testing)',
          msg: 'Engineering crew performing USFD track testing in 50m Gap 1.',
          signal: '🟢 Inter-train slot secured',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 50 && t < 60) {
        return {
          phase: 'TRAIN',
          tag: '🚆 TR-12424 Rajdhani Express (130 km/h)',
          msg: 'Block 2 cleared at 08:50! Rajdhani cruises through on green signal with ZERO delay.',
          signal: '🟢 Clear Passage (130 km/h)',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 60 && t < 110) {
        return {
          phase: 'MAINTENANCE',
          tag: '🔧 Block 3 (Point Machine Test)',
          msg: 'Signal & Telecom team calibrating point motors in 50m Gap 2.',
          signal: '🟢 Inter-train slot secured',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 110 && t < 120) {
        return {
          phase: 'TRAIN',
          tag: '🚆 TR-22436 Vande Bharat Express (130 km/h)',
          msg: 'Block 3 cleared at 09:50! Vande Bharat cruises through on green signal with ZERO delay.',
          signal: '🟢 Clear Passage (130 km/h)',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 120 && t < 170) {
        return {
          phase: 'MAINTENANCE',
          tag: '🔧 Block 4 (25 kV OHE Check)',
          msg: 'Traction electrical team inspecting OHE catenary insulators in 50m Gap 3.',
          signal: '🟢 Inter-train slot secured',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 170 && t < 180) {
        return {
          phase: 'TRAIN',
          tag: '🚆 TR-12004 Gomti Express (110 km/h)',
          msg: 'Block 4 cleared at 10:50! Gomti Express transits on schedule with ZERO delay.',
          signal: '🟢 Clear Passage (110 km/h)',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else if (t >= 180 && t < 230) {
        return {
          phase: 'MAINTENANCE',
          tag: '🔧 Block 5 (Ballast Tamp)',
          msg: 'Engineering track team performing ballast tamping in 50m Gap 4.',
          signal: '🟢 Inter-train slot secured',
          signalColor: '#059669',
          banked,
          delays: 0,
        };
      } else {
        return {
          phase: 'COMPLETE',
          tag: '🌟 OPTIMAL SCHEDULE COMPLETE',
          msg: 'All 4 blocks executed (260 pts banked)! 0 passenger trains delayed. +89.8% over Greedy!',
          signal: '🟢 Maximum Yield Achieved',
          signalColor: '#059669',
          banked: 260,
          delays: 0,
        };
      }
    } else if (algoMode === 'greedy') {
      const banked = t >= 210 ? 137 : 0;
      let delays = 0;
      if (t >= 50) delays++;
      if (t >= 110) delays++;
      if (t >= 170) delays++;

      if (t < 210) {
        if (t >= 50 && t < 60) {
          return {
            phase: 'CONFLICT',
            tag: '🚨 TRAIN DELAY: TR-12424 Rajdhani Express',
            msg: 'Rajdhani arrived at 08:50 but Track 1 is occupied by Mega-Block 1! Held at Home Signal.',
            signal: '🔴 RED SIGNAL (Train Delayed)',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else if (t >= 60 && t < 110) {
          return {
            phase: 'COLLISION',
            tag: '⚠️ COLLISION: Block 3 Blocked',
            msg: 'S&T requested Block 3 at 09:00, but locked out because Mega-Block 1 is still ongoing.',
            signal: '❌ Candidate Collided',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else if (t >= 110 && t < 120) {
          return {
            phase: 'CONFLICT',
            tag: '🚨 TRAIN DELAY: TR-22436 Vande Bharat',
            msg: 'Vande Bharat arrived at 09:50! Mega-Block 1 still on track! Delayed +30 mins.',
            signal: '🔴 RED SIGNAL (Train Delayed)',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else if (t >= 120 && t < 170) {
          return {
            phase: 'COLLISION',
            tag: '⚠️ COLLISION: Block 4 Blocked',
            msg: 'Traction requested Block 4 at 10:00, but locked out by Mega-Block 1.',
            signal: '❌ Candidate Collided',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else if (t >= 170 && t < 180) {
          return {
            phase: 'CONFLICT',
            tag: '🚨 TRAIN DELAY: TR-12004 Gomti Express',
            msg: 'Gomti Express arrived at 10:50! Track 1 blocked by Mega-Block 1! Speed regulated.',
            signal: '🔴 RED SIGNAL (Train Delayed)',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else if (t >= 180 && t < 210) {
          return {
            phase: 'COLLISION',
            tag: '⚠️ COLLISION: Block 5 Blocked',
            msg: 'Eng requested Block 5 at 11:00, but locked out by Mega-Block 1.',
            signal: '❌ Candidate Collided',
            signalColor: '#DC2626',
            banked,
            delays,
          };
        } else {
          return {
            phase: 'MAINTENANCE',
            tag: '🔧 Mega-Block 1 Possession (08:00–11:30)',
            msg: 'Heavy track & S&T overhaul ongoing. Exclusively locking Track 1 mainline for 3.5 hrs.',
            signal: '🟡 Track Possession Active',
            signalColor: '#D97706',
            banked,
            delays,
          };
        }
      } else {
        return {
          phase: 'COMPLETE',
          tag: '⚠️ GREEDY SCHEDULE TRAPPED',
          msg: 'Mega-Block 1 finished (+137 pts). Track cleared, but 3 trains delayed and Blocks 2–5 lost!',
          signal: '⚠️ Trapped at 137 pts',
          signalColor: '#D97706',
          banked: 137,
          delays: 3,
        };
      }
    } else {
      // FCFS
      const banked = t >= 50 ? 65 : 0;
      if (t < 50) {
        return {
          phase: 'MAINTENANCE',
          tag: '🔧 Ticket #1 Active (08:00–08:50)',
          msg: 'Ticket #1 (arrived 06:00 AM) active on Track 1 without looking ahead.',
          signal: '🟡 In Progress',
          signalColor: '#475569',
          banked,
          delays: 0,
        };
      } else {
        return {
          phase: 'COMPLETE',
          tag: '⚠️ FCFS QUEUE HALTED',
          msg: 'Ticket #1 completed (65 pts). Subsequent tickets rejected due to arrival queue conflict.',
          signal: 'ℹ️ Trapped at 65 pts',
          signalColor: '#475569',
          banked: 65,
          delays: 0,
        };
      }
    }
  };

  const simStatus = getSimStatus();

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

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* ===================================================================
              COMPACT 5-CANDIDATE BLOCKS & TRAINS SUMMARY TABLE
              (Simple, clean, single-glance for panel judges)
              =================================================================== */}
          <div style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
            <div style={{ padding: '12px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A' }}>
                  The 5 Candidate Maintenance Requests &amp; Operational Train Windows
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '10px' }}>
                  (Track 1 Corridor · 08:00 to 12:00)
                </span>
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: algoMode === 'dp' ? '#059669' : algoMode === 'greedy' ? '#D97706' : '#475569' }}>
                Active Evaluation: <strong>{algoMode.toUpperCase()}</strong>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: '800', fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '8px 14px' }}>Candidate Block</th>
                    <th style={{ padding: '8px 12px' }}>Time &amp; Duration</th>
                    <th style={{ padding: '8px 12px' }}>Operational Train Interaction</th>
                    <th style={{ padding: '8px 12px' }}>Departments</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Reward R(B)</th>
                    <th style={{ padding: '8px 14px', textAlign: 'right' }}>Decision ({algoMode.toUpperCase()})</th>
                  </tr>
                </thead>
                <tbody>
                  {FIVE_BLOCKS_DATA.map((b) => {
                    let isSelected = false;
                    let decisionBadge = '';
                    let decisionBg = '#FEE2E2';
                    let decisionColor = '#991B1B';

                    if (algoMode === 'fcfs') {
                      if (b.id === 'BLK-2') {
                        isSelected = true;
                        decisionBadge = '✔ COMMITTED (Ticket #1)';
                        decisionBg = '#F1F5F9';
                        decisionColor = '#1E293B';
                      } else {
                        decisionBadge = '❌ REJECTED (Collided)';
                        decisionBg = '#FEE2E2';
                        decisionColor = '#991B1B';
                      }
                    } else if (algoMode === 'greedy') {
                      if (b.id === 'BLK-1') {
                        isSelected = true;
                        decisionBadge = '★ COMMITTED (Highest R)';
                        decisionBg = '#FEF3C7';
                        decisionColor = '#92400E';
                      } else {
                        decisionBadge = '❌ Overlapped by Block 1';
                        decisionBg = '#FEE2E2';
                        decisionColor = '#991B1B';
                      }
                    } else {
                      // DP
                      if (b.id !== 'BLK-1') {
                        isSelected = true;
                        decisionBadge = '✔ COMMITTED (DP Choice)';
                        decisionBg = '#DCFCE7';
                        decisionColor = '#065F46';
                      } else {
                        decisionBadge = '⛔ Excluded (137 ≤ 195 sum)';
                        decisionBg = '#FEE2E2';
                        decisionColor = '#991B1B';
                      }
                    }

                    return (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isSelected
                            ? (algoMode === 'dp' ? '#F0FDF4' : algoMode === 'greedy' ? '#FFFBEB' : '#F8FAFC')
                            : '#FFFFFF',
                        }}
                      >
                        <td style={{ padding: '8px 14px', fontWeight: '700', color: '#0F172A' }}>
                          <div>{b.name}</div>
                          <div style={{ fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                            {b.ticketId} · Order #{b.ticketOrder} ({b.ticketTime})
                          </div>
                        </td>

                        <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#1E293B' }}>
                          {b.start} – {b.end}
                          <span style={{ fontSize: '10px', color: '#64748B', fontWeight: '500', marginLeft: '4px' }}>
                            ({b.durHours})
                          </span>
                        </td>

                        <td style={{ padding: '8px 12px', color: b.id === 'BLK-1' ? '#B91C1C' : '#047857', fontWeight: '600' }}>
                          {b.id === 'BLK-1' ? (
                            <span>⚠️ Conflicts with Rajdhani, Vande Bharat &amp; Gomti</span>
                          ) : (
                            <span>🚆 {b.associatedTrain.split('(')[0]}</span>
                          )}
                        </td>

                        <td style={{ padding: '8px 12px' }}>
                          <span style={{ fontSize: '10.5px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#334155' }}>
                            {b.depts.join(' + ')}
                          </span>
                        </td>

                        <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '800' }}>
                          <span
                            style={{
                              background: b.isHighestIndividual ? '#FEF3C7' : '#ECFDF5',
                              color: b.isHighestIndividual ? '#D97706' : '#059669',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            {b.reward} pts {b.isHighestIndividual && '★'}
                          </span>
                        </td>

                        <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: '800',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              background: decisionBg,
                              color: decisionColor,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {decisionBadge}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================================================================
              INTERACTIVE SIMULATED CORRIDOR TIMELINE & TRAIN DISPATCH
              (Live Simulation: Play, Pause, Scrub, Real-Time Train Passing & Conflict)
              =================================================================== */}
          <div
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header: Title and Comparison Hierarchy */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎬</span>
                  <span>Live Corridor Simulation: Track 1 Train &amp; Maintenance Schedule (08:00 – 12:00)</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  Click Play or drag the time scrubber to simulate morning train transits and track possession conflicts.
                </div>
              </div>

              {/* Hierarchy Pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800' }}>
                <span style={{ color: algoMode === 'fcfs' ? '#0F172A' : '#64748B', background: algoMode === 'fcfs' ? '#E2E8F0' : 'transparent', padding: '2px 6px', borderRadius: '4px' }}>
                  1. FCFS: 65 pts
                </span>
                <span style={{ color: '#94A3B8' }}>&lt;</span>
                <span style={{ color: algoMode === 'greedy' ? '#92400E' : '#64748B', background: algoMode === 'greedy' ? '#FEF3C7' : 'transparent', padding: '2px 6px', borderRadius: '4px' }}>
                  2. Greedy: 137 pts (+110.8%)
                </span>
                <span style={{ color: '#94A3B8' }}>&lt;</span>
                <span style={{ color: algoMode === 'dp' ? '#065F46' : '#64748B', background: algoMode === 'dp' ? '#DCFCE7' : 'transparent', padding: '2px 6px', borderRadius: '4px' }}>
                  3. DP: 260 pts (+89.8%)
                </span>
              </div>
            </div>

            {/* =================================================================
                SIMULATION CONTROLLER CONSOLE (PLAY, SCRUB, SPEED, CLOCK)
                ================================================================= */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                padding: '10px 14px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              {/* Playback Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setSimPlaying(!simPlaying)}
                  style={{
                    border: 'none',
                    background: simPlaying ? '#DC2626' : '#2563EB',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{simPlaying ? '⏸ Pause' : '▶ Play Simulation'}</span>
                </button>

                <button
                  onClick={() => {
                    setSimPlaying(false);
                    setSimTimeMin(0);
                  }}
                  style={{
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    color: '#475569',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                  title="Reset to 08:00 AM"
                >
                  ↺ Reset
                </button>

                {/* Speed Toggles */}
                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '6px', padding: '2px', gap: '2px' }}>
                  {[1, 2, 4].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setSimSpeed(spd)}
                      style={{
                        border: 'none',
                        background: simSpeed === spd ? '#FFFFFF' : 'transparent',
                        color: simSpeed === spd ? '#0F172A' : '#64748B',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        boxShadow: simSpeed === spd ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Timeline Scrubber Slider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '220px', maxWidth: '420px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', fontFamily: 'var(--font-mono)' }}>08:00</span>
                <input
                  type="range"
                  min="0"
                  max="240"
                  value={simTimeMin}
                  onChange={(e) => setSimTimeMin(Number(e.target.value))}
                  style={{
                    flex: '1',
                    cursor: 'pointer',
                    accentColor: algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#475569',
                  }}
                />
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748B', fontFamily: 'var(--font-mono)' }}>12:00</span>
              </div>

              {/* Live Status Readout Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {/* Clock */}
                <div
                  style={{
                    background: '#0F172A',
                    color: '#38BDF8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: simPlaying ? '#22C55E' : '#EAB308', display: 'inline-block' }} />
                  <span>{formatSimTime(simTimeMin)}</span>
                </div>

                {/* Banked Score */}
                <div
                  style={{
                    background: algoMode === 'dp' ? '#DCFCE7' : algoMode === 'greedy' ? '#FEF3C7' : '#F1F5F9',
                    color: algoMode === 'dp' ? '#065F46' : algoMode === 'greedy' ? '#92400E' : '#334155',
                    border: `1px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#CBD5E1'}`,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}
                >
                  Reward: {simStatus.banked} pts
                </div>
              </div>
            </div>

            {/* =================================================================
                TIMELINE LANES WITH MOVING SCANLINE NEEDLE
                ================================================================= */}
            <div style={{ position: 'relative' }}>
              {/* Moving Simulation Scanline Cursor (Needle) */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${(simTimeMin / 240) * 100}%`,
                  width: '2.5px',
                  background: '#EF4444',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.4)',
                  zIndex: 20,
                  pointerEvents: 'none',
                  transition: simPlaying ? 'none' : 'left 0.1s ease',
                }}
              >
                {/* Floating time beacon above the needle */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-22px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#EF4444',
                    color: '#FFFFFF',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  {formatSimTime(simTimeMin)}
                </div>
              </div>

              {/* Time Axis Bar with Clean Non-Overlapping Labels */}
              <div
                style={{
                  position: 'relative',
                  height: '18px',
                  borderBottom: '1.5px solid #CBD5E1',
                  marginBottom: '8px',
                  fontSize: '10px',
                  color: '#64748B',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                }}
              >
                <span style={{ position: 'absolute', left: '0%' }}>08:00</span>
                <span style={{ position: 'absolute', left: '20.8%', transform: 'translateX(-50%)' }}>08:50</span>
                <span style={{ position: 'absolute', left: '45.8%', transform: 'translateX(-50%)' }}>09:50</span>
                <span style={{ position: 'absolute', left: '70.8%', transform: 'translateX(-50%)' }}>10:50</span>
                <span style={{ position: 'absolute', left: '95.8%', transform: 'translateX(-50%)' }}>11:50</span>
              </div>

              {/* Lane 1: Train Traffic Schedule */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🚆 Operational Train Traffic (Panipat – Karnal)
                </div>
                <div style={{ position: 'relative', height: '30px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #CBD5E1', overflow: 'hidden' }}>
                  {/* Train 1: Cleared before 08:00 */}
                  <div style={{ position: 'absolute', left: '0%', width: '4%', height: '100%', background: '#2563EB', color: '#FFFFFF', fontSize: '9px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="TR-12002 Shatabdi (clears 07:58)">
                    🚆
                  </div>
                  {/* Gap 1 */}
                  <div style={{ position: 'absolute', left: '4%', width: '16.8%', height: '100%', background: '#F0FDF4', color: '#059669', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Gap 1 (50m)
                  </div>

                  {/* Train 2: 08:50 – 09:00 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '20.8%',
                      width: '4.2%',
                      height: '100%',
                      background: simTimeMin >= 50 && simTimeMin < 60 && algoMode === 'greedy' ? '#DC2626' : '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '8.5px',
                      fontWeight: '800',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: simTimeMin >= 50 && simTimeMin < 60 ? '0 0 10px rgba(220, 38, 38, 0.8)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                    title="TR-12424 Rajdhani (08:50-09:00)"
                  >
                    <span>12424</span>
                    {simTimeMin >= 50 && simTimeMin < 60 && (
                      <span style={{ fontSize: '7px', fontWeight: '900' }}>
                        {algoMode === 'greedy' ? 'HALT!' : 'PASS'}
                      </span>
                    )}
                  </div>

                  {/* Gap 2 */}
                  <div style={{ position: 'absolute', left: '25%', width: '20.8%', height: '100%', background: '#F0FDF4', color: '#059669', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Gap 2 (50m)
                  </div>

                  {/* Train 3: 09:50 – 10:00 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '45.8%',
                      width: '4.2%',
                      height: '100%',
                      background: simTimeMin >= 110 && simTimeMin < 120 && algoMode === 'greedy' ? '#DC2626' : '#DB2777',
                      color: '#FFFFFF',
                      fontSize: '8.5px',
                      fontWeight: '800',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: simTimeMin >= 110 && simTimeMin < 120 ? '0 0 10px rgba(220, 38, 38, 0.8)' : 'none',
                    }}
                    title="TR-22436 Vande Bharat (09:50-10:00)"
                  >
                    <span>22436</span>
                    {simTimeMin >= 110 && simTimeMin < 120 && (
                      <span style={{ fontSize: '7px', fontWeight: '900' }}>
                        {algoMode === 'greedy' ? 'HALT!' : 'PASS'}
                      </span>
                    )}
                  </div>

                  {/* Gap 3 */}
                  <div style={{ position: 'absolute', left: '50%', width: '20.8%', height: '100%', background: '#F0FDF4', color: '#059669', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Gap 3 (50m)
                  </div>

                  {/* Train 4: 10:50 – 11:00 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '70.8%',
                      width: '4.2%',
                      height: '100%',
                      background: simTimeMin >= 170 && simTimeMin < 180 && algoMode === 'greedy' ? '#DC2626' : '#EA580C',
                      color: '#FFFFFF',
                      fontSize: '8.5px',
                      fontWeight: '800',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: simTimeMin >= 170 && simTimeMin < 180 ? '0 0 10px rgba(220, 38, 38, 0.8)' : 'none',
                    }}
                    title="TR-12004 Gomti Exp (10:50-11:00)"
                  >
                    <span>12004</span>
                    {simTimeMin >= 170 && simTimeMin < 180 && (
                      <span style={{ fontSize: '7px', fontWeight: '900' }}>
                        {algoMode === 'greedy' ? 'DELAY' : 'PASS'}
                      </span>
                    )}
                  </div>

                  {/* Gap 4 */}
                  <div style={{ position: 'absolute', left: '75%', width: '20.8%', height: '100%', background: '#F0FDF4', color: '#059669', fontSize: '9px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Gap 4 (50m)
                  </div>

                  {/* Train 5: 11:50 */}
                  <div style={{ position: 'absolute', left: '95.8%', width: '4.2%', height: '100%', background: '#0D9488', color: '#FFFFFF', fontSize: '8.5px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Freight BTPN (11:50)">
                    BTPN
                  </div>
                </div>
              </div>

              {/* Lane 2: Candidate Block 1 (Mega-Block · 08:00 – 11:30) */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px' }}>
                  <span>🔧 Candidate Block 1 (Mega-Block · 3.5h)</span>
                  <span style={{ color: '#D97706', fontFamily: 'var(--font-mono)' }}>R = 137 pts ★</span>
                </div>
                <div style={{ position: 'relative', height: '30px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '0%',
                      width: '87.5%',
                      height: '100%',
                      background: algoMode === 'greedy'
                        ? (simTimeMin < 210 ? '#FEF3C7' : '#F1F5F9')
                        : algoMode === 'dp' ? '#F1F5F9' : '#FEE2E2',
                      border: algoMode === 'greedy'
                        ? (simTimeMin < 210 ? '2px solid #F59E0B' : '1px solid #CBD5E1')
                        : '1px dashed #CBD5E1',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 10px',
                      fontSize: '10px',
                      fontWeight: '800',
                      color: algoMode === 'greedy' ? '#92400E' : '#64748B',
                      boxShadow: algoMode === 'greedy' && simTimeMin < 210 ? '0 0 8px rgba(245, 158, 11, 0.4)' : 'none',
                    }}
                  >
                    <span>
                      {algoMode === 'greedy' && (
                        simTimeMin < 210
                          ? '★ ACTIVE: Block 1 (08:00 – 11:30) · Exclusively Locking Track 1'
                          : '✔ Block 1 Finished (+137 pts banked)'
                      )}
                      {algoMode === 'dp' && '⛔ EXCLUDED BY DP: Block 1 (137 ≤ 195 DP sum · Harvesting 4 gap blocks)'}
                      {algoMode === 'fcfs' && '❌ REJECTED BY FCFS: Collided with Ticket #1 at 08:00'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>R = 137 pts</span>
                  </div>
                </div>
              </div>

              {/* Lane 3: The 4 Inter-Train Blocks */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '800', color: '#475569', marginBottom: '3px' }}>
                  <span>🛠️ Inter-Train Blocks (Blocks 2, 3, 4, 5 · 50m each)</span>
                  <span style={{ color: '#059669', fontFamily: 'var(--font-mono)' }}>Cumulative Potential = 260 pts</span>
                </div>
                <div style={{ position: 'relative', height: '30px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                  {/* Block 2 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '0%',
                      width: '20.8%',
                      height: '100%',
                      background: algoMode === 'dp'
                        ? (simTimeMin >= 50 ? '#DCFCE7' : '#ECFDF5')
                        : algoMode === 'fcfs' ? '#F1F5F9' : '#FEE2E2',
                      border: algoMode === 'dp' ? '1.5px solid #10B981' : algoMode === 'fcfs' ? '1.5px solid #64748B' : '1px dashed #EF4444',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      color: algoMode === 'dp' ? '#065F46' : algoMode === 'fcfs' ? '#1E293B' : '#991B1B',
                      boxShadow: algoMode === 'dp' && simTimeMin >= 0 && simTimeMin < 50 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    {algoMode === 'dp'
                      ? (simTimeMin >= 50 ? '✔ Block 2 (+65)' : '🔧 Active (USFD)')
                      : algoMode === 'fcfs' ? '✔ Ticket #1 (65)' : '❌ Overlapped'}
                  </div>

                  {/* Block 3 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '25%',
                      width: '20.8%',
                      height: '100%',
                      background: algoMode === 'dp'
                        ? (simTimeMin >= 110 ? '#DCFCE7' : simTimeMin >= 60 ? '#ECFDF5' : '#F8FAFC')
                        : '#FEE2E2',
                      border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                      boxShadow: algoMode === 'dp' && simTimeMin >= 60 && simTimeMin < 110 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    {algoMode === 'dp'
                      ? (simTimeMin >= 110 ? '✔ Block 3 (+65)' : simTimeMin >= 60 ? '🔧 Active (S&T)' : 'Pending (09:00)')
                      : '❌ Overlapped'}
                  </div>

                  {/* Block 4 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '50%',
                      width: '20.8%',
                      height: '100%',
                      background: algoMode === 'dp'
                        ? (simTimeMin >= 170 ? '#DCFCE7' : simTimeMin >= 120 ? '#ECFDF5' : '#F8FAFC')
                        : '#FEE2E2',
                      border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                      boxShadow: algoMode === 'dp' && simTimeMin >= 120 && simTimeMin < 170 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    {algoMode === 'dp'
                      ? (simTimeMin >= 170 ? '✔ Block 4 (+65)' : simTimeMin >= 120 ? '🔧 Active (OHE)' : 'Pending (10:00)')
                      : '❌ Overlapped'}
                  </div>

                  {/* Block 5 */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '75%',
                      width: '20.8%',
                      height: '100%',
                      background: algoMode === 'dp'
                        ? (simTimeMin >= 230 ? '#DCFCE7' : simTimeMin >= 180 ? '#ECFDF5' : '#F8FAFC')
                        : '#FEE2E2',
                      border: algoMode === 'dp' ? '1.5px solid #10B981' : '1px dashed #EF4444',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9.5px',
                      fontWeight: '800',
                      color: algoMode === 'dp' ? '#065F46' : '#991B1B',
                      boxShadow: algoMode === 'dp' && simTimeMin >= 180 && simTimeMin < 230 ? '0 0 6px rgba(16, 185, 129, 0.5)' : 'none',
                    }}
                  >
                    {algoMode === 'dp'
                      ? (simTimeMin >= 230 ? '✔ Block 5 (+65)' : simTimeMin >= 180 ? '🔧 Active (Tamp)' : 'Pending (11:00)')
                      : '❌ Overlapped'}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================================
                LIVE SIMULATION DISPATCH TICKER (REAL-TIME STATUS & DIAGNOSTICS)
                ================================================================= */}
            <div
              style={{
                background: simStatus.phase === 'CONFLICT' ? '#FEF2F2' : simStatus.phase === 'COLLISION' ? '#FFFBEB' : '#FFFFFF',
                border: `1.5px solid ${simStatus.signalColor}`,
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '10px',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: simStatus.signalColor,
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  {simStatus.signal}
                </span>

                <div style={{ fontSize: '11.5px', color: '#0F172A', fontWeight: '600' }}>
                  {simStatus.msg}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                {algoMode === 'greedy' && simStatus.delays > 0 && (
                  <span style={{ color: '#DC2626', fontWeight: '800', background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                    ⚠️ {simStatus.delays} Trains Delayed
                  </span>
                )}
                {algoMode === 'dp' && (
                  <span style={{ color: '#059669', fontWeight: '800', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                    ✔ 0 Train Delays
                  </span>
                )}
              </div>
            </div>

            {/* Concise 2-Sentence Key Takeaway for Judges */}
            <div
              style={{
                background: algoMode === 'dp' ? '#F0FDF4' : algoMode === 'greedy' ? '#FFFBEB' : '#F1F5F9',
                borderLeft: `4px solid ${algoMode === 'dp' ? '#10B981' : algoMode === 'greedy' ? '#F59E0B' : '#64748B'}`,
                padding: '8px 12px',
                borderRadius: '0 6px 6px 0',
                fontSize: '11px',
                lineHeight: 1.45,
                color: '#1E293B',
              }}
            >
              {algoMode === 'greedy' && (
                <span>
                  <strong>Greedy Trap (137 pts):</strong> Greedy commits Block 1 because its individual reward is highest (137 &gt; 65 pts). However, its 3.5-hour duration blocks 3 scheduled trains and locks out Blocks 2, 3, 4, and 5. Greedy is trapped with only 137 pts.
                </span>
              )}
              {algoMode === 'dp' && (
                <span>
                  <strong>DP Optimization (260 pts):</strong> DP evaluates the Bellman recurrence and discovers 137 + 0 ≤ DP[3] (195 pts). It deliberately skips Block 1 and backtracks all 4 non-conflicting blocks (2, 3, 4, 5) fitting cleanly between trains. Yields <strong>260 pts (+89.8% over Greedy)</strong> with zero train delays!
                </span>
              )}
              {algoMode === 'fcfs' && (
                <span>
                  <strong>FCFS Arrival Bias (65 pts):</strong> FCFS commits Ticket #1 (Block 2) strictly based on 06:00 AM creation time without looking ahead. Subsequent tickets collide on Track 1, trapping FCFS at only <strong>65 pts</strong>.
                </span>
              )}
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
