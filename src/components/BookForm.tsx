'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Author, Book } from '@/lib/types'

type Props = {
  authors?: Author[] // lista para el selector de autor
  fixedAuthorId?: string // si se pasa, el libro se crea para ese autor (sin selector)
  genres?: string[] // sugerencias de géneros
  book?: Book | null // si viene un libro, el formulario es de edición
  onSaved: () => void
  onCancel?: () => void
}

export default function BookForm({
  authors = [],
  fixedAuthorId,
  genres = [],
  book,
  onSaved,
  onCancel,
}: Props) {
  const isEdit = !!book

  const emptyForm = {
    title: '',
    authorId: fixedAuthorId ?? '',
    genre: '',
    publishedYear: '',
    pages: '',
    isbn: '',
    description: '',
  }

  const [form, setForm] = useState(
    book
      ? {
          title: book.title,
          authorId: book.authorId,
          genre: book.genre ?? '',
          publishedYear: book.publishedYear?.toString() ?? '',
          pages: book.pages?.toString() ?? '',
          isbn: book.isbn ?? '',
          description: book.description ?? '',
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.title.trim().length < 3) {
      setError('El título debe tener al menos 3 caracteres')
      return
    }
    if (!form.authorId) {
      setError('Selecciona un autor')
      return
    }
    if (form.pages && Number(form.pages) < 1) {
      setError('El número de páginas debe ser mayor a 0')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(isEdit ? `/api/books/${book!.id}` : '/api/books', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
          pages: form.pages ? Number(form.pages) : null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error')
        return
      }

      if (!isEdit) setForm(emptyForm)
      onSaved()
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="pr-12">
        <p className="eyebrow">{isEdit ? 'Editar registro' : 'Nuevo registro'}</p>
        <h2 className="mt-2 font-display text-4xl font-semibold text-parchment">
          {isEdit ? 'Editar libro' : 'Registrar libro'}
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Título *</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="input"
            placeholder="Cien años de soledad"
            required
          />
        </div>

        {!fixedAuthorId && (
          <div>
            <label className="label">Autor *</label>
            <select
              name="authorId"
              value={form.authorId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">-- Selecciona un autor --</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="label">Género</label>
          <input
            name="genre"
            value={form.genre}
            onChange={handleChange}
            className="input"
            placeholder="Novela"
            list="genre-options"
          />
          <datalist id="genre-options">
            {genres.map((g) => (
              <option key={g} value={g} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="label">Año de publicación</label>
          <input
            name="publishedYear"
            type="number"
            value={form.publishedYear}
            onChange={handleChange}
            className="input"
            placeholder="1967"
          />
        </div>

        <div>
          <label className="label">Páginas</label>
          <input
            name="pages"
            type="number"
            min={1}
            value={form.pages}
            onChange={handleChange}
            className="input"
            placeholder="417"
          />
        </div>

        <div>
          <label className="label">ISBN</label>
          <input
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            className="input"
            placeholder="978-0307474728"
          />
        </div>
      </div>

      <div>
        <label className="label">Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          className="input min-h-28 resize-y"
          placeholder="Obra maestra del realismo mágico"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar libro'}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}