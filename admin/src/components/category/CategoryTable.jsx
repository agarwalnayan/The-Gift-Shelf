import { useState } from 'react';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineBars3,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Toggle from '../common/Toggle.jsx';
import TableCard from '../common/TableCard.jsx';

const CategoryTable = ({
  categories,
  canReorder,
  onReorder,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  const [dragIndex, setDragIndex] = useState(null);

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;

    const reordered = [...categories];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);

    onReorder(
      reordered.map((category, index) => ({
        id: category._id,
        displayOrder: index,
      }))
    );
    setDragIndex(null);
  };

  const categoryColumns = [
    { header: 'Category', width: '200px' },
    { header: 'Parent', width: '120px' },
    { header: 'Level', width: '64px' },
    { header: 'Active', width: '80px' },
    { header: 'Featured', width: '80px' },
    { header: 'Order', width: '64px' },
    { header: '', width: '128px' },
  ];

  const renderCategoryRow = (category) => [
    <td key="category">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface">
          {category.image?.url && (
            <img src={category.image.url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium truncate">{category.name}</p>
          <p className="text-xs text-ink/40 truncate">{category.slug}</p>
        </div>
      </div>
    </td>,
    <td key="parent" className="truncate">{category.parentCategory?.name || '—'}</td>,
    <td key="level">{category.level}</td>,
    <td key="active">
      <Toggle
        checked={category.isActive}
        disabled={category.isDeleted}
        onChange={(value) => onToggleActive(category._id, value)}
      />
    </td>,
    <td key="featured">
      <Toggle
        checked={category.isFeatured}
        disabled={category.isDeleted}
        onChange={(value) => onToggleFeatured(category._id, value)}
      />
    </td>,
    <td key="order">{category.displayOrder}</td>,
    <td key="actions">
      <div className="flex items-center gap-2">
        {category.isDeleted ? (
          <button
            onClick={() => onRestore(category._id)}
            className="p-1.5 text-ink/50 hover:text-green-600 rounded hover:bg-green-50"
            aria-label="Restore category"
            title="Restore"
          >
            <HiOutlineArrowUturnLeft size={18} />
          </button>
        ) : (
          <button
            onClick={() => onEdit(category)}
            className="p-1.5 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
            aria-label="Edit category"
            title="Edit"
          >
            <HiOutlinePencilSquare size={18} />
          </button>
        )}

        {category.isDeleted ? (
          <button
            onClick={() => onPermanentDelete(category._id)}
            className="p-1.5 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
            aria-label="Permanently delete category"
            title="Delete permanently"
          >
            <HiOutlineXCircle size={18} />
          </button>
        ) : (
          <button
            onClick={() => onDelete(category._id)}
            className="p-1.5 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
            aria-label="Delete category"
            title="Delete"
          >
            <HiOutlineTrash size={18} />
          </button>
        )}
      </div>
    </td>,
  ];

  const renderCategoryCard = (category) => (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface">
          {category.image?.url && (
            <img src={category.image.url} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink truncate">{category.name}</p>
          <p className="text-sm text-ink/60">{category.slug}</p>
          <p className="text-sm text-ink/50 mt-1">Level: {category.level}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Parent</span>
          <p className="text-sm text-ink mt-1">{category.parentCategory?.name || '—'}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-ink/50 uppercase tracking-wide">Order</span>
          <p className="text-sm text-ink mt-1">{category.displayOrder}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 pt-2 border-t border-ink/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/50">Active</span>
            <Toggle
              checked={category.isActive}
              disabled={category.isDeleted}
              onChange={(value) => onToggleActive(category._id, value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink/50">Featured</span>
            <Toggle
              checked={category.isFeatured}
              disabled={category.isDeleted}
              onChange={(value) => onToggleFeatured(category._id, value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {category.isDeleted ? (
            <button
              onClick={() => onRestore(category._id)}
              className="p-2 text-ink/50 hover:text-green-600 rounded hover:bg-green-50"
              aria-label="Restore category"
              title="Restore"
            >
              <HiOutlineArrowUturnLeft size={18} />
            </button>
          ) : (
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-ink/50 hover:text-primary-600 rounded hover:bg-primary-50"
              aria-label="Edit category"
              title="Edit"
            >
              <HiOutlinePencilSquare size={18} />
            </button>
          )}
          {category.isDeleted ? (
            <button
              onClick={() => onPermanentDelete(category._id)}
              className="p-2 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
              aria-label="Permanently delete category"
              title="Delete permanently"
            >
              <HiOutlineXCircle size={18} />
            </button>
          ) : (
            <button
              onClick={() => onDelete(category._id)}
              className="p-2 text-ink/50 hover:text-red-600 rounded hover:bg-red-50"
              aria-label="Delete category"
              title="Delete"
            >
              <HiOutlineTrash size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TableCard
      columns={categoryColumns}
      data={categories}
      renderRow={renderCategoryRow}
      renderCard={renderCategoryCard}
    />
  );
};

export default CategoryTable;
