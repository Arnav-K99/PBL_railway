"""
Dynamic Programming (Weighted Interval Scheduling) Maintenance Block Scheduler
=============================================================================
This module implements the Dynamic Programming scheduling approach for railway
maintenance block planning based on Weighted Interval Scheduling (WIS).

DSA Concepts:
1. Candidate Block Generation:
   Evaluates authorized available block corridors against track, date, and hard
   train non-conflict constraints. Multi-department tasks fitting the window are
   clubbed together with simultaneous execution duration = max(task durations).
2. Sorting by Finish Time:
   Candidate block intervals are sorted by their finish times: O(M log M).
3. Predecessor Calculation:
   p(i) computes the latest compatible candidate interval that finishes before
   candidate interval i starts.
4. Bellman Recurrence Relation:
   DP[0] = 0
   DP[i] = max(DP[i - 1], W(i) + DP[p(i)])
5. Backtracking Reconstruction:
   Reconstructs the optimal subset of candidate maintenance blocks.
6. Task Uniqueness Enforcement:
   Enforces the Set Packing constraint (no physical task assigned more than once)
   and explicitly documents the limitation of 1D WIS when candidate intervals share tasks.
"""

from typing import List, Dict, Optional, Tuple, Any, Union
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
)
from services.sorting import merge_sort


class CandidateBlock:
    """Represents a feasible candidate maintenance block corridor with clubbed tasks."""

    def __init__(
        self,
        block_id: str,
        section: str,
        track: str,
        date: str,
        start_time: str,
        end_time: str,
        start_min: int,
        end_min: int,
        tasks: List[MaintenanceTask],
    ):
        self.block_id = block_id
        self.section = section
        self.track = track
        self.date = date
        self.start_time = start_time
        self.end_time = end_time
        self.start_min = start_min
        self.end_min = end_min
        self.tasks = tasks
        self.departments = list(dict.fromkeys(t.department for t in tasks))
        self.block_duration = max((t.duration for t in tasks), default=0.0)
        self.window_capacity_hours = round((end_min - start_min) / 60.0, 2)
        self.utilization_percentage = (
            round((self.block_duration / self.window_capacity_hours) * 100, 1)
            if self.window_capacity_hours > 0
            else 0.0
        )
        self.weight = self._calculate_weight()

    def _calculate_weight(self) -> float:
        """
        Documented Lexicographic Objective Function W(i):
        - Primary: Maximize unique scheduled tasks (+10,000 pts / task)
        - Secondary: Cross-department clubbing bonus (+500 pts / additional dept)
        - Tertiary: Minimize block count penalty (-100 pts per block opened)
        - Quaternary: Window utilization / duration tiebreaker (+10 pts * duration)
        Hard constraints (train safety, track compatibility) are evaluated
        separately before candidate inclusion.
        """
        if not self.tasks:
            return 0.0

        task_count = len(self.tasks)
        dept_count = len(self.departments)
        clubbing_bonus = max(0, dept_count - 1) * 500.0
        block_penalty = -100.0
        duration_tiebreaker = self.block_duration * 10.0

        return float(task_count * 10000.0 + clubbing_bonus + block_penalty + duration_tiebreaker)


def compute_predecessors(candidates: List[CandidateBlock]) -> List[int]:
    """
    Computes p(i) for each 1-indexed candidate in candidates (sorted by end_min).
    p(i) is the largest index j (1 <= j < i) such that candidate j is compatible with i:
    - On the SAME track: candidates must not overlap in time (end_min_j <= start_min_i).
    - On DIFFERENT tracks: independent physical track possessions do not conflict in time.
    - Task Uniqueness: candidate j and candidate i must NOT share any maintenance tasks.
    Returns a list of length len(candidates) + 1 where index 0 is 0.
    """
    n = len(candidates)
    p = [0] * (n + 1)

    for i in range(1, n + 1):
        cand_i = candidates[i - 1]
        tasks_i = {t.task_id for t in cand_i.tasks}
        # Search backwards for the latest compatible candidate
        for j in range(i - 1, 0, -1):
            cand_j = candidates[j - 1]
            tasks_j = {t.task_id for t in cand_j.tasks}
            is_time_compat = (cand_j.track != cand_i.track) or (cand_j.end_min <= cand_i.start_min)
            is_tasks_disjoint = tasks_i.isdisjoint(tasks_j)

            if is_time_compat and is_tasks_disjoint:
                p[i] = j
                break

    return p


