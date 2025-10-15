import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  formatDate,
  getClosestSunday,
  getLessonName,
} from "../utils/helperFunctions";

export const DateSelectionPage = ({
  onDateSelected,
  onBack,
  allSundays,
  lessonNames,
}) => {
  const [selectedDate, setSelectedDate] = useState(getClosestSunday());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const closestSunday = getClosestSunday();

  const isToday = (date: Date) => {
    return date.toDateString() === closestSunday.toDateString();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Selecionar Data
          </h1>
          <p className="text-emerald-50 text-lg">
            Escolha o domingo para registar as presenças
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-lg">
              Data da Lição
            </label>

            {/* Custom Select Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                  <span className="font-semibold text-gray-800">
                    {formatDate(selectedDate)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                  {allSundays.map((sunday) => {
                    const isSelected =
                      sunday.toDateString() === selectedDate.toDateString();
                    const isCurrent = isToday(sunday);

                    return (
                      <button
                        key={sunday.toISOString()}
                        type="button"
                        onClick={() => {
                          setSelectedDate(sunday);
                          setIsOpen(false);
                        }}
                        className={`w-full px-6 py-4 text-left hover:bg-emerald-50 transition-colors flex items-center justify-between border-b border-gray-100 last:border-b-0 ${
                          isSelected ? "bg-emerald-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${isSelected ? "bg-emerald-600" : "bg-transparent"}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-gray-800">
                                {formatDate(sunday)}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500 text-white rounded-full">
                                  Atual
                                </span>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">
                              {getLessonName(sunday, lessonNames)}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-6 h-6 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center">
              <Calendar className="w-16 h-16 text-emerald-600 mr-4" />
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Data Selecionada
                </p>
                <p className="text-3xl font-bold text-emerald-700">
                  {formatDate(selectedDate)}
                </p>
                <p className="text-emerald-600 font-medium">
                  {getLessonName(selectedDate, lessonNames)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-300 active:scale-95 transition-all flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <button
              onClick={() => onDateSelected(selectedDate)}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:shadow-lg active:scale-95 transition-all flex items-center justify-center"
            >
              Continuar
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
