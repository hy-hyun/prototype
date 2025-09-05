/**
 * 이동거리 경고 시스템 유틸리티
 */

import { getBuildingGroupId } from '$lib/data/buildingGroups';
import { getDistanceWarning, getDistanceWarningInfo, type DistanceWarning } from '$lib/data/distanceMatrix';
import type { Lecture } from '$lib/types';

export interface DistanceWarningResult {
  fromBuilding: string;
  toBuilding: string;
  fromGroup: string;
  toGroup: string;
  warning: DistanceWarning;
  info: ReturnType<typeof getDistanceWarningInfo>;
}

/**
 * 두 강의 간의 이동거리 경고를 분석하는 함수
 */
export function analyzeDistanceWarning(fromLecture: Lecture, toLecture: Lecture): DistanceWarningResult | null {
  const fromBuilding = fromLecture.building || '';
  const toBuilding = toLecture.building || '';
  
  console.log('🔍 이동거리 경고 분석 시작:', {
    fromLecture: {
      title: fromLecture.title,
      building: fromBuilding,
      schedule: fromLecture.schedule,
      courseId: fromLecture.courseId,
      classId: fromLecture.classId
    },
    toLecture: {
      title: toLecture.title,
      building: toBuilding,
      schedule: toLecture.schedule,
      courseId: toLecture.courseId,
      classId: toLecture.classId
    }
  });
  
  // 건물명이 없으면 분석 불가
  if (!fromBuilding || !toBuilding) {
    console.log('❌ 건물명 없음:', { fromBuilding, toBuilding });
    return null;
  }
  
  // 건물 그룹 ID 가져오기
  const fromGroup = getBuildingGroupId(fromBuilding);
  const toGroup = getBuildingGroupId(toBuilding);
  
  console.log('🏢 건물 그룹 매핑 상세:', {
    fromBuilding: {
      name: fromBuilding,
      groupId: fromGroup,
      isMatched: !!fromGroup
    },
    toBuilding: {
      name: toBuilding,
      groupId: toGroup,
      isMatched: !!toGroup
    },
    groupCombination: `${fromGroup || 'NULL'} → ${toGroup || 'NULL'}`,
    canAnalyze: !!(fromGroup && toGroup)
  });
  
  if (!fromGroup || !toGroup) {
    console.log('❌ 건물 그룹 매핑 실패');
    return null;
  }
  
  // 이동거리 경고 레벨 확인
  const warning = getDistanceWarning(fromGroup, toGroup);
  
  console.log('⚠️ 이동거리 경고 레벨:', {
    fromGroup,
    toGroup,
    groupCombination: `${fromGroup} → ${toGroup}`,
    warning,
    matrixKey: `${fromGroup}'${toGroup}`
  });
  
  if (!warning || warning === '-') {
    console.log('✅ 경고 없음 또는 표시하지 않음');
    return null;
  }
  
  const info = getDistanceWarningInfo(warning);
  
  const result = {
    fromBuilding,
    toBuilding,
    fromGroup,
    toGroup,
    warning,
    info
  };
  
  console.log('🎯 최종 결과:', {
    ...result,
    groupCombination: `${fromGroup} → ${toGroup}`,
    matrixKey: `${fromGroup}'${toGroup}`
  });
  
  return result;
}

/**
 * 시간표의 연속된 강의들 간의 이동거리 경고를 분석하는 함수 (간소화)
 */
