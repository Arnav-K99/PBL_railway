"""
Algorithm Comparison Service
============================
Orchestrates empirical comparison among FCFS, Greedy, and Dynamic Programming
(Weighted Interval Scheduling) on an identical snapshot of operational railway data.

Maintains strict isolation: does not mutate source datasets or the active schedule.
Computes the 5 core PBL comparison metrics:
1. Tasks Scheduled
2. Tasks Unscheduled (with explicit constraint breakdown)
3. Blocks Generated
4. Block Utilization (%) using consistent network-wide and active-corridor formulas
5. Clubbing (Clubbed Tasks and Cross-Department Blocks)
"""

import time
from datetime import datetime
from typing import List, Dict, Any, Tuple
from models.schemas import (
    MaintenanceTask,
    TrainSchedule,
    AvailableBlock,
    ScheduledBlock,
    UnscheduledTask,
    ScheduleResult,
    ComparisonMetricItem,
    AlgorithmComparisonMetrics,
    AlgorithmExecutionResult,
    AlgorithmComparisonResponse,
    DecisionStep,
)
from services.greedy_scheduler import time_to_minutes, is_overlapping
from services.fcfs_scheduler import run_fcfs_scheduler
from services.greedy_scheduler import run_greedy_scheduler
from services.dp_scheduler import run_dp_scheduler


def get_showcase_scenario():
    """
    Controlled PBL Benchmark Scenario (Part 7):
    - Railway section: A-B (Track 1)
    - Total available maintenance window: 07:45 - 12:15 (270 minutes)
    - 7 feasible candidate blocks (A to G)
    - Exactly 10 unique maintenance tasks across Engineering, S&T, and Traction
    - Candidate submission order: B -> C -> A -> D -> E -> F -> G
    """
    op_date = "2026-09-20"

    candidates = [
        {
            "id": "BLK-A",
            "name": "Candidate A",
            "start": "07:45",
            "end": "12:15",
            "dur_min": 270,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-01",
                    department="Engineering",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="07:45",
                    latest_end="12:15",
                    duration=4.5,
                    arrival_time="06:10",
                    description="CWR Stress Relief & Track Realignment",
                ),
                MaintenanceTask(
                    task_id="TASK-02",
                    department="Signal & Telecom",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="07:45",
                    latest_end="12:15",
                    duration=4.5,
                    arrival_time="06:10",
                    description="Main Track Circuit Integrated Calibration",
                ),
            ],
        },
        {
            "id": "BLK-B",
            "name": "Candidate B",
            "start": "08:30",
            "end": "09:45",
            "dur_min": 75,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-03",
                    department="Engineering",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="08:30",
                    latest_end="09:45",
                    duration=1.25,
                    arrival_time="06:00",
                    description="Ultrasonic Rail Flaw Detection",
                ),
            ],
        },
        {
            "id": "BLK-C",
            "name": "Candidate C",
            "start": "10:00",
            "end": "11:30",
            "dur_min": 90,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-04",
                    department="Signal & Telecom",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="10:00",
                    latest_end="11:30",
                    duration=1.5,
                    arrival_time="06:05",
                    description="Digital Axle Counter Diagnostic Overhaul",
                ),
            ],
        },
        {
            "id": "BLK-D",
            "name": "Candidate D",
            "start": "08:00",
            "end": "08:45",
            "dur_min": 45,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-05",
                    department="Engineering",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="08:00",
                    latest_end="08:45",
                    duration=0.75,
                    arrival_time="06:15",
                    description="Switch Diamond Crossing Tamp",
                ),
                MaintenanceTask(
                    task_id="TASK-06",
                    department="Signal & Telecom",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="08:00",
                    latest_end="08:45",
                    duration=0.75,
                    arrival_time="06:15",
                    description="Point Motor Interlock Test",
                ),
                MaintenanceTask(
                    task_id="TASK-07",
                    department="Traction",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="08:00",
                    latest_end="08:45",
                    duration=0.75,
                    arrival_time="06:15",
                    description="OHE Section Insulator Inspection",
                ),
            ],
        },
        {
            "id": "BLK-E",
            "name": "Candidate E",
            "start": "09:00",
            "end": "09:45",
            "dur_min": 45,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-08",
                    department="Traction",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="09:00",
                    latest_end="09:45",
                    duration=0.75,
                    arrival_time="06:20",
                    description="Catenary Dropper Re-clamping",
                ),
            ],
        },
        {
            "id": "BLK-F",
            "name": "Candidate F",
            "start": "10:00",
            "end": "10:45",
            "dur_min": 45,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-09",
                    department="Engineering",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="10:00",
                    latest_end="10:45",
                    duration=0.75,
                    arrival_time="06:25",
                    description="Track Fastener Torque Tightening",
                ),
            ],
        },
        {
            "id": "BLK-G",
            "name": "Candidate G",
            "start": "11:00",
            "end": "11:45",
            "dur_min": 45,
            "tasks": [
                MaintenanceTask(
                    task_id="TASK-10",
                    department="Signal & Telecom",
                    section="A-B",
                    track="Track 1",
                    date=op_date,
                    earliest_start="11:00",
                    latest_end="11:45",
                    duration=0.75,
                    arrival_time="06:30",
                    description="Audio Frequency Track Circuit Tune",
                ),
            ],
        },
    ]

    all_tasks = [t for c in candidates for t in c["tasks"]]
    window_corridor = [
        AvailableBlock(
            block_id="BLK-WIN-AB",
            section="A-B",
            track="Track 1",
            date=op_date,
            start_time="07:45",
            end_time="12:15",
        )
    ]
    return candidates, all_tasks, window_corridor


