# Firebase 연동 디버깅 가이드

## 1. 브라우저 개발자 도구 확인
1. `F12`를 눌러 개발자 도구 열기
2. `Console` 탭에서 다음 로그 확인:
   - "Firebase에서 강의 데이터 로딩 시작..."
   - "Firestore 컬렉션 참조 생성 완료"
   - "Firestore 쿼리 실행 완료, 문서 개수: X"

## 2. 가능한 오류 원인

### A. Firestore 보안 규칙 문제
Firebase Console > Firestore Database > Rules에서 다음과 같이 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 임시로 모든 읽기 허용 (개발용)
    match /{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### B. Firebase 프로젝트 설정 문제
- 프로젝트 ID가 올바른지 확인
- Firestore 데이터베이스가 활성화되어 있는지 확인

### C. 네트워크 연결 문제
- 인터넷 연결 상태 확인
- 방화벽이나 프록시 설정 확인

## 3. 데이터 확인
Firebase Console > Firestore Database에서 `lectures` 컬렉션에 데이터가 있는지 확인

## 4. 임시 해결책
현재 코드는 Firebase 연결 실패 시 자동으로 더미 데이터로 대체됩니다.
