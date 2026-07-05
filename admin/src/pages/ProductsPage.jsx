import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlinePencilSquare, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi2';
import { getProductsApi, deleteProductApi } from '../api/productApi.js';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Button from '../components/common/Button.jsx';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await getProductsApi({ limit: 100 });
      setProducts(data.data.products);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await deleteProductApi(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        <Link to="/products/new">
          <Button>
            <HiOutlinePlus className="mr-1.5" size={18} />
            Add Product
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products yet" description="Add your first product to get started." />
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="table-base">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0]?.url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category?.name}</td>
                  <td>₹{product.discountPrice > 0 ? product.discountPrice : product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive ? 'bg-green-100 text-green-700' : 'bg-ink/10 text-ink/60'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Link to={`/products/${product._id}/edit`} className="text-ink/50 hover:text-primary-600">
                        <HiOutlinePencilSquare size={18} />
                      </Link>
                      <button onClick={() => handleDelete(product._id)} className="text-ink/50 hover:text-red-600">
                        <HiOutlineTrash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
