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

// Helper: Format seconds for digital clock "HH:MM:SS"
function formatDigitalClock(mins, tickSec = 0) {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.floor(mins % 60);
  const s = Math.floor(tickSec % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// SVG SUBCOMPONENTS: DETAILED REALISTIC RAILWAY SIMULATION MODELS
// ---------------------------------------------------------------------------

/**
 * SignalPost: Realistic color-light railway signal with protective hoods
 */
function SignalPost({ x, y, aspect = 'GREEN', signalId = 'S-1', orientation = 'EAST' }) {
  // aspect: 'GREEN' | 'YELLOW' | 'RED'
  const isRed = aspect === 'RED';
  const isYellow = aspect === 'YELLOW';
  const isGreen = aspect === 'GREEN';

  // Offset post relative to orientation
  const mastX = x;
  const mastY = y - 36;

  return (
    <g className="railway-signal" title={`Signal ${signalId}: ${aspect}`}>
      {/* Ground Foundation & Baseplate */}
      <rect x={mastX - 4} y={y - 2} width="8" height="4" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
      {/* Steel Signal Post */}
      <line x1={mastX} y1={y - 2} x2={mastX} y2={mastY} stroke="#334155" strokeWidth="3" />
      <line x1={mastX - 1} y1={y - 2} x2={mastX - 1} y2={mastY} stroke="#64748B" strokeWidth="0.8" />
      
      {/* Signal Head Housing with Hood Shield */}
      <rect x={mastX - 7} y={mastY - 26} width="14" height="26" rx="3" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
      
      {/* Aspect 1: RED (Top) */}
      <circle cx={mastX} cy={mastY - 20} r="3.2" fill={isRed ? '#EF4444' : '#450A0A'} />
      {isRed && (
        <circle cx={mastX} cy={mastY - 20} r="6" fill="url(#signal-red-glow)" opacity="0.85" />
      )}
      <path d={`M ${mastX - 4} ${mastY - 21} Q ${mastX} ${mastY - 24} ${mastX + 4} ${mastY - 21}`} stroke="#0F172A" strokeWidth="1" fill="none" />

      {/* Aspect 2: YELLOW (Middle) */}
      <circle cx={mastX} cy={mastY - 13} r="3.2" fill={isYellow ? '#F59E0B' : '#451A03'} />
      {isYellow && (
        <circle cx={mastX} cy={mastY - 13} r="6" fill="url(#signal-yellow-glow)" opacity="0.85" />
      )}
      <path d={`M ${mastX - 4} ${mastY - 14} Q ${mastX} ${mastY - 17} ${mastX + 4} ${mastY - 14}`} stroke="#0F172A" strokeWidth="1" fill="none" />

      {/* Aspect 3: GREEN (Bottom) */}
      <circle cx={mastX} cy={mastY - 6} r="3.2" fill={isGreen ? '#22C55E' : '#052E16'} />
      {isGreen && (
        <circle cx={mastX} cy={mastY - 6} r="6" fill="url(#signal-green-glow)" opacity="0.85" />
      )}
      <path d={`M ${mastX - 4} ${mastY - 7} Q ${mastX} ${mastY - 10} ${mastX + 4} ${mastY - 7}`} stroke="#0F172A" strokeWidth="1" fill="none" />

      {/* Identification Plate */}
      <rect x={mastX - 6} y={mastY + 2} width="12" height="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.5" />
      <text x={mastX} y={mastY + 6.5} fontSize="4.5" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="monospace">
        {signalId}
      </text>
    </g>
  );
}

/**
 * PassengerTrain: High-fidelity model with WAP-7 style Locomotive + 2 LHB Coaches
 */
function PassengerTrain({ train, x, y, direction = 'EAST', isSelected = false, onClick }) {
  const isEast = direction === 'EAST';
  const name = train.train_name || '';

  // Determine Livery
  let locoColor = '#1E3A8A'; // Navy Blue default
  let locoStripe = '#F59E0B'; // Gold
  let coachColor = '#B91C1C'; // Rajdhani Crimson Red
  let coachStripe = '#F1F5F9'; // Silver/White

  if (name.includes('Vande Bharat')) {
    locoColor = '#F8FAFC'; // Pearl White
    locoStripe = '#1D4ED8'; // Royal Blue
    coachColor = '#F8FAFC';
    coachStripe = '#1D4ED8';
  } else if (name.includes('Rajdhani')) {
    locoColor = '#DC2626'; // Vibrant Red
    locoStripe = '#FDE047'; // Yellow
    coachColor = '#991B1B';
    coachStripe = '#E2E8F0';
  } else if (name.includes('Shatabdi')) {
    locoColor = '#1E40AF';
    locoStripe = '#FBBF24';
    coachColor = '#1E3A8A';
    coachStripe = '#FCD34D';
  }

  // Train Geometry Constants (Train length ~ 285px)
  // Locomotive: 95px, Gangway: 5px, Coach 1: 85px, Gangway: 5px, Coach 2: 85px
  // In EAST direction: Loco is at front (right, [x - 95, x]), Coach 1 [x - 185, x - 100], Coach 2 [x - 275, x - 190]
  // In WEST direction: Loco is at front (left, [x, x + 95]), Coach 1 [x + 100, x + 185], Coach 2 [x + 190, x + 275]

  return (
    <g
      className={`train-group ${isSelected ? 'train-selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
    >
      {/* Selection Halo / Bounding Highlight */}
      {isSelected && (
        <rect
          x={isEast ? x - 285 : x - 10}
          y={y - 50}
          width="295"
          height="62"
          rx="6"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeDasharray="6 3"
        />
      )}

      {/* Headlight Illuminated Beam projecting on track */}
      {isEast ? (
        <polygon
          points={`${x},${y - 14} ${x + 110},${y - 28} ${x + 110},${y + 16} ${x},${y - 8}`}
          fill="url(#headlight-beam-east)"
          opacity="0.65"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <polygon
          points={`${x},${y - 14} ${x - 110},${y - 28} ${x - 110},${y + 16} ${x},${y - 8}`}
          fill="url(#headlight-beam-west)"
          opacity="0.65"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* --- A. LOCOMOTIVE (WAP-7 Modern Indian Mainline Electric) --- */}
      <g className="locomotive" transform={isEast ? `translate(${x - 95}, ${y})` : `translate(${x}, ${y})`}>
        {/* Cowcatcher (Pilot) with Hazard Stripes */}
        {isEast ? (
          <polygon points="90,4 98,6 98,8 88,8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
        ) : (
          <polygon points="5,4 -3,6 -3,8 7,8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
        )}

        {/* Co-Co Bogies (2 Truck Bogies with 6 Steel Wheels) */}
        {/* Rear Bogie */}
        <rect x="8" y="2" width="32" height="4" fill="#1E293B" rx="1" />
        <circle cx="12" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="12" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="24" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="24" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="36" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="36" cy="7" r="1.5" fill="#0F172A" />

        {/* Front Bogie */}
        <rect x="55" y="2" width="32" height="4" fill="#1E293B" rx="1" />
        <circle cx="59" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="59" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="71" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="71" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="83" cy="7" r="4.5" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="83" cy="7" r="1.5" fill="#0F172A" />

        {/* Locomotive Main Body (Aerodynamic Streamlined Cab) */}
        {isEast ? (
          <path
            d="M 2,-2 L 78,-2 Q 92,-4 95,-14 L 92,-28 Q 86,-33 76,-33 L 4,-33 Q 2,-33 2,-30 Z"
            fill={locoColor}
            stroke="#0F172A"
            strokeWidth="1"
          />
        ) : (
          <path
            d="M 93,-2 L 17,-2 Q 3,-4 0,-14 L 3,-28 Q 9,-33 19,-33 L 91,-33 Q 93,-33 93,-30 Z"
            fill={locoColor}
            stroke="#0F172A"
            strokeWidth="1"
          />
        )}

        {/* Livery Waist Stripe & Accent Chevrons */}
        {isEast ? (
          <>
            <path d="M 2,-16 L 82,-16 Q 90,-16 93,-19 L 91,-22 L 2,-22 Z" fill={locoStripe} />
            <polygon points="78,-16 93,-19 86,-12" fill="#FBBF24" />
          </>
        ) : (
          <>
            <path d="M 93,-16 L 13,-16 Q 5,-16 2,-19 L 4,-22 L 93,-22 Z" fill={locoStripe} />
            <polygon points="17,-16 2,-19 9,-12" fill="#FBBF24" />
          </>
        )}

        {/* Cab Windshield Glass with Blue Tint & Glare */}
        {isEast ? (
          <polygon points="80,-21 91,-21 86,-30 76,-30" fill="#0284C7" stroke="#0F172A" strokeWidth="0.6" />
        ) : (
          <polygon points="15,-21 4,-21 9,-30 19,-30" fill="#0284C7" stroke="#0F172A" strokeWidth="0.6" />
        )}
        {/* Driver Silhouette in Cab */}
        <circle cx={isEast ? 82 : 13} cy="-25" r="2.2" fill="#0F172A" opacity="0.75" />

        {/* Cab Side Windows */}
        <rect x={isEast ? 58 : 28} y="-29" width="12" height="7" rx="1" fill="#0284C7" stroke="#0F172A" strokeWidth="0.5" />

        {/* Cooling Ventilation Grilles */}
        <rect x={isEast ? 12 : 46} y="-28" width="36" height="8" rx="1" fill="#334155" stroke="#1E293B" strokeWidth="0.5" />
        <line x1={isEast ? 16 : 50} y1="-28" x2={isEast ? 16 : 50} y2="-20" stroke="#64748B" strokeWidth="1" />
        <line x1={isEast ? 22 : 56} y1="-28" x2={isEast ? 22 : 56} y2="-20" stroke="#64748B" strokeWidth="1" />
        <line x1={isEast ? 28 : 62} y1="-28" x2={isEast ? 28 : 62} y2="-20" stroke="#64748B" strokeWidth="1" />
        <line x1={isEast ? 34 : 68} y1="-28" x2={isEast ? 34 : 68} y2="-20" stroke="#64748B" strokeWidth="1" />
        <line x1={isEast ? 40 : 74} y1="-28" x2={isEast ? 40 : 74} y2="-20" stroke="#64748B" strokeWidth="1" />

        {/* Headlight Cluster (Twin Bright LED Lamps) */}
        {isEast ? (
          <g>
            <circle cx="94" cy="-14" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
            <circle cx="94" cy="-14" r="2" fill="#FEF08A" />
            <circle cx="94" cy="-14" r="5.5" fill="url(#headlight-glow)" opacity="0.9" />
          </g>
        ) : (
          <g>
            <circle cx="1" cy="-14" r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="0.8" />
            <circle cx="1" cy="-14" r="2" fill="#FEF08A" />
            <circle cx="1" cy="-14" r="5.5" fill="url(#headlight-glow)" opacity="0.9" />
          </g>
        )}

        {/* High-Performance Roof Pantograph (Single-Arm Diamond) */}
        <g className="pantograph" stroke="#64748B" strokeWidth="1.2" fill="none">
          {/* Base Insulators */}
          <rect x={isEast ? 26 : 52} y="-35" width="16" height="2" fill="#0F172A" stroke="none" />
          {/* Articulated Lower & Upper Arms */}
          <line x1={isEast ? 30 : 64} y1="-35" x2={isEast ? 42 : 52} y2="-44" />
          <line x1={isEast ? 42 : 52} y1="-44" x2={isEast ? 32 : 62} y2="-52" />
          {/* Carbon Contact Shoe touching catenary */}
          <line x1={isEast ? 24 : 54} y1="-52" x2={isEast ? 40 : 70} y2="-52" stroke="#E2E8F0" strokeWidth="2" />
          {/* Contact Spark Glow */}
          <circle cx={isEast ? 32 : 62} cy="-52" r="2" fill="#67E8F9" opacity="0.75" />
        </g>
      </g>

      {/* --- B. COUPLER & GANGWAY (Loco to Coach 1) --- */}
      <rect
        x={isEast ? x - 100 : x + 95}
        y={y - 26}
        width="5"
        height="22"
        rx="1"
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth="0.8"
      />

      {/* --- C. COACH 1 (LHB Stainless Steel Passenger Coach) --- */}
      <g className="coach-1" transform={isEast ? `translate(${x - 185}, ${y})` : `translate(${x + 100}, ${y})`}>
        {/* Bogie 1 */}
        <rect x="6" y="2" width="22" height="4" fill="#1E293B" rx="1" />
        <circle cx="10" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="10" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="24" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="24" cy="7" r="1.5" fill="#0F172A" />

        {/* Bogie 2 */}
        <rect x="56" y="2" width="22" height="4" fill="#1E293B" rx="1" />
        <circle cx="60" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="60" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="74" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="74" cy="7" r="1.5" fill="#0F172A" />

        {/* Coach Body */}
        <rect x="0" y="-31" width="84" height="30" rx="3" fill={coachColor} stroke="#0F172A" strokeWidth="1" />
        {/* Stainless Steel Ribbing & Window Band */}
        <rect x="0" y="-24" width="84" height="15" fill={coachStripe} opacity="0.92" />
        <line x1="0" y1="-8" x2="84" y2="-8" stroke="#475569" strokeWidth="0.6" />
        <line x1="0" y1="-5" x2="84" y2="-5" stroke="#475569" strokeWidth="0.6" />

        {/* 5 Panoramic Tinted Passenger Windows with Warm Interior Glow */}
        {[8, 22, 36, 50, 64].map((wx, idx) => (
          <g key={idx}>
            <rect x={wx} y="-22" width="10" height="9" rx="1" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.6" />
            {/* Passenger Silhouette */}
            <circle cx={wx + 5} cy="-17" r="2" fill="#475569" opacity="0.65" />
          </g>
        ))}

        {/* End Vestibule Entrance Door */}
        <rect x="76" y="-28" width="6" height="24" fill="#334155" stroke="#0F172A" strokeWidth="0.5" />
        <rect x="2" y="-28" width="6" height="24" fill="#334155" stroke="#0F172A" strokeWidth="0.5" />
        {/* Roof AC Unit Pod */}
        <rect x="24" y="-34" width="36" height="3" rx="1" fill="#475569" stroke="#1E293B" strokeWidth="0.5" />
      </g>

      {/* --- D. COUPLER & GANGWAY (Coach 1 to Coach 2) --- */}
      <rect
        x={isEast ? x - 190 : x + 185}
        y={y - 26}
        width="5"
        height="22"
        rx="1"
        fill="#1E293B"
        stroke="#0F172A"
        strokeWidth="0.8"
      />

      {/* --- E. COACH 2 (Trailing Passenger Coach) --- */}
      <g className="coach-2" transform={isEast ? `translate(${x - 275}, ${y})` : `translate(${x + 190}, ${y})`}>
        {/* Bogie 1 */}
        <rect x="6" y="2" width="22" height="4" fill="#1E293B" rx="1" />
        <circle cx="10" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="10" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="24" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="24" cy="7" r="1.5" fill="#0F172A" />

        {/* Bogie 2 */}
        <rect x="56" y="2" width="22" height="4" fill="#1E293B" rx="1" />
        <circle cx="60" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="60" cy="7" r="1.5" fill="#0F172A" />
        <circle cx="74" cy="7" r="4.2" fill="#334155" stroke="#94A3B8" strokeWidth="1" />
        <circle cx="74" cy="7" r="1.5" fill="#0F172A" />

        {/* Coach Body */}
        <rect x="0" y="-31" width="84" height="30" rx="3" fill={coachColor} stroke="#0F172A" strokeWidth="1" />
        <rect x="0" y="-24" width="84" height="15" fill={coachStripe} opacity="0.92" />
        <line x1="0" y1="-8" x2="84" y2="-8" stroke="#475569" strokeWidth="0.6" />
        <line x1="0" y1="-5" x2="84" y2="-5" stroke="#475569" strokeWidth="0.6" />

        {/* Windows */}
        {[8, 22, 36, 50, 64].map((wx, idx) => (
          <g key={idx}>
            <rect x={wx} y="-22" width="10" height="9" rx="1" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.6" />
            <circle cx={wx + 5} cy="-17" r="2" fill="#475569" opacity="0.65" />
          </g>
        ))}

        {/* End Tail Lamp (Flashing Red LED marker at rear of train) */}
        {isEast ? (
          <circle cx="2" cy="-18" r="2.8" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.5" />
        ) : (
          <circle cx="82" cy="-18" r="2.8" fill="#EF4444" stroke="#7F1D1D" strokeWidth="0.5" />
        )}
      </g>

      {/* --- F. FLOATING HUD IDENTIFIER BADGE --- */}
      <g transform={isEast ? `translate(${x - 47}, ${y - 48})` : `translate(${x + 47}, ${y - 48})`}>
        <rect
          x="-50"
          y="-12"
          width="100"
          height="16"
          rx="3"
          fill="#0F172A"
          stroke={isSelected ? '#F59E0B' : '#38BDF8'}
          strokeWidth="1.2"
          opacity="0.95"
        />
        <text
          x="0"
          y="-1"
          fontSize="8.5"
          fontWeight="700"
          textAnchor="middle"
          fill="#F8FAFC"
          fontFamily="monospace"
        >
          {isEast ? '🚆→' : '←🚆'} {train.train_id}
        </text>
      </g>
    </g>
  );
}

/**
 * FreightTrain: Heavy WAG-9 Freight Locomotive + BOXN Coal Hopper + Intermodal Container Flat
 */
function FreightTrain({ train, x, y, direction = 'EAST', isSelected = false, onClick }) {
  const isEast = direction === 'EAST';

  return (
    <g
      className={`train-group ${isSelected ? 'train-selected' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }}
    >
      {/* Selection Halo */}
      {isSelected && (
        <rect
          x={isEast ? x - 285 : x - 10}
          y={y - 50}
          width="295"
          height="62"
          rx="6"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="1.8"
          strokeDasharray="6 3"
        />
      )}

      {/* Headlight Beam */}
      {isEast ? (
        <polygon
          points={`${x},${y - 14} ${x + 110},${y - 28} ${x + 110},${y + 16} ${x},${y - 8}`}
          fill="url(#headlight-beam-east)"
          opacity="0.65"
          style={{ pointerEvents: 'none' }}
        />
      ) : (
        <polygon
          points={`${x},${y - 14} ${x - 110},${y - 28} ${x - 110},${y + 16} ${x},${y - 8}`}
          fill="url(#headlight-beam-west)"
          opacity="0.65"
          style={{ pointerEvents: 'none' }}
        />
      )}

      {/* --- A. FREIGHT LOCOMOTIVE (Heavy WAG-9 Box Body in Emerald Green) --- */}
      <g className="freight-loco" transform={isEast ? `translate(${x - 95}, ${y})` : `translate(${x}, ${y})`}>
        {/* Cowcatcher */}
        {isEast ? (
          <polygon points="90,4 98,6 98,8 88,8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
        ) : (
          <polygon points="5,4 -3,6 -3,8 7,8" fill="#1E293B" stroke="#0F172A" strokeWidth="0.5" />
        )}

        {/* Heavy CASNUB Freight Bogies */}
        <rect x="8" y="2" width="32" height="4" fill="#0F172A" rx="1" />
        <circle cx="12" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <circle cx="24" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <circle cx="36" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />

        <rect x="55" y="2" width="32" height="4" fill="#0F172A" rx="1" />
        <circle cx="59" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <circle cx="71" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <circle cx="83" cy="7" r="4.5" fill="#1E293B" stroke="#64748B" strokeWidth="1" />

        {/* Heavy Box Locomotive Body */}
        {isEast ? (
          <path
            d="M 2,-2 L 86,-2 Q 95,-3 95,-14 L 95,-28 L 86,-33 L 4,-33 L 2,-28 Z"
            fill="#065F46"
            stroke="#0F172A"
            strokeWidth="1.2"
          />
        ) : (
          <path
            d="M 93,-2 L 9,-2 Q 0,-3 0,-14 L 0,-28 L 9,-33 L 91,-33 L 93,-28 Z"
            fill="#065F46"
            stroke="#0F172A"
            strokeWidth="1.2"
          />
        )}

        {/* Yellow Chevron Band */}
        <rect x="2" y="-18" width="91" height="6" fill="#FBBF24" />

        {/* Heavy Cab Windshield */}
        {isEast ? (
          <polygon points="82,-20 93,-20 90,-29 80,-29" fill="#0284C7" stroke="#0F172A" strokeWidth="0.8" />
        ) : (
          <polygon points="13,-20 2,-20 5,-29 15,-29" fill="#0284C7" stroke="#0F172A" strokeWidth="0.8" />
        )}

        {/* Heavy Cooling Louvres */}
        <rect x={isEast ? 12 : 36} y="-29" width="46" height="9" fill="#0F172A" stroke="#1E293B" strokeWidth="0.5" />
        {[0, 6, 12, 18, 24, 30, 36, 42].map((lx) => (
          <line
            key={lx}
            x1={(isEast ? 14 : 38) + lx}
            y1="-29"
            x2={(isEast ? 14 : 38) + lx}
            y2="-20"
            stroke="#34D399"
            strokeWidth="0.8"
          />
        ))}

        {/* Headlight */}
        <circle cx={isEast ? 94 : 1} cy="-14" r="3.5" fill="#FEF08A" stroke="#0F172A" strokeWidth="0.8" />
        <circle cx={isEast ? 94 : 1} cy="-14" r="5.5" fill="url(#headlight-glow)" opacity="0.9" />

        {/* Twin Heavy Pantographs */}
        <g stroke="#94A3B8" strokeWidth="1.2" fill="none">
          <line x1={isEast ? 20 : 70} y1="-33" x2={isEast ? 28 : 62} y2="-48" />
          <line x1={isEast ? 28 : 62} y1="-48" x2={isEast ? 22 : 68} y2="-52" />
          <line x1={isEast ? 16 : 60} y1="-52" x2={isEast ? 30 : 74} y2="-52" stroke="#FFFFFF" strokeWidth="2" />
        </g>
      </g>

      {/* --- B. WAGON 1: BOXN OPEN COAL HOPPER --- */}
      <g className="wagon-coal" transform={isEast ? `translate(${x - 185}, ${y})` : `translate(${x + 100}, ${y})`}>
        {/* Bogies */}
        <rect x="6" y="2" width="22" height="4" fill="#0F172A" />
        <circle cx="10" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <circle cx="24" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <rect x="56" y="2" width="22" height="4" fill="#0F172A" />
        <circle cx="60" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <circle cx="74" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />

        {/* Mounded Heap of Real Coal above rim */}
        <path
          d="M 4,-26 Q 20,-36 42,-34 Q 64,-37 80,-26 Z"
          fill="#0F172A"
          stroke="#1E293B"
          strokeWidth="0.8"
        />
        <circle cx="28" cy="-31" r="2" fill="#334155" />
        <circle cx="52" cy="-30" r="2.5" fill="#334155" />

        {/* BOXN Corrugated Hopper Walls */}
        <rect x="0" y="-26" width="84" height="25" fill="#78350F" stroke="#0F172A" strokeWidth="1" />
        {[10, 22, 34, 46, 58, 70].map((rx) => (
          <line key={rx} x1={rx} y1="-26" x2={rx} y2="-1" stroke="#451A03" strokeWidth="1.5" />
        ))}
        {/* Stencil */}
        <text x="42" y="-12" fontSize="5.5" fontWeight="700" textAnchor="middle" fill="#FEF3C7" fontFamily="monospace">
          BOXN · COAL 88T
        </text>
      </g>

      {/* --- C. WAGON 2: BLC INTERMODAL CONTAINER FLAT --- */}
      <g className="wagon-container" transform={isEast ? `translate(${x - 275}, ${y})` : `translate(${x + 190}, ${y})`}>
        {/* Bogies */}
        <rect x="6" y="2" width="22" height="4" fill="#0F172A" />
        <circle cx="10" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <circle cx="24" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <rect x="56" y="2" width="22" height="4" fill="#0F172A" />
        <circle cx="60" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <circle cx="74" cy="7" r="4.2" fill="#1E293B" stroke="#475569" strokeWidth="1" />

        {/* Flatbed Steel Deck */}
        <rect x="0" y="-5" width="84" height="4" fill="#334155" stroke="#0F172A" strokeWidth="0.8" />

        {/* Container 1: Marine Blue CONCOR */}
        <rect x="2" y="-30" width="38" height="25" fill="#1E40AF" stroke="#0F172A" strokeWidth="0.8" />
        {[6, 12, 18, 24, 30, 36].map((cx) => (
          <line key={cx} x1={cx} y1="-30" x2={cx} y2="-5" stroke="#1D4ED8" strokeWidth="1" />
        ))}
        <text x="21" y="-16" fontSize="5.5" fontWeight="800" textAnchor="middle" fill="#FFFFFF" fontFamily="monospace">
          CONCOR
        </text>

        {/* Container 2: Crimson Red INDIAN RAILWAYS */}
        <rect x="44" y="-30" width="38" height="25" fill="#991B1B" stroke="#0F172A" strokeWidth="0.8" />
        {[48, 54, 60, 66, 72, 78].map((cx) => (
          <line key={cx} x1={cx} y1="-30" x2={cx} y2="-5" stroke="#B91C1C" strokeWidth="1" />
        ))}
        <text x="63" y="-16" fontSize="5" fontWeight="800" textAnchor="middle" fill="#FEF08A" fontFamily="monospace">
          INDIAN RLY
        </text>
      </g>

      {/* --- D. FLOATING HUD IDENTIFIER BADGE --- */}
      <g transform={isEast ? `translate(${x - 47}, ${y - 48})` : `translate(${x + 47}, ${y - 48})`}>
        <rect
          x="-55"
          y="-12"
          width="110"
          height="16"
          rx="3"
          fill="#0F172A"
          stroke={isSelected ? '#F59E0B' : '#10B981'}
          strokeWidth="1.2"
          opacity="0.95"
        />
        <text
          x="0"
          y="-1"
          fontSize="8"
          fontWeight="700"
          textAnchor="middle"
          fill="#F8FAFC"
          fontFamily="monospace"
        >
          {isEast ? '🚂→' : '←🚂'} {train.train_id} [FREIGHT]
        </text>
      </g>
    </g>
  );
}

/**
 * MaintenanceWorkZone: Authentic track possession work zone with barrier stop boards,
 * yellow track tamper / tower wagon, and safety maintenance personnel
 */
function MaintenanceWorkZone({ block, trackY, xStart = 380, xEnd = 960, isSelected, onClick }) {
  const midX = (xStart + xEnd) / 2;
  const width = xEnd - xStart;

  return (
    <g className="maintenance-possession-zone" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* 1. Track Bed Caution Stripes Overlay */}
      <rect
        x={xStart}
        y={trackY - 14}
        width={width}
        height="28"
        fill="url(#caution-diagonal-stripes)"
        opacity="0.35"
        rx="2"
      />
      <rect
        x={xStart}
        y={trackY - 14}
        width={width}
        height="28"
        fill="none"
        stroke="#DC2626"
        strokeWidth="1.5"
        strokeDasharray="8 4"
      />

      {/* 2. Boundary Red & White Striped Barricades */}
      {/* Left Barricade */}
      <g transform={`translate(${xStart - 4}, ${trackY - 24})`}>
        <rect x="0" y="0" width="8" height="32" fill="#DC2626" rx="1" />
        <line x1="0" y1="8" x2="8" y2="8" stroke="#FFFFFF" strokeWidth="3" />
        <line x1="0" y1="20" x2="8" y2="20" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="4" cy="-4" r="3" fill="#EF4444" />
        <circle cx="4" cy="-4" r="5" fill="url(#signal-red-glow)" opacity="0.8" />
      </g>
      {/* Right Barricade */}
      <g transform={`translate(${xEnd - 4}, ${trackY - 24})`}>
        <rect x="0" y="0" width="8" height="32" fill="#DC2626" rx="1" />
        <line x1="0" y1="8" x2="8" y2="8" stroke="#FFFFFF" strokeWidth="3" />
        <line x1="0" y1="20" x2="8" y2="20" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="4" cy="-4" r="3" fill="#EF4444" />
        <circle cx="4" cy="-4" r="5" fill="url(#signal-red-glow)" opacity="0.8" />
      </g>

      {/* 3. Authentic Yellow Railway Maintenance Vehicle (Tower Wagon / Track Machine) */}
      <g className="maintenance-vehicle" transform={`translate(${midX - 40}, ${trackY})`}>
        {/* Wheels on Rails */}
        <circle cx="12" cy="7" r="4.5" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <circle cx="68" cy="7" r="4.5" fill="#1E293B" stroke="#475569" strokeWidth="1" />

        {/* Machine Body in High-Visibility Safety Yellow */}
        <rect x="0" y="-24" width="80" height="22" rx="2" fill="#EAB308" stroke="#0F172A" strokeWidth="1.2" />
        <line x1="0" y1="-8" x2="80" y2="-8" stroke="#CA8A04" strokeWidth="2" />

        {/* Cab Window & Flashing Strobe */}
        <rect x="8" y="-20" width="16" height="9" fill="#0284C7" stroke="#0F172A" strokeWidth="0.8" />
        <rect x="30" y="-20" width="16" height="9" fill="#0284C7" stroke="#0F172A" strokeWidth="0.8" />
        <circle cx="16" cy="-26" r="3" fill="#F97316" />
        <circle cx="16" cy="-26" r="6" fill="url(#signal-yellow-glow)" opacity="0.8" />

        {/* Raised Articulated Inspection Platform reaching Overhead Line */}
        <line x1="56" y1="-24" x2="62" y2="-44" stroke="#475569" strokeWidth="2.5" />
        <line x1="68" y1="-24" x2="62" y2="-44" stroke="#475569" strokeWidth="2.5" />
        {/* Scissor lift cradle */}
        <rect x="52" y="-48" width="22" height="6" fill="#1E293B" stroke="#EAB308" strokeWidth="1" />

        {/* Maintenance Crew Worker on Lift with Hardhat */}
        <circle cx="63" cy="-52" r="2.5" fill="#F8FAFC" />
        <rect x="60.5" y="-55" width="5" height="2.5" fill="#EA580C" rx="1" />

        {/* Track-level Worker with Inspection Tool */}
        <g transform="translate(-18, -14)">
          {/* Head & Safety Helmet */}
          <circle cx="0" cy="0" r="2.8" fill="#F8FAFC" />
          <rect x="-2.5" y="-3.5" width="5" height="2" fill="#EA580C" rx="0.8" />
          {/* High-Vis Orange Vest Body */}
          <rect x="-3" y="2.8" width="6" height="8" fill="#F97316" rx="1" />
          {/* Tool */}
          <line x1="3" y1="4" x2="8" y2="14" stroke="#64748B" strokeWidth="1.5" />
        </g>
      </g>

      {/* 4. Prominent HUD Possession Banner */}
      <g transform={`translate(${midX}, ${trackY - 48})`}>
        <rect
          x="-140"
          y="-14"
          width="280"
          height="22"
          rx="4"
          fill="#1E293B"
          stroke="#EF4444"
          strokeWidth="1.5"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
        />
        <text
          x="0"
          y="1"
          fontSize="9.5"
          fontWeight="800"
          textAnchor="middle"
          fill="#FEE2E2"
          fontFamily="var(--font-sans)"
        >
          ⛔ POSSESSION ACTIVE: {block?.block_id} ({block?.start_time}–{block?.end_time}) · {block?.departments?.join(' + ')}
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
  // Simulation Clock: range 06:00 (360m) to 22:00 (1320m)
  const START_MIN = 360;
  const END_MIN = 1320;
  const [simTime, setSimTime] = useState(540); // Default to 09:00 (540m)
  const [tickSec, setTickSec] = useState(0);
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
      setTickSec((prev) => (prev + 30) % 60);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Keyboard shortcut: Spacebar to toggle Play/Pause
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
    setTickSec(0);
  };

  const handleStep = (delta) => {
    setSimTime((prev) => Math.max(START_MIN, Math.min(END_MIN, prev + delta)));
  };

  // 4 Primary Corridors & Track Properties
  const TRACKS = [
    {
      id: 'Track 1',
      name: 'Track 1 (Up Main Line)',
      direction: 'EAST', // Station A -> Station B
      dirLabel: 'Eastbound (Station A → Station B)',
      arrow: '→',
      type: 'Passenger High-Speed Main Line',
      speedLimit: '130 km/h',
      y: 90,
    },
    {
      id: 'Track 2',
      name: 'Track 2 (Down Main Line)',
      direction: 'WEST', // Station B -> Station A
      dirLabel: 'Westbound (Station B → Station A)',
      arrow: '←',
      type: 'Passenger High-Speed Main Line',
      speedLimit: '130 km/h',
      y: 190,
    },
    {
      id: 'Track 3',
      name: 'Track 3 (Loop / Overtake Line)',
      direction: 'EAST', // Bi-directional overtake
      dirLabel: 'Bi-directional Loop (Overtake & Platform Loop)',
      arrow: '⇄',
      type: 'Passenger Loop & Staging Line',
      speedLimit: '75 km/h',
      y: 290,
    },
    {
      id: 'Track 4',
      name: 'Track 4 (Freight / Goods Line)',
      direction: 'WEST', // Dedicated Freight
      dirLabel: 'Dedicated Freight Corridor (Heavy Haul)',
      arrow: '⇄',
      type: 'Heavy Freight Corridor',
      speedLimit: '100 km/h',
      y: 390,
    },
  ];

  // Train statuses and positions calculated deterministically from simulation clock
  // SVG Width: 1360px. Platform A: 140px. Platform B: 1220px. Mainline span: 1080px.
  const trainSimStates = useMemo(() => {
    return trains.map((t) => {
      const arr = timeToMin(t.arrival_time);
      const dep = timeToMin(t.departure_time);
      const isEastbound = t.track === 'Track 1' || t.track === 'Track 3';
      const isFreight = t.train_id.includes('GOODS') || t.track === 'Track 4' || t.train_name.toLowerCase().includes('freight');

      let state = 'SCHEDULED';
      let progress = 0; // 0 to 1
      let posX = isEastbound ? 280 : 1080; // Default platform position

      if (simTime < arr) {
        if (arr - simTime <= 25) {
          state = 'APPROACHING';
          const approachProg = 1 - (arr - simTime) / 25;
          posX = isEastbound ? 80 + approachProg * 200 : 1280 - approachProg * 200;
        } else {
          state = 'SCHEDULED';
          posX = isEastbound ? 80 : 1280;
        }
      } else if (simTime >= arr && simTime <= dep) {
        state = 'IN_TRANSIT';
        const span = Math.max(1, dep - arr);
        progress = (simTime - arr) / span;
        // Move smoothly along the corridor
        posX = isEastbound ? 280 + progress * 800 : 1080 - progress * 800;
      } else if (simTime > dep) {
        if (simTime - dep <= 20) {
          state = 'CLEARING';
          const clearProg = (simTime - dep) / 20;
          posX = isEastbound ? 1080 + clearProg * 180 : 280 - clearProg * 180;
        } else {
          state = 'COMPLETED';
          posX = isEastbound ? 1300 : 60;
        }
      }

      return {
        ...t,
        state,
        progress,
        posX: Math.max(60, Math.min(1300, posX)),
        isEastbound,
        isFreight,
      };
    });
  }, [trains, simTime]);

  // Section states at current simulation clock
  const trackSectionStates = useMemo(() => {
    const states = {};

    TRACKS.forEach((track) => {
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
      let signalAspect = 'GREEN';

      if (activeBlock) {
        status = 'MAINTENANCE_BLOCKED';
        statusColor = '#DC2626'; // Red
        statusLabel = `MAINTENANCE BLOCKED (${activeBlock.block_id})`;
        signalAspect = 'RED';
      } else if (activeTrains.length > 0) {
        status = 'TRAIN_OCCUPIED';
        statusColor = '#1D4ED8'; // Cobalt
        statusLabel = `TRAIN OCCUPIED (${activeTrains.map((t) => t.train_id).join(', ')})`;
        signalAspect = 'RED';
      } else if (upcomingBlock) {
        status = 'UPCOMING_MAINTENANCE';
        statusColor = '#B45309'; // Amber
        statusLabel = `UPCOMING MAINTENANCE (${upcomingBlock.start_time} - ${upcomingBlock.end_time})`;
        signalAspect = 'YELLOW';
      } else if (completedBlock) {
        status = 'COMPLETED_MAINTENANCE';
        statusColor = '#6E7681';
        statusLabel = 'MAINTENANCE COMPLETED (Track Restored)';
        signalAspect = 'GREEN';
      }

      states[track.id] = {
        status,
        statusColor,
        statusLabel,
        signalAspect,
        activeBlock,
        upcomingBlock,
        completedBlock,
        activeTrains,
        trackBlocks,
      };
    });

    return states;
  }, [scheduledBlocks, trainSimStates, simTime]);

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

  // Generate sleeper X positions (every 16px from x=50 to x=1310)
  const sleeperPositions = useMemo(() => {
    const list = [];
    for (let x = 60; x <= 1300; x += 15) {
      list.push(x);
    }
    return list;
  }, []);

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
            Real-time visual simulation of railway network Section A–B under live train schedules & maintenance block possessions
          </div>
        </div>

        {/* Right: Digital Military Clock & Live Operational Indicators */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div
            style={{
              background: '#0F172A',
              color: '#38BDF8',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              fontFamily: 'var(--font-mono)',
              fontSize: '18px',
              fontWeight: '700',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>SIM CLOCK</span>
            <span>{formatDigitalClock(simTime, tickSec)}</span>
          </div>

          <div style={{ display: 'flex', gap: '10px', fontSize: '11.5px' }}>
            <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '2px', fontWeight: '600' }}>
              ACTIVE TRAINS: <strong style={{ color: '#1D4ED8' }}>{trainSimStates.filter((t) => t.state === 'IN_TRANSIT').length}</strong>
            </span>
            <span style={{ background: '#F1F5F9', padding: '4px 8px', borderRadius: '2px', fontWeight: '600' }}>
              ACTIVE BLOCKS: <strong style={{ color: '#DC2626' }}>{Object.values(trackSectionStates).filter((s) => s.status === 'MAINTENANCE_BLOCKED').length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. THE MAIN ATTRACTION: PHYSICAL RAILWAY TRACKS & MOVING TRAIN SIMULATION SCENE */}
      <div
        className="ops-panel"
        style={{
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-xs)',
          background: '#0A0F1D', // Ultra-deep slate railway night yard
          color: '#F8FAFC',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        }}
      >
        {/* Schematic Control & Status Header Strip */}
        <div
          style={{
            padding: '10px 16px',
            background: '#131D2E',
            borderBottom: '1px solid #1E293B',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11.5px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <span style={{ fontWeight: '800', letterSpacing: '0.06em', color: '#38BDF8' }}>
              MAINLINE CORRIDOR SCHEMATIC · 2.5D ELEVATION
            </span>
            <span style={{ color: '#475569' }}>|</span>
            <span>
              TERMINAL A: <strong style={{ color: '#E2E8F0' }}>WEST JN (KM 42.0)</strong>
            </span>
            <span style={{ color: '#94A3B8' }}>⟷</span>
            <span>
              TERMINAL B: <strong style={{ color: '#E2E8F0' }}>EAST JN (KM 68.5)</strong>
            </span>
          </div>

          {/* Operational Status Legend */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '11px', color: '#CBD5E1' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E' }}></span>
              Clear Track
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3B82F6' }}></span>
              Train Occupied
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#EF4444' }}></span>
              Maintenance Block
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></span>
              Upcoming
            </span>
          </div>
        </div>

        {/* HIGH-PRECISION VECTOR SVG RAILWAY SIMULATION SCENE */}
        <div style={{ width: '100%', position: 'relative', background: '#090D16' }}>
          <svg
            viewBox="0 0 1360 480"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          >
            <defs>
              {/* Ballast Embankment Gradient */}
              <linearGradient id="ballast-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#111827" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0B0F19" stopOpacity="1" />
              </linearGradient>

              {/* Polished Steel Rail Gradient */}
              <linearGradient id="steel-rail-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#CBD5E1" />
                <stop offset="70%" stopColor="#64748B" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* Headlight Illuminated Beam Gradients */}
              <linearGradient id="headlight-beam-east" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="headlight-beam-west" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FEF08A" stopOpacity="0.0" />
              </linearGradient>

              {/* Lamp Glow Gradients */}
              <radialGradient id="headlight-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
                <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="signal-green-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#86EFAC" stopOpacity="1" />
                <stop offset="50%" stopColor="#22C55E" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="signal-red-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FCA5A5" stopOpacity="1" />
                <stop offset="50%" stopColor="#EF4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="signal-yellow-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDE68A" stopOpacity="1" />
                <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </radialGradient>

              {/* Maintenance Possession Caution Stripes Pattern */}
              <pattern id="caution-diagonal-stripes" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="10" height="20" fill="#DC2626" opacity="0.4" />
                <rect x="10" y="0" width="10" height="20" fill="#FBBF24" opacity="0.4" />
              </pattern>
            </defs>

            {/* --- 1. OVERHEAD CATENARY SYSTEM (OHE LATTICE MASTS & CONTACT WIRES) --- */}
            {/* Catenary Contact Wires for Each Track */}
            {TRACKS.map((t) => (
              <line
                key={`wire-${t.id}`}
                x1="40"
                y1={t.y - 52}
                x2="1320"
                y2={t.y - 52}
                stroke="#64748B"
                strokeWidth="0.8"
                strokeDasharray="140 1"
                opacity="0.6"
              />
            ))}

            {/* Catenary Steel Lattice Masts at Regular 220px Intervals */}
            {[260, 480, 700, 920, 1140].map((mx) => (
              <g key={`mast-${mx}`} opacity="0.45">
                {/* Vertical Lattice Steel Column */}
                <line x1={mx} y1="30" x2={mx} y2="440" stroke="#475569" strokeWidth="2.5" />
                <line x1={mx + 6} y1="30" x2={mx + 6} y2="440" stroke="#475569" strokeWidth="2.5" />
                {/* Horizontal & Diagonal Lattice Braces */}
                {[50, 100, 150, 200, 250, 300, 350, 400].map((by) => (
                  <React.Fragment key={by}>
                    <line x1={mx} y1={by} x2={mx + 6} y2={by} stroke="#64748B" strokeWidth="1" />
                    <line x1={mx} y1={by} x2={mx + 6} y2={by + 25} stroke="#64748B" strokeWidth="0.8" />
                  </React.Fragment>
                ))}
                {/* Cantilever Registration Arms over tracks */}
                {TRACKS.map((t) => (
                  <g key={`cantilever-${mx}-${t.id}`}>
                    <line x1={mx + 6} y1={t.y - 62} x2={mx + 28} y2={t.y - 52} stroke="#64748B" strokeWidth="1.2" />
                    {/* Porcelain Insulator */}
                    <rect x={mx + 22} y={t.y - 56} width="6" height="3" fill="#38BDF8" rx="0.5" />
                  </g>
                ))}
              </g>
            ))}

            {/* --- 2. STATION TERMINAL PLATFORMS AT BOTH ENDS --- */}
            {/* STATION A (WEST JUNCTION) - Left Platform Complex */}
            <g className="station-a-complex">
              {/* Platform Apron Base with Tactile Yellow Safety Coping Stones */}
              <rect x="0" y="45" width="130" height="385" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              {/* Platform Safety Yellow Edge Line */}
              <line x1="128" y1="45" x2="128" y2="430" stroke="#FBBF24" strokeWidth="3" />
              <line x1="124" y1="45" x2="124" y2="430" stroke="#0F172A" strokeWidth="1" strokeDasharray="6 6" />

              {/* Station Modern Canopy Roof Structure */}
              <rect x="4" y="55" width="116" height="365" fill="#131D2E" rx="3" stroke="#334155" strokeWidth="1" />
              {/* Canopy Trusses */}
              {[90, 190, 290, 390].map((py) => (
                <g key={`canopy-a-${py}`}>
                  <line x1="8" y1={py - 25} x2="116" y2={py - 25} stroke="#475569" strokeWidth="1" />
                  <line x1="8" y1={py + 25} x2="116" y2={py + 25} stroke="#475569" strokeWidth="1" />
                </g>
              ))}

              {/* Station Nameboard (Indian Railways Classic Yellow Board) */}
              <rect x="14" y="15" width="102" height="26" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.2" rx="2" />
              <text x="65" y="27" fontSize="7" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                पश्चिम जंक्शन
              </text>
              <text x="65" y="37" fontSize="8" fontWeight="800" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                STATION A (WEST JN)
              </text>
            </g>

            {/* STATION B (EAST JUNCTION) - Right Platform Complex */}
            <g className="station-b-complex">
              <rect x="1230" y="45" width="130" height="385" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
              <line x1="1232" y1="45" x2="1232" y2="430" stroke="#FBBF24" strokeWidth="3" />
              <line x1="1236" y1="45" x2="1236" y2="430" stroke="#0F172A" strokeWidth="1" strokeDasharray="6 6" />

              <rect x="1240" y="55" width="116" height="365" fill="#131D2E" rx="3" stroke="#334155" strokeWidth="1" />
              {[90, 190, 290, 390].map((py) => (
                <g key={`canopy-b-${py}`}>
                  <line x1="1244" y1={py - 25} x2="1352" y2={py - 25} stroke="#475569" strokeWidth="1" />
                  <line x1="1244" y1={py + 25} x2="1352" y2={py + 25} stroke="#475569" strokeWidth="1" />
                </g>
              ))}

              <rect x="1244" y="15" width="102" height="26" fill="#FBBF24" stroke="#0F172A" strokeWidth="1.2" rx="2" />
              <text x="1295" y="27" fontSize="7" fontWeight="700" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                पूर्व जंक्शन
              </text>
              <text x="1295" y="37" fontSize="8" fontWeight="800" textAnchor="middle" fill="#0F172A" fontFamily="var(--font-sans)">
                STATION B (EAST JN)
              </text>
            </g>

            {/* --- 3. FOUR PHYSICAL RAILWAY TRACKS (BALLAST, SLEEPERS, DUAL STEEL RAILS) --- */}
            {TRACKS.map((track) => {
              const sec = trackSectionStates[track.id];
              const isSelected = selectedTrack === track.id;

              return (
                <g
                  key={track.id}
                  className={`railway-track-lane ${isSelected ? 'track-selected' : ''}`}
                  onClick={() => setSelectedTrack(track.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Track Selection Active Outline */}
                  {isSelected && (
                    <rect
                      x="50"
                      y={track.y - 25}
                      width="1260"
                      height="50"
                      fill="#1E293B"
                      opacity="0.3"
                      stroke="#38BDF8"
                      strokeWidth="1"
                    />
                  )}

                  {/* A. Ballast Embankment Bed with Depth Shading */}
                  <polygon
                    points={`50,${track.y - 18} 1310,${track.y - 18} 1316,${track.y + 20} 44,${track.y + 20}`}
                    fill="url(#ballast-gradient)"
                  />
                  {/* Ballast Lower Shoulder Slope */}
                  <line x1="44" y1={track.y + 20} x2="1316" y2={track.y + 20} stroke="#0B0F19" strokeWidth="2.5" />

                  {/* B. Individual Concrete Railway Sleepers / Ties */}
                  {sleeperPositions.map((sx) => (
                    <g key={`slp-${track.id}-${sx}`}>
                      {/* Concrete Sleeper Body */}
                      <rect
                        x={sx - 2.5}
                        y={track.y - 15}
                        width="5"
                        height="30"
                        rx="0.5"
                        fill="#334155"
                        stroke="#1E293B"
                        strokeWidth="0.5"
                      />
                      {/* Beveled Top Highlight */}
                      <line x1={sx - 2} y1={track.y - 15} x2={sx + 2} y2={track.y - 15} stroke="#475569" strokeWidth="0.8" />
                      {/* Pandrol Rail Fastener Clips on both rails */}
                      <circle cx={sx} cy={track.y - 9} r="1.2" fill="#64748B" />
                      <circle cx={sx} cy={track.y + 9} r="1.2" fill="#64748B" />
                    </g>
                  ))}

                  {/* C. Two Parallel Continuous Steel Rails (Gauge = 18px) */}
                  {/* Top Rail (Center y - 9) */}
                  <g className="rail-top">
                    <line x1="40" y1={track.y - 9} x2="1320" y2={track.y - 9} stroke="#1E293B" strokeWidth="4.5" />
                    <line x1="40" y1={track.y - 9} x2="1320" y2={track.y - 9} stroke="url(#steel-rail-gradient)" strokeWidth="2.8" />
                    <line x1="40" y1={track.y - 9.5} x2="1320" y2={track.y - 9.5} stroke="#FFFFFF" strokeWidth="0.9" opacity="0.9" />
                  </g>

                  {/* Bottom Rail (Center y + 9) */}
                  <g className="rail-bottom">
                    <line x1="40" y1={track.y + 9} x2="1320" y2={track.y + 9} stroke="#1E293B" strokeWidth="4.5" />
                    <line x1="40" y1={track.y + 9} x2="1320" y2={track.y + 9} stroke="url(#steel-rail-gradient)" strokeWidth="2.8" />
                    <line x1="40" y1={track.y + 8.5} x2="1320" y2={track.y + 8.5} stroke="#FFFFFF" strokeWidth="0.9" opacity="0.9" />
                  </g>

                  {/* D. Integrated Track Identifier Badge (Inside Platform Zone) */}
                  <g transform={`translate(14, ${track.y - 6})`}>
                    <rect x="0" y="-8" width="102" height="16" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="0.8" />
                    <text x="51" y="3" fontSize="6.8" fontWeight="700" textAnchor="middle" fill="#E2E8F0" fontFamily="monospace">
                      {track.name.split(' (')[0]} · {track.arrow} {track.speedLimit}
                    </text>
                  </g>

                  {/* E. Multi-Aspect Signals at Section Approaches */}
                  {/* Station A Starter Signal */}
                  <SignalPost
                    x={145}
                    y={track.y}
                    aspect={sec.signalAspect}
                    signalId={`S-${track.id.replace('Track ', '')}A`}
                    orientation="EAST"
                  />
                  {/* Station B Home Signal */}
                  <SignalPost
                    x={1215}
                    y={track.y}
                    aspect={sec.signalAspect}
                    signalId={`S-${track.id.replace('Track ', '')}B`}
                    orientation="WEST"
                  />

                  {/* F. Active Maintenance Block Possession Zone (if active) */}
                  {sec.status === 'MAINTENANCE_BLOCKED' && sec.activeBlock && (
                    <MaintenanceWorkZone
                      block={sec.activeBlock}
                      trackY={track.y}
                      xStart={380}
                      xEnd={960}
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

            {/* --- 4. MOVING REALISTIC TRAIN MODELS (PASSENGER & FREIGHT) --- */}
            {trainSimStates.map((train) => {
              if (train.state !== 'IN_TRANSIT' && train.state !== 'APPROACHING' && train.state !== 'CLEARING') {
                return null;
              }

              const trackObj = TRACKS.find((tk) => tk.id === train.track);
              if (!trackObj) return null;

              const isSelected = selectedTrain?.train_id === train.train_id;
              const direction = train.isEastbound ? 'EAST' : 'WEST';

              if (train.isFreight) {
                return (
                  <FreightTrain
                    key={train.train_id}
                    train={train}
                    x={train.posX}
                    y={trackObj.y}
                    direction={direction}
                    isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTrain(train);
                      setSelectedTrack(train.track);
                    }}
                  />
                );
              }

              return (
                <PassengerTrain
                  key={train.train_id}
                  train={train}
                  x={train.posX}
                  y={trackObj.y}
                  direction={direction}
                  isSelected={isSelected}
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

        {/* 3. SIMULATION PLAYBACK & TIMELINE CONTROLLER DOCK */}
        <div
          style={{
            background: '#131D2E',
            borderTop: '1px solid #1E293B',
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
                  minWidth: '105px',
                  background: isPlaying ? '#DC2626' : '#16A34A',
                  borderColor: isPlaying ? '#B91C1C' : '#15803D',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  boxShadow: isPlaying ? '0 0 10px rgba(220,38,38,0.4)' : '0 0 10px rgba(22,163,74,0.4)',
                }}
              >
                {isPlaying ? '⏸ PAUSE' : '▶ PLAY'}
              </button>

              <button
                className="btn btn-secondary"
                onClick={handleReset}
                style={{ background: '#1E293B', color: '#E2E8F0', borderColor: '#334155' }}
                title="Reset simulation to 09:00:00"
              >
                ↺ RESET
              </button>

              <div style={{ display: 'flex', gap: '4px', marginLeft: '6px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(-15)}
                  style={{ background: '#1E293B', color: '#CBD5E1', borderColor: '#334155', fontSize: '11px', padding: '4px 8px' }}
                  title="Jump back 15 minutes"
                >
                  -15m
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStep(15)}
                  style={{ background: '#1E293B', color: '#CBD5E1', borderColor: '#334155', fontSize: '11px', padding: '4px 8px' }}
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
                    background: speed === s ? '#2563EB' : '#1E293B',
                    color: '#FFFFFF',
                    border: '1px solid ' + (speed === s ? '#60A5FA' : '#334155'),
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
                background: showTimetableDrawer ? '#2563EB' : '#1E293B',
                color: '#FFFFFF',
                border: '1px solid #334155',
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
                accentColor: '#38BDF8',
              }}
            />
            {/* Hour Markers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
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

      {/* 4. CONTEXTUAL INSPECTION PANELS (Selected Track Section & Selected Train) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* Panel A: Track Section Asset & Possession Details */}
        <div className="ops-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">Track Section Inspector: {selectedTrackInfo?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Physical infrastructure, live occupancy, and maintenance possession status
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
                <span style={{ color: 'var(--c-text-secondary)' }}>Section Corridor:</span>{' '}
                <strong>A–B (West Jn ⟷ East Jn)</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Track Designation:</span>{' '}
                <strong>{selectedTrackInfo?.type}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Signal Interlocking:</span>{' '}
                <strong>4-Aspect Absolute Automatic Block</strong>
              </div>
              <div>
                <span style={{ color: 'var(--c-text-secondary)' }}>Electrification OHE:</span>{' '}
                <strong>25kV AC Mainline Traction</strong>
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
                  Window: {selectedTrackData.activeBlock.start_time} – {selectedTrackData.activeBlock.end_time} ({selectedTrackData.activeBlock.block_duration}h active possession)
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
                ✓ No active possession at {minToTime(simTime)}. Section clear for authorized train operations.
              </div>
            )}
          </div>
        </div>

        {/* Panel B: Selected Train Inspector */}
        <div className="ops-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title">
                Train Inspector: {selectedTrain ? `${selectedTrain.train_id} (${selectedTrain.train_name})` : 'Select a Train on Tracks'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Locomotive formation, telemetry, traversal progress, and schedule
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
                    <span style={{ color: 'var(--c-text-secondary)' }}>Rake Composition:</span>{' '}
                    <strong>{selectedTrain.isFreight ? 'WAG-9 Freight Loco + 2 Wagons' : 'WAP-7 Electric Loco + 2 LHB Coaches'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Assigned Corridor:</span>{' '}
                    <strong>{selectedTrain.track}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Direction:</span>{' '}
                    <strong>{selectedTrain.isEastbound ? 'Eastbound (Station A → Station B)' : 'Westbound (Station B → Station A)'}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--c-text-secondary)' }}>Section Window:</span>{' '}
                    <strong className="cell-mono">{selectedTrain.arrival_time} – {selectedTrain.departure_time}</strong>
                  </div>
                </div>

                <div style={{ background: 'var(--c-surface-alt)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--c-border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>TRAVERSAL PROGRESS:</span>
                    <span className="cell-mono" style={{ fontWeight: '700', color: '#1D4ED8' }}>
                      {Math.round(selectedTrain.progress * 100)}% ({selectedTrain.state})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.round(selectedTrain.progress * 100)}%`,
                        height: '100%',
                        background: '#2563EB',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-text-muted)' }}>
                Click any passenger locomotive, coach, or freight train on the physical tracks to inspect its formation and telemetry.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. COLLAPSIBLE TRAIN TIMETABLE MANIFEST DRAWER */}
      {showTimetableDrawer && (
        <div className="ops-panel anim-slide-in">
          <div className="panel-header">
            <div>
              <div className="panel-title">Full Network Train Timetable Manifest (Section A–B)</div>
              <div style={{ fontSize: '11px', color: 'var(--c-text-secondary)', marginTop: '2px' }}>
                Complete operational schedule for all 14 authorized services on 20 Sep 2026
              </div>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowTimetableDrawer(false)}
              style={{ padding: '2px 8px', fontSize: '11px' }}
            >
              ✕ Close Timetable
            </button>
          </div>

          <div className="panel-body">
            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search train ID or name..."
                value={timetableSearch}
                onChange={(e) => setTimetableSearch(e.target.value)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid var(--c-border)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '12px',
                  minWidth: '220px',
                }}
              />
              <div style={{ display: 'flex', gap: '4px' }}>
                {['ALL', 'Track 1', 'Track 2', 'Track 3', 'Track 4'].map((trk) => (
                  <button
                    key={trk}
                    className={`btn-seg ${timetableTrackFilter === trk ? 'active' : ''}`}
                    onClick={() => setTimetableTrackFilter(trk)}
                  >
                    {trk}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="ops-table-container">
              <table className="ops-table">
                <thead>
                  <tr>
                    <th>Train ID</th>
                    <th>Train Service Name</th>
                    <th>Assigned Track</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Speed Limit</th>
                    <th>Status at Sim Clock</th>
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
                        <td className="cell-mono" style={{ fontWeight: '700' }}>
                          {tr.train_id}
                        </td>
                        <td>{tr.train_name}</td>
                        <td>
                          <span className="badge-tag" style={{ background: '#E2E8F0', color: '#1E293B', fontWeight: '600' }}>
                            {tr.track}
                          </span>
                        </td>
                        <td className="cell-mono">{tr.arrival_time}</td>
                        <td className="cell-mono">{tr.departure_time}</td>
                        <td className="cell-mono">130 km/h</td>
                        <td>
                          <span
                            style={{
                              fontSize: '10.5px',
                              padding: '2px 6px',
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