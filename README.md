# Booklo

Sistema web de gestión de catálogo, stock y pedidos para librerías y comiquerías con integración a servicios bibliográficos externos.

Trabajo Final Integrador — Tecnicatura Universitaria en Programación  
UTN Facultad Regional Mar del Plata

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ · TypeScript · Angular Material |
| Backend | Node.js · Express · TypeScript |
| Base de datos | MySQL |
| Comunicación | REST API · JSON |
| Pagos | Mercado Pago Checkout Pro |
| APIs externas | Open Library · Google Books |

---

## Estructura del proyecto

```
booklo/
├── booklo-web/    # Aplicación Angular (frontend)
├── booklo-api/    # API REST con Node.js y Express (backend)
└── README.md
```

---

## Requisitos previos

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)
- MySQL 8+

---

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/facundoramallo/booklo.git
cd booklo
```

### 2. Configurar el backend

```bash
cd booklo-api
npm install
cp .env.example .env
```

Editar `.env` con los valores correctos:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<contraseña MySQL>
DB_NAME=booklo_db
JWT_SECRET=<clave secreta para firmar JWT>
JWT_EXPIRES_IN=24h
MP_ACCESS_TOKEN=<Access Token de Mercado Pago>
MP_PUBLIC_KEY=<Public Key de Mercado Pago>
FRONTEND_URL=http://localhost:4200
```

> Las credenciales de Mercado Pago se entregan por separado al evaluador.

```bash
npm run dev
```

### 3. Configurar el frontend

```bash
cd booklo-web
npm install
ng serve
```

La API corre en `http://localhost:3000` y el frontend en `http://localhost:4200`.

---

## Funcionalidades principales

- Catálogo de libros, cómics y mangas con búsqueda y filtros
- Importación de datos bibliográficos por ISBN (Open Library)
- Carrito de compras y gestión de pedidos
- Control de stock con registro de movimientos
- Panel administrativo con dashboard de métricas
- Autenticación con JWT y control de acceso por roles

---

## API — Endpoints disponibles

### Autenticación
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/auth/register` | Público |
| POST | `/auth/login` | Público |

### Categorías
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/categories` | Público |
| GET | `/categories/:id` | Público |
| POST | `/categories` | Admin |
| PATCH | `/categories/:id` | Admin |
| DELETE | `/categories/:id` | Admin |

### Libros
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/books` | Público |
| GET | `/books/:id` | Público |
| POST | `/books` | Admin |
| PATCH | `/books/:id` | Admin |
| DELETE | `/books/:id` | Admin |

`GET /books` acepta query params: `search`, `category_id`, `product_type`, `featured`, `available`, `page`, `limit`

### Búsqueda por ISBN (APIs externas)
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/external-books/isbn/:isbn` | Admin |

### Importación por ISBN
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/books/import` | Admin |

### Favoritos
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/favorites` | Usuario autenticado |
| POST | `/favorites/:bookId` | Usuario autenticado |
| DELETE | `/favorites/:bookId` | Usuario autenticado |

### Carrito
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/cart` | Usuario autenticado |
| POST | `/cart` | Usuario autenticado |
| PATCH | `/cart/:bookId` | Usuario autenticado |
| DELETE | `/cart/:bookId` | Usuario autenticado |
| DELETE | `/cart` | Usuario autenticado |

`POST /cart` acepta body: `{ "bookId": 2, "quantity": 1 }`

### Pedidos
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/orders` | Usuario autenticado |
| GET | `/orders/:id` | Usuario autenticado |
| POST | `/orders` | Usuario autenticado |
| PATCH | `/orders/:id/status` | Admin |

`POST /orders` acepta body opcional: `{ "payment_method": "efectivo", "notes": "..." }`. Toma los ítems del carrito activo, registra movimientos de stock y vacía el carrito automáticamente.

`PATCH /orders/:id/status` acepta: `pendiente` · `confirmado` · `enviado` · `entregado` · `cancelado`

### Pagos (Mercado Pago)
| Método | Ruta | Acceso |
|---|---|---|
| POST | `/payments/create-preference` | Usuario autenticado |
| POST | `/payments/webhook` | Público (MP) |
| POST | `/payments/confirm/:orderId` | Usuario autenticado |

`POST /payments/create-preference` — crea el pedido y una Preference en MP. Devuelve `{ orderId, init_point }`. El frontend redirige al `init_point` para que el usuario pague en el sitio de Mercado Pago.

`POST /payments/webhook` — recibe notificaciones asíncronas de MP y actualiza el estado del pedido.

`POST /payments/confirm/:orderId` — confirma el pedido cuando el usuario vuelve de MP (vía redirect de `back_url`).

### Dashboard
| Método | Ruta | Acceso |
|---|---|---|
| GET | `/dashboard` | Admin |

Devuelve en una sola llamada: totales generales, pedidos por estado, libros con stock bajo, últimos 5 pedidos y top 5 productos más vendidos.

---

## Estado del proyecto

Sistema completo y funcional. Backend y frontend implementados al 100%.

**Frontend (Angular 17+)**
- Home comercial con carruseles animados (Destacados, Novedades, Más vendidos)
- Búsqueda global desde el hero del home
- Catálogo público con búsqueda, filtros por categoría/tipo/condición/precio y tira A-Z
- Detalle de libro con zoom de portada, cuotas, WhatsApp y copiar link
- Login, registro y perfil de usuario con cambio de contraseña
- Carrito persistente con checkout integrado con Mercado Pago
- Pago con tarjeta/efectivo, hasta 12 cuotas sin interés
- Páginas de éxito y error tras el pago con número de pedido
- Historial de pedidos con detalle expandible
- Panel administrativo completo: libros, categorías, pedidos, usuarios y dashboard
- Importación de libros por ISBN con previsualización
- Interceptor JWT automático + interceptor de errores HTTP con Snackbar
- Responsive: colapso de grids en viewports menores a 1024px / 768px

**Backend (Node.js + Express + TypeScript)**
- API REST completa con autenticación JWT y control de acceso por roles
- CRUD completo de libros, categorías, usuarios, favoritos, carrito y pedidos
- Transacciones SQL para pedidos (stock, movimientos, carrito)
- Integración con Open Library y Google Books por ISBN
- Integración con Mercado Pago Checkout Pro (preferencias, webhooks)
- Dashboard con métricas en tiempo real (`Promise.all` para queries paralelas)
- Filtros avanzados de catálogo: búsqueda, categoría, precio, condición, inicial, ordenamiento

---

## Notas para el evaluador

### Credenciales de Mercado Pago

La integración de pagos requiere un Access Token y una Public Key de Mercado Pago. Estas credenciales **no están en el repositorio** por razones de seguridad. Se entregan por separado al momento de la evaluación para configurar en el `.env` del backend.

### Base de datos

La base de datos incluye datos reales importados de Buscalibre Argentina (más de 6.700 libros con portadas). El volcado SQL se entrega por separado.

### Funcionalidad de pagos en demo

La integración de Mercado Pago funciona en el entorno de pruebas con credenciales provistas. Los pagos procesados en modo demo **no generan cargos reales**. La pantalla de pago muestra un aviso indicando que es un entorno de prueba.
