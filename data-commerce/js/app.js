document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

/**
 * Función principal que orquesta la carga de datos y el renderizado de la interfaz.
 */
async function initApp() {
    try {
        const [ventas, inventario] = await cargarDatos();
        
        if (!ventas || !inventario) {
            throw new Error('No se pudieron obtener los datos estructurados correctamente.');
        }

        const estadisticasProductos = procesarDatosComerciales(ventas, inventario);
        
        renderizarProductosDestacados(estadisticasProductos);
        renderizarMenuCompleto(inventario);
        configurarFiltrosCategorias(inventario);

    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        mostrarErrorInterfaz();
    }
}

/**
 * Carga de forma asíncrona los archivos JSON del proyecto.
 */
async function cargarDatos() {
    try {
        const [respuestaVentas, respuestaInventario] = await Promise.all([
            fetch('data/ventas.json'),
            fetch('data/inventario.json')
        ]);

        if (!respuestaVentas.ok || !respuestaInventario.ok) {
            throw new Error('Error en el servidor al intentar leer los archivos JSON.');
        }

        const dataVentas = await respuestaVentas.json();
        const dataInventario = await respuestaInventario.json();

        return [dataVentas, dataInventario];
    } catch (error) {
        throw new Error(`Fallo en el consumo de APIs/Archivos: ${error.message}`);
    }
}

/**
 * Procesa las transacciones de ventas usando reduce y sort para identificar métricas de popularidad.
 */
function procesarDatosComerciales(ventas, inventario) {
    // Reducir el historial de ventas para acumular unidades por id_producto
    const mapeoUnidadesVendidas = ventas.reduce((acumulador, transaccion) => {
        const id = transaccion.id_producto;
        const cantidad = parseInt(transaccion.cantidad, 10) || 0;
        acumulador[id] = (acumulador[id] || 0) + cantidad;
        return acumulador;
    }, {});

    // Mapear el inventario enriqueciéndolo con las unidades vendidas calculadas
    const productosConVentas = inventario.map(producto => {
        return {
            ...producto,
            unidades_vendidas: mapeoUnidadesVendidas[producto.id_producto] || 0
        };
    });

    // Ordenar descendente según las unidades físicas vendidas
    return productosConVentas.sort((itemA, itemB) => itemB.unidades_vendidas - itemA.unidades_vendidas);
}

/**
 * Renderiza los Top 3 productos con mayor demanda comercial en el contenedor de destacados.
 */
function renderizarProductosDestacados(productosOrdenados) {
    const contenedorDestacados = document.getElementById('featured-container');
    if (!contenedorDestacados) return;

    contenedorDestacados.innerHTML = '';
    
    // Extraer los 3 productos más vendidos para la sección Hero/Destacados
    const topDestacados = productosOrdenados.slice(0, 3);

    topDestacados.forEach(producto => {
        const tarjetaHTML = crearTarjetaProducto(producto, true);
        contenedorDestacados.insertAdjacentHTML('beforeend', tarjetaHTML);
    });
}

/**
 * Renderiza la grilla total de productos disponibles en el inventario.
 */
function renderizarMenuCompleto(inventario) {
    const contenedorMenu = document.getElementById('menu-container');
    if (!contenedorMenu) return;

    contenedorMenu.innerHTML = '';

    inventario.forEach(producto => {
        const tarjetaHTML = crearTarjetaProducto(producto, false);
        contenedorMenu.insertAdjacentHTML('beforeend', tarjetaHTML);
    });
}

/**
 * Genera la plantilla de texto estructurada en HTML para una tarjeta de producto.
 */
function crearTarjetaProducto(producto, esDestacado) {
    const formateadorMoneda = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    });

    const precioFormateado = formateadorMoneda.format(producto.precio_venta || producto.valor_venta || 0);
    const etiquetaBadge = esDestacado ? `<span class="badge-destacado">🔥 Más Vendido</span>` : '';

    return `
        <article class="product-card" data-id="${producto.id_producto}" data-categoria="${producto.categoria || 'individuales'}">
            <div class="product-image-container">
                ${etiquetaBadge}
                <div class="product-image-placeholder-active">🍔</div>
            </div>
            <div class="product-info">
                <h3>${producto.nombre || producto.producto}</h3>
                <p class="product-description">Ingredientes de alta calidad seleccionados bajo estrictos estándares analíticos.</p>
                <div class="product-meta">
                    <span class="product-price">${precioFormateado}</span>
                    <button type="button" class="btn-add-cart" onclick="agregarAlCarrito('${producto.id_producto}')">
                        Añadir
                    </button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Configura los event listeners para los botones de filtrado de categorías del menú completo.
 */
function configurarFiltrosCategorias(inventario) {
    const botonesCategoria = document.querySelectorAll('.btn-category');
    
    botonesCategoria.forEach(boton => {
        boton.addEventListener('click', (evento) => {
            botonesCategoria.forEach(btn => btn.classList.remove('active'));
            evento.target.classList.add('active');

            const categoriaSeleccionada = evento.target.getAttribute('data-category');
            filtrarMenuInterfaz(categoriaSeleccionada);
        });
    });
}

/**
 * Aplica lógica visual basada en selectores CSS para ocultar/mostrar productos según su categoría.
 */
function filtrarMenuInterfaz(categoria) {
    const tarjetasProductos = document.querySelectorAll('#menu-container .product-card');

    tarjetasProductos.forEach(tarjeta => {
        const categoriaTarjeta = tarjeta.getAttribute('data-categoria');
        if (categoria === 'all' || categoriaTarjeta === categoria) {
            tarjeta.style.display = 'flex';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

/**
 * Manejador del estado del carrito de compras global (Simulación interactiva).
 */
let contadorCarrito = 0;
window.agregarAlCarrito = function(idProducto) {
    contadorCarrito++;
    const elementoContador = document.getElementById('cart-count');
    if (elementoContador) {
        elementoContador.textContent = contadorCarrito;
        elementoContador.classList.add('pulse-animation');
        setTimeout(() => elementoContador.classList.remove('pulse-animation'), 300);
    }
};

/**
 * Reemplaza los esqueletos de carga por un mensaje intuitivo en caso de error crítico.
 */
function mostrarErrorInterfaz() {
    const contenedores = ['featured-container', 'menu-container'];
    contenedores.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.innerHTML = `
                <div class="error-placeholder">
                    <p>⚠️ No pudimos cargar los productos en este momento. Por favor, inténtalo más tarde.</p>
                </div>
            `;
        }
    });
}