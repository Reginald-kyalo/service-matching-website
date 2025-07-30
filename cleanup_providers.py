#!/usr/bin/env python3
"""
Cleanup script to delete all provider applications and reset user types
"""

import sqlite3
import os
from pathlib import Path

def cleanup_providers():
    """Delete all provider applications and reset users to client type"""
    
    # Database path
    db_path = "service_matching_complete.db"
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Nothing to clean up.")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # First, let's see what we have
        cursor.execute("SELECT COUNT(*) FROM service_providers")
        provider_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'provider'")
        provider_user_count = cursor.fetchone()[0]
        
        print(f"Found {provider_count} provider applications")
        print(f"Found {provider_user_count} users with provider type")
        
        if provider_count == 0 and provider_user_count == 0:
            print("No provider data to clean up.")
            return
        
        # Confirm deletion
        response = input("\nAre you sure you want to delete all provider applications and reset user types? (yes/no): ")
        if response.lower() != 'yes':
            print("Cleanup cancelled.")
            return
        
        # Delete all provider applications
        cursor.execute("DELETE FROM service_providers")
        deleted_providers = cursor.rowcount
        print(f"Deleted {deleted_providers} provider applications")
        
        # Reset all users to client type
        cursor.execute("UPDATE users SET user_type = 'client' WHERE user_type = 'provider'")
        updated_users = cursor.rowcount
        print(f"Reset {updated_users} users back to client type")
        
        # Commit changes
        conn.commit()
        print("\nCleanup completed successfully!")
        
        # Show final counts
        cursor.execute("SELECT COUNT(*) FROM service_providers")
        final_provider_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE user_type = 'provider'")
        final_provider_user_count = cursor.fetchone()[0]
        
        print(f"Remaining provider applications: {final_provider_count}")
        print(f"Remaining provider users: {final_provider_user_count}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def cleanup_providers_keep_users():
    """Delete provider applications but keep user types as is"""
    
    # Database path
    db_path = "service_matching_complete.db"
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found. Nothing to clean up.")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check what we have
        cursor.execute("SELECT COUNT(*) FROM service_providers")
        provider_count = cursor.fetchone()[0]
        
        print(f"Found {provider_count} provider applications")
        
        if provider_count == 0:
            print("No provider applications to delete.")
            return
        
        # Confirm deletion
        response = input(f"\nAre you sure you want to delete all {provider_count} provider applications? (User types will remain unchanged) (yes/no): ")
        if response.lower() != 'yes':
            print("Cleanup cancelled.")
            return
        
        # Delete all provider applications
        cursor.execute("DELETE FROM service_providers")
        deleted_providers = cursor.rowcount
        print(f"Deleted {deleted_providers} provider applications")
        
        # Commit changes
        conn.commit()
        print("\nProvider applications cleanup completed!")
        
        # Show final count
        cursor.execute("SELECT COUNT(*) FROM service_providers")
        final_provider_count = cursor.fetchone()[0]
        print(f"Remaining provider applications: {final_provider_count}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

def show_current_data():
    """Show current provider and user data"""
    
    db_path = "service_matching_complete.db"
    
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Show provider applications
        cursor.execute("SELECT id, name, email, county, created_at FROM service_providers ORDER BY created_at DESC")
        providers = cursor.fetchall()
        
        print("=== CURRENT PROVIDER APPLICATIONS ===")
        if providers:
            print(f"{'ID':<5} {'Name':<20} {'Email':<25} {'County':<15} {'Created':<20}")
            print("-" * 85)
            for provider in providers:
                print(f"{provider[0]:<5} {provider[1]:<20} {provider[2]:<25} {provider[3]:<15} {str(provider[4]):<20}")
        else:
            print("No provider applications found.")
        
        print(f"\nTotal provider applications: {len(providers)}")
        
        # Show users with provider type
        cursor.execute("SELECT id, name, email, user_type, created_at FROM users WHERE user_type = 'provider' ORDER BY created_at DESC")
        provider_users = cursor.fetchall()
        
        print("\n=== USERS WITH PROVIDER TYPE ===")
        if provider_users:
            print(f"{'ID':<5} {'Name':<20} {'Email':<25} {'Type':<10} {'Created':<20}")
            print("-" * 80)
            for user in provider_users:
                print(f"{user[0]:<5} {user[1]:<20} {user[2]:<25} {user[3]:<10} {str(user[4]):<20}")
        else:
            print("No users with provider type found.")
        
        print(f"\nTotal provider users: {len(provider_users)}")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    print("Provider Cleanup Utility")
    print("=" * 50)
    
    while True:
        print("\nChoose an option:")
        print("1. Show current provider data")
        print("2. Delete ALL provider applications and reset user types to 'client'")
        print("3. Delete provider applications only (keep user types)")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            show_current_data()
        elif choice == "2":
            cleanup_providers()
        elif choice == "3":
            cleanup_providers_keep_users()
        elif choice == "4":
            print("Goodbye!")
            break
        else:
            print("Invalid choice. Please enter 1, 2, 3, or 4.")
