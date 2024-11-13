import { ZenfsProtocols } from '$lib/fs'
import { expose, transfer, windowEndpoint, wrap } from 'comlink'

console.log('iframe content')
;(async () => {
  const ipc = wrap<ZenfsProtocols>(
    windowEndpoint(window.parent),
  ) as unknown as ZenfsProtocols
  const tabId = (await browser.tabs.getCurrent())!.id
  const ifrBc = new BroadcastChannel(`zenfs-viewer-iframe-${tabId}`)
  expose(
    {
      ...(
        [
          'exists',
          'readdir',
          'stat',
          'mkdir',
          'rm',
          'rename',
        ] as (keyof ZenfsProtocols)[]
      ).reduce((acc, key) => {
        acc[key] = (...args: any) => (ipc[key] as any)(...args)
        return acc
      }, {} as ZenfsProtocols),
      readFile: async (path, encoding) => {
        if (typeof encoding === 'string') {
          return ipc.readFile(path, encoding)
        }
        const r = (await ipc.readFile(path)) as ArrayBuffer
        return transfer(r, [r])
      },
      writeFile: async (path, data) => {
        if (typeof data === 'string') {
          return ipc.writeFile(path, data)
        }
        return ipc.writeFile(path, transfer(data, [data as ArrayBuffer]))
      },
    } as ZenfsProtocols,
    ifrBc,
  )

  const devtoolsBc = new BroadcastChannel(`zenfs-viewer-devtools-${tabId}`)
  wrap<{ onRefresh: () => Promise<void> }>(devtoolsBc).onRefresh()
  console.log('iframe content ready')
})()
