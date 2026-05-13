1(function () {
  const CART_KEY = 'dinkgear_cart';

  // ── State ─────────────────────────────────────────────────────────
  function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderBadge();
    renderCartItems();
  }

  window.addToCart = function (id, name, size, price, img) {
    const cart = getCart();
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty++; }
    else { cart.push({ id, name, size, price, img, qty: 1 }); }
    saveCart(cart);
    openCart();
  };

  window.removeFromCart = function (id) {
    saveCart(getCart().filter(i => i.id !== id));
  };

  window.updateQty = function (id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart(cart);
  };

  window.getCart = getCart;

  // ── Badge ─────────────────────────────────────────────────────────
  function renderBadge() {
    const count = getCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ── Cart drawer ───────────────────────────────────────────────────
  window.openCart = function () {
    document.getElementById('cart-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
    renderCartItems();
  };

  window.closeCart = function () {
    document.getElementById('cart-overlay').classList.remove('open');
    document.body.style.overflow = '';
  };

  function renderCartItems() {
    const el = document.getElementById('cart-overlay');
    if (!el) return;

    const cart = getCart();
    const itemsEl  = document.getElementById('cart-items');
    const emptyEl  = document.getElementById('cart-empty');
    const footerEl = document.getElementById('cart-footer');
    const totalEl  = document.getElementById('cart-total-price');

    if (cart.length === 0) {
      itemsEl.innerHTML = '';
      emptyEl.style.display = 'flex';
      footerEl.style.display = 'none';
      return;
    }

    emptyEl.style.display = 'none';
    footerEl.style.display = '';
    totalEl.textContent = '$' + cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">Size: ${item.size}</div>
          <div class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">&#8722;</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
          <button class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>`).join('');
  }

  window.proceedToCheckout = function () {
    closeCart();
    if (typeof openCheckoutDrawer === 'function') {
      openCheckoutDrawer();
    } else {
      window.location.href = 'shop.html';
    }
  };

  // ── Inject cart drawer HTML ───────────────────────────────────────
  function injectCartDrawer() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="dark-overlay" id="cart-overlay">
        <div class="dark-drawer">
          <div class="drawer-header">
            <h2>Your Cart</h2>
            <button class="drawer-close" onclick="closeCart()">&times;</button>
          </div>
          <div id="cart-items" class="cart-items-list"></div>
          <div id="cart-empty" class="cart-empty-state" style="display:none">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle cx="26" cy="26" r="25" stroke="rgba(200,240,0,0.15)" stroke-width="1.5"/>
              <path d="M18 20h16l-2.5 11H20.5L18 20z" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
              <circle cx="22" cy="35" r="1.5" fill="rgba(255,255,255,0.25)"/>
              <circle cx="30" cy="35" r="1.5" fill="rgba(255,255,255,0.25)"/>
              <path d="M14 16h3l2 4" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <p>Your cart is empty</p>
            <button class="drawer-secondary-btn" onclick="closeCart()">Keep Shopping</button>
          </div>
          <div id="cart-footer" class="cart-drawer-footer" style="display:none">
            <div class="cart-total-row">
              <span>Subtotal</span>
              <span id="cart-total-price">$0.00</span>
            </div>
            <button class="drawer-primary-btn" onclick="proceedToCheckout()">Checkout</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrap.firstElementChild);

    document.getElementById('cart-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeCart();
    });
  }

  // ── Inject cart button into every nav ────────────────────────────
  function injectCartBtn() {
    const nav = document.querySelector('nav');
    if (!nav) return;
    const btn = document.createElement('button');
    btn.className = 'cart-btn';
    btn.setAttribute('aria-label', 'Open cart');
    btn.onclick = openCart;
    btn.innerHTML = `
      <img src="images/shopping cart.png" alt="Cart" width="22" height="22" style="display:block;filter:invert(1) brightness(0.75);">
      <span class="cart-badge" style="display:none">0</span>`;
    nav.appendChild(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectCartDrawer();
    injectCartBtn();
    renderBadge();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeCart();
    });
  });
})();
