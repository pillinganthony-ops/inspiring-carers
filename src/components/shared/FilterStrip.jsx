// FilterStrip — reusable vertical filter sidebar card.
// Source of truth: Activities.jsx filter sidebar (May 2026).
// Handles layout only; all state and handlers are owned by the parent.
//
// Props:
//   search             string    — controlled search value
//   onSearchChange     function  — (e) → setSearch(e.target.value)
//   searchPlaceholder  string    — default 'Name or town…'
//
//   categorySection    node      — pre-built category buttons rendered by parent
//                                  (pass null/undefined to omit the Category section)
//
//   subcatVisible      boolean   — show/hide the Subcategory select
//   subcatOptions      string[]  — subcategory option values
//   subcat             string    — current subcategory value
//   onSubcatChange     function  — (e) → setFilterSubcat(e.target.value)
//
//   price              string    — current price filter value
//   onPriceChange      function  — (e) → setFilterPrice(e.target.value)
//
//   settingVisible     boolean   — show/hide the Setting (indoor/outdoor) select
//   setting            string    — current setting value
//   onSettingChange    function  — (e) → setFilterInOut(e.target.value)
//
//   suitability        { label, active, onToggle, color }[]
//                               — toggle chip rows; onToggle receives next boolean
//
//   anyFilter          boolean   — whether any filter is currently active (shows Clear)
//   onClear            function  — clears all filters

import React from 'react';
import Icons from '../Icons.jsx';

const { ISearch } = Icons;

const iStyle = {
  padding: '10px 14px', borderRadius: 12,
  border: '1px solid #DDE5F0',
  background: '#F8FAFD',
  fontSize: 13.5, color: '#1A2744',
  fontFamily: 'Inter, sans-serif', flex: '1 1 140px', minWidth: 0,
  cursor: 'pointer', appearance: 'auto',
  boxShadow: '0 1px 3px rgba(26,39,68,0.05)',
};

const sLabel = {
  fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.09em', color: 'rgba(26,39,68,0.38)', marginBottom: 10,
};

const FilterStrip = ({
  search            = '',
  onSearchChange,
  searchPlaceholder = 'Name or town…',
  categorySection,
  subcatVisible     = false,
  subcatOptions     = [],
  subcat            = '',
  onSubcatChange,
  price             = '',
  onPriceChange,
  settingVisible    = false,
  setting           = '',
  onSettingChange,
  suitability       = [],
  anyFilter         = false,
  onClear,
}) => (
  <div className="card" style={{ padding: '18px 16px', borderRadius: 16 }}>

    {/* Search */}
    <div style={{ marginBottom: 20 }}>
      <div style={sLabel}>Search</div>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          style={{ ...iStyle, width: '100%', boxSizing: 'border-box', paddingLeft: 30 }}
        />
        <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,39,68,0.38)', display: 'flex', pointerEvents: 'none' }}>
          <ISearch s={12} />
        </span>
      </div>
    </div>

    {/* Category — rendered by parent */}
    {categorySection && (
      <div style={{ marginBottom: 20 }}>
        <div style={sLabel}>Category</div>
        {categorySection}
      </div>
    )}

    {/* Subcategory — venue categories only */}
    {subcatVisible && subcatOptions.length > 0 && (
      <div style={{ marginBottom: 20 }}>
        <div style={sLabel}>Type</div>
        <select value={subcat} onChange={onSubcatChange} style={{ ...iStyle, width: '100%' }}>
          <option value="">All types</option>
          {subcatOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    )}

    {/* Price */}
    <div style={{ marginBottom: 20 }}>
      <div style={sLabel}>Price</div>
      <select value={price} onChange={onPriceChange} style={{ ...iStyle, width: '100%' }}>
        <option value="">Any price</option>
        <option value="Free">Free</option>
        <option value="Paid">Paid</option>
        <option value="Mixed">Mixed</option>
      </select>
    </div>

    {/* Setting — venue categories only */}
    {settingVisible && (
      <div style={{ marginBottom: 20 }}>
        <div style={sLabel}>Setting</div>
        <select value={setting} onChange={onSettingChange} style={{ ...iStyle, width: '100%' }}>
          <option value="">Indoor or outdoor</option>
          <option value="Indoor">Indoor</option>
          <option value="Outdoor">Outdoor</option>
          <option value="Both">Both</option>
        </select>
      </div>
    )}

    {/* Suitability toggles */}
    {suitability.length > 0 && (
      <div style={{ marginBottom: 14 }}>
        <div style={sLabel}>Suitability</div>
        {suitability.map(({ label, active, onToggle, color }) => (
          <button
            key={label}
            onClick={() => onToggle(!active)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 9, marginBottom: 5, border: active ? `1.5px solid ${color}` : '1px solid #EEF1F7', background: active ? `${color}10` : 'transparent', color: active ? color : 'rgba(26,39,68,0.65)', fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all .13s' }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 4, border: active ? `1.5px solid ${color}` : '1.5px solid rgba(26,39,68,0.22)', background: active ? color : 'transparent', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              {active && <span style={{ fontSize: 9, color: 'white', fontWeight: 900, lineHeight: 1 }}>✓</span>}
            </span>
            {label}
          </button>
        ))}
      </div>
    )}

    {/* Clear all */}
    {anyFilter && (
      <button
        onClick={onClear}
        style={{ fontSize: 12, fontWeight: 600, color: 'rgba(26,39,68,0.45)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', width: '100%', textAlign: 'center' }}
      >
        Clear all filters
      </button>
    )}

  </div>
);

export default FilterStrip;
