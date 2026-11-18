/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  BELL_DURATION_SEC_MAP,
  BellType,
  ClockSyncMode,
  CSAT_37_BELL_FILES,
  CSAT_FULL_TIMETABLE,
  CSAT_SELECTABLE_CUE_NODES,
  CSAT_SESSION_PRESETS,
  CSAT_STAGE_TYPE_META,
  CSAT_SUBJECT_GROUPS,
  CsatBellCueItem,
  CsatSelectableCueNode,
  CsatSessionPreset,
  CsatStageType,
  CsatSubjectGroupId,
  CsatTimetableRow,
  BookmarkFolder,
  CustomSequenceConfig,
  DEFAULT_BOOKMARK_FOLDERS,
  DEFAULT_CUSTOM_SEQUENCE_CONFIG,
  DEFAULT_SEQUENCE_BOOKMARKS,
  SavedSequenceBookmark,
  SubjectAutoBuildOptions,
  analyzeSequenceConfig,
  buildCueTimeline,
  buildCustomSequencePreset,
  buildSubjectBasedNodeIds,
  cloneSequenceConfig,
  format24hInputTime,
  format24hTime,
  formatAmPmTime,
  formatBellDuration,
  formatIntervalInputDisplay,
  formatIntervalSecondsLabel,
  getIntervalMapKey,
  validateBookmarkFolders,
  validateBookmarks,
  validateConfig,
  validateIntervalInput,
  validateRowTimeInput,
} from './data/csatSchedule';
import {
  BELL_LABELS,
  CUSTOM_37_BELL_MP3_DATA_URIS,
  getBellFileUrl,
  getEmbeddedBellDataUris,
  loadAll37BellMp3DataUris,
} from './data/embeddedBellAudio';
import { formatAppVersion } from './data/versionInfo';
import { syncFaviconWithTheme } from './data/faviconAssets';
import { buildStandaloneCsatHtml } from './utils/standaloneHtmlBuilder';
import {
  KEEP_AWAKE_MP4_DATA_URI,
  attachCanvasFallbackStream,
  createKeepAwakeVideoUrl,
  isAndroidBrowser,
} from './utils/keepAwakeVideo';
import { usePWAInstall } from './hooks/usePWAInstall';

export type ThemePreference = 'auto' | 'light' | 'dark' | 'sepia';
export type ResolvedTheme = 'light' | 'dark' | 'sepia';
export type MenuCategory = 'schedule_audio' | 'ui_theme' | 'data_export';
export type PlaybackSpeed = 1 | 2 | 5 | 10 | 30;

const STORAGE_KEY = 'csat_timer_custom_settings_v2';
const VALID_THEME_PREFS: ThemePreference[] = ['auto', 'light', 'dark', 'sepia'];
const VALID_SYNC_MODES: ClockSyncMode[] = ['original_csat_time', 'custom_cascaded_time'];
const PLAYBACK_SPEEDS: PlaybackSpeed[] = [1, 2, 5, 10, 30];
const LATE_GRACE_SEC = 5;

interface StoredCustomSettings {
  themePref: ThemePreference;
  presetId: string;
  devMode: boolean;
  clockSyncMode: ClockSyncMode;
  customSequenceConfig: CustomSequenceConfig;
  bookmarkFolders: BookmarkFolder[];
  bookmarks: SavedSequenceBookmark[];
  bellVolume: number;
  englishVolume: number;
  keepScreenAwake: boolean;
  mainBellGlowAnim: boolean;
  prelimBellGlowAnim: boolean;
  timetableOpacity?: number;
  updatedAt?: string;
}

function readStoredCustomSettings(): {
  settings: StoredCustomSettings;
  correctedCount: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    let correctedCount = 0;

    const themePref: ThemePreference = VALID_THEME_PREFS.includes(parsed?.themePref)
      ? parsed.themePref
      : 'auto';
    const clockSyncMode: ClockSyncMode = 'custom_cascaded_time';

    const cfgVal = validateConfig(parsed?.customSequenceConfig);
    correctedCount += cfgVal.correctedCount;

    const folderVal = Array.isArray(parsed?.bookmarkFolders)
      ? validateBookmarkFolders(parsed.bookmarkFolders)
      : { folders: DEFAULT_BOOKMARK_FOLDERS, correctedCount: 0 };
    correctedCount += folderVal.correctedCount;
    const validFolderIds = new Set(folderVal.folders.map((f) => f.id));

    const bmVal = Array.isArray(parsed?.bookmarks)
      ? validateBookmarks(parsed.bookmarks, validFolderIds)
      : { bookmarks: DEFAULT_SEQUENCE_BOOKMARKS, correctedCount: 0 };
    correctedCount += bmVal.correctedCount;

    const isCustomSeq = parsed?.presetId === 'custom_checkbox_sequence';
    const presetId: string =
      isCustomSeq ||
      (typeof parsed?.presetId === 'string' &&
        CSAT_SESSION_PRESETS.some((p) => p.id === parsed.presetId))
        ? parsed.presetId
        : CSAT_SESSION_PRESETS[0].id;
    const devMode: boolean = typeof parsed?.devMode === 'boolean' ? parsed.devMode : false;
    const bellVolume =
      typeof parsed?.bellVolume === 'number' && !Number.isNaN(parsed.bellVolume)
        ? Math.min(100, Math.max(0, Math.round(parsed.bellVolume)))
        : 100;
    const englishVolume =
      typeof parsed?.englishVolume === 'number' && !Number.isNaN(parsed.englishVolume)
        ? Math.min(100, Math.max(0, Math.round(parsed.englishVolume)))
        : 100;
    const keepScreenAwake =
      typeof parsed?.keepScreenAwake === 'boolean' ? parsed.keepScreenAwake : true;
    const mainBellGlowAnim =
      typeof parsed?.mainBellGlowAnim === 'boolean' ? parsed.mainBellGlowAnim : true;
    const prelimBellGlowAnim =
      typeof parsed?.prelimBellGlowAnim === 'boolean' ? parsed.prelimBellGlowAnim : true;
    const timetableOpacity =
      typeof parsed?.timetableOpacity === 'number' && !Number.isNaN(parsed.timetableOpacity)
        ? Math.min(98, Math.max(45, Math.round(parsed.timetableOpacity)))
        : 82;

    return {
      settings: {
        themePref,
        presetId,
        devMode,
        clockSyncMode,
        customSequenceConfig: cfgVal.config,
        bookmarkFolders: folderVal.folders,
        bookmarks: bmVal.bookmarks,
        bellVolume,
        englishVolume,
        keepScreenAwake,
        mainBellGlowAnim,
        prelimBellGlowAnim,
        timetableOpacity,
      },
      correctedCount,
    };
  } catch {
    return null;
  }
}

function computeResolvedTheme(pref: ThemePreference): ResolvedTheme {
  if (pref === 'light' || pref === 'dark' || pref === 'sepia') {
    return pref;
  }
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FS = `precision highp float;
uniform vec2 uRes,uC;uniform float uR,uH,uB,uS;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}

vec2 evalMembrane(float r, float H){
  if(H<=1e-5)return vec2(0.);
  float fillet=.036*(1.3-.3*H);
  float rInner=1.-fillet, rOuter=1.+fillet, width=2.*fillet;
  float L=.135*(.55+.45*sqrt(H));
  float decayP=1.75, uMax=2.5;
  float h=.34*H;

  float s=clamp((r-rInner)/width,0.,1.);
  float dEff=max(r-rOuter,0.)+fillet*s*s*s*(2.-s);
  float ddDr=s*s*(3.-2.*s);

  float u=dEff/L;
  float u1=1.+u;
  float core=pow(u1,-decayP)*exp(-.08*u*u/u1);
  float dcoreDu=core*(-decayP/u1-(.16*u+.08*u*u)/(u1*u1));

  float w=clamp(1.-u/uMax,0.,1.);
  float win=w*w*w*(10.-15.*w+6.*w*w);
  float dwinDu=u<uMax?-30.*w*w*(1.-w)*(1.-w)/uMax:0.;

  float factor=core*win;
  float dfdu=dcoreDu*win+core*dwinDu;

  float z=h*factor;
  float dzdr=(h/L)*dfdu*ddDr;
  return vec2(z,dzdr);
}

void main(){
  vec2 f=gl_FragCoord.xy,q=(f-uC)/uR;
  float r=length(q);
  vec2 dir=r>1e-5?q/r:vec2(1.,0.);

  vec2 mem=evalMembrane(r,uH);
  float hb=mem.x, dzdr=mem.y;
  vec2 grad=dzdr*dir;

  vec2 wv=f*1.9;
  vec2 mb=.01*vec2(cos(wv.x)*sin(wv.y),sin(wv.x)*cos(wv.y));
  vec3 n=normalize(vec3(-grad.x-mb.x,-grad.y-mb.y,1.));
  vec3 L=normalize(vec3(-.6,.6,.42));
  float diff=dot(n,L)-L.z;

  float occ=0.;
  if(uH>1e-4 && r>.96){
    for(int i=1;i<=16;i++){
      float t=float(i)*.016;
      float rs=length(q+L.xy*t);
      float zs=evalMembrane(rs,uH).x;
      occ=max(occ,max(0.,(zs-hb)/(t+.012)));
    }
  }
  float shDrop=occ/(1.+1.15*occ);
  float sh=1.-shDrop;

  float lf=dot(f/uRes-.5,vec2(-.7,.7));
  float g=diff<0.?.36*diff:.16*diff/(1.+1.6*diff);
  vec3 cloth=vec3(.945,.94,.935)*(.98+g)*(1.-.34*(1.-sh))*(1.+.10*lf);
  vec3 hi=max(cloth-.9,0.);
  cloth=min(cloth,vec3(.9))+hi/(1.+10.*hi);

  vec3 sepia=vec3(.915,.872,.788)*(.98+g)*(1.-.34*(1.-sh))*(1.+.10*lf);
  vec3 shi=max(sepia-.88,0.);
  sepia=min(sepia,vec3(.88))+shi/(1.+10.*shi);

  vec3 dark=(vec3(.035,.037,.04)+vec3(.16,.17,.18)*max(diff,0.))*(1.-.5*(1.-sh));
  vec3 baseCol=mix(dark,cloth,uB);
  vec3 col=mix(baseCol,sepia,uS)+(hash(f)-.5)/255.;
  gl_FragColor=vec4(col,1.);
}`;

const STAGE_OUT = 400;
const FADE_OUT_TOTAL = STAGE_OUT * 3;
const DROP = 1200;
const RISE = 1600;
const APPEAR_T0 = 1250;
const STAGE_IN = STAGE_OUT;
const DUR_IN = STAGE_OUT;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const sm = (a: number, b: number, v: number) => {
  const x = clamp((v - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};
const easeSine = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));

function formatDurationClock(msRemaining: number): string {
  const totalSec = Math.max(0, Math.ceil(msRemaining / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function roundedRectDistance(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): number {
  const qx = Math.abs(x) - (width / 2 - radius);
  const qy = Math.abs(y) - (height / 2 - radius);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
}

function buildLensMap(width: number, height: number, radius: number): string {
  const canvas = document.createElement('canvas');
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const mapWidth = Math.max(128, Math.round(width * scale));
  const mapHeight = Math.max(48, Math.round(height * scale));
  canvas.width = mapWidth;
  canvas.height = mapHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return '';
  const image = context.createImageData(mapWidth, mapHeight);
  const edgeWidth = Math.max(7, height * 0.14);
  const maxOffset = 3.1;
  const sampleDistance = 1.15;

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      const px = (x / (mapWidth - 1) - 0.5) * width;
      const py = (y / (mapHeight - 1) - 0.5) * height;
      const distance = (xx: number, yy: number) =>
        roundedRectDistance(xx, yy, width, height, radius);
      const inside = Math.max(0, -distance(px, py));
      const profile = sm(0, edgeWidth, inside);
      const gx =
        (sm(0, edgeWidth, Math.max(0, -distance(px + sampleDistance, py))) -
          sm(0, edgeWidth, Math.max(0, -distance(px - sampleDistance, py)))) /
        (2 * sampleDistance);
      const gy =
        (sm(0, edgeWidth, Math.max(0, -distance(px, py + sampleDistance))) -
          sm(0, edgeWidth, Math.max(0, -distance(px, py - sampleDistance)))) /
        (2 * sampleDistance);
      const lensWeight = 1 - profile;
      const cornerFactor = 0.72 + 0.28 * clamp(Math.abs(px) / (width * 0.5), 0, 1);
      const dx = clamp(-gx * maxOffset * cornerFactor * lensWeight, -maxOffset, maxOffset);
      const dy = clamp(-gy * maxOffset * lensWeight, -maxOffset, maxOffset);
      const index = (y * mapWidth + x) * 4;
      image.data[index] = clamp(Math.round(128 + (dx / 18) * 255), 0, 255);
      image.data[index + 1] = clamp(Math.round(128 + (dy / 18) * 255), 0, 255);
      image.data[index + 2] = 128;
      image.data[index + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

const CLOCK_TICKS = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const s = Math.sin(a);
  const c = -Math.cos(a);
  const isMajor = i % 3 === 0;
  const r1 = isMajor ? 85 : 90;
  const r2 = isMajor ? 97 : 96;
  return {
    key: i,
    x1: (s * r1).toFixed(2),
    y1: (c * r1).toFixed(2),
    x2: (s * r2).toFixed(2),
    y2: (c * r2).toFixed(2),
    isMajor,
    strokeWidth: isMajor ? 1.5 : 0.8,
  };
});

export default function App() {
  // DOM & WebGL Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const labRef = useRef<HTMLDivElement | null>(null);
  const startLabRef = useRef<HTMLDivElement | null>(null);
  const endLabRef = useRef<HTMLDivElement | null>(null);
  const remainDigitsRef = useRef<HTMLDivElement | null>(null);
  const stageBadgeRef = useRef<HTMLDivElement | null>(null);
  const tkRef = useRef<SVGGElement | null>(null);
  const hdRef = useRef<SVGGElement | null>(null);
  const clockGlowBoostRef = useRef<SVGGElement | null>(null);
  const hourHandRef = useRef<SVGGElement | null>(null);
  const minHandRef = useRef<SVGLineElement | null>(null);
  const minHandHitRef = useRef<SVGLineElement | null>(null);
  const secHandRef = useRef<SVGGElement | null>(null);
  const engFileInputRef = useRef<HTMLInputElement | null>(null);
  const configJsonInputRef = useRef<HTMLInputElement | null>(null);
  const dockRef = useRef<HTMLDivElement | null>(null);
  const topLeftMenuRef = useRef<HTMLDivElement | null>(null);
  const rtScrollListRef = useRef<HTMLDivElement | null>(null);
  const builderRightPaneRef = useRef<HTMLElement | null>(null);
  const builderStepBodyRef = useRef<HTMLDivElement | null>(null);

  const initialLoadRef = useRef(readStoredCustomSettings());
  const initialStored = initialLoadRef.current?.settings ?? null;

  // React UI States
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState<MenuCategory | null>(null);
  const [isBookmarkCardOpen, setIsBookmarkCardOpen] = useState<boolean>(false);
  const [isTimetablePanelOpen, setIsTimetablePanelOpen] = useState<boolean>(false);
  const [timetableViewMode, setTimetableViewMode] = useState<'all' | 'selected'>('all');
  const [timetableSwitchAnim, setTimetableSwitchAnim] = useState<'none' | 'to-selected' | 'to-all'>('none');
  const [isTimetableOptionCollapsed, setIsTimetableOptionCollapsed] = useState<boolean>(false);
  const [activeCustomNodeId, setActiveCustomNodeId] = useState<string | null>(null);

  // C5: Right timetable inline expanded item & temporary start point state
  const [expandedTimetableKey, setExpandedTimetableKey] = useState<string | null>(null);
  const [expandedInfoKey, setExpandedInfoKey] = useState<string | null>(null);
  const [isTemporaryStartPoint, setIsTemporaryStartPoint] = useState<boolean>(false);

  const [themePref, setThemePref] = useState<ThemePreference>(() =>
    initialStored ? initialStored.themePref : 'auto'
  );
  const [clockSyncMode, setClockSyncMode] = useState<ClockSyncMode>('custom_cascaded_time');
  const [customSequenceConfig, setCustomSequenceConfig] = useState<CustomSequenceConfig>(() =>
    initialStored ? initialStored.customSequenceConfig : DEFAULT_CUSTOM_SEQUENCE_CONFIG
  );
  const [bookmarkFolders, setBookmarkFolders] = useState<BookmarkFolder[]>(() =>
    initialStored ? initialStored.bookmarkFolders : DEFAULT_BOOKMARK_FOLDERS
  );
  const [bookmarks, setBookmarks] = useState<SavedSequenceBookmark[]>(() =>
    initialStored ? initialStored.bookmarks : DEFAULT_SEQUENCE_BOOKMARKS
  );

  // C1 & C8: Draft state inside Builder Modal + Undo/Redo stack
  const [draftSequenceConfig, setDraftSequenceConfig] = useState<CustomSequenceConfig>(() =>
    cloneSequenceConfig(initialStored ? initialStored.customSequenceConfig : DEFAULT_CUSTOM_SEQUENCE_CONFIG)
  );
  const [draftClockSyncMode, setDraftClockSyncMode] = useState<ClockSyncMode>('custom_cascaded_time');
  const [draftUndoStack, setDraftUndoStack] = useState<CustomSequenceConfig[]>([]);
  const [draftRedoStack, setDraftRedoStack] = useState<CustomSequenceConfig[]>([]);
  const [builderStep, setBuilderStep] = useState<1 | 2 | 3>(1);
  const [builderSearchQuery, setBuilderSearchQuery] = useState<string>('');
  const [builderFilterMode, setBuilderFilterMode] = useState<'all' | 'selected'>('all');
  const [stageSelectMode] = useState<'add' | 'replace'>('add');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [expandedOmittedKeys, setExpandedOmittedKeys] = useState<Record<string, boolean>>({});
  const [intervalInputTexts, setIntervalInputTexts] = useState<Record<string, string>>({});
  const [rowInputErrors, setRowInputErrors] = useState<Record<string, string>>({});

  // B3: Subject auto-builder state
  const [subjAutoChecked, setSubjAutoChecked] = useState<Record<CsatSubjectGroupId, boolean>>({
    kor: true,
    math: true,
    eng: true,
    hist: true,
    inq1: true,
    inq2: true,
    lang2: false,
  });
  const [subjInqCount, setSubjInqCount] = useState<number>(2);
  const [subjAutoScope, setSubjAutoScope] = useState<'all' | 'core' | 'real'>('all');

  // B4: Batch interval adjustment state
  const [batchFromMin, setBatchFromMin] = useState<number>(80);
  const [batchToMin, setBatchToMin] = useState<number>(60);

  // B5: Audio Volumes (0 ~ 100)
  const [bellVolume, setBellVolume] = useState<number>(() =>
    initialStored ? initialStored.bellVolume : 100
  );
  const [englishVolume, setEnglishVolume] = useState<number>(() =>
    initialStored ? initialStored.englishVolume : 100
  );

  // B6 & B7: Touch-activated running controls & playback speed
  const [isRunAuxRevealed, setIsRunAuxRevealed] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [lastPlayedBellCode, setLastPlayedBellCode] = useState<string | null>(null);
  const [canJumpPrevBell, setCanJumpPrevBell] = useState<boolean>(false);
  const [canJumpNextBell, setCanJumpNextBell] = useState<boolean>(false);
  const canJumpPrevBellRef = useRef<boolean>(false);
  const canJumpNextBellRef = useRef<boolean>(false);
  const runAuxHideTimerRef = useRef<number | null>(null);
  const pwaInstall = usePWAInstall();

  // Keep Screen Awake & Clock Background Blur Animation Options
  const [keepScreenAwake, setKeepScreenAwake] = useState<boolean>(() =>
    initialStored ? initialStored.keepScreenAwake : true
  );
  const [mainBellGlowAnim, setMainBellGlowAnim] = useState<boolean>(() =>
    initialStored ? initialStored.mainBellGlowAnim : true
  );
  const [prelimBellGlowAnim, setPrelimBellGlowAnim] = useState<boolean>(() =>
    initialStored ? initialStored.prelimBellGlowAnim : true
  );
  const [timetableOpacity, setTimetableOpacity] = useState<number>(() =>
    initialStored && typeof initialStored.timetableOpacity === 'number'
      ? initialStored.timetableOpacity
      : 82
  );
  const [openCustomPopup, setOpenCustomPopup] = useState<string | null>(null);
  const [customTimeDraftText, setCustomTimeDraftText] = useState<string>('');
  const [popupHourDraft, setPopupHourDraft] = useState<string>('10');
  const [popupMinDraft, setPopupMinDraft] = useState<string>('25');
  const [popupTimeError, setPopupTimeError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    return Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
  });

  // Interactive long-press clock hand rotation drag state
  const [grabbedHand, setGrabbedHand] = useState<'hour' | 'min' | 'sec' | null>(null);
  const handDragRef = useRef<{
    pointerId: number | null;
    hand: 'hour' | 'min' | 'sec' | null;
    startX: number;
    startY: number;
    latestX: number;
    latestY: number;
    isActivated: boolean;
    prevAngleDeg: number;
    holdTimer: number | null;
  }>({
    pointerId: null,
    hand: null,
    startX: 0,
    startY: 0,
    latestX: 0,
    latestY: 0,
    isActivated: false,
    prevAngleDeg: 0,
    holdTimer: null,
  });

  // B8: Scheduled Start
  const [scheduleTimeInput, setScheduleTimeInput] = useState<string>('08:25:00');
  const [scheduledTargetMs, setScheduledTargetMs] = useState<number | null>(null);
  const [scheduleRemainSec, setScheduleRemainSec] = useState<number>(0);

  // C4: Bookmark & Folder management states
  const [bookmarkNameInput, setBookmarkNameInput] = useState<string>('');
  const [isDrawerBookmarkInputOpen, setIsDrawerBookmarkInputOpen] = useState<boolean>(false);
  const [isDrawerFolderInputOpen, setIsDrawerFolderInputOpen] = useState<boolean>(false);
  const [isModalFolderInputOpen, setIsModalFolderInputOpen] = useState<boolean>(false);
  const [folderNameInput, setFolderNameInput] = useState<string>('');
  const [activeBookmarkFolderFilter, setActiveBookmarkFolderFilter] = useState<string>('all');
  const [saveTargetFolderId, setSaveTargetFolderId] = useState<string>('');
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editingFolderName, setEditingFolderName] = useState<string>('');
  const [movingBookmarkId, setMovingBookmarkId] = useState<string | null>(null);
  const [collapsedBookmarkFolders, setCollapsedBookmarkFolders] = useState<Record<string, boolean>>({});
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editingBookmarkName, setEditingBookmarkName] = useState<string>('');
  const [deletedBookmarkUndo, setDeletedBookmarkUndo] = useState<{
    bookmark: SavedSequenceBookmark;
    index: number;
  } | null>(null);
  const undoDeleteTimerRef = useRef<number | null>(null);
  const [duplicateNamePrompt, setDuplicateNamePrompt] = useState<{
    name: string;
    existingId: string;
    sourceConfig: CustomSequenceConfig;
    sourceSync: ClockSyncMode;
    sourceFolderId: string | null;
  } | null>(null);

  // B1: Dedicated Preview Player state
  const [previewState, setPreviewState] = useState<{
    code: string | null;
    playing: boolean;
    currentTime: number;
    duration: number;
  }>({
    code: null,
    playing: false,
    currentTime: 0,
    duration: 0,
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string>(() =>
    initialStored ? initialStored.presetId : CSAT_SESSION_PRESETS[0].id
  );
  const [customPreset, setCustomPreset] = useState<CsatSessionPreset | null>(() => {
    if (initialStored && initialStored.presetId === 'custom_checkbox_sequence') {
      return buildCustomSequencePreset(initialStored.customSequenceConfig);
    }
    return null;
  });

  const [isRunningUi, setIsRunningUi] = useState<boolean>(false);
  const [pauseLabel, setPauseLabel] = useState<'PAUSE' | 'RESUME' | 'DONE'>('PAUSE');
  const [englishFileName, setEnglishFileName] = useState<string>('');
  const [activeRowId, setActiveRowId] = useState<string>(CSAT_SESSION_PRESETS[0].steps[0].id);

  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState<boolean>(false);
  const [isRunningSaveConfirmOpen, setIsRunningSaveConfirmOpen] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [devMode, setDevMode] = useState<boolean>(() =>
    initialStored ? initialStored.devMode : false
  );
  const [embeddedBellCount, setEmbeddedBellCount] = useState<number>(
    () => Object.keys(CUSTOM_37_BELL_MP3_DATA_URIS).length
  );
  const [isExportingHtml, setIsExportingHtml] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Refs for latest state access in callbacks
  const themePrefRef = useRef<ThemePreference>(themePref);
  themePrefRef.current = themePref;

  const clockSyncModeRef = useRef<ClockSyncMode>(clockSyncMode);
  clockSyncModeRef.current = clockSyncMode;

  const customSequenceConfigRef = useRef<CustomSequenceConfig>(customSequenceConfig);
  customSequenceConfigRef.current = customSequenceConfig;

  const bookmarkFoldersRef = useRef<BookmarkFolder[]>(bookmarkFolders);
  bookmarkFoldersRef.current = bookmarkFolders;

  const bookmarksRef = useRef<SavedSequenceBookmark[]>(bookmarks);
  bookmarksRef.current = bookmarks;

  const bellVolumeRef = useRef<number>(bellVolume);
  bellVolumeRef.current = bellVolume;

  const englishVolumeRef = useRef<number>(englishVolume);
  englishVolumeRef.current = englishVolume;

  const playbackSpeedRef = useRef<PlaybackSpeed>(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const isTimetablePanelOpenRef = useRef<boolean>(isTimetablePanelOpen);
  isTimetablePanelOpenRef.current = isTimetablePanelOpen;

  const keepScreenAwakeRef = useRef<boolean>(keepScreenAwake);
  keepScreenAwakeRef.current = keepScreenAwake;

  const mainBellGlowAnimRef = useRef<boolean>(mainBellGlowAnim);
  mainBellGlowAnimRef.current = mainBellGlowAnim;

  const prelimBellGlowAnimRef = useRef<boolean>(prelimBellGlowAnim);
  prelimBellGlowAnimRef.current = prelimBellGlowAnim;

  const timetableOpacityRef = useRef<number>(timetableOpacity);
  timetableOpacityRef.current = timetableOpacity;

  const activeRowIdRef = useRef<string>(activeRowId);
  activeRowIdRef.current = activeRowId;

  const activeCustomNodeIdRef = useRef<string | null>(activeCustomNodeId);
  activeCustomNodeIdRef.current = activeCustomNodeId;

  const wakeLockSentinelRef = useRef<{
    released?: boolean;
    release: () => Promise<void>;
    addEventListener?: (type: 'release', listener: () => void) => void;
    removeEventListener?: (type: 'release', listener: () => void) => void;
  } | null>(null);
  const wakeLockVideoRef = useRef<HTMLVideoElement | null>(null);
  const wakeLockPendingRef = useRef<Promise<void> | null>(null);
  const wakeLockReacquireTimerRef = useRef<number | null>(null);
  const wakeLockIntentionalReleaseRef = useRef<boolean>(false);
  const wakeLockNativeBlockedRef = useRef<boolean>(false);
  const wakeVideoProgressMsRef = useRef<number>(0);
  const wakeVideoAssetRef = useRef<{ url: string; isBlob: boolean } | null>(null);
  const wakeVideoCanvasCleanupRef = useRef<(() => void) | null>(null);

  // Mutable Animation & Timer Engine Ref
  const engineRef = useRef({
    phase: 'idle' as 'idle' | 'rise' | 'hold' | 'drop',
    isPaused: false,
    t0: 0,
    H: 0,
    kT: 0,
    kH: 0,
    kX: 0,
    dH: 1,
    dT: 1,
    dHnd: 1,
    dX: 1,
    W: window.innerWidth,
    Hh: window.innerHeight,
    R: 250,
    cx: window.innerWidth / 2,
    cy: window.innerHeight * 0.5,
    dockY: 0,
    targetR: 250,
    targetCx: window.innerWidth / 2,
    targetCy: window.innerHeight * 0.5,
    targetDockY: 0,
    fromR: 250,
    fromCx: window.innerWidth / 2,
    fromCy: window.innerHeight * 0.5,
    fromDockY: 0,
    layoutAnimStart: 0,
    layoutAnimating: false,
    layoutRafId: 0,
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    gl: null as WebGLRenderingContext | null,
    uniforms: {} as Record<string, WebGLUniformLocation | null>,
    rafId: 0,
    preset:
      (selectedPresetId === 'custom_checkbox_sequence' && customPreset) ||
      CSAT_SESSION_PRESETS.find((p) => p.id === selectedPresetId) ||
      CSAT_SESSION_PRESETS[0],
    accumulatedElapsedMs: 0,
    lastTickPerf: 0,
    triggeredCues: new Set<string>(),
    resolvedTheme: computeResolvedTheme(themePref),
    themeUB: computeResolvedTheme(themePref) === 'dark' ? 0.0 : 1.0,
    themeUS: computeResolvedTheme(themePref) === 'sepia' ? 1.0 : 0.0,
    fromUB: computeResolvedTheme(themePref) === 'dark' ? 0.0 : 1.0,
    fromUS: computeResolvedTheme(themePref) === 'sepia' ? 1.0 : 0.0,
    targetUB: computeResolvedTheme(themePref) === 'dark' ? 0.0 : 1.0,
    targetUS: computeResolvedTheme(themePref) === 'sepia' ? 1.0 : 0.0,
    themeAnimStart: 0,
    themeAnimating: false,
    themeRafId: 0,
    currentGlowBoost: 0,
    glowReleaseStartPerf: 0,
    glowReleaseFromBoost: 0,
    clockSyncMode: clockSyncMode,
  });

  // Audio Controllers Ref (Separated Bell Audio, Preview Audio & English Listening Audio)
  const audioRef = useRef<{
    bellMap: Partial<Record<Exclude<BellType, 'none'>, HTMLAudioElement>>;
    activeBell: HTMLAudioElement | null;
    bellPausedByTimer: boolean;
    speedFadeTimer: number | null;
    previewAudio: HTMLAudioElement | null;
    previewCode: string | null;
    englishAudio: HTMLAudioElement | null;
    englishObjectUrl: string | null;
    englishFileName: string;
    englishPlaying: boolean;
  }>({
    bellMap: {},
    activeBell: null,
    bellPausedByTimer: false,
    speedFadeTimer: null,
    previewAudio: null,
    previewCode: null,
    englishAudio: null,
    englishObjectUrl: null,
    englishFileName: '',
    englishPlaying: false,
  });

  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string, durationMs = 3200) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, durationMs);
  }, []);

  const ensureWakeVideoSource = useCallback((videoEl: HTMLVideoElement) => {
    if (videoEl.srcObject) return;
    if (!wakeVideoAssetRef.current) {
      wakeVideoAssetRef.current = createKeepAwakeVideoUrl();
    }
    const targetUrl = wakeVideoAssetRef.current.url || KEEP_AWAKE_MP4_DATA_URI;
    if (!videoEl.getAttribute('src')) {
      videoEl.src = targetUrl;
    }
  }, []);

  const startWakeLockVideo = useCallback(() => {
    if (!keepScreenAwakeRef.current) return;
    const videoEl = wakeLockVideoRef.current as
      | (HTMLVideoElement & { disableRemotePlayback?: boolean })
      | null;
    if (!videoEl) return;
    try {
      ensureWakeVideoSource(videoEl);
      videoEl.muted = true;
      videoEl.defaultMuted = true;
      videoEl.loop = true;
      videoEl.playsInline = true;
      videoEl.disablePictureInPicture = true;
      videoEl.disableRemotePlayback = true;
      videoEl.classList.add('is-active');
      if (videoEl.paused || videoEl.ended) {
        if (videoEl.ended) {
          videoEl.currentTime = 0;
        }
        const playPromise = videoEl.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {});
        }
      }
    } catch {
      // Ignore playback errors before user gesture
    }
  }, [ensureWakeVideoSource]);

  const stopWakeLockVideo = useCallback(() => {
    const videoEl = wakeLockVideoRef.current;
    if (!videoEl) return;
    try {
      videoEl.pause();
      if (videoEl.currentTime > 0) {
        videoEl.currentTime = 0;
      }
    } catch {
      // Ignore pause errors
    }
    videoEl.classList.remove('is-active');
  }, []);

  // B9: Screen Wake Lock helper (Simultaneous Native WakeLock API + VideoWakeLock fallback across all mobile/tablet/desktop browsers)
  const requestWakeLock = useCallback(async () => {
    if (!keepScreenAwakeRef.current) return;
    if (wakeLockReacquireTimerRef.current !== null) {
      window.clearTimeout(wakeLockReacquireTimerRef.current);
      wakeLockReacquireTimerRef.current = null;
    }
    wakeLockIntentionalReleaseRef.current = false;

    // Always run the silent VideoWakeLock fallback alongside native WakeLock so desktop-UA tablets and mobile browsers never sleep
    startWakeLockVideo();

    const currentSentinel = wakeLockSentinelRef.current;
    const hasActiveNativeLock = Boolean(currentSentinel && !currentSentinel.released);

    if (document.hidden || hasActiveNativeLock) return;
    if (wakeLockPendingRef.current) return wakeLockPendingRef.current;

    const nav = navigator as Navigator & {
      wakeLock?: {
        request: (type: 'screen') => Promise<{
          released?: boolean;
          release: () => Promise<void>;
          addEventListener?: (type: 'release', listener: () => void) => void;
        }>;
      };
    };

    if (!nav.wakeLock || typeof nav.wakeLock.request !== 'function') {
      wakeLockNativeBlockedRef.current = true;
      startWakeLockVideo();
      return;
    }

    const reqPromise = (async () => {
      try {
        const sentinel = await nav.wakeLock!.request('screen');
        if (!keepScreenAwakeRef.current || document.hidden || wakeLockIntentionalReleaseRef.current) {
          await sentinel.release().catch(() => {});
          return;
        }
        wakeLockNativeBlockedRef.current = false;
        wakeLockSentinelRef.current = sentinel;
        sentinel.addEventListener?.('release', () => {
          if (wakeLockSentinelRef.current === sentinel) {
            wakeLockSentinelRef.current = null;
          }
          if (!wakeLockIntentionalReleaseRef.current && keepScreenAwakeRef.current && !document.hidden) {
            startWakeLockVideo();
            if (wakeLockReacquireTimerRef.current !== null) {
              window.clearTimeout(wakeLockReacquireTimerRef.current);
            }
            wakeLockReacquireTimerRef.current = window.setTimeout(() => {
              wakeLockReacquireTimerRef.current = null;
              requestWakeLock();
            }, 180);
          }
        });
      } catch {
        wakeLockNativeBlockedRef.current = true;
        startWakeLockVideo();
      } finally {
        wakeLockPendingRef.current = null;
      }
    })();

    wakeLockPendingRef.current = reqPromise;
    return reqPromise;
  }, [startWakeLockVideo]);

  const releaseWakeLock = useCallback(async () => {
    wakeLockIntentionalReleaseRef.current = true;
    if (wakeLockReacquireTimerRef.current !== null) {
      window.clearTimeout(wakeLockReacquireTimerRef.current);
      wakeLockReacquireTimerRef.current = null;
    }
    stopWakeLockVideo();
    try {
      const sentinel = wakeLockSentinelRef.current;
      wakeLockSentinelRef.current = null;
      if (sentinel && !sentinel.released) {
        await sentinel.release();
      }
    } catch {
      wakeLockSentinelRef.current = null;
    }
  }, [stopWakeLockVideo]);

  useEffect(() => {
    if (keepScreenAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }
  }, [keepScreenAwake, releaseWakeLock, requestWakeLock]);

  useEffect(() => {
    const syncFullscreen = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null };
      setIsFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', syncFullscreen);
    document.addEventListener('webkitfullscreenchange', syncFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', syncFullscreen);
      document.removeEventListener('webkitfullscreenchange', syncFullscreen);
    };
  }, []);

  const drawScene = useCallback(() => {
    const st = engineRef.current;
    if (tkRef.current) tkRef.current.style.opacity = String(st.kT);
    if (hdRef.current) hdRef.current.style.opacity = String(st.kH);
    if (titleRef.current) titleRef.current.style.opacity = String(st.kX);
    if (labRef.current) labRef.current.style.opacity = String(st.kX);

    const gl = st.gl;
    const cv = canvasRef.current;
    if (!gl || !cv) return;
    const U = st.uniforms;
    gl.uniform2f(U.uRes, cv.width, cv.height);
    gl.uniform2f(U.uC, st.cx * st.dpr, (st.Hh - st.cy) * st.dpr);
    gl.uniform1f(U.uR, st.R * st.dpr);
    gl.uniform1f(U.uH, st.H);
    gl.uniform1f(U.uB, st.themeUB);
    gl.uniform1f(U.uS, st.themeUS);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    const rootEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    const currentlyFullscreen = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
    drawScene();
    try {
      if (currentlyFullscreen) {
        if (typeof doc.exitFullscreen === 'function') {
          await doc.exitFullscreen();
        } else if (typeof doc.webkitExitFullscreen === 'function') {
          await doc.webkitExitFullscreen();
        }
      } else {
        if (typeof rootEl.requestFullscreen === 'function') {
          await rootEl.requestFullscreen();
        } else if (typeof rootEl.webkitRequestFullscreen === 'function') {
          await rootEl.webkitRequestFullscreen();
        } else {
          showToast('현재 브라우저에서는 전체 화면 API를 지원하지 않습니다.', 2600);
        }
      }
    } catch {
      showToast('현재 환경에서는 전체 화면 전환이 제한되어 있습니다.', 2600);
    }
  }, [drawScene, showToast]);

  const enterFullscreenSilently = useCallback(() => {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    const rootEl = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    };
    if (doc.fullscreenElement || doc.webkitFullscreenElement) return;
    drawScene();
    try {
      if (typeof rootEl.requestFullscreen === 'function') {
        const res = rootEl.requestFullscreen();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      } else if (typeof rootEl.webkitRequestFullscreen === 'function') {
        const res = rootEl.webkitRequestFullscreen();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      }
    } catch {
      // Ignore fullscreen restriction errors (e.g., scheduled start without gesture)
    }
  }, [drawScene]);

  const exitFullscreenSilently = useCallback(() => {
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    if (!doc.fullscreenElement && !doc.webkitFullscreenElement) return;
    drawScene();
    try {
      if (typeof doc.exitFullscreen === 'function') {
        const res = doc.exitFullscreen();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      } else if (typeof doc.webkitExitFullscreen === 'function') {
        const res = doc.webkitExitFullscreen();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      }
    } catch {
      // Ignore fullscreen exit errors
    }
  }, [drawScene]);

  // B6: Reset 3s auto-hide timer on running controls touch layer
  const revealRunAuxControls = useCallback(() => {
    setIsRunAuxRevealed(true);
    if (runAuxHideTimerRef.current) {
      window.clearTimeout(runAuxHideTimerRef.current);
    }
    runAuxHideTimerRef.current = window.setTimeout(() => {
      setIsRunAuxRevealed(false);
    }, 3000);
  }, []);

  const resolveAndApplyTheme = useCallback(
    (pref: ThemePreference) => {
      const normalizedPref: ThemePreference = VALID_THEME_PREFS.includes(pref) ? pref : 'auto';
      const resolved = computeResolvedTheme(normalizedPref);
      themePrefRef.current = normalizedPref;
      const st = engineRef.current;
      st.resolvedTheme = resolved;
      document.documentElement.setAttribute('data-theme', resolved);
      syncFaviconWithTheme(resolved);

      const nextUB = resolved === 'dark' ? 0.0 : 1.0;
      const nextUS = resolved === 'sepia' ? 1.0 : 0.0;
      if (Math.abs(st.themeUB - nextUB) < 0.001 && Math.abs(st.themeUS - nextUS) < 0.001) {
        st.themeUB = nextUB;
        st.themeUS = nextUS;
        drawScene();
        return;
      }

      if (st.themeRafId) {
        cancelAnimationFrame(st.themeRafId);
      }
      st.fromUB = st.themeUB;
      st.fromUS = st.themeUS;
      st.targetUB = nextUB;
      st.targetUS = nextUS;
      st.themeAnimStart = performance.now();
      st.themeAnimating = true;
      const THEME_DUR = 380;

      const stepTheme = (now: number) => {
        const p = clamp((now - st.themeAnimStart) / THEME_DUR, 0, 1);
        const e = easeSine(p);
        st.themeUB = st.fromUB + (st.targetUB - st.fromUB) * e;
        st.themeUS = st.fromUS + (st.targetUS - st.fromUS) * e;
        drawScene();
        if (p < 1) {
          st.themeRafId = requestAnimationFrame(stepTheme);
        } else {
          st.themeUB = st.targetUB;
          st.themeUS = st.targetUS;
          st.themeAnimating = false;
          st.themeRafId = 0;
          drawScene();
        }
      };
      st.themeRafId = requestAnimationFrame(stepTheme);
    },
    [drawScene]
  );

  const saveCustomSettingsToStorage = useCallback(
    (
      nextThemePref: ThemePreference = themePrefRef.current,
      nextPresetId: string = selectedPresetId,
      nextDevMode: boolean = devMode,
      nextSyncMode: ClockSyncMode = clockSyncModeRef.current,
      nextSeqConfig: CustomSequenceConfig = customSequenceConfigRef.current,
      nextBookmarks: SavedSequenceBookmark[] = bookmarksRef.current,
      nextBellVol: number = bellVolumeRef.current,
      nextEngVol: number = englishVolumeRef.current,
      nextKeepAwake: boolean = keepScreenAwakeRef.current,
      nextMainGlow: boolean = mainBellGlowAnimRef.current,
      nextPrelimGlow: boolean = prelimBellGlowAnimRef.current,
      nextTtOpacity: number = timetableOpacityRef.current,
      nextBookmarkFolders: BookmarkFolder[] = bookmarkFoldersRef.current
    ) => {
      try {
        const validTheme: ThemePreference = VALID_THEME_PREFS.includes(nextThemePref)
          ? nextThemePref
          : 'auto';
        const validSync: ClockSyncMode = VALID_SYNC_MODES.includes(nextSyncMode)
          ? nextSyncMode
          : 'original_csat_time';
        const payload: StoredCustomSettings = {
          themePref: validTheme,
          presetId: nextPresetId,
          devMode: Boolean(nextDevMode),
          clockSyncMode: validSync,
          customSequenceConfig: nextSeqConfig,
          bookmarkFolders: nextBookmarkFolders,
          bookmarks: nextBookmarks,
          bellVolume: clamp(Math.round(nextBellVol), 0, 100),
          englishVolume: clamp(Math.round(nextEngVol), 0, 100),
          keepScreenAwake: Boolean(nextKeepAwake),
          mainBellGlowAnim: Boolean(nextMainGlow),
          prelimBellGlowAnim: Boolean(nextPrelimGlow),
          timetableOpacity: clamp(Math.round(nextTtOpacity), 45, 98),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore storage quota/permission errors
      }
    },
    [devMode, selectedPresetId]
  );

  // Sync timetable panel opacity CSS custom property
  useEffect(() => {
    const alpha = clamp(timetableOpacity / 100, 0.45, 0.98);
    document.documentElement.style.setProperty('--tt-panel-alpha', alpha.toFixed(2));
  }, [timetableOpacity]);

  // Close custom popovers on outside click
  useEffect(() => {
    if (!openCustomPopup) return;
    const handleOutsidePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.custom-select-wrap')) return;
      setOpenCustomPopup(null);
    };
    document.addEventListener('pointerdown', handleOutsidePointerDown, true);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown, true);
  }, [openCustomPopup]);

  // Auto-close expanded hamburger menu when touching outside #topLeftMenu (with 44px grace buffer layer)
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideMenuPointerDown = (e: PointerEvent) => {
      if (isBuilderModalOpen || isModalOpen) return;
      const menuEl = topLeftMenuRef.current;
      if (!menuEl) return;
      const target = e.target as Node | null;
      if (target && menuEl.contains(target)) return;
      if ((e.target as HTMLElement | null)?.closest('.custom-select-popover, .custom-time-popover')) {
        return;
      }

      const GRACE_PX = 44;
      const interactiveZones = menuEl.querySelectorAll<HTMLElement>(
        '.top-left-bar, .ld-master-col, .ld-detail-col'
      );
      const cx = e.clientX;
      const cy = e.clientY;
      for (let i = 0; i < interactiveZones.length; i++) {
        const rect = interactiveZones[i].getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) continue;
        if (
          cx >= rect.left - GRACE_PX &&
          cx <= rect.right + GRACE_PX &&
          cy >= rect.top - GRACE_PX &&
          cy <= rect.bottom + GRACE_PX
        ) {
          return;
        }
      }

      setIsMenuOpen(false);
      setActiveMenuCategory(null);
      setIsBookmarkCardOpen(false);
      setOpenCustomPopup(null);
    };

    document.addEventListener('pointerdown', handleOutsideMenuPointerDown, true);
    return () => document.removeEventListener('pointerdown', handleOutsideMenuPointerDown, true);
  }, [isBuilderModalOpen, isMenuOpen, isModalOpen]);

  // Sync audio volumes when slider changes (B5)
  useEffect(() => {
    const bv = clamp(bellVolume / 100, 0, 1);
    if (audioRef.current.activeBell) {
      audioRef.current.activeBell.volume = bv;
    }
    if (audioRef.current.previewAudio) {
      audioRef.current.previewAudio.volume = bv;
    }
    Object.values(audioRef.current.bellMap).forEach((a) => {
      if (a) a.volume = bv;
    });
  }, [bellVolume]);

  useEffect(() => {
    const ev = clamp(englishVolume / 100, 0, 1);
    if (audioRef.current.englishAudio) {
      audioRef.current.englishAudio.volume = ev;
    }
  }, [englishVolume]);

  // Initialize Embedded Base64 Bell Audio & English Audio Element
  useEffect(() => {
    const uris = getEmbeddedBellDataUris();
    const bellMap: Partial<Record<Exclude<BellType, 'none'>, HTMLAudioElement>> = {};
    (Object.keys(uris) as Exclude<BellType, 'none'>[]).forEach((key) => {
      const a = new Audio(uris[key]);
      a.preload = 'auto';
      a.volume = clamp(bellVolumeRef.current / 100, 0, 1);
      bellMap[key] = a;
    });
    audioRef.current.bellMap = bellMap;

    const engAudio = new Audio();
    engAudio.preload = 'auto';
    engAudio.volume = clamp(englishVolumeRef.current / 100, 0, 1);
    audioRef.current.englishAudio = engAudio;

    let cancelled = false;
    loadAll37BellMp3DataUris()
      .then((mp3Map) => {
        if (!cancelled) {
          setEmbeddedBellCount(Object.keys(mp3Map).length);
        }
      })
      .catch(() => {});

    if (initialLoadRef.current && initialLoadRef.current.correctedCount > 0) {
      showToast(
        `저장된 설정 중 유효하지 않은 항목 ${initialLoadRef.current.correctedCount}건을 기본값으로 보정했습니다.`,
        3500
      );
    }

    return () => {
      cancelled = true;
      if (audioRef.current.activeBell) {
        audioRef.current.activeBell.pause();
      }
      if (audioRef.current.previewAudio) {
        audioRef.current.previewAudio.pause();
      }
      if (audioRef.current.englishAudio) {
        audioRef.current.englishAudio.pause();
      }
      if (audioRef.current.englishObjectUrl) {
        URL.revokeObjectURL(audioRef.current.englishObjectUrl);
      }
    };
  }, [showToast]);

  // B1: Stop preview player
  const stopPreviewBell = useCallback(() => {
    const p = audioRef.current.previewAudio;
    if (p) {
      p.pause();
      p.currentTime = 0;
      audioRef.current.previewAudio = null;
    }
    audioRef.current.previewCode = null;
    setPreviewState({
      code: null,
      playing: false,
      currentTime: 0,
      duration: 0,
    });
  }, []);

  // B1: Toggle preview player (dedicated instance separate from timer's bellPlayer)
  const togglePreviewBell = useCallback(
    (cueItem: CsatBellCueItem) => {
      if (audioRef.current.previewCode === cueItem.code && audioRef.current.previewAudio) {
        stopPreviewBell();
        return;
      }
      stopPreviewBell();

      const cachedDataUri = CUSTOM_37_BELL_MP3_DATA_URIS[cueItem.code];
      const mp3Url = cachedDataUri || getBellFileUrl(cueItem);
      const previewAudio = new Audio(mp3Url);
      previewAudio.volume = clamp(bellVolumeRef.current / 100, 0, 1);
      audioRef.current.previewAudio = previewAudio;
      audioRef.current.previewCode = cueItem.code;

      const expectedDur = cueItem.durationSec || BELL_DURATION_SEC_MAP[cueItem.code] || 15;
      setPreviewState({
        code: cueItem.code,
        playing: true,
        currentTime: 0,
        duration: expectedDur,
      });

      previewAudio.ontimeupdate = () => {
        if (audioRef.current.previewAudio !== previewAudio) return;
        setPreviewState({
          code: cueItem.code,
          playing: !previewAudio.paused,
          currentTime: previewAudio.currentTime || 0,
          duration:
            previewAudio.duration && Number.isFinite(previewAudio.duration)
              ? previewAudio.duration
              : expectedDur,
        });
      };

      previewAudio.onended = () => {
        if (audioRef.current.previewAudio === previewAudio) {
          stopPreviewBell();
        }
      };

      previewAudio.onerror = () => {
        if (audioRef.current.previewAudio !== previewAudio) return;
        const fallback = audioRef.current.bellMap[cueItem.fallbackBellType];
        if (!fallback) {
          stopPreviewBell();
          return;
        }
        const fbClone = new Audio(fallback.src);
        fbClone.volume = clamp(bellVolumeRef.current / 100, 0, 1);
        audioRef.current.previewAudio = fbClone;
        fbClone.onended = () => stopPreviewBell();
        fbClone.play().catch(() => stopPreviewBell());
      };

      previewAudio.play().catch(() => {
        previewAudio.onerror?.(new Event('error'));
      });
    },
    [stopPreviewBell]
  );

  const stopBell = useCallback(() => {
    if (audioRef.current.speedFadeTimer) {
      window.clearTimeout(audioRef.current.speedFadeTimer);
      audioRef.current.speedFadeTimer = null;
    }
    const a = audioRef.current.activeBell;
    if (a) {
      a.pause();
      a.currentTime = 0;
      audioRef.current.activeBell = null;
    }
    audioRef.current.bellPausedByTimer = false;
  }, []);

  const playBellCueItem = useCallback(
    (cueItem: CsatBellCueItem, options?: { isMuted?: boolean; speedMode?: PlaybackSpeed }) => {
      stopBell();
      setLastPlayedBellCode(cueItem.code);

      if (options?.isMuted) {
        showToast(`[${cueItem.code}] ${cueItem.title} (무음)`, 2600);
        return;
      }

      const cachedDataUri = CUSTOM_37_BELL_MP3_DATA_URIS[cueItem.code];
      const mp3Url = cachedDataUri || getBellFileUrl(cueItem);
      const mp3Audio = new Audio(mp3Url);
      mp3Audio.volume = clamp(bellVolumeRef.current / 100, 0, 1);
      audioRef.current.activeBell = mp3Audio;
      audioRef.current.bellPausedByTimer = false;

      const fallbackToEmbedded = () => {
        if (audioRef.current.activeBell !== mp3Audio) return;
        const fallback = audioRef.current.bellMap[cueItem.fallbackBellType];
        if (!fallback) return;
        fallback.volume = clamp(bellVolumeRef.current / 100, 0, 1);
        audioRef.current.activeBell = fallback;
        fallback.currentTime = 0;
        const p2 = fallback.play();
        if (p2 && typeof p2.catch === 'function') p2.catch(() => {});
      };

      mp3Audio.onerror = fallbackToEmbedded;
      const p = mp3Audio.play();
      if (p && typeof p.catch === 'function') {
        p.catch(fallbackToEmbedded);
      }

      const spd = options?.speedMode ?? playbackSpeedRef.current;
      if (spd > 1) {
        showToast(`[×${spd} 배속] [${cueItem.code}] ${cueItem.title} 타종 확인 (2초 재생)`, 2200);
        audioRef.current.speedFadeTimer = window.setTimeout(() => {
          if (audioRef.current.activeBell === mp3Audio) {
            mp3Audio.pause();
            mp3Audio.currentTime = 0;
            audioRef.current.activeBell = null;
          }
        }, 2000);
      } else {
        showToast(`[${cueItem.code}] ${cueItem.title} (${cueItem.timeText}) 타종 재생`, 2800);
      }
    },
    [stopBell, showToast]
  );

  const pauseBell = useCallback(() => {
    const a = audioRef.current.activeBell;
    if (a && !a.paused && !a.ended) {
      a.pause();
      audioRef.current.bellPausedByTimer = true;
    }
  }, []);

  const resumeBell = useCallback(() => {
    const a = audioRef.current.activeBell;
    if (a && audioRef.current.bellPausedByTimer) {
      audioRef.current.bellPausedByTimer = false;
      const p = a.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    }
  }, []);

  const stopEnglishAudio = useCallback(() => {
    const eng = audioRef.current.englishAudio;
    if (eng) {
      eng.pause();
      eng.currentTime = 0;
    }
    audioRef.current.englishPlaying = false;
  }, []);

  const startEnglishAudioIfNeeded = useCallback(
    (triggerTimeLabel = '13:07', seekOffsetSec = 0) => {
      const mutedSet = new Set(customSequenceConfigRef.current.mutedNodeIds || []);
      if (mutedSet.has('ENG_1307')) {
        showToast(`[${triggerTimeLabel}] 3교시 영어 듣기평가 (무음 설정됨)`, 2800);
        return;
      }
      if (playbackSpeedRef.current > 1) {
        showToast(
          `[×${playbackSpeedRef.current} 배속] [${triggerTimeLabel}] 영어 듣기평가 트리거 확인 (배속 중 재생 생략)`,
          2600
        );
        return;
      }
      if (!audioRef.current.englishObjectUrl || !audioRef.current.englishAudio) {
        showToast(
          `[${triggerTimeLabel}] 선택된 영어 듣기평가 음원이 없습니다. 좌측 상단 메뉴에서 음원 파일을 선택해 주세요.`,
          4000
        );
        return;
      }
      const eng = audioRef.current.englishAudio;
      eng.muted = false;
      eng.volume = clamp(englishVolumeRef.current / 100, 0, 1);
      audioRef.current.englishPlaying = true;
      try {
        eng.currentTime = Math.max(0, seekOffsetSec);
      } catch {
        eng.currentTime = 0;
      }
      const p = eng.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          showToast(
            `[${triggerTimeLabel}] 영어 듣기평가 음원 재생 시작: ${audioRef.current.englishFileName}`,
            3400
          );
        }).catch(() => {
          audioRef.current.englishPlaying = false;
          showToast(
            '영어 듣기평가 음원을 재생할 수 없습니다. 오디오 파일 형식을 확인해 주세요.',
            4000
          );
        });
      }
    },
    [showToast]
  );

  const pauseEnglishAudio = useCallback(() => {
    const eng = audioRef.current.englishAudio;
    if (audioRef.current.englishPlaying && eng && !eng.paused) {
      eng.pause();
    }
  }, []);

  const resumeEnglishAudio = useCallback(() => {
    const eng = audioRef.current.englishAudio;
    if (audioRef.current.englishPlaying && eng && eng.paused && !eng.ended) {
      const p = eng.play();
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    }
  }, []);

  const updateClockHandsForMinutes = useCallback((exactMinutes: number) => {
    const mins = ((exactMinutes % 720) + 720) % 720;
    const minInHour = mins % 60;
    const mAngleRad = (minInHour * 6 * Math.PI) / 180;
    const hx = 88 * Math.sin(mAngleRad);
    const hy = -88 * Math.cos(mAngleRad);

    if (minHandRef.current) {
      minHandRef.current.setAttribute('x2', hx.toFixed(2));
      minHandRef.current.setAttribute('y2', hy.toFixed(2));
    }
    if (minHandHitRef.current) {
      const hx1 = 10 * Math.sin(mAngleRad);
      const hy1 = -10 * Math.cos(mAngleRad);
      minHandHitRef.current.setAttribute('x1', hx1.toFixed(2));
      minHandHitRef.current.setAttribute('y1', hy1.toFixed(2));
      minHandHitRef.current.setAttribute('x2', hx.toFixed(2));
      minHandHitRef.current.setAttribute('y2', hy.toFixed(2));
    }
    if (hourHandRef.current) {
      const baseHourDeg = (mins / 60) * 30 - 90 + 7.5;
      hourHandRef.current.setAttribute('transform', `rotate(${baseHourDeg.toFixed(2)})`);
    }
    if (secHandRef.current) {
      const secInMin = (((exactMinutes * 60) % 60) + 60) % 60;
      const secDeg = secInMin * 6;
      secHandRef.current.setAttribute('transform', `rotate(${secDeg.toFixed(3)})`);
    }
  }, []);

  const applyClockGlowBoost = useCallback((boost: number) => {
    engineRef.current.currentGlowBoost = boost;
    const grp = clockGlowBoostRef.current;
    if (grp) {
      if (Math.abs(boost) < 0.0005) {
        grp.style.transform = 'scale(1)';
        grp.style.filter = 'none';
      } else {
        const scale = (1 + boost * 0.36).toFixed(4);
        const sat = Math.max(0.56, 1 + boost * 1.68).toFixed(3);
        const bri = Math.max(0.76, 1 + boost * 0.44).toFixed(3);
        const extraBlurPx = boost > 0.002 ? (boost * 14).toFixed(2) : '0';
        grp.style.transform = `scale(${scale})`;
        grp.style.filter =
          boost > 0.002
            ? `blur(${extraBlurPx}px) saturate(${sat}) brightness(${bri})`
            : `saturate(${sat}) brightness(${bri})`;
      }
    }
    if (faceRef.current) {
      const stops = faceRef.current.querySelectorAll<SVGStopElement>('stop[data-base-op]');
      const opMul = Math.max(0.32, 1 + boost * 1.75);
      stops.forEach((stEl) => {
        const baseOp = parseFloat(stEl.getAttribute('data-base-op') || '0');
        const nextOp = clamp(baseOp * opMul, 0, 0.99);
        stEl.setAttribute('stop-opacity', nextOp.toFixed(3));
      });
    }
  }, []);

  const syncActiveStepHighlight = useCallback(
    (preset: CsatSessionPreset, step: CsatTimetableRow, isAtPresetEnd = false) => {
      let resolvedNodeId: string | null = null;
      if (isAtPresetEnd && step.endNodeId) {
        resolvedNodeId = step.endNodeId;
      } else if (step.startNodeId) {
        resolvedNodeId = step.startNodeId;
      } else if (preset.isCustomSequence && step.id.startsWith('custom_seq_')) {
        const rest = step.id.replace(/^custom_seq_\d+_/, '');
        const matchedNode = (CSAT_SELECTABLE_CUE_NODES ?? []).find(
          (n) => rest === n.nodeId || rest.startsWith(`${n.nodeId}_`)
        );
        resolvedNodeId = matchedNode ? matchedNode.nodeId : null;
      } else {
        const matchedFull = CSAT_FULL_TIMETABLE.find((r) => r.id === step.id);
        resolvedNodeId = matchedFull?.startNodeId ?? null;
      }

      let resolvedRowId = step.id;
      if (preset.isCustomSequence && resolvedNodeId) {
        const matchedFullByStart = CSAT_FULL_TIMETABLE.find(
          (r) => r.startNodeId === resolvedNodeId
        );
        const matchedFullByEnd = CSAT_FULL_TIMETABLE.find(
          (r) => r.endNodeId === resolvedNodeId
        );
        if (matchedFullByStart) {
          resolvedRowId = matchedFullByStart.id;
        } else if (matchedFullByEnd) {
          resolvedRowId = matchedFullByEnd.id;
        }
      }

      if (activeRowIdRef.current !== resolvedRowId) {
        activeRowIdRef.current = resolvedRowId;
        setActiveRowId(resolvedRowId);
      }
      if (activeCustomNodeIdRef.current !== resolvedNodeId) {
        activeCustomNodeIdRef.current = resolvedNodeId;
        setActiveCustomNodeId(resolvedNodeId);
      }
    },
    []
  );

  // A1: Safe syncUiToPresetIdle
  const syncUiToPresetIdle = useCallback(
    (preset: CsatSessionPreset, syncMode: ClockSyncMode = clockSyncModeRef.current) => {
      const firstStep = preset.steps[0];
      if (!firstStep) return;
      const isCustomSeq = Boolean(preset.isCustomSequence);

      const matchedStartNode = firstStep.startNodeId
        ? CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === firstStep.startNodeId)
        : null;
      const firstCat = firstStep.category || '';
      const isFirstPrepare =
        matchedStartNode?.stageType === 'prepare' ||
        firstStep.bellAtStart === 'prepare' ||
        firstCat.startsWith('준비령') ||
        (firstCat.includes('준비령') && !firstCat.includes('→ 준비령'));
      const isFirstMainExam =
        !isFirstPrepare &&
        (matchedStartNode?.stageType === 'main' ||
          matchedStartNode?.stageType === 'listening' ||
          firstStep.bellAtStart === 'main' ||
          firstStep.bellAtStart === 'listening_intro' ||
          firstCat.startsWith('본령') ||
          firstCat.includes('듣기평가 안내방송 및 본령'));

      let examEndStep: CsatTimetableRow | null = null;
      let nextWarnLabel: string | null = null;
      if (isFirstMainExam && (preset.steps.length > 1 || isCustomSeq)) {
        for (let j = 1; j < preset.steps.length; j++) {
          const nxt = preset.steps[j];
          const nxtCat = nxt.category || '';
          const nxtNode = nxt.startNodeId
            ? CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === nxt.startNodeId)
            : null;
          const isSameGroup =
            nxt.displayTitle === firstStep.displayTitle ||
            (nxt.periodLabel !== '-' && nxt.periodLabel === firstStep.periodLabel);
          const isWarnFollow =
            nxtNode?.stageType === 'warn' ||
            nxt.bellAtStart === 'warn_10m' ||
            nxt.bellAtStart === 'warn_5m' ||
            nxtCat.startsWith('종료 10분 전') ||
            nxtCat.startsWith('종료 5분 전');
          if (isSameGroup && isWarnFollow) {
            examEndStep = nxt;
            if (!nextWarnLabel) {
              nextWarnLabel =
                nxtNode?.stageShortLabel || (nxtCat.split(' → ')[0] || '종료 10분 전');
            }
          } else {
            break;
          }
        }
      }

      const dispStartMin = isCustomSeq
        ? (firstStep.customStartMinutes ?? preset.startMinutes)
        : preset.startMinutes;

      const targetEndRow = examEndStep || firstStep;
      const dispEndMin = isCustomSeq
        ? (targetEndRow.customEndMinutes ?? preset.endMinutes)
        : examEndStep
          ? examEndStep.endMinutes
          : preset.endMinutes;

      const stepDurSec = examEndStep
        ? Math.max(0, (examEndStep.endMinutes - firstStep.startMinutes) * 60)
        : firstStep.durationSeconds ??
          (firstStep.durationMinutes ?? preset.endMinutes - preset.startMinutes) * 60;
      const idleRemainMs =
        isCustomSeq || examEndStep
          ? stepDurSec * 1000
          : (preset.endMinutes - preset.startMinutes) * 60 * 1000;

      if (titleRef.current) {
        titleRef.current.textContent = preset.displayTitle;
      }
      document.title = '2027학년도 대학수학능력시험 시험장 안내방송 · 수능 타종 · 수능 방송 · 수능 알림';
      if (startLabRef.current) {
        startLabRef.current.innerHTML = `START - TIME<br>${formatAmPmTime(dispStartMin)}`;
        startLabRef.current.style.opacity = '1';
      }
      if (endLabRef.current) {
        endLabRef.current.innerHTML = `END - TIME<br>${formatAmPmTime(dispEndMin)}`;
        endLabRef.current.style.opacity = '0.38';
      }
      if (remainDigitsRef.current) {
        remainDigitsRef.current.textContent = formatDurationClock(idleRemainMs);
      }
      if (stageBadgeRef.current) {
        const pPrefix = firstStep.periodLabel !== '-' ? `${firstStep.periodLabel} · ` : '';
        if (examEndStep && nextWarnLabel) {
          const mainStageTitle = firstCat.includes('듣기평가')
            ? '듣기평가 안내방송 및 본령'
            : '본령';
          stageBadgeRef.current.textContent = `${pPrefix}${mainStageTitle} 대기\n다음 방송: ${nextWarnLabel}`;
        } else if (firstCat.includes(' → ')) {
          const [curStage, nxtStage] = firstCat.split(' → ');
          stageBadgeRef.current.textContent = `${pPrefix}${curStage} 대기\n다음 방송: ${nxtStage}`;
        } else {
          stageBadgeRef.current.textContent = `${pPrefix}${firstCat} 대기`;
        }
      }
      syncActiveStepHighlight(preset, firstStep, false);
      engineRef.current.glowReleaseStartPerf = 0;
      engineRef.current.glowReleaseFromBoost = 0;
      applyClockGlowBoost(0);
      updateClockHandsForMinutes(dispStartMin);
    },
    [applyClockGlowBoost, syncActiveStepHighlight, updateClockHandsForMinutes]
  );

  // Component mount useEffect
  useEffect(() => {
    const stored = initialLoadRef.current?.settings ?? null;
    const initialThemePref: ThemePreference = stored ? stored.themePref : 'auto';
    const initialSyncMode: ClockSyncMode = 'custom_cascaded_time';
    const initialSeqConfig: CustomSequenceConfig = stored
      ? stored.customSequenceConfig
      : DEFAULT_CUSTOM_SEQUENCE_CONFIG;
    const initialPresetId: string = stored ? stored.presetId : CSAT_SESSION_PRESETS[0].id;
    const initialDevMode: boolean = stored ? stored.devMode : false;

    let matchedPreset: CsatSessionPreset = CSAT_SESSION_PRESETS[0];
    if (initialPresetId === 'custom_checkbox_sequence') {
      const built = buildCustomSequencePreset(initialSeqConfig);
      if (built) {
        matchedPreset = built;
        setCustomPreset(built);
      }
    } else {
      matchedPreset =
        CSAT_SESSION_PRESETS.find((p) => p.id === initialPresetId) || CSAT_SESSION_PRESETS[0];
    }

    engineRef.current.preset = matchedPreset;
    engineRef.current.clockSyncMode = initialSyncMode;
    resolveAndApplyTheme(initialThemePref);
    syncUiToPresetIdle(matchedPreset, initialSyncMode);

    saveCustomSettingsToStorage(
      initialThemePref,
      matchedPreset.id,
      initialDevMode,
      initialSyncMode,
      initialSeqConfig
    );

    if (!window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemColorSchemeChange = () => {
      if (themePrefRef.current === 'auto') {
        resolveAndApplyTheme('auto');
      }
    };

    if (mql.addEventListener) {
      mql.addEventListener('change', handleSystemColorSchemeChange);
      return () => mql.removeEventListener('change', handleSystemColorSchemeChange);
    }
  }, [resolveAndApplyTheme, saveCustomSettingsToStorage, syncUiToPresetIdle]);

  // A2, B5, B9, C7: Unified cue trigger with per-bell mute (on both custom & 18 presets) and late catch-up policy
  const checkAndTriggerCues = useCallback(
    (prevElapsedSec: number, currElapsedSec: number) => {
      const preset = engineRef.current.preset;
      const timeline = buildCueTimeline(preset);
      const mutedSet = new Set(customSequenceConfigRef.current.mutedNodeIds || []);
      const spd = playbackSpeedRef.current;

      for (const cue of timeline) {
        if (
          currElapsedSec >= cue.offsetSec &&
          prevElapsedSec <= cue.offsetSec &&
          !engineRef.current.triggeredCues.has(cue.key)
        ) {
          engineRef.current.triggeredCues.add(cue.key);
          const delaySec = currElapsedSec - cue.offsetSec;
          const isLate = spd === 1 && delaySec > LATE_GRACE_SEC;

          if (cue.stopsEnglishAudio) {
            stopEnglishAudio();
          }

          const isIntermediateWarn =
            cue.bellCode !== undefined &&
            ['006', '012', '017', '023', '027', '030', '036'].includes(cue.bellCode);
          if ((cue.bellCode || cue.triggersEnglishAudio) && !isIntermediateWarn) {
            if (cue.offsetSec > 0 && engineRef.current.currentGlowBoost > 0.005) {
              engineRef.current.glowReleaseStartPerf = performance.now();
              engineRef.current.glowReleaseFromBoost = engineRef.current.currentGlowBoost;
            }
          }

          if (cue.bellCode) {
            const bellItem = CSAT_37_BELL_FILES.find((b) => b.code === cue.bellCode);
            if (bellItem) {
              const isMuted =
                mutedSet.has(cue.bellCode) || (cue.nodeId ? mutedSet.has(cue.nodeId) : false);
              if (isLate) {
                showToast(
                  `놓친 타종: [${bellItem.code}] ${bellItem.title} (${Math.round(delaySec)}초 전)`,
                  3500
                );
              } else {
                playBellCueItem(bellItem, { isMuted, speedMode: spd });
              }
            }
          }

          if (cue.triggersEnglishAudio) {
            if (isLate) {
              startEnglishAudioIfNeeded(cue.label, delaySec);
            } else {
              startEnglishAudioIfNeeded(cue.label, 0);
            }
          }
        }
      }
    },
    [playBellCueItem, showToast, startEnglishAudioIfNeeded, stopEnglishAudio]
  );

  const updateRunningTimer = useCallback(
    (now: number) => {
      const st = engineRef.current;
      if (st.phase !== 'rise' && st.phase !== 'hold') return;

      const isHandDragging = handDragRef.current.isActivated;
      const prevElapsedMs = st.accumulatedElapsedMs;
      if (!st.isPaused && !isHandDragging) {
        const rawDt = Math.max(0, now - st.lastTickPerf);
        st.accumulatedElapsedMs += rawDt * playbackSpeedRef.current;
      }
      st.lastTickPerf = now;

      const preset = st.preset;
      const totalDurMs = (preset.endMinutes - preset.startMinutes) * 60 * 1000;
      const clampedElapsedMs = Math.min(totalDurMs, st.accumulatedElapsedMs);
      const remainingMs = Math.max(0, totalDurMs - clampedElapsedMs);

      const simMinutes = preset.startMinutes + clampedElapsedMs / 60000;

      let activeStepIdx = preset.steps.length - 1;
      let activeStep = preset.steps[activeStepIdx];
      for (let i = 0; i < preset.steps.length; i++) {
        const candidate = preset.steps[i];
        if (simMinutes >= candidate.startMinutes && simMinutes < candidate.endMinutes) {
          activeStep = candidate;
          activeStepIdx = i;
          break;
        }
      }

      let clockHandMinutes = simMinutes;
      let targetStageGlowBoost = 0;

      if (activeStep) {
        if (titleRef.current) {
          titleRef.current.textContent = activeStep.displayTitle;
        }

        // Stage-specific detection (본령, 준비령, 및 종료령까지 남은 시간 계산)
        const matchedStartNode = activeStep.startNodeId
          ? CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === activeStep.startNodeId)
          : null;
        const catText = activeStep.category || '';
        const isPrepareStage =
          matchedStartNode?.stageType === 'prepare' ||
          activeStep.bellAtStart === 'prepare' ||
          catText.startsWith('준비령') ||
          (catText.includes('준비령') && !catText.includes('→ 준비령'));
        const isMainExamStage =
          !isPrepareStage &&
          (matchedStartNode?.stageType === 'main' ||
            matchedStartNode?.stageType === 'listening' ||
            matchedStartNode?.stageType === 'warn' ||
            activeStep.bellAtStart === 'main' ||
            activeStep.bellAtStart === 'listening_intro' ||
            activeStep.bellAtStart === 'warn_10m' ||
            activeStep.bellAtStart === 'warn_5m' ||
            catText.startsWith('본령') ||
            catText.startsWith('종료 10분 전') ||
            catText.startsWith('종료 5분 전') ||
            catText.includes('듣기평가 안내방송 및 본령'));

        let examEndMinutes = activeStep.endMinutes;
        let examEndStep: CsatTimetableRow | null = null;
        let nextWarnLabel: string | null = null;

        if (isMainExamStage && (preset.steps.length > 1 || preset.isCustomSequence)) {
          for (let j = activeStepIdx + 1; j < preset.steps.length; j++) {
            const nxt = preset.steps[j];
            const nxtCat = nxt.category || '';
            const nxtNode = nxt.startNodeId
              ? CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === nxt.startNodeId)
              : null;
            const isSameGroup =
              nxt.displayTitle === activeStep.displayTitle ||
              (nxt.periodLabel !== '-' && nxt.periodLabel === activeStep.periodLabel);
            const isWarnFollow =
              nxtNode?.stageType === 'warn' ||
              nxt.bellAtStart === 'warn_10m' ||
              nxt.bellAtStart === 'warn_5m' ||
              nxtCat.startsWith('종료 10분 전') ||
              nxtCat.startsWith('종료 5분 전');
            if (isSameGroup && isWarnFollow) {
              examEndMinutes = nxt.endMinutes;
              examEndStep = nxt;
              if (!nextWarnLabel) {
                nextWarnLabel =
                  nxtNode?.stageShortLabel || (nxtCat.split(' → ')[0] || '종료 10분 전');
              }
            } else {
              break;
            }
          }
        }

        const stepRemainMs = Math.max(0, (activeStep.endMinutes - simMinutes) * 60000);
        const examRemainMs = Math.max(0, (examEndMinutes - simMinutes) * 60000);
        // 본령 진행 중에는 종료 10분/5분 전이 아닌 '종료령'까지 남은 시간을 표시
        const dispRemainMs =
          preset.steps.length > 1 || preset.isCustomSequence
            ? examEndMinutes > activeStep.endMinutes
              ? examRemainMs
              : stepRemainMs
            : remainingMs;

        if (remainDigitsRef.current) {
          remainDigitsRef.current.textContent = formatDurationClock(dispRemainMs);
        }

        if (stageBadgeRef.current) {
          const pPrefix = activeStep.periodLabel !== '-' ? `${activeStep.periodLabel} · ` : '';
          const speedPrefix = playbackSpeedRef.current > 1 ? `[×${playbackSpeedRef.current}] ` : '';
          const statusSuffix = st.isPaused ? ' (일시정지)' : ' 진행 중';

          if (examEndMinutes > activeStep.endMinutes && nextWarnLabel) {
            const mainStageTitle = catText.includes('듣기평가')
              ? '듣기평가 안내방송 및 본령'
              : '본령';
            stageBadgeRef.current.textContent = `${speedPrefix}${pPrefix}${mainStageTitle}${statusSuffix}\n다음 방송: ${nextWarnLabel}`;
          } else if (catText.includes(' → ')) {
            const [curStage, nxtStage] = catText.split(' → ');
            stageBadgeRef.current.textContent = `${speedPrefix}${pPrefix}${curStage}${statusSuffix}\n다음 방송: ${nxtStage}`;
          } else {
            stageBadgeRef.current.textContent = `${speedPrefix}${pPrefix}${catText}${statusSuffix}`;
          }
        }

        const remainSec = stepRemainMs / 1000;
        const mainRemainSec =
          preset.steps.length > 1 || preset.isCustomSequence
            ? examRemainMs / 1000
            : remainingMs / 1000;

        if (isPrepareStage && prelimBellGlowAnimRef.current) {
          // 준비령 (기존 대비 2배 강화): 본령 시작 1분 전(60s)~10초 전(10s) 0% -> 10%, 10초 전(10s)~0초(0s) 10% -> 40% 연속 강화
          if (remainSec <= 60 && remainSec > 10) {
            const p = clamp((60 - remainSec) / 50, 0, 1);
            targetStageGlowBoost = 0.10 * p;
          } else if (remainSec <= 10 && remainSec > 0) {
            const p = clamp((10 - remainSec) / 10, 0, 1);
            targetStageGlowBoost = 0.10 + (0.40 - 0.10) * p;
          }
        } else if (isMainExamStage && mainBellGlowAnimRef.current) {
          // 본령 (기존 대비 2배 강화): 종료 10분 전(600s)~1분 전(60s) 0% -> 10%, 1분 전(60s)~10초 전(10s) 10% -> 40%, 10초 전(10s)~0초(0s) 40% -> 90% 연속 강화
          if (mainRemainSec <= 600 && mainRemainSec > 60) {
            const p = clamp((600 - mainRemainSec) / 540, 0, 1);
            targetStageGlowBoost = 0.10 * p;
          } else if (mainRemainSec <= 60 && mainRemainSec > 10) {
            const p = clamp((60 - mainRemainSec) / 50, 0, 1);
            targetStageGlowBoost = 0.10 + (0.40 - 0.10) * p;
          } else if (mainRemainSec <= 10 && mainRemainSec > 0) {
            const p = clamp((10 - mainRemainSec) / 10, 0, 1);
            targetStageGlowBoost = 0.40 + (0.90 - 0.40) * p;
          }
        }

        syncActiveStepHighlight(preset, activeStep, clampedElapsedMs >= totalDurMs);

        const totalStageSpanMin = Math.max(0.0001, examEndMinutes - activeStep.startMinutes);
        const stepSpanMin = Math.max(0.0001, activeStep.endMinutes - activeStep.startMinutes);
        const stageElapsedMin = clamp(simMinutes - activeStep.startMinutes, 0, stepSpanMin);
        const overallProgress = clamp(
          (simMinutes - activeStep.startMinutes) / totalStageSpanMin,
          0,
          1
        );

        const emphasisShift = sm(0.35, 0.65, overallProgress);
        const startOpacity = 1 - emphasisShift * (1 - 0.38);
        const endOpacity = 0.38 + emphasisShift * (1 - 0.38);

        let dispStartMin = activeStep.startMinutes;
        let dispEndMin = examEndStep ? examEndStep.endMinutes : activeStep.endMinutes;

        if (preset.isCustomSequence) {
          const targetEndStep = examEndStep || activeStep;
          dispStartMin = activeStep.customStartMinutes ?? activeStep.startMinutes;
          dispEndMin = targetEndStep.customEndMinutes ?? targetEndStep.endMinutes;
          clockHandMinutes = dispStartMin + stageElapsedMin;
        }

        if (startLabRef.current) {
          startLabRef.current.innerHTML = `START - TIME<br>${formatAmPmTime(dispStartMin)}`;
          startLabRef.current.style.opacity = startOpacity.toFixed(3);
        }
        if (endLabRef.current) {
          endLabRef.current.innerHTML = `END - TIME<br>${formatAmPmTime(dispEndMin)}`;
          endLabRef.current.style.opacity = endOpacity.toFixed(3);
        }
      }

      updateClockHandsForMinutes(clockHandMinutes);

      // Update Prev / Next bell availability based on active cue index in timeline
      const timeline = buildCueTimeline(preset);
      const currSec = clampedElapsedMs / 1000;
      let activeCueIdx = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].offsetSec <= currSec + 0.05) {
          activeCueIdx = i;
        } else {
          break;
        }
      }
      const nextCanPrev = timeline.length > 1 && activeCueIdx > 0;
      const nextCanNext = timeline.length > 1 && activeCueIdx < timeline.length - 1;
      if (canJumpPrevBellRef.current !== nextCanPrev) {
        canJumpPrevBellRef.current = nextCanPrev;
        setCanJumpPrevBell(nextCanPrev);
      }
      if (canJumpNextBellRef.current !== nextCanNext) {
        canJumpNextBellRef.current = nextCanNext;
        setCanJumpNextBell(nextCanNext);
      }

      if (!st.isPaused && !isHandDragging) {
        checkAndTriggerCues(prevElapsedMs / 1000, clampedElapsedMs / 1000);
        if (clampedElapsedMs >= totalDurMs) {
          if (st.currentGlowBoost > 0.005) {
            st.glowReleaseStartPerf = now;
            st.glowReleaseFromBoost = st.currentGlowBoost;
          }
          st.isPaused = true;
          setPauseLabel('DONE');
          if (!keepScreenAwakeRef.current) {
            releaseWakeLock();
          }
          if (stageBadgeRef.current) {
            stageBadgeRef.current.textContent = `${preset.displayTitle} 종료`;
          }
        }
      }

      // Compute final clock glow boost (including post-bell natural softening animation)
      let finalGlowBoost = targetStageGlowBoost;
      if (st.glowReleaseStartPerf > 0) {
        const relElapsed = now - st.glowReleaseStartPerf;
        const REL_TOTAL = 3400;
        if (relElapsed < REL_TOTAL && targetStageGlowBoost < 0.02) {
          if (relElapsed < 1400) {
            const p = easeSine(relElapsed / 1400);
            finalGlowBoost = st.glowReleaseFromBoost + (-0.24 - st.glowReleaseFromBoost) * p;
          } else {
            const p = easeSine((relElapsed - 1400) / (REL_TOTAL - 1400));
            finalGlowBoost = -0.24 * (1 - p);
          }
        } else if (relElapsed >= REL_TOTAL) {
          st.glowReleaseStartPerf = 0;
          st.glowReleaseFromBoost = 0;
        }
      }
      applyClockGlowBoost(finalGlowBoost);
    },
    [
      applyClockGlowBoost,
      checkAndTriggerCues,
      releaseWakeLock,
      syncActiveStepHighlight,
      updateClockHandsForMinutes,
    ]
  );

  // B6: Seek running timer to arbitrary elapsed ms (for prev/next bell & ±30s adjustment)
  const seekRunningTimerTo = useCallback(
    (targetElapsedMs: number, toastLabel?: string) => {
      const st = engineRef.current;
      if (st.phase !== 'rise' && st.phase !== 'hold') return;
      const preset = st.preset;
      const totalDurMs = (preset.endMinutes - preset.startMinutes) * 60 * 1000;
      const clampedMs = clamp(targetElapsedMs, 0, totalDurMs);
      const clampedSec = clampedMs / 1000;

      stopBell();

      const timeline = buildCueTimeline(preset);
      const nextTriggered = new Set<string>();
      let activeEngCueOffset: number | null = null;
      let engStopped = false;

      for (const cue of timeline) {
        if (cue.offsetSec <= clampedSec) {
          nextTriggered.add(cue.key);
          if (cue.triggersEnglishAudio) {
            activeEngCueOffset = cue.offsetSec;
            engStopped = false;
          }
          if (cue.stopsEnglishAudio && activeEngCueOffset !== null && cue.offsetSec > activeEngCueOffset) {
            engStopped = true;
          }
        }
      }

      st.triggeredCues = nextTriggered;
      st.accumulatedElapsedMs = clampedMs;
      st.lastTickPerf = performance.now();

      // Sync English listening audio position if applicable
      if (activeEngCueOffset !== null && !engStopped && audioRef.current.englishObjectUrl && audioRef.current.englishAudio) {
        const engElapsedSec = Math.max(0, clampedSec - activeEngCueOffset);
        const eng = audioRef.current.englishAudio;
        if (eng.duration && Number.isFinite(eng.duration) && engElapsedSec >= eng.duration) {
          stopEnglishAudio();
        } else {
          try {
            eng.currentTime = engElapsedSec;
          } catch {
            // ignore
          }
          if (!st.isPaused && playbackSpeedRef.current === 1) {
            audioRef.current.englishPlaying = true;
            eng.play().catch(() => {});
          }
        }
      } else {
        stopEnglishAudio();
      }

      if (st.isPaused && pauseLabel === 'DONE' && clampedMs < totalDurMs) {
        setPauseLabel('RESUME');
      }

      updateRunningTimer(performance.now());
      if (toastLabel) {
        showToast(toastLabel, 2200);
      }
    },
    [pauseLabel, showToast, stopBell, stopEnglishAudio, updateRunningTimer]
  );

  // B6: Jump to previous or next bell cue
  // - First bell stage (activeCueIdx === 0): Previous bell is disabled
  // - Last bell stage (activeCueIdx === timeline.length - 1): Next bell is disabled
  const handleJumpBell = useCallback(
    (direction: 'prev' | 'next') => {
      revealRunAuxControls();
      const st = engineRef.current;
      if (st.phase !== 'rise' && st.phase !== 'hold') return;
      const timeline = buildCueTimeline(st.preset);
      if (timeline.length === 0) return;

      const currSec = st.accumulatedElapsedMs / 1000;
      let activeCueIdx = 0;
      for (let i = 0; i < timeline.length; i++) {
        if (timeline[i].offsetSec <= currSec + 0.05) {
          activeCueIdx = i;
        } else {
          break;
        }
      }

      if (direction === 'prev') {
        if (activeCueIdx <= 0) {
          return;
        }
        const targetCue = timeline[activeCueIdx - 1];
        const targetSec = targetCue.offsetSec;
        seekRunningTimerTo(targetSec * 1000, `이전 타종 시점으로 이동 (${targetCue.label})`);
        st.triggeredCues.delete(targetCue.key);
        checkAndTriggerCues(targetSec, targetSec);
      } else {
        if (activeCueIdx >= timeline.length - 1) {
          return;
        }
        const nextCue = timeline[activeCueIdx + 1];
        seekRunningTimerTo(nextCue.offsetSec * 1000, `다음 타종 시점으로 이동 (${nextCue.label})`);
        st.triggeredCues.delete(nextCue.key);
        checkAndTriggerCues(nextCue.offsetSec, nextCue.offsetSec);
      }
    },
    [checkAndTriggerCues, revealRunAuxControls, seekRunningTimerTo]
  );

  // B6: Replay current bell stage AND reset remaining time & clock hands back to start of current bell stage
  const handleReplayLastBell = useCallback(() => {
    revealRunAuxControls();
    const st = engineRef.current;
    if (st.phase !== 'rise' && st.phase !== 'hold') return;

    const timeline = buildCueTimeline(st.preset);
    const currSec = st.accumulatedElapsedMs / 1000;
    let activeCueIdx = 0;
    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].offsetSec <= currSec + 0.05) {
        activeCueIdx = i;
      } else {
        break;
      }
    }

    const activeCue = timeline[activeCueIdx] || timeline[0];
    const targetSec = activeCue ? activeCue.offsetSec : 0;

    // Reset remaining time and clock hands to the start of the current bell stage
    seekRunningTimerTo(targetSec * 1000);

    const codeToPlay = activeCue?.bellCode || lastPlayedBellCode;
    if (codeToPlay) {
      const bellItem = CSAT_37_BELL_FILES.find((b) => b.code === codeToPlay);
      if (bellItem) {
        playBellCueItem(bellItem, { isMuted: false, speedMode: 1 });
        return;
      }
    }
    if (activeCue?.triggersEnglishAudio) {
      startEnglishAudioIfNeeded(activeCue.label, 0);
      return;
    }
    showToast('현재 타종 시작 위치로 시간을 되돌렸습니다.', 2000);
  }, [
    lastPlayedBellCode,
    playBellCueItem,
    revealRunAuxControls,
    seekRunningTimerTo,
    showToast,
    startEnglishAudioIfNeeded,
  ]);

  const stepAnimationFrame = useCallback(
    function loop(now: number) {
      const st = engineRef.current;
      const t = now - st.t0;

      if (st.phase === 'rise') {
        st.H = easeSine(t / RISE);
        st.kT = sm(0, DUR_IN, t - APPEAR_T0);
        st.kH = sm(0, DUR_IN, t - APPEAR_T0 - STAGE_IN);
        st.kX = sm(0, DUR_IN, t - APPEAR_T0 - 2 * STAGE_IN);
        const riseTotal = Math.max(RISE, APPEAR_T0 + 2 * STAGE_IN + DUR_IN);
        updateRunningTimer(now);
        if (t >= riseTotal) {
          st.phase = 'hold';
          st.t0 = now;
          st.H = 1;
          st.kT = 1;
          st.kH = 1;
          st.kX = 1;
        }
      } else if (st.phase === 'hold') {
        updateRunningTimer(now);
      } else if (st.phase === 'drop') {
        st.kX = st.dX * (1 - sm(0, STAGE_OUT, t));
        st.kH = st.dHnd * (1 - sm(STAGE_OUT, 2 * STAGE_OUT, t));
        st.kT = st.dT * (1 - sm(2 * STAGE_OUT, 3 * STAGE_OUT, t));
        st.H = t <= FADE_OUT_TOTAL ? st.dH : st.dH * (1 - easeSine((t - FADE_OUT_TOTAL) / DROP));
        if (t >= FADE_OUT_TOTAL + DROP) {
          st.phase = 'idle';
          st.H = 0;
          st.kT = 0;
          st.kH = 0;
          st.kX = 0;
          syncUiToPresetIdle(st.preset, st.clockSyncMode);
        }
      }

      drawScene();

      if (st.phase === 'rise' || st.phase === 'hold' || st.phase === 'drop') {
        st.rafId = requestAnimationFrame(loop);
      }
    },
    [drawScene, syncUiToPresetIdle, updateRunningTimer]
  );

  // Long-press and rotate clock hands (시침, 분침, 초침 각각 꾹 누르고 돌려서 시간대 이동)
  const handleHandPointerDown = useCallback(
    (hand: 'hour' | 'min' | 'sec', e: React.PointerEvent<SVGElement>) => {
      const st = engineRef.current;
      if (st.phase !== 'rise' && st.phase !== 'hold') return;
      e.stopPropagation();

      if (handDragRef.current.holdTimer) {
        window.clearTimeout(handDragRef.current.holdTimer);
      }

      const targetEl = e.currentTarget;
      const pointerId = e.pointerId;
      try {
        targetEl.setPointerCapture(pointerId);
      } catch {
        // ignore
      }

      handDragRef.current = {
        pointerId,
        hand,
        startX: e.clientX,
        startY: e.clientY,
        latestX: e.clientX,
        latestY: e.clientY,
        isActivated: false,
        prevAngleDeg: 0,
        holdTimer: window.setTimeout(() => {
          const drag = handDragRef.current;
          if (drag.pointerId !== pointerId) return;
          const dx = drag.latestX - engineRef.current.cx;
          const dy = drag.latestY - engineRef.current.cy;
          const initAngle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
          drag.isActivated = true;
          drag.prevAngleDeg = initAngle;
          setGrabbedHand(hand);
          stopBell();
          try {
            navigator.vibrate?.(12);
          } catch {
            // ignore
          }
          const handLabel = hand === 'hour' ? '시침' : hand === 'min' ? '분침' : '초침';
          showToast(`${handLabel} 회전 조절 활성화: 중심축을 기준으로 돌려 원하는 시간대로 이동하세요.`, 2200);
        }, 180),
      };
    },
    [showToast, stopBell]
  );

  const handleHandPointerMove = useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      const drag = handDragRef.current;
      if (drag.pointerId !== e.pointerId || !drag.hand) return;

      drag.latestX = e.clientX;
      drag.latestY = e.clientY;

      if (!drag.isActivated) {
        if (Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 22) {
          if (drag.holdTimer) {
            window.clearTimeout(drag.holdTimer);
            drag.holdTimer = null;
          }
          drag.pointerId = null;
          drag.hand = null;
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const st = engineRef.current;
      if (st.phase !== 'rise' && st.phase !== 'hold') return;

      const dx = e.clientX - st.cx;
      const dy = e.clientY - st.cy;
      if (Math.hypot(dx, dy) < 6) return;

      const currAngleDeg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      let deltaDeg = currAngleDeg - drag.prevAngleDeg;
      if (deltaDeg > 180) deltaDeg -= 360;
      if (deltaDeg < -180) deltaDeg += 360;
      drag.prevAngleDeg = currAngleDeg;

      // Convert angular rotation around center axis into time delta
      let deltaMs = 0;
      if (drag.hand === 'sec') {
        deltaMs = (deltaDeg / 360) * 60000; // 1회전 = 60초
      } else if (drag.hand === 'min') {
        deltaMs = (deltaDeg / 360) * 3600000; // 1회전 = 60분
      } else {
        deltaMs = (deltaDeg / 360) * 43200000; // 1회전 = 12시간(720분)
      }

      const totalDurMs = (st.preset.endMinutes - st.preset.startMinutes) * 60 * 1000;
      st.accumulatedElapsedMs = clamp(st.accumulatedElapsedMs + deltaMs, 0, totalDurMs);
      st.lastTickPerf = performance.now();
      st.glowReleaseStartPerf = 0;
      updateRunningTimer(performance.now());
    },
    [updateRunningTimer]
  );

  const handleHandPointerUp = useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      const drag = handDragRef.current;
      if (drag.pointerId !== e.pointerId) return;
      e.stopPropagation();

      if (drag.holdTimer) {
        window.clearTimeout(drag.holdTimer);
        drag.holdTimer = null;
      }
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const wasActivated = drag.isActivated;
      drag.pointerId = null;
      drag.hand = null;
      drag.isActivated = false;
      setGrabbedHand(null);

      if (wasActivated) {
        seekRunningTimerTo(engineRef.current.accumulatedElapsedMs);
      }
    },
    [seekRunningTimerTo]
  );

  // B9: Silent background video lifecycle, self-healing loop, focus/visibility recovery & 3s watchdog
  useEffect(() => {
    const videoEl = wakeLockVideoRef.current;
    if (videoEl) {
      ensureWakeVideoSource(videoEl);
    }

    const handleVideoTimeUpdate = () => {
      wakeVideoProgressMsRef.current = performance.now();
    };

    const handleVideoEnded = () => {
      if (!keepScreenAwakeRef.current || wakeLockIntentionalReleaseRef.current || !videoEl) return;
      try {
        videoEl.currentTime = 0;
      } catch {
        // ignore
      }
      startWakeLockVideo();
    };

    const handleVideoPauseOrStall = () => {
      if (!keepScreenAwakeRef.current || wakeLockIntentionalReleaseRef.current) return;
      startWakeLockVideo();
      window.setTimeout(() => {
        if (keepScreenAwakeRef.current && !wakeLockIntentionalReleaseRef.current) {
          startWakeLockVideo();
        }
      }, 150);
    };

    const handleVideoError = () => {
      if (!videoEl || wakeVideoCanvasCleanupRef.current) return;
      wakeVideoCanvasCleanupRef.current = attachCanvasFallbackStream(videoEl);
      if (keepScreenAwakeRef.current && !wakeLockIntentionalReleaseRef.current) {
        startWakeLockVideo();
      }
    };

    if (videoEl) {
      videoEl.addEventListener('timeupdate', handleVideoTimeUpdate);
      videoEl.addEventListener('ended', handleVideoEnded);
      videoEl.addEventListener('pause', handleVideoPauseOrStall);
      videoEl.addEventListener('stalled', handleVideoPauseOrStall);
      videoEl.addEventListener('waiting', handleVideoPauseOrStall);
      videoEl.addEventListener('error', handleVideoError);
    }

    const syncWakeLockOnEvent = () => {
      if (!keepScreenAwakeRef.current) {
        stopWakeLockVideo();
        return;
      }
      startWakeLockVideo();
      if (!document.hidden) {
        requestWakeLock();
      }
    };

    const handleVisibilityChange = () => {
      const st = engineRef.current;
      const isActive = st.phase === 'rise' || st.phase === 'hold';
      syncWakeLockOnEvent();
      if (!document.hidden && isActive && !st.isPaused) {
        updateRunningTimer(performance.now());
      }
    };

    const handleUserGestureRetry = () => {
      if (!keepScreenAwakeRef.current) return;
      const sentinel = wakeLockSentinelRef.current;
      const needsNative = !document.hidden && (!sentinel || Boolean(sentinel.released));
      const needsVideo = Boolean(videoEl && videoEl.paused);
      if (needsNative || needsVideo) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', syncWakeLockOnEvent);
    document.addEventListener('webkitfullscreenchange', syncWakeLockOnEvent);
    document.addEventListener('resume', syncWakeLockOnEvent);
    window.addEventListener('focus', syncWakeLockOnEvent);
    window.addEventListener('blur', syncWakeLockOnEvent);
    window.addEventListener('pageshow', syncWakeLockOnEvent);
    window.addEventListener('pagehide', syncWakeLockOnEvent);
    document.addEventListener('pointerdown', handleUserGestureRetry, { capture: true, passive: true });
    document.addEventListener('touchstart', handleUserGestureRetry, { capture: true, passive: true });
    document.addEventListener('click', handleUserGestureRetry, { capture: true, passive: true });
    document.addEventListener('keydown', handleUserGestureRetry, { capture: true, passive: true });

    const bgTimer = window.setInterval(() => {
      const st = engineRef.current;
      if (document.hidden && (st.phase === 'rise' || st.phase === 'hold') && !st.isPaused) {
        updateRunningTimer(performance.now());
      }
    }, 500);

    const wakeWatchdog = window.setInterval(() => {
      if (!keepScreenAwakeRef.current) return;
      const sentinel = wakeLockSentinelRef.current;
      const droppedNative = !document.hidden && (!sentinel || Boolean(sentinel.released));
      const isVideoFrozen = Boolean(
        videoEl &&
          !videoEl.paused &&
          !videoEl.srcObject &&
          wakeVideoProgressMsRef.current > 0 &&
          performance.now() - wakeVideoProgressMsRef.current > 5500
      );
      if (isVideoFrozen && videoEl) {
        try {
          videoEl.currentTime = 0;
        } catch {
          // ignore
        }
        startWakeLockVideo();
      }
      const droppedVideo = Boolean(videoEl && videoEl.paused);
      if (droppedNative || droppedVideo) {
        requestWakeLock();
      }
    }, 2500);

    return () => {
      if (videoEl) {
        videoEl.removeEventListener('timeupdate', handleVideoTimeUpdate);
        videoEl.removeEventListener('ended', handleVideoEnded);
        videoEl.removeEventListener('pause', handleVideoPauseOrStall);
        videoEl.removeEventListener('stalled', handleVideoPauseOrStall);
        videoEl.removeEventListener('waiting', handleVideoPauseOrStall);
        videoEl.removeEventListener('error', handleVideoError);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', syncWakeLockOnEvent);
      document.removeEventListener('webkitfullscreenchange', syncWakeLockOnEvent);
      document.removeEventListener('resume', syncWakeLockOnEvent);
      window.removeEventListener('focus', syncWakeLockOnEvent);
      window.removeEventListener('blur', syncWakeLockOnEvent);
      window.removeEventListener('pageshow', syncWakeLockOnEvent);
      window.removeEventListener('pagehide', syncWakeLockOnEvent);
      document.removeEventListener('pointerdown', handleUserGestureRetry, { capture: true });
      document.removeEventListener('touchstart', handleUserGestureRetry, { capture: true });
      document.removeEventListener('click', handleUserGestureRetry, { capture: true });
      document.removeEventListener('keydown', handleUserGestureRetry, { capture: true });
      window.clearInterval(bgTimer);
      window.clearInterval(wakeWatchdog);
      if (wakeVideoCanvasCleanupRef.current) {
        wakeVideoCanvasCleanupRef.current();
        wakeVideoCanvasCleanupRef.current = null;
      }
      if (wakeVideoAssetRef.current?.isBlob) {
        try {
          URL.revokeObjectURL(wakeVideoAssetRef.current.url);
        } catch {
          // ignore
        }
        wakeVideoAssetRef.current = null;
      }
    };
  }, [ensureWakeVideoSource, requestWakeLock, startWakeLockVideo, stopWakeLockVideo, updateRunningTimer]);

  const computeTargetLayout = useCallback((W: number, Hh: number, isOpen: boolean) => {
    const dockBottom = dockRef.current
      ? parseFloat(getComputedStyle(dockRef.current).bottom) || 24
      : 24;

    if (W >= 720) {
      const panelW = isOpen ? Math.min(410, Math.max(320, Math.round(W * 0.34))) : 0;
      const availW = isOpen ? Math.max(250, W - panelW - 36) : W;
      const topClearance = 44;
      const dockTop = Hh - dockBottom - 46;
      const dockClearTop = dockTop - 52;
      const availVertSpan = Math.max(180, dockClearTop - topClearance);
      const maxRByHeight = Math.max(68, (availVertSpan - 76) / 2.5);
      const R = Math.min(availW * 0.38, Hh * 0.27, maxRByHeight, 330);
      const cx = isOpen ? Math.max(R + 18, availW / 2) : W / 2;
      const minCy = topClearance + R * 1.3 + 20;
      const maxCy = dockClearTop - (R * 1.2 + 52);
      const cy = minCy <= maxCy ? clamp(Hh * 0.435, minCy, maxCy) : (minCy + maxCy) / 2;
      return {
        R,
        cx,
        cy,
        dockY: 0,
      };
    }

    if (!isOpen) {
      const topClearance = 42;
      const dockTop = Hh - dockBottom - 46;
      const dockClearTop = dockTop - 48;
      const availVertSpan = Math.max(160, dockClearTop - topClearance);
      const maxRByHeight = Math.max(64, (availVertSpan - 68) / 2.5);
      const R = Math.min(W * 0.38, Hh * 0.27, maxRByHeight, 330);
      const minCy = topClearance + R * 1.3 + 18;
      const maxCy = dockClearTop - (R * 1.2 + 48);
      const cy = minCy <= maxCy ? clamp(Hh * 0.43, minCy, maxCy) : (minCy + maxCy) / 2;
      return {
        R,
        cx: W / 2,
        cy,
        dockY: 0,
      };
    }

    const panelH = Math.round(clamp(Hh * 0.42, 220, 360));
    document.documentElement.style.setProperty('--tt-mobile-h', `${panelH}px`);
    const dockY = -(panelH + 2);
    const dockTop = Hh - dockBottom - 46 + dockY;
    const dockClearTop = dockTop - 28;
    const topClearance = 40;
    const availVertSpan = Math.max(140, dockClearTop - topClearance);
    const maxRByHeight = Math.max(62, (availVertSpan - 58) / 2.5);
    const R = clamp(Math.min(W * 0.30, maxRByHeight, 150), 62, 150);
    const minCy = topClearance + R * 1.3 + 14;
    const maxCy = dockClearTop - (R * 1.2 + 42);
    const cy = (minCy + maxCy) / 2 - 4;
    return {
      R,
      cx: W / 2,
      cy,
      dockY,
    };
  }, []);

  const applyGeometryToDom = useCallback(() => {
    const st = engineRef.current;
    const { cx, cy, R, W, dockY } = st;
    if (faceRef.current) {
      faceRef.current.style.left = `${cx - R}px`;
      faceRef.current.style.top = `${cy - R}px`;
      faceRef.current.style.width = `${2 * R}px`;
      faceRef.current.style.height = `${2 * R}px`;
    }
    if (titleRef.current) {
      const minTitleSize = R < 130 ? 20 : 26;
      titleRef.current.style.top = `${cy - R * 1.3}px`;
      titleRef.current.style.fontSize = `${clamp(R * 0.2, minTitleSize, 58)}px`;
      titleRef.current.style.transform = `translate3d(${(cx - W / 2).toFixed(2)}px, -50%, 0)`;
    }
    if (labRef.current) {
      const labW = Math.min(W - 24, Math.max(2.22 * R, 300));
      const minLabFont = R < 130 ? 9.5 : 11;
      labRef.current.style.left = `${cx - labW / 2}px`;
      labRef.current.style.top = `${cy + R * 1.18}px`;
      labRef.current.style.width = `${labW}px`;
      labRef.current.style.fontSize = `${clamp(R * 0.085, minLabFont, 17)}px`;
    }
    if (remainDigitsRef.current) {
      const minDigitFont = R < 130 ? 13 : 15;
      remainDigitsRef.current.style.fontSize = `${clamp(R * 0.12, minDigitFont, 24)}px`;
    }
    if (dockRef.current) {
      dockRef.current.style.transform = `translate3d(calc(-50% + ${(cx - W / 2).toFixed(2)}px), ${dockY.toFixed(2)}px, 0)`;
    }
  }, []);

  // Initialize WebGL Context & Layout Resize Handler (with A1 try/finally safety)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const glOpts: WebGLContextAttributes = {
      antialias: false,
      alpha: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    };
    const gl =
      cv.getContext('webgl', glOpts) ||
      cv.getContext('webgl', { antialias: false, alpha: true, preserveDrawingBuffer: true });
    engineRef.current.gl = gl;

    const initGlProgram = () => {
      if (!gl) return;
      const mk = (type: number, src: string) => {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, mk(gl.VERTEX_SHADER, VS));
      gl.attachShader(pr, mk(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(pr);
      gl.useProgram(pr);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      ['uRes', 'uC', 'uR', 'uH', 'uB', 'uS'].forEach((k) => {
        engineRef.current.uniforms[k] = gl.getUniformLocation(pr, k);
      });
    };
    initGlProgram();

    const handleLayout = () => {
      const st = engineRef.current;
      st.W = window.innerWidth;
      st.Hh = window.innerHeight;
      st.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.max(1, Math.round(st.W * st.dpr));
      const nextH = Math.max(1, Math.round(st.Hh * st.dpr));
      if (cv.width !== nextW || cv.height !== nextH) {
        cv.width = nextW;
        cv.height = nextH;
      }
      if (st.gl) {
        st.gl.viewport(0, 0, cv.width, cv.height);
      }
      if (st.layoutRafId) {
        cancelAnimationFrame(st.layoutRafId);
        st.layoutRafId = 0;
      }
      st.layoutAnimating = false;
      const target = computeTargetLayout(st.W, st.Hh, isTimetablePanelOpenRef.current);
      st.R = target.R;
      st.cx = target.cx;
      st.cy = target.cy;
      st.dockY = target.dockY;
      st.targetR = target.R;
      st.targetCx = target.cx;
      st.targetCy = target.cy;
      st.targetDockY = target.dockY;
      applyGeometryToDom();
      drawScene();
    };

    let fsRaf = 0;
    let fsTimer1: number | null = null;
    let fsTimer2: number | null = null;
    const handleFullscreenSettle = () => {
      handleLayout();
      if (fsRaf) cancelAnimationFrame(fsRaf);
      fsRaf = requestAnimationFrame(() => {
        fsRaf = 0;
        handleLayout();
      });
      if (fsTimer1 !== null) window.clearTimeout(fsTimer1);
      if (fsTimer2 !== null) window.clearTimeout(fsTimer2);
      fsTimer1 = window.setTimeout(() => {
        fsTimer1 = null;
        handleLayout();
      }, 90);
      fsTimer2 = window.setTimeout(() => {
        fsTimer2 = null;
        handleLayout();
      }, 240);
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      initGlProgram();
      handleLayout();
    };

    const mapUrl = buildLensMap(154, 46, 23);
    if (mapUrl) {
      ['glass-map-light', 'glass-map-dark'].forEach((id) => {
        const mapEl = document.getElementById(id);
        if (mapEl) {
          mapEl.setAttribute('href', mapUrl);
          mapEl.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', mapUrl);
        }
      });
    }

    const activePressedMap = new Map<number, HTMLElement>();
    const PRESSABLE_SELECTOR =
      'button:not(:disabled), .lg-btn:not(:disabled), .lg-pill-cta-btn:not(:disabled)';

    const handlePressStart = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = (e.target as HTMLElement | null)?.closest?.(
        PRESSABLE_SELECTOR
      ) as HTMLElement | null;
      if (!target) return;
      target.classList.add('is-pressed');
      activePressedMap.set(e.pointerId, target);
    };

    const handlePressEnd = (e: PointerEvent) => {
      const el = activePressedMap.get(e.pointerId);
      if (!el) return;
      activePressedMap.delete(e.pointerId);
      let stillHeld = false;
      activePressedMap.forEach((otherEl) => {
        if (otherEl === el) stillHeld = true;
      });
      if (!stillHeld) {
        el.classList.remove('is-pressed');
      }
    };

    const clearAllPressed = () => {
      activePressedMap.forEach((el) => el.classList.remove('is-pressed'));
      activePressedMap.clear();
    };

    const handleTouchEndClear = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        clearAllPressed();
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        '.lg-btn, .pill-group-row'
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const px = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
      const py = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
      target.style.setProperty('--px', `${px}%`);
      target.style.setProperty('--py', `${py}%`);
    };

    const handlePointerOut = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        '.lg-btn, .pill-group-row'
      ) as HTMLElement | null;
      if (!target) return;
      const related = e.relatedTarget as Node | null;
      if (related && target.contains(related)) return;
      target.style.setProperty('--px', '50%');
      target.style.setProperty('--py', '12%');
    };

    try {
      handleLayout();
    } catch {
      document.documentElement.classList.add('app-ready');
    }

    let unmounted = false;
    const fontsReady =
      typeof document !== 'undefined' && document.fonts && document.fonts.ready
        ? document.fonts.ready.catch(() => {})
        : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 220))]).finally(() => {
      if (unmounted) return;
      requestAnimationFrame(() => {
        if (unmounted) return;
        try {
          applyGeometryToDom();
          drawScene();
        } finally {
          document.documentElement.classList.add('app-ready');
        }
      });
    });

    window.addEventListener('resize', handleLayout);
    window.visualViewport?.addEventListener('resize', handleLayout);
    document.addEventListener('fullscreenchange', handleFullscreenSettle);
    document.addEventListener('webkitfullscreenchange', handleFullscreenSettle);
    cv.addEventListener('webglcontextlost', handleContextLost);
    cv.addEventListener('webglcontextrestored', handleContextRestored);
    document.addEventListener('pointerdown', handlePressStart, { capture: true, passive: true });
    window.addEventListener('pointerup', handlePressEnd, { capture: true, passive: true });
    window.addEventListener('pointercancel', handlePressEnd, { capture: true, passive: true });
    window.addEventListener('touchend', handleTouchEndClear, { capture: true, passive: true });
    window.addEventListener('touchcancel', handleTouchEndClear, { capture: true, passive: true });
    window.addEventListener('blur', clearAllPressed);
    document.addEventListener('visibilitychange', clearAllPressed);
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    return () => {
      unmounted = true;
      window.removeEventListener('resize', handleLayout);
      window.visualViewport?.removeEventListener('resize', handleLayout);
      document.removeEventListener('fullscreenchange', handleFullscreenSettle);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenSettle);
      cv.removeEventListener('webglcontextlost', handleContextLost);
      cv.removeEventListener('webglcontextrestored', handleContextRestored);
      document.removeEventListener('pointerdown', handlePressStart, true);
      window.removeEventListener('pointerup', handlePressEnd, true);
      window.removeEventListener('pointercancel', handlePressEnd, true);
      window.removeEventListener('touchend', handleTouchEndClear, true);
      window.removeEventListener('touchcancel', handleTouchEndClear, true);
      window.removeEventListener('blur', clearAllPressed);
      document.removeEventListener('visibilitychange', clearAllPressed);
      clearAllPressed();
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerout', handlePointerOut);
      if (fsRaf) cancelAnimationFrame(fsRaf);
      if (fsTimer1 !== null) window.clearTimeout(fsTimer1);
      if (fsTimer2 !== null) window.clearTimeout(fsTimer2);
      if (engineRef.current.rafId) {
        cancelAnimationFrame(engineRef.current.rafId);
      }
      if (engineRef.current.layoutRafId) {
        cancelAnimationFrame(engineRef.current.layoutRafId);
      }
    };
  }, [applyGeometryToDom, computeTargetLayout, drawScene]);

  // Smoothly animate clock, title, label, and dock when timetable panel opens or closes
  useEffect(() => {
    const st = engineRef.current;
    const target = computeTargetLayout(st.W, st.Hh, isTimetablePanelOpen);
    st.fromR = st.R;
    st.fromCx = st.cx;
    st.fromCy = st.cy;
    st.fromDockY = st.dockY;
    st.targetR = target.R;
    st.targetCx = target.cx;
    st.targetCy = target.cy;
    st.targetDockY = target.dockY;
    st.layoutAnimStart = performance.now();
    st.layoutAnimating = true;

    if (st.layoutRafId) {
      cancelAnimationFrame(st.layoutRafId);
      st.layoutRafId = 0;
    }

    const stepLayout = (now: number) => {
      if (!st.layoutAnimating) return;
      const elapsed = now - st.layoutAnimStart;
      const p = clamp(elapsed / 380, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      st.R = st.fromR + (st.targetR - st.fromR) * e;
      st.cx = st.fromCx + (st.targetCx - st.fromCx) * e;
      st.cy = st.fromCy + (st.targetCy - st.fromCy) * e;
      st.dockY = st.fromDockY + (st.targetDockY - st.fromDockY) * e;
      applyGeometryToDom();
      drawScene();

      if (p < 1) {
        st.layoutRafId = requestAnimationFrame(stepLayout);
      } else {
        st.layoutAnimating = false;
        st.layoutRafId = 0;
        st.R = st.targetR;
        st.cx = st.targetCx;
        st.cy = st.targetCy;
        st.dockY = st.targetDockY;
        applyGeometryToDom();
        drawScene();
      }
    };

    st.layoutRafId = requestAnimationFrame(stepLayout);
  }, [isTimetablePanelOpen, applyGeometryToDom, computeTargetLayout, drawScene]);

  // Pre-unlock audio helper on user gesture (START or Schedule Start)
  const unlockAudioOnGesture = useCallback(() => {
    if (audioRef.current.englishObjectUrl && audioRef.current.englishAudio) {
      const eng = audioRef.current.englishAudio;
      eng.muted = true;
      const unlockPromise = eng.play();
      if (unlockPromise && typeof unlockPromise.then === 'function') {
        unlockPromise
          .then(() => {
            if (!audioRef.current.englishPlaying) {
              eng.pause();
              eng.currentTime = 0;
            }
            eng.muted = false;
          })
          .catch(() => {
            eng.muted = false;
          });
      } else {
        eng.pause();
        eng.currentTime = 0;
        eng.muted = false;
      }
    }
  }, []);

  // Handlers: START, PAUSE/RESUME, CANCEL
  const handleStart = useCallback(() => {
    const st = engineRef.current;
    if (st.phase !== 'idle') return;
    if (st.rafId) cancelAnimationFrame(st.rafId);

    stopPreviewBell();
    setScheduledTargetMs(null);
    enterFullscreenSilently();
    requestWakeLock();

    const now = performance.now();
    st.phase = 'rise';
    st.isPaused = false;
    st.t0 = now;
    st.lastTickPerf = now;
    st.accumulatedElapsedMs = 0;
    st.triggeredCues.clear();

    const timeline = buildCueTimeline(st.preset);
    canJumpPrevBellRef.current = false;
    canJumpNextBellRef.current = timeline.length > 1;
    setCanJumpPrevBell(false);
    setCanJumpNextBell(timeline.length > 1);

    setIsMenuOpen(false);
    setIsRunningUi(true);
    revealRunAuxControls();
    setPauseLabel('PAUSE');

    unlockAudioOnGesture();

    checkAndTriggerCues(0, 0);
    st.rafId = requestAnimationFrame(stepAnimationFrame);
  }, [
    checkAndTriggerCues,
    enterFullscreenSilently,
    requestWakeLock,
    revealRunAuxControls,
    stepAnimationFrame,
    stopPreviewBell,
    unlockAudioOnGesture,
  ]);

  // B8: Scheduled Start countdown effect
  useEffect(() => {
    if (scheduledTargetMs === null) return;
    const tick = () => {
      if (engineRef.current.phase !== 'idle') {
        setScheduledTargetMs(null);
        return;
      }
      const diffMs = scheduledTargetMs - Date.now();
      if (diffMs <= 0) {
        setScheduledTargetMs(null);
        setScheduleRemainSec(0);
        handleStart();
      } else {
        setScheduleRemainSec(Math.ceil(diffMs / 1000));
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [handleStart, scheduledTargetMs]);

  const handleSetScheduledStart = () => {
    if (engineRef.current.phase !== 'idle') {
      showToast('타이머 대기 상태에서만 예약 시작을 설정할 수 있습니다.', 2800);
      return;
    }
    const parts = scheduleTimeInput.trim().split(':').map(Number);
    if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) {
      showToast('올바른 시각(HH:MM 또는 HH:MM:SS)을 입력해 주세요.', 2800);
      return;
    }
    const [hh, mm, ss = 0] = parts;
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, ss, 0);
    if (target.getTime() <= now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    unlockAudioOnGesture();
    requestWakeLock();
    setScheduledTargetMs(target.getTime());
    showToast(
      `예약 시작이 설정되었습니다 (${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}).`,
      3200
    );
  };

  const handleCancelScheduledStart = () => {
    setScheduledTargetMs(null);
    setScheduleRemainSec(0);
    if (!keepScreenAwakeRef.current) {
      releaseWakeLock();
    }
    showToast('예약 시작이 취소되었습니다.', 2400);
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = engineRef.current;
    if (st.phase !== 'rise' && st.phase !== 'hold') return;
    if (pauseLabel === 'DONE') return;

    st.isPaused = !st.isPaused;
    st.lastTickPerf = performance.now();
    setPauseLabel(st.isPaused ? 'RESUME' : 'PAUSE');

    if (st.isPaused) {
      pauseBell();
      pauseEnglishAudio();
    } else {
      requestWakeLock();
      resumeBell();
      resumeEnglishAudio();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const st = engineRef.current;
    if (st.phase !== 'rise' && st.phase !== 'hold') return;
    if (st.rafId) cancelAnimationFrame(st.rafId);

    if (runAuxHideTimerRef.current) {
      window.clearTimeout(runAuxHideTimerRef.current);
      runAuxHideTimerRef.current = null;
    }

    stopBell();
    stopEnglishAudio();
    exitFullscreenSilently();
    if (!keepScreenAwakeRef.current) {
      releaseWakeLock();
    }

    st.isPaused = false;
    st.dH = st.H;
    st.dT = st.kT;
    st.dHnd = st.kH;
    st.dX = st.kX;
    st.phase = 'drop';
    st.t0 = performance.now();

    canJumpPrevBellRef.current = false;
    canJumpNextBellRef.current = false;
    setCanJumpPrevBell(false);
    setCanJumpNextBell(false);
    setIsRunningUi(false);
    setIsRunAuxRevealed(false);
    setPauseLabel('PAUSE');

    st.rafId = requestAnimationFrame(stepAnimationFrame);
  };

  const handleThemeChange = (nextPref: ThemePreference) => {
    setThemePref(nextPref);
    resolveAndApplyTheme(nextPref);
    saveCustomSettingsToStorage(
      nextPref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig
    );
    const labelMap: Record<ThemePreference, string> = {
      auto: '시스템 설정 자동 (Auto)',
      light: '라이트 모드 (Light)',
      dark: '다크 모드 (Night)',
      sepia: '세피아 모드 (Sepia)',
    };
    showToast(`테마 변경: ${labelMap[nextPref]}`, 2400);
  };

  const handleClockSyncModeChange = (_nextMode: ClockSyncMode, isInsideModal = false) => {
    const enforced: ClockSyncMode = 'custom_cascaded_time';
    if (isInsideModal) {
      setDraftClockSyncMode(enforced);
      return;
    }
    setClockSyncMode(enforced);
    clockSyncModeRef.current = enforced;
    engineRef.current.clockSyncMode = enforced;
    if (engineRef.current.phase === 'idle') {
      syncUiToPresetIdle(engineRef.current.preset, enforced);
    }
  };

  const handleSelectTimetableRow = (row: CsatTimetableRow, closeModal = true) => {
    if (engineRef.current.phase !== 'idle') {
      showToast('타이머 실행 중에는 구간을 변경할 수 없습니다. CANCEL 후 선택해 주세요.', 3200);
      return;
    }
    const custom: CsatSessionPreset = {
      id: `custom_${row.id}`,
      group: 'single',
      label: `${row.periodLabel !== '-' ? row.periodLabel + ' ' : ''}${row.displayTitle} (${row.category})`,
      shortLabel: row.displayTitle,
      displayTitle: row.displayTitle,
      startMinutes: row.startMinutes,
      endMinutes: row.endMinutes,
      steps: [row],
    };
    setCustomPreset(custom);
    setSelectedPresetId(custom.id);
    setIsTemporaryStartPoint(true);
    engineRef.current.preset = custom;
    syncUiToPresetIdle(custom, clockSyncMode);
    if (closeModal) {
      setIsModalOpen(false);
    }
    showToast(`${row.displayTitle} (${row.category}) 구간으로 임시 시작 지점이 설정되었습니다.`, 2600);
  };

  // ---------- C7: Unified Analysis for Applied Config & Draft Config ----------
  const appliedAnalysis = useMemo(
    () => analyzeSequenceConfig(customSequenceConfig),
    [customSequenceConfig]
  );
  const computedSequenceRows = appliedAnalysis.rows;

  // Auto-scroll timetable list so the highlighted active bell is positioned 2nd from the top (1st from top = previous bell; min 2 visible at top, or 1 if only 1 selected)
  useEffect(() => {
    if (!isTimetablePanelOpen) return;
    const timer = window.setTimeout(() => {
      const scrollEl = rtScrollListRef.current;
      if (!scrollEl) return;
      const stageEl = scrollEl.querySelector<HTMLElement>('.rt-list-stage');
      if (!stageEl) return;
      const cards = Array.from(stageEl.querySelectorAll<HTMLElement>('.rt-row-card'));
      if (cards.length === 0) {
        stageEl.style.paddingBottom = '0px';
        return;
      }
      if (cards.length === 1) {
        stageEl.style.paddingBottom = '0px';
        scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const activeIdx = cards.findIndex(
        (c) => c.querySelector('.rt-item-btn.is-current') !== null
      );
      const targetTopIdx =
        activeIdx >= 0 ? clamp(activeIdx - 1, 0, Math.max(0, cards.length - 2)) : 0;

      const lastTwoHeight =
        (cards[cards.length - 2]?.offsetHeight || 58) +
        (cards[cards.length - 1]?.offsetHeight || 58) +
        14;
      const extraPad = Math.max(12, scrollEl.clientHeight - lastTwoHeight);
      stageEl.style.paddingBottom = `${extraPad}px`;

      const topCard = cards[targetTopIdx];
      if (!topCard) return;
      const stageOffsetTop = stageEl.offsetTop || 0;
      const targetScrollTop = Math.max(0, topCard.offsetTop - stageOffsetTop);
      scrollEl.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }, 65);

    return () => window.clearTimeout(timer);
  }, [
    activeRowId,
    activeCustomNodeId,
    timetableViewMode,
    isTimetablePanelOpen,
    computedSequenceRows.length,
  ]);

  const draftAnalysis = useMemo(
    () => analyzeSequenceConfig(draftSequenceConfig),
    [draftSequenceConfig]
  );
  const draftRows = draftAnalysis.rows;

  // Sync Step 1 응시 조합 checkboxes & 탐구 과목 수 from a nodeId array
  const syncSubjectComboFromNodeIds = useCallback((nodeIds: string[]) => {
    const sel = new Set(nodeIds);
    const hasGroup = (gid: CsatSubjectGroupId) =>
      CSAT_SELECTABLE_CUE_NODES.some((n) => n.subjectGroupId === gid && sel.has(n.nodeId));
    const hasInq1 = hasGroup('inq1');
    const hasInq2 = hasGroup('inq2');
    setSubjAutoChecked({
      kor: hasGroup('kor'),
      math: hasGroup('math'),
      eng: hasGroup('eng'),
      hist: hasGroup('hist'),
      inq1: hasInq1,
      inq2: hasInq2,
      lang2: hasGroup('lang2'),
    });
    if (hasInq2) {
      setSubjInqCount(2);
    } else if (hasInq1) {
      setSubjInqCount(1);
    }
  }, []);

  const enabledSubjectGroups = useMemo(() => {
    const set = new Set<CsatSubjectGroupId>();
    if (subjAutoChecked.kor) set.add('kor');
    if (subjAutoChecked.math) set.add('math');
    if (subjAutoChecked.eng) set.add('eng');
    if (subjAutoChecked.hist) set.add('hist');
    const isInqActive = subjAutoChecked.inq1 || subjAutoChecked.inq2;
    if (isInqActive) {
      set.add('inq1');
      if (subjInqCount >= 2) set.add('inq2');
    }
    if (subjAutoChecked.lang2) set.add('lang2');
    return set;
  }, [subjAutoChecked, subjInqCount]);

  const goToBuilderStep = useCallback((nextStep: 1 | 2 | 3) => {
    setOpenCustomPopup(null);
    setBuilderStep(nextStep);
    requestAnimationFrame(() => {
      if (builderStepBodyRef.current) {
        builderStepBodyRef.current.scrollTop = 0;
      }
    });
  }, []);

  // C1 & C8: Open/Close Builder Modal & Draft Mutation with Undo/Redo
  const openBuilderModal = useCallback(
    (scrollToNodeId?: string) => {
      const cloned = cloneSequenceConfig(customSequenceConfigRef.current);
      setDraftSequenceConfig(cloned);
      syncSubjectComboFromNodeIds(cloned.selectedNodeIds);
      setDraftClockSyncMode(clockSyncModeRef.current);
      setDraftUndoStack([]);
      setDraftRedoStack([]);
      setIntervalInputTexts({});
      setRowInputErrors({});
      setOpenCustomPopup(null);
      setIsRunningSaveConfirmOpen(false);
      const jumpToStep3 = Boolean(scrollToNodeId && cloned.selectedNodeIds.includes(scrollToNodeId));
      setBuilderStep(jumpToStep3 ? 3 : 1);
      setIsBuilderModalOpen(true);

      if (jumpToStep3 && scrollToNodeId) {
        window.setTimeout(() => {
          const el = builderRightPaneRef.current?.querySelector(
            `[data-node-id="${scrollToNodeId}"]`
          );
          if (el && 'scrollIntoView' in el) {
            (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 120);
      } else {
        window.setTimeout(() => {
          if (builderStepBodyRef.current) builderStepBodyRef.current.scrollTop = 0;
        }, 30);
      }
    },
    [syncSubjectComboFromNodeIds]
  );

  const closeBuilderModalWithoutSaving = useCallback(() => {
    stopPreviewBell();
    setOpenCustomPopup(null);
    setIsRunningSaveConfirmOpen(false);
    setIsBuilderModalOpen(false);
    setDuplicateNamePrompt(null);
  }, [stopPreviewBell]);

  const updateDraftConfig = useCallback(
    (updater: (prev: CustomSequenceConfig) => CustomSequenceConfig) => {
      setDraftSequenceConfig((prev) => {
        const next = updater(prev);
        setDraftUndoStack((u) => [...u.slice(-19), cloneSequenceConfig(prev)]);
        setDraftRedoStack([]);
        return next;
      });
      setIntervalInputTexts({});
      setRowInputErrors({});
    },
    []
  );

  const handleUndoDraft = () => {
    if (draftUndoStack.length === 0) return;
    const prevCfg = draftUndoStack[draftUndoStack.length - 1];
    setDraftUndoStack((u) => u.slice(0, -1));
    setDraftRedoStack((r) => [...r.slice(-19), cloneSequenceConfig(draftSequenceConfig)]);
    const cloned = cloneSequenceConfig(prevCfg);
    setDraftSequenceConfig(cloned);
    syncSubjectComboFromNodeIds(cloned.selectedNodeIds);
    setIntervalInputTexts({});
    setRowInputErrors({});
  };

  const handleRedoDraft = () => {
    if (draftRedoStack.length === 0) return;
    const nextCfg = draftRedoStack[draftRedoStack.length - 1];
    setDraftRedoStack((r) => r.slice(0, -1));
    setDraftUndoStack((u) => [...u.slice(-19), cloneSequenceConfig(draftSequenceConfig)]);
    const cloned = cloneSequenceConfig(nextCfg);
    setDraftSequenceConfig(cloned);
    syncSubjectComboFromNodeIds(cloned.selectedNodeIds);
    setIntervalInputTexts({});
    setRowInputErrors({});
  };

  // C5: Start from a specific step in the right timetable WITHOUT mutating customSequenceConfig
  const handleStartFromCustomStep = (rowIndex: number) => {
    if (engineRef.current.phase !== 'idle') {
      showToast('타이머 실행 중에는 구간을 변경할 수 없습니다. CANCEL 후 선택해 주세요.', 3200);
      return;
    }
    const clickedRow = computedSequenceRows[rowIndex];
    if (!clickedRow) return;
    const remainingNodeIds = computedSequenceRows.slice(rowIndex).map((r) => r.node.nodeId);
    const subConfig: CustomSequenceConfig = {
      selectedNodeIds: remainingNodeIds,
      intervalMap: { ...customSequenceConfig.intervalMap },
      intervalSecondsMap: { ...(customSequenceConfig.intervalSecondsMap || {}) },
      firstNodeCustomMinutes: clickedRow.customTimeMinutes,
      mutedNodeIds: [...(customSequenceConfig.mutedNodeIds || [])],
    };
    const built = buildCustomSequencePreset(subConfig);
    if (!built) return;
    setCustomPreset(built);
    setSelectedPresetId(built.id);
    setIsTemporaryStartPoint(rowIndex > 0);
    engineRef.current.preset = built;
    syncUiToPresetIdle(built, clockSyncMode);
    setActiveCustomNodeId(clickedRow.node.nodeId);
    const pPrefix = clickedRow.node.periodLabel !== '-' ? `${clickedRow.node.periodLabel} ` : '';
    showToast(
      `${pPrefix}${clickedRow.node.subjectTitle} · ${clickedRow.node.stageShortLabel} 단계부터 임시 시작 지점으로 설정했습니다.`,
      2800
    );
  };

  // C5: Restore full applied custom sequence from temporary start point
  const handleRestoreFullCustomSequence = () => {
    if (engineRef.current.phase !== 'idle') {
      showToast('타이머 CANCEL 후 전체 구성으로 복귀할 수 있습니다.', 2800);
      return;
    }
    const built = buildCustomSequencePreset(customSequenceConfig);
    if (!built) return;
    setCustomPreset(built);
    setSelectedPresetId(built.id);
    setIsTemporaryStartPoint(false);
    engineRef.current.preset = built;
    syncUiToPresetIdle(built, clockSyncMode);
    showToast('전체 선택 시간표 구성으로 복귀했습니다.', 2400);
  };

  // Builder Modal node/group selection handlers (operating on draftSequenceConfig)
  const handleToggleCueNode = (nodeId: string) => {
    const nodeMeta = CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === nodeId);
    const wasSelected = draftSequenceConfig.selectedNodeIds.includes(nodeId);
    if (!wasSelected && nodeMeta) {
      setSubjAutoChecked((prev) => ({
        ...prev,
        [nodeMeta.subjectGroupId]: true,
      }));
      if (nodeMeta.subjectGroupId === 'inq2') {
        setSubjInqCount(2);
      }
    }
    updateDraftConfig((prev) => {
      const exists = prev.selectedNodeIds.includes(nodeId);
      const nextIds = exists
        ? prev.selectedNodeIds.filter((id) => id !== nodeId)
        : [...prev.selectedNodeIds, nodeId];
      return {
        ...prev,
        selectedNodeIds: nextIds,
      };
    });
  };

  const handleToggleMuteNode = (nodeId: string) => {
    updateDraftConfig((prev) => {
      const currMuted = prev.mutedNodeIds || [];
      const exists = currMuted.includes(nodeId);
      const nextMuted = exists
        ? currMuted.filter((id) => id !== nodeId)
        : [...currMuted, nodeId];
      return {
        ...prev,
        mutedNodeIds: nextMuted,
      };
    });
  };

  const handleToggleSubjectGroup = (groupId: CsatSubjectGroupId, coreOnly = false) => {
    const groupNodes = CSAT_SELECTABLE_CUE_NODES.filter(
      (n) => n.subjectGroupId === groupId && (!coreOnly || n.isCoreExamStage)
    );
    const groupNodeIds = groupNodes.map((n) => n.nodeId);

    updateDraftConfig((prev) => {
      const allSelected = groupNodeIds.every((id) => prev.selectedNodeIds.includes(id));
      let nextIds: string[];
      if (allSelected) {
        nextIds = prev.selectedNodeIds.filter((id) => !groupNodeIds.includes(id));
      } else {
        const set = new Set(prev.selectedNodeIds);
        if (coreOnly) {
          CSAT_SELECTABLE_CUE_NODES.filter((n) => n.subjectGroupId === groupId).forEach((n) =>
            set.delete(n.nodeId)
          );
        }
        groupNodeIds.forEach((id) => set.add(id));
        nextIds = Array.from(set);
      }
      return {
        ...prev,
        selectedNodeIds: nextIds,
      };
    });
  };

  // C6: Bulk selection (Select All / Deselect All / Invert / StageType)
  const handleBulkSelectNodes = (action: 'all' | 'none' | 'invert') => {
    updateDraftConfig((prev) => {
      const allIds = CSAT_SELECTABLE_CUE_NODES.map((n) => n.nodeId);
      if (action === 'all') {
        return { ...prev, selectedNodeIds: allIds };
      }
      if (action === 'none') {
        return { ...prev, selectedNodeIds: [] };
      }
      const currSet = new Set(prev.selectedNodeIds);
      return {
        ...prev,
        selectedNodeIds: allIds.filter((id) => !currSet.has(id)),
      };
    });
  };

  const handleSelectByStageType = (stageType: CsatStageType) => {
    const matchingIds = CSAT_SELECTABLE_CUE_NODES.filter(
      (n) => enabledSubjectGroups.has(n.subjectGroupId) && n.stageType === stageType
    ).map((n) => n.nodeId);
    if (matchingIds.length === 0) return;
    updateDraftConfig((prev) => {
      if (stageSelectMode === 'replace') {
        return { ...prev, selectedNodeIds: matchingIds };
      }
      const allAlreadyIn = matchingIds.every((id) => prev.selectedNodeIds.includes(id));
      if (allAlreadyIn) {
        return {
          ...prev,
          selectedNodeIds: prev.selectedNodeIds.filter((id) => !matchingIds.includes(id)),
        };
      }
      const set = new Set(prev.selectedNodeIds);
      matchingIds.forEach((id) => set.add(id));
      return { ...prev, selectedNodeIds: Array.from(set) };
    });
  };

  const filterGroupNodeIdsByScope = useCallback(
    (groupId: CsatSubjectGroupId, scope: 'all' | 'core' | 'real') =>
      CSAT_SELECTABLE_CUE_NODES.filter((n) => {
        if (n.subjectGroupId !== groupId) return false;
        if (scope === 'core') return Boolean(n.isCoreExamStage);
        if (scope === 'real') return ['main', 'warn', 'end', 'listening'].includes(n.stageType);
        return true;
      }).map((n) => n.nodeId),
    []
  );

  // B3: Live toggle of a subject checkbox in 응시 조합 (immediately syncs selectedNodeIds)
  const handleSubjComboCheckboxToggle = useCallback(
    (groupId: CsatSubjectGroupId) => {
      const nextCheckedVal = !subjAutoChecked[groupId];
      setSubjAutoChecked((prev) => ({ ...prev, [groupId]: nextCheckedVal }));

      const allGroupIds = CSAT_SELECTABLE_CUE_NODES.filter(
        (n) => n.subjectGroupId === groupId
      ).map((n) => n.nodeId);
      const scopedGroupIds = filterGroupNodeIdsByScope(groupId, subjAutoScope);

      updateDraftConfig((prev) => {
        const set = new Set(prev.selectedNodeIds);
        allGroupIds.forEach((id) => set.delete(id));
        if (nextCheckedVal) {
          scopedGroupIds.forEach((id) => set.add(id));
        }
        const orderedIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => set.has(n.nodeId)).map(
          (n) => n.nodeId
        );
        return {
          ...prev,
          selectedNodeIds: orderedIds,
        };
      });
    },
    [filterGroupNodeIdsByScope, subjAutoChecked, subjAutoScope, updateDraftConfig]
  );

  // B3: Live toggle of 탐구 checkbox in 응시 조합
  const handleSubjInqCheckboxToggle = useCallback(() => {
    const currentlyChecked = subjAutoChecked.inq1 || subjAutoChecked.inq2;
    const nextChecked = !currentlyChecked;
    const targetCount = subjInqCount === 1 ? 1 : 2;
    setSubjAutoChecked((prev) => ({
      ...prev,
      inq1: nextChecked,
      inq2: nextChecked && targetCount >= 2,
    }));

    const allInqIds = CSAT_SELECTABLE_CUE_NODES.filter(
      (n) => n.subjectGroupId === 'inq1' || n.subjectGroupId === 'inq2'
    ).map((n) => n.nodeId);
    const inq1Scoped = filterGroupNodeIdsByScope('inq1', subjAutoScope);
    const inq2Scoped = filterGroupNodeIdsByScope('inq2', subjAutoScope);

    updateDraftConfig((prev) => {
      const set = new Set(prev.selectedNodeIds);
      allInqIds.forEach((id) => set.delete(id));
      if (nextChecked) {
        inq1Scoped.forEach((id) => set.add(id));
        if (targetCount >= 2) {
          inq2Scoped.forEach((id) => set.add(id));
        }
      }
      const orderedIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => set.has(n.nodeId)).map(
        (n) => n.nodeId
      );
      return {
        ...prev,
        selectedNodeIds: orderedIds,
      };
    });
  }, [filterGroupNodeIdsByScope, subjAutoChecked.inq1, subjAutoChecked.inq2, subjAutoScope, subjInqCount, updateDraftConfig]);

  // B3: Live change of 탐구 과목 수 (1과목 / 2과목) in 응시 조합
  const handleSubjInqCountSelect = useCallback(
    (nextCount: 1 | 2) => {
      setSubjInqCount(nextCount);
      setSubjAutoChecked((prev) => ({
        ...prev,
        inq1: true,
        inq2: nextCount >= 2,
      }));
      setOpenCustomPopup(null);

      const allInqIds = CSAT_SELECTABLE_CUE_NODES.filter(
        (n) => n.subjectGroupId === 'inq1' || n.subjectGroupId === 'inq2'
      ).map((n) => n.nodeId);
      const inq1Scoped = filterGroupNodeIdsByScope('inq1', subjAutoScope);
      const inq2Scoped = filterGroupNodeIdsByScope('inq2', subjAutoScope);

      updateDraftConfig((prev) => {
        const set = new Set(prev.selectedNodeIds);
        allInqIds.forEach((id) => set.delete(id));
        inq1Scoped.forEach((id) => set.add(id));
        if (nextCount >= 2) {
          inq2Scoped.forEach((id) => set.add(id));
        }
        const orderedIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => set.has(n.nodeId)).map(
          (n) => n.nodeId
        );
        return {
          ...prev,
          selectedNodeIds: orderedIds,
        };
      });
    },
    [filterGroupNodeIdsByScope, subjAutoScope, updateDraftConfig]
  );

  // B3: Live change of 밀도 (전체 타종 / 핵심 단계 / 실전 최소) in 응시 조합
  const handleSubjScopeSelect = useCallback(
    (nextScope: 'all' | 'core' | 'real') => {
      setSubjAutoScope(nextScope);
      setOpenCustomPopup(null);

      const isInqActive = subjAutoChecked.inq1 || subjAutoChecked.inq2;
      const groups = new Set<CsatSubjectGroupId>();
      if (subjAutoChecked.kor) groups.add('kor');
      if (subjAutoChecked.math) groups.add('math');
      if (subjAutoChecked.eng) groups.add('eng');
      if (subjAutoChecked.hist) groups.add('hist');
      if (isInqActive && subjInqCount >= 1) groups.add('inq1');
      if (isInqActive && subjInqCount >= 2) groups.add('inq2');
      if (subjAutoChecked.lang2) groups.add('lang2');

      const nextIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => {
        if (!groups.has(n.subjectGroupId)) return false;
        if (nextScope === 'core') return Boolean(n.isCoreExamStage);
        if (nextScope === 'real') {
          return ['main', 'warn', 'end', 'listening'].includes(n.stageType);
        }
        return true;
      }).map((n) => n.nodeId);

      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: nextIds,
      }));
    },
    [subjAutoChecked, subjInqCount, updateDraftConfig]
  );

  // B3: Subject-based auto configuration (explicit reset intervals + apply)
  const handleApplySubjectAutoBuild = () => {
    const isInqActive = subjAutoChecked.inq1 || subjAutoChecked.inq2;
    const groups = new Set<CsatSubjectGroupId>();
    if (subjAutoChecked.kor) groups.add('kor');
    if (subjAutoChecked.math) groups.add('math');
    if (subjAutoChecked.eng) groups.add('eng');
    if (subjAutoChecked.hist) groups.add('hist');
    if (isInqActive && subjInqCount >= 1) groups.add('inq1');
    if (isInqActive && subjInqCount >= 2) groups.add('inq2');
    if (subjAutoChecked.lang2) groups.add('lang2');

    if (groups.size === 0) {
      showToast('자동 구성할 영역을 최소 1개 이상 선택해 주세요.', 2600);
      return;
    }

    const nextIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => {
      if (!groups.has(n.subjectGroupId)) return false;
      if (subjAutoScope === 'core') return Boolean(n.isCoreExamStage);
      if (subjAutoScope === 'real') {
        return ['main', 'warn', 'end', 'listening'].includes(n.stageType);
      }
      return true;
    }).map((n) => n.nodeId);

    updateDraftConfig((prev) => ({
      ...prev,
      selectedNodeIds: nextIds,
      intervalMap: {},
      intervalSecondsMap: {},
      firstNodeCustomMinutes: null,
    }));
    setIntervalInputTexts({});
    setRowInputErrors({});
    showToast(
      `선택한 ${groups.size}개 영역(${nextIds.length}개 타종)으로 구성을 채웠습니다.`,
      2800
    );
  };

  // B4: Batch interval presets & replacement
  const handleBatchPreset = (preset: 'prep_1' | 'break_3' | 'test_10s') => {
    let changedCount = 0;
    updateDraftConfig((prev) => {
      const analysis = analyzeSequenceConfig(prev);
      const nextMap = { ...prev.intervalMap };
      const nextSecMap = { ...(prev.intervalSecondsMap || {}) };

      analysis.rows.forEach((r) => {
        const key = getIntervalMapKey(r.node.nodeId, r.nextNode ? r.nextNode.nodeId : 'SINGLE_END');
        if (
          preset === 'prep_1' &&
          r.node.stageType === 'prepare' &&
          r.nextNode?.stageType === 'main'
        ) {
          nextMap[key] = 1;
          nextSecMap[key] = 60;
          changedCount++;
        } else if (preset === 'break_3' && r.nextNode && r.isSubjectTransition) {
          nextMap[key] = 3;
          nextSecMap[key] = 180;
          changedCount++;
        } else if (preset === 'test_10s') {
          nextMap[key] = 1;
          nextSecMap[key] = 10;
          changedCount++;
        }
      });

      return {
        ...prev,
        intervalMap: nextMap,
        intervalSecondsMap: nextSecMap,
      };
    });
    setIntervalInputTexts({});
    showToast(
      changedCount > 0
        ? `${changedCount}개 구간의 대기 간격을 일괄 변경했습니다.`
        : '해당 조건에 맞는 구간이 없습니다.',
      2600
    );
  };

  const handleBatchReplace = () => {
    const fromMin = Number(batchFromMin);
    const toMin = clamp(Math.round(Number(batchToMin) || 1), 1, 600);
    if (!Number.isFinite(fromMin) || !Number.isFinite(toMin)) return;
    let changedCount = 0;

    updateDraftConfig((prev) => {
      const analysis = analyzeSequenceConfig(prev);
      const nextMap = { ...prev.intervalMap };
      const nextSecMap = { ...(prev.intervalSecondsMap || {}) };

      analysis.rows.forEach((r) => {
        if (Math.round(r.intervalAfterSeconds / 60) === Math.round(fromMin)) {
          const key = getIntervalMapKey(
            r.node.nodeId,
            r.nextNode ? r.nextNode.nodeId : 'SINGLE_END'
          );
          nextMap[key] = toMin;
          nextSecMap[key] = toMin * 60;
          changedCount++;
        }
      });

      return {
        ...prev,
        intervalMap: nextMap,
        intervalSecondsMap: nextSecMap,
      };
    });
    setIntervalInputTexts({});
    showToast(
      changedCount > 0
        ? `기존 ${fromMin}분 구간 ${changedCount}곳을 ${toMin}분으로 일괄 변경했습니다.`
        : `기존 ${fromMin}분인 구간이 없습니다.`,
      2600
    );
  };

  const handleApplyQuickSequenceTemplate = (
    templateType:
      | 'all_39'
      | 'kor_math_inq1_core'
      | 'all_core'
      | 'kor_core'
      | 'eng_listening_core'
      | 'reset_intervals'
  ) => {
    if (templateType === 'reset_intervals') {
      updateDraftConfig((prev) => ({
        ...prev,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      showToast('선택된 타종 항목들의 간격과 시작 시각을 공식 시간표 기준으로 초기화했습니다.', 2600);
      return;
    }

    if (templateType === 'all_39') {
      const nextIds = CSAT_SELECTABLE_CUE_NODES.map((n) => n.nodeId);
      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: nextIds,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      syncSubjectComboFromNodeIds(nextIds);
      showToast('전체 타종 시간표(38개 항목)가 기본 상태로 설정되었습니다.', 2600);
      return;
    }

    if (templateType === 'kor_math_inq1_core') {
      const nextIds = [
        '004', '005', '006', '007',
        '010', '011', '012', '013',
        '025', '026', '027', '028',
      ];
      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: nextIds,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      syncSubjectComboFromNodeIds(nextIds);
      showToast('국어 · 수학 · 탐구1 핵심 단계(준비·본령·종료전·종료)가 선택되었습니다.', 2600);
      return;
    }

    if (templateType === 'kor_core') {
      const nextIds = ['004', '005', '006', '007'];
      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: nextIds,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      syncSubjectComboFromNodeIds(nextIds);
      showToast('1교시 국어 준비령 · 본령 · 종료10분전 · 종료령이 선택되었습니다.', 2600);
      return;
    }

    if (templateType === 'eng_listening_core') {
      const nextIds = ['016', 'ENG_1307', '017', '018'];
      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: nextIds,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      syncSubjectComboFromNodeIds(nextIds);
      showToast(
        '3교시 영어 준비령 · 13:07 듣기평가 안내방송 및 본령 · 종료10분전 · 종료령이 선택되었습니다.',
        2600
      );
      return;
    }

    if (templateType === 'all_core') {
      const coreIds = CSAT_SELECTABLE_CUE_NODES.filter((n) => n.isCoreExamStage).map(
        (n) => n.nodeId
      );
      updateDraftConfig((prev) => ({
        ...prev,
        selectedNodeIds: coreIds,
        intervalMap: {},
        intervalSecondsMap: {},
        firstNodeCustomMinutes: null,
      }));
      syncSubjectComboFromNodeIds(coreIds);
      showToast('전 영역 핵심 타종 단계가 선택되었습니다.', 2600);
    }
  };

  // ---------- C4: Bookmark & Folder Save / Load / Edit / Move / Duplicate / Overwrite / Delete Undo ----------
  const handleSelectBookmarkFolderFilter = (folderKey: string) => {
    setActiveBookmarkFolderFilter(folderKey);
    if (folderKey === 'all' || folderKey === 'uncategorized') {
      setSaveTargetFolderId('');
    } else {
      setSaveTargetFolderId(folderKey);
    }
    setEditingFolderId(null);
  };

  const handleCreateBookmarkFolder = (rawName: string, closeDrawerInput = true) => {
    const trimmed = rawName.trim().slice(0, 30);
    if (!trimmed) {
      showToast('새 폴더 이름을 입력해 주세요.', 2400);
      return;
    }
    if (bookmarkFolders.some((f) => f.name === trimmed)) {
      showToast(`이미 '${trimmed}' 폴더가 있습니다.`, 2400);
      return;
    }
    const newFolder: BookmarkFolder = {
      id: `bmf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: trimmed,
      createdAt: new Date().toISOString(),
    };
    const nextFolders = [...bookmarkFolders, newFolder];
    setBookmarkFolders(nextFolders);
    bookmarkFoldersRef.current = nextFolders;
    setFolderNameInput('');
    if (closeDrawerInput) {
      setIsDrawerFolderInputOpen(false);
    }
    setIsModalFolderInputOpen(false);
    setActiveBookmarkFolderFilter(newFolder.id);
    setSaveTargetFolderId(newFolder.id);
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      bookmarksRef.current,
      bellVolumeRef.current,
      englishVolumeRef.current,
      keepScreenAwakeRef.current,
      mainBellGlowAnimRef.current,
      prelimBellGlowAnimRef.current,
      timetableOpacityRef.current,
      nextFolders
    );
    showToast(`'${trimmed}' 북마크 폴더가 생성되었습니다.`, 2500);
  };

  const handleRenameBookmarkFolder = (folderId: string, rawName: string) => {
    const trimmed = rawName.trim().slice(0, 30);
    if (!trimmed) {
      showToast('폴더 이름을 입력해 주세요.', 2200);
      return;
    }
    if (bookmarkFolders.some((f) => f.id !== folderId && f.name === trimmed)) {
      showToast(`이미 '${trimmed}' 폴더가 있습니다.`, 2400);
      return;
    }
    const nextFolders = bookmarkFolders.map((f) =>
      f.id === folderId ? { ...f, name: trimmed } : f
    );
    setBookmarkFolders(nextFolders);
    bookmarkFoldersRef.current = nextFolders;
    setEditingFolderId(null);
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      bookmarksRef.current,
      bellVolumeRef.current,
      englishVolumeRef.current,
      keepScreenAwakeRef.current,
      mainBellGlowAnimRef.current,
      prelimBellGlowAnimRef.current,
      timetableOpacityRef.current,
      nextFolders
    );
    showToast(`폴더 이름을 '${trimmed}'(으)로 변경했습니다.`, 2200);
  };

  const handleDeleteBookmarkFolder = (folderId: string) => {
    const targetFolder = bookmarkFolders.find((f) => f.id === folderId);
    if (!targetFolder) return;
    const nextFolders = bookmarkFolders.filter((f) => f.id !== folderId);
    const nextBookmarks = bookmarks.map((b) =>
      b.folderId === folderId ? { ...b, folderId: null } : b
    );
    setBookmarkFolders(nextFolders);
    bookmarkFoldersRef.current = nextFolders;
    setBookmarks(nextBookmarks);
    bookmarksRef.current = nextBookmarks;
    if (activeBookmarkFolderFilter === folderId) {
      setActiveBookmarkFolderFilter('all');
    }
    if (saveTargetFolderId === folderId) {
      setSaveTargetFolderId('');
    }
    if (editingFolderId === folderId) {
      setEditingFolderId(null);
    }
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      nextBookmarks,
      bellVolumeRef.current,
      englishVolumeRef.current,
      keepScreenAwakeRef.current,
      mainBellGlowAnimRef.current,
      prelimBellGlowAnimRef.current,
      timetableOpacityRef.current,
      nextFolders
    );
    showToast(`'${targetFolder.name}' 폴더를 삭제했습니다. 내부 구성은 미분류로 이동되었습니다.`, 2800);
  };

  const handleMoveBookmarkToFolder = (bmId: string, targetFolderId: string | null) => {
    const targetBm = bookmarks.find((b) => b.id === bmId);
    if (!targetBm) return;
    const normalizedFolderId =
      targetFolderId && bookmarkFolders.some((f) => f.id === targetFolderId)
        ? targetFolderId
        : null;
    const nextBookmarks = bookmarks.map((b) =>
      b.id === bmId ? { ...b, folderId: normalizedFolderId } : b
    );
    setBookmarks(nextBookmarks);
    bookmarksRef.current = nextBookmarks;
    setMovingBookmarkId(null);
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      nextBookmarks
    );
    const destFolder = normalizedFolderId
      ? bookmarkFolders.find((f) => f.id === normalizedFolderId)?.name || '폴더'
      : '미분류';
    showToast(`'${targetBm.name}' 구성을 '${destFolder}'(으)로 이동했습니다.`, 2400);
  };

  const executeSaveNewBookmark = (
    finalName: string,
    sourceConfig: CustomSequenceConfig,
    sourceSync: ClockSyncMode,
    overwriteId?: string,
    folderId?: string | null
  ) => {
    const resolvedFolderId =
      folderId !== undefined
        ? folderId && bookmarkFoldersRef.current.some((f) => f.id === folderId)
          ? folderId
          : null
        : saveTargetFolderId && bookmarkFoldersRef.current.some((f) => f.id === saveTargetFolderId)
          ? saveTargetFolderId
          : null;

    let nextBookmarks: SavedSequenceBookmark[];
    if (overwriteId) {
      nextBookmarks = bookmarks.map((b) =>
        b.id === overwriteId
          ? {
              ...b,
              name: finalName,
              folderId: folderId !== undefined ? resolvedFolderId : b.folderId ?? null,
              config: cloneSequenceConfig(sourceConfig),
              clockSyncMode: sourceSync,
              createdAt: new Date().toISOString(),
            }
          : b
      );
    } else {
      const newBm: SavedSequenceBookmark = {
        id: `bm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: finalName,
        folderId: resolvedFolderId,
        config: cloneSequenceConfig(sourceConfig),
        clockSyncMode: sourceSync,
        createdAt: new Date().toISOString(),
      };
      nextBookmarks = [newBm, ...bookmarks];
    }

    setBookmarks(nextBookmarks);
    bookmarksRef.current = nextBookmarks;
    setBookmarkNameInput('');
    setIsDrawerBookmarkInputOpen(false);
    setDuplicateNamePrompt(null);
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      nextBookmarks
    );
    const folderLabel = resolvedFolderId
      ? bookmarkFoldersRef.current.find((f) => f.id === resolvedFolderId)?.name
      : null;
    showToast(
      overwriteId
        ? `'${finalName}' 북마크 구성을 덮어썼습니다.`
        : folderLabel
          ? `'${finalName}' 구성이 '${folderLabel}' 폴더에 저장되었습니다.`
          : `'${finalName}' 구성이 자주 쓰는 타종 구성에 저장되었습니다.`,
      2800
    );
  };

  const handleSaveCurrentAsBookmark = (fromModalDraft = false) => {
    const targetCfg = fromModalDraft ? draftSequenceConfig : customSequenceConfig;
    const targetSync = fromModalDraft ? draftClockSyncMode : clockSyncMode;
    const targetRows = fromModalDraft ? draftRows : computedSequenceRows;

    if (targetRows.length === 0) {
      showToast('최소 1개 이상의 타종 항목을 선택한 뒤 저장해 주세요.', 2800);
      return;
    }
    const rawName = bookmarkNameInput.trim();
    const uniqueSubjects = Array.from(
      new Set(targetRows.map((r) => r.node.subjectTitle.replace(' 영역', '')))
    );
    const autoTitle =
      uniqueSubjects.length <= 2
        ? `${uniqueSubjects.join('·')} (${targetRows.length}단계)`
        : `${uniqueSubjects[0]} 외 ${uniqueSubjects.length - 1}과목 (${targetRows.length}단계)`;
    const finalName = (rawName || autoTitle).slice(0, 60);
    const targetFolderId =
      saveTargetFolderId && bookmarkFolders.some((f) => f.id === saveTargetFolderId)
        ? saveTargetFolderId
        : null;

    const existing = bookmarks.find((b) => b.name === finalName);
    if (existing) {
      setDuplicateNamePrompt({
        name: finalName,
        existingId: existing.id,
        sourceConfig: cloneSequenceConfig(targetCfg),
        sourceSync: targetSync,
        sourceFolderId: targetFolderId,
      });
      return;
    }

    executeSaveNewBookmark(finalName, targetCfg, targetSync, undefined, targetFolderId);
  };

  const handleLoadBookmarkToEditor = (bm: SavedSequenceBookmark) => {
    const { config: sanitizedCfg } = validateConfig(bm.config);
    const nextSync: ClockSyncMode = 'custom_cascaded_time';
    updateDraftConfig(() => sanitizedCfg);
    syncSubjectComboFromNodeIds(sanitizedCfg.selectedNodeIds);
    setDraftClockSyncMode(nextSync);
    showToast(`'${bm.name}' 구성을 편집 화면(임시 상태)으로 불러왔습니다. [선택 구성 저장]을 눌러야 반영됩니다.`, 3000);
  };

  const handleApplyBookmarkDirectly = (bm: SavedSequenceBookmark) => {
    const { config: sanitizedCfg } = validateConfig(bm.config);
    const nextSync: ClockSyncMode = 'custom_cascaded_time';

    if (isBuilderModalOpen) {
      updateDraftConfig(() => sanitizedCfg);
      syncSubjectComboFromNodeIds(sanitizedCfg.selectedNodeIds);
      setDraftClockSyncMode(nextSync);
    }

    setCustomSequenceConfig(sanitizedCfg);
    customSequenceConfigRef.current = sanitizedCfg;
    setClockSyncMode(nextSync);
    clockSyncModeRef.current = nextSync;
    engineRef.current.clockSyncMode = nextSync;
    setIsTemporaryStartPoint(false);

    if (engineRef.current.phase !== 'idle') {
      showToast(
        `'${bm.name}' 구성을 저장했습니다. 타이머에 적용하려면 CANCEL 후 다시 선택해 주세요.`,
        3200
      );
      return;
    }
    const built = buildCustomSequencePreset(sanitizedCfg);
    if (built) {
      setCustomPreset(built);
      setSelectedPresetId(built.id);
      engineRef.current.preset = built;
      syncUiToPresetIdle(built, nextSync);
      saveCustomSettingsToStorage(
        themePref,
        built.id,
        devMode,
        nextSync,
        sanitizedCfg,
        bookmarksRef.current
      );
      showToast(`자주 쓰는 구성 '${bm.name}'으로 타이머가 즉시 설정되었습니다.`, 2800);
    }
  };

  const handleRenameBookmark = (bmId: string, newNameRaw: string) => {
    const trimmed = newNameRaw.trim().slice(0, 60);
    if (!trimmed) return;
    const nextBookmarks = bookmarks.map((b) => (b.id === bmId ? { ...b, name: trimmed } : b));
    setBookmarks(nextBookmarks);
    bookmarksRef.current = nextBookmarks;
    setEditingBookmarkId(null);
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      nextBookmarks
    );
    showToast(`북마크 이름을 '${trimmed}'(으)로 변경했습니다.`, 2200);
  };

  const handleDuplicateBookmark = (bm: SavedSequenceBookmark) => {
    const copyName = `${bm.name} (복사)`.slice(0, 60);
    executeSaveNewBookmark(copyName, bm.config, bm.clockSyncMode, undefined, bm.folderId ?? null);
  };

  const handleOverwriteBookmark = (bm: SavedSequenceBookmark, useDraft = false) => {
    const srcCfg = useDraft ? draftSequenceConfig : customSequenceConfig;
    const srcSync = useDraft ? draftClockSyncMode : clockSyncMode;
    executeSaveNewBookmark(bm.name, srcCfg, srcSync, bm.id, bm.folderId ?? null);
  };

  const handleDeleteBookmark = (bmId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = bookmarks.findIndex((b) => b.id === bmId);
    if (idx === -1) return;
    const target = bookmarks[idx];
    const nextBookmarks = bookmarks.filter((b) => b.id !== bmId);
    setBookmarks(nextBookmarks);
    bookmarksRef.current = nextBookmarks;
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      nextBookmarks
    );

    if (undoDeleteTimerRef.current) {
      window.clearTimeout(undoDeleteTimerRef.current);
    }
    setDeletedBookmarkUndo({ bookmark: target, index: idx });
    undoDeleteTimerRef.current = window.setTimeout(() => {
      setDeletedBookmarkUndo(null);
    }, 5000);
  };

  const handleUndoDeleteBookmark = () => {
    if (!deletedBookmarkUndo) return;
    const { bookmark, index } = deletedBookmarkUndo;
    const next = [...bookmarks];
    next.splice(Math.min(index, next.length), 0, bookmark);
    setBookmarks(next);
    bookmarksRef.current = next;
    setDeletedBookmarkUndo(null);
    if (undoDeleteTimerRef.current) {
      window.clearTimeout(undoDeleteTimerRef.current);
    }
    saveCustomSettingsToStorage(
      themePref,
      selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      next
    );
    showToast(`'${bookmark.name}' 북마크 삭제를 취소했습니다.`, 2400);
  };

  // B7 & C3: Change interval in seconds (with validation)
  const handleSetIntervalSeconds = (
    fromNode: CsatSelectableCueNode,
    toNode: CsatSelectableCueNode | null,
    nextSecondsRaw: number
  ) => {
    const clampedSec = clamp(Math.round(nextSecondsRaw || 60), 10, 600 * 60);
    const clampedMin = Math.max(1, Math.round(clampedSec / 60));
    const key = getIntervalMapKey(fromNode.nodeId, toNode ? toNode.nodeId : 'SINGLE_END');

    updateDraftConfig((prev) => ({
      ...prev,
      intervalMap: {
        ...prev.intervalMap,
        [key]: clampedMin,
      },
      intervalSecondsMap: {
        ...(prev.intervalSecondsMap || {}),
        [key]: clampedSec,
      },
    }));
  };

  const handleIntervalTextCommit = (
    fromNode: CsatSelectableCueNode,
    toNode: CsatSelectableCueNode | null,
    rawText: string
  ) => {
    const key = getIntervalMapKey(fromNode.nodeId, toNode ? toNode.nodeId : 'SINGLE_END');
    const v = validateIntervalInput(rawText);
    if (!v.ok || v.seconds === undefined) {
      setRowInputErrors((prev) => ({ ...prev, [`int_${key}`]: v.reason || '입력 오류' }));
      return;
    }
    setRowInputErrors((prev) => {
      const next = { ...prev };
      delete next[`int_${key}`];
      return next;
    });
    handleSetIntervalSeconds(fromNode, toNode, v.seconds);
  };

  // C3: Direct time input validation & update (preserves subsequent row times when valid)
  const handleDirectTimeInputChange = (
    rowIndex: number,
    newHmValue: string
  ): { ok: boolean; error?: string } => {
    const currRow = draftRows[rowIndex];
    if (!currRow) return { ok: false, error: '항목을 찾을 수 없습니다.' };
    const prevRow = rowIndex > 0 ? draftRows[rowIndex - 1] : null;
    const nextRow = rowIndex < draftRows.length - 1 ? draftRows[rowIndex + 1] : null;
    const errKey = `time_${currRow.node.nodeId}`;

    const val = validateRowTimeInput(
      newHmValue,
      prevRow ? prevRow.customTimeSeconds : null,
      rowIndex === 0
    );
    if (!val.ok || val.secondsFromMidnight === undefined) {
      const errMsg = val.reason || '시각 입력 오류';
      setRowInputErrors((prev) => ({ ...prev, [errKey]: errMsg }));
      return { ok: false, error: errMsg };
    }

    setRowInputErrors((prev) => {
      const next = { ...prev };
      delete next[errKey];
      return next;
    });

    if (rowIndex === 0) {
      const targetSec = val.secondsFromMidnight;
      const targetMin = targetSec / 60;
      updateDraftConfig((prev) => {
        const nextIntervalMap = { ...prev.intervalMap };
        const nextIntervalSecondsMap = { ...(prev.intervalSecondsMap || {}) };
        if (nextRow) {
          const afterSec = nextRow.customTimeSeconds - targetSec;
          if (afterSec >= 10 && afterSec <= 36000) {
            const afterKey = getIntervalMapKey(currRow.node.nodeId, nextRow.node.nodeId);
            nextIntervalSecondsMap[afterKey] = Math.round(afterSec);
            nextIntervalMap[afterKey] = Math.max(1, Math.round(afterSec / 60));
          }
        }
        return {
          ...prev,
          firstNodeCustomMinutes: targetMin,
          intervalMap: nextIntervalMap,
          intervalSecondsMap: nextIntervalSecondsMap,
        };
      });
      return { ok: true };
    }

    if (prevRow && val.intervalSeconds !== undefined) {
      const clampedPrevSec = clamp(Math.round(val.intervalSeconds), 10, 36000);
      const clampedPrevMin = Math.max(1, Math.round(clampedPrevSec / 60));
      const prevKey = getIntervalMapKey(prevRow.node.nodeId, currRow.node.nodeId);
      const newCurrSec = prevRow.customTimeSeconds + clampedPrevSec;

      updateDraftConfig((prev) => {
        const nextIntervalMap = {
          ...prev.intervalMap,
          [prevKey]: clampedPrevMin,
        };
        const nextIntervalSecondsMap = {
          ...(prev.intervalSecondsMap || {}),
          [prevKey]: clampedPrevSec,
        };
        if (nextRow) {
          const afterSec = nextRow.customTimeSeconds - newCurrSec;
          if (afterSec >= 10 && afterSec <= 36000) {
            const afterKey = getIntervalMapKey(currRow.node.nodeId, nextRow.node.nodeId);
            nextIntervalSecondsMap[afterKey] = Math.round(afterSec);
            nextIntervalMap[afterKey] = Math.max(1, Math.round(afterSec / 60));
          }
        }
        return {
          ...prev,
          intervalMap: nextIntervalMap,
          intervalSecondsMap: nextIntervalSecondsMap,
        };
      });
      return { ok: true };
    }

    return { ok: false, error: '시각을 반영할 수 없습니다.' };
  };

  // C1: Apply draft to customSequenceConfig and currentPreset
  const commitCustomSequenceToTimer = () => {
    const built = buildCustomSequencePreset(draftSequenceConfig);
    if (!built) {
      showToast('최소 1개 이상의 타종 항목을 체크박스로 선택해 주세요.', 3000);
      return;
    }

    const st = engineRef.current;
    if (st.phase === 'rise' || st.phase === 'hold') {
      if (st.rafId) cancelAnimationFrame(st.rafId);
      if (runAuxHideTimerRef.current) {
        window.clearTimeout(runAuxHideTimerRef.current);
        runAuxHideTimerRef.current = null;
      }
      stopBell();
      stopEnglishAudio();
      exitFullscreenSilently();
      if (!keepScreenAwakeRef.current) {
        releaseWakeLock();
      }
      st.isPaused = false;
      st.dH = st.H;
      st.dT = st.kT;
      st.dHnd = st.kH;
      st.dX = st.kX;
      st.phase = 'drop';
      st.t0 = performance.now();

      canJumpPrevBellRef.current = false;
      canJumpNextBellRef.current = false;
      setCanJumpPrevBell(false);
      setCanJumpNextBell(false);
      setIsRunningUi(false);
      setIsRunAuxRevealed(false);
      setPauseLabel('PAUSE');

      st.rafId = requestAnimationFrame(stepAnimationFrame);
    }

    const committedCfg = cloneSequenceConfig(draftSequenceConfig);
    setCustomSequenceConfig(committedCfg);
    customSequenceConfigRef.current = committedCfg;
    setClockSyncMode(draftClockSyncMode);
    clockSyncModeRef.current = draftClockSyncMode;
    setIsTemporaryStartPoint(false);

    setCustomPreset(built);
    setSelectedPresetId(built.id);
    st.preset = built;
    st.clockSyncMode = draftClockSyncMode;
    syncUiToPresetIdle(built, draftClockSyncMode);
    saveCustomSettingsToStorage(
      themePref,
      built.id,
      devMode,
      draftClockSyncMode,
      committedCfg
    );
    stopPreviewBell();
    setIsRunningSaveConfirmOpen(false);
    setIsBuilderModalOpen(false);
  };

  const handleApplyCustomSequenceToTimer = () => {
    if (Object.keys(rowInputErrors).length > 0) {
      showToast('입력 오류가 있는 항목을 먼저 수정해 주세요.', 3000);
      return;
    }
    const built = buildCustomSequencePreset(draftSequenceConfig);
    if (!built) {
      showToast('최소 1개 이상의 타종 항목을 체크박스로 선택해 주세요.', 3000);
      return;
    }
    if (engineRef.current.phase !== 'idle') {
      setIsRunningSaveConfirmOpen(true);
      return;
    }
    commitCustomSequenceToTimer();
  };

  const handleEnglishFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (audioRef.current.englishObjectUrl) {
      URL.revokeObjectURL(audioRef.current.englishObjectUrl);
    }
    const objUrl = URL.createObjectURL(file);
    audioRef.current.englishObjectUrl = objUrl;
    audioRef.current.englishFileName = file.name;
    if (audioRef.current.englishAudio) {
      audioRef.current.englishAudio.src = objUrl;
      audioRef.current.englishAudio.volume = clamp(englishVolumeRef.current / 100, 0, 1);
      audioRef.current.englishAudio.load();
    }
    setEnglishFileName(file.name);
    showToast(`영어 듣기평가 음원 설정 완료: ${file.name}`, 3000);
  };

  const handleExportCustomJson = () => {
    const payload = {
      app: '대학수학능력시험 안내방송',
      exportedAt: new Date().toISOString(),
      themePref,
      presetId: selectedPresetId,
      devMode,
      clockSyncMode,
      customSequenceConfig,
      bookmarkFolders,
      bookmarks,
      bellVolume,
      englishVolume,
      keepScreenAwake,
      mainBellGlowAnim,
      prelimBellGlowAnim,
      timetableOpacity,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csat-timer-custom-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('사용자 커스텀 설정(선택 영역·간격·음소거·볼륨·북마크·테마)이 JSON 파일로 저장되었습니다.', 3000);
  };

  // A3: Safe JSON Import with schema validation & correction count
  const handleImportCustomJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object') {
          showToast('유효하지 않은 설정 JSON 파일입니다.', 3000);
          return;
        }
        let correctedTotal = 0;
        let nextTheme = themePref;
        let nextPreset = selectedPresetId;
        let nextDev = devMode;
        let nextSyncMode = clockSyncMode;
        let nextSeqConfig = customSequenceConfig;
        let nextBookmarkFolders = bookmarkFolders;
        let nextBookmarks = bookmarks;
        let nextBellVol = bellVolume;
        let nextEngVol = englishVolume;
        let nextKeepAwake = keepScreenAwake;
        let nextMainGlow = mainBellGlowAnim;
        let nextPrelimGlow = prelimBellGlowAnim;
        let nextTtOpacity = timetableOpacity;

        if (data.themePref && VALID_THEME_PREFS.includes(data.themePref)) {
          nextTheme = data.themePref as ThemePreference;
          setThemePref(nextTheme);
          resolveAndApplyTheme(nextTheme);
        }
        if (data.clockSyncMode) {
          nextSyncMode = 'custom_cascaded_time';
          setClockSyncMode(nextSyncMode);
          clockSyncModeRef.current = nextSyncMode;
          engineRef.current.clockSyncMode = nextSyncMode;
        }
        if (data.customSequenceConfig) {
          const cfgVal = validateConfig(data.customSequenceConfig);
          nextSeqConfig = cfgVal.config;
          correctedTotal += cfgVal.correctedCount;
          setCustomSequenceConfig(nextSeqConfig);
          customSequenceConfigRef.current = nextSeqConfig;
          if (isBuilderModalOpen) {
            setDraftSequenceConfig(cloneSequenceConfig(nextSeqConfig));
            syncSubjectComboFromNodeIds(nextSeqConfig.selectedNodeIds);
          }
        }
        if (Array.isArray(data.bookmarkFolders)) {
          const folderVal = validateBookmarkFolders(data.bookmarkFolders);
          nextBookmarkFolders = folderVal.folders;
          correctedTotal += folderVal.correctedCount;
          setBookmarkFolders(nextBookmarkFolders);
          bookmarkFoldersRef.current = nextBookmarkFolders;
        }
        if (Array.isArray(data.bookmarks)) {
          const validFolderIds = new Set(nextBookmarkFolders.map((f) => f.id));
          const bmVal = validateBookmarks(data.bookmarks, validFolderIds);
          nextBookmarks = bmVal.bookmarks;
          correctedTotal += bmVal.correctedCount;
          setBookmarks(nextBookmarks);
          bookmarksRef.current = nextBookmarks;
        }
        if (typeof data.bellVolume === 'number' && !Number.isNaN(data.bellVolume)) {
          nextBellVol = clamp(Math.round(data.bellVolume), 0, 100);
          setBellVolume(nextBellVol);
        }
        if (typeof data.englishVolume === 'number' && !Number.isNaN(data.englishVolume)) {
          nextEngVol = clamp(Math.round(data.englishVolume), 0, 100);
          setEnglishVolume(nextEngVol);
        }
        if (typeof data.keepScreenAwake === 'boolean') {
          nextKeepAwake = data.keepScreenAwake;
          setKeepScreenAwake(nextKeepAwake);
          keepScreenAwakeRef.current = nextKeepAwake;
        }
        if (typeof data.mainBellGlowAnim === 'boolean') {
          nextMainGlow = data.mainBellGlowAnim;
          setMainBellGlowAnim(nextMainGlow);
          mainBellGlowAnimRef.current = nextMainGlow;
        }
        if (typeof data.prelimBellGlowAnim === 'boolean') {
          nextPrelimGlow = data.prelimBellGlowAnim;
          setPrelimBellGlowAnim(nextPrelimGlow);
          prelimBellGlowAnimRef.current = nextPrelimGlow;
        }
        if (typeof data.timetableOpacity === 'number' && !Number.isNaN(data.timetableOpacity)) {
          nextTtOpacity = clamp(Math.round(data.timetableOpacity), 45, 98);
          setTimetableOpacity(nextTtOpacity);
          timetableOpacityRef.current = nextTtOpacity;
        }
        if (data.presetId && engineRef.current.phase === 'idle') {
          if (data.presetId === 'custom_checkbox_sequence') {
            const built = buildCustomSequencePreset(nextSeqConfig);
            if (built) {
              nextPreset = built.id;
              setCustomPreset(built);
              setSelectedPresetId(built.id);
              setIsTemporaryStartPoint(false);
              engineRef.current.preset = built;
              syncUiToPresetIdle(built, nextSyncMode);
            }
          } else {
            const found = CSAT_SESSION_PRESETS.find((p) => p.id === data.presetId);
            if (found) {
              nextPreset = found.id;
              setSelectedPresetId(found.id);
              setIsTemporaryStartPoint(false);
              engineRef.current.preset = found;
              syncUiToPresetIdle(found, nextSyncMode);
            }
          }
        }
        if (typeof data.devMode === 'boolean') {
          nextDev = data.devMode;
          setDevMode(nextDev);
        }
        saveCustomSettingsToStorage(
          nextTheme,
          nextPreset,
          nextDev,
          nextSyncMode,
          nextSeqConfig,
          nextBookmarks,
          nextBellVol,
          nextEngVol,
          nextKeepAwake,
          nextMainGlow,
          nextPrelimGlow,
          nextTtOpacity,
          nextBookmarkFolders
        );
        showToast(
          correctedTotal > 0
            ? `설정 JSON을 불러왔습니다 (유효하지 않은 값 ${correctedTotal}건 자동 보정됨).`
            : '사용자 커스텀 설정 JSON을 불러왔습니다.',
          3200
        );
      } catch {
        showToast('유효하지 않은 설정 JSON 파일입니다.', 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadStandaloneHtml = async () => {
    if (isExportingHtml) return;
    setIsExportingHtml(true);
    showToast(
      '기본 타종 음원 37개 MP3를 단일 HTML 내부에 인코딩하여 패키징하고 있습니다...',
      6000
    );

    try {
      const mp3DataUris = await loadAll37BellMp3DataUris();
      const loadedCount = Object.keys(mp3DataUris).length;
      setEmbeddedBellCount(loadedCount);

      const htmlContent = buildStandaloneCsatHtml(mp3DataUris);
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '수능_타종_타이머_단일패키지.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('공유됨', 3200);
    } catch {
      showToast('단일 HTML 패키징 중 오류가 발생했습니다.', 3500);
    } finally {
      setIsExportingHtml(false);
    }
  };

  useEffect(() => {
    if (!isBuilderModalOpen && !isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRunningSaveConfirmOpen) {
          setIsRunningSaveConfirmOpen(false);
          return;
        }
        if (isBuilderModalOpen) closeBuilderModalWithoutSaving();
        if (isModalOpen) {
          stopPreviewBell();
          setIsModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeBuilderModalWithoutSaving, isBuilderModalOpen, isModalOpen, isRunningSaveConfirmOpen, stopPreviewBell]);

  const totalDraftSeconds = draftAnalysis.totalWaitSeconds;
  const totalDraftMinutes = Math.round(totalDraftSeconds / 60);

  return (
    <>
      <svg className="svg-filters" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <filter
          id="glass-lens-light"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
          x="-0.08"
          y="-0.16"
          width="1.16"
          height="1.32"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            id="glass-map-light"
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter
          id="glass-lens-dark"
          filterUnits="objectBoundingBox"
          primitiveUnits="objectBoundingBox"
          x="-0.08"
          y="-0.16"
          width="1.16"
          height="1.32"
          colorInterpolationFilters="sRGB"
        >
          <feImage
            id="glass-map-dark"
            x="0"
            y="0"
            width="1"
            height="1"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="18"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      <canvas id="c" ref={canvasRef} />
      <video
        id="wakeLockVideo"
        ref={wakeLockVideoRef}
        muted
        playsInline
        loop
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* 검색 엔진(Google 등) 및 웹 접근성을 위한 시맨틱 설명 영역 (시계 화면은 깔끔하게 유지) */}
      <section className="seo-semantic-region" aria-label="2027학년도 대학수학능력시험 시험장 안내방송 소개">
        <h1>2027학년도 대학수학능력시험 시험장 안내방송 구현</h1>
        <p>
          수능 타종 · 수능 방송 · 수능 알림 · 실제 수능 시험장 안내방송 37개 공식 타종 음원과 3교시 영어
          듣기평가 자동 재생, 영역별 타종 체크박스 선택 및 시간 간격·시각 설정을 지원하는 수능 시계 및
          실전 모의고사 타이머 웹 애플리케이션입니다.
        </p>
      </section>

      <div id="ui">
        <h1 id="title" ref={titleRef} style={{ opacity: 0 }}>
          국어 영역
        </h1>
        <div
          id="face"
          ref={faceRef}
          className={`${isRunningUi ? 'is-interactive' : ''} ${
            grabbedHand ? 'is-hand-dragging' : ''
          }`}
        >
          <svg viewBox="-109 -109 218 218">
            <defs>
              <radialGradient id="gl" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#ffb9a4" stopOpacity=".30" data-base-op="0.30" />
                <stop offset="1" stopColor="#ffd9a8" stopOpacity="0" />
              </radialGradient>
              {/* 다크 모드 전용 오로라 시계 바탕 블러 그라데이션 (진한 파랑 · 보라 · 초록) */}
              <radialGradient id="gl-dark-violet" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#5a3d9a" stopOpacity=".46" data-base-op="0.46" />
                <stop offset=".52" stopColor="#3c2f74" stopOpacity=".22" data-base-op="0.22" />
                <stop offset="1" stopColor="#1d1b38" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gl-dark-blue" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#2c3a84" stopOpacity=".44" data-base-op="0.44" />
                <stop offset=".55" stopColor="#222d66" stopOpacity=".18" data-base-op="0.18" />
                <stop offset="1" stopColor="#141a38" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gl-dark-green" cx=".5" cy=".5" r=".5">
                <stop offset="0" stopColor="#1e876c" stopOpacity=".48" data-base-op="0.48" />
                <stop offset=".48" stopColor="#1a6354" stopOpacity=".22" data-base-op="0.22" />
                <stop offset="1" stopColor="#122b2a" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#b3308f" />
                <stop offset=".55" stopColor="#d9568a" />
                <stop offset="1" stopColor="#f6ac5e" />
              </linearGradient>
              {/* 다크 모드 전용 오로라 시침 캡슐 그라데이션 (진한 파랑 -> 보라 -> 에메랄드 초록) */}
              <linearGradient id="pg-dark" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3a4ba8" />
                <stop offset=".5" stopColor="#583d96" />
                <stop offset="1" stopColor="#1f856b" />
              </linearGradient>
              <filter id="in" x="-20%" y="-20%" width="140%" height="140%">
                <feFlood floodColor="#3a0828" floodOpacity=".6" result="c" />
                <feComposite in="c" in2="SourceAlpha" operator="out" result="inv" />
                <feOffset in="inv" dx="1.8" dy="2.6" result="off" />
                <feGaussianBlur in="off" stdDeviation="1.8" result="bl" />
                <feComposite in="bl" in2="SourceAlpha" operator="in" result="sh" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="sh" />
                </feMerge>
              </filter>
              <filter id="in-dark" x="-20%" y="-20%" width="140%" height="140%">
                <feFlood floodColor="#091026" floodOpacity=".65" result="c" />
                <feComposite in="c" in2="SourceAlpha" operator="out" result="inv" />
                <feOffset in="inv" dx="1.8" dy="2.6" result="off" />
                <feGaussianBlur in="off" stdDeviation="1.8" result="bl" />
                <feComposite in="bl" in2="SourceAlpha" operator="in" result="sh" />
                <feMerge>
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="sh" />
                </feMerge>
              </filter>
              <filter id="ds" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx=".9"
                  dy="1.4"
                  stdDeviation=".9"
                  floodColor="#000"
                  floodOpacity=".28"
                />
              </filter>
            </defs>

            <g id="tk" ref={tkRef} style={{ opacity: 0 }}>
              <g id="clockGlowBoostGroup" ref={clockGlowBoostRef}>
                <g className="clock-glow-light">
                  <circle cx="-4" cy="-22" r="70" fill="url(#gl)" />
                </g>
                <g className="clock-glow-dark">
                  <circle cx="-34" cy="-26" r="68" fill="url(#gl-dark-blue)" />
                  <circle cx="-10" cy="18" r="76" fill="url(#gl-dark-violet)" />
                  <circle cx="24" cy="-14" r="62" fill="url(#gl-dark-green)" />
                </g>
              </g>
              {CLOCK_TICKS.map((t) => (
                <line
                  key={t.key}
                  className={t.isMajor ? 'tick-major' : 'tick-minor'}
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.isMajor ? 'var(--tick-major)' : 'var(--tick-minor)'}
                  strokeWidth={t.strokeWidth}
                />
              ))}
            </g>

            <g id="hd" ref={hdRef} style={{ opacity: 0 }}>
              <g
                id="hourHand"
                ref={hourHandRef}
                transform="rotate(175)"
                className={`clock-hand-interactive ${grabbedHand === 'hour' ? 'is-grabbed' : ''}`}
                onPointerDown={(e) => handleHandPointerDown('hour', e)}
                onPointerMove={handleHandPointerMove}
                onPointerUp={handleHandPointerUp}
                onPointerCancel={handleHandPointerUp}
              >
                <rect
                  className="hand-hit-target"
                  x="8"
                  y="-18"
                  width="74"
                  height="36"
                  rx="18"
                  fill="transparent"
                />
                <g className="hour-hand-light" filter="url(#in)">
                  <rect x="13" y="-12.5" width="64" height="25" rx="12.5" fill="url(#pg)" />
                </g>
                <g className="hour-hand-dark" filter="url(#in-dark)">
                  <rect x="13" y="-12.5" width="64" height="25" rx="12.5" fill="url(#pg-dark)" />
                </g>
              </g>
              <g
                id="minHandGroup"
                className={`clock-hand-interactive ${grabbedHand === 'min' ? 'is-grabbed' : ''}`}
                onPointerDown={(e) => handleHandPointerDown('min', e)}
                onPointerMove={handleHandPointerMove}
                onPointerUp={handleHandPointerUp}
                onPointerCancel={handleHandPointerUp}
              >
                <line
                  ref={minHandHitRef}
                  className="hand-hit-target"
                  x1="-5.00"
                  y1="8.66"
                  x2="-44.00"
                  y2="76.21"
                  stroke="transparent"
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                <line
                  id="minHand"
                  ref={minHandRef}
                  x1="0"
                  y1="0"
                  x2="-44.00"
                  y2="76.21"
                  stroke="var(--min-hand)"
                  strokeWidth="2.3"
                  strokeLinecap="round"
                  filter="url(#ds)"
                />
              </g>
              <g filter="url(#ds)">
                <g
                  id="secHand"
                  ref={secHandRef}
                  transform="rotate(0)"
                  className={`clock-hand-interactive ${grabbedHand === 'sec' ? 'is-grabbed' : ''}`}
                  onPointerDown={(e) => handleHandPointerDown('sec', e)}
                  onPointerMove={handleHandPointerMove}
                  onPointerUp={handleHandPointerUp}
                  onPointerCancel={handleHandPointerUp}
                >
                  <line
                    className="hand-hit-target"
                    x1="0"
                    y1="18"
                    x2="0"
                    y2="-94"
                    stroke="transparent"
                    strokeWidth="16"
                    strokeLinecap="round"
                  />
                  <line
                    x1="0"
                    y1="18"
                    x2="0"
                    y2="-92"
                    stroke="var(--sec-hand)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                  <circle cx="0" cy="0" r="2.7" fill="var(--sec-hand)" />
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div id="lab" ref={labRef} style={{ opacity: 0 }}>
          <div id="startLab" ref={startLabRef}>
            START - TIME
            <br />
            08:35 A.M.
          </div>
          <div id="centerStat">
            <div id="remainDigits" ref={remainDigitsRef}>
              05:00
            </div>
            <div id="stageBadge" ref={stageBadgeRef}>
              1교시 · 준비령 대기
            </div>
          </div>
          <div id="endLab" ref={endLabRef}>
            END - TIME
            <br />
            08:40 A.M.
          </div>
        </div>
      </div>

      {/* 상단 알림 배너 */}
      <div
        id="toastNotice"
        className={toastVisible ? 'show' : ''}
        role="status"
        aria-live="polite"
      >
        {toastMsg}
      </div>

      {/* 숨겨진 파일 입력 엘리먼트 */}
      <input
        ref={engFileInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleEnglishFileChange}
      />
      <input
        ref={configJsonInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleImportCustomJson}
      />

      {/* 좌측 상단 햄버거 메뉴 바 */}
      <div id="topLeftMenu" ref={topLeftMenuRef}>
        <div className="top-left-bar">
          <button
            id="hamburgerBtn"
            className="lg-btn"
            type="button"
            onClick={() => {
              setIsMenuOpen((prev) => {
                const next = !prev;
                setActiveMenuCategory(null);
                setIsBookmarkCardOpen(false);
                return next;
              });
            }}
            aria-expanded={isMenuOpen}
            aria-label="메뉴 열기/닫기"
            title="메뉴"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              {isMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>

          <button
            id="fullscreenBtn"
            className={`lg-btn ${isMenuOpen ? 'is-open' : 'is-closed'} ${
              isFullscreen ? 'is-selected' : ''
            }`}
            type="button"
            onClick={handleToggleFullscreen}
            aria-hidden={!isMenuOpen}
            tabIndex={isMenuOpen ? 0 : -1}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? '전체 화면 종료' : '전체 화면'}
            title={isFullscreen ? '전체 화면 종료' : '전체 화면'}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {isFullscreen ? (
                <>
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="14" y1="10" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              ) : (
                <>
                  <polyline points="15 3 21 3 21 9" />
                  <polyline points="9 21 3 21 3 15" />
                  <line x1="21" y1="3" x2="14" y2="10" />
                  <line x1="3" y1="21" x2="10" y2="14" />
                </>
              )}
            </svg>
          </button>
        </div>

        <div id="pillDrawer" className={isMenuOpen ? 'open' : 'closed'}>
          <div className="ld-master-col" role="tablist" aria-label="설정 범주 목록">
            {(activeMenuCategory === null || activeMenuCategory === 'schedule_audio') && (
              <button
                type="button"
                role="tab"
                aria-selected={activeMenuCategory === 'schedule_audio'}
                className={`lg-btn ld-cat-btn ${
                  activeMenuCategory === 'schedule_audio' ? 'is-selected' : ''
                }`}
                onClick={() => {
                  setIsBookmarkCardOpen(false);
                  setActiveMenuCategory((prev) =>
                    prev === 'schedule_audio' ? null : 'schedule_audio'
                  );
                }}
              >
                <span>타종 · 듣기 설정</span>
                <span className="ld-cat-arrow">
                  {activeMenuCategory === 'schedule_audio' ? '‹' : '›'}
                </span>
              </button>
            )}

            {(activeMenuCategory === null || activeMenuCategory === 'ui_theme') && (
              <button
                type="button"
                role="tab"
                aria-selected={activeMenuCategory === 'ui_theme'}
                className={`lg-btn ld-cat-btn ${
                  activeMenuCategory === 'ui_theme' ? 'is-selected' : ''
                }`}
                onClick={() => {
                  setIsBookmarkCardOpen(false);
                  setActiveMenuCategory((prev) => (prev === 'ui_theme' ? null : 'ui_theme'));
                }}
              >
                <span>화면 · UI</span>
                <span className="ld-cat-arrow">
                  {activeMenuCategory === 'ui_theme' ? '‹' : '›'}
                </span>
              </button>
            )}

            {(activeMenuCategory === null || activeMenuCategory === 'data_export') && (
              <button
                type="button"
                role="tab"
                aria-selected={activeMenuCategory === 'data_export'}
                className={`lg-btn ld-cat-btn ${
                  activeMenuCategory === 'data_export' ? 'is-selected' : ''
                }`}
                onClick={() => {
                  setIsBookmarkCardOpen(false);
                  setActiveMenuCategory((prev) =>
                    prev === 'data_export' ? null : 'data_export'
                  );
                }}
              >
                <span>데이터 · 설정</span>
                <span className="ld-cat-arrow">
                  {activeMenuCategory === 'data_export' ? '‹' : '›'}
                </span>
              </button>
            )}
          </div>

          {activeMenuCategory !== null && (
            <div className="ld-detail-col" key={activeMenuCategory}>
              {activeMenuCategory === 'schedule_audio' && (
                <>
                  <button
                    type="button"
                    className="lg-btn lg-sub-btn"
                    onClick={() => openBuilderModal()}
                    title="체크박스로 영역·타종을 선택하고 각 타종 간격과 시각을 직접 설정하는 전용 창 열기"
                  >
                    <span>
                      영역 · 타종 선택 구성 ({customSequenceConfig.selectedNodeIds.length}개 선택)
                    </span>
                  </button>

                  <button
                    type="button"
                    className="lg-btn lg-sub-btn"
                    onClick={() => engFileInputRef.current?.click()}
                    title="3교시 영어 듣기평가 음원 파일 선택 (13:07 자동 재생)"
                  >
                    <span
                      style={{
                        maxWidth: 235,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {englishFileName ? `듣기 음원: ${englishFileName}` : '듣기 음원 선택 (13:07)'}
                    </span>
                  </button>

                  {/* B5: 전역 타종 음량 & 영어 듣기 음량 슬라이더 */}
                  <div className="drawer-card-panel" aria-label="음량 설정">
                    <div className="drawer-card-title">
                      <span>타종 · 듣기 음량 조절</span>
                      <span>
                        {(customSequenceConfig.mutedNodeIds?.length || 0) > 0
                          ? `무음 ${customSequenceConfig.mutedNodeIds?.length}개`
                          : '전체 활성'}
                      </span>
                    </div>
                    <label className="vol-control-row">
                      <span>타종 음량</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={bellVolume}
                        className="vol-slider"
                        style={{ '--slider-pct': `${bellVolume}%` } as React.CSSProperties}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setBellVolume(v);
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            v,
                            englishVolume
                          );
                        }}
                      />
                      <span className="vol-val">{bellVolume}%</span>
                    </label>
                    <label className="vol-control-row">
                      <span>듣기 음량</span>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={englishVolume}
                        className="vol-slider"
                        style={{ '--slider-pct': `${englishVolume}%` } as React.CSSProperties}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setEnglishVolume(v);
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            bellVolume,
                            v
                          );
                        }}
                      />
                      <span className="vol-val">{englishVolume}%</span>
                    </label>
                  </div>

                  {/* B8: 예약 시작 설정 (커스텀 시간 선택 팝업 적용) */}
                  <div
                    className="drawer-card-panel"
                    aria-label="예약 시작 설정"
                    style={{ position: 'relative', zIndex: openCustomPopup === 'sched_time' ? 60 : 1 }}
                  >
                    <div className="drawer-card-title">
                      <span>예약 시작 (실제 시각 기준)</span>
                      {scheduledTargetMs !== null && <span>대기 중</span>}
                    </div>
                    <div className="sched-control-row">
                      <div className="custom-select-wrap" style={{ flex: 1 }}>
                        <button
                          type="button"
                          className={`custom-time-trigger ${
                            openCustomPopup === 'sched_time' ? 'is-open' : ''
                          }`}
                          style={{ width: '100%', justifyContent: 'space-between' }}
                          onClick={() => {
                            if (openCustomPopup === 'sched_time') {
                              setOpenCustomPopup(null);
                            } else {
                              setCustomTimeDraftText(scheduleTimeInput);
                              setOpenCustomPopup('sched_time');
                            }
                          }}
                          aria-label="예약 시작 시각 선택"
                        >
                          <span>
                            {(() => {
                              const [hh = 8, mm = 25, ss = 0] = scheduleTimeInput
                                .split(':')
                                .map((n) => Number(n) || 0);
                              const ampm = hh < 12 ? '오전' : '오후';
                              const h12 = hh % 12 === 0 ? 12 : hh % 12;
                              return `${ampm} ${h12}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
                            })()}
                          </span>
                          <svg
                            className="chevron-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {openCustomPopup === 'sched_time' && (
                          <div
                            className="custom-time-popover"
                            style={{ left: 0, right: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="custom-time-head">
                              <span className="custom-time-title">예약 시작 시각 설정</span>
                              <button
                                type="button"
                                className="custom-time-close"
                                onClick={() => setOpenCustomPopup(null)}
                              >
                                닫기
                              </button>
                            </div>

                            <div className="custom-time-ampm-row">
                              {(['AM', 'PM'] as const).map((period) => {
                                const [hh = 8, mm = 25, ss = 0] = scheduleTimeInput
                                  .split(':')
                                  .map((n) => Number(n) || 0);
                                const isAm = hh < 12;
                                const active = (period === 'AM' && isAm) || (period === 'PM' && !isAm);
                                return (
                                  <button
                                    key={period}
                                    type="button"
                                    className={`custom-time-ampm-btn ${active ? 'is-active' : ''}`}
                                    onClick={() => {
                                      let nextH = hh;
                                      if (period === 'AM' && hh >= 12) nextH = hh - 12;
                                      if (period === 'PM' && hh < 12) nextH = hh + 12;
                                      const nextStr = `${String(nextH).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
                                      setScheduleTimeInput(nextStr);
                                      setCustomTimeDraftText(nextStr);
                                    }}
                                  >
                                    {period === 'AM' ? '오전 (AM)' : '오후 (PM)'}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="custom-time-quick-grid">
                              {[
                                { label: '08:05 입실', val: '08:05:00' },
                                { label: '08:25 1교시', val: '08:25:00' },
                                { label: '10:20 2교시', val: '10:20:00' },
                                { label: '13:00 3교시', val: '13:00:00' },
                                { label: '14:40 4교시', val: '14:40:00' },
                                { label: '1분 뒤 시작', val: '__PLUS_1M__' },
                              ].map((presetItem) => (
                                <button
                                  key={presetItem.label}
                                  type="button"
                                  className="custom-time-nudge-btn"
                                  onClick={() => {
                                    if (presetItem.val === '__PLUS_1M__') {
                                      const d = new Date(Date.now() + 60000);
                                      const s = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
                                      setScheduleTimeInput(s);
                                      setCustomTimeDraftText(s);
                                    } else {
                                      setScheduleTimeInput(presetItem.val);
                                      setCustomTimeDraftText(presetItem.val);
                                    }
                                  }}
                                >
                                  {presetItem.label}
                                </button>
                              ))}
                            </div>

                            <div className="custom-time-direct-row">
                              <input
                                type="text"
                                className="custom-time-direct-input"
                                value={customTimeDraftText}
                                placeholder="08:25:00"
                                onChange={(e) => setCustomTimeDraftText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    setScheduleTimeInput(customTimeDraftText.trim() || '08:25:00');
                                    setOpenCustomPopup(null);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="custom-time-apply-btn"
                                onClick={() => {
                                  setScheduleTimeInput(customTimeDraftText.trim() || '08:25:00');
                                  setOpenCustomPopup(null);
                                }}
                              >
                                확인
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {scheduledTargetMs === null ? (
                        <button
                          type="button"
                          className="bookmark-save-btn"
                          onClick={handleSetScheduledStart}
                        >
                          예약
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="bookmark-save-btn"
                          onClick={handleCancelScheduledStart}
                        >
                          예약 취소
                        </button>
                      )}
                    </div>
                    <div className="drawer-note-line">
                      정확한 타종을 위해 화면을 켜 두세요 (자동 절전 방지 지원)
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`lg-btn lg-sub-btn ${isBookmarkCardOpen ? 'is-selected' : ''}`}
                    onClick={() => setIsBookmarkCardOpen((prev) => !prev)}
                    aria-expanded={isBookmarkCardOpen}
                    title="저장한 자주 쓰는 타종 구성 목록 열기/닫기"
                  >
                    <span>
                      자주 쓰는 타종 구성
                      {bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}
                    </span>
                  </button>

                  {isBookmarkCardOpen && (() => {
                    const folderCounts = new Map<string, number>();
                    let uncategorizedCount = 0;
                    bookmarks.forEach((b) => {
                      if (b.folderId && bookmarkFolders.some((f) => f.id === b.folderId)) {
                        folderCounts.set(b.folderId, (folderCounts.get(b.folderId) || 0) + 1);
                      } else {
                        uncategorizedCount++;
                      }
                    });

                    const filteredBookmarks =
                      activeBookmarkFolderFilter === 'all'
                        ? bookmarks
                        : activeBookmarkFolderFilter === 'uncategorized'
                          ? bookmarks.filter(
                              (b) => !b.folderId || !bookmarkFolders.some((f) => f.id === b.folderId)
                            )
                          : bookmarks.filter((b) => b.folderId === activeBookmarkFolderFilter);

                    const activeFolderObj = bookmarkFolders.find(
                      (f) => f.id === activeBookmarkFolderFilter
                    );

                    const renderDrawerBookmarkCardItem = (bm: SavedSequenceBookmark) => (
                      <div key={bm.id} className="bookmark-pill-item-col">
                        {editingBookmarkId === bm.id ? (
                          <div className="bookmark-save-row">
                            <input
                              type="text"
                              className="bookmark-name-input"
                              value={editingBookmarkName}
                              maxLength={60}
                              onChange={(e) => setEditingBookmarkName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRenameBookmark(bm.id, editingBookmarkName);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="bm-mini-act"
                              onClick={() => handleRenameBookmark(bm.id, editingBookmarkName)}
                            >
                              확인
                            </button>
                            <button
                              type="button"
                              className="bm-mini-act"
                              onClick={() => setEditingBookmarkId(null)}
                            >
                              취소
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="bookmark-item-top">
                              <button
                                type="button"
                                className="bookmark-pill-apply"
                                onClick={() => handleApplyBookmarkDirectly(bm)}
                                title="이 북마크로 즉시 타이머 적용"
                              >
                                <span className="bookmark-pill-name">{bm.name}</span>
                                <span className="bookmark-pill-count">
                                  {bm.config.selectedNodeIds.length}개
                                </span>
                              </button>
                              <button
                                type="button"
                                className="bookmark-pill-del"
                                onClick={(e) => handleDeleteBookmark(bm.id, e)}
                                aria-label={`${bm.name} 삭제`}
                                title="이 북마크 삭제"
                              >
                                ×
                              </button>
                            </div>
                            <div className="bookmark-item-actions">
                              <button
                                type="button"
                                className="bm-mini-act"
                                onClick={() => handleApplyBookmarkDirectly(bm)}
                              >
                                바로 적용
                              </button>
                              <button
                                type="button"
                                className="bm-mini-act"
                                onClick={() => {
                                  openBuilderModal();
                                  window.setTimeout(() => handleLoadBookmarkToEditor(bm), 30);
                                }}
                              >
                                편집기로 열기
                              </button>
                              <button
                                type="button"
                                className="bm-mini-act"
                                onClick={() => {
                                  setEditingBookmarkId(bm.id);
                                  setEditingBookmarkName(bm.name);
                                }}
                              >
                                이름 변경
                              </button>
                              <button
                                type="button"
                                className="bm-mini-act"
                                onClick={() => handleDuplicateBookmark(bm)}
                              >
                                복제
                              </button>
                              <button
                                type="button"
                                className="bm-mini-act"
                                onClick={() => handleOverwriteBookmark(bm, false)}
                              >
                                덮어쓰기
                              </button>
                              {bookmarkFolders.length > 0 && (
                                <button
                                  type="button"
                                  className={`bm-mini-act ${movingBookmarkId === bm.id ? 'is-active' : ''}`}
                                  onClick={() =>
                                    setMovingBookmarkId((prev) => (prev === bm.id ? null : bm.id))
                                  }
                                >
                                  폴더 이동
                                </button>
                              )}
                            </div>
                            {movingBookmarkId === bm.id && bookmarkFolders.length > 0 && (
                              <div className="bookmark-move-row">
                                <span className="bookmark-move-label">이동:</span>
                                <button
                                  type="button"
                                  className={`bm-folder-pill ${!bm.folderId ? 'is-active' : ''}`}
                                  onClick={() => handleMoveBookmarkToFolder(bm.id, null)}
                                >
                                  미분류
                                </button>
                                {bookmarkFolders.map((folder) => (
                                  <button
                                    key={folder.id}
                                    type="button"
                                    className={`bm-folder-pill ${bm.folderId === folder.id ? 'is-active' : ''}`}
                                    onClick={() => handleMoveBookmarkToFolder(bm.id, folder.id)}
                                  >
                                    {folder.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );

                    return (
                      <div className="bookmark-drawer-card" aria-label="자주 쓰는 타종 구성">
                        <div className="bookmark-drawer-head">
                          <span className="bookmark-drawer-title">자주 쓰는 타종 구성</span>
                          <div className="bookmark-drawer-head-actions">
                            <button
                              type="button"
                              className="bookmark-add-toggle"
                              onClick={() => {
                                setIsDrawerFolderInputOpen((prev) => !prev);
                                setIsDrawerBookmarkInputOpen(false);
                              }}
                            >
                              {isDrawerFolderInputOpen ? '닫기' : '+ 새 폴더'}
                            </button>
                            <button
                              type="button"
                              className="bookmark-add-toggle"
                              onClick={() => {
                                setIsDrawerBookmarkInputOpen((prev) => !prev);
                                setIsDrawerFolderInputOpen(false);
                              }}
                            >
                              {isDrawerBookmarkInputOpen ? '닫기' : '+ 구성 저장'}
                            </button>
                          </div>
                        </div>

                        {isDrawerFolderInputOpen && (
                          <div className="bookmark-save-row">
                            <input
                              type="text"
                              className="bookmark-name-input"
                              placeholder="새 폴더 이름 (예: 국수탐, 모의고사)"
                              value={folderNameInput}
                              maxLength={30}
                              onChange={(e) => setFolderNameInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateBookmarkFolder(folderNameInput, true);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="bookmark-save-btn"
                              onClick={() => handleCreateBookmarkFolder(folderNameInput, true)}
                            >
                              생성
                            </button>
                          </div>
                        )}

                        {isDrawerBookmarkInputOpen && (
                          <div className="bookmark-save-block">
                            <div className="bookmark-save-row">
                              <input
                                type="text"
                                className="bookmark-name-input"
                                placeholder="구성 이름 (비우면 자동)"
                                value={bookmarkNameInput}
                                maxLength={60}
                                onChange={(e) => setBookmarkNameInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSaveCurrentAsBookmark(false);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="bookmark-save-btn"
                                onClick={() => handleSaveCurrentAsBookmark(false)}
                              >
                                저장
                              </button>
                            </div>
                            {bookmarkFolders.length > 0 && (
                              <div className="bookmark-folder-select-row">
                                <span className="bookmark-move-label">저장 폴더:</span>
                                <button
                                  type="button"
                                  className={`bm-folder-pill ${saveTargetFolderId === '' ? 'is-active' : ''}`}
                                  onClick={() => setSaveTargetFolderId('')}
                                >
                                  미분류
                                </button>
                                {bookmarkFolders.map((folder) => (
                                  <button
                                    key={folder.id}
                                    type="button"
                                    className={`bm-folder-pill ${saveTargetFolderId === folder.id ? 'is-active' : ''}`}
                                    onClick={() => setSaveTargetFolderId(folder.id)}
                                  >
                                    {folder.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {bookmarkFolders.length > 0 && (
                          <div className="bookmark-folder-tabs" role="tablist" aria-label="북마크 폴더 필터">
                            <button
                              type="button"
                              role="tab"
                              aria-selected={activeBookmarkFolderFilter === 'all'}
                              className={`bm-folder-pill ${activeBookmarkFolderFilter === 'all' ? 'is-active' : ''}`}
                              onClick={() => handleSelectBookmarkFolderFilter('all')}
                            >
                              전체 ({bookmarks.length})
                            </button>
                            <button
                              type="button"
                              role="tab"
                              aria-selected={activeBookmarkFolderFilter === 'uncategorized'}
                              className={`bm-folder-pill ${activeBookmarkFolderFilter === 'uncategorized' ? 'is-active' : ''}`}
                              onClick={() => handleSelectBookmarkFolderFilter('uncategorized')}
                            >
                              미분류 ({uncategorizedCount})
                            </button>
                            {bookmarkFolders.map((folder) => (
                              <button
                                key={folder.id}
                                type="button"
                                role="tab"
                                aria-selected={activeBookmarkFolderFilter === folder.id}
                                className={`bm-folder-pill ${activeBookmarkFolderFilter === folder.id ? 'is-active' : ''}`}
                                onClick={() => handleSelectBookmarkFolderFilter(folder.id)}
                              >
                                <span className="bm-folder-icon" aria-hidden="true">📁</span>
                                <span>{folder.name}</span>
                                <span className="bm-folder-cnt">({folderCounts.get(folder.id) || 0})</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {activeFolderObj && (
                          <div className="bookmark-folder-toolbar">
                            {editingFolderId === activeFolderObj.id ? (
                              <div className="bookmark-save-row" style={{ width: '100%' }}>
                                <input
                                  type="text"
                                  className="bookmark-name-input"
                                  value={editingFolderName}
                                  maxLength={30}
                                  onChange={(e) => setEditingFolderName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleRenameBookmarkFolder(activeFolderObj.id, editingFolderName);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className="bm-mini-act"
                                  onClick={() =>
                                    handleRenameBookmarkFolder(activeFolderObj.id, editingFolderName)
                                  }
                                >
                                  확인
                                </button>
                                <button
                                  type="button"
                                  className="bm-mini-act"
                                  onClick={() => setEditingFolderId(null)}
                                >
                                  취소
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="bookmark-folder-toolbar-name">
                                  📁 {activeFolderObj.name}
                                </span>
                                <div className="bookmark-folder-toolbar-actions">
                                  <button
                                    type="button"
                                    className="bm-mini-act"
                                    onClick={() => {
                                      setEditingFolderId(activeFolderObj.id);
                                      setEditingFolderName(activeFolderObj.name);
                                    }}
                                  >
                                    폴더 이름 변경
                                  </button>
                                  <button
                                    type="button"
                                    className="bm-mini-act is-danger"
                                    onClick={() => handleDeleteBookmarkFolder(activeFolderObj.id)}
                                  >
                                    폴더 삭제
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {deletedBookmarkUndo && (
                          <div className="bm-undo-bar">
                            <span>'{deletedBookmarkUndo.bookmark.name}' 삭제됨</span>
                            <button
                              type="button"
                              className="bm-mini-act"
                              onClick={handleUndoDeleteBookmark}
                            >
                              실행 취소
                            </button>
                          </div>
                        )}

                        {bookmarks.length === 0 && bookmarkFolders.length === 0 ? (
                          <div className="bookmark-empty-hint">저장된 구성이 없습니다.</div>
                        ) : activeBookmarkFolderFilter === 'all' && bookmarkFolders.length > 0 ? (
                          <div className="bookmark-pill-list">
                            {bookmarkFolders.map((folder) => {
                              const folderBms = bookmarks.filter((b) => b.folderId === folder.id);
                              const isFoldCollapsed = Boolean(collapsedBookmarkFolders[folder.id]);
                              return (
                                <div key={folder.id} className="bookmark-folder-group">
                                  <div className="bookmark-folder-group-head">
                                    <button
                                      type="button"
                                      className="bookmark-folder-group-toggle"
                                      onClick={() =>
                                        setCollapsedBookmarkFolders((prev) => ({
                                          ...prev,
                                          [folder.id]: !prev[folder.id],
                                        }))
                                      }
                                    >
                                      <span>{isFoldCollapsed ? '▸' : '▾'}</span>
                                      <span>📁 {folder.name}</span>
                                      <span className="bookmark-pill-count">{folderBms.length}개</span>
                                    </button>
                                    <div className="bookmark-folder-group-acts">
                                      <button
                                        type="button"
                                        className="bm-mini-act"
                                        onClick={() => {
                                          setSaveTargetFolderId(folder.id);
                                          setIsDrawerBookmarkInputOpen(true);
                                          setIsDrawerFolderInputOpen(false);
                                        }}
                                        title="이 폴더에 현재 구성 저장"
                                      >
                                        + 저장
                                      </button>
                                      <button
                                        type="button"
                                        className="bm-mini-act"
                                        onClick={() => handleSelectBookmarkFolderFilter(folder.id)}
                                      >
                                        관리
                                      </button>
                                    </div>
                                  </div>
                                  {!isFoldCollapsed && (
                                    <div className="bookmark-folder-group-body">
                                      {folderBms.length === 0 ? (
                                        <div className="bookmark-empty-hint">
                                          이 폴더가 비어 있습니다.
                                        </div>
                                      ) : (
                                        folderBms.map(renderDrawerBookmarkCardItem)
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                            {uncategorizedCount > 0 && (
                              <div className="bookmark-folder-group">
                                <div className="bookmark-folder-group-head">
                                  <button
                                    type="button"
                                    className="bookmark-folder-group-toggle"
                                    onClick={() =>
                                      setCollapsedBookmarkFolders((prev) => ({
                                        ...prev,
                                        uncategorized: !prev.uncategorized,
                                      }))
                                    }
                                  >
                                    <span>
                                      {collapsedBookmarkFolders.uncategorized ? '▸' : '▾'}
                                    </span>
                                    <span>미분류</span>
                                    <span className="bookmark-pill-count">{uncategorizedCount}개</span>
                                  </button>
                                </div>
                                {!collapsedBookmarkFolders.uncategorized && (
                                  <div className="bookmark-folder-group-body">
                                    {bookmarks
                                      .filter(
                                        (b) =>
                                          !b.folderId ||
                                          !bookmarkFolders.some((f) => f.id === b.folderId)
                                      )
                                      .map(renderDrawerBookmarkCardItem)}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : filteredBookmarks.length === 0 ? (
                          <div className="bookmark-empty-hint">
                            이 폴더에 저장된 구성이 없습니다.
                          </div>
                        ) : (
                          <div className="bookmark-pill-list">
                            {filteredBookmarks.map(renderDrawerBookmarkCardItem)}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              {activeMenuCategory === 'ui_theme' && (
                <>
                  <div className="pill-group-row" role="group" aria-label="화면 테마 선택">
                    {(
                      [
                        { id: 'auto', label: '자동' },
                        { id: 'light', label: '라이트' },
                        { id: 'dark', label: '다크' },
                        { id: 'sepia', label: '세피아' },
                      ] as { id: ThemePreference; label: string }[]
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className={`theme-chip ${themePref === item.id ? 'active' : ''}`}
                        onClick={() => handleThemeChange(item.id)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* 화면 켜짐 유지 & 시계 바탕 블러 애니메이션 옵션 */}
                  <div className="drawer-card-panel" aria-label="화면 및 시계 블러 애니메이션 설정">
                    <div className="drawer-card-title">
                      <span>화면 유지 · 시계 블러 효과</span>
                      <span>시침·분침·초침 길게 눌러 회전 가능</span>
                    </div>

                    <label className="ui-option-toggle-row">
                      <span className="ui-opt-text">
                        <span>화면 켜짐 유지 (꺼짐 방지)</span>
                        <span className="ui-opt-sub">타이머 및 대기 중 기기 화면 자동 꺼짐 방지</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={keepScreenAwake}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setKeepScreenAwake(next);
                          keepScreenAwakeRef.current = next;
                          if (next) {
                            requestWakeLock();
                          } else {
                            releaseWakeLock();
                          }
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            bellVolume,
                            englishVolume,
                            next,
                            mainBellGlowAnim,
                            prelimBellGlowAnim
                          );
                          showToast(
                            next
                              ? '화면 켜짐 유지 옵션이 활성화되었습니다.'
                              : '화면 켜짐 유지 옵션이 해제되었습니다.',
                            2200
                          );
                        }}
                      />
                    </label>

                    <label className="ui-option-toggle-row">
                      <span className="ui-opt-text">
                        <span>본령 종료 전 블러 애니메이션</span>
                        <span className="ui-opt-sub">
                          종료 10분~1분 전 +10%, 1분~10초 전 +40%, 10초~0초 +90% 연속 강화 후 타종 시 완화
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={mainBellGlowAnim}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setMainBellGlowAnim(next);
                          mainBellGlowAnimRef.current = next;
                          if (!next) {
                            applyClockGlowBoost(0);
                          }
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            bellVolume,
                            englishVolume,
                            keepScreenAwake,
                            next,
                            prelimBellGlowAnim
                          );
                          showToast(
                            next
                              ? '본령 종료 전 시계 바탕 블러 애니메이션이 켜졌습니다.'
                              : '본령 종료 전 시계 바탕 블러 애니메이션이 꺼졌습니다.',
                            2200
                          );
                        }}
                      />
                    </label>

                    <label className="ui-option-toggle-row">
                      <span className="ui-opt-text">
                        <span>준비령 종료 전 블러 애니메이션</span>
                        <span className="ui-opt-sub">
                          본령 시작 1분~10초 전 +10%, 10초~0초 +40% 연속 강화 후 타종 시 완화
                        </span>
                      </span>
                      <input
                        type="checkbox"
                        checked={prelimBellGlowAnim}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setPrelimBellGlowAnim(next);
                          prelimBellGlowAnimRef.current = next;
                          if (!next) {
                            applyClockGlowBoost(0);
                          }
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            bellVolume,
                            englishVolume,
                            keepScreenAwake,
                            mainBellGlowAnim,
                            next
                          );
                          showToast(
                            next
                              ? '준비령 종료 전 시계 바탕 블러 애니메이션이 켜졌습니다.'
                              : '준비령 종료 전 시계 바탕 블러 애니메이션이 꺼졌습니다.',
                            2200
                          );
                        }}
                      />
                    </label>

                    <label className="vol-control-row" style={{ marginTop: 4 }}>
                      <span>시간표 투명도</span>
                      <input
                        type="range"
                        min={45}
                        max={98}
                        value={timetableOpacity}
                        className="vol-slider"
                        style={
                          {
                            '--slider-pct': `${Math.round(((timetableOpacity - 45) / (98 - 45)) * 100)}%`,
                          } as React.CSSProperties
                        }
                        aria-label="수능 시간표 창 불투명도 조절"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setTimetableOpacity(v);
                          timetableOpacityRef.current = v;
                          saveCustomSettingsToStorage(
                            themePref,
                            selectedPresetId,
                            devMode,
                            clockSyncMode,
                            customSequenceConfig,
                            bookmarks,
                            bellVolume,
                            englishVolume,
                            keepScreenAwake,
                            mainBellGlowAnim,
                            prelimBellGlowAnim,
                            v
                          );
                        }}
                      />
                      <span className="vol-val">{timetableOpacity}%</span>
                    </label>
                  </div>
                </>
              )}

              {activeMenuCategory === 'data_export' && (
                <>
                  <button
                    type="button"
                    className="lg-btn lg-sub-btn"
                    onClick={() => setIsModalOpen(true)}
                    title="수능 전체 시간표, 37개 타종 목록 및 앱 버전 설정"
                  >
                    <span>전체 시간표 · 타종/버전 정보</span>
                  </button>

                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      type="button"
                      className="lg-btn lg-sub-btn"
                      onClick={handleExportCustomJson}
                      title="현재 테마, 체크박스 타종 시퀀스, 간격, 음소거, 음량 설정을 JSON 파일로 저장"
                    >
                      <span>설정 JSON 저장</span>
                    </button>
                    <button
                      type="button"
                      className="lg-btn lg-sub-btn"
                      onClick={() => configJsonInputRef.current?.click()}
                      title="저장된 커스텀 설정 JSON 파일 불러오기"
                    >
                      <span>설정 열기</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    className="lg-btn lg-sub-btn"
                    onClick={handleDownloadStandaloneHtml}
                    disabled={isExportingHtml}
                    title="프로그램 공유"
                  >
                    <span>
                      {isExportingHtml ? '음원 내장 패키징 중...' : '프로그램 공유'}
                    </span>
                  </button>

                  {!pwaInstall.isInstalled && (
                    <button
                      type="button"
                      className="lg-btn lg-sub-btn"
                      onClick={() => {
                        if (pwaInstall.canInstall) {
                          pwaInstall.promptInstall();
                        } else {
                          showToast(
                            '브라우저 주소창 우측의 앱 설치 아이콘 또는 메뉴의 [홈 화면에 추가]를 선택해 설치할 수 있습니다.',
                            3800
                          );
                        }
                      }}
                      title="오프라인 실행 및 전체 화면 독자 창을 지원하는 프로그레시브 웹 앱(PWA)으로 기기에 설치"
                    >
                      <span>앱으로 설치 (PWA · 오프라인 지원)</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 우측 상단 수능 시간표 목록 버튼 */}
      <div id="topRightMenu">
        <button
          id="timetableToggleBtn"
          className={`lg-btn ${isTimetablePanelOpen ? 'is-selected' : ''}`}
          type="button"
          onClick={() => setIsTimetablePanelOpen((prev) => !prev)}
          aria-expanded={isTimetablePanelOpen}
          aria-controls="rightTimetablePanel"
          aria-label="수능 시간표 목록 열기/닫기"
          title="수능 시간표 목록"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
            <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
          </svg>
        </button>
      </div>

      {/* 우측/하단 펼침 수능 시간표 드로어 패널 (C2, C3, C5) */}
      <aside
        id="rightTimetablePanel"
        className={isTimetablePanelOpen ? 'open' : ''}
        aria-hidden={!isTimetablePanelOpen}
        aria-label="수능 시간표 목록"
      >
        <div className="rt-head">
          <div className="rt-head-title-group">
            <h2 className="rt-title">수능 시간표</h2>
            <span
              key={timetableViewMode}
              className={`rt-count-meta ${timetableSwitchAnim !== 'none' ? 'is-animating' : ''}`}
            >
              {timetableViewMode === 'all'
                ? `전체 ${CSAT_FULL_TIMETABLE.length}구간`
                : `선택 ${computedSequenceRows.length}단계`}
            </span>
          </div>
          <div className="rt-head-actions">
            <button
              type="button"
              className={`rt-arrow-btn ${isTimetableOptionCollapsed ? 'is-collapsed' : ''}`}
              onClick={() => setIsTimetableOptionCollapsed((prev) => !prev)}
              aria-expanded={!isTimetableOptionCollapsed}
              aria-label={isTimetableOptionCollapsed ? '옵션 선택 펼치기' : '옵션 선택 숨기기'}
              title={isTimetableOptionCollapsed ? '옵션 선택 펼치기' : '옵션 선택 숨기기'}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`rt-options-outer ${isTimetableOptionCollapsed ? 'is-collapsed' : ''}`}>
          <div className="rt-options-inner">
            <div className="rt-options-bar">
              <div
                className={`rt-mode-seg ${timetableViewMode === 'selected' ? 'is-selected-tab' : ''}`}
                role="tablist"
                aria-label="시간표 목록 보기 옵션"
              >
                <span className="rt-mode-glider" aria-hidden="true" />
                <button
                  type="button"
                  role="tab"
                  aria-selected={timetableViewMode === 'all'}
                  className={`rt-mode-btn ${timetableViewMode === 'all' ? 'active' : ''}`}
                  onClick={() => {
                    if (timetableViewMode !== 'all') {
                      setTimetableSwitchAnim('to-all');
                      setTimetableViewMode('all');
                      setExpandedTimetableKey(null);
                    }
                  }}
                >
                  모든 시간표
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={timetableViewMode === 'selected'}
                  className={`rt-mode-btn ${timetableViewMode === 'selected' ? 'active' : ''}`}
                  onClick={() => {
                    if (timetableViewMode !== 'selected') {
                      setTimetableSwitchAnim('to-selected');
                      setTimetableViewMode('selected');
                      setExpandedTimetableKey(null);
                    }
                  }}
                >
                  선택된 영역 시간표
                </button>
              </div>
              <div className="rt-sub-actions">
                <span className="rt-sub-hint">항목 클릭 시 시작·편집·정보 액션 표시</span>
                <button
                  type="button"
                  className="rt-edit-seq-btn"
                  onClick={() => openBuilderModal()}
                >
                  체크박스 선택 · 편집
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rt-scroll-list" ref={rtScrollListRef}>
          <div
            key={timetableViewMode}
            className={`rt-list-stage ${timetableSwitchAnim !== 'none' ? `anim-${timetableSwitchAnim}` : ''}`}
          >
            {timetableViewMode === 'all' ? (
              CSAT_FULL_TIMETABLE.map((row, idx) => {
                const matchedNode = CSAT_SELECTABLE_CUE_NODES[idx] || null;
                const isCurrent =
                  row.id === activeRowId ||
                  (activeCustomNodeId !== null &&
                    (row.startNodeId === activeCustomNodeId ||
                      matchedNode?.nodeId === activeCustomNodeId));
                const rowKey = `all_${row.id}`;
                const isExpanded = expandedTimetableKey === rowKey;
                const isInfoOpen = expandedInfoKey === rowKey;
                const prefix = row.periodLabel !== '-' ? `${row.periodLabel} · ` : '';
                const bellItem = matchedNode?.bellCode
                  ? CSAT_37_BELL_FILES.find((b) => b.code === matchedNode.bellCode)
                  : null;

                return (
                  <div key={row.id} className="rt-row-card">
                    <button
                      type="button"
                      className={`rt-item-btn ${isCurrent ? 'is-current' : ''}`}
                      onClick={() =>
                        setExpandedTimetableKey((prev) => (prev === rowKey ? null : rowKey))
                      }
                    >
                      <span className="rt-item-idx">{idx + 1}</span>
                      <span className="rt-item-main">
                        <span className="rt-item-title">
                          {prefix}
                          {row.displayTitle} · {row.category}
                        </span>
                        <span className="rt-item-sub">{row.description}</span>
                      </span>
                      <span className="rt-item-time">{row.timeRangeText}</span>
                    </button>

                    {isExpanded && (
                      <div className="rt-row-actions">
                        <div className="rt-action-btn-row">
                          <button
                            type="button"
                            className="rt-act-chip primary"
                            onClick={() => handleSelectTimetableRow(row, false)}
                          >
                            이 단계부터 시작
                          </button>
                          <button
                            type="button"
                            className="rt-act-chip"
                            onClick={() => openBuilderModal(matchedNode?.nodeId)}
                          >
                            선택 구성 편집
                          </button>
                          <button
                            type="button"
                            className="rt-act-chip"
                            onClick={() =>
                              setExpandedInfoKey((prev) => (prev === rowKey ? null : rowKey))
                            }
                          >
                            단계 정보 · 미리듣기
                          </button>
                        </div>
                        {isInfoOpen && (
                          <div className="rt-step-info-box">
                            <span>
                              {bellItem
                                ? `타종 번호 [${bellItem.code}] · 길이 ${formatBellDuration(bellItem.durationSec)} · 공식 시각 ${row.timeRangeText}`
                                : `영어 듣기평가 안내방송 구간 · 공식 시각 ${row.timeRangeText}`}
                            </span>
                            {bellItem && (
                              <button
                                type="button"
                                className="rt-act-chip"
                                onClick={() => togglePreviewBell(bellItem)}
                              >
                                {previewState.code === bellItem.code && previewState.playing
                                  ? `정지 (${formatBellDuration(previewState.currentTime)})`
                                  : `미리듣기 (${formatBellDuration(bellItem.durationSec)})`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : computedSequenceRows.length === 0 ? (
              <div className="rt-empty-box">
                <span>현재 체크박스로 선택된 영역 · 타종 단계가 없습니다.</span>
                <button
                  type="button"
                  className="rt-edit-seq-btn"
                  onClick={() => openBuilderModal()}
                >
                  영역 · 타종 선택 구성 열기
                </button>
              </div>
            ) : (
              computedSequenceRows.map((row, idx) => {
                const isCurrent =
                  activeCustomNodeId !== null
                    ? row.node.nodeId === activeCustomNodeId
                    : CSAT_FULL_TIMETABLE.find((r) => r.id === activeRowId)?.startNodeId ===
                      row.node.nodeId;
                const rowKey = `sel_${row.node.nodeId}`;
                const isExpanded = expandedTimetableKey === rowKey;
                const isInfoOpen = expandedInfoKey === rowKey;
                const displayTime = format24hTime(row.customTimeMinutes);
                const waitLabel = formatIntervalSecondsLabel(row.intervalAfterSeconds);
                const subDetail = row.nextNode
                  ? `다음까지 ${waitLabel} 대기${row.isMuted ? ' · 무음' : ''}`
                  : `마지막 단계 (${waitLabel})${row.isMuted ? ' · 무음' : ''}`;
                const bellItem = row.node.bellCode
                  ? CSAT_37_BELL_FILES.find((b) => b.code === row.node.bellCode)
                  : null;

                return (
                  <div key={row.node.nodeId} className="rt-row-card">
                    <button
                      type="button"
                      className={`rt-item-btn ${isCurrent ? 'is-current' : ''}`}
                      onClick={() =>
                        setExpandedTimetableKey((prev) => (prev === rowKey ? null : rowKey))
                      }
                    >
                      <span className="rt-item-idx">{idx + 1}</span>
                      <span className="rt-item-main">
                        <span className="rt-item-title">
                          {row.node.periodLabel} · {row.node.subjectTitle} ·{' '}
                          {row.node.stageShortLabel}
                          {row.dayOffset > 0 && (
                            <span className="next-day-badge">+{row.dayOffset}일</span>
                          )}
                        </span>
                        <span className="rt-item-sub">{subDetail}</span>
                      </span>
                      <span className="rt-item-time">{displayTime}</span>
                    </button>

                    {isExpanded && (
                      <div className="rt-row-actions">
                        <div className="rt-action-btn-row">
                          <button
                            type="button"
                            className="rt-act-chip primary"
                            onClick={() => handleStartFromCustomStep(idx)}
                          >
                            이 단계부터 시작
                          </button>
                          <button
                            type="button"
                            className="rt-act-chip"
                            onClick={() => openBuilderModal(row.node.nodeId)}
                          >
                            선택 구성 편집
                          </button>
                          <button
                            type="button"
                            className="rt-act-chip"
                            onClick={() =>
                              setExpandedInfoKey((prev) => (prev === rowKey ? null : rowKey))
                            }
                          >
                            단계 정보 · 미리듣기
                          </button>
                        </div>
                        {isInfoOpen && (
                          <div className="rt-step-info-box">
                            <span>
                              {bellItem
                                ? `타종 [${bellItem.code}] (${formatBellDuration(bellItem.durationSec)}) · 원래 ${row.node.originalTimeText} / 계산 ${format24hTime(row.customTimeMinutes)}`
                                : `영어 듣기평가 안내방송 · 원래 ${row.node.originalTimeText} / 계산 ${format24hTime(row.customTimeMinutes)}`}
                            </span>
                            {bellItem && (
                              <button
                                type="button"
                                className="rt-act-chip"
                                onClick={() => togglePreviewBell(bellItem)}
                              >
                                {previewState.code === bellItem.code && previewState.playing
                                  ? `정지 (${formatBellDuration(previewState.currentTime)})`
                                  : `미리듣기 (${formatBellDuration(bellItem.durationSec)})`}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* 하단 중앙 Liquid Glass 컨트롤 독 (START ↔ PAUSE / CANCEL + B6 터치 레이어 + 상태 배지) */}
      <div id="dock" ref={dockRef}>
        <div className="dock-status-badges">
          {scheduledTargetMs !== null && !isRunningUi && (
            <div className="status-pill-badge is-sched">
              <span>
                예약 시작까지 {formatDurationClock(scheduleRemainSec * 1000)} ({scheduleTimeInput})
              </span>
              <button
                type="button"
                className="status-pill-action"
                onClick={handleCancelScheduledStart}
              >
                취소
              </button>
            </div>
          )}

          {isTemporaryStartPoint && !isRunningUi && (
            <div className="status-pill-badge">
              <span>임시 시작 지점 설정됨</span>
              <button
                type="button"
                className="status-pill-action"
                onClick={handleRestoreFullCustomSequence}
              >
                전체 구성으로 복귀
              </button>
            </div>
          )}
        </div>

        <div id="primaryRow">
          {/* B6: PAUSE, CANCEL 주변 투명 터치 레이어 (1회 터치 시 보조 컨트롤 노출, 3초 비활성 시 자동 숨김; CANCEL 터치 시에는 노출 제외) */}
          <div
            id="runTouchZone"
            className={`interactive-zone ${isRunningUi ? '' : 'is-disabled'} ${
              isRunningUi && isRunAuxRevealed ? 'is-revealed' : ''
            }`}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement | null)?.closest('#cancelBtn')) return;
              if (isRunningUi) {
                revealRunAuxControls();
              }
            }}
          >
            <div id="actionStage">
              {/* PAUSE 왼쪽: 이전 타종 (아이콘만, 첫 타종에서는 비활성화) */}
              <button
                type="button"
                className="run-aux-btn pos-left"
                disabled={!canJumpPrevBell}
                aria-hidden={!isRunAuxRevealed}
                aria-label="이전 타종 시점으로 이동"
                title={canJumpPrevBell ? '이전 타종 시점으로 이동' : '첫 번째 타종 단계입니다'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJumpBell('prev');
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>

              {/* PAUSE와 CANCEL 정 중앙부 위쪽: 다시 재생 (아이콘만, 현재 타종 처음 위치로 시간·시계침 복원 및 재재생) */}
              <button
                type="button"
                className="run-aux-btn pos-top-center"
                disabled={!isRunningUi}
                aria-hidden={!isRunAuxRevealed}
                aria-label="현재 타종 처음부터 다시 재생"
                title="현재 타종 처음 위치로 남은 시간과 시계 침을 되돌리고 타종 다시 재생"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReplayLastBell();
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
              </button>

              {/* CANCEL 오른쪽: 다음 타종 (아이콘만, 마지막 타종에서는 비활성화) */}
              <button
                type="button"
                className="run-aux-btn pos-right"
                disabled={!canJumpNextBell}
                aria-hidden={!isRunAuxRevealed}
                aria-label="다음 타종 시점으로 이동"
                title={canJumpNextBell ? '다음 타종 시점으로 이동' : '마지막 타종 단계입니다'}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJumpBell('next');
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>

              <div className={`stage-layer ${isRunningUi ? 'is-inactive' : 'is-active'}`}>
                <button id="go" className="lg-btn" type="button" onClick={handleStart}>
                  START
                </button>
              </div>
              <div
                id="runCtrls"
                className={`stage-layer ${isRunningUi ? 'is-active' : 'is-inactive'}`}
              >
                <button
                  id="pauseBtn"
                  className="lg-btn"
                  type="button"
                  onClick={handlePauseResume}
                >
                  {pauseLabel}
                </button>
                <button
                  id="cancelBtn"
                  className="lg-btn"
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={handleCancel}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 전용 창 1: 체크박스 기반 영역·타종 선택 및 시간 간격/시각 편집기 (C1 Draft 분리) */}
      <div
        className={`toll-scrim ${isBuilderModalOpen ? 'open' : ''}`}
        aria-hidden={!isBuilderModalOpen}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeBuilderModalWithoutSaving();
        }}
      >
        <main
          className="toll-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="builderModalTitle"
        >
          <header className="dialog-header">
            <div className="dialog-heading">
              <h1 id="builderModalTitle">
                영역별 타종 체크박스 선택 및 시간 간격 · 시각 설정
              </h1>
              <p>
                원하는 영역과 타종 단계를 선택하고, 각 타종 사이의 간격과 타종 시각을 조정하세요.
              </p>
            </div>
            <div className="head-actions">
              <button
                type="button"
                className="icon-button"
                disabled={draftUndoStack.length === 0}
                onClick={handleUndoDraft}
                title="실행 취소"
                aria-label="실행 취소"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 14 4 9l5-5" />
                  <path d="M4 9h9a7 7 0 1 1 0 14h-2" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-button"
                disabled={draftRedoStack.length === 0}
                onClick={handleRedoDraft}
                title="다시 실행"
                aria-label="다시 실행"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 14 5-5-5-5" />
                  <path d="M20 9h-9a7 7 0 1 0 0 14h2" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-button"
                onClick={closeBuilderModalWithoutSaving}
                title="닫기"
                aria-label="닫기"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>

          {/* 3단계 진행 표시기 (1단계: 응시 조합·빠른 설정 / 2단계: 1. 진행할 영역·단계 / 3단계: 2. 순서·간격·시각) */}
          <nav className="builder-stepper" aria-label="타종 구성 단계">
            <button
              type="button"
              className={`builder-step-tab ${builderStep === 1 ? 'is-active' : builderStep > 1 ? 'is-done' : ''}`}
              aria-current={builderStep === 1 ? 'step' : undefined}
              onClick={() => goToBuilderStep(1)}
            >
              <span className="step-badge">1</span>
              <span className="step-title">응시 조합 · 빠른 설정</span>
            </button>
            <button
              type="button"
              className={`builder-step-tab ${builderStep === 2 ? 'is-active' : builderStep > 2 ? 'is-done' : ''}`}
              aria-current={builderStep === 2 ? 'step' : undefined}
              onClick={() => goToBuilderStep(2)}
            >
              <span className="step-badge">2</span>
              <span className="step-title">진행할 영역 및 타종 단계 선택</span>
            </button>
            <button
              type="button"
              className={`builder-step-tab ${builderStep === 3 ? 'is-active' : ''}`}
              aria-current={builderStep === 3 ? 'step' : undefined}
              onClick={() => goToBuilderStep(3)}
            >
              <span className="step-badge">3</span>
              <span className="step-title">선택된 타종 진행 순서 및 시간 간격 · 시각 설정</span>
            </button>
          </nav>

          <div className="builder-step-body" ref={builderStepBodyRef}>
            {builderStep === 1 && (
              /* 1단계: 상단 빠른 구성 템플릿, B3 응시 조합 자동 구성, 자주 쓰는 구성(북마크), 시계 바늘 연동 옵션 */
              <section className="quickbar quickbar-step" aria-label="1단계: 응시 조합 및 빠른 설정">
                <div className="pane-title">
                  <span>응시 조합 및 빠른 설정</span>
                  <span className="pane-note">여기서 체크한 과목만 다음(2단계) 목록에 표시됩니다</span>
                </div>

                <div className="quick-line">
                  <span className="quick-label">빠른 선택</span>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('all_39')}
                  >
                    전체 타종 선택 (기본)
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('kor_math_inq1_core')}
                  >
                    국·수·탐1 핵심
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('kor_core')}
                  >
                    1교시 국어 4단계
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('eng_listening_core')}
                  >
                    3교시 영어 듣기 포함
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('all_core')}
                  >
                    전 영역 핵심 단계
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleApplyQuickSequenceTemplate('reset_intervals')}
                  >
                    기본 간격 초기화
                  </button>
                </div>

                {/* B3: 응시 조합 실시간 동기화 및 커스텀 선택 팝업 */}
                <div
                  className={`quick-line ${
                    openCustomPopup === 'subj_inq' || openCustomPopup === 'subj_scope'
                      ? 'has-popover-open'
                      : ''
                  }`}
                >
                  <span className="quick-label">응시 조합</span>
                  <div className="subj-auto-box">
                    {(
                      [
                        { id: 'kor', label: '국어' },
                        { id: 'math', label: '수학' },
                        { id: 'eng', label: '영어' },
                        { id: 'hist', label: '한국사' },
                      ] as { id: CsatSubjectGroupId; label: string }[]
                    ).map((s) => (
                      <label
                        key={s.id}
                        className={`subj-check-label ${subjAutoChecked[s.id] ? 'is-checked' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={subjAutoChecked[s.id]}
                          onChange={() => handleSubjComboCheckboxToggle(s.id)}
                        />
                        <span>{s.label}</span>
                      </label>
                    ))}

                    <div
                      className={`subj-check-label ${
                        subjAutoChecked.inq1 || subjAutoChecked.inq2 ? 'is-checked' : ''
                      }`}
                    >
                      <label
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={subjAutoChecked.inq1 || subjAutoChecked.inq2}
                          onChange={handleSubjInqCheckboxToggle}
                        />
                        <span>탐구</span>
                      </label>
                      <div className="custom-select-wrap">
                        <button
                          type="button"
                          className={`custom-select-trigger ${
                            openCustomPopup === 'subj_inq' ? 'is-open' : ''
                          }`}
                          onClick={() =>
                            setOpenCustomPopup((prev) => (prev === 'subj_inq' ? null : 'subj_inq'))
                          }
                          aria-haspopup="listbox"
                          aria-expanded={openCustomPopup === 'subj_inq'}
                          aria-label="탐구 응시 과목 수 선택 (1과목 또는 2과목)"
                        >
                          <span>{subjInqCount === 1 ? '1과목' : '2과목'}</span>
                          <svg
                            className="chevron-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {openCustomPopup === 'subj_inq' && (
                          <div className="custom-select-popover" role="listbox" aria-label="탐구 과목 수">
                            {(
                              [
                                { value: 2 as const, label: '2과목', badge: '탐구 1·2' },
                                { value: 1 as const, label: '1과목', badge: '탐구 1' },
                              ]
                            ).map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={subjInqCount === opt.value}
                                className={`custom-select-option ${
                                  subjInqCount === opt.value ? 'is-selected' : ''
                                }`}
                                onClick={() => handleSubjInqCountSelect(opt.value)}
                              >
                                <span>{opt.label}</span>
                                <span className="opt-sub-badge">{opt.badge}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <label
                      className={`subj-check-label ${subjAutoChecked.lang2 ? 'is-checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={subjAutoChecked.lang2}
                        onChange={() => handleSubjComboCheckboxToggle('lang2')}
                      />
                      <span>제2외국어/한문</span>
                    </label>

                    <div className="subj-check-label">
                      <span>밀도</span>
                      <div className="custom-select-wrap">
                        <button
                          type="button"
                          className={`custom-select-trigger ${
                            openCustomPopup === 'subj_scope' ? 'is-open' : ''
                          }`}
                          onClick={() =>
                            setOpenCustomPopup((prev) => (prev === 'subj_scope' ? null : 'subj_scope'))
                          }
                          aria-haspopup="listbox"
                          aria-expanded={openCustomPopup === 'subj_scope'}
                          aria-label="포함할 타종 단계 밀도 선택"
                        >
                          <span>
                            {subjAutoScope === 'all'
                              ? '전체 타종'
                              : subjAutoScope === 'core'
                                ? '핵심 단계'
                                : '실전 최소'}
                          </span>
                          <svg
                            className="chevron-icon"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>

                        {openCustomPopup === 'subj_scope' && (
                          <div className="custom-select-popover" role="listbox" aria-label="타종 밀도">
                            {(
                              [
                                { value: 'all', label: '전체 타종', badge: '전 단계' },
                                { value: 'core', label: '핵심 단계', badge: '준비·본령·종료' },
                                { value: 'real', label: '실전 최소', badge: '본령·종료' },
                              ] as const
                            ).map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={subjAutoScope === opt.value}
                                className={`custom-select-option ${
                                  subjAutoScope === opt.value ? 'is-selected' : ''
                                }`}
                                onClick={() => handleSubjScopeSelect(opt.value)}
                              >
                                <span>{opt.label}</span>
                                <span className="opt-sub-badge">{opt.badge}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="chip"
                      onClick={handleApplySubjectAutoBuild}
                      title="현재 체크된 응시 조합으로 간격을 공식 시간표 기준으로 초기화하고 재정렬합니다."
                    >
                      조합 간격 초기화
                    </button>
                  </div>
                </div>

                {/* C4: 자주 쓰는 구성 + 북마크 폴더 관리 */}
                {(() => {
                  const modalFolderCounts = new Map<string, number>();
                  let modalUncategorizedCount = 0;
                  bookmarks.forEach((b) => {
                    if (b.folderId && bookmarkFolders.some((f) => f.id === b.folderId)) {
                      modalFolderCounts.set(b.folderId, (modalFolderCounts.get(b.folderId) || 0) + 1);
                    } else {
                      modalUncategorizedCount++;
                    }
                  });
                  const modalVisibleBookmarks =
                    activeBookmarkFolderFilter === 'all'
                      ? bookmarks
                      : activeBookmarkFolderFilter === 'uncategorized'
                        ? bookmarks.filter(
                            (b) => !b.folderId || !bookmarkFolders.some((f) => f.id === b.folderId)
                          )
                        : bookmarks.filter((b) => b.folderId === activeBookmarkFolderFilter);
                  const activeModalFolder = bookmarkFolders.find(
                    (f) => f.id === activeBookmarkFolderFilter
                  );
                  const movingTargetBm = movingBookmarkId
                    ? bookmarks.find((b) => b.id === movingBookmarkId) || null
                    : null;

                  return (
                    <div className="quick-line bookmark-modal-quickline">
                      <div className="bookmark-modal-folder-bar">
                        <span className="quick-label">자주 쓰는 구성</span>
                        <div className="bookmark-modal-folder-pills">
                          <button
                            type="button"
                            className={`chip bookmark-folder-chip ${activeBookmarkFolderFilter === 'all' ? 'active' : ''}`}
                            onClick={() => handleSelectBookmarkFolderFilter('all')}
                          >
                            전체 ({bookmarks.length})
                          </button>
                          {bookmarkFolders.length > 0 && (
                            <button
                              type="button"
                              className={`chip bookmark-folder-chip ${activeBookmarkFolderFilter === 'uncategorized' ? 'active' : ''}`}
                              onClick={() => handleSelectBookmarkFolderFilter('uncategorized')}
                            >
                              미분류 ({modalUncategorizedCount})
                            </button>
                          )}
                          {bookmarkFolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              className={`chip bookmark-folder-chip ${activeBookmarkFolderFilter === folder.id ? 'active' : ''}`}
                              onClick={() => handleSelectBookmarkFolderFilter(folder.id)}
                            >
                              <span>📁 {folder.name}</span>
                              <span>({modalFolderCounts.get(folder.id) || 0})</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`chip bookmark-folder-chip ${isModalFolderInputOpen ? 'active' : ''}`}
                            onClick={() => setIsModalFolderInputOpen((prev) => !prev)}
                          >
                            {isModalFolderInputOpen ? '닫기' : '+ 새 폴더'}
                          </button>
                        </div>

                        {activeModalFolder && (
                          <div className="bookmark-modal-folder-actions">
                            {editingFolderId === activeModalFolder.id ? (
                              <>
                                <input
                                  type="text"
                                  className="bookmark-modal-input"
                                  value={editingFolderName}
                                  maxLength={30}
                                  aria-label="폴더 이름 변경"
                                  onChange={(e) => setEditingFolderName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleRenameBookmarkFolder(
                                        activeModalFolder.id,
                                        editingFolderName
                                      );
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  className="chip"
                                  onClick={() =>
                                    handleRenameBookmarkFolder(
                                      activeModalFolder.id,
                                      editingFolderName
                                    )
                                  }
                                >
                                  확인
                                </button>
                                <button
                                  type="button"
                                  className="chip"
                                  onClick={() => setEditingFolderId(null)}
                                >
                                  취소
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  className="chip"
                                  onClick={() => {
                                    setEditingFolderId(activeModalFolder.id);
                                    setEditingFolderName(activeModalFolder.name);
                                  }}
                                >
                                  폴더 이름 변경
                                </button>
                                <button
                                  type="button"
                                  className="chip"
                                  onClick={() => handleDeleteBookmarkFolder(activeModalFolder.id)}
                                >
                                  폴더 삭제
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {isModalFolderInputOpen && (
                        <div className="bookmark-modal-folder-create">
                          <input
                            type="text"
                            className="bookmark-modal-input"
                            value={folderNameInput}
                            maxLength={30}
                            placeholder="새 북마크 폴더 이름"
                            aria-label="새 북마크 폴더 이름"
                            onChange={(e) => setFolderNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCreateBookmarkFolder(folderNameInput, false);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="chip"
                            onClick={() => handleCreateBookmarkFolder(folderNameInput, false)}
                          >
                            폴더 생성
                          </button>
                        </div>
                      )}

                      <div className="bookmark-modal-items-bar">
                        {modalVisibleBookmarks.length === 0 ? (
                          <span className="pane-note">
                            {bookmarks.length === 0
                              ? '저장된 구성이 없습니다.'
                              : '이 폴더에 저장된 구성이 없습니다.'}
                          </span>
                        ) : (
                          modalVisibleBookmarks.map((bm) => {
                            const bmFolderName =
                              bm.folderId &&
                              bookmarkFolders.find((f) => f.id === bm.folderId)?.name;
                            return (
                              <span key={bm.id} className="bookmark-modal-chip">
                                <button
                                  type="button"
                                  className="bookmark-modal-apply"
                                  onClick={() => handleLoadBookmarkToEditor(bm)}
                                  title={`'${bm.name}' 구성 불러오기`}
                                >
                                  {bm.name} ({bm.config.selectedNodeIds.length})
                                  {activeBookmarkFolderFilter === 'all' && bmFolderName && (
                                    <span className="bookmark-modal-folder-tag">
                                      📁 {bmFolderName}
                                    </span>
                                  )}
                                </button>
                                {bookmarkFolders.length > 0 && (
                                  <button
                                    type="button"
                                    className={`bookmark-modal-move ${movingBookmarkId === bm.id ? 'is-open' : ''}`}
                                    onClick={() =>
                                      setMovingBookmarkId((prev) => (prev === bm.id ? null : bm.id))
                                    }
                                    aria-label={`${bm.name} 폴더 이동`}
                                    title="폴더 이동"
                                  >
                                    📁
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="bookmark-modal-del"
                                  onClick={(e) => handleDeleteBookmark(bm.id, e)}
                                  aria-label={`${bm.name} 삭제`}
                                  title="북마크 삭제"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })
                        )}

                        <div className="bookmark-modal-save-group">
                          {bookmarkFolders.length > 0 && (
                            <select
                              className="builder-select-sm bookmark-modal-folder-select"
                              aria-label="저장할 북마크 폴더 선택"
                              value={saveTargetFolderId}
                              onChange={(e) => setSaveTargetFolderId(e.target.value)}
                            >
                              <option value="">미분류</option>
                              {bookmarkFolders.map((folder) => (
                                <option key={folder.id} value={folder.id}>
                                  📁 {folder.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            type="text"
                            className="bookmark-modal-input"
                            value={bookmarkNameInput}
                            maxLength={28}
                            placeholder="저장할 구성 이름"
                            aria-label="자주 쓰는 구성 이름"
                            onChange={(e) => setBookmarkNameInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSaveCurrentAsBookmark(true);
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="chip"
                            onClick={() => handleSaveCurrentAsBookmark(true)}
                          >
                            현재 구성 저장
                          </button>
                        </div>
                      </div>

                      {movingTargetBm && bookmarkFolders.length > 0 && (
                        <div className="bookmark-modal-move-bar">
                          <span className="pane-note">
                            '{movingTargetBm.name}' 이동할 폴더:
                          </span>
                          <button
                            type="button"
                            className={`chip bookmark-folder-chip ${!movingTargetBm.folderId ? 'active' : ''}`}
                            onClick={() => handleMoveBookmarkToFolder(movingTargetBm.id, null)}
                          >
                            미분류
                          </button>
                          {bookmarkFolders.map((folder) => (
                            <button
                              key={folder.id}
                              type="button"
                              className={`chip bookmark-folder-chip ${movingTargetBm.folderId === folder.id ? 'active' : ''}`}
                              onClick={() =>
                                handleMoveBookmarkToFolder(movingTargetBm.id, folder.id)
                              }
                            >
                              📁 {folder.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            className="chip bookmark-folder-chip"
                            onClick={() => setMovingBookmarkId(null)}
                          >
                            닫기
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {duplicateNamePrompt && (
                  <div className="bm-undo-bar">
                    <span>
                      같은 이름('{duplicateNamePrompt.name}')의 북마크가 있습니다. 어떻게 저장할까요?
                    </span>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button
                        type="button"
                        className="bm-mini-act"
                        onClick={() =>
                          executeSaveNewBookmark(
                            duplicateNamePrompt.name,
                            duplicateNamePrompt.sourceConfig,
                            duplicateNamePrompt.sourceSync,
                            duplicateNamePrompt.existingId,
                            duplicateNamePrompt.sourceFolderId
                          )
                        }
                      >
                        기존 북마크 덮어쓰기
                      </button>
                      <button
                        type="button"
                        className="bm-mini-act"
                        onClick={() =>
                          executeSaveNewBookmark(
                            `${duplicateNamePrompt.name} (새 구성)`.slice(0, 60),
                            duplicateNamePrompt.sourceConfig,
                            duplicateNamePrompt.sourceSync,
                            undefined,
                            duplicateNamePrompt.sourceFolderId
                          )
                        }
                      >
                        새 이름으로 저장
                      </button>
                      <button
                        type="button"
                        className="bm-mini-act"
                        onClick={() => setDuplicateNamePrompt(null)}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                )}

              </section>
            )}

            {builderStep === 2 && (
              /* 2단계: 1. 진행할 영역 및 타종 단계 선택 (1단계에서 체크한 과목만 표시) */
              <section className="left-pane step-single-pane">
                <div className="pane-title">
                  <span>진행할 영역 및 타종 단계 선택</span>
                  <span className="pane-note">
                    응시 조합에서 체크한 과목만 표시됩니다 · 영역별 필요한 단계만 선택
                  </span>
                </div>

                {enabledSubjectGroups.size === 0 ? (
                  <div className="empty-state">
                    <p style={{ margin: '0 0 12px' }}>
                      1단계(응시 조합)에서 체크된 과목이 없습니다. 이전 단계에서 진행할 과목을 먼저 체크해 주세요.
                    </p>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => goToBuilderStep(1)}
                    >
                      1단계(응시 조합)로 이동
                    </button>
                  </div>
                ) : (
                  <>

              <div className="left-tools-panel">
                <div className="search-wrap">
                  <svg
                    className="search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 5 5" />
                  </svg>
                  <input
                    type="search"
                    className="builder-search-input"
                    aria-label="타종 단계 검색"
                    value={builderSearchQuery}
                    onChange={(e) => setBuilderSearchQuery(e.target.value)}
                  />
                </div>

                {/* C6: 타종 유형별 일괄 선택/해제 칩 */}
                <div className="stage-type-bar">
                  {CSAT_STAGE_TYPE_META.map((meta) => {
                    const matchingNodes = CSAT_SELECTABLE_CUE_NODES.filter(
                      (n) => enabledSubjectGroups.has(n.subjectGroupId) && n.stageType === meta.type
                    );
                    if (matchingNodes.length === 0) return null;
                    const isAllTypeSelected = matchingNodes.every((n) =>
                      draftSequenceConfig.selectedNodeIds.includes(n.nodeId)
                    );
                    return (
                      <button
                        key={meta.type}
                        type="button"
                        className={`stage-type-chip ${isAllTypeSelected ? 'active' : ''}`}
                        onClick={() => handleSelectByStageType(meta.type)}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {(() => {
                const q = builderSearchQuery.trim().toLowerCase();
                const visibleCards = CSAT_SUBJECT_GROUPS.filter((group) =>
                  enabledSubjectGroups.has(group.id)
                )
                  .map((group) => {
                    const groupNodes = CSAT_SELECTABLE_CUE_NODES.filter((n) => {
                      if (n.subjectGroupId !== group.id) return false;
                      if (
                        builderFilterMode === 'selected' &&
                        !draftSequenceConfig.selectedNodeIds.includes(n.nodeId)
                      ) {
                        return false;
                      }
                      if (!q) return true;
                      const hay =
                        `${n.periodLabel} ${n.subjectTitle} ${n.stageShortLabel} ${n.fullTitle} ${n.bellCode || '영어 듣기'} ${n.originalTimeText}`.toLowerCase();
                      return hay.includes(q);
                    });
                    if (groupNodes.length === 0) return null;
                    const stats = draftAnalysis.groupStats[group.id];
                    const isCollapsed = Boolean(collapsedGroups[group.id]) && !q;
                    return (
                      <section
                        key={group.id}
                        className={`area-card ${isCollapsed ? 'collapsed' : ''}`}
                      >
                        <div className="area-head">
                          <label className="area-check">
                            <input
                              type="checkbox"
                              checked={stats.state === 'all'}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = stats.state === 'partial';
                                }
                              }}
                              onChange={() => handleToggleSubjectGroup(group.id, false)}
                            />
                            <span>
                              {group.title} ({stats.selectedCount}/{stats.totalCount})
                            </span>
                          </label>
                          <div className="area-head-actions">
                            <button
                              type="button"
                              className={`area-tag ${stats.isCoreAllSelected ? 'is-core-all' : ''}`}
                              onClick={() => handleToggleSubjectGroup(group.id, true)}
                              title="핵심 단계 선택/해제"
                            >
                              핵심 단계
                            </button>
                            <button
                              type="button"
                              className="collapse-btn"
                              onClick={() =>
                                setCollapsedGroups((prev) => ({
                                  ...prev,
                                  [group.id]: !prev[group.id],
                                }))
                              }
                            >
                              {isCollapsed ? '펼치기' : '접기'}
                            </button>
                          </div>
                        </div>

                        <div className="area-stages">
                          {groupNodes.map((node) => {
                            const isChecked = draftSequenceConfig.selectedNodeIds.includes(
                              node.nodeId
                            );
                            return (
                              <label
                                key={node.nodeId}
                                className={`stage-row ${isChecked ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCueNode(node.nodeId)}
                                />
                                <span className="stage-name">{node.stageShortLabel}</span>
                                <span className="stage-meta">
                                  {node.bellCode
                                    ? `[${node.bellCode}] ${node.originalTimeText}`
                                    : `[영어 듣기] ${node.originalTimeText}`}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })
                  .filter(Boolean);

                if (visibleCards.length === 0) {
                  return (
                    <div className="empty-state">
                      검색 조건에 일치하는 타종 단계가 없습니다.
                    </div>
                  );
                }
                return <div className="area-cards-grid">{visibleCards}</div>;
              })()}
                  </>
                )}
              </section>
            )}

            {builderStep === 3 && (
              /* 3단계: 2. 선택된 타종 진행 순서, 시간 간격 및 연쇄 시각 설정 */
              <section className="right-pane step-single-pane" ref={builderRightPaneRef}>
                <div className="pane-title">
                  <span>선택된 타종 진행 순서 및 시간 간격 · 시각 설정</span>
                </div>

              {/* B4: 일괄 간격 도구 바 */}
              <div className="batch-interval-bar">
                <div className="batch-interval-controls">
                  <span className="tools-label">일괄 간격</span>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleBatchPreset('prep_1')}
                  >
                    준비→본령 1분
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleBatchPreset('break_3')}
                  >
                    영역 전환 3분
                  </button>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => handleBatchPreset('test_10s')}
                  >
                    전체 10초
                  </button>
                </div>
                <div className="batch-interval-controls">
                  <span>기존</span>
                  <input
                    type="number"
                    min={0}
                    max={600}
                    className="batch-num-input"
                    value={batchFromMin}
                    onChange={(e) => setBatchFromMin(Number(e.target.value))}
                  />
                  <span>분 →</span>
                  <input
                    type="number"
                    min={1}
                    max={600}
                    className="batch-num-input"
                    value={batchToMin}
                    onChange={(e) => setBatchToMin(Number(e.target.value))}
                  />
                  <span>분</span>
                  <button
                    type="button"
                    className="chip"
                    onClick={handleBatchReplace}
                  >
                    일괄 변경
                  </button>
                </div>
              </div>

              {/* C2: 구성 진단 요약 배너 */}
              {draftAnalysis.diagnostics.length > 0 && (
                <div className="diag-strip">
                  {draftAnalysis.diagnostics.map((d) => (
                    <div key={d.id} className={`diag-item level-${d.level}`}>
                      <span>
                        {d.level === 'info' ? '알림 · ' : '확인 필요 · '}
                        {d.message}
                      </span>
                      {d.fixNodeIds && d.fixNodeIds.length > 0 && (
                        <button
                          type="button"
                          className="fix-btn"
                          onClick={() => {
                            const fixedIds = d.fixNodeIds || [];
                            setSubjAutoChecked((prev) => {
                              const next = { ...prev };
                              fixedIds.forEach((fid) => {
                                const nodeMeta = CSAT_SELECTABLE_CUE_NODES.find((n) => n.nodeId === fid);
                                if (nodeMeta) next[nodeMeta.subjectGroupId] = true;
                              });
                              return next;
                            });
                            updateDraftConfig((prev) => {
                              const s = new Set(prev.selectedNodeIds);
                              fixedIds.forEach((id) => s.add(id));
                              return { ...prev, selectedNodeIds: Array.from(s) };
                            });
                          }}
                        >
                          {d.fixLabel || '+ 단계 추가'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* C2: 첫 선택 단계 이전 생략된 단계 표시 */}
              {draftAnalysis.omittedBeforeFirst.length > 0 && (
                <div className="omitted-steps-box">
                  <button
                    type="button"
                    className="omitted-toggle-btn"
                    onClick={() =>
                      setExpandedOmittedKeys((prev) => ({
                        ...prev,
                        __before_first: !prev.__before_first,
                      }))
                    }
                  >
                    <span>
                      이전 생략된 단계 {draftAnalysis.omittedBeforeFirst.length}개
                    </span>
                    <span>{expandedOmittedKeys.__before_first ? '숨기기' : '펼치기'}</span>
                  </button>
                  {expandedOmittedKeys.__before_first && (
                    <div className="omitted-list">
                      {draftAnalysis.omittedBeforeFirst.map((omNode) => (
                        <span key={omNode.nodeId} className="omitted-pill">
                          {omNode.subjectTitle} · {omNode.stageShortLabel} (
                          {omNode.originalTimeText})
                          <button
                            type="button"
                            onClick={() => handleToggleCueNode(omNode.nodeId)}
                          >
                            +
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {draftRows.length === 0 ? (
                <div className="empty-state">
                  <p style={{ margin: '0 0 12px' }}>
                    선택된 타종 단계가 없습니다. 이전(2단계)에서 진행할 영역과 단계를 선택하세요.
                  </p>
                  <button
                    type="button"
                    className="chip"
                    onClick={() => goToBuilderStep(2)}
                  >
                    2단계로 이동
                  </button>
                </div>
              ) : (
                draftRows.map((row, idx) => {
                  const isLast = idx === draftRows.length - 1;
                  const nextNode = row.nextNode;
                  const isSubjectJump = row.isSubjectTransition;
                  const bellItem = row.node.bellCode
                    ? CSAT_37_BELL_FILES.find((b) => b.code === row.node.bellCode)
                    : null;
                  const origDiff = nextNode
                    ? Math.max(1, nextNode.originalMinutes - row.node.originalMinutes)
                    : 5;
                  const intKey = getIntervalMapKey(
                    row.node.nodeId,
                    nextNode ? nextNode.nodeId : 'SINGLE_END'
                  );
                  const intErr = rowInputErrors[`int_${intKey}`];
                  const timeErr = rowInputErrors[`time_${row.node.nodeId}`];
                  const omittedKey = `after_${row.node.nodeId}`;

                  const rowPopupId = `row_time:${row.node.nodeId}`;
                  const isRowPopupOpen = openCustomPopup === rowPopupId;
                  const rowHmStr = format24hInputTime(row.customTimeMinutes);
                  const [rowHh = 8, rowMm = 5] = rowHmStr.split(':').map((n) => Number(n) || 0);
                  const rowAmPm = rowHh < 12 ? '오전' : '오후';
                  const rowH12 = rowHh % 12 === 0 ? 12 : rowHh % 12;

                  return (
                    <article
                      key={row.node.nodeId}
                      className={`schedule-item ${isRowPopupOpen ? 'is-popover-open' : ''}`}
                      data-node-id={row.node.nodeId}
                    >
                      <div className="alarm-card">
                        <div className="number">{idx + 1}</div>
                        <div className="alarm-title-wrap">
                          <div className="alarm-name">
                            {row.node.fullTitle}
                            {row.dayOffset > 0 && (
                              <span className="next-day-badge">+{row.dayOffset}일</span>
                            )}
                          </div>
                          <div className="alarm-sub">
                            정시 {row.node.originalTimeText} · 타종{' '}
                            {format24hTime(row.customTimeMinutes)} ·{' '}
                            {bellItem ? `타종 ${bellItem.code}` : '영어 듣기 방송'}
                            {row.isMuted ? ' · 음소거' : ''}
                          </div>
                        </div>
                        <div>
                          <div className="clock-control">
                            <span>타종 시각</span>
                            <div className="custom-select-wrap">
                              <button
                                type="button"
                                className={`custom-time-trigger ${isRowPopupOpen ? 'is-open' : ''} ${
                                  timeErr ? 'input-invalid' : ''
                                }`}
                                onClick={() => {
                                  if (isRowPopupOpen) {
                                    setOpenCustomPopup(null);
                                    setPopupTimeError(null);
                                  } else {
                                    setCustomTimeDraftText(rowHmStr);
                                    setPopupHourDraft(String(rowH12).padStart(2, '0'));
                                    setPopupMinDraft(String(rowMm).padStart(2, '0'));
                                    setPopupTimeError(null);
                                    setOpenCustomPopup(rowPopupId);
                                  }
                                }}
                              >
                                <span>
                                  {rowAmPm} {String(rowH12).padStart(2, '0')}:
                                  {String(rowMm).padStart(2, '0')}
                                </span>
                                <svg
                                  className="chevron-icon"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="6 9 12 15 18 9" />
                                </svg>
                              </button>

                              {isRowPopupOpen && (() => {
                                const isOpenUp =
                                  draftRows.length > 2 && idx >= draftRows.length - 1;
                                const commitRowDigits = (
                                  h12Text: string,
                                  mText: string,
                                  closeOnSuccess = true
                                ) => {
                                  const rawH12 = Number(h12Text);
                                  const rawMm = Number(mText);
                                  if (
                                    !Number.isFinite(rawH12) ||
                                    !Number.isFinite(rawMm) ||
                                    rawH12 < 1 ||
                                    rawH12 > 12 ||
                                    rawMm < 0 ||
                                    rawMm > 59
                                  ) {
                                    setPopupTimeError('시(1~12)와 분(0~59)을 올바르게 입력해 주세요.');
                                    return;
                                  }
                                  const isPmNow = rowHh >= 12;
                                  const h12Norm = Math.round(rawH12) % 12;
                                  const nextH24 = isPmNow ? h12Norm + 12 : h12Norm;
                                  const nextMm = Math.round(rawMm);
                                  const nextHm = `${String(nextH24).padStart(2, '0')}:${String(
                                    nextMm
                                  ).padStart(2, '0')}`;
                                  const res = handleDirectTimeInputChange(idx, nextHm);
                                  if (res.ok) {
                                    setPopupTimeError(null);
                                    setCustomTimeDraftText(nextHm);
                                    setPopupHourDraft(String(rawH12).padStart(2, '0'));
                                    setPopupMinDraft(String(nextMm).padStart(2, '0'));
                                    if (closeOnSuccess) {
                                      setOpenCustomPopup(null);
                                    }
                                  } else {
                                    setPopupTimeError(res.error || '시각 입력 오류');
                                  }
                                };

                                const applyRowDeltaMinutes = (deltaMin: number) => {
                                  const baseMin = Math.floor(row.customTimeMinutes) % 1440;
                                  const nextMinOfDay = clamp(baseMin + deltaMin, 0, 23 * 60 + 59);
                                  const nextHm = format24hInputTime(nextMinOfDay);
                                  const res = handleDirectTimeInputChange(idx, nextHm);
                                  if (res.ok) {
                                    const nh = Math.floor(nextMinOfDay / 60);
                                    const nm = nextMinOfDay % 60;
                                    const nh12 = nh % 12 === 0 ? 12 : nh % 12;
                                    setPopupTimeError(null);
                                    setCustomTimeDraftText(nextHm);
                                    setPopupHourDraft(String(nh12).padStart(2, '0'));
                                    setPopupMinDraft(String(nm).padStart(2, '0'));
                                  } else {
                                    setPopupTimeError(res.error || '시각 조정 오류');
                                  }
                                };

                                return (
                                  <div
                                    className={`custom-time-popover ${isOpenUp ? 'open-up' : ''}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="custom-time-head">
                                      <span className="custom-time-title">
                                        #{idx + 1} 타종 시각
                                        <span className="custom-time-badge">{rowHmStr}</span>
                                      </span>
                                      <button
                                        type="button"
                                        className="custom-time-close"
                                        onClick={() => {
                                          setPopupTimeError(null);
                                          setOpenCustomPopup(null);
                                        }}
                                      >
                                        닫기
                                      </button>
                                    </div>

                                    <div className="custom-time-ampm-row">
                                      {(['AM', 'PM'] as const).map((period) => {
                                        const isAm = rowHh < 12;
                                        const active =
                                          (period === 'AM' && isAm) || (period === 'PM' && !isAm);
                                        return (
                                          <button
                                            key={period}
                                            type="button"
                                            className={`custom-time-ampm-btn ${
                                              active ? 'is-active' : ''
                                            }`}
                                            onClick={() => {
                                              let nextH = rowHh;
                                              if (period === 'AM' && rowHh >= 12) nextH = rowHh - 12;
                                              if (period === 'PM' && rowHh < 12) nextH = rowHh + 12;
                                              const nextHm = `${String(nextH).padStart(2, '0')}:${String(rowMm).padStart(2, '0')}`;
                                              const res = handleDirectTimeInputChange(idx, nextHm);
                                              if (res.ok) {
                                                const nh12 = nextH % 12 === 0 ? 12 : nextH % 12;
                                                setPopupTimeError(null);
                                                setCustomTimeDraftText(nextHm);
                                                setPopupHourDraft(String(nh12).padStart(2, '0'));
                                                setPopupMinDraft(String(rowMm).padStart(2, '0'));
                                              } else {
                                                setPopupTimeError(res.error || '시각 변경 오류');
                                              }
                                            }}
                                          >
                                            {period === 'AM' ? '오전' : '오후'}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    <div className="custom-time-digit-grid">
                                      <div className="custom-time-digit-box">
                                        <span className="custom-time-digit-label">시</span>
                                        <div className="custom-time-stepper">
                                          <button
                                            type="button"
                                            className="custom-time-step-btn"
                                            aria-label="1시간 감소"
                                            onClick={() => applyRowDeltaMinutes(-60)}
                                          >
                                            −
                                          </button>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            className="custom-time-digit-input"
                                            aria-label="시 입력"
                                            value={popupHourDraft}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                              setPopupHourDraft(e.target.value.replace(/\D/g, '').slice(0, 2))
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                commitRowDigits(popupHourDraft, popupMinDraft, true);
                                              }
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="custom-time-step-btn"
                                            aria-label="1시간 증가"
                                            onClick={() => applyRowDeltaMinutes(60)}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      <span className="custom-time-colon">:</span>

                                      <div className="custom-time-digit-box">
                                        <span className="custom-time-digit-label">분</span>
                                        <div className="custom-time-stepper">
                                          <button
                                            type="button"
                                            className="custom-time-step-btn"
                                            aria-label="1분 감소"
                                            onClick={() => applyRowDeltaMinutes(-1)}
                                          >
                                            −
                                          </button>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={2}
                                            className="custom-time-digit-input"
                                            aria-label="분 입력"
                                            value={popupMinDraft}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) =>
                                              setPopupMinDraft(e.target.value.replace(/\D/g, '').slice(0, 2))
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') {
                                                e.preventDefault();
                                                commitRowDigits(popupHourDraft, popupMinDraft, true);
                                              }
                                            }}
                                          />
                                          <button
                                            type="button"
                                            className="custom-time-step-btn"
                                            aria-label="1분 증가"
                                            onClick={() => applyRowDeltaMinutes(1)}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="custom-time-quick-grid">
                                      {[
                                        { label: '−10분', deltaMin: -10 },
                                        { label: '−5분', deltaMin: -5 },
                                        { label: '−1분', deltaMin: -1 },
                                        { label: '+1분', deltaMin: 1 },
                                        { label: '+5분', deltaMin: 5 },
                                        { label: '+10분', deltaMin: 10 },
                                      ].map((nudgeItem) => (
                                        <button
                                          key={nudgeItem.label}
                                          type="button"
                                          className="custom-time-nudge-btn"
                                          onClick={() => applyRowDeltaMinutes(nudgeItem.deltaMin)}
                                        >
                                          {nudgeItem.label}
                                        </button>
                                      ))}
                                    </div>

                                    {popupTimeError && (
                                      <div className="custom-time-error">{popupTimeError}</div>
                                    )}

                                    <div className="custom-time-footer-row">
                                      <button
                                        type="button"
                                        className="custom-time-reset-btn"
                                        onClick={() => {
                                          const res = handleDirectTimeInputChange(
                                            idx,
                                            row.node.originalTimeText
                                          );
                                          if (res.ok) {
                                            setPopupTimeError(null);
                                            setCustomTimeDraftText(row.node.originalTimeText);
                                            setOpenCustomPopup(null);
                                          } else {
                                            setPopupTimeError(res.error || '정시 복원 오류');
                                          }
                                        }}
                                      >
                                        정시 ({row.node.originalTimeText})
                                      </button>
                                      <button
                                        type="button"
                                        className="custom-time-apply-btn"
                                        onClick={() =>
                                          commitRowDigits(popupHourDraft, popupMinDraft, true)
                                        }
                                      >
                                        적용
                                      </button>
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                          {timeErr && <div className="field-error-msg">{timeErr}</div>}
                        </div>
                        <div className="alarm-actions-col">
                          <button
                            type="button"
                            className={`mute-toggle-btn ${row.isMuted ? 'is-muted' : ''}`}
                            onClick={() => handleToggleMuteNode(row.node.nodeId)}
                            aria-label={row.isMuted ? '음소거 해제' : '음소거'}
                            title={row.isMuted ? '음소거 해제' : '이 타종 음소거'}
                          >
                            {row.isMuted ? (
                              <svg
                                viewBox="0 0 24 24"
                                width="15"
                                height="15"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M11 5 6 9H3v6h3l5 4z" />
                                <path d="m16 9 5 6m0-6-5 6" />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                width="15"
                                height="15"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M11 5 6 9H3v6h3l5 4z" />
                                <path d="M15.5 8.5a5 5 0 0 1 0 7m2.8-9.8a9 9 0 0 1 0 12.6" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* A2/C2: 016 선택 + ENG_1307 미선택 인라인 안내 */}
                      {row.missingEngListeningNotice && (
                        <div className="row-inline-alert info">
                          <span>
                            13:07 영어 듣기평가 노드가 선택되지 않아 듣기 음원이 자동 재생되지
                            않습니다.
                          </span>
                          <button
                            type="button"
                            className="fix-btn"
                            onClick={() => handleToggleCueNode('ENG_1307')}
                          >
                            + 영어 듣기평가 추가
                          </button>
                        </div>
                      )}

                      {/* B2: 음원 길이 > 설정 간격 잘림 경고 */}
                      {row.truncationWarning && (
                        <div className="row-inline-alert warn">
                          <span>
                            음원 길이({formatBellDuration(row.truncationWarning.bellDurationSec)})가
                            다음 타종 간격(
                            {formatIntervalSecondsLabel(row.truncationWarning.intervalSec)})보다 길어
                            재생 중 다음 타종에 의해 끊깁니다.
                          </span>
                          <button
                            type="button"
                            className="fix-btn"
                            onClick={() =>
                              handleSetIntervalSeconds(
                                row.node,
                                nextNode,
                                row.truncationWarning!.recommendedMinutes * 60
                              )
                            }
                          >
                            간격 늘리기 ({row.truncationWarning.recommendedMinutes}분)
                          </button>
                        </div>
                      )}

                      {/* 다음 타종까지의 대기 간격 설정 커넥터 */}
                      {(!isLast || draftRows.length === 1) && (
                        <div className="interval-row">
                          <div className="interval-copy">
                            <div className="interval-title">
                              {nextNode
                                ? `${row.node.stageShortLabel} 후 ${formatIntervalSecondsLabel(
                                    row.intervalAfterSeconds
                                  )} 뒤 → ${
                                    isSubjectJump ? `[${nextNode.subjectTitle}] ` : ''
                                  }${nextNode.stageShortLabel}`
                                : `${row.node.stageShortLabel} 단독 진행 시간 (${formatIntervalSecondsLabel(
                                    row.intervalAfterSeconds
                                  )})`}
                            </div>
                            {nextNode && (
                              <div className="interval-sub">
                                원래 수능 간격 {origDiff}분
                                {isSubjectJump ? ' · 영역 전환 구간' : ''}
                              </div>
                            )}
                            {intErr && <div className="field-error-msg">{intErr}</div>}
                          </div>

                          <div className="interval-actions">
                            <button
                              type="button"
                              className="nudge"
                              onClick={() =>
                                handleSetIntervalSeconds(
                                  row.node,
                                  nextNode,
                                  row.intervalAfterSeconds - 300
                                )
                              }
                            >
                              −5분
                            </button>
                            <button
                              type="button"
                              className="nudge"
                              onClick={() =>
                                handleSetIntervalSeconds(
                                  row.node,
                                  nextNode,
                                  row.intervalAfterSeconds - 60
                                )
                              }
                            >
                              −1분
                            </button>

                            <input
                              type="text"
                              className={`interval-input ${intErr ? 'input-invalid' : ''}`}
                              value={
                                intervalInputTexts[intKey] ??
                                formatIntervalInputDisplay(row.intervalAfterSeconds)
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                setIntervalInputTexts((prev) => ({ ...prev, [intKey]: val }));
                                handleIntervalTextCommit(row.node, nextNode, val);
                              }}
                              aria-label="다음 타종까지 대기 간격 (분 또는 mm:ss)"
                              title="정수 분(예: 5) 또는 mm:ss(예: 1:30, 최소 0:10) 입력"
                            />
                            <span className="unit">분 뒤</span>

                            <button
                              type="button"
                              className="nudge"
                              onClick={() =>
                                handleSetIntervalSeconds(
                                  row.node,
                                  nextNode,
                                  row.intervalAfterSeconds + 60
                                )
                              }
                            >
                              +1분
                            </button>
                            <button
                              type="button"
                              className="nudge"
                              onClick={() =>
                                handleSetIntervalSeconds(
                                  row.node,
                                  nextNode,
                                  row.intervalAfterSeconds + 300
                                )
                              }
                            >
                              +5분
                            </button>
                            <button
                              type="button"
                              className="nudge"
                              onClick={() =>
                                handleSetIntervalSeconds(
                                  row.node,
                                  nextNode,
                                  row.intervalAfterSeconds + 600
                                )
                              }
                            >
                              +10분
                            </button>
                          </div>
                        </div>
                      )}

                      {/* C2: 두 선택 행 사이에 생략된 단계 표시 */}
                      {row.omittedAfter.length > 0 && (
                        <div className="omitted-steps-box">
                          <button
                            type="button"
                            className="omitted-toggle-btn"
                            onClick={() =>
                              setExpandedOmittedKeys((prev) => ({
                                ...prev,
                                [omittedKey]: !prev[omittedKey],
                              }))
                            }
                          >
                            <span>이 구간 사이 생략된 단계 {row.omittedAfter.length}개</span>
                            <span>{expandedOmittedKeys[omittedKey] ? '숨기기' : '펼치기'}</span>
                          </button>
                          {expandedOmittedKeys[omittedKey] && (
                            <div className="omitted-list">
                              {row.omittedAfter.map((omNode) => (
                                <span key={omNode.nodeId} className="omitted-pill">
                                  {omNode.subjectTitle} · {omNode.stageShortLabel} (
                                  {omNode.originalTimeText})
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCueNode(omNode.nodeId)}
                                  >
                                    +
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              )}

              {/* C2: 마지막 선택 단계 이후 생략된 단계 표시 */}
              {draftAnalysis.omittedAfterLast.length > 0 && (
                <div className="omitted-steps-box">
                  <button
                    type="button"
                    className="omitted-toggle-btn"
                    onClick={() =>
                      setExpandedOmittedKeys((prev) => ({
                        ...prev,
                        __after_last: !prev.__after_last,
                      }))
                    }
                  >
                    <span>
                      이후 생략된 단계 {draftAnalysis.omittedAfterLast.length}개
                    </span>
                    <span>{expandedOmittedKeys.__after_last ? '숨기기' : '펼치기'}</span>
                  </button>
                  {expandedOmittedKeys.__after_last && (
                    <div className="omitted-list">
                      {draftAnalysis.omittedAfterLast.map((omNode) => (
                        <span key={omNode.nodeId} className="omitted-pill">
                          {omNode.subjectTitle} · {omNode.stageShortLabel} (
                          {omNode.originalTimeText})
                          <button
                            type="button"
                            onClick={() => handleToggleCueNode(omNode.nodeId)}
                          >
                            +
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              </section>
            )}
          </div>

          {/* 하단 요약 및 단계 이동 · 적용 버튼 */}
          <footer className="dialog-footer">
            <div className="summary">
              선택된 타종 <strong>{draftRows.length}개</strong> · 총 진행 대기 시간{' '}
              <strong>
                {Math.floor(totalDraftMinutes / 60) > 0
                  ? `${Math.floor(totalDraftMinutes / 60)}시간 ${totalDraftMinutes % 60}분 (${totalDraftMinutes}분)`
                  : `${totalDraftMinutes}분`}
              </strong>
            </div>

            <div className="footer-actions">
              <button
                type="button"
                className="footer-btn"
                onClick={closeBuilderModalWithoutSaving}
              >
                취소
              </button>
              {builderStep > 1 && (
                <button
                  type="button"
                  className="footer-btn"
                  onClick={() => goToBuilderStep((builderStep - 1) as 1 | 2 | 3)}
                >
                  이전
                </button>
              )}
              {builderStep < 3 && (
                <div className="lg-pill-cta-wrap is-next">
                  <div className="lg-pill-cta-shadow" aria-hidden="true" />
                  <button
                    type="button"
                    className="lg-pill-cta-btn"
                    onClick={() => goToBuilderStep((builderStep + 1) as 1 | 2 | 3)}
                  >
                    <span className="lg-pill-cta-label">
                      다음
                      <svg
                        className="lg-pill-cta-chevron"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </button>
                </div>
              )}
              <div className="lg-pill-cta-wrap is-save">
                <div className="lg-pill-cta-shadow" aria-hidden="true" />
                <button
                  type="button"
                  className="lg-pill-cta-btn"
                  disabled={Object.keys(rowInputErrors).length > 0 || draftRows.length === 0}
                  onClick={handleApplyCustomSequenceToTimer}
                >
                  <span className="lg-pill-cta-label">선택 구성 저장</span>
                </button>
              </div>
            </div>
          </footer>

          {isRunningSaveConfirmOpen && (
            <div
              className="running-save-confirm-scrim"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsRunningSaveConfirmOpen(false);
                }
              }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="runningSaveConfirmTitle"
              aria-describedby="runningSaveConfirmDesc"
            >
              <div className="running-save-confirm-card">
                <div className="running-save-confirm-head">
                  <span className="running-save-confirm-badge" aria-hidden="true">
                    !
                  </span>
                  <h2 id="runningSaveConfirmTitle">타이머가 실행 중입니다</h2>
                </div>
                <p id="runningSaveConfirmDesc" className="running-save-confirm-desc">
                  선택 구성을 저장하면 현재 실행 중인 타이머가 자동 종료되고 편집한 구성으로 변경됩니다.
                  계속하시겠습니까?
                </p>
                <div className="running-save-confirm-actions">
                  <button
                    type="button"
                    className="footer-btn"
                    onClick={() => setIsRunningSaveConfirmOpen(false)}
                  >
                    취소
                  </button>
                  <div className="lg-pill-cta-wrap is-save">
                    <div className="lg-pill-cta-shadow" aria-hidden="true" />
                    <button
                      type="button"
                      className="lg-pill-cta-btn"
                      onClick={commitCustomSequenceToTimer}
                    >
                      <span className="lg-pill-cta-label">수락</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 전용 창 2: 대학수학능력시험 전체 시간표 · 37개 타종 목록 · 앱 버전 설정 모달 */}
      {isModalOpen && (
        <div
          className="modal-backdrop-layer"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopPreviewBell();
              setIsModalOpen(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalHeading"
        >
          <div
            style={{
              width: 'min(760px, 100%)',
              maxHeight: 'min(86dvh, 740px)',
              borderRadius: 26,
              border: '1px solid var(--modal-border)',
              background: 'var(--modal-bg)',
              WebkitBackdropFilter: 'blur(48px) saturate(190%)',
              backdropFilter: 'blur(48px) saturate(190%)',
              boxShadow: '0 24px 60px -12px rgba(0,0,0,.38)',
              color: 'var(--modal-ink)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                borderBottom: '1px solid var(--modal-surface)',
              }}
            >
              <h2
                id="modalHeading"
                style={{ margin: 0, fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}
              >
                대학수학능력시험 전체 시간표 · 37개 타종 · 설정
              </h2>
              <button
                type="button"
                onClick={() => {
                  stopPreviewBell();
                  setIsModalOpen(false);
                }}
                style={{
                  border: 'none',
                  background: 'var(--modal-surface)',
                  color: 'var(--modal-ink)',
                  padding: '6px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                aria-label="닫기"
              >
                닫기
              </button>
            </div>

            <div
              style={{
                padding: '18px 22px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {/* 웹페이지 내부 실제 설명 표시 배너 (<h1>, <p>) */}
              <div className="info-seo-banner">
                <h1>2027학년도 대학수학능력시험 시험장 안내방송 구현</h1>
                <p>
                  수능 타종 · 수능 방송 · 수능 알림 · 실제 수능 시험장의 1교시 국어부터 5교시 제2외국어/한문까지
                  37개 공식 타종 음원과 3교시 영어 듣기평가 자동 재생, 영역별 맞춤 시간표 구성을 완벽히 구현한
                  실전 수능 시계 및 모의고사 타이머입니다.
                </p>
                <div className="info-seo-tags">
                  <span className="info-seo-tag">2027학년도 대학수학능력시험 시험장 안내방송 구현</span>
                  <span className="info-seo-tag">수능 타종</span>
                  <span className="info-seo-tag">수능 방송</span>
                  <span className="info-seo-tag">수능 알림</span>
                  <span className="info-seo-tag">수능 시계 · 모의고사 타이머</span>
                  <span className="info-seo-tag">영어 듣기평가 자동 재생</span>
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--modal-muted)',
                  }}
                >
                  대학수학능력시험 전체 시간표 (구간 선택 시 해당 시간으로 즉시 설정)
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table
                    style={{
                      width: '100%',
                      borderCollapse: 'collapse',
                      fontSize: 12,
                    }}
                  >
                    <thead>
                      <tr style={{ background: 'var(--modal-surface)', color: 'var(--modal-muted)' }}>
                        <th style={{ padding: '7px 8px', textAlign: 'left' }}>교시</th>
                        <th style={{ padding: '7px 8px', textAlign: 'left' }}>시각</th>
                        <th style={{ padding: '7px 8px', textAlign: 'left' }}>구분</th>
                        <th style={{ padding: '7px 8px', textAlign: 'left' }}>진행 내용</th>
                        <th style={{ padding: '7px 8px', textAlign: 'center' }}>선택</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CSAT_FULL_TIMETABLE.map((row) => {
                        const isSelected = row.id === activeRowId;
                        return (
                          <tr
                            key={row.id}
                            style={{
                              borderBottom: '1px solid var(--modal-surface)',
                              background: isSelected ? 'rgba(217,86,138,.15)' : 'transparent',
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                              {row.periodLabel}
                            </td>
                            <td
                              style={{
                                padding: '7px 8px',
                                whiteSpace: 'nowrap',
                                fontVariantNumeric: 'tabular-nums',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              }}
                            >
                              {row.timeRangeText}
                            </td>
                            <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}>
                              {row.category}
                            </td>
                            <td style={{ padding: '7px 8px' }}>{row.description}</td>
                            <td style={{ padding: '7px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleSelectTimetableRow(row)}
                                className="seq-mini-btn"
                              >
                                선택
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--modal-muted)',
                  }}
                >
                  수능타종 37개 기본 음원 목록 (/public/audio/bells/ · HTML 내보내기 시 내장:{' '}
                  {embeddedBellCount} / 37개)
                </p>
                <div
                  style={{
                    maxHeight: 210,
                    overflowY: 'auto',
                    borderRadius: 14,
                    border: '1px solid var(--modal-surface)',
                  }}
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: 'var(--modal-surface)', color: 'var(--modal-muted)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>번호</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>시각</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>파일명</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>길이 / 내장 상태</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>미리듣기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CSAT_37_BELL_FILES.map((item) => {
                        const isLoaded = Boolean(CUSTOM_37_BELL_MP3_DATA_URIS[item.code]);
                        const isPlayingThis =
                          previewState.code === item.code && previewState.playing;
                        return (
                          <tr
                            key={item.code}
                            style={{ borderBottom: '1px solid var(--modal-surface)' }}
                          >
                            <td
                              style={{
                                padding: '6px 8px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              }}
                            >
                              {item.code}
                            </td>
                            <td
                              style={{
                                padding: '6px 8px',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              }}
                            >
                              {item.timeText}
                            </td>
                            <td style={{ padding: '6px 8px' }}>{item.fileName}</td>
                            <td
                              style={{
                                padding: '6px 8px',
                                color: 'var(--modal-muted)',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                              }}
                            >
                              {formatBellDuration(item.durationSec)} ·{' '}
                              {isLoaded ? 'MP3 내장됨' : BELL_LABELS[item.fallbackBellType]}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => togglePreviewBell(item)}
                                className="seq-mini-btn"
                              >
                                {isPlayingThis
                                  ? `정지 (${formatBellDuration(previewState.currentTime)})`
                                  : `재생 (${formatBellDuration(item.durationSec)})`}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <p
                  style={{
                    margin: '0 0 8px 0',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--modal-muted)',
                  }}
                >
                  단일 HTML 패키징 배포 및 애플리케이션 버전 정보
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'var(--modal-surface)',
                    fontSize: 12.5,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>앱 내부 설정 버전</span>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontWeight: 700,
                      }}
                    >
                      {formatAppVersion(devMode)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>시스템 기기 설정 버전</span>
                    <span
                      style={{
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                        fontWeight: 700,
                      }}
                    >
                      {formatAppVersion(true)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <label htmlFor="reactDevMode" style={{ cursor: 'pointer' }}>
                      개발자 모드 활성화 (타임스탬프 p 표시)
                    </label>
                    <input
                      id="reactDevMode"
                      type="checkbox"
                      checked={devMode}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setDevMode(checked);
                        saveCustomSettingsToStorage(
                          themePref,
                          selectedPresetId,
                          checked,
                          clockSyncMode,
                          customSequenceConfig
                        );
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>37개 타종 포함 · 듣기/설정 제외 내보내기</span>
                    <button
                      type="button"
                      onClick={handleDownloadStandaloneHtml}
                      disabled={isExportingHtml}
                      style={{
                        border: 'none',
                        background: 'var(--ink)',
                        color: 'var(--stage)',
                        borderRadius: 999,
                        padding: '5px 12px',
                        fontSize: 11.5,
                        fontWeight: 600,
                        cursor: isExportingHtml ? 'wait' : 'pointer',
                      }}
                    >
                      {isExportingHtml ? '패키징 중...' : '단일 .html 파일 저장'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {pwaInstall.showIOSGuide && (
        <div
          className="modal-backdrop open"
          role="dialog"
          aria-modal="true"
          aria-label="iOS 홈 화면에 앱 추가 안내"
          onClick={(e) => {
            if (e.target === e.currentTarget) pwaInstall.closeIOSGuide();
          }}
        >
          <div className="modal-card" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h2>홈 화면에 앱 설치 안내 (iOS)</h2>
              <button
                className="modal-close"
                type="button"
                onClick={pwaInstall.closeIOSGuide}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, lineHeight: 1.6 }}>
              <p>Safari 브라우저 하단(또는 상단)의 <strong>공유 버튼</strong>을 누른 뒤 <strong>[홈 화면에 추가]</strong>를 선택하면 독립된 앱 형태로 사용할 수 있습니다.</p>
              <button
                type="button"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-end', marginTop: 6 }}
                onClick={pwaInstall.closeIOSGuide}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
