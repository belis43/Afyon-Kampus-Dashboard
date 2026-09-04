/*
  # Green Campus Energy Tracking Database Schema

  1. New Tables
    - `faculties`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Faculty name
      - `code` (text, unique) - Faculty code
      - `normal_electricity_kwh` (numeric) - Normal monthly electricity consumption baseline
      - `normal_water_m3` (numeric) - Normal monthly water consumption baseline
      - `normal_gas_m3` (numeric) - Normal monthly natural gas consumption baseline
      - `created_at` (timestamptz)
    
    - `energy_consumption`
      - `id` (uuid, primary key)
      - `faculty_id` (uuid, foreign key to faculties)
      - `month` (text) - Month name (e.g., "Ocak", "Şubat")
      - `year` (integer) - Year
      - `electricity_kwh` (numeric) - Electricity consumption in kWh
      - `water_m3` (numeric) - Water consumption in m³
      - `gas_m3` (numeric) - Natural gas consumption in m³
      - `electricity_cost_tl` (numeric) - Electricity cost in TL
      - `water_cost_tl` (numeric) - Water cost in TL
      - `gas_cost_tl` (numeric) - Gas cost in TL
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (dashboard is public)
*/

CREATE TABLE IF NOT EXISTS faculties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  normal_electricity_kwh numeric DEFAULT 0,
  normal_water_m3 numeric DEFAULT 0,
  normal_gas_m3 numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS energy_consumption (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id uuid NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
  month text NOT NULL,
  year integer NOT NULL,
  electricity_kwh numeric DEFAULT 0,
  water_m3 numeric DEFAULT 0,
  gas_m3 numeric DEFAULT 0,
  electricity_cost_tl numeric DEFAULT 0,
  water_cost_tl numeric DEFAULT 0,
  gas_cost_tl numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(faculty_id, month, year)
);

ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_consumption ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Faculties are publicly readable"
  ON faculties FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Energy consumption is publicly readable"
  ON energy_consumption FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can insert faculties"
  ON faculties FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can insert energy consumption"
  ON energy_consumption FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_energy_consumption_faculty_id ON energy_consumption(faculty_id);
CREATE INDEX IF NOT EXISTS idx_energy_consumption_month_year ON energy_consumption(month, year);