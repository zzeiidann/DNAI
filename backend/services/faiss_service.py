"""
FAISS Vector Database Service
Manages food image embeddings using CLIP + FAISS for similarity search
"""
import os
import json
import faiss
import numpy as np
import torch
from PIL import Image
from pathlib import Path
from transformers import CLIPProcessor, CLIPModel
from typing import Dict, List, Optional, Tuple


class FAISSVectorDB:
    def __init__(self, 
                 data_dir: str = "data",
                 index_file: str = "food_index.faiss",
                 embedding_dim: int = 512):
        """
        Initialize FAISS Vector Database for food images
        
        Args:
            data_dir: Directory containing food_images/ and food_metadata.json
            index_file: Name of FAISS index file
            embedding_dim: CLIP embedding dimension (512 for ViT-B/32)
        """
        self.data_dir = Path(data_dir)
        self.images_dir = self.data_dir / "food_images"
        self.metadata_file = self.data_dir / "food_metadata.json"
        self.index_file = self.data_dir / index_file
        self.embedding_dim = embedding_dim
        
        # Initialize CLIP model
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(self.device)
        self.processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        # Load metadata
        self.food_metadata = self._load_metadata()
        
        # Initialize or load FAISS index
        self.index = None
        self.id_to_food = {}  # Maps FAISS index to food ID
        self._initialize_index()
    
    def _load_metadata(self) -> Dict:
        """Load food metadata from JSON file"""
        if self.metadata_file.exists():
            with open(self.metadata_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"foods": []}
    
    def _save_metadata(self):
        """Save food metadata to JSON file"""
        with open(self.metadata_file, 'w', encoding='utf-8') as f:
            json.dump(self.food_metadata, f, ensure_ascii=False, indent=2)
    
    def _initialize_index(self):
        """Initialize or load existing FAISS index"""
        if self.index_file.exists():
            print(f"Loading existing FAISS index from {self.index_file}")
            self.index = faiss.read_index(str(self.index_file))
            # Rebuild id_to_food mapping
            for idx, food in enumerate(self.food_metadata["foods"]):
                self.id_to_food[idx] = food["id"]
        else:
            print("Creating new FAISS index...")
            # Use L2 distance for similarity search
            self.index = faiss.IndexFlatL2(self.embedding_dim)
            self._build_index_from_images()
    
    def _get_image_embedding(self, image: Image.Image) -> np.ndarray:
        """
        Get CLIP embedding for a single image
        
        Args:
            image: PIL Image object
        
        Returns:
            Normalized embedding vector as numpy array
        """
        inputs = self.processor(images=image, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            image_features = self.model.get_image_features(**inputs)
            # Normalize the embeddings
            image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        
        return image_features.cpu().numpy().astype('float32')
    
    def _build_index_from_images(self):
        """Build FAISS index from all images in food_images directory"""
        print("Building FAISS index from food images...")
        
        embeddings = []
        valid_foods = []
        
        for idx, food in enumerate(self.food_metadata["foods"]):
            image_path = self.images_dir / food["image_file"]
            
            if image_path.exists():
                try:
                    image = Image.open(image_path).convert("RGB")
                    embedding = self._get_image_embedding(image)
                    embeddings.append(embedding)
                    self.id_to_food[len(valid_foods)] = food["id"]
                    valid_foods.append(food)
                    print(f"  ✓ Indexed: {food['nama_makanan']}")
                except Exception as e:
                    print(f"  ✗ Error processing {food['image_file']}: {e}")
            else:
                print(f"  ⚠ Image not found: {food['image_file']}")
        
        if embeddings:
            # Stack embeddings and add to FAISS index
            embeddings_matrix = np.vstack(embeddings)
            self.index.add(embeddings_matrix)
            
            # Save the index
            faiss.write_index(self.index, str(self.index_file))
            print(f"FAISS index saved with {len(embeddings)} food items")
        else:
            print("No images found to index. Add images to data/food_images/")
    
    def rebuild_index(self):
        """Force rebuild of the FAISS index"""
        print("Rebuilding FAISS index...")
        self.index = faiss.IndexFlatL2(self.embedding_dim)
        self.id_to_food = {}
        self._build_index_from_images()
    
    def add_food(self, 
                 food_id: str,
                 nama_makanan: str,
                 image_path: str,
                 kalori: int,
                 harga: int,
                 tempat: str,
                 description: str) -> bool:
        """
        Add a new food item to the database
        
        Args:
            food_id: Unique identifier (e.g., "nasi_goreng")
            nama_makanan: Display name
            image_path: Path to the food image
            kalori: Calories
            harga: Price in IDR
            tempat: Location/restaurant
            description: Description for CLIP text matching
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Load and process image
            image = Image.open(image_path).convert("RGB")
            embedding = self._get_image_embedding(image)
            
            # Copy image to food_images directory
            image_filename = f"{food_id}.jpg"
            dest_path = self.images_dir / image_filename
            image.save(dest_path, "JPEG")
            
            # Add to FAISS index
            self.index.add(embedding)
            new_idx = self.index.ntotal - 1
            self.id_to_food[new_idx] = food_id
            
            # Add to metadata
            new_food = {
                "id": food_id,
                "nama_makanan": nama_makanan,
                "image_file": image_filename,
                "kalori": kalori,
                "harga": harga,
                "tempat": tempat,
                "description": description
            }
            self.food_metadata["foods"].append(new_food)
            
            # Save updated metadata and index
            self._save_metadata()
            faiss.write_index(self.index, str(self.index_file))
            
            print(f"Added {nama_makanan} to database")
            return True
            
        except Exception as e:
            print(f"Error adding food: {e}")
            return False
    
    def search(self, query_image: Image.Image, top_k: int = 3) -> List[Dict]:
        """
        Search for similar foods given a query image
        
        Args:
            query_image: PIL Image to search
            top_k: Number of results to return
        
        Returns:
            List of matching food items with similarity scores
        """
        if self.index.ntotal == 0:
            return []
        
        # Get query embedding
        query_embedding = self._get_image_embedding(query_image)
        
        # Search FAISS index
        distances, indices = self.index.search(query_embedding, min(top_k, self.index.ntotal))
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            
            food_id = self.id_to_food.get(idx)
            if food_id:
                # Find food metadata
                food_data = next(
                    (f for f in self.food_metadata["foods"] if f["id"] == food_id),
                    None
                )
                if food_data:
                    # Convert L2 distance to similarity score (0-100)
                    # Lower distance = higher similarity
                    similarity = max(0, 100 - (dist * 50))
                    results.append({
                        **food_data,
                        "confidence": round(similarity, 2),
                        "distance": float(dist)
                    })
        
        return results
    
    def search_by_bytes(self, image_bytes: bytes, top_k: int = 3) -> List[Dict]:
        """
        Search for similar foods given image bytes
        
        Args:
            image_bytes: Raw image bytes
            top_k: Number of results to return
        
        Returns:
            List of matching food items with similarity scores
        """
        import io
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return self.search(image, top_k)
    
    def get_all_foods(self) -> List[Dict]:
        """Get all foods in the database"""
        return self.food_metadata["foods"]
    
    def get_stats(self) -> Dict:
        """Get database statistics"""
        return {
            "total_foods": len(self.food_metadata["foods"]),
            "indexed_items": self.index.ntotal if self.index else 0,
            "embedding_dim": self.embedding_dim,
            "index_file": str(self.index_file),
            "images_dir": str(self.images_dir)
        }
