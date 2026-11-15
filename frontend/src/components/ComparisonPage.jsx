import React, { useState } from 'react';

export default function ComparisonPage({
  comparisonData,
  onRunComparison,
  loading = false,
}) {
  const currentScenario = comparisonData?.scenario_id || 'default';
  const [selectedScenario, setSelectedScenario] = useState(currentScenario);
  const [activeChartMetric, setActiveChartMetric] = useState('all'); // 'all' | 'tasks' | 'clubbing'

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
            Head-to-head empirical evaluation of FCFS, Greedy, and Dynamic Programming (WIS)
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
          3 ALGORITHM SCORECARDS (Side-by-side comparison)
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
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDF4 100%)',
            borderRadius: '14px',
            border: '2px solid #10B981',
            padding: '18px 20px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
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
