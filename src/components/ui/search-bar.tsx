import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  /** Placeholder for the input */
  placeholder?: string;
  /** Called with the debounced search value */
  onSearch: (value: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * Reusable search bar with 300 ms debounce, clear button and a search icon.
 * It forwards the debounced value via `onSearch`.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  className,
}) => {
  const [value, setValue] = React.useState('');

  // Debounce the search value
  React.useEffect(() => {
    const handler = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(handler);
  }, [value, onSearch]);

  const clear = () => setValue('');

  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        className={cn(
          "pl-9 pr-9 w-full rounded-md border border-input bg-background py-2 text-sm placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        placeholder={placeholder}
        value={value}
        onChange={e => setValue(e.target.value)}
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
