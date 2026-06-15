'use client'
import type { HeatmapCell } from '@/lib/supabase'

interface Props { data: HeatmapCell[] }

export default function KpiCards({ data }: Props) {
  if (!data.length) return null

  const total = data.length
  const installed = data.filter(d => d.is_installed).length
  const avgRate = Math.round(data.reduce((s, d) => s + d.install_rate, 0) / total)

  const subIds = [...new Set(data.map(d => d.subsidiary_id))]
  const subAvgs = subIds.map(id => {
    const rows = data.filter(d => d.subsidiary_id === id)
    return rows.reduce((s, r) => s + r.install_rate, 0) / rows.length
  })
  const fullCount = subAvgs.filter(a => a === 100).length
  const lowCount  = subAvgs.filter(a => a < 50).length

  const cards = [
    {
      label: '전체 평균 설치율',
      value: `${avgRate}%`,
      sub: `${total}개 항목 (26법인 × 5솔루션)`,
      color: avgRate >= 80 ? '#00A0E9' : avgRate >= 60 ? '#F59E0B' : '#EF4444',
      bg: avgRate >= 80 ? '#E6F4FC' : avgRate >= 60 ? '#FEF3C7' : '#FEE2E2',
      icon: '📊',
    },
    {
      label: '설치 완료 건수',
      value: `${installed}건`,
      sub: `전체 ${total}건 중 (${Math.round(installed/total*100)}%)`,
      color: '#10B981',
      bg: '#D1FAE5',
      icon: '✅',
    },
    {
      label: '전체 설치 달성 법인',
      value: `${fullCount}개`,
      sub: '5개 솔루션 모두 100% 설치',
      color: '#6366F1',
      bg: '#EDE9FE',
      icon: '🏆',
    },
    {
      label: '설치율 50% 미만 법인',
      value: `${lowCount}개`,
      sub: '즉시 점검 필요',
      color: '#EF4444',
      bg: '#FEE2E2',
      icon: '⚠️',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(c => (
        <div key={c.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium">{c.label}</span>
            <span className="text-lg">{c.icon}</span>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: c.color }}>{c.value}</div>
          <div className="text-xs text-gray-400">{c.sub}</div>
          <div className="mt-3 h-1 rounded-full" style={{ background: c.bg }}>
            <div className="h-1 rounded-full" style={{ background: c.color, width: '100%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
