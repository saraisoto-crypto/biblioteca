import { genreColor } from '@/lib/genre'
import type { Book } from '@/lib/types'

type Props = {
  books: Book[]
  emptyText?: string
}

// Estante de lomos: la altura depende de las páginas y el color del género
export default function Shelf({ books, emptyText = 'El estante está vacío.' }: Props) {
  const maxPages = Math.max(...books.map((b) => b.pages ?? 0), 1)

  return (
    <div>
      <div className="flex min-h-[230px] items-end gap-1.5 overflow-x-auto px-3 pt-6">
        {books.length === 0 && (
          <p className="self-center font-display text-xl italic text-dust">{emptyText}</p>
        )}
        {books.map((book, i) => {
          const ratio = (book.pages ?? maxPages * 0.4) / maxPages
          return (
            <div
              key={book.id}
              title={`${book.title}${book.pages ? `, ${book.pages} páginas` : ''}`}
              className="relative flex shrink-0 animate-rise items-center justify-center overflow-hidden rounded-t-[4px] shadow-[inset_-7px_0_12px_rgb(0_0_0/0.4)]"
              style={{
                height: 150 + ratio * 70,
                width: 34 + ratio * 14,
                backgroundColor: genreColor(book.genre),
                animationDelay: `${i * 90}ms`,
              }}
            >
              <span className="absolute inset-x-0 top-3 h-[2px] bg-gold/70" />
              <span className="absolute inset-x-0 top-[17px] h-px bg-gold/40" />
              <span className="absolute inset-x-0 bottom-4 h-[2px] bg-gold/70" />
              <span className="max-h-[80%] rotate-180 truncate font-display text-[14px] font-semibold text-parchment [writing-mode:vertical-rl]">
                {book.title}
              </span>
            </div>
          )
        })}
      </div>
      <div className="h-3.5 rounded-md bg-gradient-to-b from-[#6b4532] to-[#2e1c16] shadow-[0_14px_30px_rgb(0_0_0/0.55)]" />
    </div>
  )
}