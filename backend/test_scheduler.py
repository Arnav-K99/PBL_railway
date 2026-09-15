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


if __name__ == "__main__":
    test_time_conversions()
    test_interval_overlap()
    test_fits_in_window()
    test_department_clubbing_and_duration()
    test_track_separation_and_conflict()
    test_traffic_density_computation()
    test_full_sample_datasets()
