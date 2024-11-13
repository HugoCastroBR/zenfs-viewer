import { defineConfig } from 'wxt'
import path from 'path'

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-svelte'],
  manifest: {
    name: 'ZenFS Viewer',
    action: {
      default_title: 'ZenFS Viewer',
    },
    web_accessible_resources: [
      {
        resources: [
          '/main-world-content.js',
          '/isolation-world-content.js',
          '/iframe-content.html',
        ],
        matches: ['<all_urls>'],
      },
    ],
  },
  vite: () => ({
    resolve: {
      alias: {
        $lib: path.resolve('./src/lib'),
      },
    },
  }),
  runner: {
    openDevtools: true,
    openConsole: true,
    chromiumArgs: ['--unsafely-disable-devtools-self-xss-warnings'],
    startUrls: ['http://localhost:5173/'],
  },
})
