const options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
};

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-Us', options);
}
