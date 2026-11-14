// Client-side fallback service for standalone / Netlify hosting
export const DEFAULT_TASKS = [
  { task_id: 'T001', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:00', latest_end: '11:30', duration: 2.0, arrival_time: '06:00', description: 'Deep screening and ballast tamping' },
  { task_id: 'T002', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:15', latest_end: '11:00', duration: 1.5, arrival_time: '06:04', description: 'Point machine testing and track circuit renewal' },
  { task_id: 'T003', department: 'Traction', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:30', latest_end: '11:45', duration: 2.0, arrival_time: '06:08', description: 'OHE contact wire inspection and bracket overhaul' },
  { task_id: 'T004', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '10:00', latest_end: '11:30', duration: 1.0, arrival_time: '06:12', description: 'Rail fracture ultrasonic testing' },
  { task_id: 'T005', department: 'Engineering', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:00', latest_end: '15:30', duration: 2.5, arrival_time: '06:16', description: 'Sleeper renewal and turnout realignment' },
  { task_id: 'T006', department: 'Signal & Telecom', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:15', latest_end: '15:00', duration: 1.5, arrival_time: '06:20', description: 'Signal interlocking and axle counter testing' },
  { task_id: 'T007', department: 'Traction', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:30', latest_end: '15:30', duration: 2.0, arrival_time: '06:24', description: 'Catenary wire tension adjustment' },
  { task_id: 'T008', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:00', latest_end: '17:30', duration: 2.5, arrival_time: '06:28', description: 'Bridge girder painting and track greasing' },
  { task_id: 'T009', department: 'Signal & Telecom', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:30', latest_end: '17:00', duration: 1.5, arrival_time: '06:32', description: 'Electronic interlocking diagnostics' },
  { task_id: 'T010', department: 'Traction', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:00', latest_end: '17:00', duration: 2.0, arrival_time: '06:36', description: 'Substation feeder breaker testing' },
  { task_id: 'T011', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '14:00', latest_end: '16:30', duration: 2.0, arrival_time: '06:40', description: 'Rail weld grinding' },
  { task_id: 'T012', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '14:30', latest_end: '16:00', duration: 1.5, arrival_time: '06:44', description: 'Level crossing gate signal calibration' },
  { task_id: 'T013', department: 'Traction', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '08:30', latest_end: '10:30', duration: 2.0, arrival_time: '06:48', description: 'Isolator switch maintenance' },
  { task_id: 'T014', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '10:00', latest_end: '12:30', duration: 2.0, arrival_time: '06:52', description: 'Curve rail realignment' },
  { task_id: 'T015', department: 'Engineering', section: 'Track 4', track: 'Track 4', date: '2026-09-20', earliest_start: '10:00', latest_end: '12:00', duration: 2.0, arrival_time: '06:56', description: 'Track geometry inspection' },
  { task_id: 'T016', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '18:00', latest_end: '20:30', duration: 2.0, arrival_time: '07:00', description: 'Signal relay room wiring audit' },
  { task_id: 'T017', department: 'Traction', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:00', latest_end: '10:30', duration: 1.5, arrival_time: '07:04', description: 'Neutral section inspection' },
  { task_id: 'T018', department: 'Engineering', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '14:00', latest_end: '15:30', duration: 1.5, arrival_time: '07:08', description: 'Switch expansion joint adjustment' },
  { task_id: 'T019', department: 'Signal & Telecom', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '16:00', latest_end: '17:30', duration: 1.5, arrival_time: '07:12', description: 'Audio frequency track circuit check' },
  { task_id: 'T020', department: 'Traction', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '23:00', latest_end: '01:00', duration: 2.0, arrival_time: '07:16', description: 'Emergency tower wagon run' },
];

export const DEFAULT_TRAINS = [
  { train_id: 'TR-12001', train_name: 'Shatabdi Express', section: 'Track 1', track: 'Track 1', date: '2026-09-20', arrival_time: '07:15', departure_time: '07:45' },
  { train_id: 'TR-12003', train_name: 'Gomti Express', section: 'Track 1', track: 'Track 1', date: '2026-09-20', arrival_time: '08:10', departure_time: '08:40' },
  { train_id: 'TR-22436', train_name: 'Vande Bharat Express', section: 'Track 1', track: 'Track 1', date: '2026-09-20', arrival_time: '15:10', departure_time: '15:40' },
  { train_id: 'TR-12951', train_name: 'Rajdhani Express', section: 'Track 1', track: 'Track 1', date: '2026-09-20', arrival_time: '16:15', departure_time: '16:45' },
  { train_id: 'TR-GOODS-01', train_name: 'Container Freight 701', section: 'Track 1', track: 'Track 1', date: '2026-09-20', arrival_time: '19:30', departure_time: '20:15' },
  { train_id: 'TR-12423', train_name: 'Dibrugarh Rajdhani', section: 'Track 2', track: 'Track 2', date: '2026-09-20', arrival_time: '09:15', departure_time: '09:45' },
  { train_id: 'TR-14055', train_name: 'Brahmaputra Mail', section: 'Track 2', track: 'Track 2', date: '2026-09-20', arrival_time: '11:15', departure_time: '11:50' },
  { train_id: 'TR-12056', train_name: 'Dehradun Jan Shatabdi', section: 'Track 2', track: 'Track 2', date: '2026-09-20', arrival_time: '18:15', departure_time: '18:45' },
  { train_id: 'TR-12301', train_name: 'Howrah Rajdhani', section: 'Track 2', track: 'Track 2', date: '2026-09-20', arrival_time: '19:40', departure_time: '20:15' },
  { train_id: 'TR-12296', train_name: 'Sanghamitra Express', section: 'Track 3', track: 'Track 3', date: '2026-09-20', arrival_time: '10:30', departure_time: '11:00' },
  { train_id: 'TR-12626', train_name: 'Kerala Express', section: 'Track 3', track: 'Track 3', date: '2026-09-20', arrival_time: '11:30', departure_time: '12:05' },
  { train_id: 'TR-16317', train_name: 'Himsagar Express', section: 'Track 3', track: 'Track 3', date: '2026-09-20', arrival_time: '13:15', departure_time: '13:45' },
  { train_id: 'TR-GOODS-02', train_name: 'Coal Freight 802', section: 'Track 4', track: 'Track 4', date: '2026-09-20', arrival_time: '18:30', departure_time: '19:15' },
  { train_id: 'TR-GOODS-03', train_name: 'Petroleum Tanker 404', section: 'Track 4', track: 'Track 4', date: '2026-09-20', arrival_time: '20:00', departure_time: '20:45' },
];

export const DEFAULT_AVAILABLE_BLOCKS = [
  { block_id: 'BLK-101', section: 'Track 1', track: 'Track 1', date: '2026-09-20', start_time: '09:00', end_time: '12:00' },
  { block_id: 'BLK-102', section: 'Track 1', track: 'Track 1', date: '2026-09-20', start_time: '14:00', end_time: '17:00' },
  { block_id: 'BLK-103', section: 'Track 2', track: 'Track 2', date: '2026-09-20', start_time: '08:00', end_time: '11:00' },
  { block_id: 'BLK-104', section: 'Track 2', track: 'Track 2', date: '2026-09-20', start_time: '13:00', end_time: '16:00' },
  { block_id: 'BLK-105', section: 'Track 3', track: 'Track 3', date: '2026-09-20', start_time: '10:00', end_time: '13:00' },
  { block_id: 'BLK-106', section: 'Track 3', track: 'Track 3', date: '2026-09-20', start_time: '15:00', end_time: '18:00' },
  { block_id: 'BLK-107', section: 'Track 1', track: 'Track 1', date: '2026-09-20', start_time: '18:00', end_time: '21:00' },
];

export function getLocalContestedScenario() {
  const opDate = '2026-09-20';
  const corridors = [
    { block_id: 'BLK-C101', section: 'Track 1', track: 'Track 1', date: opDate, start_time: '08:00', end_time: '10:00' },
    { block_id: 'BLK-C102', section: 'Track 1', track: 'Track 1', date: opDate, start_time: '09:30', end_time: '13:30' },
    { block_id: 'BLK-C103', section: 'Track 2', track: 'Track 2', date: opDate, start_time: '11:00', end_time: '13:00' },
    { block_id: 'BLK-C104', section: 'Track 2', track: 'Track 2', date: opDate, start_time: '12:00', end_time: '16:00' },
    { block_id: 'BLK-C105', section: 'Track 3', track: 'Track 3', date: opDate, start_time: '14:00', end_time: '18:00' },
    { block_id: 'BLK-C106', section: 'Track 3', track: 'Track 3', date: opDate, start_time: '08:00', end_time: '11:00' },
  ];
  const trains = [
    {
      train_id: 'TR-12301',
      train_name: 'Rajdhani Express',
      section: 'Track 3',
      track: 'Track 3',
      date: opDate,
      arrival_time: '09:00',
      departure_time: '09:45',
    },
  ];
  const tasks = [
    { task_id: 'TS-01', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: opDate, earliest_start: '08:00', latest_end: '09:30', duration: 1.5, arrival_time: '07:10', description: 'Emergency Rail Joint Weld' },
    { task_id: 'TS-02', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: opDate, earliest_start: '09:30', latest_end: '12:00', duration: 2.0, arrival_time: '06:00', description: 'Ballast Tamp & Track Align' },
    { task_id: 'TS-03', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: opDate, earliest_start: '09:45', latest_end: '12:30', duration: 1.5, arrival_time: '06:15', description: 'Point Machine Calibration' },
    { task_id: 'TS-04', department: 'Traction', section: 'Track 1', track: 'Track 1', date: opDate, earliest_start: '10:00', latest_end: '13:00', duration: 2.5, arrival_time: '06:30', description: 'Catenary Wire Tensioning' },
    { task_id: 'TS-05', department: 'Signal & Telecom', section: 'Track 2', track: 'Track 2', date: opDate, earliest_start: '11:00', latest_end: '12:30', duration: 1.5, arrival_time: '08:00', description: 'Axle Counter Loop Replacement' },
    { task_id: 'TS-06', department: 'Engineering', section: 'Track 2', track: 'Track 2', date: opDate, earliest_start: '12:00', latest_end: '15:00', duration: 2.5, arrival_time: '07:00', description: 'Turnout Diamond Crossing Renewal' },
    { task_id: 'TS-07', department: 'Traction', section: 'Track 2', track: 'Track 2', date: opDate, earliest_start: '12:30', latest_end: '15:30', duration: 2.0, arrival_time: '07:15', description: 'Substation Feeder Inspection' },
    { task_id: 'TS-08', department: 'Signal & Telecom', section: 'Track 2', track: 'Track 2', date: opDate, earliest_start: '13:00', latest_end: '15:30', duration: 2.0, arrival_time: '07:20', description: 'Track Circuit Bonding Inspection' },
    { task_id: 'TS-09', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: opDate, earliest_start: '14:00', latest_end: '16:30', duration: 2.0, arrival_time: '06:05', description: 'Deep Screen Track Ballast' },
    { task_id: 'TS-10', department: 'Signal & Telecom', section: 'Track 3', track: 'Track 3', date: opDate, earliest_start: '14:30', latest_end: '17:00', duration: 2.0, arrival_time: '06:10', description: 'Signal Lamp Unit Overhaul' },
    { task_id: 'TS-11', department: 'Traction', section: 'Track 3', track: 'Track 3', date: opDate, earliest_start: '15:00', latest_end: '17:30', duration: 2.0, arrival_time: '06:20', description: 'Insulator Washing & Mast Checking' },
    { task_id: 'TS-12', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: opDate, earliest_start: '08:30', latest_end: '10:30', duration: 1.5, arrival_time: '08:05', description: 'Track Alignment Probe' },
  ];
  return { tasks, trains, corridors };
}

export function timeToMinutes(tStr) {
  if (!tStr) return 0;
  const [h, m] = tStr.split(':').map(Number);
  return h * 60 + m;
}

export function isOverlapping(start1, end1, start2, end2) {
  return Math.max(start1, start2) < Math.min(end1, end2);
}

export function fitsInWindow(taskStart, taskDurationMin, windowStart, windowEnd) {
  return taskStart >= windowStart && taskStart + taskDurationMin <= windowEnd;
}

export function findTrainConflict(track, date, blockStartMin, blockEndMin, trainSchedule) {
  for (const tr of trainSchedule) {
    if (tr.track === track && tr.date === date) {
      const arr = timeToMinutes(tr.arrival_time);
      const dep = timeToMinutes(tr.departure_time);
      if (isOverlapping(blockStartMin, blockEndMin, arr, dep)) {
        return tr;
      }
    }
  }
  return null;
}

export function computeLocalTrafficDensity(trains = DEFAULT_TRAINS) {
  const standardWindows = [
    ['06:00', '09:00'],
    ['09:00', '12:00'],
    ['12:00', '15:00'],
    ['15:00', '18:00'],
    ['18:00', '21:00'],
    ['21:00', '24:00'],
  ];

  const tracks = ['Track 1', 'Track 2', 'Track 3', 'Track 4'];
  const results = [];

  for (const track of tracks) {
    for (const [startStr, endStr] of standardWindows) {
      const wStart = timeToMinutes(startStr);
      const wEnd = endStr === '24:00' ? 1440 : timeToMinutes(endStr);

      const matchingTrains = [];
      for (const tr of trains) {
        if (tr.track === track) {
          const arr = timeToMinutes(tr.arrival_time);
          const dep = timeToMinutes(tr.departure_time);
          if (isOverlapping(wStart, wEnd, arr, dep)) {
            matchingTrains.push(`${tr.train_name} (${tr.train_id})`);
          }
        }
      }

      const cnt = matchingTrains.length;
      let status = 'Optimal for Block (Zero Disruption)';
      let recommendation = 'Clear corridor — Safe to sanction multi-department block';
      if (cnt === 1) {
        status = 'Feasible with Caution (Low Traffic)';
        recommendation = '1 train scheduled — Caution / short-duration block';
      } else if (cnt >= 2) {
        status = 'BLOCK NOT POSSIBLE (High Traffic)';
        recommendation = `High traffic (${cnt} trains) — Track possession strictly prohibited`;
      }

      results.push({
        section: track,
        track,
        time_window: `${startStr} – ${endStr}`,
        start_time: startStr,
        end_time: endStr,
        train_count: cnt,
        trains: matchingTrains,
        status,
        recommendation,
      });
    }
  }
  return results;
}

export function runLocalGreedyScheduler(
  tasks = DEFAULT_TASKS,
  trainSchedule = DEFAULT_TRAINS,
  availableBlocks = DEFAULT_AVAILABLE_BLOCKS
) {
  // Sort tasks by earliest start time using Merge Sort
  const sortedTasks = mergeSort(tasks, (t) => timeToMinutes(t.earliest_start));

  const activeBlocks = [];
  const usedBlockIds = new Set();
  const unscheduled = [];
  const decisionSteps = [];

  sortedTasks.forEach((task, idx) => {
    const taskStartMin = timeToMinutes(task.earliest_start);
    const taskDurMin = Math.round(task.duration * 60);
    let assigned = false;
    const startLabel = `Start: ${task.earliest_start} (Pri #${idx + 1})`;

    // 1. Check existing active blocks matching track & date (Greedy local clubbing)
    for (const block of activeBlocks) {
      if (block.track === task.track && block.date === task.date) {
        if (fitsInWindow(taskStartMin, taskDurMin, block.start_min, block.end_min)) {
          block.tasks.push(task);
          if (!block.departments.includes(task.department)) {
            block.departments.push(task.department);
          }
          block.block_duration = Math.max(block.block_duration, task.duration);
          assigned = true;

          decisionSteps.push({
            step_number: idx + 1,
            entity_id: task.task_id,
            key_attribute: startLabel,
            action: 'CLUBBED_INTO_EXISTING',
            block_id: block.block_id,
            state_detail: `Duration: ${task.duration}h (Block max: ${block.block_duration}h)`,
            rationale: `Greedy rule: Earliest start (${task.earliest_start}) matches active block ${block.block_id} on ${task.track}; clubbed to minimize track possessions`,
          });
          break;
        }
      }
    }

    // 2. Allocate new block from available block windows
    if (!assigned) {
      let candidateTrainConflict = null;
      let foundAvailableWindow = false;

      for (const avail of availableBlocks) {
        if (usedBlockIds.has(avail.block_id)) continue;

        if (avail.track === task.track && avail.date === task.date) {
          const availStartMin = timeToMinutes(avail.start_time);
          const availEndMin = timeToMinutes(avail.end_time);

          if (fitsInWindow(taskStartMin, taskDurMin, availStartMin, availEndMin)) {
            foundAvailableWindow = true;

            // Hard constraint: Cannot open overlapping block on the same physical track
            const trackPossessionConflict = activeBlocks.some(
              (b) =>
                b.track === avail.track &&
                b.date === avail.date &&
                isOverlapping(availStartMin, availEndMin, b.start_min, b.end_min)
            );
            if (trackPossessionConflict) {
              continue;
            }

            const conflictTrain = findTrainConflict(
              avail.track,
              avail.date,
              availStartMin,
              availEndMin,
              trainSchedule
            );

            if (conflictTrain) {
              candidateTrainConflict = { avail, conflictTrain };
              continue;
            }

            const windowCapacity = (availEndMin - availStartMin) / 60.0;
            const newBlock = {
              block_id: avail.block_id,
              section: avail.track,
              track: avail.track,
              date: avail.date,
              start_time: avail.start_time,
              end_time: avail.end_time,
              start_min: availStartMin,
              end_min: availEndMin,
              window_capacity_hours: Number(windowCapacity.toFixed(2)),
              departments: [task.department],
              tasks: [task],
              block_duration: task.duration,
            };
            activeBlocks.push(newBlock);
            usedBlockIds.add(avail.block_id);
            assigned = true;

            decisionSteps.push({
              step_number: idx + 1,
              entity_id: task.task_id,
              key_attribute: startLabel,
              action: 'ALLOCATED_NEW_BLOCK',
              block_id: avail.block_id,
              state_detail: `Window: ${avail.start_time}-${avail.end_time} (${windowCapacity.toFixed(1)}h)`,
              rationale: `Greedy rule: No active block fits ${task.task_id}; opened earliest available corridor ${avail.block_id} on ${task.track}`,
            });
            break;
          }
        }
      }

      if (!assigned) {
        let reason = '';
        if (candidateTrainConflict) {
          const { avail, conflictTrain } = candidateTrainConflict;
          reason = `Train conflict on ${task.track}: ${conflictTrain.train_name} (${conflictTrain.train_id}) operates on ${task.track} (${conflictTrain.arrival_time} - ${conflictTrain.departure_time}) during available window ${avail.block_id} (${avail.start_time} - ${avail.end_time})`;
        } else if (foundAvailableWindow) {
          reason = `All matching block windows on ${task.track} have operational train conflicts`;
        } else {
          reason = `No available block window found on ${task.track} on ${task.date} fitting time ${task.earliest_start} - ${task.latest_end}`;
        }
        unscheduled.push({ task, reason });

        decisionSteps.push({
          step_number: idx + 1,
          entity_id: task.task_id,
          key_attribute: startLabel,
          action: 'REJECTED',
          block_id: null,
          state_detail: 'Infeasible / Conflicted',
          rationale: reason,
        });
      }
    }
  });

  const scheduledBlocks = activeBlocks.map((b) => {
    const util =
      b.window_capacity_hours > 0
        ? Number(((b.block_duration / b.window_capacity_hours) * 100).toFixed(1))
        : 0.0;
    return {
      block_id: b.block_id,
      section: b.track,
      track: b.track,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      departments: b.departments,
      tasks: b.tasks,
      block_duration: Number(b.block_duration.toFixed(2)),
      window_capacity_hours: b.window_capacity_hours,
      utilization_percentage: util,
      status: 'Scheduled',
    };
  });

  const totalTasks = tasks.length;
  const scheduledTasks = scheduledBlocks.reduce((acc, b) => acc + b.tasks.length, 0);
  const unscheduledTasks = unscheduled.length;
  const blocksUsed = scheduledBlocks.length;
  const deptConsolidation =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.departments.length, 0) / blocksUsed
          ).toFixed(2)
        )
      : 0.0;
  const avgUtilization =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.utilization_percentage, 0) / blocksUsed
          ).toFixed(1)
        )
      : 0.0;

  return {
    blocks: scheduledBlocks,
    unscheduled,
    metrics: {
      total_tasks: totalTasks,
      scheduled_tasks: scheduledTasks,
      unscheduled_tasks: unscheduledTasks,
      total_available_blocks: availableBlocks.length,
      blocks_used: blocksUsed,
      department_consolidation: deptConsolidation,
      avg_block_utilization: avgUtilization,
    },
    decision_steps: decisionSteps,
  };
}

export function mergeSort(items, keyFn) {
  if (items.length <= 1) return [...items];
  const mid = Math.floor(items.length / 2);
  const left = mergeSort(items.slice(0, mid), keyFn);
  const right = mergeSort(items.slice(mid), keyFn);

  const merged = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (keyFn(left[i]) <= keyFn(right[j])) {
      merged.push(left[i]);
      i++;
    } else {
      merged.push(right[j]);
      j++;
    }
  }
  return merged.concat(left.slice(i)).concat(right.slice(j));
}

export function runLocalFCFSScheduler(
  tasks = DEFAULT_TASKS,
  trainSchedule = DEFAULT_TRAINS,
  availableBlocks = DEFAULT_AVAILABLE_BLOCKS
) {
  // FCFS: Process tasks in original submission order without earliest start sorting
  const orderedTasks = [...tasks].sort((a, b) => {
    const aTime = a.arrival_time ? timeToMinutes(a.arrival_time) : 0;
    const bTime = b.arrival_time ? timeToMinutes(b.arrival_time) : 0;
    return aTime - bTime;
  });

  const activeBlocks = [];
  const usedBlockIds = new Set();
  const unscheduled = [];
  const decisionSteps = [];

  const sortedAvailable = [...availableBlocks].sort(
    (a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time)
  );

  orderedTasks.forEach((task, idx) => {
    const taskStartMin = timeToMinutes(task.earliest_start);
    const taskDurMin = Math.round(task.duration * 60);
    let assigned = false;
    const arrivalLabel = `Req Time: ${task.arrival_time || `Pos #${idx + 1}`}`;

    // 1. Search existing active blocks for earliest compatible
    const compatible = [];
    for (const block of activeBlocks) {
      if (block.track === task.track && block.date === task.date) {
        if (fitsInWindow(taskStartMin, taskDurMin, block.start_min, block.end_min)) {
          compatible.push(block);
        }
      }
    }

    if (compatible.length > 0) {
      compatible.sort((a, b) => a.start_min - b.start_min);
      const chosen = compatible[0];
      chosen.tasks.push(task);
      if (!chosen.departments.includes(task.department)) {
        chosen.departments.push(task.department);
      }
      chosen.block_duration = Math.max(chosen.block_duration, task.duration);
      assigned = true;

      decisionSteps.push({
        step_number: idx + 1,
        entity_id: task.task_id,
        key_attribute: arrivalLabel,
        action: 'ASSIGNED_TO_BLOCK',
        block_id: chosen.block_id,
        state_detail: `Duration: ${task.duration}h (Max simultaneous: ${chosen.block_duration}h)`,
        rationale: `Clubbed into earliest active compatible block ${chosen.block_id} on ${task.track}`,
      });
    }

    // 2. Allocate earliest available corridor
    if (!assigned) {
      let candidateTrainConflict = null;
      let foundAvailableWindow = false;

      for (const avail of sortedAvailable) {
        if (usedBlockIds.has(avail.block_id)) continue;

        if (avail.track === task.track && avail.date === task.date) {
          const availStartMin = timeToMinutes(avail.start_time);
          const availEndMin = timeToMinutes(avail.end_time);

          if (fitsInWindow(taskStartMin, taskDurMin, availStartMin, availEndMin)) {
            foundAvailableWindow = true;

            // Hard constraint: Cannot open overlapping block on the same physical track
            const trackPossessionConflict = activeBlocks.some(
              (b) =>
                b.track === avail.track &&
                b.date === avail.date &&
                isOverlapping(availStartMin, availEndMin, b.start_min, b.end_min)
            );
            if (trackPossessionConflict) {
              continue;
            }

            const conflictTrain = findTrainConflict(
              avail.track,
              avail.date,
              availStartMin,
              availEndMin,
              trainSchedule
            );

            if (conflictTrain) {
              if (!candidateTrainConflict) {
                candidateTrainConflict = { avail, conflictTrain };
              }
              continue;
            }

            const windowCapacity = (availEndMin - availStartMin) / 60.0;
            const newBlock = {
              block_id: avail.block_id,
              section: avail.track,
              track: avail.track,
              date: avail.date,
              start_time: avail.start_time,
              end_time: avail.end_time,
              start_min: availStartMin,
              end_min: availEndMin,
              window_capacity_hours: Number(windowCapacity.toFixed(2)),
              departments: [task.department],
              tasks: [task],
              block_duration: task.duration,
            };
            activeBlocks.push(newBlock);
            usedBlockIds.add(avail.block_id);
            assigned = true;

            decisionSteps.push({
              step_number: idx + 1,
              entity_id: task.task_id,
              key_attribute: arrivalLabel,
              action: 'CREATED_NEW_BLOCK',
              block_id: avail.block_id,
              state_detail: `Window: ${avail.start_time}-${avail.end_time} (${windowCapacity.toFixed(1)}h)`,
              rationale: `Opened first feasible unconflicted corridor ${avail.block_id} on ${task.track}`,
            });
            break;
          }
        }
      }

      if (!assigned) {
        let reason = '';
        if (candidateTrainConflict) {
          const { avail, conflictTrain } = candidateTrainConflict;
          reason = `Train conflict on ${task.track}: ${conflictTrain.train_name} (${conflictTrain.train_id}) operates on ${task.track} (${conflictTrain.arrival_time} - ${conflictTrain.departure_time}) during available window ${avail.block_id} (${avail.start_time} - ${avail.end_time})`;
        } else if (foundAvailableWindow) {
          reason = `All matching block windows on ${task.track} have operational train conflicts`;
        } else {
          reason = `No available block window found on ${task.track} on ${task.date} fitting time ${task.earliest_start} - ${task.latest_end}`;
        }
        unscheduled.push({ task, reason });

        decisionSteps.push({
          step_number: idx + 1,
          entity_id: task.task_id,
          key_attribute: arrivalLabel,
          action: 'REJECTED',
          block_id: null,
          state_detail: 'Infeasible',
          rationale: reason,
        });
      }
    }
  });

  const scheduledBlocks = activeBlocks.map((b) => {
    const util =
      b.window_capacity_hours > 0
        ? Number(((b.block_duration / b.window_capacity_hours) * 100).toFixed(1))
        : 0.0;
    return {
      block_id: b.block_id,
      section: b.track,
      track: b.track,
      date: b.date,
      start_time: b.start_time,
      end_time: b.end_time,
      departments: b.departments,
      tasks: b.tasks,
      block_duration: Number(b.block_duration.toFixed(2)),
      window_capacity_hours: b.window_capacity_hours,
      utilization_percentage: util,
      status: 'Scheduled',
    };
  });

  scheduledBlocks.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  const totalTasks = tasks.length;
  const scheduledTasks = scheduledBlocks.reduce((acc, b) => acc + b.tasks.length, 0);
  const unscheduledTasks = unscheduled.length;
  const blocksUsed = scheduledBlocks.length;
  const deptConsolidation =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.departments.length, 0) / blocksUsed
          ).toFixed(2)
        )
      : 0.0;
  const avgUtilization =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.utilization_percentage, 0) / blocksUsed
          ).toFixed(1)
        )
      : 0.0;

  return {
    blocks: scheduledBlocks,
    unscheduled,
    metrics: {
      total_tasks: totalTasks,
      scheduled_tasks: scheduledTasks,
      unscheduled_tasks: unscheduledTasks,
      total_available_blocks: availableBlocks.length,
      blocks_used: blocksUsed,
      department_consolidation: deptConsolidation,
      avg_block_utilization: avgUtilization,
    },
    decision_steps: decisionSteps,
  };
}

