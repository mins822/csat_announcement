/**
 * 수능 시험장 백색소음 시뮬레이션 및 HRTF 3D 입체음향 엔진
 * - 수험생 N명의 문항 풀이 시간 로그정규 확률 모델 + 포아송 필기/줄긋기/노크/마킹 사건열 생성
 * - 준비령 파본검사(2~3분 사이 랜덤 10~15초 약간의 시험지 넘김 후 본령까지 정숙 유지) 전용 스케줄러 포함
 * - 최적 음향 물성치(평량 70g/㎡, 거리감쇠 0.6, 샤프 0.075, 지우개 0.08 등) 상수 고정
 */

import {
  EXAM_HALL_PAPER_CLIPS,
  EXAM_HALL_PAPER_SPRITE,
  EXAM_HALL_PENCIL_CLIPS,
  EXAM_HALL_PENCIL_SPRITE,
  PaperClipKind,
  PencilClipKind,
} from '../data/examHallSprites';
import type {
  CsatSelectableCueNode,
  CsatSessionPreset,
  CsatTimetableRow,
} from '../data/csatSchedule';

export type ExamHallSubjectKey = 'kor' | 'math' | 'eng' | 'his' | 'inq' | 'lang2';

export type ExamHallEventKind =
  | 'turn'
  | 'flip'
  | 'scratch'
  | 'line'
  | 'click'
  | 'erase'
  | 'crumb'
  | 'mark'
  | 'sniff';

export interface ExamHallEvent {
  /** 사건 발생 시각 (초, 구간 시작 기준) */
  t: number;
  /** 좌석 인덱스 (0 ~ 27, row * 4 + col) */
  a: number;
  /** 효과음 종류 */
  k: ExamHallEventKind;
  /** 반복 횟수 또는 넘기는 장수 */
  n: number;
  /** 상대 세기 */
  v: number;
}

export interface ExamHallSettings {
  /** 실전 타이머 연동 활성화 여부 */
  enabled: boolean;
  /** 내 좌석 [열(0~3), 행(0~6)] */
  mySeat: [number, number];
  /** 집단 평균 실력 L (0 ~ 1) */
  skillMean: number;
  /** 집단 내 편차 σ (0 ~ 0.35) */
  skillStd: number;
  /** 시험실 총 인원 N (1 ~ 28, 본인 포함) */
  studentCount: number;
  /** 백색소음 마스터 음량 (0 ~ 100) */
  volume: number;
  /** 단독 재생 시 배속 (1 ~ 30, 실전 타이머 연동 시에는 항상 1배속 고정) */
  standaloneSpeed: number;
  /** 실내 공기 · 에어컨 공조 소음 활성 여부 */
  ambientAir: boolean;
  /** 확률 스케줄 시드 */
  seed: number;
}

export const EXAM_HALL_STORAGE_KEY = 'csat_exam_hall_noise_settings_v1';

export const DEFAULT_EXAM_HALL_SETTINGS: ExamHallSettings = {
  enabled: false,
  mySeat: [1, 3],
  skillMean: 0.5,
  skillStd: 0.15,
  studentCount: 28,
  volume: 70,
  standaloneSpeed: 1,
  ambientAir: true,
  seed: 2027,
};

/**
 * 참조 생성기에서 검증된 최적 음향 물성 상수 (UI 슬라이더 비노출 · 엔진 고정값)
 */
export const OPTIMAL_ACOUSTIC_PRESET = {
  paperGsm: 70, // P: 종이 평량 (g/㎡)
  paperBody: 0, // B: 종이 무게감
  lowBoost: 0, // LO: 저음 보강
  distAtten: 0.6, // DS: 거리 감쇠
  pencilGain: 0.075, // PG: 샤프 소리 크기
  turnLength: 1, // TL: 한 장 넘김 길이 (원음 비율)
  eraserGain: 0.08, // ER: 지우개 소리 크기
} as const;

type SegmentTuple = [
  fromQ: number,
  toQ: number,
  readMin: number,
  medMin: number,
  hard?: number,
  isFixed?: number,
];

interface SubjectModelSpec {
  key: ExamHallSubjectKey;
  label: string;
  shortLabel: string;
  T: number;
  questions: number;
  k: number;
  wr: number;
  ul: number;
  er: number;
  mk: number;
  leaves: number;
  bounds: number[];
  seg: SegmentTuple[];
  orders: [number, number][][];
  ow: number[];
  skim: number;
  fixed?: [number, number, number];
  ahead?: number;
}

export const EXAM_HALL_SUBJECTS: Record<ExamHallSubjectKey, SubjectModelSpec> = {
  kor: {
    key: 'kor',
    label: '국어 영역 (80분 · 45문항)',
    shortLabel: '국어 · 80분',
    T: 80,
    questions: 45,
    k: 0.55,
    wr: 0,
    ul: 2,
    er: 0.15,
    mk: 0.85,
    leaves: 15,
    bounds: [3, 6, 9, 12, 17, 21, 25, 29, 32, 34, 37, 40, 42, 44, 45],
    seg: [
      [1, 3, 2.4, 0.9],
      [4, 6, 2.6, 0.9],
      [7, 9, 2.6, 0.95],
      [10, 13, 2.6, 1],
      [14, 17, 2.6, 1.15, 1],
      [18, 21, 2, 0.85],
      [22, 25, 2.2, 0.9],
      [26, 29, 2.2, 0.9],
      [30, 34, 2.4, 1.05, 1],
      [35, 37, 1.6, 0.85],
      [38, 40, 1.8, 0.9],
      [41, 45, 1.8, 0.9],
    ],
    orders: [
      [
        [35, 45],
        [1, 17],
        [18, 34],
      ],
      [
        [1, 17],
        [18, 34],
        [35, 45],
      ],
    ],
    ow: [0.55, 0.45],
    skim: 0,
  },
  math: {
    key: 'math',
    label: '수학 영역 (100분 · 30문항)',
    shortLabel: '수학 · 100분',
    T: 100,
    questions: 30,
    k: 1.1,
    wr: 14,
    ul: 1,
    er: 0.5,
    mk: 0.55,
    leaves: 8,
    bounds: [4, 8, 12, 15, 19, 22, 26, 30],
    seg: [
      [1, 2, 0, 0.5],
      [3, 8, 0, 0.85],
      [9, 12, 0, 1.6],
      [13, 13, 0, 3],
      [14, 14, 0, 4],
      [15, 15, 0, 6, 1],
      [16, 18, 0, 2.3],
      [19, 19, 0, 3.2],
      [20, 20, 0, 4.2],
      [21, 21, 0, 9, 1],
      [22, 22, 0, 12, 1],
      [23, 26, 0, 2.4],
      [27, 27, 0, 4.2],
      [28, 28, 0, 7.5, 1],
      [29, 29, 0, 7, 1],
      [30, 30, 0, 9, 1],
    ],
    orders: [[[1, 30]]],
    ow: [1],
    skim: 0.4,
  },
  eng: {
    key: 'eng',
    label: '영어 영역 (70분 · 45문항)',
    shortLabel: '영어 · 70분',
    T: 70,
    questions: 45,
    k: 0.9,
    wr: 3,
    ul: 1.3,
    er: 0.1,
    mk: 0.8,
    leaves: 8,
    bounds: [6, 12, 17, 24, 31, 37, 42, 45],
    fixed: [1, 17, 1.47],
    seg: [
      [18, 24, 0, 0.7],
      [25, 28, 0, 1.3],
      [29, 30, 0, 1.9],
      [31, 32, 0, 2],
      [33, 34, 0, 3, 1],
      [35, 37, 0, 1.8],
      [38, 40, 0, 1.7],
      [41, 42, 0, 2.9],
      [43, 45, 0, 1.9],
    ],
    orders: [[[1, 45]]],
    ow: [1],
    skim: 0,
    ahead: 1,
  },
  his: {
    key: 'his',
    label: '한국사 영역 (30분 · 20문항)',
    shortLabel: '한국사 · 30분',
    T: 30,
    questions: 20,
    k: 0.8,
    wr: 3,
    ul: 0.6,
    er: 0.05,
    mk: 0.9,
    leaves: 4,
    bounds: [5, 10, 15, 20],
    seg: [
      [1, 10, 0, 0.35],
      [11, 20, 0, 0.5],
    ],
    orders: [[[1, 20]]],
    ow: [1],
    skim: 0,
  },
  inq: {
    key: 'inq',
    label: '탐구 영역 (30분 · 20문항)',
    shortLabel: '탐구 · 30분',
    T: 30,
    questions: 20,
    k: 0.9,
    wr: 8,
    ul: 0.8,
    er: 0.25,
    mk: 0.8,
    leaves: 4,
    bounds: [5, 10, 15, 20],
    seg: [
      [1, 10, 0, 0.9],
      [11, 15, 0, 1.5],
      [16, 18, 0, 2.2],
      [19, 20, 0, 3, 1],
    ],
    orders: [[[1, 20]]],
    ow: [1],
    skim: 0,
  },
  lang2: {
    key: 'lang2',
    label: '제2외국어/한문 (40분 · 30문항)',
    shortLabel: '제2외국어 · 40분',
    T: 40,
    questions: 30,
    k: 0.85,
    wr: 2,
    ul: 0.9,
    er: 0.08,
    mk: 0.88,
    leaves: 4,
    bounds: [8, 16, 24, 30],
    seg: [
      [1, 10, 0, 0.7],
      [11, 20, 0, 1.0],
      [21, 30, 0, 1.25],
    ],
    orders: [[[1, 30]]],
    ow: [1],
    skim: 0,
  },
};

