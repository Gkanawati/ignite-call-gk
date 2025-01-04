import { useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { api } from '../../../../../lib/axios'
import { Calendar } from '../../../../../components/Calendar'
import { capitalize } from '../../../../../utils/capitalize'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'
import { useQuery } from '@tanstack/react-query'

interface Availability {
  possibleTimes: number[]
  availableTimes: number[]
}

export function CalendarStep() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const router = useRouter()

  const isDateSelected = !!selectedDate
  const username = String(router.query.username)

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : ''
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD [de] MMMM')
    : ''

  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null

  const { data: availability } = useQuery<Availability>({
    queryKey: ['availability', { username, date: selectedDateWithoutTime }],
    queryFn: async () => {
      const response = await api.get(`users/${username}/availability`, {
        params: {
          date: selectedDateWithoutTime,
        },
      })

      return response.data
    },
    enabled: !!selectedDate,
  })

  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {capitalize(weekDay)} - <span>{describedDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes &&
              availability?.possibleTimes.map((hour) => (
                <TimePickerItem
                  key={hour}
                  disabled={!availability.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                </TimePickerItem>
              ))}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
