import type { Lecture, Notice } from "$lib/types";

export const MOCK_NOTICES: Notice[] = [
  {
    "id": "notice-grading-policy-2025-2",
    "title": "과목별 성적평가 방법 안내",
    "author": "학사팀",
    "createdAt": "2025-08-17T10:00:00Z",
    "views": 2500,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 과목별 성적평가 방법</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025년 2학기에는 아래와 같은 성적평가 방법이 적용됩니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #f3f4f6;'><tr><th style='padding: 10px; border: 1px solid #ccc; width: 30%;'>구분</th><th style='padding: 10px; border: 1px solid #ccc;'>대상</th></tr></thead><tbody><tr><td style='padding: 10px; border: 1px solid #ccc; vertical-align: top;'><strong>상대평가1</strong><br><small>A:30%, A+B: 70%<br>(최대 범위 내 교강사 임의 배정 가능)</small></td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: disc; padding-left: 20px; margin: 0; line-height: 1.8;'><li>10명 이상 이론 교과목<br><small>※ 단, 전공과목이면서 이론 수업인 교과목은 달리 적용<br> - 공과대학(산업융합학부 포함) 10명 이상: 상대평가1<br> - 그 외 단과대학 10명 이상: 상대평가2</small></li><li style='margin-top: 8px;'><small>(예) 공과대학 전공핵심(이론)/수강인원 15명 : 상대평가1 적용</small></li><li><small>경영대학 전공심화(이론)/수강인원 15명 : 상대평가2 적용</small></li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; vertical-align: top;'><strong>상대평가2</strong><br><small>A:40%, A+B: 80%<br>(최대 범위 내 교강사 임의 배정 가능)</small></td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: disc; padding-left: 20px; margin: 0; line-height: 1.8;'><li>20명 이상 이론/실습 교과목</li><li>공과대학(산업융합학부 포함)을 제외한 다른 단과대학 전공과목 중 16명 이상 과목</li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; vertical-align: top;'><strong>상대평가4</strong><br><small>A: 40%, B~F: 제한없음</small></td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: disc; padding-left: 20px; margin: 0; line-height: 1.8;'><li>공과대학(산업융합학부 포함)을 제외한 다른 단과대학 전공과목 중 10명 이상 16명 미만 과목</li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; vertical-align: top;'><strong>절대평가</strong></td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: disc; padding-left: 20px; margin: 0; line-height: 1.8;'><li>10명 미만 이론 교과목</li><li>20명 미만 이론/실습 교과목</li><li>실험/실습 교과목 (※ 인원제한 없음)</li><li>영어전용강좌, 제2외국어전용강좌, IC-PBL강좌(2018-2학기부터)</li><li>HY-Live강좌(2019-1학기부터)</li><li>교직교과목(교직전공, 교직필수, 교직선택)</li><li>커리어개발, 커리어디자인</li><li>ROTC교과목(군사학)</li><li>캡스톤디자인, 종합설계, 초청강연강좌</li><li>가상대학영역 학점교류 교과목(한양사이버대학, 교육혁신팀)</li><li>기타 외부학점(국내 대학간 학점교류, 현지학기제 등)<br><small>※ 국내 대학간 학점교류는 평점평균반영 제외 교과목입니다.</small></li></ul></td></tr></tbody></table><div style='margin-top: 2rem; font-size: 0.9em; color: #4b5563; line-height: 1.7;'><p>※ 성적평가방법은 개강 후 7주 이후인 5월 중, 11월 중에 최종적으로 확정됩니다.</p><p>※ 평가방법의 인원 기준은 수강신청 인원 기준이 아니라, 최종적으로 학점이 부여되는 학부 인원을 기준으로 산정됩니다.</p><p>※ 국제학부 전공교과목은 영어전용과목이라 할지라도 2019-2학기부터 상대평가2로 평가되오니 참고 바랍니다.</p></div>"
  },
  {
    "id": "notice-credit-guidelines-2025",
    "title": "개인별 수강신청학점 안내",
    "author": "학사팀",
    "createdAt": "2025-08-18T11:00:00Z",
    "views": 1980,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 최소·최대학점 준수</h3><p style='margin-top: 1rem; line-height: 1.6;'>학생별 매 학기 수강신청 최소 및 최대 학점 수를 준수해야 하며, 이는 수강정정 기간 완료 시까지 해당됩니다. 수강신청 학점 수가 미달 또는 초과될 경우 전체 수강신청이 무효 처리되며, 해당 학기 평점은 0.00 처리되어 학사경고가 부여됩니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #f3f4f6;'><tr style='border-bottom: 1px solid #ccc;'><th rowspan='2' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>해당 학기</th><th colspan='2' style='padding: 10px; border: 1px solid #ccc;'>수강신청</th><th rowspan='2' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>수강신청 종료 시<br>최대 수강가능학점</th></tr><tr style='background-color: #f9fafb;'><th style='padding: 8px; border: 1px solid #ccc;'>최소 준수학점</th><th style='padding: 8px; border: 1px solid #ccc;'>최대 수강가능학점</th></tr></thead><tbody><tr><td style='padding: 10px; border: 1px solid #ccc;'>첫번째 - 일곱번째 학기<br>(1-1학기 ~ 4-1학기)</td><td style='padding: 10px; border: 1px solid #ccc;'>10학점</td><td rowspan='3' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>20학점</td><td rowspan='3' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle; text-align: left; line-height: 1.8;'><ul style='list-style-type: none; padding: 0; margin: 0;'><li style='margin-bottom: 8px;'><strong>기본 20학점</strong></li><li style='border-top: 1px dashed #ccc; padding-top: 8px; margin-bottom: 8px;'>+ 다중전공자가 타전공 일반선택 신청 시 (<strong>최대 3학점</strong>)</li><li style='border-top: 1px dashed #ccc; padding-top: 8px; margin-bottom: 8px;'>+ 커리어개발Ⅰ,Ⅱ/사회봉사/군사학 신청 시 (<strong>최대 2학점</strong>)</li><li style='border-top: 1px dashed #ccc; padding-top: 8px;'>+ 일반물리학및실험1/일반화학및실험1 신청 시 (<strong>각 1학점</strong>)</li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>졸업예정학기<br>(4-2학기)</td><td style='padding: 10px; border: 1px solid #ccc;'>3학점</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>학업연장재수강자<br>(9학기 이상 이수중)</td><td style='padding: 10px; border: 1px solid #ccc;'>1학점</td></tr></tbody></table><div style='margin-top: 2rem; font-size: 0.9em; color: #4b5563; line-height: 1.7;'><p>* 2025학년도 1~2학년 학생(2024-2027교육과정 적용자), 3~5학년(건축학부) 학생(2020-2023교육과정 적용자)</p><p style='color: #d9534f; margin-top: 0.5rem;'>★ 단, 2015학번 이전 학생이 1학년으로 유급 시 직전학기가 2013-2015교육과정일 경우에는 학점이월 및 성적우수 추가학점 적용</p><p style='color: #d9534f; margin-top: 0.5rem;'>★ 의과대학 소속은 별도적용 (문의: 의과대학 행정팀 02-2220-1841)</p></div>"
  },
  {
    "id": "notice-cancellation-criteria-2025-2",
    "title": "2025-2학기 적용 폐강기준 안내",
    "author": "학사팀",
    "createdAt": "2025-08-20T10:00:00Z",
    "views": 1420,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 2025-2학기 적용 폐강기준 안내</h3><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #f3f4f6;'><tr><th style='padding: 10px; border: 1px solid #ccc;'>적용구분</th><th style='padding: 10px; border: 1px solid #ccc;'>대상수업</th><th style='padding: 10px; border: 1px solid #ccc;'>적용 폐강기준</th></tr></thead><tbody><tr><td rowspan='3' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>일반기준</td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>학년별 재적인원 25명 이상인 학과의 일반 교과목</li><li>핵심교양 교과목</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>전체 수강신청인원 10명 미만 시 폐강</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>학년별 재적인원 15~24명인 학과의 일반교과목</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>전체 수강신청인원이<br>학년별 재적인원의 40%미만 시 폐강</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>학년별 재적인원이 14명 이하인 학과</li><li>재적인원에 관계없이 전공심화과목이면서 스마트 교과목 (e-러닝, SMART-F)</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>전체 수강신청인원 6명 미만 시 폐강</td></tr><tr><td rowspan='3' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>별도기준</td><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>재적인원에 관계없이 영어전용, 제2외국어전용, IC-PBL 과목</li><li>커리어개발 I, II</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>전체 수강신청인원 8명 미만 시 폐강</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>종합설계, 1학점 캡스톤디자인</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>전체 수강신청인원 8명 미만 시 폐강</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>실용공학연구, 교직, 사회봉사, 가상대학영역, 연구실현장실습</li></ul></td><td style='padding: 10px; border: 1px solid #ccc;'>폐강기준 없음</td></tr></tbody></table><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>■ 폐강교과목 수강정정</h3><p style='margin-top: 1rem; line-height: 1.6;'>폐강기준에 해당되는 강좌는 모두 폐강처리 예정이므로 수강신청 강좌별 전체 수강신청인원을 확인한 뒤, 폐강대상강좌는 온라인 수강정정기간을 이용하여 다른 교과목으로 수강정정 하시기 바랍니다.</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>■ 폐강처리 이후 진행</h3><p style='margin-top: 1rem; line-height: 1.6;'>폐강대상강좌 수강신청자 중 폐강처리 시점까지 수강정정하지 않은 학생은 추후 소속학과에서 수강정정이 이루어지며, 그 대상은 여석이 남아있는 교과목으로 제한됩니다.</p>"
  },
  {
    "id": "notice-add-course-request-after-period",
    "title": "개강 후 정정기간 종료 후 증원신청 안내",
    "author": "학사팀",
    "createdAt": "2025-08-25T10:00:00Z",
    "views": 1890,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>◎ 개강후 정정기간 종료후 증원신청</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025학년도 2학기부터 개강후 전체학년 정정기간 종료 후, 수강신청시스템에서 직접 과목별 증원신청을 할 수 있습니다. 수강 증원 신청은 수강신청 성공의 의미가 아닙니다. 학생의 증원신청에 대하여 담당교강사는 허용 혹은 반려 처리를 하게 되며, 학생은 기간 내 증원신청 결과를 직접 확인할 수 있습니다.</p><ul style='list-style-type: none; padding-left: 0; margin-top: 1.5rem;'><li style='background-color: #fffbe6; color: #92400e; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 4px solid #facc15;'>▫ 기존 수강신청내역과 증원신청 교과목의 학점수가 최대 수강신청가능학점을 초과할 수 없음</li><li style='background-color: #fffbe6; color: #92400e; padding: 12px; border-radius: 4px; border-left: 4px solid #facc15;'>▫ 교강사가 설정한 증원신청 대상자에 해당하지 않거나, 이수제한 대상인 경우 증원 신청 불가</li></ul><ul style='list-style-type: none; padding-left: 10px; margin-top: 1.5rem; line-height: 1.8;'><li>▫ 학생 증원신청 : 2025.9.8.(월) 11:00 - 24:00</li><li>▫ 교강사 증원 승인 : 2025.9.8.(월) 11:00 - 2025.9.9.(화) 16:00</li></ul>"
  },
  {
    "id": "notice-curriculum-revision-2025",
    "title": "2025학년도 신입생 대상 교양필수 개편 안내",
    "author": "학사팀",
    "createdAt": "2025-08-15T11:00:00Z",
    "views": 2105,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 2025학년도 신입생 대상 교양필수 개편</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025학년도 신입생(1학년)부터 교양필수 과목이 개편되었습니다.</p><ul style='list-style-type: none; padding-left: 10px; margin-top: 1.5rem; line-height: 2;'><li>- 말과글 → AI시대쓰기의힘/통합사고와읽기의기술</li><li>- 과학기술의철학적이해 → 상상과학성찰/문화기술인간</li><li>- 전문학술영어 → Technology and AI: Utopia or Dystopia?/Personal Branding in Digital Markets</li></ul><p style='margin-top: 1rem; padding-left: 10px; color: #6b7280; font-size: 0.9em;'>(2025학년도 2학기부터 개설 예정)</p><p style='margin-top: 0.5rem; padding-left: 10px; color: #6b7280; font-size: 0.9em;'>융합사고영역 신설(2026학년도부터 개설 예정)</p><p style='margin-top: 1.5rem; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 1rem;'>교양필수 지정 과목은 학과별로 상이하며, 기존 교양필수 교과목은 미이수한 학생들을 위해 공통영역에 개설됩니다.</p>"
  },
  {
    id: "notice-enrollment-schedule-2025-2",
    title: "학년별 수강신청 및 개강 전 전체 학년 수강정정 일정",
    "author": "학사팀",
    "createdAt": "2025-07-20",
    "views": 4512,
    "pinned": true,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 학년별 수강신청 및 개강 전 전체 학년 수강정정 일정</h3><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #003366; color: white;'><tr style='text-align: center;'><th style='padding: 10px; border: 1px solid #ccc; width: 30%;'>구 분</th><th style='padding: 10px; border: 1px solid #ccc; width: 15%;'>학 년</th><th style='padding: 10px; border: 1px solid #ccc; width: 35%;'>신 청 일 자</th><th style='padding: 10px; border: 1px solid #ccc; width: 20%;'>비 고</th></tr></thead><tbody><tr><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>기본 과목 선착순 신청</td><td style='padding: 10px; border: 1px solid #ccc;'>교환학생</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 11:00 – 24:00</td><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>온라인 선착순 수강신청</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>1학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 13:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>2학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 6. (수)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>3학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 7. (목)</strong> 11:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>4,5학년</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 7. (목)</strong> 13:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 1R 포인트 입력</td><td rowspan='5' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'><span style='border-bottom: 1px dotted #d9534f;'>전체학년</span></td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 8. (금)</strong> 09:00<br>~<br><strong>8. 11. (월)</strong> 14:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 1R 결과 열람</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 11. (월)</strong> 15:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 2R 포인트 입력 마감</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 12. (화)</strong> 09:00<br>~<br><strong>8. 13. (수)</strong> 14:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>베팅 2R 결과 열람</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 13. (수)</strong> 15:00</td><td style='padding: 10px; border: 1px solid #ccc;'></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>개강 전 정정</td><td style='padding: 10px; border: 1px solid #ccc;'><strong>8. 14. (목)</strong> 11:00 – 24:00</td><td style='padding: 10px; border: 1px solid #ccc;'>0~11시 수강정정 불가</td></tr></tbody></table>"
  },
  {
    "id": "3",
    "title": "소프트웨어「AI+X」 교과목 전공학점 인정학과 안내",
    "author": "학사팀",
    "createdAt": "2025-08-03T14:00:00Z",
    "views": 231,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 공통영역 「AI+X, 수요자중심융복합 및 교내전략 교과목 전공학점 인정학과」 안내</h3><p style='margin-top: 1.5rem; color: #d9534f; font-weight: bold;'>※ 전공학점 인정은 주전공에만 해당됩니다. (다중전공 전공학점 미인정)</p><p style='margin-top: 0.5rem;'>※ AI+X 교과목의 경우 핵심교양->소프트웨어영역의 이수요건으로도 인정됩니다.</p><p style='margin-top: 0.5rem;'>※ 편람 오픈 후 전공 인정 여부에 변동이 생길 수 있으니 수강신청 후 신청 내역에서 이수구분을 반드시 확인하시기 바랍니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; text-align: center; font-size: 0.9em; border: 1px solid #ddd;'><thead style='background-color: #003366; color: white;'><tr style='border: 1px solid #ddd;'><th style='padding: 10px; border: 1px solid #ddd;'>구분</th><th style='padding: 10px; border: 1px solid #ddd;'>학수번호</th><th style='padding: 10px; border: 1px solid #ddd;'>과목명</th><th style='padding: 10px; border: 1px solid #ddd;'>주전공 인정<br>이수구분</th><th style='padding: 10px; border: 1px solid #ddd;'>전공인정 학부(과)/전공<br><span style='font-weight: normal; font-size: 0.9em;'>[주전공에만 해당] (괄호=인정단위)</span></th></tr></thead><tbody><tr><td rowspan='8' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AI+X 교과목</td><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AIX0002</td><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AI+X:인공지능</td><td style='padding: 10px; border: 1px solid #ddd;'>전공핵심</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>경영학부(100), 교육학과(300), 의예과(200), 화학공학과(200)</td></tr><tr><td style='padding: 10px; border: 1px solid #ddd;'>전공심화</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>교육공학과(300), 기계공학부(200), 독어독문학과(300), 사회학과(100), 바이오메디컬공학전공(100), 생체공학전공(100), 전기공학전공(100), 철학과(100), 건설환경공학과(200), 응용미술교육과(300), 의류학과(200), 미디어커뮤니케이션학과(200), 국어교육과(300)</td></tr><tr><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AIX0003</td><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AI+X:딥러닝</td><td style='padding: 10px; border: 1px solid #ddd;'>전공핵심</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>경영학부(100), 의예과(200), 교육학과(300), 신소재공학부(300), 미래자동차공학과(200)</td></tr><tr><td style='padding: 10px; border: 1px solid #ddd;'>전공심화</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>기계공학부(200), 독어독문학과(400), 전기공학전공(100), 정보공학전공(100), 철학과(300), 경영공학전공(100)</td></tr><tr><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AIX0004</td><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AI+X:R-Py컴퓨팅</td><td style='padding: 10px; border: 1px solid #ddd;'>전공핵심</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>의예과(200), 교육학과(300), 의류학과(100), 정책학과(300), 산업공학과(200), 융합전자공학부(200), 파이낸스경영학과(200), 건축공학부(200)</td></tr><tr><td style='padding: 10px; border: 1px solid #ddd;'>전공심화</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>기계공학부(200), 도시공학과(100), 전기공학전공(100), 철학과(300), 경영공학전공(200), 정보공학전공(200), 국제학부(300), 정보시스템학과(200)</td></tr><tr><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AIX0005</td><td rowspan='2' style='padding: 10px; border: 1px solid #ddd; vertical-align: middle;'>AI+X:머신러닝</td><td style='padding: 10px; border: 1px solid #ddd;'>전공핵심</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>경영학부(100), 의예과(200), 교육학과(300), 영어교육과(300), 미래자동차공학과(100)</td></tr><tr><td style='padding: 10px; border: 1px solid #ddd;'>전공심화</td><td style='padding: 10px; border: 1px solid #ddd; text-align: left;'>기계공학부(200), 원자력공학과(300), 의류학과(300), 철학과(300), 건설환경공학과(200), 행정학과(300), 실내건축디자인학과(300)</td></tr></tbody></table>"
  },
  {
    "id": "notice-mock-enrollment-2025-2",
    "title": "2025학년도 2학기 모의수강신청 안내",
    "author": "학사팀",
    "createdAt": "2025-07-20T09:00:00Z",
    "views": 3102,
    "pinned": true,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>■ 모의수강신청기간</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025학년도 2학기 사전 수강신청 체험기간을 진행합니다. 전체 학부 재학생은 실제 수강신청기간 중 당황하지 않도록 모의수강신청기간 세부일정을 확인한 뒤 해당시간에 필히 참여하여야 합니다. 단, 복학희망자는 복학신청 및 결재 이후 참여할 수 있습니다.</p><p style='margin-top: 1rem; line-height: 1.6;'>이번학기 <strong style='border-bottom: 1px dotted #d9534f;'>포인트 베팅제</strong> 도입으로 인하여 수강신청 방식이 크게 변경되었습니다. 자세한 사항은 공지사항의 '포인트 베팅제 안내' 페이지를 참고바랍니다. 감사합니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem;'><thead style='background-color: #003366; color: white;'><tr style='text-align: center;'><th style='padding: 10px; border: 1px solid #ccc;'>구 분</th><th style='padding: 10px; border: 1px solid #ccc;'>학 년</th><th style='padding: 10px; border: 1px solid #ccc;'>모의 수강 신청 일자</th><th style='padding: 10px; border: 1px solid #ccc;'>비 고</th></tr></thead><tbody><tr><td rowspan='6' style='padding: 10px; border: 1px solid #ccc; text-align: center; vertical-align: middle;'>모의수강신청<br>및 베팅</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>1학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 28. (월)</strong> 11:00 – 15:00</td><td rowspan='6' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle; text-align:left;'><ul style='list-style-type: square; padding-left: 20px; margin: 0;'><li>모의수강신청기간 중 진행된 수강신청 내역은 기간 종료 이후 모두 삭제됨</li></ul></td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>2학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 28. (월)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>3학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 29. (화)</strong> 11:00 – 15:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'>4,5학년</td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 29. (화)</strong> 15:00 – 24:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><span style='border-bottom: 1px dotted #d9534f;'>다전공</span></td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 30. (수)</strong> 11:00 – 14:00</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><span style='border-bottom: 1px dotted #d9534f;'>전체학년</span></td><td style='padding: 10px; border: 1px solid #ccc; text-align: center;'><strong>7. 30. (수)</strong> 16:00 – 24:00</td></tr></tbody></table>"
  },
  {
    "id": "notice-course-withdrawal-policy-2025-2",
    "title": "수강포기제도 시행 안내",
    "author": "학사팀",
    "createdAt": "2025-09-15T09:00:00Z",
    "views": 1750,
    "pinned": false,
    "category": "학사",
    "content": "<h3 style='font-size: 1.25rem; font-weight: bold;'>◎ 수강포기제도란</h3><p style='margin-top: 1rem; line-height: 1.6;'>2021학년도 2학기부터 수강신청 최소학점을 초과하여 수강 중인 학생 중, 이미 수강신청한 교과목을 이수할 능력이 없다고 판단될 때에 본인의 의사에 따라 특정과목의 수강을 포기할 수 있도록 수강포기제도를 시행합니다.</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강포기 기간</h3><p style='margin-top: 1rem; line-height: 1.6;'>2025.9.22.(월) 09:00 ~ 2025.9.23.(화) 24:00</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강포기 대상 학생</h3><p style='margin-top: 1rem; line-height: 1.6;'>수강신청 최소학점을 초과하여 수강신청을 한 학생 중 수강포기를 원하는 과목이 있는 서울캠퍼스 학부 재학생</p><p style='margin-top: 0.5rem; color: #d9534f;'>※ 단, 학사학위취득유예생(졸업유보자) 및 의과대학 의학과 소속 학생 수강포기 불가</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강포기 가능범위</h3><p style='margin-top: 1rem; line-height: 1.6;'>포기 과목은 최대 2과목으로 제한되며, 수강포기 후 잔여학점이 수강신청 최소학점 이상(사회봉사, 재수강과목 등 모두 포함)이어야 합니다.</p><table style='width:100%; border-collapse: collapse; margin-top: 1.5rem; font-size: 0.95rem; text-align: center;'><thead style='background-color: #f3f4f6;'><tr><th style='padding: 10px; border: 1px solid #ccc;'>구분</th><th style='padding: 10px; border: 1px solid #ccc;'>해당 학기</th><th style='padding: 10px; border: 1px solid #ccc;'>수강신청 최소 준수학점</th></tr></thead><tbody><tr><td rowspan='3' style='padding: 10px; border: 1px solid #ccc; vertical-align: middle;'>학기별 수강신청 최소(준수)학점</td><td style='padding: 10px; border: 1px solid #ccc;'>첫번째 - 일곱번째 학기 (1-1학기 ~ 4-1학기)</td><td style='padding: 10px; border: 1px solid #ccc;'>10학점</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>졸업예정학기 (4-2학기)</td><td style='padding: 10px; border: 1px solid #ccc;'>3학점</td></tr><tr><td style='padding: 10px; border: 1px solid #ccc;'>학업연장재수강자 (9학기 이상 이수중)</td><td style='padding: 10px; border: 1px solid #ccc;'>1학점</td></tr></tbody></table><p style='margin-top: 1rem; color: #6b7280; font-size: 0.9em;'>※ 단, 학점교류 학생은 학점교류대학에서 수강하는 학점을 제외하고 교내 수강학점만으로 수강신청 최소학점을 계산하여 포기 가능 여부를 결정함</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강포기 제한 과목 (수강포기 불가 과목)</h3><p style='margin-top: 1rem; line-height: 1.6; color: #d9534f;'>사회봉사 교과목, 학부대학원공통 교과목 및 학석사연계교과목 등 대학원 설강 교과목은 수강 포기가 불가합니다.</p><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강포기 시 주의사항</h3><ul style='list-style-type: none; padding-left: 0; margin-top: 1rem; line-height: 1.8;'><li style='margin-bottom: 0.5rem;'>□ 수강포기 기간 엄수 (기간 외 포기 절대 불가) 수강포기 기간 중 추가 수강신청 또는 포기 번복 등 불가</li><li style='margin-bottom: 0.5rem;'>□ 학사학위취득유예자(졸업유보자) 수강포기 불가능</li><li style='margin-bottom: 0.5rem;'>□ 학업연장자의 경우 수강포기에 따른 학점변동 시, 등록금 납부 금액 확인 후 9월 24일(수) 09:00~ 고지서 출력 하여 해당일(9월 24일(수)~9월 26일(금))에 등록금 납부(학업연장자 수강포기에 따른 학점 및 납부금액 변동이 없을 시, 9월 22일(월)~26일(금) 납부)</li><li style='margin-bottom: 0.5rem;'>□ 외부 국가장학재단, 외부장학재단 수혜자의 경우, 이수학점을 상향해서 조건에 맞도록 요구될 수 있으므로 수강포기에 유의 (ex한국장학재단 국가우수사업 등의 경우 직전학기 이수학점 12학점 이상 등)</li></ul><h3 style='font-size: 1.25rem; font-weight: bold; margin-top: 2rem;'>◎ 수강 포기 방법</h3><ul style='list-style-type: none; padding-left: 0; margin-top: 1rem; line-height: 1.8;'><li style='margin-bottom: 0.5rem;'>□ 수강신청시스템 -> 신청내역 메뉴 클릭 -> 수강을 포기할 과목 앞에 '수강포기'버튼 선택</li><li style='margin-bottom: 0.5rem; padding-left: 1rem;'>- 수강포기 제한 과목인 경우 수강포기 불가</li><li style='margin-bottom: 0.5rem; padding-left: 1rem;'>- 한번 수강포기를 선택한 과목은 포기취소(번복)가 불가하니 신중히 결정하시기 바랍니다.</li><li style='margin-bottom: 0.5rem;'>□ 수강신청내역 확인: 수강포기 후에는 반드시 신청내역을 다시 조회하여 확인 필수</li></ul>"
  }
];