function clampNum(x: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, x));
}

export function formatSkillLevelLabel(v: number): string {
  if (v < 0.2) return '하';
  if (v < 0.45) return '중하';
  if (v < 0.65) return '중';
  if (v < 0.85) return '상';
  return '최상위';
}

const MAIN_CUSTOM_SETTINGS_STORAGE_KEY = 'csat_timer_custom_settings_v2';
const EXAM_HALL_ENABLED_COOKIE_KEY = 'csat_eh_enabled';

function readExamHallEnabledCookie(): boolean | null {
  try {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const parts = document.cookie.split(';');
    for (const part of parts) {
      const [k, v] = part.trim().split('=');
      if (k === EXAM_HALL_ENABLED_COOKIE_KEY) {
        if (v === '1' || v === 'true') return true;
        if (v === '0' || v === 'false') return false;
      }
    }
  } catch {
    // Ignore cookie read errors
  }
  return null;
}

function writeExamHallEnabledCookie(enabled: boolean): void {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${EXAM_HALL_ENABLED_COOKIE_KEY}=${enabled ? '1' : '0'}; max-age=31536000; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie write errors (e.g. file:// or restricted context)
  }
}

export function sanitizeExamHallSettings(raw: unknown): ExamHallSettings {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_EXAM_HALL_SETTINGS, mySeat: [...DEFAULT_EXAM_HALL_SETTINGS.mySeat] };
  }
  const p = raw as Record<string, unknown>;
  const enabled = typeof p.enabled === 'boolean' ? p.enabled : DEFAULT_EXAM_HALL_SETTINGS.enabled;
  const rawSeat = Array.isArray(p.mySeat) ? p.mySeat : DEFAULT_EXAM_HALL_SETTINGS.mySeat;
  const col = clampNum(Math.round(Number(rawSeat[0]) || 0), 0, 3);
  const row = clampNum(Math.round(Number(rawSeat[1]) || 0), 0, 6);
  const skillMean = Number.isFinite(Number(p.skillMean))
    ? clampNum(Number(p.skillMean), 0, 1)
    : DEFAULT_EXAM_HALL_SETTINGS.skillMean;
  const skillStd = Number.isFinite(Number(p.skillStd))
    ? clampNum(Number(p.skillStd), 0, 0.35)
    : DEFAULT_EXAM_HALL_SETTINGS.skillStd;
  const studentCount = Number.isFinite(Number(p.studentCount))
    ? clampNum(Math.round(Number(p.studentCount)), 1, 28)
    : DEFAULT_EXAM_HALL_SETTINGS.studentCount;
  const volume = Number.isFinite(Number(p.volume))
    ? clampNum(Math.round(Number(p.volume)), 0, 100)
    : DEFAULT_EXAM_HALL_SETTINGS.volume;
  const standaloneSpeed = Number.isFinite(Number(p.standaloneSpeed))
    ? clampNum(Math.round(Number(p.standaloneSpeed)), 1, 30)
    : DEFAULT_EXAM_HALL_SETTINGS.standaloneSpeed;
  const ambientAir =
    typeof p.ambientAir === 'boolean' ? p.ambientAir : DEFAULT_EXAM_HALL_SETTINGS.ambientAir;
  const seed = Number.isFinite(Number(p.seed))
    ? clampNum(Math.round(Math.abs(Number(p.seed))), 1, 9999999)
    : DEFAULT_EXAM_HALL_SETTINGS.seed;

  return {
    enabled,
    mySeat: [col, row],
    skillMean: Number(skillMean.toFixed(2)),
    skillStd: Number(skillStd.toFixed(2)),
    studentCount,
    volume,
    standaloneSpeed,
    ambientAir,
    seed,
  };
}

export function readStoredExamHallSettings(): ExamHallSettings {
  try {
    const raw = localStorage.getItem(EXAM_HALL_STORAGE_KEY);
    if (raw) {
      return sanitizeExamHallSettings(JSON.parse(raw));
    }
  } catch {
    // Fall through to secondary storage
  }

  try {
    const mainRaw = localStorage.getItem(MAIN_CUSTOM_SETTINGS_STORAGE_KEY);
    if (mainRaw) {
      const parsed = JSON.parse(mainRaw) as Record<string, unknown>;
      if (parsed && typeof parsed === 'object') {
        if (parsed.examHallSettings && typeof parsed.examHallSettings === 'object') {
          return sanitizeExamHallSettings(parsed.examHallSettings);
        }
        if (typeof parsed.examHallEnabled === 'boolean') {
          return {
            ...DEFAULT_EXAM_HALL_SETTINGS,
            mySeat: [...DEFAULT_EXAM_HALL_SETTINGS.mySeat],
            enabled: parsed.examHallEnabled,
          };
        }
      }
    }
  } catch {
    // Fall through to cookie fallback
  }

  const cookieEnabled = readExamHallEnabledCookie();
  if (cookieEnabled !== null) {
    return {
      ...DEFAULT_EXAM_HALL_SETTINGS,
      mySeat: [...DEFAULT_EXAM_HALL_SETTINGS.mySeat],
      enabled: cookieEnabled,
    };
  }

  return { ...DEFAULT_EXAM_HALL_SETTINGS, mySeat: [...DEFAULT_EXAM_HALL_SETTINGS.mySeat] };
}

export function saveExamHallSettingsToStorage(settings: ExamHallSettings): void {
  const safe = sanitizeExamHallSettings(settings);
  try {
    localStorage.setItem(EXAM_HALL_STORAGE_KEY, JSON.stringify(safe));
  } catch {
    // Ignore storage quota errors
  }
  writeExamHallEnabledCookie(safe.enabled);
}

/**
 * 현재 진행 중인 단계 또는 선택된 시간표 프리셋에서 시험장 모드 과목을 자동 판별합니다.
 */
export function resolveExamHallSubjectKey(
  step: CsatTimetableRow | null | undefined,
  preset: CsatSessionPreset | null | undefined,
  cueNodes: readonly CsatSelectableCueNode[]
): ExamHallSubjectKey {
  const mapGroupToKey = (gid?: string): ExamHallSubjectKey | null => {
    if (!gid) return null;
    if (gid === 'kor') return 'kor';
    if (gid === 'math') return 'math';
    if (gid === 'eng') return 'eng';
    if (gid === 'hist') return 'his';
    if (gid === 'inq1' || gid === 'inq2') return 'inq';
    if (gid === 'lang2') return 'lang2';
    return null;
  };

  const targetStep = step || (preset && preset.steps.length > 0 ? preset.steps[0] : null);
  if (targetStep?.startNodeId) {
    const node = cueNodes.find((n) => n.nodeId === targetStep.startNodeId);
    const mapped = mapGroupToKey(node?.subjectGroupId);
    if (mapped) return mapped;
  }

  const text = `${targetStep?.displayTitle || ''} ${targetStep?.periodLabel || ''} ${
    preset?.displayTitle || ''
  } ${preset?.label || ''}`;

  if (text.includes('한국사')) return 'his';
  if (text.includes('탐구')) return 'inq';
  if (text.includes('제2외국어') || text.includes('한문') || text.includes('5교시')) return 'lang2';
  if (text.includes('수학') || text.includes('2교시')) return 'math';
  if (text.includes('영어') || text.includes('듣기') || text.includes('3교시')) return 'eng';
  if (text.includes('4교시')) return 'inq';
  return 'kor';
}

export type TimerExamHallSyncPhase = 'idle' | 'prepare' | 'main' | 'quiet';

export interface TimerExamHallSyncState {
  phase: TimerExamHallSyncPhase;
  subjectKey: ExamHallSubjectKey;
  blockKey: string;
  elapsedSec: number;
  blockDurationSec: number;
  isPaused: boolean;
}

