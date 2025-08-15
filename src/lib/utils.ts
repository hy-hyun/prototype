import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// localStorage 캐싱 유틸리티
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number; // 만료 시간 (밀리초)
}

export class LocalStorageCache {
  private static readonly DEFAULT_EXPIRY = 30 * 60 * 1000; // 30분
  
  // 캐시 만료 시간 상수들
  static readonly EXPIRY_TIMES = {
    SHORT: 5 * 60 * 1000,      // 5분 - 자주 변경되는 데이터
    MEDIUM: 30 * 60 * 1000,    // 30분 - 일반적인 데이터
    LONG: 60 * 60 * 1000,      // 1시간 - 안정적인 데이터
    VERY_LONG: 24 * 60 * 60 * 1000, // 24시간 - 거의 변경되지 않는 데이터
  } as const;

  /**
   * 데이터를 localStorage에 캐시합니다
   * @param key 캐시 키
   * @param data 저장할 데이터
   * @param expiry 만료 시간 (밀리초, 기본값: 30분)
   */
  static set<T>(key: string, data: T, expiry: number = this.DEFAULT_EXPIRY): void {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
      console.log(`💾 캐시 저장: ${key} (만료: ${new Date(Date.now() + expiry).toLocaleString()})`);
    } catch (error) {
      console.warn('💾 캐시 저장 실패:', key, error);
    }
  }

  /**
   * localStorage에서 캐시된 데이터를 가져옵니다
   * @param key 캐시 키
   * @returns 캐시된 데이터 또는 null (만료되었거나 없는 경우)
   */
  static get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();
      
      // 만료 시간 체크
      if (now - cacheItem.timestamp > cacheItem.expiry) {
        console.log(`💾 캐시 만료: ${key}`);
        this.remove(key);
        return null;
      }

      console.log(`💾 캐시 히트: ${key} (${Math.round((cacheItem.expiry - (now - cacheItem.timestamp)) / 1000 / 60)}분 남음)`);
      return cacheItem.data;
    } catch (error) {
      console.warn('💾 캐시 읽기 실패:', key, error);
      this.remove(key);
      return null;
    }
  }

  /**
   * 캐시를 삭제합니다
   * @param key 캐시 키
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
      console.log(`💾 캐시 삭제: ${key}`);
    } catch (error) {
      console.warn('💾 캐시 삭제 실패:', key, error);
    }
  }

  /**
   * 모든 캐시를 삭제합니다 (hy-path 관련만)
   */
  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      const hyPathKeys = keys.filter(key => key.startsWith('hy-path-'));
      
      hyPathKeys.forEach(key => localStorage.removeItem(key));
      console.log(`💾 모든 캐시 삭제 완료 (${hyPathKeys.length}개)`);
    } catch (error) {
      console.warn('💾 캐시 전체 삭제 실패:', error);
    }
  }

  /**
   * 캐시 상태를 확인합니다
   * @param key 캐시 키
   * @returns 캐시 정보 또는 null
   */
  static getInfo(key: string): { timestamp: Date; expiry: Date; isExpired: boolean } | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const cacheItem: CacheItem<any> = JSON.parse(cached);
      const timestamp = new Date(cacheItem.timestamp);
      const expiry = new Date(cacheItem.timestamp + cacheItem.expiry);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.expiry;

      return { timestamp, expiry, isExpired };
    } catch {
      return null;
    }
  }

  /**
   * 만료된 캐시를 자동으로 정리합니다
   */
  static cleanupExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const hyPathKeys = keys.filter(key => key.startsWith('hy-path-'));
      let cleanedCount = 0;
      
      hyPathKeys.forEach(key => {
        const info = this.getInfo(key);
        if (info && info.isExpired) {
          localStorage.removeItem(key);
          cleanedCount++;
          console.log(`💾 만료된 캐시 삭제: ${key}`);
        }
      });
      
      if (cleanedCount > 0) {
        console.log(`💾 만료된 캐시 정리 완료 (${cleanedCount}개 삭제)`);
      }
    } catch (error) {
      console.warn('💾 캐시 정리 실패:', error);
    }
  }

  /**
   * 캐시 크기를 확인합니다 (대략적인 바이트 수)
   */
  static getCacheSize(): number {
    try {
      const keys = Object.keys(localStorage);
      const hyPathKeys = keys.filter(key => key.startsWith('hy-path-'));
      
      return hyPathKeys.reduce((total, key) => {
        const value = localStorage.getItem(key);
        return total + (value ? value.length * 2 : 0); // UTF-16이므로 2바이트
      }, 0);
    } catch {
      return 0;
    }
  }

  /**
   * 캐시 통계를 반환합니다
   */
  static getStats(): { 
    totalItems: number; 
    expiredItems: number; 
    totalSize: number; 
    sizeFormatted: string;
  } {
    try {
      const keys = Object.keys(localStorage);
      const hyPathKeys = keys.filter(key => key.startsWith('hy-path-'));
      
      let expiredCount = 0;
      const totalSize = hyPathKeys.reduce((total, key) => {
        const info = this.getInfo(key);
        if (info && info.isExpired) expiredCount++;
        
        const value = localStorage.getItem(key);
        return total + (value ? value.length * 2 : 0);
      }, 0);

      const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      };

      return {
        totalItems: hyPathKeys.length,
        expiredItems: expiredCount,
        totalSize,
        sizeFormatted: formatSize(totalSize)
      };
    } catch {
      return { totalItems: 0, expiredItems: 0, totalSize: 0, sizeFormatted: '0 B' };
    }
  }
}

// 캐시 키 상수들
export const CACHE_KEYS = {
  COURSES: 'hy-path-courses',
  FILTER_OPTIONS: 'hy-path-filter-options',
  NOTICES: 'hy-path-notices',
  SCHEDULE_EVENTS: 'hy-path-schedule-events',
  USER_DATA: (userId: string) => `hy-path-user-${userId}`,
} as const;