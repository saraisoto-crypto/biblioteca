'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import AuthorForm from '@/components/AuthorForm'
import BookCard from '@/components/BookCard'
import BookCover from '@/components/BookCover'
import BookForm from '@/components/BookForm'
import Modal from '@/components/Modal'
import Shelf from '@/components/Shelf'
import StatTile from '@/components/StatTile'
import {
  IconBack,
  IconBook,
  IconCalendar,
  IconEdit,
  IconFeather,
  IconGlobe,
  IconHourglass,
  IconMail,
  IconPages,
  IconPlus,
  IconSparkle,
} from '@/components/Icons'
import { genreTheme, initials } from '@/lib/genre'
import type { Author, AuthorStats, Book } from '@/lib/types'

function Loading() {
  return (
    <div className="space-y-6">
      <div className="panel h-80 animate-pulse" />
      <div className="panel h-56 animate-pulse" />
    </div>
  )
}

// useParams() debe ir dentro de <Suspense> (requisito de Next.js 16)
export default function AuthorDetailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthorDetail />
    </Suspense>
  )
}

type FormState = { type: 'author' } | { type: 'newBook' } | { type: 'editBook'; book: Book } | null

function AuthorDetail() {
  const { id } = useParams<{ id: string }>()

  const [author, setAuthor] = useState<Author | null>(null)
  const [stats, setStats] = useState<AuthorStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<FormState>(null)

  // Carga el autor (con sus libros) y sus estadísticas
  const loadData = useCallback(async () => {
    try {
      const [authorRes, statsRes] = await Promise.all([
        fetch(`/api/authors/${id}`),
        fetch(`/api/authors/${id}/stats`),
      ])
      if (authorRes.status === 404) {
        setNotFound(true)
        return
      }
      setAuthor(await authorRes.json())
      setStats(statsRes.ok ? await statsRes.json() : null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const closeForm = useCallback(() => setForm(null), [])

  const handleDeleteBook = async (book: Book) => {
    if (!confirm(`¿Eliminar el libro "${book.title}"?`)) return
    const res = await fetch(`/api/books/${book.id}`, { method: 'DELETE' })
    if (res.ok) loadData()
  }

  if (loading) return <Loading />

  if (notFound || !author) {
    return (
      <div className="panel flex flex-col items-center px-6 py-20 text-center">
        <IconBook size={44} className="text-gold" />
        <p className="mt-4 font-display text-4xl">Este autor no está en el archivo</p>
        <p className="mt-2 text-dust">Puede que haya sido eliminado.</p>
        <Link href="/" className="btn-primary mt-6">
          Volver a los autores
        </Link>
      </div>
    )
  }

  const books = author.books ?? []
  const firstGenre = stats?.genres[0] ?? null

  return (
    <div className="space-y-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-dust hover:text-gold">
        <IconBack size={17} /> Volver a los autores
      </Link>

      {/* Portada del autor */}
      <section className="panel overflow-hidden">
        <div className="relative h-48 sm:h-60">
          <BookCover seed={author.id} genre={firstGenre} crop="top" className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-panel-2 via-panel-2/30 to-transparent" />
        </div>

        <div className="relative grid gap-6 px-6 pb-8 sm:px-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <span className="-mt-14 grid h-24 w-24 place-items-center rounded-3xl border-2 border-gold/70 bg-panel font-display text-4xl font-semibold text-gold shadow-2xl">
              {initials(author.name)}
            </span>
            <p className="eyebrow mt-6">Ficha de autor</p>
            <h1 className="mt-2 font-display text-5xl font-semibold leading-none sm:text-6xl">
              {author.name}
            </h1>
            {author.bio && (
              <p className="mt-5 max-w-2xl font-display text-xl italic leading-relaxed text-parchment/85">
                “{author.bio}”
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              {author.nationality && (
                <span className="flex items-center gap-2 rounded-full border border-edge bg-night/40 px-3 py-1.5 text-dust">
                  <IconGlobe size={15} /> {author.nationality}
                </span>
              )}
              {author.birthYear && (
                <span className="flex items-center gap-2 rounded-full border border-edge bg-night/40 px-3 py-1.5 text-dust">
                  <IconCalendar size={15} /> Nació en {author.birthYear}
                </span>
              )}
              <span className="flex items-center gap-2 rounded-full border border-edge bg-night/40 px-3 py-1.5 text-dust">
                <IconMail size={15} /> {author.email}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => setForm({ type: 'author' })}>
              <IconEdit size={16} /> Editar autor
            </button>
            <button className="btn-primary" onClick={() => setForm({ type: 'newBook' })}>
              <IconPlus size={17} /> Agregar libro
            </button>
          </div>
        </div>
      </section>

      {/* Estante */}
      <section className="panel px-6 pb-8 pt-6 sm:px-10">
        <p className="eyebrow">Su estante</p>
        <Shelf books={books} emptyText="Este autor aún no tiene libros en el estante." />
      </section>

      {/* Estadísticas (endpoint /api/authors/[id]/stats) */}
      {stats && (
        <section>
          <p className="eyebrow">Estadísticas</p>
          <h2 className="mb-6 mt-2 font-display text-4xl font-semibold">Su obra en números</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatTile icon={IconBook} label="Libros publicados" value={stats.totalBooks} hint="en el catálogo" />
            <StatTile
              icon={IconCalendar}
              label="Primer libro"
              value={stats.firstBook?.year ?? '—'}
              detail={stats.firstBook?.title}
              accent="#a9cdff"
            />
            <StatTile
              icon={IconSparkle}
              label="Último libro"
              value={stats.latestBook?.year ?? '—'}
              detail={stats.latestBook?.title}
              accent="#f3b2ea"
            />
            <StatTile icon={IconPages} label="Promedio" value={stats.averagePages} hint="páginas por libro" accent="#d6eaa6" />
            <StatTile
              icon={IconHourglass}
              label="Más extenso"
              value={stats.longestBook?.pages ?? '—'}
              hint={stats.longestBook ? 'páginas' : undefined}
              detail={stats.longestBook?.title}
              accent="#f6c48a"
            />
            <StatTile
              icon={IconFeather}
              label="Más breve"
              value={stats.shortestBook?.pages ?? '—'}
              hint={stats.shortestBook ? 'páginas' : undefined}
              detail={stats.shortestBook?.title}
              accent="#f2a0b0"
            />
          </div>

          <div className="panel mt-4 flex flex-wrap items-center gap-3 p-5">
            <span className="mr-2 text-sm font-bold text-dust">Géneros que ha escrito</span>
            {stats.genres.length === 0 ? (
              <span className="text-sm text-dust">Sin géneros registrados</span>
            ) : (
              stats.genres.map((g) => {
                const theme = genreTheme(g)
                return (
                  <span
                    key={g}
                    className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
                    style={{ backgroundColor: `${theme.base}55`, color: theme.glow }}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.glow }} />
                    {g}
                  </span>
                )
              })
            )}
          </div>
        </section>
      )}

      {/* Libros del autor */}
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Bibliografía</p>
            <h2 className="mt-2 font-display text-4xl font-semibold">Todos sus libros</h2>
          </div>
          <button className="btn-secondary" onClick={() => setForm({ type: 'newBook' })}>
            <IconPlus size={16} /> Agregar libro
          </button>
        </div>
        {books.length === 0 ? (
          <div className="panel px-6 py-14 text-center">
            <p className="font-display text-2xl">Todavía no hay libros de este autor</p>
            <p className="mt-2 text-dust">Usa Agregar libro para registrar su primera obra.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showAuthor={false}
                onEdit={(b) => setForm({ type: 'editBook', book: b })}
                onDelete={handleDeleteBook}
              />
            ))}
          </div>
        )}
      </section>

      {/* Formularios en panel lateral */}
      <Modal open={form !== null} onClose={closeForm}>
        {form?.type === 'author' && (
          <AuthorForm
            key={author.updatedAt}
            author={author}
            onSaved={() => {
              setForm(null)
              loadData()
            }}
            onCancel={closeForm}
          />
        )}
        {(form?.type === 'newBook' || form?.type === 'editBook') && (
          <BookForm
            key={form.type === 'editBook' ? form.book.id : 'new'}
            fixedAuthorId={author.id}
            book={form.type === 'editBook' ? form.book : null}
            genres={stats?.genres ?? []}
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