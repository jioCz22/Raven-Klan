/**
 * scripts/crear_admin.js
 * ============================================================
 * Crea (o actualiza) un usuario administrador directamente en
 * la base de datos, generando un hash de contraseña válido en
 * el momento — así nunca dependes de copiar un hash desde otro
 * lugar, que es una fuente común de errores.
 *
 * USO (desde la terminal, dentro de la carpeta del proyecto):
 *
 *   node scripts/crear_admin.js "Admin RAVEN" "admin@ravenklan.com" "5218714701253" "TU_CONTRASEÑA_SEGURA"
 *
 * Requiere que la variable de entorno DATABASE_URL esté
 * configurada (ya sea en tu .env local, o automáticamente si
 * lo corres desde la "Shell" de tu Web Service en Render).
 * ============================================================
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../db/conexion');

async function crearAdmin() {
  const [nombre, email, telefono, password] = process.argv.slice(2);

  if (!nombre || !email || !telefono || !password) {
    console.error('Uso: node scripts/crear_admin.js "Nombre" "correo@ejemplo.com" "5218714701253" "contraseña"');
    process.exit(1);
  }

  if (password.length < 6) {
    console.error('La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  try {
    // Si el correo ya existe, actualizamos su contraseña y rol;
    // si no existe, lo creamos. Esto hace el script seguro de
    // correr varias veces (por ejemplo, para cambiar la contraseña).
    const resultado = await pool.query(
      `INSERT INTO usuarios (nombre, email, telefono, password_hash, rol)
       VALUES ($1, $2, $3, $4, 'admin')
       ON CONFLICT (email)
       DO UPDATE SET password_hash = EXCLUDED.password_hash, rol = 'admin'
       RETURNING id, nombre, email, rol`,
      [nombre, email, telefono, hash]
    );

    console.log('✅ Usuario admin listo:');
    console.log(resultado.rows[0]);
  } catch (err) {
    console.error('❌ Error creando el admin:', err.message);
  } finally {
    await pool.end();
  }
}

crearAdmin();
