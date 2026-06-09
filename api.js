// api.js  –  Drop this file alongside your frontend HTML
// Include it with:  <script src="api.js"></script>
// Then call window.LuxeAPI.* from your app code.

const LuxeAPI = (() => {
  const BASE = 'http://localhost:5000/api';

  // ── Token helpers ────────────────────────────────────────
  const getToken  = ()       => localStorage.getItem('luxe_token');
  const setToken  = (t)      => localStorage.setItem('luxe_token', t);
  const clearToken = ()      => localStorage.removeItem('luxe_token');

  // ── Fetch wrapper ────────────────────────────────────────
  async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
      const token = getToken();
      if (!token) throw new Error('Not logged in');
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ══════════════════════════════════════════════════════════
  //  AUTH
  // ══════════════════════════════════════════════════════════

  async function register(name, email, password) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
    setToken(data.token);
    return data.user;
  }

  async function login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(data.token);
    return data.user;
  }

  function logout() { clearToken(); }

  async function getMe() {
    const data = await request('/auth/me', { auth: true });
    return data.user;
  }

  function isLoggedIn() { return !!getToken(); }

  // ══════════════════════════════════════════════════════════
  //  PRODUCTS
  // ══════════════════════════════════════════════════════════

  async function getProducts({ category, sort, q } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (sort)     params.set('sort', sort);
    if (q)        params.set('q', q);
    const qs = params.toString();
    const data = await request('/products' + (qs ? `?${qs}` : ''));
    return data.products;
  }

  async function getProduct(id) {
    const data = await request(`/products/${id}`);
    return data.product;
  }

  // ══════════════════════════════════════════════════════════
  //  CART  (requires login)
  // ══════════════════════════════════════════════════════════

  async function getCart() {
    const data = await request('/cart', { auth: true });
    return data.cart;
  }

  async function addToCart(productId, size = null, quantity = 1) {
    return request('/cart', {
      method: 'POST',
      auth: true,
      body: { product_id: productId, size, quantity },
    });
  }

  async function updateCartItem(cartItemId, quantity) {
    return request(`/cart/${cartItemId}`, {
      method: 'PATCH',
      auth: true,
      body: { quantity },
    });
  }

  async function removeCartItem(cartItemId) {
    return request(`/cart/${cartItemId}`, { method: 'DELETE', auth: true });
  }

  async function clearCart() {
    return request('/cart', { method: 'DELETE', auth: true });
  }

  // ══════════════════════════════════════════════════════════
  //  ORDERS  (requires login)
  // ══════════════════════════════════════════════════════════

  /**
   * Checkout:
   * @param {Object} address   - { first_name, last_name, address_line, city, postal_code, country }
   * @param {Array}  cartItems - [{ product_id, name, price, size, quantity }]
   * @param {Object} paymentMeta - { method, card_last4, card_brand, transaction_id }
   *
   * IMPORTANT: Never pass full card numbers here.
   * In production, use Stripe.js / Razorpay SDK to tokenise the card
   * client-side, then pass only the transaction_id returned by the gateway.
   */
  async function checkout(address, cartItems, paymentMeta = {}) {
    const data = await request('/orders/checkout', {
      method: 'POST',
      auth: true,
      body: { address, cartItems, paymentMeta },
    });
    return data;
  }

  async function getOrders() {
    const data = await request('/orders', { auth: true });
    return data.orders;
  }

  async function getOrder(id) {
    const data = await request(`/orders/${id}`, { auth: true });
    return data.order;
  }

  // ── Public API ───────────────────────────────────────────
  return {
    // auth
    register, login, logout, getMe, isLoggedIn,
    // products
    getProducts, getProduct,
    // cart
    getCart, addToCart, updateCartItem, removeCartItem, clearCart,
    // orders
    checkout, getOrders, getOrder,
  };
})();

window.LuxeAPI = LuxeAPI;
