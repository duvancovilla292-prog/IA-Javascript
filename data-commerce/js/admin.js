document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
});

/**
 * Función principal que coordina la carga de datos, cálculo de métricas y renderizado en el dashboard.
 */
async function initAdminDashboard() {
    try {
        const [ventas, inventario] = await cargarDatosJSON();
        
        if (!ventas.length || !inventario.length) {
            throw new Error('Los arreglos de datos están vacíos o corruptos.');
        }

        // 1. Procesamiento Analítico de Datos (Business Intelligence Interno)
        const metricasGlobales = calcularMetricasGlobales(ventas, inventario);
        const analisisProductos = procesarAnalisisProductos(ventas, inventario);
        
        // 2. Renderizado de Elementos en el DOM
        renderizarKPIs(metricasGlobales, analisisProductos);
        renderizarTop5Rankings(analisisProductos);
        renderizarRentabilidadYMargen(analisisProductos);
        renderizarInventarioCritico(analisisProductos);
        renderizarProyeccionDemanda(analisisProductos);

    } catch (error) {
        console.error('Error crítico al inicializar el Dashboard Administrativo:', error);
        mostrarErrorDashboard();
    }
}

/**
 * Carga de forma asíncrona los archivos JSON del ecosistema de datos.
 */
async function cargarDatosJSON() {
    const respuestas = await Promise.all([
        fetch('data/ventas.json'),
        fetch('data/inventario.json')
    ]);

    for (const respuesta of respuestas) {
        if (!respuesta.ok) {
            throw new Error(`Error HTTP. Estado de la petición: ${respuesta.status}`);
        }
    }

    return Promise.all(respuestas.map(res => res.json()));
}

/**
 * Calcula métricas contables globales usando abstracciones funcionales basadas en reduce().
 */
function calcularMetricasGlobales(ventas, inventario) {
    const ventasTotales = ventas.reduce((acc, current) => acc + (parseFloat(current.total) || 0), 0);
    const unidadesVendidas = ventas.reduce((acc, current) => acc + (parseInt(current.cantidad, 10) || 0), 0);
    
    // El conteo de transacciones asume que cada objeto de entrada en el JSON representa un registro o ticket único
    const totalTransacciones = ventas.length;
    const ticketPromedio = totalTransacciones > 0 ? (ventasTotales / totalTransacciones) : 0;

    return {
        ventasTotales,
        unidadesVendidas,
        ticketPromedio
    };
}

/**
 * Cruza los datasets para construir un modelo consolidado con ventas, utilidades, márgenes y estados de stock.
 */
function procesarAnalisisProductos(ventas, inventario) {
    // Agrupar cantidades e ingresos por ID de producto empleando un único bucle reductor
    const mapaVentas = ventas.reduce((acc, current) => {
        const id = current.id_producto;
        if (!acc[id]) {
            acc[id] = { unidades: 0, ingresos: 0 };
        }
        acc[id].unidades += parseInt(current.cantidad, 10) || 0;
        acc[id].ingresos += parseFloat(current.total) || 0;
        return acc;
    }, {});

    const totalVentasGlobal = ventas.reduce((acc, current) => acc + (parseFloat(current.total) || 0), 0);

    // Mapear y enriquecer estructuralmente el inventario base
    return inventario.map(item => {
        const datosVenta = mapaVentas[item.id_producto] || { unidades: 0, ingresos: 0 };
        
        const valorVentaUnitario = parseFloat(item.precio_venta || item.valor_venta || 0);
        const valorCompraUnitario = parseFloat(item.precio_compra || item.valor_compra || 0);
        
        const utilidadTotal = (valorVentaUnitario - valorCompraUnitario) * datosVenta.unidades;
        const margenPorcentaje = datosVenta.ingresos > 0 ? ((utilidadTotal / datosVenta.ingresos) * 100) : 0;
        const participacionPorcentaje = totalVentasGlobal > 0 ? ((datosVenta.ingresos / totalVentasGlobal) * 100) : 0;

        return {
            id_producto: item.id_producto,
            producto: item.nombre || item.producto,
            cantidad_existente: parseInt(item.cantidad_existente || item.stock, 10) || 0,
            unidades_vendidas: datosVenta.unidades,
            ingresos_generados: datosVenta.ingresos,
            utilidad_total: utilidadTotal,
            margen_porcentaje: margenPorcentaje,
            participacion_porcentaje: participacionPorcentaje
        };
    });
}

