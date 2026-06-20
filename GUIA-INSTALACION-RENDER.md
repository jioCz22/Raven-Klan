# RAVEN — Guía de instalación en Render (demo gratuita)

Esta guía te lleva de cero a tener login, soporte y base de datos
funcionando en tu sitio, usando **gratis** lo que ya tienes: tu cuenta
de GitHub y tu cuenta de Render.

---

## ⚠️ Léeme primero — qué es y qué NO es esto

Esto es una **demo temporal**, no una solución definitiva:

- El Web Service gratuito de Render se "duerme" tras 15 minutos sin
  visitas. La primera visita después de dormir tarda 30-60 segundos
  en responder (luego va normal). Esto es solo cosmético — no pierdes
  datos, solo se siente lento la primera vez.
- **La base de datos PostgreSQL gratuita se borra a los 30 días**
  de haberla creado. Render te avisa por correo antes (7, 3 y 1 día
  antes de que expire). Cuando expire, **pierdes todo**: usuarios,
  pedidos, tickets — todo.
- Por eso esto sirve para **demostrar** a los dueños que la función
  funciona, y tomar capturas/grabaciones para la presentación, **no**
  para usarlo con clientes reales todavía.

Cuando los dueños aprueben presupuesto, migramos a un plan pagado
(de Render mismo, o a Hostinger) sin perder el código — solo cambia
dónde vive.

---

## 0. Qué construimos

```
raven-node/
├── server.js                  ← arranca todo
├── package.json
├── .env.example
├── .gitignore
├── db/
│   ├── conexion.js
│   └── esquema.sql
├── routes/
│   ├── registro.js
│   ├── login.js
│   ├── logout.js
│   ├── sesionActual.js
│   ├── soporte.js
│   ├── guardarPedido.js
│   ├── misPedidos.js
│   └── admin.js
├── scripts/
│   └── crear_admin.js
└── public/                    ← AQUÍ va tu sitio actual
    ├── index.html              (el tuyo, con la barra agregada)
    ├── css/...
    ├── js/...                  (con auth.js y el script.js parcheado)
    ├── assets/...
    └── admin.html
```

**Idea central:** ya no separamos "sitio" (Render Static Site) de
"backend" (otro lado). Todo vive en **un solo Web Service de Render**,
que sirve tanto tu HTML/CSS/JS como las rutas de la API.

---

## 1. Prepara la carpeta del proyecto

1. Descarga el paquete `raven-node` (te lo doy al final de esta guía).
2. Copia tu sitio actual (index.html, css/, js/, assets/) **dentro**
   de la carpeta `public/` de este proyecto.
3. Aplica los 2 cambios pendientes (igual que antes):
   - Pega el bloque de la barra superior y los modales en tu
     `index.html` (carpeta `fragmento-topbar-y-modales.html`)
   - Reemplaza la función `comprar()` en tu `script.js` con la del
     archivo `public/parche-script-comprar.js`
4. En el `<head>` de tu `index.html`, agrega el CSS de la barra
   (reutiliza el `css/auth.css` que ya tenías).
5. Antes de `</body>`, agrega:
   ```html
   <script src="auth.js"></script>
   ```
   (nota: ya no es `js/auth.js`, va directo en la raíz de `public/`
   en este paquete — ajusta la ruta según donde lo pongas)

---

## 2. Sube el proyecto a GitHub

Si tu repo actual de Render es un Static Site, te recomiendo crear
un **repositorio nuevo** para este proyecto (no mezclar), así no
hay confusión entre el sitio viejo y el nuevo.

```bash
cd raven-node
git init
git add .
git commit -m "Backend RAVEN con login, soporte y pedidos"
```

Luego crea un repo nuevo en GitHub (puede ser privado, sin problema)
y conéctalo:

```bash
git remote add origin https://github.com/TU_USUARIO/raven-backend.git
git branch -M main
git push -u origin main
```

---

## 3. Crea la base de datos en Render

1. Entra a tu **Render Dashboard**.
2. Clic en **New +** → **PostgreSQL**.
3. Nombra la base, por ejemplo `raven-db`.
4. Región: elige la misma que vayas a usar para tu Web Service
   (ej. Oregon, o la más cercana a tus usuarios).
5. Plan: **Free**.
6. Clic en **Create Database**.
7. Espera a que esté lista (unos segundos), y entra a su panel.

