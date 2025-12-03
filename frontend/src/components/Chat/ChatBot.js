import React, { useState, useRef, useEffect } from 'react';
import AppLayout from '../Layout/AppLayout';
import authService from '../../services/authService';
import { 
  SendIcon, 
  ChatIcon,
  RefreshIcon,
  LightbulbIcon
} from '../Icons/Icons';
import '../../styles/Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Halo! 👋 Saya asisten AI DNAI. Tanyakan apa saja tentang makanan, nutrisi, atau kalori!\n\nContoh pertanyaan:\n• "Berapa kalori dalam nasi goreng?"\n• "Makanan apa yang tinggi protein?"\n• "Tips diet sehat untuk pemula"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim pesan');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: 'Maaf, terjadi kesalahan. Pastikan GEMINI_API_KEY sudah dikonfigurasi di backend.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    { text: "Kalori nasi goreng?", icon: "🍛" },
    { text: "Makanan tinggi protein?", icon: "🥩" },
    { text: "Tips diet sehat?", icon: "🥗" },
    { text: "Cara menghitung kalori?", icon: "🔢" }
  ];

  const clearChat = () => {
    setMessages([{
      role: 'bot',
      content: 'Halo! 👋 Saya asisten AI DNAI. Tanyakan apa saja tentang makanan, nutrisi, atau kalori!'
    }]);
  };

  return (
    <AppLayout>
      <div className="dashboard-container chat-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Chat AI</h1>
            <p className="page-subtitle">Tanya jawab seputar nutrisi dan makanan dengan AI</p>
          </div>
          <button className="btn btn-ghost" onClick={clearChat}>
            <RefreshIcon className="btn-icon" />
            Reset Chat
          </button>
        </div>

        {/* Chat Container */}
        <div className="content-card chat-card">
          <div className="chat-messages-container">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <div className="message-avatar">
                  {msg.role === 'bot' ? (
                    <div className="avatar-bot">
                      <LightbulbIcon />
                    </div>
                  ) : (
                    <div className="avatar-user">U</div>
                  )}
                </div>
                <div className="message-content">
                  <div className="message-bubble">
                    {msg.content.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.content.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="message-avatar">
                  <div className="avatar-bot">
                    <LightbulbIcon />
                  </div>
                </div>
                <div className="message-content">
                  <div className="message-bubble typing">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="quick-questions">
              <span className="quick-label">Pertanyaan cepat:</span>
              <div className="quick-buttons">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="quick-btn"
                    onClick={() => setInput(q.text)}
                  >
                    <span className="quick-emoji">{q.icon}</span>
                    {q.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form className="chat-input-form" onSubmit={sendMessage}>
            <div className="input-wrapper">
              <input
                type="text"
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pertanyaan tentang makanan atau nutrisi..."
                disabled={loading}
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={loading || !input.trim()}
              >
                {loading ? (
                  <RefreshIcon className="spinning" />
                ) : (
                  <SendIcon />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}

export default ChatBot;
