// Catálogo de Productos RAVEN
const productos = [
    {
        id: 1,
        nombre: "Japan Clan Tee",
        precio: 399,
        categoria: "oversize",
        imagen: "assets/playera1.png",
        descripcion: "Corte Oversize pesado. Gráfico trasero premium con el círculo rojo del Klan y tipografía de caligrafía japonesa. Disciplina pura.",
        esNuevo: true
    },
    {
        id: 2,
        nombre: "White Raven Tank",
        precio: 399,
        categoria: "oversize",
        imagen: "assets/playera2.png",
        descripcion: "Playera drop-shoulder negra con el logotipo gótico RAVEN en el pecho en alta densidad. Diseñada para aguantar entrenamientos extremos de fuerza.",
        esNuevo: true
    }
];

let categoriaActiva = "todos";
let textoBusqueda = "";

// Renderizar productos
function renderProductos(lista) {
    const grid = document.getElementById("productos-grid");
    if (!grid) return;

    grid.innerHTML = "";

    if (lista.length === 0) {
        grid.innerHTML = `<p class="no-results" style="grid-column:1/-1;text-align:center;color:#555;padding:40px 0;">No se encontraron productos.</p>`;
        return;
    }

    lista.forEach(producto => {
        // Validamos si lleva la etiqueta "NUEVO"
        const etiquetaNuevo = producto.esNuevo ? `<span class="tag-nuevo">NUEVO</span>` : '';

        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <div class="card-img-wrapper">
                <img src="${producto.imagen}" alt="${producto.nombre}">
            </div>
            <div class="card-info">
                ${etiquetaNuevo} 
                <h3>${producto.nombre}</h3>
                <p class="precio-tag">$${producto.precio} MXN</p>
                <button class="btn-ver" onclick="abrirModal(${producto.id})">VER DETALLES</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Filtro combinado: categoría + texto de búsqueda
function aplicarFiltros() {
    const resultado = productos.filter(producto => {
        const coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva;
        const coincideTexto =
            producto.nombre.toLowerCase().includes(textoBusqueda) ||
            producto.categoria.toLowerCase().includes(textoBusqueda);
        return coincideCategoria && coincideTexto;
    });
    renderProductos(resultado);
}

// Buscador
const buscador = document.getElementById("buscador");
if (buscador) {
    buscador.addEventListener("input", () => {
        textoBusqueda = buscador.value.toLowerCase();
        aplicarFiltros();
    });
}

// Filtros de categoría
const filtrosCategoria = document.getElementById("filtrosCategoria");
if (filtrosCategoria) {
    const botonesFiltro = filtrosCategoria.querySelectorAll(".filtro-btn");
    botonesFiltro.forEach(btn => {
        btn.addEventListener("click", () => {
            botonesFiltro.forEach(b => b.classList.remove("activo"));
            btn.classList.add("activo");
            categoriaActiva = btn.dataset.categoria;
            aplicarFiltros();
        });
    });
}

// Estado de talla seleccionada en el modal actual
let tallaSeleccionada = null;

// Abrir modal
function abrirModal(id) {
    const producto = productos.find(p => p.id === id);
    const modal = document.getElementById("modal");
    if (!producto || !modal) return;

    document.getElementById("modalTitulo").textContent = producto.nombre;
    document.getElementById("modalDescripcion").textContent = producto.descripcion;
    document.getElementById("modalPrecio").textContent = `$${producto.precio} MXN`;
    document.getElementById("modalImagen").src = producto.imagen;

    // Reiniciar selección de talla cada vez que se abre un producto
    tallaSeleccionada = null;
    const tallaError = document.getElementById("tallaError");
    if (tallaError) tallaError.classList.remove("visible");

    const botonesTalla = document.querySelectorAll("#tallasOpciones .talla-btn");
    botonesTalla.forEach(btn => {
        btn.classList.remove("seleccionada");
        btn.onclick = () => {
            botonesTalla.forEach(b => b.classList.remove("seleccionada"));
            btn.classList.add("seleccionada");
            tallaSeleccionada = btn.dataset.talla;
            if (tallaError) tallaError.classList.remove("visible");
        };
    });

    const btnComprar = document.getElementById("btnComprar");
    if (btnComprar) {
        btnComprar.onclick = () => {
            if (!tallaSeleccionada) {
                if (tallaError) tallaError.classList.add("visible");
                return;
            }
            comprar(producto.nombre, tallaSeleccionada);
        };
    }

    modal.classList.add("activo");
}

// Cerrar modal
function cerrarModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.classList.remove("activo");
    }
}

// Modal de Guía de Tallas
function abrirModalTallas() {
    const modalTallas = document.getElementById("modalTallas");
    if (modalTallas) modalTallas.classList.add("activo");
}

function cerrarModalTallas() {
    const modalTallas = document.getElementById("modalTallas");
    if (modalTallas) modalTallas.classList.remove("activo");
}

const btnGuiaTallas = document.getElementById("btnGuiaTallas");
if (btnGuiaTallas) {
    btnGuiaTallas.addEventListener("click", abrirModalTallas);
}

// Cerrar modal al hacer clic fuera de la caja contenedora
window.addEventListener("click", (e) => {
    const modal = document.getElementById("modal");
    const modalTallas = document.getElementById("modalTallas");
    if (e.target === modal) {
        cerrarModal();
    }
    if (e.target === modalTallas) {
        cerrarModalTallas();
    }
});

// Redirección de compra a WhatsApp (incluye talla si se proporciona)
async function comprar(nombre, talla, productoId = null, precio = 0) {
    const numeroTelefono = "5218714701253";
    const mensaje = talla
        ? `Hola RAVEN, me interesa adquirir la prenda de la nueva colección: ${nombre}, talla ${talla}. ¿Cómo puedo realizar mi pago?`
        : `Hola RAVEN, me interesa adquirir la prenda de la nueva colección: ${nombre}. ¿Cómo puedo realizar mi pago?`;

    // Intentamos registrar el pedido (no bloquea la compra si falla)
    try {
        await fetch("/api/guardar_pedido.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                producto_id: productoId,
                nombre_producto: nombre,
                talla: talla || null,
                precio: precio
            })
        });
    } catch (err) {
        console.warn("No se pudo registrar el pedido:", err);
    }

    window.open(`https://wa.me/${numeroTelefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// Efecto navbar al hacer scroll — SEPARADOR
// =============================================
// VIDEO DE FONDO EN HERO — fallback a imagen si no carga
// =============================================
(function () {
    const heroVideo = document.getElementById('heroVideo');
    if (!heroVideo) return;
    heroVideo.addEventListener('error', () => {
        heroVideo.style.display = 'none';
    });
    // Si no hay fuente válida (atributo src vacío en el <source>), también ocultar
    const fuente = heroVideo.querySelector('source');
    if (!fuente || !fuente.getAttribute('src')) {
        heroVideo.style.display = 'none';
    }
})();

// =============================================
// HERO SLIDER — MOTOR PRINCIPAL
// =============================================
(function () {
    const slides        = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.getElementById('sliderDots');
    const progressBar   = document.getElementById('sliderProgressBar');

    if (!slides.length) return;

    const TOTAL        = slides.length;
    const INTERVALO    = 5000;
    const DURACION_CSS = 1400;

    let actual   = 0;
    let timer    = null;
    let pausado  = false;

    // Drag / swipe state
    let dragStartX  = 0;
    let isDragging  = false;
    let dragMoved   = false;

    // Crear dots
    const dots = [];
    slides.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'slider-dot' + (i === 0 ? ' activo' : '');
        d.setAttribute('aria-label', `Slide ${i + 1}`);
        d.addEventListener('click', () => { irA(i); iniciarAuto(); });
        dotsContainer.appendChild(d);
        dots.push(d);
    });

    // Contador esquina
    const counter = document.createElement('div');
    counter.className = 'slider-counter';
    counter.innerHTML = `<span>01</span> / ${String(TOTAL).padStart(2,'0')}`;
    document.querySelector('.hero').appendChild(counter);

    function actualizarCounter(i) {
        counter.innerHTML = `<span>${String(i+1).padStart(2,'0')}</span> / ${String(TOTAL).padStart(2,'0')}`;
    }

    function irA(sig) {
        if (sig === actual) return;
        const ant = actual;
        actual = ((sig % TOTAL) + TOTAL) % TOTAL;

        slides[ant].classList.add('saliendo');
        slides[ant].classList.remove('activo');

        requestAnimationFrame(() => requestAnimationFrame(() => {
            slides[actual].classList.add('activo');
        }));

        setTimeout(() => slides[ant].classList.remove('saliendo'), DURACION_CSS + 100);

        dots.forEach((d, i) => d.classList.toggle('activo', i === actual));
        actualizarCounter(actual);
        reiniciarBarra();
    }

    function siguiente() { irA(actual + 1); }
    function anterior()  { irA(actual - 1); }

    function reiniciarBarra() {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetWidth;
        progressBar.style.transition = `width ${INTERVALO}ms linear`;
        progressBar.style.width = '100%';
    }

    function iniciarAuto() {
        clearInterval(timer);
        timer = setInterval(() => { if (!pausado) siguiente(); }, INTERVALO);
        reiniciarBarra();
    }

    const hero = document.querySelector('.hero');

    // ── Touch (móvil) ──
    hero?.addEventListener('touchstart', e => {
        dragStartX = e.touches[0].clientX;
        dragMoved  = false;
    }, { passive: true });

    hero?.addEventListener('touchmove', () => { dragMoved = true; }, { passive: true });

    hero?.addEventListener('touchend', e => {
        if (!dragMoved) return;
        const diff = dragStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? siguiente() : anterior(); iniciarAuto(); }
    }, { passive: true });

    // ── Mouse drag (desktop) ──
    hero?.addEventListener('mousedown', e => {
        dragStartX = e.clientX;
        isDragging = true;
        dragMoved  = false;
        hero.style.cursor = 'grabbing';
    });

    hero?.addEventListener('mousemove', e => {
        if (!isDragging) return;
        if (Math.abs(e.clientX - dragStartX) > 5) dragMoved = true;
    });

    hero?.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        hero.style.cursor = '';
        if (!dragMoved) return;
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? siguiente() : anterior(); iniciarAuto(); }
    });

    hero?.addEventListener('mouseleave', () => {
        isDragging = false;
        hero.style.cursor = '';
    });

    // ── Teclado ──
    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight') { siguiente(); iniciarAuto(); }
        if (e.key === 'ArrowLeft')  { anterior();  iniciarAuto(); }
    });

    reiniciarBarra();
    iniciarAuto();
})();

// =============================================
// Efecto navbar al hacer scroll
window.addEventListener("scroll", () => {
    const nav = document.querySelector("header");
    if (!nav) return;

    if (window.scrollY > 80) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

// =============================================
// MENÚ HAMBURGUESA FULLSCREEN
// =============================================
const hamburger     = document.getElementById("hamburger");
const navFullscreen = document.getElementById("navFullscreen");
const navLinks      = navFullscreen ? navFullscreen.querySelectorAll("a") : [];

function abrirMenu() {
    hamburger.classList.add("activo");
    navFullscreen.classList.add("activo");
    document.body.classList.add("menu-abierto");
    hamburger.setAttribute("aria-label", "Cerrar menú");
}

function cerrarMenu() {
    hamburger.classList.remove("activo");
    navFullscreen.classList.remove("activo");
    document.body.classList.remove("menu-abierto");
    hamburger.setAttribute("aria-label", "Abrir menú");
}

if (hamburger) {
    hamburger.addEventListener("click", () => {
        hamburger.classList.contains("activo") ? cerrarMenu() : abrirMenu();
    });
}

// Cerrar al pulsar cualquier link
navLinks.forEach(link => {
    link.addEventListener("click", cerrarMenu);
});

// Cerrar con la tecla Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarMenu();
});

// Inicialización de animaciones nativas de ScrollReveal al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    aplicarFiltros();

    if (typeof ScrollReveal !== 'undefined') {
        ScrollReveal().reveal(".anim-titulo", {
            origin: "top",
            distance: "50px",
            duration: 1100
        });

        ScrollReveal().reveal(".anim-subtitulo", {
            origin: "bottom",
            distance: "30px",
            duration: 1100,
            delay: 200
        });

        ScrollReveal().reveal(".hero-subtext", {
            duration: 1000,
            delay: 350
        });

        ScrollReveal().reveal(".btn-hero", {
            scale: 0.85,
            duration: 800,
            delay: 500
        });

        ScrollReveal().reveal(".filosofia", {
            distance: "40px",
            duration: 1200
        });

        ScrollReveal().reveal(".paso-card", {
            distance: "30px",
            origin: "bottom",
            duration: 900,
            interval: 150
        });

        ScrollReveal().reveal(".lookbook-item", {
            distance: "20px",
            duration: 900,
            interval: 100
        });

        ScrollReveal().reveal(".testimonio-card", {
            distance: "30px",
            origin: "bottom",
            duration: 900,
            interval: 150
        });

        ScrollReveal().reveal(".grid-layout-full", {
            distance: "50px",
            origin: "bottom",
            duration: 1200
        });
    }
});