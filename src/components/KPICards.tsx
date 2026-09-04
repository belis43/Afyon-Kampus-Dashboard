import { TrendingDown, Leaf, Banknote } from 'lucide-react';
import type { KPIMetrics } from '../utils/analysis';

interface KPICardsProps {
  metrics: KPIMetrics;
}

export const KPICards = ({ metrics }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Toplam Karbon Ayak İzi</h3>
          </div>
        </div>
        <p className="text-3xl font-bold text-green-600">
          {metrics.totalCarbonFootprint.toLocaleString('tr-TR')} kg
        </p>
        <p className="text-sm text-gray-500 mt-2">CO₂ Emisyonu</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Toplam Tasarruf Oranı</h3>
          </div>
        </div>
        <p className="text-3xl font-bold text-blue-600">
          %{metrics.totalSavingsRate.toLocaleString('tr-TR')}
        </p>
        <p className="text-sm text-gray-500 mt-2">Hedef Tüketime Göre</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Banknote className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700">Aylık Toplam Maliyet</h3>
          </div>
        </div>
        <p className="text-3xl font-bold text-orange-600">
          {metrics.monthlyTotalCost.toLocaleString('tr-TR')} ₺
        </p>
        <p className="text-sm text-gray-500 mt-2">Toplam Fatura Tutarı</p>
      </div>
    </div>
  );
};