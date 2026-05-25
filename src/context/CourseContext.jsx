import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useAuth } from './AuthContext.jsx';
import {
  readCourses,
  writeCourses,
  createCourseFolder,
  createShortcut,
  deleteShortcut,
  listCourseFolders,
  parseFolderName,
  clearAppFolderCache,
  clearCoursesFileCache,
} from '../utils/coursesDrive.js';
import { AuthExpiredError, trashFile } from '../utils/driveApi.js';

// Fallback swatches for courses reconstructed from a Drive folder alone
// (no JSON metadata). Picked deterministically by folder id so the same
// folder always rebuilds to the same color.
const FALLBACK_PALETTE = [
  '#355355', '#a37561', '#63869a', '#485a65', '#9e8c84', '#d4b3b2',
];
const colorForFolder = (folderId) => {
  let h = 0;
  for (let i = 0; i < folderId.length; i++) h = (h * 31 + folderId.charCodeAt(i)) | 0;
  return FALLBACK_PALETTE[Math.abs(h) % FALLBACK_PALETTE.length];
};

/*
 * Merge JSON-stored course metadata with the actual subfolder listing under
 * the WorkPuzzle parent. Drive folders are the source of truth for which
 * courses exist — JSON adds metadata (color, instructor, files, etc.).
 *
 * Rules:
 *   - Folder present + JSON entry with matching folderId → use JSON, refresh
 *     name/code/folderLink from the folder so renames in Drive propagate.
 *   - Folder present + no JSON entry → reconstruct a minimal course.
 *   - JSON entry whose folderId doesn't match any live folder → drop it
 *     (folder was trashed/deleted in Drive).
 *   - JSON entry with no folderId yet (just-added, folder create in flight)
 *     → keep as-is so optimistic creates don't disappear mid-flight.
 */
function mergeCoursesWithFolders(jsonCourses, folders) {
  const jsonByFolderId = new Map();
  for (const c of jsonCourses) {
    if (c.folderId) jsonByFolderId.set(c.folderId, c);
  }

  const fromFolders = folders.map((folder) => {
    const parsed = parseFolderName(folder.name);
    const existing = jsonByFolderId.get(folder.id);
    if (existing) {
      return {
        ...existing,
        name: parsed.name,
        code: parsed.code,
        folderId: folder.id,
        folderLink: folder.webViewLink,
        files: existing.files ?? [],
      };
    }
    return {
      id: folder.id,
      name: parsed.name,
      code: parsed.code,
      instructor: '',
      color: colorForFolder(folder.id),
      createdAt: Date.now(),
      files: [],
      folderId: folder.id,
      folderLink: folder.webViewLink,
    };
  });

  const inFlight = jsonCourses.filter((c) => !c.folderId);
  return [...fromFolders, ...inFlight];
}

/*
 * Manages the user's course list and keeps it synced to Drive.
 *
 * Course shape:
 *   { id, name, code?, instructor?, color, createdAt,
 *     files: [{ id, name, mimeType, iconLink, webViewLink }],
 *     folderId?, folderLink? }  // populated async after Drive folder is created
 *
 * Sync behaviour:
 *   - On sign-in: load from Drive once.
 *   - On any mutation: debounced save (1s) so rapid edits don't spam the API.
 *   - We never *partially* save — always the full array. Simple, atomic.
 *   - Older course records (no `files` field) are normalized to [] on load
 *     so the rest of the app can assume the field exists.
 *   - Creating a course also creates a Drive sub-folder under "WorkPuzzle/".
 *     We do NOT delete that folder on course delete (user might have put
 *     files in it manually).
 *   - refresh() re-reads from Drive on demand (UI refresh button). Each
 *     refresh cancels the previous load so a stale response can't clobber
 *     newer data.
 */

const CourseContext = createContext(null);
const SAVE_DEBOUNCE_MS = 1000;

