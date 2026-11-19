export interface Calendar {
  year: (date: Date) => number;
  date: (date: Date) => string;
  dateTime: (date: Date) => string;
}

export const createCalendar = ({ locale, timeZone }: { locale: string; timeZone: string }): Calendar => {
  const yearFormat = new Intl.DateTimeFormat(locale, { timeZone, year: "numeric" });
  const dateFormat = new Intl.DateTimeFormat(locale, { timeZone });
  const timeFormat = new Intl.DateTimeFormat(locale, { timeZone, hour: "numeric", minute: "2-digit", second: "2-digit" });

  return {
    year: (date) => {
      const year = yearFormat.formatToParts(date).find((part) => part.type === "year");
      if (!year) {
        throw new Error(`Failed to get year from ${date.toISOString()}`);
      }
      return Number(year.value);
    },
    date: (date) => dateFormat.format(date),
    dateTime: (date) => `${dateFormat.format(date)} ${timeFormat.format(date)}`,
  };
};
