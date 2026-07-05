import {
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineXCircle,
  HiOutlineStar,
} from 'react-icons/hi2';
import Toggle from '../common/Toggle.jsx';

const CategoryGridCard = ({
  category,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
}) => {
  return (
    <div className={`card p-3 ${category.isDeleted ? 'opacity-50' : ''}`}>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
        {category.image?.url && <img src={category.image.url} alt={category.name} className="h-full w-full object-cover" />}
        {category.isFeatured && (
          <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            <HiOutlineStar size={12} /> Featured
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="truncate text-sm font-medium text-ink">{category.name}</p>
        <p className="truncate text-xs text-ink/40">{category.slug}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <Toggle
          checked={category.isActive}
          disabled={category.isDeleted}
          onChange={(value) => onToggleActive(category._id, value)}
          label="Active"
        />
        <Toggle
          checked={category.isFeatured}
          disabled={category.isDeleted}
          onChange={(value) => onToggleFeatured(category._id, value)}
        />
      </div>

      <div className="mt-3 flex items-center justify-end gap-3 border-t border-ink/10 pt-3">
        {category.isDeleted ? (
          <button onClick={() => onRestore(category._id)} className="text-ink/50 hover:text-green-600" title="Restore">
            <HiOutlineArrowUturnLeft size={18} />
          </button>
        ) : (
          <button onClick={() => onEdit(category)} className="text-ink/50 hover:text-primary-600" title="Edit">
            <HiOutlinePencilSquare size={18} />
          </button>
        )}

        {category.isDeleted ? (
          <button
            onClick={() => onPermanentDelete(category._id)}
            className="text-ink/50 hover:text-red-600"
            title="Delete permanently"
          >
            <HiOutlineXCircle size={18} />
          </button>
        ) : (
          <button onClick={() => onDelete(category._id)} className="text-ink/50 hover:text-red-600" title="Delete">
            <HiOutlineTrash size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryGridCard;
