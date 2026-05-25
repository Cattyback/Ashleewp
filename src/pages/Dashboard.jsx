import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CourseGrid from '../components/CourseGrid.jsx';
import CourseFiles from '../components/CourseFiles.jsx';
import FileList from '../components/FileList.jsx';

/*
 * Dashboard layout (responsive):
 *   - Mobile:  Header / Nav (horizontal scroll) / Main content stacked
 *   - Desktop: Header / Sidebar + Main side-by-side
 *
 * The `nav-*` ids on the section wrappers are anchor targets for the
 * Sidebar's smooth-scroll links. `scroll-mt-20` (80px) leaves clearance
 * for the 64px sticky Header when scrolling lands on a section top.
 */
export default function Dashboard() {
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
    </div>
  );
}
