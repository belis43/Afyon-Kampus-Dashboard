import { supabase } from '../lib/supabase';

export const mockFaculties = [
  { name: 'Eğitim Fakültesi', code: 'EGT', normal_electricity_kwh: 15000, normal_water_m3: 800, normal_gas_m3: 1200 },
  { name: 'Fen Edebiyat Fakültesi', code: 'FEN', normal_electricity_kwh: 18000, normal_water_m3: 900, normal_gas_m3: 1500 },
  { name: 'Güzel Sanatlar Fakültesi', code: 'GSF', normal_electricity_kwh: 12000, normal_water_m3: 600, normal_gas_m3: 900 },
  { name: 'Hukuk Fakültesi', code: 'HUK', normal_electricity_kwh: 10000, normal_water_m3: 500, normal_gas_m3: 800 },
  { name: 'İktisadi ve İdari Bilimler Fakültesi', code: 'IIB', normal_electricity_kwh: 16000, normal_water_m3: 850, normal_gas_m3: 1300 },
  { name: 'İslami İlimler Fakültesi', code: 'ILH', normal_electricity_kwh: 11000, normal_water_m3: 550, normal_gas_m3: 850 },
  { name: 'Mühendislik Fakültesi', code: 'MUH', normal_electricity_kwh: 30000, normal_water_m3: 1500, normal_gas_m3: 2000 },
  { name: 'Veterinerlik Fakültesi', code: 'VET', normal_electricity_kwh: 31000, normal_water_m3: 1600, normal_gas_m3: 2100 },
  { name: 'Teknoloji Fakültesi', code: 'TEK', normal_electricity_kwh: 28000, normal_water_m3: 1400, normal_gas_m3: 1900 },
  { name: 'Turizm Fakültesi', code: 'TUR', normal_electricity_kwh: 13000, normal_water_m3: 700, normal_gas_m3: 1000 }
];

export const generateMonthlyData = (facultyId: string, facultyCode: string, normalElectricity: number, normalWater: number, normalGas: number) => {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
  const data = [];

  for (let i = 0; i < months.length; i++) {
    const variationElec = (Math.random() * 0.3 - 0.1);
    const variationWater = (Math.random() * 0.3 - 0.1);
    const variationGas = (Math.random() * 0.3 - 0.1);

    let electricityKwh = normalElectricity * (1 + variationElec);
    let waterM3 = normalWater * (1 + variationWater);
    let gasM3 = normalGas * (1 + variationGas);

    if ((facultyCode === 'MUH' || facultyCode === 'VET') && i === 4) {
      electricityKwh = normalElectricity * 1.18;
    }

    data.push({
      id: `mock-consumption-${facultyId}-${i}`,
      created_at: new Date().toISOString(),
      faculty_id: facultyId,
      month: months[i],
      year: 2024,
      electricity_kwh: Math.round(electricityKwh),
      water_m3: Math.round(waterM3),
      gas_m3: Math.round(gasM3),
      electricity_cost_tl: Math.round(electricityKwh * 3.5 * 100) / 100,
      water_cost_tl: Math.round(waterM3 * 12 * 100) / 100,
      gas_cost_tl: Math.round(gasM3 * 8 * 100) / 100
    });
  }

  return data;
};

export const seedDatabase = async () => {
  try {
    const { data: existingFaculties } = await supabase
      .from('faculties')
      .select('id')
      .limit(1);

    if (existingFaculties && existingFaculties.length > 0) {
      console.log('Database already seeded');
      return { success: true, message: 'Database already contains data' };
    }

    const { data: insertedFaculties, error: facultiesError } = await supabase
      .from('faculties')
      .insert(mockFaculties)
      .select();

    if (facultiesError) throw facultiesError;

    const consumptionData = [];
    for (const faculty of insertedFaculties!) {
      const originalFaculty = mockFaculties.find(f => f.code === faculty.code)!;
      const monthlyData = generateMonthlyData(
        faculty.id,
        faculty.code,
        originalFaculty.normal_electricity_kwh,
        originalFaculty.normal_water_m3,
        originalFaculty.normal_gas_m3
      );
      consumptionData.push(...monthlyData);
    }

    const { error: consumptionError } = await supabase
      .from('energy_consumption')
      .insert(consumptionData);

    if (consumptionError) throw consumptionError;

    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};
