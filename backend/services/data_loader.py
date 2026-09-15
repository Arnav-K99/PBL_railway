import csv
import os
from typing import List
from models.schemas import MaintenanceTask, TrainSchedule, AvailableBlock

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


def load_maintenance_tasks(filepath: str = None) -> List[MaintenanceTask]:
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "maintenance_tasks.csv")
    tasks = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            tasks.append(
                MaintenanceTask(
                    task_id=row["task_id"].strip(),
                    department=row["department"].strip(),
                    section=row["section"].strip(),
                    track=row.get("track", "Track 1").strip(),
                    date=row["date"].strip(),
                    earliest_start=row["earliest_start"].strip(),
                    latest_end=row["latest_end"].strip(),
                    duration=float(row["duration"].strip()),
                    description=row["description"].strip(),
                )
            )
    return tasks


def load_train_schedule(filepath: str = None) -> List[TrainSchedule]:
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "train_schedule.csv")
    trains = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            trains.append(
                TrainSchedule(
                    train_id=row["train_id"].strip(),
                    train_name=row["train_name"].strip(),
                    section=row["section"].strip(),
                    track=row.get("track", "Track 1").strip(),
                    date=row["date"].strip(),
                    arrival_time=row["arrival_time"].strip(),
                    departure_time=row["departure_time"].strip(),
                )
            )
    return trains


def load_available_blocks(filepath: str = None) -> List[AvailableBlock]:
    if filepath is None:
        filepath = os.path.join(DATA_DIR, "available_blocks.csv")
    blocks = []
    with open(filepath, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            blocks.append(
                AvailableBlock(
                    block_id=row["block_id"].strip(),
                    section=row["section"].strip(),
                    track=row.get("track", "Track 1").strip(),
                    date=row["date"].strip(),
                    start_time=row["start_time"].strip(),
                    end_time=row["end_time"].strip(),
                )
            )
    return blocks
