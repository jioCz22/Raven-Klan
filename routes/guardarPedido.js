/**
 * routes/guardarPedido.js
 * ============================================================
 * Equivalente a guardar_pedido.php
 * POST /api/guardar-pedido  { producto_id, nombre_producto, talla, precio }
 * ============================================================
 */

const express = require('express');
const pool = require('../db/conexion');

const router = express.Router();

router.post('/', async (req, res) => {
  // Si no hay sesión, no hay a quién asociar el pedido. No
  // bloqueamos la compra, simplemente no lo guardamos.
  if (!req.session.usuarioId) {
    return res.json({ ok: true, guardado: false });
  }

  const { producto_id, nombre_producto, talla, precio } = req.body;

  if (!nombre_producto?.trim()) {
    return res.status(400).json({ ok: false, error: 'Falta el nombre del producto' });
  }

  try {
    await pool.query(
      `INSERT INTO pedidos (usuario_id, producto_id, nombre_producto, talla, precio)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.session.usuarioId, producto_id || null, nombre_producto.trim(), talla || null, precio || 0]
    );

    res.json({ ok: true, guardado: true });
  } catch (err) {
    console.error('Error guardando pedido:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
