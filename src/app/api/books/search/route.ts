import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

// GET - Búsqueda de libros con filtros, ordenamiento y paginación
// Ej: /api/books/search?search=amor&genre=Novela&page=1&limit=10&sortBy=publishedYear&order=desc
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // 1. Leer query params
    const search = searchParams.get('search')?.trim() || ''
    const genre = searchParams.get('genre')?.trim() || ''
    const authorName = searchParams.get('authorName')?.trim() || ''
    const authorId = searchParams.get('authorId')?.trim() || '' // extra: para el dropdown de autores

    // 2. Paginación (page por defecto 1, limit por defecto 10 y máximo 50)
    let page = parseInt(searchParams.get('page') || '1')
    if (isNaN(page) || page < 1) page = 1

    let limit = parseInt(searchParams.get('limit') || '10')
    if (isNaN(limit) || limit < 1) limit = 10
    limit = Math.min(limit, 50)

    // 3. Ordenamiento (solo campos permitidos)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order: Prisma.SortOrder =
      searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    let orderBy: Prisma.BookOrderByWithRelationInput
    if (sortBy === 'title') orderBy = { title: order }
    else if (sortBy === 'publishedYear') orderBy = { publishedYear: order }
    else orderBy = { createdAt: order }

    // 4. Construir el filtro dinámicamente
    const where: Prisma.BookWhereInput = {
      ...(search
        ? { title: { contains: search, mode: 'insensitive' } }
        : {}),
      ...(genre ? { genre } : {}),
      ...(authorId ? { authorId } : {}),
      ...(authorName
        ? { author: { name: { contains: authorName, mode: 'insensitive' } } }
        : {}),
    }

    // 5. Contar y obtener resultados en una sola transacción
    const [total, books] = await prisma.$transaction([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ])

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      data: books,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error al buscar libros' },
      { status: 500 }
    )
  }
}