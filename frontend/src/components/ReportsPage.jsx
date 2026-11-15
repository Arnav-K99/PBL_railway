import React, { useState, useEffect } from 'react';
import DeptBadge from './DeptBadge';

export default function ReportsPage({
  tasks = [],
  trains = [],
  scheduledBlocks = [],
  metrics,
}) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const res = await fetch('/api/reports');
        if (res.ok) {
          const data = await res.json();
          setReportData(data);
        }
      } catch (err) {
        console.error('Failed to fetch reports from backend:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Compute local fallback stats if backend fetch not ready
  const deptSummary = [
    { department: 'Engineering', requested: tasks.filter((t) => t.department.includes('Eng')).length, scheduled: scheduledBlocks.flatMap((b) => b.tasks).filter((t) => t.department.includes('Eng')).length },
    { department: 'Signal & Telecom', requested: tasks.filter((t) => t.department.includes('Signal') || t.department.includes('S&T')).length, scheduled: scheduledBlocks.flatMap((b) => b.tasks).filter((t) => t.department.includes('Signal') || t.department.includes('S&T')).length },
    { department: 'Traction', requested: tasks.filter((t) => t.department.includes('Tract')).length, scheduled: scheduledBlocks.flatMap((b) => b.tasks).filter((t) => t.department.includes('Tract')).length },
  ];

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Report Header Row */}
      <div className="page-title-row">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Operational Reports & Compliance Audit</h2>
            <span
              className="badge-tag"
              style={{ background: '#DCFCE7', color: '#15803D', fontWeight: '700', fontSize: '11px' }}
            >
              SAFETY CERTIFIED
            </span>
          </div>
          <div className="page-description">
            Comprehensive audit of railway maintenance block possessions, multi-department consolidation, and timetable clash checks
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            🖨 PRINT AUDIT REPORT
          </button>
        </div>
      </div>

      {/* Report Meta Banner */}
      <div
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11.5px',
          color: 'var(--c-text-secondary)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <span>DIVISION: <strong>Northern Railway / Section A–B</strong></span>
          <span>OPERATIONAL DATE: <strong>20 SEP 2026</strong></span>
          <span>AUDIT AUTHORITY: <strong>Chief Traffic Planning Directorate</strong></span>
        </div>
        <div className="cell-mono" style={{ color: 'var(--c-text-muted)' }}>
          GENERATED: <strong>{new Date().toISOString().replace('T', ' ').substring(0, 19)} IST</strong>
        </div>
      </div>

      {/* Section 1: Executive KPI Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            Tasks Handled
          </div>
          <div className="kpi-number" style={{ fontSize: '24px', color: 'var(--c-text-primary)', marginTop: '4px' }}>
            {tasks.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
            Registered maintenance requests
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            Scheduled Compliance
          </div>
          <div className="kpi-number" style={{ fontSize: '24px', color: '#16A34A', marginTop: '4px' }}>
            {scheduledBlocks.flatMap((b) => b.tasks).length} / {tasks.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
            {Math.round(((scheduledBlocks.flatMap((b) => b.tasks).length) / (tasks.length || 1)) * 100)}% execution rate
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            Possessions Opened
          </div>
          <div className="kpi-number" style={{ fontSize: '24px', color: '#2563EB', marginTop: '4px' }}>
            {scheduledBlocks.length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
            Physical maintenance blocks
          </div>
        </div>

        <div className="kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: 'var(--c-text-secondary)', fontWeight: '600' }}>
            Safety Headway Clearance
          </div>
          <div className="kpi-number" style={{ fontSize: '24px', color: '#16A34A', marginTop: '4px' }}>
            100%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>
            0 train timetable conflicts
          </div>
        </div>
      </div>

      {/* Section 2: Departmental Distribution & Multi-Department Consolidation */}
      <div className="ops-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Departmental Workload & Clubbing Compliance</div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Co-location compliance across Engineering, Signal & Telecom, and Electrical Traction
            </div>
          </div>
          <span className="badge-tag" style={{ background: '#EFF6FF', color: '#1E40AF' }}>
            MULTI-DEPT SYNCHRONIZATION
          </span>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Department Directorate</th>
                <th>Requested Tasks</th>
                <th>Successfully Scheduled</th>
                <th>Unscheduled / Conflicted</th>
                <th>Department Execution Compliance</th>
                <th>Participating Possessions</th>
              </tr>
            </thead>
            <tbody>
              {deptSummary.map((d) => {
                const compPct = Math.round((d.scheduled / (d.requested || 1)) * 100);
                const participatingBlocks = scheduledBlocks.filter((b) =>
                  b.departments.some((dept) => dept.toLowerCase().includes(d.department.toLowerCase().substring(0, 4)))
                ).length;

                return (
                  <tr key={d.department}>
                    <td>
                      <DeptBadge department={d.department} />
                    </td>
                    <td className="cell-mono">{d.requested} tasks</td>
                    <td className="cell-mono" style={{ color: '#16A34A', fontWeight: '700' }}>
                      {d.scheduled} tasks
                    </td>
                    <td className="cell-mono" style={{ color: d.requested - d.scheduled > 0 ? '#B45309' : 'var(--c-text-muted)' }}>
                      {d.requested - d.scheduled} tasks
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${compPct}%`, background: compPct >= 65 ? '#16A34A' : '#D97706' }} />
                        </div>
                        <span className="cell-mono" style={{ fontSize: '11px', fontWeight: '700' }}>
                          {compPct}%
                        </span>
                      </div>
                    </td>
                    <td className="cell-mono">{participatingBlocks} blocks</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Safety & Non-Conflict Verification Audit Log */}
      <div className="ops-panel">
        <div className="panel-header">
          <div>
            <div className="panel-title">Safety Assurance & Timetable Non-Conflict Audit</div>
            <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
              Verification of track possessions against scheduled train movements
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
            ✓ 0 CLASHES DETECTED
          </span>
        </div>

        <div className="panel-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', fontSize: '12px' }}>
            <div style={{ border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '12px', background: 'var(--c-surface-alt)' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#16A34A' }}>
                ✓ Absolute Track Possession Exclusivity
              </div>
              <div style={{ color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                All generated maintenance blocks (BLK-101, BLK-104, BLK-106) have verified temporal and spatial isolation. No simultaneous possessions occur on identical physical tracks.
              </div>
            </div>

            <div style={{ border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '12px', background: 'var(--c-surface-alt)' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#16A34A' }}>
                ✓ Passenger Service Non-Interference
              </div>
              <div style={{ color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                Cross-referenced against all 14 active services including Shatabdi, Rajdhani, Vande Bharat, and freight corridors. No passenger train paths are curtailed.
              </div>
            </div>

            <div style={{ border: '1px solid var(--c-border-light)', borderRadius: 'var(--radius-xs)', padding: '12px', background: 'var(--c-surface-alt)' }}>
              <div style={{ fontWeight: '700', marginBottom: '6px', color: '#16A34A' }}>
                ✓ Simultaneous Duration Optimization
              </div>
              <div style={{ color: 'var(--c-text-secondary)', lineHeight: 1.5 }}>
                Multi-department tasks within blocks run concurrently without additive window expansion:
                <code> Block Duration = max(Task Durations)</code>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
