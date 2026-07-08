export const generateSku = (productName) => {
  const prefix = productName
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 4);

  const suffix = Date.now().toString(36).toUpperCase();

  return `TGS-${prefix}-${suffix}`;
};

/**
 * Builds a deterministic-looking SKU for a product variant from its base SKU
 * and attribute values, e.g. ("TGS-MUG-ABC1", [{name:'Color',value:'Red'},{name:'Size',value:'M'}])
 * -> "TGS-MUG-ABC1-RED-M". Falls back to a short random suffix if the variant
 * has no attributes yet.
 */
export const generateVariantSku = (baseSku, attributes = []) => {
  const attributePart = attributes
    .map((attr) => attr.value)
    .filter(Boolean)
    .map((value) => value.toString().replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6))
    .join('-');

  if (attributePart) {
    return `${baseSku}-${attributePart}`;
  }

  return `${baseSku}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
};
