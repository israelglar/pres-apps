export const getClosestSunday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  if (dayOfWeek === 0) {
    // Today is Sunday
    return today;
  } else {
    // Get previous Sunday
    const daysToSubtract = dayOfWeek;
    const previousSunday = new Date(today);
    previousSunday.setDate(today.getDate() - daysToSubtract);
    return previousSunday;
  }
};

export const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateLong = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("pt-PT", options);
};

export const getShortName = (fullName: string) => {
  const parts = fullName.trim().split(" ");
  if (parts.length <= 2) return fullName;
  return `${parts[0]} ${parts[parts.length - 1]}`;
};

export const getLessonName = (
  date: Date,
  lessonNames: Record<string, string>
) => {
  // Try exact match first
  const exactKey = date.toISOString();
  if (lessonNames[exactKey]) {
    return lessonNames[exactKey];
  }

  // If no exact match, try matching by calendar date (ignoring time)
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  for (const [key, value] of Object.entries(lessonNames)) {
    const lessonDate = new Date(key);
    lessonDate.setHours(0, 0, 0, 0);

    if (lessonDate.getTime() === targetDate.getTime()) {
      return value;
    }
  }

  // Fallback to long date format if no match found
  return formatDateLong(date);
};
