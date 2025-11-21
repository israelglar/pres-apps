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
  const monthNames = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const day = date.getDate();
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
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
  // Convert date to YYYY-MM-DD format to match Supabase keys
  const dateKey = date.toISOString().split('T')[0];

  // Try exact match with YYYY-MM-DD format
  if (lessonNames[dateKey]) {
    return lessonNames[dateKey];
  }

  // Try full ISO string (for backward compatibility)
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

export const getLessonLink = (
  date: Date,
  lessonLinks: Record<string, string> | undefined
) => {
  // Return null if lessonLinks is undefined or empty
  if (!lessonLinks) {
    return null;
  }

  // Convert date to YYYY-MM-DD format to match Supabase keys
  const dateKey = date.toISOString().split('T')[0];

  // Try exact match with YYYY-MM-DD format
  if (lessonLinks[dateKey]) {
    return lessonLinks[dateKey];
  }

  // Try full ISO string (for backward compatibility)
  const exactKey = date.toISOString();
  if (lessonLinks[exactKey]) {
    return lessonLinks[exactKey];
  }

  // If no exact match, try matching by calendar date (ignoring time)
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  for (const [key, value] of Object.entries(lessonLinks)) {
    const lessonDate = new Date(key);
    lessonDate.setHours(0, 0, 0, 0);

    if (lessonDate.getTime() === targetDate.getTime()) {
      return value;
    }
  }

  // Return null if no link found
  return null;
};
