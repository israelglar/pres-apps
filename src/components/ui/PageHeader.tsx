import { theme } from "../../config/theme";

interface PageHeaderProps {
  // Navigation
  onBack: () => void;

  // Content
  title: string;
  subtitle?: string;

  // Right-side action (optional)
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    disabled?: boolean;
  };

  // Styling flexibility
  sticky?: boolean; // Enable sticky positioning (default: true)
  className?: string;
}

/**
 * Reusable page header component
 *
 * Features:
 * - Gradient background with consistent styling
 * - Back button with "Voltar" text
 * - Title and subtitle section
 * - Optional right-side action button
 * - Configurable sticky positioning
 */
export function PageHeader({
  onBack,
  title,
  subtitle = "",
  rightAction,
  sticky = true,
  className = "",
}: PageHeaderProps) {
  const stickyClasses = sticky ? "sticky top-0 z-10" : "";

  return (
    <header
      className={`${stickyClasses} ${theme.solids.primaryButton} shadow-lg ${className}`.trim()}
    >
      {/* Top row: Back button + optional right action */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        {/* Left: Back Button with "Voltar" text */}
        <button
          onClick={onBack}
          className={`flex items-center gap-2 ${theme.text.onPrimaryButton} hover:opacity-80 transition-opacity`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-base font-medium">Voltar</span>
        </button>

        {/* Right: Optional Action Button */}
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            disabled={rightAction.disabled}
            className={`flex items-center gap-2 px-4 py-2 ${theme.backgrounds.whiteTransparent} ${theme.backgrounds.whiteHover} ${theme.text.onPrimaryButton} rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {rightAction.icon}
            {rightAction.label && (
              <span className="text-sm font-medium">{rightAction.label}</span>
            )}
          </button>
        )}
      </div>

      {/* Title Section */}
      <div className="px-4 pb-4">
        <h1 className={`text-2xl font-semibold ${theme.text.onPrimaryButton} mb-1 leading-relaxed`}>{title}</h1>
        <p className={`text-base ${theme.text.onPrimaryButton} opacity-90 leading-relaxed`}>{subtitle}</p>
      </div>
    </header>
  );
}
