import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TrainsPage from './components/TrainsPage';
import MaintenancePage from './components/MaintenancePage';
import OptimizerPage from './components/OptimizerPage';
import BlocksPage from './components/BlocksPage';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [trains, setTrains] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  const [scheduleResult, setScheduleResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial operational data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksRes, trainsRes, blocksRes, schedRes] = await Promise.all([
          fetch('/api/tasks'),
          fetch('/api/trains'),
          fetch('/api/available-blocks'),
          fetch('/api/schedule', { method: 'POST' }),
        ]);

        const tasksData = await tasksRes.json();
        const trainsData = await trainsRes.json();
        const blocksData = await blocksRes.json();
        const schedData = await schedRes.json();

        setTasks(tasksData);
        setTrains(trainsData);
        setAvailableBlocks(blocksData);
        setScheduleResult(schedData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to connect to backend server. Verify that FastAPI is running on port 8000.');
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

  // Run batch greedy scheduler
  const handleGeneratePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/schedule', { method: 'POST' });
      const data = await res.json();
      setScheduleResult(data);
    } catch (err) {
      console.error(err);
      setError('Failed to generate block plan. Check backend logs.');
    } finally {
      setLoading(false);
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
        </main>
      </div>
    </div>
  );
}
