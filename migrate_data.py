import os
import re
from datetime import datetime
from app import create_app, db
from app.models import User, HistoryItem
import json # For parsing the details JSON string if needed, though model expects text

def parse_copy_data(sql_content, table_name):
    """
    Parses data from a PostgreSQL COPY statement in the SQL dump.
    Example: COPY public.users (id, username, password, email) FROM stdin;
    1	user_351811	placeholder	user_351811@example.com
    \.
    """
    # Regex to find the COPY statement and capture the data block
    # It looks for "COPY public.table_name (...) FROM stdin;"
    # then captures everything until "\."
    # The (?s) flag makes . match newlines
    regex = rf"COPY public\.{table_name} .*? FROM stdin;(?s)(.*?)\\\."
    match = re.search(regex, sql_content)

    if not match:
        print(f"No COPY data found for table {table_name}")
        return []

    data_block = match.group(1).strip()
    lines = data_block.split('\n')
    
    parsed_data = []
    for line in lines:
        if line.strip(): # Ensure line is not empty
            parsed_data.append(line.split('\t'))
    return parsed_data

def migrate_users(app, sql_content):
    """Migrates user data from SQL dump to MySQL."""
    with app.app_context():
        users_data = parse_copy_data(sql_content, "users")
        if not users_data:
            print("No user data to migrate.")
            return

        print(f"Found {len(users_data)} user(s) to migrate.")
        for row in users_data:
            try:
                user_id, username, password, email = row
                user = User(
                    id=int(user_id),  # Keep original ID
                    username=username,
                    password=password,
                    email=email
                )
                db.session.add(user)
                print(f"Adding user: {username}")
            except ValueError as e:
                print(f"Skipping user row due to parsing error (expected 4 columns): {row} - {e}")
                continue
            except Exception as e:
                print(f"Error adding user {username}: {e}")
                db.session.rollback() # Rollback for this specific user
                continue
        
        try:
            db.session.commit()
            print("User data migration completed.")
        except Exception as e:
            print(f"Error committing user data: {e}")
            db.session.rollback()

def migrate_history_items(app, sql_content):
    """Migrates history_items data from SQL dump to MySQL."""
    with app.app_context():
        history_data = parse_copy_data(sql_content, "history_items")
        if not history_data:
            print("No history item data to migrate.")
            return

        print(f"Found {len(history_data)} history item(s) to migrate.")
        for row in history_data:
            try:
                # COPY public.history_items (id, user_id, "time", type, thoughts, saved_at, details) FROM stdin;
                item_id, user_id, time_str, item_type, thoughts, saved_at_str, details_str = row
                
                # Convert saved_at string to datetime object
                # Format from dump: 2025-05-10 17:40:57.15723
                # Python's datetime.fromisoformat doesn't handle this specific precision well without minor adjustment
                # or strptime. Let's use strptime.
                if '.' in saved_at_str:
                    dt_obj = datetime.strptime(saved_at_str, '%Y-%m-%d %H:%M:%S.%f')
                else:
                    dt_obj = datetime.strptime(saved_at_str, '%Y-%m-%d %H:%M:%S')

                history_item = HistoryItem(
                    id=int(item_id), # Keep original ID
                    user_id=int(user_id),
                    time=time_str,
                    type=item_type,
                    thoughts=thoughts if thoughts != '\\N' else None, # Handle NULL for thoughts
                    saved_at=dt_obj,
                    details=details_str if details_str != '\\N' else None # Handle NULL for details
                )
                db.session.add(history_item)
                print(f"Adding history item ID: {item_id} for user ID: {user_id}")
            except ValueError as e:
                print(f"Skipping history item row due to parsing error (expected 7 columns): {row} - {e}")
                continue
            except Exception as e:
                print(f"Error adding history item ID {item_id}: {e}")
                db.session.rollback() # Rollback for this specific item
                continue
        
        try:
            db.session.commit()
            print("History item data migration completed.")
        except Exception as e:
            print(f"Error committing history item data: {e}")
            db.session.rollback()

def main():
    # Create a Flask app instance and initialize extensions
    app = create_app()

    # Read the SQL dump file
    try:
        with open("backup_replit.sql", "r", encoding="utf-8") as f:
            sql_content = f.read()
    except FileNotFoundError:
        print("Error: backup_replit.sql not found. Please place it in the root directory.")
        return
    except Exception as e:
        print(f"Error reading SQL file: {e}")
        return

    # Perform migrations
    # Important: Migrate users first due to foreign key constraints
    print("Starting user data migration...")
    migrate_users(app, sql_content)
    
    print("\nStarting history item data migration...")
    migrate_history_items(app, sql_content)
    
    print("\nData migration process finished.")

if __name__ == "__main__":
    main()
