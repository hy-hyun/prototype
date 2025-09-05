<script lang="ts">
  import type { DistanceWarningResult } from '$lib/utils/distanceWarning';

  let { warning }: { warning: DistanceWarningResult } = $props();
</script>

{#if warning.info}
  <div class="distance-warning {warning.info.bgColor} {warning.info.borderColor} border rounded-lg p-3 mb-2">
    <div class="flex items-center gap-2">
      <span class="text-lg">{warning.info.icon}</span>
      <div class="flex-1">
        <div class="text-sm font-medium {warning.info.color}">
          {warning.info.message}
        </div>
        <div class="text-xs text-gray-600 mt-1">
          {warning.fromBuilding} → {warning.toBuilding}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .distance-warning {
    transition: all 0.2s ease-in-out;
  }
  
  .distance-warning:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