export function analyzeTimetableDistanceWarnings(lectures: Lecture[]): DistanceWarningResult[] {
  const warnings: DistanceWarningResult[] = [];
  
  console.log('📅 시간표 이동거리 경고 분석 시작:', {
    totalLectures: lectures.length,
    lectures: lectures.map(l => ({
      title: l.title,
      building: l.building,
      schedule: l.schedule
    }))
  });
  
  // 기본 검증
  if (lectures.length < 2) {
    console.log('❌ 강의 수가 2개 미만');
    return warnings;
  }
  
  // 같은 요일의 강의들만 그룹화
  const lecturesByDay: { [day: number]: Lecture[] } = {};
  
  for (const lecture of lectures) {
    if (!lecture.schedule || !lecture.building) {
      console.log('⚠️ 스케줄 또는 건물 정보 없음:', lecture.title);
      continue;
    }
    const day = lecture.schedule[0]?.day;
    if (day) {
      if (!lecturesByDay[day]) lecturesByDay[day] = [];
      lecturesByDay[day].push(lecture);
    }
  }
  
  console.log('📊 요일별 강의 그룹화:', Object.keys(lecturesByDay).map(day => ({
    day: day,
    count: lecturesByDay[parseInt(day)].length,
    lectures: lecturesByDay[parseInt(day)].map(l => l.title)
  })));
  
  // 각 요일별로 연속된 강의들만 확인
  for (const [dayStr, dayLectures] of Object.entries(lecturesByDay)) {
    const day = parseInt(dayStr);
    console.log(`📅 ${day}요일 분석 시작:`, {
      day,
      lectureCount: dayLectures.length,
      lectures: dayLectures.map(l => ({
        title: l.title,
        start: l.schedule![0]?.start,
        end: l.schedule![0]?.end
      }))
    });
    
    if (dayLectures.length < 2) {
      console.log(`❌ ${day}요일 강의 수가 2개 미만`);
      continue;
    }
    
    // 시간순 정렬
    dayLectures.sort((a, b) => {
      const aStart = a.schedule![0]?.start || '';
      const bStart = b.schedule![0]?.start || '';
      return aStart.localeCompare(bStart);
    });
    
    console.log(`⏰ ${day}요일 시간순 정렬 완료:`, dayLectures.map(l => ({
      title: l.title,
      start: l.schedule![0]?.start,
      end: l.schedule![0]?.end
    })));
    
    // 연속된 강의들만 확인
    for (let i = 0; i < dayLectures.length - 1; i++) {
      const current = dayLectures[i];
      const next = dayLectures[i + 1];
      
      const currentEnd = current.schedule![0]?.end;
      const nextStart = next.schedule![0]?.start;
      
      console.log(`🔗 연속 강의 확인 ${i + 1}/${dayLectures.length - 1}:`, {
        current: {
          title: current.title,
          end: currentEnd
        },
        next: {
          title: next.title,
          start: nextStart
        },
        isConsecutive: currentEnd === nextStart
      });
      
      // 연속된 강의인지 확인
      if (currentEnd === nextStart) {
        console.log(`✅ 연속 강의 발견! 이동거리 경고 분석 시작`);
        console.log(`  📍 연속 강의 상세 정보:`, {
          current: {
            title: current.title,
            building: current.building,
            endTime: currentEnd,
            schedule: current.schedule
          },
          next: {
            title: next.title,
            building: next.building,
            startTime: nextStart,
            schedule: next.schedule
          }
        });
        
        const warning = analyzeDistanceWarning(current, next);
        if (warning) {
          console.log(`⚠️ 이동거리 경고 추가:`, warning);
          warnings.push(warning);
        } else {
          console.log(`✅ 이동거리 경고 없음`);
        }
      }
    }
  }
  
  console.log('🎯 시간표 이동거리 경고 분석 완료:', {
    totalWarnings: warnings.length,
    warnings: warnings.map(w => ({
      from: w.fromBuilding,
      to: w.toBuilding,
      fromGroup: w.fromGroup,
      toGroup: w.toGroup,
      groupCombination: `${w.fromGroup} → ${w.toGroup}`,
      matrixKey: `${w.fromGroup}'${w.toGroup}`,
      warning: w.warning
    }))
  });
  
  return warnings;
}

/**
 * 특정 강의를 시간표에 추가할 때 발생할 수 있는 이동거리 경고를 분석하는 함수 (간소화)
 */
