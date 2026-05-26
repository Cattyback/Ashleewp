import { createContext, useCallback, useContext, useState } from 'react';

/*
 * Global UI state for app-level overlays: command palette, shortcuts help,
 * "what we access" explainer. Kept here so any component (Header dropdown,
 * empty-state CTAs, keyboard listeners) can open them without prop drilling.
 */

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [whatWeAccessOpen, setWhatWeAccessOpen] = useState(false);
  const [addCourseOpen, setAddCourseOpen] = useState(false);

  const closeAll = useCallback(() => {
    setCommandPaletteOpen(false);
    setShortcutsHelpOpen(false);
    setWhatWeAccessOpen(false);
    setAddCourseOpen(false);
  }, []);

  const value = {
    commandPaletteOpen,
    openCommandPalette: () => setCommandPaletteOpen(true),
    closeCommandPalette: () => setCommandPaletteOpen(false),

    shortcutsHelpOpen,
    openShortcutsHelp: () => setShortcutsHelpOpen(true),
    closeShortcutsHelp: () => setShortcutsHelpOpen(false),

    whatWeAccessOpen,
    openWhatWeAccess: () => setWhatWeAccessOpen(true),
    closeWhatWeAccess: () => setWhatWeAccessOpen(false),

    addCourseOpen,
    openAddCourse: () => setAddCourseOpen(true),
    closeAddCourse: () => setAddCourseOpen(false),

    closeAll,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>');
  return ctx;
}
