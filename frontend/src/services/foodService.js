// Food Service
// Handles food image analysis and tracking

import { AuthService } from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export class FoodService {
  /**
   * Analyze food image using CLIP RAG
   * Returns: { nama_makanan, kalori, harga, tempat, confidence }
   */
  static async analyzeFoodImage(imageFile) {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_URL}/api/food/analyze`, {
      method: 'POST',
      headers: {
        ...AuthService.getAuthHeader(),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Image analysis failed');
    }

    return await response.json();
  }

  /**
   * Track food consumption
   */
  static async trackFoodConsumption(foodName, calories) {
    const response = await fetch(`${API_URL}/api/food/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeader(),
      },
      body: JSON.stringify({
        food_name: foodName,
        calories: calories,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to track food');
    }

    return await response.json();
  }

  /**
   * Get daily calorie summary
   * Returns: { daily_goal, consumed, remaining, percentage }
   */
  static async getDailySummary() {
    const response = await fetch(`${API_URL}/api/food/daily-summary`, {
      method: 'GET',
      headers: {
        ...AuthService.getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get daily summary');
    }

    return await response.json();
  }
}
