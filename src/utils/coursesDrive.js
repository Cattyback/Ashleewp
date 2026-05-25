/*
 * Read / write the user's course list to a single JSON file in their Google Drive.
 *
 * - File name: `workpuzzle-courses.json` (stored in the user's Drive root)
 * - Scope needed: drive.file (we can only see files our app created, not their other stuff)
 *
 * Strategy: search by name → if found, GET/PATCH; if not, POST (create).
 * Drive doesn't enforce unique names, so first match wins.
 */

import { AuthExpiredError } from './driveApi.js';

const FILE_NAME = 'workpuzzle-courses.json';
const BACKUP_FILE_NAME = 'workpuzzle-courses.backup.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

// Generic lookup: find a file by exact name (and optional mimeType); returns
// the id or null.
//
// The mimeType filter is critical: without it we can collide with a Google
// Doc / Sheet / folder that happens to share the same name, which then 403s
// on read and 400s on PATCH (native types reject `?alt=media` / multipart).
async function findFileIdByName(accessToken, name, mimeType) {
  const clauses = [`name='${name}'`, 'trashed=false'];
  if (mimeType) clauses.push(`mimeType='${mimeType}'`);
  const params = new URLSearchParams({
    q: clauses.join(' and '),
    fields: 'files(id,name)',
    spaces: 'drive',
    pageSize: '1',
  });

  const res = await fetch(`${DRIVE_API}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Drive search failed: ${res.status}`);
  const data = await res.json();
  return data.files?.[0]?.id ?? null;
}

// Kept for backward compatibility with any external callers.
export async function findCoursesFileId(accessToken) {
  return findFileIdByName(accessToken, FILE_NAME, 'application/json');
}

// Cache of resolved file IDs by name, so save-after-add only needs ONE
// network call (PATCH) and is much less likely to be cancelled by a quick
// page refresh. Populated by readCourses on load and writeJsonFile after a
// create.
const fileIdCache = new Map();

export function clearCoursesFileCache() {
  fileIdCache.clear();
}

// Write `body` to a JSON file with the given name. Updates if it exists,
// creates if it doesn't. Used by both the main save and the backup save.
//
// `keepalive: true` lets the request finish even if the user refreshes or
// navigates away mid-flight — critical for the "add course → immediately
// refresh" path that was previously losing data.
async function writeJsonFile(accessToken, fileName, body) {
  let fileId = fileIdCache.get(fileName);
  if (!fileId) {
    fileId = await findFileIdByName(accessToken, fileName, 'application/json');
    if (fileId) fileIdCache.set(fileName, fileId);
  }

  if (fileId) {
    const res = await fetch(`${UPLOAD_API}/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body,
      keepalive: true,
    });
    if (res.status === 401) throw new AuthExpiredError();
    // 404 → cached id is stale (file deleted/trashed). Forget and retry.
    // 400/403 → the file at this id can't accept a media update (typically
    // a Google Doc or folder that shares our name). Drop the bad id and
    // fall through to create a fresh application/json file.
    if (res.status === 404 || res.status === 400 || res.status === 403) {
      fileIdCache.delete(fileName);
      // eslint-disable-next-line no-console
      console.warn(
        `[WorkPuzzle] cached fileId for ${fileName} rejected with ${res.status}; recreating`,
      );
      return writeJsonFile(accessToken, fileName, body);
    }
    if (!res.ok) throw new Error(`Drive update failed: ${res.status}`);
    return;
  }

  const boundary = 'workpuzzle-' + Math.random().toString(36).slice(2);
  const metadata = { name: fileName, mimeType: 'application/json' };
  const multipart =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    body +
    `\r\n--${boundary}--`;

  const res = await fetch(`${UPLOAD_API}?uploadType=multipart&fields=id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipart,
    keepalive: true,
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Drive create failed: ${res.status}`);
  // Remember the new file id so the next save is a single-request PATCH.
  try {
    const created = await res.json();
    if (created?.id) fileIdCache.set(fileName, created.id);
  } catch {
    // Ignore — we'll re-discover via search on next save.
  }
}

// Download and parse the JSON content. Returns [] if file is empty or missing.
export async function readCourses(accessToken) {
  const fileId = await findCoursesFileId(accessToken);
  if (!fileId) return [];
  // Cache for the subsequent save path — turns it into a single PATCH.
  fileIdCache.set(FILE_NAME, fileId);

  const res = await fetch(`${DRIVE_API}/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);

  const text = await res.text();
  if (!text.trim()) return [];

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Corrupted file — log and start fresh rather than throw.
    // eslint-disable-next-line no-console
    console.warn('[WorkPuzzle] courses file was not valid JSON, starting fresh');
    return [];
  }
}

// Save the entire course list. Creates the file if it doesn't exist yet.
// After the main save succeeds we ALSO write a backup file (best-effort —
// backup errors are logged but never block the main save). If the main file
// is ever lost, the user can manually recover from the backup in Drive.
export async function writeCourses(accessToken, courses) {
  const body = JSON.stringify(courses, null, 2);
  await writeJsonFile(accessToken, FILE_NAME, body);

  // Fire-and-forget backup write. Don't await so a slow/failed backup
  // doesn't slow the user's perceived save.
  writeJsonFile(accessToken, BACKUP_FILE_NAME, body).catch((err) => {
    if (err instanceof AuthExpiredError) {
      // Auth issue will surface on the next main-file save too — don't
      // double-report. Just log.
      // eslint-disable-next-line no-console
      console.warn('[WorkPuzzle] backup skipped: auth expired');
      return;
    }
    // eslint-disable-next-line no-console
    console.warn('[WorkPuzzle] backup write failed', err);
  });
}

