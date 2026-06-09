// routes/cart.js  –  Cart CRUD (all protected)
const router = require('express').Router();
const db     = require('../config/db');
const auth   = require('../middleware/auth');

// ─── GET /api/cart  –  fetch user's cart ────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ci.id, ci.product_id, ci.size, ci.quantity,
              p.name, p.price, p.emoji, p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );
    res.json({ cart: rows });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch cart' });
  }
});

// ─── POST /api/cart  –  add / increment item ─────────────────
router.post('/', auth, async (req, res) => {
  const { product_id, size = null, quantity = 1 } = req.body;

  if (!product_id)
    return res.status(400).json({ error: 'product_id is required' });

  try {
    // Upsert: if same product+size exists, increment quantity
    await db.query(
      `INSERT INTO cart_items (user_id, product_id, size, quantity)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, size, quantity]
    );
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add to cart' });
  }
});

// ─── PATCH /api/cart/:id  –  update quantity ─────────────────
router.patch('/:id', auth, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1)
    return res.status(400).json({ error: 'quantity must be >= 1' });

  try {
    const [result] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Cart item not found' });

    res.json({ message: 'Quantity updated' });
  } catch (err) {
    res.status(500).json({ error: 'Could not update cart' });
  }
});

// ─── DELETE /api/cart/:id  –  remove one item ────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ error: 'Could not remove item' });
  }
});

// ─── DELETE /api/cart  –  clear entire cart ──────────────────
router.delete('/', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Could not clear cart' });
  }
});

module.exports = router;
