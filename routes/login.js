/**
 * routes/login.js
 * ============================================================
 * Equivalente a login.php
 * POST /api/login  { email, password }
 * ============================================================
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db/conexion');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ ok: false, error: 'Ingresa tu correo y contraseña' });
  }

  try {
    const resultado = await pool.query(
      'SELECT id, nombre, email, password_hash, rol, activo FROM usuarios WHERE email = $1',
      [email.trim()]
    );
    const usuario = resultado.rows[0];

    // Mismo mensaje de error sin importar si fue el correo o la
    // contraseña lo que falló — evita revelar qué correos existen.
    const credencialesInvalidas = () =>
      res.status(401).json({ ok: false, error: 'Correo o contraseña incorrectos' });

    if (!usuario) return credencialesInvalidas();

    const coincide = await bcrypt.compare(password, usuario.password_hash);
    if (!coincide) return credencialesInvalidas();

    if (!usuario.activo) {
      return res.status(403).json({ ok: false, error: 'Esta cuenta está deshabilitada' });
    }

    req.session.usuarioId = usuario.id;
    req.session.nombre = usuario.nombre;
    req.session.rol = usuario.rol;

    res.json({
      ok: true,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ ok: false, error: 'Error en el servidor' });
  }
});

module.exports = router;
