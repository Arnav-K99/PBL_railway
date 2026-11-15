import React, { useState, useEffect, useMemo, useRef } from 'react';
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

// Helper: Format continuous seconds for digital clock "HH:MM:SS"
function formatDigitalClock(simMins) {
  const totalSecs = Math.floor(simMins * 60);
  const h = Math.floor(totalSecs / 3600) % 24;
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.floor(totalSecs % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// COMPACT ANIMATED SVG SUBCOMPONENTS (Miniature Railway Models)
// ---------------------------------------------------------------------------

/**
 * Compact Signal Post with animated LED aspect glow
 */
function CompactSignal({ x, y, aspect = 'GREEN', signalId = 'S-1' }) {
  const isRed = aspect === 'RED';
  const isYellow = aspect === 'YELLOW';
  const isGreen = aspect === 'GREEN';

  const mastX = x;
  const mastY = y - 18;

  return (
    <g className="compact-signal" title={`Signal ${signalId}: ${aspect}`}>
      {/* Post */}
      <line x1={mastX} y1={y + 4} x2={mastX} y2={mastY} stroke="#334155" strokeWidth="2" />
      {/* Housing */}
      <rect x={mastX - 4} y={mastY - 14} width="8" height="15" rx="1.5" fill="#0F172A" stroke="#1E293B" strokeWidth="0.6" />
      
      {/* RED */}
      <circle cx={mastX} cy={mastY - 10.5} r="1.8" fill={isRed ? '#EF4444' : '#450A0A'} />
      {isRed && (
        <circle cx={mastX} cy={mastY - 10.5} r="3.5" fill="#EF4444" opacity="0.8" className="anim-signal-pulse" />
      )}

      {/* YELLOW */}
      <circle cx={mastX} cy={mastY - 6.5} r="1.8" fill={isYellow ? '#F59E0B' : '#451A03'} />
      {isYellow && (
        <circle cx={mastX} cy={mastY - 6.5} r="3.5" fill="#F59E0B" opacity="0.8" className="anim-signal-pulse" />
      )}

      {/* GREEN */}
      <circle cx={mastX} cy={mastY - 2.5} r="1.8" fill={isGreen ? '#22C55E' : '#052E16'} />
      {isGreen && (
        <circle cx={mastX} cy={mastY - 2.5} r="3.5" fill="#22C55E" opacity="0.8" className="anim-signal-pulse" />
      )}
    </g>
  );
}

/**
 * Compact Miniature Passenger Trainset (~108px total length)
 * Locomotive + 2 LHB Coaches with rotating wheel indicators & illuminated headlight
 */
function CompactPassengerTrain({ train, x, y, direction = 'EAST', isSelected = false, isMoving = false, onClick }) {
  const isEast = direction === 'EAST';
  const name = train.train_name || '';

  // Livery
  let locoColor = '#1E40AF'; // Navy Blue default
  let locoStripe = '#F59E0B'; // Gold
  let coachColor = '#B91C1C'; // Rajdhani Crimson
  let coachStripe = '#F1F5F9';

  if (name.includes('Vande Bharat')) {
    locoColor = '#F8FAFC';
    locoStripe = '#1D4ED8';
    coachColor = '#F8FAFC';
    coachStripe = '#1D4ED8';
  } else if (name.includes('Rajdhani')) {
    locoColor = '#DC2626';
    locoStripe = '#FDE047';
    coachColor = '#991B1B';
    coachStripe = '#E2E8F0';
  } else if (name.includes('Shatabdi')) {
    locoColor = '#1E3A8A';
    locoStripe = '#FBBF24';
    coachColor = '#1E40AF';
    coachStripe = '#FCD34D';
  }

  // Length: Loco 38px, Coupler 3px, Coach 1 32px, Coupler 3px, Coach 2 32px => 108px
  return (
    <g
      className="compact-train-group"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'filter 0.2s ease' }}
      filter={isSelected ? 'drop-shadow(0 0 5px rgba(245,158,11,0.8))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'}
    >
      {/* Headlight Illuminated Beam */}
      {isEast ? (
        <polygon
          points={`${x},${y - 5} ${x + 55},${y - 12} ${x + 55},${y + 8} ${x},${y - 1}`}
          fill="url(#headlight-beam-east)"
          opacity="0.55"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <polygon
          points={`${x},${y - 5} ${x - 55},${y - 12} ${x - 55},${y + 8} ${x},${y - 1}`}
          fill="url(#headlight-beam-west)"
          opacity="0.55"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* --- A. MINIATURE LOCOMOTIVE --- */}
      <g transform={isEast ? `translate(${x - 38}, ${y})` : `translate(${x}, ${y})`}>
        {/* Wheels on Rails */}
        <circle cx="8" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="15" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="23" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="30" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Locomotive Aerodynamic Body */}
        {isEast ? (
          <path
            d="M 1,-1 L 31,-1 Q 37,-2 38,-7 L 37,-12 Q 34,-14 30,-14 L 2,-14 Q 1,-14 1,-13 Z"
            fill={locoColor}
            stroke="#0F172A"
            strokeWidth="0.8"
          />
        ) : (
          <path
            d="M 37,-1 L 7,-1 Q 1,-2 0,-7 L 1,-12 Q 4,-14 8,-14 L 36,-14 Q 37,-14 37,-13 Z"
            fill={locoColor}
            stroke="#0F172A"
            strokeWidth="0.8"
          />
        )}

        {/* Livery Accent Stripe */}
        {isEast ? (
          <rect x="1" y="-8" width="34" height="2.5" fill={locoStripe} />
        ) : (
          <rect x="3" y="-8" width="34" height="2.5" fill={locoStripe} />
        )}

        {/* Windshield */}
        {isEast ? (
          <polygon points="31,-9 36,-9 34,-13 30,-13" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />
        ) : (
          <polygon points="7,-9 2,-9 4,-13 8,-13" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />
        )}

        {/* Headlight Lamp */}
        <circle cx={isEast ? 37.5 : 0.5} cy="-6" r="1.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.4" />
        <circle cx={isEast ? 37.5 : 0.5} cy="-6" r="2.8" fill="url(#headlight-glow)" opacity="0.85" />

        {/* Miniature Pantograph */}
        <line x1={isEast ? 12 : 24} y1="-14" x2={isEast ? 16 : 20} y2="-19" stroke="#64748B" strokeWidth="0.7" />
        <line x1={isEast ? 16 : 20} y1="-19" x2={isEast ? 13 : 23} y2="-22" stroke="#64748B" strokeWidth="0.7" />
        <line x1={isEast ? 9 : 19} y1="-22" x2={isEast ? 17 : 27} y2="-22" stroke="#E2E8F0" strokeWidth="1" />
      </g>

      {/* Coupler 1 */}
      <rect x={isEast ? x - 41 : x + 38} y={y - 10} width="3" height="8" fill="#1E293B" rx="0.5" />

      {/* --- B. COACH 1 --- */}
      <g transform={isEast ? `translate(${x - 73}, ${y})` : `translate(${x + 41}, ${y})`}>
        {/* Wheels */}
        <circle cx="5" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="11" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="21" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="27" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Coach Body */}
        <rect x="0" y="-13" width="32" height="12.5" rx="1" fill={coachColor} stroke="#0F172A" strokeWidth="0.8" />
        <rect x="0" y="-10" width="32" height="6.5" fill={coachStripe} opacity="0.9" />

        {/* Windows */}
        {[3, 10, 17, 24].map((wx) => (
          <rect key={wx} x={wx} y="-9" width="4.5" height="4" rx="0.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.3" />
        ))}
      </g>

      {/* Coupler 2 */}
      <rect x={isEast ? x - 76 : x + 73} y={y - 10} width="3" height="8" fill="#1E293B" rx="0.5" />

      {/* --- C. COACH 2 --- */}
      <g transform={isEast ? `translate(${x - 108}, ${y})` : `translate(${x + 76}, ${y})`}>
        {/* Wheels */}
        <circle cx="5" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="11" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="21" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="27" cy="4" r="2.2" fill="#1E293B" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Coach Body */}
        <rect x="0" y="-13" width="32" height="12.5" rx="1" fill={coachColor} stroke="#0F172A" strokeWidth="0.8" />
        <rect x="0" y="-10" width="32" height="6.5" fill={coachStripe} opacity="0.9" />

        {/* Windows */}
        {[3, 10, 17, 24].map((wx) => (
          <rect key={wx} x={wx} y="-9" width="4.5" height="4" rx="0.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.3" />
        ))}

        {/* Red Rear Tail Lamp */}
        <circle cx={isEast ? 1 : 31} cy="-7" r="1.2" fill="#EF4444" />
      </g>

      {/* --- D. COMPACT FLOATING PILL BADGE --- */}
      <g transform={isEast ? `translate(${x - 18}, ${y - 20})` : `translate(${x + 18}, ${y - 20})`}>
        <rect x="-24" y="-7" width="48" height="11" rx="2" fill="#FFFFFF" stroke={isSelected ? '#F59E0B' : '#0284C7'} strokeWidth="1" />
        <text x="0" y="1" fontSize="6.5" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="monospace">
          {isEast ? '🚆→' : '←🚆'} {train.train_id.replace('TR-', '')}
        </text>
      </g>
    </g>
  );
}

