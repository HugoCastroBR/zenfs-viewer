<script lang="ts">
  import { fs } from "$lib/fs"


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
  <video
    src={url}
    controls
    class="w-full h-auto overflow-hidden m-auto object-contain"
  >
    <track kind="captions" />
  </video>
{/if}
