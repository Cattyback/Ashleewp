import { useEffect } from 'react';

/*
 * Global keyboard shortcuts. Skips when the user is typing in an input
 * (so `n` or `r` doesn't fire while filling out a form). ⌘K/Ctrl+K always
 * fires — that's the universal "open command palette" gesture and users
 * expect it to work mid-typing.
 */

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (el.isContentEditable) return true;
  return false;
}

export default function useGlobalKeyboard({ onCommandPalette, onShortcutsHelp, onNewCourse, onRefresh }) {
  useEffect(() => {
    const handler = (e) => {
      // ⌘K / Ctrl+K — always honored, even mid-typing.
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Single-key shortcuts are suppressed while typing.
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // `?` (Shift + /) — help overlay.
      if (e.key === '?') {
        e.preventDefault();
        onShortcutsHelp?.();
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onNewCourse?.();
        return;
      }
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onRefresh?.();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCommandPalette, onShortcutsHelp, onNewCourse, onRefresh]);
}
