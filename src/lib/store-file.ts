import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { AppStore, Couple, WishItem } from "./types";

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "store.json");
const emptyStore: AppStore = { couple: null, items: [] };

let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readStore(): Promise<AppStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as AppStore;
    return {
      couple: parsed.couple ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return structuredClone(emptyStore);
  }
}

async function writeStore(store: AppStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function mutateStore<T>(fn: (store: AppStore) => T | Promise<T>): Promise<T> {
  return withLock(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
}

export function getCouple(): Promise<Couple | null> {
  return withLock(async () => (await readStore()).couple);
}

export function getItems(): Promise<WishItem[]> {
  return withLock(async () => (await readStore()).items);
}

export function createCouple(couple: Couple) {
  return mutateStore((store) => {
    if (store.couple) {
      return { error: "Your couple space is already set up. Sign in instead." };
    }
    store.couple = couple;
    return { ok: true as const };
  });
}

export function addItem(item: WishItem) {
  return mutateStore((store) => {
    store.items.unshift(item);
    return item;
  });
}

export function updateItem(
  id: string,
  ownerId: string,
  patch: Partial<Pick<WishItem, "name" | "url" | "notes" | "boughtBySelf">>,
) {
  return mutateStore((store) => {
    const item = store.items.find((wish) => wish.id === id);
    if (!item) return { error: "Wish not found.", status: 404 as const };
    if (item.ownerId !== ownerId) {
      return {
        error: "You can only edit your own wishlist.",
        status: 403 as const,
      };
    }
    if (typeof patch.name === "string") item.name = patch.name;
    if (typeof patch.url === "string") item.url = patch.url;
    if (typeof patch.notes === "string") item.notes = patch.notes;
    if (typeof patch.boughtBySelf === "boolean") {
      item.boughtBySelf = patch.boughtBySelf;
    }
    item.updatedAt = new Date().toISOString();
    return { item };
  });
}

export function deleteItem(id: string, ownerId: string) {
  return mutateStore((store) => {
    const item = store.items.find((wish) => wish.id === id);
    if (!item) return { error: "Wish not found.", status: 404 as const };
    if (item.ownerId !== ownerId) {
      return {
        error: "You can only remove wishes from your own list.",
        status: 403 as const,
      };
    }
    store.items = store.items.filter((wish) => wish.id !== id);
    return { ok: true as const };
  });
}
