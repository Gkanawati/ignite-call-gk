import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const updateProfileBodySchema = z.object({
  bio: z.string(),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'PUT') {
    return res.status(405).end()
  }

  const authOptions = buildNextAuthOptions(req, res)
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).end()
  }

  const { bio } = updateProfileBodySchema.parse(req.body)

  await prisma.user.update({
    where: {
      id: session?.user.id,
    },
    data: {
      bio,
    },
  })

  // 200 -> utilizado para retornar dados (GET)
  // 204 -> sucesso sem conteúdo

  return res.status(204).end()
}
