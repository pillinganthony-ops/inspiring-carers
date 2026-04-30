// CardGrid — standard card grid wrapper.
// Source of truth: Things to Do (Activities.jsx) / PlacesToVisit / WellbeingSupport / Events (May 2026).
// Handles layout only; all data and card rendering remain in the parent.
//
// Props:
//   layout        'grid' | 'list'   — grid uses auto-fill minmax(280px,1fr); list uses 1fr
//   children                        — card nodes
//   marginBottom  number            — optional CSS marginBottom on the wrapper
//   emptyState    node              — rendered when children is empty (optional)

import React from 'react';

const CardGrid = ({
  layout       = 'grid',
  children,
  marginBottom,
  emptyState,
}) => {
  if (!children || React.Children.count(children) === 0) {
    return emptyState ?? null;
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: layout === 'grid'
        ? 'repeat(auto-fill, minmax(280px, 1fr))'
        : '1fr',
      gap: 14,
      ...(marginBottom != null ? { marginBottom } : {}),
    }}>
      {children}
    </div>
  );
};

export default CardGrid;
