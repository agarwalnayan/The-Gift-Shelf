import { useMemo, useState } from "react";

const ProductMultiSelect = ({
  products = [],
  selectedProducts = [],
  onChange,
  placeholder = "Search products...",
}) => {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!search) return products;

    const searchLower = search.toLowerCase();
    return products.filter((product) => {
      const name = product.name?.toLowerCase() || "";
      const sku = product.sku?.toLowerCase() || "";
      const slug = product.slug?.toLowerCase() || "";
      
      return (
        name.includes(searchLower) ||
        sku.includes(searchLower) ||
        slug.includes(searchLower)
      );
    });
  }, [products, search]);

  const selectedProductObjects = useMemo(() => {
    return products.filter((product) =>
      selectedProducts.includes(product._id)
    );
  }, [products, selectedProducts]);

  const toggleProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      onChange(selectedProducts.filter((id) => id !== productId));
    } else {
      onChange([...selectedProducts, productId]);
    }
  };

  const removeProduct = (productId) => {
    onChange(selectedProducts.filter((id) => id !== productId));
  };

  return (
    <div className="rounded-xl border border-border bg-white p-4">
      {/* Selected Products */}
      {selectedProductObjects.length > 0 && (
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-ink">
            Selected Products ({selectedProductObjects.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedProductObjects.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1.5 text-sm text-primary-700"
              >
                <span>{product.name}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(product._id)}
                  className="text-primary-500 hover:text-primary-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-3">
        <input
          type="text"
          className="input-field"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Product List */}
      <div className="max-h-64 overflow-y-auto space-y-2">
        {filteredProducts.length === 0 ? (
          <p className="text-sm text-gray-500">No products found.</p>
        ) : (
          [...filteredProducts]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((product) => {
              const isSelected = selectedProducts.includes(product._id);

              return (
                <label
                  key={product._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isSelected ? "bg-primary-50" : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleProduct(product._id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink">
                      {product.name}
                    </div>
                    {product.sku && (
                      <div className="text-xs text-ink/50">
                        SKU: {product.sku}
                      </div>
                    )}
                  </div>
                </label>
              );
            })
        )}
      </div>
    </div>
  );
};

export default ProductMultiSelect;
