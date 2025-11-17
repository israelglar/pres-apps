import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateSelectionPage } from '../../features/date-selection'
import { useAttendanceData } from '../../hooks/useAttendanceData'
import { getAttendanceBySchedule } from '../../api/supabase/attendance'
import { calculateStats } from '../../utils/attendance'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys } from '../../lib/queryKeys'

export const Route = createFileRoute('/_authenticated/date-selection')({
  component: DateSelectionRoute,
})

function DateSelectionRoute() {
  const navigate = useNavigate()
  const { serviceTimes, getSchedule, getAvailableDates } = useAttendanceData()

  // Track currently selected date and service time to fetch attendance
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedServiceTimeId, setSelectedServiceTimeId] = useState<number | null>(null)

  // Get the schedule for the selected date/service time
  const selectedSchedule = selectedDate && selectedServiceTimeId
    ? getSchedule(selectedDate.toISOString().split('T')[0], selectedServiceTimeId)
    : null

  // Fetch attendance records when schedule has attendance
  const { data: attendanceStats } = useQuery({
    queryKey: selectedSchedule?.id ? queryKeys.attendanceStats(selectedSchedule.id) : ['attendance-stats', null],
    queryFn: async () => {
      if (!selectedSchedule?.id || !selectedSchedule.has_attendance) {
        return null
      }
      const records = await getAttendanceBySchedule(selectedSchedule.id)
      return calculateStats(records)
    },
    enabled: !!selectedSchedule?.id && !!selectedSchedule.has_attendance,
    staleTime: 30000, // 30 seconds
  })

  const handleDateSelected = (date: Date, method: "search" | "swipe" = "swipe", serviceTimeId: number) => {
    if (method === "search") {
      navigate({ to: '/search-marking', search: { date: date.toISOString(), serviceTimeId } })
    } else {
      navigate({ to: '/marking', search: { date: date.toISOString(), serviceTimeId } })
    }
  }

  const handleViewHistory = () => {
    if (selectedDate && selectedServiceTimeId) {
      navigate({
        to: '/lessons',
        search: {
          date: selectedDate.toISOString().split('T')[0],
          serviceTimeId: selectedServiceTimeId
        }
      })
    } else {
      navigate({ to: '/lessons' })
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <DateSelectionPage
      onDateSelected={handleDateSelected}
      onBack={handleBack}
      onViewHistory={handleViewHistory}
      serviceTimes={serviceTimes}
      getSchedule={getSchedule}
      getAvailableDates={getAvailableDates}
      attendanceStats={attendanceStats || undefined}
      onDateChange={setSelectedDate}
      onServiceTimeChange={setSelectedServiceTimeId}
    />
  )
}
