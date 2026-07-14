import { HiOutlineTrash, HiOutlineMinus, HiOutlinePlus } from 'react-icons/hi2';
import { useCart } from '../../context/CartContext.jsx';
import CustomizationValue from '../common/CustomizationValue.jsx';

const CartItem = ({ item, compact = false }) => {
  const { updateItem, removeItem } = useCart();
  const { product, quantity, customizations, variantSku } = item;
  const unitPrice = item.priceAtAddition + (item.customizationPrice || 0);
  const lineTotal = unitPrice * quantity;

  return (
    <div className={`flex gap-4 py-4 first:pt-0 sm:gap-5 sm:py-5 md:gap-6 md:py-6 ${compact ? 'py-4' : 'border-b border-charcoal/10'}`}>
      <img
        src={product.images?.[0]?.url}
        alt={product.name}
        className={`shrink-0 rounded-xl object-cover ${compact ? 'h-14 w-14' : 'h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24'}`}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:justify-between sm:gap-5 md:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3 md:gap-4">
          {/* Product block */}
          <div>
            <p className="line-clamp-2 text-sm font-medium text-charcoal sm:text-base">{product.name}</p>
            {variantSku && <p className="mt-0.5 text-xs text-charcoal/50">Variant: {variantSku}</p>}
            <p className="mt-1 text-sm text-charcoal/60">₹{unitPrice.toFixed(2)} each</p>
          </div>

          {/* Customization block */}
          {customizations?.length > 0 && (
            <div className="space-y-2 rounded-xl bg-primary-50/60 p-3 sm:p-4">
              {customizations.map((customization) => (
                <div key={customization.key} className="text-xs text-charcoal/60">
                  <span className="font-medium text-charcoal/80">{customization.label}: </span>
                  <CustomizationValue customization={customization} thumbSize="h-10 w-10 sm:h-12 sm:w-12" />
                </div>
              ))}
            </div>
          )}

          {/* Quantity block */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            <div className="flex items-center gap-2 rounded-full border border-charcoal/15 px-2 py-1 sm:gap-3">
              <button
                onClick={() => updateItem(item._id, quantity - 1)}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-5 w-5 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5 disabled:opacity-30 sm:h-6 sm:w-6"
              >
                <HiOutlineMinus size={12} sm:size={13} />
              </button>
              <span className="w-5 text-center text-sm font-medium text-charcoal">{quantity}</span>
              <button
                onClick={() => updateItem(item._id, quantity + 1)}
                aria-label="Increase quantity"
                className="flex h-5 w-5 items-center justify-center rounded-full text-charcoal/70 transition-colors hover:bg-charcoal/5 sm:h-6 sm:w-6"
              >
                <HiOutlinePlus size={12} sm:size={13} />
              </button>
            </div>

            <button
              onClick={() => removeItem(item._id)}
              className="flex items-center gap-1 text-xs font-medium text-charcoal/40 transition-colors hover:text-red-600 sm:hidden"
              aria-label="Remove item"
            >
              <HiOutlineTrash size={14} />
              <span>Remove</span>
            </button>
          </div>
        </div>

        {/* Price block */}
        <div className="flex shrink-0 items-start justify-between gap-2 sm:flex-col sm:items-end sm:justify-start sm:gap-3 md:gap-4">
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