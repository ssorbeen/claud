'use client'
import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import type { HeatmapCell } from '@/lib/supabase'

interface Props { data: HeatmapCell[] }

export default function ExcelPanel({ data }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)

  // 다운로드
  function handleDownload() {
    const solutions = [...new Set(data.map(d => d.solution_code))].sort()
    const subIds    = [...new Set(data.map(d => d.subsidiary_id))]

    // 법인별 행 구성
    const subMap = new Map<number, any>()
    data.forEach(d => {
      if (!subMap.has(d.subsidiary_id)) {
        subMap.set(d.subsidiary_id, {
          지역: d.region_name, 국가: d.country,
          법인명: d.subsidiary_name, 법인코드: d.subsidiary_code,
        })
      }
      const row = subMap.get(d.subsidiary_id)
      row[`${d.solution_code}_설치여부`] = d.is_installed ? 'Y' : 'N'
      row[`${d.solution_code}_설치율`]   = d.install_rate
      row[`${d.solution_code}_비고`]     = d.note ?? ''
    })

    const rows = Array.from(subMap.values())
    const ws   = XLSX.utils.json_to_sheet(rows)
    const wb   = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '설치현황')
    XLSX.writeFile(wb, `현대모비스_보안솔루션설치현황_${new Date().toISOString().slice(0,7).replace('-','')}.xlsx`)
  }

  // 업로드 파싱 (미리보기만 — 실 저장은 서버 액션으로 확장)
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg(null)

    const buf  = await file.arrayBuffer()
    const wb   = XLSX.read(buf, { type: 'array' })
    const ws   = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws) as any[]

    setUploadMsg(`✅ ${rows.length}행 파싱 완료. 실제 저장 기능은 추후 서버 액션으로 연동됩니다.`)
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">Excel 업로드 / 다운로드</h2>
          <p className="text-xs text-gray-400 mt-0.5">현재 데이터를 Excel로 내보내거나, 작성된 Excel을 업로드하세요</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-200 rounded-lg text-gray-600 hover:border-[#00A0E9] hover:text-[#00A0E9] transition-colors disabled:opacity-50"
          >
            <span>⬆️</span> Excel 업로드
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 text-xs bg-[#00A0E9] text-white rounded-lg hover:bg-[#0088C7] transition-colors font-medium"
          >
            <span>⬇️</span> Excel 다운로드
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
        </div>
      </div>
      {uploadMsg && (
        <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          {uploadMsg}
        </div>
      )}
    </div>
  )
}
