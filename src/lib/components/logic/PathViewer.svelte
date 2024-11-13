<script lang="ts">
  import pathe from 'pathe'
  import * as Breadcrumb from '../ui/breadcrumb'
  import { store } from '$lib/sotre'

  interface Props {
    path: string
  }

  const props: Props = $props()

  const items = $derived(props.path.split('/').filter((it) => it !== ''))
</script>

<Breadcrumb.Root>
  <Breadcrumb.List class="border-t border-gray-200 px-2">
    <Breadcrumb.Item>
      <Breadcrumb.Link
        href={'#/'}
        onclick={() => store.openFolder('/')}
        class="py-2"
      >
        Root
      </Breadcrumb.Link>
    </Breadcrumb.Item>
    {#each items as segment, i}
      {#if i < items.length}
        <Breadcrumb.Separator />
      {/if}
      <Breadcrumb.Item>
        <Breadcrumb.Link
          href={'#/'}
          onclick={() => store.openFolder(pathe.join(...items.slice(0, i + 1)))}
          class="py-2"
        >
          {segment}
        </Breadcrumb.Link>
      </Breadcrumb.Item>
    {/each}
  </Breadcrumb.List>
</Breadcrumb.Root>
