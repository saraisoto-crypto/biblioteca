# 🌙 Biblioteca Nocturna

Sistema de gestión de biblioteca con **autores y libros**, construido con **API Routes de Next.js**, **Prisma ORM** y **PostgreSQL en Neon**.

> Laboratorio 12: *API's Integradas*. Curso **Desarrollo de Aplicaciones Web Avanzado**, Tecsup.

🔗 **Demo en vivo:** _[agrega aquí tu link de Vercel]_

---

## ✨ Funcionalidades

### Dashboard de autores (`/`)
- Estadísticas generales: autores, libros, géneros y páginas totales.
- Ilustración con un estante que muestra los libros reales de la base de datos.
- Crear, editar y eliminar autores desde un panel lateral.
- Acceso al detalle de cada autor.

### Catálogo de libros (`/books`)
- Búsqueda **en tiempo real** por título (con *debounce*).
- Filtros por **género** y **autor**.
- Ordenamiento por título, año de publicación o fecha de registro.
- **Paginación** con navegación entre páginas y total de resultados.
- Crear, editar y eliminar libros.
- Portadas ilustradas generadas con SVG según el género de cada libro.

### Detalle de autor (`/authors/[id]`)
- Información completa del autor.
- Estadísticas: total de libros, primer y último libro, promedio de páginas, libro más extenso y más breve, géneros.
- Estante con sus libros y lista completa de su obra.
- Editar al autor y agregarle libros nuevos.

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| **Next.js 16** (App Router + Turbopack) | Frontend y API Routes |
| **TypeScript** | Tipado estático |
| **Prisma 6** | ORM para PostgreSQL |
| **Neon** | Base de datos PostgreSQL serverless |
| **Tailwind CSS 4** | Estilos |
| **Vercel** | Despliegue |

---

## 📡 Endpoints de la API

### Autores
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/authors` | Listar todos los autores |
| `POST` | `/api/authors` | Crear un autor |
| `GET` | `/api/authors/:id` | Obtener un autor por ID |
| `PUT` | `/api/authors/:id` | Actualizar un autor |
| `DELETE` | `/api/authors/:id` | Eliminar un autor (y sus libros) |
| `GET` | `/api/authors/:id/books` | Libros de un autor |
| `GET` | `/api/authors/:id/stats` | Estadísticas de un autor |

### Libros
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/books` | Listar libros (filtros `genre`, `authorId`) |
| `POST` | `/api/books` | Crear un libro |
| `GET` | `/api/books/:id` | Obtener un libro por ID |
| `PUT` | `/api/books/:id` | Actualizar un libro |
| `DELETE` | `/api/books/:id` | Eliminar un libro |
| `GET` | `/api/books/genres` | Lista de géneros únicos |
| `GET` | `/api/books/search` | Búsqueda con filtros y paginación |

#### Parámetros de `/api/books/search`
| Parámetro | Descripción | Por defecto |
|---|---|---|
| `search` | Búsqueda parcial por título (sin distinguir mayúsculas) | — |
| `genre` | Género exacto | — |
| `authorName` | Búsqueda parcial por nombre del autor | — |
| `page` | Número de página | `1` |
| `limit` | Resultados por página (máximo 50) | `10` |
| `sortBy` | `title`, `publishedYear` o `createdAt` | `createdAt` |
| `order` | `asc` o `desc` | `desc` |

Ejemplo:
```
GET /api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
```

---

## 🚀 Instalación local

1. Clonar el repositorio e instalar dependencias:
   ```bash
   git clone https://github.com/saraisoto-crypto/biblioteca.git
   cd biblioteca
   npm install
   ```

2. Crear un archivo `.env` en la raíz con las cadenas de conexión de Neon:
   ```env
   DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST-pooler.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://USUARIO:PASSWORD@HOST.neon.tech/neondb?sslmode=require"
   ```

3. Crear las tablas en la base de datos:
   ```bash
   npx prisma db push
   ```

4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abrir [http://localhost:3000](http://localhost:3000).

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── authors/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── books/route.ts
│   │   │       └── stats/route.ts
│   │   └── books/
│   │       ├── route.ts
│   │       ├── [id]/route.ts
│   │       ├── genres/route.ts
│   │       └── search/route.ts
│   ├── authors/[id]/page.tsx   # Detalle del autor
│   ├── books/page.tsx          # Catálogo con búsqueda
│   ├── layout.tsx
│   └── page.tsx                # Dashboard
├── components/                 # Formularios, tarjetas, portadas SVG, sidebar…
└── lib/
    ├── prisma.ts               # Cliente de Prisma
    ├── genre.ts                # Colores y escenas por género
    └── types.ts                # Tipos compartidos
prisma/
└── schema.prisma               # Modelos Author y Book
```

---

## 👩‍💻 Autora

**Sarai Sthefanie Soto López**
Desarrollo de Software, Tecsup
GitHub: [@saraisoto-crypto](https://github.com/saraisoto-crypto)
