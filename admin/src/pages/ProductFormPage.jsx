import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProductApi, updateProductApi, getProductsApi } from '../api/productApi.js';
import { getCategoriesApi } from '../api/categoryApi.js';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import Loader from '../components/common/Loader.jsx';

const initialForm = {
  name: '',
  description: '',
  shortDescription: '',
  category: '',
  price: '',
  discountPrice: '',
  stock: '',
};

const ProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCategoriesApi().then(({ data }) => setCategories(data.data.categories));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;

    getProductsApi({ limit: 100 }).then(({ data }) => {
      const product = data.data.products.find((p) => p._id === id);
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || '',
          category: product.category?._id || '',
          price: product.price,
          discountPrice: product.discountPrice || '',
          stock: product.stock,
        });
      }
      setIsLoading(false);
    });
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach((file) => formData.append('images', file));

    try {
      if (isEditMode) {
        await updateProductApi(id, formData);
        toast.success('Product updated successfully');
      } else {
        await createProductApi(formData);
        toast.success('Product created successfully');
      }
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader fullScreen />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-ink">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <Input label="Product Name" name="name" value={form.name} onChange={handleChange} required />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="input-field"
            required
          />
        </div>

        <Input
          label="Short Description"
          name="shortDescription"
          value={form.shortDescription}
          onChange={handleChange}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input-field" required>
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input label="Price" name="price" type="number" value={form.price} onChange={handleChange} required />
          <Input
            label="Discount Price"
            name="discountPrice"
            type="number"
            value={form.discountPrice}
            onChange={handleChange}
          />
          <Input label="Stock" name="stock" type="number" value={form.stock} onChange={handleChange} required />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink/80">Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(Array.from(e.target.files))}
            className="input-field"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isEditMode ? 'Update Product' : 'Create Product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
