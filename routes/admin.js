/**
 * routes/admin.js
 * ============================================================
 * Equivalente a admin/pedidos.php, admin/tickets.php y
 * admin/actualizar_estado.php — agrupados aquí por simplicidad.
 *
 * Todas las rutas exigen que la sesión tenga rol = 'admin'.
 * ============================================================
 */

const express = require('express');
const pool = require('../db/conexion');

const router = express.Router();

// Middleware: solo deja pasar si hay sesión de admin
function requerirAdmin(req, res, next) {
  if (!req.session.usuarioId || req.session.rol !== 'admin') {
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  }
  next();
}

// GET /admin/pedidos
router.get('/pedidos', requerirAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT p.id, p.nombre_producto, p.talla, p.precio, p.estado, p.creado_en,
              u.nombre AS cliente_nombre, u.telefono AS cliente_telefono
       FROM pedidos p
       LEFT JOIN usuarios u ON u.id = p.usuario_id
       ORDER BY p.creado_en DESC`
    );
    res.json({ ok: true, pedidos: resultado.rows });
  } catch (err) {
    console.error('Error obteniendo pedidos (admin):', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

// GET /admin/tickets
router.get('/tickets', requerirAdmin, async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, nombre, email, asunto, mensaje, estado, creado_en
       FROM tickets_soporte
       ORDER BY creado_en DESC`
    );
    res.json({ ok: true, tickets: resultado.rows });
  } catch (err) {
    console.error('Error obteniendo tickets (admin):', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

// POST /admin/actualizar-estado  { tipo: 'pedido'|'ticket', id, estado }
router.post('/actualizar-estado', requerirAdmin, async (req, res) => {
  const { tipo, id, estado } = req.body;

  // Whitelist fija: nunca construimos el nombre de tabla a partir
  // de algo que venga directo del usuario.
  const configuraciones = {
    pedido: { tabla: 'pedidos', estados: ['pendiente', 'confirmado', 'enviado', 'cancelado'] },
    ticket: { tabla: 'tickets_soporte', estados: ['abierto', 'en_proceso', 'resuelto'] }
  };

  const config = configuraciones[tipo];
  if (!config || !Number.isInteger(id) && !Number.isInteger(Number(id))) {
    return res.status(400).json({ ok: false, error: 'Datos inválidos' });
  }

  if (!config.estados.includes(estado)) {
    return res.status(400).json({ ok: false, error: 'Estado no válido para este tipo' });
  }

  try {
    await pool.query(
      `UPDATE ${config.tabla} SET estado = $1 WHERE id = $2`,
      [estado, Number(id)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Error actualizando estado:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
