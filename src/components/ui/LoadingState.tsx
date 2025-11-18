import { Loader2 } from "lucide-react";
import { theme } from "@/config/theme";

interface LoadingStateProps {
  message?: string;
  size?: "small" | "default" | "large";
  className?: string;
}

/**
 * LoadingState - Unified loading component
 *
 * Provides consistent loading UI across the app with customizable sizes
 *
 * Sizes:
 * - small: w-6 h-6 (24px) - For inline/compact loading
 * - default: w-12 h-12 (48px) - For standard page loading
 * - large: w-16 h-16 (64px) - For full-screen loading
 */
export function LoadingState({
  message = "A carregar...",
  size = "default",
  className = "",
}: LoadingStateProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    default: "w-12 h-12",
    large: "w-16 h-16",
  };

  const paddingClasses = {
    small: "py-8",
    default: "py-12",
    large: "py-16",
  };

  const iconSize = sizeClasses[size];
  const padding = paddingClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center ${padding} ${className}`}>
      <Loader2 className={`${iconSize} ${theme.text.primary} animate-spin mb-4`} />
      {message && (
        <p className={`text-sm ${theme.text.neutral} text-center`}>{message}</p>
      )}
    </div>
  );
}
