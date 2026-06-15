import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '현대모비스 보안솔루션 설치현황',
  description: '해외법인 보안솔루션 설치현황 대시보드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#F4F6F9] antialiased">
        <header className="bg-[#1A1A1A] text-white h-14 flex items-center px-6 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-3">
            <div>
              <div className="w-6 h-[2px] bg-[#00A0E9] mb-[3px]" />
              <span className="text-sm font-semibold tracking-widest">HYUNDAI MOBIS</span>
            </div>
            <div className="w-px h-5 bg-white/20 mx-2" />
            <span className="text-sm text-white/60">해외법인 보안솔루션 설치현황 대시보드</span>
          </div>
          <div className="ml-auto flex items-center gap-3 text-xs">
            <span className="text-white/40">그룹보안팀</span>
            <span className="px-2 py-1 rounded bg-[#00A0E9]/20 text-[#00A0E9] font-medium">2026-06-15 기준</span>
          </div>
        </header>
        <main className="max-w-[1440px] mx-auto px-6 py-6">{children}</main>
      </body>
    </html>
  )
}
