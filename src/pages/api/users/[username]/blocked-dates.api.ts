import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
  }

  const username = String(req.query.username)

  const { year, month } = req.query

  if (!year || !month) {
    return res.status(400).json({ message: 'Year or Month not specified.' })
  }

  const monthString = String(month).padStart(2, '0')

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (!user) {
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const availableWeekDays = await prisma.userTimeInterval.findMany({
    select: {
      week_day: true,
    },
    where: {
      user_id: user.id,
    },
  })

  const blockedWeekDays = [0, 1, 2, 3, 4, 5, 6].filter((weekDay) => {
    return !availableWeekDays.some(
      (availableWeekDay) => availableWeekDay.week_day === weekDay,
    )
  })

  const blockedDatesRaw: Array<{ date: number }> = await prisma.$queryRaw`
    SELECT
      EXTRACT(DAY FROM s.DATE) AS date,
      COUNT(s.date),
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)
    FROM schedulings s
    LEFT JOIN user_time_intervals UTI
      ON UTI.week_day = EXTRACT(DOW FROM s.date + INTERVAL '1 day')
    WHERE s.user_id = ${user.id}
      AND EXTRACT(YEAR FROM s.date) = ${year}::int
      AND EXTRACT(MONTH FROM s.date) = ${month}::int
    GROUP BY EXTRACT(DAY FROM s.DATE),
      ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60)
    HAVING
      COUNT(s.date) >= ((UTI.time_end_in_minutes - UTI.time_start_in_minutes) / 60);
  `

  const blockedDates = blockedDatesRaw.map((item) => Number(item.date))
  return res.json({ blockedWeekDays, blockedDates })
}
