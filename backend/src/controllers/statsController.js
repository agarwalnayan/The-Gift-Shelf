import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

// Real backend aggregation for the admin dashboard. Replaces the previous
// client-side approach, which only looked at the 5 most recently fetched
// orders and was explicitly noted in a code comment as not reflecting true
// total/today's revenue.
export const getDashboardStats = asyncHandler(async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    totalProducts,
    totalUsers,
    draftProducts,
    revenueAgg,
    todayAgg,
    pendingOrders,
    outOfStock,
    lowStock,
    recentOrders,
  ] = await Promise.all([
    Order.countDocuments({}),
    Product.countDocuments({ isDeleted: false }),
    User.countDocuments({}),
    Product.countDocuments({ isDeleted: false, publishStatus: 'draft' }),
    Order.aggregate([
      { $match: { isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.countDocuments({ orderStatus: { $in: ['pending', 'confirmed'] } }),
    Product.countDocuments({ isDeleted: false, stock: { $lte: 0 } }),
    Product.countDocuments({
      isDeleted: false,
      stock: { $gt: 0 },
      $expr: { $lte: ['$stock', { $ifNull: ['$lowStockThreshold', 5] }] },
    }),
    Order.find({}).populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
  ]);

  const todayOrdersCount = await Order.countDocuments({ createdAt: { $gte: startOfToday } });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalOrders,
        totalProducts,
        totalUsers,
        draftProducts,
        revenue: revenueAgg[0]?.total || 0,
        todayRevenue: todayAgg[0]?.total || 0,
        todayOrders: todayOrdersCount,
        pendingOrders,
        outOfStockCount: outOfStock,
        lowStockCount: lowStock,
        recentOrders,
      },
      'Dashboard stats fetched successfully'
    )
  );
});