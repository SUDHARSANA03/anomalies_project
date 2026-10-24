import sqlite3
import hashlib
import os
import json
import uuid
from datetime import datetime

DB_DIR = "data"
DB_PATH = os.path.join(DB_DIR, "hypersense.db")

def get_connection():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with salt"""
    salt = "hypersense_spectral_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db():
    """Initialize database schema with users, analyses, targets, and dossiers"""
    conn = get_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'operator',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Analysis runs table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS analysis_runs (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        dataset_name TEXT NOT NULL,
        algorithm TEXT NOT NULL,
        threshold REAL NOT NULL,
        num_targets INTEGER DEFAULT 0,
        metadata_json TEXT,
        results_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Candidate targets table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS candidate_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        region_id INTEGER NOT NULL,
        area INTEGER NOT NULL,
        centroid_x REAL NOT NULL,
        centroid_y REAL NOT NULL,
        mean_score REAL NOT NULL,
        max_score REAL NOT NULL,
        classification TEXT DEFAULT 'Anomalous Target',
        FOREIGN KEY (run_id) REFERENCES analysis_runs (id)
    )
    """)

    # Mission dossiers table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS mission_dossiers (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        title TEXT NOT NULL,
        summary TEXT,
        dataset_name TEXT,
        metadata_json TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    """)

    # Seed default operator user if not exists
    cursor.execute("SELECT id FROM users WHERE email = 'operator@hypersense.ai'")
    if not cursor.fetchone():
        pwd_hash = hash_password("hypersense2026")
        cursor.execute("""
        INSERT INTO users (email, username, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?)
        """, ('operator@hypersense.ai', 'spectral_lead', pwd_hash, 'Lead Spectral Operator', 'admin'))

    conn.commit()
    conn.close()
    print(f" Database initialized at {DB_PATH}")

def create_user(email: str, username: str, password: str, full_name: str = "", role: str = "operator"):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        pwd_hash = hash_password(password)
        cursor.execute("""
        INSERT INTO users (email, username, password_hash, full_name, role)
        VALUES (?, ?, ?, ?, ?)
        """, (email.lower().strip(), username.strip(), pwd_hash, full_name.strip(), role))
        conn.commit()
        user_id = cursor.lastrowid
        return {
            "id": user_id,
            "email": email.lower().strip(),
            "username": username.strip(),
            "full_name": full_name.strip(),
            "role": role,
            "created_at": datetime.utcnow().isoformat(),
        }
    finally:
        conn.close()

def authenticate_user(email_or_username: str, password: str):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        query_val = email_or_username.lower().strip()
        pwd_hash = hash_password(password)
        cursor.execute("""
        SELECT id, email, username, full_name, role, created_at 
        FROM users 
        WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND password_hash = ?
        """, (query_val, query_val, pwd_hash))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None
    finally:
        conn.close()

def get_user_by_id(user_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id, email, username, full_name, role, created_at FROM users WHERE id = ?", (user_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
    finally:
        conn.close()

def save_analysis_run(dataset_name: str, algorithm: str, threshold: float, metadata: dict, regions: list, user_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        run_id = f"RUN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        metadata_json = json.dumps(metadata)
        
        # Save summary
        results_summary = {
            "total_targets": len(regions),
            "max_score": max([r.get("max_score", 0) for r in regions]) if regions else 0,
            "mean_score": sum([r.get("mean_score", 0) for r in regions]) / len(regions) if regions else 0,
        }
        
        cursor.execute("""
        INSERT INTO analysis_runs (id, user_id, dataset_name, algorithm, threshold, num_targets, metadata_json, results_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (run_id, user_id, dataset_name, algorithm, threshold, len(regions), metadata_json, json.dumps(results_summary)))
        
        # Insert target rows
        for r in regions:
            centroid = r.get("centroid", [0, 0])
            cursor.execute("""
            INSERT INTO candidate_targets (run_id, region_id, area, centroid_x, centroid_y, mean_score, max_score, classification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                run_id, 
                r.get("id", 0), 
                r.get("area", 0), 
                centroid[0], 
                centroid[1], 
                r.get("mean_score", 0), 
                r.get("max_score", 0),
                r.get("classification", "Sub-Pixel Anomaly")
            ))
            
        conn.commit()
        return run_id
    finally:
        conn.close()

def get_analysis_history(user_id: int = None, limit: int = 25):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if user_id:
            cursor.execute("""
            SELECT * FROM analysis_runs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
            """, (user_id, limit))
        else:
            cursor.execute("""
            SELECT * FROM analysis_runs ORDER BY created_at DESC LIMIT ?
            """, (limit,))
        runs = [dict(r) for r in cursor.fetchall()]
        return runs
    finally:
        conn.close()

def save_mission_dossier(title: str, summary: str, dataset_name: str, metadata: dict, user_id: int = None):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        dossier_id = f"DOSSIER-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        cursor.execute("""
        INSERT INTO mission_dossiers (id, user_id, title, summary, dataset_name, metadata_json)
        VALUES (?, ?, ?, ?, ?, ?)
        """, (dossier_id, user_id, title, summary, dataset_name, json.dumps(metadata)))
        conn.commit()
        return dossier_id
    finally:
        conn.close()

def get_mission_dossiers(limit: int = 20):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT * FROM mission_dossiers ORDER BY created_at DESC LIMIT ?", (limit,))
        return [dict(r) for r in cursor.fetchall()]
    finally:
        conn.close()

# Auto-initialize DB on module load
init_db()
