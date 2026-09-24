// Wrapper mínimo de IndexedDB (sem dependências externas).
// Banco: albion-regear. Stores: regears (key: id), meta (cache do dataset).

const DB_NAME = "albion-regear";
const DB_VERSION = 2;
export const STORE_REGEARS = "regears";
export const STORE_META = "meta";
export const STORE_PARTIES = "parties";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponível"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_REGEARS)) {
          db.createObjectStore(STORE_REGEARS, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_PARTIES)) {
          db.createObjectStore(STORE_PARTIES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORE_META)) {
          db.createObjectStore(STORE_META);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function run<T>(
  store: string,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = fn(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export const idbGetAll = <T>(store: string) => run<T[]>(store, "readonly", (s) => s.getAll());
export const idbGet = <T>(store: string, key: IDBValidKey) =>
  run<T | undefined>(store, "readonly", (s) => s.get(key) as IDBRequest<T | undefined>);
export const idbPut = (store: string, value: unknown, key?: IDBValidKey) =>
  run(store, "readwrite", (s) => s.put(value as never, key));
export const idbDelete = (store: string, key: IDBValidKey) =>
  run(store, "readwrite", (s) => s.delete(key));
