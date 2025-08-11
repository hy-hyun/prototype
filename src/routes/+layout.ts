import { loadCourses, courses } from '$lib/stores';
import { get } from 'svelte/store';

// 앱의 모든 페이지가 로드되기 전에 실행됩니다.
export const load = async () => {
  // 스토어가 비어 있을 때만 (앱 첫 로딩 시) Firebase에서 데이터를 가져옵니다.
  // 페이지 이동 시마다 불필요하게 데이터를 다시 로드하는 것을 방지합니다.
  if (get(courses).length === 0) {
    try {
      console.log('🌍 전역 레이아웃: 강의 데이터 로딩 시작...');
      await loadCourses();
      console.log('🌍 전역 레이아웃: 강의 데이터 로딩 완료.');
    } catch (error) {
      console.error('🌍 전역 레이아웃: 데이터 로딩 실패', error);
      // 여기서 에러 처리를 할 수 있습니다. (예: 에러 페이지로 리다이렉트)
    }
  }

  // load 함수는 반드시 객체를 반환해야 합니다.
  // 페이지 컴포넌트에 props로 전달할 데이터가 있다면 여기에 추가합니다.
  return {};
};
