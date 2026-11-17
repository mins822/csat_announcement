/**
 * 애플리케이션 버전 규격 및 빌드 관리 모듈
 * 형식: x.y.z.p
 * - x (Major): 1 (초기값, 사용자 명시적 요청 시에만 변경)
 * - y (Minor): 0 (초기값, 사용자 명시적 요청 시에만 변경)
 * - z (Patch / Code Revision Count): 누적 추가/수정 코드 구문 수 (4933 + 1 = 4934)
 * - p (Build Timestamp): YYYYMMDDHHmmss (대한민국 표준시 KST 기준)
 */

export interface AppVersionSpec {
  major: number; // x
  minor: number; // y
  patch: number; // z
  timestampKst: string; // p (YYYYMMDDHHmmss)
}

export const APP_VERSION: AppVersionSpec = {
  major: 1,
  minor: 0,
  patch: 4946,
  timestampKst: '20261117141500',
};

export function formatAppVersion(includeTimestamp: boolean): string {
  const base = `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`;
  return includeTimestamp ? `${base}.${APP_VERSION.timestampKst}` : base;
}
