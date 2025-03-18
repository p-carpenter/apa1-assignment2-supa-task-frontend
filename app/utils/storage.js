/**
 * Enhanced storage utilities with error handling
 * Provides a consistent API for working with localStorage/sessionStorage
 */

// Safely test storage availability
const isStorageAvailable = (type) => {
  try {
    const storage = window[type];
    const testKey = `__storage_test__${Math.random()}`;
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return (
      e instanceof DOMException &&
      // everything except Firefox
      (e.code === 22 ||
        // Firefox
        e.code === 1014 ||
        // test name field too, because code might not be present
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      window[type] && window[type].length !== 0
    );
  }
};

// Check storage availability on initialization
const hasLocalStorage = typeof window !== 'undefined' && isStorageAvailable('localStorage');
const hasSessionStorage = typeof window !== 'undefined' && isStorageAvailable('sessionStorage');

// Storage manager for local and session storage
const createStorageManager = (storageType) => {
  // Use memory cache when actual storage is unavailable
  const memoryCache = new Map();
  const isAvailable = storageType === 'localStorage' ? hasLocalStorage : hasSessionStorage;
  
  const getStorage = () => window[storageType];
  
  return {
    /**
     * Get an item from storage with proper error handling
     * 
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist or on error
     * @returns {any} Parsed value or defaultValue
     */
    getItem: (key, defaultValue = null) => {
      if (!key) {
        console.error('Storage key is required');
        return defaultValue;
      }
      
      try {
        if (!isAvailable) {
          return memoryCache.has(key) ? memoryCache.get(key) : defaultValue;
        }
        
        const value = getStorage().getItem(key);
        
        if (value === null) {
          return defaultValue;
        }
        
        try {
          // Try to parse as JSON
          return JSON.parse(value);
        } catch (parseError) {
          // If parsing fails, return raw value
          return value;
        }
      } catch (error) {
        console.error(`Error getting ${key} from ${storageType}:`, error);
        return defaultValue;
      }
    },
    
    /**
     * Set an item in storage with proper error handling
     * 
     * @param {string} key - Storage key
     * @param {any} value - Value to store (objects will be stringified)
     * @returns {boolean} Success status
     */
    setItem: (key, value) => {
      if (!key) {
        console.error('Storage key is required');
        return false;
      }
      
      try {
        // Handle undefined
        if (value === undefined) {
          value = null;
        }
        
        // Convert objects/arrays to JSON strings
        const valueToStore = typeof value === 'object' && value !== null 
          ? JSON.stringify(value) 
          : String(value);
        
        if (!isAvailable) {
          memoryCache.set(key, value);
          return true;
        }
        
        getStorage().setItem(key, valueToStore);
        return true;
      } catch (error) {
        // Handle quota exceeded errors
        if (error.name === 'QuotaExceededError' || error.code === 22) {
          console.error(`Storage quota exceeded for ${storageType}`);
          
          // Fall back to memory cache
          memoryCache.set(key, value);
          return true;
        }
        
        console.error(`Error setting ${key} in ${storageType}:`, error);
        return false;
      }
    },
    
    /**
     * Remove an item from storage with proper error handling
     * 
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    removeItem: (key) => {
      if (!key) {
        console.error('Storage key is required');
        return false;
      }
      
      try {
        if (!isAvailable) {
          memoryCache.delete(key);
          return true;
        }
        
        getStorage().removeItem(key);
        return true;
      } catch (error) {
        console.error(`Error removing ${key} from ${storageType}:`, error);
        return false;
      }
    },
    
    /**
     * Clear all items from storage with proper error handling
     * 
     * @returns {boolean} Success status
     */
    clear: () => {
      try {
        if (!isAvailable) {
          memoryCache.clear();
          return true;
        }
        
        getStorage().clear();
        return true;
      } catch (error) {
        console.error(`Error clearing ${storageType}:`, error);
        return false;
      }
    },
    
    /**
     * Get all keys from storage with proper error handling
     * 
     * @returns {Array} Array of storage keys
     */
    keys: () => {
      try {
        if (!isAvailable) {
          return Array.from(memoryCache.keys());
        }
        
        return Object.keys(getStorage());
      } catch (error) {
        console.error(`Error getting keys from ${storageType}:`, error);
        return [];
      }
    },
    
    /**
     * Check if a key exists in storage
     * 
     * @param {string} key - Storage key
     * @returns {boolean} Whether the key exists
     */
    hasKey: (key) => {
      if (!key) return false;
      
      try {
        if (!isAvailable) {
          return memoryCache.has(key);
        }
        
        return getStorage().getItem(key) !== null;
      } catch (error) {
        console.error(`Error checking if ${key} exists in ${storageType}:`, error);
        return false;
      }
    },
    
    /**
     * Check if storage is available
     * 
     * @returns {boolean} Whether storage is available
     */
    isAvailable: () => isAvailable
  };
};

// Export storage managers
export const localStorage = createStorageManager('localStorage');
export const sessionStorage = createStorageManager('sessionStorage');

// Default export for convenience
export default {
  local: localStorage,
  session: sessionStorage
};
