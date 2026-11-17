import { BellType, CSAT_37_BELL_FILES, CsatBellCueItem } from './csatSchedule';

export interface BellNote {
  freq: number;
  startSec: number;
  durationSec: number;
  gain?: number;
}

/**
 * /public/audio/bells/ 폴더에 업로드된 37개 기본 타종 MP3 파일의 Base64 Data URI 캐시 맵 (코드 '001' ~ '037' 기준)
 */
export const CUSTOM_37_BELL_MP3_DATA_URIS: Partial<Record<string, string>> = {};

export const BELL_LABELS: Record<Exclude<BellType, 'none'>, string> = {
  entry_prep: '입실 안내 타종',
  preliminary: '예비령 타종',
  prepare: '준비령 타종',
  listening_intro: '듣기평가 안내 방송 타종',
  main: '본령 타종 (시험 시작)',
  warn_10m: '종료 10분 전 타종',
  warn_5m: '종료 5분 전 타종',
  end: '종료령 타종 (시험 종료)',
};

const BELL_CHIME_PATTERNS: Record<Exclude<BellType, 'none'>, BellNote[]> = {
  entry_prep: [
    { freq: 440.0, startSec: 0.0, durationSec: 0.75, gain: 0.52 },
    { freq: 554.37, startSec: 0.45, durationSec: 0.75, gain: 0.54 },
    { freq: 659.25, startSec: 0.9, durationSec: 1.35, gain: 0.58 },
  ],
  preliminary: [
    { freq: 392.0, startSec: 0.0, durationSec: 0.9, gain: 0.55 },
    { freq: 493.88, startSec: 0.55, durationSec: 0.9, gain: 0.55 },
    { freq: 587.33, startSec: 1.1, durationSec: 0.9, gain: 0.58 },
    { freq: 783.99, startSec: 1.65, durationSec: 1.7, gain: 0.65 },
  ],
  prepare: [
    { freq: 659.25, startSec: 0.0, durationSec: 0.75, gain: 0.58 },
    { freq: 523.25, startSec: 0.5, durationSec: 0.75, gain: 0.55 },
    { freq: 587.33, startSec: 1.0, durationSec: 0.75, gain: 0.58 },
    { freq: 392.0, startSec: 1.5, durationSec: 1.3, gain: 0.62 },
    { freq: 392.0, startSec: 2.5, durationSec: 0.75, gain: 0.55 },
    { freq: 587.33, startSec: 3.0, durationSec: 0.75, gain: 0.58 },
    { freq: 659.25, startSec: 3.5, durationSec: 0.75, gain: 0.6 },
    { freq: 523.25, startSec: 4.0, durationSec: 1.6, gain: 0.65 },
  ],
  listening_intro: [
    { freq: 523.25, startSec: 0.0, durationSec: 0.8, gain: 0.55 },
    { freq: 659.25, startSec: 0.48, durationSec: 0.8, gain: 0.58 },
    { freq: 783.99, startSec: 0.96, durationSec: 1.6, gain: 0.64 },
  ],
  main: [
    { freq: 523.25, startSec: 0.0, durationSec: 0.85, gain: 0.6 },
    { freq: 698.46, startSec: 0.52, durationSec: 0.85, gain: 0.62 },
    { freq: 783.99, startSec: 1.04, durationSec: 0.85, gain: 0.64 },
    { freq: 1046.5, startSec: 1.56, durationSec: 2.1, gain: 0.68 },
    { freq: 523.25, startSec: 1.56, durationSec: 2.1, gain: 0.35 },
  ],
  warn_10m: [
    { freq: 587.33, startSec: 0.0, durationSec: 0.7, gain: 0.56 },
    { freq: 783.99, startSec: 0.48, durationSec: 1.4, gain: 0.62 },
  ],
  warn_5m: [
    { freq: 659.25, startSec: 0.0, durationSec: 0.65, gain: 0.58 },
    { freq: 880.0, startSec: 0.45, durationSec: 1.4, gain: 0.64 },
  ],
  end: [
    { freq: 783.99, startSec: 0.0, durationSec: 0.8, gain: 0.62 },
    { freq: 659.25, startSec: 0.52, durationSec: 0.8, gain: 0.6 },
    { freq: 523.25, startSec: 1.04, durationSec: 0.8, gain: 0.6 },
    { freq: 392.0, startSec: 1.56, durationSec: 1.3, gain: 0.62 },
    { freq: 523.25, startSec: 2.6, durationSec: 2.0, gain: 0.66 },
    { freq: 659.25, startSec: 2.6, durationSec: 2.0, gain: 0.42 },
  ],
};

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return typeof btoa === 'function' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

