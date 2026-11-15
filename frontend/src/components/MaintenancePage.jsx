import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import DeptBadge from './DeptBadge';

export default function MaintenancePage({
  tasks = [],
  scheduledTaskIds = new Set(),
  onAddTask,
}) {
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State for new requisition
  const [formData, setFormData] = useState({
    description: '',
    department: 'Engineering',
    track: 'Track 1',
    date: '2026-09-20',
    earliest_start: '09:30',
    latest_end: '12:30',
    duration: 2.0,
  });

  const filteredTasks = (tasks || []).filter((task) => {
    const matchesDept =
      deptFilter === 'ALL' ||
      task.department.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesTrack =
      trackFilter === 'ALL' || task.track === trackFilter;
    const matchesSearch =
      task.task_id.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesTrack && matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseFloat(value) || 0.5 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      alert('Please enter a work description for the maintenance requisition.');
      return;
    }

    // Generate unique ID: T021, T022, etc.
    const maxNum = tasks.reduce((max, t) => {
      const match = t.task_id.match(/T(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 20);

    const newTaskId = `T${String(maxNum + 1).padStart(3, '0')}`;

    const newTask = {
      task_id: newTaskId,
      department: formData.department,
      section: formData.track,
      track: formData.track,
      date: formData.date,
      earliest_start: formData.earliest_start,
      latest_end: formData.latest_end,
      duration: Number(formData.duration),
      description: formData.description.trim(),
      arrival_time: '08:00',
    };

    if (onAddTask) {
      onAddTask(newTask);
    }

    setSuccessMsg(`Requisition ${newTaskId} successfully registered for ${formData.track} (${formData.department})!`);
    setIsModalOpen(false);

    // Reset form description
    setFormData((prev) => ({ ...prev, description: '' }));

    setTimeout(() => {
      setSuccessMsg(null);
    }, 5000);
  };

  return (
    <div className="anim-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Row */}
      <div className="page-title-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 className="page-title" style={{ margin: 0 }}>Maintenance Requests Registry</h2>
            <span
              style={{
                background: '#F1F5F9',
                color: '#475569',
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}
            >
              {tasks.length} Requisitions
            </span>
          </div>
          <div className="page-description">
            Track possession requisitions submitted by Engineering, S&T, and Traction departments
          </div>
        </div>

        {/* Raise Request Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#2563EB',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '9px 16px',
            fontWeight: '600',
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1D4ED8')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2563EB')}
        >
          <span style={{ fontSize: '15px', fontWeight: '800' }}>+</span>
          Raise Maintenance Request
        </button>
      </div>

      {/* Success Notification Banner */}
      {successMsg && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            padding: '12px 16px',
            color: '#065F46',
            fontSize: '12.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✓</span>
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065F46', fontSize: '14px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#0F172A' }}>
            Registered Track Requisitions ({filteredTasks.length})
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search task or description..."
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                outline: 'none',
                width: '210px',
                background: '#F8FAFC',
              }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                background: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer',
              }}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Signal">Signal & Telecom (S&T)</option>
              <option value="Traction">Traction / Electrical</option>
            </select>

            <select
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '12px',
                background: '#FFFFFF',
                color: '#334155',
                cursor: 'pointer',
              }}
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
            >
              <option value="ALL">All Tracks</option>
              <option value="Track 1">Track 1</option>
              <option value="Track 2">Track 2</option>
              <option value="Track 3">Track 3</option>
              <option value="Track 4">Track 4</option>
            </select>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Department</th>
                <th>Track</th>
                <th>Date</th>
                <th>Earliest Start</th>
                <th>Latest End</th>
                <th>Duration</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                    No maintenance tasks found matching filters.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const isScheduled = scheduledTaskIds.has(task.task_id);
                  return (
                    <tr key={task.task_id} style={{ background: isScheduled ? '#FAFDFB' : '#FFFFFF' }}>
                      <td className="cell-mono" style={{ fontWeight: '700', color: '#0F172A' }}>
                        {task.task_id}
                      </td>
                      <td>
                        <DeptBadge department={task.department} />
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#F1F5F9',
                            color: '#1E293B',
                            fontWeight: '600',
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {task.track}
                        </span>
                      </td>
                      <td className="cell-mono" style={{ color: '#64748B' }}>
                        {task.date}
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>
                        {task.earliest_start}
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '600' }}>
                        {task.latest_end}
                      </td>
                      <td className="cell-mono" style={{ fontWeight: '700', color: '#0F172A' }}>
                        {task.duration} hrs
                      </td>
                      <td style={{ maxWidth: '320px', color: '#334155' }}>
                        {task.description}
                      </td>
                      <td>
                        <StatusBadge
                          status={isScheduled ? 'Scheduled' : 'Unscheduled'}
                          label={isScheduled ? 'Scheduled' : 'Unscheduled'}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =========================================================================
          RAISE MAINTENANCE REQUEST MODAL
          Allows user to select: Track, Date, Time, Department, Duration, Description
          ========================================================================= */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.25)',
              width: '100%',
              maxWidth: '520px',
              overflow: 'hidden',
              animation: 'fadeInUp 0.2s ease-out',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#F8FAFC',
              }}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Raise Maintenance Request
                </h3>
                <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                  Submit a departmental track possession requisition into the block planner
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '18px',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Department & Track row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Department <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="Engineering">Engineering (Track / P-Way)</option>
                    <option value="Signal & Telecom">Signal & Telecom (S&T)</option>
                    <option value="Traction">Traction / Electrical (OHE)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Track Corridor <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <select
                    name="track"
                    value={formData.track}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      background: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="Track 1">Track 1 (Up Main Line)</option>
                    <option value="Track 2">Track 2 (Down Main Line)</option>
                    <option value="Track 3">Track 3 (Loop / Crossover)</option>
                    <option value="Track 4">Track 4 (Freight / Goods)</option>
                  </select>
                </div>
              </div>

              {/* Date & Duration */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Operational Date <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Duration (Hours) <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="6.0"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Earliest Start & Latest End Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Earliest Start Window <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="earliest_start"
                    value={formData.earliest_start}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                    Latest End Window <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="time"
                    name="latest_end"
                    value={formData.latest_end}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '11.5px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                  Work Description & Safety Equipment <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="e.g., OHE Catenary tension adjustment and insulator washing between poles 42/12 - 42/28"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                  required
                />
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  marginTop: '10px',
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '16px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#475569',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#2563EB',
                    color: '#FFFFFF',
                    fontSize: '12.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  Submit Request →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
