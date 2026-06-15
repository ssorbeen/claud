'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'
import type { HeatmapCell } from '@/lib/supabase'

const REGION_COLORS: Record<string, string> = {
  '아시아':       '#00A0E9',
  '유럽':         '#10B981',
  '미주':         '#F59E0B',
  '중동·아프리카':'#8B5CF6',
}
const SOL_COLORS = ['#00A0E9', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444']

interface Props { data: HeatmapCell[] }

export default function Charts({ data }: Props) {
  // 지역별 평균 설치율
  const regions = ['아시아', '유럽', '미주', '중동·아프리카']
  const regionData = regions.map(r => {
    const rows = data.filter(d => d.region_name === r)
    const avg = rows.length ? Math.round(rows.reduce((s, d) => s + d.install_rate, 0) / rows.length) : 0
    const subCount = new Set(rows.map(d => d.subsidiary_id)).size
    return { name: r, avg, subCount }
  })

  // 솔루션별 평균 설치율
  const sols = [...new Set(data.map(d => d.solution_code))]
  const solData = sols.map((sol, i) => {
    const rows = data.filter(d => d.solution_code === sol)
    const avg = rows.length ? Math.round(rows.reduce((s, d) => s + d.install_rate, 0) / rows.length) : 0
    const yCount = rows.filter(d => d.is_installed).length
    return { name: sol, avg, yCount, color: SOL_COLORS[i] }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* 지역별 바 차트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">지역별 평균 설치율</h2>
        <p className="text-xs text-gray-400 mb-4">지역 내 전체 솔루션 평균</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={regionData} barSize={36} margin={{ left: -10 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip
              formatter={(v) => [`${v}%`, '평균 설치율']}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
              {regionData.map((r) => (
                <Cell key={r.name} fill={REGION_COLORS[r.name] ?? '#00A0E9'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
          {regionData.map(r => (
            <div key={r.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: REGION_COLORS[r.name] }} />
                <span className="text-gray-600">{r.name} ({r.subCount}개)</span>
              </div>
              <span className="font-bold" style={{ color: REGION_COLORS[r.name] }}>{r.avg}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 솔루션별 도넛 차트 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-1">솔루션별 평균 설치율</h2>
        <p className="text-xs text-gray-400 mb-4">전체 26개 법인 기준</p>
        <div className="flex items-center gap-4">
          <ResponsiveContainer width="55%" height={200}>
            <PieChart>
              <Pie
                data={solData}
                dataKey="avg"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              >
                {solData.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '평균 설치율']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2.5 flex-1">
            {solData.map(s => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />
                    <span className="font-medium">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: s.color }}>{s.avg}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${s.avg}%`, background: s.color }} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{s.yCount}/26 법인 설치 완료</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
