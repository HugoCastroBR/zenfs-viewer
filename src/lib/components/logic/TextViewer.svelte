<script lang="ts">
  import { fs } from '$lib/fs'

  const props: {
    path: string
  } = $props()

  let content = $state('')

  onMount(async () => {
    content = (await fs.readFile(props.path, 'utf-8')) as string
  })
</script>

<pre class="flex-1">{content}</pre>