/**
 * 메인 타이머의 현재 진행 상태로부터 시험장 백색소음 동기화 목표 상태를 계산합니다.
 */
export function computeTimerExamHallSyncState(params: {
  isRunning: boolean;
  isPaused: boolean;
  isDone: boolean;
  isHandDragging: boolean;
  preset: CsatSessionPreset;
  simMinutes: number;
  cueNodes: readonly CsatSelectableCueNode[];
}): TimerExamHallSyncState {
  const { isRunning, isPaused, isDone, isHandDragging, preset, simMinutes, cueNodes } = params;
  if (!isRunning || isDone || !preset || preset.steps.length === 0) {
    const idleSubj = resolveExamHallSubjectKey(preset?.steps?.[0], preset, cueNodes);
    return {
      phase: 'idle',
      subjectKey: idleSubj,
      blockKey: 'idle',
      elapsedSec: 0,
      blockDurationSec: 0,
      isPaused: false,
    };
  }

  let activeIdx = preset.steps.length - 1;
  for (let i = 0; i < preset.steps.length; i++) {
    const s = preset.steps[i];
    if (simMinutes >= s.startMinutes && simMinutes < s.endMinutes) {
      activeIdx = i;
      break;
    }
  }
  const activeStep = preset.steps[activeIdx];
  const subjectKey = resolveExamHallSubjectKey(activeStep, preset, cueNodes);

  const classifyStep = (row: CsatTimetableRow): 'prepare' | 'main' | 'warn' | 'other' => {
    const node = row.startNodeId ? cueNodes.find((n) => n.nodeId === row.startNodeId) : null;
    const cat = row.category || '';
    const isPrep =
      node?.stageType === 'prepare' ||
      row.bellAtStart === 'prepare' ||
      cat.startsWith('준비령') ||
      (cat.includes('준비령') && !cat.includes('→ 준비령'));
    if (isPrep) return 'prepare';

    const isWarn =
      node?.stageType === 'warn' ||
      row.bellAtStart === 'warn_10m' ||
      row.bellAtStart === 'warn_5m' ||
      cat.startsWith('종료 10분 전') ||
      cat.startsWith('종료 5분 전');
    if (isWarn) return 'warn';

    const isMain =
      node?.stageType === 'main' ||
      node?.stageType === 'listening' ||
      row.bellAtStart === 'main' ||
      row.bellAtStart === 'listening_intro' ||
      cat.startsWith('본령') ||
      cat.includes('듣기평가 안내방송 및 본령');
    if (isMain) return 'main';

    return 'other';
  };

  const stepGroupTag = (row: CsatTimetableRow): string => {
    const node = row.startNodeId ? cueNodes.find((n) => n.nodeId === row.startNodeId) : null;
    if (node?.subjectGroupId) return node.subjectGroupId;
    return `${row.periodLabel || ''}:${row.displayTitle || ''}`;
  };

  const kind = classifyStep(activeStep);
  const pausedEffective = isPaused || isHandDragging;

  if (kind === 'prepare') {
    const durSec = Math.max(10, (activeStep.endMinutes - activeStep.startMinutes) * 60);
    const elapsedSec = clampNum((simMinutes - activeStep.startMinutes) * 60, 0, durSec);
    return {
      phase: 'prepare',
      subjectKey,
      blockKey: `prep_${preset.id}_${activeIdx}_${activeStep.startMinutes.toFixed(3)}_${durSec.toFixed(1)}`,
      elapsedSec,
      blockDurationSec: durSec,
      isPaused: pausedEffective,
    };
  }

  if (kind === 'main' || kind === 'warn') {
    const curGroup = stepGroupTag(activeStep);
    let startIdx = activeIdx;
    while (startIdx > 0) {
      const prev = preset.steps[startIdx - 1];
      const prevKind = classifyStep(prev);
      if (
        (prevKind === 'main' || prevKind === 'warn') &&
        stepGroupTag(prev) === curGroup &&
        Math.abs(prev.endMinutes - preset.steps[startIdx].startMinutes) < 0.05
      ) {
        startIdx--;
      } else {
        break;
      }
    }

    let endIdx = activeIdx;
    while (endIdx + 1 < preset.steps.length) {
      const nxt = preset.steps[endIdx + 1];
      const nxtKind = classifyStep(nxt);
      if (
        nxtKind === 'warn' &&
        stepGroupTag(nxt) === curGroup &&
        Math.abs(nxt.startMinutes - preset.steps[endIdx].endMinutes) < 0.05
      ) {
        endIdx++;
      } else {
        break;
      }
    }

    const firstBlockStep = preset.steps[startIdx];
    const lastBlockStep = preset.steps[endIdx];
    const firstKind = classifyStep(firstBlockStep);
    const blockStartMin = firstBlockStep.startMinutes;
    const blockEndMin = lastBlockStep.endMinutes;
    const blockDurSec = Math.max(10, (blockEndMin - blockStartMin) * 60);

    let elapsedSec = Math.max(0, (simMinutes - blockStartMin) * 60);
    // 만약 본령 없이 '종료 10분/5분 전' 단일 단계부터 시작한 경우, 과목 막판 시간대로 자연스럽게 오프셋 맞춤
    if (firstKind === 'warn') {
      const subjTotalSec = EXAM_HALL_SUBJECTS[subjectKey].T * 60;
      const remainSec = Math.max(0, (blockEndMin - simMinutes) * 60);
      elapsedSec = Math.max(0, subjTotalSec - remainSec);
    }

    return {
      phase: 'main',
      subjectKey,
      blockKey: `main_${preset.id}_${curGroup}_${startIdx}_${blockStartMin.toFixed(3)}`,
      elapsedSec,
      blockDurationSec: blockDurSec,
      isPaused: pausedEffective,
    };
  }

  return {
    phase: 'quiet',
    subjectKey,
    blockKey: `quiet_${preset.id}_${activeIdx}`,
    elapsedSec: 0,
    blockDurationSec: 0,
    isPaused: pausedEffective,
  };
}

/* ================= 확률 모델 및 사건열 스케줄러 ================= */

