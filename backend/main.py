import os
import sys
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure current directory is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

from models.schemas import (
    MaintenanceTask,
    TrainSchedule,
    AvailableBlock,
    ScheduledBlock,
    UnscheduledTask,
    ScheduleResult,
    ScheduleMetrics,
    CreateBlockRequest,
    CreateBlockResponse,
    TrafficWindowDensity,
)
from services.data_loader import (
    load_maintenance_tasks,
    load_train_schedule,
    load_available_blocks,
)
from services.greedy_scheduler import (
    run_greedy_scheduler,
    time_to_minutes,
    fits_in_window,
    find_train_conflict,
    compute_traffic_density,
)

app = FastAPI(
    title="Railway Maintenance Block Planner (Track-Specific Operations)",
    description="Greedy Block Planning & Multi-Department Clubbing with Track Compatibility and Traffic Density",
    version="3.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CURRENT_SCHEDULE: Optional[ScheduleResult] = None


def get_or_create_schedule() -> ScheduleResult:
    global CURRENT_SCHEDULE
    if CURRENT_SCHEDULE is None:
        tasks = load_maintenance_tasks()
        trains = load_train_schedule()
        blocks = load_available_blocks()
        CURRENT_SCHEDULE = run_greedy_scheduler(tasks, trains, blocks)
    return CURRENT_SCHEDULE


@app.get("/")
def root():
    return {
        "system": "Railway Maintenance Block Planner",
        "edition": "Track-Specific Operations Edition (V3)",
        "status": "online",
        "date": "2026-09-20",
    }


@app.get("/api/tasks", response_model=List[MaintenanceTask])
def get_tasks():
    """Returns all registered maintenance requests with track designations."""
    try:
        return load_maintenance_tasks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/trains", response_model=List[TrainSchedule])
def get_trains():
    """Returns today's active train timetable with track assignments."""
    try:
        return load_train_schedule()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/available-blocks", response_model=List[AvailableBlock])
def get_available_blocks():
    """Returns authorized maintenance block corridors with track designations."""
    try:
        return load_available_blocks()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/traffic-density", response_model=List[TrafficWindowDensity])
def get_traffic_density():
    """Returns corridor traffic density analysis identifying optimal low-traffic maintenance windows."""
    try:
        trains = load_train_schedule()
        return compute_traffic_density(trains)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/blocks", response_model=List[ScheduledBlock])
def get_blocks():
    """Returns current list of scheduled maintenance blocks."""
    sched = get_or_create_schedule()
    return sched.blocks


@app.post("/api/schedule", response_model=ScheduleResult)
def create_schedule():
    """
    Executes the greedy scheduler algorithm:
    1. Sorts tasks by earliest start time.
    2. Matches section AND track for active blocks and department clubbing.
    3. Enforces track-specific train non-conflict constraints.
    4. Records unscheduled tasks with explicit diagnostic reasons.
    """
    global CURRENT_SCHEDULE
    try:
        tasks = load_maintenance_tasks()
        trains = load_train_schedule()
        blocks = load_available_blocks()

        CURRENT_SCHEDULE = run_greedy_scheduler(tasks, trains, blocks)
        return CURRENT_SCHEDULE
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/create-block", response_model=CreateBlockResponse)
def create_custom_block(req: CreateBlockRequest):
    """
    Interactive Track-Specific Block Creation:
    1. Validates selected tasks.
    2. Ensures all selected tasks belong to the same section, track, and date.
    3. Matches an available block corridor window.
    4. Checks for track-specific train timetable conflicts.
    5. Calculates concurrent block duration = max(task durations).
    """
    global CURRENT_SCHEDULE
    tasks_all = {t.task_id: t for t in load_maintenance_tasks()}
    trains = load_train_schedule()
    avail_blocks = load_available_blocks()

    if not req.task_ids:
        return CreateBlockResponse(
            success=False,
            message="No tasks selected. Please select at least one maintenance task.",
            reason="Empty task list",
        )

    selected_tasks: List[MaintenanceTask] = []
    for tid in req.task_ids:
        if tid not in tasks_all:
            return CreateBlockResponse(
                success=False,
                message=f"Task ID '{tid}' not found in registered maintenance tasks.",
                reason="Invalid task ID",
            )
        selected_tasks.append(tasks_all[tid])

    # Check section & track compatibility
    sections = set(t.section for t in selected_tasks)
    if len(sections) > 1:
        return CreateBlockResponse(
            success=False,
            message=f"Cross-section conflict: Selected tasks span multiple sections ({', '.join(sections)}). All tasks in a maintenance block must be on the same section.",
            reason="Multi-section mismatch",
        )
    tracks = set(t.track for t in selected_tasks)
    if len(tracks) > 1:
        return CreateBlockResponse(
            success=False,
            message=f"Cross-track conflict: Selected tasks span multiple tracks ({', '.join(tracks)}). All tasks in a maintenance block must be on the same track.",
            reason="Multi-track mismatch",
        )

    section = list(sections)[0]
    track = list(tracks)[0]
    date = selected_tasks[0].date

    # Find target available block matching section and track
    target_block: Optional[AvailableBlock] = None
    if req.block_id:
        for ab in avail_blocks:
            if ab.block_id == req.block_id and ab.track == track and ab.date == date:
                target_block = ab
                break
        if not target_block:
            return CreateBlockResponse(
                success=False,
                message=f"Block window '{req.block_id}' does not match {track} on {date}.",
                reason="Window mismatch",
            )
    else:
        for ab in avail_blocks:
            if ab.track == track and ab.date == date:
                w_start = time_to_minutes(ab.start_time)
                w_end = time_to_minutes(ab.end_time)
                all_fit = all(
                    fits_in_window(
                        time_to_minutes(t.earliest_start),
                        int(t.duration * 60),
                        w_start,
                        w_end,
                    )
                    for t in selected_tasks
                )
                if all_fit:
                    target_block = ab
                    break

    if not target_block:
        return CreateBlockResponse(
            success=False,
            message=f"No available block window found on {track} encompassing all selected tasks.",
            reason="No fitting block corridor",
        )

    b_start_min = time_to_minutes(target_block.start_time)
    b_end_min = time_to_minutes(target_block.end_time)

    for t in selected_tasks:
        t_start = time_to_minutes(t.earliest_start)
        t_dur_min = int(t.duration * 60)
        if not fits_in_window(t_start, t_dur_min, b_start_min, b_end_min):
            return CreateBlockResponse(
                success=False,
                message=f"Task {t.task_id} ({t.earliest_start} - {t.latest_end}) exceeds the available window {target_block.block_id} ({target_block.start_time} - {target_block.end_time}).",
                reason="Time window overflow",
            )

    conflict_train = find_train_conflict(
        section=target_block.section,
        track=target_block.track,
        date=target_block.date,
        block_start_min=b_start_min,
        block_end_min=b_end_min,
        train_schedule=trains,
    )

    if conflict_train:
        return CreateBlockResponse(
            success=False,
            message=f"Train conflict on {track}: {conflict_train.train_name} ({conflict_train.train_id}) occupies {track} from {conflict_train.arrival_time} to {conflict_train.departure_time}.",
            conflict_train=conflict_train,
            reason=f"Train {conflict_train.train_id} conflict",
        )

    simultaneous_duration = max(t.duration for t in selected_tasks)
    window_capacity = (b_end_min - b_start_min) / 60.0
    utilization = round((simultaneous_duration / window_capacity) * 100, 1) if window_capacity > 0 else 0.0
    departments = list(dict.fromkeys(t.department for t in selected_tasks))

    new_scheduled_block = ScheduledBlock(
        block_id=target_block.block_id,
        section=section,
        track=track,
        date=date,
        start_time=target_block.start_time,
        end_time=target_block.end_time,
        departments=departments,
        tasks=selected_tasks,
        block_duration=round(simultaneous_duration, 2),
        window_capacity_hours=round(window_capacity, 2),
        utilization_percentage=utilization,
        status="Scheduled",
    )

    sched = get_or_create_schedule()
    existing_idx = next((i for i, b in enumerate(sched.blocks) if b.block_id == new_scheduled_block.block_id), None)
    if existing_idx is not None:
        sched.blocks[existing_idx] = new_scheduled_block
    else:
        sched.blocks.append(new_scheduled_block)

    scheduled_task_ids = set(t.task_id for t in selected_tasks)
    sched.unscheduled = [u for u in sched.unscheduled if u.task.task_id not in scheduled_task_ids]

    total_tasks = len(load_maintenance_tasks())
    sched_tasks_count = sum(len(b.tasks) for b in sched.blocks)
    unsched_tasks_count = total_tasks - sched_tasks_count
    blocks_used = len(sched.blocks)
    dept_consol = round(sum(len(b.departments) for b in sched.blocks) / blocks_used, 2) if blocks_used else 0.0
    avg_util = round(sum(b.utilization_percentage for b in sched.blocks) / blocks_used, 1) if blocks_used else 0.0

    sched.metrics = ScheduleMetrics(
        total_tasks=total_tasks,
        scheduled_tasks=sched_tasks_count,
        unscheduled_tasks=unsched_tasks_count,
        total_available_blocks=len(avail_blocks),
        blocks_used=blocks_used,
        department_consolidation=dept_consol,
        avg_block_utilization=avg_util,
    )

    CURRENT_SCHEDULE = sched

    return CreateBlockResponse(
        success=True,
        message=f"Block {new_scheduled_block.block_id} successfully created on {section} ({track}) from {target_block.start_time} to {target_block.end_time}.",
        block=new_scheduled_block,
    )


@app.get("/api/metrics", response_model=ScheduleMetrics)
def get_metrics():
    """Returns summary operational metrics."""
    sched = get_or_create_schedule()
    return sched.metrics


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
