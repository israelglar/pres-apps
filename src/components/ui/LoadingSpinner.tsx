import { Loader2 } from "lucide-react";
import { theme } from "@/config/theme";

export const LoadingSpinner = () => {
  return (
    <div className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-12">
          <Loader2 className={`w-16 h-16 ${theme.text.primary} mx-auto mb-4 animate-spin`} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            A carregar...
          </h2>
          <p className="text-gray-600">
            A obter dados
          </p>
        </div>
      </div>
    </div>
  );
};
