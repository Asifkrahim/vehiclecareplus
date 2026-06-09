-- ============================================================
-- VehicleCare+ Supabase Schema  (safe to run multiple times)
-- Supabase Dashboard → SQL Editor → New Query → Run All
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

-- Profiles (mirrors auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles
CREATE TABLE IF NOT EXISTS vehicles (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vehicle_no       TEXT        NOT NULL,
  vehicle_type     TEXT        NOT NULL CHECK (vehicle_type IN ('Car', 'Bike')),
  model            TEXT        NOT NULL,
  maintenance_type TEXT        NOT NULL DEFAULT 'Oil Change',
  current_km       INTEGER     NOT NULL CHECK (current_km >= 0),
  next_service_km  INTEGER     NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Add maintenance_type column if the table already existed without it
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS maintenance_type TEXT NOT NULL DEFAULT 'Oil Change';

-- Service Logs
CREATE TABLE IF NOT EXISTS service_logs (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id     UUID        NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type   TEXT        NOT NULL,
  km_at_service  INTEGER     NOT NULL,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;


-- ── profiles policies ──────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own profile"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);


-- ── vehicles policies ──────────────────────────────────────

DROP POLICY IF EXISTS "Users can view own vehicles"   ON vehicles;
DROP POLICY IF EXISTS "Users can insert own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can update own vehicles" ON vehicles;
DROP POLICY IF EXISTS "Users can delete own vehicles" ON vehicles;

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


-- ── service_logs policies ──────────────────────────────────

DROP POLICY IF EXISTS "Users can view own logs"   ON service_logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON service_logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON service_logs;

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
-- 3. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;   -- safe if profile already exists
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