export function runLocalDPScheduler(
  tasks = DEFAULT_TASKS,
  trainSchedule = DEFAULT_TRAINS,
  availableBlocks = DEFAULT_AVAILABLE_BLOCKS
) {
  // DP: Weighted Interval Scheduling
  const feasibleCandidates = [];
  const windowTrainConflicts = new Map();
  const decisionSteps = [];

  for (const avail of availableBlocks) {
    const availStartMin = timeToMinutes(avail.start_time);
    const availEndMin = timeToMinutes(avail.end_time);

    const conflictTrain = findTrainConflict(
      avail.track,
      avail.date,
      availStartMin,
      availEndMin,
      trainSchedule
    );

    if (conflictTrain) {
      windowTrainConflicts.set(avail.block_id, { avail, conflictTrain });
      continue;
    }

    const fittingTasks = tasks.filter((t) => {
      if (t.track === avail.track && t.date === avail.date) {
        const tStart = timeToMinutes(t.earliest_start);
        const tDur = Math.round(t.duration * 60);
        return fitsInWindow(tStart, tDur, availStartMin, availEndMin);
      }
      return false;
    });

    if (fittingTasks.length > 0) {
      const depts = [...new Set(fittingTasks.map((t) => t.department))];
      const maxDur = Math.max(...fittingTasks.map((t) => t.duration));
      const capacity = Number(((availEndMin - availStartMin) / 60.0).toFixed(2));
      const clubbingBonus = Math.max(0, depts.length - 1) * 500.0;
      const blockPenalty = -100.0;
      const durationTiebreaker = maxDur * 10.0;
      const weight = fittingTasks.length * 10000.0 + clubbingBonus + blockPenalty + durationTiebreaker;

      feasibleCandidates.push({
        block_id: avail.block_id,
        section: avail.track,
        track: avail.track,
        date: avail.date,
        start_time: avail.start_time,
        end_time: avail.end_time,
        start_min: availStartMin,
        end_min: availEndMin,
        tasks: fittingTasks,
        departments: depts,
        block_duration: maxDur,
        window_capacity_hours: capacity,
        utilization_percentage: Number(((maxDur / capacity) * 100).toFixed(1)),
        weight,
      });
    }
  }

  // 1. Sort candidate intervals by finish time (end_min)
  const sortedCandidates = mergeSort(feasibleCandidates, (c) => c.end_min);
  const n = sortedCandidates.length;

  // 2. Compute predecessor array p(i) (1-indexed) with track compatibility + task disjointness
  const p = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    const candI = sortedCandidates[i - 1];
    for (let j = i - 1; j >= 1; j--) {
      const candJ = sortedCandidates[j - 1];
      const isTimeCompat = candJ.track !== candI.track || candJ.end_min <= candI.start_min;
      const isTasksDisjoint = candI.tasks.every(
        (ti) => !candJ.tasks.some((tj) => tj.task_id === ti.task_id)
      );
      if (isTimeCompat && isTasksDisjoint) {
        p[i] = j;
        break;
      }
    }
  }

  // 3. Bellman Recurrence: DP[i] = max(DP[i - 1], W(i) + DP[p(i)])
  const dp = new Array(n + 1).fill(0.0);
  const take = new Array(n + 1).fill(false);

  for (let i = 1; i <= n; i++) {
    const weightI = sortedCandidates[i - 1].weight;
    const includeVal = weightI + dp[p[i]];
    const excludeVal = dp[i - 1];

    if (includeVal > excludeVal) {
      dp[i] = includeVal;
      take[i] = true;
    } else {
      dp[i] = excludeVal;
      take[i] = false;
    }
  }

  // Generate decision steps for candidate intervals and recurrence evaluations
  let stepNum = 1;
  for (let i = 1; i <= n; i++) {
    const cand = sortedCandidates[i - 1];
    const predIdx = p[i];
    const predDesc = predIdx > 0 ? `p(${i}) = ${sortedCandidates[predIdx - 1].block_id}` : `p(${i}) = None (0)`;
    const isTaken = take[i];

    decisionSteps.push({
      step_number: stepNum++,
      entity_id: cand.block_id,
      key_attribute: `Interval: ${cand.start_time}-${cand.end_time} (${cand.track})`,
      action: 'DP_RECURRENCE_EVAL',
      block_id: cand.block_id,
      state_detail: `DP[${i}]=${dp[i].toLocaleString()} | ${predDesc}`,
      rationale: `W(i)=${cand.weight.toLocaleString()} (${cand.tasks.length} tasks, ${cand.departments.length} depts). Include: ${(cand.weight + dp[predIdx]).toLocaleString()} vs Exclude: ${dp[i - 1].toLocaleString()} -> ${isTaken ? 'ACCEPTED' : 'REJECTED'}`,
    });
  }

  // 4. Backtracking Reconstruction
  const selectedCandidates = [];
  let curr = n;
  while (curr > 0) {
    if (take[curr]) {
      selectedCandidates.push(sortedCandidates[curr - 1]);
      curr = p[curr];
    } else {
      curr = curr - 1;
    }
  }
  selectedCandidates.reverse();

  // 5. Enforce Task Uniqueness (Set Packing constraint)
  const scheduledTaskIds = new Set();
  const scheduledBlocks = [];

  for (const cand of selectedCandidates) {
    const uniqueTasks = [];
    for (const t of cand.tasks) {
      if (!scheduledTaskIds.has(t.task_id)) {
        uniqueTasks.push(t);
        scheduledTaskIds.add(t.task_id);
      }
    }

    if (uniqueTasks.length > 0) {
      const depts = [...new Set(uniqueTasks.map((t) => t.department))];
      const maxDur = Math.max(...uniqueTasks.map((t) => t.duration));
      const util =
        cand.window_capacity_hours > 0
          ? Number(((maxDur / cand.window_capacity_hours) * 100).toFixed(1))
          : 0.0;

      scheduledBlocks.push({
        block_id: cand.block_id,
        section: cand.section,
        track: cand.track,
        date: cand.date,
        start_time: cand.start_time,
        end_time: cand.end_time,
        departments: depts,
        tasks: uniqueTasks,
        block_duration: Number(maxDur.toFixed(2)),
        window_capacity_hours: cand.window_capacity_hours,
        utilization_percentage: util,
        status: 'Scheduled',
      });

      decisionSteps.push({
        step_number: stepNum++,
        entity_id: cand.block_id,
        key_attribute: 'Backtracking Reconstruction',
        action: 'OPTIMAL_BLOCK_SELECTED',
        block_id: cand.block_id,
        state_detail: `Capacity: ${cand.window_capacity_hours}h | Active: ${maxDur}h`,
        rationale: `Optimal DP schedule backtracked: Corridor ${cand.block_id} committed with ${uniqueTasks.length} clubbed tasks across ${depts.length} departments`,
      });
    }
  }

  scheduledBlocks.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));

  // 6. Diagnose Unscheduled Tasks
  const unscheduled = [];
  for (const task of tasks) {
    if (scheduledTaskIds.has(task.task_id)) continue;

    const taskStart = timeToMinutes(task.earliest_start);
    const taskDur = Math.round(task.duration * 60);
    let trainConflictReason = null;
    let hasMatchingWindow = false;

    for (const avail of availableBlocks) {
      if (avail.track === task.track && avail.date === task.date) {
        const aStart = timeToMinutes(avail.start_time);
        const aEnd = timeToMinutes(avail.end_time);
        if (fitsInWindow(taskStart, taskDur, aStart, aEnd)) {
          hasMatchingWindow = true;
          if (windowTrainConflicts.has(avail.block_id)) {
            const { conflictTrain } = windowTrainConflicts.get(avail.block_id);
            trainConflictReason = `Train conflict on ${task.track}: ${conflictTrain.train_name} (${conflictTrain.train_id}) operates on ${task.track} (${conflictTrain.arrival_time} - ${conflictTrain.departure_time}) during available window ${avail.block_id} (${avail.start_time} - ${avail.end_time})`;
            break;
          }
        }
      }
    }

    const reason = trainConflictReason
      ? trainConflictReason
      : hasMatchingWindow
      ? `All matching block windows on ${task.track} have operational train conflicts`
      : `No available block window found on ${task.track} on ${task.date} fitting time ${task.earliest_start} - ${task.latest_end}`;

    unscheduled.push({ task, reason });

    decisionSteps.push({
      step_number: stepNum++,
      entity_id: task.task_id,
      key_attribute: `Start: ${task.earliest_start}`,
      action: 'REJECTED',
      block_id: null,
      state_detail: 'Infeasible / Conflicted',
      rationale: reason,
    });
  }

  const totalTasks = tasks.length;
  const scheduledTasks = scheduledBlocks.reduce((acc, b) => acc + b.tasks.length, 0);
  const unscheduledTasks = unscheduled.length;
  const blocksUsed = scheduledBlocks.length;
  const deptConsolidation =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.departments.length, 0) / blocksUsed
          ).toFixed(2)
        )
      : 0.0;
  const avgUtilization =
    blocksUsed > 0
      ? Number(
          (
            scheduledBlocks.reduce((acc, b) => acc + b.utilization_percentage, 0) / blocksUsed
          ).toFixed(1)
        )
      : 0.0;

  return {
    blocks: scheduledBlocks,
    unscheduled,
    metrics: {
      total_tasks: totalTasks,
      scheduled_tasks: scheduledTasks,
      unscheduled_tasks: unscheduledTasks,
      total_available_blocks: availableBlocks.length,
      blocks_used: blocksUsed,
      department_consolidation: deptConsolidation,
      avg_block_utilization: avgUtilization,
    },
    decision_steps: decisionSteps,
  };
}

