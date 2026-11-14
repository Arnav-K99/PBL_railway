"""
Unit and Integration Tests for Railway Maintenance Greedy Scheduler (Track-Specific Edition)
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(__file__))

from services.data_loader import (
    load_maintenance_tasks,
    load_train_schedule,
    load_available_blocks,
)
from services.greedy_scheduler import (
    time_to_minutes,
    minutes_to_time,
    is_overlapping,
    fits_in_window,
    run_greedy_scheduler,
    find_train_conflict,
    compute_traffic_density,
)
from services.sorting import merge_sort
from services.fcfs_scheduler import run_fcfs_scheduler
from services.dp_scheduler import (
    run_dp_scheduler,
    run_dp_weighted_interval_scheduling,
    CandidateBlock,
)
from services.comparison_service import compare_algorithms, calculate_algorithm_metrics
from models.schemas import MaintenanceTask, TrainSchedule, AvailableBlock


def test_time_conversions():
    assert time_to_minutes("00:00") == 0
    assert time_to_minutes("09:30") == 570
    assert time_to_minutes("23:59") == 1439
    assert minutes_to_time(570) == "09:30"
    assert minutes_to_time(0) == "00:00"
    print("✓ test_time_conversions passed")


def test_interval_overlap():
    assert is_overlapping(540, 660, 600, 630) is True  # 09:00-11:00 and 10:00-10:30
    assert is_overlapping(600, 630, 540, 660) is True
    assert is_overlapping(540, 600, 600, 660) is False  # [09:00, 10:00] and [10:00, 11:00]
    assert is_overlapping(400, 500, 550, 600) is False
    print("✓ test_interval_overlap passed")


def test_fits_in_window():
    assert fits_in_window(555, 90, 540, 720) is True
    assert fits_in_window(660, 90, 540, 720) is False  # 11:00 + 1.5h = 12:30 > 12:00
    assert fits_in_window(500, 60, 540, 720) is False
    print("✓ test_fits_in_window passed")


def test_department_clubbing_and_duration():
    tasks = [
        MaintenanceTask(
            task_id="T1",
            department="Engineering",
            section="Track 1",
            track="Track 1",
            date="2026-09-20",
            earliest_start="09:00",
            latest_end="11:30",
            duration=2.0,
            description="Track tamping",
        ),
        MaintenanceTask(
            task_id="T2",
            department="Signal & Telecom",
            section="Track 1",
            track="Track 1",
            date="2026-09-20",
            earliest_start="09:15",
            latest_end="11:00",
            duration=1.0,
            description="Signal check",
        ),
        MaintenanceTask(
            task_id="T3",
            department="Traction",
            section="Track 1",
            track="Track 1",
            date="2026-09-20",
            earliest_start="09:30",
            latest_end="11:30",
            duration=1.5,
            description="OHE check",
        ),
    ]
    trains = []
    blocks = [
        AvailableBlock(
            block_id="BLK-101",
            section="Track 1",
            track="Track 1",
            date="2026-09-20",
            start_time="09:00",
            end_time="12:00",
        )
    ]

    result = run_greedy_scheduler(tasks, trains, blocks)
    assert len(result.blocks) == 1
    scheduled_block = result.blocks[0]
    assert scheduled_block.block_id == "BLK-101"
    assert scheduled_block.track == "Track 1"
    assert len(scheduled_block.tasks) == 3
    assert set(scheduled_block.departments) == {"Engineering", "Signal & Telecom", "Traction"}
    assert scheduled_block.block_duration == 2.0
    print("✓ test_department_clubbing_and_duration passed")


def test_track_separation_and_conflict():
    # Train is on Track 2; block is on Track 1 -> NO conflict!
    train_on_track_2 = [
        TrainSchedule(
            train_id="TR-GOODS-01",
            train_name="Container Freight 701",
            section="Track 2",
            track="Track 2",
            date="2026-09-20",
            arrival_time="09:30",
            departure_time="10:15",
        )
    ]
    block_start_min = time_to_minutes("09:00")
    block_end_min = time_to_minutes("12:00")

    conflict_on_track_1 = find_train_conflict(
        section="Track 1",
        track="Track 1",
        date="2026-09-20",
        block_start_min=block_start_min,
        block_end_min=block_end_min,
        train_schedule=train_on_track_2,
    )
    assert conflict_on_track_1 is None  # Safe! Different track!

    # Train on Track 1 -> Conflict detected!
    train_on_track_1 = [
        TrainSchedule(
            train_id="TR-22436",
            train_name="Vande Bharat Express",
            section="Track 1",
            track="Track 1",
            date="2026-09-20",
            arrival_time="15:10",
            departure_time="15:40",
        )
    ]
    conflict_on_track_1 = find_train_conflict(
        section="Track 1",
        track="Track 1",
        date="2026-09-20",
        block_start_min=time_to_minutes("14:00"),
        block_end_min=time_to_minutes("17:00"),
        train_schedule=train_on_track_1,
    )
    assert conflict_on_track_1 is not None
    assert conflict_on_track_1.train_id == "TR-22436"
    print("✓ test_track_separation_and_conflict passed")


def test_traffic_density_computation():
    trains = load_train_schedule()
    density_windows = compute_traffic_density(trains)
    assert len(density_windows) > 0

    # Confirm optimal windows (0 trains)
    optimal_windows = [w for w in density_windows if w.train_count == 0]
    assert len(optimal_windows) > 0
    assert optimal_windows[0].status == "Optimal for Block (Zero Disruption)"

    # Confirm high-traffic impossible windows (>= 2 trains)
    impossible_windows = [w for w in density_windows if w.train_count >= 2]
    assert len(impossible_windows) > 0
    assert impossible_windows[0].status == "BLOCK NOT POSSIBLE (High Traffic)"
    print(
        f"✓ test_traffic_density_computation passed ({len(optimal_windows)} optimal windows, {len(impossible_windows)} block-not-possible windows identified)"
    )


def test_full_sample_datasets():
    tasks = load_maintenance_tasks()
    trains = load_train_schedule()
    blocks = load_available_blocks()

    assert len(tasks) == 20
    assert len(trains) == 14
    assert len(blocks) == 7

    result = run_greedy_scheduler(tasks, trains, blocks)

    print("\n--- Full Track-Specific Sample Run Results ---")
    print(f"Total tasks: {result.metrics.total_tasks}")
    print(f"Scheduled tasks: {result.metrics.scheduled_tasks}")
    print(f"Unscheduled tasks: {result.metrics.unscheduled_tasks}")
    print(f"Blocks created: {result.metrics.blocks_used} / {result.metrics.total_available_blocks}")
    print(f"Department consolidation: {result.metrics.department_consolidation} depts/block")
    print(f"Average block utilization: {result.metrics.avg_block_utilization}%")

    assert len(result.blocks) == 3
    # Check that BLK-106 is assigned to Track 3
    blk_106 = next(b for b in result.blocks if b.block_id == "BLK-106")
    assert blk_106.track == "Track 3"

    for b in result.blocks:
        print(f"  Block {b.block_id} ({b.track}, {b.start_time}-{b.end_time}):")
        print(f"    Departments: {' | '.join(b.departments)}")
        print(f"    Tasks: {[t.task_id for t in b.tasks]} (Block Duration: {b.block_duration}h, Window: {b.window_capacity_hours}h, Util: {b.utilization_percentage}%)")
        assert len(b.departments) >= 1
        assert b.block_duration <= b.window_capacity_hours

    assert len(result.unscheduled) > 0
    print("\nUnscheduled Tasks:")
    for u in result.unscheduled:
        print(f"  Task {u.task.task_id} ({u.task.track}, {u.task.department}): {u.reason}")
        assert len(u.reason) > 0

    print("\n✓ test_full_sample_datasets passed successfully!")


def test_merge_sort_correctness():
    # Empty and single-element lists
    assert merge_sort([], key_fn=lambda x: x) == []
    assert merge_sort([42], key_fn=lambda x: x) == [42]

    # Preserves ascending order
    raw_nums = [5, 1, 9, 3, 7, 2, 8, 4, 6]
    assert merge_sort(raw_nums, key_fn=lambda x: x) == sorted(raw_nums)

    # Stability test: items with equal keys must preserve original relative order
    pairs = [("A", 2), ("B", 1), ("C", 2), ("D", 1), ("E", 3)]
    sorted_pairs = merge_sort(pairs, key_fn=lambda x: x[1])
    assert sorted_pairs == [("B", 1), ("D", 1), ("A", 2), ("C", 2), ("E", 3)]
    print("✓ test_merge_sort_correctness passed")


def test_fcfs_scheduler_execution():
    tasks = load_maintenance_tasks()
    trains = load_train_schedule()
    blocks = load_available_blocks()

    fcfs_result = run_fcfs_scheduler(tasks, trains, blocks)

    assert fcfs_result.metrics.scheduled_tasks == 13
    assert fcfs_result.metrics.unscheduled_tasks == 7
    assert fcfs_result.metrics.blocks_used == 3

    # Verify task uniqueness (no duplicates)
    all_scheduled_task_ids = [t.task_id for b in fcfs_result.blocks for t in b.tasks]
    assert len(all_scheduled_task_ids) == len(set(all_scheduled_task_ids))

    # Verify non-empty rejection reasons for all unscheduled tasks
    for u in fcfs_result.unscheduled:
        assert len(u.reason) > 0

    print("✓ test_fcfs_scheduler_execution passed")


def test_dp_weighted_interval_scheduling_unit():
    # Synthetic unit test for Weighted Interval Scheduling with backtracking
    # Interval 1: 09:00 - 11:00 (end=660), weight=100
    # Interval 2: 10:00 - 12:00 (end=720), weight=250 (overlaps with 1)
    # Interval 3: 11:30 - 13:30 (end=810), weight=180 (compatible with 1, overlaps with 2)
    t1 = MaintenanceTask(task_id="X1", department="Eng", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:00", latest_end="11:00", duration=2.0, description="")
    t2 = MaintenanceTask(task_id="X2", department="Sig", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="10:00", latest_end="12:00", duration=2.0, description="")
    t3 = MaintenanceTask(task_id="X3", department="Trac", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="11:30", latest_end="13:30", duration=2.0, description="")

    cand1 = CandidateBlock("C1", "Track 1", "Track 1", "2026-09-20", "09:00", "11:00", 540, 660, [t1])
    cand2 = CandidateBlock("C2", "Track 1", "Track 1", "2026-09-20", "10:00", "12:00", 600, 720, [t2])
    cand3 = CandidateBlock("C3", "Track 1", "Track 1", "2026-09-20", "11:30", "13:30", 690, 810, [t3])

    cand1.weight = 100.0
    cand2.weight = 250.0
    cand3.weight = 180.0

    selected, dp, p, take = run_dp_weighted_interval_scheduling([cand1, cand2, cand3])

    # Choice is between:
    # Option A: cand2 alone = 250
    # Option B: cand1 + cand3 (compatible: 660 <= 690) = 100 + 180 = 280
    # Optimal DP must select cand1 and cand3!
    assert [c.block_id for c in selected] == ["C1", "C3"]
    assert dp[3] == 280.0
    assert take[1] is True
    assert take[3] is True
    print("✓ test_dp_weighted_interval_scheduling_unit passed")


def test_dp_vs_greedy_divergence():
    """
    Demonstrates the difference between Greedy and Dynamic Programming on overlapping corridors:
    In DP Weighted Interval Scheduling, candidate blocks on the same track cannot overlap in time.
    DP evaluates candidate intervals by finish time and selects the maximum-weight subset,
    choosing the 3-department clubbed corridor over the lower-weight overlapping corridor.
    """
    avail = [
        AvailableBlock(block_id="WIN-EARLY", section="Track 1", track="Track 1", date="2026-09-20", start_time="08:00", end_time="10:00"),
        AvailableBlock(block_id="WIN-CLUBBED", section="Track 1", track="Track 1", date="2026-09-20", start_time="09:30", end_time="12:30"),
    ]
    tasks = [
        MaintenanceTask(task_id="T-EARLY", department="Engineering", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="08:00", latest_end="10:00", duration=1.5, description="Ballast"),
        MaintenanceTask(task_id="T-CLUB-1", department="Engineering", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:30", latest_end="12:00", duration=2.0, description="Turnout"),
        MaintenanceTask(task_id="T-CLUB-2", department="Signal & Telecom", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:45", latest_end="12:00", duration=1.5, description="Interlocking"),
        MaintenanceTask(task_id="T-CLUB-3", department="Traction", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="10:00", latest_end="12:00", duration=1.5, description="Catenary"),
    ]
    trains = []

    # DP Weighted Interval Scheduling evaluates both candidate corridors on Track 1:
    # WIN-EARLY (finish 10:00, weight ~ 115) vs WIN-CLUBBED (finish 12:30, weight ~ 420)
    # Since they overlap on Track 1 (10:00 > 09:30), DP selects WIN-CLUBBED!
    # Result: DP schedules 3 tasks with 3-department clubbing and rejects WIN-EARLY.
    dp_res = run_dp_scheduler(tasks, trains, avail)
    assert dp_res.metrics.scheduled_tasks == 3
    assert len(dp_res.blocks) == 1
    assert dp_res.blocks[0].block_id == "WIN-CLUBBED"
    assert len(dp_res.blocks[0].departments) == 3

    print("✓ test_dp_vs_greedy_divergence passed: DP correctly selected the higher-weight clubbed corridor")


def test_fcfs_vs_greedy_ordering_divergence():
    """
    Demonstrates that FCFS respects submission arrival order, while Greedy sorts by earliest start time.
    """
    avail = [
        AvailableBlock(block_id="WIN-01", section="Track 1", track="Track 1", date="2026-09-20", start_time="09:00", end_time="12:00"),
    ]
    # Task A arrives first in submission order (at 10:00)
    # Task B arrives second in submission order (at 09:00)
    tasks = [
        MaintenanceTask(task_id="TASK-LATE-ARRIVAL", department="Engineering", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="10:00", latest_end="11:30", duration=1.5, description="Engineering work"),
        MaintenanceTask(task_id="TASK-EARLY-START", department="Signal & Telecom", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:00", latest_end="10:30", duration=1.5, description="S&T work"),
    ]
    trains = []

    fcfs_res = run_fcfs_scheduler(tasks, trains, avail)
    greedy_res = run_greedy_scheduler(tasks, trains, avail)

    # In FCFS, TASK-LATE-ARRIVAL is processed first and placed first in the block's tasks
    assert fcfs_res.blocks[0].tasks[0].task_id == "TASK-LATE-ARRIVAL"
    assert fcfs_res.blocks[0].tasks[1].task_id == "TASK-EARLY-START"

    # In Greedy, TASK-EARLY-START is sorted first by earliest start (09:00 < 10:00)
    assert greedy_res.blocks[0].tasks[0].task_id == "TASK-EARLY-START"
    assert greedy_res.blocks[0].tasks[1].task_id == "TASK-LATE-ARRIVAL"

    print("✓ test_fcfs_vs_greedy_ordering_divergence passed: FCFS preserved queue order, Greedy sorted by earliest start")


def test_comparison_service_and_metrics_consistency():
    tasks = load_maintenance_tasks()
    trains = load_train_schedule()
    blocks = load_available_blocks()

    # Capture initial task count and state
    initial_tasks_count = len(tasks)

    comparison = compare_algorithms(tasks, trains, blocks)

    # 1. Verify snapshot isolation (source data not mutated)
    assert len(tasks) == initial_tasks_count

    # 2. Verify all 3 algorithms evaluated
    assert comparison.fcfs.algorithm_key == "fcfs"
    assert comparison.greedy.algorithm_key == "greedy"
    assert comparison.dp.algorithm_key == "dp"

    # 3. Verify comparison table row labels and counts
    table = comparison.comparison_table
    assert len(table) == 6
    metric_names = [row.metric for row in table]
    expected_metrics = [
        "Tasks Scheduled",
        "Tasks Unscheduled",
        "Blocks Generated",
        "Block Utilization",
        "Clubbed Tasks",
        "Cross-Department Blocks",
    ]
    assert metric_names == expected_metrics

    # 4. Verify divergent values on contested benchmark (proving independent execution)
    for row in table:
        if row.metric == "Tasks Scheduled":
            assert row.fcfs == 9 and row.greedy == 5 and row.dp == 11
            assert row.dp > row.greedy, "DP must schedule more tasks than Greedy on contested corridors"
            assert row.dp > row.fcfs, "DP must schedule more tasks than FCFS on contested corridors"
        elif row.metric == "Tasks Unscheduled":
            assert row.fcfs == 3 and row.greedy == 7 and row.dp == 1
        elif row.metric == "Blocks Generated":
            assert row.fcfs == 3 and row.greedy == 3 and row.dp == 5
        elif row.metric == "Clubbed Tasks":
            assert row.fcfs == 9 and row.greedy == 3 and row.dp == 9
        elif row.metric == "Cross-Department Blocks":
            assert row.fcfs == 3 and row.greedy == 1 and row.dp == 3

    # Also test default 20-task baseline snapshot
    baseline_comp = compare_algorithms(tasks, trains, blocks, scenario="default")
    for row in baseline_comp.comparison_table:
        if row.metric == "Tasks Scheduled":
            assert row.fcfs == 13 and row.greedy == 13 and row.dp == 13
        elif row.metric == "Tasks Unscheduled":
            assert row.fcfs == 7 and row.greedy == 7 and row.dp == 7

    # 5. Verify task uniqueness across each algorithm
    for exec_res in [comparison.fcfs, comparison.greedy, comparison.dp]:
        all_ids = [t.task_id for b in exec_res.blocks for t in b.tasks]
        assert len(all_ids) == len(set(all_ids)), f"Duplicate task found in {exec_res.algorithm_key}"
        assert len(all_ids) == exec_res.metrics.tasks_scheduled

    # 6. Verify operation date separation from execution timestamp
    assert comparison.operation_date == "2026-09-20"
    assert len(comparison.execution_timestamp) > 0

    print("✓ test_comparison_service_and_metrics_consistency passed")


def test_clubbing_and_cross_department_metric_definitions():
    """
    Verifies metric definitions:
    1. Clubbed tasks counts only tasks in blocks containing > 1 task (not simply scheduled_tasks).
    2. Cross-department blocks counts only blocks containing >= 2 distinct departments.
    """
    from models.schemas import ScheduledBlock, ScheduleResult, ScheduleMetrics

    t1 = MaintenanceTask(task_id="T1", department="Engineering", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:00", latest_end="11:00", duration=2.0, description="")
    t2 = MaintenanceTask(task_id="T2", department="Engineering", section="Track 1", track="Track 1", date="2026-09-20", earliest_start="09:00", latest_end="11:00", duration=2.0, description="")
    t3 = MaintenanceTask(task_id="T3", department="Signal & Telecom", section="Track 2", track="Track 2", date="2026-09-20", earliest_start="13:00", latest_end="15:00", duration=2.0, description="")
    t4 = MaintenanceTask(task_id="T4", department="Traction", section="Track 2", track="Track 2", date="2026-09-20", earliest_start="13:00", latest_end="15:00", duration=2.0, description="")
    t5 = MaintenanceTask(task_id="T5", department="Engineering", section="Track 3", track="Track 3", date="2026-09-20", earliest_start="15:00", latest_end="17:00", duration=2.0, description="")

    # Block 1: 2 tasks, BOTH Engineering (clubbed = 2, cross-dept = 0)
    b1 = ScheduledBlock(block_id="B1", section="Track 1", track="Track 1", date="2026-09-20", start_time="09:00", end_time="12:00", departments=["Engineering"], tasks=[t1, t2], block_duration=2.0, window_capacity_hours=3.0, utilization_percentage=66.7)
    # Block 2: 2 tasks, S&T and Traction (clubbed = 2, cross-dept = 1)
    b2 = ScheduledBlock(block_id="B2", section="Track 2", track="Track 2", date="2026-09-20", start_time="13:00", end_time="16:00", departments=["Signal & Telecom", "Traction"], tasks=[t3, t4], block_duration=2.0, window_capacity_hours=3.0, utilization_percentage=66.7)
    # Block 3: 1 single task (clubbed = 0, cross-dept = 0)
    b3 = ScheduledBlock(block_id="B3", section="Track 3", track="Track 3", date="2026-09-20", start_time="15:00", end_time="18:00", departments=["Engineering"], tasks=[t5], block_duration=2.0, window_capacity_hours=3.0, utilization_percentage=66.7)

    res = ScheduleResult(blocks=[b1, b2, b3], unscheduled=[], metrics=ScheduleMetrics(total_tasks=5, scheduled_tasks=5, unscheduled_tasks=0, total_available_blocks=3, blocks_used=3, department_consolidation=1.67, avg_block_utilization=66.7))
    avail = [
        AvailableBlock(block_id="B1", section="Track 1", track="Track 1", date="2026-09-20", start_time="09:00", end_time="12:00"),
        AvailableBlock(block_id="B2", section="Track 2", track="Track 2", date="2026-09-20", start_time="13:00", end_time="16:00"),
        AvailableBlock(block_id="B3", section="Track 3", track="Track 3", date="2026-09-20", start_time="15:00", end_time="18:00"),
    ]

    metrics = calculate_algorithm_metrics(res, avail)
    assert metrics.tasks_scheduled == 5
    assert metrics.clubbed_tasks == 4  # 2 + 2 = 4 (task in B3 is not clubbed!)
    assert metrics.cross_department_blocks == 1  # Only B2 has >= 2 departments
    print("✓ test_clubbing_and_cross_department_metric_definitions passed")


def test_contested_scenario_divergence():
    """
    Empirical divergence test on the Contested Multi-Corridor Stress Benchmark:
    - DP evaluates the global search space via WIS and picks higher-capacity multi-department blocks.
    - Greedy suffers from local short-sightedness by opening early narrow blocks that conflict with richer windows.
    - FCFS commits based on submission order.
    - Verifies decision steps are generated for all three algorithms.
    """
    tasks = load_maintenance_tasks()
    trains = load_train_schedule()
    blocks = load_available_blocks()

    comparison = compare_algorithms(tasks, trains, blocks, scenario="contested")

    assert comparison.scenario_id == "contested"
    assert comparison.scenario_name == "Contested Multi-Corridor Stress Benchmark"

    # DP must schedule more tasks than Greedy on contested corridors
    assert comparison.dp.metrics.tasks_scheduled > comparison.greedy.metrics.tasks_scheduled
    assert comparison.dp.metrics.clubbed_tasks > comparison.greedy.metrics.clubbed_tasks

    # Verify decision steps are populated for all three algorithms
    assert len(comparison.fcfs.decision_steps) > 0
    assert len(comparison.greedy.decision_steps) > 0
    assert len(comparison.dp.decision_steps) > 0

    print(
        f"✓ test_contested_scenario_divergence passed: "
        f"DP scheduled {comparison.dp.metrics.tasks_scheduled} tasks ({comparison.dp.metrics.clubbed_tasks} clubbed) vs "
        f"Greedy {comparison.greedy.metrics.tasks_scheduled} tasks ({comparison.greedy.metrics.clubbed_tasks} clubbed)"
    )


if __name__ == "__main__":
    test_time_conversions()
    test_interval_overlap()
    test_fits_in_window()
    test_department_clubbing_and_duration()
    test_track_separation_and_conflict()
    test_traffic_density_computation()
    test_full_sample_datasets()
    test_merge_sort_correctness()
    test_fcfs_scheduler_execution()
    test_dp_weighted_interval_scheduling_unit()
    test_dp_vs_greedy_divergence()
    test_fcfs_vs_greedy_ordering_divergence()
    test_comparison_service_and_metrics_consistency()
    test_clubbing_and_cross_department_metric_definitions()
    test_contested_scenario_divergence()
