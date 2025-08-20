<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { cn, type WithElementRef } from "$lib/utils.js";

  let {
    ref = $bindable<HTMLDivElement | null>(null),
    class: className,
    ...restProps
  }: WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement> = $props();
</script>

<div
  bind:this={ref}
  data-slot="scroll-area"
  class={cn(
    "relative overflow-auto rounded-md border bg-background",
    className
  )}
  {...restProps}
>
  <slot />
</div>
