import { genreTheme, hashString, seededRandom } from '@/lib/genre'

type Props = {
  seed: string // normalmente el id del libro: el mismo libro siempre tiene la misma portada
  genre?: string | null
  className?: string
  crop?: 'center' | 'top' // 'top' muestra el cielo (útil para banners muy anchos)
}

// Portada ilustrada generada con SVG según el género del libro
export default function BookCover({ seed, genre, className = '', crop = 'center' }: Props) {
  const t = genreTheme(genre)
  const h = hashString(seed)
  const rnd = seededRandom(h)
  const id = `cv${h.toString(36)}`

  const stars = Array.from({ length: 36 }, () => ({
    x: rnd() * 320,
    y: rnd() * 120,
    r: rnd() * 1.2 + 0.3,
    o: rnd() * 0.6 + 0.3,
  }))
  const moonX = 70 + rnd() * 180
  const moonY = 42 + rnd() * 22

  const moon = (r: number) => (
    <g>
      <circle cx={moonX} cy={moonY} r={r * 3} fill={`url(#${id}-halo)`} />
      <circle cx={moonX} cy={moonY} r={r} fill={t.glow} />
      <circle cx={moonX - r * 0.3} cy={moonY - r * 0.2} r={r * 0.18} fill={t.deep} opacity={0.12} />
      <circle cx={moonX + r * 0.35} cy={moonY + r * 0.3} r={r * 0.12} fill={t.deep} opacity={0.1} />
    </g>
  )

  let scene: React.ReactNode = null

  if (t.scene === 'moon') {
    const a = 110 + rnd() * 20
    const b = 135 + rnd() * 15
    scene = (
      <g>
        {moon(20)}
        <path d={`M0 145 Q 80 ${a} 160 138 T 320 128 V200 H0Z`} fill={t.base} opacity={0.55} />
        <path d={`M0 168 Q 100 ${b} 200 162 T 320 152 V200 H0Z`} fill={t.deep} />
        {[176, 182, 188, 194].map((y, i) => (
          <line
            key={y}
            x1={moonX - 22 + i * 4}
            x2={moonX + 22 - i * 4}
            y1={y}
            y2={y}
            stroke={t.glow}
            strokeWidth={1.4}
            opacity={0.45 - i * 0.08}
          />
        ))}
      </g>
    )
  }

  if (t.scene === 'forest') {
    const back = Array.from({ length: 16 }, (_, i) => {
      const x = i * 21 + rnd() * 10
      const hh = 35 + rnd() * 35
      return `M${x} ${175 - hh} L${x - hh * 0.3} 175 L${x + hh * 0.3} 175Z`
    }).join(' ')
    const front = Array.from({ length: 11 }, (_, i) => {
      const x = i * 32 + rnd() * 14
      const hh = 60 + rnd() * 55
      return `M${x} ${200 - hh} L${x - hh * 0.28} 200 L${x + hh * 0.28} 200Z`
    }).join(' ')
    scene = (
      <g>
        {moon(14)}
        <path d={back} fill={t.base} opacity={0.6} />
        <rect x="0" y="150" width="320" height="30" fill={t.glow} opacity={0.08} />
        <path d={front} fill={t.deep} />
      </g>
    )
  }

  if (t.scene === 'sea') {
    const lx = 230 + rnd() * 50
    scene = (
      <g>
        {moon(16)}
        <rect x="0" y="128" width="320" height="72" fill={t.deep} opacity={0.85} />
        {Array.from({ length: 6 }, (_, i) => {
          const y = 140 + i * 10
          let d = `M0 ${y}`
          for (let x = 0; x < 320; x += 40) d += ` Q ${x + 20} ${y - 4} ${x + 40} ${y}`
          return <path key={i} d={d} stroke={t.glow} strokeWidth={1} fill="none" opacity={0.28 - i * 0.03} />
        })}
        <polygon points={`${lx - 6},${92} ${lx - 70},${78} ${lx - 70},${110}`} fill={t.glow} opacity={0.18} />
        <path d={`M${lx - 9} 160 L${lx - 5} 95 L${lx + 5} 95 L${lx + 9} 160Z`} fill="#eadcc3" />
        <path d={`M${lx - 8} 140 L${lx + 8} 140 L${lx + 8.5} 148 L${lx - 8.5} 148Z`} fill={t.base} />
        <path d={`M${lx - 6.5} 115 L${lx + 6.5} 115 L${lx + 7} 123 L${lx - 7} 123Z`} fill={t.base} />
        <rect x={lx - 6} y="86" width="12" height="9" fill={t.glow} />
        <path d={`M${lx - 8} 86 L${lx} 78 L${lx + 8} 86Z`} fill={t.deep} />
        <path d={`M${lx - 30} 162 Q ${lx} 150 ${lx + 40} 164 V170 H${lx - 30}Z`} fill={t.deep} />
      </g>
    )
  }

  if (t.scene === 'mountains') {
    const ridge = (base: number, amp: number, step: number) => {
      let d = `M0 ${base}`
      for (let x = 0; x <= 320; x += step) d += ` L${x} ${base - rnd() * amp}`
      return `${d} L320 200 L0 200Z`
    }
    scene = (
      <g>
        {moon(18)}
        <path d={ridge(130, 55, 40)} fill={t.base} opacity={0.45} />
        <path d={ridge(155, 50, 32)} fill={t.base} opacity={0.8} />
        <path d={ridge(185, 35, 26)} fill={t.deep} />
      </g>
    )
  }

  if (t.scene === 'stars') {
    const pts = Array.from({ length: 7 }, (_, i) => ({
      x: 40 + i * 38 + rnd() * 20,
      y: 50 + rnd() * 90,
    }))
    scene = (
      <g>
        <circle cx={moonX} cy={moonY} r={45} fill={`url(#${id}-halo)`} />
        <circle cx={moonX} cy={moonY} r={16} fill={t.glow} />
        <circle cx={moonX + 7} cy={moonY - 4} r={14} fill={t.deep} />
        <polyline
          points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={t.glow}
          strokeWidth={0.8}
          opacity={0.55}
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.2} fill={t.glow} />
        ))}
        <line x1="250" y1="30" x2="300" y2="18" stroke={t.glow} strokeWidth={1} opacity={0.5} />
        <path d="M0 185 Q 160 165 320 185 V200 H0Z" fill={t.deep} />
      </g>
    )
  }

  if (t.scene === 'city') {
    const back: React.ReactNode[] = []
    const front: React.ReactNode[] = []
    const windows: React.ReactNode[] = []
    let x = -5
    while (x < 320) {
      const w = 22 + rnd() * 26
      const hh = 40 + rnd() * 55
      back.push(<rect key={`b${x}`} x={x} y={175 - hh - 15} width={w} height={hh + 40} fill={t.base} opacity={0.5} />)
      x += w + 2
    }
    x = -5
    while (x < 320) {
      const w = 26 + rnd() * 30
      const hh = 35 + rnd() * 60
      const top = 200 - hh
      front.push(<rect key={`f${x}`} x={x} y={top} width={w} height={hh} fill={t.deep} />)
      if (rnd() > 0.5) {
        front.push(<polygon key={`r${x}`} points={`${x},${top} ${x + w / 2},${top - 18} ${x + w},${top}`} fill={t.deep} />)
      }
      for (let wy = top + 8; wy < 192; wy += 12) {
        for (let wx = x + 5; wx < x + w - 6; wx += 9) {
          if (rnd() > 0.72) windows.push(<rect key={`w${wx}-${wy}`} x={wx} y={wy} width={4} height={6} fill={t.glow} opacity={0.85} />)
        }
      }
      x += w + 3
    }
    scene = (
      <g>
        {moon(15)}
        {back}
        {front}
        {windows}
      </g>
    )
  }

  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio={crop === 'top' ? 'xMidYMin slice' : 'xMidYMid slice'}
      className={className}
      role="img"
      aria-label={`Portada ilustrada${genre ? ` de ${genre}` : ''}`}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.deep} />
          <stop offset="1" stopColor={t.base} />
        </linearGradient>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor={t.glow} stopOpacity="0.45" />
          <stop offset="1" stopColor={t.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-vig`} cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect width="320" height="200" fill={`url(#${id}-sky)`} />
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o} />
      ))}
      {scene}
      <rect width="320" height="200" fill={`url(#${id}-vig)`} />

      {/* marco dorado */}
      <rect x="9" y="9" width="302" height="182" rx="5" fill="none" stroke={t.glow} strokeOpacity="0.35" />
      {[
        [9, 9],
        [311, 9],
        [9, 191],
        [311, 191],
      ].map(([cx, cy]) => (
        <path
          key={`${cx}-${cy}`}
          d={`M${cx} ${cy - 5} L${cx + 5} ${cy} L${cx} ${cy + 5} L${cx - 5} ${cy}Z`}
          fill={t.glow}
          opacity="0.8"
        />
      ))}
    </svg>
  )
}