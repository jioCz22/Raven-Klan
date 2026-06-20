/**
 * routes/sesionActual.js
 * ============================================================
 * Equivalente a sesion_actual.php
 * GET /api/sesion-actual
 * ============================================================
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.usuarioId) {
    res.json({
      ok: true,
      autenticado: true,
      usuario: {
        id: req.session.usuarioId,
        nombre: req.session.nombre,
        rol: req.session.rol
      }
    });
  } else {
    res.json({ ok: true, autenticado: false });
  }
});

module.exports = router;
