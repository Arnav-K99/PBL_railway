import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import DeptBadge from './DeptBadge';

export default function BlocksPage({ scheduledBlocks = [], onGeneratePlan, loading }) {
  const [selectedBlockId, setSelectedBlockId] = useState(
    scheduledBlocks.length > 0 ? scheduledBlocks[0].block_id : null
  );

  const selectedBlock =
    scheduledBlocks.find((b) => b.block_id === selectedBlockId) || scheduledBlocks[0];

  const totalClubbedTasks = scheduledBlocks.reduce((acc, b) => acc + (b.tasks?.length || 0), 0);
  const totalWindowHours = scheduledBlocks.reduce((acc, b) => acc + (b.block_duration || 0), 0);

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header */}
      <div className="page-title-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Authorized Maintenance Blocks</h2>
            <span
              style={{
                background: '#ECFDF5',
                color: '#065F46',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {scheduledBlocks.length} Active Corridors
            </span>
          </div>
          <div className="page-description">
            Physical track possession windows authorized with multi-department simultaneous task clubbing
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={onGeneratePlan}
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
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            {loading ? 'Refreshing...' : '↻ Regenerate Plan'}
          </button>
        </div>
      </div>

      {/* =========================================================================
          SINGLE STREAMLINED SECTION: MASTER-DETAIL ASSIGNED BLOCKS & TASKS
          ========================================================================= */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Section Sub-header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            background: '#F8FAFC',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
              Select an Authorized Block to Inspect Tasks Working Under It:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748B' }}>
            <span>
              Total Track Hours: <strong style={{ color: '#0F172A' }}>{totalWindowHours.toFixed(1)}h</strong>
            </span>
            <span>•</span>
            <span>
              Clubbed Tasks: <strong style={{ color: '#059669' }}>{totalClubbedTasks} tasks</strong>
            </span>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(300px, 360px) 1fr',
            minHeight: '480px',
          }}
        >
          {/* LEFT: List of Assigned Blocks */}
          <div
            style={{
              borderRight: '1px solid #F1F5F9',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: '#FAFAFA',
              overflowY: 'auto',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Assigned Blocks ({scheduledBlocks.length})
            </div>

            {scheduledBlocks.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                No blocks scheduled. Click "Regenerate Plan" to run optimizer.
              </div>
            ) : (
              scheduledBlocks.map((blk) => {
                const isSelected = selectedBlock?.block_id === blk.block_id;
                return (
                  <div
                    key={blk.block_id}
                    onClick={() => setSelectedBlockId(blk.block_id)}
                    style={{
                      background: isSelected ? '#FFFFFF' : '#FFFFFF',
                      border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 4px 12px rgba(37, 99, 235, 0.12)'
                        : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', fontSize: '13px', color: '#0F172A' }}>
                        {blk.block_id}
                      </span>
                      <span
                        style={{
                          background: isSelected ? '#EFF6FF' : '#F1F5F9',
                          color: isSelected ? '#1D4ED8' : '#334155',
                          fontWeight: '700',
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {blk.track || 'Track 1'}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                      Window: <strong style={{ color: '#0F172A', fontFamily: 'var(--font-mono)' }}>{blk.start_time} – {blk.end_time}</strong> ({blk.block_duration} hrs)
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: '#059669', fontWeight: '700' }}>
                        {blk.tasks.length} tasks working
                      </span>
                      <span style={{ color: '#64748B' }}>
                        {blk.departments.join(' · ')}
                      </span>
                    </div>

                    {/* Progress Bar for Utilization */}
                    <div style={{ marginTop: '8px', background: '#F1F5F9', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, blk.utilization_percentage || 80)}%`,
                          background: isSelected ? '#2563EB' : '#10B981',
                          height: '100%',
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Detail View of Maintenance Tasks Working Under the Selected Block */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {selectedBlock ? (
              <>
                {/* Active Block Summary Card */}
                <div
                  style={{
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                        {selectedBlock.block_id}
                      </h3>
                      <span style={{ background: '#2563EB', color: '#FFFFFF', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>
                        {selectedBlock.track || 'Track 1'}
                      </span>
                      <span style={{ background: '#ECFDF5', color: '#047857', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px' }}>
                        ACTIVE POSSESSION
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Possession window: <strong style={{ color: '#0F172A' }}>{selectedBlock.start_time} to {selectedBlock.end_time}</strong> ({selectedBlock.window_capacity_hours}h capacity)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '600' }}>Simultaneous Duration</div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                        {selectedBlock.block_duration} hrs
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#64748B', fontWeight: '600' }}>Departments</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB' }}>
                        {selectedBlock.departments.join(' + ')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithmic Reward & Optimization Card */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#047857', fontWeight: '800' }}>
                      LEXICOGRAPHIC REWARD YIELD · R(B) = 120 × T_B + 8 × C_B − 1
                    </div>
                    <div style={{ fontSize: '12px', color: '#065F46', marginTop: '2px' }}>
                      Task Coverage: <strong>+{120 * selectedBlock.tasks.length}</strong> ({selectedBlock.tasks.length} tasks) · 
                      Dept Clubbing: <strong>+{8 * Math.max(0, selectedBlock.departments.length - 1)}</strong> ({Math.max(0, selectedBlock.departments.length - 1)} extra depts) · 
                      Block Economy: <strong>−1</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#047857', fontWeight: '700' }}>Block Score</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {120 * selectedBlock.tasks.length + 8 * Math.max(0, selectedBlock.departments.length - 1) - 1} pts
                    </div>
                  </div>
                </div>

                {/* List of Tasks Working Under It */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                      Maintenance Tasks Working Under This Block ({selectedBlock.tasks.length})
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: '600' }}>
                      ✓ Simultaneous Co-location Active
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedBlock.tasks.map((task, idx) => (
                      <div
                        key={task.task_id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '10px',
                          border: '1px solid #E2E8F0',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.15s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '9999px',
                              background: '#F1F5F9',
                              color: '#475569',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: '700',
                            }}
                          >
                            {idx + 1}
                          </span>

                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#0F172A' }}>
                                {task.task_id}
                              </strong>
                              <DeptBadge department={task.department} />
                            </div>
                            <div style={{ fontSize: '12px', color: '#334155' }}>
                              {task.description}
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700', color: '#0F172A' }}>
                            {task.earliest_start} – {task.latest_end}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                            Duration: <strong style={{ color: '#0F172A' }}>{task.duration} hrs</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Co-location Operational Insight Card */}
                <div
                  style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '12px',
                    color: '#166534',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <div>
                    <strong>Operational Synergy:</strong> Executing these {selectedBlock.tasks.length} tasks simultaneously inside{' '}
                    <strong>{selectedBlock.block_id}</strong> consolidated{' '}
                    <strong>{selectedBlock.departments.length} departments</strong> on {selectedBlock.track}, preventing multiple separate track possessions.
                  </div>
                </div>
              </>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
                Select an authorized block from the left to view the maintenance activities assigned under it.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
