from typing import List, Optional, Any
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
    arrival_time: Optional[str] = None  # Submission / queue arrival timestamp


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


class ComparisonMetricItem(BaseModel):
    metric: str
    fcfs: Any
    greedy: Any
    dp: Any
    unit: str = ""
    description: str = ""


class AlgorithmComparisonMetrics(BaseModel):
    tasks_scheduled: int
    tasks_unscheduled: int
    blocks_generated: int
    block_utilization_pct: float
    active_block_utilization_pct: float
    total_occupied_duration: float
    total_available_duration: float
    clubbed_tasks: int
    cross_department_blocks: int
    department_consolidation: float


class DecisionStep(BaseModel):
    step_number: int
    entity_id: str
    key_attribute: str
    action: str  # "ASSIGNED_TO_BLOCK", "CREATED_NEW_BLOCK", "REJECTED", "DP_INCLUDE", "DP_EXCLUDE"
    block_id: Optional[str] = None
    state_detail: Optional[str] = None
    rationale: str


class AlgorithmExecutionResult(BaseModel):
    algorithm_key: str
    algorithm_name: str
    algorithm_description: str
    blocks: List[ScheduledBlock]
    unscheduled: List[UnscheduledTask]
    metrics: AlgorithmComparisonMetrics
    execution_time_ms: float
    dsa_notes: List[str]
    decision_steps: List[DecisionStep] = []


class AlgorithmComparisonResponse(BaseModel):
    scenario_id: str = "default"
    scenario_name: str = "Official PBL Operations Snapshot (20 Tasks)"
    operation_date: str = "2026-09-20"
    execution_timestamp: str
    snapshot_timestamp: str  # Kept for backward compatibility
    total_input_tasks: int
    total_input_trains: int
    total_available_corridors: int
    comparison_table: List[ComparisonMetricItem]
    fcfs: AlgorithmExecutionResult
    greedy: AlgorithmExecutionResult
    dp: AlgorithmExecutionResult
