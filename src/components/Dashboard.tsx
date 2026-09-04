import { useEffect, useState } from 'react';
import { supabase, type Faculty, type EnergyConsumption } from '../lib/supabase';
import { seedDatabase, mockFaculties, generateMonthlyData } from '../utils/seedData';
import {
  calculateKPIs,
  detectAnomalies,
  calculateGreenScores,
  type FacultyWithConsumption,
  type KPIMetrics,
  type Anomaly,
  type GreenScore
} from '../utils/analysis';
import { KPICards } from './KPICards';
import { AnomalyAlerts } from './AnomalyAlerts';
import { Leaderboard } from './Leaderboard';
import { ConsumptionChart } from './ConsumptionChart';
import { MotivationalReport } from './MotivationalReport';
import { MonthSelector } from './MonthSelector';
import { Loader2 } from 'lucide-react';

export const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<FacultyWithConsumption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('Mayıs');
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [greenScores, setGreenScores] = useState<GreenScore[]>([]);

  const availableMonths = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];

  useEffect(() => {
    initializeDashboard();
  }, []);

  useEffect(() => {
    if (faculties.length > 0) {
      analyzeData();
    }
  }, [selectedMonth, faculties]);

  const initializeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      await seedDatabase();

      const { data: facultiesData, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .order('name');

      if (facultiesError) throw facultiesError;

      const { data: consumptionData, error: consumptionError } = await supabase
        .from('energy_consumption')
        .select('*');

      if (consumptionError) throw consumptionError;

      const facultiesWithConsumption: FacultyWithConsumption[] = (facultiesData as Faculty[]).map(faculty => ({
        ...faculty,
        consumption: (consumptionData as EnergyConsumption[]).filter(c => c.faculty_id === faculty.id)
      }));

      setFaculties(facultiesWithConsumption);
    } catch (err: any) {
      console.warn('Supabase fetch failed, falling back to mock data:', err);
      const mockData: FacultyWithConsumption[] = mockFaculties.map((faculty, index) => {
        const id = `mock-faculty-${index}`;
        return {
          ...faculty,
          id,
          created_at: new Date().toISOString(),
          consumption: generateMonthlyData(id, faculty.code, faculty.normal_electricity_kwh, faculty.normal_water_m3, faculty.normal_gas_m3)
        };
      });
      setFaculties(mockData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = () => {
    const kpis = calculateKPIs(faculties, selectedMonth);
    const detectedAnomalies = detectAnomalies(faculties, selectedMonth);
    const scores = calculateGreenScores(faculties, selectedMonth);

    setKpiMetrics(kpis);
    setAnomalies(detectedAnomalies);
    setGreenScores(scores);
  };

  const getTotals = () => {
    let totalElectricity = 0;
    let totalWater = 0;

    faculties.forEach(faculty => {
      const monthData = faculty.consumption.find(c => c.month === selectedMonth);
      if (monthData) {
        totalElectricity += monthData.electricity_kwh;
        totalWater += monthData.water_m3;
      }
    });

    return { totalElectricity, totalWater };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-800 mb-2">Hata</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const { totalElectricity, totalWater } = getTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Afyon Kocatepe Üniversitesi
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-green-600 mb-2">
            Yeşil Kampüs ve Enerji Takip Sistemi
          </h2>
          <p className="text-gray-600 text-lg">
            Sürdürülebilir bir gelecek için birlikte ilerliyoruz
          </p>
        </header>

        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
        />

        {kpiMetrics && (
          <>
            <KPICards metrics={kpiMetrics} />
            <AnomalyAlerts anomalies={anomalies} />
            <Leaderboard scores={greenScores} />
            <ConsumptionChart faculties={faculties} selectedMonth={selectedMonth} />
            <MotivationalReport
              metrics={kpiMetrics}
              totalElectricity={totalElectricity}
              totalWater={totalWater}
            />
          </>
        )}

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>Dijital Vatandaşlık ve Sürdürülebilirlik Bilinci ile</p>
          <p className="mt-1">AKÜ Yeşil Kampüs İnisiyatifi © 2024</p>
        </footer>
      </div>
    </div>
  );
};
