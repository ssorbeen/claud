import * as XLSX from 'xlsx'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { mkdirSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ────────────────────────────────────────────────
// 현대모비스 해외법인 데이터
// ────────────────────────────────────────────────
// [법인코드, 지역, 국가, 법인명]  +  솔루션별 [설치여부, 설치율, 비고] × 5
// 솔루션 순서: SAC · DAC · VMS · AV · EDR
const subsidiaries = [
  // ── 아시아 ──────────────────────────────────────
  {
    region: '아시아', country: '중국', name: 'Mobis Parts China (Beijing)', code: 'MPC-CN-BJ',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 85,  note: '신규 서버군 확장 적용 중 (2026-Q3 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 90,  note: '구형 단말 교체 병행 (2026-Q4 완료 예정)' },
    ],
  },
  {
    region: '아시아', country: '중국', name: 'Mobis Parts China (Shanghai)', code: 'MPC-CN-SH',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '생산라인 신규 PC 추가 적용 진행 중' },
      { yn: 'Y', rate: 80,  note: '2026-Q3 전체 적용 목표' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 85,  note: '정책 배포 안정화 진행 중' },
    ],
  },
  {
    region: '아시아', country: '중국', name: 'Hyundai Mobis China (Guangzhou)', code: 'HMC-CN-GZ',
    sols: [
      { yn: 'Y', rate: 90,  note: '신규 입사자 계정 등록 지연' },
      { yn: 'Y', rate: 80,  note: '일부 공유 드라이브 정책 미적용' },
      { yn: 'N', rate: 60,  note: '도입 계획 승인 완료 – 2026-Q4 구축 예정' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'N', rate: 50,  note: '파일럿 운영 중 (본사 검토 대기)' },
    ],
  },
  {
    region: '아시아', country: '인도', name: 'Hyundai Mobis India (Chennai)', code: 'HMI-IN-CH',
    sols: [
      { yn: 'Y', rate: 85,  note: '계약직 계정 관리 기준 수립 중' },
      { yn: 'N', rate: 60,  note: '현지 법령 검토 완료 – 도입 협의 진행 중' },
      { yn: 'N', rate: 40,  note: '예산 승인 대기 (2026-Q4)' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'N', rate: 30,  note: '본사 라이선스 공급 일정 협의 중' },
    ],
  },
  {
    region: '아시아', country: '인도', name: 'Hyundai Mobis India (Delhi)', code: 'HMI-IN-DL',
    sols: [
      { yn: 'Y', rate: 80,  note: '영업팀 단말 추가 적용 진행 중' },
      { yn: 'N', rate: 50,  note: '2026-Q4 구축 계획 수립 완료' },
      { yn: 'N', rate: 30,  note: '미착수 – 우선순위 협의 필요' },
      { yn: 'Y', rate: 90,  note: '일부 BYOD 단말 미설치' },
      { yn: 'N', rate: 25,  note: '파일럿 대상 법인 선정 대기' },
    ],
  },
  {
    region: '아시아', country: '일본', name: 'Hyundai Mobis Japan', code: 'HMJ-JP',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '분기 취약점 스캔 정례화 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
    ],
  },
  {
    region: '아시아', country: '인도네시아', name: 'Hyundai Mobis Indonesia', code: 'HMID-ID',
    sols: [
      { yn: 'Y', rate: 80,  note: '현지 AD 연동 작업 진행 중' },
      { yn: 'N', rate: 50,  note: '도입 ROI 검토 완료 – 예산 신청 예정' },
      { yn: 'N', rate: 35,  note: '현지 IT 인프라 개선 선행 필요' },
      { yn: 'Y', rate: 90,  note: '구형 단말 5대 미설치' },
      { yn: 'N', rate: 20,  note: '2027-Q1 도입 로드맵 수립 중' },
    ],
  },
  {
    region: '아시아', country: '베트남', name: 'Hyundai Mobis Vietnam', code: 'HMVN-VN',
    sols: [
      { yn: 'N', rate: 60,  note: '현지 벤더 선정 완료 – 계약 진행 중' },
      { yn: 'N', rate: 40,  note: '미착수 – IT 담당자 부재 (충원 진행 중)' },
      { yn: 'N', rate: 20,  note: '미착수' },
      { yn: 'Y', rate: 85,  note: '생산라인 공용 PC 15대 미설치' },
      { yn: 'N', rate: 15,  note: '미착수' },
    ],
  },
  {
    region: '아시아', country: '태국', name: 'Hyundai Mobis Thailand', code: 'HMT-TH',
    sols: [
      { yn: 'Y', rate: 85,  note: 'SSO 연동 마이그레이션 진행 중' },
      { yn: 'N', rate: 55,  note: '데이터 분류체계 정립 후 도입 예정' },
      { yn: 'N', rate: 40,  note: '2026-Q4 구축 계획 확정' },
      { yn: 'Y', rate: 95,  note: '신규 노트북 배포 시 자동 설치 적용 완료' },
      { yn: 'N', rate: 30,  note: '예산 확보 후 2027-Q1 도입 예정' },
    ],
  },
  {
    region: '아시아', country: '호주', name: 'Hyundai Mobis Australia', code: 'HMA-AU',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 90,  note: '외부 파트너 계정 정책 적용 검토 중' },
      { yn: 'Y', rate: 85,  note: 'IRAP 가이드라인 반영 업데이트 예정' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 80,  note: '재택근무 단말 정책 강화 진행 중' },
    ],
  },
  // ── 유럽 ──────────────────────────────────────
  {
    region: '유럽', country: '독일', name: 'Hyundai Mobis Germany', code: 'HMDE-DE',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료 (GDPR 준수 검증 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료 (GDPR 준수 검증 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료 (NIS2 대응 완료)' },
    ],
  },
  {
    region: '유럽', country: '체코', name: 'Hyundai Mobis Czech', code: 'HMCZ-CZ',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '공장동 OT 영역 적용 검토 중' },
      { yn: 'Y', rate: 90,  note: '분기 정기 스캔 운영 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 85,  note: 'IoT 게이트웨이 적용 범위 확대 중' },
    ],
  },
  {
    region: '유럽', country: '슬로바키아', name: 'Hyundai Mobis Slovakia', code: 'HMSK-SK',
    sols: [
      { yn: 'Y', rate: 95,  note: '파견 직원 계정 정책 정비 중' },
      { yn: 'Y', rate: 90,  note: '외부 협력업체 접근권한 점검 완료' },
      { yn: 'Y', rate: 85,  note: '연간 취약점 진단 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 80,  note: '구형 산업용 PC 교체 병행 중' },
    ],
  },
  {
    region: '유럽', country: '헝가리', name: 'Hyundai Mobis Hungary', code: 'HMHU-HU',
    sols: [
      { yn: 'Y', rate: 90,  note: '멀티 사이트 정책 통합 작업 중' },
      { yn: 'Y', rate: 85,  note: '데이터 분류 레이블링 작업 완료' },
      { yn: 'Y', rate: 80,  note: '패치 사이클 단축 진행 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 75,  note: '레거시 서버 마이그레이션 후 확대 예정' },
    ],
  },
  {
    region: '유럽', country: '폴란드', name: 'Hyundai Mobis Poland', code: 'HMPL-PL',
    sols: [
      { yn: 'Y', rate: 95,  note: '신규 생산라인 계정 등록 완료' },
      { yn: 'Y', rate: 90,  note: 'DLP 정책 고도화 작업 진행 중' },
      { yn: 'Y', rate: 80,  note: '스캔 주기 월 1회로 단축 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 70,  note: '2026-Q4 전 법인 단말 적용 목표' },
    ],
  },
  {
    region: '유럽', country: '네덜란드', name: 'Hyundai Mobis Netherlands', code: 'HMNL-NL',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료 (ISO27001 감사 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료 (ISO27001 감사 완료)' },
      { yn: 'Y', rate: 95,  note: '클라우드 자산 스캔 추가 적용 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 90,  note: '클라우드 워크로드 커버리지 확대 중' },
    ],
  },
  {
    region: '유럽', country: '튀르키예', name: 'Hyundai Mobis Turkey', code: 'HMTR-TR',
    sols: [
      { yn: 'Y', rate: 85,  note: '현지 AD 구조 개선 작업 병행 중' },
      { yn: 'N', rate: 65,  note: '현지 데이터보호법 검토 후 도입 예정' },
      { yn: 'N', rate: 60,  note: '2026-Q4 구축 예정 – 벤더 선정 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'N', rate: 55,  note: '파일럿 완료 – 전사 확대 협의 중' },
    ],
  },
  {
    region: '유럽', country: '스페인', name: 'Hyundai Mobis Spain', code: 'HMES-ES',
    sols: [
      { yn: 'Y', rate: 90,  note: '리셀러 계정 분리 관리 정책 적용 중' },
      { yn: 'Y', rate: 80,  note: '민감 정보 분류 기준 수립 완료' },
      { yn: 'Y', rate: 75,  note: '정기 취약점 스캔 운영 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 65,  note: '2026-Q4 전체 단말 적용 예정' },
    ],
  },
  // ── 미주 ──────────────────────────────────────
  {
    region: '미주', country: '미국', name: 'Hyundai Mobis America (Michigan)', code: 'HMMA-US-MI',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료 (SOC2 Type II 감사 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료 (SOC2 Type II 감사 완료)' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료 (24/7 SOC 모니터링 연동)' },
    ],
  },
  {
    region: '미주', country: '미국', name: 'Hyundai Mobis Alabama', code: 'HMMA-US-AL',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '용접 로봇 OT 네트워크 정책 확대 적용 중' },
      { yn: 'Y', rate: 90,  note: '산업 제어시스템 취약점 스캔 추가 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '생산 현장 단말 적용률 95% 달성' },
    ],
  },
  {
    region: '미주', country: '미국', name: 'Hyundai Mobis Georgia', code: 'HMMA-US-GA',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 95,  note: '클라우드 인스턴스 스캔 확대 적용 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 90,  note: '원격 근무 단말 정책 강화 완료' },
    ],
  },
  {
    region: '미주', country: '캐나다', name: 'Hyundai Mobis Canada', code: 'HMCA-CA',
    sols: [
      { yn: 'Y', rate: 100, note: '설치 완료 (PIPEDA 준수)' },
      { yn: 'Y', rate: 95,  note: '협력업체 접근 정책 강화 진행 중' },
      { yn: 'Y', rate: 90,  note: '분기 취약점 진단 운영 중' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'Y', rate: 85,  note: '현지 MSSP와 연동 작업 완료' },
    ],
  },
  {
    region: '미주', country: '멕시코', name: 'Hyundai Mobis Mexico', code: 'HMMX-MX',
    sols: [
      { yn: 'Y', rate: 90,  note: '신규 공장 계정 일괄 등록 완료' },
      { yn: 'Y', rate: 75,  note: '생산 BOM 데이터 분류 정책 적용 중' },
      { yn: 'N', rate: 60,  note: '현지 IT 인프라 업그레이드 후 도입 예정' },
      { yn: 'Y', rate: 100, note: '설치 완료' },
      { yn: 'N', rate: 55,  note: '본사 라이선스 추가 발급 대기 중' },
    ],
  },
  {
    region: '미주', country: '브라질', name: 'Hyundai Mobis Brazil', code: 'HMBR-BR',
    sols: [
      { yn: 'Y', rate: 80,  note: 'LGPD 대응 계정 감사 진행 중' },
      { yn: 'N', rate: 60,  note: 'LGPD 법령 대응 우선 추진 중 – 2026-Q4 도입' },
      { yn: 'N', rate: 45,  note: '현지 벤더 선정 진행 중' },
      { yn: 'Y', rate: 95,  note: '설치 완료 (일부 노후 단말 교체 예정)' },
      { yn: 'N', rate: 40,  note: '2027-Q1 도입 예산 신청 완료' },
    ],
  },
  // ── 중동·아프리카 ───────────────────────────────
  {
    region: '중동·아프리카', country: 'UAE', name: 'Hyundai Mobis Middle East (Dubai)', code: 'HMME-AE',
    sols: [
      { yn: 'Y', rate: 85,  note: '클라우드 IAM 연동 작업 진행 중' },
      { yn: 'N', rate: 65,  note: '현지 규정 검토 완료 – 2026-Q4 도입 예정' },
      { yn: 'N', rate: 50,  note: '도입 계획 수립 완료 – 벤더 선정 중' },
      { yn: 'Y', rate: 95,  note: '설치 완료 (일부 협력사 단말 제외)' },
      { yn: 'N', rate: 45,  note: '본사 글로벌 라이선스 적용 검토 중' },
    ],
  },
  {
    region: '중동·아프리카', country: '남아프리카공화국', name: 'Hyundai Mobis South Africa', code: 'HMZA-ZA',
    sols: [
      { yn: 'N', rate: 70,  note: '현지 AD 구성 완료 – 정책 배포 예정 (2026-Q4)' },
      { yn: 'N', rate: 50,  note: 'POPIA 법령 검토 완료 – 도입 협의 중' },
      { yn: 'N', rate: 35,  note: '미착수 – 내부 감사 후 우선순위 재검토 예정' },
      { yn: 'Y', rate: 80,  note: '일부 공유 단말 미설치 (교체 일정 협의 중)' },
      { yn: 'N', rate: 25,  note: '2027-Q1 파일럿 진행 예정' },
    ],
  },
]

const solutions = ['SAC', 'DAC', 'VMS', 'AV', 'EDR']

const solutionDesc = {
  SAC: 'Secure Access Control (계정·접근관리)',
  DAC: 'Data Access Control (데이터접근제어)',
  VMS: 'Vulnerability Management System (취약점관리)',
  AV:  'Anti-Virus (악성코드 방지)',
  EDR: 'Endpoint Detection & Response (엔드포인트탐지대응)',
}

// ────────────────────────────────────────────────
// 헬퍼: 셀 주소
// ────────────────────────────────────────────────
function cell(col, row) {
  return XLSX.utils.encode_cell({ c: col, r: row })
}

function setCell(ws, col, row, value, style) {
  const addr = cell(col, row)
  ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's', s: style }
}

// ────────────────────────────────────────────────
// 색상 상수 (현대모비스 브랜드)
// ────────────────────────────────────────────────
const C = {
  blue:       '00A0E9',
  darkBg:     '1A1A1A',
  white:      'FFFFFF',
  lightBlue:  'E6F4FC',
  lightGray:  'F5F5F5',
  midGray:    'CCCCCC',
  darkText:   '1A1A1A',
  subText:    '666666',
  regionBg: {
    '아시아':       'EBF5FB',
    '유럽':         'EAF4EA',
    '미주':         'FEF9E7',
    '중동·아프리카': 'FDF2F8',
  },
  regionFont: {
    '아시아':       '1A5276',
    '유럽':         '145A32',
    '미주':         '784212',
    '중동·아프리카': '6C3483',
  },
}

function fill(rgb) { return { type: 'pattern', patternType: 'solid', fgColor: { rgb } } }
function font(opts) { return opts }
function border(color = 'CCCCCC') {
  const s = { style: 'thin', color: { rgb: color } }
  return { top: s, bottom: s, left: s, right: s }
}
function align(h = 'center', v = 'center', wrap = false) {
  return { horizontal: h, vertical: v, wrapText: wrap }
}

// ────────────────────────────────────────────────
// Sheet 1: 설치현황 입력 시트
// ────────────────────────────────────────────────
function buildStatusSheet() {
  const ws = {}
  const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } }
  function expand(c, r) {
    if (c > range.e.c) range.e.c = c
    if (r > range.e.r) range.e.r = r
  }

  // ── 타이틀 행 (0행) ──
  const titleStyle = {
    fill: fill(C.darkBg),
    font: font({ bold: true, color: { rgb: C.white }, sz: 13 }),
    alignment: align('left', 'center'),
  }
  setCell(ws, 0, 0, '현대모비스 해외법인 보안솔루션 설치현황', titleStyle)
  // 병합: A1:R1
  ws['!merges'] = ws['!merges'] || []
  ws['!merges'].push({ s: { c: 0, r: 0 }, e: { c: 17, r: 0 } })
  expand(17, 0)

  // ── 메타 행 (1행) ──
  const metaStyle = {
    fill: fill('2E2E2E'),
    font: font({ color: { rgb: '999999' }, sz: 10 }),
    alignment: align('left', 'center'),
  }
  setCell(ws, 0, 1, `작성기준일: ${new Date().toLocaleDateString('ko-KR')}   |   버전: v1.0   |   관리부서: 그룹보안팀`, metaStyle)
  ws['!merges'].push({ s: { c: 0, r: 1 }, e: { c: 17, r: 1 } })
  expand(17, 1)

  // ── 헤더 그룹 행 (2행) ──
  // 기본정보 그룹
  const groupBase = { fill: fill(C.blue), font: font({ bold: true, color: { rgb: C.white }, sz: 10 }), alignment: align('center', 'center'), border: border(C.white) }
  const groupSol  = { fill: fill('005F8A'), font: font({ bold: true, color: { rgb: C.white }, sz: 10 }), alignment: align('center', 'center'), border: border(C.white) }
  const groupSumm = { fill: fill('003D5C'), font: font({ bold: true, color: { rgb: C.white }, sz: 10 }), alignment: align('center', 'center'), border: border(C.white) }

  setCell(ws, 0, 2, '기본 정보', groupBase)
  ws['!merges'].push({ s: { c: 0, r: 2 }, e: { c: 3, r: 2 } })

  solutions.forEach((sol, i) => {
    const startCol = 4 + i * 3
    setCell(ws, startCol, 2, sol, groupSol)
    ws['!merges'].push({ s: { c: startCol, r: 2 }, e: { c: startCol + 2, r: 2 } })
    expand(startCol + 2, 2)
  })

  setCell(ws, 19, 2, '종합', groupSumm)
  ws['!merges'].push({ s: { c: 19, r: 2 }, e: { c: 21, r: 2 } })
  expand(21, 2)

  // ── 헤더 세부 행 (3행) ──
  const hBase = { fill: fill(C.blue), font: font({ bold: true, color: { rgb: C.white }, sz: 9 }), alignment: align('center', 'center', true), border: border('0080C0') }
  const hSol  = { fill: fill('0070A0'), font: font({ bold: true, color: { rgb: C.white }, sz: 9 }), alignment: align('center', 'center', true), border: border('005580') }
  const hSumm = { fill: fill('004D78'), font: font({ bold: true, color: { rgb: C.white }, sz: 9 }), alignment: align('center', 'center', true), border: border('003050') }

  const baseHeaders = ['지역', '국가', '법인명', '법인코드']
  baseHeaders.forEach((h, i) => setCell(ws, i, 3, h, hBase))

  solutions.forEach((_, i) => {
    const c = 4 + i * 3
    setCell(ws, c,     3, '설치여부\n(Y/N)', hSol)
    setCell(ws, c + 1, 3, '설치율\n(%)', hSol)
    setCell(ws, c + 2, 3, '비고', hSol)
    expand(c + 2, 3)
  })

  setCell(ws, 19, 3, '전체\n설치율(%)', hSumm)
  setCell(ws, 20, 3, '설치완료\n솔루션 수', hSumm)
  setCell(ws, 21, 3, '비고', hSumm)
  expand(21, 3)

  // ── 데이터 행 ──
  let currentRegion = ''
  subsidiaries.forEach((sub, idx) => {
    const row = 4 + idx
    const isRegionStart = sub.region !== currentRegion
    if (isRegionStart) currentRegion = sub.region

    const bgColor = C.regionBg[sub.region] || 'FFFFFF'
    const isEven = idx % 2 === 0

    const dataStyle = {
      fill: fill(isEven ? bgColor : 'FFFFFF'),
      font: font({ sz: 9, color: { rgb: C.darkText } }),
      alignment: align('center', 'center'),
      border: border(C.midGray),
    }
    const regionStyle = {
      fill: fill(bgColor),
      font: font({ bold: true, sz: 9, color: { rgb: C.regionFont[sub.region] || '333333' } }),
      alignment: align('center', 'center'),
      border: border(C.midGray),
    }
    const nameStyle = {
      fill: fill(isEven ? bgColor : 'FFFFFF'),
      font: font({ sz: 9, color: { rgb: C.darkText } }),
      alignment: align('left', 'center'),
      border: border(C.midGray),
    }

    setCell(ws, 0, row, sub.region, regionStyle)
    setCell(ws, 1, row, sub.country, dataStyle)
    setCell(ws, 2, row, sub.name, nameStyle)
    setCell(ws, 3, row, sub.code, dataStyle)

    sub.sols.forEach((sol, si) => {
      const c = 4 + si * 3

      // 설치여부 셀 – Y는 파란 배경, N은 연한 빨간 배경
      const ynBg  = sol.yn === 'Y' ? 'D6EAF8' : 'FADBD8'
      const ynFg  = sol.yn === 'Y' ? '1A5276' : '922B21'
      ws[cell(c, row)] = {
        v: sol.yn, t: 's',
        s: { fill: fill(ynBg), font: font({ bold: true, sz: 9, color: { rgb: ynFg } }), alignment: align('center', 'center'), border: border(C.midGray) },
      }

      // 설치율 셀 – 값에 따라 색조 적용
      const rateBg = sol.rate === 100 ? 'D5F5E3'
                   : sol.rate >= 80   ? 'EBF5FB'
                   : sol.rate >= 50   ? 'FEF9E7'
                   : 'FADBD8'
      const rateFg = sol.rate === 100 ? '1E8449'
                   : sol.rate >= 80   ? '1A5276'
                   : sol.rate >= 50   ? '784212'
                   : '922B21'
      ws[cell(c + 1, row)] = {
        v: sol.rate, t: 'n',
        s: { fill: fill(rateBg), font: font({ bold: true, sz: 9, color: { rgb: rateFg } }), alignment: align('center', 'center'), border: border(C.midGray), numFmt: '0' },
      }

      ws[cell(c + 2, row)] = {
        v: sol.note, t: 's',
        s: { fill: fill(isEven ? bgColor : 'FFFFFF'), font: font({ sz: 8, color: { rgb: '555555' } }), alignment: { horizontal: 'left', vertical: 'center', wrapText: true }, border: border(C.midGray) },
      }
    })

    // 종합 설치율 – 직접 계산값 입력 (수식 대신 실값)
    const avgRate = Math.round(sub.sols.reduce((s, x) => s + x.rate, 0) / sub.sols.length * 10) / 10
    const yCount  = sub.sols.filter(x => x.yn === 'Y').length

    const summBg = avgRate === 100 ? 'D5F5E3' : avgRate >= 80 ? 'EBF5FB' : avgRate >= 50 ? 'FEF9E7' : 'FADBD8'
    const summFg = avgRate === 100 ? '1E8449' : avgRate >= 80 ? '1A5276' : avgRate >= 50 ? '784212' : '922B21'
    ws[cell(19, row)] = { v: avgRate, t: 'n', s: { fill: fill(summBg), font: font({ bold: true, sz: 9, color: { rgb: summFg } }), alignment: align('center', 'center'), border: border(C.midGray), numFmt: '0.0' } }
    ws[cell(20, row)] = { v: yCount,  t: 'n', s: { fill: fill(isEven ? bgColor : 'FFFFFF'), font: font({ bold: true, sz: 9, color: { rgb: C.darkText } }), alignment: align('center', 'center'), border: border(C.midGray) } }
    ws[cell(21, row)] = { v: '', t: 's', s: { ...dataStyle, alignment: align('left', 'center') } }

    expand(21, row)
  })

  // ── 합계/평균 행 ──
  const sumRow = 4 + subsidiaries.length
  const sumStyle = {
    fill: fill(C.lightBlue),
    font: font({ bold: true, sz: 9, color: { rgb: '003D5C' } }),
    alignment: align('center', 'center'),
    border: border('0080C0'),
  }
  setCell(ws, 0, sumRow, '전체 평균', sumStyle)
  ws['!merges'].push({ s: { c: 0, r: sumRow }, e: { c: 3, r: sumRow } })

  solutions.forEach((_, si) => {
    const c = 4 + si * 3
    const yTotal   = subsidiaries.filter(s => s.sols[si].yn === 'Y').length
    const avgRateSi = Math.round(subsidiaries.reduce((s, x) => s + x.sols[si].rate, 0) / subsidiaries.length * 10) / 10
    ws[cell(c,     sumRow)] = { v: `${yTotal}/${subsidiaries.length}`, t: 's', s: sumStyle }
    ws[cell(c + 1, sumRow)] = { v: avgRateSi, t: 'n', s: { ...sumStyle, numFmt: '0.0' } }
    ws[cell(c + 2, sumRow)] = { v: '', t: 's', s: sumStyle }
  })

  const totalAvgRate = Math.round(
    subsidiaries.reduce((s, sub) => s + sub.sols.reduce((a, x) => a + x.rate, 0) / sub.sols.length, 0)
    / subsidiaries.length * 10
  ) / 10
  const totalYCount = subsidiaries.reduce((s, sub) => s + sub.sols.filter(x => x.yn === 'Y').length, 0)
  ws[cell(19, sumRow)] = { v: totalAvgRate, t: 'n', s: { ...sumStyle, numFmt: '0.0' } }
  ws[cell(20, sumRow)] = { v: totalYCount,  t: 'n', s: sumStyle }
  ws[cell(21, sumRow)] = { v: `전체 ${subsidiaries.length}개 법인 기준 (2026-06-15)`, t: 's', s: { ...sumStyle, alignment: align('left', 'center') } }
  expand(21, sumRow)

  // ── 열 너비 ──
  ws['!cols'] = [
    { wch: 12 },  // 지역
    { wch: 14 },  // 국가
    { wch: 34 },  // 법인명
    { wch: 14 },  // 코드
    // SAC
    { wch: 8 }, { wch: 8 }, { wch: 16 },
    // DAC
    { wch: 8 }, { wch: 8 }, { wch: 16 },
    // VMS
    { wch: 8 }, { wch: 8 }, { wch: 16 },
    // AV
    { wch: 8 }, { wch: 8 }, { wch: 16 },
    // EDR
    { wch: 8 }, { wch: 8 }, { wch: 16 },
    // 종합
    { wch: 10 }, { wch: 10 }, { wch: 18 },
  ]

  // ── 행 높이 ──
  ws['!rows'] = [
    { hpt: 30 },  // 타이틀
    { hpt: 18 },  // 메타
    { hpt: 22 },  // 그룹헤더
    { hpt: 30 },  // 세부헤더
    ...subsidiaries.map(() => ({ hpt: 18 })),
    { hpt: 20 },  // 합계
  ]

  ws['!ref'] = XLSX.utils.encode_range(range)
  ws['!freeze'] = { xSplit: 4, ySplit: 4 }

  return ws
}

