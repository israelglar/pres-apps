import { theme } from "../../config/theme";

interface EmptyStateProps {
  icon: React.ReactNode; // Lucide icon component
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  variant?: "default" | "compact";
  className?: string;
}

/**
 * EmptyState Component
 * Displays empty state with icon, title, description, and optional action
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  className = "",
}: EmptyStateProps) {
  if (variant === "compact") {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className={`${theme.text.neutralLight} mb-4 flex justify-center`}>
          {icon}
        </div>
        <p className={`text-base ${theme.text.neutral} font-medium mb-2`}>
          {title}
        </p>
        {description && (
          <p className={`text-sm ${theme.text.neutralLight}`}>{description}</p>
        )}
      </div>
    );
  }

  return (
    <div className={`text-center py-16 ${className}`}>
      <div className={`${theme.text.neutralLight} mb-4 flex justify-center`}>
        {icon}
      </div>
      <p className={`text-base ${theme.text.neutral} font-medium mb-2`}>
        {title}
      </p>
      {description && (
        <p className={`text-sm ${theme.text.neutralLight} mb-4`}>
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`px-5 py-3 ${theme.solids.primaryButton} ${theme.text.onPrimaryButton} rounded-xl text-sm font-medium inline-flex items-center gap-2 hover:shadow-md transition-all`}
        >
          {action.icon}
          {action.label}
        </button>
      )}
    </div>
  );
}