/**
 * Modifica dinámicamente las tarjetas de indicadores principales (KPIs) en la interfaz.
 */
function renderizarKPIs(globales, analisisProductos) {
    const formateadorMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });

    // Determinar el Producto Estrella (Criterio combinado: Mayor volumen de ingresos generados)
    const clonProductos = [...analisisProductos];
    clonProductos.sort((a, b) => b.ingresos_generados - a.ingresos_generados);
    const productoEstrella = clonProductos[0]?.producto || 'N/A';

    // Calcular Utilidad Consolidada del negocio
    const utilidadConsolidada = analisisProductos.reduce((acc, item) => acc + item.utilidad_total, 0);

    // Inyectar valores al DOM de forma segura evitando vulnerabilidades XSS
    document.getElementById('val-ventas-totales').textContent = formateadorMoneda.format(globales.ventasTotales);
    document.getElementById('val-unidades-vendidas').textContent = globales.unidadesVendidas.toLocaleString('es-CO');
    document.getElementById('val-ticket-promedio').textContent = formateadorMoneda.format(globales.ticketPromedio);
    document.getElementById('val-producto-estrella').textContent = productoEstrella;
    document.getElementById('val-utilidad-total').textContent = formateadorMoneda.format(utilidadConsolidada);

    // Asignar etiquetas dinámicas temporales para tendencias estables
    document.getElementById('trend-ventas').textContent = '↑ Estable';
    document.getElementById('trend-unidades').textContent = '↑ Estable';
    document.getElementById('trend-ticket').textContent = '↔ Promedio';
}

/**
 * Construye la tabla del Top 5 de productos e inyecta barras gráficas generadas con propiedades de estilos CSS nativas.
 */
function renderizarTop5Rankings(analisisProductos) {
    const formateadorMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const top5 = [...analisisProductos]
        .sort((a, b) => b.ingresos_generados - a.ingresos_generados)
        .slice(0, 5);

    const cuerpoTabla = document.querySelector('#table-top-productos tbody');
    const contenedorGrafico = document.getElementById('chart-top-productos');
    
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';
    if (contenedorGrafico) contenedorGrafico.innerHTML = '';

    const maxIngreso = top5[0]?.ingresos_generados || 1;

    top5.forEach((item, index) => {
        // Renderizar fila de tabla estructurada
        if (cuerpoTabla) {
            const fila = `
                <tr>
                    <td><strong>${index + 1}</strong></td>
                    <td>${item.producto}</td>
                    <td>${item.unidades_vendidas}</td>
                    <td>${formateadorMoneda.format(item.ingresos_generados)}</td>
                    <td>${item.participacion_porcentaje.toFixed(2)}%</td>
                </tr>
            `;
            cuerpoTabla.insertAdjacentHTML('beforeend', fila);
        }

        // Renderizar barra gráfica interactiva basada puramente en CSS nativo inline
        if (contenedorGrafico) {
            const porcentajeAncho = (item.ingresos_generados / maxIngreso) * 100;
            const barraHTML = `
                <div class="chart-bar-wrapper" style="margin-bottom: 12px;">
                    <div class="chart-bar-label" style="font-size: 0.85rem; margin-bottom: 4px; display: flex; justify-content: space-between;">
                        <span>${item.producto}</span>
                        <strong>${formateadorMoneda.format(item.ingresos_generados)}</strong>
                    </div>
                    <div class="chart-bar-track" style="background: #eef2f3; border-radius: 4px; height: 16px; width: 100%; overflow: hidden;">
                        <div class="chart-bar-fill" style="background: #ff5722; width: ${porcentajeAncho}%; height: 100%; border-radius: 4px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
            `;
            contenedorGrafico.insertAdjacentHTML('beforeend', barraHTML);
        }
    });
}

