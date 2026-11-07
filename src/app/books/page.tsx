'use client'

import { useCallback, useEffect, useState } from 'react'
import BookCard from '@/components/BookCard'
import BookForm from '@/components/BookForm'
import Modal from '@/components/Modal'
import { IconLibrary, IconPlus, IconSearch, IconSparkle } from '@/components/Icons'
import type { Author, Book, Pagination } from '@/lib/types'

// Consulta autores y géneros para llenar los selectores
async function fetchOptions() {
  const [authorsRes, genresRes] = await Promise.all([
    fetch('/api/authors'),
    fetch('/api/books/genres'),
  ])
  const authors: Author[] = authorsRes.ok ? await authorsRes.json() : []
  const genres: string[] = genresRes.ok ? await genresRes.json() : []
  return { authors, genres }
}

type FormState = { mode: 'new' } | { mode: 'edit'; book: Book } | null

// Opciones de orden (campo:dirección) que se envían como sortBy y order
const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Más recientes' },
  { value: 'createdAt:asc', label: 'Más antiguos' },
  { value: 'title:asc', label: 'Título (A a Z)' },
  { value: 'title:desc', label: 'Título (Z a A)' },
  { value: 'publishedYear:desc', label: 'Año (nuevo a viejo)' },
  { value: 'publishedYear:asc', label: 'Año (viejo a nuevo)' },
]

