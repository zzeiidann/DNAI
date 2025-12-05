#!/usr/bin/env python3
"""
Prepare Food Data for FAISS Indexing
Copies images and converts metadata to the correct format
"""
import os
import json
import shutil
from pathlib import Path


def main():
    """Main function to prepare data"""
    
    # Paths
    script_dir = Path(__file__).parent
    backend_dir = script_dir.parent
    project_root = backend_dir.parent
    
    src_images_dir = project_root / "food_images"
    src_metadata = project_root / "food_metadata.json"
    
    dest_images_dir = backend_dir / "data" / "food_images"
    dest_metadata = backend_dir / "data" / "food_metadata.json"
    
    print("=" * 60)
    print("🍜 DNAI Food Data Preparation")
    print("=" * 60)
    
    # Check source exists
    if not src_images_dir.exists():
        print(f"❌ Source images not found: {src_images_dir}")
        return 1
    
    if not src_metadata.exists():
        print(f"❌ Source metadata not found: {src_metadata}")
        return 1
    
    # Create destination directories
    dest_images_dir.mkdir(parents=True, exist_ok=True)
    
    # Load source metadata
    print(f"\n📖 Loading metadata from {src_metadata}")
    with open(src_metadata, 'r', encoding='utf-8') as f:
        source_foods = json.load(f)
    
    print(f"   Found {len(source_foods)} food items in metadata")
    
    # List source images
    src_images = list(src_images_dir.glob("*.jpg")) + list(src_images_dir.glob("*.png"))
    print(f"   Found {len(src_images)} images in source folder")
    
    # Convert metadata format and copy images
    print(f"\n📦 Processing images and metadata...")
    
    converted_foods = []
    copied_count = 0
    missing_count = 0
    
    for food in source_foods:
        # Original format: {id, name, image, price, calories}
        # Target format: {id, nama_makanan, image_file, kalori, harga, tempat, description}
        
        image_filename = food.get("image", "")
        src_image_path = src_images_dir / image_filename
        
        if src_image_path.exists():
            # Copy image
            dest_image_path = dest_images_dir / image_filename
            if not dest_image_path.exists():
                shutil.copy2(src_image_path, dest_image_path)
            copied_count += 1
            
            # Parse price (e.g., "Rp20.000" -> 20000)
            price_str = food.get("price", "Rp0")
            try:
                price = int(price_str.replace("Rp", "").replace(".", "").replace(",", ""))
            except:
                price = 0
            
            # Convert to new format
            converted_food = {
                "id": str(food.get("id", copied_count)),
                "nama_makanan": food.get("name", "Unknown"),
                "image_file": image_filename,
                "kalori": food.get("calories", 0),
                "harga": price,
                "tempat": "Kantin DNAI",  # Default location
                "description": f"{food.get('name', '')} - makanan Indonesia"
            }
            converted_foods.append(converted_food)
            
            if copied_count <= 5 or copied_count % 20 == 0:
                print(f"   ✓ {copied_count}: {converted_food['nama_makanan'][:40]}")
        else:
            missing_count += 1
            if missing_count <= 5:
                print(f"   ⚠ Missing image: {image_filename}")
    
    if missing_count > 5:
        print(f"   ... and {missing_count - 5} more missing images")
    
    # Save converted metadata
    final_metadata = {"foods": converted_foods}
    
    print(f"\n💾 Saving metadata to {dest_metadata}")
    with open(dest_metadata, 'w', encoding='utf-8') as f:
        json.dump(final_metadata, f, ensure_ascii=False, indent=2)
    
    print(f"\n" + "=" * 60)
    print(f"📊 Summary:")
    print(f"   ✓ Processed: {copied_count} images")
    print(f"   ⚠ Missing: {missing_count} images")
    print(f"   📄 Metadata: {len(converted_foods)} food items saved")
    print(f"\n✅ Data preparation complete!")
    print(f"   Next: Run 'python scripts/build_index.py' to build FAISS index")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    exit(main())
