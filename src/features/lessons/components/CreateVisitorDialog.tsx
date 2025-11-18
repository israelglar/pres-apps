import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { theme, buttonClasses } from '../../../config/theme';

interface CreateVisitorDialogProps {
  onConfirm: (visitorName: string) => void;
  onCancel: () => void;
  isCreating: boolean;
  initialName?: string;
}

/**
 * Create Visitor Dialog - Prompts for visitor name and creates as visitor student
 */
export function CreateVisitorDialog({
  onConfirm,
  onCancel,
  isCreating,
  initialName = '',
}: CreateVisitorDialogProps) {
  const [visitorName, setVisitorName] = useState(initialName);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmedName = visitorName.trim();

    if (!trimmedName) {
      setError('Por favor, insere o nome do visitante');
      return;
    }

    if (trimmedName.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    setError('');
    onConfirm(trimmedName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCreating) {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in">
        {/* Header */}
        <div className={`${theme.solids.primaryButton} p-5 rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <UserPlus className={`w-6 h-6 ${theme.text.onPrimaryButton}`} />
            <h2 className={`text-xl font-bold ${theme.text.onPrimaryButton}`}>
              Adicionar Visitante
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className={`text-sm ${theme.text.neutral} mb-4`}>
            O visitante será criado e adicionado como <strong>Presente</strong> automaticamente.
          </p>

          {/* Name Input */}
          <div className="mb-4">
            <label className={`block text-xs font-bold ${theme.text.primary} mb-2`}>
              Nome do Visitante
            </label>
            <input
              type="text"
              value={visitorName}
              onChange={(e) => {
                setVisitorName(e.target.value);
                setError('');
              }}
              onKeyPress={handleKeyPress}
              placeholder="Nome completo..."
              disabled={isCreating}
              autoFocus
              className={`w-full px-4 py-3 rounded-xl border ${
                error
                  ? `${theme.borders.error} ${theme.backgrounds.error}`
                  : `${theme.borders.primary} focus:${theme.borders.primaryFocus}`
              } ${theme.text.primary} text-sm placeholder:${theme.text.neutralLight} transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {error && (
              <div className="flex items-start gap-2 mt-2">
                <AlertCircle className={`w-4 h-4 ${theme.text.error} flex-shrink-0 mt-0.5`} />
                <p className={`text-xs ${theme.text.error}`}>{error}</p>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className={`${theme.backgrounds.primaryLighter} border ${theme.borders.primaryLight} rounded-xl p-3 mb-5`}>
            <p className={`text-xs ${theme.text.primary}`}>
              <strong>Nota:</strong> O visitante ficará marcado com um indicador roxo e pode ser convertido para estudante regular mais tarde.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 ${buttonClasses.secondary} text-sm`}
              disabled={isCreating}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className={`flex-1 ${buttonClasses.primary} text-sm flex items-center justify-center`}
              disabled={isCreating || !visitorName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A criar...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar e Adicionar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
