'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import AuthorForm from '@/components/AuthorForm'
import BookCover from '@/components/BookCover'
import HeroScene from '@/components/HeroScene'
import Modal from '@/components/Modal'
import StatTile from '@/components/StatTile'
import {
  IconArrow,
  IconBook,
  IconEdit,
  IconGlobe,
  IconLayers,
  IconMail,
  IconPages,
  IconPlus,
  IconTrash,
  IconUsers,
} from '@/components/Icons'
import { genreColor, initials } from '@/lib/genre'
import type { Author } from '@/lib/types'

// Función que solo consulta las APIs y devuelve los datos
async function fetchDashboardData() {
  const [authorsRes, genresRes] = await Promise.all([
    fetch('/api/authors'),
    fetch('/api/books/genres'),
  ])
  if (!authorsRes.ok) throw new Error('Error al obtener autores')
  const authors: Author[] = await authorsRes.json()
  const genres: string[] = genresRes.ok ? await genresRes.json() : []
  return { authors, genres }
}

// Género que más se repite en los libros de un autor
function mainGenre(author: Author) {
  const count: Record<string, number> = {}
  for (const b of author.books ?? []) {
    if (b.genre) count[b.genre] = (count[b.genre] ?? 0) + 1
  }
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

type FormState = { mode: 'new' } | { mode: 'edit'; author: Author } | null

export default function DashboardPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [genres, setGenres] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(null)

  // Carga autores y géneros desde las API Routes
  const loadData = useCallback(() => {
    return fetchDashboardData()
      .then((data) => {
        setAuthors(data.authors)
        setGenres(data.genres)
        setError('')
      })
      .catch(() => setError('No se pudo conectar con la API. Revisa que el servidor esté corriendo.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const closeForm = useCallback(() => setForm(null), [])

  const handleDelete = async (author: Author) => {
    const total = author._count?.books ?? 0
    const ok = confirm(
      `¿Eliminar a "${author.name}"?` +
        (total > 0 ? ` También se eliminarán sus ${total} libro(s).` : '')
    )
    if (!ok) return

    const res = await fetch(`/api/authors/${author.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Error al eliminar autor')
      return
    }
    loadData()
  }

  // Estadísticas generales
  const allBooks = authors.flatMap((a) => a.books ?? [])
  const totalBooks = allBooks.length
  const totalPages = allBooks.reduce((sum, b) => sum + (b.pages ?? 0), 0)
  const topAuthor = [...authors].sort(
    (a, b) => (b._count?.books ?? 0) - (a._count?.books ?? 0)
  )[0]

  return (
    <div className="space-y-10">
      {/* Portada */}
      <section className="panel relative grid overflow-hidden lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 flex flex-col justify-center p-8 sm:p-12">
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-gold" /> Panel de la biblioteca
          </p>
          <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.02] text-parchment sm:text-6xl">
            Cada libro guarda <span className="italic text-gold">una noche.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-dust">
            {loading
              ? 'Encendiendo las velas del archivo…'
              : totalBooks === 0
                ? 'Los estantes están vacíos. Registra un autor y empieza a llenar la colección.'
                : `Administra los autores de la colección y recorre sus obras. ${
                    topAuthor && (topAuthor._count?.books ?? 0) > 0
                      ? `${topAuthor.name} es quien más libros tiene en los estantes.`
                      : ''
                  }`}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => setForm({ mode: 'new' })}>
              <IconPlus size={17} /> Nuevo autor
            </button>
            <Link href="/books" className="btn-secondary">
              Explorar catálogo <IconArrow size={16} />
            </Link>
          </div>
        </div>
        <div className="relative min-h-[300px] border-t border-edge bg-gradient-to-br from-[#2a1a2c] to-[#140e18] lg:border-l lg:border-t-0">
          <div className="absolute inset-0 p-3 sm:p-5">
            <HeroScene books={allBooks} />
          </div>
        </div>
      </section>

      {/* Estadísticas generales */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={IconUsers} label="Autores" value={loading ? '…' : authors.length} hint="en el directorio" accent="#f2a0b0" />
        <StatTile icon={IconBook} label="Libros" value={loading ? '…' : totalBooks} hint="en el catálogo" />
        <StatTile icon={IconLayers} label="Géneros" value={loading ? '…' : genres.length} hint="en la colección" accent="#a9cdff" />
        <StatTile
          icon={IconPages}
          label="Páginas"
          value={loading ? '…' : totalPages.toLocaleString('es-PE')}
          hint="por leer"
          accent="#d6eaa6"
        />
      </section>

      {error && (
        <p className="rounded-2xl border border-rose/40 bg-rose/10 px-5 py-4 text-rose-2">{error}</p>
      )}

      {/* Directorio de autores */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Directorio</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Autores registrados</h2>
          </div>
          <Link href="/books" className="btn-secondary">
            Ver catálogo <IconArrow size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel h-80 animate-pulse" />
            ))}
          </div>
        ) : authors.length === 0 ? (
          <div className="panel flex flex-col items-center px-6 py-16 text-center">
            <IconUsers size={40} className="text-gold" />
            <p className="mt-4 font-display text-3xl">Aún no hay autores</p>
            <p className="mt-2 text-dust">Registra el primero para empezar a llenar los estantes.</p>
            <button className="btn-primary mt-6" onClick={() => setForm({ mode: 'new' })}>
              <IconPlus size={17} /> Registrar autor
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {authors.map((author) => {
              const count = author._count?.books ?? 0
              const genre = mainGenre(author)
              return (
                <article
                  key={author.id}
                  className="panel group flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold/40"
                >
                  {/* Banda ilustrada con el género principal del autor */}
                  <div className="relative h-28">
                    <BookCover seed={author.id} genre={genre} className="absolute inset-0 h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-panel-2 to-transparent" />
                    <span className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur">
                      <IconBook size={14} /> {count} {count === 1 ? 'libro' : 'libros'}
                    </span>
                  </div>

                  <div className="relative flex flex-1 flex-col px-6 pb-6">
                    {/* Sello con las iniciales */}
                    <span className="-mt-9 grid h-16 w-16 place-items-center rounded-2xl border-2 border-gold/60 bg-panel font-display text-2xl font-semibold text-gold shadow-xl">
                      {initials(author.name)}
                    </span>

                    <Link
                      href={`/authors/${author.id}`}
                      className="mt-4 font-display text-2xl font-semibold leading-tight text-parchment hover:text-gold-2"
                    >
                      {author.name}
                    </Link>

                    <div className="mt-3 space-y-1.5 text-sm text-dust">
                      {(author.nationality || author.birthYear) && (
                        <p className="flex items-center gap-2">
                          <IconGlobe size={15} />
                          {[author.nationality, author.birthYear && `nacido en ${author.birthYear}`]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      <p className="flex items-center gap-2 truncate">
                        <IconMail size={15} /> {author.email}
                      </p>
                    </div>

                    {author.bio && (
                      <p className="mt-4 line-clamp-2 font-display text-[17px] italic leading-snug text-parchment/80">
                        {author.bio}
                      </p>
                    )}

                    {/* Mini estante con sus libros */}
                    {count > 0 && (
                      <div className="mt-5 flex h-9 items-end gap-1 border-b-2 border-[#5a3a2c]">
                        {(author.books ?? []).slice(0, 14).map((b) => (
                          <span
                            key={b.id}
                            title={b.title}
                            className="w-2.5 rounded-t-sm"
                            style={{
                              height: `${50 + Math.min((b.pages ?? 200) / 600, 1) * 50}%`,
                              backgroundColor: genreColor(b.genre),
                            }}
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-auto flex gap-2 pt-6">
                      <Link href={`/authors/${author.id}`} className="btn-primary flex-1">
                        Ver sus obras
                      </Link>
                      <button
                        className="btn-secondary px-3"
                        onClick={() => setForm({ mode: 'edit', author })}
                        aria-label={`Editar ${author.name}`}
                      >
                        <IconEdit size={17} />
                      </button>
                      <button
                        className="btn-danger px-3"
                        onClick={() => handleDelete(author)}
                        aria-label={`Eliminar ${author.name}`}
                      >
                        <IconTrash size={17} />
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Formulario en panel lateral */}
      <Modal open={form !== null} onClose={closeForm}>
        {form && (
          <AuthorForm
            key={form.mode === 'edit' ? form.author.id : 'new'}
            author={form.mode === 'edit' ? form.author : null}
            onSaved={() => {
              setForm(null)
              loadData()
            }}
            onCancel={closeForm}
          />
        )}
      </Modal>
    </div>
  )
}