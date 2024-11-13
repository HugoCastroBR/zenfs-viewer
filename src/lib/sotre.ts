import { toast } from 'svelte-sonner'
import { writable } from 'svelte/store'
import pathe from 'pathe'
import VideoViewer from './components/logic/VideoViewer.svelte'
import TextViewer from './components/logic/TextViewer.svelte'
import ImageViewer from './components/logic/ImageViewer.svelte'
import { fs } from './fs'

interface Item {
  name: string
  type: 'folder' | 'file'
}

interface FileItem extends Item {
  size: number
}

export interface GlobalStore {
  type: 'folder' | 'file'
  path: string
  items: (Item | FileItem)[]
}

const store_ = writable<GlobalStore>({
  type: 'folder',
  path: '/',
  items: [],
})

export const store = {
  subscribe: store_.subscribe,
  openFolder: async (path: string) => {
    if (!(await fs.exists(path))) {
      if (typeof window !== 'undefined') {
        toast.error('Folder does not exist', {
          description: path,
          cancel: {
            label: 'Close',
          },
        })
        return
      }
      throw new Error('Folder does not exist')
    }
    const names = await fs.readdir(path)
    const items = await Promise.all(
      names.map(async (it) => {
        const r = await fs.stat(pathe.join(path, it))
        return {
          name: it,
          type: r.isDirectory ? 'folder' : 'file',
          size: r.size,
        } satisfies FileItem
      }),
    )
    store_.update((state) => ({ ...state, type: 'folder', path, items }))
  },
  newFolder: async (path: string) => {
    await fs.mkdir(path)
    await store.openFolder(pathe.dirname(path))
  },
  delete: async (path: string) => {
    await fs.rm(path, { recursive: true })
    await store.openFolder(pathe.dirname(path))
  },
  createFiles: async (files: File[], path: string) => {
    await Promise.all(
      files.map(async (file) => {
        const buffer = new Uint8Array(await file.arrayBuffer())
        await fs.writeFile(pathe.join(path, file.name), buffer)
      }),
    )
    await store.openFolder(path)
  },
  openFile: async (path: string) => {
    store_.update((state) => ({ ...state, type: 'file', path }))
  },
  rename: async (oldPath: string, newPath: string) => {
    await fs.rename(oldPath, newPath)
    await store.openFolder(pathe.dirname(newPath))
  },
}

export const fileViewer = [
  {
    ext: ['.mp4', '.webm', '.ogg'],
    component: VideoViewer,
  },
  {
    ext: ['.txt', '.json', '.md', '.js', '.ts', '.svelte', '.csv'],
    component: TextViewer,
  },
  {
    ext: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    component: ImageViewer,
  },
]
