/*
 * Thin wrapper around the Google Drive v3 REST API.
 * Using plain `fetch` keeps the bundle small — no need for the gapi SDK.
 * Docs: https://developers.google.com/drive/api/v3/reference/files/list
 */

const DRIVE_API = 'https://www.googleapis.com/drive/v3/files';

// Thrown when Drive returns 401 — our access token expired or was revoked.
// Callers catch this and trigger expireSession() on AuthContext.
export class AuthExpiredError extends Error {
  constructor(message = 'Drive access token expired') {
    super(message);
    this.name = 'AuthExpiredError';
  }
}

/*
 * GET-only retry helper. Drive occasionally returns 5xx as a transient blip —
 * a couple of backoff retries clear most of them without surfacing an error.
 * Restricted to GET because retrying a PATCH/POST/DELETE could double-apply.
 */
async function fetchWithRetry(url, options, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, options);
    if (res.status < 500 || res.status >= 600 || attempt >= retries) return res;
    await new Promise((r) => setTimeout(r, 500 * 3 ** attempt));
  }
}

/*
 * Move a file (or folder) to Trash. Files in Trash auto-delete after ~30 days
 * and can be restored from the Drive UI until then — safer than a hard delete.
 * PATCH with `{trashed: true}` is the Drive-native way to do this.
 */
export async function trashFile(accessToken, fileId) {
  const res = await fetch(`${DRIVE_API}/${fileId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trashed: true }),
  });
  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive trash failed: ${res.status} ${text}`);
  }
}

export async function listDriveFiles(accessToken, { pageSize = 100 } = {}) {
  // `folder` puts folders before files; `modifiedTime desc` orders within each
  // group (so within folders: newest folders first; within files: newest files
  // first). Bigger pageSize keeps files visible after folders take their share.
  const params = new URLSearchParams({
    pageSize: String(pageSize),
    // Without this, files.list returns trashed items too — they'd reappear
    // after a "delete" (which is really a move-to-trash via PATCH).
    q: 'trashed=false',
    orderBy: 'folder,modifiedTime desc',
    fields: 'files(id,name,mimeType,modifiedTime,iconLink,webViewLink)',
  });

  const res = await fetchWithRetry(`${DRIVE_API}?${params}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (res.status === 401) throw new AuthExpiredError();
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Drive API ${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.files ?? [];
}
