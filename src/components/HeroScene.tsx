import { genreTheme, seededRandom } from '@/lib/genre'

type SceneBook = {
  id: string
  pages: number | null
  genre: string | null
}

type Props = {
  books: SceneBook[]
}

// Ilustración de la portada: ventana con luna, estante con TUS libros y una vela
export default function HeroScene({ books }: Props) {
  const rnd = seededRandom(7)
  const maxPages = Math.max(...books.map((b) => b.pages ?? 0), 300)

  // Rellena el estante: primero los libros reales, luego lomos "fantasma"
  const slots = 33
  const spines = Array.from({ length: slots }, (_, i) => {
    const real = books[i]
    const ratio = real ? (real.pages ?? maxPages * 0.5) / maxPages : 0.45 + rnd() * 0.4
    return {
      key: real?.id ?? `ghost-${i}`,
      color: real ? genreTheme(real.genre).base : ['#3b2d3e', '#33283a', '#43303d'][i % 3],
      height: 46 + ratio * 30,
      width: 9 + Math.round(ratio * 6),
      real: !!real,
    }
  })

  const shelves = [0, 1, 2].map((row) => spines.slice(row * 11, row * 11 + 11))

  const stars = Array.from({ length: 26 }, () => ({
    x: 300 + rnd() * 150,
    y: 50 + rnd() * 140,
    r: rnd() * 1.3 + 0.4,
    d: rnd() * 3,
  }))

  return (
    <svg viewBox="16 28 492 320" className="h-full w-full" role="img" aria-label="Ilustración de una biblioteca de noche">
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0a1f" />
          <stop offset="1" stopColor="#3a1f45" />
        </linearGradient>
        <radialGradient id="hs-moon">
          <stop offset="0" stopColor="#ffe3ad" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe3ad" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hs-candle">
          <stop offset="0" stopColor="#ffbe6b" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffbe6b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hs-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a3a2c" />
          <stop offset="1" stopColor="#2e1c16" />
        </linearGradient>
        <clipPath id="hs-window">
          <path d="M300 250 V120 a75 75 0 0 1 150 0 V250Z" />
        </clipPath>
      </defs>

      {/* Ventana arqueada */}
      <g clipPath="url(#hs-window)">
        <rect x="300" y="40" width="150" height="220" fill="url(#hs-sky)" />
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff"
            className="animate-twinkle"
            style={{ animationDelay: `${s.d}s` }}
          />
        ))}
        <circle cx="405" cy="105" r="70" fill="url(#hs-moon)" />
        <circle cx="405" cy="105" r="24" fill="#fbe2b3" />
        <circle cx="397" cy="99" r="4" fill="#e8c993" />
        <circle cx="413" cy="114" r="3" fill="#e8c993" />
        <path d="M300 250 L300 215 Q 340 195 380 212 T 450 205 V250Z" fill="#1a1028" />
      </g>
      <path
        d="M300 250 V120 a75 75 0 0 1 150 0 V250"
        fill="none"
        stroke="url(#hs-wood)"
        strokeWidth="9"
      />
      <path d="M375 45 V250 M300 165 H450" stroke="#3a2630" strokeWidth="5" />
      <rect x="290" y="248" width="170" height="10" rx="3" fill="url(#hs-wood)" />

      {/* Estante con los libros */}
      <rect x="28" y="40" width="232" height="300" rx="6" fill="#20141c" stroke="#3d2832" strokeWidth="6" />
      {shelves.map((row, r) => {
        const baseY = 128 + r * 96
        let x = 40
        return (
          <g key={r}>
            {row.map((s, i) => {
              const el = (
                <g key={s.key} className={s.real ? 'animate-rise' : undefined} style={s.real ? { animationDelay: `${(r * 11 + i) * 60}ms` } : undefined}>
                  <rect x={x} y={baseY - s.height} width={s.width} height={s.height} rx="1.5" fill={s.color} />
                  <rect x={x} y={baseY - s.height + 6} width={s.width} height="2" fill="#d9b26f" opacity={s.real ? 0.75 : 0.25} />
                  <rect x={x} y={baseY - 10} width={s.width} height="2" fill="#d9b26f" opacity={s.real ? 0.75 : 0.25} />
                </g>
              )
              x += s.width + 2.5
              return el
            })}
            <rect x="28" y={baseY} width="232" height="8" fill="url(#hs-wood)" />
          </g>
        )
      })}

      {/* Mesa y vela */}
      <rect x="290" y="320" width="200" height="12" rx="3" fill="url(#hs-wood)" />
      <circle cx="400" cy="262" r="80" fill="url(#hs-candle)" />
      <rect x="392" y="282" width="16" height="38" rx="3" fill="#efe1c6" />
      <path d="M392 288 q8 6 16 0" stroke="#d8c6a6" fill="none" />
      <g className="animate-flicker" style={{ transformOrigin: '400px 282px' }}>
        <path d="M400 255 C 408 266 409 274 400 282 C 391 274 392 266 400 255Z" fill="#ffc46b" />
        <path d="M400 266 C 404 271 404 276 400 280 C 396 276 396 271 400 266Z" fill="#fff1c9" />
      </g>
      <rect x="320" y="300" width="50" height="20" rx="2" fill="#6a2d3d" />
      <rect x="324" y="292" width="42" height="9" rx="2" fill="#2f5e57" />
      <rect x="320" y="300" width="50" height="3" fill="#d9b26f" opacity="0.6" />
    </svg>
  )
}