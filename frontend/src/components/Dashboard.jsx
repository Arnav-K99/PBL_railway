import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

function timeToMin(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

export default function Dashboard({ trains, tasks, availableBlocks, scheduledBlocks, metrics }) {
  const [selectedTrack, setSelectedTrack] = useState('Track 1');

  // Filter trains & windows for timeline
  const trackTrains = (trains || []).filter((t) => t.track === selectedTrack);
  const trackWindows = (availableBlocks || []).filter((b) => b.track === selectedTrack);

  // Timeline bounds: 06:00 (360m) to 22:00 (1320m) -> 960 minutes span
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

  return (
    <div>
      <div className="page-title-row">
        <div>
          <h2 className="page-title">Operational Dashboard</h2>
          <div className="page-description">Today's track possession status and train traffic overview</div>
        </div>
      </div>

      {/* Operational KPI Summary */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-number">{trains?.length || 0}</div>
          <div className="kpi-label">Trains</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-number">{tasks?.length || 0}</div>
          <div className="kpi-label">Maintenance Tasks</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-number">{availableBlocks?.length || 0}</div>
          <div className="kpi-label">Available Blocks</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-number">{scheduledBlocks?.length || 0}</div>
          <div className="kpi-label">Scheduled Blocks</div>
        </div>
      </div>

      {/* Today's Train Movements Table */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Today's Train Movements</div>
          <span style={{ fontSize: '11px', color: 'var(--c-text-secondary)', fontFamily: 'var(--font-mono)' }}>
            DATE: 20 SEP 2026
          </span>
        </div>
        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Train</th>
                <th>Name</th>
                <th>Track</th>
                <th>Arrival</th>
                <th>Departure</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(trains || []).map((train) => (
                <tr key={train.train_id}>
                  <td className="cell-mono" style={{ fontWeight: '700' }}>{train.train_id}</td>
                  <td>{train.train_name}</td>
                  <td>
                    <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '700' }}>
                      {train.track || 'Track 1'}
                    </span>
                  </td>
                  <td className="cell-mono">{train.arrival_time}</td>
                  <td className="cell-mono">{train.departure_time}</td>
                  <td>
                    <StatusBadge status="Scheduled" label="Scheduled" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Track Occupancy vs Maintenance Windows Timeline */}
      <div className="ops-panel">
        <div className="panel-header">
          <div className="panel-title">Track Occupancy vs Maintenance Windows</div>
          <div className="timeline-section-selector">
            {['Track 1', 'Track 2', 'Track 3', 'Track 4'].map((trk) => (
              <button
                key={trk}
                className={`btn-seg ${selectedTrack === trk ? 'active' : ''}`}
                onClick={() => setSelectedTrack(trk)}
              >
                {trk}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-body">
          <p style={{ fontSize: '11.5px', color: 'var(--c-text-secondary)', marginBottom: '12px' }}>
            Trains occupy specific tracks → Maintenance blocks require unconflicted time windows on that track.
          </p>

          <div className="timeline-wrapper">
            {/* Hour ruler */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '6px', marginBottom: '12px', fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--c-text-secondary)' }}>
              {hourMarkers.map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>

            {/* Train movements lane */}
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-secondary)', marginBottom: '4px' }}>
              Train Movements ({selectedTrack})
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

            {/* Available block windows lane */}
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--c-text-secondary)', marginTop: '14px', marginBottom: '4px' }}>
              Available Maintenance Block Windows ({selectedTrack})
            </div>
            <div className="timeline-track-lane">
              {trackWindows.map((bw) => {
                const pos = getPosition(bw.start_time, bw.end_time);
                if (!pos) return null;
                return (
                  <div
                    key={bw.block_id}
                    className="timeline-bar timeline-window"
                    style={pos}
                    title={`${bw.block_id}: ${bw.start_time} - ${bw.end_time}`}
                  >
                    WINDOW {bw.block_id} ({bw.start_time}–{bw.end_time})
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="timeline-legend">
              <div className="legend-item">
                <span className="legend-swatch" style={{ background: '#2D333B' }}></span>
                <span>Train Movement (Section Occupied)</span>
              </div>
              <div className="legend-item">
                <span className="legend-swatch" style={{ background: '#F1F4F7', border: '1px dashed #768390' }}></span>
                <span>Available Maintenance Block Corridor</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
