import type { Metadata } from 'next'
import { Fraunces, Manrope } from 'next/font/google'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  style: ['normal', 'italic'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Biblioteca Nocturna',
  description: 'Sistema de biblioteca con Next.js, Prisma y Neon',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${fraunces.variable} ${manrope.variable} antialiased`}>
      <body className="min-h-screen">
        <Sidebar />
        <main className="px-5 py-8 sm:px-8 lg:ml-72 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  )
}