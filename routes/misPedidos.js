/**
 * routes/misPedidos.js
 * ============================================================
 * Equivalente a mis_pedidos.php
 * GET /api/mis-pedidos
 * ============================================================
 */

const express = require('express');
const pool = require('../db/conexion');

const router = express.Router();

router.get('/', async (req, res) => {
  if (!req.session.usuarioId) {
    return res.status(401).json({ ok: false, error: 'Debes iniciar sesión' });
  }

  try {
    const resultado = await pool.query(
      `SELECT id, nombre_producto, talla, precio, estado, creado_en
       FROM pedidos
       WHERE usuario_id = $1
       ORDER BY creado_en DESC`,
      [req.session.usuarioId]
    );

    res.json({ ok: true, pedidos: resultado.rows });
  } catch (err) {
    console.error('Error obteniendo pedidos:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
