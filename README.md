# Intelligent Railway Maintenance Block Planner

> **Project-Based Learning (PBL) Implementation**  
> An algorithmic comparison and optimization platform for railway track possession scheduling, multi-department task clubbing, and corridor conflict resolution.

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20(Vite)-61DAFB.svg)](https://reactjs.org/)
[![Tests](https://img.shields.io/badge/Pytest-16%2F16%20Passed-brightgreen.svg)](backend/test_scheduler.py)
[![Hierarchy](https://img.shields.io/badge/Hierarchy-FCFS%20%3C%20Greedy%20%3C%20DP-success.svg)](#empirical-performance-hierarchy)

---

## 1. Executive Summary

Railway tracks require periodic physical possession (**maintenance blocks**) across multiple engineering departments:
1. **Civil Engineering** (Ultrasonic rail flaw testing, ballast tamping, track realignment)
2. **Signal & Telecommunication (S&T)** (Point machine interlock calibration, track circuit testing)
3. **Traction / Electrical** (25 kV OHE contact wire inspection, catenary insulator checks)

In conventional railway dispatch, maintenance blocks are requested manually and approved on a **First-Come, First-Served (FCFS)** basis, resulting in fragmented track possessions, severe passenger train delays, and poor cross-departmental coordination.

This project implements and empirically benchmarks **three algorithmic scheduling paradigms** on real-world Indian Railway corridor data (Panipat – Karnal):
* **FCFS (First-Come, First-Served / Arrival Queue)**
* **Greedy Interval Scheduling (Highest Reward First)**
* **Dynamic Programming (Weighted Interval Scheduling + Backtracking)**

---

## 2. Mathematical Reward System

To compare algorithms objectively without arbitrary scores, candidate blocks are evaluated using a formal **lexicographic multi-objective reward function**:

$$R(B) = \alpha \times T_B + \beta \times C_B - 1$$

### Objective Priorities:
1. **Task Coverage ($T_B$)**: Unique maintenance activities scheduled ($\alpha$-weighted, highest priority).
2. **Cross-Department Clubbing ($C_B$)**: Additional departments executing simultaneously within the same physical track window ($\beta$-weighted).
   $$C_B = \max(0, |\text{Distinct Departments in } B| - 1)$$
   *Note: Tasks executed concurrently take the duration of the longest task ($\max$), not the sum.*
3. **Block Economy ($-1$)**: Incurs a $-1$ penalty per opened block, strictly breaking ties in favor of fewer track possession windows.

### Mathematical Soundness (Lexicographic Bounding):
For any set of $M$ feasible candidate blocks, the coefficients $\alpha$ and $\beta$ are strictly bounded so that one extra task outweighs all possible clubbing bonuses, and one clubbing bonus outweighs any block-count difference:
$$\beta = M + 1, \qquad \alpha = 2M\beta + M + 1$$
For $M = 5$ candidate blocks:
$$\beta = 6, \qquad \alpha = 2(5)(6) + 5 + 1 = 66 \implies R(B) = 66 \times T_B + 6 \times C_B - 1$$

---

## 3. The Three Algorithmic Approaches

```
+---------------------------------------------------------------------------------------------------+
|  1. FCFS (Arrival Queue)     --> Commits by submission time; locks track; traps schedule (65 pts) |
|  2. Greedy (Local Max)       --> Picks single highest block (137 pts); overlaps all others (137)  |
|  3. DP (Bellman Recurrence)  --> Evaluates all compatible subsets; harvests 4 blocks (260 pts)   |
+---------------------------------------------------------------------------------------------------+
```

### Approach 1: First-Come, First-Served (FCFS)
* **Mechanism**: Processes maintenance requests strictly in order of ticket submission timestamp.
* **Flaw (Arrival Bias)**: An early-arriving, isolated request (e.g., Ticket #1 at 06:00 AM) secures track possession. Subsequent high-value multi-department requests collide with Ticket #1 and are rejected.
* **Yield**: **65 pts** (2 tasks scheduled).

### Approach 2: Greedy Interval Scheduling
* **Mechanism**: Sorts all candidate blocks by individual reward $R(B)$ descending and greedily commits the highest-scoring candidate.
* **Improvement over FCFS**: Beats FCFS by **+110.8%** ($137 > 65$) by selecting Block 1 ($R = 137$).
* **Flaw (Local Myopia)**: Block 1 is a 3.5-hour mega-block (08:00 – 11:30). By claiming exclusive possession, it conflicts with 3 scheduled trains and overlaps Blocks 2, 3, 4, and 5. Greedy gets trapped and cannot schedule any further blocks.
* **Yield**: **137 pts** (3 tasks scheduled).

### Approach 3: Dynamic Programming (Weighted Interval Scheduling + Backtracking)
* **Mechanism**:
  1. Sorts candidate blocks by finish time: $f_1 \le f_2 \le \dots \le f_M$.
  2. For each block $i$, computes compatible predecessor $p(i)$ using binary search:
     $$p(i) = \max \{ j < i \mid \text{end}_j \le \text{start}_i \}$$
  3. Solves the Bellman recurrence relation:
     $$\text{DP}[i] = \max\Big(\text{DP}[i-1],\; R(i) + \text{DP}[p(i)]\Big)$$
  4. Reconstructs the global optimal set via predecessor backtracking.
* **Optimization Discovery**: At Block 1 ($R = 137$), DP checks:
  $$137 + \text{DP}[0] = 137 \le \text{DP}[3] = 195$$
  DP deliberately **excludes Block 1** and backtracks the four 50-minute blocks (2, 3, 4, 5), reaching **260 points**.
* **Yield**: **260 pts** (+89.8% over Greedy, +300% over FCFS; 7 tasks scheduled).

---

## 4. Empirical Performance Hierarchy

Across both the controlled case study and the full operational corridor dataset, the system maintains a strict monotonic hierarchy:

$$\mathbf{FCFS\ (65\ pts)\ <\ Greedy\ (137\ pts)\ <\ DP\ +\ Backtracking\ (260\ pts)}$$

| Metric | FCFS (Baseline) | Greedy (Local Best) | DP + Backtracking (Optimal) | DP Gain vs Greedy |
| :--- | :---: | :---: | :---: | :---: |
| **Controlled 5-Block Scenario** | 65 pts | 137 pts | **260 pts** | **+89.8%** |
| **Operational Tasks Scheduled** | 2 tasks | 3 tasks | **7 tasks** | **+133.3%** |
| **Tasks Unscheduled** | 9 tasks | 8 tasks | **4 tasks** | **-50.0%** |
| **Cross-Department Blocks** | 0 | 1 | **2** | **+100.0%** |
| **Train Schedule Conflicts** | 1 (Severe) | 3 (Severe) | **0 (Zero train delays)** | **100% Conflict-Free** |

---

## 5. Live Case Study: 5 Operational Trains & Candidate Blocks

The corridor model reflects operational railway reality on the **Panipat – Karnal (Track 1)** mainline between **08:00 and 12:00** (240 mins):

### The 5 Operational Trains:
1. **TR-12002 Shatabdi Express**: Clears corridor at `07:58` before maintenance begins.
2. **TR-12424 Rajdhani Express**: High-priority transit from `08:50 – 09:00`.
3. **TR-22436 Vande Bharat Express**: Semi-high-speed transit from `09:50 – 10:00`.
4. **TR-12004 Gomti Express**: Intercity transit from `10:50 – 11:00`.
5. **TR-BTPN Petroleum Freight**: Heavy haul goods enters section at `11:50`.

*Notice: Between these 5 train transits exist **four natural 50-minute maintenance gap windows** (08:00–08:50, 09:00–09:50, 10:00–10:50, 11:00–11:50).*

### Candidate Maintenance Blocks:
| Candidate | Time Window | Train Impact | Departments | Individual $R$ | FCFS | Greedy | DP Choice |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: | :---: |
| **Block 1 (Mega)** | 08:00 – 11:30 | ⚠️ Conflicts with 3 passenger trains | Eng + S&T (Clubbed) | **137 pts ★** | ❌ Collided | **★ COMMITTED** | ⛔ Excluded |
| **Block 2 (Ticket #1)** | 08:00 – 08:50 | 🚆 Fits in Gap 1 (Shatabdi ➔ Rajdhani) | Engineering | 65 pts | **✔ COMMITTED** | ❌ Overlapped | **✔ COMMITTED** |
| **Block 3** | 09:00 – 09:50 | 🚆 Fits in Gap 2 (Rajdhani ➔ Vande Bharat) | Signal & Telecom | 65 pts | ❌ Collided | ❌ Overlapped | **✔ COMMITTED** |
| **Block 4** | 10:00 – 10:50 | 🚆 Fits in Gap 3 (Vande Bharat ➔ Gomti) | Traction | 65 pts | ❌ Collided | ❌ Overlapped | **✔ COMMITTED** |
| **Block 5** | 11:00 – 11:50 | 🚆 Fits in Gap 4 (Gomti ➔ Freight) | Engineering | 65 pts | ❌ Collided | ❌ Overlapped | **✔ COMMITTED** |

---

## 6. System Architecture & Tech Stack

```
[ React + Vite Frontend (Port 5175) ]
       │
       ├──> GET /api/compare-algorithms  ───┐
       │                                   │
[ FastAPI Backend (Port 8000) ]            │
       ├── Services:                        ▼
       │   ├── fcfs_scheduler.py     (Queue order dispatch)
       │   ├── greedy_scheduler.py   (Greedy interval assignment)
       │   ├── dp_scheduler.py       (Bellman recurrence & backtracking)
       │   └── comparison_service.py (Isolated empirical benchmark)
       └── Data:
           ├── maintenance_tasks.csv (Track maintenance requests)
           ├── train_schedule.csv    (Passenger & freight timetables)
           └── available_blocks.csv  (Corridor physical possession windows)
```

* **Frontend**: React 18, Vite, Canvas / SVG Timeline rendering, responsive design.
* **Backend**: FastAPI (Python 3.9+), Pydantic validation, CORS middleware.
* **Algorithm**: Pure Python standard library DSA implementation (zero black-box ML or external OR solvers).
* **Testing**: Pytest with automated coverage for Bellman recurrence, non-overlapping constraints, and conflict detection.

---

## 7. How to Run Locally

### Prerequisites
* Python 3.9 or higher
* Node.js 18 or higher & npm

### 1. Clone the Repository
```bash
git clone https://github.com/Arnav-K99/PBL_railway.git
cd PBL_railway
```

### 2. Backend Setup
```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run unit tests (all 16 tests should pass)
pytest backend/test_scheduler.py

# Start FastAPI server
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*API documentation available at:* `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
*Frontend runs at:* `http://localhost:5175/`

---

## 8. Panel Defense & Viva Questions

### Q1: Why can't Greedy achieve the optimal schedule?
> **Answer**: Greedy makes irreversible, locally optimal decisions based on individual block scores ($137 > 65$). It fails to consider that one long block claims track possession during windows where multiple smaller compatible blocks could have yielded a higher cumulative reward ($65 \times 4 = 260\text{ pts}$).

### Q2: Why is Dynamic Programming suitable for railway block scheduling?
> **Answer**: Railway maintenance blocks satisfy **Optimal Substructure** and **Overlapping Subproblems**. By sorting candidate blocks by finish time and defining $\text{DP}[i] = \max(\text{DP}[i-1], R(i) + \text{DP}[p(i)])$, we guarantee the global optimum in $O(M \log M)$ time using memoization and binary search.

### Q3: How is simultaneous department execution modeled?
> **Answer**: When Civil Engineering, S&T, and Traction perform work in the same block, track possession duration is:
> $$\text{Block Duration} = \max(\text{Task Durations})$$
> Durations are **never summed**, reflecting simultaneous physical presence on the track.

---

## 9. License & Authors

* **Project**: Problem-Based Learning (PBL) Design Project
* **Author**: Arnav ([@Arnav-K99](https://github.com/Arnav-K99))
* **Repository**: [github.com/Arnav-K99/PBL_railway](https://github.com/Arnav-K99/PBL_railway)
