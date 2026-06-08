-- ============================================================
-- VehicleCare+ Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Profiles table (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vehicle_no TEXT NOT NULL,
  vehicle_type TEXT CHECK (vehicle_type IN ('Car', 'Bike')) NOT NULL,
  model TEXT NOT NULL,
  maintenance_type TEXT NOT NULL DEFAULT 'Oil Change',
  current_km INTEGER NOT NULL CHECK (current_km >= 0),
  next_service_km INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If vehicles table already exists, add maintenance_type column:
-- ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS maintenance_type TEXT NOT NULL DEFAULT 'Oil Change';


-- 3. Service Logs table
CREATE TABLE IF NOT EXISTS service_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_type TEXT NOT NULL,
  km_at_service INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Vehicles policies
CREATE POLICY "Users can view own vehicles"
  ON vehicles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vehicles"
  ON vehicles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vehicles"
  ON vehicles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vehicles"
  ON vehicles FOR DELETE
  USING (auth.uid() = user_id);

-- Service logs policies
CREATE POLICY "Users can view own logs"
  ON service_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON service_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON service_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
