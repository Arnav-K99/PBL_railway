# Railway Maintenance Block Planner — PBL Version

A Project-Based Learning (PBL) implementation of an intelligent Railway Maintenance Block Planner based on core Data Structures and Algorithms (Sorting + Greedy Interval Assignment + Constraint Search).

---

## 1. Project Objective

Railway tracks require periodic maintenance across multiple engineering departments:
1. **Engineering** (Track ballast tamping, sleeper renewal, rail fracture testing, curve realignment)
2. **Signal & Telecommunication (S&T)** (Point machine calibration, signal interlocking, track circuits)
3. **Traction / Electrical** (Overhead Equipment / OHE contact wire inspection, catenary adjustment, substations)

This system takes maintenance tasks, authorized block windows, and train timetables as input and computes an optimal, conflict-free maintenance plan by **clubbing compatible activities** from multiple departments into shared block windows.

---

## 2. Core DSA Algorithm & Logic

The scheduler is intentionally simple and designed for clear explanation during viva examinations:

```text
1. Load tasks, train schedules, and available maintenance block windows.
2. Sort tasks by earliest start time: O(N log N)
3. For each task in sorted tasks:
     a. Check already active blocks in the same section & date:
        If task fits within block window:
            -> Club task into existing block
            -> Update departments list
            -> Set block_duration = MAX(task durations)  [Simultaneous execution]
            -> Assigned = True
     b. If no active block matches:
        Search available block windows for section & date:
            If window fits task duration:
                Check if any train movement overlaps with this window:
                    If train conflict -> Reject window and record conflict
                    If no train conflict:
                        -> Activate window as a new block
                        -> Assign task to new block
                        -> Assigned = True
     c. If not assigned:
        Record in Unscheduled Tasks list with diagnostic constraint reason.
```

### Key Principles

- **Greedy Assignment**: Prefers reusing an existing compatible block over opening a new track possession window.
- **Department Clubbing (Simultaneous Execution)**: When Engineering, S&T, and Traction tasks occur in the same block, their durations are **NOT summed**. They execute concurrently, so `block_duration = max(durations)`.
- **Train Timetable Constraint**: If a train occupies the section during a candidate block window, interval overlap `max(start1, start2) < min(end1, end2)` flags a collision and prevents scheduling.
- **Unscheduled Task Diagnostics**: Any unassigned task retains an explicit reason (e.g., train conflict or missing available window).

---

## 3. Technology Stack

- **Backend**: Python 3.9 + FastAPI + Pydantic
- **Algorithm**: Pure Python (no external ML / OR-Tools / optimization frameworks)
- **Data**: CSV (`maintenance_tasks.csv`, `train_schedule.csv`, `available_blocks.csv`)
- **Frontend**: React (Vite) + Clean Vanilla CSS (Inter font, responsive cards, KPI dashboard)
- **Testing**: Pytest / standalone test runner (`backend/test_scheduler.py`)

---

## 4. Project Structure

```text
railway-pbl/
├── backend/
│   ├── main.py                     # FastAPI REST API endpoints
│   ├── test_scheduler.py           # Unit and integration test suite
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py              # Pydantic data schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py          # CSV data loader
│   │   └── greedy_scheduler.py     # Pure DSA Greedy Algorithm
│   └── data/
│       ├── maintenance_tasks.csv   # 20 realistic tasks across 3 departments
│       ├── train_schedule.csv      # Train timetable (passenger & freight)
│       └── available_blocks.csv    # Authorized maintenance windows
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json
│   ├── vite.config.js              # Vite config with backend proxy
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # Main application UI & tabs
│       ├── index.css               # Design system & responsive styles
│       └── components/
│           ├── Dashboard.jsx       # KPI metric cards
│           ├── DeptBadge.jsx       # Color-coded department badges
│           ├── PlanView.jsx        # Final clubbed blocks view
│           ├── UnscheduledView.jsx # Diagnostic view of unscheduled tasks
│           ├── TasksTable.jsx      # Input tasks data table
│           ├── TrainsTable.jsx     # Train timetable table
│           └── BlocksTable.jsx     # Available block corridors table
├── requirements.txt
└── README.md
```

---

## 5. How to Run

### Backend

1. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run unit & algorithm tests:
   ```bash
   python backend/test_scheduler.py
   ```
4. Start FastAPI server:
   ```bash
   cd backend
   uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   API Docs available at: `http://127.0.0.1:8000/docs`

### Frontend

1. Navigate to frontend directory and install npm packages:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at the displayed URL (typically `http://127.0.0.1:5173` or `http://127.0.0.1:5176`).

---

## 6. Sample Run Results

Running the greedy algorithm on the sample datasets yields:

- **Total Tasks**: 20
- **Scheduled Tasks**: 13 (65% scheduled)
- **Unscheduled Tasks**: 7 (isolated with train conflict / no window reasons)
- **Blocks Created**: 3 active blocks (out of 7 available)
- **Department Consolidation**: 3.0 departments clubbed per block
- **Average Block Utilization**: 77.8%

### Scheduled Blocks Example

```text
BLOCK BLK-101 | Section SEC-AB | 09:00 - 12:00
Departments: Engineering | Traction | Signal & Telecom
Duration: 2.0 hrs (Max task duration; simultaneous execution)
Tasks: T001, T017, T002, T003, T004
Status: Scheduled
```

### Unscheduled Task Example

```text
Task T011 (Engineering, SEC-AB)
Reason: Train conflict: Vande Bharat Express (TR-22436)operates in SEC-AB
(15:10 - 15:40) during available window BLK-102 (14:00 - 17:00).
```