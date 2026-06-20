// ============================================================
// RAVEN — auth.js (versión Node/Express)
// Maneja: barra superior, modales de login/registro/soporte,
// estado de sesión y carga del historial de pedidos.
// ============================================================
// ÚNICO CAMBIO respecto a la versión PHP: las rutas de la API
// ya no terminan en ".php" y usan guiones en vez de guion_bajo
// (es la convención normal en Express). Todo lo demás es igual.
// ============================================================

const API_BASE = "/api"; // mismo dominio que el sitio, porque ahora todo vive en el mismo Web Service

// ── Helpers de modales (genéricos, reutilizables) ──
function abrirAuthModal(idModal) {
    document.getElementById(idModal)?.classList.add("activo");
}

function cerrarAuthModal(idModal) {
    document.getElementById(idModal)?.classList.remove("activo");
    const msg = document.querySelector(`#${idModal} .auth-msg`);
    if (msg) { msg.classList.remove("visible", "error", "exito"); msg.textContent = ""; }
}

function cambiarAModal(idActual, idNuevo) {
    cerrarAuthModal(idActual);
    abrirAuthModal(idNuevo);
}

function mostrarMensaje(idMsg, texto, tipo) {
    const el = document.getElementById(idMsg);
    if (!el) return;
    el.textContent = texto;
    el.classList.remove("error", "exito");
    el.classList.add("visible", tipo);
}

// ── Botones de la barra superior ──
document.getElementById("btnAbrirLogin")?.addEventListener("click", () => {
    abrirAuthModal("modalLogin");
});

document.getElementById("btnAbrirSoporte")?.addEventListener("click", () => {
    abrirAuthModal("modalSoporte");
    if (window.usuarioActual) {
        document.getElementById("soporteNombre").value = window.usuarioActual.nombre || "";
    }
});

document.getElementById("btnLogout")?.addEventListener("click", async () => {
    await fetch(`${API_BASE}/logout`, { method: "POST" });
    window.usuarioActual = null;
    actualizarBarraSegunSesion(null);
});

document.getElementById("nombreUsuarioBar")?.addEventListener("click", () => {
    abrirAuthModal("modalPerfil");
    cargarMisPedidos();
});

document.querySelectorAll(".auth-modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) cerrarAuthModal(modal.id);
    });
});

