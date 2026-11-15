import React, { useState, useEffect, useMemo, useRef } from 'react';
import DeptBadge from './DeptBadge';
import StatusBadge from './StatusBadge';

function timeToMin(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

function minToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function OperationsCenter({
  trains = [],
  tasks = [],
  availableBlocks = [],
  scheduledBlocks = [],
  metrics,
}) {
  // Simulation Clock: range 06:00 (360m) to 22:00 (1320m)
  const START_MIN = 360;
  const END_MIN = 1320;
  const [simTime, setSimTime] = useState(540); // Default to 09:00:00
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(2); // 1x, 2x, 4x, 8x
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('Track 1');
  const [showTimetableDrawer, setShowTimetableDrawer] = useState(false);
  const [timetableSearch, setTimetableSearch] = useState('');
  const [timetableTrackFilter, setTimetableTrackFilter] = useState('ALL');

  // Animation playback loop
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = 1000 / (speed * 2);
    const timer = setInterval(() => {
      setSimTime((prev) => {
        if (prev >= END_MIN) {
          setIsPlaying(false);
          return END_MIN;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Keyboard shortcut: Spacebar to Play/Pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleReset = () => {
    setIsPlaying(false);
    setSimTime(540); // 09:00
  };

  const handleStep = (delta) => {
    setSimTime((prev) => Math.max(START_MIN, Math.min(END_MIN, prev + delta)));
  };

  // Tracks definition
  const TRACKS = [
    {
      id: 'Track 1',
      name: 'Track 1 (Up Main Line)',
      direction: 'Eastbound (Station A → Station B)',
      arrow: '→',
      type: 'Passenger Main Line',
      speedLimit: '130 km/h',
    },
    {
      id: 'Track 2',
      name: 'Track 2 (Down Main Line)',
      direction: 'Westbound (Station B → Station A)',
      arrow: '←',
      type: 'Passenger Main Line',
      speedLimit: '130 km/h',
    },
    {
      id: 'Track 3',
      name: 'Track 3 (Loop / Overtake Line)',
      direction: 'Bi-directional (Overtake & Platform Loop)',
      arrow: '⇄',
      type: 'Loop & Overtake',
      speedLimit: '75 km/h',
    },
    {
      id: 'Track 4',
      name: 'Track 4 (Freight / Goods Line)',
      direction: 'Dedicated Freight Corridor',
      arrow: '⇄',
      type: 'Heavy Freight',
      speedLimit: '100 km/h',
    },
  ];

  // Train statuses and positions at current simulation clock
  const trainSimStates = useMemo(() => {
    return trains.map((t) => {
      const arr = timeToMin(t.arrival_time);
      const dep = timeToMin(t.departure_time);
      const isEastbound = t.track === 'Track 1' || t.track === 'Track 3';

      let state = 'SCHEDULED';
      let progress = 0; // 0 to 1
      let posX = isEastbound ? 8 : 92;

      if (simTime < arr) {
        if (arr - simTime <= 25) {
          state = 'APPROACHING';
          const approachProg = 1 - (arr - simTime) / 25;
          posX = isEastbound ? 2 + approachProg * 6 : 98 - approachProg * 6;
        } else {
          state = 'SCHEDULED';
          posX = isEastbound ? 2 : 98;
        }
      } else if (simTime >= arr && simTime <= dep) {
        state = 'IN_TRANSIT';
        const span = Math.max(1, dep - arr);
        progress = (simTime - arr) / span;
        posX = isEastbound ? 10 + progress * 80 : 90 - progress * 80;
      } else if (simTime > dep) {
        if (simTime - dep <= 20) {
          state = 'CLEARING';
          const clearProg = (simTime - dep) / 20;
          posX = isEastbound ? 90 + clearProg * 8 : 10 - clearProg * 8;
        } else {
          state = 'COMPLETED';
          posX = isEastbound ? 98 : 2;
        }
      }

      return {
        ...t,
        state,
        progress,
        posX: Math.max(2, Math.min(98, posX)),
        isEastbound,
      };
    });
  }, [trains, simTime]);

  // Section states at current simulation clock
  const trackSectionStates = useMemo(() => {
    const states = {};

    TRACKS.forEach((track) => {
      // Find blocks on this track
      const trackBlocks = scheduledBlocks.filter((b) => b.track === track.id);
      let activeBlock = null;
      let upcomingBlock = null;
      let completedBlock = null;

      for (const b of trackBlocks) {
        const bStart = timeToMin(b.start_time);
        const bEnd = timeToMin(b.end_time);

        if (simTime >= bStart && simTime <= bEnd) {
          activeBlock = b;
          break;
        } else if (simTime >= bStart - 60 && simTime < bStart) {
          upcomingBlock = b;
        } else if (simTime > bEnd && simTime <= bEnd + 45) {
          completedBlock = b;
        }
      }

      // Check active trains on this track
      const activeTrains = trainSimStates.filter(
        (t) => t.track === track.id && t.state === 'IN_TRANSIT'
      );

      let status = 'AVAILABLE';
      let statusColor = '#24613B'; // Green
      let statusLabel = 'AVAILABLE (Clear Section)';

      if (activeBlock) {
        status = 'MAINTENANCE_BLOCKED';
        statusColor = '#DC2626'; // Red/Amber
        statusLabel = `MAINTENANCE BLOCKED (${activeBlock.block_id})`;
      } else if (activeTrains.length > 0) {
        status = 'TRAIN_OCCUPIED';
        statusColor = '#1D4ED8'; // Cobalt
        statusLabel = `TRAIN OCCUPIED (${activeTrains.map((t) => t.train_id).join(', ')})`;
      } else if (upcomingBlock) {
        status = 'UPCOMING_MAINTENANCE';
        statusColor = '#B45309'; // Amber
        statusLabel = `UPCOMING MAINTENANCE (${upcomingBlock.start_time} - ${upcomingBlock.end_time})`;
      } else if (completedBlock) {
        status = 'COMPLETED_MAINTENANCE';
        statusColor = '#6E7681';
        statusLabel = 'MAINTENANCE COMPLETED (Track Restored)';
      }

      states[track.id] = {
        status,
        statusColor,
        statusLabel,
        activeBlock,
        upcomingBlock,
        completedBlock,
        activeTrains,
        trackBlocks,
      };
    });

    return states;
  }, [scheduledBlocks, trainSimStates, simTime]);

  // Overall network telemetry
  const telemetry = useMemo(() => {
    const activeTrainsCount = trainSimStates.filter((t) => t.state === 'IN_TRANSIT').length;
    const activeBlocksCount = Object.values(trackSectionStates).filter(
      (s) => s.status === 'MAINTENANCE_BLOCKED'
    ).length;
    const availableTracksCount = Object.values(trackSectionStates).filter(
      (s) => s.status === 'AVAILABLE'
    ).length;
    const clearancePct = Math.round((availableTracksCount / 4) * 100);

    return {
      activeTrainsCount,
      activeBlocksCount,
      availableTracksCount,
      clearancePct,
    };
  }, [trainSimStates, trackSectionStates]);

  // Filtered timetable for drawer
  const filteredTimetable = useMemo(() => {
    return trains.filter((t) => {
      const matchTrack = timetableTrackFilter === 'ALL' || t.track === timetableTrackFilter;
      const matchSearch =
        !timetableSearch ||
        t.train_id.toLowerCase().includes(timetableSearch.toLowerCase()) ||
        t.train_name.toLowerCase().includes(timetableSearch.toLowerCase());
      return matchTrack && matchSearch;
    });
  }, [trains, timetableTrackFilter, timetableSearch]);

  const selectedTrackData = trackSectionStates[selectedTrack];
  const selectedTrackInfo = TRACKS.find((t) => t.id === selectedTrack);

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. TOP SIMULATION TELEMETRY & CLOCK BAR */}
      <div
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Left: Operational Mode & Network Identity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 className="page-title" style={{ margin: 0, fontSize: '18px' }}>
              Operations Center
            </h2>
            <span
              className="badge-tag"
              style={{
                background: isPlaying ? '#DCFCE7' : '#F1F5F9',
                color: isPlaying ? '#15803D' : '#475569',
                fontWeight: '700',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isPlaying ? '#16A34A' : '#94A3B8',
                  display: 'inline-block',
                }}
              />
              {isPlaying ? `SIMULATION ACTIVE (${speed}x)` : 'SIMULATION PAUSED'}
            </span>
          </div>
          <div className="page-description" style={{ marginTop: '2px' }}>
            Live corridor schematic & train movement simulation · Section A–B (Tracks 1 to 4)
          </div>
        </div>

        {/* Center: Live Digital Clock */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--c-surface-alt)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--c-border-light)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--c-text-muted)', fontWeight: '700' }}>
              OPERATIONAL TIME (IST)
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--c-text-primary)' }}>
              {minToTime(simTime)}:00
            </div>
          </div>
          <div style={{ borderLeft: '1px solid var(--c-border-light)', paddingLeft: '10px', fontSize: '11px', color: 'var(--c-text-secondary)' }}>
            <div>DATE: <strong>20 SEP 2026</strong></div>
            <div>STATUS: <strong style={{ color: '#16A34A' }}>NORMAL</strong></div>
          </div>
        </div>

        {/* Right: Operational Telemetry Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div className="badge-tag" style={{ background: '#EFF6FF', color: '#1D4ED8', padding: '6px 10px', fontSize: '11.5px' }}>
            🚆 <strong>{telemetry.activeTrainsCount}</strong> Trains Active
          </div>
          <div className="badge-tag" style={{ background: telemetry.activeBlocksCount > 0 ? '#FEF2F2' : '#F8FAFC', color: telemetry.activeBlocksCount > 0 ? '#DC2626' : '#64748B', padding: '6px 10px', fontSize: '11.5px' }}>
            🚧 <strong>{telemetry.activeBlocksCount}</strong> Track Possessions
          </div>
          <div className="badge-tag" style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 10px', fontSize: '11.5px' }}>
            ⚡ <strong>{telemetry.clearancePct}%</strong> Section Clearance
          </div>
        </div>
      </div>

      {/* 2. MAIN RAILWAY SCHEMATIC WORKSPACE */}
      <div
        className="ops-panel"
        style={{
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          background: '#0F172A', // Railway Dark Control Room aesthetic
          color: '#F8FAFC',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        }}
      >
        {/* Schematic Header Bar */}
        <div
          style={{
            padding: '10px 16px',
            background: '#1E293B',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11.5px',
          }}
        >
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', letterSpacing: '0.05em', color: '#94A3B8' }}>
              RAILWAY NETWORK SCHEMATIC · ABSOLUTE AUTOMATIC BLOCK
            </span>
            <span style={{ color: '#64748B' }}>|</span>
            <span>
              STATION A: <strong style={{ color: '#E2E8F0' }}>WEST JN TERMINAL</strong>
            </span>
            <span>⟷</span>
            <span>
              STATION B: <strong style={{ color: '#E2E8F0' }}>EAST JN TERMINAL</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#CBD5E1' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }}></span>
              Clear
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#CBD5E1' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
              Occupied
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#CBD5E1' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></span>
              Maintenance Possession
            </span>
          </div>
        </div>

        {/* Schematic Canvas Layout */}
        <div style={{ padding: '24px 20px', position: 'relative', minHeight: '380px' }}>
          {/* Station Platform A (West Terminal) */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '20px',
              bottom: '20px',
              width: '60px',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <div
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontWeight: '700',
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: '#94A3B8',
              }}
            >
              STATION A (WEST JN)
            </div>
            <div style={{ marginTop: '8px', width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
          </div>

          {/* Station Platform B (East Terminal) */}
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '20px',
              bottom: '20px',
              width: '60px',
              background: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '2px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <div
              style={{
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                fontWeight: '700',
                fontSize: '11px',
                letterSpacing: '0.1em',
                color: '#94A3B8',
              }}
            >
              STATION B (EAST JN)
            </div>
            <div style={{ marginTop: '8px', width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
          </div>

          {/* 4 Track Corridors */}
          <div style={{ marginLeft: '70px', marginRight: '70px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {TRACKS.map((track) => {
              const sec = trackSectionStates[track.id];
              const isSelected = selectedTrack === track.id;
              const isBlocked = sec.status === 'MAINTENANCE_BLOCKED';
              const isOccupied = sec.status === 'TRAIN_OCCUPIED';
              const isUpcoming = sec.status === 'UPCOMING_MAINTENANCE';

              // Track line styles
              let trackColor = '#475569';
              let trackBg = 'transparent';
              if (isBlocked) {
                trackColor = '#EF4444';
                trackBg = 'rgba(239, 68, 68, 0.15)';
              } else if (isOccupied) {
                trackColor = '#3B82F6';
                trackBg = 'rgba(59, 130, 246, 0.1)';
              } else if (isUpcoming) {
                trackColor = '#F59E0B';
              }

              const trackTrains = trainSimStates.filter((t) => t.track === track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  style={{
                    position: 'relative',
                    padding: '10px 14px',
                    borderRadius: '4px',
                    background: isSelected ? 'rgba(30, 41, 59, 0.9)' : trackBg,
                    border: isSelected ? '1px solid #60A5FA' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  title={`Click to inspect ${track.name}`}
                >
                  {/* Track Meta Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', color: isSelected ? '#93C5FD' : '#E2E8F0' }}>
                        {track.name}
                      </span>
                      <span style={{ color: '#64748B' }}>{track.direction}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          fontWeight: '700',
                          background: isBlocked ? '#991B1B' : isOccupied ? '#1E40AF' : isUpcoming ? '#92400E' : '#14532D',
                          color: '#FFFFFF',
                        }}
                      >
                        {sec.statusLabel}
                      </span>
                      <span className="cell-mono" style={{ color: '#94A3B8', fontSize: '10.5px' }}>
                        LIMIT: {track.speedLimit}
                      </span>
                    </div>
                  </div>

                  {/* Physical Track Line Graphic */}
                  <div
                    style={{
                      height: '24px',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {/* The Rail Bed Line */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: trackColor,
                        borderRadius: '2px',
                      }}
                    />

                    {/* Rail Sleepers / Ties (Railway texture) */}
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        height: '10px',
                        backgroundImage: `repeating-linear-gradient(90deg, ${trackColor} 0px, ${trackColor} 2px, transparent 2px, transparent 14px)`,
                        opacity: 0.6,
                      }}
                    />

                    {/* Active Maintenance Possession Envelope Banner */}
                    {isBlocked && sec.activeBlock && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '20%',
                          right: '20%',
                          height: '20px',
                          background: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.3) 0, rgba(239,68,68,0.3) 10px, rgba(220,38,38,0.5) 10px, rgba(220,38,38,0.5) 20px)',
                          border: '1px solid #EF4444',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: '#FEE2E2',
                          zIndex: 3,
                        }}
                      >
                        <span>🚧 POSSESSION ACTIVE: {sec.activeBlock.block_id}</span>
                        <span>({sec.activeBlock.start_time} - {sec.activeBlock.end_time})</span>
                        <span>[{sec.activeBlock.departments.join(', ')}]</span>
                      </div>
                    )}

                    {/* Upcoming Maintenance Preview (Dashed line) */}
                    {isUpcoming && sec.upcomingBlock && (
                      <div
                        style={{
                          position: 'absolute',
                          left: '20%',
                          right: '20%',
                          height: '18px',
                          border: '1px dashed #F59E0B',
                          background: 'rgba(245, 158, 11, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9.5px',
                          color: '#FDE68A',
                          zIndex: 2,
                        }}
                      >
                        ⏱ UPCOMING POSSESSION {sec.upcomingBlock.block_id} AT {sec.upcomingBlock.start_time}
                      </div>
                    )}

                    {/* Moving Trains on Track */}
                    {trackTrains.map((t) => {
                      if (t.state !== 'IN_TRANSIT' && t.state !== 'APPROACHING' && t.state !== 'CLEARING') {
                        return null;
                      }

                      const isTrainSelected = selectedTrain?.train_id === t.train_id;

                      return (
                        <div
                          key={t.train_id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrain(t);
                          }}
                          style={{
                            position: 'absolute',
                            left: `${t.posX}%`,
                            transform: 'translate(-50%, -50%)',
                            top: '50%',
                            zIndex: 10,
                            cursor: 'pointer',
                            transition: 'left 0.4s linear',
                          }}
                        >
                          <div
                            style={{
                              background: isTrainSelected ? '#FBBF24' : '#3B82F6',
                              color: isTrainSelected ? '#1E293B' : '#FFFFFF',
                              padding: '2px 8px',
                              borderRadius: '3px',
                              fontSize: '10px',
                              fontWeight: '700',
                              fontFamily: 'var(--font-mono)',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                              border: isTrainSelected ? '2px solid #FFFFFF' : '1px solid #60A5FA',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span>{t.isEastbound ? '🚆→' : '←🚆'}</span>
                            <span>{t.train_id}</span>
                            <span style={{ fontSize: '9px', opacity: 0.85 }}>({minToTime(simTime)})</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. SIMULATION PLAYBACK CONTROLLER */}
        <div
          style={{
            background: '#1E293B',
            borderTop: '1px solid #334155',
            padding: '12px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Controls Button Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  minWidth: '100px',
                  background: isPlaying ? '#DC2626' : '#16A34A',
                  borderColor: isPlaying ? '#B91C1C' : '#15803D',
                  color: '#FFFFFF',
                  fontWeight: '700',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ background: '#334155', color: '#E2E8F0', borderColor: '#475569' }}
                title="Reset simulation to 09:00"
              >
                ↺ RESET
              </button>

              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(-15)}
                  style={{ background: '#334155', color: '#CBD5E1', borderColor: '#475569', fontSize: '11px', padding: '4px 8px' }}
                  title="Jump back 15 minutes"
                >
                  -15m
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(15)}
                  style={{ background: '#334155', color: '#CBD5E1', borderColor: '#475569', fontSize: '11px', padding: '4px 8px' }}
                  title="Jump forward 15 minutes"
                >
                  +15m
                </button>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>SPEED:</span>
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    background: speed === s ? '#3B82F6' : '#334155',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '2px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Quick Manifest Drawer Toggle */}
            <button
              onClick={() => setShowTimetableDrawer((p) => !p)}
              style={{
                background: showTimetableDrawer ? '#2563EB' : '#334155',
                color: '#FFFFFF',
                border: '1px solid #475569',
                borderRadius: 'var(--radius-xs)',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              📋 {showTimetableDrawer ? 'HIDE TIMETABLE' : 'SHOW TRAIN TIMETABLE (14)'}
            </button>
          </div>

          {/* Scrubbable Timeline Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <input
              type="range"
              min={START_MIN}
              max={END_MIN}
              value={simTime}
              onChange={(e) => setSimTime(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: 'ew-resize',
                accentColor: '#3B82F6',
              }}
            />
            {/* Hour Markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              <span>06:00</span>
              <span>08:00</span>
              <span>10:00</span>
              <span>12:00</span>
              <span>14:00</span>
              <span>16:00</span>
              <span>18:00</span>
              <span>20:00</span>
              <span>22:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTEXTUAL INSPECTION PANELS (Selected Train & Selected Track Section) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Panel A: Selected Section Asset & Possession Details */}
        <div className="ops-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Track Section Inspector: {selectedTrackInfo?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Operational clearance and maintenance possession state
              </div>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                padding: '2px 8px',
                borderRadius: '2px',
                fontWeight: '700',
                background: selectedTrackData.statusColor,
                color: '#FFFFFF',
              }}
            >
              {selectedTrackData.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="panel-body" style={{ fontSize: '12px', lineHeight: 1.6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Section:</span>{' '}
                <strong>A–B (West Jn ⟷ East Jn)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Track Designation:</span>{' '}
                <strong>{selectedTrackInfo?.type}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Signaling:</span>{' '}
                <strong>Automatic Block (4-Aspect)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Traction OHE:</span>{' '}
                <strong>25kV AC Electrified</strong>
              </div>
            </div>

            {/* Active Block Info */}
            {selectedTrackData.activeBlock ? (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 'var(--radius-xs)',
                  padding: '12px',
                  marginBottom: '10px',
                }}
              >
                <div style={{ fontWeight: '700', color: '#991B1B', marginBottom: '4px' }}>
                  ACTIVE POSSESSION: {selectedTrackData.activeBlock.block_id}
                </div>
                <div style={{ fontSize: '11.5px', color: '#7F1D1D' }}>
                  Window: {selectedTrackData.activeBlock.start_time} – {selectedTrackData.activeBlock.end_time} ({selectedTrackData.activeBlock.block_duration}h active)
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                  {selectedTrackData.activeBlock.departments.map((d) => (
                    <DeptBadge key={d} department={d} />
                  ))}
                </div>
                <div style={{ marginTop: '8px', borderTop: '1px solid #FECACA', paddingTop: '6px' }}>
                  <strong>Assigned Maintenance Tasks:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {selectedTrackData.activeBlock.tasks.map((t) => (
                      <li key={t.task_id}>
                        <code>{t.task_id}</code>: {t.description} ({t.duration}h)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : selectedTrackData.upcomingBlock ? (
              <div
                style={{
                  background: '#FFFBEB',
                  border: '1px solid #FCD34D',
                  borderRadius: 'var(--radius-xs)',
                  padding: '10px',
                  color: '#92400E',
                }}
              >
                <strong>⏱ UPCOMING POSSESSION:</strong> Block {selectedTrackData.upcomingBlock.block_id} starts at {selectedTrackData.upcomingBlock.start_time} ({selectedTrackData.upcomingBlock.departments.join(', ')}).
              </div>
            ) : (
              <div style={{ padding: '8px 12px', background: 'var(--c-surface-alt)', borderRadius: 'var(--radius-xs)', color: '#166534' }}>
                ✓ No active possession at {minToTime(simTime)}. Section clear for authorized movements.
              </div>
            )}
          </div>
        </div>

        {/* Panel B: Selected Train Inspector */}
        <div className="ops-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Train Inspector: {selectedTrain ? `${selectedTrain.train_id} (${selectedTrain.train_name})` : 'Select a Train'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Real-time traversal metrics and scheduled timings
              </div>
            </div>
            {selectedTrain && (
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTrain(null)}
                style={{ padding: '2px 8px', fontSize: '10px' }}
              >
                ✕ Deselect
              </button>
            )}
          </div>

          <div className="panel-body" style={{ fontSize: '12px', lineHeight: 1.6 }}>
            {selectedTrain ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Train ID:</span>{' '}
                    <strong>{selectedTrain.train_id}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Service Name:</span>{' '}
                    <strong>{selectedTrain.train_name}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Assigned Corridor:</span>{' '}
                    <strong>{selectedTrain.track}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Direction:</span>{' '}
                    <strong>{selectedTrain.isEastbound ? 'Eastbound (A → B)' : 'Westbound (B → A)'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Scheduled Section Entry:</span>{' '}
                    <strong className="cell-mono">{selectedTrain.arrival_time}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Scheduled Section Exit:</span>{' '}
                    <strong className="cell-mono">{selectedTrain.departure_time}</strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px',
                    background: 'var(--c-surface-alt)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--c-border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>TRAVERSAL STATUS:</span>
                    <strong
                      style={{
                        color:
                          selectedTrain.state === 'IN_TRANSIT'
                            ? '#2563EB'
                            : selectedTrain.state === 'COMPLETED'
                            ? '#16A34A'
                            : '#D97706',
                      }}
                    >
                      {selectedTrain.state.replace('_', ' ')}
                    </strong>
                  </div>
                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.round(selectedTrain.progress * 100)}%`,
                        background: '#3B82F6',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--c-text-muted)', marginTop: '4px' }}>
                    <span>Entry: Station A</span>
                    <span>{Math.round(selectedTrain.progress * 100)}% traversed</span>
                    <span>Exit: Station B</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                Click on any moving train on the schematic above to inspect its real-time telemetry, timetable, and route parameters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. INTEGRATED TRAIN TIMETABLE MANIFEST DRAWER (Preserves all functionality of Trains page) */}
      {showTimetableDrawer && (
        <div className="ops-panel anim-slide-in">
          <div className="panel-header">
            <div>
              <div className="panel-title">Train Timetable Manifest (Section A–B Master Schedule)</div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Complete operational timetable used to enforce zero-conflict safety margins
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search train ID or name..."
                value={timetableSearch}
                onChange={(e) => setTimetableSearch(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--c-border)',
                }}
              />
              <select
                value={timetableTrackFilter}
                onChange={(e) => setTimetableTrackFilter(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid var(--c-border)',
                }}
              >
                <option value="ALL">All Tracks</option>
                <option value="Track 1">Track 1</option>
                <option value="Track 2">Track 2</option>
                <option value="Track 3">Track 3</option>
                <option value="Track 4">Track 4</option>
              </select>
            </div>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Train ID</th>
                  <th>Train Service Name</th>
                  <th>Assigned Track</th>
                  <th>Section</th>
                  <th>Arrival (Entry)</th>
                  <th>Departure (Exit)</th>
                  <th>Simulation State at {minToTime(simTime)}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimetable.map((t) => {
                  const stateObj = trainSimStates.find((ts) => ts.train_id === t.train_id);
                  const isSelected = selectedTrain?.train_id === t.train_id;

                  return (
                    <tr key={t.train_id} style={{ background: isSelected ? 'var(--c-surface-alt)' : undefined }}>
                      <td className="cell-mono" style={{ fontWeight: '700', color: 'var(--c-text-primary)' }}>
                        {t.train_id}
                      </td>
                      <td style={{ fontWeight: '600' }}>{t.train_name}</td>
                      <td>
                        <span className="badge-tag">{t.track}</span>
                      </td>
                      <td>{t.section}</td>
                      <td className="cell-mono">{t.arrival_time}</td>
                      <td className="cell-mono">{t.departure_time}</td>
                      <td>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '2px',
                            background:
                              stateObj?.state === 'IN_TRANSIT'
                                ? '#DBEAFE'
                                : stateObj?.state === 'COMPLETED'
                                ? '#DCFCE7'
                                : '#F1F5F9',
                            color:
                              stateObj?.state === 'IN_TRANSIT'
                                ? '#1D4ED8'
                                : stateObj?.state === 'COMPLETED'
                                ? '#15803D'
                                : '#475569',
                          }}
                        >
                          {stateObj?.state.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setSelectedTrain(stateObj);
                            setSelectedTrack(t.track);
                          }}
                          style={{ padding: '2px 6px', fontSize: '10.5px' }}
                        >
                          Locate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