def run_showcase_comparison() -> AlgorithmComparisonResponse:
    """
    Executes real deterministic algorithmic comparison on the Part 7 Showcase Scenario:
    Section A-B, 270 minutes available.
    - FCFS: selects B, C (2 scheduled, 8 unscheduled, 2 blocks, 61.1% util, 0 clubbed, 0 cross-dept)
    - Greedy: selects A (2 scheduled, 8 unscheduled, 1 block, 100% util, 2 clubbed, 1 cross-dept)
    - DP: selects D, E, F, G (6 scheduled, 4 unscheduled, 4 blocks, 66.7% util, 3 clubbed, 1 cross-dept)
    """
    candidates, all_tasks, window_corridor = get_showcase_scenario()
    cand_by_id = {c["id"]: c for c in candidates}
    total_window_min = 270.0  # 07:45 to 12:15
    total_window_hours = 4.5
    op_date = "2026-09-20"
    all_task_ids = [t.task_id for t in all_tasks]

    # --- 1. REAL FCFS EXECUTION ---
    # Submission arrival order: B -> C -> A -> D -> E -> F -> G
    t0_fcfs = time.perf_counter()
    fcfs_order = ["BLK-B", "BLK-C", "BLK-A", "BLK-D", "BLK-E", "BLK-F", "BLK-G"]
    selected_fcfs_ids = []
    fcfs_steps = []

    for idx, cid in enumerate(fcfs_order):
        c = cand_by_id[cid]
        s_m = time_to_minutes(c["start"])
        e_m = time_to_minutes(c["end"])
        conflicting_blocks = [
            sel_id
            for sel_id in selected_fcfs_ids
            if is_overlapping(
                s_m,
                e_m,
                time_to_minutes(cand_by_id[sel_id]["start"]),
                time_to_minutes(cand_by_id[sel_id]["end"]),
            )
        ]
        if not conflicting_blocks:
            selected_fcfs_ids.append(cid)
            fcfs_steps.append(
                DecisionStep(
                    step_number=idx + 1,
                    entity_id=cid,
                    key_attribute=f"Arrival Pos #{idx+1} ({c['start']}–{c['end']})",
                    action="CANDIDATE_SELECTED",
                    block_id=cid,
                    state_detail=f"Duration: {c['dur_min']}m | {len(c['tasks'])} task(s)",
                    rationale=f"Selected in arrival order without conflict. Committed to section A-B ({c['start']}–{c['end']}).",
                )
            )
        else:
            conflict_str = ", ".join(conflicting_blocks)
            fcfs_steps.append(
                DecisionStep(
                    step_number=idx + 1,
                    entity_id=cid,
                    key_attribute=f"Arrival Pos #{idx+1} ({c['start']}–{c['end']})",
                    action="OVERLAP_REJECTED",
                    block_id=cid,
                    state_detail=f"Conflicts with: {conflict_str}",
                    rationale=f"Rejected due to physical track possession overlap with earlier accepted block(s) {conflict_str}.",
                )
            )

    t_fcfs_ms = round((time.perf_counter() - t0_fcfs) * 1000, 3)

    fcfs_blocks = [
        ScheduledBlock(
            block_id=cid,
            section="A-B",
            track="Track 1",
            date=op_date,
            start_time=cand_by_id[cid]["start"],
            end_time=cand_by_id[cid]["end"],
            departments=list(dict.fromkeys(t.department for t in cand_by_id[cid]["tasks"])),
            tasks=cand_by_id[cid]["tasks"],
            block_duration=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            window_capacity_hours=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            utilization_percentage=100.0,
            status="Scheduled",
        )
        for cid in selected_fcfs_ids
    ]
    fcfs_sched_task_ids = {t.task_id for b in fcfs_blocks for t in b.tasks}
    fcfs_unscheduled = [
        UnscheduledTask(
            task=t,
            reason="Dropped: Candidate block rejected due to FCFS track occupancy overlap on section A-B",
        )
        for t in all_tasks
        if t.task_id not in fcfs_sched_task_ids
    ]
    fcfs_occ_min = sum(cand_by_id[cid]["dur_min"] for cid in selected_fcfs_ids)
    fcfs_util_pct = round((fcfs_occ_min / total_window_min) * 100, 1)
    fcfs_clubbed_tasks = sum(len(b.tasks) for b in fcfs_blocks if len(b.tasks) > 1)
    fcfs_cross_dept = sum(1 for b in fcfs_blocks if len(b.departments) >= 2)

    fcfs_metrics = AlgorithmComparisonMetrics(
        tasks_scheduled=len(fcfs_sched_task_ids),
        tasks_unscheduled=len(fcfs_unscheduled),
        blocks_generated=len(fcfs_blocks),
        block_utilization_pct=fcfs_util_pct,
        active_block_utilization_pct=fcfs_util_pct,
        total_occupied_duration=round(fcfs_occ_min / 60.0, 2),
        total_available_duration=total_window_hours,
        clubbed_tasks=fcfs_clubbed_tasks,
        cross_department_blocks=fcfs_cross_dept,
        department_consolidation=round(
            sum(len(b.departments) for b in fcfs_blocks) / len(fcfs_blocks), 2
        )
        if fcfs_blocks
        else 0.0,
    )

    # --- 2. REAL GREEDY EXECUTION ---
    # Sort candidates by earliest start time: A (07:45), D (08:00), B (08:30), E (09:00), C (10:00), F (10:00), G (11:00)
    t0_greedy = time.perf_counter()
    greedy_cands = sorted(candidates, key=lambda c: time_to_minutes(c["start"]))
    selected_greedy_ids = []
    greedy_steps = []

    for idx, c in enumerate(greedy_cands):
        cid = c["id"]
        s_m = time_to_minutes(c["start"])
        e_m = time_to_minutes(c["end"])
        conflicting_blocks = [
            sel_id
            for sel_id in selected_greedy_ids
            if is_overlapping(
                s_m,
                e_m,
                time_to_minutes(cand_by_id[sel_id]["start"]),
                time_to_minutes(cand_by_id[sel_id]["end"]),
            )
        ]
        if not conflicting_blocks:
            selected_greedy_ids.append(cid)
            greedy_steps.append(
                DecisionStep(
                    step_number=idx + 1,
                    entity_id=cid,
                    key_attribute=f"Earliest Start: {c['start']} (Pos #{idx+1})",
                    action="CANDIDATE_SELECTED",
                    block_id=cid,
                    state_detail=f"Duration: {c['dur_min']}m | {len(c['tasks'])} task(s)",
                    rationale=f"Candidate starts earliest ({c['start']}). Greedily committed to section A-B ({c['start']}–{c['end']}).",
                )
            )
        else:
            conflict_str = ", ".join(conflicting_blocks)
            greedy_steps.append(
                DecisionStep(
                    step_number=idx + 1,
                    entity_id=cid,
                    key_attribute=f"Start: {c['start']} (Pos #{idx+1})",
                    action="OVERLAP_REJECTED",
                    block_id=cid,
                    state_detail=f"Conflicts with: {conflict_str}",
                    rationale=f"Rejected: Earliest-start assignment {conflict_str} already occupies section A-B during {c['start']}–{c['end']}.",
                )
            )

    t_greedy_ms = round((time.perf_counter() - t0_greedy) * 1000, 3)

    greedy_blocks = [
        ScheduledBlock(
            block_id=cid,
            section="A-B",
            track="Track 1",
            date=op_date,
            start_time=cand_by_id[cid]["start"],
            end_time=cand_by_id[cid]["end"],
            departments=list(dict.fromkeys(t.department for t in cand_by_id[cid]["tasks"])),
            tasks=cand_by_id[cid]["tasks"],
            block_duration=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            window_capacity_hours=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            utilization_percentage=100.0,
            status="Scheduled",
        )
        for cid in selected_greedy_ids
    ]
    greedy_sched_task_ids = {t.task_id for b in greedy_blocks for t in b.tasks}
    greedy_unscheduled = [
        UnscheduledTask(
            task=t,
            reason="Dropped: Overlapped by greedy earliest-start block BLK-A on section A-B",
        )
        for t in all_tasks
        if t.task_id not in greedy_sched_task_ids
    ]
    greedy_occ_min = sum(cand_by_id[cid]["dur_min"] for cid in selected_greedy_ids)
    greedy_util_pct = round((greedy_occ_min / total_window_min) * 100, 1)
    greedy_clubbed_tasks = sum(len(b.tasks) for b in greedy_blocks if len(b.tasks) > 1)
    greedy_cross_dept = sum(1 for b in greedy_blocks if len(b.departments) >= 2)

    greedy_metrics = AlgorithmComparisonMetrics(
        tasks_scheduled=len(greedy_sched_task_ids),
        tasks_unscheduled=len(greedy_unscheduled),
        blocks_generated=len(greedy_blocks),
        block_utilization_pct=greedy_util_pct,
        active_block_utilization_pct=greedy_util_pct,
        total_occupied_duration=round(greedy_occ_min / 60.0, 2),
        total_available_duration=total_window_hours,
        clubbed_tasks=greedy_clubbed_tasks,
        cross_department_blocks=greedy_cross_dept,
        department_consolidation=round(
            sum(len(b.departments) for b in greedy_blocks) / len(greedy_blocks), 2
        )
        if greedy_blocks
        else 0.0,
    )

    # --- 3. REAL DYNAMIC PROGRAMMING (WEIGHTED INTERVAL SCHEDULING) ---
    # Sort candidates by finish time: D (08:45), B (09:45), E (09:45), F (10:45), C (11:30), G (11:45), A (12:15)
    t0_dp = time.perf_counter()
    dp_cands = sorted(candidates, key=lambda c: time_to_minutes(c["end"]))
    n = len(dp_cands)

    # Calculate predecessor array p(i)
    p = [0] * (n + 1)
    for i in range(1, n + 1):
        s_i = time_to_minutes(dp_cands[i - 1]["start"])
        for j in range(i - 1, 0, -1):
            e_j = time_to_minutes(dp_cands[j - 1]["end"])
            if e_j <= s_i:  # Half-open interval [start, end)
                p[i] = j
                break

    # Bellman Recurrence: DP[i] = max(DP[i-1], weight[i] + DP[p(i)])
    # Weight equals count of unique maintenance tasks
    dp_table = [0] * (n + 1)
    take = [False] * (n + 1)
    dp_steps = []

    for i in range(1, n + 1):
        c = dp_cands[i - 1]
        w_i = len(c["tasks"])
        incl = w_i + dp_table[p[i]]
        excl = dp_table[i - 1]

        pred_name = dp_cands[p[i] - 1]["id"] if p[i] > 0 else "None (0)"
        if incl > excl:
            dp_table[i] = incl
            take[i] = True
            action_desc = "DP_INCLUDE"
            rat = f"W(i)={w_i} tasks. Include branch W(i)+DP[{p[i]}] = {incl} > Exclude branch DP[{i-1}] = {excl} -> ACCEPTED into subproblem"
        else:
            dp_table[i] = excl
            action_desc = "DP_EXCLUDE"
            rat = f"W(i)={w_i} task(s). Include branch W(i)+DP[{p[i]}] = {incl} <= Exclude branch DP[{i-1}] = {excl} -> EXCLUDED from subproblem"

        dp_steps.append(
            DecisionStep(
                step_number=i,
                entity_id=c["id"],
                key_attribute=f"Finish: {c['end']} | p({i})={pred_name}",
                action=action_desc,
                block_id=c["id"],
                state_detail=f"DP[{i}]={dp_table[i]} (Weight={w_i})",
                rationale=rat,
            )
        )

    # Backtracking reconstruction
    curr = n
    selected_dp_ids = []
    backtrack_steps = []
    step_ctr = n + 1

    while curr > 0:
        c = dp_cands[curr - 1]
        w_curr = len(c["tasks"])
        if take[curr] and w_curr + dp_table[p[curr]] == dp_table[curr]:
            selected_dp_ids.append(c["id"])
            next_idx = p[curr]
            next_name = dp_cands[next_idx - 1]["id"] if next_idx > 0 else "Base 0"
            backtrack_steps.append(
                DecisionStep(
                    step_number=step_ctr,
                    entity_id=c["id"],
                    key_attribute="Backtracking Reconstruction",
                    action="OPTIMAL_BLOCK_SELECTED",
                    block_id=c["id"],
                    state_detail=f"Committed {c['id']} ({c['start']}–{c['end']}) -> Jump to p({curr})={next_name}",
                    rationale=f"Global optimum: Candidate {c['id']} contributes {w_curr} tasks. Jumps to compatible predecessor {next_name}.",
                )
            )
            step_ctr += 1
            curr = p[curr]
        else:
            curr -= 1

    selected_dp_ids.reverse()
    dp_steps.extend(backtrack_steps)
    t_dp_ms = round((time.perf_counter() - t0_dp) * 1000, 3)

    dp_blocks = [
        ScheduledBlock(
            block_id=cid,
            section="A-B",
            track="Track 1",
            date=op_date,
            start_time=cand_by_id[cid]["start"],
            end_time=cand_by_id[cid]["end"],
            departments=list(dict.fromkeys(t.department for t in cand_by_id[cid]["tasks"])),
            tasks=cand_by_id[cid]["tasks"],
            block_duration=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            window_capacity_hours=round(cand_by_id[cid]["dur_min"] / 60.0, 2),
            utilization_percentage=100.0,
            status="Scheduled",
        )
        for cid in selected_dp_ids
    ]
    dp_sched_task_ids = {t.task_id for b in dp_blocks for t in b.tasks}
    dp_unscheduled = [
        UnscheduledTask(
            task=t,
            reason="Unselected: Optimal WIS recurrence identified superior non-overlapping candidate combination (D + E + F + G)",
        )
        for t in all_tasks
        if t.task_id not in dp_sched_task_ids
    ]
    dp_occ_min = sum(cand_by_id[cid]["dur_min"] for cid in selected_dp_ids)
    dp_util_pct = round((dp_occ_min / total_window_min) * 100, 1)
    dp_clubbed_tasks = sum(len(b.tasks) for b in dp_blocks if len(b.tasks) > 1)
    dp_cross_dept = sum(1 for b in dp_blocks if len(b.departments) >= 2)

    dp_metrics = AlgorithmComparisonMetrics(
        tasks_scheduled=len(dp_sched_task_ids),
        tasks_unscheduled=len(dp_unscheduled),
        blocks_generated=len(dp_blocks),
        block_utilization_pct=dp_util_pct,
        active_block_utilization_pct=dp_util_pct,
        total_occupied_duration=round(dp_occ_min / 60.0, 2),
        total_available_duration=total_window_hours,
        clubbed_tasks=dp_clubbed_tasks,
        cross_department_blocks=dp_cross_dept,
        department_consolidation=round(
            sum(len(b.departments) for b in dp_blocks) / len(dp_blocks), 2
        )
        if dp_blocks
        else 0.0,
    )

    # Build standardized comparison table
    comparison_table = build_comparison_table(fcfs_metrics, greedy_metrics, dp_metrics)

    fcfs_exec = AlgorithmExecutionResult(
        algorithm_key="fcfs",
        algorithm_name="First Come First Served (FCFS)",
        algorithm_description="Processes candidate blocks strictly in submission arrival order (B -> C -> A -> D -> E -> F -> G). Selects B and C; rejects A, D, E, F, G due to track possession overlap.",
        blocks=fcfs_blocks,
        unscheduled=fcfs_unscheduled,
        metrics=fcfs_metrics,
        execution_time_ms=t_fcfs_ms,
        dsa_notes=[
            "Queue-based arrival processing: O(N * M)",
            "Evaluates candidates strictly in submission sequence: B -> C -> A -> D -> E -> F -> G",
            "Allocates earliest feasible non-conflicting candidates (B and C selected)",
        ],
        decision_steps=fcfs_steps,
    )

    greedy_exec = AlgorithmExecutionResult(
        algorithm_key="greedy",
        algorithm_name="Greedy Scheduling (Earliest Start Time)",
        algorithm_description="Sorts candidate blocks by earliest start time. Candidate A begins earliest (07:45); selecting A locks section A-B for 270 minutes and rejects all remaining candidates.",
        blocks=greedy_blocks,
        unscheduled=greedy_unscheduled,
        metrics=greedy_metrics,
        execution_time_ms=t_greedy_ms,
        dsa_notes=[
            "Sorts candidate blocks by earliest start time: O(M log M)",
            "Candidate A (07:45) is selected immediately due to local earliest-start heuristic",
            "Overlapping span (07:45-12:15) starves all other 6 candidate blocks",
        ],
        decision_steps=greedy_steps,
    )

    dp_exec = AlgorithmExecutionResult(
        algorithm_key="dp",
        algorithm_name="Dynamic Programming (Weighted Interval Scheduling)",
        algorithm_description="Sorts candidates by finish time, calculates predecessors p(i), and solves Bellman recurrence DP[i] = max(DP[i-1], W(i) + DP[p(i)]). Optimally selects combination D + E + F + G.",
        blocks=dp_blocks,
        unscheduled=dp_unscheduled,
        metrics=dp_metrics,
        execution_time_ms=t_dp_ms,
        dsa_notes=[
            "Sorts candidate intervals by finish time: O(M log M)",
            "Calculates predecessor p(i) via binary search / compatibility scan",
            "Solves recurrence: DP[i] = max(DP[i-1], W(i) + DP[p(i)])",
            "Backtracking discovers globally optimal combination D + E + F + G (6 unique tasks)",
        ],
        decision_steps=dp_steps,
    )

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    return AlgorithmComparisonResponse(
        scenario_id="showcase",
        scenario_name="Controlled PBL Benchmark Scenario (Section A–B)",
        operation_date=op_date,
        execution_timestamp=now_str,
        snapshot_timestamp=now_str,
        total_input_tasks=len(all_tasks),
        total_input_trains=0,
        total_available_corridors=1,
        comparison_table=comparison_table,
        fcfs=fcfs_exec,
        greedy=greedy_exec,
        dp=dp_exec,
    )


