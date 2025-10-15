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
