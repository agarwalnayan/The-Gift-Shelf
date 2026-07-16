import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  applyCouponApi,
  removeCouponApi,
} from '../api/cartApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'tgs_guest_cart';

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const hasMergedGuestCart = useRef(false);

  useEffect(() => {
    if (!user) {
      hasMergedGuestCart.current = false;
    }
  }, [user]);

  const loadGuestCart = () => {
    try {
      const saved = localStorage.getItem(GUEST_CART_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.items)) {
          setCart(parsed);
        } else {
          setCart({ items: [] });
        }
      } else {
        setCart({ items: [] });
      }
    } catch {
      setCart({ items: [] });
    }
  };

  const saveGuestCart = (updatedCart) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(updatedCart));
    } catch (e) {
      console.warn('Failed to save guest cart to localStorage.', e);
    }
  };

  const clearGuestCart = () => {
    localStorage.removeItem(GUEST_CART_KEY);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      loadGuestCart();
      setDiscount(0);
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await getCartApi();
      setCart(data.data.cart);

      // Re-validate a previously applied coupon so the discount amount is
      // always fresh (e.g. after a page reload) — silently drop it if it's
      // no longer valid rather than surfacing an error on plain load.
      if (data.data.cart.couponCode) {
        try {
          const applied = await applyCouponApi(data.data.cart.couponCode);
          setDiscount(applied.data.data.discount);
        } catch (error) {
          setDiscount(0);
        }
      } else {
        setDiscount(0);
      }
    } catch (error) {
      console.error('Failed to refresh cart', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const mergeGuestCart = async () => {
      if (!user || hasMergedGuestCart.current) return;

      const saved = localStorage.getItem(GUEST_CART_KEY);

      if (!saved) {
        hasMergedGuestCart.current = true;
        return;
      }

      hasMergedGuestCart.current = true;

      let guestCart;
      try {
        guestCart = JSON.parse(saved);
      } catch {
        clearGuestCart();
        return;
      }

      if (!guestCart || !Array.isArray(guestCart.items) || guestCart.items.length === 0) {
        clearGuestCart();
        return;
      }

      const failedItems = [];

      for (const item of guestCart.items) {
        try {
          await addToCartApi({
            productId: item.product._id,
            quantity: item.quantity,
            variantSku: item.variantSku,
            customizations: item.customizations || [],
          });
        } catch (itemErr) {
          console.error('Failed to merge guest cart item', item, itemErr);
          failedItems.push(item);
        }
      }

      if (failedItems.length > 0) {
        // Persist only the items that could NOT be merged so the customer
        // doesn't permanently lose them. Show a single informative toast.
        const residualCart = { ...guestCart, items: failedItems };
        try {
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(residualCart));
        } catch (e) {
          console.warn('Failed to persist unmerged guest cart items', e);
        }
        toast.error(`Some items couldn't be restored (${failedItems.length} item${failedItems.length > 1 ? 's' : ''}). They may no longer be available.`);
      } else {
        clearGuestCart();
      }

      await refreshCart();
    };
    mergeGuestCart();
  }, [user, refreshCart]);

  // Normalise a customizations array to the same wire format the backend
  // uses in isSameLine(), so guest-side deduplication is always consistent.
  const normaliseCustomizations = (customizations) =>
    [...customizations]
      .sort((x, y) => x.key.localeCompare(y.key))
      .map((c) => ({
        key: c.key,
        label: c.label,
        type: c.type,
        value: c.value,
        additionalPrice: c.additionalPrice,
      }));

  const addItem = async (productId, quantity = 1, options = {}) => {
    const {
      variantSku = null,
      customizations = [],
      product = null,
    } = options;

    if (!user) {
      if (!product) {
        toast.error('Unable to add product.');
        return;
      }

      const normalisedIncoming = normaliseCustomizations(customizations);
      const incomingKey = JSON.stringify(normalisedIncoming);

      const existingItemIndex = (cart.items || []).findIndex((item) => {
        if (item.product._id !== product._id) return false;
        if ((item.variantSku || null) !== (variantSku || null)) return false;
        // Use the same field-pick + sort as backend isSameLine so that
        // guest-side deduplication matches what the server will do on merge.
        const existingKey = JSON.stringify(normaliseCustomizations(item.customizations || []));
        return existingKey === incomingKey;
      });

      let updatedCart;
      if (existingItemIndex > -1) {
        const updatedItems = cart.items.map((item, idx) =>
          idx === existingItemIndex ? { ...item, quantity: item.quantity + quantity } : item
        );
        updatedCart = { ...cart, items: updatedItems };
      } else {
        updatedCart = {
          ...cart,
          items: [
            ...(cart.items || []),
            {
              _id: `guest-${Date.now()}`,
              product,
              quantity,
              variantSku,
              customizations,
              priceAtAddition: product.finalPrice ?? product.price,
              customizationPrice: 0,
            },
          ],
        };
      }

      setCart(updatedCart);
      saveGuestCart(updatedCart);

      toast.success('Added to cart');
      openDrawer();
      return;
    }


    const { data } = await addToCartApi({
      productId,
      quantity,
      variantSku,
      customizations,
    });

    setCart(data.data.cart);

    toast.success('Added to cart');

    openDrawer();
  };

  const updateItem = async (itemId, quantity) => {
    if (!user) {
      const updatedCart = {
        ...cart,
        items: cart.items.map((item) =>
          item._id === itemId
            ? { ...item, quantity }
            : item
        ),
      };

      setCart(updatedCart);
      saveGuestCart(updatedCart);
      return;
    }

    const { data } = await updateCartItemApi({ itemId, quantity });

    setCart(data.data.cart);
  };

  const removeItem = async (itemId) => {
    if (!user) {
      const updatedCart = {
        ...cart,
        items: cart.items.filter((item) => item._id !== itemId),
      };

      setCart(updatedCart);
      saveGuestCart(updatedCart);

      toast.success('Removed from cart');

      return;
    }

    const { data } = await removeFromCartApi(itemId);

    setCart(data.data.cart);

    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    if (!user) {
      setCart({ items: [] });
      clearGuestCart();
      setDiscount(0);
      return;
    }

    const { data } = await clearCartApi();

    setCart(data.data.cart);

    setDiscount(0);
  };

  const applyCoupon = async (code) => {
    const { data } = await applyCouponApi(code);
    setCart(data.data.cart);
    setDiscount(data.data.discount);
    toast.success(`Coupon ${data.data.couponCode} applied`);
    return data.data.discount;
  };

  const removeCoupon = async () => {
    const { data } = await removeCouponApi();
    setCart(data.data.cart);
    setDiscount(0);
    toast.success('Coupon removed');
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        discount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        refreshCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};