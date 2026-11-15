import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import OperationsCenter from './components/OperationsCenter';
import MaintenancePage from './components/MaintenancePage';
import OptimizerPage from './components/OptimizerPage';
import BlocksPage from './components/BlocksPage';
import ComparisonPage from './components/ComparisonPage';
import ReportsPage from './components/ReportsPage';
import Dashboard from './components/Dashboard';
import TrainsPage from './components/TrainsPage';

import {
  DEFAULT_TASKS,
  DEFAULT_TRAINS,
  DEFAULT_AVAILABLE_BLOCKS,
  runLocalGreedyScheduler,
  runLocalComparison,
} from './services/localData';

export default function App() {
  const [activePage, setActivePage] = useState('operations');
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [trains, setTrains] = useState(DEFAULT_TRAINS);
  const [availableBlocks, setAvailableBlocks] = useState(DEFAULT_AVAILABLE_BLOCKS);
  const [scheduleResult, setScheduleResult] = useState(() =>
    runLocalGreedyScheduler(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS)
  );
  const [comparisonData, setComparisonData] = useState(() =>
    runLocalComparison(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS, 'showcase')
  );
  const [loading, setLoading] = useState(false);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial operational data (with fallback to client-side data for Netlify)
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksRes, trainsRes, blocksRes, schedRes, compRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/trains'),
          fetch('/api/available-blocks'),
          fetch('/api/schedule', { method: 'POST' }),
          fetch('/api/compare-algorithms?scenario=showcase', { method: 'POST' }),
        ]);

        if (tasksRes.ok && trainsRes.ok && blocksRes.ok && schedRes.ok) {
          const tasksData = await tasksRes.json();
          const trainsData = await trainsRes.json();
          const blocksData = await blocksRes.json();
          const schedData = await schedRes.json();

          setTasks(tasksData);
          setTrains(trainsData);
          setAvailableBlocks(blocksData);
          setScheduleResult(schedData);

          if (compRes.ok) {
            const compData = await compRes.json();
            setComparisonData(compData);
          } else {
            setComparisonData(runLocalComparison(tasksData, trainsData, blocksData, 'showcase'));
          }
        } else {
          // Running on static hosting (Netlify) without Python server
          setTasks(DEFAULT_TASKS);
          setTrains(DEFAULT_TRAINS);
          setAvailableBlocks(DEFAULT_AVAILABLE_BLOCKS);
          setScheduleResult(
            runLocalGreedyScheduler(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS)
          );
          setComparisonData(
            runLocalComparison(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS, 'showcase')
          );
        }
      } catch {
        // Fallback for Netlify / offline deployment
        setTasks(DEFAULT_TASKS);
        setTrains(DEFAULT_TRAINS);
        setAvailableBlocks(DEFAULT_AVAILABLE_BLOCKS);
        setScheduleResult(
          runLocalGreedyScheduler(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS)
        );
        setComparisonData(
          runLocalComparison(DEFAULT_TASKS, DEFAULT_TRAINS, DEFAULT_AVAILABLE_BLOCKS, 'showcase')
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Compute scheduled task IDs for lookup
  const scheduledTaskIds = useMemo(() => {
    const ids = new Set();
    if (scheduleResult?.blocks) {
      for (const blk of scheduleResult.blocks) {
        for (const t of blk.tasks) {
          ids.add(t.task_id);
        }
      }
    }
    return ids;
  }, [scheduleResult]);

  // Handle single custom block creation from Optimizer
  const handleBlockCreated = (newBlock) => {
    setScheduleResult((prev) => {
      if (!prev) return prev;
      const existingIdx = prev.blocks.findIndex((b) => b.block_id === newBlock.block_id);
      const updatedBlocks = [...prev.blocks];
      if (existingIdx >= 0) {
        updatedBlocks[existingIdx] = newBlock;
      } else {
        updatedBlocks.push(newBlock);
      }

      const assignedIds = new Set(newBlock.tasks.map((t) => t.task_id));
      const updatedUnsched = prev.unscheduled.filter(
        (u) => !assignedIds.has(u.task.task_id)
      );

      return {
        ...prev,
        blocks: updatedBlocks,
        unscheduled: updatedUnsched,
      };
    });
  };

  // Handle raising a new maintenance requisition from MaintenancePage
  const handleAddTask = async (newTask) => {
    try {
      setTasks((prev) => [newTask, ...prev]);

      // Attempt to save to backend
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      // Regenerate plan with updated task list
      handleGeneratePlan();
    } catch {
      // Local fallback
      const updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      const localSched = runLocalGreedyScheduler(updatedTasks, trains, availableBlocks);
      setScheduleResult(localSched);
    }
  };

  // Run batch greedy scheduler
  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/schedule', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setScheduleResult(data);
      } else {
        const localSched = runLocalGreedyScheduler(tasks, trains, availableBlocks);
        setScheduleResult(localSched);
      }
    } catch (err) {
      const localSched = runLocalGreedyScheduler(tasks, trains, availableBlocks);
      setScheduleResult(localSched);
    } finally {
      setLoading(false);
    }
  };

  // Run Algorithm Comparison (Snapshot isolation - does not overwrite active scheduleResult)
  const handleRunComparison = async (scenario = 'showcase') => {
    try {
      setComparisonLoading(true);
      setError(null);
      const res = await fetch(`/api/compare-algorithms?scenario=${encodeURIComponent(scenario)}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setComparisonData(data);
      } else {
        const localComp = runLocalComparison(tasks, trains, availableBlocks, scenario);
        setComparisonData(localComp);
      }
    } catch {
      const localComp = runLocalComparison(tasks, trains, availableBlocks, scenario);
      setComparisonData(localComp);
    } finally {
      setComparisonLoading(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Persistent Operations Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Operations Work Area */}
      <div className="app-main">
        <header className="top-header">
          <div className="top-header-title">Railway Maintenance Block Planner</div>
          <div className="top-header-date">OPERATION DATE: 20 SEP 2026</div>
        </header>

        {error && (
          <div style={{ backgroundColor: '#111418', color: '#ffffff', padding: '10px 28px', fontSize: '12px', fontWeight: '600' }}>
            [ ERROR ] {error}
          </div>
        )}

        <main className="page-container">
          {activePage === 'operations' && (
            <OperationsCenter
              trains={trains}
              tasks={tasks}
              scheduledBlocks={scheduleResult?.blocks || []}
              metrics={scheduleResult?.metrics}
              onGeneratePlan={handleGeneratePlan}
              onNavigate={setActivePage}
            />
          )}

          {activePage === 'dashboard' && (
            <Dashboard
              trains={trains}
              tasks={tasks}
              availableBlocks={availableBlocks}
              scheduledBlocks={scheduleResult?.blocks || []}
              metrics={scheduleResult?.metrics}
            />
          )}

          {activePage === 'trains' && (
            <TrainsPage trains={trains} />
          )}

          {activePage === 'maintenance' && (
            <MaintenancePage
              tasks={tasks}
              scheduledTaskIds={scheduledTaskIds}
              onAddTask={handleAddTask}
            />
          )}

          {activePage === 'optimizer' && (
            <OptimizerPage
              tasks={tasks}
              scheduleResult={scheduleResult}
              onGeneratePlan={handleGeneratePlan}
              loading={loading}
            />
          )}

          {activePage === 'blocks' && (
            <BlocksPage
              scheduledBlocks={scheduleResult?.blocks || []}
              unscheduled={scheduleResult?.unscheduled || []}
              onGeneratePlan={handleGeneratePlan}
              loading={loading}
            />
          )}

          {activePage === 'comparison' && (
            <ComparisonPage
              comparisonData={comparisonData}
              onRunComparison={handleRunComparison}
              loading={comparisonLoading}
              trains={trains}
            />
          )}

          {activePage === 'reports' && (
            <ReportsPage
              tasks={tasks}
              trains={trains}
              scheduleResult={scheduleResult}
            />
          )}
        </main>
      </div>
    </div>
  );
}
