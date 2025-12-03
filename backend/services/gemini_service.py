"""
Gemini AI Chatbot Service
Provides conversational AI for food-related queries
"""
import os
import google.generativeai as genai


class GeminiChatbot:
    def __init__(self):
        """Initialize Gemini model"""
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-pro')
            self.chat = self.model.start_chat(history=[])
        else:
            self.model = None
            self.chat = None
        
        # System prompt for food-related queries
        self.system_prompt = """
        Kamu adalah asisten AI yang membantu pengguna dengan informasi makanan, 
        kalori, harga, dan lokasi makanan di Indonesia. 
        Berikan jawaban yang informatif, ramah, dan dalam Bahasa Indonesia.
        Fokus pada makanan Indonesia dan Asia.
        """
    
    async def get_response(self, message: str, user_context: dict) -> str:
        """
        Get AI response using Gemini
        
        Args:
            message: User's question
            user_context: User's calorie goal, consumed foods, etc.
        
        Returns:
            AI response string
        """
        if not self.model:
            return "Maaf, Gemini API belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di file .env"
        
        # Format user context
        context_str = f"""
        Konteks Pengguna:
        - Target Kalori Harian: {user_context.get('daily_calorie_goal', 'Tidak diatur')}
        - Kalori Terkonsumsi Hari Ini: {user_context.get('consumed_calories', 0)}
        - Makanan Terakhir: {', '.join(user_context.get('recent_foods', []))}
        """
        
        # Build the prompt
        full_prompt = f"{self.system_prompt}\n\n{context_str}\n\nPertanyaan: {message}"
        
        try:
            response = self.chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            return f"Maaf, terjadi kesalahan: {str(e)}"
