import { fsImpl, ZenfsProtocols } from '$lib/fs'
import { fs } from '@zenfs/core'
import { expose, transfer, windowEndpoint } from 'comlink'

declare global {
  var __zenfs__: typeof fs
}

export default defineUnlistedScript(async () => {
  const _fs = await new Promise<typeof fs>((resolve) => {
    const interval = setInterval(() => {
      if (globalThis.__zenfs__) {
        clearInterval(interval)
        resolve(globalThis.__zenfs__)
      }
    }, 1000)
  })
  const ifr = document.querySelector(
    '#zenfs-viewer-iframe',
  ) as HTMLIFrameElement
  console.log('unlisted script', _fs, ifr)

  if (!ifr.contentWindow) {
    throw new Error('iframe.contentWindow is null')
  }
  // console.log('expose', await _fs.promises.readdir('/'))
  expose(
    {
      ...fsImpl(),
      readFile: async (path, encoding) => {
        if (typeof encoding === 'string') {
          return _fs.promises.readFile(path, encoding)
        }
        const r = await _fs.promises.readFile(path)
        return transfer(r, [r.buffer]) as any
      },
    } satisfies ZenfsProtocols,
    windowEndpoint(ifr.contentWindow),
  )
})
