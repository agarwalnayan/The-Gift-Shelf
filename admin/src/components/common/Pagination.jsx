import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-ink/10 px-4 py-3">
      <p className="text-sm text-ink/50">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 text-ink/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiOutlineChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink/15 text-ink/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <HiOutlineChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
