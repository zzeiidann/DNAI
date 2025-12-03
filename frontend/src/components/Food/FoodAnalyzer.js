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
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const trackCalories = () => {
    if (!result) return;

    const stored = localStorage.getItem('calorieData');
    const data = stored ? JSON.parse(stored) : [];
    
    data.push({
      id: Date.now(),
      date: new Date().toISOString(),
      name: result.food_name,
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
      confidence: result.confidence
    });

    localStorage.setItem('calorieData', JSON.stringify(data));
    setTracked(true);
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setTracked(false);
    setError('');
  };

  return (
    <AppLayout>
      <div className="dashboard-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Analisis Makanan</h1>
            <p className="page-subtitle">Upload foto makanan untuk mengetahui informasi nutrisinya</p>
          </div>
        </div>

        <div className="analyzer-content">
          {/* Upload Section */}
          <div className="content-card">
            <div className="card-header">
              <h2 className="card-title">
                <ImageIcon className="card-title-icon" />
                Upload Gambar
              </h2>
              {preview && (
                <button className="btn btn-ghost btn-sm" onClick={resetAnalysis}>
                  <RefreshIcon className="btn-icon" />
                  Reset
                </button>
              )}
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
                    <button
                      className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                      onClick={analyzeFood}
                      disabled={loading}
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
                      className="btn btn-secondary"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="btn-icon" />
                      Ganti Gambar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <AlertIcon className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Section */}
          {result && (
            <div className="content-card result-card-container">
              <div className="card-header">
                <h2 className="card-title">
                  <CheckCircleIcon className="card-title-icon" />
                  Hasil Analisis
                </h2>
              </div>
              <div className="card-body">
                <div className="food-result">
                  <div className="food-result-header">
                    <h3 className="food-result-name">{result.food_name}</h3>
                    <div className="confidence-badge">
                      {(result.confidence * 100).toFixed(0)}% akurasi
                    </div>
                  </div>

                  <div className="nutrition-grid">
                    <div className="nutrition-item nutrition-calories">
                      <FireIcon className="nutrition-icon" />
                      <span className="nutrition-value">{result.calories}</span>
                      <span className="nutrition-label">Kalori</span>
                    </div>
                    <div className="nutrition-item nutrition-protein">
                      <span className="nutrition-value">{result.protein}g</span>
                      <span className="nutrition-label">Protein</span>
                    </div>
                    <div className="nutrition-item nutrition-carbs">
                      <span className="nutrition-value">{result.carbs}g</span>
                      <span className="nutrition-label">Karbohidrat</span>
                    </div>
                    <div className="nutrition-item nutrition-fat">
                      <span className="nutrition-value">{result.fat}g</span>
                      <span className="nutrition-label">Lemak</span>
                    </div>
                  </div>

                  <div className="result-actions">
                    {!tracked ? (
                      <button className="btn btn-success btn-lg" onClick={trackCalories}>
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
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default FoodAnalyzer;