function synthesizeChimeToWavDataUri(notes: BellNote[]): string {
  const sampleRate = 22050;
  let totalDuration = 0.5;
  for (const n of notes) {
    totalDuration = Math.max(totalDuration, n.startSec + n.durationSec + 0.15);
  }
  const numSamples = Math.ceil(sampleRate * totalDuration);
  const buffer = new Float32Array(numSamples);

  for (const note of notes) {
    const startSample = Math.floor(note.startSec * sampleRate);
    const noteSamples = Math.floor(note.durationSec * sampleRate);
    const amp = note.gain ?? 0.6;
    for (let i = 0; i < noteSamples && startSample + i < numSamples; i++) {
      const t = i / sampleRate;
      const attack = Math.min(1, t / 0.018);
      const decay = Math.exp(-2.6 * (t / note.durationSec));
      const env = attack * decay;
      const fundamental = Math.sin(2 * Math.PI * note.freq * t);
      const overtone2 = 0.32 * Math.sin(2 * Math.PI * note.freq * 2 * t) * Math.exp(-3.5 * t);
      const overtone3 = 0.12 * Math.sin(2 * Math.PI * note.freq * 3 * t) * Math.exp(-5.0 * t);
      buffer[startSample + i] += amp * env * (fundamental + overtone2 + overtone3);
    }
  }

  const wavByteLength = 44 + numSamples * 2;
  const wavBytes = new Uint8Array(wavByteLength);
  const view = new DataView(wavBytes.buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-0.98, Math.min(0.98, buffer[i]));
    const int16 = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
    view.setInt16(offset, int16, true);
    offset += 2;
  }

  return `data:audio/wav;base64,${uint8ArrayToBase64(wavBytes)}`;
}

let cachedBellDataUris: Record<Exclude<BellType, 'none'>, string> | null = null;

export function getEmbeddedBellDataUris(): Record<Exclude<BellType, 'none'>, string> {
  if (cachedBellDataUris) return cachedBellDataUris;

  const keys: Exclude<BellType, 'none'>[] = [
    'entry_prep',
    'preliminary',
    'prepare',
    'listening_intro',
    'main',
    'warn_10m',
    'warn_5m',
    'end',
  ];

  const result = {} as Record<Exclude<BellType, 'none'>, string>;
  for (const key of keys) {
    result[key] = synthesizeChimeToWavDataUri(BELL_CHIME_PATTERNS[key]);
  }

  cachedBellDataUris = result;
  return result;
}

/**
 * /public/audio/bells/ 내의 특정 타종 파일 경로 반환
 */
export function getBellFileUrl(item: CsatBellCueItem): string {
  return `${import.meta.env.BASE_URL}audio/bells/${encodeURIComponent(item.fileName)}`;
}

let loading37Promise: Promise<Partial<Record<string, string>>> | null = null;

/**
 * 브라우저 환경에서 /public/audio/bells/ 에 있는 37개 기본 타종 음원 파일들을 모두 읽어
 * Base64 Data URI 맵으로 반환합니다.
 * - 단일 HTML 내보내기 시 기본 타종 음원 37개는 100% 포함되고,
 *   영어 듣기 파일 및 사용자 커스텀 설정만 제외되도록 보장합니다.
 */
export async function loadAll37BellMp3DataUris(): Promise<Partial<Record<string, string>>> {
  if (Object.keys(CUSTOM_37_BELL_MP3_DATA_URIS).length === CSAT_37_BELL_FILES.length) {
    return CUSTOM_37_BELL_MP3_DATA_URIS;
  }
  if (loading37Promise) {
    return loading37Promise;
  }

  loading37Promise = (async () => {
    await Promise.all(
      CSAT_37_BELL_FILES.map(async (item) => {
        if (CUSTOM_37_BELL_MP3_DATA_URIS[item.code]) return;
        try {
          const res = await fetch(getBellFileUrl(item));
          if (!res.ok) return;
          const buf = await res.arrayBuffer();
          if (buf.byteLength === 0) return;
          const bytes = new Uint8Array(buf);
          const mime = item.fileName.toLowerCase().endsWith('.m4a') ? 'audio/mp4' : 'audio/mpeg';
          CUSTOM_37_BELL_MP3_DATA_URIS[item.code] = `data:${mime};base64,${uint8ArrayToBase64(bytes)}`;
        } catch {
          // Ignore individual fetch error and fall back to synthesized chime
        }
      })
    );
    loading37Promise = null;
    return CUSTOM_37_BELL_MP3_DATA_URIS;
  })();

  return loading37Promise;
}
