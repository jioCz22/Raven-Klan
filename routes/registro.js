/**
 * routes/registro.js
 * ============================================================
 * Equivalente a registro.php
 * POST /api/registro  { nombre, email, telefono, password }
 * ============================================================
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/conexion');

const router = express.Router();

router.post('/', async (req, res) => {
  const { nombre, email, telefono, password } = req.body;

  if (!nombre?.trim() || !email?.trim() || !telefono?.trim() || !password) {
    return res.status(400).json({ ok: false, error: 'Todos los campos son obligatorios' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ ok: false, error: 'Correo electrónico inválido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  try {
    const existente = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ ok: false, error: 'Ese correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'cliente')
       RETURNING id, nombre, email, rol`,
      [nombre.trim(), email.trim(), telefono.trim(), hash]
    );

    const usuario = resultado.rows[0];

    // Iniciamos sesión automáticamente tras registrarse
    req.session.usuarioId = usuario.id;
    req.session.nombre = usuario.nombre;
    req.session.rol = usuario.rol;

    res.json({ ok: true, usuario });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
