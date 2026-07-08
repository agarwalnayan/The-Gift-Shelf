import { Link } from 'react-router-dom';
import { HiOutlineMagnifyingGlass, HiOutlinePlus } from 'react-icons/hi2';
import Button from '../common/Button.jsx';

const ProductFilters = ({ filters, onFilterChange, categories }) => {
  return (
    <div className="card flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search products…"
            className="input-field pl-9"
          />
        </div>

        <select value={filters.category} onChange={(e) => onFilterChange({ category: e.target.value })} className="input-field w-auto">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select value={filters.isActive} onChange={(e) => onFilterChange({ isActive: e.target.value })} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select value={filters.publishStatus} onChange={(e) => onFilterChange({ publishStatus: e.target.value })} className="input-field w-auto">
          <option value="">Draft &amp; Published</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <select value={filters.isFeatured} onChange={(e) => onFilterChange({ isFeatured: e.target.value })} className="input-field w-auto">
          <option value="">All Products</option>
          <option value="true">Featured Only</option>
        </select>

        <select value={filters.sort} onChange={(e) => onFilterChange({ sort: e.target.value })} className="input-field w-auto">
          <option value="newest">Newest</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="nameAsc">Name: A-Z</option>
          <option value="nameDesc">Name: Z-A</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={filters.includeDeleted}
            onChange={(e) => onFilterChange({ includeDeleted: e.target.checked })}
          />
          Show Deleted
        </label>
      </div>

      <Link to="/products/new">
        <Button>
          <HiOutlinePlus className="mr-1.5" size={18} />
          Add Product
        </Button>
      </Link>
    </div>
  );
};

export default ProductFilters;
