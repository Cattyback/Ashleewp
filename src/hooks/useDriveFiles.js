import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  listDriveFiles,
  trashFile as trashFileApi,
  AuthExpiredError,
} from '../utils/driveApi.js';

/*
 * Fetches the signed-in user's recent Drive files.
 * Auto-runs when the access token changes (e.g. fresh sign-in).
 * Returns { files, loading, error, refresh } — refresh() lets the UI re-fetch
 * on demand (e.g. a section refresh button) without needing a page reload.
 */
export default function useDriveFiles() {
  const { accessToken, expireSession } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Tracks the active request so a stale response can't overwrite a newer one.
  const reqIdRef = useRef(0);

  const fetchFiles = useCallback(
    (token) => {
      if (!token) return;
      const myReq = ++reqIdRef.current;
      setLoading(true);
      setError(null);

      listDriveFiles(token)
        .then((data) => {
          if (myReq !== reqIdRef.current) return;
          setFiles(data);
        })
        .catch((err) => {
          if (myReq !== reqIdRef.current) return;
          if (err instanceof AuthExpiredError) {
            expireSession();
            return;
          }
          setError(err);
        })
        .finally(() => {
          if (myReq !== reqIdRef.current) return;
          setLoading(false);
        });
    },
    [expireSession],
  );

  useEffect(() => {
    fetchFiles(accessToken);
  }, [accessToken, fetchFiles]);

  const refresh = useCallback(() => fetchFiles(accessToken), [fetchFiles, accessToken]);

  /*
   * Move a file to Drive Trash. Optimistically removes it from local state
   * so the UI updates immediately. If the API call fails, restore the row
   * and surface the error to the caller via the returned promise.
   */
  const trashFile = useCallback(
    async (fileId) => {
      if (!accessToken) return;
      const snapshot = files;
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      try {
        await trashFileApi(accessToken, fileId);
      } catch (err) {
        setFiles(snapshot); // rollback
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        throw err;
      }
    },
    [accessToken, files, expireSession],
  );

  return { files, loading, error, refresh, trashFile };
}
