/**
 * Android Chrome / Non-Secure Context / Iframe Permissions-Policy 환경에서
 * navigator.wakeLock 이 차단되거나 백그라운드 전환 시 자동 해제되는 경우를 보완하는
 * 초경량 무음 비디오 fallback 자산 및 Blob URL / Canvas Stream 복구 유틸리티입니다.
 * - 16x16px, 1fps, 4초 길이, 오디오 트랙 없음(-an), 중립 회색(#808080), H.264 Baseline Profile
 */
const KEEP_AWAKE_MP4_BASE64 =
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMzbW9vdgAAAGxtdmhkAAAAAAAAAAAAAAAAAAAD6AAAD6AAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAl10cmFrAAAAXHRraGQAAAADAAAAAAAAAAAAAAABAAAAAAAAD6AAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAABAAAAAABAAAAAQAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAA+gAAAAAAABAAAAAAHVbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAABAAAABAABVxAAAAAAALWhkbHIAAAAAAAAAAHZpZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABgG1pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAAACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAAUBzdGJsAAAAuHN0c2QAAAAAAAAAAQAAAKhhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAABAAEABIAAAASAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGP//AAAALmF2Y0MBQsAe/+EAFmdCwB7ZHsBEAAADAAQAAAMACDxYuSABAAVoy4PLIAAAABBwYXNwAAAAAQAAAAEAAAAUYnRydAAAAAAAAAVAAAAFQAAAABhzdHRzAAAAAAAAAAEAAAAEAABAAAAAABRzdHNzAAAAAAAAAAEAAAABAAAAHHN0c2MAAAAAAAAAAQAAAAEAAAAEAAAAAQAAACRzdHN6AAAAAAAAAAAAAAAEAAACgwAAAAoAAAAKAAAACQAAABRzdGNvAAAAAAAAAAEAAANjAAAAYnVkdGEAAABabWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAAAAAtaWxzdAAAACWpdG9vAAAAHWRhdGEAAAABAAAAAExhdmY1OC43Ni4xMDAAAAAIZnJlZQAAAqhtZGF0AAACcAYF//9s3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE2MyByMzA2MCA1ZGI2YWE2IC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAyMSAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTAgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MToweDExMSBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MCBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTEgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0wIHdlaWdodHA9MCBrZXlpbnQ9MjUwIGtleWludF9taW49MSBzY2VuZWN1dD00MCBpbnRyYV9yZWZyZXNoPTAgcmNfbG9va2FoZWFkPTQwIHJjPWNyZiBtYnRyZWU9MSBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0xOjEuMDAAgAAAAA5liIQF/JigACCLgAAAAAZBmjgL+oAAAAAGQZpUAt6gAAAABUGaYBX1';

export const KEEP_AWAKE_MP4_DATA_URI = `data:video/mp4;base64,${KEEP_AWAKE_MP4_BASE64}`;

export function isAndroidBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent || '');
}

/**
 * Data URI 반복 디코딩으로 인한 안드로이드 크롬 루프 스톨을 피하기 위해
 * 메모리 상의 Blob Object URL을 우선 생성합니다.
 */
export function createKeepAwakeVideoUrl(): { url: string; isBlob: boolean } {
  try {
    if (typeof atob === 'function' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      const bin = atob(KEEP_AWAKE_MP4_BASE64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        bytes[i] = bin.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'video/mp4' });
      return { url: URL.createObjectURL(blob), isBlob: true };
    }
  } catch {
    // Fallback to Data URI
  }
  return { url: KEEP_AWAKE_MP4_DATA_URI, isBlob: false };
}

/**
 * MP4 디코더 오류 시 16x16 오프스크린 캔버스 MediaStream 으로 2차 백업 재생을 연결합니다.
 */
export function attachCanvasFallbackStream(videoEl: HTMLVideoElement): (() => void) | null {
  try {
    const canvas = document.createElement('canvas') as HTMLCanvasElement & {
      captureStream?: (fps?: number) => MediaStream;
    };
    if (typeof canvas.captureStream !== 'function') return null;
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let toggle = false;
    const paint = () => {
      ctx.fillStyle = toggle ? '#808080' : '#7f7f7f';
      toggle = !toggle;
      ctx.fillRect(0, 0, 16, 16);
    };
    paint();

    const stream = canvas.captureStream(1);
    videoEl.removeAttribute('src');
    videoEl.srcObject = stream;
    const intervalId = window.setInterval(paint, 1000);

    return () => {
      window.clearInterval(intervalId);
      try {
        stream.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      if (videoEl.srcObject === stream) {
        videoEl.srcObject = null;
      }
    };
  } catch {
    return null;
  }
}