def run_dp_weighted_interval_scheduling(
    candidates: List[CandidateBlock],
) -> Tuple[List[CandidateBlock], List[float], List[int], List[bool]]:
    """
    Executes Weighted Interval Scheduling Dynamic Programming:
    1. Sorts candidate intervals by finish time end_min.
    2. Computes predecessor array p(i).
    3. Computes DP table DP[i] = max(DP[i - 1], W(i) + DP[p(i)]).
    4. Backtracks to reconstruct the optimal selected set of candidate blocks.
    """
    if not candidates:
        return [], [0.0], [0], [False]

    # Step 1: Sort candidate intervals by finish time (DSA: O(M log M))
    sorted_candidates = merge_sort(candidates, key_fn=lambda c: c.end_min)

    # Step 2: Compute predecessors p(i) (1-indexed)
    p = compute_predecessors(sorted_candidates)

    n = len(sorted_candidates)
    dp = [0.0] * (n + 1)
    take = [False] * (n + 1)

    # Step 3: Bellman Recurrence Relation
    # DP[i] = max(DP[i - 1], W(i) + DP[p(i)])
    for i in range(1, n + 1):
        weight_i = sorted_candidates[i - 1].weight
        include_val = weight_i + dp[p[i]]
        exclude_val = dp[i - 1]

        if include_val > exclude_val:
            dp[i] = include_val
            take[i] = True
        else:
            dp[i] = exclude_val
            take[i] = False

    # Step 4: Backtracking Reconstruction
    selected_indices = []
    curr = n
    while curr > 0:
        if take[curr]:
            selected_indices.append(curr - 1)
            curr = p[curr]
        else:
            curr = curr - 1

    selected_indices.reverse()
    selected_blocks = [sorted_candidates[idx] for idx in selected_indices]

    return selected_blocks, dp, p, take


