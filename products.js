// routes/products.js  –  Product listing
const router = require('express').Router();
const db     = require('../config/db');

// ─── GET /api/products ───────────────────────────────────────
//  Query params: ?category=Clothing&sort=price-asc&q=dress
router.get('/', async (req, res) => {
  try {
    const { category, sort, q } = req.query;

    let sql = `
      SELECT p.id, p.name, p.description, p.price, p.original_price,
             p.emoji, p.badge, p.rating, p.review_count,
             c.name AS category,
             GROUP_CONCAT(ps.size_label ORDER BY ps.id) AS sizes
      FROM products p
      JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_sizes ps ON ps.product_id = p.id
      WHERE p.is_active = 1
    `;
    const params = [];

    if (category && category !== 'All') {
      sql += ' AND c.name = ?';
      params.push(category);
    }
    if (q) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${q}%`, `%${q}%`);
    }

    sql += ' GROUP BY p.id';

    const orderMap = {
      'price-asc':  'p.price ASC',
      'price-desc': 'p.price DESC',
      'rating':     'p.rating DESC',
      'newest':     'p.created_at DESC',
    };
    sql += ` ORDER BY ${orderMap[sort] || 'p.id ASC'}`;

    const [rows] = await db.query(sql, params);

    // Parse sizes CSV → array
    const products = rows.map(p => ({
      ...p,
      sizes: p.sizes ? p.sizes.split(',') : null
    }));

    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch products' });
  }
});

// ─── GET /api/products/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category,
              GROUP_CONCAT(ps.size_label ORDER BY ps.id) AS sizes
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_sizes ps ON ps.product_id = p.id
       WHERE p.id = ? AND p.is_active = 1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'Product not found' });

    const p = rows[0];
    res.json({ product: { ...p, sizes: p.sizes ? p.sizes.split(',') : null } });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch product' });
  }
});

module.exports = router;
