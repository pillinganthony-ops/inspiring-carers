// useRecentlyViewed — Phase 1 passive view-history tracker.
// No backend. Persists via localStorage key "recently_viewed".
//
// Item shape: { id, name, slug, category, county, viewed_at }
// Max 20 items. Viewing an existing item moves it to the front.
//
// Returns: { recentlyViewed, addRecentlyViewed(venue), clearRecentlyViewed() }

import { useState } from 'react';

const STORAGE_KEY = 'recently_viewed';
const MAX_ITEMS   = 20;

const readStorage = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
};

const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState(readStorage);

  const addRecentlyViewed = (venue) => {
    setRecentlyViewed((prev) => {
      const next = [
        {
          id:        venue.id,
          name:      venue.name,
          slug:      venue.slug,
          category:  venue.category,
          county:    venue.county,
          viewed_at: new Date().toISOString(),
        },
        // Remove any existing entry for this venue (deduplication)
        ...prev.filter((v) => v.id !== venue.id),
      ].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewed([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  return { recentlyViewed, addRecentlyViewed, clearRecentlyViewed };
};

export default useRecentlyViewed;
