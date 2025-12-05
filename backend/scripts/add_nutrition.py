#!/usr/bin/env python3
"""
Script to add estimated nutrition data (protein, carbs, fat) to food metadata.
Uses reasonable estimates based on Indonesian food types.
"""
import json
import os
import re

def estimate_nutrition(food_name: str, kalori: int):
    """
    Estimate protein, carbs, fat based on food type and calories.
    Uses typical Indonesian food macronutrient ratios.
    """
    food_lower = food_name.lower()
    
    # Default macro ratios (protein %, carbs %, fat %)
    # 1g protein = 4 kcal, 1g carbs = 4 kcal, 1g fat = 9 kcal
    
    # Rice-based dishes (high carb)
    if any(x in food_lower for x in ['nasi', 'bubur', 'lontong', 'ketupat']):
        protein_pct, carbs_pct, fat_pct = 0.15, 0.55, 0.30
    
    # Noodle dishes (high carb)
    elif any(x in food_lower for x in ['mie', 'mi ', 'kwetiau', 'bihun', 'ramen']):
        protein_pct, carbs_pct, fat_pct = 0.12, 0.55, 0.33
    
    # Meat-heavy dishes (high protein)
    elif any(x in food_lower for x in ['ayam', 'bebek', 'sapi', 'kambing', 'daging', 'ikan', 'udang', 'sate', 'rendang', 'bistik']):
        protein_pct, carbs_pct, fat_pct = 0.30, 0.35, 0.35
    
    # Fried foods (high fat)
    elif any(x in food_lower for x in ['goreng', 'gorengan', 'crispy', 'geprek']):
        protein_pct, carbs_pct, fat_pct = 0.15, 0.45, 0.40
    
    # Soup/broth dishes
    elif any(x in food_lower for x in ['soto', 'sup', 'soup', 'bakso', 'rawon']):
        protein_pct, carbs_pct, fat_pct = 0.25, 0.45, 0.30
    
    # Snacks/small bites
    elif any(x in food_lower for x in ['siomay', 'batagor', 'pempek', 'cilok', 'cireng', 'dimsum', 'takoyaki']):
        protein_pct, carbs_pct, fat_pct = 0.20, 0.50, 0.30
    
    # Bread/bakery
    elif any(x in food_lower for x in ['roti', 'donut', 'pizza', 'sandwich']):
        protein_pct, carbs_pct, fat_pct = 0.12, 0.55, 0.33
    
    # Ice cream/desserts
    elif any(x in food_lower for x in ['es ', 'ice', 'krim', 'pudding', 'dessert', 'kue']):
        protein_pct, carbs_pct, fat_pct = 0.05, 0.65, 0.30
    
    # Drinks
    elif any(x in food_lower for x in ['teh', 'kopi', 'jus', 'juice', 'minuman', 'lemon', 'jeruk']):
        protein_pct, carbs_pct, fat_pct = 0.02, 0.95, 0.03
    
    # Default ratio for unknown foods
    else:
        protein_pct, carbs_pct, fat_pct = 0.15, 0.50, 0.35
    
    # Calculate grams from calories
    # protein = (kalori * protein_pct) / 4
    # carbs = (kalori * carbs_pct) / 4
    # fat = (kalori * fat_pct) / 9
    
    protein = round((kalori * protein_pct) / 4, 1)
    carbs = round((kalori * carbs_pct) / 4, 1)
    fat = round((kalori * fat_pct) / 9, 1)
    
    return protein, carbs, fat


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, '..', 'data')
    metadata_path = os.path.join(data_dir, 'food_metadata.json')
    
    # Read existing metadata
    with open(metadata_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    foods = data.get('foods', [])
    updated_count = 0
    
    for food in foods:
        name = food.get('nama_makanan', '')
        kalori = food.get('kalori', 0)
        
        # Calculate estimated nutrition
        protein, carbs, fat = estimate_nutrition(name, kalori)
        
        # Add to food data
        food['protein'] = protein
        food['karbo'] = carbs
        food['lemak'] = fat
        
        updated_count += 1
        print(f"  {name}: {kalori}kcal -> P:{protein}g C:{carbs}g F:{fat}g")
    
    # Save updated metadata
    with open(metadata_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Updated {updated_count} foods with nutrition data")
    print(f"   Saved to: {metadata_path}")


if __name__ == '__main__':
    main()