export function analyzeNewLectureDistanceWarnings(
  newLecture: Lecture, 
  existingLectures: Lecture[]
): DistanceWarningResult[] {
  const warnings: DistanceWarningResult[] = [];
  
  console.log('🆕 새 강의 추가 시 이동거리 경고 분석 시작:', {
    newLecture: {
      title: newLecture.title,
      building: newLecture.building,
      schedule: newLecture.schedule
    },
    existingLecturesCount: existingLectures.length,
    existingLectures: existingLectures.map(l => ({
      title: l.title,
      building: l.building,
      schedule: l.schedule
    }))
  });
  
  // 기본 검증
  if (!newLecture.schedule || !newLecture.building || existingLectures.length === 0) {
    console.log('❌ 기본 검증 실패:', {
      hasSchedule: !!newLecture.schedule,
      hasBuilding: !!newLecture.building,
      existingCount: existingLectures.length
    });
    return warnings;
  }
  
  const newLectureDay = newLecture.schedule[0]?.day;
  const newLectureStart = newLecture.schedule[0]?.start;
  const newLectureEnd = newLecture.schedule[0]?.end;
  
  console.log('📅 새 강의 시간 정보:', {
    day: newLectureDay,
    start: newLectureStart,
    end: newLectureEnd
  });
  
  if (!newLectureDay || !newLectureStart || !newLectureEnd) {
    console.log('❌ 새 강의 시간 정보 불완전');
    return warnings;
  }
  
  // 같은 요일의 기존 강의들과만 비교 (성능 최적화)
  const sameDayLectures = existingLectures.filter(lecture => {
    if (!lecture.schedule || !lecture.building) return false;
    return lecture.schedule[0]?.day === newLectureDay;
  });
  
  console.log('📊 같은 요일 기존 강의들:', {
    sameDayCount: sameDayLectures.length,
    sameDayLectures: sameDayLectures.map(l => ({
      title: l.title,
      start: l.schedule![0]?.start,
      end: l.schedule![0]?.end
    }))
  });
  
  // 연속된 강의만 확인 (시간이 바로 이어지는 경우만)
  for (const existingLecture of sameDayLectures) {
    const existingStart = existingLecture.schedule![0]?.start;
    const existingEnd = existingLecture.schedule![0]?.end;
    
    if (!existingStart || !existingEnd) {
      console.log('⚠️ 기존 강의 시간 정보 불완전:', existingLecture.title);
      continue;
    }
    
    console.log('🔗 연속 강의 확인:', {
      newLecture: {
        title: newLecture.title,
        start: newLectureStart,
        end: newLectureEnd
      },
      existingLecture: {
        title: existingLecture.title,
        start: existingStart,
        end: existingEnd
      }
    });
    
    // 연속된 강의인지 확인 (새 강의가 기존 강의 바로 다음에 오는 경우)
    if (newLectureEnd === existingStart) {
      console.log('✅ 새 강의 → 기존 강의 연속 발견!');
      console.log('  📍 연속 강의 상세 정보 (새→기존):', {
        newLecture: {
          title: newLecture.title,
          building: newLecture.building,
          endTime: newLectureEnd,
          schedule: newLecture.schedule
        },
        existingLecture: {
          title: existingLecture.title,
          building: existingLecture.building,
          startTime: existingStart,
          schedule: existingLecture.schedule
        }
      });
      
      const warning = analyzeDistanceWarning(newLecture, existingLecture);
      if (warning) {
        console.log('⚠️ 이동거리 경고 추가 (새→기존):', warning);
        warnings.push(warning);
      }
    }
    
    // 기존 강의가 새 강의 바로 다음에 오는 경우
    if (existingEnd === newLectureStart) {
      console.log('✅ 기존 강의 → 새 강의 연속 발견!');
      console.log('  📍 연속 강의 상세 정보 (기존→새):', {
        existingLecture: {
          title: existingLecture.title,
          building: existingLecture.building,
          endTime: existingEnd,
          schedule: existingLecture.schedule
        },
        newLecture: {
          title: newLecture.title,
          building: newLecture.building,
          startTime: newLectureStart,
          schedule: newLecture.schedule
        }
      });
      
      const warning = analyzeDistanceWarning(existingLecture, newLecture);
      if (warning) {
        console.log('⚠️ 이동거리 경고 추가 (기존→새):', warning);
        warnings.push(warning);
      }
    }
  }
  
  console.log('🎯 새 강의 추가 시 이동거리 경고 분석 완료:', {
    totalWarnings: warnings.length,
    warnings: warnings.map(w => ({
      from: w.fromBuilding,
      to: w.toBuilding,
      fromGroup: w.fromGroup,
      toGroup: w.toGroup,
      groupCombination: `${w.fromGroup} → ${w.toGroup}`,
      matrixKey: `${w.fromGroup}'${w.toGroup}`,
      warning: w.warning
    }))
  });
  
  return warnings;
}
