/**
 * Date formatting utilities with improved error handling
 */

/**
 * Formats a date string to display format (DD-MM-YYYY)
 * 
 * @param {string|Date} date - Date to format (YYYY-MM-DD string or Date object)
 * @param {string} [separator='-'] - Separator to use in formatted date
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForDisplay = (date, separator = '-') => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Handle different date string formats
      if (date.includes('T')) {
        // ISO format with time
        dateObj = new Date(date);
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format
        const [year, month, day] = date.split('-');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // DD-MM-YYYY format (already in display format)
        return date;
      } else {
        // Try standard date parsing
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date string provided: ${date}`);
        return '';
      }
    } else {
      console.warn(`Unsupported date format: ${typeof date}`);
      return '';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return [day, month, year].join(separator);
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Formats a date string for storage (YYYY-MM-DD)
 * 
 * @param {string|Date} date - Date to format (DD-MM-YYYY string or Date object)
 * @param {string} [separator='-'] - Separator to use in formatted date
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDateForStorage = (date, separator = '-') => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      // Handle different date string formats
      if (date.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // DD-MM-YYYY format
        const [day, month, year] = date.split('-');
        dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format (already in storage format)
        return date; 
      } else if (date.includes('T')) {
        // ISO format with time
        dateObj = new Date(date);
      } else {
        // Try standard date parsing
        dateObj = new Date(date);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn(`Invalid date string provided: ${date}`);
        return '';
      }
    } else {
      console.warn(`Unsupported date format: ${typeof date}`);
      return '';
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return [year, month, day].join(separator);
  } catch (error) {
    console.error('Error formatting date for storage:', error);
    return '';
  }
};

/**
 * Parses a date string into a Date object
 * 
 * @param {string} dateString - Date string to parse
 * @returns {Date|null} Parsed Date object or null if invalid
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Handle different date string formats
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      // DD-MM-YYYY format
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid DD-MM-YYYY date string: ${dateString}`);
        return null;
      }
      
      return date;
    } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // YYYY-MM-DD format
      const [year, month, day] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid YYYY-MM-DD date string: ${dateString}`);
        return null;
      }
      
      return date;
    } else {
      // Try standard date parsing
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Unsupported date format: ${dateString}`);
        return null;
      }
      
      return date;
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};

/**
 * Formats a date input with automatic hyphen insertion
 * 
 * @param {string} input - Raw input from date field
 * @returns {string} Formatted date input with hyphens
 */
export const formatDateInput = (input) => {
  if (!input) return '';
  
  try {
    // Remove all non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format based on number of digits
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return `${digits.substring(0, 2)}-${digits.substring(2)}`;
    } else {
      return `${digits.substring(0, 2)}-${digits.substring(2, 4)}-${digits.substring(4, 8)}`;
    }
  } catch (error) {
    console.error('Error formatting date input:', error);
    return input; // Return original input on error
  }
};

/**
 * Get the current date in display format (DD-MM-YYYY)
 * 
 * @param {string} [separator='-'] - Separator to use in formatted date
 * @returns {string} Current date in display format
 */
export const getCurrentDate = (separator = '-') => {
  try {
    const now = new Date();
    return formatDateForDisplay(now, separator);
  } catch (error) {
    console.error('Error getting current date:', error);
    return '';
  }
};
