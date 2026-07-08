import { HiOutlineTrash } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const { product, quantity, customizations } = item;
  const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);

  return (
    <div className="flex items-center gap-4 border-b border-charcoal/10 py-5">
      <img src={product.images?.[0]?.url} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />

      <div className="flex-1">
        <p className="text-sm font-medium text-charcoal">{product.name}</p>
        <p className="mt-1 text-sm text-charcoal/60">₹{unitPrice}</p>

        {customizations?.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {customizations.map((customization) => (
              <p key={customization.key} className="text-xs text-charcoal/50">
                {customization.label}:{' '}
                {Array.isArray(customization.value) ? customization.value.join(', ') : String(customization.value)}
              </p>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => updateItem(item._id, quantity - 1)}
            className="h-7 w-7 rounded-full border border-charcoal/20 text-sm hover:bg-charcoal/5"
          >
            -
          </button>
          <span className="w-6 text-center text-sm">{quantity}</span>
          <button
            onClick={() => updateItem(item._id, quantity + 1)}
            className="h-7 w-7 rounded-full border border-charcoal/20 text-sm hover:bg-charcoal/5"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={() => removeItem(item._id)}
        className="text-charcoal/40 transition-colors hover:text-red-600"
        aria-label="Remove item"
      >
        <HiOutlineTrash size={20} />
      </button>
    </div>
  );
};

export default CartItem;
