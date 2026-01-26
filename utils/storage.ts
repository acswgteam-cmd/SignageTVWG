import { SignageData } from '../types';

const STORAGE_KEY = 'signage_list_v2';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const getSignages = (): SignageData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    let parsed: any[] = JSON.parse(stored);
    
    // Validation and Fix pass
    let hasChanges = false;
    const now = Date.now();
    
    // Filter valid objects and assign IDs if missing
    let validItems: SignageData[] = parsed.filter(item => item && typeof item === 'object').map(item => {
        if (!item.id) {
            hasChanges = true;
            return { ...item, id: 'fix_' + Date.now().toString(36) + Math.random().toString(36).substring(2) };
        }
        return item as SignageData;
    });

    // Filter by time
    const initialCount = validItems.length;
    validItems = validItems.filter(item => {
      const created = item.createdAt || now; 
      return (now - created) < SEVEN_DAYS_MS;
    });
    
    if (validItems.length !== initialCount) {
        hasChanges = true;
    }
    
    // Save back if we fixed IDs or cleaned up old items
    if (hasChanges) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validItems));
    }
    
    // Sort by newest first
    return validItems.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error("Storage error", e);
    // If corruption, reset
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

export const saveSignage = (data: Omit<SignageData, 'id' | 'createdAt'>): SignageData => {
  const currentList = getSignages();
  
  // Create a robust unique ID
  const uniqueId = 'id_' + Date.now().toString(36) + Math.random().toString(36).substring(2);

  const newItem: SignageData = {
    ...data,
    id: uniqueId,
    createdAt: Date.now(),
  };
  
  const newList = [newItem, ...currentList];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  return newItem;
};

export const deleteSignage = (id: string) => {
  const currentList = getSignages();
  // Ensure we compare strings
  const newList = currentList.filter(item => String(item.id) !== String(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
};