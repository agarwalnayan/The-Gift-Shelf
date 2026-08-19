import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const addPage = (p) => {
    if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p);
  };

  addPage(1);
  if (page > 3) pages.push('…');
  for (let p = page - 1; p <= page + 1; p += 1) addPage(p);
  if (page < totalPages - 2) pages.push('…');
  addPage(totalPages);

  return (
    <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-30"
      >
        <HiChevronLeft size={18} />
      </button>

      {pages.map((p, index) =>
        p === '…' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-charcoal/40">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-full px-3 text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary-600 text-cream'
                : 'border border-charcoal/10 text-charcoal/70 hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/10 text-charcoal/60 transition-colors hover:border-primary-300 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-30"
      >
        <HiChevronRight size={18} />
      </button>
    </nav>
  );
};

export default Pagination;
