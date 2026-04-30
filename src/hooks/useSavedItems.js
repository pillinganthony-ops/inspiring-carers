// useSavedItems — Phase 1 localStorage save/favourite system.
// No backend. Persists across sessions via localStorage key "saved_items".
//
// Saved item shape: { id, name, slug, category, county }
//
// Returns: { isSaved(id), toggleSave(venue) }

import { useState } from 'react';

const STORAGE_KEY = 'saved_items';

const readStorage = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const useSavedItems = () => {
  const [savedItems, setSavedItems] = useState(readStorage);

  const isSaved = (id) => savedItems.some((s) => s.id === id);

  const toggleSave = (venue) => {
    setSavedItems((prev) => {
      const next = prev.some((s) => s.id === venue.id)
        ? prev.filter((s) => s.id !== venue.id)
        : [...prev, {
            id:       venue.id,
            name:     venue.name,
            slug:     venue.slug,
            category: venue.category,
            county:   venue.county,
          }];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { isSaved, toggleSave };
};

export default useSavedItems;
