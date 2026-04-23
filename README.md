# ⚡ SmartQueue — Smart Queue Management System

A full-stack web application to manage customer queues digitally — no more standing in long lines!
Built with **HTML, CSS, JavaScript** on the frontend and **Python Flask + SQLite** on the backend.

---

## 🖥️ Live Pages

| Page | URL | Description |
|---|---|---|
| Customer Page | `/` | Join queue, get token, track position |
| Admin Dashboard | `/admin` | Manage queue — call next, skip, done |
| Display Board | `/display` | Public TV-style live queue screen |
| Staff Login | `/login` | Password protected admin access |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Python Flask |
| Database | SQLite (`queue.db`) |
| Deployment | Render.com |

---

## ✨ Features

- 🎫 **Token System** — Every customer gets a unique token number
- ⏱️ **Real-time Updates** — Position & wait time auto-refreshes every 5 seconds
- 🔒 **Secure Admin Login** — Session-based password authentication
- 📺 **Live Display Board** — TV screen style with live clock
- 📱 **Mobile Responsive** — Works on all screen sizes
- 🗄️ **SQLite Database** — All queue data stored persistently
- 🌐 **REST API** — Clean API architecture between frontend and backend

---

## 📁 Project Structure

```
smart-queue/
│
├── app.py                  ← Flask backend (all routes & API)
├── database.py             ← SQLite database logic
├── requirements.txt        ← Python dependencies
├── Procfile                ← For Render.com deployment
├── .env                    ← Secret keys (not uploaded to GitHub)
│
├── templates/
│   ├── index.html          ← Customer page
│   ├── admin.html          ← Admin dashboard
│   ├── display.html        ← Public display board
│   └── login.html          ← Staff login page
│
└── static/
    ├── css/
    │   └── style.css       ← All styles
    └── js/
        ├── customer.js     ← Customer-side logic
        ├── admin.js        ← Admin dashboard logic
        └── display.js      ← Display board logic
```

---

## 🚀 How to Run Locally

**Step 1 — Clone the repository**
```bash
git clone https://github.com/yourusername/smart-queue.git
cd smart-queue
```

**Step 2 — Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

**Step 3 — Install dependencies**
```bash
pip install -r requirements.txt
```

**Step 4 — Create `.env` file**
```
SECRET_KEY=your-secret-key-here
ADMIN_PASSWORD=admin123
```

**Step 5 — Run the app**
```bash
python3 app.py
```

**Step 6 — Open in browser**
```
http://localhost:5000
```

---

## 🔑 Admin Login

1. Go to `http://localhost:5000/login`
2. Enter password: `admin123` (or whatever you set in `.env`)
3. Access full admin dashboard

---

## 🗄️ Database

All data is stored in **`queue.db`** (SQLite file) — auto-created on first run.

**Queue Table Structure:**

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Auto token number |
| name | TEXT | Customer name |
| service | TEXT | Service needed |
| phone | TEXT | Contact (optional) |
| status | TEXT | waiting / serving / done / skipped |
| joined_at | DATETIME | When they joined |
| served_at | DATETIME | When they were called |

---

## 🌐 How to Deploy on Render.com (Free)

1. Push project to **GitHub**
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set these:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app`
5. Add Environment Variables:
   - `SECRET_KEY` → any random string
   - `ADMIN_PASSWORD` → your password
6. Click **Deploy** 🚀

---

## 📊 How It Works

```
Customer fills form
       ↓
customer.js → POST /api/join        ← Frontend
       ↓
app.py handles the request          ← Backend
       ↓
database.py saves to queue.db       ← Database
       ↓
Token number returned
       ↓
customer.js shows token card        ← Frontend
       ↓
Polls /api/status every 5 seconds   ← Real-time updates
```

---

## 👨‍💻 Made By

**[Your Name]**
Web Development Project — [Your College/Institute Name]

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
