/**
 * 🔍 Reusable Search Input Component
 *
 * Features:
 * - Debounced search with lodash
 * - Clear button
 * - Loading state
 * - Customizable placeholder
 * - Parent controlled via onChange
 */

'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  debounceMs?: number;
  className?: string;
  defaultValue?: string;
}

export function SearchInput({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 500,
  className,
  defaultValue = '',
}: SearchInputProps) {
  const [searchValue, setSearchValue] = useState(defaultValue);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
      setIsSearching(false);
    }, debounceMs),
    [onSearch, debounceMs]
  );

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsSearching(true);
    debouncedSearch(value);
  };

  // Clear search
  const handleClear = () => {
    setSearchValue('');
    setIsSearching(false);
    onSearch('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
