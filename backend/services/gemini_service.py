"""
Gemini AI Chatbot Service
Provides conversational AI for food-related queries
"""
import os
import json
from pathlib import Path
import google.generativeai as genai


class GeminiChatbot:
    def __init__(self, data_dir: str = "data"):
        """Initialize Gemini model"""
        api_key = os.getenv("GEMINI_API_KEY")
        
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.5-flash')
            self.chat = self.model.start_chat(history=[])
        else:
            self.model = None
            self.chat = None
        
        # Load food database
        self.food_database = []
        metadata_path = Path(data_dir) / "food_metadata.json"
        if metadata_path.exists():
            with open(metadata_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.food_database = data.get('foods', [])
        
        # System prompt for food-related queries
        self.system_prompt = """
        Kamu adalah DNAI Assistant - AI chatbot yang fun, friendly, dan passionate tentang makanan Indonesia!
        
        PERSONALITY:
        - Gunakan bahasa santai, kasual, dan engaging (boleh pakai "kamu", "nih", "loh", "dong")
        - Antusias dan semangat saat ngasih rekomendasi
        - Kasih tips nutrisi dengan cara yang fun, bukan menggurui
        - Pakai emoji sesekali untuk ekspresi (tapi jangan berlebihan)
        - Kalau banyak pilihan, kasih 3-5 rekomendasi dengan mini review/deskripsi menarik
        
        RESPONSE STYLE:
        - Mulai dengan greeting yang warm atau komentar yang relate sama pertanyaan user
        - Format rekomendasi dengan struktur yang jelas dan eye-catching
        - Tambahkan fun facts, tips, atau insight tentang makanan
        - Akhiri dengan pertanyaan atau ajakan untuk eksplorasi lebih lanjut
        - Gunakan bullet points, numbering, atau format yang mudah dibaca
        
        DATA SOURCE:
        - Kamu punya akses ke database makanan lokal real dengan data kalori, harga, protein, karbo, lemak, lokasi
        - SELALU gunakan data dari database, JANGAN bikin asumsi
        - Kalau user tanya makanan tertentu tapi gak ada di database, jujur aja dan kasih alternatif terdekat
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
        
        # Format food database - only include relevant info
        food_list = []
        for food in self.food_database[:50]:  # Limit to 50 foods to avoid token limit
            food_list.append(
                f"- {food.get('nama_makanan')}: "
                f"{food.get('kalori', 0)} kal, "
                f"Rp {food.get('harga', 0)}, "
                f"Protein {food.get('protein', 0)}g, "
                f"Karbo {food.get('karbo', 0)}g, "
                f"Lemak {food.get('lemak', 0)}g, "
                f"Lokasi: {food.get('tempat', 'N/A')}"
            )
        
        food_db_str = "\n".join(food_list)
        
        database_context = f"""
        DATABASE MAKANAN TERSEDIA (50 first items):
        {food_db_str}
        
        CARA JAWAB PERTANYAAN:
        1. Kalau user cari makanan dengan kriteria (kalori, harga, protein, dll) → filter database dan kasih 3-5 pilihan terbaik
        2. Kalau user tanya info makanan tertentu → cari di database dan kasih detail lengkap
        3. Kalau user minta saran umum → pilih yang paling menarik/populer dari database
        4. Untuk setiap rekomendasi, kasih mini review/insight yang bikin menarik (rasa, tekstur, worth it atau ngga, dll)
        
        FORMAT REKOMENDASI (WAJIB IKUTI):
        - Kasih judul yang catchy pakai ### (heading 3)
        - List makanan pakai numbered list (1., 2., 3., dst)
        - SETIAP makanan WAJIB format: **Nama Makanan:** lalu detail di baris yang sama
        - Detail format: kalori kal, Rp harga, Protein Xg, Karbo Xg, Lemak Xg, Lokasi: nama_tempat
        - Setelah detail makanan, bisa kasih komentar/review di line baru
        - Akhiri dengan tips atau ajakan bertanya lebih lanjut
        
        CONTOH FORMAT:
        ### 🍽️ Rekomendasi Makanan Murah Meriah!
        
        1. **Pisang Keju:** 500 kal, Rp 12.000, Protein 18.8g, Karbo 62.5g, Lemak 19.4g, Lokasi: Kantin DNAI
           Pilihan oke banget nih! Harga murah tapi nutrition lengkap.
        
        2. **Nasi Goreng:** 450 kal, Rp 15.000, Protein 12g, Karbo 68g, Lemak 15g, Lokasi: Kantin DNAI
           Klasik yang gak pernah salah! Mengenyangkan dan affordable.
        """
        
        # Build the prompt
        full_prompt = f"{self.system_prompt}\n\n{database_context}\n\n{context_str}\n\nPertanyaan: {message}"
        
        try:
            response = self.chat.send_message(full_prompt)
            return response.text
        except Exception as e:
            return f"Maaf, terjadi kesalahan: {str(e)}"
