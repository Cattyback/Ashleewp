/*
 * Lightweight emoji mapping for common Drive mime types.
 * Swap for a real icon set (e.g. lucide-react) when polishing the UI.
 */
const MAP = {
  'application/vnd.google-apps.document': '📝',
  'application/vnd.google-apps.spreadsheet': '📊',
  'application/vnd.google-apps.presentation': '📽️',
  'application/vnd.google-apps.form': '📋',
  'application/vnd.google-apps.folder': '📁',
  'application/pdf': '📄',
  'application/zip': '🗜️',
  'text/plain': '📃',
};

export function iconForMime(mime) {
  if (!mime) return '📄';
  if (MAP[mime]) return MAP[mime];
  if (mime.startsWith('image/')) return '🖼️';
  if (mime.startsWith('video/')) return '🎬';
  if (mime.startsWith('audio/')) return '🎵';
  return '📄';
}
