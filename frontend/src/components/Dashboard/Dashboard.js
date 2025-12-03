import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../Layout/AppLayout';
import { 
  FireIcon, 
  CameraIcon, 
  TargetIcon, 
  TrendUpIcon,
  CalendarIcon,
  ActivityIcon,
  CheckCircleIcon,
  LightbulbIcon
} from '../Icons/Icons';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    todayCalories: 0,
    targetCalories: 2000,
    analyzedFoods: 0,
    streak: 1
  });
  const [recentFoods, setRecentFoods] = useState([]);
  const [tips] = useState([
    'Konsumsi air putih minimal 8 gelas per hari untuk metabolisme optimal.',
    'Makan sayur dan buah setiap hari untuk nutrisi seimbang.',
    'Hindari makanan olahan berlebihan untuk kesehatan jangka panjang.'
  ]);

  useEffect(() => {
    // Load stats from localStorage
    const stored = localStorage.getItem('calorieData');
    if (stored) {
      const data = JSON.parse(stored);
      const today = new Date().toDateString();
      const todayEntries = data.filter(e => new Date(e.date).toDateString() === today);
      const totalToday = todayEntries.reduce((sum, e) => sum + e.calories, 0);
      
      setStats(prev => ({
        ...prev,
        todayCalories: totalToday,
        analyzedFoods: todayEntries.length
      }));

      // Get recent foods (last 3)
      const recent = todayEntries.slice(-3).reverse().map(e => ({
        name: e.name,
        calories: e.calories,
        time: new Date(e.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      }));
      setRecentFoods(recent);
    }
  }, []);

  const calorieProgress = Math.min((stats.todayCalories / stats.targetCalories) * 100, 100);

  return (
    <AppLayout>
      <div className="dashboard-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Selamat datang kembali! Pantau asupan nutrisi harianmu.</p>
          </div>
          <div className="header-date">
            <CalendarIcon className="date-icon" />
            <span>{new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FireIcon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.todayCalories}</span>
              <span className="stat-label">Kalori Hari Ini</span>
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
              <span className="stat-value">{stats.targetCalories}</span>
              <span className="stat-label">Target Kalori</span>
            </div>
          </div>

          <div className="stat-card stat-card-accent">
            <div className="stat-icon">
              <CameraIcon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.analyzedFoods}</span>
              <span className="stat-label">Makanan Dianalisis</span>
            </div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <TrendUpIcon />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.streak} Hari</span>
              <span className="stat-label">Streak Aktif</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Recent Foods */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <ActivityIcon className="card-title-icon" />
                Makanan Terakhir
              </h2>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/tracker')}
              >
                Lihat Semua
              </button>
            </div>
            <div className="card-body">
              {recentFoods.length > 0 ? (
                <div className="food-list">
                  {recentFoods.map((food, index) => (
                    <div key={index} className="food-item">
                      <div className="food-info">
                        <span className="food-name">{food.name}</span>
                        <span className="food-time">{food.time}</span>
                      </div>
                      <div className="food-calories">
                        <FireIcon className="calorie-icon" />
                        <span>{food.calories} kal</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <CameraIcon className="empty-icon" />
                  <p>Belum ada makanan yang dicatat hari ini</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/analyze')}
                  >
                    Analisis Makanan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <CheckCircleIcon className="card-title-icon" />
                Aksi Cepat
              </h2>
            </div>
            <div className="card-body">
              <div className="quick-actions">
                <button 
                  className="action-card"
                  onClick={() => navigate('/analyze')}
                >
                  <div className="action-icon action-icon-primary">
                    <CameraIcon />
                  </div>
                  <span className="action-label">Analisis Makanan</span>
                  <span className="action-desc">Foto makananmu untuk analisis nutrisi</span>
                </button>

                <button 
                  className="action-card"
                  onClick={() => navigate('/tracker')}
                >
                  <div className="action-icon action-icon-secondary">
                    <FireIcon />
                  </div>
                  <span className="action-label">Catat Kalori</span>
                  <span className="action-desc">Tambah makanan ke tracker harian</span>
                </button>

                <button 
                  className="action-card"
                  onClick={() => navigate('/chat')}
                >
                  <div className="action-icon action-icon-accent">
                    <LightbulbIcon />
                  </div>
                  <span className="action-label">Tanya AI</span>
                  <span className="action-desc">Dapatkan saran nutrisi personal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="content-card content-card-full">
            <div className="card-header">
              <h2 className="card-title">
                <LightbulbIcon className="card-title-icon" />
                Tips Kesehatan
              </h2>
            </div>
            <div className="card-body">
              <div className="tips-grid">
                {tips.map((tip, index) => (
                  <div key={index} className="tip-card">
                    <div className="tip-number">{index + 1}</div>
                    <p className="tip-text">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
