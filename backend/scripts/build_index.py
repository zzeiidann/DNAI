"""
Script to build/rebuild FAISS index from food images
Run this script after adding new food images to data/food_images/
"""
import sys
import os
import json
import faiss
import numpy as np
import torch
from PIL import Image
from pathlib import Path
from transformers import CLIPProcessor, CLIPModel

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def main():
    print("=" * 60)
    print("🍜 FAISS Index Builder for DNAI Food Database")
    print("=" * 60)
    
    data_dir = Path("data")
    images_dir = data_dir / "food_images"
    metadata_file = data_dir / "food_metadata.json"
    index_file = data_dir / "food_index.faiss"
    
    # Load metadata
    print(f"\n📖 Loading metadata from {metadata_file}")
    with open(metadata_file, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    foods = metadata.get("foods", [])
    print(f"   Found {len(foods)} food items")
    
    # Load CLIP model
    print("\n🤖 Loading CLIP model (this may take a moment)...")
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"   Using device: {device}")
    
    model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(device)
    processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
    print("   ✅ CLIP model loaded!")
    
    # Create FAISS index
    print("\n📊 Creating FAISS index...")
    embedding_dim = 512
    index = faiss.IndexFlatL2(embedding_dim)
    
    # Process all images
    print("\n🖼️ Processing images...")
    id_to_food = {}
    processed = 0
    skipped = 0
    
    for i, food in enumerate(foods):
        img_path = images_dir / food["image_file"]
        
        if img_path.exists():
            try:
                # Load and process image
                image = Image.open(img_path).convert("RGB")
                inputs = processor(images=image, return_tensors="pt").to(device)
                
                with torch.no_grad():
                    features = model.get_image_features(**inputs)
                    features = features / features.norm(dim=-1, keepdim=True)
                
                embedding = features.cpu().numpy().astype('float32')
                
                # Add to FAISS
                index.add(embedding)
                id_to_food[processed] = food["id"]
                processed += 1
                
                if processed <= 5 or processed % 20 == 0:
                    print(f"   ✓ {processed}: {food['nama_makanan'][:40]}")
                    
            except Exception as e:
                print(f"   ✗ Error: {food['image_file']} - {e}")
                skipped += 1
        else:
            skipped += 1
            if skipped <= 3:
                print(f"   ⚠ Missing: {food['image_file']}")
    
    # Save index
    print(f"\n💾 Saving FAISS index to {index_file}")
    faiss.write_index(index, str(index_file))
    
    # Save ID mapping
    mapping_file = data_dir / "id_mapping.json"
    with open(mapping_file, 'w') as f:
        json.dump(id_to_food, f)
    
    print(f"\n" + "=" * 60)
    print(f"📊 Summary:")
    print(f"   ✓ Indexed: {processed} food items")
    print(f"   ⚠ Skipped: {skipped} items")
    print(f"   📁 Index file: {index_file}")
    print(f"   📄 ID mapping: {mapping_file}")
    print(f"\n✅ FAISS index built successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
