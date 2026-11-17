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
 *   초기 기본 상태(기본 타이머: 1교시 국어 준비령 08:35~08:40, 시계 바늘 연동: 원래 수능 시각 기준)로 생성됩니다.
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
<meta name="application-name" content="대학수학능력시험 안내방송">
<meta name="version" content="${fullVersionString}">
<meta id="theme-color-meta" name="theme-color" content="#ecebe9">
<link id="app-favicon" rel="icon" type="image/svg+xml" href="${LIGHT_FAVICON_DATA_URI}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200..900&family=Noto+Serif:ital,opsz,wght@0,6..144,200..900&display=swap" rel="stylesheet">
<title>대학수학능력시험 안내방송</title>
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
})();
</script>
<style>
:root,[data-theme="light"]{
  --ease:cubic-bezier(.2,.75,.25,1);
  --spring:cubic-bezier(.2,1.1,.3,1);
  --stage:#ecebe9;
  --ink:#1a1a1a;
  --btn:#252832;
  --tick-major:#5a5a5a;
  --tick-minor:#a9a9a9;
  --min-hand:#171717;
  --sec-hand:#4d4d4d;
  --glass-fill:rgba(255,255,255,.025);
  --glass-rim:rgba(255,255,255,.66);
  --glint:rgba(255,255,255,.84);
  --btn-shadow:0 9px 24px rgba(35,43,58,.09),inset 0 1px 0 rgba(255,255,255,.68),inset 0 -1px 0 rgba(40,48,62,.08);
  --btn-shadow-hover:0 13px 30px rgba(31,39,54,.12),inset 0 1px 0 rgba(255,255,255,.82),inset 0 -1px 0 rgba(40,48,62,.07);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,255,255,.115),transparent 100%),linear-gradient(150deg,rgba(255,255,255,.075),transparent 43%,rgba(255,255,255,.018) 76%,rgba(255,255,255,.055));
  --btn-after-opacity:.28;
  --btn-text-shadow:0 1px 2px rgba(255,255,255,.24);
  --focus-ring:#7c9cc5;
  --modal-bg:linear-gradient(155deg,rgba(255,255,255,.72) 0%,rgba(246,246,244,.62) 100%);
  --modal-border:rgba(255,255,255,.85);
  --modal-ink:#1a1a1a;
  --modal-muted:#52525b;
  --modal-surface:rgba(0,0,0,.045);
  --modal-card-bg:rgba(255,255,255,.42);
  --toll-ink:#1c1c1d;
  --toll-ink-2:#444446;
  --toll-muted:#717174;
  --toll-line:rgba(24,24,25,.10);
  --toll-line-soft:rgba(24,24,25,.07);
  --toll-glass:rgba(246,246,248,.34);
  --toll-glass-strong:rgba(255,255,255,.09);
  --toll-glass-soft:rgba(255,255,255,.15);
  --toll-glass-inner:rgba(255,255,255,.22);
  --toll-glass-edge:rgba(255,255,255,.78);
  --toll-glass-edge-low:rgba(255,255,255,.62);
  --toll-highlight:rgba(255,255,255,.90);
  --toll-glass-shadow:0 28px 80px rgba(0,0,0,.18),0 6px 20px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.86);
  --toll-selected:rgba(60,60,62,.105);
  --toll-selected-edge:rgba(35,35,36,.15);
  --toll-pill:rgba(255,255,255,.24);
  --toll-pill-hover:rgba(255,255,255,.48);
  --toll-button:#242425;
  --toll-button-text:#1c1c1d;
  --toll-scroll:rgba(50,50,52,.28);
  --toll-warn:#9a5b13;
  --toll-warn-bg:rgba(214,178,126,.16);
  --toll-warn-line:rgba(154,91,19,.28);
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
}
[data-theme="dark"]{
  --stage:#121212;
  --ink:#f1f1f1;
  --btn:#f1f1f1;
  --tick-major:#d6d6d6;
  --tick-minor:#636363;
  --min-hand:#f1f1f1;
  --sec-hand:#686868;
  --glass-fill:rgba(255,255,255,.075);
  --glass-rim:rgba(255,255,255,.23);
  --glint:rgba(255,255,255,.42);
  --btn-shadow:0 6px 18px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.17),inset 0 -1px 0 rgba(255,255,255,.03);
  --btn-shadow-hover:0 10px 24px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -1px 0 rgba(255,255,255,.05);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,255,255,.08),transparent 100%),linear-gradient(145deg,rgba(255,255,255,.085),rgba(255,255,255,.03));
  --btn-after-opacity:.18;
  --btn-text-shadow:0 1px 2px rgba(0,0,0,.32);
  --focus-ring:#e2e2e2;
  --modal-bg:rgba(30,30,30,.92);
  --modal-border:rgba(255,255,255,.23);
  --modal-ink:#f1f1f1;
  --modal-muted:#9f9f9f;
  --modal-surface:rgba(255,255,255,.075);
  --modal-card-bg:rgba(38,38,38,.74);
  --toll-ink:#f1f1f1;
  --toll-ink-2:#d2d2d2;
  --toll-muted:#9f9f9f;
  --toll-line:rgba(255,255,255,.11);
  --toll-line-soft:rgba(255,255,255,.075);
  --toll-glass:rgba(30,30,30,.92);
  --toll-glass-strong:rgba(26,26,26,.92);
  --toll-glass-soft:rgba(38,38,38,.74);
  --toll-glass-inner:rgba(46,46,46,.60);
  --toll-glass-edge:rgba(255,255,255,.23);
  --toll-glass-edge-low:rgba(255,255,255,.13);
  --toll-highlight:rgba(255,255,255,.24);
  --toll-glass-shadow:0 34px 96px rgba(0,0,0,.62),0 8px 26px rgba(0,0,0,.40),inset 0 1px 0 rgba(255,255,255,.24),inset 0 -1px 0 rgba(255,255,255,.05);
  --toll-selected:rgba(255,255,255,.12);
  --toll-selected-edge:rgba(255,255,255,.28);
  --toll-pill:rgba(255,255,255,.075);
  --toll-pill-hover:rgba(255,255,255,.14);
  --toll-button:#f0f0f0;
  --toll-button-text:#171717;
  --toll-scroll:rgba(255,255,255,.23);
  --toll-warn:#d6b27e;
  --toll-warn-bg:rgba(214,178,126,.10);
  --toll-warn-line:rgba(214,178,126,.28);
}
[data-theme="sepia"]{
  --stage:#e6dcc8;
  --ink:#36291e;
  --btn:#36291e;
  --tick-major:#5c4938;
  --tick-minor:#9c8873;
  --min-hand:#2b1f16;
  --sec-hand:#4d4d4d;
  --glass-fill:rgba(255,248,235,.03);
  --glass-rim:rgba(255,248,235,.66);
  --glint:rgba(255,248,235,.82);
  --btn-shadow:0 9px 24px rgba(54,41,30,.09),inset 0 1px 0 rgba(255,248,235,.68),inset 0 -1px 0 rgba(54,41,30,.08);
  --btn-shadow-hover:0 13px 30px rgba(54,41,30,.12),inset 0 1px 0 rgba(255,248,235,.82),inset 0 -1px 0 rgba(54,41,30,.07);
  --btn-before:radial-gradient(ellipse 43% 72% at var(--px,50%) var(--py,12%),rgba(255,248,235,.115),transparent 100%),linear-gradient(150deg,rgba(255,248,235,.075),transparent 43%,rgba(255,248,235,.018) 76%,rgba(255,248,235,.055));
  --btn-after-opacity:.26;
  --btn-text-shadow:0 1px 2px rgba(255,248,235,.24);
  --focus-ring:#8c6d53;
  --modal-bg:linear-gradient(155deg,rgba(248,240,225,.95) 0%,rgba(238,228,208,.90) 100%);
  --modal-border:rgba(255,248,235,.80);
  --modal-ink:#36291e;
  --modal-muted:#6e5a49;
  --modal-surface:rgba(54,41,30,.06);
  --modal-card-bg:rgba(255,248,235,.5);
  --toll-ink:#2c2117;
  --toll-ink-2:#4e3d2e;
  --toll-muted:#786452;
  --toll-line:rgba(54,41,30,.12);
  --toll-line-soft:rgba(54,41,30,.08);
  --toll-glass:rgba(245,236,220,.86);
  --toll-glass-strong:rgba(255,250,240,.18);
  --toll-glass-soft:rgba(255,250,240,.38);
  --toll-glass-inner:rgba(255,250,240,.52);
  --toll-glass-edge:rgba(255,250,242,.82);
  --toll-glass-edge-low:rgba(255,250,242,.68);
  --toll-highlight:rgba(255,250,242,.90);
  --toll-glass-shadow:0 28px 80px rgba(42,31,21,.22),0 6px 20px rgba(42,31,21,.10),inset 0 1px 0 rgba(255,250,242,.90);
  --toll-selected:rgba(74,56,40,.11);
  --toll-selected-edge:rgba(54,41,30,.16);
  --toll-pill:rgba(255,250,242,.52);
  --toll-pill-hover:rgba(255,250,242,.80);
  --toll-button:#36291e;
  --toll-button-text:#2c2117;
  --toll-scroll:rgba(54,41,30,.28);
  --toll-warn:#9a5b13;
  --toll-warn-bg:rgba(214,178,126,.16);
  --toll-warn-line:rgba(154,91,19,.28);
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
html,body{height:100%;margin:0;overflow:hidden;background:var(--stage);color:var(--ink);-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent;transition:background-color .35s ease,color .35s ease}
.svg-filters{position:absolute;width:0;height:0;overflow:hidden;pointer-events:none}
canvas{position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0}
#wakeLockVideo{position:fixed;inset:0;width:100%;height:100%;object-fit:cover;opacity:.005;pointer-events:none;z-index:1;contain:strict;display:none}
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
#lab{position:absolute;display:flex;justify-content:space-between;align-items:flex-start;color:var(--ink);font-weight:800;font-style:italic;letter-spacing:-.03em;line-height:1.15;font-family:"Arial Narrow","Helvetica Neue",Arial,sans-serif;transition:color .35s ease}
#lab > div:first-child{opacity:1;text-align:left;white-space:nowrap;flex-shrink:0;will-change:opacity}
#lab > div:last-child{opacity:.38;text-align:right;white-space:nowrap;flex-shrink:0;will-change:opacity}
#centerStat{
  flex:1 1 auto;
  min-width:0;
  padding:0 8px;
  font-style:normal;
  text-align:center;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:2px;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Apple SD Gothic Neo","Noto Sans KR",sans-serif;
}
#remainDigits{
  font-weight:800;
  font-variant-numeric:tabular-nums;
  letter-spacing:.02em;
  color:var(--ink);
  line-height:1.05;
  white-space:nowrap;
}
#stageBadge{
  font-weight:600;
  font-size:.76em;
  letter-spacing:.01em;
  opacity:.68;
  white-space:nowrap;
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
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
}
#fullscreenBtn.is-open:hover{
  transform:translateY(-1.5px) scale(1.04);
}
#fullscreenBtn.is-open:active{
  transform:translateY(0) scale(.95);
}
#fullscreenBtn.is-selected{
  border-color:var(--glint);
  box-shadow:var(--btn-shadow-hover),0 0 0 1px var(--glass-rim);
}
#pillDrawer{
  display:flex;
  flex-direction:row;
  align-items:flex-start;
  gap:10px;
  transform-origin:top left;
  transition:opacity .28s var(--ease),transform .28s var(--spring),visibility .28s;
}
#pillDrawer.closed{
  opacity:0;
  pointer-events:none;
  visibility:hidden;
  transform:translateY(-8px) scale(.95);
}
#pillDrawer.open{
  opacity:1;
  pointer-events:auto;
  visibility:visible;
  transform:translateY(0) scale(1);
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
  border-color:var(--glint);
  box-shadow:var(--btn-shadow-hover),0 0 0 1px var(--glass-rim);
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
  border-color:var(--glint);
  box-shadow:var(--btn-shadow-hover),0 0 0 1px var(--glass-rim);
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
.lg-btn,.pill-group-row{
  --px:50%;
  --py:12%;
  position:relative;
  overflow:hidden;
  isolation:isolate;
  border-radius:999px;
  border:1px solid var(--glass-rim);
  background:var(--glass-fill);
  box-shadow:var(--btn-shadow);
  -webkit-backdrop-filter:blur(.8px) saturate(1.38) contrast(1.02);
  backdrop-filter:blur(.8px) saturate(1.38) contrast(1.02);
  color:var(--btn);
  text-shadow:var(--btn-text-shadow);
  -webkit-tap-highlight-color:transparent;
  transition:transform .34s var(--spring),box-shadow .32s var(--ease),border-color .28s ease,color .25s ease,opacity .3s ease;
}
.lg-btn::before,.pill-group-row::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:0;
  border-radius:inherit;
  pointer-events:none;
  background:var(--btn-before);
  opacity:.9;
}
.lg-btn::after,.pill-group-row::after{
  content:"";
  position:absolute;
  inset:1px;
  z-index:0;
  border-radius:inherit;
  pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.52),transparent 11%),linear-gradient(0deg,rgba(255,255,255,.16),transparent 16%);
  opacity:var(--btn-after-opacity);
  mix-blend-mode:screen;
}
@supports (backdrop-filter: url("#glass-lens-light")){
  .lg-btn,.pill-group-row{
    -webkit-backdrop-filter:url("#glass-lens-light") blur(.8px) saturate(1.38) contrast(1.02);
    backdrop-filter:url("#glass-lens-light") blur(.8px) saturate(1.38) contrast(1.02);
  }
  [data-theme="dark"] .lg-btn,[data-theme="dark"] .pill-group-row{
    -webkit-backdrop-filter:url("#glass-lens-dark") blur(.8px) saturate(1.34);
    backdrop-filter:url("#glass-lens-dark") blur(.8px) saturate(1.34);
  }
}
.lg-btn > *,.pill-group-row > *{
  position:relative;
  z-index:2;
}
.lg-btn{
  font:650 14px/1 -apple-system,BlinkMacSystemFont,"SF Pro Display","SF Pro Text","Roboto","Noto Sans KR",sans-serif;
  letter-spacing:.14em;
  cursor:pointer;
  white-space:nowrap;
}
.lg-btn:hover{
  transform:translateY(-1.5px) scale(1.025);
  box-shadow:var(--btn-shadow-hover);
}
[data-theme="dark"] .lg-btn:hover{
  background:rgba(255,255,255,.12);
  border-color:rgba(255,255,255,.32);
}
.lg-btn:active,.lg-btn.is-pressed{
  transform:translateY(0) scale(.955);
  transition-duration:.13s;
}
.lg-btn:focus-visible{
  outline:2px solid var(--focus-ring);
  outline-offset:4px;
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
  border-color:var(--glass-rim);
  color:var(--ink);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 2px 8px rgba(0,0,0,.08);
}
[data-theme="dark"] .theme-chip.active,[data-theme="dark"] .sync-chip.active{
  background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(255,255,255,.075));
  border-color:rgba(255,255,255,.32);
  color:#f5f5f5;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26),inset 0 0 0 1px rgba(255,255,255,.04),0 3px 12px rgba(0,0,0,.22);
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
  border:1px solid var(--glass-rim);
  background:var(--modal-bg);
  -webkit-backdrop-filter:blur(20px) saturate(180%);
  backdrop-filter:blur(20px) saturate(180%);
  box-shadow:var(--btn-shadow);
  color:var(--modal-ink);
  font:600 12.5px/1.3 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
  letter-spacing:.01em;
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

