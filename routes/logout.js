/**
 * routes/logout.js
 * ============================================================
 * Equivalente a logout.php
 * POST /api/logout
 * ============================================================
 */

const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error cerrando sesión:', err);
      return res.status(500).json({ ok: false, error: 'Error cerrando sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

module.exports = router;