/**
 * Compact Miniature Freight Trainset (~112px total length)
 * WAG-9 Freight Locomotive + BOXN Coal Hopper + BLC Container Flat
 */
function CompactFreightTrain({ train, x, y, direction = 'EAST', isSelected = false, isMoving = false, onClick }) {
  const isEast = direction === 'EAST';

  return (
    <g
      className="compact-train-group"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'filter 0.2s ease' }}
      filter={isSelected ? 'drop-shadow(0 0 5px rgba(245,158,11,0.8))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'}
    >
      {/* Headlight Beam */}
      {isEast ? (
        <polygon
          points={`${x},${y - 5} ${x + 55},${y - 12} ${x + 55},${y + 8} ${x},${y - 1}`}
          fill="url(#headlight-beam-east)"
          opacity="0.55"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <polygon
          points={`${x},${y - 5} ${x - 55},${y - 12} ${x - 55},${y + 8} ${x},${y - 1}`}
          fill="url(#headlight-beam-west)"
          opacity="0.55"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* --- A. FREIGHT LOCOMOTIVE (Emerald Green WAG-9) --- */}
      <g transform={isEast ? `translate(${x - 38}, ${y})` : `translate(${x}, ${y})`}>
        {/* Wheels */}
        <circle cx="8" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="15" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="23" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="30" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Heavy Body */}
        {isEast ? (
          <path d="M 1,-1 L 35,-1 L 38,-5 L 38,-12 L 35,-14 L 1,-14 Z" fill="#065F46" stroke="#0F172A" strokeWidth="0.8" />
        ) : (
          <path d="M 37,-1 L 3,-1 L 0,-5 L 0,-12 L 3,-14 L 37,-14 Z" fill="#065F46" stroke="#0F172A" strokeWidth="0.8" />
        )}
        {/* Yellow Stripe */}
        <rect x="2" y="-8" width="34" height="2.5" fill="#FBBF24" />

        {/* Windshield */}
        {isEast ? (
          <polygon points="32,-9 36,-9 34,-13 31,-13" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />
        ) : (
          <polygon points="6,-9 2,-9 4,-13 7,-13" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />
        )}
        {/* Headlight */}
        <circle cx={isEast ? 37.5 : 0.5} cy="-6" r="1.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.4" />
        <circle cx={isEast ? 37.5 : 0.5} cy="-6" r="2.8" fill="url(#headlight-glow)" opacity="0.85" />
      </g>

      {/* Coupler 1 */}
      <rect x={isEast ? x - 41 : x + 38} y={y - 10} width="3" height="8" fill="#1E293B" rx="0.5" />

      {/* --- B. WAGON 1: BOXN COAL HOPPER --- */}
      <g transform={isEast ? `translate(${x - 75}, ${y})` : `translate(${x + 41}, ${y})`}>
        {/* Wheels */}
        <circle cx="5" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="11" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="23" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="29" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Coal Heap */}
        <path d="M 3,-11 Q 17,-16 31,-11 Z" fill="#0F172A" />

        {/* Corrugated Hopper */}
        <rect x="0" y="-11" width="34" height="11" rx="0.5" fill="#78350F" stroke="#0F172A" strokeWidth="0.8" />
        {[7, 14, 21, 28].map((lx) => (
          <line key={lx} x1={lx} y1="-11" x2={lx} y2="0" stroke="#451A03" strokeWidth="1" />
        ))}
      </g>

      {/* Coupler 2 */}
      <rect x={isEast ? x - 78 : x + 75} y={y - 10} width="3" height="8" fill="#1E293B" rx="0.5" />

      {/* --- C. WAGON 2: BLC CONTAINER FLAT --- */}
      <g transform={isEast ? `translate(${x - 112}, ${y})` : `translate(${x + 78}, ${y})`}>
        {/* Wheels */}
        <circle cx="5" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="11" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="23" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />
        <circle cx="29" cy="4" r="2.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.6" className={isMoving ? 'anim-wheel' : ''} />

        {/* Flatbed Deck */}
        <rect x="0" y="-2" width="34" height="2" fill="#334155" stroke="#0F172A" strokeWidth="0.5" />

        {/* Container A: CONCOR Blue */}
        <rect x="1" y="-12" width="15" height="10" fill="#1E40AF" stroke="#0F172A" strokeWidth="0.5" />
        <text x="8.5" y="-6" fontSize="3" fontWeight="800" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace">
          CONCOR
        </text>

        {/* Container B: IR Red */}
        <rect x="18" y="-12" width="15" height="10" fill="#991B1B" stroke="#0F172A" strokeWidth="0.5" />
        <text x="25.5" y="-6" fontSize="3" fontWeight="800" textAnchor="middle" fill="#FEF08A" fontFamily="monospace">
          IR
        </text>
      </g>

      {/* Floating Pill */}
      <g transform={isEast ? `translate(${x - 18}, ${y - 20})` : `translate(${x + 18}, ${y - 20})`}>
        <rect x="-26" y="-7" width="52" height="11" rx="2" fill="#FFFFFF" stroke={isSelected ? '#F59E0B' : '#059669'} strokeWidth="1" />
        <text x="0" y="1" fontSize="6" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="monospace">
          {isEast ? '🚂→' : '←🚂'} {train.train_id.replace('TR-', '')}
        </text>
      </g>
    </g>
  );
}