export function CourseProvider({ children }) {
  const { accessToken, expireSession } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncError, setSyncError] = useState(null);

  // Track whether the current `courses` state came from a fresh load vs a user
  // edit. We don't want to save right after loading (no-op write).
  const justLoadedRef = useRef(true);
  const saveTimerRef = useRef(null);
  // Token object representing the currently-in-flight load. Setting
  // `.cancelled = true` makes the in-flight load (and its backfill) bail out.
  const activeLoadRef = useRef(null);
  // Mirror of `courses` so async callbacks can read the latest state without
  // becoming a hook dep.
  const coursesRef = useRef(courses);
  useEffect(() => {
    coursesRef.current = courses;
  }, [courses]);

  // Immediate (non-debounced) save. Used by discrete user actions like
  // add/delete so a fast page refresh can't race the 1s debounce and lose the
  // edit. Cancels any pending debounced save to avoid a double-write.
  const saveNow = useCallback(
    (next) => {
      if (!accessToken) return;
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      writeCourses(accessToken, next).catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] failed to save courses to Drive', err);
        setSyncError(err);
      });
    },
    [accessToken, expireSession],
  );

  const loadCourses = useCallback(() => {
    if (!accessToken) {
      setCourses([]);
      justLoadedRef.current = true;
      clearAppFolderCache();
      clearCoursesFileCache();
      return;
    }

    // Cancel any previous load so its callbacks become no-ops.
    if (activeLoadRef.current) activeLoadRef.current.cancelled = true;
    const token = { cancelled: false };
    activeLoadRef.current = token;

    setLoading(true);
    setSyncError(null);

    // Create any shortcuts a course is missing. Sequential so we don't
    // burst Drive's per-second quota on a course with lots of files.
    const backfillShortcutsFor = async (course, folderId) => {
      for (const file of course.files) {
        if (token.cancelled || !accessToken) return;
        if (file.shortcutId) continue;
        try {
          const shortcutId = await createShortcut(accessToken, {
            name: file.name,
            targetId: file.id,
            parentId: folderId,
          });
          if (token.cancelled) return;
          setCourses((prev) =>
            prev.map((c) =>
              c.id === course.id
                ? {
                    ...c,
                    files: c.files.map((f) =>
                      f.id === file.id ? { ...f, shortcutId } : f,
                    ),
                  }
                : c,
            ),
          );
        } catch (err) {
          if (token.cancelled) return;
          if (err instanceof AuthExpiredError) {
            expireSession();
            return;
          }
          // eslint-disable-next-line no-console
          console.error('[WorkPuzzle] shortcut backfill failed for', file.name, err);
        }
      }
    };

    const backfillFolders = async (missing) => {
      for (const course of missing) {
        if (token.cancelled || !accessToken) return;
        try {
          const { id, webViewLink } = await createCourseFolder(accessToken, {
            name: course.name,
            code: course.code,
          });
          if (token.cancelled) return;
          setCourses((prev) =>
            prev.map((c) =>
              c.id === course.id ? { ...c, folderId: id, folderLink: webViewLink } : c,
            ),
          );
          // Folder just got created — if the course already had files
          // attached, create their shortcuts now.
          if (course.files.length > 0) await backfillShortcutsFor(course, id);
        } catch (err) {
          if (token.cancelled) return;
          if (err instanceof AuthExpiredError) {
            expireSession();
            return;
          }
          // eslint-disable-next-line no-console
          console.error('[WorkPuzzle] backfill folder failed for', course.name, err);
        }
      }
    };

    Promise.all([readCourses(accessToken), listCourseFolders(accessToken)])
      .then(([jsonData, folders]) => {
        if (token.cancelled) return;
        const jsonNormalized = jsonData.map((c) => ({ ...c, files: c.files ?? [] }));
        const merged = mergeCoursesWithFolders(jsonNormalized, folders);
        justLoadedRef.current = true;
        setCourses(merged);

        // Persist immediately if folders contributed any courses that
        // weren't in JSON (recovery case) — so the recovered list is
        // captured in JSON for the next load.
        const reconstructedAny = merged.length !== jsonNormalized.length
          || merged.some((m) => {
            const j = jsonNormalized.find((c) => c.folderId === m.folderId);
            return !j;
          });
        if (reconstructedAny) saveNow(merged);

        const missingFolder = merged.filter((c) => !c.folderId);
        if (missingFolder.length > 0) backfillFolders(missingFolder);

        // Independently backfill shortcuts for courses that already have a
        // folder but whose files are missing shortcuts.
        const needShortcuts = merged.filter(
          (c) => c.folderId && c.files.some((f) => !f.shortcutId),
        );
        if (needShortcuts.length > 0) {
          (async () => {
            for (const course of needShortcuts) {
              if (token.cancelled) return;
              await backfillShortcutsFor(course, course.folderId);
            }
          })();
        }
      })
      .catch((err) => {
        if (token.cancelled) return;
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        setSyncError(err);
      })
      .finally(() => {
        if (!token.cancelled) setLoading(false);
      });
  }, [accessToken, expireSession]);

  // Auto-load on sign-in / token change. Cleanup cancels the in-flight load.
  useEffect(() => {
    loadCourses();
    return () => {
      if (activeLoadRef.current) activeLoadRef.current.cancelled = true;
    };
  }, [loadCourses]);

  // Debounced save on every change (skipping the initial load).
  useEffect(() => {
    if (!accessToken) return;
    if (justLoadedRef.current) {
      justLoadedRef.current = false;
      return;
    }

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      writeCourses(accessToken, courses).catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] failed to save courses to Drive', err);
        setSyncError(err);
      });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(saveTimerRef.current);
  }, [courses, accessToken, expireSession]);

  const addCourse = (partial) => {
    const course = {
      id: crypto.randomUUID(),
      name: partial.name.trim(),
      code: partial.code?.trim() || '',
      instructor: partial.instructor?.trim() || '',
      color: partial.color || '#6366f1',
      createdAt: Date.now(),
      files: [],
    };
    const nextCourses = [...coursesRef.current, course];
    setCourses(nextCourses);

    if (!accessToken) return;

    // Persist immediately so a quick page refresh doesn't lose the new course.
    // Without this, the 1s debounced save races the user reloading the tab.
    saveNow(nextCourses);

    createCourseFolder(accessToken, { name: course.name, code: course.code })
      .then(({ id, webViewLink }) => {
        const withFolder = coursesRef.current.map((c) =>
          c.id === course.id ? { ...c, folderId: id, folderLink: webViewLink } : c,
        );
        setCourses(withFolder);
        // Save again so the folderId is also persisted right away — otherwise
        // a refresh would trigger the load-time backfill to create a duplicate.
        saveNow(withFolder);
      })
      .catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] failed to create course folder', err);
        setSyncError(err);
      });
  };

  const deleteCourse = (id) => {
    const target = coursesRef.current.find((c) => c.id === id);
    const nextCourses = coursesRef.current.filter((c) => c.id !== id);
    setCourses(nextCourses);
    saveNow(nextCourses);

    // Drive folders are the source of truth for course existence. If we don't
    // trash the folder, the next load reconstructs the course from it. Trash
    // is reversible from the Drive UI for 30 days.
    if (accessToken && target?.folderId) {
      trashFile(accessToken, target.folderId).catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] failed to trash course folder', err);
      });
    }
  };

  const setCourseColor = (id, color) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, color } : c)));
  };

  // Replace the full file list on a course (used by the multi-select picker).
  // Mirrors the change to Drive: new files get a shortcut in the course
  // folder, removed files get their shortcut deleted. Shortcut errors are
  // logged but never block the app-state update.
  const setCourseFiles = (courseId, fileRefs) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    if (!targetCourse) return;
    const current = targetCourse.files;
    const currentById = new Map(current.map((f) => [f.id, f]));

    // Dedupe + preserve existing shortcutId on unchanged files (so we don't
    // delete-then-recreate a shortcut that's already correct).
    const seen = new Set();
    const newFiles = [];
    for (const ref of fileRefs) {
      if (seen.has(ref.id)) continue;
      seen.add(ref.id);
      const existing = currentById.get(ref.id);
      newFiles.push(existing ? { ...ref, shortcutId: existing.shortcutId } : ref);
    }

    const newIds = new Set(newFiles.map((f) => f.id));
    const removed = current.filter((f) => !newIds.has(f.id));
    const addedIdsForShortcut = newFiles.filter(
      (f) => !currentById.has(f.id) && targetCourse.folderId,
    );

    // Optimistic state update.
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, files: newFiles } : c)),
    );

    if (!accessToken) return;

    // Fire-and-forget shortcut create for each newly-added file. Patch
    // shortcutId back when ready.
    addedIdsForShortcut.forEach((f) => {
      createShortcut(accessToken, {
        name: f.name,
        targetId: f.id,
        parentId: targetCourse.folderId,
      })
        .then((shortcutId) => {
          setCourses((prev) =>
            prev.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    files: c.files.map((file) =>
                      file.id === f.id ? { ...file, shortcutId } : file,
                    ),
                  }
                : c,
            ),
          );
        })
        .catch((err) => {
          if (err instanceof AuthExpiredError) {
            expireSession();
            return;
          }
          // eslint-disable-next-line no-console
          console.error('[WorkPuzzle] shortcut create failed for', f.name, err);
        });
    });

    // Delete shortcuts for files that were removed.
    removed.forEach((f) => {
      if (!f.shortcutId) return;
      deleteShortcut(accessToken, f.shortcutId).catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] shortcut delete failed for', f.name, err);
      });
    });
  };

  // Called when a Drive file/folder has been trashed via the Recent files
  // section. Two cases:
  //   - It's the backing folder of a course → delete the whole course.
  //   - It's attached to one or more courses as a file → detach it everywhere
  //     and clean up the matching shortcuts in Drive.
  const onDriveFileTrashed = (fileId) => {
    const shortcutsToDelete = [];
    for (const c of courses) {
      if (c.folderId === fileId) continue; // course will be removed entirely
      const file = c.files.find((f) => f.id === fileId);
      if (file?.shortcutId) shortcutsToDelete.push(file);
    }

    setCourses((prev) =>
      prev
        .filter((c) => c.folderId !== fileId)
        .map((c) =>
          c.files.some((f) => f.id === fileId)
            ? { ...c, files: c.files.filter((f) => f.id !== fileId) }
            : c,
        ),
    );

    if (!accessToken) return;
    for (const file of shortcutsToDelete) {
      deleteShortcut(accessToken, file.shortcutId).catch((err) => {
        if (err instanceof AuthExpiredError) {
          expireSession();
          return;
        }
        // eslint-disable-next-line no-console
        console.error('[WorkPuzzle] shortcut delete failed for', file.name, err);
      });
    }
  };

  const detachFile = (courseId, fileId) => {
    const targetCourse = courses.find((c) => c.id === courseId);
    const file = targetCourse?.files.find((f) => f.id === fileId);

    setCourses((prev) =>
      prev.map((c) =>
        c.id === courseId ? { ...c, files: c.files.filter((f) => f.id !== fileId) } : c,
      ),
    );

    if (!accessToken || !file?.shortcutId) return;
    deleteShortcut(accessToken, file.shortcutId).catch((err) => {
      if (err instanceof AuthExpiredError) {
        expireSession();
        return;
      }
      // eslint-disable-next-line no-console
      console.error('[WorkPuzzle] shortcut delete failed for', file.name, err);
    });
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        loading,
        syncError,
        addCourse,
        deleteCourse,
        setCourseColor,
        setCourseFiles,
        detachFile,
        onDriveFileTrashed,
        refresh: loadCourses,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const ctx = useContext(CourseContext);
  if (!ctx) throw new Error('useCourses must be used inside <CourseProvider>');
  return ctx;
}
