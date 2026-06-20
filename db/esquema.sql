-- ============================================================
-- RAVEN — Base de datos (versión PostgreSQL para Render)
-- ============================================================
-- DIFERENCIAS CLAVE vs la versión MySQL que ya conoces:
--   - AUTO_INCREMENT  →  SERIAL (Postgres genera el ID así)
--   - ENUM(...)       →  Postgres no tiene un tipo ENUM simple
--                         como MySQL; usamos VARCHAR + CHECK,
--                         que logra lo mismo (solo permite ciertos
--                         valores) de forma más portable.
--   - ENGINE=InnoDB   →  no existe en Postgres, se omite (Postgres
--                         siempre soporta transacciones e
--                         integridad referencial de forma nativa)
--
-- CÓMO USAR ESTE ARCHIVO EN RENDER:
-- 1) Crea tu base de datos "Render Postgres" desde el dashboard
-- 2) Copia la "Internal Database URL" o "External Database URL"
-- 3) Conéctate con un cliente (ej. la pestaña "Connect" del
--    dashboard de Render tiene un botón "PSQL Command" que abre
--    una terminal ya conectada) y pega este archivo completo.
-- ============================================================

-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(120)    NOT NULL,
    email           VARCHAR(150)    NOT NULL UNIQUE,
    telefono        VARCHAR(20),
    password_hash   VARCHAR(255)    NOT NULL,
    rol             VARCHAR(10)     NOT NULL DEFAULT 'cliente'
                        CHECK (rol IN ('cliente', 'admin')),
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW(),
    activo          BOOLEAN         NOT NULL DEFAULT TRUE
);

-- ============================================================
-- TABLA: productos
-- ============================================================
CREATE TABLE productos (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(150)    NOT NULL,
    precio          DECIMAL(10,2)   NOT NULL,
    categoria       VARCHAR(50)     NOT NULL,
    imagen          VARCHAR(255)    NOT NULL,
    descripcion     TEXT,
    es_nuevo        BOOLEAN         NOT NULL DEFAULT FALSE,
    activo          BOOLEAN         NOT NULL DEFAULT TRUE,
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: pedidos
-- ============================================================
CREATE TABLE pedidos (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER         REFERENCES usuarios(id) ON DELETE SET NULL,
    producto_id     INTEGER         REFERENCES productos(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(150)    NOT NULL,
    talla           VARCHAR(10),
    precio          DECIMAL(10,2)   NOT NULL,
    estado          VARCHAR(15)     NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente','confirmado','enviado','cancelado')),
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: tickets_soporte
-- ============================================================
CREATE TABLE tickets_soporte (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER         REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre          VARCHAR(120)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    asunto          VARCHAR(200)    NOT NULL,
    mensaje         TEXT            NOT NULL,
    estado          VARCHAR(15)     NOT NULL DEFAULT 'abierto'
                        CHECK (estado IN ('abierto','en_proceso','resuelto')),
    creado_en       TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
-- DATOS DE EJEMPLO
-- ============================================================
INSERT INTO productos (nombre, precio, categoria, imagen, descripcion, es_nuevo) VALUES
('Japan Clan Tee', 399.00, 'oversize', 'assets/playera1.png',
 'Corte Oversize pesado. Gráfico trasero premium con el círculo rojo del Klan y tipografía de caligrafía japonesa. Disciplina pura.', TRUE),
('White Raven Tank', 399.00, 'oversize', 'assets/playera2.png',
 'Playera drop-shoulder negra con el logotipo gótico RAVEN en el pecho en alta densidad. Diseñada para aguantar entrenamientos extremos de fuerza.', TRUE);

-- ⚠️ NO insertamos aquí un usuario admin con contraseña de ejemplo,
-- porque un hash bcrypt mal copiado simplemente no funciona (y no
-- hay forma de "adivinar" uno válido sin generarlo).
--
-- En su lugar, genera tu propio admin con el script incluido:
--   node scripts/crear_admin.js "Tu Nombre" "tu@correo.com" "5218714701253" "tu_contraseña"
--
-- Ese script se conecta a tu base de datos y crea el usuario admin
-- con un hash válido, generado en el momento. Instrucciones
-- completas en GUIA-INSTALACION-RENDER.md, paso 5.