/**
 * Compact Maintenance Work Zone with animated flashing strobe & barricades
 */
function CompactMaintenanceZone({ block, trackY, xStart = 280, xEnd = 720, isSelected, onClick }) {
  const midX = (xStart + xEnd) / 2;
  const width = xEnd - xStart;

  return (
    <g className="compact-work-zone" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* 1. Track Bed Caution Hash Overlay */}
      <rect
        x={xStart}
        y={trackY - 7}
        width={width}
        height="14"
        fill="url(#caution-diagonal-stripes)"
        opacity="0.3"
        rx="1"
      />
      <rect
        x={xStart}
        y={trackY - 7}
        width={width}
        height="14"
        fill="none"
        stroke="#DC2626"
        strokeWidth="1"
        strokeDasharray="4 2"
      />

      {/* 2. Boundary Red & White Barricades */}
      <g transform={`translate(${xStart - 2}, ${trackY - 11})`}>
        <rect x="0" y="0" width="4" height="18" fill="#DC2626" rx="0.5" />
        <line x1="0" y1="5" x2="4" y2="5" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="0" y1="12" x2="4" y2="12" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="2" cy="-2" r="1.5" fill="#EF4444" className="anim-signal-pulse" />
      </g>
      <g transform={`translate(${xEnd - 2}, ${trackY - 11})`}>
        <rect x="0" y="0" width="4" height="18" fill="#DC2626" rx="0.5" />
        <line x1="0" y1="5" x2="4" y2="5" stroke="#FFFFFF" strokeWidth="1.5" />
        <line x1="0" y1="12" x2="4" y2="12" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="2" cy="-2" r="1.5" fill="#EF4444" className="anim-signal-pulse" />
      </g>

      {/* 3. Miniature Yellow Maintenance Vehicle with ANIMATED FLASHING STROBE */}
      <g transform={`translate(${midX - 22}, ${trackY})`}>
        {/* Wheels */}
        <circle cx="6" cy="4" r="2.2" fill="#1E293B" stroke="#475569" strokeWidth="0.6" />
        <circle cx="38" cy="4" r="2.2" fill="#1E293B" stroke="#475569" strokeWidth="0.6" />

        {/* Vehicle Body in Safety Yellow */}
        <rect x="0" y="-12" width="44" height="12" rx="1.5" fill="#EAB308" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="4" y="-10" width="8" height="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />
        <rect x="15" y="-10" width="8" height="5" fill="#38BDF8" stroke="#0F172A" strokeWidth="0.4" />

        {/* Animated Strobe Beacon */}
        <circle cx="8" cy="-14" r="2" fill="#F59E0B" className="anim-strobe-flash" />

        {/* Raised Inspection Cradle */}
        <line x1="30" y1="-12" x2="34" y2="-21" stroke="#475569" strokeWidth="1.2" />
        <line x1="38" y1="-12" x2="34" y2="-21" stroke="#475569" strokeWidth="1.2" />
        <rect x="28" y="-23" width="12" height="3" fill="#1E293B" stroke="#EAB308" strokeWidth="0.6" />
        {/* Worker in Orange Vest */}
        <circle cx="34" cy="-25" r="1.5" fill="#F97316" />
      </g>

      {/* 4. Compact Floating HUD Pill */}
      <g transform={`translate(${midX}, ${trackY - 24})`}>
        <rect
          x="-90"
          y="-7"
          width="180"
          height="14"
          rx="2"
          fill="#FFFFFF"
          stroke="#DC2626"
          strokeWidth="1.2"
          filter="drop-shadow(0 1px 3px rgba(0,0,0,0.12))"
        />
        <text
          x="0"
          y="3"
          fontSize="7"
          fontWeight="800"
          textAnchor="middle"
          fill="#991B1B"
          fontFamily="var(--font-sans)"
        >
          ⛔ POSSESSION: {block?.block_id} ({block?.start_time}–{block?.end_time}) · {block?.departments?.join('+')}
        </text>
      </g>
    </g>
  );
}

