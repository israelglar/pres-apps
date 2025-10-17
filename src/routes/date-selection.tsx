import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DateSelectionPage } from '../pages/DataSelectionPage'

export const Route = createFileRoute('/date-selection')({
  component: DateSelectionRoute,
})

function DateSelectionRoute() {
  const navigate = useNavigate()
  const { allSundays, lessonNames } = Route.useRouteContext()

  const handleDateSelected = (date: Date, method: "search" | "swipe" = "swipe") => {
    if (method === "search") {
      navigate({ to: '/search-marking', search: { date: date.toISOString() } })
    } else {
      navigate({ to: '/marking', search: { date: date.toISOString() } })
    }
  }

  const handleBack = () => {
    navigate({ to: '/' })
  }

  return (
    <DateSelectionPage
      onDateSelected={handleDateSelected}
      onBack={handleBack}
      allSundays={allSundays}
      lessonNames={lessonNames}
    />
  )
}
