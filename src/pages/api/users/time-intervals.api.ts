import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '../auth/[...nextauth].api'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'

const timeIntervalsBodySchema = z.object({
  intervals: z.array(
    z.object({
      weekDay: z.number(),
      startTimeInMinutes: z.number(),
      endTimeInMinutes: z.number(),
    }),
  ),
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).end()
  }

  const authOptions = buildNextAuthOptions(req, res)
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).end()
  }

  console.log('req.body:', req.body)

  const { intervals } = timeIntervalsBodySchema.parse(req.body)

  const formattedIntervals = intervals.map((interval) => ({
    user_id: session.user.id,
    week_day: interval.weekDay,
    time_start_in_minutes: interval.startTimeInMinutes,
    time_end_in_minutes: interval.endTimeInMinutes,
  }))

  console.log('formattedIntervals:', formattedIntervals)

  await prisma.userTimeInterval.createMany({
    data: formattedIntervals,
  })

  // CQRS -> Command / Query

  // Responsabilidade de comandos e de queries
  // quando se tem operações no banco de dados, o correto é evitar retornar dados dessas operações
  // e sempre retornar dados em get

  return res.status(201).end()
}
