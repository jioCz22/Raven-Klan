/**
 * server.js
 * ============================================================
 * Punto de entrada del backend. Levanta el servidor Express,
 * configura sesiones, y conecta todas las rutas (equivalentes
 * a cada archivo .php que tenías antes).
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const path = require('path');
const pool = require('./db/conexion');

const app = express();

// ── Middlewares base ──
app.use(express.json()); // permite leer el body JSON de las peticiones (como json_decode en PHP)
app.use(cors({
  origin: true,       // refleja el origen de la petición (ajusta esto si separas frontend/backend en dominios distintos)
  credentials: true   // permite que las cookies de sesión viajen entre frontend y backend
}));

// ── Sesiones guardadas en la misma base de datos Postgres ──
// (equivalente a las sesiones de archivo que usa PHP por defecto,
// pero esto es más confiable en plataformas cloud como Render)
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session', // esta tabla se crea automáticamente sola
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'cambia_esto_en_produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // cookies solo por HTTPS en producción
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 días
  }
}));

// ── Servir el sitio estático con control de caché ──
// HTML nunca se cachea → el navegador siempre pide la versión más nueva
// CSS y JS se invalidan con ?v=X en los links del HTML
app.use(express.static(path.join(__dirname, 'public'), {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // HTML siempre fresco — nunca guardado en caché
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.endsWith('.css') || filePath.endsWith('.js')) {
      // CSS y JS: el navegador revalida antes de usar la copia en caché
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    } else {
      // Imágenes y otros assets: caché de 7 días (cambia el nombre del archivo para invalidar)
      res.setHeader('Cache-Control', 'public, max-age=604800');
    }
  }
}));

// ── Rutas de la API (cada archivo = lo que antes era un .php) ──
app.use('/api/registro', require('./routes/registro'));
app.use('/api/login', require('./routes/login'));
app.use('/api/logout', require('./routes/logout'));
app.use('/api/sesion-actual', require('./routes/sesionActual'));
app.use('/api/soporte', require('./routes/soporte'));
app.use('/api/guardar-pedido', require('./routes/guardarPedido'));
app.use('/api/mis-pedidos', require('./routes/misPedidos'));
app.use('/admin', require('./routes/admin'));

// ── Cualquier ruta no reconocida que no sea /api o /admin,
//    devuelve el index.html (para que las rutas del sitio sigan
//    funcionando si usas anclas o navegación tipo SPA) ──
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/admin')) {
    return next();
  }
  // El index.html también se sirve sin caché
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`RAVEN backend corriendo en el puerto ${PORT}`);
});