// ────────────────────────────────────────────────
// Sheet 2: 입력 가이드 시트
// ────────────────────────────────────────────────
function buildGuideSheet() {
  const data = [
    ['현대모비스 해외법인 보안솔루션 설치현황 — 입력 가이드'],
    [''],
    ['■ 작성 방법'],
    ['항목', '입력값', '설명'],
    ['설치여부', 'Y 또는 N', '설치 완료 시 Y, 미설치 또는 진행 중 시 N 입력'],
    ['설치율(%)', '0 ~ 100 숫자', '설치 완료 비율. 예) 부분 설치 완료 시 50, 전체 완료 시 100'],
    ['비고', '자유 텍스트', '설치 예정일, 이슈사항, 담당자 등 기재'],
    [''],
    ['■ 보안솔루션 설명'],
    ['솔루션', '풀네임', '설명'],
    ...Object.entries(solutionDesc).map(([k, v]) => [k, ...v.split('(')]),
    [''],
    ['■ 지역 구분'],
    ['지역', '포함 국가'],
    ['아시아', '중국, 인도, 일본, 인도네시아, 베트남, 태국, 호주'],
    ['유럽', '독일, 체코, 슬로바키아, 헝가리, 폴란드, 네덜란드, 튀르키예, 스페인'],
    ['미주', '미국, 캐나다, 멕시코, 브라질'],
    ['중동·아프리카', 'UAE, 남아프리카공화국'],
    [''],
    ['■ 주의사항'],
    ['· 법인명, 법인코드, 지역, 국가는 수정하지 마십시오.'],
    ['· 설치여부는 반드시 대문자 Y 또는 N 만 입력하십시오.'],
    ['· 설치율(%)은 숫자만 입력하십시오. (% 기호 불필요)'],
    ['· 작성 완료 후 파일명을 "YYYYMM_보안솔루션설치현황.xlsx" 형식으로 저장하십시오.'],
    ['· 문의: 현대모비스 그룹보안팀 (security@mobis.co.kr)'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)

  ws['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 50 }]

  // 타이틀 스타일
  ws['A1'] = {
    v: data[0][0], t: 's',
    s: { fill: fill(C.darkBg), font: font({ bold: true, sz: 13, color: { rgb: C.white } }), alignment: align('left', 'center') }
  }
  ws['!merges'] = [{ s: { c: 0, r: 0 }, e: { c: 2, r: 0 } }]
  ws['!rows'] = [{ hpt: 28 }]

  return ws
}

// ────────────────────────────────────────────────
// Sheet 3: 법인 목록 (참조용)
// ────────────────────────────────────────────────
function buildListSheet() {
  const headers = ['No', '지역', '국가', '법인명(영문)', '법인코드', '비고']
  const rows = subsidiaries.map((s, i) => [i + 1, s.region, s.country, s.name, s.code, ''])

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows])
  ws['!cols'] = [{ wch: 5 }, { wch: 12 }, { wch: 14 }, { wch: 36 }, { wch: 14 }, { wch: 20 }]

  const headerStyle = {
    fill: fill(C.blue),
    font: font({ bold: true, color: { rgb: C.white }, sz: 10 }),
    alignment: align('center', 'center'),
    border: border('0080C0'),
  }
  headers.forEach((_, i) => {
    const addr = XLSX.utils.encode_cell({ c: i, r: 0 })
    if (ws[addr]) ws[addr].s = headerStyle
  })

  return ws
}

// ────────────────────────────────────────────────
// 파일 생성
// ────────────────────────────────────────────────
const wb = XLSX.utils.book_new()
wb.Props = {
  Title: '현대모비스 해외법인 보안솔루션 설치현황',
  Author: '현대모비스 그룹보안팀',
  Company: 'Hyundai Mobis',
  CreatedDate: new Date(),
}

XLSX.utils.book_append_sheet(wb, buildStatusSheet(), '설치현황')
XLSX.utils.book_append_sheet(wb, buildGuideSheet(),  '입력가이드')
XLSX.utils.book_append_sheet(wb, buildListSheet(),   '법인목록')

const outDir = join(__dirname, '..', 'public', 'templates')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, '현대모비스_보안솔루션설치현황_202506.xlsx')

XLSX.writeFile(wb, outPath, { bookType: 'xlsx', type: 'buffer', cellStyles: true })
console.log(`✅ 템플릿 생성 완료: ${outPath}`)