/*
 * ---- Course folder helpers ----
 *
 * Each course gets a real Drive folder under a shared "WorkPuzzle" parent so
 * the user's Drive root stays tidy. We only create — never delete — these
 * folders, in case the user has put their own stuff inside.
 *
 * drive.file scope can only see folders WE created, so this lookup naturally
 * scopes to our own parent (a user-created "WorkPuzzle" folder would be
 * invisible to us — minor edge case).
 */
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const APP_FOLDER_NAME = 'WorkPuzzle';

// Module-level cache so we don't search/create the parent on every course add.
let cachedAppFolderId = null;

// Search-only lookup — returns null if the parent doesn't exist yet. Used by
// list operations that shouldn't create a folder as a side effect.
export async function findAppFolder(accessToken) {
  if (cachedAppFolderId) return cachedAppFolderId;
  const q = `name='${APP_FOLDER_NAME}' and mimeType='${FOLDER_MIME}' and trashed=false`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name)',
    spaces: 'drive',
    pageSize: '1',
  });
  const res = await fetch(`${DRIVE_API}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Drive search failed: ${res.status}`);
  const data = await res.json();
  const id = data.files?.[0]?.id ?? null;
  if (id) cachedAppFolderId = id;
  return id;
}

export async function findOrCreateAppFolder(accessToken) {
  const existing = await findAppFolder(accessToken);
  if (existing) return existing;

  // Not found — create it at Drive root.
  const createRes = await fetch(DRIVE_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: APP_FOLDER_NAME, mimeType: FOLDER_MIME }),
  });
  if (createRes.status === 401) throw new AuthExpiredError();
  if (!createRes.ok) throw new Error(`Drive folder create failed: ${createRes.status}`);
  const created = await createRes.json();
  cachedAppFolderId = created.id;
  return created.id;
}

/*
 * List all (non-trashed) subfolders directly under the WorkPuzzle parent.
 * Returns [{ id, name, webViewLink }]. Returns [] if the parent doesn't exist.
 *
 * These folders are treated as the source of truth for course existence —
 * if the courses JSON is lost or corrupted, the app can rebuild the course
 * list from this output alone.
 */
export async function listCourseFolders(accessToken) {
  const parentId = await findAppFolder(accessToken);
  if (!parentId) return [];

  const q = `'${parentId}' in parents and mimeType='${FOLDER_MIME}' and trashed=false`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id,name,webViewLink)',
    spaces: 'drive',
    pageSize: '200',
  });
  const res = await fetch(`${DRIVE_API}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Drive list folders failed: ${res.status}`);
  const data = await res.json();
  return data.files ?? [];
}

/*
 * Reverse of the folder-naming used by createCourseFolder.
 * Folder convention: "{code} — {name}" if code is set, else just "{name}".
 */
export function parseFolderName(folderName) {
  const m = folderName.match(/^(.+?)\s+—\s+(.+)$/);
  if (m) return { code: m[1].trim(), name: m[2].trim() };
  return { code: '', name: folderName };
}

// Reset the cache on logout so a different user doesn't reuse the wrong parent.
export function clearAppFolderCache() {
  cachedAppFolderId = null;
}

/*
 * Create a Drive shortcut (like a symlink) pointing at `targetId`, placed
 * inside the folder at `parentId`. Used to mirror course-file attachments
 * into the course's Drive folder without moving or copying the user's
 * original files. Returns the shortcut file id.
 *
 * drive.file scope is enough because the shortcut is a brand-new file we
 * create. The target file just needs to be readable by the user (it is —
 * it's theirs).
 */
const SHORTCUT_MIME = 'application/vnd.google-apps.shortcut';

export async function createShortcut(accessToken, { name, targetId, parentId }) {
  const res = await fetch(`${DRIVE_API}?fields=id`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      mimeType: SHORTCUT_MIME,
      parents: [parentId],
      shortcutDetails: { targetId },
    }),
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Shortcut create failed: ${res.status}`);
  const data = await res.json();
  return data.id;
}

export async function deleteShortcut(accessToken, shortcutId) {
  const res = await fetch(`${DRIVE_API}/${shortcutId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) throw new AuthExpiredError();
  // 404 means already gone — treat as success so we don't get stuck.
  if (res.status === 404) return;
  if (!res.ok) throw new Error(`Shortcut delete failed: ${res.status}`);
}

/*
 * Create a sub-folder for a single course. Returns { id, webViewLink }.
 * Naming: "{code} — {name}" if code is set, else just "{name}".
 */
export async function createCourseFolder(accessToken, { name, code }) {
  const parentId = await findOrCreateAppFolder(accessToken);
  const folderName = code ? `${code} — ${name}` : name;

  const res = await fetch(`${DRIVE_API}?fields=id,webViewLink`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: FOLDER_MIME,
      parents: [parentId],
    }),
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) throw new Error(`Course folder create failed: ${res.status}`);
  const data = await res.json();
  return { id: data.id, webViewLink: data.webViewLink };
}
