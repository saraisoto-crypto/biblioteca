import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET - Estadísticas completas de un autor
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id },
      select: { id: true, name: true },
    })

    if (!author) {
      return NextResponse.json(
        { error: 'Autor no encontrado' },
        { status: 404 }
      )
    }

    // Todas las consultas en paralelo
    const [aggregate, firstBook, latestBook, longestBook, shortestBook, genres] =
      await Promise.all([
        // Total de libros y promedio de páginas
        prisma.book.aggregate({
          where: { authorId: id },
          _count: { _all: true },
          _avg: { pages: true },
        }),
        // Primer libro (año más antiguo)
        prisma.book.findFirst({
          where: { authorId: id, publishedYear: { not: null } },
          orderBy: { publishedYear: 'asc' },
          select: { title: true, publishedYear: true },
        }),
        // Último libro (año más reciente)
        prisma.book.findFirst({
          where: { authorId: id, publishedYear: { not: null } },
          orderBy: { publishedYear: 'desc' },
          select: { title: true, publishedYear: true },
        }),
        // Libro con más páginas
        prisma.book.findFirst({
          where: { authorId: id, pages: { not: null } },
          orderBy: { pages: 'desc' },
          select: { title: true, pages: true },
        }),
        // Libro con menos páginas
        prisma.book.findFirst({
          where: { authorId: id, pages: { not: null } },
          orderBy: { pages: 'asc' },
          select: { title: true, pages: true },
        }),
        // Géneros únicos
        prisma.book.findMany({
          where: { authorId: id, genre: { not: null } },
          select: { genre: true },
          distinct: ['genre'],
        }),
      ])

    return NextResponse.json({
      authorId: author.id,
      authorName: author.name,
      totalBooks: aggregate._count._all,
      firstBook: firstBook
        ? { title: firstBook.title, year: firstBook.publishedYear }
        : null,
      latestBook: latestBook
        ? { title: latestBook.title, year: latestBook.publishedYear }
        : null,
      averagePages: Math.round(aggregate._avg.pages ?? 0),
      genres: genres.map((g) => g.genre),
      longestBook: longestBook
        ? { title: longestBook.title, pages: longestBook.pages }
        : null,
      shortestBook: shortestBook
        ? { title: shortestBook.title, pages: shortestBook.pages }
        : null,
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas del autor' },
      { status: 500 }
    )
  }
}