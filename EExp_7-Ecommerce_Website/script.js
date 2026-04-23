/*
 * Project : E-Commerce Website – script.js
 * Author  : [Your Name]
 * Date    : 2025
 * Desc    : Product listing, shopping cart, and checkout logic
 */

// ── Product Data ──────────────────────────────────────────
const PRODUCTS = [
    { id: 1,  name: 'Wireless Headphones', price: 1999,  desc: 'Premium sound, 30hr battery life, noise cancelling.',  icon: '🎧', badge: 'Best Seller' },
    { id: 2,  name: 'Mechanical Keyboard', price: 2499,  desc: 'RGB backlit, tactile switches, compact 75% layout.',   icon: '⌨️', badge: 'New' },
    { id: 3,  name: 'Smart Watch',         price: 3499,  desc: 'Health tracking, GPS, 7-day battery, waterproof.',     icon: '⌚', badge: 'Hot' },
    { id: 4,  name: 'Laptop Stand',        price: 899,   desc: 'Adjustable aluminium stand for ergonomic posture.',    icon: '💻', badge: null },
    { id: 5,  name: 'USB-C Hub',           price: 699,   desc: '7-in-1 hub: HDMI, USB-A x3, SD card, PD charging.',   icon: '🔌', badge: 'Sale' },
    { id: 6,  name: 'Desk LED Lamp',       price: 549,   desc: 'Touch dimmer, 3 colour temps, USB powered.',          icon: '💡', badge: null },
    { id: 7,  name: 'Portable SSD 1TB',    price: 4999,  desc: '1050 MB/s read, pocket-size, shock-proof casing.',    icon: '💾', badge: 'Popular' },
    { id: 8,  name: 'Webcam 4K',           price: 2199,  desc: 'Auto-focus, built-in mic, plug-and-play USB.',        icon: '📷', badge: 'New' },
];

// ── Cart State ────────────────────────────────────────────
let cart = [];   // Array of { product, quantity }

// ── Render Products ───────────────────────────────────────
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    PRODUCTS.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.id = `product-${product.id}`;
        card.innerHTML = `
            <div class="product-image">
                ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                ${product.icon}
            </div>
            <div class="product-body">
                <div class="product-name">${product.name}</div>
                <div class="product-desc">${product.desc}</div>
                <div class="product-footer">
                    <div class="product-price">₹${product.price.toLocaleString()}</div>
                    <button class="add-to-cart-btn" id="btn-${product.id}"
                            onclick="addToCart(${product.id})">
                        + Add to Cart
                    </button>
                </div>
            </div>`;
        grid.appendChild(card);
    });
}

// ── Add to Cart ───────────────────────────────────────────
function addToCart(productId) {
    const product  = PRODUCTS.find(p => p.id === productId);
    const existing = cart.find(item => item.product.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }

    // Button feedback
    const btn = document.getElementById(`btn-${productId}`);
    if (btn) {
        btn.textContent = '✓ Added';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = '+ Add to Cart';
            btn.classList.remove('added');
        }, 1200);
    }

    updateCartUI();
}

// ── Remove from Cart ──────────────────────────────────────
function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartUI();
}