def get_contested_scenario() -> Tuple[List[MaintenanceTask], List[TrainSchedule], List[AvailableBlock]]:
    """
    Generates a Contested Multi-Corridor Stress Benchmark dataset.
    This scenario features:
    - Overlapping corridor windows on the same physical track.
    - Competing maintenance tasks where local earliest-start choices block optimal high-capacity clubbing.
    - Conflicted train movements testing negative safety constraints.
    - Mathematically demonstrates why DP achieves higher throughput and clubbing over Greedy and FCFS.
    """
    op_date = "2026-09-20"

    corridors = [
        # Track 1: Early narrow corridor vs high-capacity multi-department corridor (OVERLAPPING!)
        AvailableBlock(block_id="BLK-C101", section="Track 1", track="Track 1", date=op_date, start_time="08:00", end_time="10:00"),
        AvailableBlock(block_id="BLK-C102", section="Track 1", track="Track 1", date=op_date, start_time="09:30", end_time="13:30"),

        # Track 2: Narrow midday corridor vs afternoon clubbed corridor (OVERLAPPING!)
        AvailableBlock(block_id="BLK-C103", section="Track 2", track="Track 2", date=op_date, start_time="11:00", end_time="13:00"),
        AvailableBlock(block_id="BLK-C104", section="Track 2", track="Track 2", date=op_date, start_time="12:00", end_time="16:00"),

        # Track 3: Clear afternoon multi-department corridor
        AvailableBlock(block_id="BLK-C105", section="Track 3", track="Track 3", date=op_date, start_time="14:00", end_time="18:00"),

        # Track 3: Morning corridor with train conflict (Hard constraint test)
        AvailableBlock(block_id="BLK-C106", section="Track 3", track="Track 3", date=op_date, start_time="08:00", end_time="11:00"),
    ]

    trains = [
        TrainSchedule(
            train_id="TR-12301",
            train_name="Rajdhani Express",
            section="Track 3",
            track="Track 3",
            date=op_date,
            arrival_time="09:00",
            departure_time="09:45",
        ),
    ]

    tasks = [
        # Track 1 Tasks:
        # TS-01 starts earliest (08:00) with late arrival (07:10). Fits C101.
        MaintenanceTask(
            task_id="TS-01",
            department="Engineering",
            section="Track 1",
            track="Track 1",
            date=op_date,
            earliest_start="08:00",
            latest_end="09:30",
            duration=1.5,
            arrival_time="07:10",
            description="Emergency Rail Joint Weld",
        ),
        # TS-02, TS-03, TS-04: Multi-department group starting 09:30-10:00 with early arrivals (06:00-06:30). Fits C102!
        MaintenanceTask(
            task_id="TS-02",
            department="Engineering",
            section="Track 1",
            track="Track 1",
            date=op_date,
            earliest_start="09:30",
            latest_end="12:00",
            duration=2.0,
            arrival_time="06:00",
            description="Ballast Tamp & Track Align",
        ),
        MaintenanceTask(
            task_id="TS-03",
            department="Signal & Telecom",
            section="Track 1",
            track="Track 1",
            date=op_date,
            earliest_start="09:45",
            latest_end="12:30",
            duration=1.5,
            arrival_time="06:15",
            description="Point Machine Electronic Calibration",
        ),
        MaintenanceTask(
            task_id="TS-04",
            department="Traction",
            section="Track 1",
            track="Track 1",
            date=op_date,
            earliest_start="10:00",
            latest_end="13:00",
            duration=2.5,
            arrival_time="06:30",
            description="Overhead Catenary Wire Re-tensioning",
        ),

        # Track 2 Tasks:
        # TS-05 starts at 11:00 with late arrival (08:00). Fits C103.
        MaintenanceTask(
            task_id="TS-05",
            department="Signal & Telecom",
            section="Track 2",
            track="Track 2",
            date=op_date,
            earliest_start="11:00",
            latest_end="12:30",
            duration=1.5,
            arrival_time="08:00",
            description="Axle Counter Loop Replacement",
        ),
        # TS-06, TS-07, TS-08: Multi-department group starting 12:00-13:00 with earlier arrivals (07:00-07:20). Fits C104!
        MaintenanceTask(
            task_id="TS-06",
            department="Engineering",
            section="Track 2",
            track="Track 2",
            date=op_date,
            earliest_start="12:00",
            latest_end="15:00",
            duration=2.5,
            arrival_time="07:00",
            description="Turnout Diamond Crossing Renewal",
        ),
        MaintenanceTask(
            task_id="TS-07",
            department="Traction",
            section="Track 2",
            track="Track 2",
            date=op_date,
            earliest_start="12:30",
            latest_end="15:30",
            duration=2.0,
            arrival_time="07:15",
            description="Substation Feeder Inspection",
        ),
        MaintenanceTask(
            task_id="TS-08",
            department="Signal & Telecom",
            section="Track 2",
            track="Track 2",
            date=op_date,
            earliest_start="13:00",
            latest_end="15:30",
            duration=2.0,
            arrival_time="07:20",
            description="Track Circuit Bonding Inspection",
        ),

        # Track 3 Tasks:
        MaintenanceTask(
            task_id="TS-09",
            department="Engineering",
            section="Track 3",
            track="Track 3",
            date=op_date,
            earliest_start="14:00",
            latest_end="16:30",
            duration=2.0,
            arrival_time="06:05",
            description="Deep Screen Track Ballast",
        ),
        MaintenanceTask(
            task_id="TS-10",
            department="Signal & Telecom",
            section="Track 3",
            track="Track 3",
            date=op_date,
            earliest_start="14:30",
            latest_end="17:00",
            duration=2.0,
            arrival_time="06:10",
            description="Signal Filament & Lamp Unit Overhaul",
        ),
        MaintenanceTask(
            task_id="TS-11",
            department="Traction",
            section="Track 3",
            track="Track 3",
            date=op_date,
            earliest_start="15:00",
            latest_end="17:30",
            duration=2.0,
            arrival_time="06:20",
            description="Insulator Washing & Mast Checking",
        ),
        # TS-12 requests Track 3 during morning (conflicts with Rajdhani Express in BLK-C106!)
        MaintenanceTask(
            task_id="TS-12",
            department="Engineering",
            section="Track 3",
            track="Track 3",
            date=op_date,
            earliest_start="08:30",
            latest_end="10:30",
            duration=1.5,
            arrival_time="08:05",
            description="Track Alignment Probe",
        ),
    ]

    return tasks, trains, corridors


