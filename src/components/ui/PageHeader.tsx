import { theme } from "../../config/theme";

interface PageHeaderProps {
  // Navigation
  onBack: () => void;

  // Content
  title?: string;
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
  variant?: 'default' | 'minimal'; // minimal = iOS style, white background, back button only
}

/**
 * Reusable page header component
 *
 * Features:
 * - Gradient background with consistent styling (default variant)
 * - Minimal iOS-style header (minimal variant)
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
  variant = 'default',
}: PageHeaderProps) {
  const stickyClasses = sticky ? "sticky top-0 z-10" : "";

  // Minimal variant - iOS style
  if (variant === 'minimal') {
    return (
      <header
        className={`${stickyClasses} bg-white border-b ${theme.borders.neutralLight} ${className}`.trim()}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Simple iOS Back Button */}
          <button
            onClick={onBack}
            className={`flex items-center gap-1 ${theme.text.primary} hover:opacity-70 transition-opacity`}
          >
            <svg
              className="w-4 h-4"
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
            <span className="text-sm font-normal">Voltar</span>
          </button>

          {/* Right: Optional Action Button */}
          {rightAction && (
            <button
              onClick={rightAction.onClick}
              disabled={rightAction.disabled}
              className={`flex items-center gap-2 ${theme.text.primary} hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed`}
            >
              {rightAction.icon}
              {rightAction.label && (
                <span className="text-sm font-normal">{rightAction.label}</span>
              )}
            </button>
          )}
        </div>
      </header>
    );
  }

  // Default variant - colored background
  return (
    <header
      className={`${stickyClasses} ${theme.solids.primaryButton} shadow-lg ${className}`.trim()}
    >
      {/* Top row: Back button + optional right action */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        {/* Left: Back Button with "Voltar" text */}
        <button
          onClick={onBack}
          className={`flex items-center gap-1.5 ${theme.text.onPrimaryButton} hover:opacity-80 transition-opacity`}
        >
          <svg
            className="w-4 h-4"
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
          <span className="text-sm font-medium">Voltar</span>
        </button>

        {/* Right: Optional Action Button */}
        {rightAction && (
          <button
            onClick={rightAction.onClick}
            disabled={rightAction.disabled}
            className={`flex items-center gap-2 px-3 py-1.5 ${theme.backgrounds.whiteTransparent} ${theme.backgrounds.whiteHover} ${theme.text.onPrimaryButton} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {rightAction.icon}
            {rightAction.label && (
              <span className="text-xs font-medium">{rightAction.label}</span>
            )}
          </button>
        )}
      </div>

      {/* Title Section */}
      {title && (
        <div className="px-4 pb-3">
          <h1 className={`text-xl font-semibold ${theme.text.onPrimaryButton} mb-0.5 leading-snug`}>{title}</h1>
          {subtitle && (
            <p className={`text-sm ${theme.text.onPrimaryButton} opacity-90 leading-snug`}>{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
