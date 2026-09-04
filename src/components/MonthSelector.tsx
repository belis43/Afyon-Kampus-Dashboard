import { Calendar } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const MonthSelector = ({ selectedMonth, onMonthChange, availableMonths }: MonthSelectorProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Dönem Seçimi</h3>
            <p className="text-sm text-gray-600">Analiz etmek istediğiniz ayı seçin</p>
          </div>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-medium
                     hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all cursor-pointer shadow-sm"
        >
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {month} 2025
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};