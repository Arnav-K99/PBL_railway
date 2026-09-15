// Client-side fallback service for standalone / Netlify hosting
export const DEFAULT_TASKS = [
  { task_id: 'T001', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:00', latest_end: '11:30', duration: 2.0, description: 'Deep screening and ballast tamping' },
  { task_id: 'T002', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:15', latest_end: '11:00', duration: 1.5, description: 'Point machine testing and track circuit renewal' },
  { task_id: 'T003', department: 'Traction', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:30', latest_end: '11:45', duration: 2.0, description: 'OHE contact wire inspection and bracket overhaul' },
  { task_id: 'T004', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '10:00', latest_end: '11:30', duration: 1.0, description: 'Rail fracture ultrasonic testing' },
  { task_id: 'T005', department: 'Engineering', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:00', latest_end: '15:30', duration: 2.5, description: 'Sleeper renewal and turnout realignment' },
  { task_id: 'T006', department: 'Signal & Telecom', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:15', latest_end: '15:00', duration: 1.5, description: 'Signal interlocking and axle counter testing' },
  { task_id: 'T007', department: 'Traction', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '13:30', latest_end: '15:30', duration: 2.0, description: 'Catenary wire tension adjustment' },
  { task_id: 'T008', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:00', latest_end: '17:30', duration: 2.5, description: 'Bridge girder painting and track greasing' },
  { task_id: 'T009', department: 'Signal & Telecom', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:30', latest_end: '17:00', duration: 1.5, description: 'Electronic interlocking diagnostics' },
  { task_id: 'T010', department: 'Traction', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '15:00', latest_end: '17:00', duration: 2.0, description: 'Substation feeder breaker testing' },
  { task_id: 'T011', department: 'Engineering', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '14:00', latest_end: '16:30', duration: 2.0, description: 'Rail weld grinding' },
  { task_id: 'T012', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '14:30', latest_end: '16:00', duration: 1.5, description: 'Level crossing gate signal calibration' },
  { task_id: 'T013', department: 'Traction', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '08:30', latest_end: '10:30', duration: 2.0, description: 'Isolator switch maintenance' },
  { task_id: 'T014', department: 'Engineering', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '10:00', latest_end: '12:30', duration: 2.0, description: 'Curve rail realignment' },
  { task_id: 'T015', department: 'Engineering', section: 'Track 4', track: 'Track 4', date: '2026-09-20', earliest_start: '10:00', latest_end: '12:00', duration: 2.0, description: 'Track geometry inspection' },
  { task_id: 'T016', department: 'Signal & Telecom', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '18:00', latest_end: '20:30', duration: 2.0, description: 'Signal relay room wiring audit' },
  { task_id: 'T017', department: 'Traction', section: 'Track 1', track: 'Track 1', date: '2026-09-20', earliest_start: '09:00', latest_end: '10:30', duration: 1.5, description: 'Neutral section inspection' },
  { task_id: 'T018', department: 'Engineering', section: 'Track 2', track: 'Track 2', date: '2026-09-20', earliest_start: '14:00', latest_end: '15:30', duration: 1.5, description: 'Switch expansion joint adjustment' },
  { task_id: 'T019', department: 'Signal & Telecom', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '16:00', latest_end: '17:30', duration: 1.5, description: 'Audio frequency track circuit check' },
  { task_id: 'T020', department: 'Traction', section: 'Track 3', track: 'Track 3', date: '2026-09-20', earliest_start: '23:00', latest_end: '01:00', duration: 2.0, description: 'Emergency tower wagon run' },
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
  // Sort tasks by earliest start time
  const sortedTasks = [...tasks].sort(
    (a, b) => timeToMinutes(a.earliest_start) - timeToMinutes(b.earliest_start)
  );

  const activeBlocks = [];
  const usedBlockIds = new Set();
  const unscheduled = [];

  for (const task of sortedTasks) {
    const taskStartMin = timeToMinutes(task.earliest_start);
    const taskDurMin = Math.round(task.duration * 60);
    let assigned = false;

    // 1. Check existing active blocks matching track & date
    for (const block of activeBlocks) {
      if (block.track === task.track && block.date === task.date) {
        if (fitsInWindow(taskStartMin, taskDurMin, block.start_min, block.end_min)) {
          block.tasks.push(task);
          if (!block.departments.includes(task.department)) {
            block.departments.push(task.department);
          }
          block.block_duration = Math.max(block.block_duration, task.duration);
          assigned = true;
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
      }
    }
  }

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
  };
}
