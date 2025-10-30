import { AlertCircle, Loader2 } from "lucide-react";

interface SavingOverlayProps {
  error: string | null;
  onRetry: () => void;
}

export const SavingOverlay = ({ error, onRetry }: SavingOverlayProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Erro ao Guardar
            </h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={onRetry}
              className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg active:scale-95 transition-all"
            >
              Voltar ao Início
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-16 h-16 text-emerald-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              A Guardar...
            </h2>
            <p className="text-gray-600">
              A enviar presenças para Google Sheets
            </p>
          </>
        )}
      </div>
    </div>
  );
};
