import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { uploadImages, deleteImage } from '../services/cloudinaryService.js';
import { generateSku } from '../utils/generateSku.js';

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, shortDescription, category, price, discountPrice, stock, tags, attributes } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  const images = await uploadImages(req.files, 'tgs/products');
  const sku = generateSku(name);

  const product = await Product.create({
    name,
    description,
    shortDescription,
    category,
    price,
    discountPrice,
    stock,
    tags: tags ? JSON.parse(tags) : [],
    attributes: attributes ? JSON.parse(attributes) : [],
    images,
    sku,
  });

  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12, featured } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (featured) filter.isFeatured = true;
  if (search) filter.$text = { $search: search };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratingsAverage: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOptions[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
      },
      'Products fetched successfully'
    )
  );
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    'category',
    'name slug'
  );

  if (!product) throw new ApiError(404, 'Product not found');

  res.status(200).json(new ApiResponse(200, { product }, 'Product fetched successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const fields = ['name', 'description', 'shortDescription', 'category', 'price', 'discountPrice', 'stock', 'isFeatured', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  if (req.body.tags) product.tags = JSON.parse(req.body.tags);
  if (req.body.attributes) product.attributes = JSON.parse(req.body.attributes);

  if (req.files && req.files.length > 0) {
    await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
    product.images = await uploadImages(req.files, 'tgs/products');
  }

  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  await Promise.all(product.images.map((img) => deleteImage(img.publicId)));
  await product.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
