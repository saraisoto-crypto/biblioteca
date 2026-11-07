import Link from 'next/link'
import BookCover from './BookCover'
import { IconEdit, IconPages, IconTrash } from './Icons'
import { genreTheme } from '@/lib/genre'
import type { Book } from '@/lib/types'

type Props = {
  book: Book
  showAuthor?: boolean
  onEdit?: (book: Book) => void
  onDelete?: (book: Book) => void
}

// Tarjeta de libro con portada ilustrada
export default function BookCard({ book, showAuthor = true, onEdit, onDelete }: Props) {
  const theme = genreTheme(book.genre)

  return (
    <article className="group panel flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-gold/40">
      {/* Portada */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <BookCover
          seed={book.id}
          genre={book.genre}
          className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          {showAuthor && book.author && (
            <p className="text-xs font-semibold text-parchment/80">{book.author.name}</p>
          )}
          <p className="mt-1 font-display text-2xl font-semibold leading-tight text-parchment drop-shadow-lg">
            {book.title}
          </p>
        </div>
        {book.publishedYear && (
          <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-parchment backdrop-blur">
            {book.publishedYear}
          </span>
        )}
      </div>

      {/* Detalles */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          {book.genre ? (
            <span
              className="rounded-full px-3 py-1 text-xs font-bold"
              style={{ backgroundColor: `${theme.base}55`, color: theme.glow }}
            >
              {book.genre}
            </span>
          ) : (
            <span className="text-xs text-dust">Sin género</span>
          )}
          {book.pages && (
            <span className="flex items-center gap-1.5 text-xs text-dust">
              <IconPages size={14} />
              {book.pages} págs.
            </span>
          )}
        </div>

        {book.description && (
          <p className="mt-4 line-clamp-3 font-display text-[17px] leading-snug text-parchment/80">
            {book.description}
          </p>
        )}

        {showAuthor && book.author && (
          <Link
            href={`/authors/${book.author.id}`}
            className="mt-3 inline-flex w-fit text-sm font-semibold text-gold hover:text-gold-2"
          >
            Ver autor: {book.author.name}
          </Link>
        )}

        {book.isbn && <p className="mt-2 text-xs text-dust/80">ISBN {book.isbn}</p>}

        {(onEdit || onDelete) && (
          <div className="mt-auto flex gap-2 pt-5">
            {onEdit && (
              <button className="btn-secondary flex-1" onClick={() => onEdit(book)}>
                <IconEdit size={16} /> Editar
              </button>
            )}
            {onDelete && (
              <button className="btn-danger" onClick={() => onDelete(book)} aria-label={`Eliminar ${book.title}`}>
                <IconTrash size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}