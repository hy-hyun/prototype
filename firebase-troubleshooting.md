# Firebase 연동 문제 해결 가이드

## 🔍 문제 진단 체크리스트

### 1. 브라우저 Console 확인
`http://localhost:5174/search`에 접속 후 F12 → Console 탭에서 확인:

#### ✅ 정상 로그 순서:
1. `🔥 Firebase 설정:` - 설정 정보 출력
2. `🔥 Firebase 앱 초기화 완료`
3. `🔥 Firestore 인스턴스 생성 완료`
4. `🔥 검색 페이지 마운트, Firebase 연결 테스트 시작`
5. `🔥 Firebase 연결 테스트 시작`
6. `🔥 쿼리 성공, 문서 개수: 5`

#### ❌ 가능한 오류들:
- **Permission denied**: Firestore 보안 규칙 문제
- **Network error**: 인터넷 연결 또는 방화벽 문제
- **Invalid project**: Firebase 프로젝트 설정 오류
- **CORS error**: 브라우저 보안 정책 문제

### 2. Firebase Console 확인 사항

#### A. Firestore 보안 규칙
Firebase Console → Firestore Database → Rules에서:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;  // 임시로 모든 읽기 허용
      allow write: if false;
    }
  }
}
```

#### B. 프로젝트 설정 확인
- 프로젝트 ID: `gen-lang-client-0705810476`
- Firestore 데이터베이스가 활성화되어 있는지
- `lectures` 컬렉션에 5개 문서가 있는지

### 3. 일반적인 해결 방법

#### A. 브라우저 캐시 삭제
- Ctrl + Shift + R (강력 새로고침)
- 개발자 도구 → Network 탭 → Disable cache 체크

#### B. 방화벽/보안 소프트웨어
- 일시적으로 방화벽 비활성화 테스트
- 바이러스 백신 실시간 보호 일시 해제

#### C. 다른 브라우저 테스트
- Chrome, Firefox, Edge에서 각각 테스트

### 4. 네트워크 연결 테스트
```bash
# Firebase 서버 연결 테스트
ping firestore.googleapis.com
```

## 🚨 즉시 확인 필요 사항

1. **브라우저 Console에서 🔥 로그들이 나타나는가?**
2. **어느 단계에서 멈추거나 오류가 발생하는가?**
3. **Network 탭에서 Firebase 요청이 실패하는가?**
