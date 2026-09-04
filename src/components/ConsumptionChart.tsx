import { Zap, Droplet, Flame } from 'lucide-react';
import type { FacultyWithConsumption } from '../utils/analysis';

interface ConsumptionChartProps {
  faculties: FacultyWithConsumption[];
  selectedMonth: string;
}

export const ConsumptionChart = ({ faculties, selectedMonth }: ConsumptionChartProps) => {
  const getMaxValues = () => {
    let maxElec = 0, maxWater = 0, maxGas = 0;

    faculties.forEach(faculty => {
      const monthData = faculty.consumption.find(c => c.month === selectedMonth);
      if (monthData) {
        maxElec = Math.max(maxElec, monthData.electricity_kwh);
        maxWater = Math.max(maxWater, monthData.water_m3);
        maxGas = Math.max(maxGas, monthData.gas_m3);
      }
    });

    return { maxElec, maxWater, maxGas };
  };

  const { maxElec, maxWater, maxGas } = getMaxValues();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Fakülte Bazlı Tüketim Karşılaştırması - {selectedMonth} 2024
      </h2>

      <div className="space-y-6">
        {faculties.map((faculty, index) => {
          const monthData = faculty.consumption.find(c => c.month === selectedMonth);
          if (!monthData) return null;

          const elecPercent = (monthData.electricity_kwh / maxElec) * 100;
          const waterPercent = (monthData.water_m3 / maxWater) * 100;
          const gasPercent = (monthData.gas_m3 / maxGas) * 100;

          const isOverNormal =
            monthData.electricity_kwh > faculty.normal_electricity_kwh * 1.15 ||
            monthData.water_m3 > faculty.normal_water_m3 * 1.15 ||
            monthData.gas_m3 > faculty.normal_gas_m3 * 1.15;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                isOverNormal ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
              } hover:shadow-md transition-all`}
            >
              <h3 className="font-semibold text-gray-800 mb-4">{faculty.name}</h3>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">Elektrik</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {monthData.electricity_kwh.toLocaleString('tr-TR')} kWh
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full transition-all duration-500"
                      style={{ width: `${elecPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Droplet className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Su</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {monthData.water_m3.toLocaleString('tr-TR')} m³
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-500"
                      style={{ width: `${waterPercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">Doğal Gaz</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {monthData.gas_m3.toLocaleString('tr-TR')} m³
                    </span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full transition-all duration-500"
                      style={{ width: `${gasPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Toplam Maliyet:</span>
                  <span className="font-bold text-gray-800">
                    {(monthData.electricity_cost_tl + monthData.water_cost_tl + monthData.gas_cost_tl).toLocaleString('tr-TR')} ₺
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