// ---------------------------------------------------------------------------
// MAIN OPERATIONS CENTER COMPONENT
// ---------------------------------------------------------------------------

export default function OperationsCenter({
  trains = [],
  tasks = [],
  availableBlocks = [],
  scheduledBlocks = [],
  metrics,
}) {
  // Continuous simulation time (minutes from midnight, e.g. 540.0 = 09:00:00)
  const START_MIN = 360;  // 06:00
  const END_MIN = 1320;   // 22:00
  const [simTime, setSimTime] = useState(540); // Default to 09:00:00
  const [isPlaying, setIsPlaying] = useState(true); // Default animated and playing!
  const [speed, setSpeed] = useState(2); // 1x, 2x, 4x, 8x
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('Track 1');
  const [showTimetableDrawer, setShowTimetableDrawer] = useState(false);
  const [timetableSearch, setTimetableSearch] = useState('');
  const [timetableTrackFilter, setTimetableTrackFilter] = useState('ALL');

  // Continuous smooth 60 FPS animation loop
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let animId;

    const tick = (now) => {
      const dt = (now - lastTime) / 1000; // in seconds
      lastTime = now;

      // At speed 1x: 1 real sec = 30 sim secs (0.5 sim min)
      // At speed 2x: 1 real sec = 60 sim secs (1.0 sim min)
      // At speed 4x: 1 real sec = 120 sim secs (2.0 sim mins)
      // At speed 8x: 1 real sec = 240 sim secs (4.0 sim mins)
      const deltaMin = dt * (speed * 0.5);

      setSimTime((prev) => {
        const next = prev + deltaMin;
        if (next >= END_MIN) {
          setIsPlaying(false);
          return END_MIN;
        }
        return next;
      });

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, speed]);

  // Spacebar toggle Play/Pause
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
    setSimTime(540); // 09:00:00
  };

  const handleStep = (delta) => {
    setSimTime((prev) => Math.max(START_MIN, Math.min(END_MIN, prev + delta)));
  };

  // 4 Tracks in Compact Layout (Height pitch = 40px)
  const TRACKS = [
    {
      id: 'Track 1',
      name: 'Track 1 (Up Main)',
      direction: 'EAST',
      dirLabel: 'Eastbound (Station A → Station B)',
      arrow: '→',
      type: 'Passenger Main Line (130 km/h)',
      y: 26,
    },
    {
      id: 'Track 2',
      name: 'Track 2 (Down Main)',
      direction: 'WEST',
      dirLabel: 'Westbound (Station B → Station A)',
      arrow: '←',
      type: 'Passenger Main Line (130 km/h)',
      y: 68,
    },
    {
      id: 'Track 3',
      name: 'Track 3 (Loop Line)',
      direction: 'EAST',
      dirLabel: 'Loop & Overtake Line (75 km/h)',
      arrow: '⇄',
      type: 'Passenger Loop Line',
      y: 110,
    },
    {
      id: 'Track 4',
      name: 'Track 4 (Freight)',
      direction: 'WEST',
      dirLabel: 'Dedicated Freight Corridor (100 km/h)',
      arrow: '⇄',
      type: 'Heavy Freight Corridor',
      y: 152,
    },
  ];

  // Train statuses and smooth positions calculated continuously from simTime
  // SVG Width: 1000px. Platform A: 65px. Platform B: 935px. Mainline span: 870px.
  const trainSimStates = useMemo(() => {
    return trains.map((t) => {
      const arr = timeToMin(t.arrival_time);
      const dep = timeToMin(t.departure_time);
      const isEastbound = t.track === 'Track 1' || t.track === 'Track 3';
      const isFreight = t.train_id.includes('GOODS') || t.track === 'Track 4' || t.train_name.toLowerCase().includes('freight');

      let state = 'SCHEDULED';
      let progress = 0; // 0.0 to 1.0 continuous float
      let posX = isEastbound ? 160 : 840; // Default platform position

      if (simTime < arr) {
        if (arr - simTime <= 25) {
          state = 'APPROACHING';
          const approachProg = 1 - (arr - simTime) / 25;
          posX = isEastbound ? 60 + approachProg * 100 : 940 - approachProg * 100;
        } else {
          state = 'SCHEDULED';
          posX = isEastbound ? 60 : 940;
        }
      } else if (simTime >= arr && simTime <= dep) {
        state = 'IN_TRANSIT';
        const span = Math.max(1, dep - arr);
        progress = (simTime - arr) / span;
        // Smooth continuous 60 FPS motion across the corridor
        posX = isEastbound ? 160 + progress * 680 : 840 - progress * 680;
      } else if (simTime > dep) {
        if (simTime - dep <= 20) {
          state = 'CLEARING';
          const clearProg = (simTime - dep) / 20;
          posX = isEastbound ? 840 + clearProg * 100 : 160 - clearProg * 100;
        } else {
          state = 'COMPLETED';
          posX = isEastbound ? 960 : 40;
        }
      }

      return {
        ...t,
        state,
        progress,
        posX: Math.max(40, Math.min(960, posX)),
        isEastbound,
        isFreight,
      };
    });
  }, [trains, simTime]);

  // Section states
  const trackSectionStates = useMemo(() => {
    const states = {};

    TRACKS.forEach((track) => {
      const trackBlocks = scheduledBlocks.filter((b) => b.track === track.id);
      let activeBlock = null;
      let upcomingBlock = null;

      for (const b of trackBlocks) {
        const bStart = timeToMin(b.start_time);
        const bEnd = timeToMin(b.end_time);

        if (simTime >= bStart && simTime <= bEnd) {
          activeBlock = b;
          break;
        } else if (simTime >= bStart - 60 && simTime < bStart) {
          upcomingBlock = b;
        }
      }

      const activeTrains = trainSimStates.filter(
        (t) => t.track === track.id && t.state === 'IN_TRANSIT'
      );

      let status = 'AVAILABLE';
      let statusColor = '#24613B';
      let statusLabel = 'CLEAR (Available)';
      let signalAspect = 'GREEN';

      if (activeBlock) {
        status = 'MAINTENANCE_BLOCKED';
        statusColor = '#DC2626';
        statusLabel = `BLOCKED (${activeBlock.block_id})`;
        signalAspect = 'RED';
      } else if (activeTrains.length > 0) {
        status = 'TRAIN_OCCUPIED';
        statusColor = '#1D4ED8';
        statusLabel = `OCCUPIED (${activeTrains.map((t) => t.train_id).join(', ')})`;
        signalAspect = 'RED';
      } else if (upcomingBlock) {
        status = 'UPCOMING_MAINTENANCE';
        statusColor = '#B45309';
        statusLabel = `UPCOMING (${upcomingBlock.start_time})`;
        signalAspect = 'YELLOW';
      }

      states[track.id] = {
        status,
        statusColor,
        statusLabel,
        signalAspect,
        activeBlock,
        upcomingBlock,
        activeTrains,
      };
    });

    return states;
  }, [scheduledBlocks, trainSimStates, simTime]);

  // Filtered timetable
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

  // Generate sleeper positions for compact track (every 10px from x=60 to 940)
  const compactSleepers = useMemo(() => {
    const list = [];
    for (let x = 65; x <= 935; x += 10) {
      list.push(x);
    }
    return list;
  }, []);

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* INJECT ANIMATION KEYFRAMES */}
      <style>{`
        @keyframes strobe-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.4); filter: drop-shadow(0 0 5px #F59E0B); }
        }
        @keyframes signal-glow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
        }
        @keyframes wheel-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .anim-strobe-flash {
          animation: strobe-pulse 0.75s infinite ease-in-out;
        }
        .anim-signal-pulse {
          animation: signal-glow 1.8s infinite ease-in-out;
        }
        .anim-wheel {
          transform-origin: center;
          animation: wheel-rotate 0.6s infinite linear;
        }
      `}</style>

      {/* 1. TOP SIMULATION HEADER & COMPACT TELEMETRY */}
      <div
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="page-title" style={{ margin: 0, fontSize: '16px' }}>
              Operations Center
            </h2>
            <span
              className="badge-tag"
              style={{
                background: isPlaying ? '#DCFCE7' : '#F1F5F9',
                color: isPlaying ? '#15803D' : '#475569',
                fontWeight: '700',
                fontSize: '10.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isPlaying ? '#16A34A' : '#94A3B8',
                  display: 'inline-block',
                }}
              />
              {isPlaying ? `LIVE (${speed}x)` : 'PAUSED'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
            Interactive simulation of Section A–B corridor with physical tracks, moving trainsets, and maintenance possessions
          </div>
        </div>

        {/* Digital Military Clock & Live Operational Badges */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div
            style={{
              background: '#F8FAFC',
              color: '#0F172A',
              border: '1px solid #CBD5E1',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '10px', color: '#64748B' }}>CLOCK:</span>
            <span style={{ color: '#0284C7' }}>{formatDigitalClock(simTime)}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
            <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '2px', fontWeight: '600' }}>
              TRAINS: <strong style={{ color: '#1D4ED8' }}>{trainSimStates.filter((t) => t.state === 'IN_TRANSIT').length}</strong>
            </span>
            <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '2px', fontWeight: '600' }}>
              BLOCKS: <strong style={{ color: '#DC2626' }}>{Object.values(trackSectionStates).filter((s) => s.status === 'MAINTENANCE_BLOCKED').length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. COMPACT ANIMATED RAILWAY SIMULATION VIEWPORT */}
      <div
        className="ops-panel"
        style={{
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          background: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Compact Corridor Header & Legend */}
        <div
          style={{
            padding: '8px 14px',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontWeight: '800', color: '#0284C7' }}>
              SECTION A–B (26.5 KM)
            </span>
            <span style={{ color: '#CBD5E1' }}>|</span>
            <span>
              STATION A: <strong style={{ color: '#0F172A' }}>WEST JN</strong>
            </span>
            <span style={{ color: '#94A3B8' }}>⟷</span>
            <span>
              STATION B: <strong style={{ color: '#0F172A' }}>EAST JN</strong>
            </span>
          </div>

          {/* Status Legend */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '10.5px', color: '#475569' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#16A34A' }}></span>
              Clear Track
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563EB' }}></span>
              Train Occupied
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: '#DC2626' }}></span>
              Maintenance Block
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#D97706' }}></span>
              Upcoming
            </span>
          </div>
        </div>

        {/* COMPACT ANIMATED SVG CANVAS (185px clean height) */}
        <div style={{ width: '100%', position: 'relative', background: '#F8FAFC' }}>
          <svg
            viewBox="0 0 1000 176"
            style={{ width: '100%', height: 'auto', maxHeight: '210px', display: 'block' }}
          >
            <defs>
              {/* Ballast Gradient */}
              <linearGradient id="ballast-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#CBD5E1" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#94A3B8" stopOpacity="1" />
                <stop offset="100%" stopColor="#64748B" stopOpacity="1" />
              </linearGradient>

              {/* Polished Steel Rail Gradient */}
              <linearGradient id="steel-rail-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Headlight Illuminated Beam Gradients */}
              <linearGradient id="headlight-beam-east" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="headlight-beam-west" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
              </linearGradient>

              <radialGradient id="headlight-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>

              {/* Caution Diagonal Hash Pattern */}
              <pattern id="caution-diagonal-stripes" width="12" height="12" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="6" height="12" fill="#DC2626" opacity="0.4" />
                <rect x="6" y="0" width="6" height="12" fill="#FBBF24" opacity="0.4" />
              </pattern>
            </defs>

            {/* --- 1. OVERHEAD CONTACT WIRES (Thin & Subtle) --- */}
            {TRACKS.map((t) => (
              <line
                key={`wire-${t.id}`}
                x1="20"
                y1={t.y - 18}
                x2="980"
                y2={t.y - 18}
                stroke="#94A3B8"
                strokeWidth="0.6"
                strokeDasharray="80 1"
                opacity="0.6"
              />
            ))}

            {/* --- 2. COMPACT TERMINAL PLATFORMS AT OPPOSITE ENDS --- */}
            {/* Station A (West Terminal) on Left */}
            <g className="stn-a-compact">
              <rect x="0" y="8" width="65" height="160" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
              {/* Platform Yellow Safety Tactile Edge */}
              <line x1="64" y1="8" x2="64" y2="168" stroke="#F59E0B" strokeWidth="2.5" />
              {/* Canopy */}
              <rect x="2" y="14" width="58" height="148" fill="#FFFFFF" rx="1.5" stroke="#CBD5E1" strokeWidth="0.8" />
              {/* Nameboard */}
              <rect x="6" y="2" width="50" height="12" fill="#FBBF24" stroke="#0F172A" strokeWidth="0.8" rx="1" />
              <text x="31" y="10" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                STN A (WEST)
              </text>
            </g>

            {/* Station B (East Terminal) on Right */}
            <g className="stn-b-compact">
              <rect x="935" y="8" width="65" height="160" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
              <line x1="936" y1="8" x2="936" y2="168" stroke="#F59E0B" strokeWidth="2.5" />
              <rect x="940" y="14" width="58" height="148" fill="#FFFFFF" rx="1.5" stroke="#CBD5E1" strokeWidth="0.8" />
              <rect x="944" y="2" width="50" height="12" fill="#FBBF24" stroke="#0F172A" strokeWidth="0.8" rx="1" />
              <text x="969" y="10" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                STN B (EAST)
              </text>
            </g>

            {/* --- 3. FOUR COMPACT PHYSICAL TRACKS --- */}
            {TRACKS.map((track) => {
              const sec = trackSectionStates[track.id];
              const isSelected = selectedTrack === track.id;

              return (
                <g
                  key={track.id}
                  onClick={() => setSelectedTrack(track.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Outline */}
                  {isSelected && (
                    <rect
                      x="25"
                      y={track.y - 12}
                      width="950"
                      height="24"
                      fill="#E0F2FE"
                      opacity="0.35"
                      stroke="#0284C7"
                      strokeWidth="1"
                    />
                  )}

                  {/* Ballast Embankment Bed */}
                  <polygon
                    points={`25,${track.y - 8} 975,${track.y - 8} 978,${track.y + 9} 22,${track.y + 9}`}
                    fill="url(#ballast-gradient)"
                  />
                  <line x1="22" y1={track.y + 9} x2="978" y2={track.y + 9} stroke="#475569" strokeWidth="1.2" />

                  {/* Concrete Sleepers (every 10px) */}
                  {compactSleepers.map((sx) => (
                    <g key={`slp-${track.id}-${sx}`}>
                      <rect x={sx - 1.5} y={track.y - 6} width="3" height="12" rx="0.5" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.4" />
                      <circle cx={sx} cy={track.y - 4} r="0.7" fill="#475569" />
                      <circle cx={sx} cy={track.y + 4} r="0.7" fill="#475569" />
                    </g>
                  ))}

                  {/* Dual Continuous Parallel Steel Rails (Gauge = 8px) */}
                  {/* Top Rail (y - 4) */}
                  <line x1="20" y1={track.y - 4} x2="980" y2={track.y - 4} stroke="#334155" strokeWidth="2.8" />
                  <line x1="20" y1={track.y - 4} x2="980" y2={track.y - 4} stroke="url(#steel-rail-gradient)" strokeWidth="1.8" />
                  <line x1="20" y1={track.y - 4.2} x2="980" y2={track.y - 4.2} stroke="#FFFFFF" strokeWidth="0.6" opacity="0.9" />

                  {/* Bottom Rail (y + 4) */}
                  <line x1="20" y1={track.y + 4} x2="980" y2={track.y + 4} stroke="#334155" strokeWidth="2.8" />
                  <line x1="20" y1={track.y + 4} x2="980" y2={track.y + 4} stroke="url(#steel-rail-gradient)" strokeWidth="1.8" />
                  <line x1="20" y1={track.y + 3.8} x2="980" y2={track.y + 3.8} stroke="#FFFFFF" strokeWidth="0.6" opacity="0.9" />

                  {/* Track Label Badge at Left Platform Exit */}
                  <g transform={`translate(7, ${track.y})`}>
                    <rect x="0" y="-5" width="48" height="10" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                    <text x="24" y="2.5" fontSize="5.2" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="monospace">
                      {track.name.replace('Track ', 'T')} · {track.arrow}
                    </text>
                  </g>

                  {/* Compact Signals */}
                  <CompactSignal x={72} y={track.y} aspect={sec.signalAspect} signalId={`S${track.id.replace('Track ', '')}A`} />
                  <CompactSignal x={928} y={track.y} aspect={sec.signalAspect} signalId={`S${track.id.replace('Track ', '')}B`} />

                  {/* Active Maintenance Work Zone */}
                  {sec.status === 'MAINTENANCE_BLOCKED' && sec.activeBlock && (
                    <CompactMaintenanceZone
                      block={sec.activeBlock}
                      trackY={track.y}
                      xStart={280}
                      xEnd={720}
                      isSelected={selectedTrack === track.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTrack(track.id);
                      }}
                    />
                  )}
                </g>
              );
            })}

            {/* --- 4. MOVING ANIMATED TRAINS --- */}
            {trainSimStates.map((train) => {
              if (train.state !== 'IN_TRANSIT' && train.state !== 'APPROACHING' && train.state !== 'CLEARING') {
                return null;
              }

              const trackObj = TRACKS.find((tk) => tk.id === train.track);
              if (!trackObj) return null;

              const isSelected = selectedTrain?.train_id === train.train_id;
              const direction = train.isEastbound ? 'EAST' : 'WEST';
              const isMoving = isPlaying && train.state === 'IN_TRANSIT';

              if (train.isFreight) {
                return (
                  <CompactFreightTrain
                    key={train.train_id}
                    train={train}
                    x={train.posX}
                    y={trackObj.y}
                    direction={direction}
                    isSelected={isSelected}
                    isMoving={isMoving}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrain(train);
                      setSelectedTrack(train.track);
                    }}
                  />
                );
              }

              return (
                <CompactPassengerTrain
                  key={train.train_id}
                  train={train}
                  x={train.posX}
                  y={trackObj.y}
                  direction={direction}
                  isSelected={isSelected}
                  isMoving={isMoving}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTrain(train);
                    setSelectedTrack(train.track);
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* 3. SLEEK COMPACT TRANSPORT & TIMELINE CONTROLLER DOCK */}
        <div
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {/* Controls Button Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={() => setIsPlaying((p) => !p)}
                style={{
                  minWidth: '95px',
                  background: isPlaying ? '#DC2626' : '#16A34A',
                  borderColor: isPlaying ? '#B91C1C' : '#15803D',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  padding: '5px 12px',
                  fontSize: '11px',
                  boxShadow: isPlaying ? '0 1px 3px rgba(220,38,38,0.25)' : '0 1px 3px rgba(22,163,74,0.25)',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ background: '#F1F5F9', color: '#1E293B', borderColor: '#CBD5E1', padding: '5px 10px', fontSize: '11px' }}
                title="Reset simulation to 09:00:00"
              >
                ↺ RESET
              </button>

              <div style={{ display: 'flex', gap: '3px', marginLeft: '4px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(-15)}
                  style={{ background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1', fontSize: '10.5px', padding: '4px 6px' }}
                  title="Jump back 15 minutes"
                >
                  -15m
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(15)}
                  style={{ background: '#F1F5F9', color: '#475569', borderColor: '#CBD5E1', fontSize: '10.5px', padding: '4px 6px' }}
                  title="Jump forward 15 minutes"
                >
                  +15m
                </button>
              </div>
            </div>

            {/* Speed Multipliers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '10.5px', color: '#64748B', fontWeight: '600' }}>SPEED:</span>
              {[1, 2, 4, 8].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  style={{
                    background: speed === s ? '#2563EB' : '#F1F5F9',
                    color: speed === s ? '#FFFFFF' : '#475569',
                    border: '1px solid ' + (speed === s ? '#1D4ED8' : '#CBD5E1'),
                    borderRadius: '2px',
                    padding: '2px 7px',
                    fontSize: '10.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Timetable Drawer Button */}
            <button
              onClick={() => setShowTimetableDrawer((p) => !p)}
              style={{
                background: showTimetableDrawer ? '#2563EB' : '#F1F5F9',
                color: showTimetableDrawer ? '#FFFFFF' : '#1E293B',
                border: '1px solid ' + (showTimetableDrawer ? '#1D4ED8' : '#CBD5E1'),
                borderRadius: 'var(--radius-xs)',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              📋 {showTimetableDrawer ? 'HIDE MANIFEST' : 'TRAIN MANIFEST (14)'}
            </button>
          </div>

          {/* Timeline Range Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <input
              type="range"
              min={START_MIN}
              max={END_MIN}
              step="0.5"
              value={simTime}
              onChange={(e) => setSimTime(Number(e.target.value))}
              style={{
                width: '100%',
                cursor: 'ew-resize',
                accentColor: '#0284C7',
                height: '5px',
              }}
            />
            {/* Timeline Hour Markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
              <span>06:00</span>
              <span>08:00</span>
              <span>10:00 (BLK-101)</span>
              <span>12:00</span>
              <span>14:00 (BLK-102)</span>
              <span>16:00</span>
              <span>18:00 (BLK-107)</span>
              <span>20:00</span>
              <span>22:00</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. CONTEXTUAL INSPECTION PANELS (Compact 2-Column Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        {/* Track Section Inspector */}
        <div className="ops-panel">
          <div className="panel-header" style={{ padding: '8px 14px' }}>
            <div>
              <div className="panel-title" style={{ fontSize: '12px' }}>Track Inspector: {selectedTrackInfo?.name}</div>
            </div>
            <span
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '2px',
                fontWeight: '700',
                background: selectedTrackData.statusColor,
                color: '#FFFFFF',
              }}
            >
              {selectedTrackData.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="panel-body" style={{ padding: '10px 14px', fontSize: '11.5px', lineHeight: 1.5 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <div><span style={{ color: 'var(--c-text-secondary)' }}>Designation:</span> <strong>{selectedTrackInfo?.type}</strong></div>
              <div><span style={{ color: 'var(--c-text-secondary)' }}>Signaling:</span> <strong>Automatic Block</strong></div>
              <div><span style={{ color: 'var(--c-text-secondary)' }}>Traction:</span> <strong>25kV AC Electrified</strong></div>
              <div><span style={{ color: 'var(--c-text-secondary)' }}>Direction:</span> <strong>{selectedTrackInfo?.dirLabel}</strong></div>
            </div>

            {selectedTrackData.activeBlock ? (
              <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: 'var(--radius-xs)', padding: '8px 10px' }}>
                <div style={{ fontWeight: '700', color: '#991B1B', fontSize: '11px' }}>
                  ACTIVE POSSESSION: {selectedTrackData.activeBlock.block_id} ({selectedTrackData.activeBlock.start_time}–{selectedTrackData.activeBlock.end_time})
                </div>
                <div style={{ display: 'flex', gap: '4px', margin: '4px 0' }}>
                  {selectedTrackData.activeBlock.departments.map((d) => (
                    <DeptBadge key={d} department={d} />
                  ))}
                </div>
                <div style={{ fontSize: '10.5px', color: '#7F1D1D' }}>
                  {selectedTrackData.activeBlock.tasks.map((t) => t.task_id).join(', ')} ({selectedTrackData.activeBlock.tasks.length} tasks executing simultaneously)
                </div>
              </div>
            ) : selectedTrackData.upcomingBlock ? (
              <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 'var(--radius-xs)', padding: '8px 10px', color: '#92400E', fontSize: '11px' }}>
                ⏱ Upcoming block {selectedTrackData.upcomingBlock.block_id} at {selectedTrackData.upcomingBlock.start_time}.
              </div>
            ) : (
              <div style={{ padding: '6px 10px', background: 'var(--c-surface-alt)', borderRadius: 'var(--radius-xs)', color: '#166534', fontSize: '11px' }}>
                ✓ Section clear for authorized movements at {minToTime(simTime)}.
              </div>
            )}
          </div>
        </div>

        {/* Train Telemetry Inspector */}
        <div className="ops-panel">
          <div className="panel-header" style={{ padding: '8px 14px' }}>
            <div>
              <div className="panel-title" style={{ fontSize: '12px' }}>
                Train Inspector: {selectedTrain ? `${selectedTrain.train_id} (${selectedTrain.train_name})` : 'Select Train on Tracks'}
              </div>
            </div>
            {selectedTrain && (
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedTrain(null)}
                style={{ padding: '1px 6px', fontSize: '10px' }}
              >
                ✕ Deselect
              </button>
            )}
          </div>

          <div className="panel-body" style={{ padding: '10px 14px', fontSize: '11.5px', lineHeight: 1.5 }}>
            {selectedTrain ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  <div><span style={{ color: 'var(--c-text-secondary)' }}>Service:</span> <strong>{selectedTrain.train_name}</strong></div>
                  <div><span style={{ color: 'var(--c-text-secondary)' }}>Corridor:</span> <strong>{selectedTrain.track}</strong></div>
                  <div><span style={{ color: 'var(--c-text-secondary)' }}>Schedule:</span> <strong className="cell-mono">{selectedTrain.arrival_time} – {selectedTrain.departure_time}</strong></div>
                  <div><span style={{ color: 'var(--c-text-secondary)' }}>Rake:</span> <strong>{selectedTrain.isFreight ? 'WAG-9 Freight Rake' : 'WAP-7 + 2 LHB Coaches'}</strong></div>
                </div>

                <div style={{ background: 'var(--c-surface-alt)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--c-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '10.5px' }}>
                    <span style={{ fontWeight: '600' }}>TRAVERSAL PROGRESS:</span>
                    <span className="cell-mono" style={{ fontWeight: '700', color: '#1D4ED8' }}>
                      {Math.round(selectedTrain.progress * 100)}% ({selectedTrain.state})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(selectedTrain.progress * 100)}%`,
                        height: '100%',
                        background: '#2563EB',
                        transition: 'width 0.2s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--c-text-muted)', fontSize: '11px' }}>
                Click any moving passenger locomotive, coach, or freight train on the physical tracks to inspect telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. COLLAPSIBLE TIMETABLE MANIFEST DRAWER */}
      {showTimetableDrawer && (
        <div className="ops-panel anim-slide-in">
          <div className="panel-header" style={{ padding: '8px 14px' }}>
            <div>
              <div className="panel-title" style={{ fontSize: '12px' }}>Full Network Train Timetable Manifest (Section A–B)</div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowTimetableDrawer(false)}
              style={{ padding: '2px 8px', fontSize: '10.5px' }}
            >
              ✕ Close
            </button>
          </div>

          <div className="panel-body" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search train..."
                value={timetableSearch}
                onChange={(e) => setTimetableSearch(e.target.value)}
                style={{
                  padding: '4px 10px',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11.5px',
                  minWidth: '180px',
                }}
              />
              <div style={{ display: 'flex', gap: '3px' }}>
                {['ALL', 'Track 1', 'Track 2', 'Track 3', 'Track 4'].map((trk) => (
                  <button
                    key={trk}
                    className={`btn-seg ${timetableTrackFilter === trk ? 'active' : ''}`}
                    onClick={() => setTimetableTrackFilter(trk)}
                    style={{ fontSize: '10.5px', padding: '3px 8px' }}
                  >
                    {trk}
                  </button>
                ))}
              </div>
            </div>

            <div className="ops-table-container">
              <table className="ops-table" style={{ fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th>Train ID</th>
                    <th>Service Name</th>
                    <th>Track</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimetable.map((tr) => {
                    const simTr = trainSimStates.find((st) => st.train_id === tr.train_id);
                    const isSelected = selectedTrain?.train_id === tr.train_id;

                    return (
                      <tr
                        key={tr.train_id}
                        className={isSelected ? 'selected-row' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedTrain(simTr || tr);
                          setSelectedTrack(tr.track);
                        }}
                      >
                        <td className="cell-mono" style={{ fontWeight: '700' }}>{tr.train_id}</td>
                        <td>{tr.train_name}</td>
                        <td><span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '600' }}>{tr.track}</span></td>
                        <td className="cell-mono">{tr.arrival_time}</td>
                        <td className="cell-mono">{tr.departure_time}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 5px',
                              borderRadius: '2px',
                              fontWeight: '700',
                              background:
                                simTr?.state === 'IN_TRANSIT'
                                  ? '#1D4ED8'
                                  : simTr?.state === 'APPROACHING'
                                  ? '#F59E0B'
                                  : simTr?.state === 'CLEARING'
                                  ? '#0D9488'
                                  : '#E2E8F0',
                              color: simTr?.state === 'SCHEDULED' ? '#475569' : '#FFFFFF',
                            }}
                          >
                            {simTr?.state || 'SCHEDULED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}