export function calculateLocalComparisonMetrics(result, availableBlocks) {
  const scheduledTasksCount = result.blocks.reduce((acc, b) => acc + b.tasks.length, 0);
  const unscheduledTasksCount = result.unscheduled.length;
  const blocksCount = result.blocks.length;

  const totalOccupiedDuration = Number(
    result.blocks.reduce((acc, b) => acc + b.block_duration, 0).toFixed(2)
  );

  const totalAvailableDuration = Number(
    availableBlocks
      .reduce(
        (acc, ab) =>
          acc + (timeToMinutes(ab.end_time) - timeToMinutes(ab.start_time)) / 60.0,
        0
      )
      .toFixed(2)
  );

  const blockUtilizationPct =
    totalAvailableDuration > 0
      ? Number(((totalOccupiedDuration / totalAvailableDuration) * 100).toFixed(1))
      : 0.0;

  const activeCapacity = result.blocks.reduce((acc, b) => acc + b.window_capacity_hours, 0);
  const activeBlockUtilizationPct =
    activeCapacity > 0
      ? Number(((totalOccupiedDuration / activeCapacity) * 100).toFixed(1))
      : 0.0;

  const clubbedTasks = result.blocks
    .filter((b) => b.tasks.length > 1)
    .reduce((acc, b) => acc + b.tasks.length, 0);

  const crossDeptBlocks = result.blocks.filter((b) => b.departments.length >= 2).length;

  const deptConsolidation =
    blocksCount > 0
      ? Number(
          (
            result.blocks.reduce((acc, b) => acc + b.departments.length, 0) / blocksCount
          ).toFixed(2)
        )
      : 0.0;

  return {
    tasks_scheduled: scheduledTasksCount,
    tasks_unscheduled: unscheduledTasksCount,
    blocks_generated: blocksCount,
    block_utilization_pct: blockUtilizationPct,
    active_block_utilization_pct: activeBlockUtilizationPct,
    total_occupied_duration: totalOccupiedDuration,
    total_available_duration: totalAvailableDuration,
    clubbed_tasks: clubbedTasks,
    cross_department_blocks: crossDeptBlocks,
    department_consolidation: deptConsolidation,
  };
}

