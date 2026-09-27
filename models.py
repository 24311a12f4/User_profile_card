import os
import sqlite3
from datetime import datetime

DATABASE_NAME = os.path.join(os.path.dirname(__file__), 'database.db')

def get_db_connection():
    """
    Establishes a connection to the SQLite database.
    Configures row factory to return rows as dictionary-like objects.
    """
    conn = sqlite3.connect(DATABASE_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the database by creating the profiles table if it doesn't exist.
    """
    schema = """
    CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        bio TEXT NOT NULL,
        image_url TEXT NOT NULL,
        email TEXT,
        location TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(schema)
        conn.commit()
    finally:
        conn.close()

def create_profile(name, bio, image_url, email=None, location=None):
    """
    Inserts a new profile card into the database.
    Returns the created profile as a dictionary.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO profiles (name, bio, image_url, email, location)
            VALUES (?, ?, ?, ?, ?)
            """,
            (name, bio, image_url, email, location)
        )
        conn.commit()
        profile_id = cursor.lastrowid
        
        # Retrieve the newly created row to return to the caller
        cursor.execute("SELECT * FROM profiles WHERE id = ?", (profile_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def get_all_profiles():
    """
    Retrieves all profile cards from the database, ordered by creation date descending.
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM profiles ORDER BY created_at DESC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()
