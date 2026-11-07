import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Lista de géneros únicos (para el dropdown de filtros)
export async function GET() {
  try {
    const result = await prisma.book.findMany({
      where: { genre: { not: null } },
      select: { genre: true },
      distinct: ['genre'],
      orderBy: { genre: 'asc' },
    })

    const genres = result.map((b) => b.genre).filter(Boolean)

    return NextResponse.json(genres)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener géneros' },
      { status: 500 }
    )
  }
}