function mulberry(a: number): () => number {
  let state = a | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(r: () => number): number {
  return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
}

function lognorm(r: () => number, med: number, s: number): number {
  return med * Math.exp(s * randn(r));
}

function expo(r: () => number, rate: number): number {
  return -Math.log(1 - r()) / rate;
}

const ERASE_P = 1 / 56;

function simulateSingleStudent(
  S: SubjectModelSpec,
  L: number,
  r: () => number,
  aid: number,
  E: ExamHallEvent[],
  ul: boolean
): void {
  const hab = lognorm(r, 1, 0.15);
  const wh = lognorm(r, 1, 0.3);
  const Tend = S.T - 2.2;
  const leafOf = (n: number) => S.bounds.findIndex((b) => n <= b) + 1;
  const add = (tMin: number, k: ExamHallEventKind, n = 1, v = 1) => {
    E.push({ t: tMin * 60, a: aid, k, n, v });
  };

  if (S.wr > 0 && r() < ERASE_P) {
    const x = S.T * 0.12 + r() * (S.T - 2.2 - S.T * 0.12);
    add(x, 'erase', 1 + Math.floor(r() * 2), 0.8 + 0.4 * r());
    if (r() < 0.7) {
      add(x + (2.5 + r() * 1.5) / 60, 'crumb', 1, 0.8 + 0.4 * r());
    }
  }

  let cur = 0;
  let t = (0.3 + 3.7 * r()) / 60; // 본령 직후 0.3~4초 안에 모두 첫 장을 넘김
  let first = true;

  if (S.skim && r() < S.skim * (0.4 + 0.6 * L)) {
    const n = 2 + Math.floor(r() * 3);
    const d = 0.15 + r() * 0.3;
    add(t, 'turn');
    cur = 1;
    first = false;
    add(t + 0.04 + r() * 0.06, 'flip', n);
    add(t + d * 0.6, 'flip', n);
    t += d;
  }

  const f = Math.exp(-S.k * (L - 0.5));
  const sd = 0.28 + 0.22 * (1 - L);
  const items: SegmentTuple[] = [];
  const ord = S.orders[r() < S.ow[0] ? 0 : 1] || S.orders[0];
  for (const [a, b] of ord) {
    for (const sg of S.seg) {
      if (sg[0] >= a && sg[1] <= b) items.push(sg);
    }
  }
  if (S.fixed) {
    const [a, b, m] = S.fixed;
    items.unshift([a, b, 0, m, 0, 1]);
  }

  let rush = false;
  for (const sg of items) {
    for (let n = sg[0]; n <= sg[1]; n++) {
      let d: number;
      const lf = leafOf(n);
      if (sg[5]) {
        d = lognorm(r, sg[3], 0.04);
      } else {
        d = lognorm(r, sg[3] * hab * Math.exp(-S.k * (L - 0.5) * (sg[4] ? 0.5 : 1)), sd);
        if (sg[4] && r() < Math.max(0, (0.5 - L) * 1.6)) {
          d = 0.15 + 0.3 * r();
        }
        if (n === sg[0] && sg[2]) {
          d += sg[2] * f * lognorm(r, 1, 0.2);
        }
      }

      if (!sg[5] && (rush || t + d > Tend)) {
        rush = true;
        d = 0.1 + 0.25 * r();
      }

      if (lf !== cur) {
        const dl = Math.abs(lf - cur);
        add(first ? t : Math.max(0, t - 0.02), dl > 1 ? 'flip' : 'turn', dl);
        cur = lf;
      }
      first = false;

      const e = t + d;
      const rw = sg[5]
        ? 0
        : n === sg[0] && sg[2]
          ? Math.min(d * 0.8, sg[2] * f + 0.3)
          : Math.min(d * (S.fixed ? 0.5 : 0.4), 0.5);

      if (ul && S.ul > 0) {
        for (let x = t + 0.03 + expo(r, S.ul * wh); x < t + rw; x += expo(r, S.ul * wh)) {
          add(x, 'line', 1 + Math.floor(r() * 3), 0.7 + 0.6 * r());
        }
      }

      const rate = (S.wr * wh * (sg[4] ? 1.4 : 1)) / (S.fixed && sg[5] ? 3 : 1);
      if (rate > 0) {
        for (let x = t + 0.05 + expo(r, rate); x < e - 0.05; x += expo(r, rate)) {
          add(x, 'scratch', 0, 0.6 + 0.8 * r());
        }
      }

      for (let x = t + expo(r, 0.5); x < e; x += expo(r, 0.5)) {
        add(x, 'click');
      }
      for (let x = t + expo(r, 0.12); x < e; x += expo(r, 0.12)) {
        add(x, 'sniff');
      }
      if (r() < S.mk) {
        add(Math.max(0, e - 0.03), 'mark');
      }
      t = e;
    }
  }

  if (S.ahead && r() < 0.15 + 0.3 * L) {
    const x = 3 + r() * 17;
    const n = 2 + Math.floor(r() * 2);
    add(x, 'flip', n);
    add(x + 0.3 + r() * 1.2, 'flip', n);
  }

  if (t < Tend && r() < clampNum(0.1 + 0.4 * L, 0, 0.5)) {
    const q = Math.max(1, Math.round(0.6 + 1.4 * L + 0.5 * randn(r)));
    for (let i = 0; i < q; i++) {
      const x = t + r() * (Tend - t);
      add(x, 'flip', 1 + Math.floor(r() * 3));
      if (S.wr > 0) {
        add(x + 0.1 + r() * 0.4, 'scratch', 0, 1);
      }
    }
  }

  const q = Math.floor(4 + r() * 7);
  for (let i = 0; i < q; i++) {
    add(Tend + 0.05 + r() * (S.T - Tend - 0.3), 'mark');
  }
}

export interface BuiltExamHallSchedule {
  subjectKey: ExamHallSubjectKey;
  durationMin: number;
  otherSeats: number[];
  events: ExamHallEvent[];
  turnDensityPerMin: number[];
  writeDensityPerMin: number[];
  totalTurns: number;
  turnsPerStudent: number;
}

export function getOccupiedOtherSeats(
  studentCount: number,
  mySeat: [number, number],
  seed: number
): number[] {
  const myIdx = mySeat[1] * 4 + mySeat[0];
  const all: number[] = [];
  for (let s = 0; s < 28; s++) {
    if (s !== myIdx) all.push(s);
  }
  const r = mulberry(seed + 99);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const tmp = all[i];
    all[i] = all[j];
    all[j] = tmp;
  }
  return all.slice(0, Math.max(0, clampNum(Math.round(studentCount), 1, 28) - 1));
}

export function buildMainExamSchedule(
  subjectKey: ExamHallSubjectKey,
  skillMean: number,
  skillStd: number,
  studentCount: number,
  mySeat: [number, number],
  seed: number
): BuiltExamHallSchedule {
  const S = EXAM_HALL_SUBJECTS[subjectKey];
  const otherSeats = getOccupiedOtherSeats(studentCount, mySeat, seed);
  const M = otherSeats.length;
  const r = mulberry(seed);
  const rawEvents: ExamHallEvent[] = [];

  if (M > 0) {
    const nu = Math.round((2 / 3 + r() / 12) * M);
    const ids = Array.from({ length: M }, (_, idx) => idx);
    for (let i = M - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      const tmp = ids[i];
      ids[i] = ids[j];
      ids[j] = tmp;
    }
    const underlineSet = new Set(ids.slice(0, nu));

    for (let i = 0; i < M; i++) {
      const L = clampNum(skillMean + skillStd * randn(r), 0, 1);
      simulateSingleStudent(S, L, r, otherSeats[i], rawEvents, underlineSet.has(i));
    }
  }

  const T = S.T;

  // 종료 10분 전 ~ 5분 전 (5분간): 시험지 검토 구간으로 전체 기준 넘김 빈도의 약 1.5~2배 수준으로 증가
  const reviewStartMin = Math.max(0, T - 10);
  const reviewEndMin = Math.max(reviewStartMin, T - 5);
  const reviewDurMin = reviewEndMin - reviewStartMin;

  if (M > 0 && reviewDurMin > 0 && T > reviewDurMin) {
    const reviewStartSec = reviewStartMin * 60;
    const reviewEndSec = reviewEndMin * 60;
    const totalExamSec = T * 60;
    let existingReviewTurns = 0;
    let nonReviewTurns = 0;

    for (const e of rawEvents) {
      if (e.k !== 'turn' && e.k !== 'flip') continue;
      if (e.t >= reviewStartSec && e.t < reviewEndSec) {
        existingReviewTurns++;
      } else if (e.t >= 0 && e.t < totalExamSec) {
        nonReviewTurns++;
      }
    }

    const baselinePerMin = nonReviewTurns / (T - reviewDurMin);
    const rr = mulberry(seed + 10505);
    const targetMultiplier = 1.65 + rr() * 0.25;
    const targetReviewTurns = Math.round(baselinePerMin * reviewDurMin * targetMultiplier);
    const extraTurns = Math.max(0, targetReviewTurns - existingReviewTurns);

    for (let i = 0; i < extraTurns; i++) {
      const bellSample = (rr() + rr() + rr()) / 3;
      const pos = rr() < 0.45 ? rr() : bellSample;
      const tMin = reviewStartMin + 0.06 + pos * (reviewDurMin - 0.12);
      const seatIdx = otherSeats[Math.floor(rr() * M)];
      const isFlip = rr() < 0.38;
      rawEvents.push({
        t: tMin * 60,
        a: seatIdx,
        k: isFlip ? 'flip' : 'turn',
        n: isFlip ? 2 + Math.floor(rr() * 2) : 1,
        v: 0.8 + 0.35 * rr(),
      });
    }
  }

  rawEvents.sort((a, b) => a.t - b.t);

  const turnDensityPerMin = Array<number>(T).fill(0);
  const writeDensityPerMin = Array<number>(T).fill(0);
  let totalTurns = 0;

  for (const e of rawEvents) {
    const isTurn = e.k === 'turn' || e.k === 'flip';
    if (isTurn) totalTurns++;
    const m = Math.floor(e.t / 60);
    if (m >= 0 && m < T) {
      if (isTurn) turnDensityPerMin[m]++;
      else writeDensityPerMin[m]++;
    }
  }

  return {
    subjectKey,
    durationMin: T,
    otherSeats,
    events: rawEvents,
    turnDensityPerMin,
    writeDensityPerMin,
    totalTurns,
    turnsPerStudent: M > 0 ? totalTurns / M : 0,
  };
}

export interface BuiltPreparePaperCheckSchedule {
  events: ExamHallEvent[];
  otherSeats: number[];
  windowStartSec: number;
  windowEndSec: number;
}

/**
 * 준비령 파본검사 스케줄 생성기
 * - 기본 5분(300초) 준비령 기준: 시작 후 2분~3분(120~180초) 사이 랜덤 시점에 10~15초간 약간의 시험지 넘김 재생 후 본령까지 정숙 유지
 * - 3분 미만 단축 준비령(예: 3교시 영어 2분 준비령 또는 커스텀 간격)에서는 구간 비율에 맞춰 안전하게 스케일링 후 정숙 유지
 */
