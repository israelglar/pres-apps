import { Calendar, Check, ChevronLeft, Save, Users, X } from "lucide-react";
import type { TouchEventHandler } from "react";
import { useState } from "react";

const AttendanceApp = () => {
  const [currentScreen, setCurrentScreen] = useState("date-selection");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
  const [attendance, setAttendance] = useState({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  // Lista de pessoas baseada na sua planilha
  const people = [
    { name: "Alice Lopes de Matos", status: "P" },
    { name: "Alice Vieira Carvalho", status: "P" },
    { name: "Ana Margarida Cerejo Brito", status: "F" },
    { name: "Andrés James Jouk Ayeek", status: "P" },
    { name: "Beatriz Oliveira", status: "F" },
    { name: "Benjamin Miguel dos Santos Costa", status: "P" },
    { name: "Catarina Oliveira", status: "F" },
    { name: "Cristina Janeiro Cardoso", status: "P" },
    { name: "Davi Mendes", status: "F" },
    { name: "Duarte Carvalho de Menezes", status: "F" },
    { name: "Eliana Sharp", status: "F" },
    { name: "Eros Kasumy de Carvalho Brito", status: "P" },
    { name: "Gabriel Pedrosa", status: "P" },
    { name: "Gabriel David Rodrigues", status: "P" },
    { name: "Guilherme Dayves Bernardo", status: "P" },
    { name: "Guilherme Campos Borges de Brito Gomes", status: "P" },
    { name: "Gustavo da Luz", status: "F" },
    { name: "Isadora Barbosa de Andrade", status: "" },
    { name: "Joel Omer", status: "P" },
    { name: "Jônatas Nunes Alves", status: "F" },
    { name: "Lara Almeida Vieira", status: "F" },
    { name: "Laura Maria Teixeira Barros", status: "F" },
    { name: "Laura Batista Coutinho", status: "P" },
    { name: "Leonor Paz Rodrigues", status: "P" },
    { name: "Leonor Mealheiro", status: "P" },
    { name: "Lia Costa Antunes", status: "P" },
    { name: "Lukian Lekontsev", status: "P" },
    { name: "Madalena Alves Calaim", status: "F" },
    { name: "Madalena Valentim Pires", status: "P" },
    { name: "Manuel Antunes Relvas Gonçalves Saraiva", status: "F" },
    { name: "Maria Antunes Relvas Gonçalves Saraiva", status: "F" },
    { name: "Maria Leonor de Castro Gonçalves", status: "F" },
    { name: "Mateus Santos", status: "" },
    { name: "Mel Magnus Rocha", status: "P" },
    { name: "Moisés Fernandes Fragoso da Costa", status: "P" },
    { name: "Nicolas Luca Azevedo Silva", status: "P" },
    { name: "Nina de Moura Pereira", status: "P" },
    { name: "Paulo Reginaldo Augusto Rodrigues de Gouveia", status: "P" },
    { name: "Pedro Levi Rocha Fidalgo", status: "F" },
    { name: "Pietro Di Tommaso Busto", status: "P" },
    { name: "Salvador Pereira Nicho Santos Gomes", status: "P" },
    { name: "Sarah Fidalgo", status: "F" },
    { name: "Theo Valente Sampaio", status: "F" },
    { name: "Victor Toledo Cassiano", status: "F" },
    { name: "Yasmin Luana Nery Lobo", status: "P" },
  ];

  const minSwipeDistance = 50;

  const onTouchStart: TouchEventHandler = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const onTouchMove: TouchEventHandler = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart && e.targetTouches[0].clientX) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? "left" : "right");
      }
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isRightSwipe) {
      markPresent();
    } else if (isLeftSwipe) {
      markAbsent();
    }

    setTimeout(() => setSwipeDirection(null), 300);
  };

  const markPresent = () => {
    setAttendance({
      ...attendance,
      [people[currentPersonIndex].name]: "P",
    });
    if (currentPersonIndex < people.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    }
  };

  const markAbsent = () => {
    setAttendance({
      ...attendance,
      [people[currentPersonIndex].name]: "F",
    });
    if (currentPersonIndex < people.length - 1) {
      setCurrentPersonIndex(currentPersonIndex + 1);
    }
  };

  const goBack = () => {
    if (currentPersonIndex > 0) {
      setCurrentPersonIndex(currentPersonIndex - 1);
    }
  };

  const saveToSheets = () => {
    alert(
      "Para integrar com Google Sheets:\n\n1. Use a API do Google Sheets\n2. Configure OAuth 2.0\n3. Use o método spreadsheets.values.update\n\nDados prontos para exportar:\n" +
        JSON.stringify({ date: selectedDate, attendance }, null, 2)
    );
  };

  const getSundayDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = -4; i <= 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i * 7);
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const sunday = new Date(date);
      sunday.setDate(date.getDate() + diff);

      const day = String(sunday.getDate()).padStart(2, "0");
      const month = String(sunday.getMonth() + 1).padStart(2, "0");
      dates.push(`${day}/${month}`);
    }

    return [...dates].sort((a, b) => {
      const [dayA, monthA] = a.split("/").map(Number);
      const [dayB, monthB] = b.split("/").map(Number);
      return monthA === monthB ? dayA - dayB : monthA - monthB;
    });
  };

  if (currentScreen === "date-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <Calendar className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Registro de Presença
            </h1>
            <p className="text-gray-600">Selecione o domingo</p>
          </div>

          <div className="space-y-3">
            {getSundayDates().map((date) => (
              <button
                key={date}
                onClick={() => {
                  setSelectedDate(date);
                  setCurrentScreen("attendance");
                }}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "attendance") {
    const currentPerson = people[currentPersonIndex];
    const progress = ((currentPersonIndex + 1) / people.length) * 100;
    const presentCount = Object.values(attendance).filter(
      (v) => v === "P"
    ).length;
    const absentCount = Object.values(attendance).filter(
      (v) => v === "F"
    ).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-lg p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setCurrentScreen("date-selection")}
                className="text-gray-600 hover:text-gray-800"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-600">Domingo</div>
                <div className="text-lg font-bold text-indigo-600">
                  {selectedDate}
                </div>
              </div>
              <button
                onClick={saveToSheets}
                className="text-indigo-600 hover:text-indigo-800"
              >
                <Save className="w-6 h-6" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-600">
                {currentPersonIndex + 1} de {people.length}
              </span>
              <div className="flex gap-4">
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> {presentCount}
                </span>
                <span className="text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" /> {absentCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-4">
          {currentPersonIndex < people.length ? (
            <div
              className={`max-w-md w-full transition-transform duration-300 ${
                swipeDirection === "right"
                  ? "translate-x-12 rotate-6"
                  : swipeDirection === "left"
                  ? "-translate-x-12 -rotate-6"
                  : ""
              }`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div className="bg-white rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
                {swipeDirection === "right" && (
                  <div className="absolute inset-0 bg-green-500 opacity-20 pointer-events-none" />
                )}
                {swipeDirection === "left" && (
                  <div className="absolute inset-0 bg-red-500 opacity-20 pointer-events-none" />
                )}

                <Users className="w-20 h-20 mx-auto text-indigo-600 mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-8">
                  {currentPerson.name}
                </h2>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={markAbsent}
                    className="flex-1 py-6 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-red-600 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <X className="w-6 h-6" />
                    Ausente
                  </button>
                  <button
                    onClick={markPresent}
                    className="flex-1 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check className="w-6 h-6" />
                    Presente
                  </button>
                </div>

                {currentPersonIndex > 0 && (
                  <button
                    onClick={goBack}
                    className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 mx-auto"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </button>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-sm">
                    Deslize → para presente ou ← para ausente
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Concluído!
              </h2>
              <p className="text-gray-600 mb-8">
                Todas as presenças foram registradas
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {presentCount}
                    </div>
                    <div className="text-sm text-gray-600">Presentes</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-600">
                      {absentCount}
                    </div>
                    <div className="text-sm text-gray-600">Ausentes</div>
                  </div>
                </div>
              </div>

              <button
                onClick={saveToSheets}
                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg mb-3"
              >
                Salvar no Google Sheets
              </button>

              <button
                onClick={() => {
                  setCurrentScreen("date-selection");
                  setCurrentPersonIndex(0);
                  setAttendance({});
                }}
                className="w-full py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Nova Sessão
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default AttendanceApp;
