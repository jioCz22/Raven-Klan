/**
 * routes/soporte.js
 * ============================================================
 * Equivalente a soporte.php
 * POST /api/soporte  { nombre, email, asunto, mensaje }
 * ============================================================
 */

const express = require('express');
const pool = require('../db/conexion');

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return res.status(400).json({ ok: false, error: 'Completa todos los campos' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: 'Correo electrónico inválido' });
  }

  try {
    const usuarioId = req.session.usuarioId || null;

    await pool.query(
      `INSERT INTO tickets_soporte (usuario_id, nombre, email, asunto, mensaje)
       VALUES ($1, $2, $3, $4, $5)`,
      [usuarioId, nombre.trim(), email.trim(), asunto.trim(), mensaje.trim()]
    );

    res.json({ ok: true, mensaje: 'Tu mensaje fue enviado. Te contactaremos pronto.' });
  } catch (err) {
    console.error('Error en soporte:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
