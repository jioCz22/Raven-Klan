// ============================================================
// CAMBIO NECESARIO EN script.js (versión Node/Express)
// ============================================================
// Mismo cambio que antes, solo cambia la URL de /api/guardar_pedido.php
// a /api/guardar-pedido (sin extensión, con guion en vez de guion_bajo)
// ============================================================

async function comprar(nombre, talla, productoId = null, precio = 0) {
    const numeroTelefono = "5218714701253";
    const mensaje = talla
        ? `Hola RAVEN, me interesa adquirir la prenda de la nueva colección: ${nombre}, talla ${talla}. ¿Cómo puedo realizar mi pago?`
        : `Hola RAVEN, me interesa adquirir la prenda de la nueva colección: ${nombre}. ¿Cómo puedo realizar mi pago?`;

    try {
        await fetch("/api/guardar-pedido", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
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

// Recuerda también actualizar la llamada dentro de abrirModal() en
// script.js para que mande producto.id y producto.precio:
//
//   btnComprar.onclick = () => {
//       if (!tallaSeleccionada) { ... return; }
//       comprar(producto.nombre, tallaSeleccionada, producto.id, producto.precio);
//   };
