'use server'
import { supabase } from './supabase'
import type { HeatmapCell, Solution, Subsidiary, AuditLog } from './supabase'

export async function getHeatmapData(): Promise<HeatmapCell[]> {
  const { data, error } = await supabase
    .from('installation_status')
    .select(`
      subsidiary_id, solution_id, is_installed, install_rate, note,
      subsidiary:subsidiaries(id, name, code, country, region:regions(name)),
      solution:solutions(id, code)
    `)
    .order('solution_id')

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    subsidiary_id:   row.subsidiary_id,
    subsidiary_name: row.subsidiary.name,
    subsidiary_code: row.subsidiary.code,
    region_name:     row.subsidiary.region.name,
    country:         row.subsidiary.country,
    solution_id:     row.solution_id,
    solution_code:   row.solution.code,
    is_installed:    row.is_installed,
    install_rate:    row.install_rate,
    note:            row.note,
  }))
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
