<script lang="ts">
  import FolderView from '$lib/components/logic/FolderViewer.svelte'
  import { Toaster } from '$lib/components/ui/sonner'
  import { store } from '$lib/sotre'
  import FileViewer from '$lib/components/logic/FileViewer.svelte'
  import { ModeWatcher } from 'mode-watcher'
  import { evalCode } from '$lib/utils/evalCode'
  import { expose } from 'comlink'
  import { fs } from '$lib/fs'

  async function safeEval(code: string) {
    try {
      return await evalCode(code)
    } catch (err) {
      console.warn('safeEval', err)
      return undefined
    }
  }

  let isMounted = $state(false)

  async function onInit() {
    const [hasZenfs, hasIfr] = (await safeEval(
      '[typeof globalThis.__zenfs__ !== "undefined", !!document.getElementById("zenfs-viewer-iframe")]',
    )) ?? [false, false]
    console.log('onInit', hasZenfs, hasIfr)
    if (hasIfr) {
      await store.openFolder('/')
      isMounted = true
      return
    }
    if (!hasZenfs) {
      isMounted = false
      return
    }
    const tabId = browser.devtools.inspectedWindow.tabId
    await browser.scripting.executeScript({
      target: { tabId },
      files: ['/isolation-world-content.js'],
    })
    isMounted = true
  }

  onMount(onInit)
  onMount(() => {
    const tabId = browser.devtools.inspectedWindow.tabId
    const devtoolsBc = new BroadcastChannel(`zenfs-viewer-devtools-${tabId}`)
    expose(
      {
        onRefresh: async () => {
          console.log('devtools onRefresh')
          await store.openFolder('/')
          isMounted = true
        },
      } as { onRefresh: () => Promise<void> },
      devtoolsBc,
    )
    return () => devtoolsBc.close()
  })
  onMount(() => {
    const listener: Parameters<
      typeof browser.tabs.onUpdated.addListener
    >[0] = async (tabId, changeInfo, tab) => {
      if (changeInfo.status !== 'complete') {
        return
      }
      console.log('tabId', tabId, tab.url)
      await new Promise((resolve) => {
        const interval = setInterval(async () => {
          if (await safeEval('typeof globalThis.__zenfs__ !== "undefined"')) {
            resolve(true)
            clearTimeout(timeout)
            clearInterval(interval)
          }
        }, 100)
        const timeout = setTimeout(() => {
          clearInterval(interval)
          resolve(false)
        }, 500)
      })
      await onInit()
    }
    browser.tabs.onUpdated.addListener(listener)
    return () => browser.tabs.onUpdated.removeListener(listener)
  })
</script>

<main>
  {#if isMounted}
    {#if $store.type === 'file'}
      <FileViewer path={$store.path} />
    {:else}
      <FolderView {...$store} />
    {/if}
  {:else}
    <div class="flex flex-col items-center justify-center h-screen">
      <div class="text-2xl font-bold">
        The page does not use <a
          href="https://github.com/zen-fs/core"
          target="_blank"
          class="text-blue-500 hover:underline"
        >
          zenfs
        </a>.
      </div>
    </div>
  {/if}
</main>

<ModeWatcher />
<Toaster richColors />