export function buildPreparePaperCheckSchedule(
  prepareDurationSec: number,
  studentCount: number,
  mySeat: [number, number],
  seed: number
): BuiltPreparePaperCheckSchedule {
  const otherSeats = getOccupiedOtherSeats(studentCount, mySeat, seed);
  const r = mulberry(seed + 7717 + Math.round(prepareDurationSec));
  const events: ExamHallEvent[] = [];

  let burstDur = 10 + r() * 5; // 10 ~ 15초
  let burstStart = 120;

  if (prepareDurationSec >= 195) {
    // 표준 5분(300초) 준비령: 정확히 120초(2분) ~ 180초(3분) 사이에 10~15초 버스트 배치
    const maxStart = Math.min(180, prepareDurationSec - 15) - burstDur;
    burstStart = 120 + r() * Math.max(0.5, maxStart - 120);
  } else if (prepareDurationSec >= 45) {
    // 2분(120초) 등 중·단기 준비령: 방송 직후 구간에 배치하고 본령 전 최소 15초 이상 정숙 보장
    burstDur = clampNum(prepareDurationSec * (0.09 + 0.03 * r()), 8, 15);
    const minStart = Math.min(prepareDurationSec * 0.56, prepareDurationSec - burstDur - 14);
    const maxStart = Math.max(minStart + 1, prepareDurationSec * 0.74 - burstDur);
    burstStart = Math.max(6, minStart + r() * Math.max(0.5, maxStart - minStart));
  } else {
    burstDur = clampNum(prepareDurationSec * 0.28, 3, 8);
    burstStart = Math.max(1.5, prepareDurationSec * 0.3);
  }

  const windowStartSec = burstStart;
  const windowEndSec = Math.min(prepareDurationSec - 2, burstStart + burstDur);

  if (otherSeats.length > 0 && windowEndSec > windowStartSec + 1) {
    // '약간의 종이 넘김' 느낌을 살리기 위해 일부 수험생들이 차분하게 인쇄 상태를 확인하도록 구성
    const activeCheckerCount = Math.min(
      otherSeats.length,
      Math.max(1, Math.round(otherSeats.length * (0.38 + 0.22 * r())))
    );
    const span = windowEndSec - windowStartSec;

    for (let i = 0; i < activeCheckerCount; i++) {
      const seatIdx = otherSeats[i];
      const checksForStudent = 1 + (r() < 0.55 ? 1 : 0);
      let tCursor = windowStartSec + r() * Math.max(0.4, span * 0.65);
      for (let c = 0; c < checksForStudent; c++) {
        if (tCursor > windowEndSec - 0.3) break;
        const isLightFlip = r() < 0.22;
        events.push({
          t: tCursor,
          a: seatIdx,
          k: isLightFlip ? 'flip' : 'turn',
          n: isLightFlip ? 2 : 1,
          v: 0.55 + 0.28 * r(),
        });
        tCursor += 1.8 + r() * 3.2;
      }
    }
  }

  events.sort((a, b) => a.t - b.t);
  return {
    events,
    otherSeats,
    windowStartSec,
    windowEndSec,
  };
}

/* ================= WebAudio HRTF 입체음향 컨트롤러 ================= */

interface ClipEntry<K extends string> {
  c: K;
  s: number;
  l: number;
}

export interface SeatSoundFeedback {
  seatIndex: number;
  category: 'turn' | 'write';
  label: string;
}

function eventKindKoreanLabel(k: ExamHallEventKind): { category: 'turn' | 'write'; label: string } {
  switch (k) {
    case 'turn':
      return { category: 'turn', label: '시험지 넘김' };
    case 'flip':
      return { category: 'turn', label: '시험지 훑기' };
    case 'scratch':
      return { category: 'write', label: '샤프 필기' };
    case 'line':
      return { category: 'write', label: '밑줄 긋기' };
    case 'click':
      return { category: 'write', label: '샤프 노크' };
    case 'mark':
      return { category: 'write', label: '답안 마킹' };
    case 'erase':
      return { category: 'write', label: '지우개 사용' };
    case 'crumb':
      return { category: 'write', label: '지우개 정리' };
    case 'sniff':
      return { category: 'write', label: '숨소리' };
  }
}

function decodeBase64ToArrayBuffer(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes.buffer;
}

export class ExamHallAudioEngine {
  private ctx: AudioContext | null = null;
  private initPromise: Promise<void> | null = null;
  private masterGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private paperBuffer: AudioBuffer | null = null;
  private pencilBuffer: AudioBuffer | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private paperClips: ClipEntry<PaperClipKind>[] = [];
  private pencilClips: ClipEntry<PencilClipKind>[] = [];
  private seatInputs: BiquadFilterNode[] = [];
  private seatChainNodes: AudioNode[][] = [];
  private ambientSource: AudioBufferSourceNode | null = null;
  private activeSources = new Set<AudioBufferSourceNode>();
  private uiTimers = new Set<number>();

  private mySeat: [number, number] = [1, 3];
  private volumePct = 70;
  private ambientEnabled = true;
  private onSeatSound?: (feedback: SeatSoundFeedback) => void;

  // Standalone loop state
  private standaloneTimerId: number | null = null;
  private standaloneRunning = false;
  private standaloneT0 = 0;
  private standaloneSpeed = 1;
  private standaloneSchedule: BuiltExamHallSchedule | null = null;
  private standaloneIdx = 0;
  private onStandaloneTick?: (elapsedSec: number, running: boolean) => void;

  // Main timer sync state
  private syncBlockKey = '';
  private syncPhase: TimerExamHallSyncPhase = 'idle';
  private syncEvents: ExamHallEvent[] = [];
  private syncIdx = 0;
  private syncLastElapsedSec = 0;
  private syncPrepareInfo: { windowStartSec: number; windowEndSec: number } | null = null;

  public setSeatSoundListener(cb?: (feedback: SeatSoundFeedback) => void): void {
    this.onSeatSound = cb;
  }

  public setStandaloneTickListener(cb?: (elapsedSec: number, running: boolean) => void): void {
    this.onStandaloneTick = cb;
  }

  public isStandalonePlaying(): boolean {
    return this.standaloneRunning;
  }

  public getPrepareWindowInfo(): { windowStartSec: number; windowEndSec: number } | null {
    return this.syncPrepareInfo;
  }

  public async ensureAudioInitialized(): Promise<boolean> {
    if (this.ctx && this.paperBuffer && this.pencilBuffer && this.noiseBuffer) {
      if (this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {
          // Ignore gesture suspension
        }
      }
      return this.ctx.state === 'running';
    }

    if (this.initPromise) {
      await this.initPromise;
      if (this.ctx && this.ctx.state === 'suspended') {
        try {
          await this.ctx.resume();
        } catch {
          // Ignore
        }
      }
      return Boolean(this.ctx && this.ctx.state === 'running');
    }

    this.initPromise = (async () => {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      try {
        await ctx.resume();
      } catch {
        // Will resume on next gesture
      }

      const paperBuf = await new Promise<AudioBuffer>((resolve, reject) =>
        ctx.decodeAudioData(decodeBase64ToArrayBuffer(EXAM_HALL_PAPER_SPRITE), resolve, reject)
      );
      const pencilBuf = await new Promise<AudioBuffer>((resolve, reject) =>
        ctx.decodeAudioData(decodeBase64ToArrayBuffer(EXAM_HALL_PENCIL_SPRITE), resolve, reject)
      );

      this.paperClips = EXAM_HALL_PAPER_CLIPS.map(([c, s, l]) => ({ c, s, l }));
      this.pencilClips = EXAM_HALL_PENCIL_CLIPS.map(([c, s, l]) => ({ c, s, l }));
      this.paperBuffer = paperBuf;
      this.pencilBuffer = pencilBuf;

      // 3-second white noise buffer
      const nBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3), ctx.sampleRate);
      const ch0 = nBuf.getChannelData(0);
      for (let i = 0; i < ch0.length; i++) {
        ch0[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = nBuf;

      // 1.2-second stereo classroom impulse response for convolution reverb
      const imp = ctx.createBuffer(2, Math.floor(ctx.sampleRate * 1.2), ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const y = imp.getChannelData(c);
        for (let i = 0; i < y.length; i++) {
          y[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / y.length, 3.5);
        }
      }

      const master = ctx.createGain();
      master.gain.value = Math.pow(this.volumePct / 100, 2) * 2;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp);
      comp.connect(ctx.destination);

      const convolver = ctx.createConvolver();
      convolver.buffer = imp;
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      wet.connect(convolver);
      convolver.connect(master);

      this.ctx = ctx;
      this.masterGain = master;
      this.wetGain = wet;
      this.rebuildSeatChains();
    })();

