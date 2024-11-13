<script lang="ts">
  import './app.css'
  import { initFS } from '$lib/fs'
  import { Toaster } from '$lib/components/ui/sonner'

  initFS()
</script>

<Toaster richColors />
