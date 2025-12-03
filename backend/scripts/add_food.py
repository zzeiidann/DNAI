"""
Script to add new food items to the FAISS database
"""
import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.faiss_service import FAISSVectorDB


def main():
    parser = argparse.ArgumentParser(description='Add new food to DNAI database')
    parser.add_argument('--image', '-i', required=True, help='Path to food image')
    parser.add_argument('--id', required=True, help='Unique food ID (e.g., nasi_goreng)')
    parser.add_argument('--name', '-n', required=True, help='Food name in Indonesian')
    parser.add_argument('--calories', '-c', type=int, required=True, help='Calories (kcal)')
    parser.add_argument('--price', '-p', type=int, required=True, help='Price in IDR')
    parser.add_argument('--location', '-l', required=True, help='Location/restaurant name')
    parser.add_argument('--description', '-d', required=True, help='Description for CLIP')
    
    args = parser.parse_args()
    
    # Initialize FAISS service
    db = FAISSVectorDB(data_dir="data")
    
    # Add food
    success = db.add_food(
        food_id=args.id,
        nama_makanan=args.name,
        image_path=args.image,
        kalori=args.calories,
        harga=args.price,
        tempat=args.location,
        description=args.description
    )
    
    if success:
        print(f"\n✓ Successfully added {args.name} to database!")
        stats = db.get_stats()
        print(f"  Total foods now: {stats['indexed_items']}")
    else:
        print(f"\n✗ Failed to add food. Check the error above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