def calculate_algorithm_metrics(
    result: ScheduleResult,
    available_blocks: List[AvailableBlock],
) -> AlgorithmComparisonMetrics:
    """
    Computes uniform, consistent metrics across all algorithms:
    - Block Utilization (%) = (Total occupied block time / Total available window time) * 100
      Where concurrent tasks within a block are executed simultaneously
      (block_duration = max(durations)), avoiding double-counting.
    - Clubbed Tasks = count of tasks assigned to blocks containing > 1 task.
    - Cross-Department Blocks = count of blocks containing tasks from >= 2 departments.
    """
    scheduled_tasks_count = sum(len(b.tasks) for b in result.blocks)
    unscheduled_tasks_count = len(result.unscheduled)
    blocks_count = len(result.blocks)

    # 1. Total occupied maintenance block time (hours)
    total_occupied_duration = round(sum(b.block_duration for b in result.blocks), 2)

    # 2. Total available maintenance window time across entire corridor network
    total_available_duration = round(
        sum(
            (time_to_minutes(ab.end_time) - time_to_minutes(ab.start_time)) / 60.0
            for ab in available_blocks
        ),
        2,
    )

    # Consistent Network Utilization Formula (%)
    block_utilization_pct = (
        round((total_occupied_duration / total_available_duration) * 100, 1)
        if total_available_duration > 0
        else 0.0
    )

    # Active Selected Blocks Window Capacity & Utilization
    active_capacity = sum(b.window_capacity_hours for b in result.blocks)
    active_block_utilization_pct = (
        round((total_occupied_duration / active_capacity) * 100, 1)
        if active_capacity > 0
        else 0.0
    )

    # 3. Clubbing Metrics:
    # A. Clubbed Tasks: Tasks in blocks with more than 1 task
    clubbed_tasks = sum(len(b.tasks) for b in result.blocks if len(b.tasks) > 1)

    # B. Cross-Department Blocks: Blocks with >= 2 distinct departments
    cross_dept_blocks = sum(1 for b in result.blocks if len(b.departments) >= 2)

    # Department consolidation (avg depts per block)
    dept_consolidation = (
        round(sum(len(b.departments) for b in result.blocks) / blocks_count, 2)
        if blocks_count > 0
        else 0.0
    )

    return AlgorithmComparisonMetrics(
        tasks_scheduled=scheduled_tasks_count,
        tasks_unscheduled=unscheduled_tasks_count,
        blocks_generated=blocks_count,
        block_utilization_pct=block_utilization_pct,
        active_block_utilization_pct=active_block_utilization_pct,
        total_occupied_duration=total_occupied_duration,
        total_available_duration=total_available_duration,
        clubbed_tasks=clubbed_tasks,
        cross_department_blocks=cross_dept_blocks,
        department_consolidation=dept_consolidation,
    )


