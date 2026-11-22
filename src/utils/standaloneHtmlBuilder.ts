import {
  BELL_DURATION_SEC_MAP,
  CSAT_37_BELL_FILES,
  CSAT_FULL_TIMETABLE,
  CSAT_SELECTABLE_CUE_NODES,
  CSAT_SESSION_PRESETS,
  CSAT_STAGE_TYPE_META,
  CSAT_SUBJECT_GROUPS,
  DEFAULT_CUSTOM_SEQUENCE_CONFIG,
  DEFAULT_SEQUENCE_BOOKMARKS,
} from '../data/csatSchedule';
import {
  BELL_LABELS,
  CUSTOM_37_BELL_MP3_DATA_URIS,
  getEmbeddedBellDataUris,
} from '../data/embeddedBellAudio';
import { APP_VERSION } from '../data/versionInfo';
import { DARK_FAVICON_DATA_URI, LIGHT_FAVICON_DATA_URI } from '../data/faviconAssets';
import { KEEP_AWAKE_MP4_DATA_URI } from './keepAwakeVideo';

/**
 * 외부 리소스 의존성이 전혀 없는 단일 독립 실행형 HTML 파일 문자열을 생성합니다.
 * - HTML 내보내기 시 사용자가 선택한 영어 듣기평가 음원 파일 및 개인 커스텀 설정값은 포함되지 않으며,
 *   초기 기본 상태(기본 타이머: 1교시 국어 준비령 08:35~08:40)로 생성됩니다.
 * - /public/audio/bells/ 에 업로드된 37개 타종 MP3 파일이 Base64 Data URI로 단일 HTML 내부에 직접 내장됩니다.
 */
export function buildStandaloneCsatHtml(
  customMp3DataUris: Partial<Record<string, string>> = CUSTOM_37_BELL_MP3_DATA_URIS
): string {
  const bellDataUris = getEmbeddedBellDataUris();
  const fullVersionString = `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}.${APP_VERSION.timestampKst}`;

  const embeddedDataJson = JSON.stringify({
    version: APP_VERSION,
    timetable: CSAT_FULL_TIMETABLE,
    presets: CSAT_SESSION_PRESETS,
    bellFiles37: CSAT_37_BELL_FILES,
    bellDurationSecMap: BELL_DURATION_SEC_MAP,
    subjectGroups: CSAT_SUBJECT_GROUPS,
    stageTypeMeta: CSAT_STAGE_TYPE_META,
    selectableCueNodes: CSAT_SELECTABLE_CUE_NODES,
    defaultCustomSeqConfig: DEFAULT_CUSTOM_SEQUENCE_CONFIG,
    defaultBookmarks: DEFAULT_SEQUENCE_BOOKMARKS,
    bellLabels: BELL_LABELS,
    bellDataUris,
    customMp3DataUris,
    faviconLight: LIGHT_FAVICON_DATA_URI,
    faviconDark: DARK_FAVICON_DATA_URI,
    keepAwakeMp4: KEEP_AWAKE_MP4_DATA_URI,
  });

  return `<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="google-site-verification" content="n2IeGBSKyEv1Cnc7odBy2FlFMqShS7C6F4DuHcBBZC0">
<meta name="application-name" content="2027학년도 대학수학능력시험 시험장 안내방송">
<meta name="description" content="2027학년도 대학수학능력시험 시험장 안내방송 구현 · 수능 타종 · 수능 방송 · 수능 알림 · 37개 공식 타종 음원과 3교시 영어 듣기평가 자동 재생, 과목별 시간표 구성을 지원하는 수능 시계 및 모의고사 타이머">
<meta name="keywords" content="2027학년도 대학수학능력시험 시험장 안내방송 구현, 수능 타종, 수능 방송, 수능 알림, 수능 시계, 수능 타이머, 모의고사 타이머, 수능 안내방송, 수능 시간표, 수능 영어 듣기평가">
<link rel="canonical" href="https://mins822.github.io/csat_announcement/">
<meta property="og:title" content="2027학년도 대학수학능력시험 시험장 안내방송 · 수능 타종 · 수능 방송 · 수능 알림">
<meta property="og:description" content="2027학년도 대학수학능력시험 시험장 안내방송 구현 · 수능 타종 · 수능 방송 · 수능 알림 · 37개 공식 타종 음원과 3교시 영어 듣기평가 자동 재생, 과목별 시간표 구성을 지원하는 수능 시계 및 모의고사 타이머">
<meta property="og:type" content="website">
<meta property="og:url" content="https://mins822.github.io/csat_announcement/">
<meta name="version" content="${fullVersionString}">
<meta id="theme-color-meta" name="theme-color" content="#ecebe9">
<link id="app-favicon" rel="icon" type="image/svg+xml" href="${LIGHT_FAVICON_DATA_URI}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600&family=Noto+Serif+KR:wght@200..900&family=Noto+Serif:ital,opsz,wght@0,6..144,200..900&family=Outfit:wght@400;500;600&family=Roboto+Condensed:ital,wght@0,600;0,700;1,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css">
<title>2027학년도 대학수학능력시험 시험장 안내방송 · 수능 타종 · 수능 방송 · 수능 알림</title>
<script>
(function(){
  var LIGHT_FAV=${JSON.stringify(LIGHT_FAVICON_DATA_URI)};
  var DARK_FAV=${JSON.stringify(DARK_FAVICON_DATA_URI)};
  try{
    var raw=localStorage.getItem('csat_timer_custom_settings_v2');
    var pref='auto';
    if(raw){
      var p=JSON.parse(raw);
      if(p&&['auto','light','dark','sepia'].indexOf(p.themePref)!==-1) pref=p.themePref;
    }
    var resolved=pref;
    if(pref==='auto'){
      resolved=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light';
    }
    document.documentElement.setAttribute('data-theme',resolved);
    var fav=document.getElementById('app-favicon');
    if(fav) fav.setAttribute('href',resolved==='dark'?DARK_FAV:LIGHT_FAV);
    var tc=document.getElementById('theme-color-meta');
    if(tc) tc.setAttribute('content',resolved==='dark'?'#121212':(resolved==='sepia'?'#e6dcc8':'#ecebe9'));
  }catch(e){
    document.documentElement.setAttribute('data-theme','light');
  }
  setTimeout(function(){
    if(!document.documentElement.classList.contains('app-ready')){
      document.documentElement.classList.add('app-ready');
    }
  },1200);
})();
</script>
<style>
@property --angle-1{syntax:"<angle>";inherits:false;initial-value:-75deg}
@property --angle-2{syntax:"<angle>";inherits:false;initial-value:-45deg}
:root,[data-theme="light"]{
  --ease:cubic-bezier(.2,.75,.25,1);
  --spring:cubic-bezier(.2,1.1,.3,1);
  --stage:#ecebe9;
  --ink:#1d1d1f;
  --btn:#1d1d1f;
  --tick-major:#5a5a5a;
  --tick-minor:#a9a9a9;
  --min-hand:#1d1d1f;
  --sec-hand:#616161;
  --glass-fill:rgba(246,246,248,.16);
  --glass-rim:rgba(255,255,255,.28);
  --btn-rim:rgba(255,255,255,.22);
  --btn-rim-hover:rgba(255,255,255,.32);
  --btn-rim-active:rgba(255,255,255,.30);
  --toll-btn-rim:rgba(255,255,255,.22);
  --toll-btn-rim-hover:rgba(255,255,255,.32);
  --toll-btn-inset-rim:rgba(255,255,255,.09);
  --glint:rgba(255,255,255,.68);
  --btn-shadow:0 9px 24px rgba(35,43,58,.08),inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(40,48,62,.03);
  --btn-shadow-hover:0 13px 30px rgba(31,39,54,.11),inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(40,48,62,.03);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,255,255,.055),transparent 100%),linear-gradient(150deg,rgba(255,255,255,.035),transparent 43%,rgba(255,255,255,.008) 76%,rgba(255,255,255,.022));
  --btn-after-opacity:.06;
  --btn-text-shadow:0 1px 2px rgba(255,255,255,.24);
  --focus-ring:#0071e3;
  --modal-bg:linear-gradient(155deg,rgba(252,252,254,.94) 0%,rgba(245,245,247,.90) 100%);
  --modal-border:rgba(0,0,0,.08);
  --modal-ink:#1d1d1f;
  --modal-muted:#6e6e73;
  --modal-surface:rgba(0,0,0,.045);
  --modal-card-bg:rgba(255,255,255,.72);
  --toll-ink:#1d1d1f;
  --toll-ink-2:#333336;
  --toll-muted:#6e6e73;
  --toll-line:rgba(0,0,0,.08);
  --toll-line-soft:rgba(0,0,0,.055);
  --toll-glass:var(--glass-fill);
  --toll-glass-strong:rgba(255,255,255,.70);
  --toll-glass-soft:rgba(255,255,255,.38);
  --toll-glass-inner:rgba(255,255,255,.47);
  --toll-glass-edge:var(--glass-rim);
  --toll-glass-edge-low:rgba(0,0,0,.06);
  --toll-highlight:rgba(255,255,255,.90);
  --toll-glass-shadow:0 24px 68px rgba(0,0,0,.18),0 5px 18px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.34);
  --toll-selected:rgba(45,45,48,.11);
  --toll-selected-edge:rgba(29,29,31,.10);
  --toll-pill:rgba(255,255,255,.42);
  --toll-pill-hover:rgba(255,255,255,.68);
  --toll-button:#1d1d1f;
  --toll-button-text:#ffffff;
  --toll-scroll:rgba(50,50,52,.28);
  --toll-warn:#9a5b13;
  --toll-warn-bg:rgba(214,178,126,.16);
  --toll-warn-line:rgba(154,91,19,.28);
  --tt-panel-bg:rgba(245,245,247,var(--tt-panel-alpha,.78));
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
}
[data-theme="dark"]{
  --stage:#121212;
  --ink:#f5f5f7;
  --btn:#f5f5f7;
  --tick-major:#d2d2d7;
  --tick-minor:#636366;
  --min-hand:#f5f5f7;
  --sec-hand:#616161;
  --glass-fill:rgba(28,28,30,.52);
  --glass-rim:rgba(255,255,255,.075);
  --btn-rim:rgba(255,255,255,.06);
  --btn-rim-hover:rgba(255,255,255,.095);
  --btn-rim-active:rgba(255,255,255,.09);
  --toll-btn-rim:rgba(255,255,255,.08);
  --toll-btn-rim-hover:rgba(255,255,255,.12);
  --toll-btn-inset-rim:rgba(255,255,255,.075);
  --glint:rgba(255,255,255,.28);
  --btn-shadow:0 6px 18px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.035),inset 0 -1px 0 rgba(255,255,255,.01);
  --btn-shadow-hover:0 10px 24px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.055),inset 0 -1px 0 rgba(255,255,255,.015);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,255,255,.06),transparent 100%),linear-gradient(145deg,rgba(255,255,255,.065),rgba(255,255,255,.02));
  --btn-after-opacity:.04;
  --btn-text-shadow:0 1px 2px rgba(0,0,0,.32);
  --focus-ring:#2997ff;
  --modal-bg:rgba(28,28,30,.94);
  --modal-border:rgba(255,255,255,.09);
  --modal-ink:#f5f5f7;
  --modal-muted:#98989d;
  --modal-surface:rgba(39,39,41,.84);
  --modal-card-bg:rgba(42,42,44,.82);
  --toll-ink:#f5f5f7;
  --toll-ink-2:#d2d2d7;
  --toll-muted:#98989d;
  --toll-line:rgba(255,255,255,.10);
  --toll-line-soft:rgba(255,255,255,.07);
  --toll-glass:var(--glass-fill);
  --toll-glass-strong:rgba(24,24,26,.95);
  --toll-glass-soft:rgba(39,39,41,.82);
  --toll-glass-inner:rgba(42,42,44,.72);
  --toll-glass-edge:var(--glass-rim);
  --toll-glass-edge-low:rgba(255,255,255,.06);
  --toll-highlight:rgba(255,255,255,.24);
  --toll-glass-shadow:0 34px 96px rgba(0,0,0,.62),0 8px 26px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.06),inset 0 -1px 0 rgba(255,255,255,.03);
  --toll-selected:rgba(255,255,255,.12);
  --toll-selected-edge:rgba(255,255,255,.09);
  --toll-pill:rgba(255,255,255,.095);
  --toll-pill-hover:rgba(255,255,255,.16);
  --toll-button:#f5f5f7;
  --toll-button-text:#1d1d1f;
  --toll-scroll:rgba(255,255,255,.23);
  --toll-warn:#d6b27e;
  --toll-warn-bg:rgba(214,178,126,.10);
  --toll-warn-line:rgba(214,178,126,.28);
  --tt-panel-bg:rgba(37,37,39,var(--tt-panel-alpha,.86));
}
[data-theme="sepia"]{
  --stage:#e6dcc8;
  --ink:#36291e;
  --btn:#36291e;
  --tick-major:#5c4938;
  --tick-minor:#9c8873;
  --min-hand:#2b1f16;
  --sec-hand:#616161;
  --glass-fill:rgba(246,238,224,.28);
  --glass-rim:rgba(255,248,235,.64);
  --btn-rim:var(--glass-rim);
  --btn-rim-hover:var(--glass-rim);
  --btn-rim-active:var(--glint);
  --toll-btn-rim:rgba(255,255,255,.62);
  --toll-btn-rim-hover:rgba(255,255,255,.84);
  --toll-btn-inset-rim:rgba(255,255,255,.28);
  --glint:rgba(255,248,235,.66);
  --btn-shadow:0 9px 24px rgba(54,41,30,.09),inset 0 1px 0 rgba(255,248,235,.48),inset 0 -1px 0 rgba(54,41,30,.08);
  --btn-shadow-hover:0 13px 30px rgba(54,41,30,.12),inset 0 1px 0 rgba(255,248,235,.58),inset 0 -1px 0 rgba(54,41,30,.07);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,248,235,.085),transparent 100%),linear-gradient(150deg,rgba(255,248,235,.055),transparent 43%,rgba(255,248,235,.014) 76%,rgba(255,248,235,.04));
  --btn-after-opacity:.17;
  --btn-text-shadow:0 1px 2px rgba(255,248,235,.24);
  --focus-ring:#8c6d53;
  --modal-bg:linear-gradient(155deg,rgba(248,240,225,.95) 0%,rgba(238,228,208,.90) 100%);
  --modal-border:rgba(255,248,235,.80);
  --modal-ink:#36291e;
  --modal-muted:#6e5a49;
  --modal-surface:rgba(54,41,30,.06);
  --modal-card-bg:rgba(255,248,235,.62);
  --toll-ink:#2c2117;
  --toll-ink-2:#4e3d2e;
  --toll-muted:#786452;
  --toll-line:rgba(54,41,30,.12);
  --toll-line-soft:rgba(54,41,30,.08);
  --toll-glass:var(--glass-fill);
  --toll-glass-strong:rgba(255,250,240,.82);
  --toll-glass-soft:rgba(255,250,240,.48);
  --toll-glass-inner:rgba(255,250,240,.62);
  --toll-glass-edge:var(--glass-rim);
  --toll-glass-edge-low:rgba(255,250,242,.68);
  --toll-highlight:rgba(255,250,242,.90);
  --toll-glass-shadow:0 28px 80px rgba(42,31,21,.22),0 6px 20px rgba(42,31,21,.10),inset 0 1px 0 rgba(255,250,242,.90);
  --toll-selected:rgba(74,56,40,.11);
  --toll-selected-edge:rgba(54,41,30,.16);
  --toll-pill:rgba(255,250,242,.56);
  --toll-pill-hover:rgba(255,250,242,.82);
  --toll-button:#36291e;
  --toll-button-text:#2c2117;
  --toll-scroll:rgba(54,41,30,.28);
  --toll-warn:#9a5b13;
  --toll-warn-bg:rgba(214,178,126,.16);
  --toll-warn-line:rgba(154,91,19,.28);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
html,body{width:100%;height:100%;margin:0;overflow:hidden;background:var(--stage);color:var(--ink);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;transition:background-color .35s ease,color .35s ease}
:fullscreen,:-webkit-full-screen,html:fullscreen,html:-webkit-full-screen{background:var(--stage);background-color:var(--stage)}
::backdrop,:fullscreen::backdrop,:-webkit-full-screen::backdrop,html::backdrop,html:fullscreen::backdrop,html:-webkit-full-screen::backdrop{background:var(--stage);background-color:var(--stage)}
.svg-filters{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
canvas{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;background-color:var(--stage)}
#wakeLockVideo{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;opacity:.015;pointer-events:none;z-index:1;display:none}
#wakeLockVideo.is-active{display:block}
#ui{position:fixed;inset:0;z-index:2;pointer-events:none;font-family:"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",Arial,sans-serif}
#title{position:absolute;left:0;right:0;text-align:center;transform:translateY(-50%);margin:0;color:var(--ink);font-family:"Noto Serif","Noto Serif KR",serif;font-optical-sizing:auto;font-weight:300;font-style:normal;letter-spacing:-.025em;white-space:nowrap;transition:color .35s ease}
#face{position:absolute}
#face svg{width:100%;height:100%;display:block;overflow:visible}
#face .clock-glow-light,#face .hour-hand-light{opacity:1;transition:opacity .42s cubic-bezier(.22,1,.36,1)}
#face .clock-glow-dark,#face .hour-hand-dark{opacity:0;transition:opacity .42s cubic-bezier(.22,1,.36,1)}
[data-theme="dark"] #face .clock-glow-light,[data-theme="dark"] #face .hour-hand-light{opacity:0}
[data-theme="dark"] #face .clock-glow-dark,[data-theme="dark"] #face .hour-hand-dark{opacity:1}
#face .tick-major,#face .tick-minor,#minHand{transition:stroke .38s ease}
#clockGlowBoostGroup{transform-origin:0px 0px;will-change:transform,filter,opacity}
#face.is-interactive .clock-hand-interactive{pointer-events:auto;cursor:grab;touch-action:none}
#face.is-interactive .clock-hand-interactive .hand-hit-target{pointer-events:all}
#face.is-hand-dragging,#face.is-hand-dragging .clock-hand-interactive{cursor:grabbing !important}
.clock-hand-interactive.is-grabbed{filter:drop-shadow(0 0 6px rgba(124,156,197,.72))}
[data-theme="dark"] .clock-hand-interactive.is-grabbed{filter:drop-shadow(0 0 8px rgba(96,210,180,.78))}
#lab{
  position:absolute;
  display:grid;
  grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
  align-items:center;
  column-gap:clamp(10px,2.8vw,24px);
  color:var(--ink);
  font-size:16px;
  font-weight:500;
  font-style:normal;
  letter-spacing:0;
  line-height:1.2;
  font-family:"Outfit","Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,sans-serif;
  transition:color .35s ease;
}
#lab > div:first-child,#lab > div:last-child{
  display:flex;
  flex-direction:column;
  gap:3px;
  white-space:nowrap;
  will-change:opacity;
}
#lab > div:first-child{opacity:1;justify-self:start;align-items:flex-start;text-align:left}
#lab > div:last-child{opacity:.48;justify-self:end;align-items:flex-end;text-align:right}
.lab-kicker{
  font-family:"Montserrat","Pretendard Variable","Pretendard",sans-serif;
  font-size:clamp(10px,.64em,12px);
  font-weight:600;
  font-style:normal;
  letter-spacing:.16em;
  line-height:1.12;
  text-transform:uppercase;
  opacity:.56;
}
.lab-time{
  display:inline-flex;
  align-items:baseline;
  gap:3px;
  font-family:"Outfit","Pretendard Variable","Pretendard",sans-serif;
  font-size:1.14em;
  font-weight:500;
  font-style:normal;
  font-variant-numeric:tabular-nums;
  letter-spacing:-.015em;
  line-height:1.12;
}
.lab-meridiem{
  font-family:"Montserrat","Pretendard Variable","Pretendard",sans-serif;
  font-size:.64em;
  font-weight:600;
  letter-spacing:.08em;
  opacity:.58;
}
.lab-day{
  font-family:"Pretendard Variable","Pretendard",sans-serif;
  font-size:.62em;
  font-weight:500;
  letter-spacing:-.01em;
  opacity:.56;
  margin-left:1px;
}
#centerStat{
  position:relative;
  min-width:0;
  padding:2px clamp(14px,3.2vw,28px);
  font-style:normal;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:5px;
  font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
}
#centerStat::before,#centerStat::after{
  content:"";
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  width:1px;
  height:26px;
  background:linear-gradient(180deg,transparent 0%,currentColor 50%,transparent 100%);
  opacity:.09;
  pointer-events:none;
}
[data-theme="dark"] #centerStat::before,[data-theme="dark"] #centerStat::after{opacity:.11}
#centerStat::before{left:0}
#centerStat::after{right:0}
#remainDigits{
  font-family:"Outfit","Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,sans-serif;
  font-weight:500;
  font-style:normal;
  font-size:32px;
  font-variant-numeric:tabular-nums;
  letter-spacing:.01em;
  color:var(--ink);
  line-height:1;
  white-space:nowrap;
}
#stageBadge{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:2px;
  font-family:"Pretendard Variable","Pretendard",-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  font-weight:500;
  font-size:clamp(11px,.74em,12.5px);
  letter-spacing:-.015em;
  line-height:1.32;
  color:var(--ink);
  word-break:keep-all;
  overflow-wrap:break-word;
  max-width:100%;
  overflow:visible;
  text-align:center;
}
.stage-primary{opacity:.76}
.stage-next{font-size:.88em;font-weight:500;letter-spacing:-.01em;opacity:.46}
@media (max-width:400px){
  #lab{column-gap:6px}
  #centerStat{padding:0 6px;gap:3px}
  #centerStat::before,#centerStat::after{opacity:0}
  .lab-kicker{letter-spacing:.11em}
  .lab-time{gap:2px}
}

/* ---------- Top-Left Hamburger Bar & List-Detail Pill Menu ---------- */
#topLeftMenu{
  position:fixed;
  top:calc(env(safe-area-inset-top,0px) + 18px);
  left:18px;
  z-index:35;
  display:flex;
  flex-direction:column;
  align-items:flex-start;
  gap:10px;
}
.top-left-bar{
  display:flex;
  align-items:center;
  gap:8px;
}
#hamburgerBtn{
  width:44px;
  height:44px;
  padding:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  letter-spacing:0;
}
#fullscreenBtn{
  width:38px;
  height:38px;
  padding:0;
  border-radius:50%;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  letter-spacing:0;
  transform-origin:left center;
  transition:opacity .24s var(--ease),transform .28s var(--spring),visibility .24s,box-shadow .28s var(--ease),border-color .24s ease;
}
#fullscreenBtn.is-closed{
  opacity:0;
  pointer-events:none;
  visibility:hidden;
  transform:translateX(-8px) scale(.86);
}
#fullscreenBtn.is-open{
  opacity:1;
  pointer-events:auto;
  visibility:visible;
  transform:translateX(0) scale(1);
  touch-action:none;
  -webkit-touch-callout:none;
}
#fullscreenBtn.is-open:hover{
  transform:translateY(-1.5px) scale(1.04);
}
#fullscreenBtn.is-open:active,#fullscreenBtn.is-open.is-pressed{
  transform:translateY(0) scale(.95);
}
#fullscreenBtn.is-selected{
  border-color:var(--btn-rim-active);
  box-shadow:var(--btn-shadow-hover);
}
#pillDrawer{
  display:flex;
  flex-direction:row;
  align-items:flex-start;
  gap:10px;
}
#pillDrawer.closed{
  display:none;
  pointer-events:none;
  visibility:hidden;
}
#pillDrawer.open{
  display:flex;
  pointer-events:auto;
  visibility:visible;
}
.ld-master-col{
  display:flex;
  flex-direction:column;
  align-items:stretch;
  gap:8px;
  min-width:148px;
}
.ld-detail-col{
  display:none;
  flex-direction:column;
  align-items:flex-start;
  gap:8px;
}
.ld-detail-col.has-active{
  display:flex;
}
.ld-pane{
  display:none;
  flex-direction:column;
  align-items:flex-start;
  gap:8px;
}
.ld-pane.active{
  display:flex;
}
.ld-cat-btn.is-hidden{
  display:none;
}
.lg-sub-btn.is-selected{
  border-color:var(--btn-rim-active);
  box-shadow:var(--btn-shadow-hover);
}
.ld-cat-btn{
  height:38px;
  padding:0 15px;
  font-size:12.5px;
  letter-spacing:-.01em;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  width:100%;
}
.ld-cat-btn.is-selected{
  border-color:var(--btn-rim-active);
  box-shadow:var(--btn-shadow-hover);
}
.ld-cat-arrow{
  font-size:11px;
  opacity:.62;
}
.ld-cat-btn.is-selected .ld-cat-arrow{
  opacity:1;
}
@media (max-width:640px){
  #pillDrawer{flex-direction:column;max-width:calc(100vw - 36px)}
  .ld-master-col{flex-direction:row;flex-wrap:wrap;min-width:0}
  .ld-cat-btn{width:auto}
}

/* ---------- Liquid Glass — Material Study (Low Tint / Edge Refraction) ---------- */
.lg-btn,.pill-group-row,.drawer-card-panel,.bookmark-drawer-card,.toll-dialog{
  --px:50%;
  --py:12%;
  position:relative;
  overflow:hidden;
  isolation:isolate;
  border:1px solid var(--glass-rim);
  background:var(--glass-fill);
  box-shadow:var(--btn-shadow);
  -webkit-backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  transform:translateZ(0);
  will-change:backdrop-filter,transform;
  color:var(--btn);
  text-shadow:var(--btn-text-shadow);
  -webkit-tap-highlight-color:transparent;
}
.lg-btn,.pill-group-row{
  border-radius:999px;
  transition:transform .24s var(--spring),box-shadow .24s var(--ease),border-color .22s ease,color .22s ease;
}
.lg-btn::before,.pill-group-row::before,.drawer-card-panel::before,.bookmark-drawer-card::before,.toll-dialog::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  border-radius:inherit;
  pointer-events:none;
  background:var(--btn-before);
  opacity:.76;
}
.lg-btn::after,.pill-group-row::after,.drawer-card-panel::after,.bookmark-drawer-card::after,.toll-dialog::after{
  content:"";
  position:absolute;
  inset:1px;
  z-index:0;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.36),transparent 11%),linear-gradient(0deg,rgba(255,255,255,.11),transparent 16%);
  opacity:var(--btn-after-opacity);
  mix-blend-mode:screen;
}
.lg-btn > *,.pill-group-row > *,.drawer-card-panel > *,.bookmark-drawer-card > *,.toll-dialog > *:not(.dialog-footer){
  position:relative;
  z-index:2;
}
.lg-btn{
  border-color:var(--btn-rim);
  font:650 14px/1 -apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Roboto","Noto Sans KR",sans-serif;
  letter-spacing:.14em;
  cursor:pointer;
  white-space:nowrap;
  touch-action:none;
  -webkit-touch-callout:none;
}
.lg-btn:hover{
  transform:translateY(-1.5px) scale(1.025);
  border-color:var(--btn-rim-hover);
  box-shadow:var(--btn-shadow-hover);
}
[data-theme="dark"] .lg-btn:hover{
  background:rgba(255,255,255,.12);
  border-color:var(--btn-rim-hover);
}
.lg-btn:active,.lg-btn.is-pressed{
  transform:translateY(0) scale(.95);
  transition-duration:.13s;
}
.lg-btn:focus-visible{
  outline:2px solid var(--focus-ring);
  outline-offset:3px;
}
.pill-group-row{
  display:flex;
  align-items:center;
  gap:5px;
  padding:4px;
}
.theme-chip,.sync-chip{
  position:relative;
  z-index:2;
  border:1px solid transparent;
  background:transparent;
  color:var(--btn);
  padding:6px 12px;
  border-radius:999px;
  font:650 12px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text","Noto Sans KR",sans-serif;
  letter-spacing:-.01em;
  cursor:pointer;
  transition:background .24s var(--ease),color .24s var(--ease),border-color .24s var(--ease),box-shadow .24s var(--ease);
  white-space:nowrap;
}
.theme-chip.active,.sync-chip.active{
  background:rgba(255,255,255,.22);
  border-color:var(--btn-rim-active);
  color:var(--ink);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 2px 8px rgba(0,0,0,.06);
}
[data-theme="sepia"] .theme-chip.active,[data-theme="sepia"] .sync-chip.active{
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26),0 2px 8px rgba(0,0,0,.07);
}
[data-theme="dark"] .theme-chip.active,[data-theme="dark"] .sync-chip.active{
  background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(255,255,255,.075));
  border-color:var(--btn-rim-active);
  color:#f5f5f5;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 3px 12px rgba(0,0,0,.20);
}

/* ---------- Bottom Dock Controls ---------- */
#dock{
  position:fixed;
  left:50%;
  bottom:calc(env(safe-area-inset-bottom,0px) + 24px);
  transform:translateX(-50%);
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:10px;
  z-index:10;
}
#primaryRow{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
}
#actionStage{
  position:relative;
  width:282px;
  height:46px;
  display:flex;
  align-items:center;
  justify-content:center;
}
.stage-layer{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-wrap:nowrap;
  gap:10px;
  transition:opacity .34s var(--ease),transform .34s var(--spring),visibility .34s;
}
.stage-layer.is-inactive{
  opacity:0;
  pointer-events:none;
  visibility:hidden;
  transform:scale(.94);
}
.stage-layer.is-active{
  opacity:1;
  pointer-events:auto;
  visibility:visible;
  transform:scale(1);
}
#go{
  width:154px;
  height:46px;
  min-height:46px;
  max-height:46px;
  box-sizing:border-box;
  margin:0;
  padding:0;
  font-family:"Montserrat",-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;
  font-size:13px;
  font-weight:500;
  letter-spacing:1.8px;
  line-height:1;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}
#pauseBtn,#cancelBtn{
  width:136px;
  min-width:136px;
  max-width:136px;
  height:46px;
  min-height:46px;
  max-height:46px;
  box-sizing:border-box;
  margin:0;
  padding:0;
  font-family:"Montserrat",-apple-system,BlinkMacSystemFont,"SF Pro Display",sans-serif;
  font-size:13px;
  font-weight:500;
  letter-spacing:1.8px;
  line-height:1;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}
.lg-pill-select,.lg-sub-btn{
  height:38px;
  padding:0 16px;
  font-size:12.5px;
  letter-spacing:-.01em;
  display:inline-flex;
  align-items:center;
  justify-content:flex-start;
  gap:8px;
}
.lg-pill-select{
  padding-right:28px;
  max-width:295px;
  text-overflow:ellipsis;
}
.lg-pill-select option,.lg-pill-select optgroup{
  background:var(--stage);
  color:var(--ink);
}
.lg-pill-select:disabled{
  opacity:.55;
  cursor:not-allowed;
}
#engFileLabel{
  max-width:230px;
  overflow:hidden;
  text-overflow:ellipsis;
}
#toastNotice{
  position:fixed;
  top:calc(env(safe-area-inset-top,0px) + 18px);
  left:50%;
  transform:translateX(-50%) translateY(-12px);
  padding:10px 18px;
  border-radius:999px;
  border:1px solid var(--toll-line);
  background:var(--modal-bg);
  -webkit-backdrop-filter:blur(22px) saturate(180%);
  backdrop-filter:blur(22px) saturate(180%);
  box-shadow:var(--btn-shadow);
  color:var(--modal-ink);
  font:600 12.5px/1.3 "SF Pro Text",-apple-system,BlinkMacSystemFont,"Pretendard Variable","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  letter-spacing:-.015em;
  opacity:0;
  pointer-events:none;
  z-index:45;
  transition:opacity .28s ease,transform .28s var(--spring);
  white-space:nowrap;
  max-width:calc(100vw - 120px);
  overflow:hidden;
  text-overflow:ellipsis;
}
#toastNotice.show{
  opacity:1;
  transform:translateX(-50%) translateY(0);
}

/* ---------- Modals ---------- */
#modalBackdrop{
  position:fixed;
  inset:0;
  width:100%;
  height:100dvh;
  max-height:100dvh;
  background:rgba(15,15,18,.45);
  -webkit-backdrop-filter:blur(10px);
  backdrop-filter:blur(10px);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:max(14px,env(safe-area-inset-top,0px)) 16px max(14px,env(safe-area-inset-bottom,0px));
  z-index:50;
  opacity:0;
  pointer-events:none;
  visibility:hidden;
  transition:opacity .26s ease,visibility .26s;
}
#modalBackdrop.open{
  opacity:1;
  pointer-events:auto;
  visibility:visible;
}
#modalCard{
  width:min(740px,100%);
  max-height:min(86dvh,720px);
  border-radius:26px;
  border:1px solid var(--modal-border);
  background:var(--modal-bg);
  -webkit-backdrop-filter:blur(30px) saturate(190%);
  backdrop-filter:blur(30px) saturate(190%);
  box-shadow:0 24px 60px -12px rgba(0,0,0,.32);
  color:var(--modal-ink);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
}
.modal-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:16px 22px;
  border-bottom:1px solid var(--modal-surface);
}
.modal-head h2{
  margin:0;
  font-size:16px;
  font-weight:700;
  letter-spacing:-.02em;
}
.modal-close{
  border:none;
  background:var(--modal-surface);
  color:var(--modal-ink);
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
}
.modal-body{
  padding:18px 22px;
  overflow-y:auto;
  display:flex;
  flex-direction:column;
  gap:18px;
}
.tt-jump-btn{
  border:1px solid var(--glass-rim);
  background:var(--modal-surface);
  color:var(--modal-ink);
  border-radius:999px;
  padding:4px 10px;
  font-size:11px;
  font-weight:600;
  cursor:pointer;
}
.sec-title{
  margin:0 0 8px 0;
  font-size:13px;
  font-weight:700;
  color:var(--modal-muted);
}
.tt-table{
  width:100%;
  border-collapse:collapse;
  font-size:12px;
}
.tt-table th,.tt-table td{
  padding:7px 8px;
  border-bottom:1px solid var(--modal-surface);
  text-align:left;
}
.tt-table th{
  font-weight:700;
  color:var(--modal-muted);
  background:var(--modal-surface);
}
.tt-table tr.active-row{
  background:rgba(217,86,138,.15);
  font-weight:600;
}
.info-grid{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:10px;
  padding:12px 14px;
  border-radius:16px;
  background:var(--modal-surface);
  font-size:12.5px;
}
.info-row{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
.mono-val{
  font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;
  font-weight:600;
}
@media (max-width:600px){
  .info-grid{grid-template-columns:1fr}
}

/* ---------- Custom Checkbox Sequence & Interval/Time Editor Modal (Synced with .drawer-card-panel Blur & Translucency) ---------- */
#builderModalBackdrop{
  position:fixed;
  inset:0;
  width:100%;
  height:100dvh;
  max-height:100dvh;
  z-index:52;
  background:transparent;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:max(14px,env(safe-area-inset-top,0px)) 20px max(16px,env(safe-area-inset-bottom,0px));
  font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;
  color:var(--toll-ink);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transform:none;
}
[data-theme="dark"] #builderModalBackdrop{
  background:transparent;
}
#builderModalBackdrop.open{
  opacity:1;
  visibility:visible;
  pointer-events:auto;
  transform:none;
}
.toll-scrim button,.toll-scrim input,.toll-scrim select{font:inherit;color:inherit}
.toll-dialog{
  width:min(1160px,100%);
  height:min(820px,100%);
  max-height:100%;
  min-height:0;
  display:flex;
  flex-direction:column;
  word-break:keep-all;
  overflow-wrap:break-word;
  border-radius:26px;
  color:var(--toll-ink);
  text-shadow:none;
  box-shadow:var(--btn-shadow);
  position:relative;
}
#builderModalBackdrop.open .toll-dialog{
  transform:translateZ(0);
}
.toll-dialog .dialog-header{
  padding:15px 22px 13px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  border-bottom:1px solid var(--toll-line);
  background:transparent;
  position:relative;
  flex:none;
}
[data-theme="dark"] .toll-dialog .dialog-header{
  background:transparent;
}
.toll-dialog .dialog-heading{min-width:0}
.toll-dialog .dialog-heading h1{
  font-size:18px;
  line-height:1.35;
  margin:0 0 5px;
  font-weight:750;
  letter-spacing:-.035em;
  color:var(--toll-ink);
}
.toll-dialog .dialog-heading p{
  font-size:13px;
  line-height:1.5;
  color:var(--toll-muted);
  margin:0;
  letter-spacing:-.02em;
}
.toll-dialog .head-actions{
  display:flex;
  align-items:center;
  gap:7px;
  flex:none;
}
.toll-dialog .icon-button{
  flex:none;
  border-radius:999px;
  width:38px;
  min-width:38px;
  height:38px;
  padding:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  font-weight:650;
  cursor:pointer;
  touch-action:none;
  -webkit-touch-callout:none;
  transition:background .16s,transform .16s,border-color .16s,opacity .16s;
}
.toll-dialog .icon-button svg{
  width:15px;
  height:15px;
  stroke:currentColor;
  stroke-width:2;
  fill:none;
  stroke-linecap:round;
  stroke-linejoin:round;
}
.toll-dialog .icon-button:disabled{
  opacity:.36;
  cursor:not-allowed;
}
.toll-dialog .icon-button:active:not(:disabled),.toll-dialog .icon-button.is-pressed:not(:disabled){transform:scale(.95)}
.toll-dialog .builder-stepper{
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:8px;
  padding:10px 22px;
  border-bottom:1px solid var(--toll-line);
  background:transparent;
  flex:none;
  perspective:520px;
}
[data-theme="sepia"] .toll-dialog .builder-stepper{background:transparent}
[data-theme="dark"] .toll-dialog .builder-stepper{
  background:transparent;
}
.toll-dialog .builder-step-tab{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  display:flex;
  align-items:center;
  gap:8px;
  min-width:0;
  padding:9px 13px;
  border-radius:14px;
  border:none;
  background-color:rgba(246,247,249,.72);
  background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(216,218,224,.10) 100%);
  -webkit-backdrop-filter:blur(20px) saturate(.92);
  backdrop-filter:blur(20px) saturate(.92);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.42),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.08),0 5px 14px -2px rgba(0,0,0,.16);
  color:rgba(32,33,36,.90);
  text-shadow:0 1px 0 rgba(255,255,255,.30);
  font-size:12.5px;
  font-weight:740;
  letter-spacing:-.025em;
  text-align:left;
  cursor:pointer;
  touch-action:none;
  -webkit-touch-callout:none;
  user-select:none;
  -webkit-user-select:none;
  transition:all 400ms cubic-bezier(.25,1,.5,1);
}
.toll-dialog .builder-step-tab::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  z-index:1;
  background:linear-gradient(var(--angle-2,-45deg),rgba(255,255,255,0) 0%,rgba(255,255,255,.09) 28%,rgba(255,255,255,.17) 46% 54%,rgba(255,255,255,0) 72%);
  mix-blend-mode:screen;
  background-size:200% 200%;
  background-position:0% 50%;
  background-repeat:no-repeat;
  transition:background-position 500ms cubic-bezier(.25,1,.5,1),--angle-2 500ms cubic-bezier(.25,1,.5,1);
}
.toll-dialog .builder-step-tab > *{position:relative;z-index:2}
.toll-dialog .builder-step-tab:hover{
  transform:scale(.985);
  background-color:rgba(250,251,252,.84);
  -webkit-backdrop-filter:blur(18px) saturate(.95);
  backdrop-filter:blur(18px) saturate(.95);
  text-shadow:0 1px 0 rgba(255,255,255,.38);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.48),inset 0 0 14px 3px rgba(255,255,255,.17),inset 0 -1px 2px rgba(0,0,0,.08),0 3px 9px -2px rgba(0,0,0,.18);
}
.toll-dialog .builder-step-tab:hover::before{background-position:28% 50%}
.toll-dialog .builder-step-tab:active,.toll-dialog .builder-step-tab.is-pressed{
  transform:scale(.975);
  box-shadow:inset 0 .14em .125em rgba(0,0,0,.10),inset 0 -.125em .125em rgba(255,255,255,.34),0 2px 6px -1px rgba(0,0,0,.16);
}
.toll-dialog .builder-step-tab:active::before,.toll-dialog .builder-step-tab.is-pressed::before{background-position:54% 15%;--angle-2:-15deg}
.toll-dialog .builder-step-tab .step-badge{
  flex:none;
  width:25px;
  height:25px;
  border-radius:999px;
  display:grid;
  place-items:center;
  font-size:12px;
  font-weight:800;
  background:rgba(60,62,68,.12);
  color:rgba(36,37,41,.88);
  border:none;
}
.toll-dialog .builder-step-tab .step-title{
  min-width:0;
  line-height:1.32;
  word-break:keep-all;
}
.toll-dialog .builder-step-tab.is-active{
  color:rgba(24,25,28,.96);
  font-weight:820;
  border:none;
  background-color:#e2e4e8;
  background-image:none;
  -webkit-backdrop-filter:blur(20px) saturate(.92);
  backdrop-filter:blur(20px) saturate(.92);
  text-shadow:0 1px 0 rgba(255,255,255,.34);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.42),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.08),0 5px 14px -2px rgba(0,0,0,.16);
}
.toll-dialog .builder-step-tab.is-active:hover{
  background-color:#dcdfe4;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.48),inset 0 0 14px 3px rgba(255,255,255,.17),inset 0 -1px 2px rgba(0,0,0,.08),0 3px 9px -2px rgba(0,0,0,.18);
}
.toll-dialog .builder-step-tab.is-active .step-badge{
  background:rgba(34,35,39,.92);
  color:#ffffff;
  border:none;
  box-shadow:0 2px 5px rgba(0,0,0,.18);
}
.toll-dialog .builder-step-tab.is-done{color:rgba(32,33,36,.92)}
.toll-dialog .builder-step-tab.is-done .step-badge{
  background:rgba(52,54,60,.20);
  color:rgba(28,29,32,.94);
}
[data-theme="sepia"] .toll-dialog .builder-step-tab{
  background-color:rgba(246,245,243,.74);
  background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(232,231,229,.04) 56%,rgba(214,213,210,.11) 100%);
  color:#26221e;
}
[data-theme="sepia"] .toll-dialog .builder-step-tab:hover{background-color:rgba(250,249,247,.86)}
[data-theme="sepia"] .toll-dialog .builder-step-tab.is-active{
  background-color:#e2e1de;
  background-image:none;
  color:rgba(30,29,28,.95);
  text-shadow:0 1px 0 rgba(255,255,255,.34);
}
[data-theme="sepia"] .toll-dialog .builder-step-tab.is-active:hover{background-color:#dcdbd7}
[data-theme="dark"] .toll-dialog .builder-step-tab{
  color:rgba(235,237,242,.90);
  border:none;
  background-color:rgba(255,255,255,.12);
  background-image:linear-gradient(180deg,rgba(255,255,255,.14) 0%,rgba(255,255,255,.03) 56%,rgba(255,255,255,.08) 100%);
  -webkit-backdrop-filter:blur(20px) saturate(.95);
  backdrop-filter:blur(20px) saturate(.95);
  text-shadow:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.24),inset 0 0 12px 2px rgba(255,255,255,.06),inset 0 -1px 2px rgba(0,0,0,.28),0 5px 14px -2px rgba(0,0,0,.36);
}
[data-theme="dark"] .toll-dialog .builder-step-tab:hover{
  background-color:rgba(255,255,255,.18);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.30),inset 0 0 14px 3px rgba(255,255,255,.08),inset 0 -1px 2px rgba(0,0,0,.30),0 4px 12px -2px rgba(0,0,0,.40);
}
[data-theme="dark"] .toll-dialog .builder-step-tab .step-badge{
  background:rgba(255,255,255,.14);
  color:#f2f3f6;
  border:none;
}
[data-theme="dark"] .toll-dialog .builder-step-tab.is-active{
  color:#16171a;
  border:none;
  background-color:#e0e2e7;
  background-image:none;
  text-shadow:0 1px 0 rgba(255,255,255,.28);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.42),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.14),0 6px 16px -2px rgba(0,0,0,.46);
}
[data-theme="dark"] .toll-dialog .builder-step-tab.is-active:hover{background-color:#d7d9df}
[data-theme="dark"] .toll-dialog .builder-step-tab.is-active .step-badge{
  background:#1b1c20;
  color:#f6f7f9;
  border:none;
}
[data-theme="dark"] .toll-dialog .builder-step-tab.is-done .step-badge{
  background:rgba(255,255,255,.20);
  color:#ffffff;
}
.toll-dialog .builder-step-body{
  flex:1 1 auto;
  min-height:0;
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  scrollbar-width:thin;
  scrollbar-color:var(--toll-scroll) transparent;
  padding:16px 22px 96px;
  background:transparent;
}
[data-theme="dark"] .toll-dialog .builder-step-body{
  background:transparent;
}
.toll-dialog .is-step-hidden{display:none!important}
.toll-dialog .quickbar{
  padding:11px 22px 11px;
  border-bottom:1px solid var(--toll-line);
  display:flex;
  flex-direction:column;
  gap:7px;
  background:rgba(244,245,247,.56);
  flex:none;
}
.toll-dialog .quickbar.quickbar-step{
  padding:0 0 24px;
  border-bottom:0;
  background:transparent;
  gap:11px;
}
.toll-dialog .quickbar.quickbar-step .quick-line{
  position:relative;
  padding:12px 14px;
  border-radius:18px;
  border:1px solid var(--glass-rim);
  background-color:rgba(255,255,255,.14);
  background-image:none;
  -webkit-backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  box-shadow:var(--btn-shadow);
}
[data-theme="sepia"] .toll-dialog .quickbar.quickbar-step .quick-line{
  background-color:rgba(255,248,235,.16);
}
[data-theme="dark"] .toll-dialog .quickbar{
  background:rgba(255,255,255,.018);
}
[data-theme="dark"] .toll-dialog .quickbar.quickbar-step{
  background:transparent;
}
[data-theme="dark"] .toll-dialog .quickbar.quickbar-step .quick-line{
  background:rgba(28,28,32,.24);
  border-color:var(--glass-rim);
  box-shadow:var(--btn-shadow);
}
.toll-dialog .left-pane.step-single-pane,
.toll-dialog .right-pane.step-single-pane{
  padding:0;
  border-right:0;
  overflow:visible;
}
.toll-dialog .area-cards-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:12px;
  align-items:start;
}
.toll-dialog .area-cards-grid .area-card{
  margin-bottom:0;
}
.toll-dialog .quick-line{
  display:flex;
  align-items:center;
  gap:6px;
  min-width:0;
  flex-wrap:wrap;
}
.toll-dialog .quick-label{
  font-size:12.5px;
  font-weight:700;
  color:var(--toll-muted);
  min-width:80px;
  letter-spacing:-.025em;
}
.toll-dialog .chip{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  border-radius:999px;
  padding:8px 13px;
  font-size:12px;
  font-weight:650;
  line-height:1;
  white-space:nowrap;
  cursor:pointer;
  transition:background .16s,border-color .16s,transform .16s;
}
.toll-dialog .chip:active,.toll-dialog .chip.is-pressed{transform:scale(.97)}
.toll-dialog .subj-auto-box{
  display:inline-flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
  padding:5px 10px;
  border-radius:999px;
  background:rgba(255,255,255,.32);
  border:1px solid var(--toll-glass-edge-low);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.45);
}
[data-theme="dark"] .toll-dialog .subj-auto-box{
  background:rgba(255,255,255,.04);
  border-color:var(--toll-glass-edge-low);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10);
}
.toll-dialog .subj-check-label{
  display:inline-flex;
  align-items:center;
  gap:5px;
  font-size:12px;
  font-weight:650;
  color:var(--toll-ink-2);
  cursor:pointer;
  white-space:nowrap;
}
.toll-dialog .subj-check-label input[type="checkbox"]{
  appearance:none;
  -webkit-appearance:none;
  flex:none;
  position:relative;
  width:17px;
  height:17px;
  margin:0;
  border-radius:5.5px;
  border:1px solid rgba(190,194,202,.48);
  background-color:rgba(232,234,238,.86);
  background-image:none;
  -webkit-backdrop-filter:blur(18px) saturate(.92);
  backdrop-filter:blur(18px) saturate(.92);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72);
  display:grid;
  place-content:center;
  cursor:pointer;
  transition:background-color .16s ease,border-color .16s ease,box-shadow .16s ease,transform .14s ease;
}
.toll-dialog .subj-check-label input[type="checkbox"]:hover{
  background-color:rgba(238,240,243,.92);
  border-color:rgba(164,168,176,.62);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.82);
}
.toll-dialog .subj-check-label input[type="checkbox"]:active{transform:scale(.95)}
.toll-dialog .subj-check-label input[type="checkbox"]:checked{
  border-color:rgba(255,255,255,.34);
  background-color:rgba(58,60,65,.88);
  background-image:none;
  -webkit-backdrop-filter:blur(18px) saturate(.95);
  backdrop-filter:blur(18px) saturate(.95);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26);
}
.toll-dialog .subj-check-label input[type="checkbox"]:checked:hover{
  background-color:rgba(50,52,57,.92);
  border-color:rgba(255,255,255,.44);
}
.toll-dialog .subj-check-label input[type="checkbox"]:checked::after{
  content:"";
  width:12px;
  height:12px;
  border:0;
  transform:none;
  filter:none;
  background-color:rgba(255,255,255,.96);
  -webkit-mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.6 8.3L6.6 11.3L12.4 5.1' stroke='black' stroke-width='1.65' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
  mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.6 8.3L6.6 11.3L12.4 5.1' stroke='black' stroke-width='1.65' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / contain no-repeat;
}
[data-theme="sepia"] .toll-dialog .subj-check-label input[type="checkbox"]{
  background-color:rgba(232,231,229,.87);
  background-image:none;
  border-color:rgba(182,178,170,.46);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72);
}
[data-theme="sepia"] .toll-dialog .subj-check-label input[type="checkbox"]:hover{
  background-color:rgba(238,237,235,.92);
  border-color:rgba(158,154,146,.62);
}
[data-theme="sepia"] .toll-dialog .subj-check-label input[type="checkbox"]:checked{
  background-color:rgba(62,60,58,.88);
  background-image:none;
  border-color:rgba(255,250,242,.34);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24);
}
[data-theme="sepia"] .toll-dialog .subj-check-label input[type="checkbox"]:checked::after{
  background-color:rgba(255,253,249,.96);
  filter:none;
}
[data-theme="dark"] .toll-dialog .subj-check-label input[type="checkbox"]{
  border-color:rgba(255,255,255,.50);
  background-color:rgba(226,228,232,.85);
  background-image:none;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.52);
}
[data-theme="dark"] .toll-dialog .subj-check-label input[type="checkbox"]:hover{
  background-color:rgba(232,234,238,.91);
  border-color:rgba(255,255,255,.66);
}
[data-theme="dark"] .toll-dialog .subj-check-label input[type="checkbox"]:checked{
  border-color:rgba(255,255,255,.38);
  background-color:rgba(66,68,74,.88);
  background-image:none;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26);
}
[data-theme="dark"] .toll-dialog .subj-check-label input[type="checkbox"]:checked:hover{
  background-color:rgba(74,76,82,.92);
  border-color:rgba(255,255,255,.48);
}
[data-theme="dark"] .toll-dialog .subj-check-label input[type="checkbox"]:checked::after{
  background-color:rgba(255,255,255,.96);
  border:0;
  filter:none;
}
.toll-dialog .builder-select-sm{
  height:30px;
  padding:0 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:650;
  color:var(--toll-ink);
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.48);
  outline:none;
  cursor:pointer;
}
[data-theme="dark"] .toll-dialog .builder-select-sm{
  background:rgba(28,28,28,.9);
}
.toll-dialog .builder-select-sm option{
  background:#1f1f1f;
  color:#f1f1f1;
}
.toll-dialog .bookmark-modal-chip{
  display:inline-flex;
  align-items:center;
  border-radius:999px;
  border:1px solid var(--toll-glass-edge-low);
  background:linear-gradient(145deg,rgba(255,255,255,.42),rgba(255,255,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 2px 7px rgba(0,0,0,.035);
  overflow:hidden;
}
[data-theme="dark"] .toll-dialog .bookmark-modal-chip{
  border-color:var(--toll-glass-edge-low);
  background:linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.03));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 2px 8px rgba(0,0,0,.18);
}
.toll-dialog .bookmark-modal-apply{
  border:none;
  background:transparent;
  padding:7px 9px 7px 12px;
  font-size:12px;
  font-weight:650;
  line-height:1;
  cursor:pointer;
  white-space:nowrap;
}
.toll-dialog .bookmark-modal-apply:hover{background:rgba(255,255,255,.22)}
[data-theme="dark"] .toll-dialog .bookmark-modal-apply:hover{background:rgba(255,255,255,.07)}
.toll-dialog .bookmark-modal-del{
  border:none;
  border-left:1px solid var(--toll-line);
  background:transparent;
  padding:7px 9px 7px 7px;
  font-size:12.5px;
  font-weight:750;
  line-height:1;
  cursor:pointer;
  opacity:.72;
}
.toll-dialog .bookmark-modal-del:hover{opacity:1;background:rgba(255,255,255,.08)}
.toll-dialog .bookmark-modal-save-group{
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.toll-dialog .bookmark-modal-input{
  width:175px;
  height:32px;
  border-radius:999px;
  padding:0 12px;
  font-size:12px;
  font-weight:650;
  color:var(--toll-ink);
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.45);
  outline:none;
}
[data-theme="dark"] .toll-dialog .bookmark-modal-input{
  background:rgba(255,255,255,.045);
}
.toll-dialog .bookmark-modal-input::placeholder{color:var(--toll-muted)}
.toll-dialog .workspace{
  display:grid;
  grid-template-columns:minmax(290px,36%) minmax(0,1fr);
  flex:1 1 auto;
  min-height:0;
  overflow:hidden;
  background:rgba(255,255,255,.045);
}
[data-theme="dark"] .toll-dialog .workspace{
  background:rgba(0,0,0,.12);
}
.toll-dialog .left-pane,
.toll-dialog .right-pane{
  min-height:0;
  overflow:auto;
  overscroll-behavior:contain;
  scrollbar-width:thin;
  scrollbar-color:var(--toll-scroll) transparent;
}
.toll-dialog .left-pane{
  padding:14px 14px 88px 18px;
  border-right:1px solid var(--toll-line);
}
.toll-dialog .right-pane{
  padding:14px 18px 88px 18px;
}
.toll-dialog .pane-title{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:6px 12px;
  margin:0 0 11px;
  font-size:14px;
  line-height:1.45;
  font-weight:750;
  letter-spacing:-.03em;
  color:var(--toll-ink-2);
  word-break:keep-all;
}
.toll-dialog .pane-note{
  font-size:12px;
  line-height:1.45;
  font-weight:500;
  color:var(--toll-muted);
  word-break:keep-all;
}
.toll-dialog .left-tools-panel{
  padding:9px 10px;
  margin-bottom:11px;
  border-radius:15px;
  border:1px solid var(--toll-glass-edge-low);
  background:linear-gradient(145deg,rgba(255,255,255,.32),rgba(255,255,255,.12));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55);
  display:flex;
  flex-direction:column;
  gap:7px;
}
[data-theme="dark"] .toll-dialog .left-tools-panel{
  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.02));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10);
}
.toll-dialog .search-wrap{
  position:relative;
  display:flex;
  align-items:center;
}
.toll-dialog .search-icon{
  position:absolute;
  left:11px;
  width:15px;
  height:15px;
  color:var(--toll-muted);
  pointer-events:none;
}
.toll-dialog .builder-search-input{
  width:100%;
  height:35px;
  padding:0 12px 0 33px;
  border-radius:999px;
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.52);
  color:var(--toll-ink);
  font-size:12.5px;
  font-weight:600;
  letter-spacing:-.02em;
  outline:none;
}
[data-theme="dark"] .toll-dialog .builder-search-input{
  background:rgba(255,255,255,.045);
}
.toll-dialog .builder-search-input::placeholder{
  color:var(--toll-muted);
  font-size:12.5px;
  font-weight:550;
}
.toll-dialog .stage-type-bar{
  display:flex;
  align-items:center;
  gap:4px;
  flex-wrap:wrap;
}
.toll-dialog .stage-type-chip{
  height:28px;
  padding:0 10px;
  border-radius:999px;
  font-size:11.5px;
  font-weight:650;
  color:var(--toll-ink-2);
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.42);
  cursor:pointer;
  transition:background .15s,border-color .15s,transform .15s;
}
[data-theme="dark"] .toll-dialog .stage-type-chip{
  background:rgba(255,255,255,.045);
}
.toll-dialog .stage-type-chip:hover{
  background:rgba(255,255,255,.68);
  border-color:var(--toll-glass-edge);
}
.toll-dialog .stage-type-chip:active,.toll-dialog .stage-type-chip.is-pressed{
  transform:scale(.96);
}
[data-theme="dark"] .toll-dialog .stage-type-chip:hover{
  background:rgba(255,255,255,.11);
  border-color:var(--toll-glass-edge);
}
.toll-dialog .area-card{
  padding:10px 10px 9px;
  border-radius:17px;
  background:linear-gradient(145deg,rgba(255,255,255,.26),rgba(255,255,255,.10));
  border:1px solid rgba(255,255,255,.48);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.66),0 3px 12px rgba(0,0,0,.018);
  margin-bottom:10px;
}
[data-theme="dark"] .toll-dialog .area-card{
  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.02));
  border-color:var(--toll-glass-edge-low);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 4px 14px rgba(0,0,0,.18);
}
.toll-dialog .area-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:0 2px 7px;
  border-bottom:1px solid var(--toll-line-soft);
  margin-bottom:5px;
}
.toll-dialog .area-card.collapsed .area-head{
  padding-bottom:0;
  border-bottom:none;
  margin-bottom:0;
}
.toll-dialog .area-check{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:13px;
  font-weight:750;
  letter-spacing:-.035em;
  cursor:pointer;
  min-width:0;
}
.toll-dialog .area-head-actions{
  display:inline-flex;
  align-items:center;
  gap:5px;
  flex:none;
}
.toll-dialog .area-tag{
  position:relative;
  overflow:hidden;
  font-size:11px;
  font-weight:650;
  color:var(--toll-ink-2);
  padding:6px 10px;
  border-radius:999px;
  white-space:nowrap;
  cursor:pointer;
}
.toll-dialog .collapse-btn{
  border:none;
  background:transparent;
  color:var(--toll-muted);
  font-size:11.5px;
  font-weight:650;
  padding:4px 7px;
  border-radius:6px;
  cursor:pointer;
}
.toll-dialog .collapse-btn:hover{
  color:var(--toll-ink);
  background:rgba(255,255,255,.06);
}
.toll-dialog .stage-row{
  position:relative;
  min-height:42px;
  height:auto;
  padding:7px 13px;
  display:grid;
  grid-template-columns:18px minmax(0,1fr) auto;
  align-items:center;
  gap:9px;
  border-radius:999px;
  margin-top:4px;
  cursor:pointer;
  border:none;
  transform-origin:center;
  transform:scale(.945);
  opacity:.88;
  background-color:rgba(244,245,247,.72);
  background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.09) 100%);
  -webkit-backdrop-filter:blur(18px) saturate(.95);
  backdrop-filter:blur(18px) saturate(.95);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.44),inset 0 0 10px 2px rgba(255,255,255,.10),inset 0 -1px 2px rgba(0,0,0,.05),0 3px 10px -2px rgba(0,0,0,.08);
  transition:background-color .24s cubic-bezier(.22,1,.36,1),box-shadow .24s cubic-bezier(.22,1,.36,1),opacity .22s ease,transform .32s cubic-bezier(.34,1.42,.64,1);
}
.toll-dialog .stage-row:hover{
  transform:scale(.968);
  opacity:.96;
  background-color:rgba(248,249,251,.86);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.54),inset 0 0 12px 3px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.06),0 4px 12px -2px rgba(0,0,0,.12);
}
.toll-dialog .stage-row:active{
  transform:scale(.925);
}
.toll-dialog .stage-row.selected{
  transform:scale(1);
  opacity:1;
  background-color:rgba(228,230,235,.90);
  background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(228,230,235,.04) 56%,rgba(208,210,216,.12) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.50),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.08),0 4px 12px -2px rgba(0,0,0,.12);
}
.toll-dialog .stage-row.selected:hover{
  transform:scale(1.008);
}
.toll-dialog .stage-row.selected:active{
  transform:scale(.975);
}
[data-theme="sepia"] .toll-dialog .stage-row{background-color:rgba(243,242,240,.74);border:none}
[data-theme="sepia"] .toll-dialog .stage-row:hover{background-color:rgba(248,246,242,.88)}
[data-theme="sepia"] .toll-dialog .stage-row.selected{background-color:rgba(232,229,224,.90)}
[data-theme="dark"] .toll-dialog .stage-row{
  background-color:rgba(255,255,255,.06);
  background-image:linear-gradient(180deg,rgba(255,255,255,.09) 0%,rgba(255,255,255,.02) 56%,rgba(0,0,0,.08) 100%);
  border:none;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),inset 0 0 10px 1px rgba(255,255,255,.03),0 2px 8px rgba(0,0,0,.20);
}
[data-theme="dark"] .toll-dialog .stage-row:hover{
  background-color:rgba(255,255,255,.11);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 3px 10px rgba(0,0,0,.24);
}
[data-theme="dark"] .toll-dialog .stage-row.selected{
  background-color:rgba(255,255,255,.14);
  background-image:linear-gradient(145deg,rgba(255,255,255,.17),rgba(255,255,255,.07));
  box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 -1px 2px rgba(0,0,0,.14),0 4px 12px rgba(0,0,0,.26);
}
.toll-dialog .stage-row input[type="checkbox"],
.toll-dialog .area-check input[type="checkbox"]{
  appearance:none;
  -webkit-appearance:none;
  flex:none;
  width:18px;
  height:18px;
  margin:0;
  border:1px solid rgba(68,68,72,.34);
  border-radius:6px;
  background:linear-gradient(145deg,rgba(255,255,255,.52),rgba(255,255,255,.20));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),inset 0 -1px 0 rgba(0,0,0,.025),0 1px 3px rgba(0,0,0,.035);
  display:grid;
  place-content:center;
  cursor:pointer;
  transition:background .16s,border-color .16s,box-shadow .16s,transform .16s var(--ease);
}
.toll-dialog .area-check input[type="checkbox"]{
  width:19px;
  height:19px;
  border-radius:6.5px;
}
.toll-dialog .stage-row input[type="checkbox"]:hover,
.toll-dialog .area-check input[type="checkbox"]:hover{
  border-color:rgba(50,50,54,.57);
  transform:scale(1.04);
}
.toll-dialog .stage-row input[type="checkbox"]:checked,
.toll-dialog .area-check input[type="checkbox"]:checked{
  border-color:rgba(45,45,48,.48);
  background:linear-gradient(145deg,rgba(56,56,59,.88),rgba(43,43,46,.72));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.34),inset 0 -1px 0 rgba(0,0,0,.12),0 2px 7px rgba(0,0,0,.12);
}
.toll-dialog .stage-row input[type="checkbox"]:checked::after,
.toll-dialog .area-check input[type="checkbox"]:checked::after{
  content:"";
  width:8px;
  height:4px;
  border-left:2px solid rgba(255,255,255,.98);
  border-bottom:2px solid rgba(255,255,255,.98);
  transform:rotate(-45deg) translate(1px,-1px);
  filter:drop-shadow(0 1px 1px rgba(0,0,0,.16));
}
[data-theme="dark"] .toll-dialog .stage-row input[type="checkbox"],
[data-theme="dark"] .toll-dialog .area-check input[type="checkbox"]{
  border-color:rgba(255,255,255,.28);
  background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.03));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(0,0,0,.22),0 1px 4px rgba(0,0,0,.22);
}
[data-theme="dark"] .toll-dialog .stage-row input[type="checkbox"]:hover,
[data-theme="dark"] .toll-dialog .area-check input[type="checkbox"]:hover{
  border-color:rgba(255,255,255,.52);
}
[data-theme="dark"] .toll-dialog .stage-row input[type="checkbox"]:checked,
[data-theme="dark"] .toll-dialog .area-check input[type="checkbox"]:checked{
  border-color:rgba(255,255,255,.65);
  background:linear-gradient(145deg,rgba(244,244,244,.95),rgba(206,206,206,.82));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 2px 8px rgba(0,0,0,.32);
}
[data-theme="dark"] .toll-dialog .stage-row input[type="checkbox"]:checked::after,
[data-theme="dark"] .toll-dialog .area-check input[type="checkbox"]:checked::after{
  border-color:#1c1c1c;
  filter:none;
}
.toll-dialog .stage-name{
  font-size:12.5px;
  font-weight:580;
  letter-spacing:-.025em;
  line-height:1.32;
  word-break:keep-all;
  white-space:normal;
}
.toll-dialog .stage-meta{
  font-size:11.5px;
  color:var(--toll-muted);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}
.toll-dialog .batch-interval-bar{
  padding:9px 12px;
  margin-bottom:10px;
  border-radius:15px;
  border:1px solid var(--toll-glass-edge-low);
  background:linear-gradient(145deg,rgba(255,255,255,.32),rgba(255,255,255,.12));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  flex-wrap:wrap;
}
[data-theme="dark"] .toll-dialog .batch-interval-bar{
  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.02));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10);
}
.toll-dialog .batch-group{
  display:inline-flex;
  align-items:center;
  gap:5px;
  flex-wrap:wrap;
  font-size:12px;
  font-weight:650;
  color:var(--toll-ink-2);
}
.toll-dialog .tools-label{
  font-size:12px;
  font-weight:700;
  color:var(--toll-muted);
  letter-spacing:-.02em;
}
.toll-dialog .batch-num-input{
  width:54px;
  height:31px;
  border-radius:8px;
  text-align:center;
  padding:0 6px;
  font-size:12.5px;
  font-weight:700;
  color:var(--toll-ink);
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.45);
  outline:none;
}
[data-theme="dark"] .toll-dialog .batch-num-input{
  background:rgba(255,255,255,.045);
}
.toll-dialog .diag-strip{
  display:flex;
  flex-direction:column;
  gap:5px;
  margin-bottom:10px;
}
.toll-dialog .diag-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
  padding:8px 12px;
  border-radius:12px;
  font-size:12px;
  font-weight:650;
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.35);
  color:var(--toll-ink-2);
}
[data-theme="dark"] .toll-dialog .diag-item{
  background:rgba(255,255,255,.045);
}
.toll-dialog .diag-item.warn{
  background:var(--toll-warn-bg);
  border-color:var(--toll-warn-line);
  color:var(--toll-warn);
}
.toll-dialog .fix-btn{
  flex:none;
  height:28px;
  padding:0 11px;
  border-radius:999px;
  font-size:11.5px;
  font-weight:700;
  border:1px solid currentColor;
  background:transparent;
  color:inherit;
  cursor:pointer;
  white-space:nowrap;
}
.toll-dialog .fix-btn:hover{
  background:rgba(255,255,255,.08);
}
.toll-dialog .schedule-item{position:relative;margin:0 0 10px}
.toll-dialog .schedule-item.is-popover-open{z-index:95}
.toll-dialog .alarm-card{
  min-height:70px;
  display:grid;
  grid-template-columns:32px minmax(145px,1fr) auto auto;
  align-items:center;
  gap:10px;
  padding:10px 13px;
  border:1px solid rgba(255,255,255,.76);
  border-radius:18px;
  background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.86),inset 0 -1px 0 rgba(255,255,255,.12),0 5px 16px rgba(0,0,0,.035);
  position:relative;
  overflow:visible;
}
[data-theme="dark"] .toll-dialog .alarm-card{
  border-color:var(--toll-glass-edge-low);
  background:linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.028));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.15),inset 0 -1px 0 rgba(255,255,255,.025),0 6px 16px rgba(0,0,0,.22);
}
.toll-dialog .alarm-card::before{
  content:"";
  position:absolute;
  inset:0 0 auto;
  height:45%;
  background:linear-gradient(180deg,rgba(255,255,255,.055),transparent);
  pointer-events:none;
}
.toll-dialog .number{
  width:30px;
  height:30px;
  display:grid;
  place-items:center;
  border-radius:50%;
  font-size:12px;
  font-weight:800;
  color:var(--toll-ink-2);
  background:linear-gradient(145deg,rgba(255,255,255,.48),rgba(90,90,92,.09));
  border:1px solid rgba(255,255,255,.82);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 2px 6px rgba(0,0,0,.04);
}
[data-theme="dark"] .toll-dialog .number{
  background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.045));
  border-color:var(--toll-glass-edge);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 2px 6px rgba(0,0,0,.22);
}
.toll-dialog .alarm-title-wrap{min-width:0}
.toll-dialog .alarm-name{
  font-size:14px;
  font-weight:750;
  letter-spacing:-.035em;
  margin-bottom:3px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  display:flex;
  align-items:center;
  gap:5px;
}
.toll-dialog .next-day-badge{
  display:inline-flex;
  align-items:center;
  padding:1.5px 6px;
  border-radius:999px;
  background:var(--toll-warn-bg);
  border:1px solid var(--toll-warn-line);
  color:var(--toll-warn);
  font-size:11px;
  font-weight:750;
}
.toll-dialog .alarm-sub{
  font-size:11.5px;
  color:var(--toll-muted);
  letter-spacing:-.02em;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.toll-dialog .clock-control{
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--toll-muted);
  font-size:12px;
  white-space:nowrap;
}
.toll-dialog .time-input{
  width:130px;
  min-width:120px;
  height:35px;
  border-radius:10px;
  padding:0 10px;
  color:var(--toll-ink);
  font-size:12.5px;
  font-weight:700;
  letter-spacing:.02em;
  outline:none;
}
[data-theme="dark"] .toll-dialog .time-input{
  color-scheme:dark;
}
.toll-dialog .card-right-actions{
  display:inline-flex;
  align-items:center;
  gap:5px;
}
.toll-dialog .mute-toggle-btn{
  width:35px;
  height:35px;
  padding:0;
  border-radius:50%;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:var(--toll-ink-2);
  border:1px solid var(--toll-glass-edge-low);
  background:var(--toll-pill);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14);
  cursor:pointer;
  transition:background .15s,border-color .15s,transform .15s;
}
.toll-dialog .mute-toggle-btn:hover{
  background:var(--toll-pill-hover);
  border-color:var(--toll-glass-edge);
}
.toll-dialog .mute-toggle-btn:active,.toll-dialog .mute-toggle-btn.is-pressed{transform:scale(.94)}
.toll-dialog .mute-toggle-btn.is-muted{
  background:rgba(214,110,110,.14);
  border-color:rgba(214,110,110,.38);
  color:#eb9b9b;
}
.toll-dialog .preview-btn{
  height:35px;
  padding:0 13px;
  border-radius:999px;
  font-size:11.5px;
  font-weight:700;
  white-space:nowrap;
  cursor:pointer;
  transition:background .16s,transform .16s;
}
.toll-dialog .preview-btn:active,.toll-dialog .preview-btn.is-pressed{transform:scale(.96)}
.toll-dialog .interval-row{
  min-height:58px;
  margin:7px 0 0 22px;
  padding:8px 11px 8px 13px;
  border:1px solid rgba(255,255,255,.60);
  border-left:2px solid rgba(80,80,82,.34);
  border-radius:0 16px 16px 0;
  background:linear-gradient(110deg,rgba(80,80,82,.065),rgba(255,255,255,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55);
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
[data-theme="dark"] .toll-dialog .interval-row{
  border-color:var(--toll-glass-edge-low);
  border-left:2px solid rgba(255,255,255,.32);
  background:linear-gradient(110deg,rgba(255,255,255,.055),rgba(255,255,255,.018));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09);
}
.toll-dialog .interval-copy{min-width:128px}
.toll-dialog .interval-title{
  font-size:12px;
  font-weight:750;
  letter-spacing:-.03em;
  margin-bottom:3px;
}
.toll-dialog .interval-sub{
  font-size:11px;
  color:var(--toll-muted);
}
.toll-dialog .row-inline-alert{
  margin-top:4px;
  font-size:11.5px;
  font-weight:650;
  color:var(--toll-warn);
  display:flex;
  align-items:center;
  gap:6px;
}
.toll-dialog .interval-actions{
  display:flex;
  align-items:center;
  gap:5px;
  white-space:nowrap;
}
.toll-dialog .nudge{
  height:32px;
  min-width:44px;
  padding:0 10px;
  border-radius:999px;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
  transition:background .15s,transform .15s;
}
.toll-dialog .nudge:active,.toll-dialog .nudge.is-pressed{transform:scale(.93)}
.toll-dialog .interval-input{
  width:66px;
  height:33px;
  border-radius:9px;
  text-align:right;
  padding:0 8px;
  color:var(--toll-ink);
  font-size:12.5px;
  font-weight:750;
  outline:none;
}
.toll-dialog .unit{
  font-size:11.5px;
  font-weight:600;
  color:var(--toll-ink-2);
  margin-left:-1px;
}
.toll-dialog .omitted-steps-box{
  margin:6px 0 8px 22px;
  padding:7px 11px;
  border-radius:12px;
  border:1px dashed var(--toll-line);
  background:rgba(255,255,255,.03);
  font-size:11.5px;
  color:var(--toll-muted);
}
.toll-dialog .omitted-head{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
.toll-dialog .omitted-list{
  margin-top:6px;
  display:flex;
  flex-wrap:wrap;
  gap:4px;
}
.toll-dialog .omitted-pill{
  display:inline-flex;
  align-items:center;
  gap:4px;
  padding:3.5px 9px;
  border-radius:999px;
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.05);
  color:var(--toll-ink-2);
  font-size:11px;
  font-weight:650;
}
.toll-dialog .omitted-pill button{
  border:none;
  background:transparent;
  color:var(--toll-ink);
  font-weight:800;
  font-size:11px;
  cursor:pointer;
  padding:0 2px;
}
.toll-dialog .empty-state{
  padding:28px 14px;
  text-align:center;
  color:var(--toll-muted);
  font-size:13px;
  line-height:1.7;
  border:1px dashed var(--toll-line);
  border-radius:18px;
  background:var(--toll-glass-soft);
}
.toll-dialog .dialog-footer{
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  z-index:5;
  min-height:72px;
  padding:10px 22px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  border-top:1px solid var(--toll-glass-edge-low);
  background:transparent;
  -webkit-backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  backdrop-filter:blur(18px) saturate(1.42) contrast(1.02);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.42),0 -8px 26px rgba(0,0,0,.045);
}
[data-theme="dark"] .toll-dialog .dialog-footer{
  background:transparent;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 -8px 28px rgba(0,0,0,.28);
}
.toll-dialog .summary{
  font-size:12.5px;
  line-height:1.5;
  font-weight:650;
  letter-spacing:-.025em;
  color:var(--toll-ink-2);
}
.toll-dialog .summary strong{
  color:var(--toll-ink);
  font-weight:800;
}
.toll-dialog .footer-actions{
  display:flex;
  align-items:center;
  gap:10px;
  flex:none;
  perspective:520px;
}
.toll-dialog .footer-btn{
  height:42px;
  padding:0 20px;
  border-radius:999px;
  font-size:12px;
  font-weight:750;
  cursor:pointer;
  white-space:nowrap;
  touch-action:none;
  -webkit-touch-callout:none;
  transition:transform .16s,background .16s,box-shadow .16s,border-color .16s;
}
.toll-dialog .footer-btn:active,.toll-dialog .footer-btn.is-pressed{transform:scale(.97)}
.toll-dialog .chip,
.toll-dialog .area-tag,
.toll-dialog .collapse-btn,
.toll-dialog .preview-btn,
.toll-dialog .nudge,
.toll-dialog .footer-btn,
.toll-dialog .icon-button,
.toll-dialog .stage-type-chip,
.toll-dialog .fix-btn,
.toll-dialog .mute-toggle-btn,
.toll-dialog .custom-time-trigger,
.toll-dialog .bookmark-modal-chip{
  border:1px solid var(--toll-btn-rim);
  background-color:rgba(244,245,247,.80);
  background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.09) 100%);
  -webkit-backdrop-filter:blur(18px) saturate(.95);
  backdrop-filter:blur(18px) saturate(.95);
  color:rgba(32,33,36,.94);
  text-shadow:0 1px 0 rgba(255,255,255,.26);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.24),inset 0 0 10px 2px rgba(255,255,255,.08),inset 0 -1px 2px rgba(0,0,0,.04),0 3px 10px -2px rgba(0,0,0,.09),0 0 0 1px inset var(--toll-btn-inset-rim);
}
.toll-dialog .time-input,
.toll-dialog .interval-input,
.toll-dialog .builder-select-sm,
.toll-dialog .bookmark-modal-input,
.toll-dialog .builder-search-input,
.toll-dialog .batch-num-input{
  border:1px solid rgba(255,255,255,.68);
  background-color:rgba(247,248,250,.84);
  background-image:linear-gradient(180deg,rgba(255,255,255,.14) 0%,rgba(232,234,238,.05) 100%);
  -webkit-backdrop-filter:blur(16px) saturate(.95);
  backdrop-filter:blur(16px) saturate(.95);
  color:rgba(28,29,32,.95);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.52),inset 0 -1px 2px rgba(0,0,0,.04),0 2px 7px rgba(0,0,0,.06);
}
.toll-dialog .preview-btn,
.toll-dialog .nudge,
.toll-dialog .footer-btn,
.toll-dialog .icon-button{
  position:relative;
  isolation:isolate;
  overflow:hidden;
}
.toll-dialog .chip::before,
.toll-dialog .area-tag::before,
.toll-dialog .preview-btn::before,
.toll-dialog .nudge::before,
.toll-dialog .footer-btn::before,
.toll-dialog .icon-button::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(118deg,rgba(255,255,255,.18),transparent 42%,rgba(255,255,255,.04));
  opacity:.65;
}
.toll-dialog .chip:hover,
.toll-dialog .area-tag:hover,
.toll-dialog .collapse-btn:hover,
.toll-dialog .preview-btn:hover,
.toll-dialog .nudge:hover,
.toll-dialog .footer-btn:hover,
.toll-dialog .icon-button:hover:not(:disabled),
.toll-dialog .stage-type-chip:hover,
.toll-dialog .fix-btn:hover,
.toll-dialog .mute-toggle-btn:hover,
.toll-dialog .custom-time-trigger:hover{
  background-color:rgba(248,249,251,.87);
  border-color:var(--toll-btn-rim-hover);
}
.toll-dialog .chip.active,
.toll-dialog .stage-type-chip.active,
.toll-dialog .custom-time-trigger.is-open{
  color:rgba(24,25,28,.96);
  font-weight:780;
  border-color:rgba(45,46,50,.18);
  background-color:rgba(228,230,235,.89);
  background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(228,230,235,.04) 56%,rgba(208,210,216,.12) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.28),inset 0 0 12px 2px rgba(255,255,255,.10),inset 0 -1px 2px rgba(0,0,0,.06),0 4px 12px -2px rgba(0,0,0,.13),0 0 0 1px inset var(--toll-btn-inset-rim);
}
[data-theme="dark"] .toll-dialog .chip,
[data-theme="dark"] .toll-dialog .area-tag,
[data-theme="dark"] .toll-dialog .collapse-btn,
[data-theme="dark"] .toll-dialog .preview-btn,
[data-theme="dark"] .toll-dialog .nudge,
[data-theme="dark"] .toll-dialog .footer-btn,
[data-theme="dark"] .toll-dialog .icon-button,
[data-theme="dark"] .toll-dialog .stage-type-chip,
[data-theme="dark"] .toll-dialog .fix-btn,
[data-theme="dark"] .toll-dialog .mute-toggle-btn,
[data-theme="dark"] .toll-dialog .custom-time-trigger,
[data-theme="dark"] .toll-dialog .bookmark-modal-chip{
  color:#1c1d21;
  border-color:var(--toll-btn-rim);
  background-color:rgba(234,236,240,.80);
  background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(234,236,240,.04) 56%,rgba(208,210,216,.11) 100%);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 0 10px 2px rgba(255,255,255,.08),inset 0 -1px 2px rgba(0,0,0,.10),0 4px 12px -2px rgba(0,0,0,.32),0 0 0 1px inset var(--toll-btn-inset-rim);
}
[data-theme="dark"] .toll-dialog .time-input,
[data-theme="dark"] .toll-dialog .interval-input,
[data-theme="dark"] .toll-dialog .builder-select-sm,
[data-theme="dark"] .toll-dialog .bookmark-modal-input,
[data-theme="dark"] .toll-dialog .builder-search-input,
[data-theme="dark"] .toll-dialog .batch-num-input{
  color:var(--toll-ink);
  border-color:rgba(255,255,255,.22);
  background-color:rgba(42,43,46,.84);
  background-image:linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.03));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.025),0 2px 8px rgba(0,0,0,.18);
}
[data-theme="dark"] .toll-dialog .chip:hover,
[data-theme="dark"] .toll-dialog .area-tag:hover,
[data-theme="dark"] .toll-dialog .collapse-btn:hover,
[data-theme="dark"] .toll-dialog .preview-btn:hover,
[data-theme="dark"] .toll-dialog .nudge:hover,
[data-theme="dark"] .toll-dialog .footer-btn:hover,
[data-theme="dark"] .toll-dialog .icon-button:hover:not(:disabled),
[data-theme="dark"] .toll-dialog .stage-type-chip:hover,
[data-theme="dark"] .toll-dialog .fix-btn:hover,
[data-theme="dark"] .toll-dialog .mute-toggle-btn:hover,
[data-theme="dark"] .toll-dialog .custom-time-trigger:hover{
  background-color:rgba(242,244,247,.86);
  border-color:var(--toll-btn-rim-hover);
}
[data-theme="dark"] .toll-dialog .chip.active,
[data-theme="dark"] .toll-dialog .stage-type-chip.active,
[data-theme="dark"] .toll-dialog .custom-time-trigger.is-open{
  color:#141518;
  border-color:rgba(255,255,255,.24);
  background-color:rgba(222,224,229,.90);
  box-shadow:inset 0 1px 1px rgba(255,255,255,.26),inset 0 0 12px 2px rgba(255,255,255,.10),inset 0 -1px 2px rgba(0,0,0,.12),0 5px 14px -2px rgba(0,0,0,.40),0 0 0 1px inset rgba(255,255,255,.16);
}
.toll-dialog .area-tag,
.toll-dialog .stage-type-chip,
[data-theme="sepia"] .toll-dialog .area-tag,
[data-theme="sepia"] .toll-dialog .stage-type-chip{
  border:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.42),inset 0 0 10px 2px rgba(255,255,255,.10),inset 0 -1px 2px rgba(0,0,0,.05),0 3px 10px -2px rgba(0,0,0,.10);
}
.toll-dialog .area-tag:hover,
.toll-dialog .stage-type-chip:hover{
  border:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.48),inset 0 0 12px 3px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.06),0 3px 8px -2px rgba(0,0,0,.13);
}
.toll-dialog .stage-type-chip.active,
.toll-dialog .area-tag.is-core-all{
  border:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.46),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.08),0 4px 12px -2px rgba(0,0,0,.14);
}
[data-theme="dark"] .toll-dialog .area-tag,
[data-theme="dark"] .toll-dialog .stage-type-chip,
[data-theme="dark"] .toll-dialog .area-tag:hover,
[data-theme="dark"] .toll-dialog .stage-type-chip:hover{
  border:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.40),inset 0 0 10px 2px rgba(255,255,255,.12),inset 0 -1px 2px rgba(0,0,0,.12),0 4px 12px -2px rgba(0,0,0,.34);
}
[data-theme="dark"] .toll-dialog .stage-type-chip.active,
[data-theme="dark"] .toll-dialog .area-tag.is-core-all{
  border:none;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.46),inset 0 0 12px 2px rgba(255,255,255,.14),inset 0 -1px 2px rgba(0,0,0,.14),0 5px 14px -2px rgba(0,0,0,.42);
}
.toll-dialog .time-input:focus,
.toll-dialog .interval-input:focus,
.toll-dialog .builder-search-input:focus,
.toll-dialog .bookmark-modal-input:focus,
.toll-dialog .batch-num-input:focus{
  border-color:rgba(70,70,72,.45);
  box-shadow:0 0 0 3px rgba(100,100,102,.10),inset 0 1px 0 rgba(255,255,255,.72);
}
[data-theme="dark"] .toll-dialog .time-input:focus,
[data-theme="dark"] .toll-dialog .interval-input:focus,
[data-theme="dark"] .toll-dialog .builder-search-input:focus,
[data-theme="dark"] .toll-dialog .bookmark-modal-input:focus,
[data-theme="dark"] .toll-dialog .batch-num-input:focus{
  border-color:rgba(255,255,255,.42);
  box-shadow:0 0 0 3px rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.14);
}
.toll-dialog .lg-pill-cta-wrap{--cta-size:14.5px;--anim--hover-time:400ms;--anim--hover-ease:cubic-bezier(.25,1,.5,1);position:relative;z-index:2;display:inline-flex;align-items:center;border-radius:999vw;background:transparent;font-size:var(--cta-size);pointer-events:none;transform-style:preserve-3d;transition:all var(--anim--hover-time) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-shadow{--shadow-cuttoff-fix:1.5em;position:absolute;width:calc(100% + var(--shadow-cuttoff-fix));height:calc(100% + var(--shadow-cuttoff-fix));top:calc(0% - var(--shadow-cuttoff-fix) / 2);left:calc(0% - var(--shadow-cuttoff-fix) / 2);filter:blur(clamp(2px,.14em,10px));overflow:visible;pointer-events:none}
.toll-dialog .lg-pill-cta-shadow::after{content:"";position:absolute;z-index:0;inset:0;border-radius:999vw;background:linear-gradient(180deg,rgba(0,0,0,.24),rgba(0,0,0,.10));width:calc(100% - var(--shadow-cuttoff-fix) - .14em);height:calc(100% - var(--shadow-cuttoff-fix) - .14em);top:calc(var(--shadow-cuttoff-fix) / 2 + .26em);left:calc(var(--shadow-cuttoff-fix) / 2 + .06em);padding:.125em;box-sizing:border-box;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim--hover-time) var(--anim--hover-ease);overflow:visible;opacity:.92}
[data-theme="dark"] .toll-dialog .lg-pill-cta-shadow::after{background:linear-gradient(180deg,rgba(0,0,0,.52),rgba(0,0,0,.28))}
.toll-dialog .lg-pill-cta-btn{--border-width:clamp(1px,.085em,1.5px);all:unset;cursor:pointer;position:relative;display:inline-flex;align-items:center;justify-content:center;-webkit-tap-highlight-color:rgba(0,0,0,0);-webkit-touch-callout:none;user-select:none;-webkit-user-select:none;touch-action:none;pointer-events:auto;z-index:3;border-radius:999vw;background-color:rgba(244,245,247,.80);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.09) 100%);box-shadow:inset 0 1px 1px rgba(255,255,255,.40),inset 0 0 10px 2px rgba(255,255,255,.12),inset 0 -1px 2px rgba(0,0,0,.06),0 4px 12px -2px rgba(0,0,0,.14),0 0 0 1px inset rgba(255,255,255,.28);-webkit-backdrop-filter:blur(18px) saturate(.95);backdrop-filter:blur(18px) saturate(.95);transition:all var(--anim--hover-time) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:3px}
.toll-dialog .lg-pill-cta-btn:disabled{opacity:.42;cursor:not-allowed;filter:grayscale(.25)}
.toll-dialog .lg-pill-cta-btn:not(:disabled):hover{transform:scale(.98);background-color:rgba(248,249,251,.86);-webkit-backdrop-filter:blur(16px) saturate(.98);backdrop-filter:blur(16px) saturate(.98);box-shadow:inset 0 1px 1px rgba(255,255,255,.46),inset 0 0 12px 3px rgba(255,255,255,.15),inset 0 -1px 2px rgba(0,0,0,.07),0 3px 8px -2px rgba(0,0,0,.16),0 0 0 1px inset rgba(255,255,255,.36)}
.toll-dialog .lg-pill-cta-label{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:5px;height:42px;padding-inline:20px;user-select:none;letter-spacing:-.025em;font-weight:780;font-size:14px;line-height:1;white-space:nowrap;color:rgba(32,33,36,.94);text-shadow:0 1px 0 rgba(255,255,255,.30);transition:all var(--anim--hover-time) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-chevron{flex:none;transition:transform var(--anim--hover-time) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-btn:not(:disabled):hover .lg-pill-cta-chevron{transform:translateX(2px)}
.toll-dialog .lg-pill-cta-btn:not(:disabled):hover .lg-pill-cta-label{text-shadow:0 1px 0 rgba(255,255,255,.38)}
.toll-dialog .lg-pill-cta-label::after{content:"";display:block;position:absolute;width:calc(100% - var(--border-width));height:calc(100% - var(--border-width));top:calc(0% + var(--border-width) / 2);left:calc(0% + var(--border-width) / 2);box-sizing:border-box;border-radius:999vw;overflow:clip;background:linear-gradient(var(--angle-2),rgba(255,255,255,0) 0%,rgba(255,255,255,.09) 28%,rgba(255,255,255,.17) 46% 54%,rgba(255,255,255,0) 72%);z-index:3;mix-blend-mode:screen;pointer-events:none;background-size:200% 200%;background-position:0% 50%;background-repeat:no-repeat;transition:background-position calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease),--angle-2 calc(var(--anim--hover-time) * 1.25) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-btn:not(:disabled):hover .lg-pill-cta-label::after{background-position:28% 50%}
.toll-dialog .lg-pill-cta-btn:not(:disabled):active .lg-pill-cta-label::after,.toll-dialog .lg-pill-cta-btn:not(:disabled).is-pressed .lg-pill-cta-label::after{background-position:54% 15%;--angle-2:-15deg}
.toll-dialog .lg-pill-cta-btn::after{content:"";position:absolute;z-index:1;inset:0;border-radius:999vw;width:calc(100% + var(--border-width));height:calc(100% + var(--border-width));top:calc(0% - var(--border-width) / 2);left:calc(0% - var(--border-width) / 2);padding:var(--border-width);box-sizing:border-box;background:conic-gradient(from var(--angle-1) at 50% 50%,rgba(0,0,0,.06),rgba(0,0,0,0) 8% 40%,rgba(0,0,0,.06) 50%,rgba(0,0,0,0) 60% 92%,rgba(0,0,0,.06)),linear-gradient(180deg,rgba(255,255,255,.22),rgba(226,228,232,.12));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude;transition:all var(--anim--hover-time) var(--anim--hover-ease),--angle-1 500ms ease;box-shadow:inset 0 0 0 calc(var(--border-width) / 2) var(--toll-btn-inset-rim);pointer-events:none}
.toll-dialog .lg-pill-cta-btn:not(:disabled):hover::after{--angle-1:-125deg}
.toll-dialog .lg-pill-cta-btn:not(:disabled):active::after,.toll-dialog .lg-pill-cta-btn:not(:disabled).is-pressed::after{--angle-1:-75deg}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):hover) .lg-pill-cta-shadow{filter:blur(clamp(1.5px,.06em,5px));transition:filter var(--anim--hover-time) var(--anim--hover-ease)}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):hover) .lg-pill-cta-shadow::after{top:calc(var(--shadow-cuttoff-fix) / 2 + .18em);opacity:1}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):active),.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled).is-pressed){transform:rotate3d(1,0,0,22deg)}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):active) .lg-pill-cta-btn,.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled).is-pressed) .lg-pill-cta-btn{transform:scale(.975);box-shadow:inset 0 .125em .125em rgba(0,0,0,.08),inset 0 -.125em .125em rgba(255,255,255,.32),0 2px 6px -1px rgba(0,0,0,.16),0 0 0 1px inset rgba(255,255,255,.24)}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):active) .lg-pill-cta-shadow,.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled).is-pressed) .lg-pill-cta-shadow{filter:blur(clamp(2px,.125em,10px))}
.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled):active) .lg-pill-cta-shadow::after,.toll-dialog .lg-pill-cta-wrap:has(.lg-pill-cta-btn:not(:disabled).is-pressed) .lg-pill-cta-shadow::after{top:calc(var(--shadow-cuttoff-fix) / 2 + .14em);opacity:.72}
.toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-label{padding-inline:22px;font-weight:820;color:rgba(28,29,32,.96);text-shadow:0 1px 0 rgba(255,255,255,.34)}
.toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn{background-color:rgba(232,234,238,.86);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(232,234,238,.04) 56%,rgba(212,214,220,.11) 100%);-webkit-backdrop-filter:blur(20px) saturate(.92);backdrop-filter:blur(20px) saturate(.92);box-shadow:inset 0 1px 1px rgba(255,255,255,.24),inset 0 0 12px 2px rgba(255,255,255,.09),inset 0 -1px 2px rgba(0,0,0,.06),0 5px 14px -2px rgba(0,0,0,.14),0 0 0 1px inset var(--toll-btn-inset-rim)}
.toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn::after{background:conic-gradient(from var(--angle-1) at 50% 50%,rgba(0,0,0,.06),rgba(0,0,0,0) 8% 40%,rgba(0,0,0,.06) 50%,rgba(0,0,0,0) 60% 92%,rgba(0,0,0,.06)),linear-gradient(180deg,rgba(255,255,255,.22),rgba(224,226,230,.12));box-shadow:inset 0 0 0 calc(var(--border-width) / 2) var(--toll-btn-inset-rim)}
.toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn:not(:disabled):hover{background-color:rgba(238,240,243,.90);-webkit-backdrop-filter:blur(18px) saturate(.95);backdrop-filter:blur(18px) saturate(.95);box-shadow:inset 0 1px 1px rgba(255,255,255,.28),inset 0 0 14px 3px rgba(255,255,255,.11),inset 0 -1px 2px rgba(0,0,0,.06),0 3px 9px -2px rgba(0,0,0,.16),0 0 0 1px inset var(--toll-btn-inset-rim)}
.toll-dialog .lg-pill-cta-wrap.is-save:has(.lg-pill-cta-btn:not(:disabled):active) .lg-pill-cta-btn,.toll-dialog .lg-pill-cta-wrap.is-save:has(.lg-pill-cta-btn:not(:disabled).is-pressed) .lg-pill-cta-btn{transform:scale(.975);box-shadow:inset 0 .14em .125em rgba(0,0,0,.10),inset 0 -.125em .125em rgba(255,255,255,.34),0 2px 6px -1px rgba(0,0,0,.16),0 0 0 1px inset rgba(255,255,255,.26)}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-btn{background-color:rgba(243,242,240,.82);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,235,233,.04) 56%,rgba(220,219,216,.09) 100%)}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-btn:not(:disabled):hover{background-color:rgba(247,246,244,.88)}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-label{color:#26221e}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn{background-color:rgba(232,231,229,.87);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(232,231,229,.04) 56%,rgba(214,213,210,.11) 100%)}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn:not(:disabled):hover{background-color:rgba(238,237,235,.91)}
[data-theme="sepia"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-label{color:rgba(30,29,28,.95);text-shadow:0 1px 0 rgba(255,255,255,.34)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-btn{background-color:rgba(236,238,242,.80);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(236,238,242,.04) 56%,rgba(210,212,218,.11) 100%);-webkit-backdrop-filter:blur(18px) saturate(.95);backdrop-filter:blur(18px) saturate(.95);box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 0 10px 2px rgba(255,255,255,.08),inset 0 -1px 2px rgba(0,0,0,.10),0 6px 16px -2px rgba(0,0,0,.40),0 0 0 1px inset var(--toll-btn-inset-rim)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-btn:not(:disabled):hover{background-color:rgba(242,244,247,.86);-webkit-backdrop-filter:blur(16px) saturate(.98);backdrop-filter:blur(16px) saturate(.98);box-shadow:inset 0 1px 1px rgba(255,255,255,.26),inset 0 0 12px 3px rgba(255,255,255,.10),inset 0 -1px 2px rgba(0,0,0,.10),0 4px 12px -2px rgba(0,0,0,.44),0 0 0 1px inset rgba(255,255,255,.16)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-label{color:#1e1f23;text-shadow:0 1px 0 rgba(255,255,255,.28)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-next .lg-pill-cta-btn::after{background:conic-gradient(from var(--angle-1) at 50% 50%,rgba(0,0,0,.06),rgba(0,0,0,0) 8% 40%,rgba(0,0,0,.06) 50%,rgba(0,0,0,0) 60% 92%,rgba(0,0,0,.06)),linear-gradient(180deg,rgba(255,255,255,.20),rgba(226,228,232,.12));box-shadow:inset 0 0 0 calc(var(--border-width) / 2) var(--toll-btn-inset-rim)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn{background-color:rgba(226,228,232,.85);background-image:linear-gradient(180deg,rgba(255,255,255,.14) 0%,rgba(226,228,232,.04) 56%,rgba(202,204,210,.11) 100%);-webkit-backdrop-filter:blur(20px) saturate(.92);backdrop-filter:blur(20px) saturate(.92);box-shadow:inset 0 1px 1px rgba(255,255,255,.22),inset 0 0 12px 2px rgba(255,255,255,.09),inset 0 -1px 2px rgba(0,0,0,.12),0 6px 16px -2px rgba(0,0,0,.44),0 0 0 1px inset var(--toll-btn-inset-rim)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn:not(:disabled):hover{background-color:rgba(232,234,238,.89)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-label{color:#16171a;text-shadow:0 1px 0 rgba(255,255,255,.28)}
[data-theme="dark"] .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-btn::after{background:conic-gradient(from var(--angle-1) at 50% 50%,rgba(0,0,0,.07),rgba(0,0,0,0) 8% 40%,rgba(0,0,0,.07) 50%,rgba(0,0,0,0) 60% 92%,rgba(0,0,0,.07)),linear-gradient(180deg,rgba(255,255,255,.20),rgba(224,226,230,.12));box-shadow:inset 0 0 0 calc(var(--border-width) / 2) var(--toll-btn-inset-rim)}
@media (hover:none) and (pointer:coarse){.toll-dialog .lg-pill-cta-label::after,.toll-dialog .lg-pill-cta-btn:active .lg-pill-cta-label::after,.toll-dialog .lg-pill-cta-btn.is-pressed .lg-pill-cta-label::after{--angle-2:-45deg}.toll-dialog .lg-pill-cta-btn::after,.toll-dialog .lg-pill-cta-btn:hover::after,.toll-dialog .lg-pill-cta-btn:active::after,.toll-dialog .lg-pill-cta-btn.is-pressed::after{--angle-1:-75deg}}
@media (prefers-reduced-motion:reduce){.toll-dialog .lg-pill-cta-wrap,.toll-dialog .lg-pill-cta-shadow::after,.toll-dialog .lg-pill-cta-btn,.toll-dialog .lg-pill-cta-btn::after,.toll-dialog .lg-pill-cta-label,.toll-dialog .lg-pill-cta-label::after,.toll-dialog .lg-pill-cta-chevron{transition:none}}
@media (max-width:960px){
  .toll-dialog .workspace{grid-template-columns:minmax(250px,39%) minmax(0,1fr)}
  .toll-dialog .alarm-card{grid-template-columns:30px minmax(100px,1fr) auto;gap:8px}
  .toll-dialog .clock-control{grid-column:2;justify-self:start;margin-top:2px}
  .toll-dialog .card-right-actions{grid-column:3;grid-row:1 / span 2}
  .toll-dialog .interval-row{margin-left:12px;flex-wrap:wrap}
  .toll-dialog .interval-copy{width:100%}
  .toll-dialog .interval-actions{width:100%;justify-content:flex-end}
}
@media (max-width:760px){
  .toll-dialog .area-cards-grid{grid-template-columns:1fr}
}
@media (max-width:680px){
  #builderModalBackdrop{padding:8px}
  .toll-dialog{width:100%;height:100%;border-radius:20px}
  .toll-dialog .builder-stepper{padding:8px 10px;gap:5px}
  .toll-dialog .builder-step-tab{flex-direction:column;align-items:flex-start;gap:4px;padding:7px 9px;font-size:11.5px;border-radius:12px}
  .toll-dialog .builder-step-tab .step-badge{width:22px;height:22px;font-size:11px}
  .toll-dialog .builder-step-body{padding:12px 12px 96px}
  .toll-dialog .quickbar.quickbar-step{padding:0 0 20px;gap:8px}
  .toll-dialog .quickbar.quickbar-step .quick-line{padding:10px 11px;border-radius:15px}
  .toll-dialog .workspace{display:flex;flex-direction:column}
  .toll-dialog .left-pane{flex:0 0 38%;border-right:0;border-bottom:1px solid var(--toll-line);padding:11px 12px 10px}
  .toll-dialog .right-pane{flex:1 1 auto;padding:11px 12px 86px}
  .toll-dialog .left-pane.step-single-pane,.toll-dialog .right-pane.step-single-pane{flex:none;border-bottom:0;padding:0}
  .toll-dialog .dialog-footer{padding:8px 12px;flex-wrap:wrap}
  .toll-dialog .footer-actions{flex-wrap:wrap;justify-content:flex-end;gap:6px}
  .toll-dialog .footer-btn{height:38px;padding:0 15px;font-size:12px}
  .toll-dialog .lg-pill-cta-label{height:38px;padding-inline:16px;font-size:12.5px}
  .toll-dialog .lg-pill-cta-wrap.is-save .lg-pill-cta-label{padding-inline:18px}
}

/* ---------- 자주 쓰는 타종 구성 (Bookmarks) ---------- */
.bookmark-drawer-card{
  position:relative;
  overflow:hidden;
  isolation:isolate;
  border-radius:18px;
  border:1px solid var(--glass-rim);
  background:var(--glass-fill);
  box-shadow:var(--btn-shadow);
  -webkit-backdrop-filter:blur(14px) saturate(1.38) contrast(1.02);
  backdrop-filter:blur(14px) saturate(1.38) contrast(1.02);
  padding:10px 12px;
  display:none;
  flex-direction:column;
  gap:8px;
  width:312px;
  max-width:calc(100vw - 44px);
}
.bookmark-drawer-card.open{display:flex}
.bookmark-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:6px}
.bookmark-drawer-head-actions{display:inline-flex;align-items:center;gap:4px;flex:none}
.bookmark-drawer-title{font-size:11.5px;font-weight:750;letter-spacing:-.02em;color:var(--ink);opacity:.9}
.bookmark-add-toggle{border:1px solid var(--btn-rim);background:rgba(255,255,255,.22);color:var(--btn);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer;touch-action:none;-webkit-touch-callout:none;transition:background .18s ease,transform .16s ease}
.bookmark-add-toggle:active,.bookmark-add-toggle.is-pressed{transform:scale(.96)}
.bookmark-save-block{display:none;flex-direction:column;gap:5px}
.bookmark-save-block.open{display:flex}
.bookmark-save-row{display:none;align-items:center;gap:6px}
.bookmark-save-row.open{display:flex}
.bookmark-name-input{flex:1;min-width:0;height:30px;border-radius:999px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.32);color:var(--ink);padding:0 11px;font-size:11.5px;font-weight:600;outline:none}
[data-theme="dark"] .bookmark-name-input{background:rgba(255,255,255,.07)}
.bookmark-save-btn{flex:none;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--btn-rim);background:rgba(255,255,255,.36);color:var(--ink);font-size:11px;font-weight:750;cursor:pointer;touch-action:none;-webkit-touch-callout:none;transition:background .16s ease,transform .16s ease}
.bookmark-save-btn:active,.bookmark-save-btn.is-pressed{transform:scale(.96)}
[data-theme="dark"] .bookmark-save-btn{background:rgba(255,255,255,.14)}
.bookmark-pill-list{display:flex;flex-direction:column;gap:6px;max-height:224px;overflow-y:auto;scrollbar-width:thin}
.bookmark-empty-hint{font-size:11px;color:var(--modal-muted);padding:4px 2px}
.bookmark-pill-item{display:flex;align-items:center;justify-content:space-between;gap:6px;border-radius:999px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.18);padding:3px 5px 3px 11px}
[data-theme="dark"] .bookmark-pill-item{background:rgba(255,255,255,.05)}
.bookmark-pill-apply{flex:1;min-width:0;border:none;background:transparent;color:var(--btn);padding:4px 0;display:flex;align-items:center;justify-content:space-between;gap:6px;text-align:left;cursor:pointer}
.bookmark-pill-name{font-size:11.5px;font-weight:680;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bookmark-pill-count{flex:none;font-size:10px;font-weight:650;opacity:.65;font-variant-numeric:tabular-nums}
.bookmark-pill-del{flex:none;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,.06);color:var(--btn);font-size:12px;font-weight:700;cursor:pointer}
[data-theme="dark"] .bookmark-pill-del{background:rgba(255,255,255,.08)}

/* ---------- Boot Readiness Gate (Zero-Flash Reveal) ---------- */
#c,#ui,#topLeftMenu,#topRightMenu,#bottomLeftMenu,#dock{transition:opacity .24s ease}
html:not(.app-ready) #c,
html:not(.app-ready) #ui,
html:not(.app-ready) #topLeftMenu,
html:not(.app-ready) #topRightMenu,
html:not(.app-ready) #bottomLeftMenu,
html:not(.app-ready) #dock,
html:not(.app-ready) #rightTimetablePanel,
html:not(.app-ready) #playbackSettingsPanel{
  opacity:0 !important;
  visibility:hidden !important;
  pointer-events:none !important;
}

/* ---------- Top-Right List Button & Collapsible CSAT Timetable Panel ---------- */
#topRightMenu{
  position:fixed;
  top:calc(env(safe-area-inset-top,0px) + 18px);
  right:18px;
  z-index:36;
  display:flex;
  align-items:center;
  gap:8px;
}
#timetableToggleBtn{
  width:44px;
  height:44px;
  padding:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  letter-spacing:0;
}
#timetableToggleBtn.is-selected{
  border-color:var(--btn-rim-active);
  box-shadow:var(--btn-shadow-hover);
}
#rightTimetablePanel{
  position:fixed;
  top:calc(env(safe-area-inset-top,0px) + 72px);
  right:18px;
  bottom:calc(env(safe-area-inset-bottom,0px) + 18px);
  width:min(410px,max(320px,34vw));
  z-index:32;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border-radius:22px;
  border:1px solid var(--toll-line);
  background:var(--tt-panel-bg,var(--toll-glass));
  box-shadow:var(--toll-glass-shadow);
  -webkit-backdrop-filter:blur(28px) saturate(180%);
  backdrop-filter:blur(28px) saturate(180%);
  color:var(--toll-ink);
  word-break:keep-all;
  overflow-wrap:break-word;
  font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,"Pretendard Variable","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  transform:translate3d(calc(100% + 28px),0,0);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:transform .38s cubic-bezier(.22,1,.36,1),opacity .26s ease,visibility .38s;
}
#rightTimetablePanel.open{
  transform:translate3d(0,0,0);
  opacity:1;
  visibility:visible;
  pointer-events:auto;
}
#rightTimetablePanel::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(180deg,rgba(255,255,255,.16),transparent 24%);
  opacity:.72;
}
[data-theme="dark"] #rightTimetablePanel::before{
  background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 24%);
}
#rightTimetablePanel > *{position:relative;z-index:1}
.rt-head{
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:14px 16px 12px;
  border-bottom:1px solid var(--toll-line);
  background:transparent;
}
[data-theme="dark"] .rt-head{background:transparent}
.rt-head-title-group{display:flex;align-items:baseline;gap:8px;min-width:0}
.rt-title{margin:0;font-family:"SF Pro Display",-apple-system,BlinkMacSystemFont,"Pretendard Variable","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;font-size:15px;font-weight:600;letter-spacing:-.025em;color:var(--toll-ink);white-space:nowrap}
.rt-count-meta{font-size:11.5px;font-weight:400;letter-spacing:-.015em;color:var(--toll-muted);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-head-actions{display:flex;align-items:center;gap:6px;flex:none}
.rt-arrow-btn{
  width:28px;height:28px;border-radius:50%;
  border:1px solid var(--toll-line);
  background:var(--toll-pill);
  color:var(--toll-ink);
  display:inline-flex;align-items:center;justify-content:center;
  cursor:pointer;
  touch-action:none;
  -webkit-touch-callout:none;
  transition:background .16s ease,transform .2s var(--ease),border-color .16s ease;
}
.rt-arrow-btn:hover{background:var(--toll-pill-hover)}
.rt-arrow-btn:active,.rt-arrow-btn.is-pressed{transform:scale(.95)}
.rt-arrow-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rt-arrow-btn svg{transition:transform .24s var(--ease)}
.rt-arrow-btn.is-collapsed svg{transform:rotate(180deg)}
.rt-options-outer{
  flex:none;
  display:grid;
  grid-template-rows:1fr;
  transition:grid-template-rows .26s var(--ease),opacity .2s ease;
  opacity:1;
}
.rt-options-outer.is-collapsed{grid-template-rows:0fr;opacity:0;pointer-events:none}
.rt-options-inner{overflow:hidden}
.rt-options-bar{
  padding:10px 14px 11px;
  border-bottom:1px solid var(--toll-line);
  background:transparent;
  display:flex;flex-direction:column;gap:8px;
}
[data-theme="dark"] .rt-options-bar{background:transparent}
@keyframes rtMetaFade{from{opacity:0;transform:translate3d(0,3px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
.rt-count-meta.is-animating{animation:rtMetaFade .24s cubic-bezier(.22,1,.36,1)}
.rt-mode-seg{
  position:relative;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:3px;
  border-radius:12px;border:1px solid transparent;background:rgba(118,118,128,.12);
}
[data-theme="dark"] .rt-mode-seg{background:rgba(118,118,128,.22)}
.rt-mode-glider{
  position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 5px);
  border-radius:9px;border:.5px solid rgba(0,0,0,.05);background:rgba(255,255,255,.92);
  box-shadow:0 2px 6px rgba(0,0,0,.08);pointer-events:none;z-index:0;
  transform:translate3d(0,0,0);
  transition:transform .34s cubic-bezier(.22,1,.36,1),background .2s ease,border-color .2s ease;
}
.rt-mode-seg.is-selected-tab .rt-mode-glider{transform:translate3d(calc(100% + 4px),0,0)}
[data-theme="dark"] .rt-mode-glider{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.12);box-shadow:0 2px 8px rgba(0,0,0,.28)}
.rt-mode-btn{
  position:relative;z-index:1;border:1px solid transparent;background:transparent;color:var(--toll-muted);
  border-radius:9px;padding:7px 8px;font-size:12px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;touch-action:none;-webkit-touch-callout:none;line-height:1.25;text-align:center;white-space:nowrap;
  transition:color .22s ease,transform .14s ease;
}
.rt-mode-btn:active,.rt-mode-btn.is-pressed{transform:scale(.96)}
.rt-mode-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:1px}
.rt-mode-btn.active{color:var(--toll-ink)}
[data-theme="dark"] .rt-mode-btn.active{color:#f5f5f7}
.rt-sub-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rt-sub-hint{font-size:11px;font-weight:400;color:var(--toll-muted);letter-spacing:-.015em}
.rt-edit-seq-btn{
  flex:none;border:1px solid var(--toll-line);background:var(--toll-pill);color:var(--toll-ink);
  border-radius:999px;padding:5px 11px;font-size:11px;font-weight:600;letter-spacing:-.015em;
  cursor:pointer;touch-action:none;-webkit-touch-callout:none;white-space:nowrap;transition:background .16s ease,transform .14s ease;
}
.rt-edit-seq-btn:hover{background:var(--toll-pill-hover)}
.rt-edit-seq-btn:active,.rt-edit-seq-btn.is-pressed{transform:scale(.95)}
.rt-edit-seq-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rt-scroll-list{
  flex:1 1 auto;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;
  padding:10px 12px 14px;
  scrollbar-width:thin;scrollbar-color:var(--toll-scroll) transparent;
}
@keyframes rtSwitchFromRight{from{opacity:0;transform:translate3d(18px,0,0)}to{opacity:1;transform:translate3d(0,0,0)}}
@keyframes rtSwitchFromLeft{from{opacity:0;transform:translate3d(-18px,0,0)}to{opacity:1;transform:translate3d(0,0,0)}}
.rt-list-stage{display:flex;flex-direction:column;gap:6px}
.rt-list-stage.anim-to-selected{animation:rtSwitchFromRight .3s cubic-bezier(.22,1,.36,1)}
.rt-list-stage.anim-to-all{animation:rtSwitchFromLeft .3s cubic-bezier(.22,1,.36,1)}
.rt-item-btn{
  position:relative;overflow:hidden;
  width:100%;text-align:left;
  border:1px solid var(--toll-line);
  background:rgba(255,255,255,.36);
  box-shadow:none;
  border-radius:14px;padding:10px 12px;min-height:50px;
  display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;
  cursor:pointer;color:var(--toll-ink);
  transition:
    background .24s cubic-bezier(.22,1,.36,1),
    border-color .24s cubic-bezier(.22,1,.36,1),
    transform .2s cubic-bezier(.22,1,.36,1),
    box-shadow .24s cubic-bezier(.22,1,.36,1);
}
.rt-item-btn::before{
  content:"";
  position:absolute;
  inset:0;
  border-radius:inherit;
  pointer-events:none;
  opacity:0;
  transform:scale(.98);
  background:rgba(29,29,31,.045);
  transition:
    opacity .28s cubic-bezier(.22,1,.36,1),
    transform .28s cubic-bezier(.22,1,.36,1);
}
.rt-item-btn > *{position:relative;z-index:1}
.rt-item-btn:hover{background:rgba(255,255,255,.62);border-color:rgba(0,0,0,.12)}
.rt-item-btn:active,.rt-item-btn.is-pressed{transform:scale(.985)}
.rt-item-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.rt-item-btn.is-current,
.rt-item-btn.is-current:hover{
  border-color:rgba(29,29,31,.16);
  background:rgba(255,255,255,.78);
  box-shadow:0 4px 14px rgba(0,0,0,.06);
}
.rt-item-btn.is-current::before{opacity:1;transform:scale(1)}
[data-theme="dark"] .rt-item-btn{
  border-color:rgba(255,255,255,.08);
  background:rgba(255,255,255,.045);
  box-shadow:none;
}
[data-theme="dark"] .rt-item-btn::before{
  background:rgba(255,255,255,.04);
}
[data-theme="dark"] .rt-item-btn:hover{background:rgba(255,255,255,.085);border-color:rgba(255,255,255,.14)}
[data-theme="dark"] .rt-item-btn.is-current,
[data-theme="dark"] .rt-item-btn.is-current:hover{
  border-color:rgba(255,255,255,.18);
  background:rgba(255,255,255,.12);
  box-shadow:0 6px 18px rgba(0,0,0,.28);
}
[data-theme="sepia"] .rt-item-btn.is-current{border-color:rgba(54,41,30,.18);background:rgba(255,250,240,.72)}
.rt-item-idx{
  min-width:26px;height:26px;padding:0 5px;border-radius:8px;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:10.5px;font-weight:600;font-variant-numeric:tabular-nums;
  color:var(--toll-ink-2);background:var(--toll-glass-inner);border:1px solid var(--toll-line);
  transition:
    background .26s cubic-bezier(.22,1,.36,1),
    color .26s cubic-bezier(.22,1,.36,1),
    border-color .26s cubic-bezier(.22,1,.36,1),
    transform .28s cubic-bezier(.22,1,.36,1);
}
.rt-item-btn.is-current .rt-item-idx{
  background:#1d1d1f;
  color:#fff;
  border-color:transparent;
  box-shadow:none;
  transform:scale(1.04);
}
[data-theme="dark"] .rt-item-btn.is-current .rt-item-idx{
  background:#f5f5f7;
  color:#1d1d1f;
  border-color:transparent;
  box-shadow:none;
}
.rt-item-main{min-width:0;display:flex;flex-direction:column;gap:2px}
.rt-item-title{font-size:12.5px;font-weight:600;letter-spacing:-.02em;color:var(--toll-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-item-sub{font-size:10.5px;font-weight:400;line-height:1.38;color:var(--toll-muted);letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-item-time{flex:none;text-align:right;font-size:11px;font-weight:600;font-variant-numeric:tabular-nums;font-family:"SF Pro Text",ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--toll-ink-2)}
.rt-empty-box{
  padding:28px 16px;border-radius:16px;border:1px dashed var(--toll-line);background:var(--toll-glass-soft);
  text-align:center;display:flex;flex-direction:column;align-items:center;gap:10px;
  font-size:11.5px;line-height:1.55;color:var(--toll-muted);
}
@media (max-width:719px){
  #topRightMenu{right:12px;top:calc(env(safe-area-inset-top,0px) + 14px)}
  #topLeftMenu{left:12px;top:calc(env(safe-area-inset-top,0px) + 14px)}
  #timetableToggleBtn{width:40px;height:40px;padding:0}
  #hamburgerBtn{width:40px;height:40px}
  #fullscreenBtn{width:36px;height:36px}
  #rightTimetablePanel{
    top:auto;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);
    width:auto;height:var(--tt-mobile-h,43dvh);border-radius:22px;
    transform:translate3d(0,calc(100% + 26px),0);
  }
  #rightTimetablePanel.open{transform:translate3d(0,0,0)}
  .rt-head{padding:10px 14px 9px}
  .rt-options-bar{padding:8px 12px 9px;gap:6px}
  .rt-scroll-list{padding:8px 10px 12px}
  .rt-item-btn{padding:8px 10px;min-height:46px}
}
/* P0 ~ P3 Integrated Styles */
#runTouchZone{position:relative;display:flex;align-items:center;justify-content:center;padding:58px 64px 20px;margin:-58px -64px -20px;border-radius:48px;background:rgba(255,255,255,.001);pointer-events:none;touch-action:manipulation}
#runTouchZone.is-running{pointer-events:auto;cursor:pointer}
.run-aux-btn{position:absolute;width:40px;height:40px;padding:0;border-radius:50%;border:1px solid var(--btn-rim);background:var(--glass-fill);box-shadow:var(--btn-shadow);-webkit-backdrop-filter:blur(14px) saturate(150%);backdrop-filter:blur(14px) saturate(150%);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;pointer-events:none;z-index:15;transition:opacity .24s var(--ease),transform .26s var(--spring),visibility .24s,background .16s ease,border-color .16s ease}
.run-aux-btn.pos-left{right:calc(100% + 12px);top:50%;transform:translateY(-50%) scale(.9)}
.run-aux-btn.pos-right{left:calc(100% + 12px);top:50%;transform:translateY(-50%) scale(.9)}
.run-aux-btn.pos-top-center{left:50%;bottom:calc(100% + 10px);transform:translateX(-50%) scale(.9)}
#runTouchZone.is-revealed .run-aux-btn{opacity:1;visibility:visible;pointer-events:auto;touch-action:none;-webkit-touch-callout:none}
#runTouchZone.is-revealed .run-aux-btn.pos-left{transform:translateY(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-right{transform:translateY(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-top-center{transform:translateX(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-left:hover:not(:disabled){transform:translateY(-50%) scale(1.06);background:rgba(255,255,255,.42)}
#runTouchZone.is-revealed .run-aux-btn.pos-right:hover:not(:disabled){transform:translateY(-50%) scale(1.06);background:rgba(255,255,255,.42)}
#runTouchZone.is-revealed .run-aux-btn.pos-top-center:hover:not(:disabled){transform:translateX(-50%) scale(1.06);background:rgba(255,255,255,.42)}
[data-theme="dark"] #runTouchZone.is-revealed .run-aux-btn:hover:not(:disabled){background:rgba(255,255,255,.16)}
#runTouchZone.is-revealed .run-aux-btn.pos-left:active:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-left.is-pressed:not(:disabled){transform:translateY(-50%) scale(.94)}
#runTouchZone.is-revealed .run-aux-btn.pos-right:active:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-right.is-pressed:not(:disabled){transform:translateY(-50%) scale(.94)}
#runTouchZone.is-revealed .run-aux-btn.pos-top-center:active:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-top-center.is-pressed:not(:disabled){transform:translateX(-50%) scale(.94)}
#runTouchZone.is-revealed .run-aux-btn:disabled{opacity:.36;cursor:not-allowed}
@media (max-width:358px),(max-width:420px) and (max-aspect-ratio:44/100){
  #runTouchZone{padding:58px 20px 20px;margin:-58px -20px -20px}
  .run-aux-btn.pos-left{left:0;right:auto;top:auto;bottom:calc(100% + 10px);transform:scale(.9)}
  .run-aux-btn.pos-right{right:0;left:auto;top:auto;bottom:calc(100% + 10px);transform:scale(.9)}
  #runTouchZone.is-revealed .run-aux-btn.pos-left,#runTouchZone.is-revealed .run-aux-btn.pos-right{transform:scale(1)}
  #runTouchZone.is-revealed .run-aux-btn.pos-left:hover:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-right:hover:not(:disabled){transform:scale(1.06)}
  #runTouchZone.is-revealed .run-aux-btn.pos-left:active:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-left.is-pressed:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-right:active:not(:disabled),#runTouchZone.is-revealed .run-aux-btn.pos-right.is-pressed:not(:disabled){transform:scale(.94)}
}
.dock-status-badges{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);transform:translate3d(calc(-50% + var(--tt-shift-x,0px)),var(--dock-shift-y,0px),0);z-index:23;display:flex;align-items:center;gap:6px;pointer-events:auto;transition:transform .52s cubic-bezier(.22,1,.36,1)}
.status-pill-badge{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:999px;background:var(--toll-pill);border:1px solid var(--toll-glass-edge);color:var(--toll-ink);font-size:11px;font-weight:700;backdrop-filter:blur(12px)}
.status-pill-badge button{appearance:none;border:none;background:transparent;color:inherit;font-size:11px;font-weight:800;cursor:pointer;padding:0 2px;text-decoration:underline}
.drawer-card-panel{width:280px;max-width:calc(100vw - 44px);padding:12px 14px;border-radius:18px;display:flex;flex-direction:column;gap:8px;overflow:visible}
.drawer-card-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:600;letter-spacing:-.02em;color:var(--modal-muted)}
.ui-option-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px;font-size:12px;font-weight:600;letter-spacing:-.015em;color:var(--toll-ink);cursor:pointer}
.ui-option-toggle-row .ui-opt-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.ui-option-toggle-row .ui-opt-sub{font-size:10.5px;font-weight:400;opacity:.72;line-height:1.42;white-space:normal}
.ui-option-toggle-row input[type="checkbox"]{width:16px;height:16px;accent-color:#0066cc;cursor:pointer;flex-shrink:0}
[data-theme="dark"] .ui-option-toggle-row input[type="checkbox"]{accent-color:#2997ff}
.vol-control-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:700;color:var(--toll-ink)}
.vol-slider-wrap{display:flex;align-items:center;gap:6px;flex:1;justify-content:flex-end}
.vol-slider-wrap input[type="range"]{--slider-fill:rgba(28,28,30,.78);--slider-track:rgba(28,28,30,.16);-webkit-appearance:none;appearance:none;width:108px;height:6px;border-radius:999px;background:linear-gradient(90deg,var(--slider-fill) 0%,var(--slider-fill) var(--slider-pct,100%),var(--slider-track) var(--slider-pct,100%),var(--slider-track) 100%);box-shadow:inset 0 1px 2px rgba(0,0,0,.12),0 1px 0 rgba(255,255,255,.55);cursor:pointer;outline:none;margin:0;padding:0}
[data-theme="dark"] .vol-slider-wrap input[type="range"]{--slider-fill:rgba(255,255,255,.88);--slider-track:rgba(255,255,255,.18);box-shadow:inset 0 1px 2px rgba(0,0,0,.38),0 1px 0 rgba(255,255,255,.08)}
[data-theme="sepia"] .vol-slider-wrap input[type="range"]{--slider-fill:rgba(54,41,30,.78);--slider-track:rgba(54,41,30,.16)}
.vol-slider-wrap input[type="range"]::-webkit-slider-runnable-track{height:6px;border-radius:999px;background:transparent}
.vol-slider-wrap input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:22px;height:14px;margin-top:-4px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(242,243,247,.92) 100%);border:1px solid rgba(255,255,255,.96);box-shadow:0 2px 6px rgba(0,0,0,.22),0 1px 2px rgba(0,0,0,.12),inset 0 1px 0 #fff;cursor:pointer;transition:transform .16s cubic-bezier(.22,1,.36,1),box-shadow .16s ease}
.vol-slider-wrap input[type="range"]:hover::-webkit-slider-thumb{transform:scale(1.06)}
.vol-slider-wrap input[type="range"]:active::-webkit-slider-thumb{transform:scale(1.12,1.06)}
.vol-slider-wrap input[type="range"]::-moz-range-track{height:6px;border-radius:999px;background:transparent}
.vol-slider-wrap input[type="range"]::-moz-range-thumb{width:22px;height:14px;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.98) 0%,rgba(242,243,247,.92) 100%);border:1px solid rgba(255,255,255,.96);box-shadow:0 2px 6px rgba(0,0,0,.22),0 1px 2px rgba(0,0,0,.12),inset 0 1px 0 #fff;cursor:pointer;transition:transform .16s cubic-bezier(.22,1,.36,1),box-shadow .16s ease}
.vol-pct{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;min-width:34px;text-align:right;color:var(--toll-muted)}
.sched-control-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sched-time-input{height:28px;padding:0 8px;border-radius:8px;border:1px solid var(--toll-glass-edge-low);background:var(--toll-pill);color:var(--toll-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600}
[data-theme="dark"] .sched-time-input{color-scheme:dark}
.bookmark-pill-item-col{display:flex;flex-direction:column;gap:4px;padding:6px 8px;border-radius:10px;background:var(--toll-glass-soft);border:1px solid var(--toll-line)}
.bookmark-pill-top{display:flex;align-items:center;justify-content:space-between;gap:6px}
.bookmark-pill-name-text{font-size:12px;font-weight:700;color:var(--toll-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bookmark-pill-actions{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.bm-act-btn{appearance:none;border:1px solid var(--btn-rim);background:var(--toll-pill);color:var(--toll-ink);border-radius:999px;height:22px;padding:0 8px;font-size:10.5px;font-weight:700;cursor:pointer}
.bm-act-btn:hover{background:var(--toll-pill-hover)}
.bm-act-btn.primary{background:var(--toll-button);border-color:var(--toll-button);color:#fff}
[data-theme="dark"] .bm-act-btn.primary{color:var(--toll-button-text);border-color:rgba(255,255,255,.28);background:linear-gradient(145deg,rgba(240,240,240,.96),rgba(205,205,205,.86))}
.bm-act-btn.is-active{background:rgba(255,255,255,.56);border-color:var(--btn-rim-active)}
.bm-act-btn.danger:hover{color:#e03131;border-color:rgba(224,49,49,.4)}
.bm-undo-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 8px;border-radius:8px;background:var(--toll-warn-bg);border:1px solid var(--toll-warn-line);font-size:11px;font-weight:700;color:var(--toll-warn)}
.bm-undo-bar button{appearance:none;border:none;background:var(--toll-button);color:var(--toll-button-text);border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer}
.bookmark-folder-select-row,.bookmark-move-row{display:flex;align-items:center;flex-wrap:wrap;gap:4px;padding-top:2px}
.bookmark-move-label{font-size:10px;font-weight:700;color:var(--modal-muted);margin-right:2px}
.bookmark-folder-tabs{display:flex;align-items:center;flex-wrap:wrap;gap:4px}
.bm-folder-pill{display:inline-flex;align-items:center;gap:3px;border:1px solid var(--btn-rim);background:rgba(255,255,255,.18);color:var(--ink);border-radius:999px;padding:3px 8px;font-size:10px;font-weight:680;cursor:pointer;transition:background .15s ease,border-color .15s ease}
.bm-folder-pill:hover{background:rgba(255,255,255,.34)}
.bm-folder-pill.is-active{background:rgba(255,255,255,.56);border-color:var(--btn-rim-active);font-weight:780}
[data-theme="dark"] .bm-folder-pill{background:rgba(255,255,255,.06)}
[data-theme="dark"] .bm-folder-pill:hover{background:rgba(255,255,255,.14)}
[data-theme="dark"] .bm-folder-pill.is-active{background:rgba(255,255,255,.24);border-color:var(--btn-rim-active)}
.bm-folder-icon{font-size:9.5px;line-height:1}
.bm-folder-cnt{opacity:.72;font-variant-numeric:tabular-nums}
.bookmark-folder-toolbar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 8px;border-radius:12px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.14)}
[data-theme="dark"] .bookmark-folder-toolbar{background:rgba(255,255,255,.05)}
.bookmark-folder-toolbar-name{font-size:10.5px;font-weight:740;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bookmark-folder-toolbar-actions{display:inline-flex;align-items:center;gap:4px;flex:none}
.bookmark-folder-group{display:flex;flex-direction:column;gap:4px;padding:5px 6px;border-radius:14px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.10)}
[data-theme="dark"] .bookmark-folder-group{background:rgba(255,255,255,.03)}
.bookmark-folder-group-head{display:flex;align-items:center;justify-content:space-between;gap:6px}
.bookmark-folder-group-toggle{flex:1;min-width:0;border:none;background:transparent;color:var(--ink);padding:2px 3px;display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:750;text-align:left;cursor:pointer}
.bookmark-folder-group-acts{display:inline-flex;align-items:center;gap:3px;flex:none}
.bookmark-folder-group-body{display:flex;flex-direction:column;gap:4px}
.toll-dialog .bookmark-modal-quickline{flex-direction:column;align-items:stretch;gap:8px}
.toll-dialog .bookmark-modal-folder-bar{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px}
.toll-dialog .bookmark-modal-folder-pills{display:flex;align-items:center;flex-wrap:wrap;gap:5px;flex:1;min-width:0}
.toll-dialog .bookmark-modal-folder-actions,.toll-dialog .bookmark-modal-folder-create,.toll-dialog .bookmark-modal-items-bar{display:flex;align-items:center;flex-wrap:wrap;gap:6px}
.toll-dialog .bookmark-folder-chip{padding:6px 12px;font-size:12px}
.toll-dialog .bookmark-modal-folder-tag{display:inline-block;margin-left:4px;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;background:rgba(0,0,0,.06);color:var(--toll-ink-2)}
[data-theme="dark"] .toll-dialog .bookmark-modal-folder-tag{background:rgba(255,255,255,.14);color:var(--toll-ink)}
.toll-dialog .bookmark-modal-move{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;border:none;background:rgba(0,0,0,.06);font-size:11.5px;line-height:1;padding:0;cursor:pointer}
.toll-dialog .bookmark-modal-move:hover,.toll-dialog .bookmark-modal-move.is-open{background:rgba(0,0,0,.16)}
[data-theme="dark"] .toll-dialog .bookmark-modal-move{background:rgba(255,255,255,.10)}
[data-theme="dark"] .toll-dialog .bookmark-modal-move:hover,[data-theme="dark"] .toll-dialog .bookmark-modal-move.is-open{background:rgba(255,255,255,.22)}
.toll-dialog .bookmark-modal-folder-select{height:33px;border-radius:999px;padding:0 11px;font-size:12.5px;font-weight:650}
.toll-dialog .bookmark-modal-move-bar{display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding-top:6px;border-top:1px dashed var(--toll-line)}
.preview-btn-wrap{position:relative;overflow:hidden}
.preview-progress-fill{position:absolute;left:0;top:0;bottom:0;background:rgba(255,255,255,.18);pointer-events:none;transition:width .1s linear}
.rt-item-wrap{display:flex;flex-direction:column;gap:4px}
.rt-row-card{display:flex;flex-direction:column;gap:4px}
.rt-row-actions{display:flex;flex-direction:column;gap:6px;padding:7px 9px;border-radius:12px;background:var(--toll-glass-soft);border:1px solid var(--toll-line)}
.rt-action-btn-row{display:flex;align-items:center;gap:5px;flex-wrap:wrap}
.rt-act-chip{appearance:none;border:1px solid var(--toll-glass-edge-low);background:var(--toll-pill);color:var(--toll-ink);border-radius:999px;height:25px;padding:0 9px;font-size:11px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:4px}
.rt-act-chip:hover{background:var(--toll-pill-hover)}
.rt-act-chip.primary{background:var(--toll-button);border-color:var(--toll-button);color:#fff}
[data-theme="dark"] .rt-act-chip.primary{color:var(--toll-button-text);border-color:rgba(255,255,255,.62);background:linear-gradient(145deg,rgba(240,240,240,.96),rgba(205,205,205,.86))}
.rt-step-info-box{display:flex;flex-direction:column;gap:4px;padding:7px 9px;border-radius:10px;background:var(--toll-glass-inner);border:1px solid var(--toll-line-soft);font-size:10.5px;color:var(--toll-ink-2)}
.rt-info-row{display:flex;align-items:center;justify-content:space-between;gap:8px;line-height:1.35}
.rt-info-label{font-weight:650;color:var(--toll-muted);flex-shrink:0}
.rt-info-val{font-weight:700;color:var(--toll-ink);text-align:right;word-break:keep-all}
.alarm-actions-col{display:flex;align-items:center;gap:6px;justify-content:flex-end}
[data-theme="light"] .theme-chip.active,[data-theme="light"] .sync-chip.active{background:rgba(255,255,255,.15)}
[data-theme="light"] .bookmark-add-toggle{background:rgba(255,255,255,.15)}
[data-theme="light"] .bookmark-name-input{background:rgba(255,255,255,.24)}
[data-theme="light"] .bookmark-save-btn{background:rgba(255,255,255,.28)}
[data-theme="light"] .bookmark-pill-item{background:rgba(255,255,255,.11)}
[data-theme="light"] .toll-dialog .dialog-header{background:transparent}
[data-theme="light"] .toll-dialog .builder-stepper{background:transparent}
[data-theme="light"] .toll-dialog .builder-step-tab{background-color:rgba(246,247,249,.72);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(216,218,224,.10) 100%)}
[data-theme="light"] .toll-dialog .builder-step-tab:hover{background-color:rgba(250,251,252,.84)}
[data-theme="light"] .toll-dialog .builder-step-tab.is-active{background-color:#e2e4e8;background-image:none}
[data-theme="light"] .toll-dialog .builder-step-tab.is-active:hover{background-color:#dcdfe4}
[data-theme="light"] .toll-dialog .builder-step-body{background:transparent}
[data-theme="light"] .toll-dialog .workspace{background:rgba(246,247,249,.34)}
[data-theme="light"] .toll-dialog .quickbar{background:rgba(244,245,247,.56)}
[data-theme="light"] .toll-dialog .quickbar.quickbar-step{background:transparent}
[data-theme="light"] .toll-dialog .quickbar.quickbar-step .quick-line{background-color:rgba(255,255,255,.14);background-image:none}
[data-theme="light"] .toll-dialog .dialog-footer{background:transparent}
[data-theme="light"] .toll-dialog .subj-auto-box{background:rgba(244,245,247,.74)}
[data-theme="light"] .toll-dialog .builder-select-sm{background-color:rgba(247,248,250,.84)}
[data-theme="light"] .toll-dialog .bookmark-modal-chip{background-color:rgba(244,245,247,.80)}
[data-theme="light"] .toll-dialog .bookmark-modal-input{background-color:rgba(247,248,250,.84)}
[data-theme="light"] .toll-dialog .left-tools-panel{background-color:rgba(244,245,247,.68);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.08) 100%)}
[data-theme="light"] .toll-dialog .builder-search-input{background-color:rgba(247,248,250,.84)}
[data-theme="light"] .toll-dialog .stage-type-chip{background-color:rgba(244,245,247,.80)}
[data-theme="light"] .toll-dialog .stage-type-chip:hover{background-color:rgba(248,249,251,.87)}
[data-theme="light"] .toll-dialog .area-card{background-color:rgba(244,245,247,.66);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.08) 100%)}
[data-theme="light"] .toll-dialog .stage-row{background-color:rgba(244,245,247,.72);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.09) 100%);border:none}
[data-theme="light"] .toll-dialog .stage-row:hover{background-color:rgba(248,249,251,.86)}
[data-theme="light"] .toll-dialog .stage-row.selected{background-color:rgba(228,230,235,.90);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(228,230,235,.04) 56%,rgba(208,210,216,.12) 100%);border:none}
[data-theme="light"] .toll-dialog .batch-interval-bar{background-color:rgba(244,245,247,.68);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.08) 100%)}
[data-theme="light"] .toll-dialog .batch-num-input{background-color:rgba(247,248,250,.84)}
[data-theme="light"] .toll-dialog .alarm-card{background-color:rgba(244,245,247,.72);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.08) 100%)}
[data-theme="light"] .toll-dialog .number{background-color:rgba(232,234,238,.86);background-image:linear-gradient(180deg,rgba(255,255,255,.16),rgba(212,214,220,.10))}
[data-theme="light"] .toll-dialog .interval-row{background-color:rgba(242,243,246,.62);background-image:linear-gradient(110deg,rgba(80,82,88,.05),rgba(255,255,255,.14))}
[data-theme="light"] .toll-dialog .chip,[data-theme="light"] .toll-dialog .area-tag,[data-theme="light"] .toll-dialog .collapse-btn,[data-theme="light"] .toll-dialog .preview-btn,[data-theme="light"] .toll-dialog .nudge,[data-theme="light"] .toll-dialog .footer-btn,[data-theme="light"] .toll-dialog .icon-button,[data-theme="light"] .toll-dialog .custom-time-trigger{background-color:rgba(244,245,247,.80);background-image:linear-gradient(180deg,rgba(255,255,255,.16) 0%,rgba(236,238,241,.04) 56%,rgba(218,220,225,.09) 100%)}
[data-theme="light"] .toll-dialog .time-input,[data-theme="light"] .toll-dialog .interval-input{background-color:rgba(247,248,250,.84);background-image:linear-gradient(180deg,rgba(255,255,255,.14) 0%,rgba(232,234,238,.05) 100%)}
[data-theme="light"] .toll-dialog .chip:hover,[data-theme="light"] .toll-dialog .area-tag:hover,[data-theme="light"] .toll-dialog .collapse-btn:hover,[data-theme="light"] .toll-dialog .preview-btn:hover,[data-theme="light"] .toll-dialog .nudge:hover,[data-theme="light"] .toll-dialog .footer-btn:hover,[data-theme="light"] .toll-dialog .icon-button:hover:not(:disabled),[data-theme="light"] .toll-dialog .custom-time-trigger:hover{background-color:rgba(248,249,251,.87)}
[data-theme="light"] .toll-dialog .chip.active,[data-theme="light"] .toll-dialog .stage-type-chip.active,[data-theme="light"] .toll-dialog .custom-time-trigger.is-open{background-color:rgba(228,230,235,.89);background-image:linear-gradient(180deg,rgba(255,255,255,.15) 0%,rgba(228,230,235,.04) 56%,rgba(208,210,216,.12) 100%)}
[data-theme="light"] .rt-head{background:rgba(255,255,255,.07)}
[data-theme="light"] .rt-options-bar{background:rgba(255,255,255,.04)}
[data-theme="light"] .rt-item-btn{background:linear-gradient(135deg,rgba(255,255,255,.30),rgba(255,255,255,.09))}
[data-theme="light"] .rt-item-btn:hover{background:linear-gradient(135deg,rgba(255,255,255,.47),rgba(255,255,255,.17))}
.toll-dialog .running-save-confirm-scrim{position:absolute;inset:0;z-index:160;border-radius:inherit;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(18,19,22,.28);backdrop-filter:blur(14px) saturate(145%);-webkit-backdrop-filter:blur(14px) saturate(145%);animation:runningConfirmScrimIn .18s cubic-bezier(.22,1,.36,1)}
[data-theme="dark"] .toll-dialog .running-save-confirm-scrim{background:rgba(6,7,9,.46)}
@keyframes runningConfirmScrimIn{from{opacity:0}to{opacity:1}}
@keyframes runningConfirmCardIn{from{opacity:0;transform:scale(.95) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
.toll-dialog .running-save-confirm-card{width:min(390px,100%);padding:20px 22px 18px;border-radius:24px;border:1px solid var(--toll-glass-edge);background-color:rgba(246,247,249,.82);background-image:linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(238,240,244,.08) 56%,rgba(220,223,229,.14) 100%);backdrop-filter:blur(28px) saturate(165%);-webkit-backdrop-filter:blur(28px) saturate(165%);box-shadow:0 24px 56px rgba(0,0,0,.20),0 6px 18px rgba(0,0,0,.08),inset 0 1px 0 var(--toll-highlight);color:var(--toll-ink);display:flex;flex-direction:column;gap:11px;animation:runningConfirmCardIn .22s cubic-bezier(.22,1,.36,1)}
[data-theme="sepia"] .toll-dialog .running-save-confirm-card{background-color:rgba(244,235,220,.84);background-image:linear-gradient(180deg,rgba(255,250,240,.26) 0%,rgba(232,220,202,.08) 56%,rgba(214,200,180,.14) 100%)}
[data-theme="dark"] .toll-dialog .running-save-confirm-card{background-color:rgba(32,33,37,.82);background-image:linear-gradient(180deg,rgba(255,255,255,.10) 0%,rgba(255,255,255,.03) 56%,rgba(0,0,0,.22) 100%);box-shadow:0 26px 62px rgba(0,0,0,.62),0 8px 22px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.14)}
.toll-dialog .running-save-confirm-head{display:flex;align-items:center;gap:10px}
.toll-dialog .running-save-confirm-badge{width:30px;height:30px;border-radius:999px;flex:none;display:inline-flex;align-items:center;justify-content:center;color:var(--toll-ink);background:var(--toll-pill);box-shadow:0 2px 8px rgba(0,0,0,.08),inset 0 1px 0 var(--toll-highlight)}
.toll-dialog .running-save-confirm-head h2{margin:0;font-size:17px;font-weight:780;letter-spacing:-.02em;color:var(--toll-ink)}
.toll-dialog .running-save-confirm-desc{margin:0;font-size:15px;line-height:1.58;color:var(--toll-ink-2);word-break:keep-all}
.toll-dialog .running-save-confirm-actions{margin-top:4px;display:flex;align-items:center;justify-content:flex-end;gap:8px}
.custom-select-wrap{position:relative;display:inline-flex;align-items:center}
.custom-time-trigger{height:32px;border-radius:999px;border:1px solid var(--toll-glass-edge);background:var(--toll-pill);color:var(--toll-ink);padding:0 11px;font-size:11.5px;font-weight:720;font-variant-numeric:tabular-nums;display:inline-flex;align-items:center;gap:6px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.06),inset 0 1px 0 var(--toll-highlight);transition:background .16s ease,border-color .16s ease,transform .14s ease}
.custom-time-trigger:hover,.custom-time-trigger.is-open{background:var(--toll-pill-hover);border-color:var(--focus-ring)}
.custom-time-trigger.is-open .chevron-icon{transform:rotate(180deg)}
.custom-time-trigger.input-invalid{border-color:#d94848}
.custom-time-popover{position:absolute;top:calc(100% + 8px);right:0;width:282px;max-width:calc(100vw - 44px);z-index:120;padding:12px;border-radius:18px;border:1px solid rgba(28,28,30,.14);background:#ffffff;color:var(--toll-ink);box-shadow:0 22px 48px rgba(0,0,0,.22),0 6px 16px rgba(0,0,0,.09);display:flex;flex-direction:column;gap:10px}
.custom-time-popover.open-up{top:auto;bottom:calc(100% + 8px)}
.custom-time-popover.align-left{right:auto;left:0}
[data-theme="dark"] .custom-time-popover{background:#1f1f22;border-color:rgba(255,255,255,.18);box-shadow:0 24px 56px rgba(0,0,0,.68),0 6px 18px rgba(0,0,0,.40)}
[data-theme="sepia"] .custom-time-popover{background:#f7efe0;border-color:rgba(54,41,30,.22);box-shadow:0 22px 48px rgba(42,31,21,.26),0 6px 16px rgba(42,31,21,.10)}
.custom-time-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.custom-time-title{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:800;letter-spacing:-.02em;color:var(--toll-ink)}
.custom-time-badge{display:inline-flex;align-items:center;height:20px;padding:0 7px;border-radius:999px;background:var(--toll-selected);color:var(--toll-ink);font-size:10.5px;font-weight:760;font-variant-numeric:tabular-nums}
.custom-time-close{appearance:none;height:26px;padding:0 10px;border-radius:999px;border:1px solid var(--toll-line);background:var(--toll-glass-inner);color:var(--toll-ink-2);font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0}
.custom-time-close:hover{background:var(--toll-selected);color:var(--toll-ink)}
.custom-time-ampm-row{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:3px;border-radius:12px;background:rgba(120,120,128,.10);border:1px solid var(--toll-line)}
[data-theme="dark"] .custom-time-ampm-row{background:rgba(255,255,255,.06)}
.custom-time-ampm-btn{appearance:none;height:29px;border-radius:9px;border:1px solid transparent;background:transparent;color:var(--toll-muted);font-size:11.5px;font-weight:720;cursor:pointer}
.custom-time-ampm-btn.is-active{background:var(--toll-button);color:var(--toll-button-text);font-weight:800;box-shadow:0 2px 8px rgba(0,0,0,.14)}
.custom-time-digit-grid{display:flex;align-items:center;justify-content:center;gap:6px;padding:6px 8px;border-radius:14px;background:rgba(120,120,128,.075);border:1px solid var(--toll-line)}
[data-theme="dark"] .custom-time-digit-grid{background:rgba(255,255,255,.05)}
.custom-time-digit-box{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:3px}
.custom-time-digit-label{font-size:9.5px;font-weight:700;color:var(--toll-muted);letter-spacing:.02em}
.custom-time-stepper{width:100%;display:flex;align-items:center;gap:3px}
.custom-time-step-btn{appearance:none;width:26px;height:32px;flex:none;border-radius:8px;border:1px solid var(--toll-line);background:var(--toll-pill);color:var(--toll-ink);font-size:14px;font-weight:700;line-height:1;cursor:pointer;touch-action:none;-webkit-touch-callout:none;display:grid;place-items:center;transition:background .12s ease,transform .12s ease}
.custom-time-step-btn:hover{background:var(--toll-selected)}
.custom-time-step-btn:active,.custom-time-step-btn.is-pressed{transform:scale(.94)}
.custom-time-digit-input{width:100%;min-width:36px;height:32px;padding:0 4px;border-radius:9px;border:1px solid var(--toll-line);background:#ffffff;color:var(--toll-ink);font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;text-align:center;outline:none}
.custom-time-digit-input:focus{border-color:var(--focus-ring);box-shadow:0 0 0 2px rgba(124,156,197,.24)}
[data-theme="dark"] .custom-time-digit-input{background:rgba(255,255,255,.09)}
[data-theme="sepia"] .custom-time-digit-input{background:rgba(255,250,240,.92)}
.custom-time-colon{flex:none;font-size:18px;font-weight:800;color:var(--toll-muted);padding-top:13px;line-height:1}
.custom-time-quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.custom-time-nudge-btn{appearance:none;height:30px;padding:0 6px;border-radius:9px;border:1px solid var(--toll-line);background:rgba(120,120,128,.08);color:var(--toll-ink);font-size:11px;font-weight:720;font-variant-numeric:tabular-nums;cursor:pointer;touch-action:none;-webkit-touch-callout:none;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;transition:background .14s ease,border-color .14s ease,transform .12s ease}
[data-theme="dark"] .custom-time-nudge-btn{background:rgba(255,255,255,.08)}
.custom-time-nudge-btn:hover{background:var(--toll-selected);border-color:var(--toll-selected-edge)}
.custom-time-nudge-btn:active,.custom-time-nudge-btn.is-pressed{transform:scale(.96)}
.custom-time-footer-row{display:flex;align-items:center;gap:6px;padding-top:2px}
.custom-time-reset-btn{appearance:none;flex:1;height:34px;padding:0 10px;border-radius:10px;border:1px solid var(--toll-line);background:transparent;color:var(--toll-ink-2);font-size:11.5px;font-weight:720;font-variant-numeric:tabular-nums;cursor:pointer;white-space:nowrap}
.custom-time-reset-btn:hover{background:var(--toll-selected);border-color:var(--toll-selected-edge)}
.custom-time-apply-btn{appearance:none;flex:1;height:34px;padding:0 14px;border-radius:10px;border:none;background:var(--toll-button);color:var(--toll-button-text);font-size:12px;font-weight:800;cursor:pointer;touch-action:none;-webkit-touch-callout:none;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.14);transition:opacity .14s ease,transform .12s ease}
.custom-time-apply-btn:active,.custom-time-apply-btn.is-pressed{transform:scale(.97)}
.custom-time-error{font-size:10.5px;font-weight:680;line-height:1.35;color:#cf3434;padding:5px 8px;border-radius:8px;background:rgba(217,56,56,.10)}
[data-theme="dark"] .custom-time-error{color:#ff8b8b;background:rgba(255,92,92,.16)}
.toll-dialog .custom-time-trigger{height:36px;padding:0 13px;font-size:13.5px}
.toll-dialog .custom-time-title{font-size:14px}
.toll-dialog .custom-time-badge{height:24px;padding:0 8px;font-size:12.5px}
.toll-dialog .custom-time-close{height:30px;padding:0 11px;font-size:13px}
.toll-dialog .custom-time-ampm-btn{height:34px;font-size:13.5px}
.toll-dialog .custom-time-digit-label{font-size:11.5px}
.toll-dialog .custom-time-step-btn{width:28px;height:36px;font-size:16.5px}
.toll-dialog .custom-time-digit-input{height:36px;font-size:19px}
.toll-dialog .custom-time-colon{font-size:21px}
.toll-dialog .custom-time-nudge-btn{height:34px;font-size:13px}
.toll-dialog .custom-time-reset-btn{height:38px;font-size:13.5px}
.toll-dialog .custom-time-apply-btn{height:38px;font-size:14px}
.toll-dialog .custom-time-error{font-size:12.5px}
#bottomLeftMenu{position:fixed;left:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 25px);z-index:33;display:flex;align-items:center}
#playbackSettingsBtn{width:44px;height:44px;padding:0;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;letter-spacing:0}
#playbackSettingsBtn.is-selected{border-color:var(--btn-rim-active);box-shadow:var(--btn-shadow-hover)}
#playbackSettingsPanel{position:fixed;left:18px;bottom:calc(env(safe-area-inset-bottom,0px) + 79px);width:min(320px,calc(100vw - 36px));min-height:220px;max-height:min(360px,48dvh);z-index:32;display:flex;flex-direction:column;overflow:hidden;border-radius:22px;border:1px solid var(--toll-line);background:var(--tt-panel-bg,var(--toll-glass));box-shadow:var(--toll-glass-shadow);-webkit-backdrop-filter:blur(28px) saturate(180%);backdrop-filter:blur(28px) saturate(180%);will-change:transform,opacity,backdrop-filter;color:var(--toll-ink);word-break:keep-all;overflow-wrap:break-word;font-family:"SF Pro Text",-apple-system,BlinkMacSystemFont,"Pretendard Variable","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;transform-origin:bottom left;transform:translate3d(0,12px,0) scale(.95);opacity:0;visibility:hidden;pointer-events:none;transition:transform .28s cubic-bezier(.22,1,.36,1),opacity .22s ease,visibility .28s,background .25s ease,border-color .25s ease}
[data-theme="dark"] #playbackSettingsPanel{-webkit-backdrop-filter:blur(36px) saturate(180%);backdrop-filter:blur(36px) saturate(180%)}
#playbackSettingsPanel.open{transform:translate3d(0,0,0) scale(1);opacity:1;visibility:visible;pointer-events:auto}
#playbackSettingsPanel::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.16),transparent 24%);opacity:.72}
[data-theme="dark"] #playbackSettingsPanel::before{background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 24%)}
#playbackSettingsPanel > *{position:relative;z-index:1}
.ps-head{flex:none;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px 12px;border-bottom:1px solid var(--toll-line)}
.ps-title{margin:0;font-family:"SF Pro Display",-apple-system,BlinkMacSystemFont,"Pretendard Variable","Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif;font-size:15px;font-weight:600;letter-spacing:-.025em;color:var(--toll-ink)}
.ps-close-btn{width:28px;height:28px;padding:0;border-radius:50%;border:1px solid var(--toll-line);background:var(--toll-pill);color:var(--toll-ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:background .16s ease,border-color .16s ease,transform .14s ease}
.ps-close-btn:hover{background:var(--toll-pill-hover);border-color:var(--btn-rim-hover)}
.ps-close-btn:active{transform:scale(.95)}
.ps-close-btn:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}
.ps-body{flex:1;min-height:0;overflow-y:auto;padding:14px 16px}
@media (max-width:719px){#bottomLeftMenu{left:12px}#playbackSettingsBtn{width:40px;height:40px}#playbackSettingsPanel{left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 75px);width:min(320px,calc(100vw - 24px))}}
@media (max-width:519px){#bottomLeftMenu{bottom:calc(env(safe-area-inset-bottom,0px) + 84px)}#playbackSettingsPanel{bottom:calc(env(safe-area-inset-bottom,0px) + 134px);max-height:min(300px,42dvh)}}
@media (max-width:358px),(max-width:420px) and (max-aspect-ratio:44/100){#bottomLeftMenu{bottom:calc(env(safe-area-inset-bottom,0px) + 132px)}#playbackSettingsPanel{bottom:calc(env(safe-area-inset-bottom,0px) + 182px);max-height:min(280px,38dvh)}}
</style>
</head>
<body>
<svg class="svg-filters" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <filter id="glass-lens-light" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="-0.08" y="-0.16" width="1.16" height="1.32" color-interpolation-filters="sRGB">
    <feImage id="glass-map-light" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="glass-lens-dark" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="-0.08" y="-0.16" width="1.16" height="1.32" color-interpolation-filters="sRGB">
    <feImage id="glass-map-dark" x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
</svg>
<canvas id="c"></canvas>
<video id="wakeLockVideo" muted playsinline loop preload="auto" disablepictureinpicture disableremoteplayback aria-hidden="true" tabindex="-1"></video>
<div id="ui">
  <h1 id="title" style="opacity:0">국어 영역</h1>
  <div id="face"></div>
  <div id="lab" style="opacity:0">
    <div id="startLab"><span class="lab-kicker">START TIME</span><span class="lab-time"><span class="lab-digits">08:35</span><span class="lab-meridiem">AM</span></span></div>
    <div id="centerStat">
      <div id="remainDigits">05:00</div>
      <div id="stageBadge"><span class="stage-primary">1교시 · 준비령 대기</span></div>
    </div>
    <div id="endLab"><span class="lab-kicker">END TIME</span><span class="lab-time"><span class="lab-digits">08:40</span><span class="lab-meridiem">AM</span></span></div>
  </div>
</div>

<div id="toastNotice" role="status" aria-live="polite"></div>

<input id="engFileInput" type="file" accept="audio/*" style="display:none">
<input id="configJsonInput" type="file" accept="application/json,.json" style="display:none">

<!-- 좌측 상단 햄버거 메뉴 바 및 목록-세부 정보(List-Detail) 알약 컨트롤 트레이 -->
<div id="topLeftMenu">
  <div class="top-left-bar">
    <button id="hamburgerBtn" class="lg-btn" type="button" aria-label="메뉴 열기/닫기" title="메뉴">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
        <line x1="4" y1="7" x2="20" y2="7"/>
        <line x1="4" y1="12" x2="20" y2="12"/>
        <line x1="4" y1="17" x2="20" y2="17"/>
      </svg>
    </button>
    <button id="fullscreenBtn" class="lg-btn is-closed" type="button" aria-hidden="true" tabindex="-1" aria-pressed="false" aria-label="전체 화면" title="전체 화면">
      <svg id="fullscreenIconSvg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="15 3 21 3 21 9"/>
        <polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    </button>
  </div>

  <div id="pillDrawer" class="closed">
    <div class="ld-master-col" role="tablist" aria-label="설정 범주 목록">
      <button type="button" class="lg-btn ld-cat-btn" data-cat="schedule_audio">
        <span>타종 · 듣기 설정</span>
        <span class="ld-cat-arrow">›</span>
      </button>
      <button type="button" class="lg-btn ld-cat-btn" data-cat="ui_theme">
        <span>화면 · UI</span>
        <span class="ld-cat-arrow">›</span>
      </button>
      <button type="button" class="lg-btn ld-cat-btn" data-cat="data_export">
        <span>데이터 · 설정</span>
        <span class="ld-cat-arrow">›</span>
      </button>
    </div>

    <div id="ldDetailCol" class="ld-detail-col">
      <div id="pane_schedule_audio" class="ld-pane">
        <button id="openBuilderBtn" class="lg-btn lg-sub-btn" type="button">
          <span id="builderBtnLabel">영역 · 타종 선택 구성</span>
        </button>
        <div style="display:flex;gap:6px;align-items:center">
          <button id="engFileBtn" class="lg-btn lg-sub-btn" type="button">
            <span id="engFileLabel">듣기 음원 선택 (13:07)</span>
          </button>
          <button id="engFileClearBtn" class="lg-btn lg-sub-btn" type="button" style="display:none;padding:0 10px" title="선택된 듣기 음원 해제">✕</button>
        </div>
        <div class="drawer-card-panel" aria-label="타종 및 듣기 음량 조절">
          <div class="drawer-card-title">
            <span>타종 · 듣기 음량 조절</span>
            <span id="muteStatusMeta">전체 활성</span>
          </div>
          <div class="vol-control-row">
            <span>타종 음량</span>
            <div class="vol-slider-wrap">
              <input id="bellVolSlider" type="range" min="0" max="1" step="0.05" value="1" aria-label="타종 음량">
              <span id="bellVolPct" class="vol-pct">100%</span>
            </div>
          </div>
          <div class="vol-control-row">
            <span>듣기 음량</span>
            <div class="vol-slider-wrap">
              <input id="engVolSlider" type="range" min="0" max="1" step="0.05" value="1" aria-label="영어 듣기 음량">
              <span id="engVolPct" class="vol-pct">100%</span>
            </div>
          </div>
        </div>
        <div class="drawer-card-panel" aria-label="실제 시각 기준 자동 예약 시작">
          <div class="drawer-card-title">
            <span>예약 시작 (실제 시각 기준)</span>
            <span id="schedStatusMeta">해제됨</span>
          </div>
          <div class="sched-control-row">
            <input id="schedTimeInput" type="time" step="1" class="sched-time-input" value="08:05" aria-label="예약 시작 시각">
            <button id="schedToggleBtn" type="button" class="bm-act-btn primary">예약</button>
          </div>
          <span style="font-size:10px;color:var(--toll-muted);line-height:1.35">
            정확한 타종을 위해 화면을 켜 두세요 (자동 절전 방지 지원)
          </span>
        </div>
        <button id="drawerBookmarkOpenBtn" class="lg-btn lg-sub-btn" type="button">
          <span id="drawerBookmarkOpenLabel">자주 쓰는 타종 구성</span>
        </button>
        <div id="drawerBookmarkCard" class="bookmark-drawer-card" aria-label="자주 쓰는 타종 구성">
          <div class="bookmark-drawer-head">
            <span class="bookmark-drawer-title">자주 쓰는 타종 구성</span>
            <div class="bookmark-drawer-head-actions">
              <button id="drawerFolderToggleBtn" type="button" class="bookmark-add-toggle">+ 새 폴더</button>
              <button id="drawerBookmarkToggleBtn" type="button" class="bookmark-add-toggle">+ 구성 저장</button>
            </div>
          </div>
          <div id="drawerFolderCreateRow" class="bookmark-save-row">
            <input id="drawerFolderInput" type="text" class="bookmark-name-input" maxlength="30" placeholder="새 폴더 이름">
            <button id="drawerFolderConfirmBtn" type="button" class="bookmark-save-btn">생성</button>
          </div>
          <div id="drawerBookmarkSaveBlock" class="bookmark-save-block">
            <div id="drawerBookmarkSaveRow" class="bookmark-save-row open">
              <input id="drawerBookmarkInput" type="text" class="bookmark-name-input" maxlength="60" placeholder="구성 이름 (비우면 자동)">
              <button id="drawerBookmarkConfirmBtn" type="button" class="bookmark-save-btn">저장</button>
            </div>
            <div id="drawerSaveFolderRow" class="bookmark-folder-select-row" style="display:none"></div>
          </div>
          <div id="drawerFolderTabs" class="bookmark-folder-tabs" style="display:none"></div>
          <div id="drawerFolderToolbar" class="bookmark-folder-toolbar" style="display:none"></div>
          <div id="drawerBookmarkUndoBar" class="bm-undo-bar" style="display:none">
            <span id="drawerBookmarkUndoText">구성이 삭제됨</span>
            <button id="drawerBookmarkUndoBtn" type="button">실행 취소</button>
          </div>
          <div id="drawerBookmarkList" class="bookmark-pill-list"></div>
        </div>
      </div>

      <div id="pane_ui_theme" class="ld-pane">
        <div class="pill-group-row" role="group" aria-label="화면 테마 선택">
          <button type="button" class="theme-chip active" data-theme-pref="auto">자동</button>
          <button type="button" class="theme-chip" data-theme-pref="light">라이트</button>
          <button type="button" class="theme-chip" data-theme-pref="dark">다크</button>
          <button type="button" class="theme-chip" data-theme-pref="sepia">세피아</button>
        </div>
        <div class="drawer-card-panel" aria-label="화면 및 시계 블러 애니메이션 설정">
          <div class="drawer-card-title">
            <span>화면 유지 · 시계 블러 효과</span>
            <span>시침·분침·초침 길게 눌러 회전 가능</span>
          </div>
          <label class="ui-option-toggle-row">
            <span class="ui-opt-text">
              <span>화면 켜짐 유지 (꺼짐 방지)</span>
              <span class="ui-opt-sub">타이머 및 대기 중 기기 화면 자동 꺼짐 방지</span>
            </span>
            <input id="keepAwakeToggle" type="checkbox" checked>
          </label>
          <label class="ui-option-toggle-row">
            <span class="ui-opt-text">
              <span>본령 종료 전 블러 애니메이션</span>
              <span class="ui-opt-sub">종료 10분~1분 전 +10%, 1분~10초 전 +40%, 10초~0초 +90% 연속 강화 후 타종 시 완화</span>
            </span>
            <input id="mainBellGlowToggle" type="checkbox" checked>
          </label>
          <label class="ui-option-toggle-row">
            <span class="ui-opt-text">
              <span>준비령 종료 전 블러 애니메이션</span>
              <span class="ui-opt-sub">본령 시작 1분~10초 전 +10%, 10초~0초 +40% 연속 강화 후 타종 시 완화</span>
            </span>
            <input id="prelimBellGlowToggle" type="checkbox" checked>
          </label>
        </div>
      </div>

      <div id="pane_data_export" class="ld-pane">
        <button id="infoBtn" class="lg-btn lg-sub-btn" type="button">
          <span>전체 시간표 · 타종/버전 정보</span>
        </button>
        <div style="display:flex;gap:6px">
          <button id="exportJsonBtn" class="lg-btn lg-sub-btn" type="button">
            <span>설정 JSON 저장</span>
          </button>
          <button id="importJsonBtn" class="lg-btn lg-sub-btn" type="button">
            <span>설정 열기</span>
          </button>
        </div>
        <button id="exportCleanHtmlBtn" class="lg-btn lg-sub-btn" type="button">
          <span>프로그램 공유</span>
        </button>
      </div>
    </div>
  </div>
</div>

<!-- 우측 상단 수능 시간표 목록 버튼 및 펼침 패널 -->
<div id="topRightMenu">
  <button id="timetableToggleBtn" class="lg-btn" type="button" aria-expanded="false" aria-controls="rightTimetablePanel" aria-label="수능 시간표 목록 열기/닫기" title="수능 시간표 목록">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/>
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>
    </svg>
  </button>
</div>

<aside id="rightTimetablePanel" aria-hidden="true" aria-label="수능 시간표 목록">
  <div class="rt-head">
    <div class="rt-head-title-group">
      <h2 class="rt-title">수능 시간표</h2>
      <span id="rtCountMeta" class="rt-count-meta"></span>
    </div>
    <div class="rt-head-actions">
      <button id="rtOptionCollapseBtn" type="button" class="rt-arrow-btn" aria-expanded="true" aria-label="옵션 선택 숨기기" title="옵션 선택 숨기기">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>
    </div>
  </div>

  <div id="rtOptionsOuter" class="rt-options-outer">
    <div class="rt-options-inner">
      <div class="rt-options-bar">
        <div id="rtModeSeg" class="rt-mode-seg" role="tablist" aria-label="시간표 목록 보기 옵션">
          <span class="rt-mode-glider" aria-hidden="true"></span>
          <button id="rtTabAll" type="button" role="tab" aria-selected="true" class="rt-mode-btn active" data-rt-mode="all">모든 시간표</button>
          <button id="rtTabSelected" type="button" role="tab" aria-selected="false" class="rt-mode-btn" data-rt-mode="selected">선택된 영역 시간표</button>
        </div>
        <div class="rt-sub-actions">
          <span class="rt-sub-hint">항목 클릭 시 시작·편집·정보 액션 표시</span>
          <button id="rtEditSeqBtn" type="button" class="rt-edit-seq-btn">체크박스 선택 · 편집</button>
        </div>
      </div>
    </div>
  </div>

  <div id="rtScrollList" class="rt-scroll-list"></div>
</aside>

<!-- 하단 배지 및 중앙 START / PAUSE / CANCEL 컨트롤 독 -->
<div id="dockStatusBadges" class="dock-status-badges"></div>

<div id="dock">
  <div id="primaryRow">
    <div id="runTouchZone" aria-label="진행 중 보조 컨트롤 터치 영역">
      <div id="actionStage">
        <button id="auxPrevBellBtn" type="button" class="run-aux-btn pos-left" aria-label="이전 타종 단계로 이동" title="이전 타종 단계로 이동">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="19 20 9 12 19 4 19 20"/>
            <line x1="5" y1="19" x2="5" y2="5"/>
          </svg>
        </button>
        <button id="auxReplayBellBtn" type="button" class="run-aux-btn pos-top-center" aria-label="방금 울린 타종 다시 재생" title="방금 울린 타종 다시 재생">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
          </svg>
        </button>
        <button id="auxNextBellBtn" type="button" class="run-aux-btn pos-right" aria-label="다음 타종 단계로 이동" title="다음 타종 단계로 이동">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="5 4 15 12 5 20 5 4"/>
            <line x1="19" y1="5" x2="19" y2="19"/>
          </svg>
        </button>
        <div id="startWrap" class="stage-layer is-active">
          <button id="go" class="lg-btn" type="button">START</button>
        </div>
        <div id="runCtrls" class="stage-layer is-inactive">
          <button id="pauseBtn" class="lg-btn" type="button">PAUSE</button>
          <button id="cancelBtn" class="lg-btn" type="button">CANCEL</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- 좌측 하단 재생 설정 원형 아이콘 버튼 -->
<div id="bottomLeftMenu">
  <button id="playbackSettingsBtn" class="lg-btn" type="button" aria-expanded="false" aria-controls="playbackSettingsPanel" aria-label="재생 설정 열기/닫기" title="재생 설정">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="21" y1="6" x2="14" y2="6"/>
      <line x1="8" y1="6" x2="3" y2="6"/>
      <circle cx="11" cy="6" r="2.5"/>
      <line x1="21" y1="12" x2="18" y2="12"/>
      <line x1="12" y1="12" x2="3" y2="12"/>
      <circle cx="15" cy="12" r="2.5"/>
      <line x1="21" y1="18" x2="11" y2="18"/>
      <line x1="5" y1="18" x2="3" y2="18"/>
      <circle cx="8" cy="18" r="2.5"/>
    </svg>
  </button>
</div>

<!-- 좌측 하단 비차단 플로팅 재생 설정 팝업 -->
<aside id="playbackSettingsPanel" aria-hidden="true" aria-labelledby="playbackSettingsTitle">
  <div class="ps-head">
    <h2 id="playbackSettingsTitle" class="ps-title">재생 설정</h2>
    <button id="playbackSettingsCloseBtn" type="button" class="ps-close-btn" aria-label="재생 설정 창 닫기" title="닫기">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
  <div class="ps-body"></div>
</aside>

<!-- 전용 창 1: 체크박스 기반 영역·타종 선택 및 시간 간격/시각 편집기 (Liquid Glass Modal) -->
<div id="builderModalBackdrop" class="toll-scrim">
  <main class="toll-dialog" role="dialog" aria-modal="true" aria-labelledby="builderModalTitle">
    <header class="dialog-header">
      <div class="dialog-heading">
        <h1 id="builderModalTitle">타종 설정</h1>
        <p>원하는 영역과 타종 단계를 선택하고, 각 타종 사이의 간격과 타종 시각을 조정하세요.</p>
      </div>
      <div class="head-actions">
        <button id="builderUndoBtn" class="icon-button" type="button" disabled aria-label="실행 취소" title="실행 취소 (Ctrl+Z)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 14 4 9l5-5"/>
            <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
          </svg>
        </button>
        <button id="builderRedoBtn" class="icon-button" type="button" disabled aria-label="다시 실행" title="다시 실행 (Ctrl+Y)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m15 14 5-5-5-5"/>
            <path d="M20 9H9.5A5.5 5.5 0 0 0 4 14.5v0A5.5 5.5 0 0 0 9.5 20H13"/>
          </svg>
        </button>
        <button id="builderCloseBtn" class="icon-button" type="button" aria-label="닫기" title="닫기">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </header>

    <nav id="builderStepper" class="builder-stepper" aria-label="타종 구성 단계">
      <button type="button" class="builder-step-tab is-active" data-step-tab="1" aria-current="step">
        <span class="step-badge">1</span>
        <span class="step-title">응시 조합 · 빠른 설정</span>
      </button>
      <button type="button" class="builder-step-tab" data-step-tab="2">
        <span class="step-badge">2</span>
        <span class="step-title">진행할 영역 및 타종 단계 선택</span>
      </button>
      <button type="button" class="builder-step-tab" data-step-tab="3">
        <span class="step-badge">3</span>
        <span class="step-title">선택된 타종 진행 순서 및 시간 간격 · 시각 설정</span>
      </button>
    </nav>

    <div id="builderStepBody" class="builder-step-body">
      <section id="builderQuickbar" class="quickbar quickbar-step" aria-label="1단계: 응시 조합 및 빠른 설정">
        <div class="pane-title">
          <span>응시 조합 및 빠른 설정</span>
          <span class="pane-note">여기서 체크한 과목만 다음(2단계) 목록에 표시됩니다</span>
        </div>
        <div class="quick-line">
          <span class="quick-label">빠른 선택</span>
          <button type="button" class="chip" data-tpl="all_39">전체 타종 선택 (기본)</button>
          <button type="button" class="chip" data-tpl="kor_math_inq1_core">국·수·탐1 핵심 (준비·본령·종료전·종료)</button>
          <button type="button" class="chip" data-tpl="kor_core">1교시 국어 4단계</button>
          <button type="button" class="chip" data-tpl="eng_listening_core">3교시 영어 (13:07 듣기평가 안내방송 및 본령)</button>
          <button type="button" class="chip" data-tpl="all_core">전 영역 핵심 단계</button>
          <button type="button" class="chip" data-tpl="reset_intervals">기본 간격 초기화</button>
        </div>
        <div class="quick-line">
          <span class="quick-label">응시 조합</span>
          <div class="subj-auto-box">
            <label class="subj-check-label"><input type="checkbox" class="subj-chk" value="kor" checked> 국어</label>
            <label class="subj-check-label"><input type="checkbox" class="subj-chk" value="math" checked> 수학</label>
            <label class="subj-check-label"><input type="checkbox" class="subj-chk" value="eng" checked> 영어</label>
            <label class="subj-check-label"><input type="checkbox" class="subj-chk" value="hist" checked> 한국사</label>
            <label class="subj-check-label">
              <input id="subjInqChk" type="checkbox" checked>
              <span>탐구</span>
              <select id="subjInqCountSel" class="builder-select-sm" aria-label="탐구 선택 과목 수">
                <option value="2">2과목</option>
                <option value="1">1과목</option>
              </select>
            </label>
            <label class="subj-check-label"><input id="subjLang2Chk" type="checkbox"> 제2외국어/한문</label>
            <label class="subj-check-label">
              <span>밀도</span>
              <select id="subjDensitySel" class="builder-select-sm" aria-label="타종 단계 밀도">
                <option value="all">전체 타종</option>
                <option value="core">핵심 단계 (예비·입실 제외)</option>
                <option value="real">실전 최소 (본령·듣기·종료전·종료)</option>
              </select>
            </label>
            <button id="subjAutoApplyBtn" type="button" class="chip">조합 간격 초기화</button>
          </div>
        </div>
        <div class="quick-line bookmark-modal-quickline">
          <div class="bookmark-modal-folder-bar">
            <span class="quick-label">자주 쓰는 구성</span>
            <div id="modalBookmarkFolderTabs" class="bookmark-modal-folder-pills"></div>
            <div id="modalBookmarkFolderActions" class="bookmark-modal-folder-actions" style="display:none"></div>
          </div>
          <div id="modalFolderCreateRow" class="bookmark-modal-folder-create" style="display:none">
            <input id="modalFolderInput" type="text" class="bookmark-modal-input" maxlength="30" placeholder="새 북마크 폴더 이름">
            <button id="modalFolderConfirmBtn" type="button" class="chip">폴더 생성</button>
          </div>
          <div class="bookmark-modal-items-bar">
            <div id="modalBookmarkList" style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap"></div>
            <div class="bookmark-modal-save-group">
              <select id="modalBookmarkFolderSelect" class="builder-select-sm bookmark-modal-folder-select" aria-label="저장할 북마크 폴더 선택" style="display:none"></select>
              <input id="modalBookmarkInput" type="text" class="bookmark-modal-input" maxlength="28" placeholder="현재 구성을 저장할 이름">
              <button id="modalBookmarkSaveBtn" type="button" class="chip">현재 구성 저장</button>
            </div>
          </div>
          <div id="modalBookmarkMoveBar" class="bookmark-modal-move-bar" style="display:none"></div>
        </div>
      </section>

      <aside id="builderLeftPane" class="left-pane step-single-pane is-step-hidden"></aside>
      <section id="builderRightPane" class="right-pane step-single-pane is-step-hidden"></section>
    </div>

    <footer class="dialog-footer">
      <div id="builderSummaryText" class="summary"></div>
      <div class="footer-actions">
        <button id="builderCancelBtn" type="button" class="footer-btn">취소</button>
        <button id="builderPrevBtn" type="button" class="footer-btn" style="display:none">이전</button>
        <div id="builderNextWrap" class="lg-pill-cta-wrap is-next">
          <div class="lg-pill-cta-shadow" aria-hidden="true"></div>
          <button id="builderNextBtn" type="button" class="lg-pill-cta-btn">
            <span class="lg-pill-cta-label">다음<svg class="lg-pill-cta-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></span>
          </button>
        </div>
        <div id="builderApplyWrap" class="lg-pill-cta-wrap is-save">
          <div class="lg-pill-cta-shadow" aria-hidden="true"></div>
          <button id="builderApplyBtn" type="button" class="lg-pill-cta-btn">
            <span class="lg-pill-cta-label">선택 구성 저장</span>
          </button>
        </div>
      </div>
    </footer>

    <div id="runningSaveConfirmScrim" class="running-save-confirm-scrim" role="alertdialog" aria-modal="true" aria-labelledby="runningSaveConfirmTitle" aria-describedby="runningSaveConfirmDesc" style="display:none">
      <div class="running-save-confirm-card">
        <div class="running-save-confirm-head">
          <span class="running-save-confirm-badge" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12.5"/><circle cx="12" cy="16" r="0.8" fill="currentColor"/></svg>
          </span>
          <h2 id="runningSaveConfirmTitle">실행 중인 타이머 종료 및 구성 변경</h2>
        </div>
        <p id="runningSaveConfirmDesc" class="running-save-confirm-desc">현재 타이머가 실행 중입니다. 수락하면 실행 중인 타이머를 자동으로 종료하고 편집한 타종 구성을 즉시 적용합니다.</p>
        <div class="running-save-confirm-actions">
          <button id="runningSaveConfirmCancelBtn" type="button" class="footer-btn">취소</button>
          <div class="lg-pill-cta-wrap is-save">
            <div class="lg-pill-cta-shadow" aria-hidden="true"></div>
            <button id="runningSaveConfirmAcceptBtn" type="button" class="lg-pill-cta-btn">
              <span class="lg-pill-cta-label">수락</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>

<!-- 전용 창 2: 대학수학능력시험 전체 시간표 · 37개 타종 목록 · 설정 -->
<div id="modalBackdrop" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <div id="modalCard">
    <div class="modal-head">
      <h2 id="modalTitle">대학수학능력시험 전체 시간표 · 37개 타종 · 설정</h2>
      <button id="modalCloseBtn" class="modal-close" type="button" aria-label="닫기">닫기</button>
    </div>
    <div class="modal-body">
      <div>
        <p class="sec-title">대학수학능력시험 전체 시간표 (구간 선택 시 즉시 이동)</p>
        <table class="tt-table">
          <thead>
            <tr>
              <th>교시</th>
              <th>시각</th>
              <th>구분</th>
              <th>진행 내용</th>
              <th>선택</th>
            </tr>
          </thead>
          <tbody id="timetableBody"></tbody>
        </table>
      </div>

      <div>
        <p id="bellListSecTitle" class="sec-title">수능타종 37개 기본 음원 내장 목록 (001 ~ 037)</p>
        <table class="tt-table">
          <thead>
            <tr>
              <th>번호</th>
              <th>시각</th>
              <th>파일명</th>
              <th>내장 상태</th>
              <th>미리듣기</th>
            </tr>
          </thead>
          <tbody id="bellListBody"></tbody>
        </table>
      </div>

      <div>
        <p class="sec-title">애플리케이션 설정 및 버전 정보</p>
        <div class="info-grid">
          <div class="info-row">
            <span>앱 내부 표시 버전</span>
            <span id="appInternalVersion" class="mono-val"></span>
          </div>
          <div class="info-row">
            <span>시스템 기기 설정 버전</span>
            <span id="appSystemVersion" class="mono-val"></span>
          </div>
          <div class="info-row">
            <label for="devModeToggle" style="cursor:pointer">개발자 모드 활성화</label>
            <input id="devModeToggle" type="checkbox" style="cursor:pointer">
          </div>
          <div class="info-row">
            <span>패키징 구조</span>
            <span class="mono-val">Single HTML (Offline)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script id="embedded-csat-data" type="application/json">${embeddedDataJson}</script>
<script>
(function(){
  const EMBEDDED = JSON.parse(document.getElementById('embedded-csat-data').textContent);
  const STORAGE_KEY = 'csat_timer_custom_settings_v2';

  /* ---------- clock face (SVG) ---------- */
  (function initClockSvg(){
    let t='';
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6,s=Math.sin(a),c=-Math.cos(a),M=i%3===0;
      const r1=M?85:90,r2=M?97:96;
      t+=\`<line class="\${M?'tick-major':'tick-minor'}" x1="\${(s*r1).toFixed(2)}" y1="\${(c*r1).toFixed(2)}" x2="\${(s*r2).toFixed(2)}" y2="\${(c*r2).toFixed(2)}" stroke="\${M?'var(--tick-major)':'var(--tick-minor)'}" stroke-width="\${M?1.5:.8}"/>\`;
    }
    const mA=210*Math.PI/180, hx=88*Math.sin(mA), hy=-88*Math.cos(mA), hx1=10*Math.sin(mA), hy1=-10*Math.cos(mA);
    document.getElementById('face').innerHTML=
    \`<svg viewBox="-109 -109 218 218">
      <defs>
        <radialGradient id="gl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb9a4" stop-opacity=".30" data-base-op="0.30"/><stop offset="1" stop-color="#ffd9a8" stop-opacity="0"/></radialGradient>
        <radialGradient id="gl-dark-violet" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#5a3d9a" stop-opacity=".46" data-base-op="0.46"/><stop offset=".52" stop-color="#3c2f74" stop-opacity=".22" data-base-op="0.22"/><stop offset="1" stop-color="#1d1b38" stop-opacity="0"/></radialGradient>
        <radialGradient id="gl-dark-blue" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#2c3a84" stop-opacity=".44" data-base-op="0.44"/><stop offset=".55" stop-color="#222d66" stop-opacity=".18" data-base-op="0.18"/><stop offset="1" stop-color="#141a38" stop-opacity="0"/></radialGradient>
        <radialGradient id="gl-dark-green" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#1e876c" stop-opacity=".48" data-base-op="0.48"/><stop offset=".48" stop-color="#1a6354" stop-opacity=".22" data-base-op="0.22"/><stop offset="1" stop-color="#122b2a" stop-opacity="0"/></radialGradient>
        <linearGradient id="pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3308f"/><stop offset=".55" stop-color="#d9568a"/><stop offset="1" stop-color="#f6ac5e"/></linearGradient>
        <linearGradient id="pg-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a4ba8"/><stop offset=".5" stop-color="#583d96"/><stop offset="1" stop-color="#1f856b"/></linearGradient>
        <filter id="in" x="-20%" y="-20%" width="140%" height="140%">
          <feFlood flood-color="#3a0828" flood-opacity=".6" result="c"/>
          <feComposite in="c" in2="SourceAlpha" operator="out" result="inv"/>
          <feOffset in="inv" dx="1.8" dy="2.6" result="off"/>
          <feGaussianBlur in="off" stdDeviation="1.8" result="bl"/>
          <feComposite in="bl" in2="SourceAlpha" operator="in" result="sh"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge>
        </filter>
        <filter id="in-dark" x="-20%" y="-20%" width="140%" height="140%">
          <feFlood flood-color="#091026" flood-opacity=".65" result="c"/>
          <feComposite in="c" in2="SourceAlpha" operator="out" result="inv"/>
          <feOffset in="inv" dx="1.8" dy="2.6" result="off"/>
          <feGaussianBlur in="off" stdDeviation="1.8" result="bl"/>
          <feComposite in="bl" in2="SourceAlpha" operator="in" result="sh"/>
          <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/></feMerge>
        </filter>
        <filter id="ds" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx=".9" dy="1.4" stdDeviation=".9" flood-color="#000" flood-opacity=".28"/></filter>
      </defs>
      <g id="tk" style="opacity:0">
        <g id="clockGlowBoostGroup">
          <g class="clock-glow-light"><circle cx="-4" cy="-22" r="70" fill="url(#gl)"/></g>
          <g class="clock-glow-dark">
            <circle cx="-34" cy="-26" r="68" fill="url(#gl-dark-blue)"/>
            <circle cx="-10" cy="18" r="76" fill="url(#gl-dark-violet)"/>
            <circle cx="24" cy="-14" r="62" fill="url(#gl-dark-green)"/>
          </g>
        </g>
      \${t}</g><g id="hd" style="opacity:0">
      <g id="hourHand" class="clock-hand-interactive" transform="rotate(175)">
        <rect class="hand-hit-target" x="8" y="-18" width="74" height="36" rx="18" fill="transparent"/>
        <g class="hour-hand-light" filter="url(#in)"><rect x="13" y="-12.5" width="64" height="25" rx="12.5" fill="url(#pg)"/></g>
        <g class="hour-hand-dark" filter="url(#in-dark)"><rect x="13" y="-12.5" width="64" height="25" rx="12.5" fill="url(#pg-dark)"/></g>
      </g>
      <g id="minHandGroup" class="clock-hand-interactive">
        <line id="minHandHit" class="hand-hit-target" x1="\${hx1.toFixed(2)}" y1="\${hy1.toFixed(2)}" x2="\${hx.toFixed(2)}" y2="\${hy.toFixed(2)}" stroke="transparent" stroke-width="18" stroke-linecap="round"/>
        <line id="minHand" x1="0" y1="0" x2="\${hx.toFixed(2)}" y2="\${hy.toFixed(2)}" stroke="var(--min-hand)" stroke-width="2.3" stroke-linecap="round" filter="url(#ds)"/>
      </g>
      <g filter="url(#ds)"><g id="secHand" class="clock-hand-interactive" transform="rotate(0)"><line class="hand-hit-target" x1="0" y1="18" x2="0" y2="-94" stroke="transparent" stroke-width="16" stroke-linecap="round"/><line x1="0" y1="18" x2="0" y2="-92" stroke="var(--sec-hand)" stroke-width="1.4" stroke-linecap="round"/><circle cx="0" cy="0" r="2.7" fill="var(--sec-hand)"/></g></g></g>
    </svg>\`;
  })();

  const cv=document.getElementById('c'),
        wakeLockVideo=document.getElementById('wakeLockVideo'),
        face=document.getElementById('face'),
        title=document.getElementById('title'),
        lab=document.getElementById('lab'),
        dockEl=document.getElementById('dock'),
        startLab=document.getElementById('startLab'),
        endLab=document.getElementById('endLab'),
        remainDigits=document.getElementById('remainDigits'),
        stageBadge=document.getElementById('stageBadge'),
        btn=document.getElementById('go'),
        startWrap=document.getElementById('startWrap'),
        runCtrls=document.getElementById('runCtrls'),
        pauseBtn=document.getElementById('pauseBtn'),
        cancelBtn=document.getElementById('cancelBtn'),
        hamburgerBtn=document.getElementById('hamburgerBtn'),
        fullscreenBtn=document.getElementById('fullscreenBtn'),
        fullscreenIconSvg=document.getElementById('fullscreenIconSvg'),
        pillDrawer=document.getElementById('pillDrawer'),
        timetableToggleBtn=document.getElementById('timetableToggleBtn'),
        rightTimetablePanel=document.getElementById('rightTimetablePanel'),
        rtCountMeta=document.getElementById('rtCountMeta'),
        rtOptionCollapseBtn=document.getElementById('rtOptionCollapseBtn'),
        rtOptionsOuter=document.getElementById('rtOptionsOuter'),
        rtEditSeqBtn=document.getElementById('rtEditSeqBtn'),
        rtScrollList=document.getElementById('rtScrollList'),
        openBuilderBtn=document.getElementById('openBuilderBtn'),
        builderBtnLabel=document.getElementById('builderBtnLabel'),
        engFileInput=document.getElementById('engFileInput'),
        engFileBtn=document.getElementById('engFileBtn'),
        engFileLabel=document.getElementById('engFileLabel'),
        engFileClearBtn=document.getElementById('engFileClearBtn'),
        bellVolSlider=document.getElementById('bellVolSlider'),
        bellVolPct=document.getElementById('bellVolPct'),
        engVolSlider=document.getElementById('engVolSlider'),
        engVolPct=document.getElementById('engVolPct'),
        muteStatusMeta=document.getElementById('muteStatusMeta'),
        schedTimeInput=document.getElementById('schedTimeInput'),
        schedToggleBtn=document.getElementById('schedToggleBtn'),
        schedStatusMeta=document.getElementById('schedStatusMeta'),
        dockStatusBadges=document.getElementById('dockStatusBadges'),
        runTouchZone=document.getElementById('runTouchZone'),
        runAuxLayer=document.getElementById('runAuxLayer'),
        auxPrevBellBtn=document.getElementById('auxPrevBellBtn'),
        auxReplayBellBtn=document.getElementById('auxReplayBellBtn'),
        auxNextBellBtn=document.getElementById('auxNextBellBtn'),
        auxMinus30Btn=document.getElementById('auxMinus30Btn'),
        auxPlus30Btn=document.getElementById('auxPlus30Btn'),
        builderUndoBtn=document.getElementById('builderUndoBtn'),
        builderRedoBtn=document.getElementById('builderRedoBtn'),
        infoBtn=document.getElementById('infoBtn'),
        exportJsonBtn=document.getElementById('exportJsonBtn'),
        importJsonBtn=document.getElementById('importJsonBtn'),
        configJsonInput=document.getElementById('configJsonInput'),
        exportCleanHtmlBtn=document.getElementById('exportCleanHtmlBtn'),
        builderModalBackdrop=document.getElementById('builderModalBackdrop'),
        builderCloseBtn=document.getElementById('builderCloseBtn'),
        builderCancelBtn=document.getElementById('builderCancelBtn'),
        builderPrevBtn=document.getElementById('builderPrevBtn'),
        builderNextWrap=document.getElementById('builderNextWrap'),
        builderNextBtn=document.getElementById('builderNextBtn'),
        builderApplyBtn=document.getElementById('builderApplyBtn'),
        builderStepper=document.getElementById('builderStepper'),
        builderStepBody=document.getElementById('builderStepBody'),
        builderQuickbar=document.getElementById('builderQuickbar'),
        builderLeftPane=document.getElementById('builderLeftPane'),
        builderRightPane=document.getElementById('builderRightPane'),
        builderSummaryText=document.getElementById('builderSummaryText'),
        modalBackdrop=document.getElementById('modalBackdrop'),
        modalCloseBtn=document.getElementById('modalCloseBtn'),
        timetableBody=document.getElementById('timetableBody'),
        bellListBody=document.getElementById('bellListBody'),
        appInternalVersion=document.getElementById('appInternalVersion'),
        appSystemVersion=document.getElementById('appSystemVersion'),
        devModeToggle=document.getElementById('devModeToggle'),
        toastNotice=document.getElementById('toastNotice'),
        tk=document.getElementById('tk'),
        hd=document.getElementById('hd'),
        clockGlowBoostGroup=document.getElementById('clockGlowBoostGroup'),
        hourHand=document.getElementById('hourHand'),
        minHandGroup=document.getElementById('minHandGroup'),
        minHandHit=document.getElementById('minHandHit'),
        minHand=document.getElementById('minHand'),
        secHand=document.getElementById('secHand'),
        keepAwakeToggle=document.getElementById('keepAwakeToggle'),
        mainBellGlowToggle=document.getElementById('mainBellGlowToggle'),
        prelimBellGlowToggle=document.getElementById('prelimBellGlowToggle');

  const INITIAL_CLEAN_DOC = (function(){
    const savedThemeAttr = document.documentElement.getAttribute('data-theme');
    const hadReady = document.documentElement.classList.contains('app-ready');
    document.documentElement.classList.remove('app-ready');
    document.documentElement.setAttribute('data-theme', 'light');
    const snapshot = '<!DOCTYPE html>\\n' + document.documentElement.outerHTML;
    if(savedThemeAttr) document.documentElement.setAttribute('data-theme', savedThemeAttr);
    if(hadReady) document.documentElement.classList.add('app-ready');
    return snapshot;
  })();

  const glOpts={antialias:false,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'};
  const gl=cv.getContext('webgl',glOpts)||cv.getContext('webgl',{antialias:false,alpha:true,preserveDrawingBuffer:true});

  const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS=\`precision highp float;
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
}\`;

  let U={},W=innerWidth,Hh=innerHeight,R=250,cx=innerWidth/2,cy=innerHeight*.5,dpr=Math.min(devicePixelRatio||1,2);
  let dockY=0,targetR=250,targetCx=innerWidth/2,targetCy=innerHeight*.5,targetDockY=0;
  let fromR=250,fromCx=innerWidth/2,fromCy=innerHeight*.5,fromDockY=0,layoutAnimStart=0,layoutAnimating=false,layoutRafId=0;
  function initGlProgram(){
    if(!gl)return;
    const mk=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
    const pr=gl.createProgram();
    gl.attachShader(pr,mk(gl.VERTEX_SHADER,VS));gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,FS));
    gl.linkProgram(pr);gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    ['uRes','uC','uR','uH','uB','uS'].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  }
  initGlProgram();

  let H=0,kT=0,kH=0,kX=0,dH=1,dT=1,dHnd=1,dX=1,phase='idle',t0=0,isPaused=false;
  let themePref='auto';
  let resolvedTheme='light';
  let themeUB=1.0,themeUS=0.0,fromUB=1.0,fromUS=0.0,targetUB=1.0,targetUS=0.0,themeAnimStart=0,themeRafId=0;
  let clockSyncMode='custom_cascaded_time';
  let openTimePopupNodeId = null;
  let popupHourDraft = '10';
  let popupMinDraft = '25';
  let popupTimeError = '';
  let customSequenceConfig = JSON.parse(JSON.stringify(EMBEDDED.defaultCustomSeqConfig));
  let draftSequenceConfig = JSON.parse(JSON.stringify(EMBEDDED.defaultCustomSeqConfig));
  let undoStack = [];
  let redoStack = [];
  let bookmarkFolders = [];
  let bookmarks = JSON.parse(JSON.stringify(EMBEDDED.defaultBookmarks || []));
  let activeBookmarkFolderFilter = 'all';
  let saveTargetFolderId = '';
  let isModalFolderInputOpen = false;
  let editingFolderId = null;
  let editingFolderDraft = '';
  let movingBookmarkId = null;
  let collapsedBookmarkFolders = {};
  let deletedBookmarkUndo = null;
  let deletedBookmarkTimer = null;
  let customBuiltPreset = null;
  let isTimetablePanelOpen = false;
  let timetableViewMode = 'all';
  let isTimetableOptionCollapsed = false;
  let activeRowId = EMBEDDED.presets[0].steps[0].id;
  let activeCustomNodeId = null;
  let expandedRtKey = null;
  let expandedRtInfoKey = null;
  let renamingBookmarkId = null;
  let renameBookmarkDraft = '';
  let isTemporaryStartPoint = false;
  let bellVolume = 1.0;
  let englishVolume = 1.0;
  let playbackSpeed = 1;
  let lastTriggeredBellCode = null;
  let scheduledStartTime = '08:05';
  let scheduledStartEnabled = false;
  let runAuxVisible = false;
  let runAuxHideTimer = null;
  let wakeLockSentinel = null;
  let wakeLockPendingPromise = null;
  let wakeLockReacquireTimer = null;
  let wakeLockIntentionalRelease = false;
  let wakeLockNativeBlocked = false;
  let wakeVideoProgressMs = 0;
  let wakeVideoCanvasCleanup = null;
  let wakeVideoResolvedUrl = '';
  const isAndroidUa = /Android/i.test(navigator.userAgent || '');
  (function initWakeVideoSrc(){
    if(!wakeLockVideo || !EMBEDDED.keepAwakeMp4) return;
    try{
      const b64Idx = EMBEDDED.keepAwakeMp4.indexOf('base64,');
      if(b64Idx!==-1 && typeof atob==='function' && typeof Blob!=='undefined' && typeof URL!=='undefined'){
        const bin = atob(EMBEDDED.keepAwakeMp4.slice(b64Idx+7));
        const bytes = new Uint8Array(bin.length);
        for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
        wakeVideoResolvedUrl = URL.createObjectURL(new Blob([bytes],{type:'video/mp4'}));
      }else{
        wakeVideoResolvedUrl = EMBEDDED.keepAwakeMp4;
      }
    }catch(_){
      wakeVideoResolvedUrl = EMBEDDED.keepAwakeMp4;
    }
    if(!wakeLockVideo.getAttribute('src')){
      wakeLockVideo.src = wakeVideoResolvedUrl;
    }
  })();
  let leftSearchQuery = '';
  let collapsedGroups = {};
  let expandedOmittedMap = {};
  let rowAlertMap = {};
  let batchFromMin = 80;
  let batchToMin = 60;
  let builderStep = 1;
  let step1SubjectFilter = {kor:true,math:true,eng:true,hist:true,inq1:true,inq2:true,lang2:false};
  let step1InqCount = 2;
  let keepScreenAwake = true;
  let mainBellGlowAnim = true;
  let prelimBellGlowAnim = true;
  let currentGlowBoost = 0;
  let glowReleaseStartPerf = 0;
  let glowReleaseFromBoost = 0;
  let handDragState = {
    pointerId: null,
    hand: null,
    handEl: null,
    startX: 0,
    startY: 0,
    latestX: 0,
    latestY: 0,
    isActivated: false,
    prevAngleDeg: 0,
    holdTimer: null
  };

  const RISE=1600,APPEAR_T0=1250,STAGE_OUT=400,STAGE_IN=STAGE_OUT,DUR_IN=STAGE_OUT,FADE_OUT_TOTAL=STAGE_OUT*3,DROP=1200;

  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
  const sm=(a,b,v)=>{v=clamp((v-a)/(b-a),0,1);return v*v*(3-2*v)};
  const easeSine=t=>.5-.5*Math.cos(Math.PI*clamp(t,0,1));

  function escapeHtml(str){
    return String(str==null?'':str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function cloneCfg(cfg){
    return {
      selectedNodeIds: Array.isArray(cfg && cfg.selectedNodeIds) ? cfg.selectedNodeIds.slice() : [],
      intervalMap: Object.assign({}, (cfg && cfg.intervalMap) || {}),
      intervalSecondsMap: Object.assign({}, (cfg && cfg.intervalSecondsMap) || {}),
      firstNodeCustomMinutes: (cfg && typeof cfg.firstNodeCustomMinutes==='number' && isFinite(cfg.firstNodeCustomMinutes)) ? cfg.firstNodeCustomMinutes : null,
      mutedNodeIds: Array.isArray(cfg && cfg.mutedNodeIds) ? cfg.mutedNodeIds.slice() : []
    };
  }
  const VALID_NODE_ID_SET = new Set((EMBEDDED.selectableCueNodes || []).map(n=>n.nodeId));
  function validateConfig(raw){
    const fallback = cloneCfg(EMBEDDED.defaultCustomSeqConfig);
    if(!raw || typeof raw!=='object') return {config:fallback, warnings:['설정 형식 오류로 기본값을 사용합니다.']};
    const warnings = [];
    const selectedNodeIds = [];
    if(Array.isArray(raw.selectedNodeIds)){
      raw.selectedNodeIds.forEach(id=>{
        if(typeof id==='string' && VALID_NODE_ID_SET.has(id) && !selectedNodeIds.includes(id)) selectedNodeIds.push(id);
      });
    }
    if(!selectedNodeIds.length){
      warnings.push('유효한 선택 타종이 없어 전체 기본 타종으로 복원했습니다.');
      return {config:fallback, warnings};
    }
    const intervalMap = {};
    if(raw.intervalMap && typeof raw.intervalMap==='object'){
      Object.keys(raw.intervalMap).forEach(k=>{
        const n = Number(raw.intervalMap[k]);
        if(isFinite(n)) intervalMap[k] = clamp(Math.round(n),1,600);
      });
    }
    const intervalSecondsMap = {};
    if(raw.intervalSecondsMap && typeof raw.intervalSecondsMap==='object'){
      Object.keys(raw.intervalSecondsMap).forEach(k=>{
        const n = Number(raw.intervalSecondsMap[k]);
        if(isFinite(n) && n>=5) intervalSecondsMap[k] = clamp(Math.round(n),5,36000);
      });
    }
    let firstNodeCustomMinutes = null;
    if(raw.firstNodeCustomMinutes!==null && raw.firstNodeCustomMinutes!==undefined){
      const fm = Number(raw.firstNodeCustomMinutes);
      if(isFinite(fm)) firstNodeCustomMinutes = clamp(Math.round(fm),0,1439);
    }
    const mutedNodeIds = [];
    if(Array.isArray(raw.mutedNodeIds)){
      raw.mutedNodeIds.forEach(id=>{
        if(typeof id==='string' && VALID_NODE_ID_SET.has(id) && !mutedNodeIds.includes(id)) mutedNodeIds.push(id);
      });
    }
    return {
      config:{selectedNodeIds, intervalMap, intervalSecondsMap, firstNodeCustomMinutes, mutedNodeIds},
      warnings
    };
  }
  function validateBookmarkFolders(rawList){
    if(!Array.isArray(rawList)) return [];
    const out = [];
    const seenIds = new Set();
    const seenNames = new Set();
    rawList.forEach((item, idx)=>{
      if(!item || typeof item!=='object') return;
      const name = typeof item.name==='string' ? item.name.trim().slice(0,30) : '';
      if(!name || seenNames.has(name)) return;
      const id = typeof item.id==='string' && item.id.trim() ? item.id.trim().slice(0,80) : ('bmf_'+Date.now()+'_'+idx);
      if(seenIds.has(id)) return;
      seenIds.add(id);
      seenNames.add(name);
      out.push({
        id,
        name,
        createdAt: typeof item.createdAt==='string' ? item.createdAt : new Date().toISOString()
      });
    });
    return out;
  }
  function validateBookmarks(rawList, validFolderIds){
    if(!Array.isArray(rawList)) return [];
    const out = [];
    rawList.forEach((item, idx)=>{
      if(!item || typeof item!=='object') return;
      const v = validateConfig(item.config);
      const name = typeof item.name==='string' && item.name.trim() ? item.name.trim().slice(0,40) : ('저장 구성 '+(idx+1));
      let folderId = typeof item.folderId==='string' && item.folderId.trim() ? item.folderId.trim().slice(0,80) : null;
      if(folderId && validFolderIds && !validFolderIds.has(folderId)) folderId = null;
      out.push({
        id: typeof item.id==='string' && item.id ? item.id : ('bm_'+Date.now()+'_'+idx),
        name,
        folderId,
        config: v.config,
        clockSyncMode: 'custom_cascaded_time',
        createdAt: typeof item.createdAt==='string' ? item.createdAt : new Date().toISOString()
      });
    });
    return out;
  }

  let toastTimer=null;
  function showToast(msg,durationMs){
    if(durationMs===undefined)durationMs=3200;
    toastNotice.textContent=msg;
    toastNotice.classList.add('show');
    if(toastTimer)clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>toastNotice.classList.remove('show'),durationMs);
  }

  function hmToMinutes(hm){
    if(!hm||typeof hm!=='string'||!hm.includes(':'))return 0;
    const parts=hm.split(':').map(Number);
    return (parts[0]||0)*60+(parts[1]||0);
  }
  function format24hTime(totalMinutes){
    const mins=((Math.floor(totalMinutes)%1440)+1440)%1440;
    const h24=Math.floor(mins/60);
    const m=mins%60;
    return String(h24).padStart(2,'0')+':'+String(m).padStart(2,'0');
  }
  function formatAmPm(totalMinutes){
    const mins=((Math.floor(totalMinutes)%1440)+1440)%1440;
    const h24=Math.floor(mins/60);
    const m=mins%60;
    const isPm=h24>=12;
    const h12=h24%12===0?12:h24%12;
    return String(h12).padStart(2,'0')+':'+String(m).padStart(2,'0')+' '+(isPm?'P.M.':'A.M.');
  }
  function renderClockTimeLabel(el,kicker,totalMinutes){
    if(!el)return;
    const dayOffset=Math.floor(totalMinutes/1440);
    const mins=((Math.floor(totalMinutes)%1440)+1440)%1440;
    const h24=Math.floor(mins/60);
    const m=mins%60;
    const isPm=h24>=12;
    const h12=h24%12===0?12:h24%12;
    const digits=String(h12).padStart(2,'0')+':'+String(m).padStart(2,'0');
    const meridiem=isPm?'PM':'AM';
    const dayText=dayOffset>0?'(+'+dayOffset+'일)':'';
    const cacheKey=kicker+'|'+digits+'|'+meridiem+'|'+dayText;
    if(el.dataset.lastKey===cacheKey)return;
    el.dataset.lastKey=cacheKey;
    const kickerEl=document.createElement('span');
    kickerEl.className='lab-kicker';
    kickerEl.textContent=kicker;
    const timeEl=document.createElement('span');
    timeEl.className='lab-time';
    const digitsEl=document.createElement('span');
    digitsEl.className='lab-digits';
    digitsEl.textContent=digits;
    const meridiemEl=document.createElement('span');
    meridiemEl.className='lab-meridiem';
    meridiemEl.textContent=meridiem;
    timeEl.append(digitsEl,meridiemEl);
    if(dayText){
      const dayEl=document.createElement('span');
      dayEl.className='lab-day';
      dayEl.textContent=dayText;
      timeEl.append(dayEl);
    }
    el.replaceChildren(kickerEl,timeEl);
  }
  function renderStageBadgeText(el,primaryText,nextText){
    if(!el)return;
    const cleanNext=nextText?String(nextText).trim():'';
    const cacheKey=primaryText+'|'+cleanNext;
    if(el.dataset.lastKey===cacheKey)return;
    el.dataset.lastKey=cacheKey;
    const primaryEl=document.createElement('span');
    primaryEl.className='stage-primary';
    primaryEl.textContent=primaryText;
    if(cleanNext){
      const nextEl=document.createElement('span');
      nextEl.className='stage-next';
      nextEl.textContent='다음 방송 · '+cleanNext;
      el.replaceChildren(primaryEl,nextEl);
    }else{
      el.replaceChildren(primaryEl);
    }
  }
  function formatDurationClock(msRemaining){
    const totalSec=Math.max(0,Math.ceil(msRemaining/1000));
    const h=Math.floor(totalSec/3600);
    const m=Math.floor((totalSec%3600)/60);
    const s=totalSec%60;
    if(h>0){
      return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    }
    return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }

  /* ---------- List-Detail Menu Category Switching (1단계 -> 2단계) ---------- */
  let activeMenuCat = null;
  const ldDetailCol = document.getElementById('ldDetailCol');
  const drawerBookmarkOpenBtn = document.getElementById('drawerBookmarkOpenBtn');
  const drawerBookmarkOpenLabel = document.getElementById('drawerBookmarkOpenLabel');
  const drawerBookmarkCard = document.getElementById('drawerBookmarkCard');

  function applyMenuCategoryState(nextCat){
    activeMenuCat = nextCat;
    if(drawerBookmarkCard) drawerBookmarkCard.classList.remove('open');
    if(drawerBookmarkOpenBtn) drawerBookmarkOpenBtn.classList.remove('is-selected');
    document.querySelectorAll('.ld-cat-btn').forEach(b=>{
      const cat = b.getAttribute('data-cat');
      const isSelected = activeMenuCat === cat;
      b.classList.toggle('is-selected', isSelected);
      b.classList.toggle('is-hidden', activeMenuCat !== null && !isSelected);
      const arrow = b.querySelector('.ld-cat-arrow');
      if(arrow) arrow.textContent = isSelected ? '‹' : '›';
    });
    if(ldDetailCol) ldDetailCol.classList.toggle('has-active', activeMenuCat !== null);
    document.querySelectorAll('.ld-pane').forEach(p=>{
      p.classList.toggle('active', activeMenuCat !== null && p.id==='pane_'+activeMenuCat);
    });
  }

  document.querySelectorAll('.ld-cat-btn').forEach(catBtn=>{
    catBtn.addEventListener('click',()=>{
      const cat = catBtn.getAttribute('data-cat');
      applyMenuCategoryState(activeMenuCat === cat ? null : cat);
    });
  });

  function isDocFullscreen(){
    return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function syncFullscreenBtnUI(){
    if(!fullscreenBtn) return;
    const active = isDocFullscreen();
    fullscreenBtn.classList.toggle('is-selected', active);
    fullscreenBtn.setAttribute('aria-pressed', active ? 'true' : 'false');
    fullscreenBtn.setAttribute('aria-label', active ? '전체 화면 종료' : '전체 화면');
    fullscreenBtn.setAttribute('title', active ? '전체 화면 종료' : '전체 화면');
    if(fullscreenIconSvg){
      fullscreenIconSvg.innerHTML = active
        ? '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" y1="10" x2="21" y2="3"/><line x1="3" y1="21" x2="10" y2="14"/>'
        : '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
    }
  }
  function setLeftMenuOpen(nextOpen){
    pillDrawer.classList.toggle('open', nextOpen);
    pillDrawer.classList.toggle('closed', !nextOpen);
    if(hamburgerBtn){
      hamburgerBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      hamburgerBtn.innerHTML = nextOpen
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
    }
    if(fullscreenBtn){
      fullscreenBtn.classList.toggle('is-open', nextOpen);
      fullscreenBtn.classList.toggle('is-closed', !nextOpen);
      fullscreenBtn.setAttribute('aria-hidden', nextOpen ? 'false' : 'true');
      fullscreenBtn.tabIndex = nextOpen ? 0 : -1;
    }
  }
  syncFullscreenBtnUI();
  document.addEventListener('fullscreenchange', syncFullscreenBtnUI);
  document.addEventListener('webkitfullscreenchange', syncFullscreenBtnUI);
  if(fullscreenBtn){
    fullscreenBtn.addEventListener('click', async ()=>{
      const rootEl = document.documentElement;
      try{ if(typeof draw==='function') draw(); }catch(_){}
      try{
        if(!isDocFullscreen()){
          if(rootEl.requestFullscreen){
            await rootEl.requestFullscreen();
          }else if(rootEl.webkitRequestFullscreen){
            await rootEl.webkitRequestFullscreen();
          }else{
            showToast('현재 브라우저에서는 전체 화면 전환을 지원하지 않습니다.');
          }
        }else{
          if(document.exitFullscreen){
            await document.exitFullscreen();
          }else if(document.webkitExitFullscreen){
            await document.webkitExitFullscreen();
          }
        }
      }catch(_){
        showToast('전체 화면 전환이 제한된 환경입니다.');
      }finally{
        syncFullscreenBtnUI();
      }
    });
  }

  function enterFullscreenSilently(){
    if(isDocFullscreen()) return;
    const rootEl = document.documentElement;
    try{ if(typeof draw==='function') draw(); }catch(_){}
    try{
      if(rootEl.requestFullscreen){
        const p = rootEl.requestFullscreen();
        if(p && typeof p.catch==='function') p.catch(()=>{});
      }else if(rootEl.webkitRequestFullscreen){
        const p = rootEl.webkitRequestFullscreen();
        if(p && typeof p.catch==='function') p.catch(()=>{});
      }
    }catch(_){}
  }

  function exitFullscreenSilently(){
    if(!isDocFullscreen()) return;
    try{ if(typeof draw==='function') draw(); }catch(_){}
    try{
      if(document.exitFullscreen){
        const p = document.exitFullscreen();
        if(p && typeof p.catch==='function') p.catch(()=>{});
      }else if(document.webkitExitFullscreen){
        const p = document.webkitExitFullscreen();
        if(p && typeof p.catch==='function') p.catch(()=>{});
      }
    }catch(_){}
  }

  hamburgerBtn.addEventListener('click', ()=>{
    const isOpen = pillDrawer.classList.contains('open');
    setLeftMenuOpen(!isOpen);
    applyMenuCategoryState(null);
  });

  const topLeftMenuEl = document.getElementById('topLeftMenu');
  document.addEventListener('pointerdown', e=>{
    if(!pillDrawer || !pillDrawer.classList.contains('open') || !topLeftMenuEl) return;
    const t = e.target;
    if(t && topLeftMenuEl.contains(t)) return;
    if(t && t.closest && t.closest('#builderModalBackdrop, #modalBackdrop, #rightTimetablePanel, #playbackSettingsPanel')) return;
    const GRACE_PX = 44;
    const x = e.clientX;
    const y = e.clientY;
    const subSelectors = ['.top-left-bar', '.ld-master-col', '.ld-detail-col.has-active'];
    for(let i=0;i<subSelectors.length;i++){
      const el = topLeftMenuEl.querySelector(subSelectors[i]);
      if(!el) continue;
      const r = el.getBoundingClientRect();
      if(r.width<=0 || r.height<=0) continue;
      if(x >= r.left - GRACE_PX && x <= r.right + GRACE_PX && y >= r.top - GRACE_PX && y <= r.bottom + GRACE_PX){
        return;
      }
    }
    setLeftMenuOpen(false);
    applyMenuCategoryState(null);
  }, {passive:true});

  /* ---------- Theme & Sync Mode Management ---------- */
  const mediaDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function applyTheme(pref, skipSave){
    themePref = pref;
    if(pref==='auto'){
      resolvedTheme = (mediaDark && mediaDark.matches) ? 'dark' : 'light';
    }else{
      resolvedTheme = pref;
    }
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    const favEl = document.getElementById('app-favicon');
    if(favEl){
      favEl.setAttribute('href', resolvedTheme==='dark' ? EMBEDDED.faviconDark : EMBEDDED.faviconLight);
    }
    const tcEl = document.getElementById('theme-color-meta');
    if(tcEl){
      tcEl.setAttribute('content', resolvedTheme==='dark' ? '#121212' : (resolvedTheme==='sepia' ? '#e6dcc8' : '#ecebe9'));
    }
    document.querySelectorAll('.theme-chip').forEach(el=>{
      el.classList.toggle('active', el.getAttribute('data-theme-pref')===pref);
    });
    const nextUB = resolvedTheme==='dark' ? 0.0 : 1.0;
    const nextUS = resolvedTheme==='sepia' ? 1.0 : 0.0;
    if(Math.abs(themeUB-nextUB)<0.001 && Math.abs(themeUS-nextUS)<0.001){
      themeUB=nextUB; themeUS=nextUS; draw();
    }else{
      if(themeRafId) cancelAnimationFrame(themeRafId);
      fromUB=themeUB; fromUS=themeUS; targetUB=nextUB; targetUS=nextUS;
      themeAnimStart=performance.now();
      const stepTheme=(now)=>{
        const p=clamp((now-themeAnimStart)/380,0,1);
        const e=easeSine(p);
        themeUB=fromUB+(targetUB-fromUB)*e;
        themeUS=fromUS+(targetUS-fromUS)*e;
        draw();
        if(p<1){ themeRafId=requestAnimationFrame(stepTheme); }
        else{ themeUB=targetUB; themeUS=targetUS; themeRafId=0; draw(); }
      };
      themeRafId=requestAnimationFrame(stepTheme);
    }
    if(!skipSave) saveCustomSettings();
  }

  function applyClockSyncMode(_mode, skipSave){
    clockSyncMode = 'custom_cascaded_time';
    if(phase==='idle') syncUiToPresetIdle();
    renderBuilderModal();
    if(!skipSave) saveCustomSettings();
  }

  if(mediaDark){
    const onSysChange = ()=>{
      if(themePref==='auto') applyTheme('auto', true);
    };
    if(mediaDark.addEventListener) mediaDark.addEventListener('change', onSysChange);
    else if(mediaDark.addListener) mediaDark.addListener(onSysChange);
  }

  document.querySelectorAll('.theme-chip').forEach(chip=>{
    chip.addEventListener('click', ()=>{
      applyTheme(chip.getAttribute('data-theme-pref'), false);
    });
  });

  /* ---------- Audio Controllers (B1: Separate Preview Player, B5: Volume & Mute) ---------- */
  const bellPlayer=new Audio();
  bellPlayer.preload='auto';
  let activeBellAudio=null;
  let bellPausedByTimer=false;

  const previewPlayer=new Audio();
  previewPlayer.preload='auto';
  let previewingCode=null;
  let previewProgress=0;

  const englishAudio=new Audio();
  englishAudio.preload='auto';
  let englishObjectUrl=null;
  let englishFileName='';
  let englishPlaying=false;

  function isNodeMuted(nodeOrCode){
    const muted = (customSequenceConfig && Array.isArray(customSequenceConfig.mutedNodeIds)) ? customSequenceConfig.mutedNodeIds : [];
    return muted.includes(nodeOrCode);
  }

  function playBellCueItem(cueItem, silentIfMuted){
    if(!cueItem)return;
    if(silentIfMuted !== false && isNodeMuted(cueItem.code)){
      showToast('['+cueItem.code+'] '+cueItem.title+' (음소거 설정으로 소리 생략)', 2200);
      return;
    }
    stopBell();
    stopPreviewBell();
    const customUri = EMBEDDED.customMp3DataUris && EMBEDDED.customMp3DataUris[cueItem.code];
    const fallbackUri = EMBEDDED.bellDataUris && EMBEDDED.bellDataUris[cueItem.fallbackBellType];
    const srcUri = customUri || fallbackUri;
    if(!srcUri)return;
    bellPlayer.volume = clamp(bellVolume,0,1);
    bellPlayer.src = srcUri;
    bellPlayer.currentTime = 0;
    activeBellAudio = bellPlayer;
    bellPausedByTimer = false;
    lastTriggeredBellCode = cueItem.code;
    updateDockAndAuxUI();
    const p = bellPlayer.play();
    if(p&&typeof p.catch==='function'){
      p.catch(()=>{
        if(customUri && fallbackUri && bellPlayer.src !== fallbackUri){
          bellPlayer.src = fallbackUri;
          bellPlayer.currentTime = 0;
          const p2 = bellPlayer.play();
          if(p2&&typeof p2.catch==='function')p2.catch(()=>{});
        }else{
          showToast('오디오 자동 재생이 제한되었습니다. 화면을 한 번 터치해 주세요.', 3200);
        }
      });
    }
    showToast('['+cueItem.code+'] '+cueItem.title+' 타종 재생', 2800);
  }

  function stopPreviewBell(){
    previewPlayer.pause();
    previewPlayer.currentTime = 0;
    previewingCode = null;
    previewProgress = 0;
    updatePreviewButtonsUI();
  }

  function togglePreviewBell(code){
    if(phase==='rise'||phase==='hold'){
      showToast('타이머 진행 중에는 미리듣기를 사용할 수 없습니다.', 2400);
      return;
    }
    if(previewingCode===code){
      stopPreviewBell();
      return;
    }
    const cueItem = (EMBEDDED.bellFiles37||[]).find(b=>b.code===code);
    if(!cueItem)return;
    stopPreviewBell();
    const customUri = EMBEDDED.customMp3DataUris && EMBEDDED.customMp3DataUris[cueItem.code];
    const fallbackUri = EMBEDDED.bellDataUris && EMBEDDED.bellDataUris[cueItem.fallbackBellType];
    const srcUri = customUri || fallbackUri;
    if(!srcUri)return;
    previewPlayer.volume = clamp(bellVolume,0,1);
    previewPlayer.src = srcUri;
    previewPlayer.currentTime = 0;
    previewingCode = code;
    previewProgress = 0;
    updatePreviewButtonsUI();
    const p = previewPlayer.play();
    if(p&&typeof p.catch==='function'){
      p.catch(()=>stopPreviewBell());
    }
  }

  previewPlayer.addEventListener('timeupdate', ()=>{
    if(!previewingCode)return;
    const dur = previewPlayer.duration || (EMBEDDED.bellDurationSecMap && EMBEDDED.bellDurationSecMap[previewingCode]) || 15;
    previewProgress = dur>0 ? clamp((previewPlayer.currentTime/dur)*100,0,100) : 0;
    updatePreviewButtonsUI();
  });
  previewPlayer.addEventListener('ended', ()=>stopPreviewBell());

  function updatePreviewButtonsUI(){
    document.querySelectorAll('button[data-preview-bell]').forEach(btnEl=>{
      const code = btnEl.getAttribute('data-preview-bell');
      const isPlaying = previewingCode === code;
      const durSec = (EMBEDDED.bellDurationSecMap && EMBEDDED.bellDurationSecMap[code]) || 10;
      btnEl.classList.toggle('active', isPlaying);
      btnEl.innerHTML = isPlaying
        ? \`<span class="preview-progress-fill" style="width:\${previewProgress.toFixed(1)}%"></span><span style="position:relative;z-index:1">정지 (\${durSec}초)</span>\`
        : \`<span style="position:relative;z-index:1">미리듣기 (\${durSec}초)</span>\`;
    });
  }

  function pauseBell(){
    if(activeBellAudio&&!activeBellAudio.paused&&!activeBellAudio.ended){
      activeBellAudio.pause();
      bellPausedByTimer=true;
    }
  }
  function resumeBell(){
    if(activeBellAudio&&bellPausedByTimer){
      bellPausedByTimer=false;
      const p=activeBellAudio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }
  }
  function stopBell(){
    if(activeBellAudio){
      activeBellAudio.pause();
      activeBellAudio.currentTime=0;
      activeBellAudio=null;
    }
    bellPausedByTimer=false;
  }

  function startEnglishAudioIfNeeded(triggerTimeLabel){
    if(!triggerTimeLabel)triggerTimeLabel='13:07';
    if(isNodeMuted('ENG_1307')){
      showToast('['+triggerTimeLabel+'] 영어 듣기평가 (음소거 설정으로 생략)', 2500);
      return;
    }
    if(englishPlaying)return;
    if(!englishObjectUrl){
      showToast('['+triggerTimeLabel+'] 선택된 영어 듣기평가 음원이 없습니다. 좌측 상단 메뉴에서 음원 파일을 선택해 주세요.',4000);
      return;
    }
    englishAudio.volume = clamp(englishVolume,0,1);
    englishAudio.muted=false;
    englishPlaying=true;
    englishAudio.currentTime=0;
    const p=englishAudio.play();
    if(p&&typeof p.then==='function'){
      p.then(()=>{
        showToast('['+triggerTimeLabel+'] 영어 듣기평가 음원 재생 시작: '+englishFileName,3400);
      }).catch(()=>{
        englishPlaying=false;
        showToast('영어 듣기평가 음원을 재생할 수 없습니다.',3600);
      });
    }else{
      showToast('['+triggerTimeLabel+'] 영어 듣기평가 음원 재생 시작: '+englishFileName,3400);
    }
  }
  function pauseEnglishAudio(){
    if(englishPlaying&&!englishAudio.paused)englishAudio.pause();
  }
  function resumeEnglishAudio(){
    if(englishPlaying&&englishAudio.paused&&!englishAudio.ended){
      const p=englishAudio.play();
      if(p&&typeof p.catch==='function')p.catch(()=>{});
    }
  }
  function stopEnglishAudio(){
    englishAudio.pause();
    englishAudio.currentTime=0;
    englishPlaying=false;
  }

  if(bellVolSlider){
    bellVolSlider.addEventListener('input', ()=>{
      bellVolume = clamp(Number(bellVolSlider.value)||0,0,1);
      bellVolSlider.style.setProperty('--slider-pct', Math.round(bellVolume*100)+'%');
      if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
      bellPlayer.volume = bellVolume;
      previewPlayer.volume = bellVolume;
      saveCustomSettings();
    });
  }
  if(engVolSlider){
    engVolSlider.addEventListener('input', ()=>{
      englishVolume = clamp(Number(engVolSlider.value)||0,0,1);
      engVolSlider.style.setProperty('--slider-pct', Math.round(englishVolume*100)+'%');
      if(engVolPct) engVolPct.textContent = Math.round(englishVolume*100)+'%';
      englishAudio.volume = englishVolume;
      saveCustomSettings();
    });
  }

  /* ---------- Custom Sequence Computation & Analysis (B2, C2, C3) ---------- */
  function getDefaultIntervalBetweenNodes(fromNode, toNode){
    return Math.max(1, toNode.originalMinutes - fromNode.originalMinutes);
  }

  function analyzeSequenceConfig(cfg){
    const allNodes = EMBEDDED.selectableCueNodes || [];
    const selectedSet = new Set(cfg.selectedNodeIds || []);
    const orderedNodes = [];
    const orderedIndices = [];
    allNodes.forEach((n, idx)=>{
      if(selectedSet.has(n.nodeId)){
        orderedNodes.push(n);
        orderedIndices.push(idx);
      }
    });
    const groupStats = {};
    (EMBEDDED.subjectGroups||[]).forEach(g=>{
      const gNodes = allNodes.filter(n=>n.subjectGroupId===g.id);
      const sel = gNodes.filter(n=>selectedSet.has(n.nodeId)).length;
      groupStats[g.id] = {selectedCount:sel, totalCount:gNodes.length, allSelected:gNodes.length>0 && sel===gNodes.length};
    });
    if(!orderedNodes.length){
      return {rows:[], omittedBeforeFirst:[], omittedAfterLast:[], totalDurationMinutes:0, totalDurationSeconds:0, groupStats, diagnostics:[]};
    }
    const omittedBeforeFirst = allNodes.slice(0, orderedIndices[0]);
    const omittedAfterLast = allNodes.slice(orderedIndices[orderedIndices.length-1]+1);
    const rows = [];
    let currentCustomMinutes = (typeof cfg.firstNodeCustomMinutes === 'number' && !isNaN(cfg.firstNodeCustomMinutes))
      ? cfg.firstNodeCustomMinutes
      : orderedNodes[0].originalMinutes;
    let totalDurationSeconds = 0;

    for(let i=0;i<orderedNodes.length;i++){
      const node = orderedNodes[i];
      const nextNode = i < orderedNodes.length - 1 ? orderedNodes[i+1] : null;
      const pairKey = node.nodeId + '__' + (nextNode ? nextNode.nodeId : 'SINGLE_END');
      const defaultMin = nextNode ? getDefaultIntervalBetweenNodes(node, nextNode) : 5;
      const savedMin = cfg.intervalMap && cfg.intervalMap[pairKey];
      const savedSec = cfg.intervalSecondsMap && cfg.intervalSecondsMap[pairKey];
      let intervalSec;
      let intervalMin;
      if(typeof savedSec==='number' && isFinite(savedSec) && savedSec>=5){
        intervalSec = clamp(Math.round(savedSec),5,36000);
        intervalMin = Math.max(1, Math.round(intervalSec/60));
      }else{
        intervalMin = (typeof savedMin==='number' && savedMin>=1) ? clamp(Math.round(savedMin),1,600) : defaultMin;
        intervalSec = intervalMin * 60;
      }
      const omittedAfter = nextNode ? allNodes.slice(orderedIndices[i]+1, orderedIndices[i+1]) : [];
      const durSec = node.durationSec || (node.bellCode && EMBEDDED.bellDurationSecMap && EMBEDDED.bellDurationSecMap[node.bellCode]) || 0;
      const truncationWarning = (durSec>0 && intervalSec < durSec)
        ? ('타종 길이('+durSec+'초)보다 간격('+intervalSec+'초)이 짧아 음원이 잘릴 수 있습니다.')
        : null;
      const missingEngListeningNotice = (node.nodeId==='016' && nextNode && nextNode.nodeId!=='ENG_1307' && !selectedSet.has('ENG_1307'))
        ? '13:07 영어 듣기평가 본령 단계가 체크 해제되어 듣기 음원이 자동 재생되지 않습니다.'
        : null;

      rows.push({
        node,
        index: i,
        pairKey,
        customTimeMinutes: currentCustomMinutes,
        dayOffset: Math.floor(currentCustomMinutes / 1440),
        intervalAfterMinutes: intervalMin,
        intervalAfterSeconds: intervalSec,
        defaultIntervalMinutes: defaultMin,
        nextNode,
        omittedAfter,
        truncationWarning,
        missingEngListeningNotice
      });
      if(nextNode || orderedNodes.length===1){
        totalDurationSeconds += intervalSec;
      }
      currentCustomMinutes += intervalSec / 60;
    }

    const diagnostics = [];
    const byGroup = {};
    orderedNodes.forEach(n=>{
      if(!byGroup[n.subjectGroupId]) byGroup[n.subjectGroupId] = [];
      byGroup[n.subjectGroupId].push(n);
    });
    Object.keys(byGroup).forEach(gid=>{
      const list = byGroup[gid];
      const hasMain = list.some(n=>n.stageType==='main'||n.stageType==='listening');
      const hasEnd = list.some(n=>n.stageType==='end');
      const gTitle = list[0].subjectTitle;
      if(hasMain && !hasEnd){
        const endNode = allNodes.find(n=>n.subjectGroupId===gid && n.stageType==='end');
        if(endNode) diagnostics.push({type:'warn', message:gTitle+' 본령이 선택되었으나 종료령이 빠져 있습니다.', fixNodeId:endNode.nodeId, fixLabel:endNode.stageShortLabel+' 추가'});
      }else if(!hasMain && hasEnd){
        const mainNode = allNodes.find(n=>n.subjectGroupId===gid && (n.stageType==='main'||n.stageType==='listening'));
        if(mainNode) diagnostics.push({type:'warn', message:gTitle+' 종료령만 선택되고 본령이 빠져 있습니다.', fixNodeId:mainNode.nodeId, fixLabel:mainNode.stageShortLabel+' 추가'});
      }
      if(gid==='eng' && selectedSet.has('016') && !selectedSet.has('ENG_1307')){
        diagnostics.push({type:'info', message:'3교시 영어 준비령(016) 이후 13:07 듣기평가 안내방송 노드가 선택되지 않았습니다.', fixNodeId:'ENG_1307', fixLabel:'13:07 듣기 추가'});
      }
    });

    return {
      rows,
      omittedBeforeFirst,
      omittedAfterLast,
      totalDurationMinutes: Math.max(1, Math.round(totalDurationSeconds/60)),
      totalDurationSeconds,
      groupStats,
      diagnostics
    };
  }

  function computeSequenceNodeRows(cfg){
    return analyzeSequenceConfig(cfg).rows;
  }

  function buildCustomSequencePreset(cfg){
    const analysis = analyzeSequenceConfig(cfg);
    const rows = analysis.rows;
    if(!rows.length) return null;
    const steps = [];
    let cumulativeMinutes = 0;

    if(rows.length === 1){
      const only = rows[0];
      const dur = Math.max(1/12, only.intervalAfterSeconds / 60);
      steps.push({
        id: 'custom_seq_0_'+only.node.nodeId,
        periodLabel: only.node.periodLabel,
        displayTitle: only.node.subjectTitle,
        timeRangeText: format24hTime(only.customTimeMinutes)+' ('+only.intervalAfterMinutes+'분)',
        startMinutes: 0,
        endMinutes: dur,
        originalStartMinutes: only.node.originalMinutes,
        originalEndMinutes: only.node.originalMinutes + dur,
        customStartMinutes: only.customTimeMinutes,
        customEndMinutes: only.customTimeMinutes + dur,
        durationMinutes: dur,
        category: only.node.stageShortLabel,
        description: only.node.fullTitle+' ('+only.intervalAfterMinutes+'분 진행)',
        startBellCode: only.node.bellCode,
        startNodeId: only.node.nodeId,
        stageType: only.node.stageType,
        triggersEnglishAudioAtStart: Boolean(only.node.triggersEnglishListening),
        stopsEnglishAudioAtEnd: only.node.subjectGroupId === 'eng',
        usesEnglishAudio: only.node.subjectGroupId === 'eng'
      });
      cumulativeMinutes = dur;
    }else{
      for(let i=0;i<rows.length-1;i++){
        const curr = rows[i];
        const next = rows[i+1];
        const dur = Math.max(1/12, curr.intervalAfterSeconds / 60);
        const isJump = curr.node.subjectGroupId !== next.node.subjectGroupId;
        const cat = isJump
          ? (curr.node.stageShortLabel + ' → ' + next.node.subjectTitle + ' ' + next.node.stageShortLabel + ' 대기')
          : (curr.node.stageShortLabel + ' → ' + next.node.stageShortLabel);
        const isLast = i === rows.length - 2;
        steps.push({
          id: 'custom_seq_'+i+'_'+curr.node.nodeId+'_'+next.node.nodeId,
          periodLabel: curr.node.periodLabel,
          displayTitle: curr.node.subjectTitle,
          timeRangeText: format24hTime(curr.customTimeMinutes)+'~'+format24hTime(next.customTimeMinutes)+' ('+curr.intervalAfterMinutes+'분)',
          startMinutes: cumulativeMinutes,
          endMinutes: cumulativeMinutes + dur,
          originalStartMinutes: curr.node.originalMinutes,
          originalEndMinutes: next.node.originalMinutes,
          customStartMinutes: curr.customTimeMinutes,
          customEndMinutes: next.customTimeMinutes,
          durationMinutes: dur,
          category: cat,
          description: curr.node.fullTitle+' 후 '+curr.intervalAfterMinutes+'분 뒤 '+next.node.fullTitle,
          startBellCode: curr.node.bellCode,
          startNodeId: curr.node.nodeId,
          stageType: curr.node.stageType,
          endBellCode: isLast ? next.node.bellCode : undefined,
          triggersEnglishAudioAtStart: Boolean(curr.node.triggersEnglishListening),
          stopsEnglishAudioAtStart: curr.node.subjectGroupId !== 'eng' || Boolean(curr.node.isEndBell),
          stopsEnglishAudioAtEnd: isLast && (next.node.subjectGroupId !== 'eng' || Boolean(next.node.isEndBell)),
          usesEnglishAudio: curr.node.subjectGroupId === 'eng'
        });
        cumulativeMinutes += dur;
      }
    }

    const subjSet = [];
    rows.forEach(r=>{
      const s = r.node.subjectTitle.replace(' 영역','');
      if(!subjSet.includes(s)) subjSet.push(s);
    });
    const subjSummary = subjSet.length <= 3 ? subjSet.join('·') : (subjSet[0]+' 외 '+(subjSet.length-1)+'개 영역');
    const dispTotalMin = Math.max(1, Math.round(cumulativeMinutes));

    return {
      id: 'custom_checkbox_sequence',
      group: 'custom_sequence',
      label: '선택 진행: ' + subjSummary + ' (' + rows.length + '개 타종 · 총 ' + dispTotalMin + '분)',
      shortLabel: '선택 진행 (' + dispTotalMin + '분)',
      displayTitle: rows[0].node.subjectTitle,
      startMinutes: 0,
      endMinutes: cumulativeMinutes,
      steps,
      isCustomSequence: true,
      totalDurationMinutes: dispTotalMin
    };
  }

  /* ---------- CSAT Timer State & 37 Bell Cue Matching ---------- */
  let currentPreset=EMBEDDED.presets[0];
  let accumulatedElapsedMs=0;
  let lastTickPerf=0;
  let triggeredCues=new Set();

  function updateClockHandsForMinutes(exactMinutes){
    const mins=((exactMinutes%720)+720)%720;
    const minInHour=mins%60;
    const mAngleRad=(minInHour*6)*Math.PI/180;
    const hx=88*Math.sin(mAngleRad);
    const hy=-88*Math.cos(mAngleRad);
    minHand.setAttribute('x2',hx.toFixed(2));
    minHand.setAttribute('y2',hy.toFixed(2));
    if(minHandHit){
      const hx1=10*Math.sin(mAngleRad);
      const hy1=-10*Math.cos(mAngleRad);
      minHandHit.setAttribute('x1',hx1.toFixed(2));
      minHandHit.setAttribute('y1',hy1.toFixed(2));
      minHandHit.setAttribute('x2',hx.toFixed(2));
      minHandHit.setAttribute('y2',hy.toFixed(2));
    }
    const baseHourDeg=(mins/60)*30-90+7.5;
    hourHand.setAttribute('transform','rotate('+baseHourDeg.toFixed(2)+')');
    if(secHand){
      const secInMin=(((exactMinutes*60)%60)+60)%60;
      const secDeg=secInMin*6;
      secHand.setAttribute('transform','rotate('+secDeg.toFixed(3)+')');
    }
  }

  function applyClockGlowBoost(boost){
    currentGlowBoost = boost;
    if(clockGlowBoostGroup){
      if(Math.abs(boost)<0.0005){
        clockGlowBoostGroup.style.transform = 'scale(1)';
        clockGlowBoostGroup.style.filter = 'none';
      }else{
        const scale = (1 + boost * 0.34).toFixed(4);
        const sat = Math.max(0.62, 1 + boost * 1.65).toFixed(3);
        const bri = Math.max(0.80, 1 + boost * 0.42).toFixed(3);
        const extraBlurPx = Math.max(0, boost * 18).toFixed(2);
        clockGlowBoostGroup.style.transform = 'scale('+scale+')';
        clockGlowBoostGroup.style.filter = Number(extraBlurPx) > 0.05
          ? 'blur('+extraBlurPx+'px) saturate('+sat+') brightness('+bri+')'
          : 'saturate('+sat+') brightness('+bri+')';
      }
    }
    if(face){
      const stops = face.querySelectorAll('stop[data-base-op]');
      const opMul = Math.max(0.32, 1 + boost * 1.75);
      stops.forEach(stEl=>{
        const baseOp = parseFloat(stEl.getAttribute('data-base-op') || '0');
        const nextOp = clamp(baseOp * opMul, 0, 0.98);
        stEl.setAttribute('stop-opacity', nextOp.toFixed(3));
      });
    }
  }

  function findActiveStep(simMinutes){
    const steps=currentPreset.steps;
    for(let i=0;i<steps.length;i++){
      const st=steps[i];
      if(simMinutes>=st.startMinutes&&simMinutes<st.endMinutes)return st;
    }
    return steps[steps.length-1];
  }

  function updateDockAndAuxUI(){
    if(!dockStatusBadges)return;
    let html = '';
    if(scheduledStartEnabled && phase==='idle'){
      html += \`<span class="status-pill-badge">\${escapeHtml(scheduledStartTime)} 자동 시작 대기 <button type="button" data-cancel-sched="1">해제</button></span>\`;
    }
    if(isTemporaryStartPoint && phase==='idle'){
      html += \`<span class="status-pill-badge">임시 시작 지점 <button type="button" data-restore-seq="1">내 선택 구성 복귀</button></span>\`;
    }
    dockStatusBadges.innerHTML = html;
    updateAuxBellButtonsState();
  }

  function updateAuxBellButtonsState(){
    const isRunning = (phase==='rise'||phase==='hold');
    if(auxReplayBellBtn) auxReplayBellBtn.disabled = !isRunning;
    if(!isRunning){
      if(auxPrevBellBtn) auxPrevBellBtn.disabled = true;
      if(auxNextBellBtn) auxNextBellBtn.disabled = true;
      return;
    }
    const pts = getRunningBellBoundariesSec();
    const currSec = accumulatedElapsedMs / 1000;
    let activeIdx = 0;
    for(let i=0;i<pts.length;i++){
      if(pts[i] <= currSec + 0.05) activeIdx = i;
      else break;
    }
    if(auxPrevBellBtn) auxPrevBellBtn.disabled = (pts.length <= 1 || activeIdx <= 0);
    if(auxNextBellBtn) auxNextBellBtn.disabled = (pts.length <= 1 || activeIdx >= pts.length - 1);
  }

  if(dockStatusBadges){
    dockStatusBadges.addEventListener('click', e=>{
      if(e.target.closest('button[data-cancel-sched]')){
        scheduledStartEnabled = false;
        if(schedToggleBtn) schedToggleBtn.textContent = '예약';
        if(schedStatusMeta) schedStatusMeta.textContent = '해제됨';
        updateDockAndAuxUI();
      }else if(e.target.closest('button[data-restore-seq]')){
        const built = buildCustomSequencePreset(customSequenceConfig);
        if(built){
          customBuiltPreset = built;
          currentPreset = built;
          isTemporaryStartPoint = false;
          syncUiToPresetIdle();
          showToast('원래 선택 구성 첫 단계로 복귀했습니다.');
        }
      }
    });
  }

  function updateMuteStatusMeta(){
    if(!muteStatusMeta) return;
    const mutedLen = (customSequenceConfig && Array.isArray(customSequenceConfig.mutedNodeIds)) ? customSequenceConfig.mutedNodeIds.length : 0;
    muteStatusMeta.textContent = mutedLen > 0 ? ('무음 '+mutedLen+'개') : '전체 활성';
  }

  function syncUiToPresetIdle(){
    const firstStep=currentPreset.steps[0];
    const isCustomSeq=Boolean(currentPreset.isCustomSequence);
    const dispStartMin = isCustomSeq
      ? firstStep.customStartMinutes
      : currentPreset.startMinutes;
    const dispEndMin = isCustomSeq
      ? firstStep.customEndMinutes
      : currentPreset.endMinutes;
    const idleRemainMs = isCustomSeq
      ? (firstStep.durationMinutes * 60 * 1000)
      : ((currentPreset.endMinutes-currentPreset.startMinutes)*60*1000);

    const idleCatText = firstStep.category || '';
    const isIdleMainExam =
      firstStep.stageType==='main' ||
      firstStep.stageType==='listening' ||
      idleCatText.indexOf('본령')===0 ||
      idleCatText.indexOf('듣기평가 안내방송 및 본령')!==-1;
    let idleExamEndMin = firstStep.endMinutes;
    if(isIdleMainExam && (currentPreset.steps.length>1 || isCustomSeq)){
      for(let j=1;j<currentPreset.steps.length;j++){
        const nxt=currentPreset.steps[j];
        const nxtCat=nxt.category||'';
        const isSameGroup = nxt.displayTitle===firstStep.displayTitle || (nxt.periodLabel!=='-' && nxt.periodLabel===firstStep.periodLabel);
        const isWarnFollow = nxt.stageType==='warn' || nxtCat.indexOf('종료 10분 전')===0 || nxtCat.indexOf('종료 5분 전')===0;
        if(isSameGroup && isWarnFollow) idleExamEndMin = nxt.endMinutes;
        else break;
      }
    }
    const finalIdleRemainMs = (isIdleMainExam && idleExamEndMin > firstStep.endMinutes)
      ? ((idleExamEndMin - firstStep.startMinutes)*60*1000)
      : idleRemainMs;

    title.textContent=currentPreset.displayTitle;
    document.title='2027학년도 대학수학능력시험 시험장 안내방송 · 수능 타종 · 수능 방송 · 수능 알림';
    startLab && renderClockTimeLabel(startLab,'START TIME',dispStartMin);
    startLab.style.opacity='1';
    endLab && renderClockTimeLabel(endLab,'END TIME',dispEndMin);
    endLab.style.opacity='0.48';
    remainDigits.textContent=formatDurationClock(finalIdleRemainMs);
    const idlePrefix = firstStep.periodLabel!=='-' ? firstStep.periodLabel+' · ' : '';
    if(idleCatText.indexOf(' → ')!==-1){
      const idleParts = idleCatText.split(' → ');
      renderStageBadgeText(stageBadge, idlePrefix + idleParts[0] + ' 대기', idleParts.slice(1).join(' → '));
    }else{
      renderStageBadgeText(stageBadge, idlePrefix + idleCatText + ' 대기');
    }
    syncActiveStepHighlight(firstStep, isCustomSeq);
    glowReleaseStartPerf = 0;
    glowReleaseFromBoost = 0;
    applyClockGlowBoost(0);
    updateClockHandsForMinutes(dispStartMin);
    renderTimetableRows(activeRowId);
    if(typeof renderRightTimetableList==='function')renderRightTimetableList();
    if(builderBtnLabel){
      builderBtnLabel.textContent = '영역 · 타종 선택 구성 (' + (customSequenceConfig.selectedNodeIds ? customSequenceConfig.selectedNodeIds.length : 0) + '개 선택)';
    }
    updateMuteStatusMeta();
    updateDockAndAuxUI();
  }

  function syncActiveStepHighlight(step, isCustomSeq){
    if(!step)return;
    let nextRowId = step.id;
    let nextNodeId = step.startNodeId || null;
    if(isCustomSeq){
      if(!nextNodeId && step.id && step.id.indexOf('custom_seq_')===0){
        const rest=step.id.replace(/^custom_seq_\\d+_/, '');
        const cueList = EMBEDDED.selectableCueNodes || EMBEDDED.cueNodes || [];
        const matchedNode=cueList.find(n=>rest===n.nodeId || rest.indexOf(n.nodeId+'_')===0);
        nextNodeId=matchedNode ? matchedNode.nodeId : null;
      }
      const origMin = typeof step.originalStartMinutes==='number' ? step.originalStartMinutes : step.startMinutes;
      const matchedFullRow = (EMBEDDED.timetable||[]).find(r=>
        (step.startBellCode && (r.startBellCode===step.startBellCode || r.endBellCode===step.startBellCode)) ||
        (Math.abs(r.startMinutes - origMin)<0.5 && r.periodLabel===step.periodLabel)
      ) || (EMBEDDED.timetable||[]).find(r=>origMin>=r.startMinutes && origMin<r.endMinutes);
      if(matchedFullRow) nextRowId = matchedFullRow.id;
    }else{
      if(!nextNodeId){
        const cueList = EMBEDDED.selectableCueNodes || EMBEDDED.cueNodes || [];
        const matchedCue = cueList.find(n=>
          (step.startBellCode && n.bellCode===step.startBellCode) ||
          (Math.abs(n.originalMinutes - step.startMinutes)<0.5 && n.periodLabel===step.periodLabel)
        );
        nextNodeId = matchedCue ? matchedCue.nodeId : null;
      }
    }
    const changed = (activeRowId !== nextRowId) || (activeCustomNodeId !== nextNodeId);
    activeRowId = nextRowId;
    activeCustomNodeId = nextNodeId;
    if(changed){
      renderTimetableRows(activeRowId);
      if(typeof renderRightTimetableList==='function') renderRightTimetableList();
    }
  }

  /* ---------- A2 & B9: Trigger Cues without hardcoded 016+120s, with LATE_GRACE_SEC = 5 ---------- */
  const WARN_BELL_CODE_SET = new Set(['006','012','017','023','027','030','036']);
  const LATE_GRACE_SEC = 5;
  function checkAndTriggerCues(prevElapsedSec,currElapsedSec){
    if(currentPreset.isCustomSequence){
      for(let i=0;i<currentPreset.steps.length;i++){
        const step = currentPreset.steps[i];
        const startOffsetSec = step.startMinutes * 60;
        const endOffsetSec = step.endMinutes * 60;
        const startKey = 'custom_step_start_'+i+'_'+step.id;
        if(currElapsedSec>=startOffsetSec && prevElapsedSec<=startOffsetSec && !triggeredCues.has(startKey)){
          triggeredCues.add(startKey);
          const isWarnStart = Boolean(step.startBellCode && WARN_BELL_CODE_SET.has(step.startBellCode));
          if(startOffsetSec > 0 && !isWarnStart && (step.startBellCode || step.triggersEnglishAudioAtStart) && currentGlowBoost > 0.005){
            glowReleaseStartPerf = performance.now();
            glowReleaseFromBoost = currentGlowBoost;
          }
          if(currElapsedSec - startOffsetSec <= LATE_GRACE_SEC){
            if(step.stopsEnglishAudioAtStart) stopEnglishAudio();
            if(step.startBellCode){
              const bellItem = EMBEDDED.bellFiles37.find(b=>b.code===step.startBellCode);
              if(bellItem) playBellCueItem(bellItem);
            }
            if(step.triggersEnglishAudioAtStart){
              startEnglishAudioIfNeeded(format24hTime(step.originalStartMinutes||787));
            }
          }
        }
        if(i === currentPreset.steps.length - 1){
          const endKey = 'custom_step_end_'+i+'_'+step.id;
          if(currElapsedSec>=endOffsetSec && prevElapsedSec<endOffsetSec && !triggeredCues.has(endKey)){
            triggeredCues.add(endKey);
            if(endOffsetSec > 0 && step.endBellCode && currentGlowBoost > 0.005){
              glowReleaseStartPerf = performance.now();
              glowReleaseFromBoost = currentGlowBoost;
            }
            if(currElapsedSec - endOffsetSec <= LATE_GRACE_SEC){
              if(step.stopsEnglishAudioAtEnd) stopEnglishAudio();
              if(step.endBellCode){
                const endBell = EMBEDDED.bellFiles37.find(b=>b.code===step.endBellCode);
                if(endBell) playBellCueItem(endBell);
              }
            }
          }
        }
      }
      return;
    }

    const baseStartMin=currentPreset.startMinutes;
    const baseEndMin=currentPreset.endMinutes;

    const startsExplicitlyOnEndBell = Boolean(currentPreset.steps[0] && currentPreset.steps[0].bellAtStart === 'end');
    EMBEDDED.bellFiles37.forEach(bellItem=>{
      if(bellItem.triggerMinutes<baseStartMin||bellItem.triggerMinutes>baseEndMin)return;
      if(bellItem.isEndBell && bellItem.triggerMinutes===baseStartMin && !startsExplicitlyOnEndBell)return;
      if(!bellItem.isEndBell && bellItem.triggerMinutes===baseEndMin)return;
      const offsetSec=(bellItem.triggerMinutes-baseStartMin)*60;
      const cueKey='bell37_'+bellItem.code;
      if(currElapsedSec>=offsetSec&&prevElapsedSec<=offsetSec&&!triggeredCues.has(cueKey)){
        triggeredCues.add(cueKey);
        if(offsetSec > 0 && !WARN_BELL_CODE_SET.has(bellItem.code) && currentGlowBoost > 0.005){
          glowReleaseStartPerf = performance.now();
          glowReleaseFromBoost = currentGlowBoost;
        }
        if(currElapsedSec - offsetSec <= LATE_GRACE_SEC){
          playBellCueItem(bellItem);
        }
      }
    });

    const ENG_START_MIN=13*60+7;
    const ENG_END_MIN=14*60+20;

    if(baseStartMin<=ENG_START_MIN&&baseEndMin>ENG_START_MIN){
      const startOffsetSec=(ENG_START_MIN-baseStartMin)*60;
      const startKey='eng_listening_1307_start';
      if(currElapsedSec>=startOffsetSec&&prevElapsedSec<=startOffsetSec&&!triggeredCues.has(startKey)){
        triggeredCues.add(startKey);
        if(startOffsetSec > 0 && currentGlowBoost > 0.005){
          glowReleaseStartPerf = performance.now();
          glowReleaseFromBoost = currentGlowBoost;
        }
        if(currElapsedSec - startOffsetSec <= LATE_GRACE_SEC){
          startEnglishAudioIfNeeded('13:07');
        }
      }
    }else if(baseStartMin>ENG_START_MIN&&baseStartMin<ENG_END_MIN){
      const startKey='eng_listening_direct_start';
      if(currElapsedSec>=0&&prevElapsedSec<=0&&!triggeredCues.has(startKey)){
        triggeredCues.add(startKey);
        startEnglishAudioIfNeeded('13:10');
      }
    }

    if(baseStartMin<ENG_END_MIN&&baseEndMin>=ENG_END_MIN){
      const endOffsetSec=(ENG_END_MIN-baseStartMin)*60;
      const endKey='eng_listening_1420_end';
      if(currElapsedSec>=endOffsetSec&&prevElapsedSec<endOffsetSec&&!triggeredCues.has(endKey)){
        triggeredCues.add(endKey);
        stopEnglishAudio();
      }
    }
  }

  function updateRunningTimer(now){
    if(phase!=='rise'&&phase!=='hold')return;
    const isHandDragging = handDragState.isActivated;
    const prevElapsedMs=accumulatedElapsedMs;
    if(!isPaused && !isHandDragging){
      const dt=Math.max(0,now-lastTickPerf) * playbackSpeed;
      accumulatedElapsedMs+=dt;
    }
    lastTickPerf=now;

    const totalDurMs=(currentPreset.endMinutes-currentPreset.startMinutes)*60*1000;
    const clampedElapsedMs=Math.min(totalDurMs,accumulatedElapsedMs);
    const remainingMs=Math.max(0,totalDurMs-clampedElapsedMs);
    const simMinutes=currentPreset.startMinutes+(clampedElapsedMs/60000);
    let activeStepIdx = currentPreset.steps.length - 1;
    let activeStep = currentPreset.steps[activeStepIdx];
    for(let i=0;i<currentPreset.steps.length;i++){
      const cand=currentPreset.steps[i];
      if(simMinutes>=cand.startMinutes&&simMinutes<cand.endMinutes){
        activeStep=cand;
        activeStepIdx=i;
        break;
      }
    }
    let clockHandMinutes=simMinutes;
    let targetStageGlowBoost=0;

    if(activeStep){
      title.textContent=activeStep.displayTitle;
      const stepRemainMs=Math.max(0,(activeStep.endMinutes-simMinutes)*60000);
      const dispRemainMs=(currentPreset.steps.length>1||currentPreset.isCustomSequence)?stepRemainMs:remainingMs;
      const remainSec = dispRemainMs / 1000;
      const catText = activeStep.category || '';
      const matchedStartNode = activeStep.startNodeId
        ? (EMBEDDED.selectableCueNodes||[]).find(n=>n.nodeId===activeStep.startNodeId)
        : null;
      const isPrepareStage =
        (matchedStartNode && matchedStartNode.stageType==='prepare') ||
        activeStep.stageType==='prepare' ||
        activeStep.bellAtStart==='prepare' ||
        catText.indexOf('준비령')===0 ||
        (catText.indexOf('준비령')!==-1 && catText.indexOf('→ 준비령')===-1);
      const isMainExamStage =
        !isPrepareStage && (
          (matchedStartNode && (matchedStartNode.stageType==='main'||matchedStartNode.stageType==='listening'||matchedStartNode.stageType==='warn')) ||
          activeStep.stageType==='main' ||
          activeStep.stageType==='listening' ||
          activeStep.stageType==='warn' ||
          activeStep.bellAtStart==='main' ||
          activeStep.bellAtStart==='listening_intro' ||
          activeStep.bellAtStart==='warn_10m' ||
          activeStep.bellAtStart==='warn_5m' ||
          catText.indexOf('본령')===0 ||
          catText.indexOf('종료 10분 전')===0 ||
          catText.indexOf('종료 5분 전')===0 ||
          catText.indexOf('듣기평가 안내방송 및 본령')!==-1
        );

      let examEndMinutes = activeStep.endMinutes;
      let nextWarnBroadcastLabel = null;
      if(isMainExamStage && (currentPreset.steps.length>1 || currentPreset.isCustomSequence)){
        for(let j=activeStepIdx+1;j<currentPreset.steps.length;j++){
          const nxt = currentPreset.steps[j];
          const nxtCat = nxt.category || '';
          const nxtNode = nxt.startNodeId ? (EMBEDDED.selectableCueNodes||[]).find(n=>n.nodeId===nxt.startNodeId) : null;
          const isSameGroup = nxt.displayTitle===activeStep.displayTitle || (nxt.periodLabel!=='-' && nxt.periodLabel===activeStep.periodLabel);
          const isWarnFollow =
            (nxtNode && nxtNode.stageType==='warn') ||
            nxt.stageType==='warn' ||
            nxt.bellAtStart==='warn_10m' ||
            nxt.bellAtStart==='warn_5m' ||
            nxtCat.indexOf('종료 10분 전')===0 ||
            nxtCat.indexOf('종료 5분 전')===0;
          if(isSameGroup && isWarnFollow){
            examEndMinutes = nxt.endMinutes;
            if(!nextWarnBroadcastLabel){
              if(nxtCat.indexOf('종료 10분 전')!==-1 || nxt.bellAtStart==='warn_10m') nextWarnBroadcastLabel = '종료 10분 전';
              else if(nxtCat.indexOf('종료 5분 전')!==-1 || nxt.bellAtStart==='warn_5m') nextWarnBroadcastLabel = '종료 5분 전';
            }
          }else{
            break;
          }
        }
      }
      const mainRemainSec = (currentPreset.steps.length>1 || currentPreset.isCustomSequence)
        ? Math.max(0, (examEndMinutes - simMinutes) * 60)
        : remainSec;
      const isMainBeforeWarn =
        isMainExamStage &&
        catText.indexOf('종료 10분 전')===-1 &&
        catText.indexOf('종료 5분 전')===-1 &&
        examEndMinutes > activeStep.endMinutes;
      const finalDisplayRemainMs = isMainBeforeWarn ? mainRemainSec * 1000 : dispRemainMs;
      remainDigits.textContent=formatDurationClock(finalDisplayRemainMs);

      const speedBadge = playbackSpeed>1 ? ' (×'+playbackSpeed+')' : '';
      const statusSuffix=(isPaused?' (일시정지)':' 진행 중')+speedBadge;
      const periodPrefix = activeStep.periodLabel!=='-' ? (activeStep.periodLabel+' · ') : '';
      if(isMainBeforeWarn){
        const mainStageTitle = catText.indexOf('듣기평가')!==-1 ? '듣기평가 및 본령' : '본령';
        const nextLabel = nextWarnBroadcastLabel || '종료 10분 전';
        renderStageBadgeText(stageBadge, periodPrefix + mainStageTitle + statusSuffix, nextLabel);
      }else if(catText.indexOf(' → ')!==-1){
        const parts = catText.split(' → ');
        renderStageBadgeText(stageBadge, periodPrefix + parts[0] + statusSuffix, parts.slice(1).join(' → '));
      }else{
        renderStageBadgeText(stageBadge, periodPrefix + catText + statusSuffix);
      }

      syncActiveStepHighlight(activeStep, Boolean(currentPreset.isCustomSequence));

      if(isPrepareStage && prelimBellGlowAnim){
        if(remainSec <= 60 && remainSec > 10){
          const p = clamp((60 - remainSec) / 50, 0, 1);
          targetStageGlowBoost = 0.10 * p;
        }else if(remainSec <= 10 && remainSec > 0){
          const p = clamp((10 - remainSec) / 10, 0, 1);
          targetStageGlowBoost = 0.10 + (0.40 - 0.10) * p;
        }
      }else if(isMainExamStage && mainBellGlowAnim){
        if(mainRemainSec <= 600 && mainRemainSec > 60){
          const p = clamp((600 - mainRemainSec) / 540, 0, 1);
          targetStageGlowBoost = 0.10 * p;
        }else if(mainRemainSec <= 60 && mainRemainSec > 10){
          const p = clamp((60 - mainRemainSec) / 50, 0, 1);
          targetStageGlowBoost = 0.10 + (0.40 - 0.10) * p;
        }else if(mainRemainSec <= 10 && mainRemainSec > 0){
          const p = clamp((10 - mainRemainSec) / 10, 0, 1);
          targetStageGlowBoost = 0.40 + (0.90 - 0.40) * p;
        }
      }

      const stepSpanMin=Math.max(0.0001,activeStep.endMinutes-activeStep.startMinutes);
      const stageElapsedMin=clamp(simMinutes-activeStep.startMinutes,0,stepSpanMin);
      const stepProgress=clamp(stageElapsedMin/stepSpanMin,0,1);
      const emphasisShift=sm(0.35,0.65,stepProgress);
      const startOpacity=1-emphasisShift*(1-0.48);
      const endOpacity=0.48+emphasisShift*(1-0.48);

      let dispStartMin=activeStep.startMinutes;
      let dispEndMin=activeStep.endMinutes;
      if(currentPreset.isCustomSequence){
        dispStartMin=activeStep.customStartMinutes;
        dispEndMin=activeStep.customEndMinutes;
        clockHandMinutes=dispStartMin+stageElapsedMin;
      }
      renderClockTimeLabel(startLab,'START TIME',dispStartMin);
      startLab.style.opacity=startOpacity.toFixed(3);
      renderClockTimeLabel(endLab,'END TIME',dispEndMin);
      endLab.style.opacity=endOpacity.toFixed(3);
    }

    updateClockHandsForMinutes(clockHandMinutes);
    updateAuxBellButtonsState();

    if(!isPaused && !isHandDragging){
      checkAndTriggerCues(prevElapsedMs/1000,clampedElapsedMs/1000);
      if(clampedElapsedMs>=totalDurMs){
        if(currentGlowBoost > 0.005){
          glowReleaseStartPerf = now;
          glowReleaseFromBoost = currentGlowBoost;
        }
        isPaused=true;
        pauseBtn.textContent='DONE';
        if(!keepScreenAwake) releaseWakeLock();
        renderStageBadgeText(stageBadge, currentPreset.displayTitle+' 종료');
      }
    }

    let finalGlowBoost = targetStageGlowBoost;
    if(glowReleaseStartPerf > 0){
      const relElapsed = now - glowReleaseStartPerf;
      const REL_TOTAL = 3400;
      if(relElapsed < REL_TOTAL && targetStageGlowBoost < 0.04){
        if(relElapsed < 1400){
          const p = easeSine(relElapsed / 1400);
          finalGlowBoost = glowReleaseFromBoost + (-0.24 - glowReleaseFromBoost) * p;
        }else{
          const p = easeSine((relElapsed - 1400) / (REL_TOTAL - 1400));
          finalGlowBoost = -0.24 * (1 - p);
        }
      }else if(relElapsed >= REL_TOTAL){
        glowReleaseStartPerf = 0;
        glowReleaseFromBoost = 0;
      }
    }
    applyClockGlowBoost(finalGlowBoost);
  }

  /* ---------- B6: Touch-Reveal Running Aux Controls & Seek/Jump ---------- */
  function revealRunAuxControls(){
    if(phase!=='rise'&&phase!=='hold')return;
    runAuxVisible = true;
    if(runTouchZone) runTouchZone.classList.add('is-revealed');
    if(runAuxHideTimer) clearTimeout(runAuxHideTimer);
    runAuxHideTimer = setTimeout(()=>{
      runAuxVisible = false;
      if(runTouchZone) runTouchZone.classList.remove('is-revealed');
    }, 3000);
  }

  function seekRunningTimerTo(targetElapsedSec, triggerAtBoundary){
    if(phase!=='rise'&&phase!=='hold')return;
    const totalDurSec = Math.max(1, (currentPreset.endMinutes - currentPreset.startMinutes)*60);
    const clampedSec = clamp(targetElapsedSec, 0, totalDurSec);
    stopBell();
    accumulatedElapsedMs = clampedSec * 1000;
    lastTickPerf = performance.now();
    glowReleaseStartPerf = 0;
    triggeredCues.clear();

    if(currentPreset.isCustomSequence){
      currentPreset.steps.forEach((step, idx)=>{
        const sSec = step.startMinutes * 60;
        const eSec = step.endMinutes * 60;
        if(sSec < clampedSec || (!triggerAtBoundary && sSec <= clampedSec)){
          triggeredCues.add('custom_step_start_'+idx+'_'+step.id);
        }
        if(eSec < clampedSec){
          triggeredCues.add('custom_step_end_'+idx+'_'+step.id);
        }
      });
    }else{
      const baseStartMin = currentPreset.startMinutes;
      EMBEDDED.bellFiles37.forEach(b=>{
        const off = (b.triggerMinutes - baseStartMin)*60;
        if(off < clampedSec || (!triggerAtBoundary && off <= clampedSec)){
          triggeredCues.add('bell37_'+b.code);
        }
      });
    }

    if(triggerAtBoundary){
      checkAndTriggerCues(clampedSec, clampedSec);
    }
    if(isPaused && pauseBtn.textContent==='DONE' && clampedSec < totalDurSec){
      isPaused = false;
      pauseBtn.textContent = 'PAUSE';
    }
    updateRunningTimer(performance.now());
  }

  function getRunningBellBoundariesSec(){
    const pts = [0];
    if(currentPreset.isCustomSequence){
      currentPreset.steps.forEach(st=>{
        const s = Math.round(st.startMinutes*60);
        const e = Math.round(st.endMinutes*60);
        if(!pts.includes(s)) pts.push(s);
        if(!pts.includes(e)) pts.push(e);
      });
    }else{
      const base = currentPreset.startMinutes;
      const end = currentPreset.endMinutes;
      EMBEDDED.bellFiles37.forEach(b=>{
        if(b.triggerMinutes>=base && b.triggerMinutes<=end){
          const off = Math.round((b.triggerMinutes - base)*60);
          if(!pts.includes(off)) pts.push(off);
        }
      });
      const total = Math.round((end - base)*60);
      if(!pts.includes(total)) pts.push(total);
    }
    return pts.sort((a,b)=>a-b);
  }

  if(runTouchZone){
    runTouchZone.addEventListener('pointerdown', e=>{
      if(e.target && e.target.closest && e.target.closest('#cancelBtn')) return;
      revealRunAuxControls();
    });
  }
  if(auxPrevBellBtn){
    auxPrevBellBtn.addEventListener('click', e=>{
      e.stopPropagation();
      revealRunAuxControls();
      const currSec = accumulatedElapsedMs/1000;
      const pts = getRunningBellBoundariesSec();
      let activeIdx = 0;
      for(let i=0;i<pts.length;i++){
        if(pts[i] <= currSec + 0.05) activeIdx = i;
        else break;
      }
      if(activeIdx <= 0) return;
      seekRunningTimerTo(pts[activeIdx - 1], true);
    });
  }
  if(auxNextBellBtn){
    auxNextBellBtn.addEventListener('click', e=>{
      e.stopPropagation();
      revealRunAuxControls();
      const currSec = accumulatedElapsedMs/1000;
      const pts = getRunningBellBoundariesSec();
      let activeIdx = 0;
      for(let i=0;i<pts.length;i++){
        if(pts[i] <= currSec + 0.05) activeIdx = i;
        else break;
      }
      if(activeIdx >= pts.length - 1) return;
      seekRunningTimerTo(pts[activeIdx + 1], true);
    });
  }
  if(auxReplayBellBtn){
    auxReplayBellBtn.addEventListener('click', e=>{
      e.stopPropagation();
      revealRunAuxControls();
      if(phase!=='rise'&&phase!=='hold')return;
      const currSec = accumulatedElapsedMs/1000;
      const pts = getRunningBellBoundariesSec();
      let activeIdx = 0;
      for(let i=0;i<pts.length;i++){
        if(pts[i] <= currSec + 0.05) activeIdx = i;
        else break;
      }
      const targetSec = pts[activeIdx] || 0;
      seekRunningTimerTo(targetSec, true);
    });
  }
  function attachHandDragHandlers(hand, handEl){
    if(!handEl)return;
    handEl.addEventListener('pointerdown', e=>{
      if(phase!=='rise'&&phase!=='hold')return;
      e.stopPropagation();
      if(handDragState.holdTimer) clearTimeout(handDragState.holdTimer);
      const pointerId = e.pointerId;
      try{ handEl.setPointerCapture(pointerId); }catch(_){}
      handDragState = {
        pointerId,
        hand,
        handEl,
        startX: e.clientX,
        startY: e.clientY,
        latestX: e.clientX,
        latestY: e.clientY,
        isActivated: false,
        prevAngleDeg: 0,
        holdTimer: setTimeout(()=>{
          if(handDragState.pointerId !== pointerId)return;
          const dx = handDragState.latestX - cx;
          const dy = handDragState.latestY - cy;
          handDragState.isActivated = true;
          handDragState.prevAngleDeg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
          handEl.classList.add('is-grabbed');
          if(face) face.classList.add('is-hand-dragging');
          stopBell();
          try{ if(navigator.vibrate) navigator.vibrate(12); }catch(_){}
          const handLabel = hand==='hour' ? '시침' : (hand==='min' ? '분침' : '초침');
          showToast(handLabel+' 회전 조절 활성화: 중심축을 기준으로 돌려 원하는 시간대로 이동하세요.', 2200);
        }, 180)
      };
    });
    handEl.addEventListener('pointermove', e=>{
      if(handDragState.pointerId !== e.pointerId || handDragState.hand !== hand)return;
      handDragState.latestX = e.clientX;
      handDragState.latestY = e.clientY;
      if(!handDragState.isActivated){
        if(Math.hypot(e.clientX - handDragState.startX, e.clientY - handDragState.startY) > 22){
          if(handDragState.holdTimer){ clearTimeout(handDragState.holdTimer); handDragState.holdTimer = null; }
          handDragState.pointerId = null;
          handDragState.hand = null;
        }
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      if(phase!=='rise'&&phase!=='hold')return;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      if(Math.hypot(dx, dy) < 6)return;
      const currAngleDeg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      let deltaDeg = currAngleDeg - handDragState.prevAngleDeg;
      if(deltaDeg > 180) deltaDeg -= 360;
      if(deltaDeg < -180) deltaDeg += 360;
      handDragState.prevAngleDeg = currAngleDeg;
      let deltaMs = 0;
      if(hand==='sec') deltaMs = (deltaDeg / 360) * 60000;
      else if(hand==='min') deltaMs = (deltaDeg / 360) * 3600000;
      else deltaMs = (deltaDeg / 360) * 43200000;
      const totalDurMs = (currentPreset.endMinutes - currentPreset.startMinutes) * 60 * 1000;
      accumulatedElapsedMs = clamp(accumulatedElapsedMs + deltaMs, 0, totalDurMs);
      lastTickPerf = performance.now();
      glowReleaseStartPerf = 0;
      updateRunningTimer(performance.now());
    });
    const endHandDrag = e=>{
      if(handDragState.pointerId !== e.pointerId)return;
      e.stopPropagation();
      if(handDragState.holdTimer){ clearTimeout(handDragState.holdTimer); handDragState.holdTimer = null; }
      try{ handEl.releasePointerCapture(e.pointerId); }catch(_){}
      const wasActivated = handDragState.isActivated;
      handEl.classList.remove('is-grabbed');
      if(face) face.classList.remove('is-hand-dragging');
      handDragState.pointerId = null;
      handDragState.hand = null;
      handDragState.isActivated = false;
      if(wasActivated){
        seekRunningTimerTo(accumulatedElapsedMs / 1000, false);
      }
    };
    handEl.addEventListener('pointerup', endHandDrag);
    handEl.addEventListener('pointercancel', endHandDrag);
  }
  attachHandDragHandlers('hour', hourHand);
  attachHandDragHandlers('min', minHandGroup);
  attachHandDragHandlers('sec', secHand);

  function showRunningButtons(running){
    startWrap.classList.toggle('is-active',!running);
    startWrap.classList.toggle('is-inactive',running);
    runCtrls.classList.toggle('is-active',running);
    runCtrls.classList.toggle('is-inactive',!running);
    if(face) face.classList.toggle('is-interactive', running);
    if(runTouchZone) runTouchZone.classList.toggle('is-running', running);
    if(running){
      isPaused=false;
      pauseBtn.textContent='PAUSE';
    }else{
      runAuxVisible = false;
      if(face) face.classList.remove('is-hand-dragging');
      if(runTouchZone) runTouchZone.classList.remove('is-revealed');
      if(runAuxHideTimer) clearTimeout(runAuxHideTimer);
    }
    updateDockAndAuxUI();
  }

  /* ---------- B8: Scheduled Start & B9: Wake Lock (Native + Android Chrome Silent Video Strategy) ---------- */
  function attachStandaloneCanvasBackup(videoEl){
    if(!videoEl || wakeVideoCanvasCleanup) return;
    try{
      const cvBackup = document.createElement('canvas');
      if(typeof cvBackup.captureStream !== 'function') return;
      cvBackup.width = 16;
      cvBackup.height = 16;
      const cctx = cvBackup.getContext('2d');
      if(!cctx) return;
      let tog = false;
      const paint = ()=>{
        cctx.fillStyle = tog ? '#808080' : '#7f7f7f';
        tog = !tog;
        cctx.fillRect(0,0,16,16);
      };
      paint();
      const stream = cvBackup.captureStream(1);
      videoEl.removeAttribute('src');
      videoEl.srcObject = stream;
      const tid = setInterval(paint, 1000);
      wakeVideoCanvasCleanup = ()=>{
        clearInterval(tid);
        try{ stream.getTracks().forEach(t=>t.stop()); }catch(_){}
        if(videoEl.srcObject === stream) videoEl.srcObject = null;
      };
    }catch(_){}
  }
  function startWakeLockVideo(){
    if(!keepScreenAwake || !wakeLockVideo) return;
    try{
      if(!wakeLockVideo.srcObject && !wakeLockVideo.getAttribute('src') && wakeVideoResolvedUrl){
        wakeLockVideo.src = wakeVideoResolvedUrl;
      }
      wakeLockVideo.muted = true;
      wakeLockVideo.defaultMuted = true;
      wakeLockVideo.loop = true;
      wakeLockVideo.playsInline = true;
      wakeLockVideo.disablePictureInPicture = true;
      wakeLockVideo.disableRemotePlayback = true;
      wakeLockVideo.classList.add('is-active');
      if(wakeLockVideo.paused || wakeLockVideo.ended){
        if(wakeLockVideo.ended) wakeLockVideo.currentTime = 0;
        const p = wakeLockVideo.play();
        if(p && typeof p.catch === 'function') p.catch(()=>{});
      }
    }catch(_){}
  }
  function stopWakeLockVideo(){
    if(!wakeLockVideo) return;
    try{
      wakeLockVideo.pause();
      if(wakeLockVideo.currentTime > 0) wakeLockVideo.currentTime = 0;
    }catch(_){}
    wakeLockVideo.classList.remove('is-active');
  }
  if(wakeLockVideo){
    wakeLockVideo.addEventListener('timeupdate', ()=>{
      wakeVideoProgressMs = performance.now();
    });
    wakeLockVideo.addEventListener('ended', ()=>{
      if(!keepScreenAwake || wakeLockIntentionalRelease) return;
      try{ wakeLockVideo.currentTime = 0; }catch(_){}
      startWakeLockVideo();
    });
    const handleVideoPauseOrStall = ()=>{
      if(!keepScreenAwake || wakeLockIntentionalRelease) return;
      startWakeLockVideo();
      setTimeout(()=>{
        if(keepScreenAwake && !wakeLockIntentionalRelease) startWakeLockVideo();
      }, 150);
    };
    wakeLockVideo.addEventListener('pause', handleVideoPauseOrStall);
    wakeLockVideo.addEventListener('stalled', handleVideoPauseOrStall);
    wakeLockVideo.addEventListener('waiting', handleVideoPauseOrStall);
    wakeLockVideo.addEventListener('error', ()=>{
      attachStandaloneCanvasBackup(wakeLockVideo);
      if(keepScreenAwake && !wakeLockIntentionalRelease) startWakeLockVideo();
    });
  }
  async function requestWakeLock(){
    if(!keepScreenAwake)return;
    if(wakeLockReacquireTimer){ clearTimeout(wakeLockReacquireTimer); wakeLockReacquireTimer = null; }
    wakeLockIntentionalRelease = false;

    const hasActiveNative = Boolean(wakeLockSentinel && !wakeLockSentinel.released);
    startWakeLockVideo();
    if(document.hidden || hasActiveNative) return;
    if(wakeLockPendingPromise) return wakeLockPendingPromise;

    if(!('wakeLock' in navigator) || !navigator.wakeLock || typeof navigator.wakeLock.request!=='function'){
      wakeLockNativeBlocked = true;
      startWakeLockVideo();
      return;
    }

    wakeLockPendingPromise = (async ()=>{
      try{
        const sentinel = await navigator.wakeLock.request('screen');
        if(!keepScreenAwake || document.hidden || wakeLockIntentionalRelease){
          try{ await sentinel.release(); }catch(_){}
          return;
        }
        wakeLockNativeBlocked = false;
        wakeLockSentinel = sentinel;
        sentinel.addEventListener('release', ()=>{
          if(wakeLockSentinel === sentinel) wakeLockSentinel = null;
          if(!wakeLockIntentionalRelease && keepScreenAwake && !document.hidden){
            startWakeLockVideo();
            if(wakeLockReacquireTimer) clearTimeout(wakeLockReacquireTimer);
            wakeLockReacquireTimer = setTimeout(()=>{
              wakeLockReacquireTimer = null;
              requestWakeLock();
            }, 180);
          }
        });
      }catch(_){
        wakeLockNativeBlocked = true;
        startWakeLockVideo();
      }finally{
        wakeLockPendingPromise = null;
      }
    })();
    return wakeLockPendingPromise;
  }
  function releaseWakeLock(){
    wakeLockIntentionalRelease = true;
    if(wakeLockReacquireTimer){ clearTimeout(wakeLockReacquireTimer); wakeLockReacquireTimer = null; }
    stopWakeLockVideo();
    if(wakeLockSentinel){
      const sentinel = wakeLockSentinel;
      wakeLockSentinel = null;
      try{ if(!sentinel.released) sentinel.release(); }catch(_){}
    }
  }
  function syncWakeLockOnEvent(){
    if(!keepScreenAwake){
      stopWakeLockVideo();
      return;
    }
    startWakeLockVideo();
    if(!document.hidden){
      requestWakeLock();
    }
  }
  function handleWakeLockGestureRetry(){
    if(!keepScreenAwake) return;
    const needsNative = !document.hidden && (!wakeLockSentinel || Boolean(wakeLockSentinel.released));
    const needsVideo = Boolean(wakeLockVideo && wakeLockVideo.paused);
    if(needsNative || needsVideo){
      requestWakeLock();
    }
  }
  document.addEventListener('visibilitychange', syncWakeLockOnEvent);
  document.addEventListener('fullscreenchange', syncWakeLockOnEvent);
  document.addEventListener('webkitfullscreenchange', syncWakeLockOnEvent);
  document.addEventListener('resume', syncWakeLockOnEvent);
  window.addEventListener('focus', syncWakeLockOnEvent);
  window.addEventListener('blur', syncWakeLockOnEvent);
  window.addEventListener('pageshow', syncWakeLockOnEvent);
  window.addEventListener('pagehide', syncWakeLockOnEvent);
  document.addEventListener('pointerdown', handleWakeLockGestureRetry, {capture:true,passive:true});
  document.addEventListener('touchstart', handleWakeLockGestureRetry, {capture:true,passive:true});
  document.addEventListener('click', handleWakeLockGestureRetry, {capture:true,passive:true});
  document.addEventListener('keydown', handleWakeLockGestureRetry, {capture:true,passive:true});
  setInterval(()=>{
    if(!keepScreenAwake) return;
    const droppedNative = !document.hidden && (!wakeLockSentinel || Boolean(wakeLockSentinel.released));
    const isVideoFrozen = Boolean(wakeLockVideo && !wakeLockVideo.paused && !wakeLockVideo.srcObject && wakeVideoProgressMs > 0 && performance.now() - wakeVideoProgressMs > 5500);
    if(isVideoFrozen && wakeLockVideo){
      attachStandaloneCanvasBackup(wakeLockVideo);
      startWakeLockVideo();
    }
    const droppedVideo = Boolean(wakeLockVideo && wakeLockVideo.paused);
    if(droppedNative || droppedVideo){
      requestWakeLock();
    }
  }, 2500);
  if(keepAwakeToggle){
    keepAwakeToggle.addEventListener('change', ()=>{
      keepScreenAwake = Boolean(keepAwakeToggle.checked);
      if(keepScreenAwake) requestWakeLock();
      else releaseWakeLock();
      saveCustomSettings();
      showToast(keepScreenAwake ? '화면 켜짐 유지 옵션이 활성화되었습니다.' : '화면 켜짐 유지 옵션이 해제되었습니다.', 2200);
    });
  }
  if(mainBellGlowToggle){
    mainBellGlowToggle.addEventListener('change', ()=>{
      mainBellGlowAnim = Boolean(mainBellGlowToggle.checked);
      if(!mainBellGlowAnim) applyClockGlowBoost(0);
      saveCustomSettings();
      showToast(mainBellGlowAnim ? '본령 종료 전 시계 블러 애니메이션이 켜졌습니다.' : '본령 종료 전 시계 블러 애니메이션이 꺼졌습니다.', 2200);
    });
  }
  if(prelimBellGlowToggle){
    prelimBellGlowToggle.addEventListener('change', ()=>{
      prelimBellGlowAnim = Boolean(prelimBellGlowToggle.checked);
      if(!prelimBellGlowAnim) applyClockGlowBoost(0);
      saveCustomSettings();
      showToast(prelimBellGlowAnim ? '준비령 종료 전 시계 블러 애니메이션이 켜졌습니다.' : '준비령 종료 전 시계 블러 애니메이션이 꺼졌습니다.', 2200);
    });
  }

  if(schedTimeInput){
    schedTimeInput.addEventListener('change', ()=>{
      scheduledStartTime = schedTimeInput.value || '08:05';
      if(scheduledStartEnabled && schedStatusMeta) schedStatusMeta.textContent = scheduledStartTime + ' 대기 중';
      updateDockAndAuxUI();
    });
  }
  if(schedToggleBtn){
    schedToggleBtn.addEventListener('click', ()=>{
      if(phase!=='idle'){
        showToast('타이머 진행 중에는 예약 시작을 설정할 수 없습니다.');
        return;
      }
      scheduledStartEnabled = !scheduledStartEnabled;
      if(schedTimeInput && schedTimeInput.value) scheduledStartTime = schedTimeInput.value;
      schedToggleBtn.textContent = scheduledStartEnabled ? '예약 취소' : '예약';
      schedToggleBtn.classList.toggle('primary', !scheduledStartEnabled);
      if(schedStatusMeta) schedStatusMeta.textContent = scheduledStartEnabled ? (scheduledStartTime + ' 대기 중') : '해제됨';
      updateDockAndAuxUI();
      showToast(scheduledStartEnabled ? ('실제 시각 '+scheduledStartTime+'에 타이머가 자동 시작됩니다.') : '예약 시작이 해제되었습니다.', 2600);
    });
  }
  setInterval(()=>{
    if(!scheduledStartEnabled || phase!=='idle') return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const parts = String(scheduledStartTime || '08:05').split(':');
    const targetHasSec = parts.length >= 3;
    const matched = targetHasSec
      ? ((hh+':'+mm+':'+ss) === scheduledStartTime)
      : ((hh+':'+mm) === (parts[0]+':'+parts[1]) && now.getSeconds() <= 1);
    if(matched){
      scheduledStartEnabled = false;
      if(schedToggleBtn){
        schedToggleBtn.textContent = '예약';
        schedToggleBtn.classList.add('primary');
      }
      if(schedStatusMeta) schedStatusMeta.textContent = '해제됨';
      updateDockAndAuxUI();
      showToast('예약 시각('+scheduledStartTime+')이 되어 타이머를 자동 시작합니다.');
      start();
    }
  }, 500);

  function draw(){
    tk.style.opacity=kT;hd.style.opacity=kH;title.style.opacity=kX;lab.style.opacity=kX;
    if(!gl)return;
    gl.uniform2f(U.uRes,cv.width,cv.height);
    gl.uniform2f(U.uC,cx*dpr,(Hh-cy)*dpr);
    gl.uniform1f(U.uR,R*dpr);
    gl.uniform1f(U.uH,H);
    gl.uniform1f(U.uB,themeUB);
    gl.uniform1f(U.uS,themeUS);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }

  function frame(now){
    const t=now-t0;
    if(phase==='rise'){
      H=easeSine(t/RISE);
      kT=sm(0,DUR_IN,t-APPEAR_T0);
      kH=sm(0,DUR_IN,t-APPEAR_T0-STAGE_IN);
      kX=sm(0,DUR_IN,t-APPEAR_T0-2*STAGE_IN);
      const riseTotal=Math.max(RISE,APPEAR_T0+2*STAGE_IN+DUR_IN);
      updateRunningTimer(now);
      if(t>=riseTotal){phase='hold';t0=now;H=1;kT=kH=kX=1}
    }else if(phase==='hold'){
      updateRunningTimer(now);
    }else if(phase==='drop'){
      kX=dX*(1-sm(0,STAGE_OUT,t));
      kH=dHnd*(1-sm(STAGE_OUT,2*STAGE_OUT,t));
      kT=dT*(1-sm(2*STAGE_OUT,3*STAGE_OUT,t));
      H=t<=FADE_OUT_TOTAL?dH:dH*(1-easeSine((t-FADE_OUT_TOTAL)/DROP));
      if(t>=FADE_OUT_TOTAL+DROP){
        phase='idle';H=0;kT=kH=kX=0;
        syncUiToPresetIdle();
      }
    }
    draw();
    if(phase==='rise'||phase==='hold'||phase==='drop')requestAnimationFrame(frame);
  }

  function start(){
    if(phase!=='idle')return;
    stopPreviewBell();
    enterFullscreenSilently();
    const now=performance.now();
    phase='rise';
    t0=now;
    lastTickPerf=now;
    accumulatedElapsedMs=0;
    triggeredCues.clear();
    setLeftMenuOpen(false);
    applyMenuCategoryState(null);
    showRunningButtons(true);
    requestWakeLock();

    const ENG_START_MIN=13*60+7;
    const usesDeferredEng = currentPreset.isCustomSequence
      ? currentPreset.steps.some(s=>s.usesEnglishAudio||s.triggersEnglishAudioAtStart)
      : (currentPreset.startMinutes<ENG_START_MIN&&currentPreset.endMinutes>ENG_START_MIN);
    if(englishObjectUrl&&usesDeferredEng){
      englishAudio.muted=true;
      const up=englishAudio.play();
      if(up&&typeof up.then==='function'){
        up.then(()=>{
          if(!englishPlaying){
            englishAudio.pause();
            englishAudio.currentTime=0;
          }
          englishAudio.muted=false;
        }).catch(()=>{
          englishAudio.muted=false;
        });
      }else{
        englishAudio.pause();
        englishAudio.currentTime=0;
        englishAudio.muted=false;
      }
    }

    checkAndTriggerCues(0,0);
    revealRunAuxControls();
    requestAnimationFrame(frame);
  }

  function cancel(){
    if(phase!=='rise'&&phase!=='hold')return;
    stopBell();
    stopEnglishAudio();
    exitFullscreenSilently();
    if(!keepScreenAwake) releaseWakeLock();
    isPaused=false;
    dH=H;dT=kT;dHnd=kH;dX=kX;
    phase='drop';
    t0=performance.now();
    showRunningButtons(false);
    requestAnimationFrame(frame);
  }

  btn.addEventListener('click',start);
  pauseBtn.addEventListener('click',e=>{
    e.stopPropagation();
    if(phase!=='rise'&&phase!=='hold')return;
    if(pauseBtn.textContent==='DONE')return;
    isPaused=!isPaused;
    lastTickPerf=performance.now();
    pauseBtn.textContent=isPaused?'RESUME':'PAUSE';
    if(isPaused){
      pauseBell();
      pauseEnglishAudio();
      if(!keepScreenAwake) releaseWakeLock();
    }else{
      resumeBell();
      resumeEnglishAudio();
      requestWakeLock();
    }
  });
  cancelBtn.addEventListener('pointerdown',e=>{
    e.stopPropagation();
  });
  cancelBtn.addEventListener('touchstart',e=>{
    e.stopPropagation();
  },{passive:true});
  cancelBtn.addEventListener('click',e=>{
    e.stopPropagation();
    cancel();
  });

  /* ---------- C1/C8: Draft Config & Undo/Redo Stack for Builder Modal ---------- */
  function updateUndoRedoBtns(){
    if(builderUndoBtn) builderUndoBtn.disabled = undoStack.length === 0;
    if(builderRedoBtn) builderRedoBtn.disabled = redoStack.length === 0;
  }

  function mutateDraftConfig(mutator){
    undoStack.push(cloneCfg(draftSequenceConfig));
    if(undoStack.length > 25) undoStack.shift();
    redoStack = [];
    mutator(draftSequenceConfig);
    rowAlertMap = {};
    updateUndoRedoBtns();
    renderBuilderModal();
  }

  function syncStep1SubjectsFromNodeIds(nodeIds){
    const idSet = new Set(nodeIds || []);
    const activeGroups = new Set();
    EMBEDDED.selectableCueNodes.forEach(n=>{
      if(idSet.has(n.nodeId)) activeGroups.add(n.subjectGroupId);
    });
    const hasInq1 = activeGroups.has('inq1');
    const hasInq2 = activeGroups.has('inq2');
    if(hasInq2) step1InqCount = 2;
    else if(hasInq1) step1InqCount = 1;
    step1SubjectFilter = {
      kor: activeGroups.has('kor'),
      math: activeGroups.has('math'),
      eng: activeGroups.has('eng'),
      hist: activeGroups.has('hist'),
      inq1: hasInq1 || hasInq2,
      inq2: (hasInq1 || hasInq2) && step1InqCount >= 2,
      lang2: activeGroups.has('lang2')
    };
    syncStep1DomFromState();
  }

  function syncStep1DomFromState(){
    document.querySelectorAll('.subj-chk').forEach(el=>{
      el.checked = Boolean(step1SubjectFilter[el.value]);
    });
    const inqChk = document.getElementById('subjInqChk');
    if(inqChk) inqChk.checked = Boolean(step1SubjectFilter.inq1 || step1SubjectFilter.inq2);
    const inqSel = document.getElementById('subjInqCountSel');
    if(inqSel) inqSel.value = String(step1InqCount);
    const lang2Chk = document.getElementById('subjLang2Chk');
    if(lang2Chk) lang2Chk.checked = Boolean(step1SubjectFilter.lang2);
    updateStep1SubjectPreviewBar();
  }

  function isGroupEnabledInStep2(gid){
    if(gid==='inq1') return Boolean(step1SubjectFilter.inq1 || step1SubjectFilter.inq2);
    if(gid==='inq2') return Boolean((step1SubjectFilter.inq1 || step1SubjectFilter.inq2) && step1InqCount >= 2);
    return Boolean(step1SubjectFilter[gid]);
  }

  function updateStep1SubjectPreviewBar(){
    document.querySelectorAll('#builderQuickbar .subj-check-label').forEach(lbl=>{
      const chk = lbl.querySelector('input[type="checkbox"]');
      if(chk) lbl.classList.toggle('is-checked', Boolean(chk.checked));
    });
  }

  function goToBuilderStep(nextStep){
    builderStep = clamp(Number(nextStep) || 1, 1, 3);
    renderBuilderModal();
    if(builderStepBody) builderStepBody.scrollTop = 0;
  }

  const runningSaveConfirmScrim = document.getElementById('runningSaveConfirmScrim');
  const runningSaveConfirmCancelBtn = document.getElementById('runningSaveConfirmCancelBtn');
  const runningSaveConfirmAcceptBtn = document.getElementById('runningSaveConfirmAcceptBtn');

  function closeRunningSaveConfirm(){
    if(runningSaveConfirmScrim) runningSaveConfirmScrim.style.display = 'none';
  }

  function openBuilderModalWithDraft(){
    stopPreviewBell();
    closeRunningSaveConfirm();
    draftSequenceConfig = cloneCfg(customSequenceConfig);
    syncStep1SubjectsFromNodeIds(draftSequenceConfig.selectedNodeIds);
    undoStack = [];
    redoStack = [];
    rowAlertMap = {};
    openTimePopupNodeId = null;
    popupTimeError = '';
    builderStep = 1;
    updateUndoRedoBtns();
    renderBuilderModal();
    builderModalBackdrop.classList.add('open');
    if(builderStepBody) builderStepBody.scrollTop = 0;
  }

  function closeBuilderModalDiscardDraft(){
    stopPreviewBell();
    closeRunningSaveConfirm();
    openTimePopupNodeId = null;
    popupTimeError = '';
    builderModalBackdrop.classList.remove('open');
  }

  if(builderUndoBtn){
    builderUndoBtn.addEventListener('click', ()=>{
      if(!undoStack.length)return;
      redoStack.push(cloneCfg(draftSequenceConfig));
      draftSequenceConfig = undoStack.pop();
      syncStep1SubjectsFromNodeIds(draftSequenceConfig.selectedNodeIds);
      updateUndoRedoBtns();
      renderBuilderModal();
    });
  }
  if(builderRedoBtn){
    builderRedoBtn.addEventListener('click', ()=>{
      if(!redoStack.length)return;
      undoStack.push(cloneCfg(draftSequenceConfig));
      draftSequenceConfig = redoStack.pop();
      syncStep1SubjectsFromNodeIds(draftSequenceConfig.selectedNodeIds);
      updateUndoRedoBtns();
      renderBuilderModal();
    });
  }

  /* ---------- Custom Checkbox Builder Modal Rendering & Events (3-Step Wizard) ---------- */
  function renderBuilderModal(){
    const cfg = draftSequenceConfig;
    const selectedIds = cfg.selectedNodeIds || [];
    const mutedIds = cfg.mutedNodeIds || [];
    const analysis = analyzeSequenceConfig(cfg);
    const rows = analysis.rows;

    if(builderStepper){
      builderStepper.querySelectorAll('.builder-step-tab[data-step-tab]').forEach(tab=>{
        const st = Number(tab.getAttribute('data-step-tab'));
        tab.classList.toggle('is-active', st === builderStep);
        tab.classList.toggle('is-done', st < builderStep);
        if(st === builderStep) tab.setAttribute('aria-current', 'step');
        else tab.removeAttribute('aria-current');
      });
    }
    if(builderQuickbar) builderQuickbar.classList.toggle('is-step-hidden', builderStep !== 1);
    if(builderLeftPane) builderLeftPane.classList.toggle('is-step-hidden', builderStep !== 2);
    if(builderRightPane) builderRightPane.classList.toggle('is-step-hidden', builderStep !== 3);
    if(builderPrevBtn) builderPrevBtn.style.display = builderStep > 1 ? '' : 'none';
    if(builderNextWrap) builderNextWrap.style.display = builderStep < 3 ? 'inline-flex' : 'none';
    if(builderApplyBtn) builderApplyBtn.disabled = !rows.length;

    updateStep1SubjectPreviewBar();

    const enabledGroups = EMBEDDED.subjectGroups.filter(g=>isGroupEnabledInStep2(g.id));
    const stageMetaList = (EMBEDDED.stageTypeMeta && EMBEDDED.stageTypeMeta.length)
      ? EMBEDDED.stageTypeMeta
      : [
          {type:'entry', label:'입실'},
          {type:'preliminary', label:'예비령'},
          {type:'prepare', label:'준비령'},
          {type:'main', label:'본령'},
          {type:'warn', label:'종료 전 안내'},
          {type:'end', label:'종료령'},
          {type:'listening', label:'영어 듣기 시작'}
        ];

    if(!enabledGroups.length){
      builderLeftPane.innerHTML = \`
        <div class="pane-title">
          <span>진행할 영역 및 타종 단계 선택</span>
          <span class="pane-note">응시 조합에서 체크한 과목만 표시됩니다 · 영역별 필요한 단계만 선택</span>
        </div>
        <div class="empty-state">
          <p style="margin:0 0 12px">1단계(응시 조합)에서 체크된 과목이 없습니다. 이전 단계에서 진행할 과목을 먼저 체크해 주세요.</p>
          <button type="button" class="chip" data-jump-step="1">1단계(응시 조합)로 이동</button>
        </div>
      \`;
    }else{
      const stageChipHtml = stageMetaList.map(meta=>{
        const matchNodes = EMBEDDED.selectableCueNodes.filter(n=>isGroupEnabledInStep2(n.subjectGroupId) && n.stageType===meta.type);
        if(!matchNodes.length) return '';
        const allAct = matchNodes.every(n=>selectedIds.includes(n.nodeId));
        return \`<button type="button" class="stage-type-chip \${allAct?'active':''}" data-stage-type="\${escapeHtml(meta.type)}">\${escapeHtml(meta.label)}</button>\`;
      }).join('');

      builderLeftPane.innerHTML = \`
        <div class="pane-title">
          <span>진행할 영역 및 타종 단계 선택</span>
          <span class="pane-note">응시 조합에서 체크한 과목만 표시됩니다 · 영역별 필요한 단계만 선택</span>
        </div>
        <div class="left-tools-panel">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input id="leftSearchInput" type="search" class="builder-search-input" placeholder="과목명, 단계명, 타종 번호, 시각 검색" value="\${escapeHtml(leftSearchQuery)}" aria-label="타종 항목 검색">
          </div>
          <div class="stage-type-bar" role="group" aria-label="유형별 일괄 선택">
            \${stageChipHtml}
          </div>
        </div>
      \`;

      const searchInp = builderLeftPane.querySelector('#leftSearchInput');
      if(searchInp){
        searchInp.addEventListener('input', ()=>{
          leftSearchQuery = searchInp.value || '';
          renderBuilderModal();
          const nextInp = builderLeftPane.querySelector('#leftSearchInput');
          if(nextInp){
            nextInp.focus();
            nextInp.setSelectionRange(leftSearchQuery.length, leftSearchQuery.length);
          }
        });
      }

      const qLower = leftSearchQuery.trim().toLowerCase();
      const cardsGrid = document.createElement('div');
      cardsGrid.className = 'area-cards-grid';
      let cardsAdded = 0;

      enabledGroups.forEach(group=>{
        const allGroupNodes = EMBEDDED.selectableCueNodes.filter(n=>n.subjectGroupId===group.id);
        const filteredNodes = qLower
          ? allGroupNodes.filter(n=>{
              const hay = (n.periodLabel+' '+n.subjectTitle+' '+n.fullTitle+' '+n.stageShortLabel+' '+(n.bellCode||'영어 듣기')+' '+n.originalTimeText).toLowerCase();
              return hay.includes(qLower);
            })
          : allGroupNodes;
        if(qLower && !filteredNodes.length) return;

        const checkedCount = allGroupNodes.filter(n=>selectedIds.includes(n.nodeId)).length;
        const allChecked = allGroupNodes.length>0 && checkedCount===allGroupNodes.length;
        const isCollapsed = Boolean(collapsedGroups[group.id]) && !qLower;

        const card = document.createElement('section');
        card.className = 'area-card' + (isCollapsed ? ' collapsed' : '');

        const head = document.createElement('div');
        head.className = 'area-head';
        head.innerHTML = \`
          <label class="area-check">
            <input type="checkbox" data-grp-all="\${group.id}" \${allChecked?'checked':''}>
            <span>\${escapeHtml(group.title)} (\${checkedCount}/\${allGroupNodes.length})</span>
          </label>
          <div class="area-head-actions">
            <button type="button" class="area-tag" data-grp-core="\${group.id}">핵심 단계</button>
            <button type="button" class="collapse-btn" data-grp-collapse="\${group.id}">\${isCollapsed?'펼치기':'접기'}</button>
          </div>
        \`;
        const allInput = head.querySelector('input[data-grp-all]');
        if(allInput){
          allInput.indeterminate = checkedCount > 0 && !allChecked;
        }
        card.appendChild(head);

        if(!isCollapsed){
          filteredNodes.forEach(node=>{
            const isChecked = selectedIds.includes(node.nodeId);
            const lbl = document.createElement('label');
            lbl.className = 'stage-row' + (isChecked ? ' selected' : '');
            lbl.innerHTML = \`
              <input type="checkbox" data-node-id="\${node.nodeId}" \${isChecked?'checked':''}>
              <span class="stage-name">\${escapeHtml(node.stageShortLabel)}</span>
              <span class="stage-meta">\${node.bellCode?'['+escapeHtml(node.bellCode)+'] ':'[영어 듣기] '}\${escapeHtml(node.originalTimeText)}</span>
            \`;
            card.appendChild(lbl);
          });
        }
        cardsGrid.appendChild(card);
        cardsAdded++;
      });

      if(!cardsAdded){
        const noMatch = document.createElement('div');
        noMatch.className = 'empty-state';
        noMatch.textContent = '검색 조건에 일치하는 타종 단계가 없습니다.';
        builderLeftPane.appendChild(noMatch);
      }else{
        builderLeftPane.appendChild(cardsGrid);
      }
    }

    let diagHtml = '';
    if(analysis.diagnostics && analysis.diagnostics.length){
      diagHtml = '<div class="diag-strip">' + analysis.diagnostics.map(d=>\`
        <div class="diag-item \${d.type==='warn'?'warn':'info'}">
          <span>\${escapeHtml(d.message)}</span>
          \${d.fixNodeId ? \`<button type="button" class="fix-btn" data-diag-fix="\${escapeHtml(d.fixNodeId)}">+ \${escapeHtml(d.fixLabel||'추가')}</button>\` : ''}
        </div>
      \`).join('') + '</div>';
    }

    builderRightPane.innerHTML = \`
      <div class="pane-title">
        <span>선택된 타종 진행 순서 및 시간 간격 · 시각 설정</span>
      </div>
      <div class="batch-interval-bar">
        <div class="batch-group">
          <span class="tools-label">일괄 간격</span>
          <button type="button" class="nudge" data-batch-preset="prep_1">준비→본령 1분</button>
          <button type="button" class="nudge" data-batch-preset="break_3">쉬는시간 3분</button>
          <button type="button" class="nudge" data-batch-preset="test_10s">전체 10초(테스트)</button>
        </div>
        <div class="batch-group">
          <span>기존</span>
          <input id="batchFromInput" type="number" min="1" max="600" class="batch-num-input" value="\${batchFromMin}" aria-label="변경 전 간격(분)">
          <span>분 →</span>
          <input id="batchToInput" type="number" min="1" max="600" class="batch-num-input" value="\${batchToMin}" aria-label="변경 후 간격(분)">
          <span>분</span>
          <button type="button" class="nudge" data-batch-replace="1">일괄 변경</button>
        </div>
      </div>
      \${diagHtml}
    \`;

    if(!rows.length){
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<p style="margin:0 0 12px">2단계에서 진행할 영역과 타종 단계를 하나 이상 선택해 주세요.</p><button type="button" class="chip" data-jump-step="2">2단계(영역·단계 선택)로 이동</button>';
      builderRightPane.appendChild(empty);
    }else{
      if(analysis.omittedBeforeFirst && analysis.omittedBeforeFirst.length){
        const omKey = '__BEFORE_FIRST__';
        const isExp = Boolean(expandedOmittedMap[omKey]);
        const omDiv = document.createElement('div');
        omDiv.className = 'omitted-steps-box';
        omDiv.innerHTML = \`
          <div class="omitted-head">
            <span>이전 생략된 단계 \${analysis.omittedBeforeFirst.length}개</span>
            <button type="button" class="collapse-btn" data-toggle-omitted="\${omKey}">\${isExp?'숨기기':'펼치기'}</button>
          </div>
          \${isExp ? ('<div class="omitted-list">' + analysis.omittedBeforeFirst.map(n=>\`<span class="omitted-pill">\${escapeHtml(n.subjectTitle)} \${escapeHtml(n.stageShortLabel)} <button type="button" data-add-node="\${escapeHtml(n.nodeId)}">+추가</button></span>\`).join('') + '</div>') : ''}
        \`;
        builderRightPane.appendChild(omDiv);
      }

      rows.forEach((row, idx)=>{
        const isLast = idx === rows.length - 1;
        const nextNode = row.nextNode;
        const isJump = nextNode && nextNode.subjectGroupId !== row.node.subjectGroupId;
        const origDiff = row.defaultIntervalMinutes;
        const pairKey = row.pairKey;
        const muteKey = row.node.bellCode || row.node.nodeId;
        const isMuted = mutedIds.includes(muteKey);
        const durSec = row.node.durationSec || (row.node.bellCode && EMBEDDED.bellDurationSecMap && EMBEDDED.bellDurationSecMap[row.node.bellCode]) || 10;
        const isSecMode = row.intervalAfterSeconds % 60 !== 0;
        const rowAlert = rowAlertMap[pairKey] || rowAlertMap['row_'+idx] || '';

        const article = document.createElement('article');
        const rowHmStr = format24hTime(row.customTimeMinutes);
        const [rowHh = 8, rowMm = 5] = rowHmStr.split(':').map(Number);
        const rowAmPm = rowHh < 12 ? '오전' : '오후';
        const rowH12 = rowHh % 12 === 0 ? 12 : rowHh % 12;
        const isRowPopupOpen = openTimePopupNodeId === row.node.nodeId;
        const isOpenUp = rows.length > 2 && idx >= rows.length - 1;
        article.className = 'schedule-item' + (isRowPopupOpen ? ' is-popover-open' : '');

        let popoverHtml = '';
        if(isRowPopupOpen){
          popoverHtml = \`
            <div class="custom-time-popover \${isOpenUp?'open-up':''}" data-time-popover="\${idx}">
              <div class="custom-time-head">
                <span class="custom-time-title">#\${idx+1} 타종 시각 <span class="custom-time-badge">\${rowHmStr}</span></span>
                <button type="button" class="custom-time-close" data-time-close="1">닫기</button>
              </div>
              <div class="custom-time-ampm-row">
                <button type="button" class="custom-time-ampm-btn \${rowHh<12?'is-active':''}" data-time-ampm="AM" data-time-row-idx="\${idx}">오전</button>
                <button type="button" class="custom-time-ampm-btn \${rowHh>=12?'is-active':''}" data-time-ampm="PM" data-time-row-idx="\${idx}">오후</button>
              </div>
              <div class="custom-time-digit-grid">
                <div class="custom-time-digit-box">
                  <span class="custom-time-digit-label">시</span>
                  <div class="custom-time-stepper">
                    <button type="button" class="custom-time-step-btn" data-time-delta="-60" data-time-row-idx="\${idx}" aria-label="1시간 감소">−</button>
                    <input type="text" inputmode="numeric" maxlength="2" class="custom-time-digit-input" data-time-digit="hour" value="\${escapeHtml(popupHourDraft)}" aria-label="시 입력">
                    <button type="button" class="custom-time-step-btn" data-time-delta="60" data-time-row-idx="\${idx}" aria-label="1시간 증가">+</button>
                  </div>
                </div>
                <span class="custom-time-colon">:</span>
                <div class="custom-time-digit-box">
                  <span class="custom-time-digit-label">분</span>
                  <div class="custom-time-stepper">
                    <button type="button" class="custom-time-step-btn" data-time-delta="-1" data-time-row-idx="\${idx}" aria-label="1분 감소">−</button>
                    <input type="text" inputmode="numeric" maxlength="2" class="custom-time-digit-input" data-time-digit="min" value="\${escapeHtml(popupMinDraft)}" aria-label="분 입력">
                    <button type="button" class="custom-time-step-btn" data-time-delta="1" data-time-row-idx="\${idx}" aria-label="1분 증가">+</button>
                  </div>
                </div>
              </div>
              <div class="custom-time-quick-grid">
                <button type="button" class="custom-time-nudge-btn" data-time-delta="-10" data-time-row-idx="\${idx}">−10분</button>
                <button type="button" class="custom-time-nudge-btn" data-time-delta="-5" data-time-row-idx="\${idx}">−5분</button>
                <button type="button" class="custom-time-nudge-btn" data-time-delta="-1" data-time-row-idx="\${idx}">−1분</button>
                <button type="button" class="custom-time-nudge-btn" data-time-delta="1" data-time-row-idx="\${idx}">+1분</button>
                <button type="button" class="custom-time-nudge-btn" data-time-delta="5" data-time-row-idx="\${idx}">+5분</button>
                <button type="button" class="custom-time-nudge-btn" data-time-delta="10" data-time-row-idx="\${idx}">+10분</button>
              </div>
              \${popupTimeError ? \`<div class="custom-time-error">\${escapeHtml(popupTimeError)}</div>\` : ''}
              <div class="custom-time-footer-row">
                <button type="button" class="custom-time-reset-btn" data-time-reset="\${escapeHtml(row.node.originalTimeText)}" data-time-row-idx="\${idx}">정시 (\${escapeHtml(row.node.originalTimeText)})</button>
                <button type="button" class="custom-time-apply-btn" data-time-apply="\${idx}">적용</button>
              </div>
            </div>
          \`;
        }

        const speakerIconSvg = isMuted
          ? '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6m0-6-5 6"/></svg>'
          : '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m2.8-9.8a9 9 0 0 1 0 12.6"/></svg>';

        let html = \`
          <div class="alarm-card">
            <div class="number">\${idx+1}</div>
            <div class="alarm-title-wrap">
              <div class="alarm-name">
                <span>\${escapeHtml(row.node.fullTitle)}</span>
                \${row.dayOffset > 0 ? \`<span class="next-day-badge">+\${row.dayOffset}일</span>\` : ''}
              </div>
              <div class="alarm-sub">정시 \${escapeHtml(row.node.originalTimeText)} · 타종 \${rowHmStr}\${row.dayOffset > 0 ? ' (+'+row.dayOffset+'일)' : ''} · \${row.node.bellCode?'타종 '+escapeHtml(row.node.bellCode)+' ('+durSec+'초)':'13:07 듣기 음원'}</div>
            </div>
            <div class="clock-control">
              <span>타종 시각</span>
              <div class="custom-select-wrap">
                <button type="button" class="custom-time-trigger \${isRowPopupOpen?'is-open':''}" data-time-trigger-row="\${idx}" data-time-node-id="\${escapeHtml(row.node.nodeId)}">
                  <span>\${rowAmPm} \${String(rowH12).padStart(2,'0')}:\${String(rowMm).padStart(2,'0')}</span>
                  <svg class="chevron-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                \${popoverHtml}
              </div>
            </div>
            <div class="alarm-actions-col">
              <button type="button" class="mute-toggle-btn \${isMuted?'is-muted':''}" data-mute-key="\${escapeHtml(muteKey)}" aria-label="\${isMuted?'타종 소리 켜기':'타종 무음 처리'}" title="\${isMuted?'현재 무음 (클릭 시 소리 켜기)':'소리 켜짐 (클릭 시 무음)'}">\${speakerIconSvg}</button>
            </div>
          </div>
        \`;

        if(!isLast || rows.length===1){
          const waitLabel = isSecMode ? (row.intervalAfterSeconds+'초') : (row.intervalAfterMinutes+'분');
          const inpDisplayVal = isSecMode
            ? (Math.floor(row.intervalAfterSeconds/60)+':'+String(row.intervalAfterSeconds%60).padStart(2,'0'))
            : String(row.intervalAfterMinutes);
          html += \`
            <div class="interval-row">
              <div class="interval-copy">
                <div class="interval-title">\${nextNode ? (escapeHtml(row.node.stageShortLabel)+' 후 '+waitLabel+' 뒤 → '+(isJump?'['+escapeHtml(nextNode.subjectTitle)+'] ':'')+escapeHtml(nextNode.stageShortLabel)) : (escapeHtml(row.node.stageShortLabel)+' 단독 타이머 진행 시간 ('+waitLabel+')')}</div>
                \${nextNode ? \`<div class="interval-sub">원래 수능 간격: \${origDiff}분\${isJump?' (과목/교시 전환 구간)':''}</div>\` : ''}
                \${row.truncationWarning ? \`<div class="row-inline-alert"><span>\${escapeHtml(row.truncationWarning)}</span></div>\` : ''}
                \${row.missingEngListeningNotice ? \`<div class="row-inline-alert"><span>\${escapeHtml(row.missingEngListeningNotice)}</span><button type="button" class="fix-btn" data-add-node="ENG_1307">+ 13:07 듣기 추가</button></div>\` : ''}
                \${rowAlert ? \`<div class="row-inline-alert"><span>\${escapeHtml(rowAlert)}</span></div>\` : ''}
              </div>
              <div class="interval-actions">
                <button type="button" class="nudge" data-step-key="\${escapeHtml(pairKey)}" data-step-base="\${row.intervalAfterMinutes}" data-step-delta="-5">-5분</button>
                <button type="button" class="nudge" data-step-key="\${escapeHtml(pairKey)}" data-step-base="\${row.intervalAfterMinutes}" data-step-delta="-1">-1분</button>
                <input type="text" inputmode="numeric" class="interval-input" data-interval-key="\${escapeHtml(pairKey)}" value="\${inpDisplayVal}" title="분 숫자(예: 10) 또는 분:초(예: 0:10) 입력" aria-label="다음 타종까지 대기 간격(분 또는 분:초)">
                <span class="unit">\${isSecMode ? '분:초' : '분 뒤'}</span>
                <button type="button" class="nudge" data-step-key="\${escapeHtml(pairKey)}" data-step-base="\${row.intervalAfterMinutes}" data-step-delta="1">+1분</button>
                <button type="button" class="nudge" data-step-key="\${escapeHtml(pairKey)}" data-step-base="\${row.intervalAfterMinutes}" data-step-delta="5">+5분</button>
                <button type="button" class="nudge" data-step-key="\${escapeHtml(pairKey)}" data-step-base="\${row.intervalAfterMinutes}" data-step-delta="10">+10분</button>
              </div>
            </div>
          \`;
        }

        if(row.omittedAfter && row.omittedAfter.length){
          const isExp = Boolean(expandedOmittedMap[pairKey]);
          html += \`
            <div class="omitted-steps-box">
              <div class="omitted-head">
                <span>이 구간 사이 생략된 단계 \${row.omittedAfter.length}개</span>
                <button type="button" class="collapse-btn" data-toggle-omitted="\${escapeHtml(pairKey)}">\${isExp?'숨기기':'펼치기'}</button>
              </div>
              \${isExp ? ('<div class="omitted-list">' + row.omittedAfter.map(n=>\`<span class="omitted-pill">\${escapeHtml(n.subjectTitle)} \${escapeHtml(n.stageShortLabel)} <button type="button" data-add-node="\${escapeHtml(n.nodeId)}">+추가</button></span>\`).join('') + '</div>') : ''}
            </div>
          \`;
        }

        article.innerHTML = html;
        builderRightPane.appendChild(article);
      });

      if(analysis.omittedAfterLast && analysis.omittedAfterLast.length){
        const omKey = '__AFTER_LAST__';
        const isExp = Boolean(expandedOmittedMap[omKey]);
        const omDiv = document.createElement('div');
        omDiv.className = 'omitted-steps-box';
        omDiv.innerHTML = \`
          <div class="omitted-head">
            <span>이후 생략된 단계 \${analysis.omittedAfterLast.length}개</span>
            <button type="button" class="collapse-btn" data-toggle-omitted="\${omKey}">\${isExp?'숨기기':'펼치기'}</button>
          </div>
          \${isExp ? ('<div class="omitted-list">' + analysis.omittedAfterLast.map(n=>\`<span class="omitted-pill">\${escapeHtml(n.subjectTitle)} \${escapeHtml(n.stageShortLabel)} <button type="button" data-add-node="\${escapeHtml(n.nodeId)}">+추가</button></span>\`).join('') + '</div>') : ''}
        \`;
        builderRightPane.appendChild(omDiv);
      }
    }

    updatePreviewButtonsUI();
    const totalMin = analysis.totalDurationMinutes;
    const hrText = Math.floor(totalMin/60)>0 ? (Math.floor(totalMin/60)+'시간 '+(totalMin%60)+'분') : (totalMin+'분');
    builderSummaryText.innerHTML = '선택된 타종: <strong>'+rows.length+'개</strong> · 총 진행 대기 시간: <strong>'+hrText+' ('+totalMin+'분)</strong>';
  }

  builderLeftPane.addEventListener('change', e=>{
    const nodeChk = e.target.closest('input[data-node-id]');
    if(nodeChk){
      const id = nodeChk.getAttribute('data-node-id');
      mutateDraftConfig(cfg=>{
        const arr = cfg.selectedNodeIds || [];
        if(nodeChk.checked){
          if(!arr.includes(id)) arr.push(id);
        }else{
          cfg.selectedNodeIds = arr.filter(x=>x!==id);
        }
      });
      return;
    }
    const grpChk = e.target.closest('input[data-grp-all]');
    if(grpChk){
      const grpId = grpChk.getAttribute('data-grp-all');
      const grpIds = EMBEDDED.selectableCueNodes.filter(n=>n.subjectGroupId===grpId).map(n=>n.nodeId);
      mutateDraftConfig(cfg=>{
        const set = new Set(cfg.selectedNodeIds || []);
        if(grpChk.checked) grpIds.forEach(id=>set.add(id));
        else grpIds.forEach(id=>set.delete(id));
        cfg.selectedNodeIds = Array.from(set);
      });
    }
  });

  builderLeftPane.addEventListener('click', e=>{
    const jumpBtn = e.target.closest('button[data-jump-step]');
    if(jumpBtn){
      goToBuilderStep(Number(jumpBtn.getAttribute('data-jump-step')) || 1);
      return;
    }
    const collapseBtn = e.target.closest('button[data-grp-collapse]');
    if(collapseBtn){
      const gid = collapseBtn.getAttribute('data-grp-collapse');
      collapsedGroups[gid] = !collapsedGroups[gid];
      renderBuilderModal();
      return;
    }
    const stBtn = e.target.closest('button[data-stage-type]');
    if(stBtn){
      const st = stBtn.getAttribute('data-stage-type');
      const targetIds = EMBEDDED.selectableCueNodes
        .filter(n=>isGroupEnabledInStep2(n.subjectGroupId) && n.stageType===st)
        .map(n=>n.nodeId);
      if(!targetIds.length) return;
      mutateDraftConfig(cfg=>{
        const set = new Set(cfg.selectedNodeIds || []);
        const allChecked = targetIds.every(id=>set.has(id));
        if(allChecked) targetIds.forEach(id=>set.delete(id));
        else targetIds.forEach(id=>set.add(id));
        cfg.selectedNodeIds = Array.from(set);
      });
      return;
    }
    const coreBtn = e.target.closest('button[data-grp-core]');
    if(!coreBtn)return;
    const grpId = coreBtn.getAttribute('data-grp-core');
    const allGrpNodes = EMBEDDED.selectableCueNodes.filter(n=>n.subjectGroupId===grpId);
    const coreIds = allGrpNodes.filter(n=>n.isCoreExamStage).map(n=>n.nodeId);
    mutateDraftConfig(cfg=>{
      const set = new Set(cfg.selectedNodeIds || []);
      const allCoreSelected = coreIds.every(id=>set.has(id));
      allGrpNodes.forEach(n=>set.delete(n.nodeId));
      if(!allCoreSelected) coreIds.forEach(id=>set.add(id));
      cfg.selectedNodeIds = Array.from(set);
    });
  });

  builderRightPane.addEventListener('click', e=>{
    const jumpBtn = e.target.closest('button[data-jump-step]');
    if(jumpBtn){
      goToBuilderStep(Number(jumpBtn.getAttribute('data-jump-step')) || 2);
      return;
    }
    const prevBtn = e.target.closest('button[data-preview-bell]');
    if(prevBtn){
      togglePreviewBell(prevBtn.getAttribute('data-preview-bell'));
      return;
    }
    const muteBtn = e.target.closest('button[data-mute-key]');
    if(muteBtn){
      const mk = muteBtn.getAttribute('data-mute-key');
      mutateDraftConfig(cfg=>{
        const set = new Set(cfg.mutedNodeIds || []);
        if(set.has(mk)) set.delete(mk);
        else set.add(mk);
        cfg.mutedNodeIds = Array.from(set);
      });
      return;
    }
    const addNodeBtn = e.target.closest('button[data-add-node], button[data-diag-fix]');
    if(addNodeBtn){
      const nid = addNodeBtn.getAttribute('data-add-node') || addNodeBtn.getAttribute('data-diag-fix');
      if(nid){
        const nodeMeta = EMBEDDED.selectableCueNodes.find(n=>n.nodeId===nid);
        if(nodeMeta){
          step1SubjectFilter[nodeMeta.subjectGroupId] = true;
          if(nodeMeta.subjectGroupId==='inq2'){
            step1SubjectFilter.inq1 = true;
            step1InqCount = 2;
          }
          syncStep1DomFromState();
        }
        mutateDraftConfig(cfg=>{
          if(!cfg.selectedNodeIds.includes(nid)) cfg.selectedNodeIds.push(nid);
        });
      }
      return;
    }
    const omBtn = e.target.closest('button[data-toggle-omitted]');
    if(omBtn){
      const ok = omBtn.getAttribute('data-toggle-omitted');
      expandedOmittedMap[ok] = !expandedOmittedMap[ok];
      renderBuilderModal();
      return;
    }
    const batchPresetBtn = e.target.closest('button[data-batch-preset]');
    if(batchPresetBtn){
      const preset = batchPresetBtn.getAttribute('data-batch-preset');
      mutateDraftConfig(cfg=>{
        const rows = computeSequenceNodeRows(cfg);
        if(!cfg.intervalMap) cfg.intervalMap = {};
        if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
        if(preset==='prep_1'){
          rows.forEach(r=>{
            if((r.node.stageType==='prepare'||r.node.stageType==='prep') && r.nextNode && (r.nextNode.stageType==='main'||r.nextNode.stageType==='listening')){
              cfg.intervalMap[r.pairKey] = 1;
              delete cfg.intervalSecondsMap[r.pairKey];
            }
          });
        }else if(preset==='break_3'){
          rows.forEach(r=>{
            if(r.nextNode && r.node.subjectGroupId !== r.nextNode.subjectGroupId){
              cfg.intervalMap[r.pairKey] = 3;
              delete cfg.intervalSecondsMap[r.pairKey];
            }
          });
        }else if(preset==='test_10s'){
          rows.forEach(r=>{
            cfg.intervalSecondsMap[r.pairKey] = 10;
            cfg.intervalMap[r.pairKey] = 1;
          });
        }
      });
      return;
    }
    const batchReplaceBtn = e.target.closest('button[data-batch-replace]');
    if(batchReplaceBtn){
      const fromInp = builderRightPane.querySelector('#batchFromInput');
      const toInp = builderRightPane.querySelector('#batchToInput');
      batchFromMin = clamp(Math.round(Number(fromInp && fromInp.value)||80),1,600);
      batchToMin = clamp(Math.round(Number(toInp && toInp.value)||60),1,600);
      mutateDraftConfig(cfg=>{
        const rows = computeSequenceNodeRows(cfg);
        if(!cfg.intervalMap) cfg.intervalMap = {};
        if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
        rows.forEach(r=>{
          if(r.intervalAfterMinutes === batchFromMin){
            cfg.intervalMap[r.pairKey] = batchToMin;
            delete cfg.intervalSecondsMap[r.pairKey];
          }
        });
      });
      return;
    }
    const stepBtn = e.target.closest('button[data-step-key]');
    if(stepBtn){
      const key = stepBtn.getAttribute('data-step-key');
      const base = Number(stepBtn.getAttribute('data-step-base')) || 5;
      const delta = Number(stepBtn.getAttribute('data-step-delta')) || 0;
      mutateDraftConfig(cfg=>{
        if(!cfg.intervalMap) cfg.intervalMap = {};
        if(cfg.intervalSecondsMap) delete cfg.intervalSecondsMap[key];
        cfg.intervalMap[key] = clamp(base + delta, 1, 600);
      });
      return;
    }

    const timeTrig = e.target.closest('button[data-time-trigger-row]');
    if(timeTrig){
      const rIdx = Number(timeTrig.getAttribute('data-time-trigger-row'));
      const nid = timeTrig.getAttribute('data-time-node-id');
      if(openTimePopupNodeId === nid){
        openTimePopupNodeId = null;
        popupTimeError = '';
      }else{
        const rows = computeSequenceNodeRows(draftSequenceConfig);
        const targetRow = rows[rIdx];
        if(targetRow){
          const hmStr = format24hTime(targetRow.customTimeMinutes);
          const [hh = 8, mm = 5] = hmStr.split(':').map(Number);
          const h12 = hh % 12 === 0 ? 12 : hh % 12;
          openTimePopupNodeId = nid;
          popupHourDraft = String(h12).padStart(2,'0');
          popupMinDraft = String(mm).padStart(2,'0');
          popupTimeError = '';
        }
      }
      renderBuilderModal();
      return;
    }

    if(e.target.closest('button[data-time-close]')){
      openTimePopupNodeId = null;
      popupTimeError = '';
      renderBuilderModal();
      return;
    }

    const ampmBtn = e.target.closest('button[data-time-ampm]');
    if(ampmBtn){
      const rIdx = Number(ampmBtn.getAttribute('data-time-row-idx'));
      const period = ampmBtn.getAttribute('data-time-ampm');
      const rows = computeSequenceNodeRows(draftSequenceConfig);
      const targetRow = rows[rIdx];
      if(targetRow){
        const hmStr = format24hTime(targetRow.customTimeMinutes);
        const [hh = 8, mm = 5] = hmStr.split(':').map(Number);
        let nextH = hh;
        if(period === 'AM' && hh >= 12) nextH = hh - 12;
        if(period === 'PM' && hh < 12) nextH = hh + 12;
        const nextHm = String(nextH).padStart(2,'0')+':'+String(mm).padStart(2,'0');
        applyStandaloneRowTimeEdit(rIdx, nextHm, false);
      }
      return;
    }

    const deltaBtn = e.target.closest('button[data-time-delta]');
    if(deltaBtn){
      const rIdx = Number(deltaBtn.getAttribute('data-time-row-idx'));
      const deltaMin = Number(deltaBtn.getAttribute('data-time-delta')) || 0;
      const rows = computeSequenceNodeRows(draftSequenceConfig);
      const targetRow = rows[rIdx];
      if(targetRow){
        const nextMinOfDay = clamp(Math.floor(targetRow.customTimeMinutes)%1440 + deltaMin, 0, 1439);
        applyStandaloneRowTimeEdit(rIdx, format24hTime(nextMinOfDay), false);
      }
      return;
    }

    const resetBtn = e.target.closest('button[data-time-reset]');
    if(resetBtn){
      const rIdx = Number(resetBtn.getAttribute('data-time-row-idx'));
      const origHm = resetBtn.getAttribute('data-time-reset') || '08:40';
      applyStandaloneRowTimeEdit(rIdx, origHm, true);
      return;
    }

    const applyBtn = e.target.closest('button[data-time-apply]');
    if(applyBtn){
      const rIdx = Number(applyBtn.getAttribute('data-time-apply'));
      commitStandaloneDigitPopup(rIdx);
    }
  });

  function applyStandaloneRowTimeEdit(rowIdx, targetHmStr, closeOnSuccess){
    const match = String(targetHmStr || '').trim().match(/^(\d{1,2}):([0-5]\d)$/);
    if(!match || Number(match[1]) > 23){
      popupTimeError = '당일 시각(00:00 ~ 23:59) 형식으로 입력해 주세요.';
      renderBuilderModal();
      return false;
    }
    const hh = Number(match[1]);
    const mm = Number(match[2]);
    const targetSec = hh * 3600 + mm * 60;
    const rows = computeSequenceNodeRows(draftSequenceConfig);
    const currRow = rows[rowIdx];
    if(!currRow) return false;
    const prevRow = rowIdx > 0 ? rows[rowIdx - 1] : null;
    const nextRow = rowIdx < rows.length - 1 ? rows[rowIdx + 1] : null;

    if(rowIdx === 0){
      mutateDraftConfig(cfg=>{
        cfg.firstNodeCustomMinutes = targetSec / 60;
        if(!cfg.intervalMap) cfg.intervalMap = {};
        if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
        if(nextRow){
          const afterSec = Math.round(nextRow.customTimeMinutes * 60) - targetSec;
          if(afterSec >= 10 && afterSec <= 36000){
            const afterKey = currRow.node.nodeId + '__' + nextRow.node.nodeId;
            cfg.intervalSecondsMap[afterKey] = afterSec;
            cfg.intervalMap[afterKey] = Math.max(1, Math.round(afterSec / 60));
          }
        }
      });
    }else if(prevRow){
      const prevSec = Math.round(prevRow.customTimeMinutes * 60);
      if(prevSec >= 86400){
        popupTimeError = '자정(+1일) 이후 단계는 간격(분/초) 입력란으로만 조정할 수 있습니다.';
        renderBuilderModal();
        return false;
      }
      const diffSec = targetSec - prevSec;
      if(diffSec <= 0){
        popupTimeError = '직전 단계('+format24hTime(prevRow.customTimeMinutes)+')보다 이후 시각을 입력해 주세요.';
        renderBuilderModal();
        return false;
      }
      if(diffSec < 10){
        popupTimeError = '직전 단계와 최소 10초 이상 간격이 필요합니다.';
        renderBuilderModal();
        return false;
      }
      if(diffSec > 36000){
        popupTimeError = '직전 단계와의 간격은 최대 600분을 넘을 수 없습니다.';
        renderBuilderModal();
        return false;
      }
      const prevKey = prevRow.node.nodeId + '__' + currRow.node.nodeId;
      const newCurrSec = prevSec + diffSec;
      mutateDraftConfig(cfg=>{
        if(!cfg.intervalMap) cfg.intervalMap = {};
        if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
        cfg.intervalSecondsMap[prevKey] = Math.round(diffSec);
        cfg.intervalMap[prevKey] = Math.max(1, Math.round(diffSec / 60));
        if(nextRow){
          const afterSec = Math.round(nextRow.customTimeMinutes * 60) - newCurrSec;
          if(afterSec >= 10 && afterSec <= 36000){
            const afterKey = currRow.node.nodeId + '__' + nextRow.node.nodeId;
            cfg.intervalSecondsMap[afterKey] = afterSec;
            cfg.intervalMap[afterKey] = Math.max(1, Math.round(afterSec / 60));
          }
        }
      });
    }

    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    popupHourDraft = String(h12).padStart(2,'0');
    popupMinDraft = String(mm).padStart(2,'0');
    popupTimeError = '';
    if(closeOnSuccess){
      openTimePopupNodeId = null;
    }
    renderBuilderModal();
    return true;
  }

  function commitStandaloneDigitPopup(rowIdx){
    const rawH = Number(popupHourDraft);
    const rawM = Number(popupMinDraft);
    if(!isFinite(rawH) || !isFinite(rawM) || rawH < 1 || rawH > 12 || rawM < 0 || rawM > 59){
      popupTimeError = '시(1~12)와 분(0~59)을 올바르게 입력해 주세요.';
      renderBuilderModal();
      return;
    }
    const rows = computeSequenceNodeRows(draftSequenceConfig);
    const targetRow = rows[rowIdx];
    if(!targetRow) return;
    const isPmNow = Math.floor(targetRow.customTimeMinutes % 1440) >= 720;
    const nextH24 = (Math.round(rawH) % 12) + (isPmNow ? 12 : 0);
    const nextHm = String(nextH24).padStart(2,'0')+':'+String(Math.round(rawM)).padStart(2,'0');
    applyStandaloneRowTimeEdit(rowIdx, nextHm, true);
  }

  builderRightPane.addEventListener('input', e=>{
    const dig = e.target.closest('input[data-time-digit]');
    if(!dig) return;
    const cleaned = String(dig.value || '').replace(/\D/g,'').slice(0,2);
    if(dig.value !== cleaned) dig.value = cleaned;
    if(dig.getAttribute('data-time-digit')==='hour') popupHourDraft = cleaned;
    else popupMinDraft = cleaned;
  });

  builderRightPane.addEventListener('keydown', e=>{
    if(e.key==='Enter'){
      const dig = e.target.closest('input[data-time-digit]');
      if(dig){
        e.preventDefault();
        const pop = dig.closest('[data-time-popover]');
        if(pop) commitStandaloneDigitPopup(Number(pop.getAttribute('data-time-popover')));
      }
    }
  });

  document.addEventListener('pointerdown', e=>{
    if(!openTimePopupNodeId) return;
    if(e.target && e.target.closest && e.target.closest('.custom-select-wrap')) return;
    openTimePopupNodeId = null;
    popupTimeError = '';
    renderBuilderModal();
  }, true);

  builderRightPane.addEventListener('change', e=>{
    const intInput = e.target.closest('input[data-interval-key]');
    if(intInput){
      const key = intInput.getAttribute('data-interval-key');
      const trimmed = String(intInput.value || '').trim();
      let msg = '';
      if(trimmed.includes(':')){
        const p = trimmed.split(':').map(Number);
        const rawSec = (p[0]||0)*60 + (p[1]||0);
        if(!isFinite(rawSec) || rawSec < 5){
          msg = '초 단위 최소 간격은 5초(0:05)입니다. 5초로 보정되었습니다.';
          mutateDraftConfig(cfg=>{
            if(!cfg.intervalMap) cfg.intervalMap = {};
            if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
            cfg.intervalSecondsMap[key] = 5;
            cfg.intervalMap[key] = 1;
          });
        }else{
          const clampedSec = clamp(Math.round(rawSec), 5, 36000);
          mutateDraftConfig(cfg=>{
            if(!cfg.intervalMap) cfg.intervalMap = {};
            if(!cfg.intervalSecondsMap) cfg.intervalSecondsMap = {};
            cfg.intervalSecondsMap[key] = clampedSec;
            cfg.intervalMap[key] = Math.max(1, Math.round(clampedSec/60));
          });
        }
      }else{
        const raw = Number(trimmed);
        let val = Math.round(raw);
        if(!isFinite(raw) || raw < 1){ val = 1; msg = '최소 간격은 1분입니다. 1분으로 보정되었습니다.'; }
        else if(raw > 600){ val = 600; msg = '최대 간격은 600분입니다. 600분으로 보정되었습니다.'; }
        mutateDraftConfig(cfg=>{
          if(!cfg.intervalMap) cfg.intervalMap = {};
          if(cfg.intervalSecondsMap) delete cfg.intervalSecondsMap[key];
          cfg.intervalMap[key] = val;
        });
      }
      if(msg){
        rowAlertMap[key] = msg;
        renderBuilderModal();
      }
      return;
    }
  });

  function applyLiveSubjectCombinationToDraft(resetIntervals){
    const checkedSubjs = Array.from(document.querySelectorAll('.subj-chk:checked')).map(el=>el.value);
    const inqChecked = Boolean((document.getElementById('subjInqChk')||{}).checked);
    const inqCountRaw = Number((document.getElementById('subjInqCountSel')||{}).value ?? 2);
    const inqCount = inqCountRaw >= 2 ? 2 : 1;
    const lang2 = Boolean((document.getElementById('subjLang2Chk')||{}).checked);
    const density = (document.getElementById('subjDensitySel')||{}).value || 'core';

    step1InqCount = inqCount;
    step1SubjectFilter = {
      kor: checkedSubjs.includes('kor'),
      math: checkedSubjs.includes('math'),
      eng: checkedSubjs.includes('eng'),
      hist: checkedSubjs.includes('hist'),
      inq1: inqChecked,
      inq2: inqChecked && inqCount >= 2,
      lang2
    };

    const activeGroups = new Set(checkedSubjs);
    if(inqChecked && inqCount >= 1) activeGroups.add('inq1');
    if(inqChecked && inqCount >= 2) activeGroups.add('inq2');
    if(lang2) activeGroups.add('lang2');

    if(resetIntervals && !activeGroups.size){
      showToast('자동 구성할 영역을 최소 1개 이상 선택해 주세요.', 2600);
      return;
    }

    const ids = EMBEDDED.selectableCueNodes.filter(n=>{
      if(!activeGroups.has(n.subjectGroupId)) return false;
      if(density==='all') return true;
      if(density==='core') return Boolean(n.isCoreExamStage);
      return n.stageType==='main' || n.stageType==='listening' || n.stageType==='warn' || n.stageType==='end';
    }).map(n=>n.nodeId);

    mutateDraftConfig(cfg=>{
      cfg.selectedNodeIds = ids;
      if(resetIntervals){
        cfg.intervalMap = {};
        cfg.intervalSecondsMap = {};
        cfg.firstNodeCustomMinutes = null;
      }
    });
    if(resetIntervals){
      showToast('선택한 ' + activeGroups.size + '개 영역(' + ids.length + '개 타종)으로 구성을 채웠습니다.', 2800);
    }
  }
  document.querySelectorAll('.subj-chk, #subjInqChk, #subjLang2Chk, #subjInqCountSel, #subjDensitySel').forEach(el=>{
    el.addEventListener('change', ()=>{
      if(el.id==='subjInqCountSel'){
        const inqChk = document.getElementById('subjInqChk');
        if(inqChk && !inqChk.checked) inqChk.checked = true;
      }
      applyLiveSubjectCombinationToDraft(false);
    });
  });
  const subjAutoApplyBtn = document.getElementById('subjAutoApplyBtn');
  if(subjAutoApplyBtn){
    subjAutoApplyBtn.addEventListener('click', ()=>{
      applyLiveSubjectCombinationToDraft(true);
    });
  }

  if(builderStepper){
    builderStepper.addEventListener('click', e=>{
      const tab = e.target.closest('button[data-step-tab]');
      if(tab){
        goToBuilderStep(Number(tab.getAttribute('data-step-tab')) || 1);
      }
    });
  }
  if(builderPrevBtn){
    builderPrevBtn.addEventListener('click', ()=>{
      goToBuilderStep(Math.max(1, builderStep - 1));
    });
  }
  if(builderNextBtn){
    builderNextBtn.addEventListener('click', ()=>{
      goToBuilderStep(Math.min(3, builderStep + 1));
    });
  }

  document.querySelectorAll('button[data-tpl]').forEach(tplBtn=>{
    tplBtn.addEventListener('click',()=>{
      const tpl = tplBtn.getAttribute('data-tpl');
      if(tpl==='reset_intervals'){
        mutateDraftConfig(cfg=>{
          cfg.intervalMap = {};
          cfg.intervalSecondsMap = {};
          cfg.firstNodeCustomMinutes = null;
        });
        showToast('선택된 타종 항목들의 간격과 시각을 공식 시간표 기준으로 초기화했습니다.', 2400);
        return;
      }
      let nextIds = [];
      if(tpl==='all_39'){
        nextIds = EMBEDDED.defaultCustomSeqConfig.selectedNodeIds.slice();
      }else if(tpl==='kor_math_inq1_core'){
        nextIds = ['004','005','006','007','010','011','012','013','025','026','027','028'];
      }else if(tpl==='kor_core'){
        nextIds = ['004','005','006','007'];
      }else if(tpl==='eng_listening_core'){
        nextIds = ['016','ENG_1307','017','018'];
      }else if(tpl==='all_core'){
        nextIds = EMBEDDED.selectableCueNodes.filter(n=>n.isCoreExamStage).map(n=>n.nodeId);
      }
      syncStep1SubjectsFromNodeIds(nextIds);
      mutateDraftConfig(cfg=>{
        cfg.intervalMap = {};
        cfg.intervalSecondsMap = {};
        cfg.firstNodeCustomMinutes = null;
        cfg.selectedNodeIds = nextIds;
      });
    });
  });

  /* ---------- 자주 쓰는 타종 구성 (Bookmark & Folder) Management (A3 Escape & C4 Actions) ---------- */
  const drawerFolderToggleBtn = document.getElementById('drawerFolderToggleBtn');
  const drawerFolderCreateRow = document.getElementById('drawerFolderCreateRow');
  const drawerFolderInput = document.getElementById('drawerFolderInput');
  const drawerFolderConfirmBtn = document.getElementById('drawerFolderConfirmBtn');
  const drawerBookmarkToggleBtn = document.getElementById('drawerBookmarkToggleBtn');
  const drawerBookmarkSaveBlock = document.getElementById('drawerBookmarkSaveBlock');
  const drawerSaveFolderRow = document.getElementById('drawerSaveFolderRow');
  const drawerFolderTabs = document.getElementById('drawerFolderTabs');
  const drawerFolderToolbar = document.getElementById('drawerFolderToolbar');
  const drawerBookmarkInput = document.getElementById('drawerBookmarkInput');
  const drawerBookmarkConfirmBtn = document.getElementById('drawerBookmarkConfirmBtn');
  const drawerBookmarkList = document.getElementById('drawerBookmarkList');
  const drawerBookmarkUndoBar = document.getElementById('drawerBookmarkUndoBar');
  const drawerBookmarkUndoText = document.getElementById('drawerBookmarkUndoText');
  const drawerBookmarkUndoBtn = document.getElementById('drawerBookmarkUndoBtn');
  const modalBookmarkFolderTabs = document.getElementById('modalBookmarkFolderTabs');
  const modalBookmarkFolderActions = document.getElementById('modalBookmarkFolderActions');
  const modalFolderCreateRow = document.getElementById('modalFolderCreateRow');
  const modalFolderInput = document.getElementById('modalFolderInput');
  const modalFolderConfirmBtn = document.getElementById('modalFolderConfirmBtn');
  const modalBookmarkFolderSelect = document.getElementById('modalBookmarkFolderSelect');
  const modalBookmarkMoveBar = document.getElementById('modalBookmarkMoveBar');
  const modalBookmarkList = document.getElementById('modalBookmarkList');
  const modalBookmarkInput = document.getElementById('modalBookmarkInput');
  const modalBookmarkSaveBtn = document.getElementById('modalBookmarkSaveBtn');

  function getFolderNameById(fid){
    const found = bookmarkFolders.find(f=>f.id===fid);
    return found ? found.name : null;
  }
  function selectFolderFilter(folderKey){
    activeBookmarkFolderFilter = folderKey;
    saveTargetFolderId = (folderKey==='all' || folderKey==='uncategorized') ? '' : folderKey;
    editingFolderId = null;
    renderBookmarks();
  }
  function createBookmarkFolder(rawName, closeDrawerInput){
    const trimmed = String(rawName || '').trim().slice(0,30);
    if(!trimmed){
      showToast('새 폴더 이름을 입력해 주세요.', 2400);
      return;
    }
    if(bookmarkFolders.some(f=>f.name===trimmed)){
      showToast("이미 '" + trimmed + "' 폴더가 있습니다.", 2400);
      return;
    }
    const newFolder = {
      id: 'bmf_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      name: trimmed,
      createdAt: new Date().toISOString()
    };
    bookmarkFolders.push(newFolder);
    if(drawerFolderInput) drawerFolderInput.value = '';
    if(modalFolderInput) modalFolderInput.value = '';
    if(closeDrawerInput && drawerFolderCreateRow){
      drawerFolderCreateRow.classList.remove('open');
      if(drawerFolderToggleBtn) drawerFolderToggleBtn.textContent = '+ 새 폴더';
    }
    isModalFolderInputOpen = false;
    activeBookmarkFolderFilter = newFolder.id;
    saveTargetFolderId = newFolder.id;
    renderBookmarks();
    saveCustomSettings();
    showToast("'" + trimmed + "' 북마크 폴더가 생성되었습니다.", 2500);
  }
  function renameBookmarkFolder(folderId, rawName){
    const trimmed = String(rawName || '').trim().slice(0,30);
    if(!trimmed){
      showToast('폴더 이름을 입력해 주세요.', 2200);
      return;
    }
    if(bookmarkFolders.some(f=>f.id!==folderId && f.name===trimmed)){
      showToast("이미 '" + trimmed + "' 폴더가 있습니다.", 2400);
      return;
    }
    bookmarkFolders = bookmarkFolders.map(f=>f.id===folderId ? Object.assign({}, f, {name: trimmed}) : f);
    editingFolderId = null;
    renderBookmarks();
    saveCustomSettings();
    showToast("폴더 이름을 '" + trimmed + "'(으)로 변경했습니다.", 2200);
  }
  function deleteBookmarkFolder(folderId){
    const target = bookmarkFolders.find(f=>f.id===folderId);
    if(!target)return;
    bookmarkFolders = bookmarkFolders.filter(f=>f.id!==folderId);
    bookmarks = bookmarks.map(b=>b.folderId===folderId ? Object.assign({}, b, {folderId: null}) : b);
    if(activeBookmarkFolderFilter===folderId) activeBookmarkFolderFilter = 'all';
    if(saveTargetFolderId===folderId) saveTargetFolderId = '';
    if(editingFolderId===folderId) editingFolderId = null;
    renderBookmarks();
    saveCustomSettings();
    showToast("'" + target.name + "' 폴더를 삭제했습니다. 내부 구성은 미분류로 이동되었습니다.", 2800);
  }
  function moveBookmarkToFolder(bmId, targetFolderId){
    const bm = bookmarks.find(b=>b.id===bmId);
    if(!bm)return;
    const normalized = (targetFolderId && bookmarkFolders.some(f=>f.id===targetFolderId)) ? targetFolderId : null;
    bookmarks = bookmarks.map(b=>b.id===bmId ? Object.assign({}, b, {folderId: normalized}) : b);
    movingBookmarkId = null;
    renderBookmarks();
    saveCustomSettings();
    const destLabel = normalized ? (getFolderNameById(normalized) || '폴더') : '미분류';
    showToast("'" + bm.name + "' 구성을 '" + destLabel + "'(으)로 이동했습니다.", 2400);
  }

  function buildDrawerBookmarkItemEl(bm){
    const item = document.createElement('div');
    item.className = 'bookmark-pill-item-col';
    const count = (bm.config && Array.isArray(bm.config.selectedNodeIds)) ? bm.config.selectedNodeIds.length : 0;
    const safeName = escapeHtml(bm.name);
    const safeId = escapeHtml(bm.id);
    if(renamingBookmarkId === bm.id){
      item.innerHTML = \`
        <div class="bookmark-save-row open">
          <input type="text" class="bookmark-name-input" data-bm-rename-input="\${safeId}" maxlength="28" value="\${escapeHtml(renameBookmarkDraft)}">
          <button type="button" class="bm-act-btn primary" data-bm-rename-ok="\${safeId}">확인</button>
          <button type="button" class="bm-act-btn" data-bm-rename-cancel="1">취소</button>
        </div>
      \`;
      return item;
    }
    let moveHtml = '';
    if(movingBookmarkId === bm.id && bookmarkFolders.length > 0){
      const folderPills = bookmarkFolders.map(f=>{
        const act = bm.folderId === f.id ? ' is-active' : '';
        return \`<button type="button" class="bm-folder-pill\${act}" data-bm-move-target="\${safeId}" data-bm-move-folder="\${escapeHtml(f.id)}">\${escapeHtml(f.name)}</button>\`;
      }).join('');
      const uncatAct = !bm.folderId ? ' is-active' : '';
      moveHtml = \`
        <div class="bookmark-move-row">
          <span class="bookmark-move-label">이동:</span>
          <button type="button" class="bm-folder-pill\${uncatAct}" data-bm-move-target="\${safeId}" data-bm-move-folder="">미분류</button>
          \${folderPills}
        </div>
      \`;
    }
    const moveBtnHtml = bookmarkFolders.length > 0
      ? \`<button type="button" class="bm-act-btn\${movingBookmarkId===bm.id ? ' is-active' : ''}" data-bm-move-toggle="\${safeId}">폴더 이동</button>\`
      : '';
    item.innerHTML = \`
      <div class="bookmark-pill-top">
        <span class="bookmark-pill-name-text" title="\${safeName}">\${safeName}</span>
        <span class="bookmark-pill-count">\${count}개</span>
      </div>
      <div class="bookmark-pill-actions">
        <button type="button" class="bm-act-btn primary" data-bm-apply="\${safeId}">적용</button>
        <button type="button" class="bm-act-btn" data-bm-edit="\${safeId}">편집기</button>
        <button type="button" class="bm-act-btn" data-bm-rename="\${safeId}">이름변경</button>
        <button type="button" class="bm-act-btn" data-bm-overwrite="\${safeId}">덮어쓰기</button>
        <button type="button" class="bm-act-btn" data-bm-dup="\${safeId}">복제</button>
        \${moveBtnHtml}
        <button type="button" class="bm-act-btn danger" data-bm-del="\${safeId}" aria-label="저장 구성 삭제">삭제</button>
      </div>
      \${moveHtml}
    \`;
    return item;
  }

  function renderBookmarks(){
    const validFolderSet = new Set(bookmarkFolders.map(f=>f.id));
    if(activeBookmarkFolderFilter!=='all' && activeBookmarkFolderFilter!=='uncategorized' && !validFolderSet.has(activeBookmarkFolderFilter)){
      activeBookmarkFolderFilter = 'all';
    }
    if(saveTargetFolderId && !validFolderSet.has(saveTargetFolderId)){
      saveTargetFolderId = '';
    }
    const folderCounts = new Map();
    let uncategorizedCount = 0;
    bookmarks.forEach(b=>{
      if(b.folderId && validFolderSet.has(b.folderId)){
        folderCounts.set(b.folderId, (folderCounts.get(b.folderId) || 0) + 1);
      }else{
        uncategorizedCount++;
      }
    });
    const filteredBookmarks = activeBookmarkFolderFilter==='all'
      ? bookmarks
      : activeBookmarkFolderFilter==='uncategorized'
        ? bookmarks.filter(b=>!b.folderId || !validFolderSet.has(b.folderId))
        : bookmarks.filter(b=>b.folderId===activeBookmarkFolderFilter);
    const activeFolderObj = bookmarkFolders.find(f=>f.id===activeBookmarkFolderFilter) || null;

    if(drawerBookmarkOpenLabel){
      drawerBookmarkOpenLabel.textContent = bookmarks.length > 0 ? ('자주 쓰는 타종 구성 ('+bookmarks.length+')') : '자주 쓰는 타종 구성';
    }
    if(drawerSaveFolderRow){
      if(bookmarkFolders.length > 0){
        drawerSaveFolderRow.style.display = 'flex';
        drawerSaveFolderRow.innerHTML = '<span class="bookmark-move-label">저장 폴더:</span>' +
          \`<button type="button" class="bm-folder-pill\${saveTargetFolderId===''?' is-active':''}" data-save-folder="">미분류</button>\` +
          bookmarkFolders.map(f=>\`<button type="button" class="bm-folder-pill\${saveTargetFolderId===f.id?' is-active':''}" data-save-folder="\${escapeHtml(f.id)}">\${escapeHtml(f.name)}</button>\`).join('');
      }else{
        drawerSaveFolderRow.style.display = 'none';
        drawerSaveFolderRow.innerHTML = '';
      }
    }
    if(drawerFolderTabs){
      if(bookmarkFolders.length > 0){
        drawerFolderTabs.style.display = 'flex';
        drawerFolderTabs.innerHTML =
          \`<button type="button" class="bm-folder-pill\${activeBookmarkFolderFilter==='all'?' is-active':''}" data-folder-filter="all">전체 (\${bookmarks.length})</button>\` +
          \`<button type="button" class="bm-folder-pill\${activeBookmarkFolderFilter==='uncategorized'?' is-active':''}" data-folder-filter="uncategorized">미분류 (\${uncategorizedCount})</button>\` +
          bookmarkFolders.map(f=>\`<button type="button" class="bm-folder-pill\${activeBookmarkFolderFilter===f.id?' is-active':''}" data-folder-filter="\${escapeHtml(f.id)}"><span class="bm-folder-icon">📁</span><span>\${escapeHtml(f.name)}</span><span class="bm-folder-cnt">(\${folderCounts.get(f.id)||0})</span></button>\`).join('');
      }else{
        drawerFolderTabs.style.display = 'none';
        drawerFolderTabs.innerHTML = '';
      }
    }
    if(drawerFolderToolbar){
      if(activeFolderObj){
        drawerFolderToolbar.style.display = 'flex';
        const safeFid = escapeHtml(activeFolderObj.id);
        if(editingFolderId === activeFolderObj.id){
          drawerFolderToolbar.innerHTML = \`
            <div class="bookmark-save-row open" style="width:100%">
              <input type="text" class="bookmark-name-input" data-folder-rename-input="\${safeFid}" maxlength="30" value="\${escapeHtml(editingFolderDraft)}">
              <button type="button" class="bm-act-btn primary" data-folder-rename-ok="\${safeFid}">확인</button>
              <button type="button" class="bm-act-btn" data-folder-rename-cancel="1">취소</button>
            </div>
          \`;
        }else{
          drawerFolderToolbar.innerHTML = \`
            <span class="bookmark-folder-toolbar-name">📁 \${escapeHtml(activeFolderObj.name)}</span>
            <div class="bookmark-folder-toolbar-actions">
              <button type="button" class="bm-act-btn" data-folder-rename="\${safeFid}">이름 변경</button>
              <button type="button" class="bm-act-btn danger" data-folder-del="\${safeFid}">폴더 삭제</button>
            </div>
          \`;
        }
      }else{
        drawerFolderToolbar.style.display = 'none';
        drawerFolderToolbar.innerHTML = '';
      }
    }
    if(drawerBookmarkUndoBar){
      drawerBookmarkUndoBar.style.display = deletedBookmarkUndo ? 'flex' : 'none';
      if(deletedBookmarkUndo && drawerBookmarkUndoText){
        drawerBookmarkUndoText.textContent = "'" + deletedBookmarkUndo.name + "' 삭제됨";
      }
    }
    if(drawerBookmarkList){
      drawerBookmarkList.innerHTML = '';
      if(!bookmarks.length && !bookmarkFolders.length){
        const empty = document.createElement('div');
        empty.className = 'bookmark-empty-hint';
        empty.textContent = '저장된 구성이 없습니다.';
        drawerBookmarkList.appendChild(empty);
      }else if(activeBookmarkFolderFilter==='all' && bookmarkFolders.length > 0){
        bookmarkFolders.forEach(folder=>{
          const folderBms = bookmarks.filter(b=>b.folderId===folder.id);
          const isCol = !!collapsedBookmarkFolders[folder.id];
          const grp = document.createElement('div');
          grp.className = 'bookmark-folder-group';
          const safeFid = escapeHtml(folder.id);
          const head = document.createElement('div');
          head.className = 'bookmark-folder-group-head';
          head.innerHTML = \`
            <button type="button" class="bookmark-folder-group-toggle" data-folder-collapse="\${safeFid}">
              <span>\${isCol ? '▸' : '▾'}</span>
              <span>📁 \${escapeHtml(folder.name)}</span>
              <span class="bookmark-pill-count">\${folderBms.length}개</span>
            </button>
            <div class="bookmark-folder-group-acts">
              <button type="button" class="bm-act-btn" data-folder-quick-save="\${safeFid}" title="이 폴더에 저장">+ 저장</button>
              <button type="button" class="bm-act-btn" data-folder-filter="\${safeFid}">관리</button>
            </div>
          \`;
          grp.appendChild(head);
          if(!isCol){
            const body = document.createElement('div');
            body.className = 'bookmark-folder-group-body';
            if(!folderBms.length){
              const empty = document.createElement('div');
              empty.className = 'bookmark-empty-hint';
              empty.textContent = '이 폴더가 비어 있습니다.';
              body.appendChild(empty);
            }else{
              folderBms.forEach(bm=>body.appendChild(buildDrawerBookmarkItemEl(bm)));
            }
            grp.appendChild(body);
          }
          drawerBookmarkList.appendChild(grp);
        });
        if(uncategorizedCount > 0){
          const uncatBms = bookmarks.filter(b=>!b.folderId || !validFolderSet.has(b.folderId));
          const isCol = !!collapsedBookmarkFolders['uncategorized'];
          const grp = document.createElement('div');
          grp.className = 'bookmark-folder-group';
          const head = document.createElement('div');
          head.className = 'bookmark-folder-group-head';
          head.innerHTML = \`
            <button type="button" class="bookmark-folder-group-toggle" data-folder-collapse="uncategorized">
              <span>\${isCol ? '▸' : '▾'}</span>
              <span>미분류</span>
              <span class="bookmark-pill-count">\${uncategorizedCount}개</span>
            </button>
          \`;
          grp.appendChild(head);
          if(!isCol){
            const body = document.createElement('div');
            body.className = 'bookmark-folder-group-body';
            uncatBms.forEach(bm=>body.appendChild(buildDrawerBookmarkItemEl(bm)));
            grp.appendChild(body);
          }
          drawerBookmarkList.appendChild(grp);
        }
      }else if(!filteredBookmarks.length){
        const empty = document.createElement('div');
        empty.className = 'bookmark-empty-hint';
        empty.textContent = '이 폴더에 저장된 구성이 없습니다.';
        drawerBookmarkList.appendChild(empty);
      }else{
        filteredBookmarks.forEach(bm=>drawerBookmarkList.appendChild(buildDrawerBookmarkItemEl(bm)));
      }
    }

    if(modalBookmarkFolderTabs){
      modalBookmarkFolderTabs.innerHTML =
        \`<button type="button" class="chip bookmark-folder-chip\${activeBookmarkFolderFilter==='all'?' active':''}" data-folder-filter="all">전체 (\${bookmarks.length})</button>\` +
        (bookmarkFolders.length > 0 ? \`<button type="button" class="chip bookmark-folder-chip\${activeBookmarkFolderFilter==='uncategorized'?' active':''}" data-folder-filter="uncategorized">미분류 (\${uncategorizedCount})</button>\` : '') +
        bookmarkFolders.map(f=>\`<button type="button" class="chip bookmark-folder-chip\${activeBookmarkFolderFilter===f.id?' active':''}" data-folder-filter="\${escapeHtml(f.id)}">📁 \${escapeHtml(f.name)} (\${folderCounts.get(f.id)||0})</button>\`).join('') +
        \`<button type="button" class="chip bookmark-folder-chip\${isModalFolderInputOpen?' active':''}" data-modal-folder-toggle="1">\${isModalFolderInputOpen ? '닫기' : '+ 새 폴더'}</button>\`;
    }
    if(modalBookmarkFolderActions){
      if(activeFolderObj){
        modalBookmarkFolderActions.style.display = 'inline-flex';
        const safeFid = escapeHtml(activeFolderObj.id);
        if(editingFolderId === activeFolderObj.id){
          modalBookmarkFolderActions.innerHTML = \`
            <input type="text" class="bookmark-modal-input" data-folder-rename-input="\${safeFid}" maxlength="30" value="\${escapeHtml(editingFolderDraft)}">
            <button type="button" class="chip" data-folder-rename-ok="\${safeFid}">확인</button>
            <button type="button" class="chip" data-folder-rename-cancel="1">취소</button>
          \`;
        }else{
          modalBookmarkFolderActions.innerHTML = \`
            <button type="button" class="chip" data-folder-rename="\${safeFid}">폴더 이름 변경</button>
            <button type="button" class="chip" data-folder-del="\${safeFid}">폴더 삭제</button>
          \`;
        }
      }else{
        modalBookmarkFolderActions.style.display = 'none';
        modalBookmarkFolderActions.innerHTML = '';
      }
    }
    if(modalFolderCreateRow){
      modalFolderCreateRow.style.display = isModalFolderInputOpen ? 'flex' : 'none';
    }
    if(modalBookmarkFolderSelect){
      if(bookmarkFolders.length > 0){
        modalBookmarkFolderSelect.style.display = 'inline-block';
        modalBookmarkFolderSelect.innerHTML = '<option value="">미분류</option>' +
          bookmarkFolders.map(f=>\`<option value="\${escapeHtml(f.id)}">📁 \${escapeHtml(f.name)}</option>\`).join('');
        modalBookmarkFolderSelect.value = saveTargetFolderId;
      }else{
        modalBookmarkFolderSelect.style.display = 'none';
      }
    }
    if(modalBookmarkList){
      modalBookmarkList.innerHTML = '';
      if(!filteredBookmarks.length){
        const empty = document.createElement('span');
        empty.className = 'pane-note';
        empty.textContent = bookmarks.length === 0 ? '저장된 구성이 없습니다.' : '이 폴더에 저장된 구성이 없습니다.';
        modalBookmarkList.appendChild(empty);
      }else{
        filteredBookmarks.forEach(bm=>{
          const chip = document.createElement('div');
          chip.className = 'bookmark-modal-chip';
          const count = (bm.config && Array.isArray(bm.config.selectedNodeIds)) ? bm.config.selectedNodeIds.length : 0;
          const safeName = escapeHtml(bm.name);
          const safeId = escapeHtml(bm.id);
          const fName = bm.folderId ? getFolderNameById(bm.folderId) : null;
          const folderBadge = (activeBookmarkFolderFilter==='all' && fName)
            ? \`<span class="bookmark-modal-folder-tag">📁 \${escapeHtml(fName)}</span>\`
            : '';
          const moveBtn = bookmarkFolders.length > 0
            ? \`<button type="button" class="bookmark-modal-move\${movingBookmarkId===bm.id?' is-open':''}" data-bm-move-toggle="\${safeId}" aria-label="폴더 이동" title="폴더 이동">📁</button>\`
            : '';
          chip.innerHTML = \`
            <button type="button" class="bookmark-modal-apply" data-bm-load-draft="\${safeId}" title="편집기에 불러오기">\${safeName} (\${count}개)\${folderBadge}</button>
            \${moveBtn}
            <button type="button" class="bookmark-modal-del" data-bm-del="\${safeId}" aria-label="저장 구성 삭제">×</button>
          \`;
          modalBookmarkList.appendChild(chip);
        });
      }
    }
    if(modalBookmarkMoveBar){
      const movingBm = movingBookmarkId ? bookmarks.find(b=>b.id===movingBookmarkId) : null;
      if(movingBm && bookmarkFolders.length > 0){
        modalBookmarkMoveBar.style.display = 'flex';
        const safeBid = escapeHtml(movingBm.id);
        modalBookmarkMoveBar.innerHTML =
          \`<span class="pane-note">'\${escapeHtml(movingBm.name)}' 이동할 폴더:</span>\` +
          \`<button type="button" class="chip bookmark-folder-chip\${!movingBm.folderId?' active':''}" data-bm-move-target="\${safeBid}" data-bm-move-folder="">미분류</button>\` +
          bookmarkFolders.map(f=>\`<button type="button" class="chip bookmark-folder-chip\${movingBm.folderId===f.id?' active':''}" data-bm-move-target="\${safeBid}" data-bm-move-folder="\${escapeHtml(f.id)}">📁 \${escapeHtml(f.name)}</button>\`).join('') +
          \`<button type="button" class="chip bookmark-folder-chip" data-bm-move-close="1">닫기</button>\`;
      }else{
        modalBookmarkMoveBar.style.display = 'none';
        modalBookmarkMoveBar.innerHTML = '';
      }
    }
  }

  function saveCurrentAsBookmark(rawName, fromModalDraft){
    const targetCfg = fromModalDraft ? draftSequenceConfig : customSequenceConfig;
    const rows = computeSequenceNodeRows(targetCfg);
    if(!rows.length){
      showToast('최소 1개 이상의 타종 항목을 먼저 선택해 주세요.', 2800);
      return;
    }
    const trimmed = String(rawName || '').trim();
    const defaultLabel = rows.length===1
      ? (rows[0].node.subjectTitle + ' ' + rows[0].node.stageShortLabel)
      : (rows[0].node.subjectTitle + ' ' + rows[0].node.stageShortLabel + ' 외 ' + (rows.length - 1) + '개');
    const finalName = trimmed || defaultLabel;
    const resolvedFolderId = (saveTargetFolderId && bookmarkFolders.some(f=>f.id===saveTargetFolderId)) ? saveTargetFolderId : null;
    const newBm = {
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      name: finalName,
      folderId: resolvedFolderId,
      config: cloneCfg(targetCfg),
      clockSyncMode,
      createdAt: new Date().toISOString()
    };
    bookmarks.unshift(newBm);
    if(drawerBookmarkInput) drawerBookmarkInput.value = '';
    if(modalBookmarkInput) modalBookmarkInput.value = '';
    if(drawerBookmarkSaveBlock) drawerBookmarkSaveBlock.classList.remove('open');
    if(drawerBookmarkToggleBtn) drawerBookmarkToggleBtn.textContent = '+ 구성 저장';
    renderBookmarks();
    saveCustomSettings();
    const fLabel = resolvedFolderId ? getFolderNameById(resolvedFolderId) : null;
    showToast(fLabel ? ("'" + finalName + "' 구성이 '" + fLabel + "' 폴더에 저장되었습니다.") : ("'" + finalName + "' 구성이 자주 쓰는 타종 구성에 저장되었습니다."));
  }

  function applyBookmarkById(id, applyTimer){
    const bm = bookmarks.find(b=>b.id===id);
    if(!bm)return;
    if(applyTimer && phase!=='idle'){
      showToast('타이머 실행 중에는 구성을 변경할 수 없습니다. CANCEL 후 선택해 주세요.', 3200);
      return;
    }
    if(applyTimer){
      customSequenceConfig = cloneCfg(bm.config);
      draftSequenceConfig = cloneCfg(bm.config);
      if(bm.clockSyncMode) applyClockSyncMode(bm.clockSyncMode, true);
      const built = buildCustomSequencePreset(customSequenceConfig);
      if(built){
        customBuiltPreset = built;
        currentPreset = built;
        isTemporaryStartPoint = false;
        syncUiToPresetIdle();
        saveCustomSettings();
        showToast("'" + bm.name + "' 구성이 타이머에 즉시 적용되었습니다.");
      }
    }else{
      const cloned = cloneCfg(bm.config);
      syncStep1SubjectsFromNodeIds(cloned.selectedNodeIds);
      mutateDraftConfig(cfg=>{
        cfg.selectedNodeIds = cloned.selectedNodeIds;
        cfg.intervalMap = cloned.intervalMap;
        cfg.intervalSecondsMap = cloned.intervalSecondsMap;
        cfg.firstNodeCustomMinutes = cloned.firstNodeCustomMinutes;
        cfg.mutedNodeIds = cloned.mutedNodeIds;
      });
      if(bm.clockSyncMode) applyClockSyncMode(bm.clockSyncMode, true);
      showToast("'" + bm.name + "' 구성을 편집기에 불러왔습니다. [선택 구성 저장]을 누르면 반영됩니다.");
    }
  }

  function deleteBookmarkById(id){
    const bm = bookmarks.find(b=>b.id===id);
    if(!bm)return;
    deletedBookmarkUndo = bm;
    if(deletedBookmarkTimer) clearTimeout(deletedBookmarkTimer);
    deletedBookmarkTimer = setTimeout(()=>{
      deletedBookmarkUndo = null;
      renderBookmarks();
    }, 5000);
    bookmarks = bookmarks.filter(b=>b.id!==id);
    renderBookmarks();
    saveCustomSettings();
  }

  if(drawerBookmarkUndoBtn){
    drawerBookmarkUndoBtn.addEventListener('click', ()=>{
      if(!deletedBookmarkUndo)return;
      bookmarks.unshift(deletedBookmarkUndo);
      deletedBookmarkUndo = null;
      if(deletedBookmarkTimer) clearTimeout(deletedBookmarkTimer);
      renderBookmarks();
      saveCustomSettings();
      showToast('삭제한 구성을 복원했습니다.', 2200);
    });
  }

  if(drawerBookmarkOpenBtn && drawerBookmarkCard){
    drawerBookmarkOpenBtn.addEventListener('click', ()=>{
      const isOpen = drawerBookmarkCard.classList.toggle('open');
      drawerBookmarkOpenBtn.classList.toggle('is-selected', isOpen);
    });
  }
  if(drawerFolderToggleBtn && drawerFolderCreateRow){
    drawerFolderToggleBtn.addEventListener('click', ()=>{
      const isOpen = drawerFolderCreateRow.classList.toggle('open');
      drawerFolderToggleBtn.textContent = isOpen ? '닫기' : '+ 새 폴더';
      if(isOpen && drawerBookmarkSaveBlock){
        drawerBookmarkSaveBlock.classList.remove('open');
        if(drawerBookmarkToggleBtn) drawerBookmarkToggleBtn.textContent = '+ 구성 저장';
      }
    });
  }
  if(drawerFolderConfirmBtn){
    drawerFolderConfirmBtn.addEventListener('click', ()=>{
      createBookmarkFolder(drawerFolderInput ? drawerFolderInput.value : '', true);
    });
  }
  if(drawerFolderInput){
    drawerFolderInput.addEventListener('keydown', e=>{
      if(e.key==='Enter') createBookmarkFolder(drawerFolderInput.value, true);
    });
  }
  if(drawerBookmarkToggleBtn && drawerBookmarkSaveBlock){
    drawerBookmarkToggleBtn.addEventListener('click', ()=>{
      const isOpen = drawerBookmarkSaveBlock.classList.toggle('open');
      drawerBookmarkToggleBtn.textContent = isOpen ? '닫기' : '+ 구성 저장';
      if(isOpen && drawerFolderCreateRow){
        drawerFolderCreateRow.classList.remove('open');
        if(drawerFolderToggleBtn) drawerFolderToggleBtn.textContent = '+ 새 폴더';
      }
    });
  }
  if(drawerSaveFolderRow){
    drawerSaveFolderRow.addEventListener('click', e=>{
      const btn = e.target.closest('button[data-save-folder]');
      if(btn){
        saveTargetFolderId = btn.getAttribute('data-save-folder') || '';
        renderBookmarks();
      }
    });
  }
  if(drawerFolderTabs){
    drawerFolderTabs.addEventListener('click', e=>{
      const btn = e.target.closest('button[data-folder-filter]');
      if(btn){ selectFolderFilter(btn.getAttribute('data-folder-filter') || 'all'); }
    });
  }
  if(drawerFolderToolbar){
    drawerFolderToolbar.addEventListener('click', e=>{
      const renBtn = e.target.closest('button[data-folder-rename]');
      if(renBtn){
        const fid = renBtn.getAttribute('data-folder-rename');
        const folder = bookmarkFolders.find(f=>f.id===fid);
        if(folder){ editingFolderId = folder.id; editingFolderDraft = folder.name; renderBookmarks(); }
        return;
      }
      const renOkBtn = e.target.closest('button[data-folder-rename-ok]');
      if(renOkBtn){
        const fid = renOkBtn.getAttribute('data-folder-rename-ok');
        const inp = drawerFolderToolbar.querySelector('input[data-folder-rename-input="'+fid+'"]');
        renameBookmarkFolder(fid, inp ? inp.value : '');
        return;
      }
      const renCancelBtn = e.target.closest('button[data-folder-rename-cancel]');
      if(renCancelBtn){ editingFolderId = null; renderBookmarks(); return; }
      const delBtn = e.target.closest('button[data-folder-del]');
      if(delBtn){ deleteBookmarkFolder(delBtn.getAttribute('data-folder-del')); }
    });
  }
  if(drawerBookmarkConfirmBtn){
    drawerBookmarkConfirmBtn.addEventListener('click', ()=>{
      saveCurrentAsBookmark(drawerBookmarkInput ? drawerBookmarkInput.value : '', false);
    });
  }
  if(drawerBookmarkInput){
    drawerBookmarkInput.addEventListener('keydown', e=>{
      if(e.key==='Enter') saveCurrentAsBookmark(drawerBookmarkInput.value, false);
    });
  }
  if(modalBookmarkFolderTabs){
    modalBookmarkFolderTabs.addEventListener('click', e=>{
      const toggleBtn = e.target.closest('button[data-modal-folder-toggle]');
      if(toggleBtn){ isModalFolderInputOpen = !isModalFolderInputOpen; renderBookmarks(); return; }
      const filterBtn = e.target.closest('button[data-folder-filter]');
      if(filterBtn){ selectFolderFilter(filterBtn.getAttribute('data-folder-filter') || 'all'); }
    });
  }
  if(modalBookmarkFolderActions){
    modalBookmarkFolderActions.addEventListener('click', e=>{
      const renBtn = e.target.closest('button[data-folder-rename]');
      if(renBtn){
        const fid = renBtn.getAttribute('data-folder-rename');
        const folder = bookmarkFolders.find(f=>f.id===fid);
        if(folder){ editingFolderId = folder.id; editingFolderDraft = folder.name; renderBookmarks(); }
        return;
      }
      const renOkBtn = e.target.closest('button[data-folder-rename-ok]');
      if(renOkBtn){
        const fid = renOkBtn.getAttribute('data-folder-rename-ok');
        const inp = modalBookmarkFolderActions.querySelector('input[data-folder-rename-input="'+fid+'"]');
        renameBookmarkFolder(fid, inp ? inp.value : '');
        return;
      }
      const renCancelBtn = e.target.closest('button[data-folder-rename-cancel]');
      if(renCancelBtn){ editingFolderId = null; renderBookmarks(); return; }
      const delBtn = e.target.closest('button[data-folder-del]');
      if(delBtn){ deleteBookmarkFolder(delBtn.getAttribute('data-folder-del')); }
    });
  }
  if(modalFolderConfirmBtn){
    modalFolderConfirmBtn.addEventListener('click', ()=>{
      createBookmarkFolder(modalFolderInput ? modalFolderInput.value : '', false);
    });
  }
  if(modalFolderInput){
    modalFolderInput.addEventListener('keydown', e=>{
      if(e.key==='Enter') createBookmarkFolder(modalFolderInput.value, false);
    });
  }
  if(modalBookmarkFolderSelect){
    modalBookmarkFolderSelect.addEventListener('change', ()=>{
      saveTargetFolderId = modalBookmarkFolderSelect.value || '';
    });
  }
  if(modalBookmarkSaveBtn){
    modalBookmarkSaveBtn.addEventListener('click', ()=>{
      saveCurrentAsBookmark(modalBookmarkInput ? modalBookmarkInput.value : '', true);
    });
  }
  if(modalBookmarkInput){
    modalBookmarkInput.addEventListener('keydown', e=>{
      if(e.key==='Enter') saveCurrentAsBookmark(modalBookmarkInput.value, true);
    });
  }
  if(drawerBookmarkList){
    drawerBookmarkList.addEventListener('click', e=>{
      const colBtn = e.target.closest('button[data-folder-collapse]');
      if(colBtn){
        const k = colBtn.getAttribute('data-folder-collapse');
        collapsedBookmarkFolders[k] = !collapsedBookmarkFolders[k];
        renderBookmarks();
        return;
      }
      const quickSaveBtn = e.target.closest('button[data-folder-quick-save]');
      if(quickSaveBtn){
        saveTargetFolderId = quickSaveBtn.getAttribute('data-folder-quick-save') || '';
        if(drawerBookmarkSaveBlock) drawerBookmarkSaveBlock.classList.add('open');
        if(drawerBookmarkToggleBtn) drawerBookmarkToggleBtn.textContent = '닫기';
        if(drawerFolderCreateRow) drawerFolderCreateRow.classList.remove('open');
        if(drawerFolderToggleBtn) drawerFolderToggleBtn.textContent = '+ 새 폴더';
        renderBookmarks();
        return;
      }
      const filterBtn = e.target.closest('button[data-folder-filter]');
      if(filterBtn){ selectFolderFilter(filterBtn.getAttribute('data-folder-filter') || 'all'); return; }
      const moveToggleBtn = e.target.closest('button[data-bm-move-toggle]');
      if(moveToggleBtn){
        const bid = moveToggleBtn.getAttribute('data-bm-move-toggle');
        movingBookmarkId = (movingBookmarkId === bid) ? null : bid;
        renderBookmarks();
        return;
      }
      const moveTargetBtn = e.target.closest('button[data-bm-move-target]');
      if(moveTargetBtn){
        moveBookmarkToFolder(
          moveTargetBtn.getAttribute('data-bm-move-target'),
          moveTargetBtn.getAttribute('data-bm-move-folder') || null
        );
        return;
      }
      const applyBtn = e.target.closest('button[data-bm-apply]');
      if(applyBtn){ applyBookmarkById(applyBtn.getAttribute('data-bm-apply'), true); return; }
      const editBtn = e.target.closest('button[data-bm-edit]');
      if(editBtn){
        const bm = bookmarks.find(b=>b.id===editBtn.getAttribute('data-bm-edit'));
        if(bm){
          openBuilderModalWithDraft();
          applyBookmarkById(bm.id, false);
        }
        return;
      }
      const renBtn = e.target.closest('button[data-bm-rename]');
      if(renBtn){
        const bm = bookmarks.find(b=>b.id===renBtn.getAttribute('data-bm-rename'));
        if(bm){
          renamingBookmarkId = bm.id;
          renameBookmarkDraft = bm.name;
          renderBookmarks();
        }
        return;
      }
      const renOkBtn = e.target.closest('button[data-bm-rename-ok]');
      if(renOkBtn){
        const id = renOkBtn.getAttribute('data-bm-rename-ok');
        const inp = drawerBookmarkList.querySelector('input[data-bm-rename-input="'+id+'"]');
        const nextName = inp && inp.value.trim() ? inp.value.trim().slice(0,28) : '';
        if(nextName){
          bookmarks = bookmarks.map(b=>b.id===id ? Object.assign({}, b, {name: nextName}) : b);
          saveCustomSettings();
          showToast('북마크 이름이 변경되었습니다.');
        }
        renamingBookmarkId = null;
        renderBookmarks();
        return;
      }
      const renCancelBtn = e.target.closest('button[data-bm-rename-cancel]');
      if(renCancelBtn){
        renamingBookmarkId = null;
        renderBookmarks();
        return;
      }
      const ovwBtn = e.target.closest('button[data-bm-overwrite]');
      if(ovwBtn){
        const id = ovwBtn.getAttribute('data-bm-overwrite');
        const bm = bookmarks.find(b=>b.id===id);
        if(bm){
          bm.config = cloneCfg(customSequenceConfig);
          bm.clockSyncMode = clockSyncMode;
          renderBookmarks();
          saveCustomSettings();
          showToast("'" + bm.name + "'에 현재 구성을 덮어썼습니다.");
        }
        return;
      }
      const dupBtn = e.target.closest('button[data-bm-dup]');
      if(dupBtn){
        const bm = bookmarks.find(b=>b.id===dupBtn.getAttribute('data-bm-dup'));
        if(bm){
          bookmarks.unshift({
            id: 'bm_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
            name: (bm.name + ' (복사본)').slice(0,28),
            folderId: bm.folderId || null,
            config: cloneCfg(bm.config),
            clockSyncMode: bm.clockSyncMode,
            createdAt: new Date().toISOString()
          });
          renderBookmarks();
          saveCustomSettings();
          showToast("'" + bm.name + "' 복제본이 생성되었습니다.");
        }
        return;
      }
      const delBtn = e.target.closest('button[data-bm-del]');
      if(delBtn){ deleteBookmarkById(delBtn.getAttribute('data-bm-del')); }
    });
  }
  if(modalBookmarkList){
    modalBookmarkList.addEventListener('click', e=>{
      const moveToggleBtn = e.target.closest('button[data-bm-move-toggle]');
      if(moveToggleBtn){
        const bid = moveToggleBtn.getAttribute('data-bm-move-toggle');
        movingBookmarkId = (movingBookmarkId === bid) ? null : bid;
        renderBookmarks();
        return;
      }
      const loadBtn = e.target.closest('button[data-bm-load-draft]');
      if(loadBtn){ applyBookmarkById(loadBtn.getAttribute('data-bm-load-draft'), false); return; }
      const delBtn = e.target.closest('button[data-bm-del]');
      if(delBtn){ deleteBookmarkById(delBtn.getAttribute('data-bm-del')); }
    });
  }
  if(modalBookmarkMoveBar){
    modalBookmarkMoveBar.addEventListener('click', e=>{
      const closeBtn = e.target.closest('button[data-bm-move-close]');
      if(closeBtn){ movingBookmarkId = null; renderBookmarks(); return; }
      const moveTargetBtn = e.target.closest('button[data-bm-move-target]');
      if(moveTargetBtn){
        moveBookmarkToFolder(
          moveTargetBtn.getAttribute('data-bm-move-target'),
          moveTargetBtn.getAttribute('data-bm-move-folder') || null
        );
      }
    });
  }

  const playbackSettingsBtn = document.getElementById('playbackSettingsBtn');
  const playbackSettingsPanel = document.getElementById('playbackSettingsPanel');
  const playbackSettingsCloseBtn = document.getElementById('playbackSettingsCloseBtn');
  function setPlaybackSettingsOpen(open){
    if(!playbackSettingsPanel || !playbackSettingsBtn) return;
    playbackSettingsPanel.classList.toggle('open', open);
    playbackSettingsPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
    playbackSettingsBtn.classList.toggle('is-selected', open);
    playbackSettingsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if(playbackSettingsBtn){
    playbackSettingsBtn.addEventListener('click', ()=>{
      setLeftMenuOpen(false);
      applyMenuCategoryState(null);
      const isOpen = playbackSettingsPanel && playbackSettingsPanel.classList.contains('open');
      setPlaybackSettingsOpen(!isOpen);
    });
  }
  if(playbackSettingsCloseBtn){
    playbackSettingsCloseBtn.addEventListener('click', ()=> setPlaybackSettingsOpen(false));
  }

  openBuilderBtn.addEventListener('click', openBuilderModalWithDraft);
  builderCloseBtn.addEventListener('click', closeBuilderModalDiscardDraft);
  builderCancelBtn.addEventListener('click', closeBuilderModalDiscardDraft);
  builderModalBackdrop.addEventListener('click',e=>{
    if(e.target===builderModalBackdrop) closeBuilderModalDiscardDraft();
  });
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(playbackSettingsPanel && playbackSettingsPanel.classList.contains('open')){
        setPlaybackSettingsOpen(false);
        return;
      }
      if(runningSaveConfirmScrim && runningSaveConfirmScrim.style.display !== 'none'){
        closeRunningSaveConfirm();
        return;
      }
      closeBuilderModalDiscardDraft();
      stopPreviewBell();
      modalBackdrop.classList.remove('open');
    }
    if(builderModalBackdrop.classList.contains('open') && (e.ctrlKey || e.metaKey)){
      if(e.key.toLowerCase()==='z' && !e.shiftKey){
        e.preventDefault();
        if(builderUndoBtn && !builderUndoBtn.disabled) builderUndoBtn.click();
      }else if(e.key.toLowerCase()==='y' || (e.key.toLowerCase()==='z' && e.shiftKey)){
        e.preventDefault();
        if(builderRedoBtn && !builderRedoBtn.disabled) builderRedoBtn.click();
      }
    }
  });

  function commitDraftSequenceToTimer(){
    const built = buildCustomSequencePreset(draftSequenceConfig);
    if(!built){
      showToast('최소 1개 이상의 타종 항목을 체크박스로 선택해 주세요.', 3000);
      return;
    }
    if(phase==='rise'||phase==='hold'){
      cancel();
    }
    stopPreviewBell();
    customSequenceConfig = cloneCfg(draftSequenceConfig);
    customBuiltPreset = built;
    currentPreset = built;
    isTemporaryStartPoint = false;
    syncUiToPresetIdle();
    saveCustomSettings();
    closeRunningSaveConfirm();
    builderModalBackdrop.classList.remove('open');
  }

  builderApplyBtn.addEventListener('click',()=>{
    const built = buildCustomSequencePreset(draftSequenceConfig);
    if(!built){
      showToast('최소 1개 이상의 타종 항목을 체크박스로 선택해 주세요.', 3000);
      return;
    }
    if(phase!=='idle'){
      if(runningSaveConfirmScrim) runningSaveConfirmScrim.style.display = 'flex';
      return;
    }
    commitDraftSequenceToTimer();
  });

  if(runningSaveConfirmCancelBtn){
    runningSaveConfirmCancelBtn.addEventListener('click', closeRunningSaveConfirm);
  }
  if(runningSaveConfirmAcceptBtn){
    runningSaveConfirmAcceptBtn.addEventListener('click', commitDraftSequenceToTimer);
  }
  if(runningSaveConfirmScrim){
    runningSaveConfirmScrim.addEventListener('click', e=>{
      if(e.target === runningSaveConfirmScrim) closeRunningSaveConfirm();
    });
  }

  /* ---------- Custom Settings Persistence (JSON & LocalStorage) (A3 Validation) ---------- */
  function saveCustomSettings(){
    try{
      const payload = {
        themePref,
        presetId: isTemporaryStartPoint ? 'custom_checkbox_sequence' : currentPreset.id,
        devMode: devModeToggle.checked,
        clockSyncMode,
        bellVolume,
        englishVolume,
        keepScreenAwake,
        mainBellGlowAnim,
        prelimBellGlowAnim,
        customSequenceConfig,
        bookmarkFolders,
        bookmarks,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }catch(e){}
  }

  function loadCustomSettings(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw){
        applyTheme('auto', true);
        applyClockSyncMode('custom_cascaded_time', true);
        if(keepScreenAwake) requestWakeLock();
        renderBookmarks();
        return;
      }
      const parsed = JSON.parse(raw);
      if(parsed.themePref && ['auto','light','dark','sepia'].includes(parsed.themePref)){
        applyTheme(parsed.themePref, true);
      }else{
        applyTheme('auto', true);
      }
      applyClockSyncMode('custom_cascaded_time', true);
      if(typeof parsed.bellVolume==='number' && isFinite(parsed.bellVolume)){
        bellVolume = clamp(parsed.bellVolume,0,1);
        if(bellVolSlider){
          bellVolSlider.value = String(bellVolume);
          bellVolSlider.style.setProperty('--slider-pct', Math.round(bellVolume*100)+'%');
        }
        if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
        bellPlayer.volume = bellVolume;
        previewPlayer.volume = bellVolume;
      }
      if(typeof parsed.englishVolume==='number' && isFinite(parsed.englishVolume)){
        englishVolume = clamp(parsed.englishVolume,0,1);
        if(engVolSlider){
          engVolSlider.value = String(englishVolume);
          engVolSlider.style.setProperty('--slider-pct', Math.round(englishVolume*100)+'%');
        }
        if(engVolPct) engVolPct.textContent = Math.round(englishVolume*100)+'%';
        englishAudio.volume = englishVolume;
      }
      if(typeof parsed.keepScreenAwake==='boolean'){
        keepScreenAwake = parsed.keepScreenAwake;
      }
      if(keepAwakeToggle) keepAwakeToggle.checked = keepScreenAwake;
      if(keepScreenAwake) requestWakeLock();
      else releaseWakeLock();

      if(typeof parsed.mainBellGlowAnim==='boolean'){
        mainBellGlowAnim = parsed.mainBellGlowAnim;
      }
      if(mainBellGlowToggle) mainBellGlowToggle.checked = mainBellGlowAnim;

      if(typeof parsed.prelimBellGlowAnim==='boolean'){
        prelimBellGlowAnim = parsed.prelimBellGlowAnim;
      }
      if(prelimBellGlowToggle) prelimBellGlowToggle.checked = prelimBellGlowAnim;
      if(parsed.customSequenceConfig){
        const v = validateConfig(parsed.customSequenceConfig);
        customSequenceConfig = v.config;
        draftSequenceConfig = cloneCfg(v.config);
      }
      if(Array.isArray(parsed.bookmarkFolders)){
        bookmarkFolders = validateBookmarkFolders(parsed.bookmarkFolders);
      }
      if(Array.isArray(parsed.bookmarks)){
        const legacySeedIds = new Set(['bm_kor_math_inq1','bm_eng_listening','bm_kor_single']);
        const filtered = parsed.bookmarks.filter(b=>b && !legacySeedIds.has(b.id));
        const validFolderSet = new Set(bookmarkFolders.map(f=>f.id));
        bookmarks = validateBookmarks(filtered, validFolderSet);
      }
      renderBookmarks();
      if(parsed.presetId){
        if(parsed.presetId==='custom_checkbox_sequence'){
          const built = buildCustomSequencePreset(customSequenceConfig);
          if(built){
            customBuiltPreset = built;
            currentPreset = built;
          }
        }else{
          const found = EMBEDDED.presets.find(p=>p.id===parsed.presetId);
          if(found){
            currentPreset = found;
          }
        }
      }
      if(typeof parsed.devMode==='boolean'){
        devModeToggle.checked = parsed.devMode;
      }
    }catch(e){
      applyTheme('auto', true);
      renderBookmarks();
    }
  }

  exportJsonBtn.addEventListener('click', ()=>{
    const payload = {
      app: '대학수학능력시험 안내방송',
      exportedAt: new Date().toISOString(),
      themePref,
      presetId: isTemporaryStartPoint ? 'custom_checkbox_sequence' : currentPreset.id,
      devMode: devModeToggle.checked,
      clockSyncMode,
      bellVolume,
      englishVolume,
      keepScreenAwake,
      mainBellGlowAnim,
      prelimBellGlowAnim,
      customSequenceConfig,
      bookmarkFolders,
      bookmarks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:'application/json;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csat-timer-custom-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('사용자 커스텀 설정 JSON 파일이 저장되었습니다.', 3000);
  });

  importJsonBtn.addEventListener('click', ()=>configJsonInput.click());
  configJsonInput.addEventListener('change', e=>{
    const file = e.target.files && e.target.files[0];
    if(!file)return;
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const data = JSON.parse(String(reader.result));
        if(!data || typeof data!=='object') throw new Error('invalid');
        const warnings = [];
        if(data.themePref && ['auto','light','dark','sepia'].includes(data.themePref)){
          applyTheme(data.themePref, true);
        }
        if(data.clockSyncMode){
          applyClockSyncMode('custom_cascaded_time', true);
        }
        if(typeof data.bellVolume==='number' && isFinite(data.bellVolume)){
          bellVolume = clamp(data.bellVolume,0,1);
          if(bellVolSlider){
            bellVolSlider.value = String(bellVolume);
            bellVolSlider.style.setProperty('--slider-pct', Math.round(bellVolume*100)+'%');
          }
          if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
          bellPlayer.volume = bellVolume;
          previewPlayer.volume = bellVolume;
        }
        if(typeof data.englishVolume==='number' && isFinite(data.englishVolume)){
          englishVolume = clamp(data.englishVolume,0,1);
          if(engVolSlider){
            engVolSlider.value = String(englishVolume);
            engVolSlider.style.setProperty('--slider-pct', Math.round(englishVolume*100)+'%');
          }
          if(engVolPct) engVolPct.textContent = Math.round(englishVolume*100)+'%';
          englishAudio.volume = englishVolume;
        }
        if(typeof data.keepScreenAwake==='boolean'){
          keepScreenAwake = data.keepScreenAwake;
          if(keepAwakeToggle) keepAwakeToggle.checked = keepScreenAwake;
          if(keepScreenAwake) requestWakeLock();
          else releaseWakeLock();
        }
        if(typeof data.mainBellGlowAnim==='boolean'){
          mainBellGlowAnim = data.mainBellGlowAnim;
          if(mainBellGlowToggle) mainBellGlowToggle.checked = mainBellGlowAnim;
        }
        if(typeof data.prelimBellGlowAnim==='boolean'){
          prelimBellGlowAnim = data.prelimBellGlowAnim;
          if(prelimBellGlowToggle) prelimBellGlowToggle.checked = prelimBellGlowAnim;
        }
        if(data.customSequenceConfig){
          const v = validateConfig(data.customSequenceConfig);
          customSequenceConfig = v.config;
          draftSequenceConfig = cloneCfg(v.config);
          if(v.warnings.length) warnings.push(...v.warnings);
          syncStep1SubjectsFromNodeIds(draftSequenceConfig.selectedNodeIds);
          renderBuilderModal();
        }
        if(Array.isArray(data.bookmarkFolders)){
          bookmarkFolders = validateBookmarkFolders(data.bookmarkFolders);
        }
        if(Array.isArray(data.bookmarks)){
          const validFolderSet = new Set(bookmarkFolders.map(f=>f.id));
          bookmarks = validateBookmarks(data.bookmarks, validFolderSet);
          renderBookmarks();
        }else if(Array.isArray(data.bookmarkFolders)){
          renderBookmarks();
        }
        if(data.presetId && phase==='idle'){
          if(data.presetId==='custom_checkbox_sequence'){
            const built = buildCustomSequencePreset(customSequenceConfig);
            if(built){
              customBuiltPreset = built;
              currentPreset = built;
              isTemporaryStartPoint = false;
              syncUiToPresetIdle();
            }
          }else{
            const found = EMBEDDED.presets.find(p=>p.id===data.presetId);
            if(found){
              currentPreset = found;
              isTemporaryStartPoint = false;
              syncUiToPresetIdle();
            }
          }
        }
        if(typeof data.devMode==='boolean'){
          devModeToggle.checked = data.devMode;
          updateVersionDisplay();
        }
        saveCustomSettings();
        showToast(warnings.length ? ('설정 JSON 적용 완료 ('+warnings[0]+')') : '사용자 커스텀 설정 JSON을 성공적으로 불러왔습니다.', 3200);
      }catch(err){
        showToast('올바른 설정 JSON 파일이 아닙니다.', 3000);
      }
      configJsonInput.value = '';
    };
    reader.readAsText(file);
  });

  exportCleanHtmlBtn.addEventListener('click', ()=>{
    const blob = new Blob([INITIAL_CLEAN_DOC], {type:'text/html;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '수능_타종_타이머_단일패키지.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('공유됨', 3200);
  });

  function handleEnglishFileSelect(file){
    if(!file)return;
    if(englishObjectUrl)URL.revokeObjectURL(englishObjectUrl);
    englishObjectUrl=URL.createObjectURL(file);
    englishFileName=file.name;
    englishAudio.src=englishObjectUrl;
    englishAudio.load();
    engFileLabel.textContent='듣기 음원: '+file.name;
    if(engFileClearBtn) engFileClearBtn.style.display = 'inline-flex';
    showToast('영어 듣기평가 음원 설정 완료: '+file.name,3000);
  }

  engFileBtn.addEventListener('click',()=>engFileInput.click());
  engFileInput.addEventListener('change',e=>{
    const file=e.target.files&&e.target.files[0];
    if(file)handleEnglishFileSelect(file);
  });
  if(engFileClearBtn){
    engFileClearBtn.addEventListener('click', ()=>{
      stopEnglishAudio();
      if(englishObjectUrl) URL.revokeObjectURL(englishObjectUrl);
      englishObjectUrl = null;
      englishFileName = '';
      englishAudio.removeAttribute('src');
      engFileInput.value = '';
      engFileLabel.textContent = '듣기 음원 선택 (13:07)';
      engFileClearBtn.style.display = 'none';
      showToast('선택된 영어 듣기 음원이 해제되었습니다.', 2400);
    });
  }

  function renderTimetableRows(activeStepId){
    timetableBody.innerHTML='';
    EMBEDDED.timetable.forEach(row=>{
      const tr=document.createElement('tr');
      if(row.id===activeStepId)tr.className='active-row';
      tr.innerHTML=\`
        <td>\${escapeHtml(row.periodLabel)}</td>
        <td class="mono-val">\${escapeHtml(row.timeRangeText)}</td>
        <td>\${escapeHtml(row.category)}</td>
        <td>\${escapeHtml(row.description)}</td>
        <td><button type="button" class="tt-jump-btn" data-row-id="\${escapeHtml(row.id)}">선택</button></td>
      \`;
      timetableBody.appendChild(tr);
    });
  }

  function renderBellListRows(){
    bellListBody.innerHTML='';
    let embeddedCount=0;
    EMBEDDED.bellFiles37.forEach(item=>{
      const hasMp3 = Boolean(EMBEDDED.customMp3DataUris && EMBEDDED.customMp3DataUris[item.code]);
      if(hasMp3) embeddedCount++;
      const durSec = (EMBEDDED.bellDurationSecMap && EMBEDDED.bellDurationSecMap[item.code]) || 10;
      const tr=document.createElement('tr');
      tr.innerHTML=\`
        <td class="mono-val">\${escapeHtml(item.code)}</td>
        <td class="mono-val">\${escapeHtml(item.timeText)}</td>
        <td>\${escapeHtml(item.fileName)} (\${durSec}초)</td>
        <td class="mono-val">\${hasMp3 ? 'MP3 내장됨' : '기본 차임'}</td>
        <td><button type="button" class="tt-jump-btn" data-preview-bell="\${escapeHtml(item.code)}">미리듣기 (\${durSec}초)</button></td>
      \`;
      bellListBody.appendChild(tr);
    });
    const secTitleEl = document.getElementById('bellListSecTitle');
    if(secTitleEl){
      secTitleEl.textContent = '수능타종 37개 기본 음원 내장 목록 (MP3 내장: '+embeddedCount+' / 37개)';
    }
    updatePreviewButtonsUI();
  }

  timetableBody.addEventListener('click',e=>{
    const btnEl=e.target.closest('.tt-jump-btn');
    if(!btnEl)return;
    const rowId=btnEl.getAttribute('data-row-id');
    const row=EMBEDDED.timetable.find(r=>r.id===rowId);
    if(!row)return;
    if(phase!=='idle'){
      showToast('타이머 실행 중에는 구간을 변경할 수 없습니다. CANCEL 후 선택해 주세요.',3200);
      return;
    }
    currentPreset={
      id:'custom_'+row.id,
      group:'single',
      label:row.periodLabel+' '+row.displayTitle+' ('+row.category+')',
      shortLabel:row.displayTitle,
      displayTitle:row.displayTitle,
      startMinutes:row.startMinutes,
      endMinutes:row.endMinutes,
      steps:[row]
    };
    isTemporaryStartPoint = false;
    syncUiToPresetIdle();
    modalBackdrop.classList.remove('open');
    showToast(row.displayTitle+' ('+row.category+') 구간으로 설정되었습니다.',2600);
  });

  bellListBody.addEventListener('click',e=>{
    const btnEl=e.target.closest('button[data-preview-bell]');
    if(!btnEl)return;
    togglePreviewBell(btnEl.getAttribute('data-preview-bell'));
  });

  function updateVersionDisplay(){
    const v=EMBEDDED.version;
    const shortVer=v.major+'.'+v.minor+'.'+v.patch;
    const fullVer=shortVer+'.'+v.timestampKst;
    const isDev=devModeToggle.checked;
    appInternalVersion.textContent=isDev?fullVer:shortVer;
    appSystemVersion.textContent=fullVer;
  }

  devModeToggle.addEventListener('change',()=>{
    updateVersionDisplay();
    saveCustomSettings();
  });
  infoBtn.addEventListener('click',()=>modalBackdrop.classList.add('open'));
  modalCloseBtn.addEventListener('click',()=>{
    stopPreviewBell();
    modalBackdrop.classList.remove('open');
  });
  modalBackdrop.addEventListener('click',e=>{
    if(e.target===modalBackdrop){
      stopPreviewBell();
      modalBackdrop.classList.remove('open');
    }
  });

  /* ---------- Top-Right Timetable Panel & C5 Inline Action Bar ---------- */
  function renderRightTimetableList(switchAnimDir){
    if(!rtScrollList)return;
    const seqRows = computeSequenceNodeRows(customSequenceConfig);
    if(rtCountMeta){
      rtCountMeta.textContent = timetableViewMode==='all'
        ? ('전체 ' + EMBEDDED.timetable.length + '구간')
        : ('선택 ' + seqRows.length + '단계');
      if(switchAnimDir){
        rtCountMeta.classList.remove('is-animating');
        void rtCountMeta.offsetWidth;
        rtCountMeta.classList.add('is-animating');
      }
    }
    rtScrollList.innerHTML='';
    const stageEl = document.createElement('div');
    stageEl.className = 'rt-list-stage' + (switchAnimDir ? (' anim-' + switchAnimDir) : '');
    rtScrollList.appendChild(stageEl);

    if(timetableViewMode==='all'){
      EMBEDDED.timetable.forEach((row, idx)=>{
        const isCurrent = row.id === activeRowId;
        const expKey = 'all_'+row.id;
        const isExpanded = expandedRtKey === expKey;
        const isInfoOpen = expandedRtInfoKey === expKey;
        const prefix = row.periodLabel !== '-' ? (row.periodLabel + ' · ') : '';
        const bellCode = row.startBellCode || row.endBellCode || '';
        const durSec = bellCode && EMBEDDED.bellDurationSecMap ? (EMBEDDED.bellDurationSecMap[bellCode] || 10) : 0;

        const wrap = document.createElement('div');
        wrap.className = 'rt-row-card';
        wrap.innerHTML = \`
          <button type="button" class="rt-item-btn \${isCurrent ? 'is-current' : ''}" data-rt-toggle-key="\${escapeHtml(expKey)}">
            <span class="rt-item-idx">\${idx+1}</span>
            <span class="rt-item-main">
              <span class="rt-item-title">\${escapeHtml(prefix + row.displayTitle + ' · ' + row.category)}</span>
              <span class="rt-item-sub">\${escapeHtml(row.description)}</span>
            </span>
            <span class="rt-item-time">\${escapeHtml(row.timeRangeText)}</span>
          </button>
          \${isExpanded ? \`
            <div class="rt-row-actions">
              <div class="rt-action-btn-row">
                <button type="button" class="rt-act-chip primary" data-rt-start-all="\${escapeHtml(row.id)}">이 단계부터 시작</button>
                <button type="button" class="rt-act-chip" data-rt-open-editor="1">선택 구성 편집</button>
                <button type="button" class="rt-act-chip \${isInfoOpen ? 'primary' : ''}" data-rt-info-key="\${escapeHtml(expKey)}">단계 정보 · 미리듣기</button>
              </div>
              \${isInfoOpen ? \`
                <div class="rt-step-info-box">
                  <div class="rt-info-row">
                    <span class="rt-info-label">교시 · 영역</span>
                    <span class="rt-info-val">\${escapeHtml(prefix + row.displayTitle)}</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">진행 시각</span>
                    <span class="rt-info-val">\${escapeHtml(row.timeRangeText)} (\${row.durationMinutes}분)</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">상세 설명</span>
                    <span class="rt-info-val">\${escapeHtml(row.description)}</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">타종 음원</span>
                    <span class="rt-info-val">
                      \${bellCode
                        ? \`[\${escapeHtml(bellCode)}] (\${durSec}초) <button type="button" class="rt-act-chip preview-btn-wrap" style="margin-left:4px" data-preview-bell="\${escapeHtml(bellCode)}">미리듣기 (\${durSec}초)</button>\`
                        : (row.triggersEnglishAudioAtStart ? '13:07 영어 듣기평가 음원 재생' : '타종 없음')}
                    </span>
                  </div>
                </div>
              \` : ''}
            </div>
          \` : ''}
        \`;
        stageEl.appendChild(wrap);
      });
    }else{
      if(!seqRows.length){
        const empty = document.createElement('div');
        empty.className = 'rt-empty-box';
        empty.innerHTML = \`
          <span>현재 체크박스로 선택된 영역 · 타종 단계가 없습니다.</span>
          <button type="button" class="rt-edit-seq-btn" id="rtEmptyOpenBuilderBtn">영역 · 타종 선택 구성 열기</button>
        \`;
        stageEl.appendChild(empty);
        const emptyBtn = document.getElementById('rtEmptyOpenBuilderBtn');
        if(emptyBtn){
          emptyBtn.addEventListener('click', openBuilderModalWithDraft);
        }
        return;
      }
      seqRows.forEach((row, idx)=>{
        const isCurrent = (activeCustomNodeId !== null && row.node.nodeId === activeCustomNodeId) || (activeCustomNodeId === null && idx === 0);
        const expKey = 'sel_'+row.node.nodeId+'_'+idx;
        const isExpanded = expandedRtKey === expKey;
        const isInfoOpen = expandedRtInfoKey === expKey;
        const dispTime = format24hTime(row.customTimeMinutes) + (row.dayOffset > 0 ? (' (+'+row.dayOffset+'일)') : '');
        const waitUnit = row.intervalAfterSeconds % 60 !== 0
          ? (row.intervalAfterSeconds + '초')
          : (row.intervalAfterMinutes + '분');
        const subDetail = row.nextNode
          ? ('다음까지 ' + waitUnit + ' 대기')
          : ('마지막 단계 (' + waitUnit + ')');
        const bellCode = row.node.bellCode || '';
        const durSec = bellCode && EMBEDDED.bellDurationSecMap ? (EMBEDDED.bellDurationSecMap[bellCode] || 10) : 0;

        const wrap = document.createElement('div');
        wrap.className = 'rt-row-card';
        wrap.innerHTML = \`
          <button type="button" class="rt-item-btn \${isCurrent ? 'is-current' : ''}" data-rt-toggle-key="\${escapeHtml(expKey)}">
            <span class="rt-item-idx">\${idx+1}</span>
            <span class="rt-item-main">
              <span class="rt-item-title">\${escapeHtml(row.node.periodLabel + ' · ' + row.node.subjectTitle + ' · ' + row.node.stageShortLabel)}</span>
              <span class="rt-item-sub">\${escapeHtml(subDetail)}</span>
            </span>
            <span class="rt-item-time">\${escapeHtml(dispTime)}</span>
          </button>
          \${isExpanded ? \`
            <div class="rt-row-actions">
              <div class="rt-action-btn-row">
                <button type="button" class="rt-act-chip primary" data-rt-start-seq="\${idx}">이 단계부터 시작</button>
                <button type="button" class="rt-act-chip" data-rt-open-editor="1">선택 구성 편집</button>
                <button type="button" class="rt-act-chip \${isInfoOpen ? 'primary' : ''}" data-rt-info-key="\${escapeHtml(expKey)}">단계 정보 · 미리듣기</button>
              </div>
              \${isInfoOpen ? \`
                <div class="rt-step-info-box">
                  <div class="rt-info-row">
                    <span class="rt-info-label">단계 명칭</span>
                    <span class="rt-info-val">\${escapeHtml(row.node.fullTitle)}</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">시각 비교</span>
                    <span class="rt-info-val">원래 \${escapeHtml(row.node.originalTimeText)} / 구성 \${format24hTime(row.customTimeMinutes)}\${row.dayOffset > 0 ? (' (+'+row.dayOffset+'일)') : ''}</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">대기 시간</span>
                    <span class="rt-info-val">\${row.nextNode ? ('다음 단계까지 ' + waitUnit) : ('단독/마지막 진행 ' + waitUnit)}</span>
                  </div>
                  <div class="rt-info-row">
                    <span class="rt-info-label">타종 음원</span>
                    <span class="rt-info-val">
                      \${bellCode
                        ? \`[\${escapeHtml(bellCode)}] (\${durSec}초) <button type="button" class="rt-act-chip preview-btn-wrap" style="margin-left:4px" data-preview-bell="\${escapeHtml(bellCode)}">미리듣기 (\${durSec}초)</button>\`
                        : '13:07 영어 듣기평가 음원 재생'}
                    </span>
                  </div>
                </div>
              \` : ''}
            </div>
          \` : ''}
        \`;
        stageEl.appendChild(wrap);
      });
    }
    updatePreviewButtonsUI();
    scrollRightTimetableToActive();
  }

  function scrollRightTimetableToActive(){
    if(!rtScrollList || !isTimetablePanelOpen)return;
    requestAnimationFrame(()=>{
      const cards = Array.from(rtScrollList.querySelectorAll('.rt-row-card'));
      if(!cards.length)return;
      if(cards.length===1){
        rtScrollList.scrollTo({top:0, behavior:'smooth'});
        return;
      }
      let activeIdx = cards.findIndex(c=>Boolean(c.querySelector('.rt-item-btn.is-current')));
      if(activeIdx<0) activeIdx = 0;
      const maxTopIdx = Math.max(0, cards.length - 2);
      const targetTopIdx = clamp(activeIdx - 1, 0, maxTopIdx);
      const targetCard = cards[targetTopIdx];
      const firstCard = cards[0];
      if(!targetCard || !firstCard)return;
      const nextScrollTop = Math.max(0, targetCard.offsetTop - firstCard.offsetTop);
      rtScrollList.scrollTo({top:nextScrollTop, behavior:'smooth'});
    });
  }

  if(rtScrollList){
    rtScrollList.addEventListener('click', e=>{
      const prevBtn = e.target.closest('button[data-preview-bell]');
      if(prevBtn){
        togglePreviewBell(prevBtn.getAttribute('data-preview-bell'));
        return;
      }
      const openEdBtn = e.target.closest('button[data-rt-open-editor]');
      if(openEdBtn){
        openBuilderModalWithDraft();
        return;
      }
      const infoBtnEl = e.target.closest('button[data-rt-info-key]');
      if(infoBtnEl){
        const k = infoBtnEl.getAttribute('data-rt-info-key');
        expandedRtInfoKey = (expandedRtInfoKey === k) ? null : k;
        renderRightTimetableList();
        return;
      }
      const toggleBtn = e.target.closest('button[data-rt-toggle-key]');
      if(toggleBtn){
        const k = toggleBtn.getAttribute('data-rt-toggle-key');
        expandedRtKey = (expandedRtKey === k) ? null : k;
        expandedRtInfoKey = null;
        renderRightTimetableList();
        return;
      }
      const startAllBtn = e.target.closest('button[data-rt-start-all]');
      if(startAllBtn){
        const rowId = startAllBtn.getAttribute('data-rt-start-all');
        const row = EMBEDDED.timetable.find(r=>r.id===rowId);
        if(!row)return;
        if(phase!=='idle'){
          showToast('타이머 실행 중에는 구간을 변경할 수 없습니다. CANCEL 후 선택해 주세요.', 3200);
          return;
        }
        currentPreset = {
          id: 'custom_' + row.id,
          group: 'single',
          label: (row.periodLabel!=='-' ? row.periodLabel+' ' : '') + row.displayTitle + ' (' + row.category + ')',
          shortLabel: row.displayTitle,
          displayTitle: row.displayTitle,
          startMinutes: row.startMinutes,
          endMinutes: row.endMinutes,
          steps: [row]
        };
        isTemporaryStartPoint = false;
        expandedRtKey = null;
        expandedRtInfoKey = null;
        syncUiToPresetIdle();
        showToast(row.displayTitle + ' (' + row.category + ') 단계부터 대기합니다.', 2600);
        return;
      }
      const startSeqBtn = e.target.closest('button[data-rt-start-seq]');
      if(startSeqBtn){
        const rowIdx = Number(startSeqBtn.getAttribute('data-rt-start-seq'));
        if(phase!=='idle'){
          showToast('타이머 실행 중에는 구간을 변경할 수 없습니다. CANCEL 후 선택해 주세요.', 3200);
          return;
        }
        const seqRows = computeSequenceNodeRows(customSequenceConfig);
        const clickedRow = seqRows[rowIdx];
        if(!clickedRow)return;
        const remainingIds = seqRows.slice(rowIdx).map(r=>r.node.nodeId);
        const subConfig = {
          selectedNodeIds: remainingIds,
          intervalMap: Object.assign({}, customSequenceConfig.intervalMap || {}),
          intervalSecondsMap: Object.assign({}, customSequenceConfig.intervalSecondsMap || {}),
          firstNodeCustomMinutes: clickedRow.customTimeMinutes,
          mutedNodeIds: (customSequenceConfig.mutedNodeIds || []).slice()
        };
        const built = buildCustomSequencePreset(subConfig);
        if(!built)return;
        currentPreset = built;
        isTemporaryStartPoint = rowIdx > 0;
        expandedRtKey = null;
        expandedRtInfoKey = null;
        syncUiToPresetIdle();
        activeCustomNodeId = clickedRow.node.nodeId;
        renderRightTimetableList();
        const pPrefix = clickedRow.node.periodLabel!=='-' ? (clickedRow.node.periodLabel+' ') : '';
        showToast(pPrefix + clickedRow.node.subjectTitle + ' · ' + clickedRow.node.stageShortLabel + ' 단계부터 임시 시작 지점으로 설정되었습니다.', 2600);
      }
    });
  }

  const rtModeSegEl = document.getElementById('rtModeSeg');
  document.querySelectorAll('button[data-rt-mode]').forEach(modeBtn=>{
    modeBtn.addEventListener('click', ()=>{
      const mode = modeBtn.getAttribute('data-rt-mode');
      const nextMode = mode==='selected' ? 'selected' : 'all';
      if(nextMode===timetableViewMode)return;
      timetableViewMode = nextMode;
      expandedRtKey = null;
      if(rtModeSegEl){
        rtModeSegEl.classList.toggle('is-selected-tab', timetableViewMode==='selected');
      }
      document.querySelectorAll('button[data-rt-mode]').forEach(b=>{
        const isAct = b.getAttribute('data-rt-mode')===timetableViewMode;
        b.classList.toggle('active', isAct);
        b.setAttribute('aria-selected', isAct ? 'true' : 'false');
      });
      renderRightTimetableList(timetableViewMode==='selected' ? 'to-selected' : 'to-all');
    });
  });

  if(rtOptionCollapseBtn && rtOptionsOuter){
    rtOptionCollapseBtn.addEventListener('click', ()=>{
      isTimetableOptionCollapsed = !isTimetableOptionCollapsed;
      rtOptionsOuter.classList.toggle('is-collapsed', isTimetableOptionCollapsed);
      rtOptionCollapseBtn.classList.toggle('is-collapsed', isTimetableOptionCollapsed);
      rtOptionCollapseBtn.setAttribute('aria-expanded', isTimetableOptionCollapsed ? 'false' : 'true');
      const label = isTimetableOptionCollapsed ? '옵션 선택 펼치기' : '옵션 선택 숨기기';
      rtOptionCollapseBtn.setAttribute('aria-label', label);
      rtOptionCollapseBtn.setAttribute('title', label);
    });
  }

  if(rtEditSeqBtn){
    rtEditSeqBtn.addEventListener('click', openBuilderModalWithDraft);
  }

  function computeTargetLayout(w, h, isOpen){
    const dockBottom = dockEl ? (parseFloat(getComputedStyle(dockEl).bottom) || 24) : 24;

    if(w>=720){
      const panelW = isOpen ? Math.min(410, Math.max(320, Math.round(w*.34))) : 0;
      const availW = isOpen ? Math.max(250, w - panelW - 36) : w;
      const topClearance = 44;
      const dockTop = h - dockBottom - 46;
      const dockClearTop = dockTop - 52;
      const availVertSpan = Math.max(180, dockClearTop - topClearance);
      const maxRByHeight = Math.max(68, (availVertSpan - 76) / 2.5);
      const nextR = Math.min(availW*.38, h*.27, maxRByHeight, 330);
      const nextCx = isOpen ? Math.max(nextR + 18, availW/2) : w/2;
      const minCy = topClearance + nextR*1.3 + 20;
      const maxCy = dockClearTop - (nextR*1.2 + 52);
      const nextCy = minCy <= maxCy ? clamp(h*.435, minCy, maxCy) : (minCy + maxCy) / 2;
      return {
        R: nextR,
        cx: nextCx,
        cy: nextCy,
        dockY: 0
      };
    }

    if(!isOpen){
      const topClearance = 42;
      const dockTop = h - dockBottom - 46;
      const dockClearTop = dockTop - 48;
      const availVertSpan = Math.max(160, dockClearTop - topClearance);
      const maxRByHeight = Math.max(64, (availVertSpan - 68) / 2.5);
      const nextR = Math.min(w*.38, h*.27, maxRByHeight, 330);
      const minCy = topClearance + nextR*1.3 + 18;
      const maxCy = dockClearTop - (nextR*1.2 + 48);
      const nextCy = minCy <= maxCy ? clamp(h*.43, minCy, maxCy) : (minCy + maxCy) / 2;
      return {
        R: nextR,
        cx: w/2,
        cy: nextCy,
        dockY: 0
      };
    }

    const panelH = Math.round(clamp(h*.42, 220, 360));
    document.documentElement.style.setProperty('--tt-mobile-h', panelH + 'px');
    const nextDockY = -(panelH + 2);
    const dockTop = h - dockBottom - 46 + nextDockY;
    const dockClearTop = dockTop - 28;
    const topClearance = 40;
    const availVertSpan = Math.max(140, dockClearTop - topClearance);
    const maxRByHeight = Math.max(62, (availVertSpan - 58) / 2.5);
    const nextR = clamp(Math.min(w*.30, maxRByHeight, 150), 62, 150);
    const minCy = topClearance + nextR*1.3 + 14;
    const maxCy = dockClearTop - (nextR*1.2 + 42);
    const nextCy = (minCy + maxCy) / 2 - 4;
    return {
      R: nextR,
      cx: w/2,
      cy: nextCy,
      dockY: nextDockY
    };
  }

  function applyGeometryToDom(){
    face.style.cssText = \`left:\${cx-R}px;top:\${cy-R}px;width:\${2*R}px;height:\${2*R}px\`;
    const minTitleSize = R < 130 ? 20 : 26;
    title.style.top = (cy - R*1.3) + 'px';
    title.style.fontSize = clamp(R*.2, minTitleSize, 58) + 'px';
    const shiftX = (cx - W/2).toFixed(2);
    title.style.transform = \`translate3d(\${shiftX}px, -50%, 0)\`;
    const labW = Math.min(W - 24, Math.max(2.34*R, 304));
    const minLabFont = R < 130 ? 13 : R < 165 ? 16 : 18;
    lab.style.cssText = \`left:\${cx - labW/2}px;top:\${cy + R*1.18}px;width:\${labW}px;font-size:\${clamp(R*.105, minLabFont, 19.5)}px\`;
    const minDigitFont = R < 130 ? 21 : R < 165 ? 26 : 30;
    remainDigits.style.fontSize = clamp(R*.165, minDigitFont, 34) + 'px';
    document.documentElement.style.setProperty('--tt-shift-x', shiftX + 'px');
    document.documentElement.style.setProperty('--dock-shift-y', dockY.toFixed(2) + 'px');
    if(dockEl){
      dockEl.style.transform = \`translate3d(calc(-50% + \${shiftX}px), \${dockY.toFixed(2)}px, 0)\`;
    }
  }

  function startLayoutTransition(){
    const target = computeTargetLayout(W, Hh, isTimetablePanelOpen);
    fromR = R; fromCx = cx; fromCy = cy; fromDockY = dockY;
    targetR = target.R; targetCx = target.cx; targetCy = target.cy; targetDockY = target.dockY;
    layoutAnimStart = performance.now();
    layoutAnimating = true;
    if(layoutRafId){
      cancelAnimationFrame(layoutRafId);
      layoutRafId = 0;
    }
    function stepLayout(now){
      if(!layoutAnimating)return;
      const p = clamp((now - layoutAnimStart) / 380, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      R = fromR + (targetR - fromR) * e;
      cx = fromCx + (targetCx - fromCx) * e;
      cy = fromCy + (targetCy - fromCy) * e;
      dockY = fromDockY + (targetDockY - fromDockY) * e;
      applyGeometryToDom();
      draw();
      if(p < 1){
        layoutRafId = requestAnimationFrame(stepLayout);
      }else{
        layoutAnimating = false;
        layoutRafId = 0;
        R = targetR; cx = targetCx; cy = targetCy; dockY = targetDockY;
        applyGeometryToDom();
        draw();
      }
    }
    layoutRafId = requestAnimationFrame(stepLayout);
  }

  if(timetableToggleBtn && rightTimetablePanel){
    timetableToggleBtn.addEventListener('click', ()=>{
      isTimetablePanelOpen = !isTimetablePanelOpen;
      rightTimetablePanel.classList.toggle('open', isTimetablePanelOpen);
      rightTimetablePanel.setAttribute('aria-hidden', isTimetablePanelOpen ? 'false' : 'true');
      timetableToggleBtn.classList.toggle('is-selected', isTimetablePanelOpen);
      timetableToggleBtn.setAttribute('aria-expanded', isTimetablePanelOpen ? 'true' : 'false');
      if(isTimetablePanelOpen) scrollRightTimetableToActive();
      startLayoutTransition();
    });
  }

  function layout(){
    W=innerWidth;Hh=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    const nextW=Math.max(1,Math.round(W*dpr));
    const nextH=Math.max(1,Math.round(Hh*dpr));
    if(cv.width!==nextW||cv.height!==nextH){
      cv.width=nextW;cv.height=nextH;
    }
    if(gl)gl.viewport(0,0,cv.width,cv.height);
    if(layoutRafId){cancelAnimationFrame(layoutRafId);layoutRafId=0;}
    layoutAnimating=false;
    const target=computeTargetLayout(W,Hh,isTimetablePanelOpen);
    R=target.R;cx=target.cx;cy=target.cy;dockY=target.dockY;
    targetR=target.R;targetCx=target.cx;targetCy=target.cy;targetDockY=target.dockY;
    applyGeometryToDom();
    draw();
  }

  let fsSettleRaf=0, fsSettleT1=null, fsSettleT2=null;
  function handleFullscreenSettle(){
    layout();
    if(fsSettleRaf) cancelAnimationFrame(fsSettleRaf);
    fsSettleRaf=requestAnimationFrame(()=>{fsSettleRaf=0;layout();});
    if(fsSettleT1!==null) clearTimeout(fsSettleT1);
    if(fsSettleT2!==null) clearTimeout(fsSettleT2);
    fsSettleT1=setTimeout(()=>{fsSettleT1=null;layout();},90);
    fsSettleT2=setTimeout(()=>{fsSettleT2=null;layout();},240);
  }
  cv.addEventListener('webglcontextlost', e=>{e.preventDefault();});
  cv.addEventListener('webglcontextrestored', ()=>{initGlProgram();layout();});

  function roundedRectDistance(x, y, width, height, radius){
    const qx = Math.abs(x) - (width / 2 - radius);
    const qy = Math.abs(y) - (height / 2 - radius);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
  }

  function buildLensMap(width, height, radius){
    const canvas = document.createElement('canvas');
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const mapWidth = Math.max(128, Math.round(width * scale));
    const mapHeight = Math.max(48, Math.round(height * scale));
    canvas.width = mapWidth;
    canvas.height = mapHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if(!context)return '';
    const image = context.createImageData(mapWidth, mapHeight);
    const edgeWidth = Math.max(7, height * .14);
    const maxOffset = 3.1;
    const sampleDistance = 1.15;

    for(let y=0;y<mapHeight;y++){
      for(let x=0;x<mapWidth;x++){
        const px = (x / (mapWidth - 1) - .5) * width;
        const py = (y / (mapHeight - 1) - .5) * height;
        const distance = (xx, yy) => roundedRectDistance(xx, yy, width, height, radius);
        const inside = Math.max(0, -distance(px, py));
        const profile = sm(0, edgeWidth, inside);
        const gx = (sm(0, edgeWidth, Math.max(0, -distance(px + sampleDistance, py))) - sm(0, edgeWidth, Math.max(0, -distance(px - sampleDistance, py)))) / (2 * sampleDistance);
        const gy = (sm(0, edgeWidth, Math.max(0, -distance(px, py + sampleDistance))) - sm(0, edgeWidth, Math.max(0, -distance(px, py - sampleDistance)))) / (2 * sampleDistance);
        const lensWeight = 1 - profile;
        const cornerFactor = .72 + .28 * clamp(Math.abs(px) / (width * .5), 0, 1);
        const dx = clamp(-gx * maxOffset * cornerFactor * lensWeight, -maxOffset, maxOffset);
        const dy = clamp(-gy * maxOffset * lensWeight, -maxOffset, maxOffset);
        const index = (y * mapWidth + x) * 4;
        image.data[index] = clamp(Math.round(128 + dx / 18 * 255), 0, 255);
        image.data[index + 1] = clamp(Math.round(128 + dy / 18 * 255), 0, 255);
        image.data[index + 2] = 128;
        image.data[index + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    return canvas.toDataURL('image/png');
  }

  const lensMapUrl = buildLensMap(154, 46, 23);
  if(lensMapUrl){
    ['glass-map-light','glass-map-dark'].forEach(id=>{
      const el = document.getElementById(id);
      if(el){
        el.setAttribute('href', lensMapUrl);
        el.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', lensMapUrl);
      }
    });
  }

  const activePressedMap = new Map();
  const PRESSABLE_SELECTOR = 'button:not(:disabled), .lg-btn:not(:disabled), .lg-pill-cta-btn:not(:disabled)';
  const handlePressStart = e=>{
    if(e.pointerType === 'mouse' && e.button !== 0) return;
    const target = e.target && e.target.closest ? e.target.closest(PRESSABLE_SELECTOR) : null;
    if(!target) return;
    target.classList.add('is-pressed');
    activePressedMap.set(e.pointerId, target);
  };
  const handlePressEnd = e=>{
    const el = activePressedMap.get(e.pointerId);
    if(!el) return;
    activePressedMap.delete(e.pointerId);
    let stillHeld = false;
    activePressedMap.forEach(otherEl=>{ if(otherEl === el) stillHeld = true; });
    if(!stillHeld) el.classList.remove('is-pressed');
  };
  const clearAllPressed = ()=>{
    activePressedMap.forEach(el=>el.classList.remove('is-pressed'));
    activePressedMap.clear();
  };
  const handleTouchEndClear = e=>{
    if(e.touches.length === 0) clearAllPressed();
  };

  document.addEventListener('pointerdown', handlePressStart, {capture:true, passive:true});
  window.addEventListener('pointerup', handlePressEnd, {capture:true, passive:true});
  window.addEventListener('pointercancel', handlePressEnd, {capture:true, passive:true});
  window.addEventListener('touchend', handleTouchEndClear, {capture:true, passive:true});
  window.addEventListener('touchcancel', handleTouchEndClear, {capture:true, passive:true});
  window.addEventListener('blur', clearAllPressed);
  document.addEventListener('visibilitychange', clearAllPressed);

  document.addEventListener('pointermove', e=>{
    const target = e.target && e.target.closest ? e.target.closest('.lg-btn, .pill-group-row') : null;
    if(!target)return;
    const rect = target.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    target.style.setProperty('--px', clamp((e.clientX - rect.left) / rect.width * 100, 0, 100) + '%');
    target.style.setProperty('--py', clamp((e.clientY - rect.top) / rect.height * 100, 0, 100) + '%');
  }, {passive:true});

  document.addEventListener('pointerout', e=>{
    const target = e.target && e.target.closest ? e.target.closest('.lg-btn, .pill-group-row') : null;
    if(!target)return;
    if(e.relatedTarget && target.contains(e.relatedTarget))return;
    target.style.setProperty('--px', '50%');
    target.style.setProperty('--py', '12%');
  }, {passive:true});

  try{
    renderBellListRows();
    loadCustomSettings();
    renderBuilderModal();
    renderRightTimetableList();
    updateVersionDisplay();
    syncUiToPresetIdle();
    addEventListener('resize',layout);
    if(window.visualViewport) window.visualViewport.addEventListener('resize',layout);
    document.addEventListener('fullscreenchange',handleFullscreenSettle);
    document.addEventListener('webkitfullscreenchange',handleFullscreenSettle);
    layout();
  }catch(initErr){
    console.error(initErr);
  }finally{
    const revealApp = ()=>{
      try{
        applyGeometryToDom();
        draw();
      }catch(_){}
      document.documentElement.classList.add('app-ready');
    };
    const fontsReadyPromise = (document.fonts && document.fonts.ready)
      ? document.fonts.ready.catch(()=>{})
      : Promise.resolve();
    Promise.race([fontsReadyPromise, new Promise(r=>setTimeout(r, 220))]).then(()=>{
      requestAnimationFrame(()=>requestAnimationFrame(revealApp));
    }).catch(()=>revealApp());
  }
})();
</script>
</body>
</html>`;
}

