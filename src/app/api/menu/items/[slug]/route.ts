// ═══════════════════════════════════════════════════
// 🍽️ GET /api/menu/items/[slug]
// ═══════════════════════════════════════════════════
// يعيد تفاصيل طبق واحد حسب الـ slug

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type RouteParams = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    const item = await prisma.menuItem.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    })

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'الطبق غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: item })
  } catch (error) {
    console.error('[GET /api/menu/items/[slug]]', error)
    return NextResponse.json(
      { success: false, error: 'فشل تحميل الطبق' },
      { status: 500 }
    )
  }
}