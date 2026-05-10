import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role === 'admin') {
    return NextResponse.json({ count: 0 })
  }

  const since = req.nextUrl.searchParams.get('since')
  const sinceDate = since ? new Date(parseInt(since)) : new Date(0)

  const count = await prisma.order.count({
    where: {
      userId: session.user.id,
      status: { not: 'pendiente' },
      updatedAt: { gt: sinceDate },
    },
  })

  return NextResponse.json({ count })
}
