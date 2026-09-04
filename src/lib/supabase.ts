import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Faculty {
  id: string;
  name: string;
  code: string;
  normal_electricity_kwh: number;
  normal_water_m3: number;
  normal_gas_m3: number;
  created_at: string;
}

export interface EnergyConsumption {
  id: string;
  faculty_id: string;
  month: string;
  year: number;
  electricity_kwh: number;
  water_m3: number;
  gas_m3: number;
  electricity_cost_tl: number;
  water_cost_tl: number;
  gas_cost_tl: number;
  created_at: string;
}
