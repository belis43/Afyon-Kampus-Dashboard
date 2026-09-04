import type { Faculty, EnergyConsumption } from '../lib/supabase';

export interface FacultyWithConsumption extends Faculty {
  consumption: EnergyConsumption[];
}

export interface KPIMetrics {
  totalCarbonFootprint: number;
  totalSavingsRate: number;
  monthlyTotalCost: number;
}

export interface Anomaly {
  facultyName: string;
  resourceType: 'elektrik' | 'su' | 'doğal gaz';
  percentageOver: number;
  month: string;
}

export interface GreenScore {
  facultyName: string;
  score: number;
  savingsRate: number;
}

const CARBON_FACTORS = {
  electricity: 0.47,
  water: 0.298,
  gas: 2.3
};

export const calculateKPIs = (faculties: FacultyWithConsumption[], targetMonth: string): KPIMetrics => {
  let totalCarbonFootprint = 0;
  let totalActualCost = 0;
  let totalNormalCost = 0;

  faculties.forEach(faculty => {
    const monthData = faculty.consumption.find(c => c.month === targetMonth);
    if (!monthData) return;

    const carbonFromElectricity = monthData.electricity_kwh * CARBON_FACTORS.electricity;
    const carbonFromWater = monthData.water_m3 * CARBON_FACTORS.water;
    const carbonFromGas = monthData.gas_m3 * CARBON_FACTORS.gas;

    totalCarbonFootprint += carbonFromElectricity + carbonFromWater + carbonFromGas;
    totalActualCost += monthData.electricity_cost_tl + monthData.water_cost_tl + monthData.gas_cost_tl;

    const normalElecCost = faculty.normal_electricity_kwh * 3.5;
    const normalWaterCost = faculty.normal_water_m3 * 12;
    const normalGasCost = faculty.normal_gas_m3 * 8;
    totalNormalCost += normalElecCost + normalWaterCost + normalGasCost;
  });

  const totalSavingsRate = totalNormalCost > 0
    ? ((totalNormalCost - totalActualCost) / totalNormalCost) * 100
    : 0;

  return {
    totalCarbonFootprint: Math.round(totalCarbonFootprint),
    totalSavingsRate: Math.round(totalSavingsRate * 10) / 10,
    monthlyTotalCost: Math.round(totalActualCost * 100) / 100
  };
};

export const detectAnomalies = (faculties: FacultyWithConsumption[], targetMonth: string): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  const threshold = 0.15;

  faculties.forEach(faculty => {
    const monthData = faculty.consumption.find(c => c.month === targetMonth);
    if (!monthData) return;

    const elecDiff = (monthData.electricity_kwh - faculty.normal_electricity_kwh) / faculty.normal_electricity_kwh;
    if (elecDiff > threshold) {
      anomalies.push({
        facultyName: faculty.name,
        resourceType: 'elektrik',
        percentageOver: Math.round(elecDiff * 100),
        month: targetMonth
      });
    }

    const waterDiff = (monthData.water_m3 - faculty.normal_water_m3) / faculty.normal_water_m3;
    if (waterDiff > threshold) {
      anomalies.push({
        facultyName: faculty.name,
        resourceType: 'su',
        percentageOver: Math.round(waterDiff * 100),
        month: targetMonth
      });
    }

    const gasDiff = (monthData.gas_m3 - faculty.normal_gas_m3) / faculty.normal_gas_m3;
    if (gasDiff > threshold) {
      anomalies.push({
        facultyName: faculty.name,
        resourceType: 'doğal gaz',
        percentageOver: Math.round(gasDiff * 100),
        month: targetMonth
      });
    }
  });

  return anomalies;
};

export const calculateGreenScores = (faculties: FacultyWithConsumption[], targetMonth: string): GreenScore[] => {
  const scores: GreenScore[] = [];

  faculties.forEach(faculty => {
    const monthData = faculty.consumption.find(c => c.month === targetMonth);
    if (!monthData) return;

    const actualConsumption =
      (monthData.electricity_kwh / faculty.normal_electricity_kwh) * 0.4 +
      (monthData.water_m3 / faculty.normal_water_m3) * 0.3 +
      (monthData.gas_m3 / faculty.normal_gas_m3) * 0.3;

    const savingsRate = (1 - actualConsumption) * 100;
    const score = Math.max(0, Math.min(100, 100 - (actualConsumption - 1) * 100));

    scores.push({
      facultyName: faculty.name,
      score: Math.round(score),
      savingsRate: Math.round(savingsRate * 10) / 10
    });
  });

  return scores.sort((a, b) => b.score - a.score);
};

export const getEnergyComparison = (kwh: number): string => {
  const phoneCharges = Math.round(kwh / 0.015);
  return `Bu elektrikle ${phoneCharges.toLocaleString('tr-TR')} telefon şarj edilebilirdi`;
};

export const getWaterComparison = (m3: number): string => {
  const bottleCount = Math.round(m3 * 1000);
  return `${bottleCount.toLocaleString('tr-TR')} litre su - yaklaşık ${Math.round(bottleCount / 500)} adet 0.5L su şişesi`;
};

export const getTreeEquivalent = (carbonKg: number): number => {
  return Math.round(carbonKg / 21);
};