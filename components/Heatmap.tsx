'use client'
import { useState } from 'react'
import type { HeatmapCell } from '@/lib/supabase'

interface Props {
  data: HeatmapCell[]
  solutions: string[]
}

function rateColor(rate: number, installed: boolean) {
  if (!installed && rate === 0) return { bg: '#F3F4F6', text: '#9CA3AF' }
  if (rate === 100) return { bg: '#D1FAE5', text: '#065F46' }
  if (rate >= 80)   return { bg: '#DBEAFE', text: '#1E40AF' }
  if (rate >= 50)   return { bg: '#FEF3C7', text: '#92400E' }
  return { bg: '#FEE2E2', text: '#991B1B' }
}

const REGION_COLORS: Record<string, string> = {
  '아시아':       '#1D4ED8',
  '유럽':         '#15803D',
  '미주':         '#B45309',
  '중동·아프리카':'#7C3AED',
}

export default function Heatmap({ data, solutions }: Props) {
  const [tooltip, setTooltip] = useState<{ cell: HeatmapCell; x: number; y: number } | null>(null)
  const [filterRegion, setFilterRegion] = useState('전체')

  // 법인 목록 (지역 순으로)
  const subMap = new Map<number, { name: string; code: string; region: string; country: string }>()
  data.forEach(d => {
    if (!subMap.has(d.subsidiary_id))
      subMap.set(d.subsidiary_id, { name: d.subsidiary_name, code: d.subsidiary_code, region: d.region_name, country: d.country })
  })

  const regions = ['전체', ...Array.from(new Set(data.map(d => d.region_name)))]
  const subs = Array.from(subMap.entries())
    .filter(([, v]) => filterRegion === '전체' || v.region === filterRegion)
    .sort((a, b) => {
      const ro = ['아시아', '유럽', '미주', '중동·아프리카']
      return ro.indexOf(a[1].region) - ro.indexOf(b[1].region) || a[1].name.localeCompare(b[1].name)
    })

  // 데이터 맵
  const cellMap = new Map<string, HeatmapCell>()
  data.forEach(d => cellMap.set(`${d.subsidiary_id}-${d.solution_code}`, d))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">법인 × 솔루션 설치현황 히트맵</h2>
          <p className="text-xs text-gray-400 mt-0.5">셀을 hover하면 상세 정보를 확인할 수 있습니다</p>
        </div>
        <div className="flex gap-1.5">
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setFilterRegion(r)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                filterRegion === r
                  ? 'bg-[#00A0E9] text-white border-[#00A0E9]'
                  : 'border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 pr-3 text-gray-500 font-medium w-44 border-b border-gray-100">법인</th>
              <th className="text-center text-gray-400 font-normal border-b border-gray-100 w-8">지역</th>
              {solutions.map(sol => (
                <th key={sol} className="text-center py-2 px-1 font-semibold text-[#005F8A] border-b border-gray-100 min-w-[64px]">
                  {sol}
                </th>
              ))}
              <th className="text-center py-2 px-1 font-semibold text-[#003D5C] border-b border-gray-100 min-w-[56px]">평균</th>
            </tr>
          </thead>
          <tbody>
            {subs.map(([subId, sub]) => {
              const cells = solutions.map(sol => cellMap.get(`${subId}-${sol}`))
              const rates = cells.map(c => c?.install_rate ?? 0)
              const avg = Math.round(rates.reduce((s, r) => s + r, 0) / rates.length)
              const avgColor = rateColor(avg, avg > 0)

              return (
                <tr key={subId} className="group hover:bg-gray-50/60">
                  <td className="py-1.5 pr-3 text-gray-700 font-medium truncate max-w-[160px]" title={sub.name}>
                    <div className="truncate">{sub.name}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{sub.country}</div>
                  </td>
                  <td className="text-center">
                    <span className="inline-block w-2 h-2 rounded-full" style={{ background: REGION_COLORS[sub.region] ?? '#9CA3AF' }} title={sub.region} />
                  </td>
                  {cells.map((cell, i) => {
                    const rate = cell?.install_rate ?? 0
                    const inst = cell?.is_installed ?? false
                    const { bg, text } = rateColor(rate, inst)
                    return (
                      <td key={i} className="py-1 px-1 text-center">
                        <div
                          className="heatmap-cell mx-auto rounded-md font-bold flex items-center justify-center"
                          style={{ width: 52, height: 28, background: bg, color: text, fontSize: 11 }}
                          onMouseEnter={e => {
                            if (cell) setTooltip({ cell, x: e.clientX, y: e.clientY })
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {rate}%
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-1 px-1 text-center">
                    <div
                      className="mx-auto rounded-md font-bold flex items-center justify-center"
                      style={{ width: 52, height: 28, background: avgColor.bg, color: avgColor.text, fontSize: 11 }}
                    >
                      {avg}%
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 범례 */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <span className="text-[10px] text-gray-400">설치율</span>
        {[
          { label: '100%', bg: '#D1FAE5', text: '#065F46' },
          { label: '80~99%', bg: '#DBEAFE', text: '#1E40AF' },
          { label: '50~79%', bg: '#FEF3C7', text: '#92400E' },
          { label: '~49%', bg: '#FEE2E2', text: '#991B1B' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-8 h-4 rounded text-[9px] font-bold flex items-center justify-center" style={{ background: l.bg, color: l.text }}>
              {l.label === '100%' ? '✓' : ''}
            </div>
            <span className="text-[10px] text-gray-400">{l.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3">
          {Object.entries(REGION_COLORS).map(([r, c]) => (
            <div key={r} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: c }} />
              <span className="text-[10px] text-gray-400">{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 툴팁 */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-[#1A1A1A] text-white text-xs rounded-lg shadow-xl p-3 min-w-[200px]"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <div className="font-semibold mb-1 text-[#00A0E9]">{tooltip.cell.solution_code}</div>
          <div className="text-white/80 text-[11px] mb-1">{tooltip.cell.subsidiary_name}</div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tooltip.cell.is_installed ? 'bg-green-500' : 'bg-red-500'}`}>
              {tooltip.cell.is_installed ? 'Y' : 'N'}
            </span>
            <span className="font-bold text-sm">{tooltip.cell.install_rate}%</span>
          </div>
          {tooltip.cell.note && <div className="text-white/60 text-[10px] leading-relaxed">{tooltip.cell.note}</div>}
        </div>
      )}
    </div>
  )
}
