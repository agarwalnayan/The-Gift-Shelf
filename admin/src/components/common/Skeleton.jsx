const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-ink/10 ${className}`.trim()} />
);

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="space-y-3 p-4">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex items-center gap-4">
        {Array.from({ length: columns }).map((__, colIndex) => (
          <Skeleton key={colIndex} className={`h-4 ${colIndex === 0 ? 'w-40' : 'flex-1'}`} />
        ))}
      </div>
    ))}
  </div>
);

export const GridSkeleton = ({ items = 6 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="card space-y-3 p-3">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    ))}
  </div>
);

export default Skeleton;
