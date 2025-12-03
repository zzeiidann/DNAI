"""
CLIP RAG Service for Food Image Analysis
Uses CLIP model + FAISS Vector Database for food recognition
"""
import io
from PIL import Image
from typing import Dict, List, Optional
from services.faiss_service import FAISSVectorDB


class CLIPService:
    _instance = None
    _faiss_db = None
    
    def __new__(cls):
        """Singleton pattern to avoid loading model multiple times"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, data_dir: str = "data"):
        """
        Initialize CLIP Service with FAISS Vector Database
        
        Args:
            data_dir: Directory containing food_images/ and food_metadata.json
        """
        if CLIPService._faiss_db is None:
            print("Initializing FAISS Vector Database...")
            CLIPService._faiss_db = FAISSVectorDB(data_dir=data_dir)
            print(f"FAISS DB initialized with {self._faiss_db.index.ntotal} food items")
    
    @property
    def faiss_db(self) -> FAISSVectorDB:
        """Get FAISS database instance"""
        return CLIPService._faiss_db
    
    async def analyze_food_image(self, image_bytes: bytes, top_k: int = 1) -> Dict:
        """
        Analyze food image using CLIP + FAISS RAG
        
        Args:
            image_bytes: Raw image bytes from upload
            top_k: Number of top matches to consider (default: 1)
        
        Returns:
            {
                "nama_makanan": str,
                "kalori": int,
                "harga": int,
                "tempat": str,
                "confidence": float,
                "alternatives": List[Dict]  # Other possible matches
            }
        """
        # Search FAISS database
        results = self.faiss_db.search_by_bytes(image_bytes, top_k=max(top_k, 3))
        
        if not results:
            return {
                "nama_makanan": "Unknown",
                "kalori": 0,
                "harga": 0,
                "tempat": "Unknown",
                "confidence": 0,
                "alternatives": [],
                "error": "No matching food found in database"
            }
        
        # Best match
        best_match = results[0]
        
        return {
            "nama_makanan": best_match["nama_makanan"],
            "kalori": best_match["kalori"],
            "harga": best_match["harga"],
            "tempat": best_match["tempat"],
            "confidence": best_match["confidence"],
            "alternatives": results[1:] if len(results) > 1 else []
        }
    
    async def get_all_foods(self) -> List[Dict]:
        """Get all foods in the database"""
        return self.faiss_db.get_all_foods()
    
    async def add_food(self, 
                       food_id: str,
                       nama_makanan: str,
                       image_bytes: bytes,
                       kalori: int,
                       harga: int,
                       tempat: str,
                       description: str) -> bool:
        """
        Add new food to the database
        
        Args:
            food_id: Unique ID (e.g., "nasi_goreng")
            nama_makanan: Food name
            image_bytes: Image data
            kalori: Calories
            harga: Price in IDR
            tempat: Location
            description: Description for search
        
        Returns:
            True if successful
        """
        import tempfile
        
        # Save image to temp file first
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
            tmp.write(image_bytes)
            tmp_path = tmp.name
        
        try:
            return self.faiss_db.add_food(
                food_id=food_id,
                nama_makanan=nama_makanan,
                image_path=tmp_path,
                kalori=kalori,
                harga=harga,
                tempat=tempat,
                description=description
            )
        finally:
            import os
            os.unlink(tmp_path)
    
    def get_database_stats(self) -> Dict:
        """Get database statistics"""
        return self.faiss_db.get_stats()
    
    def rebuild_index(self):
        """Force rebuild FAISS index"""
        self.faiss_db.rebuild_index()
