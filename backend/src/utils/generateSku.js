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
