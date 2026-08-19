import { useEffect, useState } from 'react';
import { HiOutlineMagnifyingGlass, HiOutlineXMark, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { useMarketing } from '../../context/MarketingContext.jsx';

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
  { label: 'Top Rated', value: 'rating' },
];

const ProductDiscoveryFilters = ({
  filters,
  categories = [],
  onChange,
  onClear,
  hasActiveFilters,
  showCategoryFilter = true,
}) => {
  const { featuredOccasions = [], featuredRecipients = [] } = useMarketing();
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [minPriceDraft, setMinPriceDraft] = useState(filters.minPrice);
  const [maxPriceDraft, setMaxPriceDraft] = useState(filters.maxPrice);

  useEffect(() => setSearchDraft(filters.search), [filters.search]);
  useEffect(() => setMinPriceDraft(filters.minPrice), [filters.minPrice]);
  useEffect(() => setMaxPriceDraft(filters.maxPrice), [filters.maxPrice]);

  const submitSearch = (event) => {
    event.preventDefault();
    onChange({ search: searchDraft.trim() });
  };

  const submitPriceFilters = (event) => {
    event.preventDefault();
    onChange({ minPrice: minPriceDraft, maxPrice: maxPriceDraft });
    setIsPriceOpen(false);
  };

  const activeChips = [
    filters.featured === 'true' && { key: 'featured', label: 'Staff picks', clear: { featured: '' } },
    filters.occasion && {
      key: 'occasion',
      label: featuredOccasions.find((o) => o.slug === filters.occasion)?.name || filters.occasion,
      clear: { occasion: '' },
    },
    filters.recipient && {
      key: 'recipient',
      label: featuredRecipients.find((r) => r.slug === filters.recipient)?.name || filters.recipient,
      clear: { recipient: '' },
    },
    filters.category && {
      key: 'category',
      label: categories.find((c) => c._id === filters.category)?.name || 'Category',
      clear: { category: '' },
    },
    filters.search && { key: 'search', label: `"${filters.search}"`, clear: { search: '' } },
    (filters.minPrice || filters.maxPrice) && {
      key: 'price',
      label: filters.minPrice && filters.maxPrice
        ? `₹${filters.minPrice} – ₹${filters.maxPrice}`
        : filters.minPrice
          ? `From ₹${filters.minPrice}`
          : `Up to ₹${filters.maxPrice}`,
      clear: { minPrice: '', maxPrice: '' },
    },
  ].filter(Boolean);

  return (
    <div className="mb-8 space-y-3">
      <form onSubmit={submitSearch} className="relative">
        <HiOutlineMagnifyingGlass
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40"
          size={18}
        />
        <input
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          placeholder="Search for gifts…"
          className="input-field w-full pl-9"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {showCategoryFilter && (
          <select
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="input-field min-w-0 flex-1 sm:w-auto sm:flex-none"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        )}

        {featuredOccasions.length > 0 && (
          <select
            value={filters.occasion}
            onChange={(event) => onChange({ occasion: event.target.value })}
            className="input-field min-w-0 flex-1 sm:w-auto sm:flex-none"
          >
            <option value="">All Occasions</option>
            {featuredOccasions.map((occasion) => (
              <option key={occasion._id} value={occasion.slug}>
                {occasion.name}
              </option>
            ))}
          </select>
        )}

        {featuredRecipients.length > 0 && (
          <select
            value={filters.recipient}
            onChange={(event) => onChange({ recipient: event.target.value })}
            className="input-field min-w-0 flex-1 sm:w-auto sm:flex-none"
          >
            <option value="">All Recipients</option>
            {featuredRecipients.map((recipient) => (
              <option key={recipient._id} value={recipient.slug}>
                {recipient.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filters.sort}
          onChange={(event) => onChange({ sort: event.target.value })}
          className="input-field min-w-0 flex-1 sm:w-auto sm:flex-none"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setIsPriceOpen((open) => !open)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
            filters.minPrice || filters.maxPrice
              ? 'border-primary-300 bg-primary-50 text-primary-700'
              : 'border-charcoal/15 text-charcoal/70 hover:border-primary-300 hover:text-primary-600'
          }`}
        >
          <HiOutlineAdjustmentsHorizontal size={16} />
          <span className="hidden sm:inline">Price</span>
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-charcoal/50 hover:text-red-600"
          >
            <HiOutlineXMark size={16} />
            Clear all
          </button>
        )}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onChange(chip.clear)}
              className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
            >
              {chip.label}
              <HiOutlineXMark size={12} />
            </button>
          ))}
        </div>
      )}

      {isPriceOpen && (
        <form
          onSubmit={submitPriceFilters}
          className="flex flex-wrap items-end gap-3 rounded-2xl border border-charcoal/10 bg-primary-50/60 p-4"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Min (₹)</label>
            <input
              type="number"
              min={0}
              value={minPriceDraft}
              onChange={(event) => setMinPriceDraft(event.target.value)}
              className="input-field w-28"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal/60">Max (₹)</label>
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
