import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

const base = process.env.BASE_PATH ?? '/';

export default defineConfig(() => {
  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon-light.svg',
          'favicon-dark.svg',
        ],
        manifest: {
          id: base,
          name: '대학수학능력시험 안내방송',
          short_name: '수능타종타이머',
          description:
            '대학수학능력시험 전체 시간표와 WebGL 패브릭 아날로그 시계 애니메이션, 내장 타종 음원 및 영어 듣기평가 로컬 음원 연동을 지원하는 단일 HTML 패키징 기반 수능 안내방송 타이머',
          theme_color: '#121212',
          background_color: '#121212',
          display: 'standalone',
          orientation: 'any',
          scope: base,
          start_url: base,
          lang: 'ko',
          icons: [
            {
              src: 'favicon-light.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: 'favicon-dark.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
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
        '@': path.resolve(__dirname, '.'),
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
