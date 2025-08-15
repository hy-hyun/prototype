<script lang="ts">
  export let width: string = 'w-full';
  export let height: string = 'h-4';
  export let rounded: string = 'rounded';
  export let count: number = 1;
</script>

{#each Array(count) as _, i}
  <div class="animate-pulse bg-neutral-200 dark:bg-neutral-700 {width} {height} {rounded} {i > 0 ? 'mt-2' : ''}"></div>
{/each}
