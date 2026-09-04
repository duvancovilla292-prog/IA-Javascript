# IA-Javascript

# Express Bite | Data-Driven Flavor & Commerce Dashboard

> Plataforma web interactiva orientada al análisis comercial y gestión de inventario en tiempo real, desarrollada como parte del **Data Commerce Challenge**.

---

## 🚀 Descripción General

**Express Bite** es un sistema web modular dividido en dos entornos principales: una **vista pública** optimizada para la experiencia del cliente (menú interactivo, filtrado por categorías, carrito de compras modal y pasarela de pedidos vía WhatsApp) y un **panel administrativo (Dashboard)** enfocado en Inteligencia de Negocios (KPIs, análisis de rentabilidad, alertas de inventario crítico y proyección de demanda).

---

## 📂 Arquitectura del Proyecto y Estructura de Archivos

```text
├── index_4.html       # Vista pública / Tienda en línea (Storefront)
├── admin.html         # Consola de administración y Business Intelligence
├── js/
│   ├── app.js         # Lógica de renderizado público, catálogos y gestión de categorías
│   ├── admin.js       # Procesamiento analítico, cálculo de KPIs y generación de gráficos CSS
│   └── patch.js       # Parche de integración: Modal de carrito, login seguro y checkout de WhatsApp
└── data/              # Fuentes de datos estructuradas (JSON de ventas e inventario)
