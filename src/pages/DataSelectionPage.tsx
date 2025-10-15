import { ArrowLeft, ArrowRight, Calendar } from "lucide-react";
import { useState } from "react";
import {
  formatDate,
  formatDateLong,
  getClosestSunday,
} from "../utils/helperFunctions";

export const DateSelectionPage = ({ onDateSelected, onBack, allSundays }) => {
  const [selectedDate, setSelectedDate] = useState(getClosestSunday());

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
            <select
              value={selectedDate.toISOString()}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="w-full px-6 py-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
            >
              {allSundays.map((sunday) => (
                <option
                  key={sunday.toISOString()}
                  value={sunday.toISOString()}
                  selected={
                    sunday.toDateString() === getClosestSunday().toDateString()
                  }
                >
                  {formatDateLong(sunday)}
                </option>
              ))}
            </select>
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
                  {formatDateLong(selectedDate)}
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
