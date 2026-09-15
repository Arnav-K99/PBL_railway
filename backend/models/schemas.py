from typing import List, Optional
from pydantic import BaseModel, Field


class MaintenanceTask(BaseModel):
    task_id: str
    department: str
    section: str
    track: str = "Track 1"
    date: str
    earliest_start: str
    latest_end: str
    duration: float  # hours
    description: str


class TrainSchedule(BaseModel):
    train_id: str
    train_name: str
    section: str
    track: str = "Track 1"
    date: str
    arrival_time: str
    departure_time: str


class AvailableBlock(BaseModel):
    block_id: str
    section: str
    track: str = "Track 1"
    date: str
    start_time: str
    end_time: str


class ScheduledBlock(BaseModel):
    block_id: str
    section: str
    track: str = "Track 1"
    date: str
    start_time: str
    end_time: str
    departments: List[str]
    tasks: List[MaintenanceTask]
    block_duration: float  # hours (max simultaneous duration among tasks)
    window_capacity_hours: float  # total available window duration
    utilization_percentage: float
    status: str = "Scheduled"


class UnscheduledTask(BaseModel):
    task: MaintenanceTask
    reason: str


class TrafficWindowDensity(BaseModel):
    section: str = ""
    track: str
    time_window: str
    start_time: str
    end_time: str
    train_count: int
    trains: List[str]
    status: str
    recommendation: str = ""


class ScheduleMetrics(BaseModel):
    total_tasks: int
    scheduled_tasks: int
    unscheduled_tasks: int
    total_available_blocks: int
    blocks_used: int
    department_consolidation: float  # avg departments per block
    avg_block_utilization: float  # %


class ScheduleResult(BaseModel):
    blocks: List[ScheduledBlock]
    unscheduled: List[UnscheduledTask]
    metrics: ScheduleMetrics


class CreateBlockRequest(BaseModel):
    task_ids: List[str]
    block_id: Optional[str] = None


class CreateBlockResponse(BaseModel):
    success: bool
    message: str
    block: Optional[ScheduledBlock] = None
    conflict_train: Optional[TrainSchedule] = None
    reason: Optional[str] = None
