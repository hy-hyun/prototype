<script lang="ts">
  interface AccordionItem {
    id: string;
    title: string;
    content: string;
    date?: string;
    isPinned?: boolean;
    isOpen?: boolean;
  }

  let { 
    items = [],
    multipleOpen = false,
    class: className = ""
  }: {
    items: AccordionItem[];
    multipleOpen?: boolean;
    class?: string;
  } = $props();

  // 각 아이템의 열림/닫힘 상태를 관리
  let openItems = $state<Set<string>>(new Set());

  function toggleItem(itemId: string) {
    const newOpenItems = new Set(openItems);
    
    if (multipleOpen) {
      // 여러 개 열기 허용
      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId);
      } else {
        newOpenItems.add(itemId);
      }
    } else {
      // 하나만 열기 허용
      if (newOpenItems.has(itemId)) {
        newOpenItems.clear();
      } else {
        newOpenItems.clear();
        newOpenItems.add(itemId);
      }
    }
    
    openItems = newOpenItems;
    console.log('SimpleAccordion - 클릭된 아이템:', itemId);
    console.log('SimpleAccordion - 열린 아이템들:', Array.from(openItems));
    console.log('SimpleAccordion - isOpen 상태:', isOpen(itemId));
  }

  function isOpen(itemId: string): boolean {
    return openItems.has(itemId);
  }

  // 디버깅용 - 아이템 데이터 확인
  $effect(() => {
    console.log('🔍 SimpleAccordion - items 데이터:', items);
    items.forEach((item, index) => {
      console.log(`📋 아이템 ${index + 1} (${item.id}):`, {
        title: item.title,
        isPinned: item.isPinned,
        hasPin: !!item.isPinned
      });
    });
    
    const pinnedItems = items.filter(item => item.isPinned);
    console.log(`📌 고정된 아이템 수: ${pinnedItems.length}`, pinnedItems.map(item => item.title));
  });
</script>

<div class="simple-accordion {className}">
  {#each items as item (item.id)}
    <div class="accordion-item">
      <button 
        class="accordion-trigger" 
        onclick={() => toggleItem(item.id)}
        aria-expanded={isOpen(item.id)}
      >
        <div class="accordion-title-container">
          {#if item.isPinned}
            <span class="pin-icon">📌</span>
          {/if}
          <span class="accordion-title">{item.title}</span>
        </div>
        <div class="accordion-right">
          {#if item.date}
            <span class="accordion-date">({item.date})</span>
          {/if}
          <div class="accordion-icon" style="transform: rotate({isOpen(item.id) ? '180deg' : '0deg'})">
            ▼
          </div>
        </div>
      </button>
      
      {#if isOpen(item.id)}
        <div class="accordion-content open">
          <div class="accordion-content-inner">
            <div class="content-text">{@html item.content}</div>
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .simple-accordion {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .accordion-item {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    transition: all 0.2s ease;
  }

  .accordion-item:hover {
    border-color: #0E4A84;
    box-shadow: 0 2px 8px rgba(14, 74, 132, 0.1);
  }

  .accordion-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: none;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;
    text-align: left;
  }

  .accordion-trigger:hover {
    background-color: #f9fafb;
  }

  .accordion-trigger:focus {
    outline: 2px solid #0E4A84;
    outline-offset: -2px;
  }

  .accordion-title-container {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }

  .pin-icon {
    font-size: 16px;
    margin-right: 4px;
  }

  .accordion-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .accordion-date {
    color: #6b7280; /* 회색 */
    font-size: 14px;
    font-weight: normal;
  }

  .accordion-title {
    font-weight: 600;
    color: #1f2937;
    font-size: 16px;
  }

  .accordion-icon {
    width: 20px;
    height: 20px;
    color: #6b7280;
    transition: transform 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  .accordion-icon.rotated {
    transform: rotate(180deg);
  }

  .accordion-content {
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      max-height: 0;
      opacity: 0;
    }
    to {
      max-height: 1000px;
      opacity: 1;
    }
  }

  .accordion-content-inner {
    padding: 16px;
    background-color: #f9fafb;
    border-top: 1px solid #e5e7eb;
  }

  .content-text {
    color: #4b5563;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-line;
  }

  /* 다크모드 지원 */
  :global(.dark) .accordion-item {
    background: #1f2937;
    border-color: #374151;
  }

  :global(.dark) .accordion-trigger:hover {
    background-color: #374151;
  }

  :global(.dark) .accordion-date {
    color: #9ca3af; /* 다크모드에서 더 밝은 회색 */
  }

  :global(.dark) .accordion-title {
    color: #f9fafb;
  }

  :global(.dark) .accordion-content-inner {
    background-color: #374151;
  }

  :global(.dark) .content-text {
    color: #d1d5db;
  }
</style>
