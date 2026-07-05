import { HiOutlineMagnifyingGlass, HiOutlinePlus, HiOutlineSquares2X2, HiOutlineListBullet } from 'react-icons/hi2';
import Button from '../common/Button.jsx';

const CategoryFilters = ({ filters, onFilterChange, view, onViewChange, onAddClick }) => {
  return (
    <div className="card flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
          <input
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search categories…"
            className="input-field pl-9"
          />
        </div>

        <select
          value={filters.isActive}
          onChange={(e) => onFilterChange({ isActive: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <select
          value={filters.isFeatured}
          onChange={(e) => onFilterChange({ isFeatured: e.target.value })}
          className="input-field w-auto"
        >
          <option value="">All Categories</option>
          <option value="true">Featured Only</option>
        </select>

        <select
          value={filters.sort}
          onChange={(e) => onFilterChange({ sort: e.target.value })}
          className="input-field w-auto"
        >
          <option value="displayOrder">Display Order</option>
          <option value="newest">Newest</option>
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

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border border-ink/15 p-1">
          <button
            onClick={() => onViewChange('table')}
            className={`rounded-md p-1.5 ${view === 'table' ? 'bg-primary-50 text-primary-600' : 'text-ink/50'}`}
            aria-label="Table view"
          >
            <HiOutlineListBullet size={18} />
          </button>
          <button
            onClick={() => onViewChange('grid')}
            className={`rounded-md p-1.5 ${view === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-ink/50'}`}
            aria-label="Grid view"
          >
            <HiOutlineSquares2X2 size={18} />
          </button>
        </div>

        <Button onClick={onAddClick}>
          <HiOutlinePlus className="mr-1.5" size={18} />
          Add Category
        </Button>
      </div>
    </div>
  );
};

export default CategoryFilters;
