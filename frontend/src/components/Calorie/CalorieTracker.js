import React, { useState, useEffect } from 'react';
import AppLayout from '../Layout/AppLayout';
import { 
  FireIcon, 
  PlusIcon, 
  TrashIcon, 
  CalendarIcon,
  TargetIcon,
  CloseIcon,
  CheckCircleIcon,
  ChartIcon
} from '../Icons/Icons';
import '../../styles/Dashboard.css';

function CalorieTracker() {
  const [entries, setEntries] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualEntry, setManualEntry] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [showManual, setShowManual] = useState(false);
  const calorieGoal = 2000;

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const stored = localStorage.getItem('calorieData');
    if (stored) {
      setEntries(JSON.parse(stored));
    }
  };

  const getEntriesForDate = (date) => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0];
      return entryDate === date;
    });
  };

  const getTotalsForDate = (date) => {
    const dateEntries = getEntriesForDate(date);
    return dateEntries.reduce((totals, entry) => ({
      calories: totals.calories + (entry.calories || 0),
      protein: totals.protein + (entry.protein || 0),
      carbs: totals.carbs + (entry.carbs || 0),
      fat: totals.fat + (entry.fat || 0)
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const deleteEntry = (id) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    localStorage.setItem('calorieData', JSON.stringify(updated));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now(),
      date: new Date(selectedDate).toISOString(),
      name: manualEntry.name,
      calories: parseInt(manualEntry.calories) || 0,
      protein: parseFloat(manualEntry.protein) || 0,
      carbs: parseFloat(manualEntry.carbs) || 0,
      fat: parseFloat(manualEntry.fat) || 0,
      manual: true
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    localStorage.setItem('calorieData', JSON.stringify(updated));
    setManualEntry({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowManual(false);
  };

  const todayEntries = getEntriesForDate(selectedDate);
  const totals = getTotalsForDate(selectedDate);
  const calorieProgress = Math.min((totals.calories / calorieGoal) * 100, 100);
  const remaining = calorieGoal - totals.calories;

  return (
    <AppLayout>
      <div className="dashboard-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Kalori Tracker</h1>
            <p className="page-subtitle">Pantau asupan kalori dan nutrisi harianmu</p>
          </div>
          <div className="header-actions">
            <div className="date-picker">
              <CalendarIcon className="date-icon" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-input"
              />
            </div>
            <button
              className={`btn ${showManual ? 'btn-danger' : 'btn-primary'}`}
              onClick={() => setShowManual(!showManual)}
            >
              {showManual ? (
                <>
                  <CloseIcon className="btn-icon" />
                  Tutup
                </>
              ) : (
                <>
                  <PlusIcon className="btn-icon" />
                  Tambah Manual
                </>
              )}
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        {showManual && (
          <div className="content-card manual-form-card">
            <div className="card-header">
              <h2 className="card-title">
                <PlusIcon className="card-title-icon" />
                Tambah Makanan Manual
              </h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleManualSubmit} className="manual-form">
                <div className="form-grid">
                  <div className="form-group form-group-wide">
                    <label className="form-label">Nama Makanan</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Nasi Goreng"
                      value={manualEntry.name}
                      onChange={(e) => setManualEntry({...manualEntry, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kalori</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={manualEntry.calories}
                      onChange={(e) => setManualEntry({...manualEntry, calories: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Protein (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={manualEntry.protein}
                      onChange={(e) => setManualEntry({...manualEntry, protein: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Karbohidrat (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={manualEntry.carbs}
                      onChange={(e) => setManualEntry({...manualEntry, carbs: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Lemak (g)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0"
                      value={manualEntry.fat}
                      onChange={(e) => setManualEntry({...manualEntry, fat: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    <CheckCircleIcon className="btn-icon" />
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FireIcon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{totals.calories}</span>
              <span className="stat-label">Total Kalori</span>
            </div>
            <div className="stat-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${calorieProgress}%` }}
                />
              </div>
              <span className="progress-text">{Math.round(calorieProgress)}% dari target</span>
            </div>
          </div>

          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <TargetIcon />
            </div>
            <div className="stat-info">
              <span className="stat-value" style={{ color: remaining >= 0 ? '#10b981' : '#ef4444' }}>
                {remaining}
              </span>
              <span className="stat-label">Sisa Kalori</span>
            </div>
          </div>

          <div className="stat-card stat-card-protein">
            <div className="stat-info">
              <span className="stat-value">{totals.protein.toFixed(1)}g</span>
              <span className="stat-label">Protein</span>
            </div>
          </div>

          <div className="stat-card stat-card-carbs">
            <div className="stat-info">
              <span className="stat-value">{totals.carbs.toFixed(1)}g</span>
              <span className="stat-label">Karbohidrat</span>
            </div>
          </div>

          <div className="stat-card stat-card-fat">
            <div className="stat-info">
              <span className="stat-value">{totals.fat.toFixed(1)}g</span>
              <span className="stat-label">Lemak</span>
            </div>
          </div>
        </div>

        {/* Food List */}
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              <ChartIcon className="card-title-icon" />
              Daftar Makanan - {new Date(selectedDate).toLocaleDateString('id-ID', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            <span className="badge">{todayEntries.length} item</span>
          </div>
          <div className="card-body">
            {todayEntries.length === 0 ? (
              <div className="empty-state">
                <FireIcon className="empty-icon" />
                <p>Belum ada makanan tercatat untuk tanggal ini</p>
                <p className="empty-hint">Gunakan fitur Analisis Makanan atau tambah manual</p>
              </div>
            ) : (
              <div className="food-table">
                <div className="table-header">
                  <span>Makanan</span>
                  <span>Kalori</span>
                  <span>Protein</span>
                  <span>Karbo</span>
                  <span>Lemak</span>
                  <span></span>
                </div>
                {todayEntries.map(entry => (
                  <div key={entry.id} className={`table-row ${entry.manual ? 'manual-entry' : ''}`}>
                    <span className="food-name-cell">
                      {entry.name}
                      {entry.manual && <span className="manual-badge">Manual</span>}
                    </span>
                    <span className="calorie-cell">{entry.calories} kal</span>
                    <span>{entry.protein}g</span>
                    <span>{entry.carbs}g</span>
                    <span>{entry.fat}g</span>
                    <span>
                      <button
                        className="btn btn-icon btn-danger-ghost"
                        onClick={() => deleteEntry(entry.id)}
                      >
                        <TrashIcon />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default CalorieTracker;
