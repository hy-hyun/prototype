import { writable, derived } from "svelte/store";
import type { Application, CartItem, Lecture, Notice } from "$lib/types";
import { MOCK_LECTURES, MOCK_NOTICES, SCHEDULE_EVENTS } from "$lib/mock/data";

export const lectures = writable<Lecture[]>(MOCK_LECTURES);
export const notices = writable<Notice[]>(MOCK_NOTICES);
export const scheduleEvents = writable(SCHEDULE_EVENTS);
export const isLoggedIn = writable(false);
export const currentUser = writable<{ id: string; name: string } | null>(null);

export const cart = writable<CartItem[]>([
  { courseId: "CSE101", classId: "01", method: "FCFS" },
  { courseId: "CSE102", classId: "01", method: "FCFS" },
  { courseId: "MAT101", classId: "01", method: "FCFS" }
]);
export const applications = writable<Application[]>([]);

export const metrics = derived(cart, ($c) => {
  const min = 12;
  const max = 21;
  const current = 0; // 강의 크레딧 합산은 추후 구현
  const budget = 100; // 베팅 예산 더미
  return { min, max, current, budget };
});

export function addToCart(item: CartItem) {
  cart.update((c) => {
    const exists = c.find((x) => x.courseId === item.courseId && x.classId === item.classId);
    if (!exists) c.push(item);
    return [...c];
  });
}

export function applyFcfs(courseId: string, classId: string) {
  applications.update((a) => [{ courseId, classId, status: "PENDING" }, ...a]);
}

export function applyBid(courseId: string, classId: string, bidAmount: number) {
  cart.update((c) =>
    c.map((x) => (x.courseId === courseId && x.classId === classId ? { ...x, bidAmount } : x))
  );
  applications.update((a) => [{ courseId, classId, status: "PENDING" }, ...a]);
}


