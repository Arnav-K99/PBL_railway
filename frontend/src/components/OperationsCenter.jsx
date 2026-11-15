import React, { useState, useEffect, useRef } from 'react';
import DeptBadge from './DeptBadge';
import StatusBadge from './StatusBadge';

// Helper: Convert "HH:MM" to total minutes from midnight
function timeToMin(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Convert total minutes to "HH:MM"
function minToTime(mins) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export default function OperationsCenter({
  scheduleResult,
  tasks = [],
  trains = [],
  availableBlocks = [],
  onNavigateToBlock,
}) {
  // Simulation transit animation state
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0); // 0.5, 1.0, 2.0
  const [progress, setProgress] = useState(25); // 0 to 100 percentage
  const [selectedTrack, setSelectedTrack] = useState('Track 1');
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Active blocks from scheduler
  const scheduledBlocks = scheduleResult?.blocks || [];

  // Continuous smooth animation loop for train transit
  useEffect(() => {
    let animId;
    let lastTime = null;

    const loop = (timestamp) => {
      if (lastTime === null) {
        lastTime = timestamp;
      }
      const rawDt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      // Clamp dt to avoid big jumps when tab pauses or wakes up
      const dt = Math.min(rawDt, 0.05);

      if (isPlaying) {
        setProgress((prev) => {
          // Smooth 12-second transit across Panipat Yard
          const rate = 8.33 * speedMultiplier;
          const nextVal = prev + rate * dt;
          return nextVal >= 100 ? 0 : nextVal;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, speedMultiplier]);

  // Turnout Crossover Math:
  // Track 1 Y = 50, Track 2 Y = 100, Track 3 Y = 150, Track 4 Y = 200
  // Turnout begins at X = 270 (Track 1) and lands at X = 430 (Track 3)
  const calcTrainPosition = (p) => {
    // p is 0 to 100
    const startX = 140;
    const turnoutStartX = 270;
    const turnoutEndX = 430;
    const platformX = 760;

    // Phase 1: Moving straight on Track 1 (p from 0 to 25%)
    if (p <= 25) {
      const segT = p / 25;
      const x = startX + (turnoutStartX - startX) * segT;
      const y = 50;
      return { x, y, angle: 0, phase: 'APPROACHING_TURNOUT' };
    }

    // Phase 2: Crossover diversion curve to Track 3 (p from 25% to 55%)
    if (p <= 55) {
      const segT = (p - 25) / 30; // 0 to 1
      // Cubic bezier: P0=(270, 50), P1=(320, 50), P2=(380, 150), P3=(430, 150)
      const t = segT;
      const oneMinusT = 1 - t;
      const bx =
        Math.pow(oneMinusT, 3) * 270 +
        3 * Math.pow(oneMinusT, 2) * t * 320 +
        3 * oneMinusT * Math.pow(t, 2) * 380 +
        Math.pow(t, 3) * 430;
      const by =
        Math.pow(oneMinusT, 3) * 50 +
        3 * Math.pow(oneMinusT, 2) * t * 50 +
        3 * oneMinusT * Math.pow(t, 2) * 150 +
        Math.pow(t, 3) * 150;

      // Tangent derivative for realistic rotation
      const dx =
        3 * Math.pow(oneMinusT, 2) * (320 - 270) +
        6 * oneMinusT * t * (380 - 320) +
        3 * Math.pow(t, 2) * (430 - 380);
      const dy =
        3 * Math.pow(oneMinusT, 2) * (50 - 50) +
        6 * oneMinusT * t * (150 - 50) +
        3 * Math.pow(t, 2) * (150 - 150);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

      return { x: bx, y: by, angle: angle * 0.75, phase: 'SWITCHING_TURNOUT' };
    }

    // Phase 3: Gliding along Track 3 to Platform 3 (p from 55% to 100%)
    const segT = (p - 55) / 45;
    const x = turnoutEndX + (platformX - turnoutEndX) * segT;
    const y = 150;
    return { x, y, angle: 0, phase: 'ENTERING_PLATFORM' };
  };

  const trainPos = calcTrainPosition(progress);
  const roundedProgress = Math.round(progress);

  // Status text based on current animation phase
  let phaseStatusBadge = 'TURNOUT SWITCHING IN PROGRESS (15 KM/H SLOW SPEED)';
  let phaseStatusDetail = `Switch Turnout 42B actuated. Train smoothly diverting across crossover to Track 3.`;

  if (trainPos.phase === 'APPROACHING_TURNOUT') {
    phaseStatusBadge = 'MAINLINE APPROACH (45 KM/H SPEED RESTRICTION)';
    phaseStatusDetail = `Train EXP-01 holding caution signal. Preparing for turnout actuation at Switch 42B.`;
  } else if (trainPos.phase === 'ENTERING_PLATFORM') {
    if (progress > 92) {
      phaseStatusBadge = 'ARRIVED & DOCKED • PLATFORM 3 SECURED';
      phaseStatusDetail = `Interlocking verified. EXP-01 safely docked at Platform 3 without passenger delays.`;
    } else {
      phaseStatusBadge = 'DIVERSION CLEARED • TRANSITING TO PLATFORM 3';
      phaseStatusDetail = `Turnout 42B cleared. Train moving smoothly on Track 3 loop to platform dock.`;
    }
  }

  const handleStepTransit = () => {
    setProgress((prev) => (prev >= 95 ? 0 : Math.min(100, prev + 15)));
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* =========================================================================
          TOP OPERATIONS SIMULATION CARD (PANIPAT JUNCTION 4-TRACK YARD TOPOLOGY)
          Faithfully matches the user's reference diagram
          ========================================================================= */}
      <div
        className="simulation-container-card"
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Card Header Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: '#F59E0B',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  letterSpacing: '0.04em',
                }}
              >
                INTERLOCKING DIVERSION
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#64748B', fontWeight: '600' }}>
                SEC-0004
              </span>
            </div>
            <h2 style={{ fontSize: '19px', fontWeight: '800', color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>
              PANIPAT JUNCTION <span style={{ color: '#94A3B8', fontWeight: '400' }}>•</span> 4-Track Yard Topology
            </h2>
          </div>

          {/* Right Controls: Speed pills, Pause, Switching % */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  style={{
                    border: 'none',
                    background: speedMultiplier === s ? '#FFFFFF' : 'transparent',
                    color: speedMultiplier === s ? '#0F172A' : '#64748B',
                    fontWeight: speedMultiplier === s ? '700' : '500',
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    boxShadow: speedMultiplier === s ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#0F172A',
                fontWeight: '600',
                fontSize: '12px',
                padding: '6px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              {isPlaying ? '⏸ Pause' : '▶ Resume'}
            </button>

            <div
              style={{
                fontSize: '12.5px',
                color: '#0F172A',
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
                background: '#F8FAFC',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
              }}
            >
              Switching Track: <span style={{ color: '#2563EB', fontWeight: '700' }}>{roundedProgress}%</span>
            </div>

            <button
              onClick={() => setProgress(0)}
              title="Reset Transit Position"
              style={{
                border: '1px solid #E2E8F0',
                background: '#FFFFFF',
                color: '#64748B',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Amber Alert Banner */}
        <div
          style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '8px',
            padding: '10px 16px',
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: '#92400E',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠</span>
            <span>
              Ongoing Maintenance on <strong style={{ color: '#78350F' }}>Track 1</strong>: OHE Catenary Tensioning & Rail Grinding Window
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1D4ED8' }}>
            <span>☊</span>
            <span>
              Switch Turnout 42B: <strong style={{ textDecoration: 'underline' }}>Diverting to Track 3</strong>
            </span>
          </div>
        </div>

        {/* Phase Status Sub-header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '4px 0 16px 0',
            color: '#64748B',
            borderBottom: '1px solid #F1F5F9',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span style={{ color: '#2563EB', fontWeight: '700', letterSpacing: '0.04em' }}>
            {phaseStatusBadge}
          </span>
          <span style={{ color: '#475569' }}>
            {phaseStatusDetail}
          </span>
          <span style={{ fontWeight: '700', color: '#0F172A' }}>
            {roundedProgress}% Complete
          </span>
        </div>

        {/* =====================================================================
            4-TRACK PHYSICAL SVG CANVAS
            Tracks: Y = 50 (Track 1), Y = 100 (Track 2), Y = 150 (Track 3), Y = 200 (Track 4)
            ===================================================================== */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflowX: 'auto',
            background: '#FFFFFF',
            borderRadius: '8px',
            padding: '10px 0',
          }}
        >
          <svg
            viewBox="0 0 980 250"
            style={{
              width: '100%',
              minWidth: '860px',
              height: 'auto',
              display: 'block',
            }}
          >
            <defs>
              {/* Hazard Stripes Pattern for Maintenance Zone */}
              <pattern
                id="hazardStripes"
                width="12"
                height="12"
                patternTransform="rotate(45 0 0)"
                patternUnits="userSpaceOnUse"
              >
                <rect x="0" y="0" width="6" height="12" fill="#FEF3C7" />
                <rect x="6" y="0" width="6" height="12" fill="#FDE68A" />
              </pattern>

              {/* Glow filter for active route */}
              <filter id="blueRouteGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* ---------------------------------------------------------------
                TRACK 1 (Up Main Line) - Y = 50
                --------------------------------------------------------------- */}
            {/* Track Line */}
            <line x1="120" y1="50" x2="680" y2="50" stroke="#CBD5E1" strokeWidth="3" />

            {/* Maintenance Work Block on Track 1 (Blocked Zone) */}
            <g transform="translate(320, 36)">
              <rect
                x="0"
                y="0"
                width="280"
                height="28"
                rx="6"
                fill="url(#hazardStripes)"
                stroke="#F59E0B"
                strokeWidth="1.5"
              />
              <text
                x="140"
                y="18"
                textAnchor="middle"
                fill="#92400E"
                fontSize="10"
                fontWeight="800"
                fontFamily="var(--font-mono)"
                letterSpacing="0.05em"
              >
                MAINTENANCE WORK • TRACK 1 BLOCKED
              </text>
            </g>

            {/* Turnout Indicator on Track 1 */}
            <g transform="translate(262, 38)">
              <rect x="0" y="0" width="34" height="16" rx="4" fill="#3B82F6" />
              <text x="17" y="11.5" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="700" fontFamily="var(--font-mono)">
                t 42B
              </text>
            </g>

            {/* ---------------------------------------------------------------
                TRACK 2 (Down Main Line) - Y = 100
                --------------------------------------------------------------- */}
            <line x1="120" y1="100" x2="680" y2="100" stroke="#CBD5E1" strokeWidth="3" />

            {/* ---------------------------------------------------------------
                TRACK 3 (Loop / Crossover Line) - Y = 150
                --------------------------------------------------------------- */}
            <line x1="120" y1="150" x2="680" y2="150" stroke="#CBD5E1" strokeWidth="3" />

            {/* THE ROYAL BLUE CROSSOVER TURNOUT CURVE */}
            {/* Smooth Cubic Bezier connecting Switch 42B on Track 1 to Track 3 */}
            <path
              d="M 270 50 C 320 50, 380 150, 430 150"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="6"
              strokeLinecap="round"
              filter="url(#blueRouteGlow)"
            />

            {/* Route Continuation along Track 3 in Blue */}
            <path
              d="M 430 150 L 720 150"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Blue Landing Indicator Dot on Track 3 */}
            <circle cx="430" cy="150" r="5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />

            {/* Diversion Cleared Tag */}
            <g transform="translate(445, 137)">
              <rect x="0" y="0" width="165" height="20" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
              <circle cx="10" cy="10" r="3" fill="#2563EB" />
              <text x="22" y="14" fill="#1D4ED8" fontSize="9.5" fontWeight="700" fontFamily="var(--font-mono)">
                / DIVERSION CLEARED → PF 3
              </text>
            </g>

            {/* ---------------------------------------------------------------
                TRACK 4 (Freight / Goods Line) - Y = 200
                --------------------------------------------------------------- */}
            <line x1="120" y1="200" x2="680" y2="200" stroke="#CBD5E1" strokeWidth="3" />

            {/* ---------------------------------------------------------------
                LEFT SIDE: TRACK IDENTIFIER PILLS
                --------------------------------------------------------------- */}
            {/* Track 1 Pill (Pink/Red) */}
            <g transform="translate(16, 38)">
              <rect x="0" y="0" width="86" height="24" rx="12" fill="#FEF2F2" stroke="#FECACA" strokeWidth="1.2" />
              <circle cx="14" cy="12" r="3.5" fill="#EF4444" />
              <text x="24" y="16" fill="#DC2626" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
                Track 1
              </text>
            </g>

            {/* Track 2 Pill (Neutral Gray) */}
            <g transform="translate(16, 88)">
              <rect x="0" y="0" width="86" height="24" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.2" />
              <circle cx="14" cy="12" r="3.5" fill="#94A3B8" />
              <text x="24" y="16" fill="#64748B" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
                Track 2
              </text>
            </g>

            {/* Track 3 Pill (Green - Active Route) */}
            <g transform="translate(16, 138)">
              <rect x="0" y="0" width="86" height="24" rx="12" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1.2" />
              <circle cx="14" cy="12" r="3.5" fill="#10B981" />
              <text x="24" y="16" fill="#059669" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
                Track 3
              </text>
            </g>

            {/* Track 4 Pill (Neutral Gray) */}
            <g transform="translate(16, 188)">
              <rect x="0" y="0" width="86" height="24" rx="12" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.2" />
              <circle cx="14" cy="12" r="3.5" fill="#94A3B8" />
              <text x="24" y="16" fill="#64748B" fontSize="11" fontWeight="600" fontFamily="var(--font-sans)">
                Track 4
              </text>
            </g>

            {/* ---------------------------------------------------------------
                RIGHT SIDE: PLATFORM DESTINATIONS
                --------------------------------------------------------------- */}
            {/* Platform 1 (Closed due to Maintenance) */}
            <g transform="translate(680, 37)">
              <rect
                x="0"
                y="0"
                width="160"
                height="26"
                rx="6"
                fill="#FEF2F2"
                stroke="#FCA5A5"
                strokeWidth="1.2"
                strokeDasharray="4 3"
              />
              <circle cx="14" cy="13" r="3.5" fill="#EF4444" />
              <text x="25" y="17" fill="#DC2626" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)">
                Platform 1 (Closed)
              </text>
            </g>

            {/* Platform 2 */}
            <g transform="translate(680, 87)">
              <rect x="0" y="0" width="160" height="26" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <circle cx="14" cy="13" r="3.5" fill="#94A3B8" />
              <text x="25" y="17" fill="#475569" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)">
                Platform 2
              </text>
            </g>

            {/* Platform 3 (Assigned Diverted Route) */}
            <g transform="translate(680, 137)">
              <rect x="0" y="0" width="186" height="26" rx="6" fill="#ECFDF5" stroke="#10B981" strokeWidth="1.5" />
              <circle cx="14" cy="13" r="3.5" fill="#10B981" />
              <text x="25" y="17" fill="#047857" fontSize="10.5" fontWeight="700" fontFamily="var(--font-sans)">
                Platform 3 • Assigned Route
              </text>
            </g>

            {/* Platform 4 */}
            <g transform="translate(680, 187)">
              <rect x="0" y="0" width="160" height="26" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.2" />
              <circle cx="14" cy="13" r="3.5" fill="#94A3B8" />
              <text x="25" y="17" fill="#475569" fontSize="10.5" fontWeight="600" fontFamily="var(--font-sans)">
                Platform 4
              </text>
            </g>

            {/* ---------------------------------------------------------------
                THE ANIMATED TRAIN CAPSULE [ ● EXP-01 ]
                Smoothly glides along Track 1 -> curves through Turnout 42B -> docks at PF 3
                --------------------------------------------------------------- */}
            <g
              transform={`translate(${trainPos.x}, ${trainPos.y}) rotate(${trainPos.angle})`}
            >
              {/* Outer Shadow Capsule */}
              <rect
                x="-36"
                y="-13"
                width="72"
                height="26"
                rx="13"
                fill="#0F172A"
                stroke="#38BDF8"
                strokeWidth="1.5"
                filter="drop-shadow(0 2px 5px rgba(15, 23, 42, 0.4))"
              />

              {/* Cyan Power Indicator Dot */}
              <circle cx="-22" cy="0" r="3" fill="#38BDF8" />

              {/* Train Label */}
              <text
                x="2"
                y="4"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="10"
                fontWeight="800"
                fontFamily="var(--font-mono)"
                letterSpacing="0.04em"
              >
                EXP-01
              </text>
            </g>
          </svg>
        </div>

        {/* Card Footer Row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #F1F5F9',
            marginTop: '8px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px', fontWeight: '500' }}>
            <span style={{ fontSize: '14px' }}>✓</span>
            <span>Interlocking verified: Safe clearance through Track 3 without passenger delays.</span>
          </div>

          <button
            onClick={handleStepTransit}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '9px 18px',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1E293B')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#0F172A')}
          >
            Continue Transit →
          </button>
        </div>
      </div>

      {/* =========================================================================
          BOTTOM SECTION: ACTIVE POSSESSION BLOCKS & LIVE CORRIDOR INSPECTOR
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Active Interlocking & Maintenance Block Possessions */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Authorized Possession Blocks ({scheduledBlocks.length})
            </h3>
            <span style={{ fontSize: '11px', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
              SAFETY CLEARED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {scheduledBlocks.map((blk) => (
              <div
                key={blk.block_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#F8FAFC',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#0F172A' }}>
                      {blk.block_id}
                    </strong>
                    <span
                      style={{
                        fontSize: '10.5px',
                        background: '#E2E8F0',
                        color: '#1E293B',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: '600',
                      }}
                    >
                      {blk.track}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    Window: {blk.start_time} – {blk.end_time} ({blk.block_duration}h active)
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#0F172A' }}>
                    {blk.tasks.length} tasks clubbed
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: '600' }}>
                    {blk.departments.join(' · ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Interlocking Diagnostics */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Turnout Interlocking & Speed Diagnostics
            </h3>
            <span style={{ fontSize: '11px', color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
              ACTUATED
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Primary Route (Track 1)</span>
              <span style={{ color: '#EF4444', fontWeight: '600' }}>BLOCKED (OHE & Grinding)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Assigned Diverted Route</span>
              <span style={{ color: '#059669', fontWeight: '600' }}>Track 3 (Loop / PF 3)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Point Machine Interlock</span>
              <span style={{ color: '#0F172A', fontWeight: '600', fontFamily: 'var(--font-mono)' }}>Switch 42B Reversed (Locked)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#64748B' }}>Crossover Speed Ceiling</span>
              <span style={{ color: '#0F172A', fontWeight: '600' }}>15 km/h (PSR Compliant)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>DP Optimal Clubbing</span>
              <span style={{ color: '#059669', fontWeight: '700' }}>3 Departments Co-located</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}