/**
 * Procesa la visualización de la tabla financiera ordenada por márgenes porcentuales decrecientes.
 */
function renderizarRentabilidadYMargen(analisisProductos) {
    const formateadorMoneda = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
    
    const ordenadoPorMargen = [...analisisProductos]
        .sort((a, b) => b.margen_porcentaje - a.margen_porcentaje);

    const cuerpoTabla = document.querySelector('#table-rentabilidad tbody');
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '';

    ordenadoPorMargen.forEach(item => {
        const fila = `
            <tr>
                <td>${item.id_producto}</td>
                <td>${item.producto}</td>
                <td>${formateadorMoneda.format(item.utilidad_total)}</td>
                <td><span class="badge-margin" style="font-weight: bold; color: #2e7d32;">${item.margen_porcentaje.toFixed(1)}%</span></td>
            </tr>
        `;
        cuerpoTabla.insertAdjacentHTML('beforeend', fila);
    });
}

/**
 * Realiza un cruce algorítmico entre stock disponible y demanda real para emitir alertas tempranas de inventario crítico.
 */
function renderizarInventarioCritico(analisisProductos) {
    const cuerpoTabla = document.querySelector('#table-inventario-bajo tbody');
    const contenedorNotificaciones = document.getElementById('alerts-container');
    const contadorAlertas = document.getElementById('alert-counter');
    
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';
    if (contenedorNotificaciones) contenedorNotificaciones.innerHTML = '';

    // Filtrar productos cuyo stock esté por debajo o igual a su volumen de ventas mensual registrado
    const productosCriticos = analisisProductos.filter(item => item.cantidad_existente <= item.unidades_vendidas);
    
    if (contadorAlertas) {
        contadorAlertas.textContent = `${productosCriticos.length} Alertas activas`;
        if (productosCriticos.length > 0) {
            contadorAlertas.style.background = '#d32f2f';
            contadorAlertas.style.color = '#ffffff';
        }
    }

    if (productosCriticos.length === 0) {
        if (cuerpoTabla) {
            cuerpoTabla.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #2e7d32; font-weight: bold;">✅ Todos los niveles de stock operan bajo parámetros estables.</td></tr>';
        }
        return;
    }

    productosCriticos.forEach(item => {
        const nivelRiesgo = item.cantidad_existente === 0 ? 'Crítico (Agotado)' : 'Riesgo de desabastecimiento';
        const colorBadge = item.cantidad_existente === 0 ? '#d32f2f' : '#f57c00';

        if (cuerpoTabla) {
            const fila = `
                <tr style="background-color: rgba(211, 47, 47, 0.03);">
                    <td><strong>${item.id_producto}</strong></td>
                    <td>${item.producto}</td>
                    <td style="color: ${colorBadge}; font-weight: bold;">${item.cantidad_existente} uds</td>
                    <td>${item.unidades_vendidas} uds</td>
                    <td><span class="status-pill" style="background: ${colorBadge}; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${nivelRiesgo}</span></td>
                </tr>
            `;
            cuerpoTabla.insertAdjacentHTML('beforeend', fila);
        }

        if (contenedorNotificaciones) {
            const alertaBloque = `
                <div class="alert-banner" style="border-left: 4px solid ${colorBadge}; background: #fafafa; padding: 10px; margin-bottom: 8px; border-radius: 0 4px 4px 0;">
                    <p style="margin: 0; font-size: 0.9rem;">⚠️ <strong>Alerta Logística en ${item.producto}:</strong> El stock actual (${item.cantidad_existente}) no cubre de manera segura la demanda mensual registrada de ${item.unidades_vendidas} unidades.</p>
                </div>
            `;
            contenedorNotificaciones.insertAdjacentHTML('beforeend', alertaBloque);
        }
    });
}

