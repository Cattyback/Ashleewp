import { useCallback } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import CourseFiles from '../components/CourseFiles.jsx';
import FileList from '../components/FileList.jsx';
import CommandPalette from '../components/CommandPalette.jsx';
import ShortcutsHelp from '../components/ShortcutsHelp.jsx';
import WhatWeAccess from '../components/WhatWeAccess.jsx';
import { useCourses } from '../context/CourseContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import useGlobalKeyboard from '../hooks/useGlobalKeyboard.js';

/*
 * Dashboard layout (responsive):
 *   - Mobile:  Header / Nav (horizontal scroll) / Main content stacked
 *   - Desktop: Header / Sidebar + Main side-by-side
 *
 * Global keyboard shortcuts (⌘K / ? / N / R) and overlays (command palette,
 * shortcuts help, transparency modal) are wired here so they only exist on
 * the authenticated dashboard route — not on the landing page.
 */
export default function Dashboard() {
  const { refresh } = useCourses();
  const { openCommandPalette, openShortcutsHelp, openAddCourse } = useUI();

  const handleNewCourse = useCallback(() => openAddCourse(), [openAddCourse]);
  const handleRefresh = useCallback(() => refresh(), [refresh]);

  useGlobalKeyboard({
    onCommandPalette: openCommandPalette,
    onShortcutsHelp: openShortcutsHelp,
    onNewCourse: handleNewCourse,
    onRefresh: handleRefresh,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 md:px-6 py-6 gap-6">
        <Sidebar />

        <main className="flex-1 space-y-10 min-w-0">
          <div id="nav-courses" className="scroll-mt-20">
            <CourseGrid />
          </div>
          <div id="nav-organize" className="scroll-mt-20">
            <CourseFiles />
          </div>
          <div id="nav-recent" className="scroll-mt-20">
            <FileList />
          </div>
        </main>
      </div>

      <CommandPalette onNewCourse={handleNewCourse} onRefresh={handleRefresh} />
      <ShortcutsHelp />
      <WhatWeAccess />
    </div>
  );
}
