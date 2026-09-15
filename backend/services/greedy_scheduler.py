"""
Greedy Maintenance Block Scheduling Algorithm (Track-Specific Edition)
======================================================================
This module implements the greedy block assignment algorithm for railway maintenance.

DSA Concepts:
1. Sorting: Tasks are sorted by their earliest start time: O(N log N).
2. Greedy Assignment: Tasks are assigned to existing compatible blocks first to maximize
   department clubbing and reduce overall track possession windows.
3. Linear Search: Candidate blocks and available block windows are evaluated sequentially.
4. Interval Overlap: Simple interval checking for train timetables and block compatibility.
5. Track Compatibility: Enforces both Section and Track matching (task.section == block.section and task.track == block.track).
"""

from typing import List, Optional, Tuple
from models.schemas import (
    MaintenanceTask,
    TrainSchedule,
    AvailableBlock,
    ScheduledBlock,
    UnscheduledTask,
    ScheduleMetrics,
    ScheduleResult,
    TrafficWindowDensity,
)


def time_to_minutes(time_str: str) -> int:
    """Converts 'HH:MM' string to minutes from midnight."""
    parts = time_str.strip().split(":")
    hours = int(parts[0])
    minutes = int(parts[1])
    return hours * 60 + minutes


def minutes_to_time(minutes: int) -> str:
    """Converts minutes from midnight back to 'HH:MM' string."""
    hours = (minutes // 60) % 24
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"


def is_overlapping(start1: int, end1: int, start2: int, end2: int) -> bool:
    """Checks if two time intervals [start1, end1] and [start2, end2] overlap."""
    return max(start1, start2) < min(end1, end2)


def fits_in_window(task_start: int, task_duration_min: int, window_start: int, window_end: int) -> bool:
    """Checks if a task starting at task_start with duration task_duration_min fits fully inside window."""
    task_end = task_start + task_duration_min
    return task_start >= window_start and task_end <= window_end


def find_train_conflict(
    section: str,
    track: str,
    date: str,
    block_start_min: int,
    block_end_min: int,
    train_schedule: List[TrainSchedule],
) -> Optional[TrainSchedule]:
    """
    Checks if any scheduled train operates on the same section, track, and date
    during the proposed block time window.
    """
    for train in train_schedule:
        if train.section == section and train.track == track and train.date == date:
            train_arr = time_to_minutes(train.arrival_time)
            train_dep = time_to_minutes(train.departure_time)

            if is_overlapping(block_start_min, block_end_min, train_arr, train_dep):
                return train
    return None


def compute_traffic_density(trains: List[TrainSchedule]) -> List[TrafficWindowDensity]:
    """
    Computes train traffic density across standard 3-hour operational windows.
    Enables operations staff to identify time slots with the fewest/zero trains
    for minimal-disruption maintenance block scheduling.
    """
    standard_windows = [
        ("06:00", "09:00"),
        ("09:00", "12:00"),
        ("12:00", "15:00"),
        ("15:00", "18:00"),
        ("18:00", "21:00"),
        ("21:00", "24:00"),
    ]

    # Evaluate tracks 1 through 4
    tracks = ["Track 1", "Track 2", "Track 3", "Track 4"]
    results: List[TrafficWindowDensity] = []

    for track in tracks:
        for start_str, end_str in standard_windows:
            w_start = time_to_minutes(start_str)
            w_end = 1440 if end_str == "24:00" else time_to_minutes(end_str)

            matching_trains = []
            for tr in trains:
                if tr.track == track:
                    tr_arr = time_to_minutes(tr.arrival_time)
                    tr_dep = time_to_minutes(tr.departure_time)
                    if is_overlapping(w_start, w_end, tr_arr, tr_dep):
                        matching_trains.append(f"{tr.train_name} ({tr.train_id})")

            cnt = len(matching_trains)
            if cnt == 0:
                status = "Optimal for Block (Zero Disruption)"
                recommendation = "Clear corridor — Safe to sanction multi-department block"
            elif cnt == 1:
                status = "Feasible with Caution (Low Traffic)"
                recommendation = "1 train scheduled — Caution / short-duration block"
            else:
                status = "BLOCK NOT POSSIBLE (High Traffic)"
                recommendation = f"High traffic ({cnt} trains) — Track possession strictly prohibited"

            results.append(
                TrafficWindowDensity(
                    section=track,
                    track=track,
                    time_window=f"{start_str} – {end_str}",
                    start_time=start_str,
                    end_time=end_str,
                    train_count=cnt,
                    trains=matching_trains,
                    status=status,
                    recommendation=recommendation,
                )
            )

    return results


def run_greedy_scheduler(
    tasks: List[MaintenanceTask],
    train_schedule: List[TrainSchedule],
    available_blocks: List[AvailableBlock],
) -> ScheduleResult:
    """
    Core Greedy Scheduling Logic with Track Matching:
    1. Sort tasks by earliest_start.
    2. For each task:
       a. Try to assign into an existing active block matching section AND track.
       b. If no active block fits, find an available block window on that section & track with no train conflict.
       c. If found, create a new active block and assign task.
       d. Otherwise, mark task as unscheduled with a descriptive reason.
    """
    # Step 1: Sort tasks by earliest start time (DSA: O(N log N))
    sorted_tasks = sorted(tasks, key=lambda t: time_to_minutes(t.earliest_start))

    active_blocks = []
    used_block_ids = set()
    unscheduled: List[UnscheduledTask] = []

    # Step 2: Iterate over sorted tasks (DSA: Greedy O(N * M))
    for task in sorted_tasks:
        task_start_min = time_to_minutes(task.earliest_start)
        task_dur_min = int(task.duration * 60)
        assigned = False

        # Step 3: Check existing active blocks first (matching section AND track)
        for block in active_blocks:
            if block["section"] == task.section and block["track"] == task.track and block["date"] == task.date:
                if fits_in_window(task_start_min, task_dur_min, block["start_min"], block["end_min"]):
                    block["tasks"].append(task)
                    if task.department not in block["departments"]:
                        block["departments"].append(task.department)

                    # Simultaneous execution: duration is max of task durations
                    block["block_duration"] = max(block["block_duration"], task.duration)
                    assigned = True
                    break

        # Step 4: If not assigned to existing block, allocate new block from available windows
        if not assigned:
            candidate_train_conflict: Optional[Tuple[AvailableBlock, TrainSchedule]] = None
            found_available_window = False

            for avail in available_blocks:
                if avail.block_id in used_block_ids:
                    continue

                if avail.section == task.section and avail.track == task.track and avail.date == task.date:
                    avail_start_min = time_to_minutes(avail.start_time)
                    avail_end_min = time_to_minutes(avail.end_time)

                    if fits_in_window(task_start_min, task_dur_min, avail_start_min, avail_end_min):
                        found_available_window = True

                        # Check train conflict on this specific track
                        conflict_train = find_train_conflict(
                            section=avail.section,
                            track=avail.track,
                            date=avail.date,
                            block_start_min=avail_start_min,
                            block_end_min=avail_end_min,
                            train_schedule=train_schedule,
                        )

                        if conflict_train:
                            candidate_train_conflict = (avail, conflict_train)
                            continue

                        # Window is clear! Create new active block
                        window_capacity = (avail_end_min - avail_start_min) / 60.0
                        new_block = {
                            "block_id": avail.block_id,
                            "section": avail.section,
                            "track": avail.track,
                            "date": avail.date,
                            "start_time": avail.start_time,
                            "end_time": avail.end_time,
                            "start_min": avail_start_min,
                            "end_min": avail_end_min,
                            "window_capacity_hours": round(window_capacity, 2),
                            "departments": [task.department],
                            "tasks": [task],
                            "block_duration": task.duration,
                        }
                        active_blocks.append(new_block)
                        used_block_ids.add(avail.block_id)
                        assigned = True
                        break

            # Step 5: If still unassigned, record detailed failure reason
            if not assigned:
                if candidate_train_conflict:
                    avail_win, train = candidate_train_conflict
                    reason = (
                        f"Train conflict on {task.track}: {train.train_name} ({train.train_id}) operates on {task.track} "
                        f"({train.arrival_time} - {train.departure_time}) during available window {avail_win.block_id} "
                        f"({avail_win.start_time} - {avail_win.end_time})"
                    )
                elif found_available_window:
                    reason = f"All matching block windows on {task.track} have operational train conflicts"
                else:
                    reason = (
                        f"No available block window found on {task.track} on {task.date} "
                        f"fitting time {task.earliest_start} - {task.latest_end}"
                    )

                unscheduled.append(UnscheduledTask(task=task, reason=reason))

    # Convert active_blocks to ScheduledBlock schemas
    scheduled_blocks: List[ScheduledBlock] = []
    for b in active_blocks:
        utilization = (
            round((b["block_duration"] / b["window_capacity_hours"]) * 100, 1)
            if b["window_capacity_hours"] > 0
            else 0.0
        )
        scheduled_blocks.append(
            ScheduledBlock(
                block_id=b["block_id"],
                section=b["section"],
                track=b["track"],
                date=b["date"],
                start_time=b["start_time"],
                end_time=b["end_time"],
                departments=b["departments"],
                tasks=b["tasks"],
                block_duration=round(b["block_duration"], 2),
                window_capacity_hours=b["window_capacity_hours"],
                utilization_percentage=utilization,
                status="Scheduled",
            )
        )

    # Summary metrics
    total_tasks = len(tasks)
    total_scheduled = sum(len(b.tasks) for b in scheduled_blocks)
    total_unscheduled = len(unscheduled)
    total_avail = len(available_blocks)
    blocks_used = len(scheduled_blocks)

    dept_consolidation = (
        round(sum(len(b.departments) for b in scheduled_blocks) / blocks_used, 2)
        if blocks_used > 0
        else 0.0
    )
    avg_utilization = (
        round(sum(b.utilization_percentage for b in scheduled_blocks) / blocks_used, 1)
        if blocks_used > 0
        else 0.0
    )

    metrics = ScheduleMetrics(
        total_tasks=total_tasks,
        scheduled_tasks=total_scheduled,
        unscheduled_tasks=total_unscheduled,
        total_available_blocks=total_avail,
        blocks_used=blocks_used,
        department_consolidation=dept_consolidation,
        avg_block_utilization=avg_utilization,
    )

    return ScheduleResult(
        blocks=scheduled_blocks,
        unscheduled=unscheduled,
        metrics=metrics,
    )
