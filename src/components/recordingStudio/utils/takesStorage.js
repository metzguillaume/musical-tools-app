// IndexedDB-backed persistence for recorded takes. Stores the raw blob plus
// metadata so takes survive a browser close. Keep object URLs out of storage —
// they only live for the current page lifetime.

const DB_NAME = 'recording-studio';
const DB_VERSION = 1;
const STORE = 'takes';

const openDb = () => new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
            const store = db.createObjectStore(STORE, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt', { unique: false });
        }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

const tx = async (mode, fn) => {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        let result;
        Promise.resolve(fn(store)).then((r) => { result = r; }).catch(reject);
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
    });
};

const reqToPromise = (req) => new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
});

export const listTakes = async () => {
    return tx('readonly', async (store) => {
        const all = await reqToPromise(store.getAll());
        // Newest first
        return all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    });
};

export const getTake = async (id) => {
    return tx('readonly', async (store) => reqToPromise(store.get(id)));
};

export const saveTake = async (take) => {
    return tx('readwrite', async (store) => {
        await reqToPromise(store.put(take));
        return take;
    });
};

export const deleteTake = async (id) => {
    return tx('readwrite', async (store) => {
        await reqToPromise(store.delete(id));
    });
};

export const clearAllTakes = async () => {
    return tx('readwrite', async (store) => reqToPromise(store.clear()));
};
