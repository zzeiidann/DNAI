// Chat Service
// Handles AI chatbot interactions with Gemini + LangChain

import { AuthService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class ChatService {
  /**
   * Send message to AI chatbot
   * Gemini AI with LangChain integration for food-related queries
   */
  static async sendMessage(message) {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get chatbot response');
    }

    const data = await response.json();
    return data.response;
  }
}
