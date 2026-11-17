/**
 * 웹페이지 파비콘(Favicon) 라이트/다크 SVG 데이터 모듈
 * 원본: ic_clock_light_gem_v2.xml / ic_clock_dark_gem_v2.xml
 * 사용자 테마 설정(라이트/세피아 vs 다크, 자동 모드 시 기기 테마 연동)에 따라 동적 전환됩니다.
 */

export const LIGHT_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><linearGradient id="lg_bg" x1="45" y1="45" x2="275" y2="275" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#EEEEEC" stop-opacity="1"/><stop offset="0.5" stop-color="#EAE9E7" stop-opacity="1"/><stop offset="1" stop-color="#E0DFDD" stop-opacity="1"/></linearGradient><radialGradient id="rg_sh1" cx="178" cy="178" r="136" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#585755" stop-opacity="0.459"/><stop offset="0.62" stop-color="#585755" stop-opacity="0.439"/><stop offset="0.72" stop-color="#585755" stop-opacity="0.341"/><stop offset="0.80" stop-color="#585755" stop-opacity="0.220"/><stop offset="0.88" stop-color="#585755" stop-opacity="0.110"/><stop offset="0.95" stop-color="#585755" stop-opacity="0.031"/><stop offset="1" stop-color="#585755" stop-opacity="0"/></radialGradient><radialGradient id="rg_sh2" cx="169" cy="169" r="120" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#454442" stop-opacity="0.322"/><stop offset="0.78" stop-color="#454442" stop-opacity="0.298"/><stop offset="0.86" stop-color="#454442" stop-opacity="0.220"/><stop offset="0.93" stop-color="#454442" stop-opacity="0.102"/><stop offset="1" stop-color="#454442" stop-opacity="0"/></radialGradient><radialGradient id="rg_hi" cx="149" cy="149" r="122" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.451"/><stop offset="0.78" stop-color="#FFFFFF" stop-opacity="0.420"/><stop offset="0.88" stop-color="#FFFFFF" stop-opacity="0.251"/><stop offset="0.95" stop-color="#FFFFFF" stop-opacity="0.078"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient><radialGradient id="rg_cap" cx="160" cy="160" r="111.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#EAE9E7" stop-opacity="1"/><stop offset="0.925" stop-color="#EAE9E7" stop-opacity="1"/><stop offset="0.950" stop-color="#EAE9E7" stop-opacity="0.878"/><stop offset="0.972" stop-color="#EAE9E7" stop-opacity="0.522"/><stop offset="0.988" stop-color="#EAE9E7" stop-opacity="0.180"/><stop offset="1" stop-color="#EAE9E7" stop-opacity="0"/></radialGradient><linearGradient id="lg_slope" x1="70" y1="70" x2="250" y2="250" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.161"/><stop offset="0.5" stop-color="#FFFFFF" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity="0.051"/></linearGradient><radialGradient id="rg_glow" cx="156" cy="138" r="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFB9A4" stop-opacity="0.302"/><stop offset="1" stop-color="#FFB9A4" stop-opacity="0"/></radialGradient><linearGradient id="lg_hh1" x1="173.0" y1="147.5" x2="189.95" y2="190.88" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B3308F" stop-opacity="1"/><stop offset="0.55" stop-color="#D9568A" stop-opacity="1"/><stop offset="1" stop-color="#F6AC5E" stop-opacity="1"/></linearGradient><linearGradient id="lg_hh2" x1="205.0" y1="147.5" x2="205.0" y2="155.8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A0828" stop-opacity="0.439"/><stop offset="0.28" stop-color="#3A0828" stop-opacity="0.239"/><stop offset="0.62" stop-color="#3A0828" stop-opacity="0.071"/><stop offset="1" stop-color="#3A0828" stop-opacity="0"/></linearGradient><linearGradient id="lg_hh3" x1="173.5" y1="155.5" x2="181.5" y2="161.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A0828" stop-opacity="0.380"/><stop offset="0.32" stop-color="#3A0828" stop-opacity="0.180"/><stop offset="0.68" stop-color="#3A0828" stop-opacity="0.039"/><stop offset="1" stop-color="#3A0828" stop-opacity="0"/></linearGradient></defs><g id="fabricStage"><path d="M0,0 H320 V320 H0 Z" fill="url(#lg_bg)"/><path d="M178,178 m-136,0 a136,136 0 1,0 272,0 a136,136 0 1,0 -272,0" fill="url(#rg_sh1)"/><path d="M169,169 m-120,0 a120,120 0 1,0 240,0 a120,120 0 1,0 -240,0" fill="url(#rg_sh2)"/><path d="M149,149 m-122,0 a122,122 0 1,0 244,0 a122,122 0 1,0 -244,0" fill="url(#rg_hi)"/><path d="M160,160 m-111.5,0 a111.5,111.5 0 1,0 223.0,0 a111.5,111.5 0 1,0 -223.0,0" fill="url(#rg_cap)"/><path d="M160,160 m-106,0 a106,106 0 1,0 212,0 a106,106 0 1,0 -212,0" fill="url(#lg_slope)"/></g><g id="ticks"><path d="M156,138 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0" fill="url(#rg_glow)"/><path d="M160,75 L160,63 M245,160 L257,160 M160,245 L160,257 M75,160 L63,160" stroke="#5A5A5A" stroke-width="1.5" fill="none"/><path d="M205.00,82.06 L208.00,76.86 M237.94,115.00 L243.14,112.00 M237.94,205.00 L243.14,208.00 M205.00,237.94 L208.00,243.14 M115.00,237.94 L112.00,243.14 M82.06,205.00 L76.86,208.00 M82.06,115.00 L76.86,112.00 M115.00,82.06 L112.00,76.86" stroke="#A9A9A9" stroke-width="0.8" fill="none"/></g><g id="hourHand" transform="rotate(215.0972 160 160)"><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh1)"/><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh2)"/><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh3)"/></g><g id="minuteHand" transform="rotate(60 160 160)"><path d="M161.66,159.92 L161.66,71.92" stroke="#000000" stroke-opacity="0.141" stroke-width="3.8" stroke-linecap="round" fill="none"/><path d="M161.20,159.95 L161.20,71.95" stroke="#000000" stroke-opacity="0.200" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M160,160 L160,72" stroke="#171717" stroke-width="2.3" stroke-linecap="round" fill="none"/></g><g id="secondHand" transform="rotate(210 160 160)"><path d="M158.52,177.24 L158.52,67.24" stroke="#000000" stroke-opacity="0.141" stroke-width="2.8" stroke-linecap="round" fill="none"/><path d="M158.90,177.45 L158.90,67.45" stroke="#000000" stroke-opacity="0.200" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M158.65,159.32 m-3.1,0 a3.1,3.1 0 1,0 6.2,0 a3.1,3.1 0 1,0 -6.2,0" fill="#000000" fill-opacity="0.220"/><path d="M160,178 L160,68" stroke="#4D4D4D" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M160,160 m-2.7,0 a2.7,2.7 0 1,0 5.4,0 a2.7,2.7 0 1,0 -5.4,0" fill="#4D4D4D"/></g></svg>`;

