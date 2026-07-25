import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Simple client‑side pagination component.
 * Props:
 * - totalItems: total number of items
 * - pageSize: items per page (default 10)
 * - onPageChange?: callback when page changes (receives new page number)
 */
export const Pagination: React.FC<{
  totalItems: number;
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}> = ({ totalItems, pageSize = 10, currentPage: controlledPage, onPageChange }) => {
  const [internalPage, setInternalPage] = React.useState(1);
  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToPage = (page: number) => {
    const newPage = Math.min(Math.max(page, 1), totalPages);
    if (controlledPage === undefined) {
      setInternalPage(newPage);
    }
    onPageChange?.(newPage);
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2 py-4')}>
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn('flex items-center rounded-md border px-2 py-1', {
          'opacity-50 cursor-not-allowed': currentPage === 1,
        })}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn('flex items-center rounded-md border px-2 py-1', {
          'opacity-50 cursor-not-allowed': currentPage === totalPages,
        })}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