export const SCHEDULE_EVENTS = [
  { date: "2025-08-12", title: "1차 수강신청", desc: "4학년 우선 신청", type: "primary" },
  { date: "2025-08-13", title: "2차 수강신청", desc: "3학년 신청 시작", type: "secondary" },
  { date: "2025-08-14", title: "3차 수강신청", desc: "2학년 신청 시작", type: "secondary" },
  { date: "2025-08-15", title: "4차 수강신청", desc: "1학년 신청 시작", type: "secondary" },
  { date: "2025-08-16", title: "수강신청 마감", desc: "18:00 최종 마감", type: "danger" }
];

// 기본 필터 옵션 (학기, 학년은 고정)
export const STATIC_FILTER_OPTIONS = {
  terms: [
    { value: "2025-2", label: "2025-2학기" },
    { value: "2025-1", label: "2025-1학기" },
    { value: "2024-2", label: "2024-2학기" }
  ],
  grades: [
    { value: "1", label: "1학년" },
    { value: "2", label: "2학년" },
    { value: "3", label: "3학년" },
    { value: "4", label: "4학년" }
  ],
  courseLevels: [
    { value: "100", label: "100단위" },
    { value: "200", label: "200단위" },
    { value: "300", label: "300단위" },
    { value: "400", label: "400단위" }
  ],
  creditHours: [
    { value: "1", label: "1학점" },
    { value: "2", label: "2학점" },
    { value: "3", label: "3학점" },
    { value: "4", label: "4학점" }
  ]
};


