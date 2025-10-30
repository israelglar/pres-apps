import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  Hand,
  Search,
  Eye,
} from 'lucide-react';
import { useDateSelectionLogic } from './DateSelectionPage.logic';
import {
  formatDate,
  getLessonLink,
  getLessonName,
} from '../../utils/helperFunctions';
import { theme, buttonClasses } from '../../config/theme';

interface DateSelectionPageProps {
  onDateSelected: (date: Date, method: 'search' | 'swipe') => void;
  onBack: () => void;
  allSundays: Date[];
  lessonNames: Record<string, string>;
  lessonLinks: Record<string, string>;
}

/**
 * Date Selection Page - Choose a date and method for attendance marking
 *
 * Features:
 * - Dropdown date picker
 * - Filter future lessons
 * - Method selection dialog (search vs swipe)
 * - Lesson name and link display
 */
export function DateSelectionPage({
  onDateSelected,
  onBack,
  allSundays,
  lessonNames,
  lessonLinks,
}: DateSelectionPageProps) {
  const logic = useDateSelectionLogic({ allSundays });

  return (
    <div className={`min-h-screen ${theme.gradients.background} flex items-center justify-center p-4`}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            Selecionar Data
          </h1>
          <p className={`${theme.text.primaryLight} text-base font-medium`}>
            Escolha o domingo para registar as presenças
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-5 mb-6">
          <div className="mb-5">
            <label className="block text-gray-800 font-bold mb-3 text-base">
              Data da Lição
            </label>

            {/* Custom Select Dropdown */}
            <div className="relative" ref={logic.dropdownRef}>
              <button
                type="button"
                onClick={() => logic.setIsOpen(!logic.isOpen)}
                className={`w-full px-4 py-3 text-base border-2 ${theme.borders.primary} rounded-xl focus:ring-4 ${theme.rings.primary} ${theme.borders.primaryFocus} cursor-pointer ${theme.gradients.cardNeutral} ${theme.borders.primaryHover} hover:from-cyan-50/50 hover:to-cyan-100/50 transition-all shadow-md hover:shadow-lg flex items-center justify-between`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${theme.backgrounds.primaryLight} p-1.5 rounded-lg`}>
                    <Calendar className={`w-5 h-5 ${theme.text.primary}`} />
                  </div>
                  <span className={`font-bold ${theme.text.neutralDarker} text-sm`}>
                    {formatDate(logic.selectedDate)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 ${theme.text.primary} transition-transform ${logic.isOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {logic.isOpen && (
                <div
                  ref={logic.dropdownListRef}
                  className={`absolute z-10 w-full mt-2 bg-white border-2 ${theme.borders.primary} rounded-xl shadow-2xl max-h-80 overflow-y-auto`}
                >
                  {logic.filteredSundays.map((sunday) => {
                    const isSelected =
                      sunday.toDateString() === logic.selectedDate.toDateString();
                    const dateLabel = logic.getDateLabel(sunday);

                    return (
                      <button
                        key={sunday.toISOString()}
                        ref={isSelected ? logic.selectedItemRef : null}
                        type="button"
                        onClick={() => {
                          logic.setSelectedDate(sunday);
                          logic.setIsOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-cyan-50 transition-all flex items-center justify-between border-b ${theme.borders.neutralLight} last:border-b-0 first:rounded-t-xl last:rounded-b-xl ${
                          isSelected
                            ? theme.gradients.selectedItem
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full transition-all ${isSelected ? `${theme.backgrounds.primary} scale-125` : `${theme.backgrounds.neutral}`}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-sm ${isSelected ? theme.text.primaryDarker : theme.text.neutralDarker}`}
                              >
                                {formatDate(sunday)}
                              </span>
                              {dateLabel && (
                                <span className={`px-2 py-0.5 text-xs font-bold ${theme.gradients.badge} text-white rounded-full shadow-sm`}>
                                  {dateLabel}
                                </span>
                              )}
                            </div>
                            <span
                              className={`text-xs ${isSelected ? `${theme.text.primaryDark} font-medium` : theme.text.neutral}`}
                            >
                              {getLessonName(sunday, lessonNames)}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className={`${theme.backgrounds.primaryLight} p-1 rounded-full`}>
                            <Check className={`w-4 h-4 ${theme.text.primary}`} />
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Show Future Lessons Toggle */}
                  {!logic.showFutureLessons && (
                    <button
                      type="button"
                      onClick={() => logic.setShowFutureLessons(true)}
                      className="w-full px-4 py-3 text-left border-t-2 border-emerald-200 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all flex items-center justify-center gap-2 last:rounded-b-xl"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-sm text-blue-700">
                        Ver Lições Futuras
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`${theme.gradients.cardHighlight} border-2 ${theme.borders.primary} rounded-xl p-4 mb-5 shadow-inner`}>
            <div className="flex items-center justify-center">
              <div className="bg-white p-2 rounded-xl shadow-md mr-3">
                <Calendar className={`w-10 h-10 ${theme.text.primary}`} />
              </div>
              <div>
                <p className={`${theme.text.primaryDark} text-xs font-bold uppercase tracking-wide`}>
                  Data Selecionada
                </p>
                <p className={`text-xl font-bold ${theme.text.primaryDarker} my-0.5`}>
                  {formatDate(logic.selectedDate)}
                </p>
                {getLessonLink(logic.selectedDate, lessonLinks) ? (
                  <a
                    href={getLessonLink(logic.selectedDate, lessonLinks)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${theme.text.primaryDark} font-semibold text-sm ${theme.text.primaryDarker} hover:underline flex items-center gap-1 transition-colors`}
                  >
                    {getLessonName(logic.selectedDate, lessonNames)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <p className={`${theme.text.primaryDark} font-semibold text-sm`}>
                    {getLessonName(logic.selectedDate, lessonNames)}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBack}
              className={`flex-1 px-5 py-3 ${buttonClasses.secondary} text-base flex items-center justify-center`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </button>
            <button
              onClick={() => logic.setShowMethodDialog(true)}
              className={`flex-1 px-5 py-3 ${buttonClasses.primary} text-base flex items-center justify-center`}
            >
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Method Selection Dialog */}
      {logic.showMethodDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Escolher Método
            </h2>
            <p className="text-gray-600 mb-6">
              Como preferes registar as presenças?
            </p>

            <div className="space-y-3">
              {/* Search Method - DEFAULT */}
              <button
                onClick={() => onDateSelected(logic.selectedDate, 'search')}
                className={`w-full p-4 bg-gradient-to-r from-blue-100 to-indigo-100 border-2 ${theme.borders.secondary} rounded-xl hover:from-blue-100 hover:to-indigo-100 hover:border-blue-500 hover:shadow-lg transition-all text-left group relative shadow-md`}
              >
                {/* Recommended Badge */}
                <div className={`absolute -top-2 -right-2 ${theme.gradients.badge} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                  Recomendado
                </div>
                <div className="flex items-start gap-3">
                  <div className={`${theme.backgrounds.secondary} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${theme.text.neutralDarker} text-lg mb-1`}>
                      Procurar por Nome
                    </h3>
                    <p className={`text-sm ${theme.text.neutral}`}>
                      Procura e seleciona cada aluno presente. Ideal para
                      registar pela ordem em que estão sentados.
                    </p>
                  </div>
                </div>
              </button>

              {/* Swipe Method */}
              <button
                onClick={() => onDateSelected(logic.selectedDate, 'swipe')}
                className={`w-full p-4 ${theme.gradients.cardHighlight} border-2 ${theme.borders.primary} rounded-xl hover:from-cyan-100 hover:to-blue-100 ${theme.borders.primaryHover} hover:shadow-lg transition-all text-left group`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${theme.backgrounds.primary} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                    <Hand className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold ${theme.text.neutralDarker} text-lg mb-1`}>
                      Método Tradicional
                    </h3>
                    <p className={`text-sm ${theme.text.neutral}`}>
                      Percorre todos por ordem alfabética e desliza para marcar
                      presente ou falta.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => logic.setShowMethodDialog(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
