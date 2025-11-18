import { Search, X } from 'lucide-react';
import { forwardRef } from 'react';
import { theme } from '../../config/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  rightContent?: React.ReactNode;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Reusable Search Bar Component
 *
 * Features:
 * - Search icon on the left
 * - Optional clear button (X) on the right when there's text
 * - Optional custom right content (e.g., counter)
 * - Consistent styling with Light Sky theme
 * - White background with light blue borders
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value,
      onChange,
      placeholder = 'Procurar...',
      onClear,
      rightContent,
      autoFocus = false,
      className = '',
    },
    ref
  ) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        onChange('');
      }
    };

    return (
      <div className={`relative ${className}`}>
        {/* Search Icon */}
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.neutral} w-4 h-4`}
        />

        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 ${
            rightContent ? 'pr-16' : value ? 'pr-12' : 'pr-4'
          } py-3 rounded-xl text-sm ${theme.backgrounds.white} ${
            theme.text.onLight
          } placeholder-gray-400 border ${theme.borders.primaryLight} ${
            theme.borders.primaryHover
          } focus:outline-none focus:ring-2 ${
            theme.rings.primary
          } transition-all shadow-sm`}
          autoFocus={autoFocus}
        />

        {/* Right Content (custom content or clear button) */}
        {rightContent ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightContent}
          </div>
        ) : (
          value && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className={`w-4 h-4 ${theme.text.neutral}`} />
            </button>
          )
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
