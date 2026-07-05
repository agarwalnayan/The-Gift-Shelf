import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getProductBySlugApi } from '../api/productApi.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    getProductBySlugApi(slug)
      .then(({ data }) => setProduct(data.data.product))
      .finally(() => setIsLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please sign in to add items to your cart');
      return;
    }
    setIsAdding(true);
    try {
      await addItem(product._id, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;
  if (!product) return null;

  const finalPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

  return (
    <div className="container-tgs py-12">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-white">
            <img src={product.images[activeImage]?.url} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3">
            {product.images.map((img, index) => (
              <button
                key={img.publicId}
                onClick={() => setActiveImage(index)}
                className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                  activeImage === index ? 'border-primary-600' : 'border-transparent'
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-primary-600">
            {product.category?.name}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-charcoal">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-semibold text-charcoal">₹{finalPrice}</span>
            {product.discountPrice > 0 && (
              <span className="text-lg text-charcoal/40 line-through">₹{product.price}</span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-charcoal/70">{product.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-charcoal/20 px-4 py-2">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span className="w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <Button onClick={handleAddToCart} isLoading={isAdding} disabled={product.stock === 0}>
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
