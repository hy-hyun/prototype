# hy-path

AI 학업 설계 및 수강신청 경험 혁신 시스템 - SvelteKit과 Firebase를 기반으로 구축된 수강신청 플랫폼입니다.

## Firebase 설정

1. Firebase 프로젝트를 생성합니다.
2. Firestore 데이터베이스를 활성화합니다.
3. 프로젝트 루트에 `.env.local` 파일을 생성하고 Firebase 설정을 추가합니다:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

4. 샘플 데이터를 업로드하려면 `scripts/uploadSampleData.js` 파일의 Firebase 설정을 업데이트하고 실행합니다.

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
