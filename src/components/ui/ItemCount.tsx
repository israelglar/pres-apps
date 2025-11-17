import { theme } from "../../config/theme";

interface ItemCountProps {
  totalCount: number;
  filteredCount: number;
  itemLabel: string; // singular form (e.g., "pré", "lição")
  itemLabelPlural: string; // plural form (e.g., "prés", "lições")
  isFiltered: boolean;
  className?: string;
}

/**
 * ItemCount Component
 * Displays count of items with proper pluralization
 */
export function ItemCount({
  totalCount,
  filteredCount,
  itemLabel,
  itemLabelPlural,
  isFiltered,
  className = "",
}: ItemCountProps) {
  const getLabel = (count: number) => {
    return count === 1 ? itemLabel : itemLabelPlural;
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <p className={`text-sm ${theme.text.neutral} font-medium`}>
        {isFiltered ? (
          <>
            A mostrar {filteredCount} de {totalCount} {getLabel(totalCount)}
          </>
        ) : (
          <>
            Total: {totalCount} {getLabel(totalCount)}
          </>
        )}
      </p>
    </div>
  );
}
