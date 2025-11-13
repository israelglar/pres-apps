import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateSelectionPage } from '../../features/date-selection'
import { useAttendanceData } from '../../hooks/useAttendanceData'

export const Route = createFileRoute('/_authenticated/date-selection')({
  component: DateSelectionRoute,
})

function DateSelectionRoute() {
  const navigate = useNavigate()
  const { serviceTimes, getSchedule, getAvailableDates } = useAttendanceData()

  const handleDateSelected = (date: Date, method: "search" | "swipe" = "swipe", serviceTimeId: number) => {
    if (method === "search") {
      navigate({ to: '/search-marking', search: { date: date.toISOString(), serviceTimeId } })
    } else {
      navigate({ to: '/marking', search: { date: date.toISOString(), serviceTimeId } })
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <DateSelectionPage
      onDateSelected={handleDateSelected}
      onBack={handleBack}
      serviceTimes={serviceTimes}
      getSchedule={getSchedule}
      getAvailableDates={getAvailableDates}
    />
  )
}
