import { useState } from 'react';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlineBars3 } from 'react-icons/hi2';
import Toggle from '../common/Toggle.jsx';

/**
 * Generic drag-to-reorder admin table reused across every marketing list
 * (Hero Banners, Promo Banners, Featured Recipients, Featured Occasions).
 * Mirrors the drag/drop + toggle/edit/delete pattern from CategoryTable so
 * the admin UX stays consistent, without duplicating that table 4x.
 */
const MarketingListTable = ({ items, titleKey = 'title', onReorder, onToggleActive, onEdit, onDelete, emptyLabel }) => {
  const [dragIndex, setDragIndex] = useState(null);

  const handleDrop = (dropIndex) => {
    if (dragIndex === null || dragIndex === dropIndex) return;
    const reordered = [...items];
    const [dragged] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, dragged);
    onReorder(reordered.map((item, index) => ({ id: item._id, displayOrder: index })));
    setDragIndex(null);
  };

  if (items.length === 0) {
    return <div className="card p-8 text-center text-sm text-ink/50">{emptyLabel || 'Nothing here yet.'}</div>;
  }

  return (
    <div className="card overflow-x-auto p-0">
      <table className="table-base">
        <thead>
          <tr>
            <th className="w-8"></th>
            <th>Item</th>
            <th>Active</th>
            <th>Order</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={item._id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
            >
              <td className="cursor-grab text-ink/30">
                <HiOutlineBars3 size={16} />
              </td>
              <td>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg bg-surface">
                    {item.image?.url && <img src={item.image.url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-medium">{item[titleKey] || item.name || 'Untitled'}</p>
                    {item.value && <p className="text-xs text-ink/40">{item.value}</p>}
                    {item.ctaLink && <p className="text-xs text-ink/40">{item.ctaLink}</p>}
                  </div>
                </div>
              </td>
              <td>
                <Toggle checked={item.isActive} onChange={(value) => onToggleActive(item._id, value)} />
              </td>
              <td>{item.displayOrder}</td>
              <td>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onEdit(item)}
                    className="text-ink/50 hover:text-primary-600"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <HiOutlinePencilSquare size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(item._id)}
                    className="text-ink/50 hover:text-red-600"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketingListTable;
