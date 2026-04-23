# ============================================================
# Project Title : Contact Management System
# Author        : [Your Name]
# Date          : 2025
# Description   : A Flask-based CRUD contact management app
# ============================================================

from flask import Flask, render_template, request, redirect, url_for, flash

app = Flask(__name__)
app.secret_key = 'contact_mgmt_secret_key'

# In-memory storage for contacts (list of dicts)
contacts = [
    {'id': 1, 'name': 'Alice Johnson', 'phone': '9876543210', 'email': 'alice@example.com', 'address': '123 MG Road, Delhi'},
    {'id': 2, 'name': 'Bob Smith',    'phone': '8765432109', 'email': 'bob@example.com',   'address': '456 Park Street, Mumbai'},
    {'id': 3, 'name': 'Carol White',  'phone': '7654321098', 'email': 'carol@example.com', 'address': '789 Anna Salai, Chennai'},
]

# Auto-incrementing ID counter
next_id = 4


# ── Helper ────────────────────────────────────────────────
def get_contact_by_id(contact_id):
    """Return a contact dict matching the given id, or None."""
    return next((c for c in contacts if c['id'] == contact_id), None)


# ── Routes ────────────────────────────────────────────────

@app.route('/')
def index():
    """Home page – list all contacts, with optional search."""
    query = request.args.get('search', '').strip().lower()
    if query:
        results = [
            c for c in contacts
            if query in c['name'].lower() or query in c['phone']
        ]
    else:
        results = contacts
    return render_template('index.html', contacts=results, search=query)


@app.route('/add', methods=['GET', 'POST'])
def add_contact():
    """Add a new contact."""
    global next_id
    if request.method == 'POST':
        name    = request.form.get('name', '').strip()
        phone   = request.form.get('phone', '').strip()
        email   = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()

        # Basic validation
        errors = []
        if not name:
            errors.append('Name is required.')
        if not phone:
            errors.append('Phone number is required.')
        if not email:
            errors.append('Email address is required.')
        if phone and not phone.isdigit():
            errors.append('Phone number must contain only digits.')

        if errors:
            for err in errors:
                flash(err, 'error')
            return render_template('add_contact.html',
                                   name=name, phone=phone,
                                   email=email, address=address)

        contacts.append({
            'id':      next_id,
            'name':    name,
            'phone':   phone,
            'email':   email,
            'address': address,
        })
        next_id += 1
        flash(f'Contact "{name}" added successfully!', 'success')
        return redirect(url_for('index'))

    return render_template('add_contact.html')


@app.route('/edit/<int:contact_id>', methods=['GET', 'POST'])
def edit_contact(contact_id):
    """Edit an existing contact."""
    contact = get_contact_by_id(contact_id)
    if contact is None:
        flash('Contact not found.', 'error')
        return redirect(url_for('index'))

    if request.method == 'POST':
        name    = request.form.get('name', '').strip()
        phone   = request.form.get('phone', '').strip()
        email   = request.form.get('email', '').strip()
        address = request.form.get('address', '').strip()

        errors = []
        if not name:
            errors.append('Name is required.')
        if not phone:
            errors.append('Phone number is required.')
        if not email:
            errors.append('Email address is required.')
        if phone and not phone.isdigit():
            errors.append('Phone number must contain only digits.')

        if errors:
            for err in errors:
                flash(err, 'error')
            return render_template('edit_contact.html', contact=contact)

        # Update in place
        contact['name']    = name
        contact['phone']   = phone
        contact['email']   = email
        contact['address'] = address

        flash(f'Contact "{name}" updated successfully!', 'success')
        return redirect(url_for('index'))

    return render_template('edit_contact.html', contact=contact)


@app.route('/delete/<int:contact_id>', methods=['POST'])
def delete_contact(contact_id):
    """Delete a contact by ID."""
    global contacts
    contact = get_contact_by_id(contact_id)
    if contact:
        contacts = [c for c in contacts if c['id'] != contact_id]
        flash(f'Contact "{contact["name"]}" deleted.', 'success')
    else:
        flash('Contact not found.', 'error')
    return redirect(url_for('index'))


# ── Entry Point ───────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True)
