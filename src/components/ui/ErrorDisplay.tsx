import { AlertCircle, RefreshCw } from "lucide-react";
import { theme } from "@/config/theme";

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ message, onRetry }: ErrorDisplayProps) => {
  return (
    <div className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}>
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Erro ao Carregar
          </h2>
          <p className="text-gray-600 mb-8">{message}</p>
          <button
            onClick={onRetry}
            className={`w-full px-6 py-4 ${theme.gradients.activeItem} text-white rounded-xl font-semibold text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2`}
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};