**Anota (o ten a la mano) estos datos de la pestaña "Connect":**
- Internal Database URL (la usarás dentro de Render)
- External Database URL (la usarás para conectarte desde tu compu, ej. para correr el script de admin)

---

## 4. Crea las tablas

En el panel de tu base de datos en Render, busca el botón
**"Connect"** → **"PSQL Command"**. Cópialo y pégalo en tu terminal
(necesitas tener `psql` instalado, o usa la opción "Shell" si Render
la ofrece directo en el navegador).

Una vez dentro de la terminal de PostgreSQL, pega el contenido
completo del archivo `db/esquema.sql`.

---

## 5. Crea tu usuario administrador

Desde tu computadora, en la carpeta del proyecto:

```bash
# 1) Instala las dependencias
npm install

# 2) Crea un archivo .env con la External Database URL que copiaste
echo "DATABASE_URL=postgresql://...(tu URL externa)..." > .env

# 3) Corre el script, con TUS datos reales
node scripts/crear_admin.js "Tu Nombre" "admin@ravenklan.com" "5218714701253" "una_contraseña_segura"
```

Si todo sale bien, verás un mensaje `✅ Usuario admin listo` con tus
datos. Esa es tu cuenta para entrar a `/admin.html`.

---

## 6. Crea el Web Service en Render

1. En el Dashboard, clic en **New +** → **Web Service**.
2. Conecta el repositorio de GitHub que subiste en el paso 2.
3. Configuración:
   - **Name:** `raven-backend` (o el que quieras — esto define tu URL `.onrender.com`)
   - **Region:** la misma que tu base de datos (importante para que la conexión interna funcione rápido)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** **Free**
4. En la sección **Environment Variables**, agrega:
   - `DATABASE_URL` → pega aquí la **Internal Database URL** de tu base (no la externa — la interna es más rápida y no cuenta contra tu ancho de banda)
   - `SESSION_SECRET` → cualquier texto largo y aleatorio (ej. genera uno en https://1password.com/password-generator/ y pégalo)
   - `NODE_ENV` → `production`
5. Clic en **Create Web Service**.

Render va a clonar tu repo, instalar dependencias y arrancar el
servidor. Tarda unos minutos la primera vez.

---

## 7. Pruébalo

1. Abre la URL que te dio Render (algo como `raven-backend.onrender.com`)
2. Deberías ver tu tienda con la barra superior arriba
3. Regístrate con una cuenta de prueba
4. Compra un producto con sesión iniciada
5. Ve a `tudominio.onrender.com/admin.html`, entra con tu cuenta admin, y revisa que el pedido aparezca

---

## 8. (Opcional) Conecta tu propio dominio

Si ya tienes o compras un dominio (ej. en Namecheap, GoDaddy, etc.):

1. En el panel de tu Web Service en Render, ve a **Settings** → **Custom Domains**
2. Agrega tu dominio
3. Render te da un registro CNAME o A que debes agregar en el panel de DNS de donde compraste el dominio
4. Espera la propagación (puede tardar de minutos a un par de horas)

---

## 9. Recordatorio de los 30 días

Pon una alarma o recordatorio: a los **25-28 días** de creada la base
de datos, decide si:
- Ya tienes presupuesto aprobado → migra a un plan pagado de Render
  ($6 USD/mes para la base de datos, según la tabla de precios actual)
- Aún no → exporta tus datos de prueba (un simple `pg_dump`) por si
  quieres conservarlos, y ya sabrás exactamente qué pedir cuando
  presentes el presupuesto.

---

## 10. Resumen de endpoints (referencia rápida)

| Endpoint | Método | Qué hace |
|---|---|---|
| `/api/registro` | POST | Crea cuenta nueva |
| `/api/login` | POST | Inicia sesión |
| `/api/logout` | POST | Cierra sesión |
| `/api/sesion-actual` | GET | Dice si hay sesión activa |
| `/api/soporte` | POST | Guarda un ticket de soporte |
| `/api/guardar-pedido` | POST | Guarda un pedido (requiere sesión) |
| `/api/mis-pedidos` | GET | Historial del usuario en sesión |
| `/admin/pedidos` | GET | Lista todos los pedidos (solo admin) |
| `/admin/tickets` | GET | Lista todos los tickets (solo admin) |
| `/admin/actualizar-estado` | POST | Cambia estado de pedido/ticket (solo admin) |
