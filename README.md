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

### Backend

```bash
cd booklo-api
npm install
cp .env.example .env   # completar las variables de entorno
npm run dev
```

### Frontend

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

## Estado del proyecto

🚧 En desarrollo — Trabajo Final Integrador en curso.
