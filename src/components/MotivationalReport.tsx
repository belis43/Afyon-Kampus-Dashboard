import { Sparkles, TreeDeciduous, Phone, Droplet } from 'lucide-react';
import { getEnergyComparison, getWaterComparison, getTreeEquivalent } from '../utils/analysis';
import type { KPIMetrics } from '../utils/analysis';

interface MotivationalReportProps {
  metrics: KPIMetrics;
  totalElectricity: number;
  totalWater: number;
}

export const MotivationalReport = ({ metrics, totalElectricity, totalWater }: MotivationalReportProps) => {
  const treeCount = getTreeEquivalent(metrics.totalCarbonFootprint);
  const phoneComparison = getEnergyComparison(totalElectricity);
  const waterComparison = getWaterComparison(totalWater);

  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-green-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-white rounded-full shadow-md">
          <Sparkles className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Sürdürülebilirlik Raporu
        </h2>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <TreeDeciduous className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Karbon Ayak İzimiz</h3>
              <p className="text-gray-700 leading-relaxed">
                Bu ay kampüsümüzün toplam karbon ayak izi{' '}
                <span className="font-bold text-green-600">
                  {metrics.totalCarbonFootprint.toLocaleString('tr-TR')} kg CO₂
                </span>
                . Bu miktardaki karbonu emmek için yaklaşık{' '}
                <span className="font-bold text-green-600">{treeCount} ağacın</span> bir yıl boyunca çalışması gerekiyor.
                Her tasarruf, kampüsümüzde daha fazla ağacın nefes alması demek!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
              <Phone className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Elektrik Tüketimimiz</h3>
              <p className="text-gray-700 leading-relaxed">
                {phoneComparison}! Akıllı tüketim alışkanlıklarımızla bu enerjiyi daha verimli kullanabiliriz.
                Odalardan çıkarken ışıkları kapatmayı unutmayalım.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Droplet className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Su Tüketimimiz</h3>
              <p className="text-gray-700 leading-relaxed">
                Bu ay kullandığımız su: {waterComparison}. Su, hayatın kaynağı. Her damla değerli!
              </p>
            </div>
          </div>
        </div>

        {metrics.totalSavingsRate > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 shadow-lg text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Sparkles className="w-6 h-6" />
              <h3 className="font-bold text-xl">Tebrikler AKÜ Ailesi!</h3>
            </div>
            <p className="text-lg leading-relaxed">
              Bu ay <span className="font-bold">%{metrics.totalSavingsRate.toLocaleString('tr-TR')}</span> tasarruf sağladık!
              Tasarrufumuz sayesinde kampüsümüzde <span className="font-bold">{Math.round(treeCount * (metrics.totalSavingsRate / 100))} ağaç daha</span> nefes alıyor.
              Birlikte daha yeşil bir gelecek inşa ediyoruz!
            </p>
          </div>
        )}

        {metrics.totalSavingsRate < 0 && (
          <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-6 shadow-md">
            <h3 className="font-bold text-orange-800 mb-2">Dikkat: Hedefin Üzerinde Tüketim</h3>
            <p className="text-orange-700 leading-relaxed">
              Bu ay normalden daha fazla tüketim yaptık. Hep birlikte küçük değişiklikler yaparak
              farkı yaratabiliriz. Işıkları kapatmak, suyu dikkatli kullanmak gibi basit adımlar
              büyük tasarruflar sağlar!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
