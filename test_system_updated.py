#!/usr/bin/env python3
"""
Test script for the Service Matching Website problem detection system.
Updated to focus on category detection and organization only - no surveys.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.problem_detector import ProblemDetector, ServiceCategory, CategoryOrganizer

def test_problem_detection():
    """Test the problem detection system with various scenarios."""
    
    detector = ProblemDetector()
    
    test_cases = [
        {
            "description": "My kitchen tap is not removing water properly and there's a strange sound when I turn it on",
            "expected_category": ServiceCategory.PLUMBING
        },
        {
            "description": "The lights in my living room keep flickering and sometimes go out completely",
            "expected_category": ServiceCategory.ELECTRICAL
        },
        {
            "description": "I need someone to deep clean my house before my family visits next week",
            "expected_category": ServiceCategory.CLEANING
        },
        {
            "description": "My toilet is overflowing and water is everywhere - this is an emergency!",
            "expected_category": ServiceCategory.PLUMBING
        },
        {
            "description": "I want to build a deck in my backyard this summer",
            "expected_category": ServiceCategory.CONSTRUCTION
        },
        {
            "description": "There are sparks coming from my electrical outlet",
            "expected_category": ServiceCategory.ELECTRICAL
        },
        {
            "description": "My air conditioner stopped working and it's getting very hot",
            "expected_category": ServiceCategory.HVAC
        }
    ]
    
    print("🔍 Testing Problem Detection System")
    print("=" * 50)
    
    correct_predictions = 0
    
    for i, case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Description: {case['description']}")
        
        # Test problem detection
        result = detector.detect_problem(case["description"])
        
        if result.suggested_categories:
            top_suggestion = result.suggested_categories[0]
            predicted_category = top_suggestion.category
            confidence = top_suggestion.confidence
            
            print(f"Expected: {case['expected_category'].value}")
            print(f"Predicted: {predicted_category.value}")
            print(f"Confidence: {confidence:.2f}")
            print(f"Urgency: {result.urgency_level}")
            print(f"Keywords found: {top_suggestion.keywords_found}")
            
            if predicted_category == case["expected_category"]:
                print("✅ CORRECT")
                correct_predictions += 1
            else:
                print("❌ INCORRECT")
            
            # Show all top suggestions
            if len(result.suggested_categories) > 1:
                print("Other suggestions:")
                for suggestion in result.suggested_categories[1:3]:  # Show top 2 alternatives
                    print(f"  - {suggestion.category.value}: {suggestion.confidence:.2f}")
        else:
            print("No category detected")
    
    # Test edge cases
    print(f"\n🧪 Testing Edge Cases")
    print("=" * 30)
    
    edge_cases = [
        "Hello there",  # Vague description
        "",  # Empty string  
        "Water electrical light cleaning construction"  # Multiple categories
    ]
    
    for i, description in enumerate(edge_cases, 1):
        print(f"\nEdge Case {i}: '{description}'")
        result = detector.detect_problem(description)
        if result.suggested_categories:
            print(f"Top Category: {result.suggested_categories[0].category.value}, Confidence: {result.suggested_categories[0].confidence:.2f}")
        else:
            print("No categories suggested")
    
    print(f"\n📊 Results Summary")
    print("=" * 30)
    print(f"Accuracy: {correct_predictions}/{len(test_cases)} ({correct_predictions/len(test_cases)*100:.1f}%)")


def test_category_organization():
    """Test the category organization system for UI display."""
    
    organizer = CategoryOrganizer()
    category_groups = organizer.get_category_groups()
    
    print("\n🏗️  Testing Category Organization")
    print("=" * 50)
    
    total_categories = 0
    
    for group_name, group_data in category_groups.items():
        print(f"\n📁 {group_name}")
        print(f"   Icon: {group_data['icon']}")
        print(f"   Description: {group_data['description']}")
        print(f"   Color: {group_data['color']}")
        print(f"   Categories ({len(group_data['categories'])}):")
        
        for category in group_data['categories']:
            print(f"      • {category['name']} ({category['category'].value})")
            print(f"        Icon: {category['icon']}, Desc: {category['description']}")
            total_categories += 1
    
    print(f"\n📊 Organization Summary:")
    print(f"   Total Groups: {len(category_groups)}")
    print(f"   Total Categories: {total_categories}")
    print(f"   Average per Group: {total_categories/len(category_groups):.1f}")


if __name__ == "__main__":
    try:
        test_problem_detection()
        test_category_organization()
        print("\n🎉 All tests completed successfully!")
        print("\n✨ System is now simplified to focus on:")
        print("   1. AI-powered category detection from descriptions")
        print("   2. Organized category selection with umbrella groups")
        print("   3. Direct service provider matching (no complex surveys)")
        
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        import traceback
        traceback.print_exc()
