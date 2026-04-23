

from flask import Flask, render_template, request, redirect, url_for

# -------------------------------------------------------
# App Initialisation
# -------------------------------------------------------
app = Flask(__name__)

# -------------------------------------------------------
# In-Memory Storage
# Each post is a dict: { id, title, content, date }
# -------------------------------------------------------
posts = []          # list that holds all blog posts
next_id = 1        # auto-incrementing post ID counter


# -------------------------------------------------------
# Helper: generate a simple human-readable date string
# -------------------------------------------------------
def current_date():
    """Return today's date formatted as 'DD Mon YYYY'."""
    from datetime import date
    return date.today().strftime("%d %b %Y")


# ================================================================
# ROUTE 1 — Home  (READ – display all posts)
# ================================================================
@app.route('/')
def index():
    """
    Home page: lists every blog post in reverse-chronological order
    (newest first) so the latest content always appears at the top.
    """
    # Reverse the list so newest posts appear first
    all_posts = list(reversed(posts))
    return render_template('index.html', posts=all_posts)


# ================================================================
# ROUTE 2 — Create Post  (CREATE)
# GET  → show the blank create form
# POST → validate input, append new post, redirect to home
# ================================================================
@app.route('/create', methods=['GET', 'POST'])
def create():
    """
    GET : Render the create-post form.
    POST: Read submitted title & content, build a new post dict,
          append it to the global list, then redirect to home.
    """
    global next_id   # we need to modify the module-level counter

    if request.method == 'POST':
        title   = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()

        # Basic server-side validation — reject blank fields
        if not title or not content:
            error = "Both title and content are required."
            return render_template('create.html', error=error,
                                   title=title, content=content)

        # Build and store the new post
        new_post = {
            'id'     : next_id,
            'title'  : title,
            'content': content,
            'date'   : current_date()
        }
        posts.append(new_post)
        next_id += 1

        return redirect(url_for('index'))

    # GET request — render empty form
    return render_template('create.html', error=None, title='', content='')


# ================================================================
# ROUTE 3 — Edit Post  (UPDATE)
# GET  → pre-fill form with existing post data
# POST → update the post in the list, redirect to home
# ================================================================
@app.route('/edit/<int:post_id>', methods=['GET', 'POST'])
def edit(post_id):
    """
    GET : Find the post by ID and render a pre-filled edit form.
    POST: Apply the new title/content to the post dict in-place,
          then redirect back to home.
    """
    # Locate the post; return 404 if not found
    post = next((p for p in posts if p['id'] == post_id), None)
    if post is None:
        return "Post not found.", 404

    if request.method == 'POST':
        title   = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()

        # Validation
        if not title or not content:
            error = "Both title and content are required."
            return render_template('edit.html', post=post, error=error)

        # Update post in-place
        post['title']   = title
        post['content'] = content

        return redirect(url_for('index'))

    # GET — render the form pre-filled with current post data
    return render_template('edit.html', post=post, error=None)


# ================================================================
# ROUTE 4 — Delete Post  (DELETE)
# POST-only route to remove a post from the list.
# ================================================================
@app.route('/delete/<int:post_id>', methods=['POST'])
def delete(post_id):
    """
    Find the post with the given ID and remove it from storage.
    Redirect back to the home page after deletion.
    Using POST (not GET) prevents accidental deletion via URL.
    """
    global posts
    posts = [p for p in posts if p['id'] != post_id]
    return redirect(url_for('index'))


# ================================================================
# App Entry Point
# ================================================================
if __name__ == '__main__':
    # debug=True enables auto-reload and helpful error pages
    app.run(debug=True)