def build_comparison_table(
    fcfs_metrics: AlgorithmComparisonMetrics,
    greedy_metrics: AlgorithmComparisonMetrics,
    dp_metrics: AlgorithmComparisonMetrics,
) -> List[ComparisonMetricItem]:
    """
    Constructs the 6-row standard comparison table matching prompt specifications:
    - Tasks Scheduled
    - Tasks Unscheduled
    - Blocks Generated
    - Block Utilization
    - Clubbed Tasks
    - Cross-Department Blocks
    """
    return [
        ComparisonMetricItem(
            metric="Tasks Scheduled",
            fcfs=fcfs_metrics.tasks_scheduled,
            greedy=greedy_metrics.tasks_scheduled,
            dp=dp_metrics.tasks_scheduled,
            unit="tasks",
            description="Number of maintenance activities successfully assigned to track blocks",
        ),
        ComparisonMetricItem(
            metric="Tasks Unscheduled",
            fcfs=fcfs_metrics.tasks_unscheduled,
            greedy=greedy_metrics.tasks_unscheduled,
            dp=dp_metrics.tasks_unscheduled,
            unit="tasks",
            description="Number of maintenance activities unassigned due to operational conflicts",
        ),
        ComparisonMetricItem(
            metric="Blocks Generated",
            fcfs=fcfs_metrics.blocks_generated,
            greedy=greedy_metrics.blocks_generated,
            dp=dp_metrics.blocks_generated,
            unit="blocks",
            description="Total maintenance block possession windows opened on tracks",
        ),
        ComparisonMetricItem(
            metric="Block Utilization",
            fcfs=f"{fcfs_metrics.active_block_utilization_pct}%",
            greedy=f"{greedy_metrics.active_block_utilization_pct}%",
            dp=f"{dp_metrics.active_block_utilization_pct}%",
            unit="%",
            description="Active Block Utilization: Total occupied block duration / Total scheduled window capacity (7.0h / 9.0h)",
        ),
        ComparisonMetricItem(
            metric="Clubbed Tasks",
            fcfs=fcfs_metrics.clubbed_tasks,
            greedy=greedy_metrics.clubbed_tasks,
            dp=dp_metrics.clubbed_tasks,
            unit="tasks",
            description="Tasks co-located in blocks containing more than 1 distinct task",
        ),
        ComparisonMetricItem(
            metric="Cross-Department Blocks",
            fcfs=fcfs_metrics.cross_department_blocks,
            greedy=greedy_metrics.cross_department_blocks,
            dp=dp_metrics.cross_department_blocks,
            unit="blocks",
            description="Maintenance blocks combining tasks from at least two distinct departments (Engineering, S&T, Traction)",
        ),
    ]


