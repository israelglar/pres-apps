import { theme } from "../../config/theme";

interface FilterOption {
  value: string; // e.g., "all", "active", "inactive"
  label: string; // e.g., "Todos", "Ativos", "Inativos"
}

interface FilterGroup {
  id: string; // Unique identifier for the filter group
  label: string; // e.g., "Estado", "Período"
  options: FilterOption[];
}

interface FilterPanelProps {
  isOpen: boolean;
  filterGroups: FilterGroup[];
  activeFilters: Record<string, string>; // { groupId: selectedValue }
  onFilterChange: (groupId: string, value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  className?: string;
}

/**
 * FilterPanel Component
 * Collapsible filter panel with multiple filter groups
 */
export function FilterPanel({
  isOpen,
  filterGroups,
  activeFilters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  className = "",
}: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div
      className={`${theme.backgrounds.white} rounded-xl p-3 space-y-2.5 border-2 ${theme.borders.primaryLight} shadow-md ${className}`}
    >
      {filterGroups.map((group) => (
        <div key={group.id}>
          <label
            className={`block text-xs font-bold ${theme.text.primary} mb-1.5`}
          >
            {group.label}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {group.options.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange(group.id, option.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeFilters[group.id] === option.value
                    ? `${theme.solids.primaryButton} ${theme.text.onPrimaryButton} shadow-sm`
                    : `bg-gray-100 ${theme.text.neutral} hover:bg-gray-200`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className={`w-full py-1.5 ${theme.backgrounds.errorMedium} ${theme.text.white} rounded-lg text-xs font-medium hover:bg-red-600 transition-colors`}
        >
          Limpar Filtros
        </button>
      )}
    </div>
  );
}