// ============================================================
// LOGIN
// ============================================================
document.getElementById("formLogin")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitLogin");
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    btn.disabled = true;
    try {
        const resp = await fetch(`${API_BASE}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // IMPORTANTE: envía/recibe la cookie de sesión
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();

        if (!data.ok) {
            mostrarMensaje("loginMsg", data.error || "Error al iniciar sesión", "error");
            return;
        }

        window.usuarioActual = data.usuario;
        actualizarBarraSegunSesion(data.usuario);
        cerrarAuthModal("modalLogin");
        document.getElementById("formLogin").reset();
    } catch (err) {
        mostrarMensaje("loginMsg", "No se pudo conectar con el servidor", "error");
    } finally {
        btn.disabled = false;
    }
});

// ============================================================
// REGISTRO
// ============================================================
document.getElementById("formRegistro")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitRegistro");

    const nombre   = document.getElementById("regNombre").value.trim();
    const email    = document.getElementById("regEmail").value.trim();
    const telefono = document.getElementById("regTelefono").value.trim();
    const password = document.getElementById("regPassword").value;

    btn.disabled = true;
    try {
        const resp = await fetch(`${API_BASE}/registro`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nombre, email, telefono, password })
        });
        const data = await resp.json();

        if (!data.ok) {
            mostrarMensaje("registroMsg", data.error || "Error al crear la cuenta", "error");
            return;
        }

        window.usuarioActual = data.usuario;
        actualizarBarraSegunSesion(data.usuario);
        cerrarAuthModal("modalRegistro");
        document.getElementById("formRegistro").reset();
    } catch (err) {
        mostrarMensaje("registroMsg", "No se pudo conectar con el servidor", "error");
    } finally {
        btn.disabled = false;
    }
});

// ============================================================
// SOPORTE
// ============================================================
document.getElementById("formSoporte")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("btnSubmitSoporte");

    const nombre  = document.getElementById("soporteNombre").value.trim();
    const email   = document.getElementById("soporteEmail").value.trim();
    const asunto  = document.getElementById("soporteAsunto").value.trim();
    const mensaje = document.getElementById("soporteMensaje").value.trim();

    btn.disabled = true;
    try {
        const resp = await fetch(`${API_BASE}/soporte`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ nombre, email, asunto, mensaje })
        });
        const data = await resp.json();

        if (!data.ok) {
            mostrarMensaje("soporteMsg", data.error || "Error al enviar tu mensaje", "error");
            return;
        }

        mostrarMensaje("soporteMsg", data.mensaje || "Mensaje enviado correctamente", "exito");
        document.getElementById("formSoporte").reset();
        setTimeout(() => cerrarAuthModal("modalSoporte"), 1800);
    } catch (err) {
        mostrarMensaje("soporteMsg", "No se pudo conectar con el servidor", "error");
    } finally {
        btn.disabled = false;
    }
});

// ============================================================
// ESTADO DE SESIÓN EN LA BARRA SUPERIOR
// ============================================================
function actualizarBarraSegunSesion(usuario) {
    const btnLogin = document.getElementById("btnAbrirLogin");
    const userBox  = document.getElementById("topBarUser");
    const nombreEl = document.getElementById("nombreUsuarioBar");

    if (usuario) {
        btnLogin.style.display = "none";
        userBox.classList.add("activo");
        nombreEl.textContent = usuario.nombre;
        nombreEl.style.cursor = "pointer";
    } else {
        btnLogin.style.display = "flex";
        userBox.classList.remove("activo");
    }
}

async function revisarSesionInicial() {
    try {
        const resp = await fetch(`${API_BASE}/sesion-actual`, { credentials: "include" });
        const data = await resp.json();
        if (data.ok && data.autenticado) {
            window.usuarioActual = data.usuario;
            actualizarBarraSegunSesion(data.usuario);
        } else {
            actualizarBarraSegunSesion(null);
        }
    } catch (err) {
        console.warn("No se pudo verificar la sesión:", err);
    }
}

// ============================================================
// HISTORIAL DE PEDIDOS (modal de perfil)
// ============================================================
async function cargarMisPedidos() {
    document.getElementById("perfilEmail").textContent = window.usuarioActual?.nombre
        ? `Hola, ${window.usuarioActual.nombre}`
        : "";

    const contenedor = document.getElementById("historialPedidos");
    contenedor.innerHTML = `<p class="sin-pedidos">Cargando...</p>`;

    try {
        const resp = await fetch(`${API_BASE}/mis-pedidos`, { credentials: "include" });
        const data = await resp.json();

        if (!data.ok || !data.pedidos || data.pedidos.length === 0) {
            contenedor.innerHTML = `<p class="sin-pedidos">Aún no tienes pedidos registrados.</p>`;
            return;
        }

        contenedor.innerHTML = data.pedidos.map(p => `
            <div class="pedido-item">
                <strong>${p.nombre_producto}</strong>${p.talla ? ` — Talla ${p.talla}` : ''}<br>
                <span class="pedido-fecha">${new Date(p.creado_en).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                — $${parseFloat(p.precio).toFixed(2)} MXN
                <br>
                <span class="pedido-estado ${p.estado}">${p.estado}</span>
            </div>
        `).join("");
    } catch (err) {
        contenedor.innerHTML = `<p class="sin-pedidos">No se pudo cargar tu historial.</p>`;
    }
}

// ============================================================
// INICIALIZACIÓN
// ============================================================
document.addEventListener("DOMContentLoaded", revisarSesionInicial);