def run_dp_scheduler(
    tasks: List[MaintenanceTask],
    train_schedule: List[TrainSchedule],
    available_blocks: List[AvailableBlock],
    return_steps: bool = False,
) -> Union[ScheduleResult, Tuple[ScheduleResult, List[DecisionStep]]]:
    """
    Dynamic Programming Maintenance Block Scheduler with Railway Domain Constraints:
    1. Generates feasible candidate blocks from available corridors.
    2. Enforces hard safety constraints (no train conflicts on corridor window).
    3. Clubs all fitting tasks into each candidate block.
    4. Runs Weighted Interval Scheduling (DP[i] = max(DP[i-1], W(i) + DP[p(i)])).
    5. Backtracks to reconstruct the schedule.
    6. Enforces task uniqueness: prevents any task from appearing in multiple selected blocks.
    7. Retains explicit diagnostic rejection reasons for unscheduled tasks.
    """
    # Group available blocks and evaluate train safety (Hard Constraint)
    feasible_candidates: List[CandidateBlock] = []
    window_train_conflicts: Dict[str, Tuple[AvailableBlock, TrainSchedule]] = {}
    decision_steps: List[DecisionStep] = []

    for avail in available_blocks:
        avail_start_min = time_to_minutes(avail.start_time)
        avail_end_min = time_to_minutes(avail.end_time)

        conflict_train = find_train_conflict(
            section=avail.section,
            track=avail.track,
            date=avail.date,
            block_start_min=avail_start_min,
            block_end_min=avail_end_min,
            train_schedule=train_schedule,
        )

        if conflict_train:
            # Corridor window is infeasible due to train conflict!
            window_train_conflicts[avail.block_id] = (avail, conflict_train)
            continue

        # Find all maintenance tasks that fit into this clear window
        fitting_tasks: List[MaintenanceTask] = []
        for t in tasks:
            if t.section == avail.section and t.track == avail.track and t.date == avail.date:
                t_start = time_to_minutes(t.earliest_start)
                t_dur = int(t.duration * 60)
                if fits_in_window(t_start, t_dur, avail_start_min, avail_end_min):
                    fitting_tasks.append(t)

        if fitting_tasks:
            cand = CandidateBlock(
                block_id=avail.block_id,
                section=avail.section,
                track=avail.track,
                date=avail.date,
                start_time=avail.start_time,
                end_time=avail.end_time,
                start_min=avail_start_min,
                end_min=avail_end_min,
                tasks=fitting_tasks,
            )
            feasible_candidates.append(cand)

    # Sort feasible candidates by finish time for DP processing
    sorted_candidates = merge_sort(feasible_candidates, key_fn=lambda c: c.end_min)

    # Execute Weighted Interval Scheduling DP
    selected_candidates, dp_table, p_array, take_array = run_dp_weighted_interval_scheduling(
        sorted_candidates
    )

    # Generate Decision Steps for Candidate Intervals and Recurrence
    step_num = 1
    for i in range(1, len(sorted_candidates) + 1):
        cand = sorted_candidates[i - 1]
        pred_idx = p_array[i]
        pred_desc = f"p({i}) = {sorted_candidates[pred_idx - 1].block_id}" if pred_idx > 0 else f"p({i}) = None (0)"
        weight_val = cand.weight
        is_taken = take_array[i]

        decision_steps.append(
            DecisionStep(
                step_number=step_num,
                entity_id=cand.block_id,
                key_attribute=f"Interval: {cand.start_time}-{cand.end_time} ({cand.track})",
                action="DP_RECURRENCE_EVAL",
                block_id=cand.block_id,
                state_detail=f"DP[{i}]={dp_table[i]:,.0f} | {pred_desc}",
                rationale=(
                    f"W(i)={weight_val:,.0f} ({len(cand.tasks)} tasks, {len(cand.departments)} depts). "
                    f"Include: W(i)+DP[p(i)]={weight_val + dp_table[pred_idx]:,.0f} vs Exclude: DP[{i-1}]={dp_table[i-1]:,.0f} -> "
                    f"{'ACCEPTED' if is_taken else 'REJECTED'}"
                ),
            )
        )
        step_num += 1

    # Enforce Task Uniqueness (Set Packing constraint)
    # A maintenance task must not be assigned to multiple selected blocks.
    scheduled_task_ids = set()
    final_scheduled_blocks: List[ScheduledBlock] = []

    for cand in selected_candidates:
        unique_tasks = []
        for t in cand.tasks:
            if t.task_id not in scheduled_task_ids:
                unique_tasks.append(t)
                scheduled_task_ids.add(t.task_id)

        if unique_tasks:
            cand_departments = list(dict.fromkeys(t.department for t in unique_tasks))
            cand_duration = max((t.duration for t in unique_tasks), default=0.0)
            cand_capacity = cand.window_capacity_hours
            cand_utilization = (
                round((cand_duration / cand_capacity) * 100, 1)
                if cand_capacity > 0
                else 0.0
            )

            final_scheduled_blocks.append(
                ScheduledBlock(
                    block_id=cand.block_id,
                    section=cand.section,
                    track=cand.track,
                    date=cand.date,
                    start_time=cand.start_time,
                    end_time=cand.end_time,
                    departments=cand_departments,
                    tasks=unique_tasks,
                    block_duration=round(cand_duration, 2),
                    window_capacity_hours=cand_capacity,
                    utilization_percentage=cand_utilization,
                    status="Scheduled",
                )
            )

            decision_steps.append(
                DecisionStep(
                    step_number=step_num,
                    entity_id=cand.block_id,
                    key_attribute="Backtracking Reconstruction",
                    action="OPTIMAL_BLOCK_SELECTED",
                    block_id=cand.block_id,
                    state_detail=f"Capacity: {cand_capacity}h | Active: {cand_duration}h",
                    rationale=(
                        f"Optimal DP schedule backtracked: Corridor {cand.block_id} committed with "
                        f"{len(unique_tasks)} clubbed tasks across {len(cand_departments)} departments"
                    ),
                )
            )
            step_num += 1

    # Sort final scheduled blocks chronologically
    final_scheduled_blocks.sort(key=lambda b: time_to_minutes(b.start_time))

    # Diagnose Unscheduled Tasks
    unscheduled: List[UnscheduledTask] = []
    for task in tasks:
        if task.task_id in scheduled_task_ids:
            continue

        task_start = time_to_minutes(task.earliest_start)
        task_dur = int(task.duration * 60)

        # Check why it was not scheduled
        train_conflict_reason = None
        has_matching_window = False

        for avail in available_blocks:
            if avail.section == task.section and avail.track == task.track and avail.date == task.date:
                a_start = time_to_minutes(avail.start_time)
                a_end = time_to_minutes(avail.end_time)
                if fits_in_window(task_start, task_dur, a_start, a_end):
                    has_matching_window = True
                    if avail.block_id in window_train_conflicts:
                        _, train = window_train_conflicts[avail.block_id]
                        train_conflict_reason = (
                            f"Train conflict on {task.track}: {train.train_name} ({train.train_id}) operates on {task.track} "
                            f"({train.arrival_time} - {train.departure_time}) during available window {avail.block_id} "
                            f"({avail.start_time} - {avail.end_time})"
                        )
                        break

        if train_conflict_reason:
            reason = train_conflict_reason
        elif has_matching_window:
            reason = f"All matching block windows on {task.track} have operational train conflicts"
        else:
            reason = (
                f"No available block window found on {task.track} on {task.date} "
                f"fitting time {task.earliest_start} - {task.latest_end}"
            )

        unscheduled.append(UnscheduledTask(task=task, reason=reason))

        decision_steps.append(
            DecisionStep(
                step_number=step_num,
                entity_id=task.task_id,
                key_attribute=f"Start: {task.earliest_start}",
                action="REJECTED",
                block_id=None,
                state_detail="Infeasible / Conflicted",
                rationale=reason,
            )
        )
        step_num += 1

    # Compute operational metrics
    total_tasks = len(tasks)
    total_scheduled = sum(len(b.tasks) for b in final_scheduled_blocks)
    total_unscheduled = len(unscheduled)
    total_avail = len(available_blocks)
    blocks_used = len(final_scheduled_blocks)

    dept_consolidation = (
        round(sum(len(b.departments) for b in final_scheduled_blocks) / blocks_used, 2)
        if blocks_used > 0
        else 0.0
    )
    avg_utilization = (
        round(
            sum(b.utilization_percentage for b in final_scheduled_blocks) / blocks_used, 1
        )
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
        blocks=final_scheduled_blocks,
        unscheduled=unscheduled,
        metrics=metrics,
    )

    if return_steps:
        return res, decision_steps
    return res
