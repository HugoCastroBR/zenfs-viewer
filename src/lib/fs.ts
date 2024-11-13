import { configure } from '@zenfs/core'
import { IndexedDB } from '@zenfs/dom'

import * as originalFS from '@zenfs/core'
import { transfer, wrap } from 'comlink'

export async function initFS() {
  await configure({
    mounts: {
      '/': {
        backend: IndexedDB,
        disableAsyncCache: true,
      },
    },
  })
}

export interface ZenfsProtocols {
  readFile(path: string, encoding?: 'utf-8'): Promise<string | ArrayBuffer>
  readdir(path: string): Promise<string[]>
  stat(path: string): Promise<{ size: number; isDirectory: boolean }>
  exists(path: string): Promise<boolean>
  mkdir(path: string): Promise<void>
  rm(path: string, options?: { recursive: boolean }): Promise<void>
  rename(oldPath: string, newPath: string): Promise<void>
  writeFile(
    path: string,
    data: string | ArrayBuffer | Uint8Array,
  ): Promise<void>
}

export function fsImpl(): ZenfsProtocols {
  const _fs =
    typeof globalThis.__zenfs__ === 'undefined'
      ? originalFS
      : globalThis.__zenfs__
  return {
    readFile: _fs.promises.readFile as any,
    readdir: _fs.promises.readdir,
    stat: async (path) => {
      const r = await _fs.promises.stat(path)
      return {
        size: r.size,
        isDirectory: r.isDirectory(),
      }
    },
    exists: _fs.promises.exists,
    mkdir: _fs.promises.mkdir,
    rm: _fs.promises.rm,
    rename: _fs.promises.rename,
    writeFile: (path, data) => {
      return _fs.promises.writeFile(
        path,
        data instanceof ArrayBuffer
          ? new Uint8Array(data as ArrayBuffer)
          : data,
      )
    },
  }
}

function devtoolsImpl(): ZenfsProtocols {
  const id = `zenfs-viewer-iframe-${browser.devtools.inspectedWindow.tabId}`
  const bc = new BroadcastChannel(id)
  const ipc = wrap<ZenfsProtocols>(bc) as unknown as ZenfsProtocols
  return {
    ...(
      [
        'exists',
        'readdir',
        'stat',
        'mkdir',
        'rm',
        'rename',
        'readFile',
      ] as (keyof ZenfsProtocols)[]
    ).reduce((acc, key) => {
      acc[key] = (...args: any) => (ipc[key] as any)(...args)
      return acc
    }, {} as ZenfsProtocols),
    writeFile: async (path, data) => {
      if (typeof data === 'string') {
        await ipc.writeFile(path, data)
      } else {
        const buffer = data instanceof ArrayBuffer ? data : data.buffer
        await ipc.writeFile(path, transfer(buffer, [buffer]))
      }
    },
  }
}

export const fs = chrome.devtools ? devtoolsImpl() : fsImpl()
