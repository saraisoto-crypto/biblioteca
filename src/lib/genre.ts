// Cada género tiene su propia "atmósfera": colores y escena de portada

export type Scene = 'moon' | 'forest' | 'sea' | 'mountains' | 'stars' | 'city'

export type GenreTheme = {
  base: string // color principal (lomos, acentos)
  deep: string // color del cielo profundo
  glow: string // luz de luna / ventanas
  scene: Scene
}

const THEMES: Record<Scene, GenreTheme> = {
  moon: { base: '#8a2c42', deep: '#24091a', glow: '#f6c48a', scene: 'moon' },
  forest: { base: '#2f6e60', deep: '#08201c', glow: '#d6eaa6', scene: 'forest' },
  sea: { base: '#33558c', deep: '#081430', glow: '#a9cdff', scene: 'sea' },
  mountains: { base: '#94692a', deep: '#251806', glow: '#ffdc94', scene: 'mountains' },
  stars: { base: '#6a3570', deep: '#1a0a22', glow: '#f3b2ea', scene: 'stars' },
  city: { base: '#55623a', deep: '#14190a', glow: '#f2e79e', scene: 'city' },
}

// Géneros conocidos con escena fija
const KNOWN: Record<string, Scene> = {
  novela: 'moon',
  cuento: 'forest',
  cuentos: 'forest',
  periodismo: 'sea',
  cronica: 'sea',
  poesia: 'stars',
  ensayo: 'mountains',
  aventura: 'mountains',
  fantasia: 'stars',
  historia: 'city',
  drama: 'city',
}

const ORDER: Scene[] = ['moon', 'forest', 'sea', 'mountains', 'stars', 'city']

export function hashString(text: string) {
  let hash = 0
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

export function genreTheme(genre?: string | null): GenreTheme {
  if (!genre) return THEMES.mountains
  const key = genre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
  const scene = KNOWN[key] ?? ORDER[hashString(key) % ORDER.length]
  return THEMES[scene]
}

export function genreColor(genre?: string | null) {
  return genreTheme(genre).base
}

// Generador pseudoaleatorio con semilla (siempre dibuja lo mismo para el mismo libro)
export function seededRandom(seed: number) {
  let t = seed
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}