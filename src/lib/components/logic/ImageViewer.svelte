<script lang="ts">
  import { fs } from '$lib/fs'
  import pathe from 'pathe'

  const props: {
    path: string
  } = $props()

  let url: string | undefined = $state()

  onMount(async () => {
    const buffer = await fs.readFile(props.path)
    url = URL.createObjectURL(new Blob([buffer]))
  })
</script>

{#if url}
  <img
    src={url}
    class="w-full h-auto overflow-hidden m-auto object-contain"
    alt={pathe.basename(props.path)}
  />
{/if}