def compare_algorithms(
    tasks: List[MaintenanceTask],
    train_schedule: List[TrainSchedule],
    available_blocks: List[AvailableBlock],
    scenario: str = "showcase",
) -> AlgorithmComparisonResponse:
    """
    Runs FCFS, Greedy, and Dynamic Programming on identical isolated snapshots.
    Supports:
    - 'showcase' (default): Controlled Single-Section PBL Showcase Benchmark (Part 7)
    - 'operational' / 'default': Official 20-Task Baseline Dataset
    - 'contested': Multi-Corridor Stress Benchmark
    Does NOT mutate input data or active global state.
    """
    if scenario == "showcase":
        return run_showcase_comparison()
    elif scenario == "contested":
        tasks_in, trains_in, blocks_in = get_contested_scenario()
        scenario_id = "contested"
        scenario_name = "Contested Multi-Corridor Stress Benchmark"
    else:
        tasks_in, trains_in, blocks_in = tasks, train_schedule, available_blocks
        scenario_id = "operational"
        scenario_name = "Official PBL Operations Snapshot (20 Tasks)"

    # Create isolated snapshot copies
    tasks_fcfs = [t.model_copy() for t in tasks_in]
    tasks_greedy = [t.model_copy() for t in tasks_in]
    tasks_dp = [t.model_copy() for t in tasks_in]

    trains_snap = [tr.model_copy() for tr in trains_in]
    blocks_snap = [ab.model_copy() for ab in blocks_in]

    # 1. Run FCFS
    t0_fcfs = time.perf_counter()
    fcfs_result, fcfs_steps = run_fcfs_scheduler(tasks_fcfs, trains_snap, blocks_snap, return_steps=True)
    t_fcfs_ms = round((time.perf_counter() - t0_fcfs) * 1000, 3)
    fcfs_metrics = calculate_algorithm_metrics(fcfs_result, blocks_snap)

    # 2. Run Greedy
    t0_greedy = time.perf_counter()
    greedy_result, greedy_steps = run_greedy_scheduler(tasks_greedy, trains_snap, blocks_snap, return_steps=True)
    t_greedy_ms = round((time.perf_counter() - t0_greedy) * 1000, 3)
    greedy_metrics = calculate_algorithm_metrics(greedy_result, blocks_snap)

    # 3. Run Dynamic Programming (Weighted Interval Scheduling)
    t0_dp = time.perf_counter()
    dp_result, dp_steps = run_dp_scheduler(tasks_dp, trains_snap, blocks_snap, return_steps=True)
    t_dp_ms = round((time.perf_counter() - t0_dp) * 1000, 3)
    dp_metrics = calculate_algorithm_metrics(dp_result, blocks_snap)

    # Build standardized comparison table
    comparison_table = build_comparison_table(fcfs_metrics, greedy_metrics, dp_metrics)

    fcfs_exec = AlgorithmExecutionResult(
        algorithm_key="fcfs",
        algorithm_name="First Come First Served (FCFS)",
        algorithm_description="Processes maintenance requests strictly in arrival/submission order without earliest-start sorting. Assigns tasks to earliest compatible block.",
        blocks=fcfs_result.blocks,
        unscheduled=fcfs_result.unscheduled,
        metrics=fcfs_metrics,
        execution_time_ms=t_fcfs_ms,
        dsa_notes=[
            "Queue-based arrival processing: O(N * M)",
            "No prior sorting by start time; preserves customer/request FIFO priority",
            "Assigns each task to earliest feasible compatible active block or opens new corridor",
        ],
        decision_steps=fcfs_steps,
    )

    greedy_exec = AlgorithmExecutionResult(
        algorithm_key="greedy",
        algorithm_name="Greedy Scheduling (Earliest Start Time)",
        algorithm_description="Sorts maintenance tasks by earliest start time using Merge Sort O(N log N). Progressively clubs tasks into compatible blocks or opens new corridors.",
        blocks=greedy_result.blocks,
        unscheduled=greedy_result.unscheduled,
        metrics=greedy_metrics,
        execution_time_ms=t_greedy_ms,
        dsa_notes=[
            "Sorts tasks by earliest start time using Merge Sort: O(N log N)",
            "Greedy interval evaluation: reuses active block first to maximize multi-department clubbing",
            "Simultaneous execution duration: block_duration = max(durations) [non-additive]",
        ],
        decision_steps=greedy_steps,
    )

    dp_exec = AlgorithmExecutionResult(
        algorithm_key="dp",
        algorithm_name="Dynamic Programming (Weighted Interval Scheduling)",
        algorithm_description="Generates feasible candidate maintenance blocks, prunes train conflicts, sorts candidate intervals by finish time, and solves Bellman recurrence DP[i] = max(DP[i-1], W(i) + DP[p(i)]).",
        blocks=dp_result.blocks,
        unscheduled=dp_result.unscheduled,
        metrics=dp_metrics,
        execution_time_ms=t_dp_ms,
        dsa_notes=[
            "Candidate block evaluation: enforces hard train safety and track constraints upfront",
            "Weighted Interval Scheduling recurrence: DP[i] = max(DP[i-1], W(i) + DP[p(i)])",
            "Predecessor function p(i): finds latest non-overlapping compatible corridor interval",
            "Backtracking reconstruction: traces optimal decision choices backwards from DP table",
            "Set Packing / Task Uniqueness enforcement: ensures no task is duplicated across blocks",
        ],
        decision_steps=dp_steps,
    )

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    op_date = tasks_in[0].date if tasks_in else "2026-09-20"

    return AlgorithmComparisonResponse(
        scenario_id=scenario_id,
        scenario_name=scenario_name,
        operation_date=op_date,
        execution_timestamp=now_str,
        snapshot_timestamp=now_str,
        total_input_tasks=len(tasks_in),
        total_input_trains=len(trains_in),
        total_available_corridors=len(blocks_in),
        comparison_table=comparison_table,
        fcfs=fcfs_exec,
        greedy=greedy_exec,
        dp=dp_exec,
    )
