<script lang="ts">
  import PathViewer from './PathViewer.svelte'
  import { fileViewer } from '$lib/sotre'
  import pathe from 'pathe'

  const props: {
    path: string
  } = $props()

  const viewer = $derived(
    fileViewer.find((it) => it.ext.includes(pathe.extname(props.path))),
  )
</script>

<div class="h-screen flex flex-col justify-between">
  <div class="flex-1 overflow-auto">
    {#if viewer}
      <viewer.component path={props.path} />
    {/if}
  </div>
  <PathViewer path={props.path} />
</div>
