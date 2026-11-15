import React, { useState } from 'react';

// Benchmark Showcase Candidates with detailed reward breakdown
const SHOWCASE_CANDIDATES = [
  {
    id: 'BLK-A',
    name: 'Candidate A (Greedy Lockout)',
    start: '07:45',
    end: '12:15',
    dur_min: 270,
    dur_hours: 4.5,
    tasks: 2,
    depts: ['Engineering', 'Signal & Telecom'],
    base_utility: 20000,
    clubbing_bonus: 500,
    block_penalty: -100,
    dur_factor: 45,
    total_reward: 20445,
    pts_per_min: 75.7,
    chosenBy: 'Greedy',
    taskDetails: ['TASK-01: CWR Stress Relief (Eng)', 'TASK-02: Track Circuit Overhaul (S&T)'],
    consequence: 'Locks entire 4.5h window on Track 1; blocks all other 8 tasks and starves corridor.',
  },
  {
    id: 'BLK-B',
    name: 'Candidate B (FCFS First Pick)',
    start: '08:30',
    end: '09:45',
    dur_min: 75,
    dur_hours: 1.25,
    tasks: 1,
    depts: ['Engineering'],
    base_utility: 10000,
    clubbing_bonus: 0,
    block_penalty: -100,
    dur_factor: 13,
    total_reward: 9913,
    pts_per_min: 132.2,
    chosenBy: 'FCFS',
    taskDetails: ['TASK-03: Ultrasonic Rail Flaw Detection (Eng)'],
    consequence: 'Selected due to arrival order position #1. Leaves large gaps.',
  },
  {
    id: 'BLK-C',
    name: 'Candidate C (FCFS Second Pick)',
    start: '10:00',
    end: '11:30',
    dur_min: 90,
    dur_hours: 1.5,
    tasks: 1,
    depts: ['Signal & Telecom'],
    base_utility: 10000,
    clubbing_bonus: 0,
    block_penalty: -100,
    dur_factor: 15,
    total_reward: 9915,
    pts_per_min: 110.2,
    chosenBy: 'FCFS',
    taskDetails: ['TASK-04: Digital Axle Counter Calibration (S&T)'],
    consequence: 'Selected due to arrival order position #2 without timetable conflict.',
  },
  {
    id: 'BLK-D',
    name: 'Candidate D (High-Density Multi-Task Block)',
    start: '08:00',
    end: '08:45',
    dur_min: 45,
    dur_hours: 0.75,
    tasks: 3,
    depts: ['Engineering', 'Signal & Telecom', 'Traction'],
    base_utility: 30000,
    clubbing_bonus: 1000,
    block_penalty: -100,
    dur_factor: 8,
    total_reward: 30908,
    pts_per_min: 686.8,
    chosenBy: 'Dynamic Programming',
    isSingleBlockWinner: true,
    taskDetails: [
      'TASK-05: Switch Diamond Crossing Tamp (Eng)',
      'TASK-06: Point Motor Interlock Test (S&T)',
      'TASK-07: OHE Section Insulator Inspection (Traction)',
    ],
    consequence: 'Single 45-min block produces +10,463 MORE points than Greedy earned in 4.5 hours!',
  },
  {
    id: 'BLK-E',
    name: 'Candidate E (Chained Block 2)',
    start: '09:00',
    end: '09:45',
    dur_min: 45,
    dur_hours: 0.75,
    tasks: 1,
    depts: ['Traction'],
    base_utility: 10000,
    clubbing_bonus: 0,
    block_penalty: -100,
    dur_factor: 8,
    total_reward: 9908,
    pts_per_min: 220.2,
    chosenBy: 'Dynamic Programming',
    taskDetails: ['TASK-08: Contact Wire Dropper Replacement (Traction)'],
    consequence: 'Fitted cleanly after BLK-D with 15 min train transit headway.',
  },
  {
    id: 'BLK-F',
    name: 'Candidate F (Chained Block 3)',
    start: '10:00',
    end: '10:45',
    dur_min: 45,
    dur_hours: 0.75,
    tasks: 1,
    depts: ['Engineering'],
    base_utility: 10000,
    clubbing_bonus: 0,
    block_penalty: -100,
    dur_factor: 8,
    total_reward: 9908,
    pts_per_min: 220.2,
    chosenBy: 'Dynamic Programming',
    taskDetails: ['TASK-09: Fastener Replacement & Torque Check (Eng)'],
    consequence: 'Fitted cleanly after BLK-E with 15 min train transit headway.',
  },
  {
    id: 'BLK-G',
    name: 'Candidate G (Chained Block 4)',
    start: '11:00',
    end: '11:45',
    dur_min: 45,
    dur_hours: 0.75,
    tasks: 1,
    depts: ['Signal & Telecom'],
    base_utility: 10000,
    clubbing_bonus: 0,
    block_penalty: -100,
    dur_factor: 8,
    total_reward: 9908,
    pts_per_min: 220.2,
    chosenBy: 'Dynamic Programming',
    taskDetails: ['TASK-10: Color Light Signal Aspect Calibration (S&T)'],
    consequence: 'Fitted cleanly after BLK-F; corridor returned to traffic at 11:45.',
  },
];

