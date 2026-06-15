import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ── 타입 정의 ────────────────────────────────────────
export type Region = { id: number; name: string }
export type Solution = { id: number; code: string; name: string; description: string; sort_order: number }
export type Subsidiary = { id: number; code: string; name: string; country: string; region_id: number; region?: Region }
export type InstallationStatus = {
  id: number
  subsidiary_id: number
  solution_id: number
  is_installed: boolean
  install_rate: number
  note: string | null
  updated_at: string
  updated_by: string
  subsidiary?: Subsidiary
  solution?: Solution
}
export type AuditLog = {
  id: number
  subsidiary_id: number
  solution_id: number
  field_name: string
  old_value: string
  new_value: string
  changed_by: string
  changed_at: string
  subsidiary?: Subsidiary
  solution?: Solution
}

// ── 집계용 뷰 타입 ────────────────────────────────────
export type HeatmapCell = {
  subsidiary_id: number
  subsidiary_name: string
  subsidiary_code: string
  region_name: string
  country: string
  solution_id: number
  solution_code: string
  is_installed: boolean
  install_rate: number
  note: string | null
}
