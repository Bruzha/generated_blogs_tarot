export function getTuesdaysAndFridaysForNextMonth(): Date[] {
  const today = new Date();
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const year = nextMonth.getFullYear();
  const month = nextMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result: Date[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    if ([2, 5].includes(date.getDay())) {
      result.push(date);
    }
  }

  return result;
}
