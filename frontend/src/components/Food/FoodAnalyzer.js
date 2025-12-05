import React, { useState, useRef } from 'react';
import AppLayout from '../Layout/AppLayout';
import authService from '../../services/authService';
import { 
  UploadIcon, 
  ImageIcon, 
  SearchIcon, 
  CheckCircleIcon,
  PlusIcon,
  RefreshIcon,
  FireIcon,
  AlertIcon
} from '../Icons/Icons';
import '../../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function FoodAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tracked, setTracked] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setSelectedFood(null);
      setTracked(false);
      setError('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setSelectedFood(null);
      setTracked(false);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const analyzeFood = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_URL}/food/analyze`, {
        method: 'POST',
        headers: authService.getAuthHeader(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis gambar');
      }

      const data = await response.json();
      console.log('API Response:', data);
      setResult(data);
      setSelectedFood({
        food_name: data.food_name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        confidence: data.confidence
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectFood = (food, isMain = false) => {
    if (isMain && result) {
      setSelectedFood({
        food_name: result.food_name,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
        confidence: result.confidence
      });
    } else if (food) {
      setSelectedFood({
        food_name: food.food_name,
        calories: food.calories,
        protein: food.protein || 0,
        carbs: food.carbs || 0,
        fat: food.fat || 0,
        confidence: food.confidence
      });
    }
    setTracked(false);
  };

  const trackCalories = () => {
    if (!selectedFood) return;

    const stored = localStorage.getItem('calorieData');
    const data = stored ? JSON.parse(stored) : [];
    
    data.push({
      id: Date.now(),
      date: new Date().toISOString(),
      name: selectedFood.food_name,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      confidence: selectedFood.confidence
    });

    localStorage.setItem('calorieData', JSON.stringify(data));
    setTracked(true);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setSelectedFood(null);
    setTracked(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <AppLayout>
      <div className="dashboard-container">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Analisis Makanan</h1>
            <p className="page-subtitle">Upload foto makanan untuk mengetahui informasi nutrisinya</p>
          </div>
        </div>

        <div className="analyzer-content">
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <ImageIcon className="card-title-icon" />
                Upload Gambar
              </h2>
            </div>
            <div className="card-body">
              {!preview ? (
                <div
                  className={`upload-zone ${isDragging ? 'dragging' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                  <div className="upload-icon">
                    <UploadIcon />
                  </div>
                  <p className="upload-text">Klik atau drag & drop gambar makanan</p>
                  <p className="upload-hint">Format: JPG, PNG, WEBP (Max 10MB)</p>
                </div>
              ) : (
                <div className="preview-section">
                  <div className="image-preview">
                    <img src={preview} alt="Preview makanan" />
                  </div>
                  <div className="preview-actions">
                    {!result ? (
                      <>
                        <button
                          className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                          onClick={analyzeFood}
                          disabled={loading}
                          type="button"
                        >
                          {loading ? (
                            <>
                              <RefreshIcon className="btn-icon spinning" />
                              Menganalisis...
                            </>
                          ) : (
                            <>
                              <SearchIcon className="btn-icon" />
                              Analisis Makanan
                            </>
                          )}
                        </button>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          onClick={resetAnalysis}
                        >
                          <RefreshIcon className="btn-icon" />
                          Ganti Gambar
                        </button>
                      </>
                    ) : (
                      <button 
                        type="button"
                        className="btn btn-primary"
                        onClick={resetAnalysis}
                        style={{ background: '#ef4444' }}
                      >
                        <RefreshIcon className="btn-icon" />
                        🔄 Upload Gambar Baru
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertIcon className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="content-card result-card-container">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">
                  <CheckCircleIcon className="card-title-icon" />
                  Hasil Analisis
                </h2>
                <button 
                  type="button"
                  onClick={resetAnalysis}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 RESET
                </button>
              </div>
              <div className="card-body">
                {/* Pilihan Makanan */}
                <div style={{ 
                  marginBottom: '2rem', 
                  padding: '1.5rem',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '12px',
                  border: '2px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <p style={{ 
                    fontSize: '1.1rem', 
                    color: '#fff',
                    fontWeight: 'bold',
                    marginBottom: '1rem' 
                  }}>
                    ⚠️ Bukan makanan yang tepat? Pilih alternatif di bawah:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {/* Main Result */}
                    <button
                      type="button"
                      onClick={() => selectFood(null, true)}
                      style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '12px',
                        border: selectedFood?.food_name === result.food_name 
                          ? '3px solid #10b981' 
                          : '2px solid rgba(16, 185, 129, 0.5)',
                        background: selectedFood?.food_name === result.food_name 
                          ? 'rgba(16, 185, 129, 0.3)' 
                          : 'rgba(16, 185, 129, 0.1)',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>✅</span>
                        <span>{result.food_name}</span>
                      </div>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.5)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        color: '#10b981',
                        fontWeight: 'bold'
                      }}>
                        {(result.confidence * 100).toFixed(0)}% Match
                      </span>
                    </button>
                    
                    {/* Alternatives */}
                    {result.alternatives && result.alternatives.length > 0 && result.alternatives.map((alt, index) => (
                      <button
                        type="button"
                        key={index}
                        onClick={() => selectFood(alt)}
                        style={{
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                          border: selectedFood?.food_name === alt.food_name 
                            ? '3px solid #f59e0b' 
                            : '2px solid rgba(245, 158, 11, 0.5)',
                          background: selectedFood?.food_name === alt.food_name 
                            ? 'rgba(245, 158, 11, 0.3)' 
                            : 'rgba(245, 158, 11, 0.1)',
                          color: '#fff',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>🤔</span>
                          <span>{alt.food_name}</span>
                        </div>
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.5)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.875rem',
                          color: '#f59e0b',
                          fontWeight: 'bold'
                        }}>
                          {(alt.confidence * 100).toFixed(0)}% Match
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Food Details */}
                {selectedFood && (
                  <div className="food-result">
                    <div className="food-result-header">
                      <h3 className="food-result-name">{selectedFood.food_name}</h3>
                      <div className="confidence-badge">
                        {(selectedFood.confidence * 100).toFixed(0)}% akurasi
                      </div>
                    </div>

                    <div className="nutrition-grid">
                      <div className="nutrition-item nutrition-calories">
                        <FireIcon className="nutrition-icon" />
                        <span className="nutrition-value">{selectedFood.calories}</span>
                        <span className="nutrition-label">Kalori</span>
                      </div>
                      <div className="nutrition-item nutrition-protein">
                        <span className="nutrition-value">{selectedFood.protein}g</span>
                        <span className="nutrition-label">Protein</span>
                      </div>
                      <div className="nutrition-item nutrition-carbs">
                        <span className="nutrition-value">{selectedFood.carbs}g</span>
                        <span className="nutrition-label">Karbohidrat</span>
                      </div>
                      <div className="nutrition-item nutrition-fat">
                        <span className="nutrition-value">{selectedFood.fat}g</span>
                        <span className="nutrition-label">Lemak</span>
                      </div>
                    </div>

                    <div className="result-actions">
                      {!tracked ? (
                        <button type="button" className="btn btn-success btn-lg" onClick={trackCalories}>
                          <PlusIcon className="btn-icon" />
                          Tambahkan ke Tracker
                        </button>
                      ) : (
                        <div className="success-message">
                          <CheckCircleIcon className="success-icon" />
                          <span>Berhasil ditambahkan ke tracker!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default FoodAnalyzer;