export const DARK_FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><defs><radialGradient id="rg_d_sh" cx="175" cy="175" r="128" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000000" stop-opacity="0.451"/><stop offset="0.74" stop-color="#000000" stop-opacity="0.400"/><stop offset="0.86" stop-color="#000000" stop-opacity="0.220"/><stop offset="0.95" stop-color="#000000" stop-opacity="0.059"/><stop offset="1" stop-color="#000000" stop-opacity="0"/></radialGradient><radialGradient id="rg_d_cr" cx="146" cy="146" r="127" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#222327" stop-opacity="1"/><stop offset="0.72" stop-color="#212226" stop-opacity="0.961"/><stop offset="0.79" stop-color="#1D1E21" stop-opacity="0.780"/><stop offset="0.85" stop-color="#16171A" stop-opacity="0.522"/><stop offset="0.91" stop-color="#101113" stop-opacity="0.251"/><stop offset="0.96" stop-color="#0B0C0D" stop-opacity="0.078"/><stop offset="1" stop-color="#09090A" stop-opacity="0"/></radialGradient><radialGradient id="rg_d_core" cx="152" cy="152" r="118" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#26282C" stop-opacity="0.451"/><stop offset="0.82" stop-color="#242529" stop-opacity="0.400"/><stop offset="0.91" stop-color="#18191C" stop-opacity="0.180"/><stop offset="1" stop-color="#09090A" stop-opacity="0"/></radialGradient><radialGradient id="rg_d_cap" cx="160" cy="160" r="111.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#09090A" stop-opacity="1"/><stop offset="0.925" stop-color="#09090A" stop-opacity="1"/><stop offset="0.950" stop-color="#09090A" stop-opacity="0.878"/><stop offset="0.972" stop-color="#09090A" stop-opacity="0.522"/><stop offset="0.988" stop-color="#09090A" stop-opacity="0.180"/><stop offset="1" stop-color="#09090A" stop-opacity="0"/></radialGradient><radialGradient id="rg_d_glow" cx="156" cy="138" r="70" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#D2C8DC" stop-opacity="0.161"/><stop offset="1" stop-color="#D2C8DC" stop-opacity="0"/></radialGradient><linearGradient id="lg_hh1" x1="173.0" y1="147.5" x2="189.95" y2="190.88" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#B3308F" stop-opacity="1"/><stop offset="0.55" stop-color="#D9568A" stop-opacity="1"/><stop offset="1" stop-color="#F6AC5E" stop-opacity="1"/></linearGradient><linearGradient id="lg_hh2" x1="205.0" y1="147.5" x2="205.0" y2="155.8" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A0828" stop-opacity="0.439"/><stop offset="0.28" stop-color="#3A0828" stop-opacity="0.239"/><stop offset="0.62" stop-color="#3A0828" stop-opacity="0.071"/><stop offset="1" stop-color="#3A0828" stop-opacity="0"/></linearGradient><linearGradient id="lg_hh3" x1="173.5" y1="155.5" x2="181.5" y2="161.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#3A0828" stop-opacity="0.380"/><stop offset="0.32" stop-color="#3A0828" stop-opacity="0.180"/><stop offset="0.68" stop-color="#3A0828" stop-opacity="0.039"/><stop offset="1" stop-color="#3A0828" stop-opacity="0"/></linearGradient></defs><g id="fabricStage"><path d="M0,0 H320 V320 H0 Z" fill="#09090A"/><path d="M175,175 m-128,0 a128,128 0 1,0 256,0 a128,128 0 1,0 -256,0" fill="url(#rg_d_sh)"/><path d="M146,146 m-127,0 a127,127 0 1,0 254,0 a127,127 0 1,0 -254,0" fill="url(#rg_d_cr)"/><path d="M152,152 m-118,0 a118,118 0 1,0 236,0 a118,118 0 1,0 -236,0" fill="url(#rg_d_core)"/><path d="M160,160 m-111.5,0 a111.5,111.5 0 1,0 223.0,0 a111.5,111.5 0 1,0 -223.0,0" fill="url(#rg_d_cap)"/></g><g id="ticks"><path d="M156,138 m-70,0 a70,70 0 1,0 140,0 a70,70 0 1,0 -140,0" fill="url(#rg_d_glow)"/><path d="M160,75 L160,63 M245,160 L257,160 M160,245 L160,257 M75,160 L63,160" stroke="#D1D1D6" stroke-width="1.5" fill="none"/><path d="M205.00,82.06 L208.00,76.86 M237.94,115.00 L243.14,112.00 M237.94,205.00 L243.14,208.00 M205.00,237.94 L208.00,243.14 M115.00,237.94 L112.00,243.14 M82.06,205.00 L76.86,208.00 M82.06,115.00 L76.86,112.00 M115.00,82.06 L112.00,76.86" stroke="#636366" stroke-width="0.8" fill="none"/></g><g id="hourHand" transform="rotate(215.0972 160 160)"><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh1)"/><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh2)"/><path d="M185.5,147.5 L224.5,147.5 A12.5,12.5 0 0,1 237,160 A12.5,12.5 0 0,1 224.5,172.5 L185.5,172.5 A12.5,12.5 0 0,1 173,160 A12.5,12.5 0 0,1 185.5,147.5 Z" fill="url(#lg_hh3)"/></g><g id="minuteHand" transform="rotate(60 160 160)"><path d="M161.66,159.92 L161.66,71.92" stroke="#000000" stroke-opacity="0.349" stroke-width="3.8" stroke-linecap="round" fill="none"/><path d="M161.20,159.95 L161.20,71.95" stroke="#000000" stroke-opacity="0.451" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M160,160 L160,72" stroke="#F2F2F7" stroke-width="2.3" stroke-linecap="round" fill="none"/></g><g id="secondHand" transform="rotate(210 160 160)"><path d="M158.52,177.24 L158.52,67.24" stroke="#000000" stroke-opacity="0.349" stroke-width="2.8" stroke-linecap="round" fill="none"/><path d="M158.90,177.45 L158.90,67.45" stroke="#000000" stroke-opacity="0.451" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M158.65,159.32 m-3.1,0 a3.1,3.1 0 1,0 6.2,0 a3.1,3.1 0 1,0 -6.2,0" fill="#000000" fill-opacity="0.451"/><path d="M160,178 L160,68" stroke="#4D4D4D" stroke-width="1.4" stroke-linecap="round" fill="none"/><path d="M160,160 m-2.7,0 a2.7,2.7 0 1,0 5.4,0 a2.7,2.7 0 1,0 -5.4,0" fill="#4D4D4D"/></g></svg>`;

