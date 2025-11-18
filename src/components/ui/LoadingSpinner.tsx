import { theme } from "@/config/theme";
import { LoadingState } from "./LoadingState";

/**
 * LoadingSpinner - Full-screen loading wrapper
 * Uses the centralized LoadingState component
 */
export const LoadingSpinner = () => {
  return (
    <div className={`min-h-screen ${theme.solids.background} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full text-center">
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-12`}>
          <LoadingState message="A obter dados" size="large" />
        </div>
      </div>
    </div>
  );
};
