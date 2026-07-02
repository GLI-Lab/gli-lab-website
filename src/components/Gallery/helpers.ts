// Client-side utility functions for Gallery components

export function isNewItem(date?: string): boolean {
  if (!date) return false;

  const startDate = getStartDateFromRange(date);
  const itemDate = new Date(startDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return itemDate >= sixMonthsAgo;
}

export function getStartDateFromRange(dateRange?: string): string {
  if (!dateRange) return '';

  if (dateRange.includes('~')) {
    const parts = dateRange.split('~').map((part) => part.trim());
    return parts[0];
  }

  return dateRange;
}

export function formatDateForDisplay(date?: string): string {
  if (!date) return '';
  return date;
}

export function getSortableDate(date?: string): Date {
  if (!date) return new Date(0);

  const startDate = getStartDateFromRange(date);
  const dateObj = new Date(startDate);

  if (!isNaN(dateObj.getTime())) {
    return dateObj;
  }

  return new Date(0);
}