export const LIGHT_FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(LIGHT_FAVICON_SVG)}`;
export const DARK_FAVICON_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(DARK_FAVICON_SVG)}`;

/**
 * 사용자의 현재 테마(resolvedTheme: 'light' | 'dark' | 'sepia')에 맞춰
 * 문서 <head>의 파비콘(<link rel="icon">), 터치 아이콘(<link rel="apple-touch-icon">),
 * 그리고 테마 색상 메타 태그를 프로그램의 라이트/다크 모드에 전격 동기화합니다.
 */
export function syncFaviconWithTheme(resolvedTheme: 'light' | 'dark' | 'sepia'): void {
  if (typeof document === 'undefined') return;
  const isDark = resolvedTheme === 'dark';
  const baseUrl = import.meta.env.BASE_URL || '/';
  const svgFileHref = `${baseUrl}${isDark ? 'favicon-dark.svg' : 'favicon-light.svg'}`;
  const themeHex = isDark ? '#121212' : resolvedTheme === 'sepia' ? '#e6dcc8' : '#ecebe9';

  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

  const tcActive = document.getElementById('theme-color-active') as HTMLMetaElement | null;
  if (tcActive) tcActive.setAttribute('content', themeHex);
  const tcLight = document.getElementById('theme-color-light') as HTMLMetaElement | null;
  if (tcLight) tcLight.setAttribute('content', themeHex);
  const tcDark = document.getElementById('theme-color-dark') as HTMLMetaElement | null;
  if (tcDark) tcDark.setAttribute('content', themeHex);

  let mainIcon = document.getElementById('app-favicon') as HTMLLinkElement | null;
  if (!mainIcon) {
    mainIcon = document.createElement('link');
    mainIcon.id = 'app-favicon';
    mainIcon.rel = 'icon';
    mainIcon.type = 'image/svg+xml';
    mainIcon.sizes = 'any';
    document.head.appendChild(mainIcon);
  }
  mainIcon.removeAttribute('media');
  if (mainIcon.getAttribute('href') !== svgFileHref) {
    mainIcon.setAttribute('href', svgFileHref);
  }

  const favDark = document.getElementById('app-favicon-dark') as HTMLLinkElement | null;
  if (favDark) {
    favDark.removeAttribute('media');
    if (favDark.getAttribute('href') !== svgFileHref) {
      favDark.setAttribute('href', svgFileHref);
    }
  }

  const favLight = document.getElementById('app-favicon-light') as HTMLLinkElement | null;
  if (favLight) {
    favLight.removeAttribute('media');
    if (favLight.getAttribute('href') !== svgFileHref) {
      favLight.setAttribute('href', svgFileHref);
    }
  }

  let touchIcon = document.getElementById('app-apple-touch-icon') as HTMLLinkElement | null;
  if (!touchIcon) {
    touchIcon = document.createElement('link');
    touchIcon.id = 'app-apple-touch-icon';
    touchIcon.rel = 'apple-touch-icon';
    document.head.appendChild(touchIcon);
  }
  if (touchIcon.getAttribute('href') !== svgFileHref) {
    touchIcon.setAttribute('href', svgFileHref);
  }

  const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
  if (manifestLink) {
    const targetManifestHref = `${baseUrl}${isDark ? 'manifest-dark.webmanifest' : 'manifest-light.webmanifest'}`;
    if (manifestLink.getAttribute('href') !== targetManifestHref) {
      manifestLink.setAttribute('href', targetManifestHref);
    }
  }

  const fallbackIcons = document.querySelectorAll('link[data-favicon-fallback="true"]');
  fallbackIcons.forEach((el) => el.parentNode?.removeChild(el));
}
