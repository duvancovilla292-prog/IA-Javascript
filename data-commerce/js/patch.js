/**
 * CyberBite PRO - Script de Parche y Optimización Integral (Versión Ventana Emergente + Login)
 * Desarrollado para manejar estructuras asincrónicas, modales flotantes y pasarela de autenticación.
 */

(function() {
    // Determinar la vista actual de manera segura
    const esAdmin = window.location.pathname.includes("admin.html");
    
    // Forzar idioma español de inmediato
    document.documentElement.lang = "es";

    // Inicializar configuraciones base de estilos globales necesarios creados por JS
    const style = document.createElement("style");
    style.innerHTML = `
        .admin-access-link:hover { background: #ff007f !important; color: #fff !important; box-shadow: 0 0 10px #ff007f; }
        
        /* Estilos del Carrito Estilo Ventana Emergente (Modal) */
        .cart-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(5px); z-index: 99999; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .cart-modal-overlay.open { opacity: 1; pointer-events: auto; }
        .cart-modal-box { width: 450px; max-width: 90%; background: #0b0c10; border: 2px solid #66fcf1; border-radius: 12px; box-shadow: 0 0 30px rgba(102, 252, 241, 0.3); display: flex; flex-direction: column; color: #fff; padding: 25px; transform: scale(0.8); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); max-height: 85vh; }
        .cart-modal-overlay.open .cart-modal-box { transform: scale(1); }
        
        .cart-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f2833; padding-bottom: 15px; }
        .cart-header h2 { font-size: 1.5rem; margin: 0; color: #66fcf1; text-shadow: 0 0 5px #66fcf1; }
        .close-cart { background: none; border: none; color: #c5a059; font-size: 2rem; cursor: pointer; transition: color 0.3s; line-height: 1; }
        .close-cart:hover { color: #ff007f; }
        
        .cart-items-container { flex: 1; overflow-y: auto; margin-top: 20px; padding-right: 5px; max-height: 40vh; }
        .cart-item { display: flex; justify-content: space-between; align-items: center; background: #1f2833; padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #66fcf1; }
        .cart-item-info h4 { margin: 0 0 5px 0; font-size: 1rem; color: #fff; }
        .cart-item-info p { margin: 0; font-size: 0.85rem; color: #45f3ff; }
        .cart-item-actions { display: flex; align-items: center; gap: 10px; }
        .cart-item-actions button { background: #0b0c10; border: 1px solid #66fcf1; color: #fff; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-weight: bold; }
        .cart-item-actions button:hover { background: #66fcf1; color: #0b0c10; }
        
        .cart-total-section { border-top: 1px solid #1f2833; padding-top: 15px; margin-top: 15px; }
        .cart-total-row { display: flex; justify-content: space-between; font-size: 1.3rem; font-weight: bold; margin-bottom: 15px; color: #66fcf1; }
        .checkout-btn { width: 100%; background: linear-gradient(90deg, #ff007f, #45f3ff); border: none; color: #fff; padding: 14px; font-weight: bold; border-radius: 6px; cursor: pointer; text-transform: uppercase; font-size: 0.95rem; letter-spacing: 1px; box-shadow: 0 0 15px rgba(69,243,255,0.3); transition: all 0.3s; }
        .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 0 25px rgba(255,0,127,0.6); }
        .cart-badge-real { background: #ff007f; color: #fff; font-size: 0.75rem; font-weight: bold; padding: 2px 6px; border-radius: 50%; position: absolute; top: -5px; right: -10px; box-shadow: 0 0 8px #ff007f; }
        .cart-trigger-wrapper { position: relative; display: inline-block; }

        /* Estilos de la Ventana de Login Admin */
        .login-modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0, 0, 0, 0.9); backdrop-filter: blur(8px); z-index: 100000; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .login-modal-overlay.open { opacity: 1; pointer-events: auto; }
        .login-box { width: 360px; background: #0b0c10; border: 2px solid #ff007f; border-radius: 12px; padding: 30px; color: #fff; text-align: center; box-shadow: 0 0 30px rgba(255, 0, 127, 0.3); }
        .login-box h3 { color: #ff007f; margin-bottom: 20px; text-shadow: 0 0 5px #ff007f; font-size: 1.4rem; }
        .login-box input { width: 100%; padding: 10px; margin-bottom: 15px; background: #1f2833; border: 1px solid #66fcf1; border-radius: 6px; color: #fff; outline: none; }
        .login-box input:focus { border-color: #ff007f; box-shadow: 0 0 8px rgba(255,0,127,0.5); }
        .login-btn { width: 100%; background: #ff007f; color: white; border: none; padding: 10px; font-weight: bold; border-radius: 6px; cursor: pointer; transition: all 0.3s; }
        .login-btn:hover { background: #cf0067; box-shadow: 0 0 15px #ff007f; }
        .login-error { color: #ff3333; font-size: 0.85rem; margin-top: 10px; display: none; }
        .close-login { float: right; background: none; border: none; color: #aaa; font-size: 1.5rem; cursor: pointer; margin-top: -15px; margin-right: -10px; }
        .close-login:hover { color: #ff007f; }
    `;
    document.head.appendChild(style);

    let carritoDeCompras = [];

    if (!esAdmin) {
        // --- LÓGICA VISTA PÚBLICA ---
        
        // Inyectar la Ventana Emergente del Carrito al body
        const overlayCarrito = document.createElement("div");
        overlayCarrito.id = "cyberbite-cart-overlay";
        overlayCarrito.className = "cart-modal-overlay";
        overlayCarrito.innerHTML = `
            <div class="cart-modal-box">
                <div class="cart-header">
                    <h2>Tu Pedido Real</h2>
                    <button class="close-cart" id="close-cart-btn">&times;</button>
                </div>
                <div class="cart-items-container" id="cart-items-content">
                    <p style="text-align: center; color: #888; margin-top: 50px;">Tu carrito está vacío.</p>
                </div>
                <div class="cart-total-section">
                    <div class="cart-total-row">
                        <span>Total:</span>
                        <span id="cart-total-price">$0 COP</span>
                    </div>
                    <button class="checkout-btn" id="checkout-whatsapp-btn">Enviar Pedido por WhatsApp</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlayCarrito);

        // Inyectar la Ventana Emergente de Login de Administración
        const overlayLogin = document.createElement("div");
        overlayLogin.id = "cyberbite-login-overlay";
        overlayLogin.className = "login-modal-overlay";
        overlayLogin.innerHTML = `
            <div class="login-box">
                <button class="close-login" id="close-login-btn">&times;</button>
                <h3>Acceso de Seguridad</h3>
                <input type="text" id="login-user" placeholder="Usuario de Administrador">
                <input type="password" id="login-pass" placeholder="Contraseña">
                <button class="login-btn" id="submit-login-btn">Ingresar al Panel</button>
                <div class="login-error" id="login-error-msg">Credenciales incorrectas. Inténtalo de nuevo.</div>
            </div>
        `;
        document.body.appendChild(overlayLogin);

        // --- MANEJADOR DE CLICS GLOBAL (Delegación de Eventos Completa) ---
        document.addEventListener("click", function(event) {
            const target = event.target;

            // 1. Detectar si hicieron clic en agregar al carrito
            const esBotonAgregar = target.matches('[onclick*="agregarAlCarrito"], .btn-agregar, .add-to-cart, .product-card button');
            if (esBotonAgregar) {
                event.preventDefault();
                event.stopPropagation();
                
                let idProducto = 1;
                const matchId = target.getAttribute("onclick")?.match(/\d+/);
                if (matchId) idProducto = parseInt(matchId[0]);

                const card = target.closest(".product-card, .card, article, .menu-item");
                let nombre = "Producto Especificado";
                let precio = 20000;

                if (card) {
                    const titleEl = card.querySelector("h3, h4, .product-title, .title");
                    const priceEl = card.querySelector(".price, .product-price, p, span");
                    if (titleEl) nombre = titleEl.innerText.trim();
                    if (priceEl) {
                        const rawPrice = priceEl.innerText.replace(/[^0-9]/g, "");
                        if (rawPrice) precio = parseInt(rawPrice);
                    }
                }
                inyectarProductoAlCarrito(idProducto, nombre, precio);
            }

            // 2. Detectar apertura del Carrito desde enlaces nativos del Navbar
            if (target.closest('a[href="#carrito"], .cart-icon, [id*="cart"]')) {
                const trigger = target.closest('a[href="#carrito"], .cart-icon, [id*="cart"]');
                event.preventDefault();
                trigger.removeAttribute("href");
                document.getElementById("cyberbite-cart-overlay").classList.add("open");
            }

            // 3. FUNCIONAMIENTO DE LA "X" PARA SALIR DEL CARRITO
            if (target.id === "close-cart-btn" || target.matches("#close-cart-btn")) {
                document.getElementById("cyberbite-cart-overlay").classList.remove("open");
            }

            // 4. Cerrar carrito haciendo clic fuera de la ventana blanca/caja
            if (target.id === "cyberbite-cart-overlay") {
                document.getElementById("cyberbite-cart-overlay").classList.remove("open");
            }

            // 5. Interceptar enlace del Panel Admin para lanzar el Login Obligatorio
            if (target.closest(".admin-access-link")) {
                event.preventDefault();
                document.getElementById("cyberbite-login-overlay").classList.add("open");
                document.getElementById("login-user").focus();
            }

            // 6. Cerrar ventana de login
            if (target.id === "close-login-btn" || target.id === "cyberbite-login-overlay") {
                document.getElementById("cyberbite-login-overlay").classList.remove("open");
                document.getElementById("login-error-msg").style.display = "none";
                document.getElementById("login-user").value = "";
                document.getElementById("login-pass").value = "";
            }
        });

        // --- CONTROL DEL LOGIN ---
        document.getElementById("submit-login-btn").addEventListener("click", procesarAutenticacion);
        // Permitir entrar presionando Enter en los inputs
        document.getElementById("login-pass").addEventListener("keypress", function(e) { if(e.key === "Enter") procesarAutenticacion(); });
        document.getElementById("login-user").addEventListener("keypress", function(e) { if(e.key === "Enter") document.getElementById("login-pass").focus(); });

        function procesarAutenticacion() {
            const user = document.getElementById("login-user").value.trim();
            const pass = document.getElementById("login-pass").value.trim();
            const errorMsg = document.getElementById("login-error-msg");

            if (user === "Ciel" && pass === "1234") {
                errorMsg.style.display = "none";
                document.getElementById("cyberbite-login-overlay").classList.remove("open");
                // Redirección autorizada
                window.location.href = "admin.html";
            } else {
                errorMsg.style.display = "block";
                document.getElementById("login-pass").value = "";
                document.getElementById("login-pass").focus();
            }
        }

        // MutationObserver para inyectar dinámicamente el botón Admin y el Badge en el Navbar asincrónico
        const observer = new MutationObserver(() => {
            const navLinks = document.querySelector(".nav-links, nav ul, .navbar-nav");
            if (navLinks && !document.querySelector(".admin-access-link")) {
                const adminLi = document.createElement("li");
                adminLi.innerHTML = `<a href="admin.html" class="admin-access-link" style="color: #ff007f; font-weight: bold; border: 1px solid #ff007f; padding: 5px 10px; border-radius: 4px; margin-left: 15px; font-size: 0.9rem; transition: all 0.3s ease; text-decoration: none; display: inline-block;">Panel Admin</a>`;
                navLinks.appendChild(adminLi);
            }
            
            const botonCarritoOriginal = document.querySelector('a[href="#carrito"], .cart-icon, [id*="cart"]');
            if (botonCarritoOriginal && !botonCarritoOriginal.querySelector(".cart-badge-real")) {
                botonCarritoOriginal.classList.add("cart-trigger-wrapper");
                const badge = document.createElement("span");
                badge.className = "cart-badge-real";
                badge.id = "global-cart-badge";
                badge.innerText = "0";
                botonCarritoOriginal.appendChild(badge);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Lógica interna del carrito
        function inyectarProductoAlCarrito(id, nombre, precio) {
            const existe = carritoDeCompras.find(item => item.nombre === nombre);
            if (existe) {
                existe.cantidad++;
            } else {
                carritoDeCompras.push({ id, nombre, precio, cantidad: 1 });
            }
            actualizarRenderCarrito();
            document.getElementById("cyberbite-cart-overlay").classList.add("open");
        }

        function actualizarRenderCarrito() {
            const contenedor = document.getElementById("cart-items-content");
            const totalEl = document.getElementById("cart-total-price");
            const badge = document.getElementById("global-cart-badge");
            
            contenedor.innerHTML = "";
            let totalAcumulado = 0;
            let itemsTotales = 0;

            if (carritoDeCompras.length === 0) {
                contenedor.innerHTML = '<p style="text-align: center; color: #888; margin-top: 50px;">Tu carrito está vacío.</p>';
            } else {
                carritoDeCompras.forEach((item, index) => {
                    totalAcumulado += item.precio * item.cantidad;
                    itemsTotales += item.cantidad;

                    const itemRow = document.createElement("div");
                    itemRow.className = "cart-item";
                    itemRow.innerHTML = `
                        <div class="cart-item-info">
                            <h4>${item.nombre}</h4>
                            <p>${item.cantidad} x ${formatearMoneda(item.precio)}</p>
                        </div>
                        <div class="cart-item-actions">
                            <button data-action="decrementar" data-index="${index}">-</button>
                            <span>${item.cantidad}</span>
                            <button data-action="incrementar" data-index="${index}">+</button>
                        </div>
                    `;
                    contenedor.appendChild(itemRow);
                });
            }

            totalEl.innerText = formatearMoneda(totalAcumulado);
            if (badge) badge.innerText = itemsTotales;

            const contadorOriginal = document.getElementById("contador-carrito") || document.querySelector(".cart-count");
            if (contadorOriginal) contadorOriginal.innerText = itemsTotales;
        }

        // Manejar incremento / decremento interno de la ventana emergente
        document.getElementById("cyberbite-cart-overlay").addEventListener("click", function(e) {
            const action = e.target.getAttribute("data-action");
            const index = e.target.getAttribute("data-index");
            if (!action || index === null) return;

            if (action === "incrementar") {
                carritoDeCompras[index].cantidad++;
            } else if (action === "decrementar") {
                carritoDeCompras[index].cantidad--;
                if (carritoDeCompras[index].cantidad <= 0) {
                    carritoDeCompras.splice(index, 1);
                }
            }
            actualizarRenderCarrito();
        });

        // Checkout de WhatsApp
        document.getElementById("checkout-whatsapp-btn").addEventListener("click", () => {
            if (carritoDeCompras.length === 0) return alert("El carrito está vacío");

            let totalVenta = 0;
            let mensajeWhatsApp = "¡Hola CyberBite! Me gustaría realizar el siguiente pedido:\n\n";
            
            carritoDeCompras.forEach(item => {
                mensajeWhatsApp += `• ${item.cantidad}x ${item.nombre} (${formatearMoneda(item.precio * item.cantidad)})\n`;
                totalVenta += item.precio * item.cantidad;
            });

            mensajeWhatsApp += `\n*Total a Pagar: ${formatearMoneda(totalVenta)}*\n\n¡Gracias!`;

            const historico = JSON.parse(localStorage.getItem("cyberbite_ventas_locales")) || [];
            historico.push({
                id_venta: "CB-" + Math.floor(Math.random() * 90000 + 10000),
                fecha: new Date().toISOString().split('T')[0],
                productos: carritoDeCompras.map(i => ({ nombre: i.nombre, cantidad: i.cantidad })),
                total: totalVenta
            });
            localStorage.setItem("cyberbite_ventas_locales", JSON.stringify(historico));

            carritoDeCompras = [];
            actualizarRenderCarrito();
            document.getElementById("cyberbite-cart-overlay").classList.remove("open");

            window.open(`https://api.whatsapp.com/send?phone=573151234567&text=${encodeURIComponent(mensajeWhatsApp)}`, "_blank");
        });

        // Fallback global por compatibilidad inline
        window.agregarAlCarrito = function(id) {
            const mockEvent = { target: document.querySelector(`[onclick*="agregarAlCarrito(${id})"]`) || document.activeElement };
            if(mockEvent.target) mockEvent.target.click();
        };

    } else {
        // --- LÓGICA VISTA PANEL DE ADMINISTRACIÓN (ADMIN.HTML) ---
        console.log("CyberBite: Panel Admin Sincronizado.");

        const adminObserver = new MutationObserver(() => {
            const linksRegreso = document.querySelectorAll('a[href="index.html"], .btn-back');
            linksRegreso.forEach(link => {
                if (!link.classList.contains("patched-link")) {
                    link.classList.add("patched-link");
                    link.style.cssText = "border: 1px solid #66fcf1; padding: 6px 12px; border-radius: 4px; color: #66fcf1; text-decoration: none; transition: all 0.3s; display: inline-block;";
                    link.addEventListener("mouseover", () => { link.style.background = "#66fcf1"; link.style.color = "#0b0c10"; });
                    link.addEventListener("mouseout", () => { link.style.background = "none"; link.style.color = "#66fcf1"; });
                }
            });
        });
        adminObserver.observe(document.body, { childList: true, subtree: true });

        setTimeout(() => {
            const ventasLocales = JSON.parse(localStorage.getItem("cyberbite_ventas_locales")) || [];
            if (ventasLocales.length === 0) return;

            const totalVentasEl = document.getElementById("total-ventas-valor") || document.querySelector(".metric-card .value, .card-sales-total");
            const tableBody = document.getElementById("tabla-ventas-body") || document.querySelector("table tbody");

            let ingresosExtra = 0;
            ventasLocales.forEach(v => ingresosExtra += v.total);

            if (totalVentasEl) {
                let valorActualRaw = totalVentasEl.innerText.replace(/[^0-9]/g, "");
                let valorActual = parseInt(valorActualRaw) || 0;
                totalVentasEl.innerText = formatearMoneda(valorActual + ingresosExtra);
                totalVentasEl.style.color = "#45f3ff";
            }

            if (tableBody) {
                ventasLocales.forEach(venta => {
                    const tr = document.createElement("tr");
                    tr.style.background = "rgba(255, 0, 127, 0.15)";
                    tr.innerHTML = `
                        <td><strong>${venta.id_venta}</strong></td>
                        <td>${venta.fecha}</td>
                        <td>${venta.productos.map(p => `${p.cantidad}x ${p.nombre}`).join(", ")}</td>
                        <td style="color: #66fcf1; font-weight: bold;">${formatearMoneda(venta.total)}</td>
                        <td><span style="background: #00ff66; color: #0b0c10; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">Completado</span></td>
                    `;
                    tableBody.insertBefore(tr, tableBody.firstChild);
                });
            }
        }, 1000);
    }

    function formatearMoneda(valor) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(valor);
    }
})();