/**
 * Implementa una aproximación comercial matemática lineal simple para proyectar la demanda de la próxima semana.
 */
function renderizarProyeccionDemanda(analisisProductos) {
    const cuerpoTabla = document.querySelector('#table-proyeccion-demanda tbody');
    const listaNecesidades = document.getElementById('list-necesidades-inventario');
    
    if (cuerpoTabla) cuerpoTabla.innerHTML = '';
    if (listaNecesidades) listaNecesidades.innerHTML = '';

    // Extraer los 4 productos de mayor rotación histórica
    const topRotacion = [...analisisProductos]
        .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas)
        .slice(0, 4);

    topRotacion.forEach(item => {
        // Aproximación simple: estimación semanal basada en el histórico mensual dividido por 4 semanas (techo matemático redondeado)
        const cantidadEstimadaSemana = Math.ceil(item.unidades_vendidas / 4);
        
        // Decisión lógica corporativa de reabastecimiento basada en inventario físico disponible vs proyección de consumo
        let prioridadCompra = 'Baja';
        let colorPrioridad = '#757575';
        
        if (item.cantidad_existente <= cantidadEstimadaSemana) {
            prioridadCompra = 'Urgente (Reabastecer)';
            colorPrioridad = '#d32f2f';
        } else if (item.cantidad_existente <= cantidadEstimadaSemana * 2) {
            prioridadCompra = 'Media';
            colorPrioridad = '#f57c00';
        } else {
            prioridadCompra = 'Abundante';
            colorPrioridad = '#388e3c';
        }

        if (cuerpoTabla) {
            const fila = `
                <tr>
                    <td>${item.id_producto}</td>
                    <td>${item.producto}</td>
                    <td><strong>${cantidadEstimadaSemana} uds</strong> <span style="color: #757575; font-size: 0.8rem;">/semana</span></td>
                    <td style="color: ${colorPrioridad}; font-weight: bold;">${prioridadCompra}</td>
                </tr>
            `;
            cuerpoTabla.insertAdjacentHTML('beforeend', fila);
        }

        if (listaNecesidades && (prioridadCompra === 'Urgente (Reabastecer)' || prioridadCompra === 'Media')) {
            const itemLista = `
                <li style="margin-bottom: 6px; font-size: 0.9rem;">
                    🎯 Realizar reposición para <strong>${item.producto}</strong>. Consumo proyectado: ${cantidadEstimadaSemana} uds. Disponibles en almacén: ${item.cantidad_existente} uds.
                </li>
            `;
            listaNecesidades.insertAdjacentHTML('beforeend', itemLista);
        }
    });

    // En caso de que ningún producto requiera reabastecimiento urgente inmediato
    if (listaNecesidades && listaNecesidades.children.length === 0) {
        listaNecesidades.innerHTML = '<li style="color: #388e3c; font-weight: bold;">El inventario actual cuenta con cobertura total estable para la próxima semana.</li>';
    }
}

/**
 * Reemplaza de forma masiva los placeholders de las tablas y KPIs si ocurre una interrupción del sistema.
 */
function mostrarErrorDashboard() {
    const elementosValores = document.querySelectorAll('.kpi-value');
    elementosValores.forEach(el => el.textContent = 'Error');

    const tablasCuerpos = document.querySelectorAll('.admin-table tbody');
    tablasCuerpos.forEach(cuerpo => {
        cuerpo.innerHTML = '<tr><td colspan="10" class="text-center" style="color: #d32f2f; font-weight: bold;">❌ Error crítico de infraestructura de datos. No se pudo procesar la solicitud.</td></tr>';
    });
}