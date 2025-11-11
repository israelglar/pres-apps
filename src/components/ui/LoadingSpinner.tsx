import { Loader2 } from "lucide-react";
import { theme } from "@/config/theme";

export const LoadingSpinner = () => {
  return (
    <div className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full text-center">
        <div className={`${theme.backgrounds.white} rounded-2xl shadow-2xl p-12`}>
          <Loader2 className={`w-16 h-16 ${theme.text.primary} mx-auto mb-4 animate-spin`} />
          <h2 className={`text-2xl font-bold ${theme.text.neutralDarker} mb-2`}>
            A carregar...
          </h2>
          <p className={theme.text.neutral}>
            A obter dados
          </p>
        </div>
      </div>
    </div>
  );
};
