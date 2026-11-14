"""
FCFS (First Come First Served) Maintenance Block Scheduling Algorithm
=====================================================================
Processes maintenance requests in strictly their arrival/submission order.
Assigns each task to the earliest feasible compatible maintenance block.

DSA Concept:
Queue-based / Arrival-order processing:
1. Iterate over tasks in original submission order (NO earliest-start sorting).
2. For each task, search for the earliest compatible active block.
3. If none, search for the earliest compatible available block corridor free of train conflicts.
4. Enforces section, track, time-window, and train non-conflict constraints.
"""

from typing import List, Optional, Tuple, Union
from models.schemas import (
    MaintenanceTask,
    TrainSchedule,
    AvailableBlock,
    ScheduledBlock,
    UnscheduledTask,
    ScheduleMetrics,
    ScheduleResult,
    DecisionStep,
)
from services.greedy_scheduler import (
    time_to_minutes,
    fits_in_window,
    find_train_conflict,
    is_overlapping,
)
from services.sorting import merge_sort


def run_fcfs_scheduler(
    tasks: List[MaintenanceTask],
    train_schedule: List[TrainSchedule],
    available_blocks: List[AvailableBlock],
    return_steps: bool = False,
) -> Union[ScheduleResult, Tuple[ScheduleResult, List[DecisionStep]]]:
    """
    Executes FCFS Scheduling:
    - Prioritizes service request submission/arrival order.
    - Assigns to the earliest feasible compatible active block or opens earliest clear corridor.
    """
    active_blocks = []
    used_block_ids = set()
    unscheduled: List[UnscheduledTask] = []
    decision_steps: List[DecisionStep] = []

    # Sort available block corridors chronologically so that we always allocate
    # the earliest feasible window if a new block is needed.
    sorted_available_corridors = sorted(
        available_blocks,
        key=lambda b: time_to_minutes(b.start_time),
    )

    # Sort tasks by arrival_time if present, preserving FIFO queue submission order
    ordered_tasks = merge_sort(
        tasks,
        key_fn=lambda t: time_to_minutes(t.arrival_time) if t.arrival_time else 0,
    )

    # Process tasks in arrival order (DSA: First Come First Served)
    for idx, task in enumerate(ordered_tasks):
        task_start_min = time_to_minutes(task.earliest_start)
        task_dur_min = int(task.duration * 60)
        assigned = False
        arrival_label = f"Req Time: {task.arrival_time or f'Pos #{idx+1}'}"

        # 1. Search existing active blocks for earliest compatible block
        compatible_active_blocks = []
        for block in active_blocks:
            if (
                block["section"] == task.section
                and block["track"] == task.track
                and block["date"] == task.date
            ):
                if fits_in_window(task_start_min, task_dur_min, block["start_min"], block["end_min"]):
                    compatible_active_blocks.append(block)

        if compatible_active_blocks:
            # Pick the earliest active block
            compatible_active_blocks.sort(key=lambda b: b["start_min"])
            chosen_block = compatible_active_blocks[0]
            chosen_block["tasks"].append(task)
            if task.department not in chosen_block["departments"]:
                chosen_block["departments"].append(task.department)
            # Simultaneous execution: block duration is max of task durations
            chosen_block["block_duration"] = max(chosen_block["block_duration"], task.duration)
            assigned = True

            decision_steps.append(
                DecisionStep(
                    step_number=idx + 1,
                    entity_id=task.task_id,
                    key_attribute=arrival_label,
                    action="ASSIGNED_TO_BLOCK",
                    block_id=chosen_block["block_id"],
                    state_detail=f"Duration: {task.duration}h (Max simultaneous: {chosen_block['block_duration']}h)",
                    rationale=f"Clubbed into earliest active compatible block {chosen_block['block_id']} on {task.track}",
                )
            )

        # 2. If not assigned to existing block, find earliest available corridor
        if not assigned:
            candidate_train_conflict: Optional[Tuple[AvailableBlock, TrainSchedule]] = None
            found_available_window = False

            for avail in sorted_available_corridors:
                if avail.block_id in used_block_ids:
                    continue

                if avail.section == task.section and avail.track == task.track and avail.date == task.date:
                    avail_start_min = time_to_minutes(avail.start_time)
                    avail_end_min = time_to_minutes(avail.end_time)

                    if fits_in_window(task_start_min, task_dur_min, avail_start_min, avail_end_min):
                        found_available_window = True

                        # Hard constraint: Cannot open overlapping block on the same physical track
                        track_possession_conflict = any(
                            b["track"] == avail.track
                            and b["date"] == avail.date
                            and is_overlapping(avail_start_min, avail_end_min, b["start_min"], b["end_min"])
                            for b in active_blocks
                        )
                        if track_possession_conflict:
                            continue

                        conflict_train = find_train_conflict(
                            section=avail.section,
                            track=avail.track,
                            date=avail.date,
                            block_start_min=avail_start_min,
                            block_end_min=avail_end_min,
                            train_schedule=train_schedule,
                        )

                        if conflict_train:
                            if not candidate_train_conflict:
                                candidate_train_conflict = (avail, conflict_train)
                            continue

                        # Window is clear! Open new active block
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

                        decision_steps.append(
                            DecisionStep(
                                step_number=idx + 1,
                                entity_id=task.task_id,
                                key_attribute=arrival_label,
                                action="CREATED_NEW_BLOCK",
                                block_id=avail.block_id,
                                state_detail=f"Window: {avail.start_time}-{avail.end_time} ({round(window_capacity, 1)}h)",
                                rationale=f"Opened first feasible unconflicted corridor {avail.block_id} on {task.track}",
                            )
                        )
                        break

            # 3. Unscheduled diagnostics
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

                decision_steps.append(
                    DecisionStep(
                        step_number=idx + 1,
                        entity_id=task.task_id,
                        key_attribute=arrival_label,
                        action="REJECTED",
                        block_id=None,
                        state_detail="Infeasible",
                        rationale=reason,
                    )
                )

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

    # Sort blocks chronologically for display
    scheduled_blocks.sort(key=lambda b: time_to_minutes(b.start_time))

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

    res = ScheduleResult(
        blocks=scheduled_blocks,
        unscheduled=unscheduled,
        metrics=metrics,
    )

    if return_steps:
        return res, decision_steps
    return res
