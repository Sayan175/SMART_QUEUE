import sqlite3
from datetime import datetime

DB_PATH = "queue.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            service TEXT NOT NULL,
            phone TEXT DEFAULT '',
            status TEXT DEFAULT 'waiting',
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            served_at DATETIME
        )
    """)
    conn.commit()
    conn.close()

def add_to_queue(name, service, phone=""):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO queue (name, service, phone) VALUES (?, ?, ?)",
        (name, service, phone)
    )
    token = cursor.lastrowid
    conn.commit()
    conn.close()
    return token

def get_queue(status=None):
    conn = get_db()
    cursor = conn.cursor()
    if status:
        cursor.execute(
            "SELECT * FROM queue WHERE status = ? ORDER BY id ASC",
            (status,)
        )
    else:
        cursor.execute(
            "SELECT * FROM queue WHERE status IN ('waiting', 'serving') ORDER BY id ASC"
        )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_token_info(token_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM queue WHERE id = ?", (token_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_position(token_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COUNT(*) as pos FROM queue WHERE id < ? AND status = 'waiting'",
        (token_id,)
    )
    result = cursor.fetchone()
    conn.close()
    return result["pos"] if result else 0

def update_status(token_id, status):
    conn = get_db()
    cursor = conn.cursor()
    if status == 'serving':
        cursor.execute(
            "UPDATE queue SET status = ?, served_at = ? WHERE id = ?",
            (status, datetime.now(), token_id)
        )
    else:
        cursor.execute(
            "UPDATE queue SET status = ? WHERE id = ?",
            (status, token_id)
        )
    conn.commit()
    conn.close()

def call_next():
    conn = get_db()
    cursor = conn.cursor()
    # Mark current serving as done
    cursor.execute("UPDATE queue SET status = 'done' WHERE status = 'serving'")
    # Get next waiting
    cursor.execute("SELECT * FROM queue WHERE status = 'waiting' ORDER BY id ASC LIMIT 1")
    row = cursor.fetchone()
    if row:
        cursor.execute(
            "UPDATE queue SET status = 'serving', served_at = ? WHERE id = ?",
            (datetime.now(), row["id"])
        )
        conn.commit()
        conn.close()
        return dict(row)
    conn.commit()
    conn.close()
    return None

def get_stats():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM queue WHERE status = 'waiting'")
    waiting = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM queue WHERE status = 'serving'")
    serving = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM queue WHERE status = 'done'")
    done = cursor.fetchone()["cnt"]
    cursor.execute("SELECT * FROM queue WHERE status = 'serving' LIMIT 1")
    current = cursor.fetchone()
    conn.close()
    return {
        "waiting": waiting,
        "serving": serving,
        "done": done,
        "current": dict(current) if current else None,
        "avg_wait_minutes": max(5, waiting * 4)  # estimate: ~4 min per person
    }

