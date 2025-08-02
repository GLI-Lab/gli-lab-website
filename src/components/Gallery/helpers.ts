// Client-side utility functions for Gallery components

// Utility function to check if an item is new (within 6 months)
export function isNewItem(date?: string): boolean {
  if (!date) return false;
  
  // Handle date ranges - use the start date for "new" calculation
  const startDate = getStartDateFromRange(date);
  const itemDate = new Date(startDate);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return itemDate >= sixMonthsAgo;
}

// Helper function to extract start date from a date range
export function getStartDateFromRange(dateRange?: string): string {
  if (!dateRange) return '';
  
  // Check if it's a date range (contains "~")
  if (dateRange.includes('~')) {
    const parts = dateRange.split('~').map(part => part.trim());
    return parts[0]; // Return the start date
  }
  
  // If it's a single date, return as is
  return dateRange;
}

// Helper function to format date for display
export function formatDateForDisplay(date?: string): string {
  if (!date) return '';
  
  // Check if it's a date range
  if (date.includes('~')) {
    const parts = date.split('~').map(part => part.trim());
    if (parts.length === 2) {
      const startDate = new Date(parts[0]);
      const endDate = new Date(parts[1]);
      
      // Check if both dates are valid
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        return `${parts[0]} ~ ${parts[1]}`;
      }
    }
    // If parsing fails, return the original string
    return date;
  }
  
  // Single date - format as Korean locale
  const dateObj = new Date(date);
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString('ko-KR');
  }
  
  return date;
}

// Helper function to get sortable date (for sorting purposes)
export function getSortableDate(date?: string): Date {
  if (!date) return new Date(0); // Very old date for items without date
  
  const startDate = getStartDateFromRange(date);
  const dateObj = new Date(startDate);
  
  if (!isNaN(dateObj.getTime())) {
    return dateObj;
  }
  
  return new Date(0); // Fallback for invalid dates
} 