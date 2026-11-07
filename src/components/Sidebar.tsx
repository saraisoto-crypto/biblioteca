'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconBook, IconFeather, IconLibrary, IconMoon, IconUsers } from './Icons'

const NAV = [
  { href: '/', label: 'Autores', icon: IconUsers, match: (p: string) => p === '/' || p.startsWith('/authors') },
  { href: '/books', label: 'Catálogo', icon: IconLibrary, match: (p: string) => p.startsWith('/books') },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="relative grid h-11 w-11 place-items-center rounded-2xl border border-gold/40 bg-gold/10 text-gold">
        <IconBook size={22} />
        <IconMoon size={12} className="absolute -right-1 -top-1 rounded-full bg-night text-gold-2" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-xl font-semibold text-parchment">Biblioteca</span>
        <span className="block text-[11px] tracking-[0.2em] text-dust">NOCTURNA</span>
      </span>
    </Link>
  )
}

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Barra superior en celular */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge bg-night/85 px-5 py-3 backdrop-blur lg:hidden">
        <Logo />
        <nav className="flex gap-1">
          {NAV.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`grid h-10 w-10 place-items-center rounded-xl border transition ${
                  active ? 'border-gold/50 bg-gold/10 text-gold' : 'border-edge text-dust'
                }`}
                title={item.label}
              >
                <item.icon size={19} />
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Barra lateral en computadora */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-edge bg-gradient-to-b from-panel to-night px-6 py-8 lg:flex">
        <Logo />

        <p className="mb-3 mt-12 text-[11px] font-bold tracking-[0.25em] text-dust">EXPLORAR</p>
        <nav className="space-y-1.5">
          {NAV.map((item) => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'border-gold/40 bg-gradient-to-r from-gold/15 to-transparent text-parchment'
                    : 'border-transparent text-dust hover:bg-panel-2 hover:text-parchment'
                }`}
              >
                <item.icon size={19} className={active ? 'text-gold' : ''} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <figure className="mt-auto rounded-2xl border border-edge bg-panel-2/60 p-5">
          <IconFeather size={20} className="text-gold" />
          <blockquote className="mt-3 font-display text-[17px] italic leading-snug text-parchment/90">
            “El que lee mucho y anda mucho, ve mucho y sabe mucho.”
          </blockquote>
          <figcaption className="mt-3 text-xs text-dust">Miguel de Cervantes, Don Quijote</figcaption>
        </figure>
        <p className="mt-6 text-xs text-dust/70">Desarrollo de Aplicaciones Web Avanzado, Tecsup</p>
      </aside>
    </>
  )
}