import { memo } from 'react';

/**
 * Product Grid Skeleton Loading
 * Loading state for product grid sections
 */
const ProductGridSkeleton = memo(({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export default ProductGridSkeleton;
