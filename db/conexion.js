/**
 * db/conexion.js
 * ============================================================
 * Crea el "pool" de conexiones a PostgreSQL. Un pool es un grupo
 * de conexiones reutilizables — más eficiente que abrir una
 * conexión nueva en cada petición (equivalente a lo que hacía
 * PDO automáticamente en PHP).
 *
 * La URL de conexión completa viene de la variable de entorno
 * DATABASE_URL. Render la inyecta automáticamente cuando conectas
 * tu Web Service a una base de datos Postgres del mismo proyecto
 * — no necesitas escribirla a mano en producción.
 *
 * Para desarrollo local, la lees desde un archivo .env (ver
 * .env.example en esta misma carpeta).
 * ============================================================
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render Postgres requiere SSL incluso en el plan gratuito.
  // 'rejectUnauthorized: false' es necesario porque Render usa
  // certificados autofirmados internamente; es seguro en este caso
  // porque la conexión interna ya viaja en la red privada de Render.
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

module.exports = pool;