    try {
      await this.initPromise;
      return Boolean(this.ctx && this.ctx.state === 'running');
    } catch {
      this.initPromise = null;
      this.ctx = null;
      return false;
    }
  }

  public unlockOnUserGesture(): void {
    void this.ensureAudioInitialized();
  }

  public updateVolume(volumePct: number): void {
    this.volumePct = clampNum(volumePct, 0, 100);
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        Math.pow(this.volumePct / 100, 2) * 2,
        this.ctx.currentTime
      );
    }
  }

  public updateMySeat(seat: [number, number]): void {
    const col = clampNum(Math.round(seat[0]), 0, 3);
    const row = clampNum(Math.round(seat[1]), 0, 6);
    if (this.mySeat[0] === col && this.mySeat[1] === row && this.seatInputs.length === 28) {
      return;
    }
    this.mySeat = [col, row];
    if (this.ctx) {
      this.rebuildSeatChains();
    }
  }

  public updateAmbientAir(enabled: boolean, shouldPlayNow: boolean): void {
    this.ambientEnabled = enabled;
    this.setAmbientPlaying(enabled && shouldPlayNow);
  }

  public updateStandaloneSpeed(speed: number): void {
    const nextSpeed = clampNum(Math.round(speed), 1, 30);
    if (this.standaloneRunning && this.ctx) {
      const now = this.ctx.currentTime;
      const currentElapsed = (now - this.standaloneT0) * this.standaloneSpeed;
      this.standaloneSpeed = nextSpeed;
      this.standaloneT0 = now - currentElapsed / nextSpeed;
      this.cancelScheduledDiscreteSounds();
      if (this.standaloneSchedule) {
        const found = this.standaloneSchedule.events.findIndex((e) => e.t >= currentElapsed);
        this.standaloneIdx = found < 0 ? this.standaloneSchedule.events.length : found;
      }
    } else {
      this.standaloneSpeed = nextSpeed;
    }
  }

  private rebuildSeatChains(): void {
    if (!this.ctx || !this.masterGain || !this.wetGain) return;
    const s0 = OPTIMAL_ACOUSTIC_PRESET.distAtten;
    for (const chain of this.seatChainNodes) {
      for (const node of chain) {
        try {
          node.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
    }
    this.seatChainNodes = [];
    this.seatInputs = [];

    for (let s = 0; s < 28; s++) {
      const dc = (s % 4) - this.mySeat[0];
      const dr = Math.floor(s / 4) - this.mySeat[1];
      const d = Math.hypot(dc, dr);

      const p = this.ctx.createPanner();
      p.panningModel = 'HRTF';
      p.distanceModel = 'linear';
      p.rolloffFactor = 0;
      p.refDistance = 1;
      p.maxDistance = 10000;

      const px = dc;
      const pz = dr === 0 && dc === 0 ? -0.3 : dr;
      if (p.positionX) {
        p.positionX.value = px;
        p.positionY.value = 0;
        p.positionZ.value = pz;
      } else {
        p.setPosition(px, 0, pz);
      }

      const g = this.ctx.createGain();
      g.gain.value =
        (1.5 / (1 + (0.9 + 2.2 * s0) * Math.pow(d, 1.5 + 0.2 * s0))) * (dr > 0 ? 0.9 : 1);

      const w = this.ctx.createGain();
      w.gain.value = 0.8 / (1 + 0.5 * d);

      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = Math.max(2500, 16000 - (2500 + 2500 * s0) * d) * (dr > 0 ? 0.7 : 1);

      lp.connect(g);
      g.connect(p);
      p.connect(this.masterGain);
      lp.connect(w);
      w.connect(this.wetGain);

      this.seatInputs.push(lp);
      this.seatChainNodes.push([lp, g, p, w]);
    }
  }

  private setAmbientPlaying(on: boolean): void {
    if (!on) {
      if (this.ambientSource) {
        try {
          this.ambientSource.stop();
        } catch {
          // Ignore
        }
        this.ambientSource = null;
      }
      return;
    }
    if (this.ambientSource || !this.ctx || !this.noiseBuffer || !this.masterGain) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuffer;
    s.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 650;
    const g = this.ctx.createGain();
    g.gain.value = 0.025;
    s.connect(f);
    f.connect(g);
    g.connect(this.masterGain);
    s.start();
    this.ambientSource = s;
  }

  private cancelScheduledDiscreteSounds(): void {
    for (const s of this.activeSources) {
      try {
        s.stop();
      } catch {
        // Ignore already stopped source
      }
    }
    this.activeSources.clear();
    for (const tid of this.uiTimers) {
      window.clearTimeout(tid);
    }
    this.uiTimers.clear();
  }

  private paperFx() {
    const g = OPTIMAL_ACOUSTIC_PRESET.paperGsm;
    const b = OPTIMAL_ACOUSTIC_PRESET.paperBody;
    const o = OPTIMAL_ACOUSTIC_PRESET.lowBoost;
    return {
      rate: Math.pow(70 / g, 0.35) * (1 - 0.12 * b) * (1 - 0.08 * o),
      gain: Math.pow(g / 70, 0.5) * (1 + 0.3 * b),
      hp: 80 * Math.pow(70 / g, 1.2) * (1 - 0.5 * b) * (1 - 0.3 * o),
      sh: 6 * b + 4 * o,
      hc: 8 * o,
      lo: 0.9 * o,
    };
  }

  private spawnSource(
    buffer: AudioBuffer,
    when: number,
    off: number,
    dur: number,
    rate: number,
    gainVal: number,
    out: AudioNode,
    filt?: [BiquadFilterType, number, number?],
    extraShelves?: [BiquadFilterType, number, number][]
  ): GainNode | null {
    if (!this.ctx) return null;
    const s = this.ctx.createBufferSource();
    s.buffer = buffer;
    s.playbackRate.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = gainVal;

    let tail: AudioNode = s;
    if (filt) {
      const f = this.ctx.createBiquadFilter();
      f.type = filt[0];
      f.frequency.value = filt[1];
      if (filt[2] !== undefined) f.Q.value = filt[2];
      tail.connect(f);
      tail = f;
    }
    if (extraShelves) {
      for (const q of extraShelves) {
        const h = this.ctx.createBiquadFilter();
        h.type = q[0];
        h.frequency.value = q[1];
        h.gain.value = q[2];
        tail.connect(h);
        tail = h;
      }
    }
    tail.connect(g);
    g.connect(out);

    const safeOff = clampNum(off, 0, Math.max(0, buffer.duration - 0.02));
    const safeDur = Math.max(0.01, Math.min(dur, buffer.duration - safeOff));
    this.activeSources.add(s);
    s.onended = () => {
      this.activeSources.delete(s);
    };
    s.start(when, safeOff, safeDur);
    return g;
  }

  private playPaperClip(
    clipItem: ClipEntry<PaperClipKind> | undefined,
    when: number,
    out: AudioNode,
    gain: number,
    rate: number,
    short?: boolean
  ): number {
    if (!this.paperBuffer) return 0.5;
    const fx = this.paperFx();
    const k = clipItem || this.paperClips[Math.floor(Math.random() * this.paperClips.length)];
    const tl = short ? clampNum(OPTIMAL_ACOUSTIC_PRESET.turnLength, 0.1, 1) : 1;
    const rb = 1 + 0.2 * (1 - tl);
    const tm = Math.min(1, tl * rb);
    const rr = rate * fx.rate * Math.exp(0.09 * (Math.random() * 2 - 1)) * rb;
    const G = gain * fx.gain;

    const fadeOutIfCut = (gNode: GainNode | null, len: number) => {
      if (gNode && tl < 1) {
        const e = when + len;
        gNode.gain.setValueAtTime(gNode.gain.value, Math.max(when, e - 0.07));
        gNode.gain.linearRampToValueAtTime(0.0001, e);
      }
    };

    const g1 = this.spawnSource(
      this.paperBuffer,
      when,
      k.s,
      k.l * tm,
      rr,
      G,
      out,
      ['highpass', fx.hp],
      [
        ['lowshelf', 260, fx.sh],
        ['highshelf', 3000, -fx.hc],
      ]
    );
    fadeOutIfCut(g1, (k.l * tm) / rr);

    if (fx.lo > 0) {
      const rLo = (rr / rb) * 0.55;
      const g2 = this.spawnSource(
        this.paperBuffer,
        when,
        k.s,
        k.l * tl,
        rLo,
        G * fx.lo,
        out,
        ['lowpass', 1400]
      );
      fadeOutIfCut(g2, (k.l * tl) / rLo);
    }
    return k.l / (rate * fx.rate);
  }

  private playPencilClip(e: ExamHallEvent, when: number, out: AudioNode): void {
    if (!this.pencilBuffer) return;
    const pg = OPTIMAL_ACOUSTIC_PRESET.pencilGain;
    const erGain = OPTIMAL_ACOUSTIC_PRESET.eraserGain;
    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = (cat: PencilClipKind) => {
      const matches = this.pencilClips.filter((x) => x.c === cat);
      return matches[Math.floor(Math.random() * matches.length)];
    };
    let t = when;
    const st = (k: ClipEntry<PencilClipKind>, g: number, hp = 350) => {
      const r = rnd(0.92, 1.1);
      this.spawnSource(this.pencilBuffer!, t, k.s, k.l, r, g, out, ['highpass', hp]);
      return k.l / r;
    };

    if (e.k === 'scratch') {
      const ns = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < ns; i++) {
        t += st(pick('w'), 0.5 * e.v * pg) + rnd(0.02, 0.12);
      }
    } else if (e.k === 'erase') {
      const eg = 0.6 * e.v * erGain;
      for (let i = 0; i < e.n; i++) {
        t += st(pick('E'), eg, 120) + rnd(0.05, 0.25);
      }
    } else if (e.k === 'crumb') {
      const eg = 0.6 * e.v * erGain;
      const cnt = 1 + (Math.random() < 0.35 ? 1 : 0);
      for (let i = 0; i < cnt; i++) {
        t += st(pick('C'), eg, 120) + rnd(0.1, 0.4);
      }
    } else if (e.k === 'click') {
      st(pick('k'), 0.5 * e.v * pg);
    } else {
      for (let i = 0; i < e.n; i++) {
        t += st(pick('u'), 0.5 * e.v * pg) + rnd(0.25, 0.9);
      }
    }
  }

  public playEvent(e: ExamHallEvent, when: number): void {
    if (!this.ctx || !this.noiseBuffer) return;
    const seatIdx = clampNum(e.a, 0, 27);
    const out = this.seatInputs[seatIdx];
    if (!out) return;

    // Schedule seat visual feedback
    if (this.onSeatSound) {
      const delayMs = Math.max(0, (when - this.ctx.currentTime) * 1000);
      const meta = eventKindKoreanLabel(e.k);
      const tid = window.setTimeout(() => {
        this.uiTimers.delete(tid);
        this.onSeatSound?.({
          seatIndex: seatIdx,
          category: meta.category,
          label: meta.label,
        });
      }, delayMs);
      this.uiTimers.add(tid);
    }

    if (
      e.k === 'scratch' ||
      e.k === 'line' ||
      e.k === 'click' ||
      e.k === 'erase' ||
      e.k === 'crumb'
    ) {
      this.playPencilClip(e, when, out);
      return;
    }

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    if (e.k === 'turn' || e.k === 'flip') {
      const g = (0.9 + 0.3 * Math.random()) * (e.v || 1);
      const by = (c: PaperClipKind) => this.paperClips.filter((x) => x.c === c);
      const pk = (arr: ClipEntry<PaperClipKind>[]) => arr[Math.floor(Math.random() * arr.length)];
      const d = Math.hypot((seatIdx % 4) - this.mySeat[0], (seatIdx >> 2) - this.mySeat[1]);

      if (e.k === 'turn') {
        const pool = d <= 1.5 && Math.random() < 0.3 ? by('N') : by('T');
        this.playPaperClip(pk(pool), when, out, g, 1, true);
      } else {
        let t = when;
        const tot = 0.17 * e.n + 0.2;
        while (t - when < tot) {
          const k = Math.random() < 0.15 && tot - (t - when) > 1 ? pk(by('F')) : pk(by('T'));
          t += Math.max(0.2, this.playPaperClip(k, t, out, g * 0.8, rnd(1, 1.2)) * 0.8);
        }
      }
      return;
    }

    const nBuf = this.noiseBuffer;
    const o = Math.random() * 1.5;
    if (e.k === 'mark') {
      const ns = 4 + Math.floor(Math.random() * 4);
      let t = when;
      for (let i = 0; i < ns; i++) {
        const d = rnd(0.05, 0.1);
        const g = this.spawnSource(nBuf, t, o, d + 0.05, 1, 0, out, [
          'bandpass',
          rnd(1300, 2300),
          0.8,
        ]);
        if (g) {
          g.gain.setValueAtTime(0, t);
          g.gain.linearRampToValueAtTime(0.11 * e.v * (0.6 + Math.random() * 0.6), t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, t + d);
        }
        t += d + rnd(0.01, 0.05);
      }
    } else if (e.k === 'sniff') {
      const d = rnd(0.15, 0.3);
      const g = this.spawnSource(nBuf, when, o, d, 1, 0, out, [
        'bandpass',
        rnd(1400, 2600),
        1.5,
      ]);
      if (g) {
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.08, when + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, when + d);
      }
    }
  }

  /**
   * 7종 대표 효과음 순차 시연 (소리 테스트 버튼)
   */
  public async playSoundTest(settings: ExamHallSettings): Promise<boolean> {
    this.updateMySeat(settings.mySeat);
    this.updateVolume(settings.volume);
    const ok = await this.ensureAudioInitialized();
    if (!ok || !this.ctx) return false;

    const myIdx = settings.mySeat[1] * 4 + settings.mySeat[0];
    const sampleSeat = myIdx === 3 ? 2 : 3;
    const w = this.ctx.currentTime + 0.05;
    const seq: [ExamHallEventKind, number, number?][] = [
      ['turn', 0, 1],
      ['flip', 1.2, 4],
      ['scratch', 2.6, 1],
      ['mark', 3.4, 1],
      ['click', 4.0, 1],
      ['erase', 4.6, 1],
      ['crumb', 6.4, 1],
    ];
    for (const [k, d, n] of seq) {
      this.playEvent({ t: d, a: sampleSeat, k, n: n || 1, v: 1 }, w + d);
    }
    return true;
  }

  /* ================= 단독 원클릭 재생 제어 ================= */

  public async startStandalone(
    schedule: BuiltExamHallSchedule,
    settings: ExamHallSettings
  ): Promise<boolean> {
    this.stopTimerSync();
    this.stopStandalone();

    this.updateMySeat(settings.mySeat);
    this.updateVolume(settings.volume);
    this.ambientEnabled = settings.ambientAir;
    this.standaloneSpeed = clampNum(Math.round(settings.standaloneSpeed), 1, 30);

    const ok = await this.ensureAudioInitialized();
    if (!ok || !this.ctx) return false;

    this.standaloneSchedule = schedule;
    this.standaloneT0 = this.ctx.currentTime;
    this.standaloneIdx = 0;
    this.standaloneRunning = true;
    this.setAmbientPlaying(this.ambientEnabled);
    this.onStandaloneTick?.(0, true);

    this.standaloneTimerId = window.setInterval(() => {
      this.tickStandalone();
    }, 90);
    this.tickStandalone();
    return true;
  }

  public updateLiveScheduleIfStandalone(schedule: BuiltExamHallSchedule): void {
    if (!this.standaloneRunning || !this.ctx) {
      this.standaloneSchedule = schedule;
      return;
    }
    const el = (this.ctx.currentTime - this.standaloneT0) * this.standaloneSpeed;
    this.standaloneSchedule = schedule;
    this.cancelScheduledDiscreteSounds();
    const found = schedule.events.findIndex((e) => e.t >= el);
    this.standaloneIdx = found < 0 ? schedule.events.length : found;
  }

  private tickStandalone(): void {
    if (!this.standaloneRunning || !this.ctx || !this.standaloneSchedule) return;
    const x = this.standaloneSpeed;
    const el = (this.ctx.currentTime - this.standaloneT0) * x;
    const evs = this.standaloneSchedule.events;

    while (this.standaloneIdx < evs.length && (evs[this.standaloneIdx].t - el) / x < 0.35) {
      const w = this.ctx.currentTime + Math.max(0, (evs[this.standaloneIdx].t - el) / x);
      this.playEvent(evs[this.standaloneIdx], w);
      this.standaloneIdx++;
    }

    this.onStandaloneTick?.(el, true);
    if (el >= this.standaloneSchedule.durationMin * 60) {
      this.stopStandalone();
    }
  }

  public stopStandalone(): void {
    const wasRunning = this.standaloneRunning;
    this.standaloneRunning = false;
    if (this.standaloneTimerId !== null) {
      window.clearInterval(this.standaloneTimerId);
      this.standaloneTimerId = null;
    }
    this.cancelScheduledDiscreteSounds();
    if (this.syncPhase === 'idle') {
      this.setAmbientPlaying(false);
    }
    if (wasRunning) {
      this.onStandaloneTick?.(0, false);
    }
  }

  /* ================= 메인 실전 타이머 정밀 동기화 (항상 1배속) ================= */

  public syncWithMainTimer(
    target: TimerExamHallSyncState,
    settings: ExamHallSettings,
    currentMainSchedule: BuiltExamHallSchedule
  ): void {
    if (!settings.enabled || target.phase === 'idle') {
      if (this.syncPhase !== 'idle') {
        this.stopTimerSync();
      }
      return;
    }

    // 실전 타이머가 작동 중이면 단독 재생 루프는 즉시 종료하고 실전 동기화로 인계
    if (this.standaloneRunning) {
      this.stopStandalone();
    }

    this.updateMySeat(settings.mySeat);
    this.updateVolume(settings.volume);
    this.ambientEnabled = settings.ambientAir;

    if (target.phase === 'quiet') {
      this.syncPhase = 'quiet';
      this.syncBlockKey = target.blockKey;
      this.syncPrepareInfo = null;
      this.cancelScheduledDiscreteSounds();
      this.setAmbientPlaying(false);
      return;
    }

    if (target.isPaused) {
      this.cancelScheduledDiscreteSounds();
      this.setAmbientPlaying(false);
      this.syncLastElapsedSec = target.elapsedSec;
      return;
    }

    if (!this.ctx || this.ctx.state !== 'running') {
      void this.ensureAudioInitialized();
      return;
    }

    // 구간(준비령 <-> 본령)이 전환되었거나 스케줄 블록이 바뀐 경우 사건열 구성
    const blockIdentity =
      target.phase === 'prepare'
        ? `${target.blockKey}_${settings.studentCount}_${settings.mySeat[0]}_${settings.mySeat[1]}_${settings.seed}`
        : `${target.blockKey}_${currentMainSchedule.subjectKey}_${settings.studentCount}_${settings.skillMean}_${settings.skillStd}_${settings.mySeat[0]}_${settings.mySeat[1]}_${settings.seed}`;

    const jumped = Math.abs(target.elapsedSec - this.syncLastElapsedSec) > 0.85;

    if (blockIdentity !== this.syncBlockKey || target.phase !== this.syncPhase) {
      this.cancelScheduledDiscreteSounds();
      this.syncBlockKey = blockIdentity;
      this.syncPhase = target.phase;

      if (target.phase === 'prepare') {
        const prep = buildPreparePaperCheckSchedule(
          target.blockDurationSec,
          settings.studentCount,
          settings.mySeat,
          settings.seed
        );
        this.syncEvents = prep.events;
        this.syncPrepareInfo = {
          windowStartSec: prep.windowStartSec,
          windowEndSec: prep.windowEndSec,
        };
      } else {
        this.syncEvents = currentMainSchedule.events;
        this.syncPrepareInfo = null;
      }

      const found = this.syncEvents.findIndex((e) => e.t >= target.elapsedSec);
      this.syncIdx = found < 0 ? this.syncEvents.length : found;
    } else if (jumped) {
      // 시계 바늘 드래그 또는 이전/다음 타종 이동 시 즉시 시크
      this.cancelScheduledDiscreteSounds();
      const found = this.syncEvents.findIndex((e) => e.t >= target.elapsedSec);
      this.syncIdx = found < 0 ? this.syncEvents.length : found;
    }

    this.syncLastElapsedSec = target.elapsedSec;
    this.setAmbientPlaying(this.ambientEnabled);

    // 실전 타이머 연동은 항상 1배속(실시간)으로 0.32초 선행 스케줄링
    const lookaheadSec = 0.32;
    while (
      this.syncIdx < this.syncEvents.length &&
      this.syncEvents[this.syncIdx].t - target.elapsedSec < lookaheadSec
    ) {
      const ev = this.syncEvents[this.syncIdx];
      if (ev.t >= target.elapsedSec - 0.12) {
        const when = this.ctx.currentTime + Math.max(0, ev.t - target.elapsedSec);
        this.playEvent(ev, when);
      }
      this.syncIdx++;
    }
  }

  public stopTimerSync(): void {
    this.syncPhase = 'idle';
    this.syncBlockKey = '';
    this.syncEvents = [];
    this.syncIdx = 0;
    this.syncLastElapsedSec = 0;
    this.syncPrepareInfo = null;
    this.cancelScheduledDiscreteSounds();
    if (!this.standaloneRunning) {
      this.setAmbientPlaying(false);
    }
  }

  public dispose(): void {
    this.stopStandalone();
    this.stopTimerSync();
    if (this.ctx) {
      try {
        void this.ctx.close();
      } catch {
        // Ignore
      }
      this.ctx = null;
    }
  }
}

