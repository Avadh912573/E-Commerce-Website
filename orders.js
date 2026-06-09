// routes/orders.js  –  Checkout, order history, payment save
const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ─── Helper: generate order number ───────────────────────────
function genOrderNumber() {
  return 'LX-' + String(Math.floor(10000 + Math.random() * 90000));
}

// ─── POST /api/orders/checkout  –  place order ───────────────
//  Body: { address, cartItems, paymentMeta }
//
//  address:     { first_name, last_name, address_line, city, postal_code, country }
//  cartItems:   [{ product_id, size, quantity, price, name }]
//  paymentMeta: { method, card_last4, card_brand, transaction_id }
//
//  NOTE: Real apps use a payment gateway (Stripe/Razorpay).
//        This route saves order + safe payment metadata only.
// ─────────────────────────────────────────────────────────────
router.post('/checkout', auth, async (req, res) => {
  const { address, cartItems, paymentMeta } = req.body;

  if (!cartItems || cartItems.length === 0)
    return res.status(400).json({ error: 'Cart is empty' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1️⃣  Save / reuse address
    const [addrResult] = await conn.query(
      `INSERT INTO addresses
         (user_id, first_name, last_name, address_line, city, postal_code, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        address.first_name, address.last_name,
        address.address_line, address.city,
        address.postal_code, address.country
      ]
    );
    const addressId = addrResult.insertId;

    // 2️⃣  Calculate totals
    const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shipping  = subtotal >= 75 ? 0 : 8;
    const tax       = parseFloat((subtotal * 0.08).toFixed(2));
    const total     = parseFloat((subtotal + shipping + tax).toFixed(2));

    // 3️⃣  Create order
    const orderNumber = genOrderNumber();
    const [orderResult] = await conn.query(
      `INSERT INTO orders
         (order_number, user_id, address_id, subtotal, shipping, tax, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
      [orderNumber, req.user.id, addressId, subtotal, shipping, tax, total]
    );
    const orderId = orderResult.insertId;

    // 4️⃣  Insert order items
    const itemValues = cartItems.map(i => [
      orderId, i.product_id, i.name, i.price, i.size || null, i.quantity
    ]);
    await conn.query(
      `INSERT INTO order_items
         (order_id, product_id, product_name, price, size, quantity)
       VALUES ?`,
      [itemValues]
    );

    // 5️⃣  Save payment metadata (safe fields only – no raw card numbers)
    const pm = paymentMeta || {};
    await conn.query(
      `INSERT INTO payment_details
         (order_id, payment_method, card_last4, card_brand, transaction_id, status, paid_at)
       VALUES (?, ?, ?, ?, ?, 'success', NOW())`,
      [
        orderId,
        pm.method        || 'card',
        pm.card_last4    || null,
        pm.card_brand    || null,
        pm.transaction_id|| null
      ]
    );

    // 6️⃣  Clear the user's cart
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await conn.commit();

    res.status(201).json({
      message:      'Order placed successfully',
      order_number: orderNumber,
      order_id:     orderId,
      total
    });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: 'Checkout failed. Please try again.' });
  } finally {
    conn.release();
  }
});

// ─── GET /api/orders  –  list user's orders ──────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.id, o.order_number, o.total, o.status, o.created_at,
              a.city, a.country
       FROM orders o
       LEFT JOIN addresses a ON a.id = o.address_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// ─── GET /api/orders/:id  –  single order with items ─────────
router.get('/:id', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, a.first_name, a.last_name, a.address_line,
              a.city, a.postal_code, a.country,
              p.payment_method, p.card_last4, p.card_brand, p.status AS payment_status
       FROM orders o
       LEFT JOIN addresses a      ON a.id = o.address_id
       LEFT JOIN payment_details p ON p.order_id = o.id
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (orders.length === 0)
      return res.status(404).json({ error: 'Order not found' });

    const [items] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [req.params.id]
    );

    res.json({ order: { ...orders[0], items } });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch order' });
  }
});

module.exports = router;
