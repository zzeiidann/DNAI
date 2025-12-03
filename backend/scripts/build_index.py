"""
Script to build/rebuild FAISS index from food images
Run this script after adding new food images to data/food_images/
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.faiss_service import FAISSVectorDB


def main():
    print("=" * 50)
    print("FAISS Index Builder for DNAI Food Database")
    print("=" * 50)
    
    # Initialize FAISS service
    db = FAISSVectorDB(data_dir="data")
    
    # Get current stats
    stats = db.get_stats()
    print(f"\nCurrent database stats:")
    print(f"  Total foods in metadata: {stats['total_foods']}")
    print(f"  Indexed items in FAISS: {stats['indexed_items']}")
    print(f"  Images directory: {stats['images_dir']}")
    print(f"  Index file: {stats['index_file']}")
    
    # Ask user if they want to rebuild
    if stats['indexed_items'] > 0:
        response = input("\nRebuild index? (y/n): ").strip().lower()
        if response == 'y':
            db.rebuild_index()
            print("\n✓ Index rebuilt successfully!")
    else:
        print("\nNo existing index found. Building new index...")
        db.rebuild_index()
        print("\n✓ Index built successfully!")
    
    # Show final stats
    stats = db.get_stats()
    print(f"\nFinal database stats:")
    print(f"  Total foods indexed: {stats['indexed_items']}")
    
    print("\n" + "=" * 50)
    print("Done! Your FAISS index is ready.")
    print("=" * 50)


if __name__ == "__main__":
    main()
