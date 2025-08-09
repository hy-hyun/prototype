import { writable } from "svelte/store";

export type Toast = { id: number; message: string; type?: "success" | "error" | "info"; timeout?: number };

export const toasts = writable<Toast[]>([]);

let nextId = 1;

export function showToast(message: string, type: Toast["type"] = "info", timeout = 2000) {
  const id = nextId++;
  toasts.update((list) => [...list, { id, message, type, timeout }]);
  setTimeout(() => {
    toasts.update((list) => list.filter((t) => t.id !== id));
  }, timeout);
}


