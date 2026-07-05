import { useState } from 'react';
import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineBars3,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Toggle from '../common/Toggle.jsx';

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

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table-base">
        <thead>
          <tr>
            {canReorder && <th className="w-8"></th>}
            <th>Category</th>
            <th>Parent</th>
            <th>Level</th>
            <th>Active</th>
            <th>Featured</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category, index) => (
            <tr
              key={category._id}
              draggable={canReorder && !category.isDeleted}
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={category.isDeleted ? 'opacity-50' : ''}
            >
              {canReorder && (
                <td className="cursor-grab text-ink/30">
                  <HiOutlineBars3 size={16} />
                </td>
              )}
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-surface">
                    {category.image?.url && (
                      <img src={category.image.url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-xs text-ink/40">{category.slug}</p>
                  </div>
                </div>
              </td>
              <td>{category.parentCategory?.name || '—'}</td>
              <td>{category.level}</td>
              <td>
                <Toggle
                  checked={category.isActive}
                  disabled={category.isDeleted}
                  onChange={(value) => onToggleActive(category._id, value)}
                />
              </td>
              <td>
                <Toggle
                  checked={category.isFeatured}
                  disabled={category.isDeleted}
                  onChange={(value) => onToggleFeatured(category._id, value)}
                />
              </td>
              <td>{category.displayOrder}</td>
              <td>
                <div className="flex items-center gap-3">
                  {category.isDeleted ? (
                    <button
                      onClick={() => onRestore(category._id)}
                      className="text-ink/50 hover:text-green-600"
                      aria-label="Restore category"
                      title="Restore"
                    >
                      <HiOutlineArrowUturnLeft size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onEdit(category)}
                      className="text-ink/50 hover:text-primary-600"
                      aria-label="Edit category"
                      title="Edit"
                    >
                      <HiOutlinePencilSquare size={18} />
                    </button>
                  )}

                  {category.isDeleted ? (
                    <button
                      onClick={() => onPermanentDelete(category._id)}
                      className="text-ink/50 hover:text-red-600"
                      aria-label="Permanently delete category"
                      title="Delete permanently"
                    >
                      <HiOutlineXCircle size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={() => onDelete(category._id)}
                      className="text-ink/50 hover:text-red-600"
                      aria-label="Delete category"
                      title="Delete"
                    >
                      <HiOutlineTrash size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryTable;