// ── Update Quantity ───────────────────────────────────────
function updateQuantity(productId, delta) {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

// ── Clear Cart ────────────────────────────────────────────
function clearCart() {
    if (cart.length === 0) return;
    if (!confirm('Clear all items from cart?')) return;
    cart = [];
    updateCartUI();
}

// ── Update Cart UI ────────────────────────────────────────
function updateCartUI() {
    const cartItemsEl  = document.getElementById('cart-items');
    const emptCartEl   = document.getElementById('empty-cart');
    const summaryEl    = document.getElementById('cart-summary');
    const countEl      = document.getElementById('cart-count');
    const subtotalEl   = document.getElementById('subtotal');
    const grandTotalEl = document.getElementById('grand-total');

    // Badge count
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    countEl.textContent = totalQty;

    if (cart.length === 0) {
        // Remove any rendered items
        cartItemsEl.innerHTML = '';
        cartItemsEl.appendChild(emptCartEl);
        emptCartEl.style.display = 'block';
        summaryEl.style.display  = 'none';
        return;
    }

    // Hide empty state
    emptCartEl.style.display = 'none';
    summaryEl.style.display  = 'block';

    // Re-render cart items
    cartItemsEl.innerHTML = '';
    cart.forEach(item => {
        const { product, quantity } = item;
        const itemTotal = product.price * quantity;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.id = `cart-item-${product.id}`;
        div.innerHTML = `
            <div class="cart-item-icon">${product.icon}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${product.name}</div>
                <div class="cart-item-price">₹${product.price.toLocaleString()} each</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">−</button>
                <span class="qty-display">${quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${product.id}, +1)">+</button>
            </div>
            <div class="item-total">₹${itemTotal.toLocaleString()}</div>
            <button class="remove-btn" title="Remove" onclick="removeFromCart(${product.id})">✕</button>`;
        cartItemsEl.appendChild(div);
    });

    // Totals
    const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    subtotalEl.textContent   = `₹${subtotal.toLocaleString()}`;
    grandTotalEl.textContent = `₹${subtotal.toLocaleString()}`;

    // Update checkout preview
    updateCheckoutPreview(subtotal);
}

// ── Checkout Preview ──────────────────────────────────────
function updateCheckoutPreview(subtotal) {
    const preview = document.getElementById('co-order-preview');
    if (cart.length === 0) {
        preview.style.display = 'none';
        return;
    }
    let html = '<strong>Order Summary:</strong><br/>';
    cart.forEach(i => {
        html += `${i.product.icon} ${i.product.name} × ${i.quantity} — ₹${(i.product.price * i.quantity).toLocaleString()}<br/>`;
    });
    html += `<strong>Total: ₹${subtotal.toLocaleString()}</strong>`;
    preview.innerHTML = html;
    preview.style.display = 'block';
}

// ── Scroll to Checkout ────────────────────────────────────
function scrollToCheckout() {
    document.getElementById('checkout-section').scrollIntoView({ behavior: 'smooth' });
}

// ── Toggle Cart (navbar button) ───────────────────────────
function toggleCart() {
    document.getElementById('cart-section').scrollIntoView({ behavior: 'smooth' });
}

// ── Place Order ───────────────────────────────────────────
function placeOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty! Please add products first.');
        return;
    }

    // Gather form values
    const name    = document.getElementById('co-name').value.trim();
    const email   = document.getElementById('co-email').value.trim();
    const address = document.getElementById('co-address').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked')?.value || 'upi';

    // Validation
    if (!name)    { alert('Please enter your full name.');       document.getElementById('co-name').focus();    return; }
    if (!email)   { alert('Please enter your email address.');   document.getElementById('co-email').focus();   return; }
    if (!address) { alert('Please enter your delivery address.'); document.getElementById('co-address').focus(); return; }

    const total = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const paymentLabel = { upi: 'UPI / PhonePe / GPay', card: 'Credit/Debit Card', cod: 'Cash on Delivery' }[payment];
    const orderId = 'ORD-' + Math.random().toString(36).substr(2, 8).toUpperCase();

    // Show confirmation
    document.getElementById('checkout-form-area').style.display = 'none';
    const confirm = document.getElementById('confirmation');
    confirm.style.display = 'block';
    document.getElementById('confirm-msg').innerHTML =
        `<strong>${name}</strong>, your order <strong>${orderId}</strong> for 
         <strong>₹${total.toLocaleString()}</strong> has been placed!<br/>
         Payment: ${paymentLabel}<br/>
         Delivery to: ${address}`;

    // Clear cart after order
    cart = [];
    updateCartUI();
}

// ── Reset Everything ──────────────────────────────────────
function resetAll() {
    document.getElementById('checkout-form-area').style.display = 'block';
    document.getElementById('confirmation').style.display = 'none';
    // Clear form
    ['co-name','co-email','co-phone','co-address'].forEach(id => {
        document.getElementById(id).value = '';
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
});