export function runLocalComparison(
  tasks = DEFAULT_TASKS,
  trains = DEFAULT_TRAINS,
  availableBlocks = DEFAULT_AVAILABLE_BLOCKS,
  scenario = 'default'
) {
  let inTasks = tasks;
  let inTrains = trains;
  let inBlocks = availableBlocks;
  let scenarioId = 'default';
  let scenarioName = 'Official PBL Operations Snapshot (20 Tasks)';

  if (scenario === 'contested') {
    const cData = getLocalContestedScenario();
    inTasks = cData.tasks;
    inTrains = cData.trains;
    inBlocks = cData.corridors;
    scenarioId = 'contested';
    scenarioName = 'Contested Multi-Corridor Stress Benchmark';
  }

  const t0Fcfs = performance.now();
  const fcfsResult = runLocalFCFSScheduler(inTasks, inTrains, inBlocks);
  const tFcfsMs = Number((performance.now() - t0Fcfs).toFixed(2));
  const fcfsMetrics = calculateLocalComparisonMetrics(fcfsResult, inBlocks);

  const t0Greedy = performance.now();
  const greedyResult = runLocalGreedyScheduler(inTasks, inTrains, inBlocks);
  const tGreedyMs = Number((performance.now() - t0Greedy).toFixed(2));
  const greedyMetrics = calculateLocalComparisonMetrics(greedyResult, inBlocks);

  const t0Dp = performance.now();
  const dpResult = runLocalDPScheduler(inTasks, inTrains, inBlocks);
  const tDpMs = Number((performance.now() - t0Dp).toFixed(2));
  const dpMetrics = calculateLocalComparisonMetrics(dpResult, inBlocks);

  const comparisonTable = [
    {
      metric: 'Tasks Scheduled',
      fcfs: fcfsMetrics.tasks_scheduled,
      greedy: greedyMetrics.tasks_scheduled,
      dp: dpMetrics.tasks_scheduled,
      unit: 'tasks',
      description: 'Number of maintenance activities successfully assigned to track blocks',
    },
    {
      metric: 'Tasks Unscheduled',
      fcfs: fcfsMetrics.tasks_unscheduled,
      greedy: greedyMetrics.tasks_unscheduled,
      dp: dpMetrics.tasks_unscheduled,
      unit: 'tasks',
      description: 'Number of maintenance activities unassigned due to operational conflicts',
    },
    {
      metric: 'Blocks Generated',
      fcfs: fcfsMetrics.blocks_generated,
      greedy: greedyMetrics.blocks_generated,
      dp: dpMetrics.blocks_generated,
      unit: 'blocks',
      description: 'Total maintenance block possession windows opened on tracks',
    },
    {
      metric: 'Block Utilization',
      fcfs: `${fcfsMetrics.active_block_utilization_pct}%`,
      greedy: `${greedyMetrics.active_block_utilization_pct}%`,
      dp: `${dpMetrics.active_block_utilization_pct}%`,
      unit: '%',
      description: 'Active Block Utilization: Total occupied block duration / Total scheduled window capacity',
    },
    {
      metric: 'Clubbed Tasks',
      fcfs: fcfsMetrics.clubbed_tasks,
      greedy: greedyMetrics.clubbed_tasks,
      dp: dpMetrics.clubbed_tasks,
      unit: 'tasks',
      description: 'Tasks co-located in blocks containing more than 1 distinct task',
    },
    {
      metric: 'Cross-Department Blocks',
      fcfs: fcfsMetrics.cross_department_blocks,
      greedy: greedyMetrics.cross_department_blocks,
      dp: dpMetrics.cross_department_blocks,
      unit: 'blocks',
      description: 'Maintenance blocks combining tasks from at least two distinct departments (Engineering, S&T, Traction)',
    },
  ];

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const opDate = inTasks[0]?.date || '2026-09-20';

  return {
    scenario_id: scenarioId,
    scenario_name: scenarioName,
    operation_date: opDate,
    execution_timestamp: nowStr,
    snapshot_timestamp: nowStr,
    total_input_tasks: inTasks.length,
    total_input_trains: inTrains.length,
    total_available_corridors: inBlocks.length,
    comparison_table: comparisonTable,
    fcfs: {
      algorithm_key: 'fcfs',
      algorithm_name: 'First Come First Served (FCFS)',
      algorithm_description: 'Processes maintenance requests strictly in arrival/submission order without earliest-start sorting. Assigns tasks to earliest compatible block.',
      blocks: fcfsResult.blocks,
      unscheduled: fcfsResult.unscheduled,
      metrics: fcfsMetrics,
      execution_time_ms: tFcfsMs,
      dsa_notes: [
        'Queue-based arrival processing: O(N * M)',
        'No prior sorting by start time; preserves customer/request FIFO priority',
        'Assigns each task to earliest feasible compatible active block or opens new corridor',
      ],
      decision_steps: fcfsResult.decision_steps,
    },
    greedy: {
      algorithm_key: 'greedy',
      algorithm_name: 'Greedy Scheduling (Earliest Start Time)',
      algorithm_description: 'Sorts maintenance tasks by earliest start time using Merge Sort O(N log N). Progressively clubs tasks into compatible blocks or opens new corridors.',
      blocks: greedyResult.blocks,
      unscheduled: greedyResult.unscheduled,
      metrics: greedyMetrics,
      execution_time_ms: tGreedyMs,
      dsa_notes: [
        'Sorts tasks by earliest start time using Merge Sort: O(N log N)',
        'Greedy interval evaluation: reuses active block first to maximize multi-department clubbing',
        'Simultaneous execution duration: block_duration = max(durations) [non-additive]',
      ],
      decision_steps: greedyResult.decision_steps,
    },
    dp: {
      algorithm_key: 'dp',
      algorithm_name: 'Dynamic Programming (Weighted Interval Scheduling)',
      algorithm_description: 'Generates feasible candidate maintenance blocks, prunes train conflicts, sorts candidate intervals by finish time, and solves Bellman recurrence DP[i] = max(DP[i-1], W(i) + DP[p(i)]).',
      blocks: dpResult.blocks,
      unscheduled: dpResult.unscheduled,
      metrics: dpMetrics,
      execution_time_ms: tDpMs,
      dsa_notes: [
        'Candidate block evaluation: enforces hard train safety and track constraints upfront',
        'Weighted Interval Scheduling recurrence: DP[i] = max(DP[i-1], W(i) + DP[p(i)])',
        'Predecessor function p(i): finds latest non-overlapping compatible corridor interval',
        'Backtracking reconstruction: traces optimal decision choices backwards from DP table',
        'Set Packing / Task Uniqueness enforcement: ensures no task is duplicated across blocks',
      ],
      decision_steps: dpResult.decision_steps,
    },
  };
}
