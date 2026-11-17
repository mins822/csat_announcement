import fs from 'fs';
import path from 'path';
import { CSAT_37_BELL_FILES } from '../src/data/csatSchedule';
import { buildStandaloneCsatHtml } from '../src/utils/standaloneHtmlBuilder';
import { formatAppVersion } from '../src/data/versionInfo';

/**
 * 단일 HTML 패키징 빌더 스크립트
 * - /public/audio/bells/ 폴더에 업로드된 37개 수능 타종 MP3 파일이 있으면 자동으로 Base64 Data URI로 인코딩하여 단일 HTML에 내장합니다.
 * - 영어 듣기평가 음원 파일이나 사용자 커스텀 설정값은 단일 HTML 내보내기 결과물에 포함하지 않습니다.
 */
function runSingleHtmlPackager() {
  const bellsDir = path.resolve(process.cwd(), 'public', 'audio', 'bells');
  const customMp3DataUris: Partial<Record<string, string>> = {};
  let embeddedMp3Count = 0;

  if (fs.existsSync(bellsDir)) {
    for (const item of CSAT_37_BELL_FILES) {
      const mp3Path = path.join(bellsDir, item.fileName);
      if (fs.existsSync(mp3Path)) {
        const buf = fs.readFileSync(mp3Path);
        customMp3DataUris[item.code] = `data:audio/mpeg;base64,${buf.toString('base64')}`;
        embeddedMp3Count++;
      }
    }
  }

  const html = buildStandaloneCsatHtml(customMp3DataUris);

  const checks = [
    { name: 'DOCTYPE 및 단일 HTML 루트 존재', pass: html.startsWith('<!DOCTYPE html>') && html.includes('</html>') },
    { name: '인라인 <style> 포함 여부', pass: html.includes('<style>') && html.includes('</style>') },
    { name: '인라인 <script> 포함 여부', pass: html.includes('<script>') && html.includes('</script>') },
    { name: 'WebGL 축대칭 멤브레인 셰이더(evalMembrane) 및 다크/세피아 유니폼 보존 여부', pass: html.includes('vec2 evalMembrane(float r, float H)') && html.includes('uS') },
    { name: 'START 등장 간격 및 CANCEL 퇴장 간격 일치(STAGE_OUT=400, STAGE_IN=STAGE_OUT, DUR_IN=STAGE_OUT) 반영 여부', pass: html.includes('STAGE_OUT=400,STAGE_IN=STAGE_OUT,DUR_IN=STAGE_OUT') },
    { name: '내장 타종 음원 Base64 Data URI 포함 여부', pass: html.includes('data:audio/wav;base64,') || html.includes('data:audio/mpeg;base64,') },
    { name: '숨기기 버튼(#hideBtn / #showBtn / uiHidden) 완전 제거 여부', pass: !html.includes('id="hideBtn"') && !html.includes('id="showBtn"') && !html.includes('uiHidden') },
    { name: '좌측 상단 햄버거 메뉴(#hamburgerBtn / #pillDrawer) 포함 여부', pass: html.includes('id="hamburgerBtn"') && html.includes('id="pillDrawer"') },
  ];

  for (const c of checks) {
    if (!c.pass) {
      throw new Error(`[패키징 무결성 검증 실패] ${c.name}`);
    }
  }

  const outDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'csat-timer-standalone.html');
  fs.writeFileSync(outFile, html, 'utf-8');

  const sizeKb = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
  console.log(
    `[단일 HTML 패키징 완료] 파일: ${outFile} (${sizeKb} KB) | 업로드된 MP3 내장: ${embeddedMp3Count}/37개 | 버전: ${formatAppVersion(true)}`
  );
}

runSingleHtmlPackager();
