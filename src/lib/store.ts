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

export function mutateStore<T>(
  fn: (store: AppStore) => T | Promise<T>,
): Promise<T> {
  return withLock(async () => {
    const store = await readStore();
    const result = await fn(store);
    await writeStore(store);
    return result;
  });
}

export function getStore(): Promise<AppStore> {
  return withLock(() => readStore());
}

export function getCouple(): Promise<Couple | null> {
  return getStore().then((store) => store.couple);
}

export function getItems(): Promise<WishItem[]> {
  return getStore().then((store) => store.items);
}
