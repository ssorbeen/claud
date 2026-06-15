'use client'
import { useState, useTransition } from 'react'
import type { HeatmapCell } from '@/lib/supabase'
import { updateInstallationStatus } from '@/lib/data'

interface Props {
  data: HeatmapCell[]
  solutions: string[]
}

export default function DataTable({ data, solutions }: Props) {
  const [search, setSearch] = useState('')
  const [filterSol, setFilterSol] = useState('전체')
  const [filterStatus, setFilterStatus] = useState('전체')
  const [editCell, setEditCell] = useState<{ subId: number; solCode: string } | null>(null)
  const [editValues, setEditValues] = useState({ is_installed: false, install_rate: 0, note: '' })
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState<string | null>(null)

  const filtered = data.filter(d => {
    const matchSearch = d.subsidiary_name.toLowerCase().includes(search.toLowerCase()) ||
                        d.country.includes(search) || d.subsidiary_code.includes(search.toUpperCase())
    const matchSol    = filterSol === '전체' || d.solution_code === filterSol
    const matchStatus = filterStatus === '전체' || (filterStatus === '완료' ? d.is_installed : !d.is_installed)
    return matchSearch && matchSol && matchStatus
  })

  function openEdit(row: HeatmapCell) {
    setEditCell({ subId: row.subsidiary_id, solCode: row.solution_code })
    setEditValues({ is_installed: row.is_installed, install_rate: row.install_rate, note: row.note ?? '' })
  }

  function saveEdit(row: HeatmapCell) {
    startTransition(async () => {
      await updateInstallationStatus(row.subsidiary_id, row.solution_id, editValues)
      setSaved(`${row.subsidiary_code} - ${row.solution_code} 저장 완료`)
      setEditCell(null)
      setTimeout(() => setSaved(null), 3000)
      // 페이지 새로고침으로 최신 반영
      window.location.reload()
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="법인명 / 국가 / 코드 검색..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A0E9] focus:ring-1 focus:ring-[#00A0E9]/30"
        />
        <select
          value={filterSol}
          onChange={e => setFilterSol(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A0E9]"
        >
          <option value="전체">전체 솔루션</option>
          {solutions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A0E9]"
        >
          <option value="전체">전체 상태</option>
          <option value="완료">설치 완료 (Y)</option>
          <option value="미완료">미설치 (N)</option>
        </select>
        <span className="text-xs text-gray-400">{filtered.length}건</span>
      </div>

      {/* 저장 완료 알림 */}
      {saved && (
        <div className="mx-4 mt-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-700 font-medium">
          ✅ {saved}
        </div>
      )}

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 font-medium">법인</th>
              <th className="text-left px-2 py-3 font-medium">국가</th>
              <th className="text-center px-2 py-3 font-medium">솔루션</th>
              <th className="text-center px-2 py-3 font-medium">설치여부</th>
              <th className="text-center px-2 py-3 font-medium">설치율</th>
              <th className="text-left px-3 py-3 font-medium">비고</th>
              <th className="text-center px-2 py-3 font-medium">수정</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((row) => {
              const isEditing = editCell?.subId === row.subsidiary_id && editCell?.solCode === row.solution_code
              return (
                <tr key={`${row.subsidiary_id}-${row.solution_code}`} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800 truncate max-w-[180px]" title={row.subsidiary_name}>{row.subsidiary_name}</div>
                    <div className="text-[10px] text-gray-400">{row.subsidiary_code}</div>
                  </td>
                  <td className="px-2 py-2.5 text-gray-600">{row.country}</td>
                  <td className="px-2 py-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-[#003D5C]/10 text-[#003D5C] font-semibold">{row.solution_code}</span>
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {isEditing ? (
                      <select
                        value={editValues.is_installed ? 'Y' : 'N'}
                        onChange={e => setEditValues(v => ({ ...v, is_installed: e.target.value === 'Y' }))}
                        className="text-xs px-1.5 py-1 border border-[#00A0E9] rounded focus:outline-none"
                      >
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.is_installed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {row.is_installed ? 'Y' : 'N'}
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {isEditing ? (
                      <input
                        type="number" min={0} max={100}
                        value={editValues.install_rate}
                        onChange={e => setEditValues(v => ({ ...v, install_rate: Number(e.target.value) }))}
                        className="w-16 text-xs px-1.5 py-1 border border-[#00A0E9] rounded text-center focus:outline-none"
                      />
                    ) : (
                      <span className={`font-bold ${row.install_rate === 100 ? 'text-green-600' : row.install_rate >= 80 ? 'text-blue-600' : row.install_rate >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                        {row.install_rate}%
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 max-w-[260px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editValues.note}
                        onChange={e => setEditValues(v => ({ ...v, note: e.target.value }))}
                        className="w-full text-xs px-1.5 py-1 border border-[#00A0E9] rounded focus:outline-none"
                      />
                    ) : (
                      <span className="truncate block" title={row.note ?? ''}>{row.note}</span>
                    )}
                  </td>
                  <td className="px-2 py-2.5 text-center">
                    {isEditing ? (
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => saveEdit(row)}
                          disabled={isPending}
                          className="px-2 py-1 bg-[#00A0E9] text-white rounded text-[10px] font-medium hover:bg-[#0088C7] disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditCell(null)}
                          className="px-2 py-1 border border-gray-200 text-gray-500 rounded text-[10px] hover:bg-gray-50"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openEdit(row)}
                        className="px-2 py-1 border border-gray-200 text-gray-500 rounded text-[10px] hover:border-[#00A0E9] hover:text-[#00A0E9] transition-colors"
                      >
                        수정
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
