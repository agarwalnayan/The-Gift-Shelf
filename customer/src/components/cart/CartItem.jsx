import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';
import CustomizationValue from '../common/CustomizationValue.jsx';

const CartItem = ({ item }) => {
  const { updateItem, removeItem } = useCart();
  const { product, quantity, customizations, variantSku } = item;
  const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);
  const lineTotal = unitPrice * quantity;

  return (
    <div className="flex gap-4 border-b border-charcoal/10 py-6 first:pt-0 sm:gap-5">
      <img
        src={product.images?.[0]?.url}
        alt={product.name}
        className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
      />

      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-charcoal sm:text-base">{product.name}</p>
          {variantSku && <p className="mt-0.5 text-xs text-charcoal/50">Variant: {variantSku}</p>}
          <p className="mt-1 text-sm text-charcoal/60">₹{unitPrice.toFixed(2)} each</p>

          {customizations?.length > 0 && (
            <div className="mt-2.5 space-y-2 rounded-xl bg-primary-50/60 p-3">
              {customizations.map((customization) => (
                <div key={customization.key} className="text-xs text-charcoal/60">
                  <span className="font-medium text-charcoal/80">{customization.label}: </span>
                  <CustomizationValue customization={customization} thumbSize="h-12 w-12" />
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-full border border-charcoal/15 px-2 py-1">
              <button
                onClick={() => updateItem(item._id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5 disabled:opacity-30"
              >
                <HiOutlineMinus size={13} />
              </button>
              <span className="w-5 text-center text-sm font-medium text-charcoal">{quantity}</span>
              <button
                onClick={() => updateItem(item._id, quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-6 w-6 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5"
              >
                <HiOutlinePlus size={13} />
              </button>
            </div>

            <button
              onClick={() => removeItem(item._id)}
              className="flex items-center gap-1 text-xs font-medium text-charcoal/40 transition-colors hover:text-red-600 sm:hidden"
              aria-label="Remove item"
            >
              <HiOutlineTrash size={16} />
              Remove
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-start justify-between sm:flex-col sm:items-end sm:justify-start sm:gap-3">
          <p className="text-sm font-semibold text-charcoal">₹{lineTotal.toFixed(2)}</p>
          <button
            onClick={() => removeItem(item._id)}
            className="hidden text-charcoal/40 transition-colors hover:text-red-600 sm:block"
            aria-label="Remove item"
          >
            <HiOutlineTrash size={19} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
