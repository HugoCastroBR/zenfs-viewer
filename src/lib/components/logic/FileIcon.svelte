<script lang="ts">
  import {
    Folder,
    File,
    FileText,
    Image,
    FileJson,
    Video,
    Music,
    Package,
    FileArchive,
    Book,
  } from 'lucide-svelte'
  import pathe from 'pathe'

  const props: {
    path: string
    isDirectory: boolean
  } = $props()

  const ext = $derived(pathe.extname(props.path))
</script>

{#if props.isDirectory}
  <Folder />
{:else if ['.json'].includes(ext)}
  <FileJson />
{:else if ['.md', '.txt', '.json', '.yaml', '.xml'].includes(ext)}
  <FileText />
{:else if ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(ext)}
  <Image />
{:else if ['.mp4', '.webm'].includes(ext)}
  <Video />
{:else if ['.mp3', '.m4a', '.aac', '.flac'].includes(ext)}
  <Music />
{:else if ['.zip', '.tar', '.gz', '.bz2', '.xz'].includes(ext)}
  <FileArchive />
{:else if ['.epub', '.mobi', '.azw3'].includes(ext)}
  <Book />
{:else}
  <File />
{/if}
