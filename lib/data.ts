'use server'
import { supabase } from './supabase'
import type { HeatmapCell, Solution, Subsidiary, AuditLog } from './supabase'

export async function getHeatmapData(): Promise<HeatmapCell[]> {
  // 조인 없이 단순 쿼리 3개로 분리 → RLS 중첩 조인 오류 방지
  const [statusRes, subRes, solRes] = await Promise.all([
    supabase.from('installation_status').select('*'),
    supabase.from('subsidiaries').select('*, region:regions(name)'),
    supabase.from('solutions').select('id, code'),
  ])

  if (statusRes.error) throw statusRes.error
  if (subRes.error)    throw subRes.error
  if (solRes.error)    throw solRes.error

  const subs = new Map((subRes.data ?? []).map((s: any) => [s.id, s]))
  const sols = new Map((solRes.data ?? []).map((s: any) => [s.id, s]))

  return (statusRes.data ?? [])
    .map((row: any) => {
      const sub = subs.get(row.subsidiary_id)
      const sol = sols.get(row.solution_id)
      if (!sub || !sol) return null
      return {
        subsidiary_id:   row.subsidiary_id,
        subsidiary_name: sub.name,
        subsidiary_code: sub.code,
        region_name:     sub.region?.name ?? '',
        country:         sub.country,
        solution_id:     row.solution_id,
        solution_code:   sol.code,
        is_installed:    row.is_installed,
        install_rate:    row.install_rate,
        note:            row.note,
      }
    })
    .filter(Boolean) as HeatmapCell[]
}

export async function getSolutions(): Promise<Solution[]> {
  const { data, error } = await supabase
    .from('solutions')
    .select('*')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function getSubsidiaries(): Promise<Subsidiary[]> {
  const { data, error } = await supabase
    .from('subsidiaries')
    .select('*, region:regions(id,name)')
    .order('region_id')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function getAuditLogs(limit = 30): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*, subsidiary:subsidiaries(name,code), solution:solutions(code)')
    .order('changed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function updateInstallationStatus(
  subsidiaryId: number,
  solutionId: number,
  patch: { is_installed?: boolean; install_rate?: number; note?: string }
) {
  const { error } = await supabase
    .from('installation_status')
    .update({ ...patch, updated_by: 'web-user' })
    .eq('subsidiary_id', subsidiaryId)
    .eq('solution_id', solutionId)
  if (error) throw error
}
