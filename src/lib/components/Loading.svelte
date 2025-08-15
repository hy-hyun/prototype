<script lang="ts">
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let text: string = '로딩 중...';
  export let fullscreen: boolean = false;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };
</script>

{#if fullscreen}
  <div class="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div class="text-center">
      <div class="inline-flex items-center justify-center {sizeClasses[size]} animate-spin rounded-full border-2 border-hanyang-blue border-t-transparent">
      </div>
      <p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">{text}</p>
    </div>
  </div>
{:else}
  <div class="flex items-center justify-center p-8">
    <div class="text-center">
      <div class="inline-flex items-center justify-center {sizeClasses[size]} animate-spin rounded-full border-2 border-hanyang-blue border-t-transparent">
      </div>
      <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{text}</p>
    </div>
  </div>
{/if}
