import { useState, useEffect } from 'react';
import { HiMagnifyingGlass, HiXMark, HiPlus } from 'react-icons/hi2';

const ProductSearch = ({ products, onProductSelect, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products.slice(0, 10)); // Show first 10 by default
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.category?.name?.toLowerCase().includes(term)
      ).slice(0, 20); // Limit results
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleSelect = (product) => {
    onProductSelect(product);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <HiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
        <input
          type="text"
          placeholder="Search products by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-xl border border-ink/20 pl-10 pr-10 py-3 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
          >
            <HiXMark size={16} />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-2 bg-white border border-ink/10 rounded-xl shadow-xl max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-ink/50">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-sm text-ink/50">No products found</div>
            ) : (
              <div className="p-2">
                {filteredProducts.map(product => (
                  <div
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="flex items-center gap-3 p-3 hover:bg-ink/5 rounded-lg cursor-pointer border-b border-ink/5 last:border-0"
                  >
                    <div className="w-12 h-12 rounded-lg bg-ink/5 shrink-0 overflow-hidden">
                      {product.images?.[0] && (
                        <img 
                          src={product.images[0].url} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink truncate">{product.name}</div>
                      <div className="text-xs text-ink/50 mt-0.5">
                        SKU: {product.sku} • ₹{product.price}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {product.variants?.length > 0 && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {product.variants.length} variants
                          </span>
                        )}
                        {product.customizationOptions?.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Customizable
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          Stock: {product.stock}
                        </span>
                      </div>
                    </div>
                    <button className="shrink-0 text-primary-600 hover:text-primary-700">
                      <HiPlus size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSearch;