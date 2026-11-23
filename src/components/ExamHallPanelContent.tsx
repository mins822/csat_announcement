import React, { useEffect, useMemo, useRef } from 'react';
import {
  BuiltExamHallSchedule,
  EXAM_HALL_SUBJECTS,
  ExamHallSettings,
  SeatSoundFeedback,
  TimerExamHallSyncPhase,
  drawExamHallDensityCanvas,
  formatSkillLevelLabel,
} from '../utils/examHallNoiseEngine';

export interface ActiveSeatPulseMap {
  [seatIdx: number]: 'turn' | 'write' | undefined;
}

interface ExamHallPanelContentProps {
  settings: ExamHallSettings;
  schedule: BuiltExamHallSchedule;
  isMainTimerRunning: boolean;
  isMainTimerPaused: boolean;
  syncPhase: TimerExamHallSyncPhase;
  syncElapsedSec: number;
  prepareWindowInfo: { windowStartSec: number; windowEndSec: number } | null;
  standaloneRunning: boolean;
  standaloneElapsedSec: number;
  activeSeatPulses: ActiveSeatPulseMap;
  lastSeatFeedback: SeatSoundFeedback | null;
  resolvedTheme: 'light' | 'dark' | 'sepia';
  isPanelOpen: boolean;
  onUpdateSettings: (patch: Partial<ExamHallSettings>) => void;
  onToggleStandalonePlay: () => void;
  onReseedSchedule: () => void;
  onPlaySoundTest: () => void;
}

function formatSecClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export const ExamHallPanelContent: React.FC<ExamHallPanelContentProps> = ({
  settings,
  schedule,
  isMainTimerRunning,
  isMainTimerPaused,
  syncPhase,
  syncElapsedSec,
  prepareWindowInfo,
  standaloneRunning,
  standaloneElapsedSec,
  activeSeatPulses,
  lastSeatFeedback,
  resolvedTheme,
  isPanelOpen,
  onUpdateSettings,
  onToggleStandalonePlay,
  onReseedSchedule,
  onPlaySoundTest,
}) => {
  const densityCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const occupiedOtherSet = useMemo(() => new Set(schedule.otherSeats), [schedule.otherSeats]);
  const subjectMeta = EXAM_HALL_SUBJECTS[schedule.subjectKey];

  const activePlayheadSec = useMemo<number | null>(() => {
    if (standaloneRunning) return standaloneElapsedSec;
    if (isMainTimerRunning && settings.enabled && syncPhase === 'main') {
      return syncElapsedSec;
    }
    return null;
  }, [isMainTimerRunning, settings.enabled, standaloneElapsedSec, standaloneRunning, syncElapsedSec, syncPhase]);

  useEffect(() => {
    if (!isPanelOpen) return;
    drawExamHallDensityCanvas(densityCanvasRef.current, schedule, activePlayheadSec, resolvedTheme);
  }, [activePlayheadSec, isPanelOpen, resolvedTheme, schedule]);

  let modeSubtitle = '준비령 파본검사 · 본령 풀이 입체음향 자동 연동';
  if (isMainTimerRunning) {
    if (!settings.enabled) {
      modeSubtitle = '켜면 현재 진행 중인 타이머 구간에 즉시 연동됩니다';
    } else if (isMainTimerPaused) {
      modeSubtitle = '실전 타이머 일시정지됨 · 대기 중';
    } else if (syncPhase === 'prepare') {
      if (prepareWindowInfo) {
        if (syncElapsedSec < prepareWindowInfo.windowStartSec) {
          modeSubtitle = '준비령 연동 · 파본검사 대기 중';
        } else if (syncElapsedSec <= prepareWindowInfo.windowEndSec) {
          modeSubtitle = '준비령 연동 · 파본검사 시험지 넘김 재생 중';
        } else {
          modeSubtitle = '준비령 연동 · 파본검사 완료 (본령까지 정숙 유지)';
        }
      } else {
        modeSubtitle = '준비령 연동 중';
      }
    } else if (syncPhase === 'main') {
      modeSubtitle = '본령 실전 연동 중 · 1× 실시간';
    } else {
      modeSubtitle = '타이머 연동 중 · 정숙 구간';
    }
  } else if (standaloneRunning) {
    modeSubtitle = `단독 재생 중 · ×${settings.standaloneSpeed} 배속`;
  }

  const displayClockSec = standaloneRunning
    ? standaloneElapsedSec
    : isMainTimerRunning && settings.enabled && (syncPhase === 'main' || syncPhase === 'prepare')
      ? syncElapsedSec
      : null;

  const seatStatusText = useMemo(() => {
    if (!lastSeatFeedback) {
      return `내 자리 ${settings.mySeat[0] + 1}-${settings.mySeat[1] + 1}`;
    }
    const c = (lastSeatFeedback.seatIndex % 4) + 1;
    const r = Math.floor(lastSeatFeedback.seatIndex / 4) + 1;
    return `${c}-${r} · ${lastSeatFeedback.label}`;
  }, [lastSeatFeedback, settings.mySeat]);

  const volPct = `${settings.volume}%`;
  const countPct = `${(((settings.studentCount - 1) / 27) * 100).toFixed(1)}%`;
  const skillMeanPct = `${(settings.skillMean * 100).toFixed(1)}%`;
  const skillStdPct = `${((settings.skillStd / 0.35) * 100).toFixed(1)}%`;
  const speedPct = `${(((settings.standaloneSpeed - 1) / 29) * 100).toFixed(1)}%`;

  return (
    <div className="eh-root">
      {/* 1. 시험장 모드 활성화 & 원클릭 재생 제어 */}
      <div className="eh-section eh-section-top">
        <label className="ui-option-toggle-row eh-master-toggle">
          <span className="ui-opt-text">
            <span>시험장 모드 (타이머 연동)</span>
            <span className="ui-opt-sub">{modeSubtitle}</span>
          </span>
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => onUpdateSettings({ enabled: e.target.checked })}
          />
        </label>

        <div className="eh-quick-bar">
          <div className="eh-subj-info">
            <span className="eh-subj-kicker">현재 타이머 과목 자동 적용</span>
            <div className="eh-subj-line">
              <span className="eh-subj-name">{subjectMeta.shortLabel}</span>
              {displayClockSec !== null && (
                <>
                  <span className="eh-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="eh-elapsed-clock">{formatSecClock(displayClockSec)}</span>
                </>
              )}
            </div>
          </div>

          {isMainTimerRunning ? (
            <button
              type="button"
              className={`eh-play-btn ${settings.enabled ? 'is-active' : ''}`}
              onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
            >
              {settings.enabled ? '실전 연동 중' : '연동 켜기'}
            </button>
          ) : (
            <button
              type="button"
              className={`eh-play-btn ${standaloneRunning ? 'is-active' : ''}`}
              onClick={onToggleStandalonePlay}
            >
              {standaloneRunning ? '단독 정지' : '단독 재생'}
            </button>
          )}
        </div>
      </div>

      {/* 2. 내 자리 선택 (4열×7행) 및 실시간 발음 표시 */}
      <div className="eh-section">
        <div className="eh-sec-head">
          <span className="eh-sec-title">자리 선택 (4열×7행)</span>
          <span className="eh-sec-meta">{seatStatusText}</span>
        </div>
        <div className="eh-front-label" aria-hidden="true">
          ▲ 앞 (교탁)
        </div>
        <div className="eh-seat-grid" role="group" aria-label="시험실 4열 7행 좌석 배치">
          {Array.from({ length: 7 }, (_, r) => (
            <div className="eh-seat-row" key={r}>
              {Array.from({ length: 4 }, (__, c) => {
                const idx = r * 4 + c;
                const isMe = settings.mySeat[0] === c && settings.mySeat[1] === r;
                const isOccupied = isMe || occupiedOtherSet.has(idx);
                const pulse = !isMe ? activeSeatPulses[idx] : undefined;
                const cls = [
                  'eh-seat-btn',
                  isMe ? 'is-me' : '',
                  !isOccupied ? 'is-vacant' : '',
                  pulse === 'turn' ? 'is-sound-turn' : '',
                  pulse === 'write' ? 'is-sound-write' : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <button
                    key={c}
                    type="button"
                    className={cls}
                    aria-pressed={isMe}
                    title={
                      isMe
                        ? `내 자리 (${c + 1}열 ${r + 1}행)`
                        : `${c + 1}열 ${r + 1}행 내 자리로 지정`
                    }
                    onClick={() => onUpdateSettings({ mySeat: [c, r] })}
                  >
                    {isMe ? `★ ${c + 1}-${r + 1}` : `${c + 1}-${r + 1}`}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 3. 음량 · 인원 · 실력 · 배속 슬라이더 (.vol-slider 재사용) */}
      <div className="eh-section eh-sliders-group">
        <label className="eh-slider-row">
          <span className="eh-slider-label">소음 음량</span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={settings.volume}
            className="vol-slider"
            style={{ '--slider-pct': volPct } as React.CSSProperties}
            onChange={(e) => onUpdateSettings({ volume: Number(e.target.value) })}
          />
          <span className="vol-val eh-slider-val">{settings.volume}%</span>
        </label>

        <label className="eh-slider-row">
          <span className="eh-slider-label">시험실 인원</span>
          <input
            type="range"
            min={1}
            max={28}
            step={1}
            value={settings.studentCount}
            className="vol-slider"
            style={{ '--slider-pct': countPct } as React.CSSProperties}
            onChange={(e) => onUpdateSettings({ studentCount: Number(e.target.value) })}
          />
          <span className="vol-val eh-slider-val">{settings.studentCount}명</span>
        </label>

        <label className="eh-slider-row">
          <span className="eh-slider-label">평균 실력 L</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={settings.skillMean}
            className="vol-slider"
            style={{ '--slider-pct': skillMeanPct } as React.CSSProperties}
            onChange={(e) => onUpdateSettings({ skillMean: Number(e.target.value) })}
          />
          <span className="vol-val eh-slider-val">
            {settings.skillMean.toFixed(2)} ({formatSkillLevelLabel(settings.skillMean)})
          </span>
        </label>

        <label className="eh-slider-row">
          <span className="eh-slider-label">집단 편차 σ</span>
          <input
            type="range"
            min={0}
            max={0.35}
            step={0.01}
            value={settings.skillStd}
            className="vol-slider"
            style={{ '--slider-pct': skillStdPct } as React.CSSProperties}
            onChange={(e) => onUpdateSettings({ skillStd: Number(e.target.value) })}
          />
          <span className="vol-val eh-slider-val">±{settings.skillStd.toFixed(2)}</span>
        </label>

        <label
          className={`eh-slider-row ${isMainTimerRunning ? 'is-locked' : ''}`}
          title={
            isMainTimerRunning
              ? '실전 타이머 연동 중에는 실시간(1배속)으로 고정됩니다'
              : '단독 재생 시 시뮬레이션 진행 배속을 조절합니다'
          }
        >
          <span className="eh-slider-label">단독 배속</span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            disabled={isMainTimerRunning}
            value={isMainTimerRunning ? 1 : settings.standaloneSpeed}
            className="vol-slider"
            style={{ '--slider-pct': isMainTimerRunning ? '0%' : speedPct } as React.CSSProperties}
            onChange={(e) => onUpdateSettings({ standaloneSpeed: Number(e.target.value) })}
          />
          <span className="vol-val eh-slider-val">
            {isMainTimerRunning ? '1× 고정' : `×${settings.standaloneSpeed}`}
          </span>
        </label>
      </div>

      {/* 4. 실내 공조음 · 도구 버튼 · 분당 소리 밀도 미니 그래프 */}
      <div className="eh-section eh-section-bottom">
        <label className="ui-option-toggle-row eh-air-toggle">
          <span className="ui-opt-text">
            <span>실내 공기 · 에어컨 소음</span>
          </span>
          <input
            type="checkbox"
            checked={settings.ambientAir}
            onChange={(e) => onUpdateSettings({ ambientAir: e.target.checked })}
          />
        </label>

        <div className="eh-action-row">
          <button type="button" className="eh-sub-btn" onClick={onReseedSchedule}>
            스케줄 다시 뽑기
          </button>
          <button type="button" className="eh-sub-btn" onClick={onPlaySoundTest}>
            소리 테스트
          </button>
        </div>

        <div className="eh-density-wrap">
          <div className="eh-sec-head">
            <span className="eh-sec-title">분당 소리 밀도</span>
            <span className="eh-sec-meta">파랑 넘김 · 회색 필기</span>
          </div>
          <canvas
            ref={densityCanvasRef}
            className="eh-density-canvas"
            aria-label="분당 시험장 소리 밀도 그래프"
          />
          <div className="eh-density-foot">
            타 수험생 {schedule.otherSeats.length}명 · 넘김 {schedule.totalTurns}회 · 1인당{' '}
            {schedule.turnsPerStudent.toFixed(1)}회
          </div>
        </div>
      </div>
    </div>
  );
};