/**
 * 분당 소리 밀도 미니 그래프 렌더링 헬퍼 (Light / Dark / Sepia 테마 대응)
 */
export function drawExamHallDensityCanvas(
  canvas: HTMLCanvasElement | null,
  schedule: BuiltExamHallSchedule,
  playheadSec: number | null,
  theme: 'light' | 'dark' | 'sepia'
): void {
  if (!canvas) return;
  const cssW = Math.max(220, canvas.clientWidth || 296);
  const cssH = Math.max(64, canvas.clientHeight || 74);
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(cssW * dpr);
  const H = Math.round(cssH * dpr);
  if (canvas.width !== W || canvas.height !== H) {
    canvas.width = W;
    canvas.height = H;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, W, H);

  const T = schedule.durationMin;
  const a = schedule.turnDensityPerMin;
  const b = schedule.writeDensityPerMin;
  const mx = Math.max(1, ...a, ...b.map((v) => v / 6));

  const padTop = 6 * dpr;
  const padBottom = 16 * dpr;
  const chartH = Math.max(10, H - padTop - padBottom);
  const bw = W / T;

  const writeColor =
    theme === 'dark'
      ? 'rgba(165, 165, 174, 0.34)'
      : theme === 'sepia'
        ? 'rgba(102, 84, 64, 0.28)'
        : 'rgba(120, 120, 128, 0.30)';
  const turnColor =
    theme === 'dark'
      ? 'rgba(122, 178, 238, 0.86)'
      : theme === 'sepia'
        ? 'rgba(64, 106, 150, 0.82)'
        : 'rgba(47, 93, 138, 0.84)';
  const axisColor =
    theme === 'dark'
      ? 'rgba(235, 235, 245, 0.52)'
      : theme === 'sepia'
        ? 'rgba(72, 56, 40, 0.58)'
        : 'rgba(60, 60, 67, 0.54)';
  const baselineColor =
    theme === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)';

  // Baseline
  ctx.fillStyle = baselineColor;
  ctx.fillRect(0, H - padBottom, W, Math.max(1, 1 * dpr));

  const barGap = Math.min(1.2 * dpr, bw * 0.18);
  const barW = Math.max(1, bw - barGap);

  for (let i = 0; i < T; i++) {
    const hWrite = ((b[i] / 6) / mx) * chartH;
    const hTurn = (a[i] / mx) * chartH;
    const x = i * bw;
    if (hWrite > 0.4) {
      ctx.fillStyle = writeColor;
      ctx.fillRect(x, H - padBottom - hWrite, barW, hWrite);
    }
    if (hTurn > 0.4) {
      ctx.fillStyle = turnColor;
      ctx.fillRect(x, H - padBottom - hTurn, barW, hTurn);
    }
  }

  // Axis labels
  ctx.fillStyle = axisColor;
  ctx.font = `500 ${Math.round(9.5 * dpr)}px -apple-system, BlinkMacSystemFont, "Pretendard Variable", sans-serif`;
  ctx.textBaseline = 'bottom';
  const stepMin = T >= 80 ? 20 : 10;
  for (let m = 0; m <= T; m += stepMin) {
    const label = `${m}분`;
    if (m === 0) {
      ctx.textAlign = 'left';
      ctx.fillText(label, 1 * dpr, H - 1 * dpr);
    } else if (m >= T) {
      ctx.textAlign = 'right';
      ctx.fillText(label, W - 1 * dpr, H - 1 * dpr);
    } else {
      ctx.textAlign = 'center';
      ctx.fillText(label, m * bw, H - 1 * dpr);
    }
  }

  // Playhead line
  if (playheadSec !== null && playheadSec >= 0) {
    const px = clampNum((playheadSec / (T * 60)) * W, 0, W - 1);
    ctx.fillStyle = theme === 'dark' ? 'rgba(255, 214, 102, 0.92)' : 'rgba(210, 82, 46, 0.88)';
    ctx.fillRect(px, 2 * dpr, Math.max(1.5, 1.5 * dpr), H - padBottom - 2 * dpr);
  }
}
