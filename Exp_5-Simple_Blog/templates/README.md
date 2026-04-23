# Simple Blog — Flask CRUD Application

**Experiment 5 | [Your Name] | April 21, 2026**

A lightweight blog platform built with Python/Flask demonstrating full **CRUD** operations (Create, Read, Update, Delete) using in-memory storage — no database required.

---

## Project Structure

```
simple_blog/
├── app.py                  # Main Flask application
├── templates/
│   ├── base.html           # Master layout (nav, footer)
│   ├── index.html          # Home — list all posts
│   ├── create.html         # Create a new post
│   └── edit.html           # Edit an existing post
├── static/
│   └── style.css           # Editorial-themed stylesheet
└── README.md               # This file
```

---

## How to Run

### 1. Install Flask
```bash
pip install flask
```

### 2. Start the server
```bash
python app.py
```

### 3. Open in browser
```
http://127.0.0.1:5000
```

---

## Features

| Feature | Route | Method |
|---------|-------|--------|
| View all posts | `/` | GET |
| Create new post | `/create` | GET / POST |
| Edit a post | `/edit/<id>` | GET / POST |
| Delete a post | `/delete/<id>` | POST |

---

## References
- Flask documentation: https://flask.palletsprojects.com/
- Jinja2 templating: https://jinja.palletsprojects.com/
- Google Fonts (Playfair Display, Source Serif 4): https://fonts.google.com/
