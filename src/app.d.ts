// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
/// <reference types="vite/client" />

// 환경변수 타입 정의
interface ImportMetaEnv {
	readonly PUBLIC_FIREBASE_API_KEY: string;
	readonly PUBLIC_FIREBASE_AUTH_DOMAIN: string;
	readonly PUBLIC_FIREBASE_PROJECT_ID: string;
	readonly PUBLIC_FIREBASE_STORAGE_BUCKET: string;
	readonly PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
	readonly PUBLIC_FIREBASE_APP_ID: string;
	readonly PUBLIC_FIREBASE_MEASUREMENT_ID: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
