import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getCartApi, addToCartApi, updateCartItemApi, removeFromCartApi, clearCartApi } from '../api/cartApi.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [] });
      return;
    }
    setIsLoading(true);
    try {
      const { data } = await getCartApi();
      setCart(data.data.cart);
    } catch (error) {
      // silently ignore, user may not have a cart yet
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity = 1, options = {}) => {
    const { variantSku = null, customizations = [] } = options;
    const { data } = await addToCartApi({ productId, quantity, variantSku, customizations });
    setCart(data.data.cart);
    toast.success('Added to cart');
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await updateCartItemApi({ itemId, quantity });
    setCart(data.data.cart);
  };

  const removeItem = async (itemId) => {
    const { data } = await removeFromCartApi(itemId);
    setCart(data.data.cart);
    toast.success('Removed from cart');
  };

  const clearCart = async () => {
    const { data } = await clearCartApi();
    setCart(data.data.cart);
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, itemCount, addItem, updateItem, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
