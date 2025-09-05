/**
 * 강의 건물 이동거리 별 경고 시스템을 위한 건물 그룹 데이터
 * 각 건물을 군으로 분류하고 알파벳으로 매칭
 */

export interface BuildingGroup {
  groupId: string;
  groupName: string;
  buildings: string[];
}

export const BUILDING_GROUPS: BuildingGroup[] = [
  {
    groupId: 'A',
    groupName: '공학',
    buildings: [
      '제1공학관',
      '제2공학관',
      '백남음악관'
    ]
  },
  {
    groupId: 'B',
    groupName: '사범',
    buildings: [
      '사범대학본관',
      '사범대학별관',
      '의대계단강의동',
      '융합교육관'
    ]
  },
  {
    groupId: 'C',
    groupName: '경영',
    buildings: [
      '경영대학',
      '경영관',
      '경영',
      '제3법학관'
    ]
  },
  {
    groupId: 'D',
    groupName: '인문자연',
    buildings: [
      '인문과학대학',
      '자연과학대학',
      '자연과학관'
    ]
  },
  {
    groupId: 'E',
    groupName: '올림픽',
    buildings: [
      '올림픽체육관',
      'IT.BT관'
    ]
  },
  {
    groupId: 'F',
    groupName: '사회',
    buildings: [
      '사회과학관',
      '사회과학대학'
    ]
  },
  {
    groupId: 'G',
    groupName: '신소재',
    buildings: [
      '신소재공학관',
      '토목건축관'
    ]
  },
  {
    groupId: 'H',
    groupName: '비대면',
    buildings: [
      '온라인',
      '비대면'
    ]
  }
];

/**
 * 건물명으로 그룹 ID를 찾는 함수
 */
export function getBuildingGroupId(buildingName: string): string | null {
  console.log(`🔍 건물 그룹 ID 검색 시작: "${buildingName}"`);
  
  for (const group of BUILDING_GROUPS) {
    console.log(`  📋 그룹 ${group.groupId} (${group.groupName}) 확인 중:`, {
      buildings: group.buildings,
      includes: group.buildings.includes(buildingName)
    });
    
    if (group.buildings.includes(buildingName)) {
      console.log(`  ✅ 매칭 성공: "${buildingName}" → 그룹 ${group.groupId}`);
      return group.groupId;
    }
  }
  
  console.log(`  ❌ 매칭 실패: "${buildingName}"은 어떤 그룹에도 속하지 않음`);
  console.log(`  📊 전체 건물 목록:`, BUILDING_GROUPS.flatMap(g => g.buildings));
  return null;
}

/**
 * 그룹 ID로 그룹 정보를 찾는 함수
 */
export function getBuildingGroup(groupId: string): BuildingGroup | null {
  return BUILDING_GROUPS.find(group => group.groupId === groupId) || null;
}

/**
 * 두 건물이 같은 그룹에 속하는지 확인하는 함수
 */
export function isSameBuildingGroup(building1: string, building2: string): boolean {
  const group1 = getBuildingGroupId(building1);
  const group2 = getBuildingGroupId(building2);
  
  if (!group1 || !group2) return false;
  return group1 === group2;
}

/**
 * 모든 건물 목록을 반환하는 함수
 */
export function getAllBuildings(): string[] {
  return BUILDING_GROUPS.flatMap(group => group.buildings);
}

/**
 * 그룹별 건물 목록을 반환하는 함수
 */
export function getBuildingsByGroup(groupId: string): string[] {
  const group = getBuildingGroup(groupId);
  return group ? group.buildings : [];
}