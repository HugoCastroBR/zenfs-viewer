<script lang="ts">
  import { Button } from '../ui/button'
  import { FolderPen, Download, Trash, RefreshCcw } from 'lucide-svelte'
  import PathView from './PathViewer.svelte'
  import pathe from 'pathe'
  import { fileViewer, type GlobalStore, store } from '$lib/sotre'
  import { toast } from 'svelte-sonner'
  import { saveAs } from 'file-saver'
  import { fileSelector } from '$lib/utils/fileSelector'
  import JSZip from 'jszip'
  import { glob } from '$lib/utils/glob'
  import FileIcon from './FileIcon.svelte'
  import { fs } from '$lib/fs'
  import { FileUp, FolderPlus } from 'lucide-svelte'

  const props: GlobalStore = $props()

  function onNewFolder() {
    const name = prompt('Enter folder name')
    if (name) {
      store.newFolder(pathe.join(props.path, name))
    }
  }

  function onDelete(path: string) {
    if (confirm('Are you sure you want to delete this folder?')) {
      store.delete(path)
    }
  }

  async function onDownload(path: string) {
    console.log('download', path)
    if (!(await fs.exists(path))) {
      toast.error('File does not exist')
      return
    }
    const stat = await fs.stat(path)
    if (stat.isDirectory) {
      const files = await glob(path)
      const zip = new JSZip()
      await Promise.all(
        files.map(async (it) => {
          if (it.isDirectory) {
            return
          }
          const file = await fs.readFile(pathe.join(path, it.path))
          zip.file(it.path, file)
        }),
      )
      const blob = await zip.generateAsync({ type: 'blob' })
      saveAs(blob, pathe.basename(path) + '.zip')
      toast.success('Downloaded')
      // toast.error('Cannot download directory')
      return
    }
    const file = await fs.readFile(path)
    saveAs(new Blob([file]), pathe.basename(path))
  }

  async function onUploadFile() {
    const files = await fileSelector({
      accept: '*',
      multiple: true,
    })
    if (files) {
      await store.createFiles(Array.from(files), props.path)
    }
  }

  async function onOpenItem(item: GlobalStore['items'][number]) {
    if (item.type === 'folder') {
      await store.openFolder(pathe.join(props.path, item.name))
      return
    }
    const exts = fileViewer.flatMap((it) => it.ext)
    if (exts.includes(pathe.extname(item.name))) {
      await store.openFile(pathe.join(props.path, item.name))
    } else {
      await onDownload(pathe.join(props.path, item.name))
    }
  }

  async function onRename(path: string) {
    const name = prompt('Enter new name', pathe.basename(path))
    if (name && name !== pathe.basename(path)) {
      const newPath = pathe.join(pathe.dirname(path), name)
      if (await fs.exists(newPath)) {
        toast.error('File name already exists')
        return
      }
      await store.rename(path, newPath)
    }
  }

  async function onRefresh() {
    await store.openFolder(props.path)
  }
</script>

<div class="flex flex-col gap-2 h-screen justify-between">
  <nav class="border-b border-gray-200">
    <Button variant="ghost" onclick={onNewFolder}>
      <FolderPlus />
      <span>New Folder</span>
    </Button>
    <Button variant="ghost" onclick={onUploadFile}>
      <FileUp />
      <span>Upload File</span>
    </Button>
    <Button variant="ghost" onclick={onRefresh}>
      <RefreshCcw />
      <span>Refresh</span>
    </Button>
  </nav>
  <ul class="flex-1 overflow-y-auto">
    {#each props.items as it}
      <li>
        <a
          class="flex items-center h-8 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 pl-2"
          href="#/"
          onclick={() => onOpenItem(it)}
        >
          <FileIcon path={it.name} isDirectory={it.type === 'folder'} />
          <span class="flex-1 px-2 truncate">{it.name}</span>
          <Button
            variant="ghost"
            size="icon"
            onclick={(ev) => {
              ev.stopPropagation()
              onRename(pathe.join(props.path, it.name))
            }}
          >
            <FolderPen />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onclick={(ev) => {
              ev.stopPropagation()
              onDownload(pathe.join(props.path, it.name))
            }}
          >
            <Download />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onclick={(ev) => {
              ev.stopPropagation()
              onDelete(pathe.join(props.path, it.name))
            }}
          >
            <Trash />
          </Button>
        </a>
      </li>
    {/each}
  </ul>
  <PathView path={props.path} />
</div>