/* ---------- Custom Checkbox Sequence & Interval/Time Editor Modal (Monochrome Liquid Glass UI, GPU-Accelerated) ---------- */
#builderModalBackdrop{
  position:fixed;
  inset:0;
  width:100%;
  height:100dvh;
  max-height:100dvh;
  z-index:52;
  background:rgba(14,14,18,.34);
  backdrop-filter:blur(42px) saturate(140%);
  -webkit-backdrop-filter:blur(42px) saturate(140%);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:max(14px,env(safe-area-inset-top,0px)) 20px max(16px,env(safe-area-inset-bottom,0px));
  font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif;
  color:var(--toll-ink);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:opacity .22s cubic-bezier(.22,1,.36,1),visibility .22s;
}
[data-theme="dark"] #builderModalBackdrop{
  background:radial-gradient(960px 560px at 18% 12%,rgba(255,255,255,.045),transparent 62%),radial-gradient(880px 540px at 84% 88%,rgba(255,255,255,.035),transparent 60%),rgba(8,8,8,.76);
  backdrop-filter:blur(26px) saturate(118%);
  -webkit-backdrop-filter:blur(26px) saturate(118%);
}
#builderModalBackdrop.open{
  opacity:1;
  visibility:visible;
  pointer-events:auto;
}
.toll-scrim button,.toll-scrim input,.toll-scrim select{font:inherit;color:inherit}
.toll-dialog{
  width:min(1160px,100%);
  height:min(820px,100%);
  max-height:100%;
  min-height:0;
  display:flex;
  flex-direction:column;
  position:relative;
  isolation:isolate;
  overflow:hidden;
  word-break:keep-all;
  overflow-wrap:break-word;
  border-radius:26px;
  background:var(--toll-glass);
  border:1px solid var(--toll-glass-edge);
  box-shadow:var(--toll-glass-shadow);
  backdrop-filter:blur(68px) saturate(140%);
  -webkit-backdrop-filter:blur(68px) saturate(140%);
  transform:translate3d(0,14px,0) scale(.965);
  opacity:0;
  transition:transform .28s cubic-bezier(.22,1,.36,1),opacity .22s cubic-bezier(.22,1,.36,1);
}
#builderModalBackdrop.open .toll-dialog{
  transform:translate3d(0,0,0) scale(1);
  opacity:1;
}
.toll-dialog::before{
  content:"";
  position:absolute;
  inset:0;
  z-index:-1;
  pointer-events:none;
  border-radius:inherit;
  background:linear-gradient(135deg,rgba(255,255,255,.11),transparent 24%,transparent 72%,rgba(255,255,255,.04));
  opacity:.85;
}
.toll-dialog::after{
  content:"";
  position:absolute;
  inset:1px 1px auto;
  height:1px;
  border-radius:100%;
  background:rgba(255,255,255,.32);
  opacity:.8;
  pointer-events:none;
}
.toll-dialog .dialog-header{
  padding:15px 22px 13px;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
  border-bottom:1px solid var(--toll-line);
  background:rgba(255,255,255,.13);
  position:relative;
  flex:none;
}
[data-theme="dark"] .toll-dialog .dialog-header{
  background:rgba(255,255,255,.03);
}
.toll-dialog .dialog-heading{min-width:0}
.toll-dialog .dialog-heading h1{
  font-size:15px;
  line-height:1.35;
  margin:0 0 5px;
  font-weight:750;
  letter-spacing:-.035em;
  color:var(--toll-ink);
}
.toll-dialog .dialog-heading p{
  font-size:11px;
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
  width:34px;
  min-width:34px;
  height:34px;
  padding:0;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:11px;
  font-weight:650;
  cursor:pointer;
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
.toll-dialog .icon-button:active:not(:disabled){transform:scale(.95)}
.toll-dialog .quickbar{
  padding:11px 22px 11px;
  border-bottom:1px solid var(--toll-line);
  display:flex;
  flex-direction:column;
  gap:7px;
  background:rgba(255,255,255,.075);
  flex:none;
}
[data-theme="dark"] .toll-dialog .quickbar{
  background:rgba(255,255,255,.018);
}
.toll-dialog .quick-line{
  display:flex;
  align-items:center;
  gap:6px;
  min-width:0;
  flex-wrap:wrap;
}
.toll-dialog .quick-label{
  font-size:10.5px;
  font-weight:700;
  color:var(--toll-muted);
  min-width:68px;
  letter-spacing:-.025em;
}
.toll-dialog .chip{
  position:relative;
  isolation:isolate;
  overflow:hidden;
  border-radius:999px;
  padding:6.5px 11px;
  font-size:10px;
  font-weight:650;
  line-height:1;
  white-space:nowrap;
  cursor:pointer;
  transition:background .16s,border-color .16s,transform .16s;
}
.toll-dialog .chip:active{transform:scale(.97)}
.toll-dialog .subj-auto-box{
  display:inline-flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
  padding:4px 9px;
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
  gap:4px;
  font-size:10px;
  font-weight:650;
  color:var(--toll-ink-2);
  cursor:pointer;
  white-space:nowrap;
}
.toll-dialog .subj-check-label input[type="checkbox"]{
  width:13px;
  height:13px;
  accent-color:var(--toll-button);
  cursor:pointer;
  margin:0;
}
.toll-dialog .builder-select-sm{
  height:25px;
  padding:0 8px;
  border-radius:999px;
  font-size:10px;
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
  padding:6px 8px 6px 11px;
  font-size:10px;
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
  padding:6px 8px 6px 6px;
  font-size:10.5px;
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
  width:152px;
  height:26px;
  border-radius:999px;
  padding:0 11px;
  font-size:10px;
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
  font-size:11.5px;
  line-height:1.45;
  font-weight:750;
  letter-spacing:-.03em;
  color:var(--toll-ink-2);
  word-break:keep-all;
}
.toll-dialog .pane-note{
  font-size:10px;
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
  left:10px;
  width:13px;
  height:13px;
  color:var(--toll-muted);
  pointer-events:none;
}
.toll-dialog .builder-search-input{
  width:100%;
  height:29px;
  padding:0 11px 0 29px;
  border-radius:999px;
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.52);
  color:var(--toll-ink);
  font-size:10.5px;
  font-weight:600;
  letter-spacing:-.02em;
  outline:none;
}
[data-theme="dark"] .toll-dialog .builder-search-input{
  background:rgba(255,255,255,.045);
}
.toll-dialog .builder-search-input::placeholder{
  color:var(--toll-muted);
  font-size:10.5px;
  font-weight:550;
}
.toll-dialog .stage-type-bar{
  display:flex;
  align-items:center;
  gap:4px;
  flex-wrap:wrap;
}
.toll-dialog .stage-type-chip{
  height:23px;
  padding:0 8.5px;
  border-radius:999px;
  font-size:9.5px;
  font-weight:650;
  color:var(--toll-ink-2);
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.42);
  cursor:pointer;
  transition:background .15s,border-color .15s;
}
[data-theme="dark"] .toll-dialog .stage-type-chip{
  background:rgba(255,255,255,.045);
}
.toll-dialog .stage-type-chip:hover{
  background:rgba(255,255,255,.68);
  border-color:var(--toll-glass-edge);
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
  contain:layout style;
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
  font-size:11px;
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
  font-size:9px;
  font-weight:650;
  color:var(--toll-ink-2);
  padding:5px 8.5px;
  border-radius:999px;
  white-space:nowrap;
  cursor:pointer;
}
.toll-dialog .collapse-btn{
  border:none;
  background:transparent;
  color:var(--toll-muted);
  font-size:9.5px;
  font-weight:650;
  padding:3px 5px;
  border-radius:6px;
  cursor:pointer;
}
.toll-dialog .collapse-btn:hover{
  color:var(--toll-ink);
  background:rgba(255,255,255,.06);
}
.toll-dialog .stage-row{
  position:relative;
  min-height:33px;
  height:auto;
  padding:5px 7px;
  display:grid;
  grid-template-columns:18px minmax(0,1fr) auto;
  align-items:center;
  gap:8px;
  border-radius:10px;
  margin-top:2px;
  cursor:pointer;
  border:1px solid transparent;
  background:rgba(255,255,255,.065);
  transition:background .15s,border-color .15s,box-shadow .15s;
}
.toll-dialog .stage-row:hover{
  background:rgba(255,255,255,.25);
  border-color:rgba(255,255,255,.62);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.52),0 3px 10px rgba(0,0,0,.025);
}
.toll-dialog .stage-row.selected{
  background:linear-gradient(125deg,rgba(75,75,78,.105),rgba(255,255,255,.14));
  border-color:rgba(255,255,255,.75);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.76),inset 0 0 0 1px rgba(75,75,78,.055),0 3px 12px rgba(0,0,0,.035);
}
[data-theme="dark"] .toll-dialog .stage-row{
  background:rgba(255,255,255,.024);
}
[data-theme="dark"] .toll-dialog .stage-row:hover{
  background:rgba(255,255,255,.075);
  border-color:rgba(255,255,255,.16);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 3px 10px rgba(0,0,0,.18);
}
[data-theme="dark"] .toll-dialog .stage-row.selected{
  background:linear-gradient(125deg,rgba(255,255,255,.115),rgba(255,255,255,.05));
  border-color:rgba(255,255,255,.24);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18),inset 0 0 0 1px rgba(255,255,255,.03),0 3px 12px rgba(0,0,0,.22);
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
  font-size:10.5px;
  font-weight:580;
  letter-spacing:-.025em;
  line-height:1.28;
  word-break:keep-all;
  white-space:normal;
}
.toll-dialog .stage-meta{
  font-size:9.5px;
  color:var(--toll-muted);
  font-variant-numeric:tabular-nums;
  white-space:nowrap;
}
.toll-dialog .batch-interval-bar{
  padding:8px 11px;
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
  font-size:10px;
  font-weight:650;
  color:var(--toll-ink-2);
}
.toll-dialog .tools-label{
  font-size:10px;
  font-weight:700;
  color:var(--toll-muted);
  letter-spacing:-.02em;
}
.toll-dialog .batch-num-input{
  width:48px;
  height:26px;
  border-radius:8px;
  text-align:center;
  padding:0 5px;
  font-size:10.5px;
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
  padding:7px 11px;
  border-radius:12px;
  font-size:10px;
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
  height:23px;
  padding:0 9px;
  border-radius:999px;
  font-size:9.5px;
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
.toll-dialog .schedule-item{margin:0 0 10px;contain:layout style}
.toll-dialog .alarm-card{
  min-height:64px;
  display:grid;
  grid-template-columns:28px minmax(145px,1fr) auto auto;
  align-items:center;
  gap:10px;
  padding:9px 12px;
  border:1px solid rgba(255,255,255,.76);
  border-radius:18px;
  background:linear-gradient(135deg,rgba(255,255,255,.42),rgba(255,255,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.86),inset 0 -1px 0 rgba(255,255,255,.12),0 5px 16px rgba(0,0,0,.035);
  position:relative;
  overflow:hidden;
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
  width:27px;
  height:27px;
  display:grid;
  place-items:center;
  border-radius:50%;
  font-size:10px;
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
  font-size:11.5px;
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
  padding:1px 6px;
  border-radius:999px;
  background:var(--toll-warn-bg);
  border:1px solid var(--toll-warn-line);
  color:var(--toll-warn);
  font-size:9px;
  font-weight:750;
}
.toll-dialog .alarm-sub{
  font-size:9.5px;
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
  font-size:10px;
  white-space:nowrap;
}
.toll-dialog .time-input{
  width:118px;
  min-width:110px;
  height:30px;
  border-radius:10px;
  padding:0 9px;
  color:var(--toll-ink);
  font-size:10.5px;
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
  width:30px;
  height:30px;
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
.toll-dialog .mute-toggle-btn:active{transform:scale(.94)}
.toll-dialog .mute-toggle-btn.is-muted{
  background:rgba(214,110,110,.14);
  border-color:rgba(214,110,110,.38);
  color:#eb9b9b;
}
.toll-dialog .preview-btn{
  height:30px;
  padding:0 11px;
  border-radius:999px;
  font-size:9.5px;
  font-weight:700;
  white-space:nowrap;
  cursor:pointer;
  transition:background .16s,transform .16s;
}
.toll-dialog .preview-btn:active{transform:scale(.96)}
.toll-dialog .interval-row{
  min-height:54px;
  margin:7px 0 0 22px;
  padding:7px 10px 7px 12px;
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
  font-size:10px;
  font-weight:750;
  letter-spacing:-.03em;
  margin-bottom:3px;
}
.toll-dialog .interval-sub{
  font-size:9px;
  color:var(--toll-muted);
}
.toll-dialog .row-inline-alert{
  margin-top:4px;
  font-size:9.5px;
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
  height:27px;
  min-width:38px;
  padding:0 8px;
  border-radius:999px;
  font-size:9px;
  font-weight:700;
  cursor:pointer;
  transition:background .15s,transform .15s;
}
.toll-dialog .nudge:active{transform:scale(.93)}
.toll-dialog .interval-input{
  width:56px;
  height:28px;
  border-radius:9px;
  text-align:right;
  padding:0 7px;
  color:var(--toll-ink);
  font-size:10.5px;
  font-weight:750;
  outline:none;
}
.toll-dialog .unit{
  font-size:9.5px;
  font-weight:600;
  color:var(--toll-ink-2);
  margin-left:-1px;
}
.toll-dialog .omitted-steps-box{
  margin:6px 0 8px 22px;
  padding:6px 10px;
  border-radius:12px;
  border:1px dashed var(--toll-line);
  background:rgba(255,255,255,.03);
  font-size:9.5px;
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
  padding:2.5px 8px;
  border-radius:999px;
  border:1px solid var(--toll-glass-edge-low);
  background:rgba(255,255,255,.05);
  color:var(--toll-ink-2);
  font-size:9px;
  font-weight:650;
}
.toll-dialog .omitted-pill button{
  border:none;
  background:transparent;
  color:var(--toll-ink);
  font-weight:800;
  font-size:9px;
  cursor:pointer;
  padding:0 2px;
}
.toll-dialog .empty-state{
  padding:28px 14px;
  text-align:center;
  color:var(--toll-muted);
  font-size:11px;
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
  min-height:68px;
  padding:10px 22px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  border-top:1px solid var(--toll-glass-edge-low);
  background:var(--toll-glass-strong);
  backdrop-filter:blur(22px) saturate(140%);
  -webkit-backdrop-filter:blur(22px) saturate(140%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),0 -8px 26px rgba(0,0,0,.045);
}
[data-theme="dark"] .toll-dialog .dialog-footer{
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 -8px 28px rgba(0,0,0,.28);
}
.toll-dialog .summary{
  font-size:10.5px;
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
  gap:9px;
  flex:none;
}
.toll-dialog .footer-btn{
  height:38px;
  padding:0 18px;
  border-radius:999px;
  font-size:10px;
  font-weight:750;
  cursor:pointer;
  white-space:nowrap;
  transition:transform .16s,background .16s,box-shadow .16s,border-color .16s;
}
.toll-dialog .footer-btn:active{transform:scale(.97)}
.toll-dialog .chip,
.toll-dialog .area-tag,
.toll-dialog .preview-btn,
.toll-dialog .nudge,
.toll-dialog .footer-btn,
.toll-dialog .icon-button,
.toll-dialog .time-input,
.toll-dialog .interval-input{
  border:1px solid rgba(255,255,255,.68);
  background:linear-gradient(145deg,rgba(255,255,255,.42),rgba(255,255,255,.16));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72),inset 0 -1px 0 rgba(255,255,255,.12),0 2px 7px rgba(0,0,0,.035);
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
  background:linear-gradient(118deg,rgba(255,255,255,.34),transparent 42%,rgba(255,255,255,.07));
  opacity:.7;
}
.toll-dialog .chip:hover,
.toll-dialog .area-tag:hover,
.toll-dialog .preview-btn:hover,
.toll-dialog .nudge:hover,
.toll-dialog .footer-btn:hover,
.toll-dialog .icon-button:hover:not(:disabled){
  background:linear-gradient(145deg,rgba(255,255,255,.56),rgba(255,255,255,.22));
  border-color:rgba(255,255,255,.92);
}
.toll-dialog .chip.active{
  color:var(--toll-ink);
  border-color:rgba(65,65,68,.24);
  background:linear-gradient(145deg,rgba(70,70,73,.19),rgba(70,70,73,.085));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.82),inset 0 0 0 1px rgba(255,255,255,.15),0 3px 11px rgba(0,0,0,.055);
}
[data-theme="dark"] .toll-dialog .chip,
[data-theme="dark"] .toll-dialog .area-tag,
[data-theme="dark"] .toll-dialog .preview-btn,
[data-theme="dark"] .toll-dialog .nudge,
[data-theme="dark"] .toll-dialog .footer-btn,
[data-theme="dark"] .toll-dialog .icon-button,
[data-theme="dark"] .toll-dialog .time-input,
[data-theme="dark"] .toll-dialog .interval-input{
  color:var(--toll-ink);
  border-color:rgba(255,255,255,.16);
  background:linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.035));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.025),0 2px 8px rgba(0,0,0,.16);
}
[data-theme="dark"] .toll-dialog .chip::before,
[data-theme="dark"] .toll-dialog .area-tag::before,
[data-theme="dark"] .toll-dialog .preview-btn::before,
[data-theme="dark"] .toll-dialog .nudge::before,
[data-theme="dark"] .toll-dialog .footer-btn::before,
[data-theme="dark"] .toll-dialog .icon-button::before{
  background:linear-gradient(118deg,rgba(255,255,255,.15),transparent 45%,rgba(255,255,255,.025));
  opacity:.85;
}
[data-theme="dark"] .toll-dialog .chip:hover,
[data-theme="dark"] .toll-dialog .area-tag:hover,
[data-theme="dark"] .toll-dialog .preview-btn:hover,
[data-theme="dark"] .toll-dialog .nudge:hover,
[data-theme="dark"] .toll-dialog .footer-btn:hover,
[data-theme="dark"] .toll-dialog .icon-button:hover:not(:disabled){
  background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.06));
  border-color:rgba(255,255,255,.28);
}
[data-theme="dark"] .toll-dialog .chip.active{
  color:#f5f5f5;
  border-color:rgba(255,255,255,.32);
  background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(255,255,255,.075));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.26),inset 0 0 0 1px rgba(255,255,255,.04),0 3px 12px rgba(0,0,0,.24);
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
.toll-dialog .footer-btn.primary{
  color:var(--toll-ink);
  border:1px solid rgba(255,255,255,.85);
  background:linear-gradient(145deg,rgba(255,255,255,.54),rgba(220,222,228,.24));
  backdrop-filter:blur(16px) saturate(150%);
  -webkit-backdrop-filter:blur(16px) saturate(150%);
  padding-inline:22px;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.92),inset 0 -1px 0 rgba(255,255,255,.24),0 4px 14px rgba(0,0,0,.065);
}
.toll-dialog .footer-btn.primary:hover{
  background:linear-gradient(145deg,rgba(255,255,255,.68),rgba(230,232,238,.34));
  border-color:rgba(255,255,255,.96);
}
[data-theme="dark"] .toll-dialog .footer-btn.primary{
  color:var(--toll-button-text);
  border-color:rgba(255,255,255,.62);
  background:linear-gradient(145deg,rgba(240,240,240,.96),rgba(205,205,205,.86));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 6px 18px rgba(0,0,0,.35);
}
[data-theme="dark"] .toll-dialog .footer-btn.primary:hover{
  background:linear-gradient(145deg,rgba(250,250,250,.98),rgba(218,218,218,.90));
  border-color:rgba(255,255,255,.80);
}
@media (max-width:960px){
  .toll-dialog .workspace{grid-template-columns:minmax(250px,39%) minmax(0,1fr)}
  .toll-dialog .alarm-card{grid-template-columns:26px minmax(100px,1fr) auto;gap:8px}
  .toll-dialog .clock-control{grid-column:2;justify-self:start;margin-top:2px}
  .toll-dialog .card-right-actions{grid-column:3;grid-row:1 / span 2}
  .toll-dialog .interval-row{margin-left:12px;flex-wrap:wrap}
  .toll-dialog .interval-copy{width:100%}
  .toll-dialog .interval-actions{width:100%;justify-content:flex-end}
}
@media (max-width:680px){
  #builderModalBackdrop{padding:8px}
  .toll-dialog{width:100%;height:100%;border-radius:20px}
  .toll-dialog .workspace{display:flex;flex-direction:column}
  .toll-dialog .left-pane{flex:0 0 38%;border-right:0;border-bottom:1px solid var(--toll-line);padding:11px 12px 10px}
  .toll-dialog .right-pane{flex:1 1 auto;padding:11px 12px 86px}
  .toll-dialog .dialog-footer{padding:8px 12px;flex-wrap:wrap}
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
  width:286px;
  max-width:calc(100vw - 44px);
}
.bookmark-drawer-card.open{display:flex}
.bookmark-drawer-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.bookmark-drawer-title{font-size:11.5px;font-weight:750;letter-spacing:-.02em;color:var(--ink);opacity:.9}
.bookmark-add-toggle{border:1px solid var(--glass-rim);background:rgba(255,255,255,.22);color:var(--btn);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:700;cursor:pointer}
.bookmark-save-row{display:none;align-items:center;gap:6px}
.bookmark-save-row.open{display:flex}
.bookmark-name-input{flex:1;min-width:0;height:30px;border-radius:999px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.32);color:var(--ink);padding:0 11px;font-size:11.5px;font-weight:600;outline:none}
[data-theme="dark"] .bookmark-name-input{background:rgba(255,255,255,.07)}
.bookmark-save-btn{flex:none;height:30px;padding:0 12px;border-radius:999px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.36);color:var(--ink);font-size:11px;font-weight:750;cursor:pointer}
[data-theme="dark"] .bookmark-save-btn{background:rgba(255,255,255,.14)}
.bookmark-pill-list{display:flex;flex-direction:column;gap:5px;max-height:158px;overflow-y:auto;scrollbar-width:thin}
.bookmark-empty-hint{font-size:11px;color:var(--modal-muted);padding:4px 2px}
.bookmark-pill-item{display:flex;align-items:center;justify-content:space-between;gap:6px;border-radius:999px;border:1px solid var(--glass-rim);background:rgba(255,255,255,.18);padding:3px 5px 3px 11px}
[data-theme="dark"] .bookmark-pill-item{background:rgba(255,255,255,.05)}
.bookmark-pill-apply{flex:1;min-width:0;border:none;background:transparent;color:var(--btn);padding:4px 0;display:flex;align-items:center;justify-content:space-between;gap:6px;text-align:left;cursor:pointer}
.bookmark-pill-name{font-size:11.5px;font-weight:680;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bookmark-pill-count{flex:none;font-size:10px;font-weight:650;opacity:.65;font-variant-numeric:tabular-nums}
.bookmark-pill-del{flex:none;width:22px;height:22px;border-radius:50%;border:none;background:rgba(0,0,0,.06);color:var(--btn);font-size:12px;font-weight:700;cursor:pointer}
[data-theme="dark"] .bookmark-pill-del{background:rgba(255,255,255,.08)}

/* ---------- Boot Readiness Gate (Zero-Flash Reveal) ---------- */
#c,#ui,#topLeftMenu,#topRightMenu,#dock{transition:opacity .24s ease}
html:not(.app-ready) #c,
html:not(.app-ready) #ui,
html:not(.app-ready) #topLeftMenu,
html:not(.app-ready) #topRightMenu,
html:not(.app-ready) #dock,
html:not(.app-ready) #rightTimetablePanel{
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
  border-color:var(--glint);
  box-shadow:var(--btn-shadow-hover),0 0 0 1px var(--glass-rim);
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
  border-radius:24px;
  border:1px solid var(--toll-glass-edge);
  background:var(--toll-glass);
  box-shadow:var(--toll-glass-shadow);
  -webkit-backdrop-filter:blur(42px) saturate(148%);
  backdrop-filter:blur(42px) saturate(148%);
  color:var(--toll-ink);
  word-break:keep-all;
  overflow-wrap:break-word;
  font-family:-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;
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
  background:linear-gradient(145deg,rgba(255,255,255,.30),transparent 32%,rgba(255,255,255,.06));
  opacity:.72;
}
[data-theme="dark"] #rightTimetablePanel::before{
  background:linear-gradient(145deg,rgba(255,255,255,.08),transparent 34%,rgba(255,255,255,.02));
}
#rightTimetablePanel > *{position:relative;z-index:1}
.rt-head{
  flex:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:13px 16px 11px;
  border-bottom:1px solid var(--toll-line);
  background:rgba(255,255,255,.12);
}
[data-theme="dark"] .rt-head{background:rgba(255,255,255,.03)}
.rt-head-title-group{display:flex;align-items:baseline;gap:8px;min-width:0}
.rt-title{margin:0;font-size:14px;font-weight:800;letter-spacing:-.03em;color:var(--toll-ink);white-space:nowrap}
.rt-count-meta{font-size:11px;font-weight:600;color:var(--toll-muted);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-head-actions{display:flex;align-items:center;gap:6px;flex:none}
.rt-arrow-btn{
  width:28px;height:28px;border-radius:50%;
  border:1px solid var(--toll-glass-edge);
  background:var(--toll-pill);
  color:var(--toll-ink);
  display:inline-flex;align-items:center;justify-content:center;
  cursor:pointer;
  transition:background .16s ease,transform .2s var(--ease),border-color .16s ease;
}
.rt-arrow-btn:hover{background:var(--toll-pill-hover)}
.rt-arrow-btn:active{transform:scale(.92)}
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
  background:rgba(255,255,255,.07);
  display:flex;flex-direction:column;gap:8px;
}
[data-theme="dark"] .rt-options-bar{background:rgba(255,255,255,.02)}
@keyframes rtMetaFade{from{opacity:0;transform:translate3d(0,3px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
.rt-count-meta.is-animating{animation:rtMetaFade .24s cubic-bezier(.22,1,.36,1)}
.rt-mode-seg{
  position:relative;display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:3px;
  border-radius:14px;border:1px solid var(--toll-line);background:var(--toll-glass-soft);
}
.rt-mode-glider{
  position:absolute;top:3px;bottom:3px;left:3px;width:calc(50% - 5.5px);
  border-radius:11px;border:1px solid var(--toll-glass-edge);background:var(--toll-pill-hover);
  box-shadow:0 2px 8px rgba(0,0,0,.06);pointer-events:none;z-index:0;
  transform:translate3d(0,0,0);
  transition:transform .34s cubic-bezier(.22,1,.36,1),background .2s ease,border-color .2s ease;
}
.rt-mode-seg.is-selected-tab .rt-mode-glider{transform:translate3d(calc(100% + 5px),0,0)}
[data-theme="dark"] .rt-mode-glider{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.22)}
.rt-mode-btn{
  position:relative;z-index:1;border:1px solid transparent;background:transparent;color:var(--toll-ink-2);
  border-radius:11px;padding:7px 8px;font-size:11.5px;font-weight:700;letter-spacing:-.02em;
  cursor:pointer;line-height:1.25;text-align:center;white-space:nowrap;
  transition:color .22s ease,transform .14s ease;
}
.rt-mode-btn:active{transform:scale(.98)}
.rt-mode-btn.active{color:var(--toll-ink)}
[data-theme="dark"] .rt-mode-btn.active{color:#f4f4f6}
.rt-sub-actions{display:flex;align-items:center;justify-content:space-between;gap:8px}
.rt-sub-hint{font-size:10.5px;color:var(--toll-muted);letter-spacing:-.02em}
.rt-edit-seq-btn{
  flex:none;border:1px solid var(--toll-glass-edge);background:var(--toll-pill);color:var(--toll-ink);
  border-radius:999px;padding:4px 10px;font-size:10.5px;font-weight:700;letter-spacing:-.015em;
  cursor:pointer;white-space:nowrap;transition:background .16s ease,transform .14s ease;
}
.rt-edit-seq-btn:hover{background:var(--toll-pill-hover)}
.rt-edit-seq-btn:active{transform:scale(.96)}
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
  width:100%;text-align:left;
  border:1px solid rgba(255,255,255,.56);
  background:linear-gradient(135deg,rgba(255,255,255,.38),rgba(255,255,255,.14));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.72),0 2px 8px rgba(0,0,0,.025);
  border-radius:15px;padding:9px 12px;min-height:50px;
  display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;
  cursor:pointer;color:var(--toll-ink);
  transition:background .16s ease,border-color .16s ease,transform .14s ease,box-shadow .16s ease;
}
.rt-item-btn:hover{background:linear-gradient(135deg,rgba(255,255,255,.56),rgba(255,255,255,.24));border-color:rgba(255,255,255,.88)}
.rt-item-btn:active{transform:scale(.988)}
.rt-item-btn.is-current{
  border-color:rgba(45,45,48,.42);
  background:linear-gradient(135deg,rgba(50,50,54,.14),rgba(255,255,255,.34));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 3px 12px rgba(0,0,0,.055);
}
[data-theme="dark"] .rt-item-btn{
  border-color:rgba(255,255,255,.11);
  background:linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 3px 10px rgba(0,0,0,.14);
}
[data-theme="dark"] .rt-item-btn:hover{background:linear-gradient(135deg,rgba(255,255,255,.125),rgba(255,255,255,.045));border-color:rgba(255,255,255,.22)}
[data-theme="dark"] .rt-item-btn.is-current{
  border-color:rgba(255,255,255,.38);
  background:linear-gradient(135deg,rgba(255,255,255,.18),rgba(255,255,255,.07));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 4px 14px rgba(0,0,0,.24);
}
.rt-item-idx{
  min-width:26px;height:26px;padding:0 5px;border-radius:9px;
  display:inline-flex;align-items:center;justify-content:center;
  font-size:10px;font-weight:800;font-variant-numeric:tabular-nums;
  color:var(--toll-ink-2);background:var(--toll-glass-inner);border:1px solid var(--toll-line);
}
.rt-item-btn.is-current .rt-item-idx{background:var(--toll-button);color:#fff;border-color:transparent}
[data-theme="dark"] .rt-item-btn.is-current .rt-item-idx{background:#f2f2f4;color:#18181a}
.rt-item-main{min-width:0;display:flex;flex-direction:column;gap:2px}
.rt-item-title{font-size:12px;font-weight:750;letter-spacing:-.025em;color:var(--toll-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-item-sub{font-size:10px;color:var(--toll-muted);letter-spacing:-.015em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rt-item-time{flex:none;text-align:right;font-size:11px;font-weight:750;font-variant-numeric:tabular-nums;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--toll-ink-2)}
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
.run-aux-btn{position:absolute;width:40px;height:40px;padding:0;border-radius:50%;border:1px solid var(--glass-rim);background:var(--glass-fill);box-shadow:var(--btn-shadow);-webkit-backdrop-filter:blur(14px) saturate(150%);backdrop-filter:blur(14px) saturate(150%);color:var(--ink);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;opacity:0;visibility:hidden;pointer-events:none;z-index:15;transition:opacity .24s var(--ease),transform .26s var(--spring),visibility .24s,background .16s ease,border-color .16s ease}
.run-aux-btn.pos-left{right:calc(100% + 12px);top:50%;transform:translateY(-50%) scale(.9)}
.run-aux-btn.pos-right{left:calc(100% + 12px);top:50%;transform:translateY(-50%) scale(.9)}
.run-aux-btn.pos-top-center{left:50%;bottom:calc(100% + 10px);transform:translateX(-50%) scale(.9)}
#runTouchZone.is-revealed .run-aux-btn{opacity:1;visibility:visible;pointer-events:auto}
#runTouchZone.is-revealed .run-aux-btn.pos-left{transform:translateY(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-right{transform:translateY(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-top-center{transform:translateX(-50%) scale(1)}
#runTouchZone.is-revealed .run-aux-btn.pos-left:hover:not(:disabled){transform:translateY(-50%) scale(1.06);background:rgba(255,255,255,.42)}
#runTouchZone.is-revealed .run-aux-btn.pos-right:hover:not(:disabled){transform:translateY(-50%) scale(1.06);background:rgba(255,255,255,.42)}
#runTouchZone.is-revealed .run-aux-btn.pos-top-center:hover:not(:disabled){transform:translateX(-50%) scale(1.06);background:rgba(255,255,255,.42)}
[data-theme="dark"] #runTouchZone.is-revealed .run-aux-btn:hover:not(:disabled){background:rgba(255,255,255,.16)}
#runTouchZone.is-revealed .run-aux-btn:disabled{opacity:.36;cursor:not-allowed}
.dock-status-badges{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 74px);transform:translate3d(calc(-50% + var(--tt-shift-x,0px)),var(--dock-shift-y,0px),0);z-index:23;display:flex;align-items:center;gap:6px;pointer-events:auto;transition:transform .52s cubic-bezier(.22,1,.36,1)}
.status-pill-badge{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 10px;border-radius:999px;background:var(--toll-pill);border:1px solid var(--toll-glass-edge);color:var(--toll-ink);font-size:11px;font-weight:700;backdrop-filter:blur(12px)}
.status-pill-badge button{appearance:none;border:none;background:transparent;color:inherit;font-size:11px;font-weight:800;cursor:pointer;padding:0 2px;text-decoration:underline}
.drawer-card-panel{width:280px;max-width:calc(100vw - 44px);padding:10px 12px;border-radius:16px;background:var(--modal-bg);border:1px solid var(--modal-border);backdrop-filter:blur(18px);display:flex;flex-direction:column;gap:8px}
.drawer-card-title{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:10.5px;font-weight:700;color:var(--toll-muted)}
.ui-option-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 2px;font-size:11.5px;font-weight:600;color:var(--toll-ink);cursor:pointer}
.ui-option-toggle-row .ui-opt-text{display:flex;flex-direction:column;gap:2px;min-width:0}
.ui-option-toggle-row .ui-opt-sub{font-size:10px;font-weight:500;opacity:.68;line-height:1.3;white-space:normal}
.ui-option-toggle-row input[type="checkbox"]{width:16px;height:16px;accent-color:var(--toll-button);cursor:pointer;flex-shrink:0}
.vol-control-row{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:11.5px;font-weight:700;color:var(--toll-ink)}
.vol-slider-wrap{display:flex;align-items:center;gap:6px;flex:1;justify-content:flex-end}
.vol-slider-wrap input[type="range"]{width:100px;accent-color:var(--toll-button)}
.vol-pct{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;min-width:34px;text-align:right;color:var(--toll-muted)}
.sched-control-row{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.sched-time-input{height:28px;padding:0 8px;border-radius:8px;border:1px solid var(--toll-glass-edge-low);background:var(--toll-pill);color:var(--toll-ink);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;font-weight:600}
[data-theme="dark"] .sched-time-input{color-scheme:dark}
.bookmark-pill-item-col{display:flex;flex-direction:column;gap:4px;padding:6px 8px;border-radius:10px;background:var(--toll-glass-soft);border:1px solid var(--toll-line)}
.bookmark-pill-top{display:flex;align-items:center;justify-content:space-between;gap:6px}
.bookmark-pill-name-text{font-size:12px;font-weight:700;color:var(--toll-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bookmark-pill-actions{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.bm-act-btn{appearance:none;border:1px solid var(--toll-glass-edge-low);background:var(--toll-pill);color:var(--toll-ink);border-radius:999px;height:22px;padding:0 8px;font-size:10.5px;font-weight:700;cursor:pointer}
.bm-act-btn:hover{background:var(--toll-pill-hover)}
.bm-act-btn.primary{background:var(--toll-button);border-color:var(--toll-button);color:#fff}
[data-theme="dark"] .bm-act-btn.primary{color:var(--toll-button-text);border-color:rgba(255,255,255,.62);background:linear-gradient(145deg,rgba(240,240,240,.96),rgba(205,205,205,.86))}
.bm-act-btn.danger:hover{color:#e03131;border-color:rgba(224,49,49,.4)}
.bm-undo-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 8px;border-radius:8px;background:var(--toll-warn-bg);border:1px solid var(--toll-warn-line);font-size:11px;font-weight:700;color:var(--toll-warn)}
.bm-undo-bar button{appearance:none;border:none;background:var(--toll-button);color:var(--toll-button-text);border-radius:999px;padding:2px 8px;font-size:10.5px;font-weight:700;cursor:pointer}
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
    <div id="startLab">START - TIME<br>08:35 A.M.</div>
    <div id="centerStat">
      <div id="remainDigits">05:00</div>
      <div id="stageBadge">1교시 · 준비령 대기</div>
    </div>
    <div id="endLab">END - TIME<br>08:40 A.M.</div>
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
            <button id="drawerBookmarkToggleBtn" type="button" class="bookmark-add-toggle">+ 현재 구성 저장</button>
          </div>
          <div id="drawerBookmarkSaveRow" class="bookmark-save-row">
            <input id="drawerBookmarkInput" type="text" class="bookmark-name-input" maxlength="28" placeholder="구성 이름 (비우면 자동)">
            <button id="drawerBookmarkConfirmBtn" type="button" class="bookmark-save-btn">저장</button>
          </div>
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
        <div class="pill-group-row" role="group" aria-label="시계 바늘 연동 방식">
          <button type="button" class="sync-chip active" data-sync-mode="original_csat_time">원래 수능 시각 맞춤 (기본)</button>
          <button type="button" class="sync-chip" data-sync-mode="custom_cascaded_time">구성 계산 시각 연동</button>
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
              <span class="ui-opt-sub">종료 10분~1분 전 +5%, 1분~10초 전 +20%, 10초~0초 연속 강화 후 타종 시 완화</span>
            </span>
            <input id="mainBellGlowToggle" type="checkbox" checked>
          </label>
          <label class="ui-option-toggle-row">
            <span class="ui-opt-text">
              <span>준비령 종료 전 블러 애니메이션</span>
              <span class="ui-opt-sub">본령 시작 1분~10초 전 +5%, 10초~0초 +20% 연속 강화 후 타종 시 완화</span>
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

<!-- 전용 창 1: 체크박스 기반 영역·타종 선택 및 시간 간격/시각 편집기 (Liquid Glass Modal) -->
<div id="builderModalBackdrop" class="toll-scrim">
  <main class="toll-dialog" role="dialog" aria-modal="true" aria-labelledby="builderModalTitle">
    <header class="dialog-header">
      <div class="dialog-heading">
        <h1 id="builderModalTitle">영역별 타종 체크박스 선택 및 시간 간격 · 시각 설정</h1>
        <p>원하는 영역과 타종(준비령·본령·종료령 전·종료령 등)을 체크박스로 선택하고, 각 타종 사이의 대기 간격(분)과 시각을 자유롭게 설정하세요.</p>
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

    <section class="quickbar" aria-label="빠른 구성 도구">
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
            <span>탐구</span>
            <select id="subjInqCountSel" class="builder-select-sm" aria-label="탐구 선택 과목 수">
              <option value="2">2과목 (제1·2선택)</option>
              <option value="1">1과목 (제1선택만)</option>
              <option value="0">미응시</option>
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
          <button id="subjAutoApplyBtn" type="button" class="chip">조합 자동 구성</button>
        </div>
      </div>
      <div class="quick-line">
        <span class="quick-label">자주 쓰는 구성</span>
        <div id="modalBookmarkList" style="display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap"></div>
        <div class="bookmark-modal-save-group">
          <input id="modalBookmarkInput" type="text" class="bookmark-modal-input" maxlength="28" placeholder="현재 구성을 저장할 이름">
          <button id="modalBookmarkSaveBtn" type="button" class="chip">현재 구성 저장</button>
        </div>
      </div>
      <div class="quick-line">
        <span class="quick-label">시계 바늘 연동</span>
        <button type="button" class="chip sync-mode-btn active" data-sync-mode="original_csat_time">원래 수능 시각 맞춤 + 대기만 설정 간격 적용 (기본)</button>
        <button type="button" class="chip sync-mode-btn" data-sync-mode="custom_cascaded_time">간격 연쇄 계산 시각으로 바늘 연동</button>
      </div>
    </section>

    <section class="workspace" aria-label="타종 선택 및 간격 편집">
      <aside id="builderLeftPane" class="left-pane"></aside>
      <section id="builderRightPane" class="right-pane"></section>
    </section>

    <footer class="dialog-footer">
      <div id="builderSummaryText" class="summary"></div>
      <div class="footer-actions">
        <button id="builderCancelBtn" type="button" class="footer-btn">취소</button>
        <button id="builderApplyBtn" type="button" class="footer-btn primary">선택 구성 저장</button>
      </div>
    </footer>
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
        builderApplyBtn=document.getElementById('builderApplyBtn'),
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

  const gl=cv.getContext('webgl',{antialias:false,alpha:false});

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
  if(gl){
    const mk=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
    const pr=gl.createProgram();
    gl.attachShader(pr,mk(gl.VERTEX_SHADER,VS));gl.attachShader(pr,mk(gl.FRAGMENT_SHADER,FS));
    gl.linkProgram(pr);gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    ['uRes','uC','uR','uH','uB','uS'].forEach(k=>U[k]=gl.getUniformLocation(pr,k));
  }

  let H=0,kT=0,kH=0,kX=0,dH=1,dT=1,dHnd=1,dX=1,phase='idle',t0=0,isPaused=false;
  let themePref='auto';
  let resolvedTheme='light';
  let themeUB=1.0,themeUS=0.0,fromUB=1.0,fromUS=0.0,targetUB=1.0,targetUS=0.0,themeAnimStart=0,themeRafId=0;
  let clockSyncMode='original_csat_time';
  let customSequenceConfig = JSON.parse(JSON.stringify(EMBEDDED.defaultCustomSeqConfig));
  let draftSequenceConfig = JSON.parse(JSON.stringify(EMBEDDED.defaultCustomSeqConfig));
  let undoStack = [];
  let redoStack = [];
  let bookmarks = JSON.parse(JSON.stringify(EMBEDDED.defaultBookmarks || []));
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
  function validateBookmarks(rawList){
    if(!Array.isArray(rawList)) return [];
    const out = [];
    rawList.forEach((item, idx)=>{
      if(!item || typeof item!=='object') return;
      const v = validateConfig(item.config);
      const name = typeof item.name==='string' && item.name.trim() ? item.name.trim().slice(0,40) : ('저장 구성 '+(idx+1));
      out.push({
        id: typeof item.id==='string' && item.id ? item.id : ('bm_'+Date.now()+'_'+idx),
        name,
        config: v.config,
        clockSyncMode: item.clockSyncMode==='custom_cascaded_time' ? 'custom_cascaded_time' : 'original_csat_time',
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

  hamburgerBtn.addEventListener('click', ()=>{
    const isOpen = pillDrawer.classList.contains('open');
    setLeftMenuOpen(!isOpen);
    applyMenuCategoryState(null);
  });

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

  function applyClockSyncMode(mode, skipSave){
    clockSyncMode = (mode==='custom_cascaded_time') ? 'custom_cascaded_time' : 'original_csat_time';
    document.querySelectorAll('.sync-chip, .sync-mode-btn').forEach(el=>{
      el.classList.toggle('active', el.getAttribute('data-sync-mode')===clockSyncMode);
    });
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

  document.querySelectorAll('.sync-chip, .sync-mode-btn').forEach(btnEl=>{
    btnEl.addEventListener('click', ()=>{
      applyClockSyncMode(btnEl.getAttribute('data-sync-mode'), false);
      showToast(
        clockSyncMode==='original_csat_time'
          ? '시계 바늘 연동: 각 타종의 원래 수능 시각 기준 (대기 시간만 설정 간격 적용)'
          : '시계 바늘 연동: 설정 간격으로 자동 연쇄 계산된 시각 기준',
        2800
      );
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
      if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
      bellPlayer.volume = bellVolume;
      previewPlayer.volume = bellVolume;
      saveCustomSettings();
    });
  }
  if(engVolSlider){
    engVolSlider.addEventListener('input', ()=>{
      englishVolume = clamp(Number(engVolSlider.value)||0,0,1);
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
        timeRangeText: format24hTime(only.node.originalMinutes)+' ('+only.intervalAfterMinutes+'분)',
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
        const scale = (1 + boost * 0.28).toFixed(4);
        const sat = Math.max(0.68, 1 + boost * 1.45).toFixed(3);
        const bri = Math.max(0.84, 1 + boost * 0.36).toFixed(3);
        clockGlowBoostGroup.style.transform = 'scale('+scale+')';
        clockGlowBoostGroup.style.filter = 'saturate('+sat+') brightness('+bri+')';
      }
    }
    if(face){
      const stops = face.querySelectorAll('stop[data-base-op]');
      const opMul = Math.max(0.4, 1 + boost * 1.55);
      stops.forEach(stEl=>{
        const baseOp = parseFloat(stEl.getAttribute('data-base-op') || '0');
        const nextOp = clamp(baseOp * opMul, 0, 0.96);
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
      ? (clockSyncMode==='original_csat_time' ? firstStep.originalStartMinutes : firstStep.customStartMinutes)
      : currentPreset.startMinutes;
    const dispEndMin = isCustomSeq
      ? (clockSyncMode==='original_csat_time' ? firstStep.originalEndMinutes : firstStep.customEndMinutes)
      : currentPreset.endMinutes;
    const idleRemainMs = isCustomSeq
      ? (firstStep.durationMinutes * 60 * 1000)
      : ((currentPreset.endMinutes-currentPreset.startMinutes)*60*1000);

    title.textContent=currentPreset.displayTitle;
    document.title='대학수학능력시험 안내방송';
    startLab.innerHTML='START - TIME<br>'+formatAmPm(dispStartMin);
    startLab.style.opacity='1';
    endLab.innerHTML='END - TIME<br>'+formatAmPm(dispEndMin);
    endLab.style.opacity='0.38';
    remainDigits.textContent=formatDurationClock(idleRemainMs);
    stageBadge.textContent=(firstStep.periodLabel!=='-'?firstStep.periodLabel+' · ':'')+firstStep.category+' 대기';
    activeRowId=firstStep.id;
    if(isCustomSeq && firstStep.id && firstStep.id.indexOf('custom_seq_')===0){
      const rest=firstStep.id.replace(/^custom_seq_\\d+_/, '');
      const cueList = EMBEDDED.selectableCueNodes || EMBEDDED.cueNodes || [];
      const matchedNode=cueList.find(n=>rest===n.nodeId || rest.indexOf(n.nodeId+'_')===0);
      activeCustomNodeId=matchedNode ? matchedNode.nodeId : null;
    }else{
      activeCustomNodeId=null;
    }
    glowReleaseStartPerf = 0;
    glowReleaseFromBoost = 0;
    applyClockGlowBoost(0);
    updateClockHandsForMinutes(dispStartMin);
    renderTimetableRows(firstStep.id);
    if(typeof renderRightTimetableList==='function')renderRightTimetableList();
    if(builderBtnLabel){
      builderBtnLabel.textContent = '영역 · 타종 선택 구성 (' + (customSequenceConfig.selectedNodeIds ? customSequenceConfig.selectedNodeIds.length : 0) + '개 선택)';
    }
    updateMuteStatusMeta();
    updateDockAndAuxUI();
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
      remainDigits.textContent=formatDurationClock(dispRemainMs);
      const speedBadge = playbackSpeed>1 ? ' (×'+playbackSpeed+')' : '';
      const statusSuffix=(isPaused?' (일시정지)':' 진행 중')+speedBadge;
      stageBadge.textContent=(activeStep.periodLabel!=='-'?activeStep.periodLabel+' · ':'')+activeStep.category+statusSuffix;

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
          }else{
            break;
          }
        }
      }
      const mainRemainSec = (currentPreset.steps.length>1 || currentPreset.isCustomSequence)
        ? Math.max(0, (examEndMinutes - simMinutes) * 60)
        : remainSec;

      if(isPrepareStage && prelimBellGlowAnim){
        if(remainSec <= 60 && remainSec > 10){
          const p = clamp((60 - remainSec) / 50, 0, 1);
          targetStageGlowBoost = 0.05 * p;
        }else if(remainSec <= 10 && remainSec > 0){
          const p = clamp((10 - remainSec) / 10, 0, 1);
          targetStageGlowBoost = 0.05 + (0.20 - 0.05) * p;
        }
      }else if(isMainExamStage && mainBellGlowAnim){
        if(mainRemainSec <= 600 && mainRemainSec > 60){
          const p = clamp((600 - mainRemainSec) / 540, 0, 1);
          targetStageGlowBoost = 0.05 * p;
        }else if(mainRemainSec <= 60 && mainRemainSec > 10){
          const p = clamp((60 - mainRemainSec) / 50, 0, 1);
          targetStageGlowBoost = 0.05 + (0.20 - 0.05) * p;
        }else if(mainRemainSec <= 10 && mainRemainSec > 0){
          const p = clamp((10 - mainRemainSec) / 10, 0, 1);
          targetStageGlowBoost = 0.20 + (0.45 - 0.20) * p;
        }
      }

      const stepSpanMin=Math.max(0.0001,activeStep.endMinutes-activeStep.startMinutes);
      const stageElapsedMin=clamp(simMinutes-activeStep.startMinutes,0,stepSpanMin);
      const stepProgress=clamp(stageElapsedMin/stepSpanMin,0,1);
      const emphasisShift=sm(0.35,0.65,stepProgress);
      const startOpacity=1-emphasisShift*(1-0.38);
      const endOpacity=0.38+emphasisShift*(1-0.38);

      let dispStartMin=activeStep.startMinutes;
      let dispEndMin=activeStep.endMinutes;
      if(currentPreset.isCustomSequence){
        if(clockSyncMode==='original_csat_time'){
          dispStartMin=activeStep.originalStartMinutes;
          dispEndMin=activeStep.originalEndMinutes;
          clockHandMinutes=(clampedElapsedMs>=totalDurMs)?dispEndMin:(dispStartMin+stageElapsedMin);
        }else{
          dispStartMin=activeStep.customStartMinutes;
          dispEndMin=activeStep.customEndMinutes;
          clockHandMinutes=dispStartMin+stageElapsedMin;
        }
      }
      startLab.innerHTML='START - TIME<br>'+formatAmPm(dispStartMin);
      startLab.style.opacity=startOpacity.toFixed(3);
      endLab.innerHTML='END - TIME<br>'+formatAmPm(dispEndMin);
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
        stageBadge.textContent=currentPreset.displayTitle+' 종료';
      }
    }

    let finalGlowBoost = targetStageGlowBoost;
    if(glowReleaseStartPerf > 0){
      const relElapsed = now - glowReleaseStartPerf;
      const REL_TOTAL = 3400;
      if(relElapsed < REL_TOTAL && targetStageGlowBoost < 0.02){
        if(relElapsed < 1400){
          const p = easeSine(relElapsed / 1400);
          finalGlowBoost = glowReleaseFromBoost + (-0.12 - glowReleaseFromBoost) * p;
        }else{
          const p = easeSine((relElapsed - 1400) / (REL_TOTAL - 1400));
          finalGlowBoost = -0.12 * (1 - p);
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
    runTouchZone.addEventListener('pointerdown', ()=>{
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
      if(!wakeLockVideo.srcObject && isFinite(wakeLockVideo.duration) && wakeLockVideo.duration > 2 && wakeLockVideo.currentTime >= wakeLockVideo.duration - 0.75){
        try{ wakeLockVideo.currentTime = 0.08; }catch(_){}
      }
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
    if(isAndroidUa || wakeLockNativeBlocked || !('wakeLock' in navigator) || document.hidden){
      startWakeLockVideo();
    }
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
    if(isAndroidUa || wakeLockNativeBlocked || !('wakeLock' in navigator)){
      startWakeLockVideo();
    }
    if(!document.hidden){
      requestWakeLock();
    }
  }
  function handleWakeLockGestureRetry(){
    if(!keepScreenAwake) return;
    const needsNative = !document.hidden && (!wakeLockSentinel || Boolean(wakeLockSentinel.released));
    const needsVideo = (isAndroidUa || wakeLockNativeBlocked || !('wakeLock' in navigator)) && Boolean(wakeLockVideo && wakeLockVideo.paused);
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
    const shouldKeepVideo = isAndroidUa || wakeLockNativeBlocked || !('wakeLock' in navigator);
    const isVideoFrozen = shouldKeepVideo && Boolean(wakeLockVideo && !wakeLockVideo.paused && !wakeLockVideo.srcObject && wakeVideoProgressMs > 0 && performance.now() - wakeVideoProgressMs > 5500);
    if(isVideoFrozen && wakeLockVideo){
      try{ wakeLockVideo.currentTime = 0.05; }catch(_){}
      startWakeLockVideo();
    }
    const droppedVideo = shouldKeepVideo && Boolean(wakeLockVideo && wakeLockVideo.paused);
    if(droppedNative || droppedVideo){
      requestWakeLock();
    }
  }, 3000);
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
    requestAnimationFrame(frame);
  }

  function cancel(){
    if(phase!=='rise'&&phase!=='hold')return;
    stopBell();
    stopEnglishAudio();
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

  function openBuilderModalWithDraft(){
    stopPreviewBell();
    draftSequenceConfig = cloneCfg(customSequenceConfig);
    undoStack = [];
    redoStack = [];
    rowAlertMap = {};
    updateUndoRedoBtns();
    renderBuilderModal();
    builderModalBackdrop.classList.add('open');
  }

  function closeBuilderModalDiscardDraft(){
    stopPreviewBell();
    builderModalBackdrop.classList.remove('open');
  }

  if(builderUndoBtn){
    builderUndoBtn.addEventListener('click', ()=>{
      if(!undoStack.length)return;
      redoStack.push(cloneCfg(draftSequenceConfig));
      draftSequenceConfig = undoStack.pop();
      updateUndoRedoBtns();
      renderBuilderModal();
    });
  }
  if(builderRedoBtn){
    builderRedoBtn.addEventListener('click', ()=>{
      if(!redoStack.length)return;
      undoStack.push(cloneCfg(draftSequenceConfig));
      draftSequenceConfig = redoStack.pop();
      updateUndoRedoBtns();
      renderBuilderModal();
    });
  }

  /* ---------- Custom Checkbox Builder Modal Rendering & Events ---------- */
  function renderBuilderModal(){
    const cfg = draftSequenceConfig;
    const selectedIds = cfg.selectedNodeIds || [];
    const mutedIds = cfg.mutedNodeIds || [];
    const analysis = analyzeSequenceConfig(cfg);
    const rows = analysis.rows;

    const stageTypes = [
      ['entry', '입실·예비'],
      ['prep', '준비령'],
      ['main', '본령'],
      ['listening', '듣기'],
      ['warn10', '종료전'],
      ['end', '종료령'],
      ['change', '교체']
    ];

    builderLeftPane.innerHTML = \`
      <div class="pane-title">
        <span>1. 진행할 영역 및 타종 단계 체크박스 선택</span>
        <span class="pane-note">영역별 필요한 타종만 선택</span>
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
          \${stageTypes.map(([k, lbl])=>\`<button type="button" class="stage-type-chip" data-stage-type="\${k}">\${lbl}</button>\`).join('')}
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

    EMBEDDED.subjectGroups.forEach(group=>{
      const allGroupNodes = EMBEDDED.selectableCueNodes.filter(n=>n.subjectGroupId===group.id);
      const filteredNodes = qLower
        ? allGroupNodes.filter(n=>{
            const hay = (n.fullTitle+' '+n.stageShortLabel+' '+(n.bellCode||'')+' '+n.originalTimeText).toLowerCase();
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
            <span class="stage-meta">\${node.bellCode?'['+escapeHtml(node.bellCode)+'] ':'[듣기] '}\${escapeHtml(node.originalTimeText)}</span>
          \`;
          card.appendChild(lbl);
        });
      }
      builderLeftPane.appendChild(card);
    });

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
        <span>2. 선택된 타종 진행 순서 및 시간 간격(분) · 시각(HH:MM) 설정</span>
        <span class="pane-note">간격 수정 시 이후 시각 자동 연쇄 계산 / 시각 직접 수정 시 직전 간격 자동 반영</span>
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
      empty.textContent = '좌측에서 진행할 영역과 타종 단계를 하나 이상 선택해 주세요.';
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
        article.className = 'schedule-item';

        const speakerIconSvg = isMuted
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';

        let html = \`
          <div class="alarm-card">
            <div class="number">\${idx+1}</div>
            <div class="alarm-title-wrap">
              <div class="alarm-name">
                <span>\${escapeHtml(row.node.fullTitle)}</span>
                \${row.dayOffset > 0 ? \`<span class="next-day-badge">+\${row.dayOffset}일</span>\` : ''}
              </div>
              <div class="alarm-sub">원래 수능 시각: \${escapeHtml(row.node.originalTimeText)} · 연쇄 계산 시각: \${format24hTime(row.customTimeMinutes)}\${row.dayOffset > 0 ? ' (+'+row.dayOffset+'일)' : ''} · \${row.node.bellCode?'타종 '+escapeHtml(row.node.bellCode)+' ('+durSec+'초)':'13:07 듣기 음원'}</div>
            </div>
            <label class="clock-control">
              <span>연쇄 시각</span>
              <input type="time" class="time-input" data-time-row="\${idx}" value="\${format24hTime(row.customTimeMinutes)}">
            </label>
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
    builderSummaryText.innerHTML = '선택된 타종: <strong>'+rows.length+'개</strong> · 총 진행 대기 시간: <strong>'+hrText+' ('+totalMin+'분)</strong> · 시계 바늘: <strong>'+(clockSyncMode==='original_csat_time'?'각 타종의 원래 수능 시각 맞춤 (기본)':'간격 연쇄 계산 시각 연동')+'</strong>';
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
      const targetIds = EMBEDDED.selectableCueNodes.filter(n=>n.stageType===st).map(n=>n.nodeId);
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
            if(r.node.stageType==='prep' && r.nextNode && (r.nextNode.stageType==='main'||r.nextNode.stageType==='listening')){
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
    }
  });

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
    const timeInput = e.target.closest('input[data-time-row]');
    if(timeInput){
      const rowIdx = Number(timeInput.getAttribute('data-time-row'));
      const targetMinOfDay = hmToMinutes(timeInput.value);
      const rows = computeSequenceNodeRows(draftSequenceConfig);
      if(rowIdx===0){
        mutateDraftConfig(cfg=>{
          cfg.firstNodeCustomMinutes = targetMinOfDay;
        });
      }else if(rows[rowIdx-1] && rows[rowIdx]){
        const prevRow = rows[rowIdx-1];
        const currRow = rows[rowIdx];
        const key = prevRow.node.nodeId + '__' + currRow.node.nodeId;
        const prevDayBase = Math.floor(prevRow.customTimeMinutes / 1440) * 1440;
        let candidateMin = prevDayBase + targetMinOfDay;
        let diff = candidateMin - prevRow.customTimeMinutes;
        let msg = '';
        if(diff < 1){
          candidateMin += 1440;
          diff = candidateMin - prevRow.customTimeMinutes;
          msg = '직전 단계보다 이른 시각이어서 다음 날(+1일) 시각으로 자동 설정되었습니다.';
        }
        if(diff > 600){
          diff = 600;
          msg = '직전 단계와의 간격이 최대 600분으로 제한되었습니다.';
        }
        mutateDraftConfig(cfg=>{
          if(!cfg.intervalMap) cfg.intervalMap = {};
          if(cfg.intervalSecondsMap) delete cfg.intervalSecondsMap[key];
          cfg.intervalMap[key] = clamp(Math.round(diff), 1, 600);
        });
        if(msg){
          rowAlertMap[key] = msg;
          renderBuilderModal();
        }
      }
    }
  });

  const subjAutoApplyBtn = document.getElementById('subjAutoApplyBtn');
  if(subjAutoApplyBtn){
    subjAutoApplyBtn.addEventListener('click', ()=>{
      const checkedSubjs = Array.from(document.querySelectorAll('.subj-chk:checked')).map(el=>el.value);
      const inqCount = Number((document.getElementById('subjInqCountSel')||{}).value ?? 2);
      const lang2 = Boolean((document.getElementById('subjLang2Chk')||{}).checked);
      const density = (document.getElementById('subjDensitySel')||{}).value || 'core';
      const activeGroups = new Set(checkedSubjs);
      if(inqCount >= 1) activeGroups.add('inq1');
      if(inqCount >= 2) activeGroups.add('inq2');
      if(lang2) activeGroups.add('lang2');
      const ids = EMBEDDED.selectableCueNodes.filter(n=>{
        if(!activeGroups.has(n.subjectGroupId)) return false;
        if(density==='all') return true;
        if(density==='core') return Boolean(n.isCoreExamStage);
        return n.stageType==='main' || n.stageType==='listening' || n.stageType==='warn10' || n.stageType==='end';
      }).map(n=>n.nodeId);
      if(!ids.length){
        showToast('최소 1개 이상의 응시 과목을 선택해 주세요.', 2600);
        return;
      }
      mutateDraftConfig(cfg=>{
        cfg.selectedNodeIds = ids;
        cfg.intervalMap = {};
        cfg.intervalSecondsMap = {};
        cfg.firstNodeCustomMinutes = null;
      });
      showToast('응시 과목 조합('+ids.length+'개 타종)으로 자동 구성되었습니다.', 2400);
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
      mutateDraftConfig(cfg=>{
        cfg.intervalMap = {};
        cfg.intervalSecondsMap = {};
        cfg.firstNodeCustomMinutes = null;
        if(tpl==='all_39'){
          cfg.selectedNodeIds = EMBEDDED.defaultCustomSeqConfig.selectedNodeIds.slice();
        }else if(tpl==='kor_math_inq1_core'){
          cfg.selectedNodeIds = ['004','005','006','007','010','011','012','013','025','026','027','028'];
        }else if(tpl==='kor_core'){
          cfg.selectedNodeIds = ['004','005','006','007'];
        }else if(tpl==='eng_listening_core'){
          cfg.selectedNodeIds = ['016','ENG_1307','017','018'];
        }else if(tpl==='all_core'){
          cfg.selectedNodeIds = EMBEDDED.selectableCueNodes.filter(n=>n.isCoreExamStage).map(n=>n.nodeId);
        }
      });
    });
  });

  /* ---------- 자주 쓰는 타종 구성 (Bookmark) Management (A3 Escape & C4 Actions) ---------- */
  const drawerBookmarkToggleBtn = document.getElementById('drawerBookmarkToggleBtn');
  const drawerBookmarkSaveRow = document.getElementById('drawerBookmarkSaveRow');
  const drawerBookmarkInput = document.getElementById('drawerBookmarkInput');
  const drawerBookmarkConfirmBtn = document.getElementById('drawerBookmarkConfirmBtn');
  const drawerBookmarkList = document.getElementById('drawerBookmarkList');
  const drawerBookmarkUndoBar = document.getElementById('drawerBookmarkUndoBar');
  const drawerBookmarkUndoText = document.getElementById('drawerBookmarkUndoText');
  const drawerBookmarkUndoBtn = document.getElementById('drawerBookmarkUndoBtn');
  const modalBookmarkList = document.getElementById('modalBookmarkList');
  const modalBookmarkInput = document.getElementById('modalBookmarkInput');
  const modalBookmarkSaveBtn = document.getElementById('modalBookmarkSaveBtn');

  function renderBookmarks(){
    if(drawerBookmarkOpenLabel){
      drawerBookmarkOpenLabel.textContent = bookmarks.length > 0 ? ('자주 쓰는 타종 구성 ('+bookmarks.length+')') : '자주 쓰는 타종 구성';
    }
    if(drawerBookmarkUndoBar){
      drawerBookmarkUndoBar.style.display = deletedBookmarkUndo ? 'flex' : 'none';
      if(deletedBookmarkUndo && drawerBookmarkUndoText){
        drawerBookmarkUndoText.textContent = "'" + deletedBookmarkUndo.name + "' 삭제됨";
      }
    }
    if(drawerBookmarkList){
      drawerBookmarkList.innerHTML = '';
      if(!bookmarks.length){
        const empty = document.createElement('div');
        empty.className = 'bookmark-empty-hint';
        empty.textContent = '저장된 구성이 없습니다.';
        drawerBookmarkList.appendChild(empty);
      }else{
        bookmarks.forEach(bm=>{
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
          }else{
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
                <button type="button" class="bm-act-btn danger" data-bm-del="\${safeId}" aria-label="저장 구성 삭제">삭제</button>
              </div>
            \`;
          }
          drawerBookmarkList.appendChild(item);
        });
      }
    }
    if(modalBookmarkList){
      modalBookmarkList.innerHTML = '';
      if(!bookmarks.length){
        const empty = document.createElement('span');
        empty.className = 'pane-note';
        empty.textContent = '저장된 구성이 없습니다.';
        modalBookmarkList.appendChild(empty);
      }else{
        bookmarks.forEach(bm=>{
          const chip = document.createElement('div');
          chip.className = 'bookmark-modal-chip';
          const count = (bm.config && Array.isArray(bm.config.selectedNodeIds)) ? bm.config.selectedNodeIds.length : 0;
          const safeName = escapeHtml(bm.name);
          const safeId = escapeHtml(bm.id);
          chip.innerHTML = \`
            <button type="button" class="bookmark-modal-apply" data-bm-load-draft="\${safeId}" title="편집기에 불러오기">\${safeName} (\${count}개)</button>
            <button type="button" class="bookmark-modal-del" data-bm-del="\${safeId}" aria-label="저장 구성 삭제">×</button>
          \`;
          modalBookmarkList.appendChild(chip);
        });
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
    const newBm = {
      id: 'bm_' + Date.now() + '_' + Math.random().toString(36).slice(2,6),
      name: finalName,
      config: cloneCfg(targetCfg),
      clockSyncMode,
      createdAt: new Date().toISOString()
    };
    bookmarks.unshift(newBm);
    if(drawerBookmarkInput) drawerBookmarkInput.value = '';
    if(modalBookmarkInput) modalBookmarkInput.value = '';
    if(drawerBookmarkSaveRow) drawerBookmarkSaveRow.classList.remove('open');
    if(drawerBookmarkToggleBtn) drawerBookmarkToggleBtn.textContent = '+ 현재 구성 저장';
    renderBookmarks();
    saveCustomSettings();
    showToast("'" + finalName + "' 구성이 자주 쓰는 타종 구성에 저장되었습니다.");
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
      mutateDraftConfig(cfg=>{
        const cloned = cloneCfg(bm.config);
        cfg.selectedNodeIds = cloned.selectedNodeIds;
        cfg.intervalMap = cloned.intervalMap;
        cfg.intervalSecondsMap = cloned.intervalSecondsMap;
        cfg.firstNodeCustomMinutes = cloned.firstNodeCustomMinutes;
        cfg.mutedNodeIds = cloned.mutedNodeIds;
      });
      if(bm.clockSyncMode) applyClockSyncMode(bm.clockSyncMode, true);
      showToast("'" + bm.name + "' 구성을 편집기에 불러왔습니다. [적용]을 누르면 반영됩니다.");
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
  if(drawerBookmarkToggleBtn && drawerBookmarkSaveRow){
    drawerBookmarkToggleBtn.addEventListener('click', ()=>{
      const isOpen = drawerBookmarkSaveRow.classList.toggle('open');
      drawerBookmarkToggleBtn.textContent = isOpen ? '닫기' : '+ 현재 구성 저장';
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
      const loadBtn = e.target.closest('button[data-bm-load-draft]');
      if(loadBtn){ applyBookmarkById(loadBtn.getAttribute('data-bm-load-draft'), false); return; }
      const delBtn = e.target.closest('button[data-bm-del]');
      if(delBtn){ deleteBookmarkById(delBtn.getAttribute('data-bm-del')); }
    });
  }

  openBuilderBtn.addEventListener('click', openBuilderModalWithDraft);
  builderCloseBtn.addEventListener('click', closeBuilderModalDiscardDraft);
  builderCancelBtn.addEventListener('click', closeBuilderModalDiscardDraft);
  builderModalBackdrop.addEventListener('click',e=>{
    if(e.target===builderModalBackdrop) closeBuilderModalDiscardDraft();
  });
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
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

  builderApplyBtn.addEventListener('click',()=>{
    if(phase!=='idle'){
      showToast('타이머 실행 중에는 적용할 수 없습니다. CANCEL 후 적용해 주세요.', 3200);
      return;
    }
    const built = buildCustomSequencePreset(draftSequenceConfig);
    if(!built){
      showToast('최소 1개 이상의 타종 항목을 체크박스로 선택해 주세요.', 3000);
      return;
    }
    stopPreviewBell();
    customSequenceConfig = cloneCfg(draftSequenceConfig);
    customBuiltPreset = built;
    currentPreset = built;
    isTemporaryStartPoint = false;
    syncUiToPresetIdle();
    saveCustomSettings();
    builderModalBackdrop.classList.remove('open');
    showToast(built.label + ' 구성이 타이머에 적용되었습니다.', 3200);
  });

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
        applyClockSyncMode('original_csat_time', true);
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
      if(parsed.clockSyncMode && ['original_csat_time','custom_cascaded_time'].includes(parsed.clockSyncMode)){
        applyClockSyncMode(parsed.clockSyncMode, true);
      }
      if(typeof parsed.bellVolume==='number' && isFinite(parsed.bellVolume)){
        bellVolume = clamp(parsed.bellVolume,0,1);
        if(bellVolSlider) bellVolSlider.value = String(bellVolume);
        if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
        bellPlayer.volume = bellVolume;
        previewPlayer.volume = bellVolume;
      }
      if(typeof parsed.englishVolume==='number' && isFinite(parsed.englishVolume)){
        englishVolume = clamp(parsed.englishVolume,0,1);
        if(engVolSlider) engVolSlider.value = String(englishVolume);
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
      if(Array.isArray(parsed.bookmarks)){
        const legacySeedIds = new Set(['bm_kor_math_inq1','bm_eng_listening','bm_kor_single']);
        const filtered = parsed.bookmarks.filter(b=>b && !legacySeedIds.has(b.id));
        bookmarks = validateBookmarks(filtered);
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
        if(data.clockSyncMode && ['original_csat_time','custom_cascaded_time'].includes(data.clockSyncMode)){
          applyClockSyncMode(data.clockSyncMode, true);
        }
        if(typeof data.bellVolume==='number' && isFinite(data.bellVolume)){
          bellVolume = clamp(data.bellVolume,0,1);
          if(bellVolSlider) bellVolSlider.value = String(bellVolume);
          if(bellVolPct) bellVolPct.textContent = Math.round(bellVolume*100)+'%';
          bellPlayer.volume = bellVolume;
          previewPlayer.volume = bellVolume;
        }
        if(typeof data.englishVolume==='number' && isFinite(data.englishVolume)){
          englishVolume = clamp(data.englishVolume,0,1);
          if(engVolSlider) engVolSlider.value = String(englishVolume);
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
          renderBuilderModal();
        }
        if(Array.isArray(data.bookmarks)){
          bookmarks = validateBookmarks(data.bookmarks);
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
        : ('선택 ' + seqRows.length + '단계 (' + (clockSyncMode==='original_csat_time' ? '원래 수능 시각' : '구성 계산 시각') + ')');
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
        const isCurrent = activeCustomNodeId !== null && row.node.nodeId === activeCustomNodeId;
        const expKey = 'sel_'+row.node.nodeId+'_'+idx;
        const isExpanded = expandedRtKey === expKey;
        const isInfoOpen = expandedRtInfoKey === expKey;
        const dispTime = clockSyncMode==='original_csat_time'
          ? row.node.originalTimeText
          : (format24hTime(row.customTimeMinutes) + (row.dayOffset > 0 ? (' (+'+row.dayOffset+'일)') : ''));
        const waitUnit = row.intervalAfterSeconds % 60 !== 0
          ? (row.intervalAfterSeconds + '초')
          : (row.intervalAfterMinutes + '분');
        const subDetail = row.nextNode
          ? ('다음까지 ' + waitUnit + ' 대기 · ' + (clockSyncMode==='original_csat_time' ? ('구성 시각 ' + format24hTime(row.customTimeMinutes)) : ('원래 ' + row.node.originalTimeText)))
          : ('마지막 단계 (' + waitUnit + ') · ' + (clockSyncMode==='original_csat_time' ? ('구성 시각 ' + format24hTime(row.customTimeMinutes)) : ('원래 ' + row.node.originalTimeText)));
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
    const labW = Math.min(W - 24, Math.max(2.22*R, 300));
    const minLabFont = R < 130 ? 9.5 : 11;
    lab.style.cssText = \`left:\${cx - labW/2}px;top:\${cy + R*1.18}px;width:\${labW}px;font-size:\${clamp(R*.085, minLabFont, 17)}px\`;
    const minDigitFont = R < 130 ? 13 : 15;
    remainDigits.style.fontSize = clamp(R*.12, minDigitFont, 24) + 'px';
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
      startLayoutTransition();
    });
  }

  function layout(){
    W=innerWidth;Hh=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
    cv.width=Math.round(W*dpr);cv.height=Math.round(Hh*dpr);
    if(gl)gl.viewport(0,0,cv.width,cv.height);
    if(layoutRafId){cancelAnimationFrame(layoutRafId);layoutRafId=0;}
    layoutAnimating=false;
    const target=computeTargetLayout(W,Hh,isTimetablePanelOpen);
    R=target.R;cx=target.cx;cy=target.cy;dockY=target.dockY;
    targetR=target.R;targetCx=target.cx;targetCy=target.cy;targetDockY=target.dockY;
    applyGeometryToDom();
    draw();
  }

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

