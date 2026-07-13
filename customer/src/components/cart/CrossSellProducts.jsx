import { useEffect, useState } from 'react';
import { getProductsApi } from '../../api/productApi.js';
import ProductCard from '../product/ProductCard.jsx';

/**
 * "You may also like" strip — reuses existing featured products
 * (Product.isFeatured, already exposed via GET /products?featured=true)
 * rather than introducing a new cross-sell data model.
 */
const CrossSellProducts = ({ excludeProductIds = [], limit = 4, compact = false }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        let isMounted = true;
        getProductsApi({ featured: true, limit: limit + excludeProductIds.length })
            .then(({ data }) => {
                if (!isMounted) return;
                const items = (data.data.products || []).filter((p) => !excludeProductIds.includes(p._id)).slice(0, limit);
                setProducts(items);
            })
            .catch(() => {
                // Cross-sell is a nice-to-have; fail silently.
            });
        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [limit]);

    if (products.length === 0) return null;

    return (
        <div>
            <p className="text-sm font-semibold text-charcoal">You may also like</p>
            <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                ))}
            </div>
        </div>
    );
};

export default CrossSellProducts;