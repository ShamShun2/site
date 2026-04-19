/* ═══ IndexedDB File Storage ═══
   Stores uploaded files (PDF, images) locally in the browser.
   No server needed — files persist across page refreshes.
*/

const FS_DB   = 'nuraiFiles';
const FS_VER  = 1;
const FS_STORE = 'files';

function _openDB() {
  return new Promise((ok, fail) => {
    const req = indexedDB.open(FS_DB, FS_VER);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(FS_STORE, { keyPath: 'id' });
    };
    req.onsuccess = e => ok(e.target.result);
    req.onerror   = e => fail(e.target.error);
  });
}

/** Save a File object under a given id key */
async function fsStore(id, file) {
  const buf = await file.arrayBuffer();
  const db  = await _openDB();
  return new Promise((ok, fail) => {
    const tx = db.transaction(FS_STORE, 'readwrite');
    tx.objectStore(FS_STORE).put({ id, name: file.name, type: file.type, size: file.size, data: buf });
    tx.oncomplete = ok;
    tx.onerror    = e => fail(e.target.error);
  });
}

/** Load file record by id. Returns { id, name, type, size, data } or null */
async function fsLoad(id) {
  if (!id) return null;
  const db = await _openDB();
  return new Promise((ok, fail) => {
    const tx  = db.transaction(FS_STORE, 'readonly');
    const req = tx.objectStore(FS_STORE).get(id);
    req.onsuccess = e => ok(e.target.result || null);
    req.onerror   = e => fail(e.target.error);
  });
}

/** Delete a stored file */
async function fsDelete(id) {
  if (!id) return;
  const db = await _openDB();
  return new Promise((ok, fail) => {
    const tx = db.transaction(FS_STORE, 'readwrite');
    tx.objectStore(FS_STORE).delete(id);
    tx.oncomplete = ok;
    tx.onerror    = e => fail(e.target.error);
  });
}

/** Get a temporary blob: URL for a stored file. Returns { url, name, type } or null */
async function fsURL(id) {
  const rec = await fsLoad(id);
  if (!rec) return null;
  const blob = new Blob([rec.data], { type: rec.type });
  return { url: URL.createObjectURL(blob), name: rec.name, type: rec.type, size: rec.size };
}

/** Check if a file exists in the store */
async function fsExists(id) {
  const rec = await fsLoad(id);
  return rec !== null;
}