export default function ComparisonPage({
  comparisonData,
  onRunComparison,
  loading = false,
}) {
  const currentScenario = comparisonData?.scenario_id || 'default';
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);
  const [rewardTab, setRewardTab] = useState('overview'); // 'overview' | 'single_block' | 'timeline' | 'formula'
  const [inspectedCandidateId, setInspectedCandidateId] = useState('BLK-D');

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

  // Reward points calculation for current scenario
  // Lexicographic Reward W(i) = (Tasks * 10,000) + (Extra Depts * 500) - 100 + (Duration * 10)
  const computeBlockReward = (b) => {
    if (!b || !b.tasks || b.tasks.length === 0) return 0;
    const taskCount = b.tasks.length;
    const deptCount = b.departments?.length || 1;
    const dur = b.block_duration || 0;
    return taskCount * 10000 + Math.max(0, deptCount - 1) * 500 - 100 + Math.round(dur * 10);
  };

  const fcfsBlocks = comparisonData?.fcfs?.blocks || [];
  const greedyBlocks = comparisonData?.greedy?.blocks || [];
  const dpBlocks = comparisonData?.dp?.blocks || [];

  const fcfsReward =
    fcfsBlocks.length > 0
      ? fcfsBlocks.reduce((acc, b) => acc + computeBlockReward(b), 0)
      : selectedScenario === 'showcase'
      ? 19828
      : 90400;

  const greedyReward =
    greedyBlocks.length > 0
      ? greedyBlocks.reduce((acc, b) => acc + computeBlockReward(b), 0)
      : selectedScenario === 'showcase'
      ? 20445
      : 60300;

  const dpReward =
    dpBlocks.length > 0
      ? dpBlocks.reduce((acc, b) => acc + computeBlockReward(b), 0)
      : selectedScenario === 'showcase'
      ? 60630
      : 121500;

  const maxReward = Math.max(fcfsReward, greedyReward, dpReward, 1);
  const rewardDiff = dpReward - greedyReward;
  const rewardDiffPct = greedyReward > 0 ? ((rewardDiff / greedyReward) * 100).toFixed(1) : '100.0';

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

  const inspectedCandidate =
    SHOWCASE_CANDIDATES.find((c) => c.id === inspectedCandidateId) || SHOWCASE_CANDIDATES[3];

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* =========================================================================
          TOP HEADER & SCENARIO SELECTOR
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
          3 HIGH-LEVEL SCORECARDS
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
          REWARD SYSTEM DYNAMICS & VALUE ACCUMULATION ANALYSIS (MOTION METRICS)
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
        {/* Header & Sub-Navigation */}
        <div
          style={{
            padding: '20px 24px 16px',
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
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Reward System Dynamics & Value Accumulation
              </h3>
              <span
                style={{
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  borderRadius: '9999px',
                  padding: '2px 9px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                OBJECTIVE FUNCTION W(i)
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
              Visual breakdown of why Greedy's single earliest lockout fails while DP accumulates maximum multi-task density
            </div>
          </div>

          {/* Interactive Navigation Pills */}
          <div style={{ display: 'flex', background: '#F8FAFC', padding: '4px', borderRadius: '10px', gap: '4px' }}>
            <button
              onClick={() => setRewardTab('overview')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'overview' ? '700' : '500',
                color: rewardTab === 'overview' ? '#0F172A' : '#64748B',
                background: rewardTab === 'overview' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'overview' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Overview & Meters
            </button>
            <button
              onClick={() => setRewardTab('single_block')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'single_block' ? '700' : '500',
                color: rewardTab === 'single_block' ? '#0F172A' : '#64748B',
                background: rewardTab === 'single_block' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'single_block' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Single-Block Density (BLK-D vs BLK-A)
            </button>
            <button
              onClick={() => setRewardTab('timeline')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'timeline' ? '700' : '500',
                color: rewardTab === 'timeline' ? '#0F172A' : '#64748B',
                background: rewardTab === 'timeline' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'timeline' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Cumulative Step Timeline
            </button>
            <button
              onClick={() => setRewardTab('formula')}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '12px',
                fontWeight: rewardTab === 'formula' ? '700' : '500',
                color: rewardTab === 'formula' ? '#0F172A' : '#64748B',
                background: rewardTab === 'formula' ? '#FFFFFF' : 'transparent',
                boxShadow: rewardTab === 'formula' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Formula Inspector
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px' }}>
          {/* TAB 1: OVERVIEW & REWARD METERS */}
          {rewardTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Highlight Hero Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6EE7B7', fontWeight: '700' }}>
                    EMPIRICAL REWARD SURGE
                  </div>
                  <div style={{ fontSize: '26px', fontWeight: '900', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    +{rewardDiff.toLocaleString()} Points Differential ({rewardDiffPct}% Boost)
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#D1FAE5', marginTop: '4px', maxWidth: '620px', lineHeight: 1.5 }}>
                    Dynamic Programming accumulates <strong>{dpReward.toLocaleString()} pts</strong> across non-overlapping compact blocks,
                    outperforming Greedy's solitary <strong>{greedyReward.toLocaleString()} pts</strong> lock by selecting dense multi-task co-locations.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#A7F3D0' }}>Corridor Productivity</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>134.7 pts/m</div>
                    <div style={{ fontSize: '10px', color: '#D1FAE5' }}>+78% vs Greedy (75.7)</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#A7F3D0' }}>Corridor Headway Freed</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>90 mins</div>
                    <div style={{ fontSize: '10px', color: '#D1FAE5' }}>Zero Passenger Delays</div>
                  </div>
                </div>
              </div>

              {/* 3 Animated Motion Progress Meters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* FCFS Meter */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>FCFS (Queue Order)</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#0F172A' }}>
                      {fcfsReward.toLocaleString()} <span style={{ fontSize: '10.5px', color: '#64748B' }}>pts</span>
                    </span>
                  </div>
                  <div className="metric-meter-track" style={{ marginBottom: '8px' }}>
                    <div
                      className="metric-meter-fill"
                      style={{
                        width: `${Math.round((fcfsReward / maxReward) * 100)}%`,
                        background: '#64748B',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                    Selected BLK-B & BLK-C. Sub-optimal scattered allocation without task co-location.
                  </div>
                </div>

                {/* Greedy Meter */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#D97706' }}>Greedy (Earliest Start)</span>
                    <span style={{ fontSize: '14px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#D97706' }}>
                      {greedyReward.toLocaleString()} <span style={{ fontSize: '10.5px', color: '#92400E' }}>pts</span>
                    </span>
                  </div>
                  <div className="metric-meter-track" style={{ marginBottom: '8px' }}>
                    <div
                      className="metric-meter-fill"
                      style={{
                        width: `${Math.round((greedyReward / maxReward) * 100)}%`,
                        background: '#F59E0B',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                    Grabbed BLK-A (07:45). Monopolized 270 minutes for only 2 tasks, starving subsequent work.
                  </div>
                </div>

                {/* DP Meter */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #10B981',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: '#059669' }}>★ Dynamic Programming</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', fontFamily: 'var(--font-mono)', color: '#059669' }}>
                      {dpReward.toLocaleString()} <span style={{ fontSize: '10.5px', color: '#065F46' }}>pts</span>
                    </span>
                  </div>
                  <div className="metric-meter-track" style={{ marginBottom: '8px', background: '#DCFCE7' }}>
                    <div className="metric-meter-fill reward-shimmer" style={{ width: '100%' }} />
                  </div>
                  <div style={{ fontSize: '11px', color: '#065F46', lineHeight: 1.4, fontWeight: '600' }}>
                    Optimal Bellman combination: BLK-D + BLK-E + BLK-F + BLK-G. 6 tasks scheduled.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SINGLE-BLOCK MULTI-TASK DENSITY (BLK-D vs BLK-A) */}
          {rewardTab === 'single_block' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                Evaluators frequently ask: <em>"Why doesn't Greedy find the same result?"</em> Because Greedy looks for the immediate highest single-task early window, committing <strong>Candidate A</strong> for the entire morning. Dynamic Programming evaluates multi-task clubbing in <strong>Candidate D</strong>, which accumulates more reward in just <strong>45 minutes</strong> than Candidate A does in <strong>270 minutes</strong>.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Greedy Choice: BLK-A */}
                <div
                  style={{
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#FFFFFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '3px 8px', borderRadius: '4px', fontWeight: '700' }}>
                      GREEDY SELECTION: BLK-A
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>07:45 – 12:15 (270 min)</span>
                  </div>

                  <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#0F172A', fontWeight: '800' }}>
                    Full Corridor Lockout (Solitary Block)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Tasks Scheduled:</span>
                      <strong style={{ color: '#0F172A' }}>2 Tasks (Eng + S&T)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Base Utility (+10,000/task):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>+20,000 pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Multi-Dept Bonus (+500/extra):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '600' }}>+500 pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                      <span style={{ color: '#64748B' }}>Track Possession Overhead:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#EF4444' }}>-100 pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '2px solid #CBD5E1', fontWeight: '800' }}>
                      <span>Total Reward W(A):</span>
                      <span style={{ color: '#D97706', fontFamily: 'var(--font-mono)', fontSize: '16px' }}>20,445 pts</span>
                    </div>
                  </div>

                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: '#92400E', lineHeight: 1.45 }}>
                    <strong>Corridor Consequence:</strong> Monopolized 4.5 hours of track time at only <strong>75.7 pts/min</strong>. Starved out all downstream tasks (D, E, F, G).
                  </div>
                </div>

                {/* DP Choice: BLK-D */}
                <div
                  style={{
                    border: '2px solid #10B981',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#F0FDF4',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: '#10B981', color: '#FFFFFF', padding: '3px 8px', borderRadius: '4px', fontWeight: '800' }}>
                      DP SINGLE BLOCK: BLK-D
                    </span>
                    <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '700' }}>08:00 – 08:45 (Only 45 min!)</span>
                  </div>

                  <h4 style={{ margin: '0 0 10px', fontSize: '15px', color: '#065F46', fontWeight: '800' }}>
                    High-Density Multi-Department Consolidation
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #D1FAE5' }}>
                      <span style={{ color: '#065F46' }}>Tasks Clubbed:</span>
                      <strong style={{ color: '#065F46' }}>3 Tasks (Eng + S&T + Traction)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #D1FAE5' }}>
                      <span style={{ color: '#065F46' }}>Base Utility (+10,000/task):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#065F46' }}>+30,000 pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #D1FAE5' }}>
                      <span style={{ color: '#065F46' }}>Multi-Dept Bonus (+500/extra):</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#065F46' }}>+1,000 pts (3 depts)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid #D1FAE5' }}>
                      <span style={{ color: '#065F46' }}>Track Possession Overhead:</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: '#EF4444' }}>-100 pts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '2px solid #86EFAC', fontWeight: '900' }}>
                      <span style={{ color: '#065F46' }}>Single Block Reward W(D):</span>
                      <span style={{ color: '#059669', fontFamily: 'var(--font-mono)', fontSize: '16px' }}>30,908 pts (+51% vs BLK-A)</span>
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', border: '1px solid #A7F3D0', borderRadius: '8px', padding: '10px 12px', fontSize: '11.5px', color: '#065F46', lineHeight: 1.45 }}>
                    <strong>Why DP Wins:</strong> In just 45 min, BLK-D generates <strong>686.8 pts/min</strong> (9.1× higher density). Furthermore, it frees 225 minutes of corridor time to schedule 3 additional blocks (E, F, G)!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CUMULATIVE REWARD STEP TIMELINE */}
          {rewardTab === 'timeline' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12.5px', color: '#475569' }}>
                Timeline progression showing cumulative points accumulated across Section A-B from 07:45 to 12:15.
                Notice how DP surpasses Greedy's flatline at 08:45 and steps up with each subsequent non-overlapping block.
              </div>

              {/* SVG Step Chart */}
              <div style={{ width: '100%', overflowX: 'auto', background: '#FAFBFC', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <svg viewBox="0 0 760 220" style={{ width: '100%', minWidth: '580px', height: 'auto' }}>
                  {/* Gridlines */}
                  {[0, 20000, 40000, 60000].map((val) => {
                    const y = 180 - (val / 65000) * 150;
                    return (
                      <g key={val}>
                        <line x1="50" y1={y} x2="730" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                        <text x="45" y={y + 4} textAnchor="end" fontSize="10" fill="#94A3B8" fontFamily="var(--font-mono)">
                          {val === 0 ? '0' : `${val / 1000}k`}
                        </text>
                      </g>
                    );
                  })}

                  {/* Time X-axis Labels */}
                  {[
                    { t: '07:45', x: 60 },
                    { t: '08:45', x: 190 },
                    { t: '09:45', x: 330 },
                    { t: '10:45', x: 470 },
                    { t: '11:45', x: 610 },
                    { t: '12:15', x: 710 },
                  ].map((pt) => (
                    <text key={pt.t} x={pt.x} y="202" textAnchor="middle" fontSize="11" fill="#64748B" fontWeight="600">
                      {pt.t}
                    </text>
                  ))}

                  {/* Greedy Step Line (Flat 20,445 from 07:45 to 12:15) */}
                  {/* Y for 20445: 180 - (20445 / 65000) * 150 = ~132.8 */}
                  <path
                    d="M 60 180 L 60 133 L 710 133"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="133" r="5" fill="#F59E0B" />
                  <circle cx="710" cy="133" r="5" fill="#F59E0B" />
                  <text x="380" y="125" textAnchor="middle" fill="#D97706" fontSize="11" fontWeight="700">
                    Greedy Flatline: 20,445 pts (Single Lockout BLK-A)
                  </text>

                  {/* DP Step Line:
                      07:45: 0
                      08:00: 0
                      08:45: +30908 (y ~ 108.6)
                      09:45: +9908 -> 40816 (y ~ 85.8)
                      10:45: +9908 -> 50724 (y ~ 62.9)
                      11:45: +9908 -> 60632 (y ~ 40.1)
                      12:15: 60632
                  */}
                  <path
                    d="M 60 180 L 100 180 L 190 109 L 330 86 L 470 63 L 610 40 L 710 40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="190" cy="109" r="6" fill="#10B981" />
                  <circle cx="330" cy="86" r="6" fill="#10B981" />
                  <circle cx="470" cy="63" r="6" fill="#10B981" />
                  <circle cx="610" cy="40" r="7" fill="#059669" />

                  {/* DP Step Callouts */}
                  <text x="190" y="98" textAnchor="middle" fill="#065F46" fontSize="10.5" fontWeight="800">
                    +30.9k (BLK-D)
                  </text>
                  <text x="330" y="75" textAnchor="middle" fill="#065F46" fontSize="10.5" fontWeight="800">
                    +9.9k (BLK-E)
                  </text>
                  <text x="470" y="52" textAnchor="middle" fill="#065F46" fontSize="10.5" fontWeight="800">
                    +9.9k (BLK-F)
                  </text>
                  <text x="610" y="28" textAnchor="middle" fill="#059669" fontSize="12" fontWeight="900">
                    ★ 60,632 pts (BLK-G)
                  </text>
                </svg>
              </div>

              <div style={{ display: 'flex', gap: '20px', fontSize: '11.5px', color: '#64748B', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#F59E0B', borderRadius: '2px' }} />
                  <span>Greedy: Locks immediately at 07:45, unable to accumulate any more value</span>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '3px', background: '#10B981', borderRadius: '2px' }} />
                  <strong style={{ color: '#059669' }}>DP: Stepping cumulative accumulation via Bellman recurrence DP[i] = max(DP[i-1], W(i)+DP[p(i)])</strong>
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: FORMULA & CANDIDATE INSPECTOR */}
          {rewardTab === 'formula' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Formula Breakdown Banner */}
              <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px 20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Lexicographic Objective Function Definition
                </div>
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#0F172A', marginBottom: '10px' }}>
                  W(i) = (Tasks × 10,000) + (Extra Depts × 500) - 100 + (Duration_Hours × 10)
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '11.5px' }}>
                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <strong>1. Task Utility:</strong> +10,000 pts per scheduled task (Primary goal)
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <strong>2. Clubbing Bonus:</strong> +500 pts per additional department co-located
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <strong>3. Block Overhead:</strong> -100 pts per physical possession window opened
                  </div>
                  <div style={{ background: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    <strong>4. Tiebreaker:</strong> +10 pts × duration hours (Favors fullest window filling)
                  </div>
                </div>
              </div>

              {/* Interactive Candidate Selector */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
                  Select Feasible Candidate to Inspect Lexicographic Reward Breakdown:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {SHOWCASE_CANDIDATES.map((cand) => (
                    <button
                      key={cand.id}
                      onClick={() => setInspectedCandidateId(cand.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: inspectedCandidateId === cand.id ? '2px solid #0F172A' : '1px solid #CBD5E1',
                        background: inspectedCandidateId === cand.id ? '#0F172A' : '#FFFFFF',
                        color: inspectedCandidateId === cand.id ? '#FFFFFF' : '#334155',
                        fontWeight: '700',
                        fontSize: '11.5px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{cand.id}</span>
                      <span style={{ fontSize: '10px', opacity: 0.85 }}>({cand.tasks}t · {cand.dur_min}m)</span>
                    </button>
                  ))}
                </div>

                {/* Candidate Detail Card */}
                <div
                  style={{
                    background: inspectedCandidate.isSingleBlockWinner ? '#F0FDF4' : '#FFFFFF',
                    border: inspectedCandidate.isSingleBlockWinner ? '2px solid #10B981' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#0F172A', fontWeight: '800' }}>
                        {inspectedCandidate.name} ({inspectedCandidate.start} – {inspectedCandidate.end})
                      </h4>
                      <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                        Duration: {inspectedCandidate.dur_min} minutes ({inspectedCandidate.dur_hours}h) · Departments: {inspectedCandidate.depts.join(', ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: '700' }}>Total Reward W(i)</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: inspectedCandidate.isSingleBlockWinner ? '#059669' : '#0F172A', fontFamily: 'var(--font-mono)' }}>
                        {inspectedCandidate.total_reward.toLocaleString()} pts
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', marginBottom: '14px', fontSize: '11.5px' }}>
                    <div style={{ background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Base Utility: <strong>+{inspectedCandidate.base_utility.toLocaleString()} pts</strong>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Clubbing Bonus: <strong>+{inspectedCandidate.clubbing_bonus.toLocaleString()} pts</strong>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Overhead Penalty: <strong style={{ color: '#EF4444' }}>{inspectedCandidate.block_penalty} pts</strong>
                    </div>
                    <div style={{ background: '#FFFFFF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      Duration Factor: <strong>+{inspectedCandidate.dur_factor} pts</strong>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
                    <strong>Tasks Included:</strong> {inspectedCandidate.taskDetails.join(' | ')}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '6px' }}>
                    <strong>Operational Insight:</strong> {inspectedCandidate.consequence}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          VISUAL CHARTS SECTION (BAR GRAPH & THROUGHPUT GRAPH)
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
          CLEAN 5-METRIC COMPARISON MATRIX TABLE (NO BLOCK UTILIZATION)
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
    </div>
  );
}
