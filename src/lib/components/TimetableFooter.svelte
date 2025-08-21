<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    download: void;
    share: void;
  }>();

  function handleDownload() {
    dispatch('download');
  }

  function handleShare() {
    dispatch('share');
  }
</script>

<!-- 시간표 하단 액션 버튼들 -->
<div class="bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl shadow-sm">
  <div class="flex items-center justify-end gap-4">
    <!-- PNG 다운로드 버튼 -->
    <div class="relative group">
      <button 
        class="footer-icon-btn download"
        onclick={handleDownload}
        aria-label="PNG 저장"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
      </button>
      <div class="footer-tooltip">PNG 저장</div>
    </div>

    <!-- 공유 버튼 -->
    <div class="relative group">
      <button 
        class="footer-icon-btn share"
        onclick={handleShare}
        aria-label="공유하기"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
        </svg>
      </button>
      <div class="footer-tooltip">공유하기</div>
    </div>
  </div>
</div>

<style>
  .footer-icon-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    border: 1px solid;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    cursor: pointer;
    position: relative;
  }

  .footer-icon-btn.download {
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }

  .footer-icon-btn.download:hover {
    background: rgba(59, 130, 246, 0.1);
    border-color: #3b82f6;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }

  .footer-icon-btn.share {
    border-color: rgba(147, 51, 234, 0.3);
    color: #9333ea;
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  }

  .footer-icon-btn.share:hover {
    background: linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
    border-color: #9333ea;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.2);
  }

  /* 풋터 툴팁 */
  .footer-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
    z-index: 50;
  }

  .footer-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.8);
  }

  .group:hover .footer-tooltip {
    opacity: 1;
  }

  /* 모바일 최적화 */
  @media (max-width: 640px) {
    .footer-icon-btn {
      width: 44px;
      height: 44px;
    }
  }
</style>