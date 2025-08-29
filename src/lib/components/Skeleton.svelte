<script lang="ts">
  // Svelte 5 룬모드: $props() 사용
  let { 
    width = 'w-full', 
    height = 'h-4', 
    rounded = 'rounded', 
    count = 1 
  } = $props<{
    width?: string;
    height?: string;
    rounded?: string;
    count?: number;
  }>();
</script>

{#each Array(count) as _, i}
  <div class="animate-pulse bg-neutral-200 dark:bg-neutral-700 {width} {height} {rounded} {i > 0 ? 'mt-2' : ''}"></div>
{/each}