export default function BooksPage() {
  // Datos para los selectores
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])

  // Filtros de búsqueda
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [genre, setGenre] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(6)
  const [reloadKey, setReloadKey] = useState(0)

  // Resultados
  const [books, setBooks] = useState<Book[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loadedKey, setLoadedKey] = useState('')
  const [error, setError] = useState('')

  // Formulario (crear / editar)
  const [form, setForm] = useState<FormState>(null)

  // Query string que se envía a /api/books/search
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    order,
  })
  if (debouncedSearch) params.set('search', debouncedSearch)
  if (genre) params.set('genre', genre)
  if (authorId) params.set('authorId', authorId)
  const queryKey = `${params.toString()}#${reloadKey}`

  // Está cargando si el usuario sigue escribiendo o si la última búsqueda no coincide
  const loading = search.trim() !== debouncedSearch || loadedKey !== queryKey
  const firstLoad = loadedKey === ''

  // Cargar autores y géneros para los dropdowns
  const loadOptions = useCallback(() => {
    return fetchOptions()
      .then((data) => {
        setAuthors(data.authors)
        setGenres(data.genres)
      })
      .catch(() => {
        // si falla, los selectores quedan vacíos
      })
  }, [])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  // Búsqueda en tiempo real con "debounce" de 400 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  // Llamar al endpoint de búsqueda cada vez que cambian los filtros
  useEffect(() => {
    const controller = new AbortController()
    const [query] = queryKey.split('#')

    fetch(`/api/books/search?${query}`, { signal: controller.signal })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        setBooks(data.data)
        setPagination(data.pagination)
        setError('')
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError('No se pudo buscar en el catálogo. Intenta de nuevo.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadedKey(queryKey)
      })

    return () => controller.abort()
  }, [queryKey])

  const closeForm = useCallback(() => setForm(null), [])

  const refresh = () => {
    setReloadKey((k) => k + 1)
    loadOptions()
  }

  const handleDelete = async (book: Book) => {
    if (!confirm(`¿Eliminar el libro "${book.title}"?`)) return

    const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Error al eliminar libro')
      return
    }
    // Si era el último libro de la página, volver a la anterior
    if (books.length === 1 && page > 1) setPage(page - 1)
    refresh()
  }

  const clearFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setGenre('')
    setAuthorId('')
    setSortBy('createdAt')
    setOrder('desc')
    setPage(1)
  }

  const hasFilters = !!(search || genre || authorId || sortBy !== 'createdAt' || order !== 'desc')
  const from = pagination && pagination.total > 0 ? (page - 1) * limit + 1 : 0
  const to = pagination ? Math.min(page * limit, pagination.total) : 0

  return (
    <div className="space-y-10">
      {/* Encabezado */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <IconSparkle size={15} /> El conocimiento te espera
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">
            El gran <span className="italic text-gold">catálogo.</span>
          </h1>
          <p className="mt-4 max-w-lg text-dust">
            Busca por título, filtra por género o autor y descubre qué historia abrir esta noche.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setForm({ mode: 'new' })}>
          <IconPlus size={17} /> Añadir libro
        </button>
      </header>

      {/* Búsqueda y filtros */}
      <section className="panel p-5 sm:p-6">
        <div className="relative">
          <IconSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-dust" />
          <label htmlFor="buscar" className="sr-only">
            Buscar por título
          </label>
          <input
            id="buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input py-3.5 pl-12 text-base"
            placeholder="Buscar por título… (ej: amor, soledad)"
            autoComplete="off"
          />
          {loading && !firstLoad && (
            <span className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Género</label>
            <select
              value={genre}
              onChange={(e) => {
                setGenre(e.target.value)
                setPage(1)
              }}
              className="input"
            >
              <option value="">Todos</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Autor</label>
            <select
              value={authorId}
              onChange={(e) => {
                setAuthorId(e.target.value)
                setPage(1)
              }}
              className="input"
            >
              <option value="">Todos</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Ordenar por</label>
            <select
              value={`${sortBy}:${order}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split(':')
                setSortBy(field)
                setOrder(dir)
                setPage(1)
              }}
              className="input"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Por página</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
              className="input"
            >
              {[3, 6, 9, 12, 24, 50].map((n) => (
                <option key={n} value={n}>
                  {n} libros
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="mt-4 text-sm font-semibold text-gold hover:text-gold-2">
            Limpiar filtros
          </button>
        )}
      </section>

      {/* Resultados */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">La colección</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Libros de la biblioteca</h2>
          </div>
          <p className="text-dust" aria-live="polite">
            {loading ? (
              'Buscando en los estantes…'
            ) : (
              <>
                <span className="font-display text-2xl font-semibold text-parchment">
                  {pagination?.total ?? 0}
                </span>{' '}
                {pagination?.total === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </>
            )}
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-2xl border border-rose/40 bg-rose/10 px-5 py-4 text-rose-2">{error}</p>
        )}

        {firstLoad ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel h-96 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="panel flex flex-col items-center px-6 py-16 text-center">
            <IconLibrary size={40} className="text-gold" />
            <p className="mt-4 font-display text-3xl">Ningún libro coincide</p>
            <p className="mt-2 text-dust">Prueba con otra palabra o limpia los filtros.</p>
            {hasFilters && (
              <button className="btn-secondary mt-6" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-5 transition-opacity sm:grid-cols-2 xl:grid-cols-3 ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={(b) => setForm({ mode: 'edit', book: b })}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>

      {/* Paginación */}
      {pagination && pagination.totalPages > 0 && (
        <nav
          aria-label="Paginación"
          className="panel flex flex-col items-center gap-4 px-5 py-4 sm:flex-row sm:justify-between"
        >
          <p className="text-sm text-dust">
            Mostrando <span className="text-parchment">{from}</span> a{' '}
            <span className="text-parchment">{to}</span> de {pagination.total}, página {pagination.page} de{' '}
            {pagination.totalPages}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              className="btn-secondary"
              disabled={!pagination.hasPrev || loading}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                disabled={loading}
                aria-current={n === page ? 'page' : undefined}
                className={`${n === page ? 'btn-primary' : 'btn-secondary'} w-11 px-0`}
              >
                {n}
              </button>
            ))}
            <button
              className="btn-secondary"
              disabled={!pagination.hasNext || loading}
              onClick={() => setPage(page + 1)}
            >
              Siguiente
            </button>
          </div>
        </nav>
      )}

      {/* Formulario en panel lateral */}
      <Modal open={form !== null} onClose={closeForm}>
        {form && (
          <BookForm
            key={form.mode === 'edit' ? form.book.id : 'new'}
            book={form.mode === 'edit' ? form.book : null}
            authors={authors}
            genres={genres}
            onSaved={() => {
              if (form.mode === 'new') setPage(1)
              setForm(null)
              refresh()
            }}
            onCancel={closeForm}
          />
        )}
      </Modal>
    </div>
  )
}