import { getHeatmapData, getSolutions } from '@/lib/data'
import KpiCards   from '@/components/KpiCards'
import Heatmap    from '@/components/Heatmap'
import Charts     from '@/components/Charts'
import DataTable  from '@/components/DataTable'
import ExcelPanel from '@/components/ExcelPanel'

export const revalidate = 0

export default async function DashboardPage() {
  const [data, solutions] = await Promise.all([
    getHeatmapData(),
    getSolutions(),
  ])

  const solCodes = solutions.map(s => s.code)

  return (
    <div>
      {/* KPI 카드 */}
      <KpiCards data={data} />

      {/* Excel 패널 */}
      <ExcelPanel data={data} />

      {/* 차트 */}
      <Charts data={data} />

      {/* 히트맵 */}
      <div className="mb-6">
        <Heatmap data={data} solutions={solCodes} />
      </div>

      {/* 데이터 테이블 (인라인 수정) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">설치현황 상세 테이블</h2>
          <span className="text-xs text-gray-400">클릭하여 인라인 수정 가능</span>
        </div>
        <DataTable data={data} solutions={solCodes} />
      </div>
    </div>
  )
}
