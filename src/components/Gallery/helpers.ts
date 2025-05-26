// Client-side utility functions for Gallery components

// Utility function to check if an item is new (within 6 months)
export function isNewItem(date?: string): boolean {
  if (!date) return false;
  const itemDate = new Date(date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return itemDate >= sixMonthsAgo;
} 