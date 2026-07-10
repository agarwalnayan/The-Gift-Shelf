import { useEffect, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
  { label: 'Top Rated', value: 'rating' },
];

/**
 * Customer-facing discovery bar built entirely on top of the existing
 * `getAllProducts` query params (search, occasion, recipient, minPrice,
 * maxPrice, featured, sort). No new backend capability is introduced here -
 * occasion/recipient are free-text fields on the Product schema, so they are
 * exposed as plain text inputs rather than a picklist (there is no endpoint
 * that lists distinct values).
 */
const ProductDiscoveryFilters = ({ filters, categories, onChange, onClear, hasActiveFilters }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [occasionDraft, setOccasionDraft] = useState(filters.occasion);
  const [recipientDraft, setRecipientDraft] = useState(filters.recipient);
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice);
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice);

  // Keep local drafts in sync if filters change externally (e.g. "Clear filters").
  useEffect(() => setSearchDraft(filters.search), [filters.search]);
  useEffect(() => setOccasionDraft(filters.occasion), [filters.occasion]);
  useEffect(() => setRecipientDraft(filters.recipient), [filters.recipient]);
  useEffect(() => setMinPriceDraft(filters.minPrice), [filters.minPrice]);
  useEffect(() => setMaxPriceDraft(filters.maxPrice), [filters.maxPrice]);

  const submitSearch = (event) => {
    event.preventDefault();
    onChange({ search: searchDraft.trim() });
  };

  const submitMoreFilters = (event) => {
    event.preventDefault();
    onChange({
      occasion: occasionDraft.trim(),
      recipient: recipientDraft.trim(),
      minPrice: minPriceDraft,
      maxPrice: maxPriceDraft,
    });
    setIsMoreOpen(false);
  };

  return (
    <div className="mb-8 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submitSearch} className="relative min-w-[220px] flex-1">
          <HiOutlineMagnifyingGlass
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
            size={18}
          />
          <input
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Search for gifts…"
            className="input-field pl-9"
          />
        </form>

        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select value={filters.sort} onChange={(event) => onChange({ sort: event.target.value })} className="input-field w-auto">
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 whitespace-nowrap text-sm text-charcoal/70">
          <input
            type="checkbox"
            checked={filters.featured === 'true'}
            onChange={(event) => onChange({ featured: event.target.checked ? 'true' : '' })}
          />
          Featured only
        </label>

        <button
          type="button"
          onClick={() => setIsMoreOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded-full border border-charcoal/15 px-3 py-2 text-sm font-medium text-charcoal/70 transition-colors hover:border-primary-300 hover:text-primary-600"
        >
          <HiOutlineAdjustmentsHorizontal size={16} />
          Occasion, Recipient &amp; Price
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 text-sm font-medium text-charcoal/50 hover:text-red-600"
          >
            <HiOutlineXMark size={16} />
            Clear filters
          </button>
        )}
      </div>

      {isMoreOpen && (
        <form onSubmit={submitMoreFilters} className="flex flex-wrap items-end gap-3 rounded-2xl bg-primary-50/60 p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Occasion</label>
            <input
              value={occasionDraft}
              onChange={(event) => setOccasionDraft(event.target.value)}
              placeholder="e.g. Birthday"
              className="input-field w-40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Recipient</label>
            <input
              value={recipientDraft}
              onChange={(event) => setRecipientDraft(event.target.value)}
              placeholder="e.g. Him, Her, Kids"
              className="input-field w-40"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Min Price (₹)</label>
            <input
              type="number"
              min={0}
              value={minPriceDraft}
              onChange={(event) => setMinPriceDraft(event.target.value)}
              className="input-field w-28"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Max Price (₹)</label>
            <input
              type="number"
              min={0}
              value={maxPriceDraft}
              onChange={(event) => setMaxPriceDraft(event.target.value)}
              className="input-field w-28"
            />
          </div>
          <button type="submit" className="btn-primary px-4 py-2.5">
            Apply
          </button>
        </form>
      )}
    </div>
  );
};

export default ProductDiscoveryFilters;
