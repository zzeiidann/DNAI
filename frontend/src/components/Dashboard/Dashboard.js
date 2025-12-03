import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogoSimple } from '../Logo/Logo';
import authService from '../../services/authService';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Simple Icons
const Icon = {
  Camera: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Fire: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Chat: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
  Send: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Check: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  Logout: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Menu: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Sun: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Theme
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('dnai_theme');
    return saved ? saved === 'dark' : true;
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [calorieData, setCalorieData] = useState([]);
  const [todayCalories, setTodayCalories] = useState(0);
  const targetCalories = 2000;
  
  // Food Analyzer
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [foodResult, setFoodResult] = useState(null);
  const [tracked, setTracked] = useState(false);
  const fileInputRef = useRef(null);
  
  // Chat - Multiple Conversations
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('dnai_conversations');
    if (saved) return JSON.parse(saved);
    return [{
      id: Date.now(),
      title: 'Chat Baru',
      messages: [{ role: 'bot', content: 'Halo! Saya DNAI Assistant. Tanyakan tentang nutrisi, kalori, atau tips diet!' }]
    }];
  });
  const [activeConversation, setActiveConversation] = useState(() => {
    const saved = localStorage.getItem('dnai_conversations');
    if (saved) {
      const convs = JSON.parse(saved);
      return convs[0]?.id || Date.now();
    }
    return Date.now();
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  
  // Manual Entry
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualEntry, setManualEntry] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('dnai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('dnai_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('calorieData');
    if (stored) {
      const data = JSON.parse(stored);
      setCalorieData(data);
      const today = new Date().toDateString();
      const todayData = data.filter(e => new Date(e.date).toDateString() === today);
      setTodayCalories(todayData.reduce((sum, e) => sum + (e.calories || 0), 0));
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeConversation]);

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setFoodResult(null);
      setTracked(false);
    }
  };

  const analyzeFood = async () => {
    if (!selectedFile) return;
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(`${API_URL}/food/analyze`, {
        method: 'POST',
        headers: authService.getAuthHeader(),
        body: formData,
      });
      if (!response.ok) throw new Error('Gagal menganalisis');
      setFoodResult(await response.json());
    } catch (err) {
      alert('Gagal menganalisis gambar');
    } finally {
      setAnalyzing(false);
    }
  };

  const addToTracker = (food) => {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      name: food.food_name || food.name,
      calories: food.calories,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fat: food.fat || 0
    };
    const updated = [...calorieData, newEntry];
    setCalorieData(updated);
    localStorage.setItem('calorieData', JSON.stringify(updated));
    const today = new Date().toDateString();
    setTodayCalories(updated.filter(e => new Date(e.date).toDateString() === today).reduce((sum, e) => sum + (e.calories || 0), 0));
    setTracked(true);
  };

  const deleteEntry = (id) => {
    const updated = calorieData.filter(e => e.id !== id);
    setCalorieData(updated);
    localStorage.setItem('calorieData', JSON.stringify(updated));
    const today = new Date().toDateString();
    setTodayCalories(updated.filter(e => new Date(e.date).toDateString() === today).reduce((sum, e) => sum + (e.calories || 0), 0));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    addToTracker({ name: manualEntry.name, calories: parseInt(manualEntry.calories) || 0, protein: parseFloat(manualEntry.protein) || 0, carbs: parseFloat(manualEntry.carbs) || 0, fat: parseFloat(manualEntry.fat) || 0 });
    setManualEntry({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setShowManualForm(false);
  };

  // Chat Functions
  const getCurrentConversation = () => {
    return conversations.find(c => c.id === activeConversation) || conversations[0];
  };

  const createNewChat = () => {
    const newConv = {
      id: Date.now(),
      title: 'Chat Baru',
      messages: [{ role: 'bot', content: 'Halo! Saya DNAI Assistant. Tanyakan tentang nutrisi, kalori, atau tips diet!' }]
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversation(newConv.id);
  };

  const deleteChat = (id) => {
    if (conversations.length === 1) {
      const newConv = {
        id: Date.now(),
        title: 'Chat Baru',
        messages: [{ role: 'bot', content: 'Halo! Saya DNAI Assistant. Tanyakan tentang nutrisi, kalori, atau tips diet!' }]
      };
      setConversations([newConv]);
      setActiveConversation(newConv.id);
    } else {
      const updated = conversations.filter(c => c.id !== id);
      setConversations(updated);
      if (activeConversation === id) {
        setActiveConversation(updated[0].id);
      }
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation) {
        const newTitle = conv.messages.length === 1 ? userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '') : conv.title;
        return {
          ...conv,
          title: newTitle,
          messages: [...conv.messages, { role: 'user', content: userMessage }]
        };
      }
      return conv;
    }));
    
    setChatLoading(true);
    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authService.getAuthHeader() },
        body: JSON.stringify({ message: userMessage })
      });
      if (!response.ok) throw new Error('Failed');
      const data = await response.json();
      
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          return {
            ...conv,
            messages: [...conv.messages, { role: 'bot', content: data.response }]
          };
        }
        return conv;
      }));
    } catch (err) {
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          return {
            ...conv,
            messages: [...conv.messages, { role: 'bot', content: 'Maaf, terjadi kesalahan.' }]
          };
        }
        return conv;
      }));
    } finally {
      setChatLoading(false);
    }
  };

  const todayEntries = calorieData.filter(e => new Date(e.date).toDateString() === new Date().toDateString());
  const calorieProgress = Math.min((todayCalories / targetCalories) * 100, 100);
  const remaining = targetCalories - todayCalories;
  const currentChat = getCurrentConversation();

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="header">
        <div className="header-brand" onClick={() => navigate('/')}>
          <LogoSimple size="32px" />
        </div>
        
        <nav className="header-nav">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <Icon.Camera /> <span>Dashboard</span>
          </button>
          <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>
            <Icon.Chat /> <span>Chat AI</span>
          </button>
        </nav>

        <div className="header-user">
          <button className="btn-theme" onClick={toggleTheme} title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
            {isDarkMode ? <Icon.Sun /> : <Icon.Moon />}
          </button>
          <div className="user-avatar">{user.name?.charAt(0) || 'U'}</div>
          <span>{user.name || 'User'}</span>
          <button className="btn-logout" onClick={handleLogout}><Icon.Logout /></button>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        
        {/* DASHBOARD TAB (includes Analyzer + Tracker) */}
        {activeTab === 'dashboard' && (
          <div className="content fade-in">
            {/* Stats Row */}
            <div className="stats-row">
              <div className="stat-card main-stat">
                <div className="calorie-ring">
                  <svg viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                    <circle className="ring-bg" cx="50" cy="50" r="42" />
                    <circle className="ring-fill" cx="50" cy="50" r="42" 
                      style={{ strokeDashoffset: 264 - (264 * calorieProgress / 100), stroke: 'url(#ring-gradient)' }} />
                  </svg>
                  <div className="ring-text">
                    <strong>{todayCalories}</strong>
                    <span>kkal</span>
                  </div>
                </div>
                <div className="stat-detail">
                  <h3>Kalori Hari Ini</h3>
                  <p>{Math.round(calorieProgress)}% dari target {targetCalories} kkal</p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${calorieProgress}%` }}></div>
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon blue"><Icon.Fire /></div>
                <div className="stat-value">{remaining > 0 ? remaining : 0}</div>
                <div className="stat-label">Sisa Kalori</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon green"><Icon.Check /></div>
                <div className="stat-value">{todayEntries.length}</div>
                <div className="stat-label">Makanan Hari Ini</div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="two-column">
              {/* Left: Analyzer */}
              <div className="section">
                <h2 className="section-title"><Icon.Camera /> Analisis Makanan</h2>
                <p className="section-desc">Upload foto makanan untuk mengetahui nutrisinya</p>
                
                <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} hidden />
                  {!preview ? (
                    <div className="upload-placeholder">
                      <div className="upload-icon"><Icon.Upload /></div>
                      <p>Klik untuk upload gambar</p>
                      <span>JPG, PNG, WEBP</span>
                    </div>
                  ) : (
                    <div className="preview-box">
                      <img src={preview} alt="Preview" />
                    </div>
                  )}
                </div>

                {preview && !foodResult && (
                  <button className="btn-analyze" onClick={analyzeFood} disabled={analyzing}>
                    {analyzing ? <><span className="loader"></span> Menganalisis...</> : <><Icon.Camera /> Analisis Sekarang</>}
                  </button>
                )}

                {foodResult && (
                  <div className="result-box">
                    <div className="result-header">
                      <h3>{foodResult.food_name}</h3>
                      <span className="accuracy">{(foodResult.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="nutrition-row">
                      <div className="nutri"><span className="val orange">{foodResult.calories}</span><span className="lbl">Kalori</span></div>
                      <div className="nutri"><span className="val blue">{foodResult.protein}g</span><span className="lbl">Protein</span></div>
                      <div className="nutri"><span className="val purple">{foodResult.carbs}g</span><span className="lbl">Karbo</span></div>
                      <div className="nutri"><span className="val cyan">{foodResult.fat}g</span><span className="lbl">Lemak</span></div>
                    </div>
                    {!tracked ? (
                      <button className="btn-add" onClick={() => addToTracker(foodResult)}><Icon.Plus /> Tambah ke Tracker</button>
                    ) : (
                      <div className="success-msg"><Icon.Check /> Ditambahkan!</div>
                    )}
                  </div>
                )}

                {!preview && (
                  <div className="tips-box">
                    <h4>Tips:</h4>
                    <ul>
                      <li>Pastikan foto jelas dan terang</li>
                      <li>Fokus pada makanan utama</li>
                      <li>Hindari foto dengan banyak objek</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Right: Tracker */}
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title"><Icon.Fire /> Kalori Tracker</h2>
                  <button className="btn-small" onClick={() => setShowManualForm(true)}><Icon.Plus /> Tambah</button>
                </div>
                
                {todayEntries.length === 0 ? (
                  <div className="empty-state">
                    <Icon.Fire />
                    <p>Belum ada makanan tercatat hari ini</p>
                  </div>
                ) : (
                  <div className="log-list">
                    {todayEntries.map(entry => (
                      <div key={entry.id} className="log-item">
                        <div className="log-info">
                          <strong>{entry.name}</strong>
                          <span>P: {entry.protein}g • K: {entry.carbs}g • L: {entry.fat}g</span>
                        </div>
                        <div className="log-cal">{entry.calories} kkal</div>
                        <button className="btn-delete" onClick={() => deleteEntry(entry.id)}><Icon.Trash /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Manual Form Modal */}
            {showManualForm && (
              <div className="modal-overlay" onClick={() => setShowManualForm(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Tambah Makanan</h2>
                    <button onClick={() => setShowManualForm(false)}><Icon.Close /></button>
                  </div>
                  <form onSubmit={handleManualSubmit}>
                    <div className="form-group">
                      <label>Nama Makanan</label>
                      <input type="text" value={manualEntry.name} onChange={e => setManualEntry({...manualEntry, name: e.target.value})} placeholder="Nasi Goreng" required />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Kalori</label>
                        <input type="number" value={manualEntry.calories} onChange={e => setManualEntry({...manualEntry, calories: e.target.value})} placeholder="0" required />
                      </div>
                      <div className="form-group">
                        <label>Protein (g)</label>
                        <input type="number" value={manualEntry.protein} onChange={e => setManualEntry({...manualEntry, protein: e.target.value})} placeholder="0" />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Karbo (g)</label>
                        <input type="number" value={manualEntry.carbs} onChange={e => setManualEntry({...manualEntry, carbs: e.target.value})} placeholder="0" />
                      </div>
                      <div className="form-group">
                        <label>Lemak (g)</label>
                        <input type="number" value={manualEntry.fat} onChange={e => setManualEntry({...manualEntry, fat: e.target.value})} placeholder="0" />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary full"><Icon.Check /> Simpan</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CHAT TAB - Multiple Conversations */}
        {activeTab === 'chat' && (
          <div className="content fade-in chat-layout">
            {/* Chat Sidebar */}
            <div className={`chat-sidebar ${showChatSidebar ? 'open' : ''}`}>
              <div className="sidebar-header">
                <h3>Conversations</h3>
                <button className="btn-new-chat" onClick={createNewChat}><Icon.Plus /></button>
              </div>
              <div className="conversation-list">
                {conversations.map(conv => (
                  <div 
                    key={conv.id} 
                    className={`conversation-item ${conv.id === activeConversation ? 'active' : ''}`}
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <Icon.Chat />
                    <span className="conv-title">{conv.title}</span>
                    <button className="btn-delete-conv" onClick={(e) => { e.stopPropagation(); deleteChat(conv.id); }}>
                      <Icon.Trash />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Main */}
            <div className="chat-main">
              <div className="chat-box">
                <div className="chat-header">
                  <button className="btn-toggle-sidebar" onClick={() => setShowChatSidebar(!showChatSidebar)}>
                    <Icon.Menu />
                  </button>
                  <div className="chat-avatar">AI</div>
                  <div>
                    <h3>DNAI Assistant</h3>
                    <span className="online">Online</span>
                  </div>
                </div>
                
                <div className="chat-messages">
                  {currentChat?.messages.map((msg, idx) => (
                    <div key={idx} className={`msg ${msg.role}`}>
                      {msg.role === 'bot' && <div className="msg-avatar">AI</div>}
                      <div className="msg-text">{msg.content}</div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="msg bot">
                      <div className="msg-avatar">AI</div>
                      <div className="msg-text typing"><span></span><span></span><span></span></div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-input" onSubmit={sendMessage}>
                  <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Tanyakan tentang nutrisi..." disabled={chatLoading} />
                  <button type="submit" disabled={!chatInput.trim() || chatLoading}><Icon.Send /></button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
