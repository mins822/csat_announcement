export type BellType =
  | 'none'
  | 'entry_prep' // 입실 / 입실완료 안내
  | 'preliminary' // 예비령
  | 'prepare' // 준비령
  | 'listening_intro' // 듣기평가 안내 방송
  | 'main' // 본령 (시험 시작)
  | 'warn_10m' // 종료 10분 전
  | 'warn_5m' // 종료 5분 전
  | 'end'; // 종료령 (시험 종료)

/**
 * 시계 바늘 및 START/END TIME 표시 시각 연동 모드
 * - 'original_csat_time' (기본값): 각 타종의 원래 수능 시각으로 시계 바늘을 맞추고 대기 시간(카운트다운)만 설정 간격 적용
 * - 'custom_cascaded_time' (선택 옵션): 간격 수정에 따라 자동 연쇄 계산된 시각으로 시계 바늘 및 START/END TIME 연동
 */
export type ClockSyncMode = 'original_csat_time' | 'custom_cascaded_time';

/**
 * 부록 B: 타종/단계 유형 분류 (C2 진단 및 C6 전역 유형별 선택 도구용)
 */
export type CsatStageType =
  | 'entry' // 입실 (001, 002, 008, 014, 019, 032)
  | 'preliminary' // 예비령 (003, 009, 015, 020, 033)
  | 'prepare' // 준비령 (004, 010, 016, 021, 025, 034)
  | 'main' // 본령 (005, 011, 022, 026, 029, 035)
  | 'warn' // 종료 전 안내 (006, 012, 017, 023, 027, 030, 036)
  | 'end' // 종료령 (007, 013, 018, 024, 028, 031, 037)
  | 'listening'; // 영어 듣기 시작 (ENG_1307)

export const CSAT_STAGE_TYPE_META: { type: CsatStageType; label: string }[] = [
  { type: 'entry', label: '입실' },
  { type: 'preliminary', label: '예비령' },
  { type: 'prepare', label: '준비령' },
  { type: 'main', label: '본령' },
  { type: 'warn', label: '종료 전 안내' },
  { type: 'end', label: '종료령' },
  { type: 'listening', label: '영어 듣기 시작' },
];

export interface CsatBellCueItem {
  code: string; // '001' ~ '037'
  fileName: string; // 예: '001 0805 1교시 입실준비.m4a'
  timeText: string; // 예: '08:05'
  triggerMinutes: number; // 자정 기준 분 (예: 08:05 -> 485)
  periodLabel: string; // 예: '1교시'
  title: string; // 예: '1교시 입실준비'
  fallbackBellType: Exclude<BellType, 'none'>;
  isEndBell?: boolean; // 구간 종료 시점에 울리는 타종 여부
  durationSec: number; // 부록 A: 실측 타종 재생 길이(초)
}

export interface CsatTimetableRow {
  id: string;
  periodLabel: string;
  displayTitle: string;
  timeRangeText: string;
  startMinutes: number;
  endMinutes: number;
  category: string;
  description: string;
  bellAtStart: BellType;
  bellAtEnd: BellType;
  usesEnglishAudio?: boolean;
  /**
   * 사용자 체크박스 커스텀 시퀀스 전용 확장 필드
   */
  originalStartMinutes?: number;
  originalEndMinutes?: number;
  customStartMinutes?: number;
  customEndMinutes?: number;
  durationMinutes?: number;
  durationSeconds?: number;
  startBellCode?: string;
  endBellCode?: string;
  startNodeId?: string;
  endNodeId?: string;
  triggersEnglishAudioAtStart?: boolean;
  stopsEnglishAudioAtStart?: boolean;
  stopsEnglishAudioAtEnd?: boolean;
}

export interface CsatSessionPreset {
  id: string;
  group: 'single' | 'period_full' | 'all_day' | 'custom_sequence';
  label: string;
  shortLabel: string;
  displayTitle: string;
  startMinutes: number;
  endMinutes: number;
  steps: CsatTimetableRow[];
  isCustomSequence?: boolean;
  isTemporaryStartPoint?: boolean; // C5: '이 단계부터 시작' 임시 시작 지점 여부
  temporaryStartLabel?: string;
  totalDurationMinutes?: number;
  totalDurationSeconds?: number;
}

export type CsatSubjectGroupId = 'kor' | 'math' | 'eng' | 'hist' | 'inq1' | 'inq2' | 'lang2';

export interface CsatSelectableCueNode {
  nodeId: string; // '001' ~ '037' 또는 'ENG_1307'
  bellCode?: string; // '001' ~ '037'
  stageType: CsatStageType; // 부록 B: 명시적 타종 유형
  durationSec?: number; // 부록 A: 실측 타종 재생 길이(초)
  subjectGroupId: CsatSubjectGroupId;
  periodLabel: string;
  subjectTitle: string; // 시계 상단 표시 제목 (예: '국어 영역')
  stageShortLabel: string; // 예: '준비령', '본령', '듣기평가 안내방송 및 본령', '종료 10분 전', '종료령'
  fullTitle: string; // 예: '1교시 국어 준비령'
  originalTimeText: string; // 예: '08:35'
  originalMinutes: number; // 자정 기준 분
  isCoreExamStage?: boolean; // 준비령 / 본령 / 듣기평가 / 종료전 / 종료령 핵심 단계 여부
  isEndBell?: boolean;
  triggersEnglishListening?: boolean; // 13:07 영어 듣기평가 방송 시작 노드 여부
}

export interface CsatSubjectGroupInfo {
  id: CsatSubjectGroupId;
  periodLabel: string;
  title: string;
  shortTitle: string;
}

export interface CustomSequenceConfig {
  selectedNodeIds: string[];
  /**
   * key: `${fromNodeId}__${toNodeId}` 또는 `${nodeId}__SINGLE_END`, value: 대기 간격(분)
   */
  intervalMap: Record<string, number>;
  /**
   * B7: 초 단위 정밀 간격 저장 맵 (key 동일, value: 대기 간격 초, 10 ~ 36000)
   */
  intervalSecondsMap?: Record<string, number>;
  /**
   * 첫 번째 선택된 타종 항목의 시작 시각(분, 자정 기준). null이면 첫 항목의 원래 수능 시각 사용
   */
  firstNodeCustomMinutes: number | null;
  /**
   * B5: 개별 타종 음소거 노드/타종 코드 목록
   */
  mutedNodeIds?: string[];
}

export interface BookmarkFolder {
  id: string;
  name: string;
  createdAt: string;
}

export interface SavedSequenceBookmark {
  id: string;
  name: string;
  folderId?: string | null;
  config: CustomSequenceConfig;
  clockSyncMode: ClockSyncMode;
  createdAt: string;
}

export function hmToMinutes(hm: string): number {
  if (typeof hm !== 'string' || !hm.trim()) return 0;
  const parts = hm.trim().split(':').map(Number);
  if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) return 0;
  const sec = parts.length >= 3 && !Number.isNaN(parts[2]) ? parts[2] : 0;
  return parts[0] * 60 + parts[1] + sec / 60;
}

export function formatAmPmTime(totalMinutes: number): string {
  const dayOffset = Math.floor(totalMinutes / 1440);
  const minsNormalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const h24 = Math.floor(minsNormalized / 60);
  const m = minsNormalized % 60;
  const isPm = h24 >= 12;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const hh = String(h12).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const dayBadge = dayOffset > 0 ? ` (+${dayOffset}일)` : '';
  return `${hh}:${mm} ${isPm ? 'P.M.' : 'A.M.'}${dayBadge}`;
}

export function format24hTime(totalMinutes: number, includeDayBadge = false): string {
  const totalSec = Math.round(totalMinutes * 60);
  const dayOffset = Math.floor(totalSec / 86400);
  const secInDay = ((totalSec % 86400) + 86400) % 86400;
  const h24 = Math.floor(secInDay / 3600);
  const m = Math.floor((secInDay % 3600) / 60);
  const s = secInDay % 60;
  const base =
    s > 0
      ? `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      : `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (includeDayBadge && dayOffset > 0) {
    return `${base} (+${dayOffset}일)`;
  }
  return base;
}

