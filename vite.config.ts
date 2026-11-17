import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

const COMMON_MANIFEST_FIELDS = {
  id: base,
  name: '대학수학능력시험 안내방송',
  short_name: '수능타종타이머',
  description:
    '대학수학능력시험 전체 시간표와 WebGL 패브릭 아날로그 시계 애니메이션, 내장 타종 음원 및 영어 듣기평가 로컬 음원 연동을 지원하는 단일 HTML 패키징 기반 수능 안내방송 타이머',
  display: 'standalone' as const,
  orientation: 'any' as const,
  scope: base,
  start_url: base,
  lang: 'ko',
  color_scheme: 'light dark',
};

const DARK_PRIORITY_ICONS = [
  {
    src: 'favicon-dark.svg',
    sizes: '512x512 192x192 any',
    type: 'image/svg+xml',
    purpose: 'any',
    color_scheme: 'dark',
  },
  {
    src: 'favicon-dark.svg',
    sizes: '512x512 192x192 any',
    type: 'image/svg+xml',
    purpose: 'maskable',
    color_scheme: 'dark',
  },
  {
    src: 'favicon-light.svg',
    sizes: '192x192 512x512 any',
    type: 'image/svg+xml',
    purpose: 'any',
    color_scheme: 'light',
  },
  {
    src: 'favicon-light.svg',
    sizes: '192x192 512x512 any',
    type: 'image/svg+xml',
    purpose: 'maskable',
    color_scheme: 'light',
  },
];

const LIGHT_PRIORITY_ICONS = [
  {
    src: 'favicon-light.svg',
    sizes: '512x512 192x192 any',
    type: 'image/svg+xml',
    purpose: 'any',
    color_scheme: 'light',
  },
  {
    src: 'favicon-light.svg',
    sizes: '512x512 192x192 any',
    type: 'image/svg+xml',
    purpose: 'maskable',
    color_scheme: 'light',
  },
  {
    src: 'favicon-dark.svg',
    sizes: '192x192 512x512 any',
    type: 'image/svg+xml',
    purpose: 'any',
    color_scheme: 'dark',
  },
  {
    src: 'favicon-dark.svg',
    sizes: '192x192 512x512 any',
    type: 'image/svg+xml',
    purpose: 'maskable',
    color_scheme: 'dark',
  },
];

function buildThemeManifestJson(mode: 'dark' | 'light'): string {
  const isDark = mode === 'dark';
  return JSON.stringify(
    {
      ...COMMON_MANIFEST_FIELDS,
      theme_color: isDark ? '#121212' : '#ecebe9',
      background_color: isDark ? '#121212' : '#ecebe9',
      icons: isDark ? DARK_PRIORITY_ICONS : LIGHT_PRIORITY_ICONS,
      user_preferences: {
        color_scheme_dark: {
          theme_color: '#121212',
          background_color: '#121212',
          icons: DARK_PRIORITY_ICONS.slice(0, 2),
        },
        color_scheme_light: {
          theme_color: '#ecebe9',
          background_color: '#ecebe9',
          icons: LIGHT_PRIORITY_ICONS.slice(0, 2),
        },
      },
    },
    null,
    2
  );
}

export default defineConfig(() => {
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'theme-aware-manifest-variants',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0] ?? '';
            if (url.endsWith('/manifest-dark.webmanifest')) {
              res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
              res.end(buildThemeManifestJson('dark'));
              return;
            }
            if (url.endsWith('/manifest-light.webmanifest')) {
              res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
              res.end(buildThemeManifestJson('light'));
              return;
            }
            next();
          });
        },
        generateBundle() {
          this.emitFile({
            type: 'asset',
            fileName: 'manifest-dark.webmanifest',
            source: buildThemeManifestJson('dark'),
          });
          this.emitFile({
            type: 'asset',
            fileName: 'manifest-light.webmanifest',
            source: buildThemeManifestJson('light'),
          });
        },
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon-dark.svg',
          'favicon-light.svg',
        ],
        manifest: {
          ...COMMON_MANIFEST_FIELDS,
          theme_color: '#121212',
          background_color: '#121212',
          icons: DARK_PRIORITY_ICONS,
          // @ts-expect-error W3C Manifest user_preferences extension for color-scheme-aware browsers
          user_preferences: {
            color_scheme_dark: {
              theme_color: '#121212',
              background_color: '#121212',
              icons: DARK_PRIORITY_ICONS.slice(0, 2),
            },
            color_scheme_light: {
              theme_color: '#ecebe9',
              background_color: '#ecebe9',
              icons: LIGHT_PRIORITY_ICONS.slice(0, 2),
            },
          },
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
          globIgnores: ['**/csat-timer-standalone.html', 'assets/aistudio/**', 'audio/**'],
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          cleanupOutdatedCaches: true,
          navigateFallback: `${base}index.html`,
          navigateFallbackDenylist: [/\/csat-timer-standalone\.html$/, /^\/api\//],
          runtimeCaching: [{
            urlPattern: ({ url }) => url.pathname.includes('/audio/bells/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'bell-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 60 },
            },
          }],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
