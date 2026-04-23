from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
from dotenv import load_dotenv
from database import init_db, add_to_queue, get_queue, get_token_info, get_position, update_status, call_next, get_stats
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "dev-secret-key")
CORS(app)

# Initialize database on startup
init_db()

# ─────────────────────────────────────────
# PAGE ROUTES
# ─────────────────────────────────────────

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/admin")
def admin():
    if not session.get("admin"):
        return redirect(url_for("login"))
    return render_template("admin.html")

@app.route("/display")
def display():
    return render_template("display.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        password = request.form.get("password")
        if password == os.getenv("ADMIN_PASSWORD", "admin123"):
            session["admin"] = True
            return redirect(url_for("admin"))
        return render_template("login.html", error="Wrong password!")
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("index"))

# ─────────────────────────────────────────
# CUSTOMER API
# ─────────────────────────────────────────

@app.route("/api/join", methods=["POST"])
def join_queue():
    data = request.get_json()
    name = data.get("name", "").strip()
    service = data.get("service", "").strip()
    phone = data.get("phone", "").strip()

    if not name or not service:
        return jsonify({"error": "Name and service are required"}), 400

    token = add_to_queue(name, service, phone)
    position = get_position(token)
    stats = get_stats()
    wait = (position) * 4  # ~4 min per person

    return jsonify({
        "token": token,
        "name": name,
        "service": service,
        "position": position + 1,
        "estimated_wait": wait,
        "message": f"You joined the queue! Token #{token}"
    })

@app.route("/api/status/<int:token_id>")
def token_status(token_id):
    info = get_token_info(token_id)
    if not info:
        return jsonify({"error": "Token not found"}), 404
    position = get_position(token_id) + 1 if info["status"] == "waiting" else 0
    wait = max(0, (position - 1) * 4)
    return jsonify({
        **info,
        "position": position,
        "estimated_wait": wait
    })

@app.route("/api/queue")
def queue_status():
    queue = get_queue()
    stats = get_stats()
    return jsonify({"queue": queue, "stats": stats})

# ─────────────────────────────────────────
# ADMIN API
# ─────────────────────────────────────────

def require_admin(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin"):
            return jsonify({"error": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/api/admin/next", methods=["POST"])
@require_admin
def next_customer():
    customer = call_next()
    if customer:
        return jsonify({"success": True, "customer": customer})
    return jsonify({"success": False, "message": "No one in queue"})

@app.route("/api/admin/skip/<int:token_id>", methods=["POST"])
@require_admin
def skip_customer(token_id):
    update_status(token_id, "skipped")
    return jsonify({"success": True})

@app.route("/api/admin/done/<int:token_id>", methods=["POST"])
@require_admin
def done_customer(token_id):
    update_status(token_id, "done")
    return jsonify({"success": True})

@app.route("/api/admin/remove/<int:token_id>", methods=["POST"])
@require_admin
def remove_customer(token_id):
    update_status(token_id, "removed")
    return jsonify({"success": True})

@app.route("/api/admin/queue")
@require_admin
def admin_queue():
    waiting = get_queue("waiting")
    serving = get_queue("serving")
    stats = get_stats()
    return jsonify({"waiting": waiting, "serving": serving, "stats": stats})

if __name__ == "__main__":
    app.run(debug=True)

