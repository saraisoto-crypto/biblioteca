'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { Author } from '@/lib/types'

type Props = {
  author?: Author | null // si viene un autor, el formulario es de edición
  onSaved: () => void
  onCancel?: () => void
}

const emptyForm = {
  name: '',
  email: '',
  nationality: '',
  birthYear: '',
  bio: '',
}

export default function AuthorForm({ author, onSaved, onCancel }: Props) {
  const isEdit = !!author

  const [form, setForm] = useState(
    author
      ? {
          name: author.name,
          email: author.email,
          nationality: author.nationality ?? '',
          birthYear: author.birthYear?.toString() ?? '',
          bio: author.bio ?? '',
        }
      : emptyForm
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(
        isEdit ? `/api/authors/${author!.id}` : '/api/authors',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            birthYear: form.birthYear ? Number(form.birthYear) : null,
          }),
        }
      )
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
          {isEdit ? 'Editar autor' : 'Registrar autor'}
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label">Nombre *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input"
            placeholder="Gabriel García Márquez"
            required
          />
        </div>
        <div>
          <label className="label">Email *</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="input"
            placeholder="gabo@example.com"
            required
          />
        </div>
        <div>
          <label className="label">Nacionalidad</label>
          <input
            name="nationality"
            value={form.nationality}
            onChange={handleChange}
            className="input"
            placeholder="Colombia"
          />
        </div>
        <div>
          <label className="label">Año de nacimiento</label>
          <input
            name="birthYear"
            type="number"
            value={form.birthYear}
            onChange={handleChange}
            className="input"
            placeholder="1927"
          />
        </div>
      </div>

      <div>
        <label className="label">Biografía</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          className="input min-h-28 resize-y"
          placeholder="Premio Nobel de Literatura 1982"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-rose/40 bg-rose/10 px-4 py-3 text-sm text-rose-2">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar autor'}
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