export function format24hInputTime(totalMinutes: number): string {
  const totalSec = Math.round(totalMinutes * 60);
  const secInDay = ((totalSec % 86400) + 86400) % 86400;
  const h24 = Math.floor(secInDay / 3600);
  const m = Math.floor((secInDay % 3600) / 60);
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatBellDuration(durationSec?: number): string {
  if (typeof durationSec !== 'number' || Number.isNaN(durationSec) || durationSec <= 0) return '-';
  const rounded = Math.floor(durationSec);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatIntervalSecondsLabel(seconds: number): string {
  const sec = Math.max(1, Math.round(seconds));
  if (sec % 60 === 0) {
    return `${sec / 60}분`;
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

export function formatIntervalInputDisplay(seconds: number): string {
  const sec = Math.max(1, Math.round(seconds));
  if (sec % 60 === 0) {
    return String(sec / 60);
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * 부록 A: 37개 타종 파일별 실측 재생 길이(초) 매핑
 */
export const BELL_DURATION_SEC_MAP: Record<string, number> = {
  '001': 9.7,
  '002': 301.6,
  '003': 52.1,
  '004': 56.7,
  '005': 7.7,
  '006': 3.9,
  '007': 49.0,
  '008': 11.2,
  '009': 61.8,
  '010': 59.6,
  '011': 7.6,
  '012': 4.0,
  '013': 58.5,
  '014': 11.4,
  '015': 69.9,
  '016': 71.8,
  '017': 3.9,
  '018': 49.1,
  '019': 11.5,
  '020': 85.4,
  '021': 58.7,
  '022': 8.9,
  '023': 5.5,
  '024': 64.7,
  '025': 175.5,
  '026': 22.1,
  '027': 6.1,
  '028': 101.9,
  '029': 9.1,
  '030': 6.1,
  '031': 61.7,
  '032': 11.2,
  '033': 68.7,
  '034': 46.0,
  '035': 7.7,
  '036': 3.8,
  '037': 61.6,
};

/**
 * 수능타종.zip 37개 파일 전체 매핑 (이름순, 001 ~ 037)
 * 폴더 위치: /public/audio/bells/
 */
export const CSAT_37_BELL_FILES: CsatBellCueItem[] = [
  { code: '001', fileName: '001 0805 1교시 입실준비.m4a', timeText: '08:05', triggerMinutes: hmToMinutes('08:05'), periodLabel: '1교시', title: '1교시 입실준비', fallbackBellType: 'entry_prep', durationSec: 9.7 },
  { code: '002', fileName: '002 0810 1교시 입실완료.m4a', timeText: '08:10', triggerMinutes: hmToMinutes('08:10'), periodLabel: '1교시', title: '1교시 입실완료', fallbackBellType: 'entry_prep', durationSec: 301.6 },
  { code: '003', fileName: '003 0825 1교시 예비령.m4a', timeText: '08:25', triggerMinutes: hmToMinutes('08:25'), periodLabel: '1교시', title: '1교시 예비령', fallbackBellType: 'preliminary', durationSec: 52.1 },
  { code: '004', fileName: '004 0835 1교시 준비령.m4a', timeText: '08:35', triggerMinutes: hmToMinutes('08:35'), periodLabel: '1교시', title: '1교시 준비령', fallbackBellType: 'prepare', durationSec: 56.7 },
  { code: '005', fileName: '005 0840 1교시 본령.m4a', timeText: '08:40', triggerMinutes: hmToMinutes('08:40'), periodLabel: '1교시', title: '1교시 본령', fallbackBellType: 'main', durationSec: 7.7 },
  { code: '006', fileName: '006 0950 1교시 종료10분전.m4a', timeText: '09:50', triggerMinutes: hmToMinutes('09:50'), periodLabel: '1교시', title: '1교시 종료10분전', fallbackBellType: 'warn_10m', durationSec: 3.9 },
  { code: '007', fileName: '007 1000 1교시 종료령.m4a', timeText: '10:00', triggerMinutes: hmToMinutes('10:00'), periodLabel: '1교시', title: '1교시 종료령', fallbackBellType: 'end', isEndBell: true, durationSec: 49.0 },
  { code: '008', fileName: '008 1015 2교시 입실.m4a', timeText: '10:15', triggerMinutes: hmToMinutes('10:15'), periodLabel: '2교시', title: '2교시 입실', fallbackBellType: 'entry_prep', durationSec: 11.2 },
  { code: '009', fileName: '009 1020 2교시 예비령.m4a', timeText: '10:20', triggerMinutes: hmToMinutes('10:20'), periodLabel: '2교시', title: '2교시 예비령', fallbackBellType: 'preliminary', durationSec: 61.8 },
  { code: '010', fileName: '010 1025 2교시 준비령.m4a', timeText: '10:25', triggerMinutes: hmToMinutes('10:25'), periodLabel: '2교시', title: '2교시 준비령', fallbackBellType: 'prepare', durationSec: 59.6 },
  { code: '011', fileName: '011 1030 2교시 본령.m4a', timeText: '10:30', triggerMinutes: hmToMinutes('10:30'), periodLabel: '2교시', title: '2교시 본령', fallbackBellType: 'main', durationSec: 7.6 },
  { code: '012', fileName: '012 1200 2교시 종료10분전.m4a', timeText: '12:00', triggerMinutes: hmToMinutes('12:00'), periodLabel: '2교시', title: '2교시 종료10분전', fallbackBellType: 'warn_10m', durationSec: 4.0 },
  { code: '013', fileName: '013 1210 2교시 종료령.m4a', timeText: '12:10', triggerMinutes: hmToMinutes('12:10'), periodLabel: '2교시', title: '2교시 종료령', fallbackBellType: 'end', isEndBell: true, durationSec: 58.5 },
  { code: '014', fileName: '014 1255 3교시 입실.m4a', timeText: '12:55', triggerMinutes: hmToMinutes('12:55'), periodLabel: '3교시', title: '3교시 입실', fallbackBellType: 'entry_prep', durationSec: 11.4 },
  { code: '015', fileName: '015 1300 3교시 예비령.m4a', timeText: '13:00', triggerMinutes: hmToMinutes('13:00'), periodLabel: '3교시', title: '3교시 예비령', fallbackBellType: 'preliminary', durationSec: 69.9 },
  { code: '016', fileName: '016 1305 3교시 준비령.m4a', timeText: '13:05', triggerMinutes: hmToMinutes('13:05'), periodLabel: '3교시', title: '3교시 준비령', fallbackBellType: 'prepare', durationSec: 71.8 },
  { code: '017', fileName: '017 1410 3교시 종료10분전.m4a', timeText: '14:10', triggerMinutes: hmToMinutes('14:10'), periodLabel: '3교시', title: '3교시 종료10분전', fallbackBellType: 'warn_10m', durationSec: 3.9 },
  { code: '018', fileName: '018 1420 3교시 종료령.m4a', timeText: '14:20', triggerMinutes: hmToMinutes('14:20'), periodLabel: '3교시', title: '3교시 종료령', fallbackBellType: 'end', isEndBell: true, durationSec: 49.1 },
  { code: '019', fileName: '019 1435 4교시 입실.m4a', timeText: '14:35', triggerMinutes: hmToMinutes('14:35'), periodLabel: '4교시', title: '4교시 입실', fallbackBellType: 'entry_prep', durationSec: 11.5 },
  { code: '020', fileName: '020 1440 4교시 한국사 예비령.m4a', timeText: '14:40', triggerMinutes: hmToMinutes('14:40'), periodLabel: '4교시', title: '4교시 한국사 예비령', fallbackBellType: 'preliminary', durationSec: 85.4 },
  { code: '021', fileName: '021 1445 4교시 한국사 준비령.m4a', timeText: '14:45', triggerMinutes: hmToMinutes('14:45'), periodLabel: '4교시', title: '4교시 한국사 준비령', fallbackBellType: 'prepare', durationSec: 58.7 },
  { code: '022', fileName: '022 1450 4교시 한국사 본령.m4a', timeText: '14:50', triggerMinutes: hmToMinutes('14:50'), periodLabel: '4교시', title: '4교시 한국사 본령', fallbackBellType: 'main', durationSec: 8.9 },
  { code: '023', fileName: '023 1515 4교시 한국사 종료5분전.m4a', timeText: '15:15', triggerMinutes: hmToMinutes('15:15'), periodLabel: '4교시', title: '4교시 한국사 종료5분전', fallbackBellType: 'warn_5m', durationSec: 5.5 },
  { code: '024', fileName: '024 1520 4교시 한국사 종료령.m4a', timeText: '15:20', triggerMinutes: hmToMinutes('15:20'), periodLabel: '4교시', title: '4교시 한국사 종료령', fallbackBellType: 'end', isEndBell: true, durationSec: 64.7 },
  { code: '025', fileName: '025 1530 4교시 탐구 준비령.m4a', timeText: '15:30', triggerMinutes: hmToMinutes('15:30'), periodLabel: '4교시', title: '4교시 탐구 준비령', fallbackBellType: 'prepare', durationSec: 175.5 },
  { code: '026', fileName: '026 1535 4교시 탐구 첫째본령.m4a', timeText: '15:35', triggerMinutes: hmToMinutes('15:35'), periodLabel: '4교시', title: '4교시 탐구 첫째본령', fallbackBellType: 'main', durationSec: 22.1 },
  { code: '027', fileName: '027 1600 4교시 탐구 첫째종료5분전.m4a', timeText: '16:00', triggerMinutes: hmToMinutes('16:00'), periodLabel: '4교시', title: '4교시 탐구 첫째종료5분전', fallbackBellType: 'warn_5m', durationSec: 6.1 },
  { code: '028', fileName: '028 1605 4교시 탐구 첫째종료령.m4a', timeText: '16:05', triggerMinutes: hmToMinutes('16:05'), periodLabel: '4교시', title: '4교시 탐구 첫째종료령', fallbackBellType: 'end', isEndBell: true, durationSec: 101.9 },
  { code: '029', fileName: '029 1607 4교시 탐구 둘째본령.m4a', timeText: '16:07', triggerMinutes: hmToMinutes('16:07'), periodLabel: '4교시', title: '4교시 탐구 둘째본령', fallbackBellType: 'main', durationSec: 9.1 },
  { code: '030', fileName: '030 1632 4교시 탐구 둘째종료5분전.m4a', timeText: '16:32', triggerMinutes: hmToMinutes('16:32'), periodLabel: '4교시', title: '4교시 탐구 둘째종료5분전', fallbackBellType: 'warn_5m', durationSec: 6.1 },
  { code: '031', fileName: '031 1637 4교시 탐구 둘째종료령 시험장종료.m4a', timeText: '16:37', triggerMinutes: hmToMinutes('16:37'), periodLabel: '4교시', title: '4교시 탐구 둘째종료령 시험장종료', fallbackBellType: 'end', isEndBell: true, durationSec: 61.7 },
  { code: '032', fileName: '032 1650 5교시 입실.m4a', timeText: '16:50', triggerMinutes: hmToMinutes('16:50'), periodLabel: '5교시', title: '5교시 입실', fallbackBellType: 'entry_prep', durationSec: 11.2 },
  { code: '033', fileName: '033 1655 5교시 예비령.m4a', timeText: '16:55', triggerMinutes: hmToMinutes('16:55'), periodLabel: '5교시', title: '5교시 예비령', fallbackBellType: 'preliminary', durationSec: 68.7 },
  { code: '034', fileName: '034 1700 5교시 준비령.m4a', timeText: '17:00', triggerMinutes: hmToMinutes('17:00'), periodLabel: '5교시', title: '5교시 준비령', fallbackBellType: 'prepare', durationSec: 46.0 },
  { code: '035', fileName: '035 1705 5교시 본령.m4a', timeText: '17:05', triggerMinutes: hmToMinutes('17:05'), periodLabel: '5교시', title: '5교시 본령', fallbackBellType: 'main', durationSec: 7.7 },
  { code: '036', fileName: '036 1735 5교시 종료10분전.m4a', timeText: '17:35', triggerMinutes: hmToMinutes('17:35'), periodLabel: '5교시', title: '5교시 종료10분전', fallbackBellType: 'warn_10m', durationSec: 3.8 },
  { code: '037', fileName: '037 1745 5교시 종료령 시험장종료.m4a', timeText: '17:45', triggerMinutes: hmToMinutes('17:45'), periodLabel: '5교시', title: '5교시 종료령 시험장종료', fallbackBellType: 'end', isEndBell: true, durationSec: 61.6 },
];

/**
 * 영역/과목 그룹 메타데이터 (체크박스 구성 모달 좌측 목록용)
 */
export const CSAT_SUBJECT_GROUPS: CsatSubjectGroupInfo[] = [
  { id: 'kor', periodLabel: '1교시', title: '1교시 국어 영역', shortTitle: '국어' },
  { id: 'math', periodLabel: '2교시', title: '2교시 수학 영역', shortTitle: '수학' },
  { id: 'eng', periodLabel: '3교시', title: '3교시 영어 영역', shortTitle: '영어' },
  { id: 'hist', periodLabel: '4교시', title: '4교시 한국사 영역', shortTitle: '한국사' },
  { id: 'inq1', periodLabel: '4교시', title: '4교시 탐구 제1선택', shortTitle: '탐구 1선택' },
  { id: 'inq2', periodLabel: '4교시', title: '4교시 탐구 제2선택', shortTitle: '탐구 2선택' },
  { id: 'lang2', periodLabel: '5교시', title: '5교시 제2외국어/한문', shortTitle: '제2외국어' },
];

/**
 * 사용자가 체크박스로 개별 선택할 수 있는 전체 타종/이벤트 노드 목록
 * (37개 타종 + 3교시 13:07 듣기평가 통합 노드 포함, 총 38개)
 */
export const CSAT_SELECTABLE_CUE_NODES: CsatSelectableCueNode[] = [
  // 1교시 국어 영역
  { nodeId: '001', bellCode: '001', stageType: 'entry', durationSec: 9.7, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '감독관 입실', stageShortLabel: '감독관 입실', fullTitle: '1교시 국어 감독관 입실 (입실준비)', originalTimeText: '08:05', originalMinutes: hmToMinutes('08:05') },
  { nodeId: '002', bellCode: '002', stageType: 'entry', durationSec: 301.6, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '입실 완료', stageShortLabel: '입실 완료', fullTitle: '1교시 국어 입실 완료 (입실 마감)', originalTimeText: '08:10', originalMinutes: hmToMinutes('08:10') },
  { nodeId: '003', bellCode: '003', stageType: 'preliminary', durationSec: 52.1, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '국어 영역', stageShortLabel: '예비령', fullTitle: '1교시 국어 예비령', originalTimeText: '08:25', originalMinutes: hmToMinutes('08:25') },
  { nodeId: '004', bellCode: '004', stageType: 'prepare', durationSec: 56.7, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '국어 영역', stageShortLabel: '준비령', fullTitle: '1교시 국어 준비령', originalTimeText: '08:35', originalMinutes: hmToMinutes('08:35'), isCoreExamStage: true },
  { nodeId: '005', bellCode: '005', stageType: 'main', durationSec: 7.7, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '국어 영역', stageShortLabel: '본령', fullTitle: '1교시 국어 본령', originalTimeText: '08:40', originalMinutes: hmToMinutes('08:40'), isCoreExamStage: true },
  { nodeId: '006', bellCode: '006', stageType: 'warn', durationSec: 3.9, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '국어 영역', stageShortLabel: '종료 10분 전', fullTitle: '1교시 국어 종료 10분 전', originalTimeText: '09:50', originalMinutes: hmToMinutes('09:50'), isCoreExamStage: true },
  { nodeId: '007', bellCode: '007', stageType: 'end', durationSec: 49.0, subjectGroupId: 'kor', periodLabel: '1교시', subjectTitle: '국어 영역', stageShortLabel: '종료령', fullTitle: '1교시 국어 종료령', originalTimeText: '10:00', originalMinutes: hmToMinutes('10:00'), isCoreExamStage: true, isEndBell: true },

  // 2교시 수학 영역
  { nodeId: '008', bellCode: '008', stageType: 'entry', durationSec: 11.2, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '감독관 입실', fullTitle: '2교시 수학 감독관 입실', originalTimeText: '10:15', originalMinutes: hmToMinutes('10:15') },
  { nodeId: '009', bellCode: '009', stageType: 'preliminary', durationSec: 61.8, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '예비령', fullTitle: '2교시 수학 예비령', originalTimeText: '10:20', originalMinutes: hmToMinutes('10:20') },
  { nodeId: '010', bellCode: '010', stageType: 'prepare', durationSec: 59.6, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '준비령', fullTitle: '2교시 수학 준비령', originalTimeText: '10:25', originalMinutes: hmToMinutes('10:25'), isCoreExamStage: true },
  { nodeId: '011', bellCode: '011', stageType: 'main', durationSec: 7.6, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '본령', fullTitle: '2교시 수학 본령', originalTimeText: '10:30', originalMinutes: hmToMinutes('10:30'), isCoreExamStage: true },
  { nodeId: '012', bellCode: '012', stageType: 'warn', durationSec: 4.0, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '종료 10분 전', fullTitle: '2교시 수학 종료 10분 전', originalTimeText: '12:00', originalMinutes: hmToMinutes('12:00'), isCoreExamStage: true },
  { nodeId: '013', bellCode: '013', stageType: 'end', durationSec: 58.5, subjectGroupId: 'math', periodLabel: '2교시', subjectTitle: '수학 영역', stageShortLabel: '종료령', fullTitle: '2교시 수학 종료령', originalTimeText: '12:10', originalMinutes: hmToMinutes('12:10'), isCoreExamStage: true, isEndBell: true },

  // 3교시 영어 영역
  { nodeId: '014', bellCode: '014', stageType: 'entry', durationSec: 11.4, subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '감독관 입실', fullTitle: '3교시 영어 감독관 입실', originalTimeText: '12:55', originalMinutes: hmToMinutes('12:55') },
  { nodeId: '015', bellCode: '015', stageType: 'preliminary', durationSec: 69.9, subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '예비령', fullTitle: '3교시 영어 예비령', originalTimeText: '13:00', originalMinutes: hmToMinutes('13:00') },
  { nodeId: '016', bellCode: '016', stageType: 'prepare', durationSec: 71.8, subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '준비령', fullTitle: '3교시 영어 준비령', originalTimeText: '13:05', originalMinutes: hmToMinutes('13:05'), isCoreExamStage: true },
  { nodeId: 'ENG_1307', stageType: 'listening', subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '듣기평가 안내방송 및 본령', fullTitle: '3교시 영어 듣기평가 안내방송 및 본령 (13:07 시작 · 별도 타종 없음)', originalTimeText: '13:07', originalMinutes: hmToMinutes('13:07'), isCoreExamStage: true, triggersEnglishListening: true },
  { nodeId: '017', bellCode: '017', stageType: 'warn', durationSec: 3.9, subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '종료 10분 전', fullTitle: '3교시 영어 종료 10분 전', originalTimeText: '14:10', originalMinutes: hmToMinutes('14:10'), isCoreExamStage: true },
  { nodeId: '018', bellCode: '018', stageType: 'end', durationSec: 49.1, subjectGroupId: 'eng', periodLabel: '3교시', subjectTitle: '영어 영역', stageShortLabel: '종료령', fullTitle: '3교시 영어 종료령', originalTimeText: '14:20', originalMinutes: hmToMinutes('14:20'), isCoreExamStage: true, isEndBell: true },

  // 4교시 한국사 영역
  { nodeId: '019', bellCode: '019', stageType: 'entry', durationSec: 11.5, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '감독관 입실', fullTitle: '4교시 한국사 감독관 입실', originalTimeText: '14:35', originalMinutes: hmToMinutes('14:35') },
  { nodeId: '020', bellCode: '020', stageType: 'preliminary', durationSec: 85.4, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '예비령', fullTitle: '4교시 한국사 예비령', originalTimeText: '14:40', originalMinutes: hmToMinutes('14:40') },
  { nodeId: '021', bellCode: '021', stageType: 'prepare', durationSec: 58.7, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '준비령', fullTitle: '4교시 한국사 준비령', originalTimeText: '14:45', originalMinutes: hmToMinutes('14:45'), isCoreExamStage: true },
  { nodeId: '022', bellCode: '022', stageType: 'main', durationSec: 8.9, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '본령', fullTitle: '4교시 한국사 본령', originalTimeText: '14:50', originalMinutes: hmToMinutes('14:50'), isCoreExamStage: true },
  { nodeId: '023', bellCode: '023', stageType: 'warn', durationSec: 5.5, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '종료 5분 전', fullTitle: '4교시 한국사 종료 5분 전', originalTimeText: '15:15', originalMinutes: hmToMinutes('15:15'), isCoreExamStage: true },
  { nodeId: '024', bellCode: '024', stageType: 'end', durationSec: 64.7, subjectGroupId: 'hist', periodLabel: '4교시', subjectTitle: '한국사 영역', stageShortLabel: '종료령', fullTitle: '4교시 한국사 종료령', originalTimeText: '15:20', originalMinutes: hmToMinutes('15:20'), isCoreExamStage: true, isEndBell: true },

  // 4교시 탐구 제1선택
  { nodeId: '025', bellCode: '025', stageType: 'prepare', durationSec: 175.5, subjectGroupId: 'inq1', periodLabel: '4교시', subjectTitle: '탐구1 영역', stageShortLabel: '탐구 준비령', fullTitle: '4교시 탐구 준비령', originalTimeText: '15:30', originalMinutes: hmToMinutes('15:30'), isCoreExamStage: true },
  { nodeId: '026', bellCode: '026', stageType: 'main', durationSec: 22.1, subjectGroupId: 'inq1', periodLabel: '4교시', subjectTitle: '탐구1 영역', stageShortLabel: '본령 (제1선택)', fullTitle: '4교시 탐구 제1선택 본령', originalTimeText: '15:35', originalMinutes: hmToMinutes('15:35'), isCoreExamStage: true },
  { nodeId: '027', bellCode: '027', stageType: 'warn', durationSec: 6.1, subjectGroupId: 'inq1', periodLabel: '4교시', subjectTitle: '탐구1 영역', stageShortLabel: '종료 5분 전', fullTitle: '4교시 탐구 제1선택 종료 5분 전', originalTimeText: '16:00', originalMinutes: hmToMinutes('16:00'), isCoreExamStage: true },
  { nodeId: '028', bellCode: '028', stageType: 'end', durationSec: 101.9, subjectGroupId: 'inq1', periodLabel: '4교시', subjectTitle: '탐구1 영역', stageShortLabel: '종료령 (제1선택)', fullTitle: '4교시 탐구 제1선택 종료령', originalTimeText: '16:05', originalMinutes: hmToMinutes('16:05'), isCoreExamStage: true, isEndBell: true },

  // 4교시 탐구 제2선택
  { nodeId: '029', bellCode: '029', stageType: 'main', durationSec: 9.1, subjectGroupId: 'inq2', periodLabel: '4교시', subjectTitle: '탐구2 영역', stageShortLabel: '제2선택 시작', fullTitle: '4교시 탐구 제2선택 시작 (본령)', originalTimeText: '16:07', originalMinutes: hmToMinutes('16:07'), isCoreExamStage: true },
  { nodeId: '030', bellCode: '030', stageType: 'warn', durationSec: 6.1, subjectGroupId: 'inq2', periodLabel: '4교시', subjectTitle: '탐구2 영역', stageShortLabel: '종료 5분 전', fullTitle: '4교시 탐구 제2선택 종료 5분 전', originalTimeText: '16:32', originalMinutes: hmToMinutes('16:32'), isCoreExamStage: true },
  { nodeId: '031', bellCode: '031', stageType: 'end', durationSec: 61.7, subjectGroupId: 'inq2', periodLabel: '4교시', subjectTitle: '탐구2 영역', stageShortLabel: '종료령', fullTitle: '4교시 탐구 영역 종료령', originalTimeText: '16:37', originalMinutes: hmToMinutes('16:37'), isCoreExamStage: true, isEndBell: true },

  // 5교시 제2외국어/한문
  { nodeId: '032', bellCode: '032', stageType: 'entry', durationSec: 11.2, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '감독관 입실', fullTitle: '5교시 제2외국어/한문 감독관 입실', originalTimeText: '16:50', originalMinutes: hmToMinutes('16:50') },
  { nodeId: '033', bellCode: '033', stageType: 'preliminary', durationSec: 68.7, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '예비령', fullTitle: '5교시 제2외국어/한문 예비령', originalTimeText: '16:55', originalMinutes: hmToMinutes('16:55') },
  { nodeId: '034', bellCode: '034', stageType: 'prepare', durationSec: 46.0, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '준비령', fullTitle: '5교시 제2외국어/한문 준비령', originalTimeText: '17:00', originalMinutes: hmToMinutes('17:00'), isCoreExamStage: true },
  { nodeId: '035', bellCode: '035', stageType: 'main', durationSec: 7.7, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '본령', fullTitle: '5교시 제2외국어/한문 본령', originalTimeText: '17:05', originalMinutes: hmToMinutes('17:05'), isCoreExamStage: true },
  { nodeId: '036', bellCode: '036', stageType: 'warn', durationSec: 3.8, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '종료 10분 전', fullTitle: '5교시 제2외국어/한문 종료 10분 전', originalTimeText: '17:35', originalMinutes: hmToMinutes('17:35'), isCoreExamStage: true },
  { nodeId: '037', bellCode: '037', stageType: 'end', durationSec: 61.6, subjectGroupId: 'lang2', periodLabel: '5교시', subjectTitle: '제2외국어/한문', stageShortLabel: '종료령', fullTitle: '5교시 제2외국어/한문 종료령', originalTimeText: '17:45', originalMinutes: hmToMinutes('17:45'), isCoreExamStage: true, isEndBell: true },
];

export function getDefaultIntervalBetweenNodes(
  fromNode: CsatSelectableCueNode,
  toNode: CsatSelectableCueNode
): number {
  return Math.max(1, toNode.originalMinutes - fromNode.originalMinutes);
}

export function getIntervalMapKey(fromNodeId: string, toNodeId: string): string {
  return `${fromNodeId}__${toNodeId}`;
}

export const DEFAULT_CUSTOM_SEQUENCE_CONFIG: CustomSequenceConfig = {
  selectedNodeIds: CSAT_SELECTABLE_CUE_NODES.map((n) => n.nodeId),
  intervalMap: {},
  intervalSecondsMap: {},
  firstNodeCustomMinutes: null,
  mutedNodeIds: [],
};

export const DEFAULT_BOOKMARK_FOLDERS: BookmarkFolder[] = [];
export const DEFAULT_SEQUENCE_BOOKMARKS: SavedSequenceBookmark[] = [];

export function cloneSequenceConfig(config: CustomSequenceConfig): CustomSequenceConfig {
  return {
    selectedNodeIds: Array.isArray(config.selectedNodeIds) ? [...config.selectedNodeIds] : [],
    intervalMap: config.intervalMap ? { ...config.intervalMap } : {},
    intervalSecondsMap: config.intervalSecondsMap ? { ...config.intervalSecondsMap } : {},
    firstNodeCustomMinutes:
      typeof config.firstNodeCustomMinutes === 'number' && !Number.isNaN(config.firstNodeCustomMinutes)
        ? config.firstNodeCustomMinutes
        : null,
    mutedNodeIds: Array.isArray(config.mutedNodeIds) ? [...config.mutedNodeIds] : [],
  };
}

/**
 * C3: 간격 입력값(분 정수 또는 mm:ss) 단일 검증 함수
 * - 최소 10초 (0:10), 최대 600분 (36000초)
 */
export interface IntervalValidationResult {
  ok: boolean;
  seconds?: number;
  minutes?: number;
  error?: string;
  reason?: string;
}

export function validateIntervalInput(raw: string | number): IntervalValidationResult {
  if (typeof raw === 'number') {
    if (Number.isNaN(raw) || !Number.isFinite(raw)) {
      const msg = '유효한 숫자를 입력해 주세요.';
      return { ok: false, error: msg, reason: msg };
    }
    const sec = Math.round(raw * 60);
    if (sec < 10 || sec > 36000) {
      const msg = '간격은 최소 10초(0:10) ~ 최대 600분 사이여야 합니다.';
      return { ok: false, error: msg, reason: msg };
    }
    return { ok: true, seconds: sec, minutes: sec / 60 };
  }

  const trimmed = String(raw ?? '').trim();
  if (!trimmed) {
    const msg = '간격을 입력해 주세요. (예: 5 또는 01:30)';
    return { ok: false, error: msg, reason: msg };
  }

  const mmSsMatch = trimmed.match(/^(\d+):([0-5]\d)$/);
  if (mmSsMatch) {
    const mins = Number(mmSsMatch[1]);
    const secs = Number(mmSsMatch[2]);
    const totalSec = mins * 60 + secs;
    if (totalSec < 10 || totalSec > 36000) {
      const msg = '간격은 최소 10초(0:10) ~ 최대 600분(600:00) 사이여야 합니다.';
      return { ok: false, error: msg, reason: msg };
    }
    return { ok: true, seconds: totalSec, minutes: totalSec / 60 };
  }

  if (/^\d+$/.test(trimmed)) {
    const mins = Number(trimmed);
    const totalSec = mins * 60;
    if (totalSec < 10 || totalSec > 36000) {
      const msg = '간격은 최소 1분(또는 0:10) ~ 최대 600분 사이여야 합니다.';
      return { ok: false, error: msg, reason: msg };
    }
    return { ok: true, seconds: totalSec, minutes: mins };
  }

  const msg = '정수 분(예: 5) 또는 분:초(예: 01:30) 형식으로 입력해 주세요.';
  return {
    ok: false,
    error: msg,
    reason: msg,
  };
}

/**
 * C3: 시각 직접 입력(HH:MM 또는 HH:MM:SS) 단일 검증 함수
 */
export interface TimeInputValidationResult {
  ok: boolean;
  minutes?: number;
  seconds?: number;
  secondsFromMidnight?: number;
  intervalFromPrevSeconds?: number;
  intervalSeconds?: number;
  error?: string;
  reason?: string;
}

export function validateRowTimeInput(
  rawTime: string,
  prevRowCustomTimeSeconds: number | null,
  isFirstRow?: boolean | number | null
): TimeInputValidationResult {
  const trimmed = String(rawTime ?? '').trim();
  if (!trimmed) {
    const msg = '시각을 비울 수 없습니다. 당일 시각(HH:MM)을 입력해 주세요.';
    return { ok: false, error: msg, reason: msg };
  }
  const match = trimmed.match(/^(\d{1,2}):([0-5]\d)(?::([0-5]\d))?$/);
  if (!match || Number(match[1]) > 23) {
    const msg = '당일 시각(00:00 ~ 23:59) 형식으로 입력해 주세요.';
    return { ok: false, error: msg, reason: msg };
  }
  const hh = Number(match[1]);
  const mm = Number(match[2]);
  const ss = match[3] ? Number(match[3]) : 0;
  const totalSec = hh * 3600 + mm * 60 + ss;
  const totalMin = totalSec / 60;

  if (isFirstRow !== true && typeof prevRowCustomTimeSeconds === 'number') {
    const prevSec = Math.round(prevRowCustomTimeSeconds);
    if (prevSec >= 86400) {
      const msg = '자정(+1일) 이후 단계는 간격(분/초) 입력란으로만 조정할 수 있습니다.';
      return {
        ok: false,
        error: msg,
        reason: msg,
      };
    }
    const diffSec = totalSec - prevSec;
    if (diffSec <= 0) {
      const msg = `직전 단계(${format24hTime(prevSec / 60)})보다 이후 시각을 입력해 주세요.`;
      return {
        ok: false,
        error: msg,
        reason: msg,
      };
    }
    if (diffSec < 10) {
      const msg = '직전 단계와 최소 10초 이상 간격이 필요합니다.';
      return { ok: false, error: msg, reason: msg };
    }
    if (diffSec > 36000) {
      const msg = '직전 단계와의 간격은 최대 600분을 넘을 수 없습니다.';
      return { ok: false, error: msg, reason: msg };
    }
    return {
      ok: true,
      minutes: totalMin,
      seconds: totalSec,
      secondsFromMidnight: totalSec,
      intervalFromPrevSeconds: diffSec,
      intervalSeconds: diffSec,
    };
  }

  return { ok: true, minutes: totalMin, seconds: totalSec, secondsFromMidnight: totalSec };
}

/**
 * C3 & A3: 외부 JSON / localStorage / 즐겨찾기 구성 단일 검증 및 정규화 함수
 */
export interface ConfigValidationReport {
  config: CustomSequenceConfig;
  hadWarnings: boolean;
  warnings: string[];
  correctedCount: number;
}

export function validateConfig(
  raw: unknown,
  fallback: CustomSequenceConfig = DEFAULT_CUSTOM_SEQUENCE_CONFIG
): ConfigValidationReport {
  const warnings: string[] = [];
  if (!raw || typeof raw !== 'object') {
    return {
      config: cloneSequenceConfig(fallback),
      hadWarnings: true,
      warnings: ['구성 데이터 형식이 올바르지 않아 기본 구성을 사용합니다.'],
      correctedCount: 1,
    };
  }

  const obj = raw as Record<string, unknown>;
  const validNodeSet = new Set(CSAT_SELECTABLE_CUE_NODES.map((n) => n.nodeId));
  const validBellSet = new Set(CSAT_37_BELL_FILES.map((b) => b.code));

  let selectedNodeIds: string[] = [];
  if (Array.isArray(obj.selectedNodeIds)) {
    const seen = new Set<string>();
    for (const item of obj.selectedNodeIds) {
      const id = String(item ?? '').trim();
      if (validNodeSet.has(id) && !seen.has(id)) {
        seen.add(id);
        selectedNodeIds.push(id);
      } else if (id) {
        warnings.push(`알 수 없거나 중복된 타종 ID(${id})를 제외했습니다.`);
      }
    }
    selectedNodeIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => seen.has(n.nodeId)).map(
      (n) => n.nodeId
    );
  } else {
    selectedNodeIds = [...fallback.selectedNodeIds];
    warnings.push('선택된 타종 목록이 없어 기본 목록으로 복원했습니다.');
  }

  const intervalMap: Record<string, number> = {};
  const intervalSecondsMap: Record<string, number> = {};

  if (obj.intervalSecondsMap && typeof obj.intervalSecondsMap === 'object') {
    for (const [k, v] of Object.entries(obj.intervalSecondsMap as Record<string, unknown>)) {
      const num = Number(v);
      if (Number.isFinite(num) && num >= 10 && num <= 36000) {
        const sec = Math.round(num);
        intervalSecondsMap[k] = sec;
        intervalMap[k] = Number((sec / 60).toFixed(4));
      } else {
        warnings.push(`간격(${k}) 값이 허용 범위(10초~600분)를 벗어나 제외했습니다.`);
      }
    }
  }

  if (obj.intervalMap && typeof obj.intervalMap === 'object') {
    for (const [k, v] of Object.entries(obj.intervalMap as Record<string, unknown>)) {
      if (intervalSecondsMap[k] !== undefined) continue;
      const num = Number(v);
      const sec = Math.round(num * 60);
      if (Number.isFinite(num) && sec >= 10 && sec <= 36000) {
        intervalSecondsMap[k] = sec;
        intervalMap[k] = Number((sec / 60).toFixed(4));
      } else {
        warnings.push(`간격(${k}) 값이 허용 범위(10초~600분)를 벗어나 제외했습니다.`);
      }
    }
  }

  let firstNodeCustomMinutes: number | null = null;
  if (obj.firstNodeCustomMinutes !== null && obj.firstNodeCustomMinutes !== undefined) {
    const fm = Number(obj.firstNodeCustomMinutes);
    if (Number.isFinite(fm) && fm >= 0 && fm < 1440) {
      firstNodeCustomMinutes = fm;
    } else {
      warnings.push('시작 기준 시각이 당일 범위(00:00~23:59)를 벗어나 원래 시각으로 초기화했습니다.');
    }
  }

  const mutedNodeIds: string[] = [];
  if (Array.isArray(obj.mutedNodeIds)) {
    const seenMute = new Set<string>();
    for (const item of obj.mutedNodeIds) {
      const id = String(item ?? '').trim();
      if ((validNodeSet.has(id) || validBellSet.has(id)) && !seenMute.has(id)) {
        seenMute.add(id);
        mutedNodeIds.push(id);
      }
    }
  }

  return {
    config: {
      selectedNodeIds,
      intervalMap,
      intervalSecondsMap,
      firstNodeCustomMinutes,
      mutedNodeIds,
    },
    hadWarnings: warnings.length > 0,
    warnings,
    correctedCount: warnings.length,
  };
}

/**
 * 북마크 폴더 목록 검증 함수
 */
export function validateBookmarkFolders(rawList: unknown): {
  folders: BookmarkFolder[];
  correctedCount: number;
} {
  if (!Array.isArray(rawList)) return { folders: [], correctedCount: rawList ? 1 : 0 };
  const result: BookmarkFolder[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  let correctedCount = 0;

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || typeof item !== 'object') {
      correctedCount++;
      continue;
    }
    const rec = item as Record<string, unknown>;
    const rawName = typeof rec.name === 'string' ? rec.name.trim() : '';
    if (!rawName) {
      correctedCount++;
      continue;
    }
    const safeName = rawName.slice(0, 30);
    if (seenNames.has(safeName)) {
      correctedCount++;
      continue;
    }
    const rawId =
      typeof rec.id === 'string' && rec.id.trim()
        ? rec.id.trim().slice(0, 80)
        : `bmf_${Date.now()}_${i}`;
    if (seenIds.has(rawId)) {
      correctedCount++;
      continue;
    }
    const createdAt =
      typeof rec.createdAt === 'string' && rec.createdAt.trim()
        ? rec.createdAt.trim().slice(0, 40)
        : new Date().toISOString();

    seenIds.add(rawId);
    seenNames.add(safeName);
    result.push({
      id: rawId,
      name: safeName,
      createdAt,
    });
  }
  return { folders: result, correctedCount };
}

/**
 * A3 & C4: 즐겨찾기 배열 형태 및 내부 구성 검증 함수 (XSS 및 깨진 데이터 방어)
 */
export function validateBookmarks(
  rawList: unknown,
  validFolderIds?: Set<string>
): {
  bookmarks: SavedSequenceBookmark[];
  correctedCount: number;
} {
  if (!Array.isArray(rawList)) return { bookmarks: [], correctedCount: rawList ? 1 : 0 };
  const result: SavedSequenceBookmark[] = [];
  const seenIds = new Set<string>();
  let correctedCount = 0;

  for (let i = 0; i < rawList.length; i++) {
    const item = rawList[i];
    if (!item || typeof item !== 'object') {
      correctedCount++;
      continue;
    }
    const rec = item as Record<string, unknown>;
    const rawName = typeof rec.name === 'string' ? rec.name.trim() : '';
    if (!rawName) {
      correctedCount++;
      continue;
    }
    const safeName = rawName.slice(0, 60);
    const rawId =
      typeof rec.id === 'string' && rec.id.trim()
        ? rec.id.trim().slice(0, 80)
        : `bm_${Date.now()}_${i}`;
    if (seenIds.has(rawId)) {
      correctedCount++;
      continue;
    }

    const validated = validateConfig(rec.config);
    correctedCount += validated.correctedCount;
    if (validated.config.selectedNodeIds.length === 0) {
      correctedCount++;
      continue;
    }

    const syncMode: ClockSyncMode =
      rec.clockSyncMode === 'custom_cascaded_time' ? 'custom_cascaded_time' : 'original_csat_time';
    const createdAt =
      typeof rec.createdAt === 'string' && rec.createdAt.trim()
        ? rec.createdAt.trim().slice(0, 40)
        : new Date().toISOString();

    let folderId: string | null =
      typeof rec.folderId === 'string' && rec.folderId.trim()
        ? rec.folderId.trim().slice(0, 80)
        : null;
    if (folderId && validFolderIds && !validFolderIds.has(folderId)) {
      folderId = null;
      correctedCount++;
    }

    seenIds.add(rawId);
    result.push({
      id: rawId,
      name: safeName,
      folderId,
      config: validated.config,
      clockSyncMode: syncMode,
      createdAt,
    });
  }
  return { bookmarks: result, correctedCount };
}

/**
 * B3: 응시 과목 기반 자동 선택 노드 생성기
 */
export interface SubjectAutoBuildOptions {
  subjectIds?: CsatSubjectGroupId[];
  stageScope?: 'all' | 'core' | 'core4' | 'withPrelim' | 'exam_only';
  includeEnglishListening?: boolean;
  subjectTransitionMinutes?: 'official' | number;
  kor?: boolean;
  math?: boolean;
  eng?: boolean;
  hist?: boolean;
  inquiryCount?: 0 | 1 | 2;
  lang2?: boolean;
  coreOnly?: boolean;
}

export function buildSubjectBasedNodeIds(
  opts: SubjectAutoBuildOptions,
  baseConfig?: CustomSequenceConfig
): CustomSequenceConfig {
  const allowedGroups = new Set<CsatSubjectGroupId>();
  if (Array.isArray(opts.subjectIds) && opts.subjectIds.length > 0) {
    for (const id of opts.subjectIds) allowedGroups.add(id);
  } else {
    if (opts.kor) allowedGroups.add('kor');
    if (opts.math) allowedGroups.add('math');
    if (opts.eng) allowedGroups.add('eng');
    if (opts.hist) allowedGroups.add('hist');
    if ((opts.inquiryCount ?? 0) >= 1) allowedGroups.add('inq1');
    if ((opts.inquiryCount ?? 0) >= 2) allowedGroups.add('inq2');
    if (opts.lang2) allowedGroups.add('lang2');
  }

  const stageScope = opts.stageScope || (opts.coreOnly ? 'core' : 'all');
  const includeEngListening = opts.includeEnglishListening ?? true;

  const selectedNodes = CSAT_SELECTABLE_CUE_NODES.filter((n) => {
    if (!allowedGroups.has(n.subjectGroupId)) return false;
    if (n.nodeId === 'ENG_1307') return includeEngListening;
    if (stageScope === 'core' || stageScope === 'core4') return Boolean(n.isCoreExamStage);
    if (stageScope === 'withPrelim') {
      return Boolean(n.isCoreExamStage) || n.stageType === 'preliminary';
    }
    if (stageScope === 'exam_only') {
      return (
        n.stageType === 'main' ||
        n.stageType === 'listening' ||
        n.stageType === 'warn' ||
        n.stageType === 'end'
      );
    }
    return true;
  });

  const selectedNodeIds = selectedNodes.map((n) => n.nodeId);
  const intervalMap: Record<string, number> = { ...(baseConfig?.intervalMap || {}) };
  const intervalSecondsMap: Record<string, number> = { ...(baseConfig?.intervalSecondsMap || {}) };

  if (typeof opts.subjectTransitionMinutes === 'number' && opts.subjectTransitionMinutes > 0) {
    const transSec = Math.max(10, Math.min(36000, Math.round(opts.subjectTransitionMinutes * 60)));
    for (let i = 0; i < selectedNodes.length - 1; i++) {
      const curr = selectedNodes[i];
      const next = selectedNodes[i + 1];
      if (curr.subjectGroupId !== next.subjectGroupId) {
        const key = getIntervalMapKey(curr.nodeId, next.nodeId);
        intervalSecondsMap[key] = transSec;
        intervalMap[key] = Number((transSec / 60).toFixed(4));
      }
    }
  } else if (opts.subjectTransitionMinutes === 'official') {
    for (let i = 0; i < selectedNodes.length - 1; i++) {
      const curr = selectedNodes[i];
      const next = selectedNodes[i + 1];
      if (curr.subjectGroupId !== next.subjectGroupId) {
        const key = getIntervalMapKey(curr.nodeId, next.nodeId);
        delete intervalSecondsMap[key];
        delete intervalMap[key];
      }
    }
  }

  return {
    selectedNodeIds,
    intervalMap,
    intervalSecondsMap,
    firstNodeCustomMinutes: baseConfig?.firstNodeCustomMinutes ?? null,
    mutedNodeIds: [...(baseConfig?.mutedNodeIds || [])],
  };
}

/**
 * C7: 단일 구성 분석 결과 인터페이스 (`analyzeSequenceConfig`)
 */
export interface BellTruncationWarning {
  durationSec: number;
  intervalAfterSec: number;
  bellDurationSec: number;
  intervalSec: number;
  truncatedBySec: number;
  recommendedMinutes: number;
}

export interface ComputedSequenceNodeRow {
  node: CsatSelectableCueNode;
  index: number;
  customTimeMinutes: number;
  customTimeSeconds: number;
  dayOffset: number;
  intervalAfterMinutes: number;
  intervalAfterSeconds: number;
  nextNode: CsatSelectableCueNode | null;
  omittedAfter: CsatSelectableCueNode[]; // C2: 이 행과 다음 선택 행 사이에 생략된 공식 타종 노드
  truncationWarning: BellTruncationWarning | null; // B2: 타종 잘림 경고
  missingEngListeningNotice: boolean; // A2 & C2: 016 선택 시 ENG_1307 누락 안내
  isMuted: boolean; // B5: 해당 노드 음소거 여부
  isSubjectTransition: boolean; // B4: 과목 전환 구간 여부
  isPeriodTransition: boolean; // B4: 교시 전환 구간 여부
}

export interface SequenceDiagnosticItem {
  id: string;
  severity: 'info' | 'warn' | 'error';
  level: 'info' | 'warn' | 'error';
  message: string;
  fixNodeIds?: string[];
  fixLabel?: string;
}

export interface SubjectGroupSelectionStat {
  groupId: CsatSubjectGroupId;
  totalCount: number;
  selectedCount: number;
  state: 'none' | 'partial' | 'all';
  stateLabel: '미선택' | '일부 선택' | '전체 선택';
  allCoreSelected: boolean;
  isCoreAllSelected: boolean;
}

export interface SequenceAnalysisResult {
  rows: ComputedSequenceNodeRow[];
  selectedCount: number;
  omittedBeforeFirst: CsatSelectableCueNode[];
  omittedAfterLast: CsatSelectableCueNode[];
  totalOmittedBetweenCount: number;
  truncationWarningCount: number;
  totalDurationSeconds: number;
  totalWaitSeconds: number;
  totalDurationMinutes: number;
  startOriginalMinutes: number;
  endOriginalMinutes: number;
  startCalculatedMinutes: number;
  endCalculatedMinutes: number;
  diagnostics: SequenceDiagnosticItem[];
  groupStats: Record<CsatSubjectGroupId, SubjectGroupSelectionStat>;
}

export function resolveIntervalSecondsForPair(
  config: CustomSequenceConfig,
  pairKey: string,
  defaultMinutes: number
): number {
  if (config.intervalSecondsMap && typeof config.intervalSecondsMap[pairKey] === 'number') {
    const s = Math.round(config.intervalSecondsMap[pairKey]);
    if (s >= 10 && s <= 36000) return s;
  }
  if (config.intervalMap && typeof config.intervalMap[pairKey] === 'number') {
    const s = Math.round(config.intervalMap[pairKey] * 60);
    if (s >= 10 && s <= 36000) return s;
  }
  return Math.max(10, Math.round(defaultMinutes * 60));
}

export function analyzeSequenceConfig(config: CustomSequenceConfig): SequenceAnalysisResult {
  const selectedSet = new Set(config.selectedNodeIds || []);
  const mutedSet = new Set(config.mutedNodeIds || []);
  const orderedNodes = CSAT_SELECTABLE_CUE_NODES.filter((n) => selectedSet.has(n.nodeId));

  // 과목 그룹별 선택 상태 집계 (C6)
  const groupStats = {} as Record<CsatSubjectGroupId, SubjectGroupSelectionStat>;
  for (const grp of CSAT_SUBJECT_GROUPS) {
    const grpNodes = CSAT_SELECTABLE_CUE_NODES.filter((n) => n.subjectGroupId === grp.id);
    const selNodes = grpNodes.filter((n) => selectedSet.has(n.nodeId));
    const coreNodes = grpNodes.filter((n) => n.isCoreExamStage);
    const allCoreSelected =
      coreNodes.length > 0 && coreNodes.every((n) => selectedSet.has(n.nodeId));
    const state: 'none' | 'partial' | 'all' =
      selNodes.length === 0 ? 'none' : selNodes.length === grpNodes.length ? 'all' : 'partial';
    const stateLabel =
      state === 'none' ? '미선택' : state === 'all' ? '전체 선택' : '일부 선택';

    groupStats[grp.id] = {
      groupId: grp.id,
      totalCount: grpNodes.length,
      selectedCount: selNodes.length,
      state,
      stateLabel,
      allCoreSelected,
      isCoreAllSelected: allCoreSelected,
    };
  }

  if (orderedNodes.length === 0) {
    return {
      rows: [],
      selectedCount: 0,
      omittedBeforeFirst: [...CSAT_SELECTABLE_CUE_NODES],
      omittedAfterLast: [],
      totalOmittedBetweenCount: 0,
      truncationWarningCount: 0,
      totalDurationSeconds: 0,
      totalWaitSeconds: 0,
      totalDurationMinutes: 0,
      startOriginalMinutes: 0,
      endOriginalMinutes: 0,
      startCalculatedMinutes: 0,
      endCalculatedMinutes: 0,
      diagnostics: [
        {
          id: 'err_empty',
          severity: 'error',
          level: 'error',
          message: '선택된 타종 단계가 없습니다. 최소 1개 이상의 타종 단계를 선택해 주세요.',
        },
      ],
      groupStats,
    };
  }

  const nodeIndexInAll = new Map<string, number>();
  CSAT_SELECTABLE_CUE_NODES.forEach((n, idx) => nodeIndexInAll.set(n.nodeId, idx));

  const firstOfficialIdx = nodeIndexInAll.get(orderedNodes[0].nodeId) ?? 0;
  const lastOfficialIdx =
    nodeIndexInAll.get(orderedNodes[orderedNodes.length - 1].nodeId) ??
    CSAT_SELECTABLE_CUE_NODES.length - 1;

  const omittedBeforeFirst = CSAT_SELECTABLE_CUE_NODES.slice(0, firstOfficialIdx);
  const omittedAfterLast = CSAT_SELECTABLE_CUE_NODES.slice(lastOfficialIdx + 1);

  let currentCustomSeconds =
    typeof config.firstNodeCustomMinutes === 'number' &&
    !Number.isNaN(config.firstNodeCustomMinutes)
      ? Math.round(config.firstNodeCustomMinutes * 60)
      : orderedNodes[0].originalMinutes * 60;

  const rows: ComputedSequenceNodeRow[] = [];
  let totalOmittedBetweenCount = 0;
  let truncationWarningCount = 0;

  for (let i = 0; i < orderedNodes.length; i++) {
    const node = orderedNodes[i];
    const nextNode = i < orderedNodes.length - 1 ? orderedNodes[i + 1] : null;
    let intervalAfterSeconds = 300;
    let omittedAfter: CsatSelectableCueNode[] = [];

    if (nextNode) {
      const pairKey = getIntervalMapKey(node.nodeId, nextNode.nodeId);
      const defaultMins = getDefaultIntervalBetweenNodes(node, nextNode);
      intervalAfterSeconds = resolveIntervalSecondsForPair(config, pairKey, defaultMins);

      const currAllIdx = nodeIndexInAll.get(node.nodeId) ?? 0;
      const nextAllIdx = nodeIndexInAll.get(nextNode.nodeId) ?? currAllIdx;
      if (nextAllIdx > currAllIdx + 1) {
        omittedAfter = CSAT_SELECTABLE_CUE_NODES.slice(currAllIdx + 1, nextAllIdx).filter(
          (cand) => !selectedSet.has(cand.nodeId)
        );
        totalOmittedBetweenCount += omittedAfter.length;
      }
    } else {
      const singleKey = getIntervalMapKey(node.nodeId, 'SINGLE_END');
      intervalAfterSeconds = resolveIntervalSecondsForPair(config, singleKey, 5);
    }

    // B2: 타종 잘림 경고 판정 (단독 1개 선택이거나 마지막 노드가 아닌 경우)
    let truncationWarning: BellTruncationWarning | null = null;
    const checksInterval = orderedNodes.length === 1 || nextNode !== null;
    if (checksInterval && typeof node.durationSec === 'number') {
      const ceilDur = Math.ceil(node.durationSec);
      if (intervalAfterSeconds < ceilDur) {
        truncationWarning = {
          durationSec: node.durationSec,
          intervalAfterSec: intervalAfterSeconds,
          bellDurationSec: node.durationSec,
          intervalSec: intervalAfterSeconds,
          truncatedBySec: ceilDur - intervalAfterSeconds,
          recommendedMinutes: Math.ceil(node.durationSec / 60),
        };
        truncationWarningCount++;
      }
    }

    const missingEngListeningNotice =
      node.nodeId === '016' && !selectedSet.has('ENG_1307');

    const isMuted =
      mutedSet.has(node.nodeId) || Boolean(node.bellCode && mutedSet.has(node.bellCode));

    const isSubjectTransition = Boolean(
      nextNode && node.subjectGroupId !== nextNode.subjectGroupId
    );
    const isPeriodTransition = Boolean(nextNode && node.periodLabel !== nextNode.periodLabel);

    rows.push({
      node,
      index: i,
      customTimeMinutes: currentCustomSeconds / 60,
      customTimeSeconds: currentCustomSeconds,
      dayOffset: Math.floor(currentCustomSeconds / 86400),
      intervalAfterMinutes: intervalAfterSeconds / 60,
      intervalAfterSeconds,
      nextNode,
      omittedAfter,
      truncationWarning,
      missingEngListeningNotice,
      isMuted,
      isSubjectTransition,
      isPeriodTransition,
    });

    currentCustomSeconds += intervalAfterSeconds;
  }

  const totalDurationSeconds =
    rows.length === 1
      ? rows[0].intervalAfterSeconds
      : rows.slice(0, -1).reduce((acc, r) => acc + r.intervalAfterSeconds, 0);

  const startOriginalMinutes = rows[0].node.originalMinutes;
  const endOriginalMinutes =
    rows.length === 1
      ? rows[0].node.originalMinutes + rows[0].intervalAfterMinutes
      : rows[rows.length - 1].node.originalMinutes;

  const startCalculatedMinutes = rows[0].customTimeMinutes;
  const endCalculatedMinutes = startCalculatedMinutes + totalDurationSeconds / 60;

  // C2: 구조 진단 생성
  const diagnostics: SequenceDiagnosticItem[] = [];

  if (selectedSet.has('016') && !selectedSet.has('ENG_1307')) {
    diagnostics.push({
      id: 'warn_eng_1307_missing',
      severity: 'warn',
      level: 'warn',
      message:
        '3교시 영어 준비령(016)이 선택되었으나 듣기평가 시작 노드(13:07)가 선택되지 않았습니다. (준비령에서 듣기가 자동 시작되지 않습니다)',
      fixNodeIds: ['ENG_1307'],
      fixLabel: '13:07 듣기평가 노드 추가',
    });
  }

  for (const grp of CSAT_SUBJECT_GROUPS) {
    const grpSelected = orderedNodes.filter((n) => n.subjectGroupId === grp.id);
    if (grpSelected.length === 0) continue;
    const hasEndOrWarn = grpSelected.some((n) => n.stageType === 'end' || n.stageType === 'warn');
    const hasMainOrListening = grpSelected.some(
      (n) => n.stageType === 'main' || n.stageType === 'listening'
    );
    if (hasEndOrWarn && !hasMainOrListening) {
      const mainCandidate = CSAT_SELECTABLE_CUE_NODES.find(
        (n) =>
          n.subjectGroupId === grp.id && (n.stageType === 'main' || n.stageType === 'listening')
      );
      diagnostics.push({
        id: `warn_no_main_${grp.id}`,
        severity: 'warn',
        level: 'warn',
        message: `${grp.title}: 종료 전 안내 또는 종료령이 선택되었으나 시험 시작(본령) 단계가 선택되지 않았습니다.`,
        fixNodeIds: mainCandidate ? [mainCandidate.nodeId] : undefined,
        fixLabel: mainCandidate ? `${mainCandidate.stageShortLabel} 추가` : undefined,
      });
    }
  }

  if (truncationWarningCount > 0) {
    diagnostics.push({
      id: 'warn_bell_truncation',
      severity: 'warn',
      level: 'warn',
      message: `타종 음원 길이보다 대기 간격이 짧아 소리가 잘리는 구간이 ${truncationWarningCount}곳 있습니다.`,
    });
  }

  if (groupStats.inq2.selectedCount > 0 && groupStats.inq1.selectedCount === 0) {
    const inq1CoreIds = CSAT_SELECTABLE_CUE_NODES.filter(
      (n) => n.subjectGroupId === 'inq1' && n.isCoreExamStage
    ).map((n) => n.nodeId);
    diagnostics.push({
      id: 'info_inq2_only',
      severity: 'info',
      level: 'info',
      message: '4교시 탐구 제1선택 없이 제2선택 단계만 포함된 구성입니다.',
      fixNodeIds: inq1CoreIds,
      fixLabel: '탐구1 핵심 단계 추가',
    });
  }

  if (totalOmittedBetweenCount > 0) {
    diagnostics.push({
      id: 'info_omitted_between',
      severity: 'info',
      level: 'info',
      message: `선택한 단계 사이에 중간 생략된 타종 단계가 총 ${totalOmittedBetweenCount}개 있습니다.`,
    });
  }

  return {
    rows,
    selectedCount: rows.length,
    omittedBeforeFirst,
    omittedAfterLast,
    totalOmittedBetweenCount,
    truncationWarningCount,
    totalDurationSeconds,
    totalWaitSeconds: totalDurationSeconds,
    totalDurationMinutes: totalDurationSeconds / 60,
    startOriginalMinutes,
    endOriginalMinutes,
    startCalculatedMinutes,
    endCalculatedMinutes,
    diagnostics,
    groupStats,
  };
}

export function computeSequenceNodeRows(config: CustomSequenceConfig): ComputedSequenceNodeRow[] {
  return analyzeSequenceConfig(config).rows;
}

/**
 * 사용자가 체크박스로 선택한 노드들과 간격/시각 설정으로부터 실행 가능한 CsatSessionPreset을 생성합니다.
 */
export function buildCustomSequencePreset(config: CustomSequenceConfig): CsatSessionPreset | null {
  const analysis = analyzeSequenceConfig(config);
  const computedRows = analysis.rows;
  if (computedRows.length === 0) return null;

  const steps: CsatTimetableRow[] = [];
  let cumulativeMinutes = 0;

  if (computedRows.length === 1) {
    const only = computedRows[0];
    const durMin = Math.max(10 / 60, only.intervalAfterMinutes);
    const durLabel = formatIntervalSecondsLabel(only.intervalAfterSeconds);
    steps.push({
      id: `custom_seq_0_${only.node.nodeId}`,
      periodLabel: only.node.periodLabel,
      displayTitle: only.node.subjectTitle,
      timeRangeText: `${format24hTime(only.customTimeMinutes, true)} (${durLabel})`,
      startMinutes: 0,
      endMinutes: durMin,
      originalStartMinutes: only.node.originalMinutes,
      originalEndMinutes: only.node.originalMinutes + durMin,
      customStartMinutes: only.customTimeMinutes,
      customEndMinutes: only.customTimeMinutes + durMin,
      durationMinutes: durMin,
      durationSeconds: only.intervalAfterSeconds,
      category: only.node.stageShortLabel,
      description: `${only.node.fullTitle} (${durLabel} 진행)`,
      bellAtStart: 'prepare',
      bellAtEnd: 'none',
      startBellCode: only.node.bellCode,
      startNodeId: only.node.nodeId,
      triggersEnglishAudioAtStart: Boolean(only.node.triggersEnglishListening),
      stopsEnglishAudioAtEnd: only.node.subjectGroupId === 'eng',
      usesEnglishAudio: only.node.subjectGroupId === 'eng',
    });
    cumulativeMinutes = durMin;
  } else {
    for (let i = 0; i < computedRows.length - 1; i++) {
      const curr = computedRows[i];
      const next = computedRows[i + 1];
      const durMin = Math.max(10 / 60, curr.intervalAfterMinutes);
      const durLabel = formatIntervalSecondsLabel(curr.intervalAfterSeconds);
      const isTransitionAcrossSubjects = curr.node.subjectGroupId !== next.node.subjectGroupId;

      const stageCategory = isTransitionAcrossSubjects
        ? `${curr.node.stageShortLabel} → ${next.node.subjectTitle} ${next.node.stageShortLabel} 대기`
        : `${curr.node.stageShortLabel} → ${next.node.stageShortLabel}`;

      const isLastStage = i === computedRows.length - 2;
      const stopsEngAtStart =
        curr.node.subjectGroupId !== 'eng' || Boolean(curr.node.isEndBell);
      const stopsEngAtEnd =
        isLastStage && (next.node.subjectGroupId !== 'eng' || Boolean(next.node.isEndBell));

      steps.push({
        id: `custom_seq_${i}_${curr.node.nodeId}_${next.node.nodeId}`,
        periodLabel: curr.node.periodLabel,
        displayTitle: curr.node.subjectTitle,
        timeRangeText: `${format24hTime(curr.customTimeMinutes, true)}~${format24hTime(next.customTimeMinutes, true)} (${durLabel})`,
        startMinutes: cumulativeMinutes,
        endMinutes: cumulativeMinutes + durMin,
        originalStartMinutes: curr.node.originalMinutes,
        originalEndMinutes: next.node.originalMinutes,
        customStartMinutes: curr.customTimeMinutes,
        customEndMinutes: next.customTimeMinutes,
        durationMinutes: durMin,
        durationSeconds: curr.intervalAfterSeconds,
        category: stageCategory,
        description: `${curr.node.fullTitle} 후 ${durLabel} 뒤 ${next.node.fullTitle}`,
        bellAtStart: 'main',
        bellAtEnd: isLastStage ? 'end' : 'none',
        startBellCode: curr.node.bellCode,
        endBellCode: isLastStage ? next.node.bellCode : undefined,
        startNodeId: curr.node.nodeId,
        endNodeId: isLastStage ? next.node.nodeId : undefined,
        triggersEnglishAudioAtStart: Boolean(curr.node.triggersEnglishListening),
        stopsEnglishAudioAtStart: stopsEngAtStart,
        stopsEnglishAudioAtEnd: stopsEngAtEnd,
        usesEnglishAudio: curr.node.subjectGroupId === 'eng',
      });

      cumulativeMinutes += durMin;
    }
  }

  const uniqueSubjects = Array.from(new Set(computedRows.map((r) => r.node.subjectTitle)));
  const subjectSummary =
    uniqueSubjects.length <= 3
      ? uniqueSubjects.map((s) => s.replace(' 영역', '')).join('·')
      : `${uniqueSubjects[0].replace(' 영역', '')} 외 ${uniqueSubjects.length - 1}개 영역`;

  const totalLabel = formatIntervalSecondsLabel(analysis.totalDurationSeconds);

  return {
    id: 'custom_checkbox_sequence',
    group: 'custom_sequence',
    label: `선택 진행: ${subjectSummary} (${computedRows.length}개 타종 · 총 ${totalLabel})`,
    shortLabel: `선택 진행 (${totalLabel})`,
    displayTitle: computedRows[0].node.subjectTitle,
    startMinutes: 0,
    endMinutes: cumulativeMinutes,
    steps,
    isCustomSequence: true,
    totalDurationMinutes: cumulativeMinutes,
    totalDurationSeconds: analysis.totalDurationSeconds,
  };
}

/**
 * C7, A2, B6, B9: 단일 실행 이벤트 타임라인 생성기 (`buildCueTimeline`)
 * - 커스텀 선택 진행과 일반 프리셋 18종을 단일 이벤트 배열로 통합
 * - 016 하드코딩 듣기 시작 제거, ENG_1307 시점에만 english_start 발생
 */
export interface CueTimelineEvent {
  key: string;
  cueKey: string;
  offsetSec: number;
  kind: 'bell' | 'english_start' | 'english_stop';
  bellCode?: string;
  nodeId?: string;
  title: string;
  label: string;
  periodLabel: string;
  fallbackBellType?: Exclude<BellType, 'none'>;
  timeText?: string;
  triggersEnglishAudio?: boolean;
  stopsEnglishAudio?: boolean;
}

export function buildCueTimeline(preset: CsatSessionPreset): CueTimelineEvent[] {
  const events: CueTimelineEvent[] = [];

  if (preset.isCustomSequence) {
    for (let i = 0; i < preset.steps.length; i++) {
      const step = preset.steps[i];
      const startOffsetSec = Math.round(step.startMinutes * 60);
      const endOffsetSec = Math.round(step.endMinutes * 60);

      if (step.startBellCode) {
        const bellItem = CSAT_37_BELL_FILES.find((b) => b.code === step.startBellCode);
        if (bellItem) {
          const ck = `custom_bell_start_${i}_${step.id}_${bellItem.code}`;
          const shouldStopEng =
            Boolean(step.stopsEnglishAudioAtStart) ||
            bellItem.periodLabel !== '3교시' ||
            Boolean(bellItem.isEndBell) ||
            ['014', '015', '016', '018'].includes(bellItem.code);
          events.push({
            key: ck,
            cueKey: ck,
            offsetSec: startOffsetSec,
            kind: 'bell',
            bellCode: bellItem.code,
            nodeId: step.startNodeId || bellItem.code,
            title: bellItem.title,
            label: bellItem.title,
            periodLabel: bellItem.periodLabel,
            fallbackBellType: bellItem.fallbackBellType,
            timeText: bellItem.timeText,
            stopsEnglishAudio: shouldStopEng,
          });
        }
      }

      if (step.triggersEnglishAudioAtStart) {
        const ck = `custom_eng_start_${i}_${step.id}`;
        const lbl = '3교시 영어 듣기평가 안내방송 및 본령';
        events.push({
          key: ck,
          cueKey: ck,
          offsetSec: startOffsetSec,
          kind: 'english_start',
          nodeId: 'ENG_1307',
          title: lbl,
          label: lbl,
          periodLabel: '3교시',
          timeText: format24hTime(step.originalStartMinutes ?? 787),
          triggersEnglishAudio: true,
        });
      }

      if (i === preset.steps.length - 1) {
        if (step.endBellCode) {
          const endBellItem = CSAT_37_BELL_FILES.find((b) => b.code === step.endBellCode);
          if (endBellItem) {
            const ck = `custom_bell_end_${i}_${step.id}_${endBellItem.code}`;
            const shouldStopEngEnd =
              Boolean(step.stopsEnglishAudioAtEnd) ||
              endBellItem.periodLabel !== '3교시' ||
              Boolean(endBellItem.isEndBell) ||
              ['014', '015', '016', '018'].includes(endBellItem.code);
            events.push({
              key: ck,
              cueKey: ck,
              offsetSec: endOffsetSec,
              kind: 'bell',
              bellCode: endBellItem.code,
              nodeId: step.endNodeId || endBellItem.code,
              title: endBellItem.title,
              label: endBellItem.title,
              periodLabel: endBellItem.periodLabel,
              fallbackBellType: endBellItem.fallbackBellType,
              timeText: endBellItem.timeText,
              stopsEnglishAudio: shouldStopEngEnd,
            });
          }
        }
      }
    }
    return events.sort((a, b) => a.offsetSec - b.offsetSec);
  }

  // 표준 프리셋 / 단일 시간표 구간
  const baseStartMin = preset.startMinutes;
  const baseEndMin = preset.endMinutes;
  const startsExplicitlyOnEndBell = Boolean(preset.steps[0]?.bellAtStart === 'end');

  for (const bellItem of CSAT_37_BELL_FILES) {
    if (bellItem.triggerMinutes < baseStartMin || bellItem.triggerMinutes > baseEndMin) {
      continue;
    }
    if (
      bellItem.isEndBell &&
      bellItem.triggerMinutes === baseStartMin &&
      !startsExplicitlyOnEndBell
    ) {
      continue;
    }
    if (!bellItem.isEndBell && bellItem.triggerMinutes === baseEndMin) {
      continue;
    }
    const offsetSec = Math.round((bellItem.triggerMinutes - baseStartMin) * 60);
    const ck = `bell37_${bellItem.code}`;
    const shouldStopEng =
      bellItem.periodLabel !== '3교시' ||
      Boolean(bellItem.isEndBell) ||
      ['014', '015', '016', '018'].includes(bellItem.code);
    events.push({
      key: ck,
      cueKey: ck,
      offsetSec,
      kind: 'bell',
      bellCode: bellItem.code,
      nodeId: bellItem.code,
      title: bellItem.title,
      label: bellItem.title,
      periodLabel: bellItem.periodLabel,
      fallbackBellType: bellItem.fallbackBellType,
      timeText: bellItem.timeText,
      stopsEnglishAudio: shouldStopEng,
    });
  }

  const ENG_START_MIN = 13 * 60 + 7; // 13:07 (787분)
  const ENG_END_MIN = 14 * 60 + 20; // 14:20 (860분)

  if (baseStartMin <= ENG_START_MIN && baseEndMin > ENG_START_MIN) {
    const ck = 'eng_listening_1307_start';
    const lbl = '3교시 영어 듣기평가 안내방송 및 본령';
    events.push({
      key: ck,
      cueKey: ck,
      offsetSec: Math.round((ENG_START_MIN - baseStartMin) * 60),
      kind: 'english_start',
      nodeId: 'ENG_1307',
      title: lbl,
      label: lbl,
      periodLabel: '3교시',
      timeText: '13:07',
      triggersEnglishAudio: true,
    });
  } else if (baseStartMin > ENG_START_MIN && baseStartMin < ENG_END_MIN) {
    const ck = 'eng_listening_direct_start';
    const lbl = '3교시 영어 듣기평가 안내방송 및 본령';
    events.push({
      key: ck,
      cueKey: ck,
      offsetSec: 0,
      kind: 'english_start',
      nodeId: 'ENG_1307',
      title: lbl,
      label: lbl,
      periodLabel: '3교시',
      timeText: '13:10',
      triggersEnglishAudio: true,
    });
  }

  return events.sort((a, b) => a.offsetSec - b.offsetSec);
}

/**
 * 2027학년도 대학수학능력시험 전체 타종 시간표 (38개 구간)
 */
export const CSAT_FULL_TIMETABLE: CsatTimetableRow[] = [
  {
    id: 'entry_1',
    periodLabel: '-',
    displayTitle: '감독관 입실',
    timeRangeText: '08:05',
    startMinutes: hmToMinutes('08:05'),
    endMinutes: hmToMinutes('08:10'),
    category: '감독관 입실',
    description: '감독관 입실 및 시험실 준비 (001 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '001',
    startNodeId: '001',
  },
  {
    id: 'proctor_1',
    periodLabel: '-',
    displayTitle: '입실 완료',
    timeRangeText: '08:10',
    startMinutes: hmToMinutes('08:10'),
    endMinutes: hmToMinutes('08:25'),
    category: '입실 완료',
    description: '수험생 입실 마감 (002 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '002',
    startNodeId: '002',
  },
  {
    id: 'p1_prelim',
    periodLabel: '1교시',
    displayTitle: '국어 영역',
    timeRangeText: '08:25',
    startMinutes: hmToMinutes('08:25'),
    endMinutes: hmToMinutes('08:35'),
    category: '예비령',
    description: '답안지 배부 및 인적 사항 기재 (003 타종)',
    bellAtStart: 'preliminary',
    bellAtEnd: 'none',
    startBellCode: '003',
    startNodeId: '003',
  },
  {
    id: 'p1_prep',
    periodLabel: '1교시',
    displayTitle: '국어 영역',
    timeRangeText: '08:35',
    startMinutes: hmToMinutes('08:35'),
    endMinutes: hmToMinutes('08:40'),
    category: '준비령',
    description: '국어 문제지 배부 및 확인 (004 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '004',
    startNodeId: '004',
  },
  {
    id: 'p1_main',
    periodLabel: '1교시',
    displayTitle: '국어 영역',
    timeRangeText: '08:40',
    startMinutes: hmToMinutes('08:40'),
    endMinutes: hmToMinutes('09:50'),
    category: '본령',
    description: '국어 시험 시작 (005 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '005',
    startNodeId: '005',
  },
  {
    id: 'p1_warn10',
    periodLabel: '1교시',
    displayTitle: '국어 영역',
    timeRangeText: '09:50',
    startMinutes: hmToMinutes('09:50'),
    endMinutes: hmToMinutes('10:00'),
    category: '종료 10분 전',
    description: '국어 종료 10분 전 안내 (006 타종)',
    bellAtStart: 'warn_10m',
    bellAtEnd: 'end',
    startBellCode: '006',
    startNodeId: '006',
  },
  {
    id: 'p1_end',
    periodLabel: '1교시',
    displayTitle: '국어 영역',
    timeRangeText: '10:00',
    startMinutes: hmToMinutes('10:00'),
    endMinutes: hmToMinutes('10:15'),
    category: '종료령',
    description: '국어 시험 종료 및 휴식 (007 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '007',
    startNodeId: '007',
  },
  {
    id: 'p2_proctor',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '10:15',
    startMinutes: hmToMinutes('10:15'),
    endMinutes: hmToMinutes('10:20'),
    category: '감독관 입실',
    description: '감독관 입실 및 시험 준비 (008 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '008',
    startNodeId: '008',
  },
  {
    id: 'p2_prelim',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '10:20',
    startMinutes: hmToMinutes('10:20'),
    endMinutes: hmToMinutes('10:25'),
    category: '예비령',
    description: '답안지 배부 및 인적 사항 기재 (009 타종)',
    bellAtStart: 'preliminary',
    bellAtEnd: 'none',
    startBellCode: '009',
    startNodeId: '009',
  },
  {
    id: 'p2_prep',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '10:25',
    startMinutes: hmToMinutes('10:25'),
    endMinutes: hmToMinutes('10:30'),
    category: '준비령',
    description: '수학 문제지 배부 및 확인 (010 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '010',
    startNodeId: '010',
  },
  {
    id: 'p2_main',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '10:30',
    startMinutes: hmToMinutes('10:30'),
    endMinutes: hmToMinutes('12:00'),
    category: '본령',
    description: '수학 시험 시작 (011 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '011',
    startNodeId: '011',
  },
  {
    id: 'p2_warn10',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '12:00',
    startMinutes: hmToMinutes('12:00'),
    endMinutes: hmToMinutes('12:10'),
    category: '종료 10분 전',
    description: '수학 종료 10분 전 안내 (012 타종)',
    bellAtStart: 'warn_10m',
    bellAtEnd: 'end',
    startBellCode: '012',
    startNodeId: '012',
  },
  {
    id: 'p2_end',
    periodLabel: '2교시',
    displayTitle: '수학 영역',
    timeRangeText: '12:10',
    startMinutes: hmToMinutes('12:10'),
    endMinutes: hmToMinutes('12:55'),
    category: '종료령',
    description: '수학 시험 종료 및 점심시간 (013 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '013',
    startNodeId: '013',
  },
  {
    id: 'p3_proctor',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '12:55',
    startMinutes: hmToMinutes('12:55'),
    endMinutes: hmToMinutes('13:00'),
    category: '감독관 입실',
    description: '감독관 입실 및 시험 준비 (014 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '014',
    startNodeId: '014',
  },
  {
    id: 'p3_prelim',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '13:00',
    startMinutes: hmToMinutes('13:00'),
    endMinutes: hmToMinutes('13:05'),
    category: '예비령',
    description: '답안지 배부 및 인적 사항 기재 (015 타종)',
    bellAtStart: 'preliminary',
    bellAtEnd: 'none',
    startBellCode: '015',
    startNodeId: '015',
  },
  {
    id: 'p3_prep',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '13:05',
    startMinutes: hmToMinutes('13:05'),
    endMinutes: hmToMinutes('13:07'),
    category: '준비령',
    description: '영어 문제지 배부 및 확인 (016 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '016',
    startNodeId: '016',
  },
  {
    id: 'p3_main',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '13:07',
    startMinutes: hmToMinutes('13:07'),
    endMinutes: hmToMinutes('14:10'),
    category: '듣기평가 안내방송 및 본령',
    description: '영어 듣기평가 안내방송 및 본령 (별도 타종 없음)',
    bellAtStart: 'none',
    bellAtEnd: 'none',
    usesEnglishAudio: true,
    startNodeId: 'ENG_1307',
  },
  {
    id: 'p3_warn10',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '14:10',
    startMinutes: hmToMinutes('14:10'),
    endMinutes: hmToMinutes('14:20'),
    category: '종료 10분 전',
    description: '영어 종료 10분 전 안내 (017 타종)',
    bellAtStart: 'warn_10m',
    bellAtEnd: 'end',
    usesEnglishAudio: true,
    startBellCode: '017',
    startNodeId: '017',
  },
  {
    id: 'p3_end',
    periodLabel: '3교시',
    displayTitle: '영어 영역',
    timeRangeText: '14:20',
    startMinutes: hmToMinutes('14:20'),
    endMinutes: hmToMinutes('14:35'),
    category: '종료령',
    description: '영어 시험 종료 및 휴식 (018 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '018',
    startNodeId: '018',
  },
  {
    id: 'p4_proctor',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '14:35',
    startMinutes: hmToMinutes('14:35'),
    endMinutes: hmToMinutes('14:40'),
    category: '감독관 입실',
    description: '감독관 입실 및 시험 준비 (019 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '019',
    startNodeId: '019',
  },
  {
    id: 'p4_hist_prelim',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '14:40',
    startMinutes: hmToMinutes('14:40'),
    endMinutes: hmToMinutes('14:45'),
    category: '예비령',
    description: '한국사 답안지 배부 및 인적 사항 기재 (020 타종)',
    bellAtStart: 'preliminary',
    bellAtEnd: 'none',
    startBellCode: '020',
    startNodeId: '020',
  },
  {
    id: 'p4_hist_prep',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '14:45',
    startMinutes: hmToMinutes('14:45'),
    endMinutes: hmToMinutes('14:50'),
    category: '준비령',
    description: '한국사 문제지 배부 및 확인 (021 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '021',
    startNodeId: '021',
  },
  {
    id: 'p4_hist_main',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '14:50',
    startMinutes: hmToMinutes('14:50'),
    endMinutes: hmToMinutes('15:15'),
    category: '본령',
    description: '한국사 시험 시작 (022 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '022',
    startNodeId: '022',
  },
  {
    id: 'p4_hist_warn5',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '15:15',
    startMinutes: hmToMinutes('15:15'),
    endMinutes: hmToMinutes('15:20'),
    category: '종료 5분 전',
    description: '한국사 종료 5분 전 안내 (023 타종)',
    bellAtStart: 'warn_5m',
    bellAtEnd: 'end',
    startBellCode: '023',
    startNodeId: '023',
  },
  {
    id: 'p4_hist_end',
    periodLabel: '4교시',
    displayTitle: '한국사 영역',
    timeRangeText: '15:20',
    startMinutes: hmToMinutes('15:20'),
    endMinutes: hmToMinutes('15:30'),
    category: '종료령',
    description: '한국사 시험 종료 및 문답지 교체 (024 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '024',
    startNodeId: '024',
  },
  {
    id: 'p4_inq_prep',
    periodLabel: '4교시',
    displayTitle: '탐구1 영역',
    timeRangeText: '15:30',
    startMinutes: hmToMinutes('15:30'),
    endMinutes: hmToMinutes('15:35'),
    category: '탐구 준비령',
    description: '탐구 문제지 확인 및 시험 준비 (025 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '025',
    startNodeId: '025',
  },
  {
    id: 'p4_inq1_main',
    periodLabel: '4교시',
    displayTitle: '탐구1 영역',
    timeRangeText: '15:35',
    startMinutes: hmToMinutes('15:35'),
    endMinutes: hmToMinutes('16:00'),
    category: '본령 (제1선택)',
    description: '탐구 제1선택 과목 시험 시작 (026 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '026',
    startNodeId: '026',
  },
  {
    id: 'p4_inq1_warn5',
    periodLabel: '4교시',
    displayTitle: '탐구1 영역',
    timeRangeText: '16:00',
    startMinutes: hmToMinutes('16:00'),
    endMinutes: hmToMinutes('16:05'),
    category: '종료 5분 전',
    description: '탐구 제1선택 종료 5분 전 안내 (027 타종)',
    bellAtStart: 'warn_5m',
    bellAtEnd: 'end',
    startBellCode: '027',
    startNodeId: '027',
  },
  {
    id: 'p4_inq1_end',
    periodLabel: '4교시',
    displayTitle: '탐구1 영역',
    timeRangeText: '16:05',
    startMinutes: hmToMinutes('16:05'),
    endMinutes: hmToMinutes('16:07'),
    category: '종료령 (제1선택)',
    description: '탐구 제1선택 종료 및 문제지 회수 (028 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '028',
    startNodeId: '028',
  },
  {
    id: 'p4_inq2_main',
    periodLabel: '4교시',
    displayTitle: '탐구2 영역',
    timeRangeText: '16:07',
    startMinutes: hmToMinutes('16:07'),
    endMinutes: hmToMinutes('16:32'),
    category: '제2선택 시작',
    description: '탐구 제2선택 과목 시험 시작 (029 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '029',
    startNodeId: '029',
  },
  {
    id: 'p4_inq2_warn5',
    periodLabel: '4교시',
    displayTitle: '탐구2 영역',
    timeRangeText: '16:32',
    startMinutes: hmToMinutes('16:32'),
    endMinutes: hmToMinutes('16:37'),
    category: '종료 5분 전',
    description: '탐구 제2선택 종료 5분 전 안내 (030 타종)',
    bellAtStart: 'warn_5m',
    bellAtEnd: 'end',
    startBellCode: '030',
    startNodeId: '030',
  },
  {
    id: 'p4_inq2_end',
    periodLabel: '4교시',
    displayTitle: '탐구2 영역',
    timeRangeText: '16:37',
    startMinutes: hmToMinutes('16:37'),
    endMinutes: hmToMinutes('16:50'),
    category: '종료령',
    description: '탐구 영역 시험 종료 및 휴식 (031 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '031',
    startNodeId: '031',
  },
  {
    id: 'p5_proctor',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '16:50',
    startMinutes: hmToMinutes('16:50'),
    endMinutes: hmToMinutes('16:55'),
    category: '감독관 입실',
    description: '감독관 입실 및 시험 준비 (032 타종)',
    bellAtStart: 'entry_prep',
    bellAtEnd: 'none',
    startBellCode: '032',
    startNodeId: '032',
  },
  {
    id: 'p5_prelim',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '16:55',
    startMinutes: hmToMinutes('16:55'),
    endMinutes: hmToMinutes('17:00'),
    category: '예비령',
    description: '답안지 배부 및 인적 사항 기재 (033 타종)',
    bellAtStart: 'preliminary',
    bellAtEnd: 'none',
    startBellCode: '033',
    startNodeId: '033',
  },
  {
    id: 'p5_prep',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '17:00',
    startMinutes: hmToMinutes('17:00'),
    endMinutes: hmToMinutes('17:05'),
    category: '준비령',
    description: '제2외국어/한문 문제지 배부 및 확인 (034 타종)',
    bellAtStart: 'prepare',
    bellAtEnd: 'none',
    startBellCode: '034',
    startNodeId: '034',
  },
  {
    id: 'p5_main',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '17:05',
    startMinutes: hmToMinutes('17:05'),
    endMinutes: hmToMinutes('17:35'),
    category: '본령',
    description: '제2외국어/한문 시험 시작 (035 타종)',
    bellAtStart: 'main',
    bellAtEnd: 'none',
    startBellCode: '035',
    startNodeId: '035',
  },
  {
    id: 'p5_warn10',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '17:35',
    startMinutes: hmToMinutes('17:35'),
    endMinutes: hmToMinutes('17:45'),
    category: '종료 10분 전',
    description: '제2외국어/한문 종료 10분 전 안내 (036 타종)',
    bellAtStart: 'warn_10m',
    bellAtEnd: 'end',
    startBellCode: '036',
    startNodeId: '036',
  },
  {
    id: 'p5_end',
    periodLabel: '5교시',
    displayTitle: '제2외국어/한문',
    timeRangeText: '17:45',
    startMinutes: hmToMinutes('17:45'),
    endMinutes: hmToMinutes('17:50'),
    category: '종료령',
    description: '제2외국어/한문 및 전체 시험 종료 (037 타종)',
    bellAtStart: 'end',
    bellAtEnd: 'none',
    startBellCode: '037',
    startNodeId: '037',
  },
];

function sliceSteps(startId: string, endId: string): CsatTimetableRow[] {
  const sIdx = CSAT_FULL_TIMETABLE.findIndex((r) => r.id === startId);
  const eIdx = CSAT_FULL_TIMETABLE.findIndex((r) => r.id === endId);
  if (sIdx === -1 || eIdx === -1 || sIdx > eIdx) return [];
  return CSAT_FULL_TIMETABLE.slice(sIdx, eIdx + 1);
}

/**
 * 기본 타이머: 1교시 국어 준비령 ('kor_prep')
 */
export const CSAT_SESSION_PRESETS: CsatSessionPreset[] = [
  {
    id: 'kor_prep',
    group: 'single',
    label: '1교시 국어 영역 (준비령 08:35~08:40 · 5분)',
    shortLabel: '국어 준비령 (5분)',
    displayTitle: '국어 영역',
    startMinutes: hmToMinutes('08:35'),
    endMinutes: hmToMinutes('08:40'),
    steps: sliceSteps('p1_prep', 'p1_prep'),
  },
  {
    id: 'kor_prep_main',
    group: 'single',
    label: '1교시 국어 영역 (준비령+본령 08:35~10:00 · 85분)',
    shortLabel: '국어 준비+본령 (85분)',
    displayTitle: '국어 영역',
    startMinutes: hmToMinutes('08:35'),
    endMinutes: hmToMinutes('10:00'),
    steps: sliceSteps('p1_prep', 'p1_warn10'),
  },
  {
    id: 'kor_main',
    group: 'single',
    label: '1교시 국어 영역 (본령 08:40~10:00 · 80분)',
    shortLabel: '국어 (80분)',
    displayTitle: '국어 영역',
    startMinutes: hmToMinutes('08:40'),
    endMinutes: hmToMinutes('10:00'),
    steps: sliceSteps('p1_main', 'p1_warn10'),
  },
  {
    id: 'math_main',
    group: 'single',
    label: '2교시 수학 영역 (본령 10:30~12:10 · 100분)',
    shortLabel: '수학 (100분)',
    displayTitle: '수학 영역',
    startMinutes: hmToMinutes('10:30'),
    endMinutes: hmToMinutes('12:10'),
    steps: sliceSteps('p2_main', 'p2_warn10'),
  },
  {
    id: 'eng_prep_main',
    group: 'single',
    label: '3교시 영어 영역 (준비령+듣기평가 안내방송 및 본령 13:05~14:20)',
    shortLabel: '영어 준비+듣기안내·본령 (75분)',
    displayTitle: '영어 영역',
    startMinutes: hmToMinutes('13:05'),
    endMinutes: hmToMinutes('14:20'),
    steps: sliceSteps('p3_prep', 'p3_warn10'),
  },
  {
    id: 'eng_broadcast',
    group: 'single',
    label: '3교시 영어 영역 (듣기평가 안내방송 및 본령 13:07~14:20 · 73분)',
    shortLabel: '영어 듣기안내·본령 (73분)',
    displayTitle: '영어 영역',
    startMinutes: hmToMinutes('13:07'),
    endMinutes: hmToMinutes('14:20'),
    steps: sliceSteps('p3_main', 'p3_warn10'),
  },
  {
    id: 'eng_main',
    group: 'single',
    label: '3교시 영어 영역 (듣기평가 안내방송 및 본령 13:07~14:20 · 73분)',
    shortLabel: '영어 (73분)',
    displayTitle: '영어 영역',
    startMinutes: hmToMinutes('13:07'),
    endMinutes: hmToMinutes('14:20'),
    steps: sliceSteps('p3_main', 'p3_warn10'),
  },
  {
    id: 'hist_main',
    group: 'single',
    label: '4교시 한국사 영역 (본령 14:50~15:20 · 30분)',
    shortLabel: '한국사 (30분)',
    displayTitle: '한국사 영역',
    startMinutes: hmToMinutes('14:50'),
    endMinutes: hmToMinutes('15:20'),
    steps: sliceSteps('p4_hist_main', 'p4_hist_warn5'),
  },
  {
    id: 'inq1_main',
    group: 'single',
    label: '4교시 탐구1 영역 (본령 15:35~16:05 · 30분)',
    shortLabel: '탐구1 (30분)',
    displayTitle: '탐구1 영역',
    startMinutes: hmToMinutes('15:35'),
    endMinutes: hmToMinutes('16:05'),
    steps: sliceSteps('p4_inq1_main', 'p4_inq1_warn5'),
  },
  {
    id: 'inq2_main',
    group: 'single',
    label: '4교시 탐구2 영역 (본령 16:07~16:37 · 30분)',
    shortLabel: '탐구2 (30분)',
    displayTitle: '탐구2 영역',
    startMinutes: hmToMinutes('16:07'),
    endMinutes: hmToMinutes('16:37'),
    steps: sliceSteps('p4_inq2_main', 'p4_inq2_warn5'),
  },
  {
    id: 'lang2_main',
    group: 'single',
    label: '5교시 제2외국어/한문 (본령 17:05~17:45 · 40분)',
    shortLabel: '제2외국어 (40분)',
    displayTitle: '제2외국어/한문',
    startMinutes: hmToMinutes('17:05'),
    endMinutes: hmToMinutes('17:45'),
    steps: sliceSteps('p5_main', 'p5_warn10'),
  },
  {
    id: 'p1_full',
    group: 'period_full',
    label: '1교시 국어 전체 (예비령 08:25 ~ 종료 10:00)',
    shortLabel: '1교시 전체 (95분)',
    displayTitle: '국어 영역',
    startMinutes: hmToMinutes('08:25'),
    endMinutes: hmToMinutes('10:00'),
    steps: sliceSteps('p1_prelim', 'p1_warn10'),
  },
  {
    id: 'p2_full',
    group: 'period_full',
    label: '2교시 수학 전체 (예비령 10:20 ~ 종료 12:10)',
    shortLabel: '2교시 전체 (110분)',
    displayTitle: '수학 영역',
    startMinutes: hmToMinutes('10:20'),
    endMinutes: hmToMinutes('12:10'),
    steps: sliceSteps('p2_prelim', 'p2_warn10'),
  },
  {
    id: 'p3_full',
    group: 'period_full',
    label: '3교시 영어 전체 (예비령 13:00 ~ 종료 14:20)',
    shortLabel: '3교시 전체 (80분)',
    displayTitle: '영어 영역',
    startMinutes: hmToMinutes('13:00'),
    endMinutes: hmToMinutes('14:20'),
    steps: sliceSteps('p3_prelim', 'p3_warn10'),
  },
  {
    id: 'p4_inq_both',
    group: 'period_full',
    label: '4교시 탐구 1·2선택 연속 (탐구 준비령 15:30 ~ 종료 16:37)',
    shortLabel: '탐구 1·2 연속 (67분)',
    displayTitle: '탐구1 영역',
    startMinutes: hmToMinutes('15:30'),
    endMinutes: hmToMinutes('16:37'),
    steps: sliceSteps('p4_inq_prep', 'p4_inq2_warn5'),
  },
  {
    id: 'p4_full',
    group: 'period_full',
    label: '4교시 한국사+탐구 전체 (14:40 ~ 16:37)',
    shortLabel: '4교시 전체 (117분)',
    displayTitle: '한국사 영역',
    startMinutes: hmToMinutes('14:40'),
    endMinutes: hmToMinutes('16:37'),
    steps: sliceSteps('p4_hist_prelim', 'p4_inq2_warn5'),
  },
  {
    id: 'p5_full',
    group: 'period_full',
    label: '5교시 제2외국어 전체 (예비령 16:55 ~ 종료 17:45)',
    shortLabel: '5교시 전체 (50분)',
    displayTitle: '제2외국어/한문',
    startMinutes: hmToMinutes('16:55'),
    endMinutes: hmToMinutes('17:45'),
    steps: sliceSteps('p5_prelim', 'p5_warn10'),
  },
  {
    id: 'all_day_csat',
    group: 'all_day',
    label: '수능 전교시 연속 진행 (08:05 입실 ~ 17:45 종료)',
    shortLabel: '전교시 연속 (08:05~17:45)',
    displayTitle: '1교시 입실',
    startMinutes: hmToMinutes('08:05'),
    endMinutes: hmToMinutes('17:45'),
    steps: sliceSteps('entry_1', 'p5_warn10'),
  },
];
