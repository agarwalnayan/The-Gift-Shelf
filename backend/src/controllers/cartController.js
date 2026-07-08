import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { validateCustomizationSelections } from '../utils/validateCustomizations.js';

const CART_POPULATE_FIELDS = 'name images price discountPrice stock variants';

/**
 * Two cart lines are the "same" line (and should have their quantity merged)
 * only if they reference the same product, the same variant, and identical
 * customization selections. Otherwise a customer who orders two differently
 * personalized versions of the same product ends up with two distinct lines.
 */
const isSameLine = (item, productId, variantSku, customizations) => {
  if (item.product.toString() !== productId) return false;
  if ((item.variantSku || null) !== (variantSku || null)) return false;

  const a = JSON.stringify([...item.customizations].sort((x, y) => x.key.localeCompare(y.key)));
  const b = JSON.stringify(
    [...customizations].sort((x, y) => x.key.localeCompare(y.key)).map((c) => ({
      key: c.key,
      label: c.label,
      type: c.type,
      value: c.value,
      additionalPrice: c.additionalPrice,
    }))
  );

  return a === b;
};

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', CART_POPULATE_FIELDS);

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json(new ApiResponse(200, { cart }, 'Cart fetched successfully'));
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variantSku = null, customizations: rawCustomizations = [] } = req.body;

  const product = await Product.findOne({ _id: productId, isDeleted: { $ne: true } });
  if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

  let unitPrice = product.finalPrice;
  let availableStock = product.stock;

  if (variantSku) {
    const variant = product.variants.find((v) => v.sku === variantSku && v.isActive);
    if (!variant) throw new ApiError(404, 'Selected variant not found');
    unitPrice = variant.price ?? product.finalPrice;
    availableStock = variant.stock;
  }

  if (availableStock < quantity) throw new ApiError(400, 'Insufficient stock available');

  const { customizations, additionalPrice } = validateCustomizationSelections(product, rawCustomizations);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find((item) => isSameLine(item, productId, variantSku, customizations));

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      variantSku,
      quantity,
      priceAtAddition: unitPrice,
      customizations,
      customizationPrice: additionalPrice,
    });
  }

  await cart.save();
  await cart.populate('items.product', CART_POPULATE_FIELDS);

  res.status(200).json(new ApiResponse(200, { cart }, 'Item added to cart'));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId, quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');

  const item = cart.items.id(itemId);
  if (!item) throw new ApiError(404, 'Item not found in cart');

  if (quantity <= 0) {
    cart.items.pull({ _id: itemId });
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', CART_POPULATE_FIELDS);

  res.status(200).json(new ApiResponse(200, { cart }, 'Cart updated successfully'));
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new ApiError(404, 'Cart not found');

  cart.items.pull({ _id: req.params.itemId });
  await cart.save();

  res.status(200).json(new ApiResponse(200, { cart }, 'Item removed from cart'));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json(new ApiResponse(200, { cart }, 'Cart cleared'));
});
