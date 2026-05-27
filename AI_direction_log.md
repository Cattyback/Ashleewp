# AI Direction Log

### Record 1: Project Scaffolding

**My Instructions:** I asked the AI to set up a Vite + React project with Google OAuth login, Tailwind CSS v4, and a basic two-page structure (landing page + dashboard). I specified that the app should use @react-oauth/google for authentication and react-router-dom for routing.

**AI Output:** The AI generated a complete project scaffold with AuthContext, GoogleOAuthProvider wrapper, BrowserRouter, and a protected route pattern that redirects unauthenticated users back to the landing page.

**My Decision:** I kept the overall structure. I renamed components to match my mental model — for example, CourseGrid instead of the generic FileGrid the AI suggested. I also rewrote the landing page copy entirely because the AI-generated text was generic startup language that didn't match what WorkPuzzle actually does.

### Record 2: Google Drive API Integration

**My Instructions:** I asked the AI to write a utility module (driveApi.js) that fetches files from the authenticated user's Google Drive using the Drive API v3. I needed support for listing files, searching, and getting file metadata.

**AI Output:** The AI produced a full API wrapper with listFiles(), searchFiles(), and getFileMetadata() functions using Google's gapi client library.

**My Decision:** I switched from gapi to direct fetch() calls with the OAuth access token. The gapi library requires loading an external script, initializing a separate client, and managing its own auth state — that's two auth systems in one app. Direct fetch() to the REST endpoints with our existing token is simpler, lighter, and keeps one source of truth for authentication.

### Record 3: Course-to-File Mapping Logic

**My Instructions:** I asked the AI to build a system where users can create courses manually and then attach Google Drive files to each course. The goal was to let Ashlee group her files by class.

**AI Output:** The AI generated a CourseContext with local state management, AddCourseModal for creating courses, and AttachFilesModal for browsing Drive files and associating them with a course. It also suggested an auto-detection feature that would scan filenames for course codes (like "ARTH 101") to sort files automatically.

**My Decision:** I kept the manual course creation and file attachment flow. I rejected the auto-detection feature entirely (see Records of Resistance #1). Ashlee's filenames are inconsistent — "final draft," "homework 3," untitled Google Docs — and auto-classification would misfire constantly. A tool that gets it wrong is worse than one that asks you to do it manually.

### Record 4: UI Components and Layout

**My Instructions:** I asked the AI to build the dashboard UI: sidebar navigation with course list, course cards showing file counts, file list with icons and "open in Drive" links, and a header with user info and sign-out button.

**AI Output:** The AI generated a full component set — Sidebar.jsx, CourseCard.jsx, CourseGrid.jsx, CourseFiles.jsx, FileList.jsx, Header.jsx, and RefreshButton.jsx. The sidebar included nested navigation with sections for recent files, favorites, and settings.

**My Decision:** I kept the component structure but simplified the Sidebar significantly. Ashlee's problem is too much complexity in finding files — adding more navigation layers contradicts the purpose. I stripped it down to a flat list of courses. I also changed the color scheme; the AI defaulted to high-contrast corporate blue, and I softened it.

### Record 5: GitHub Pages Deployment

**My Instructions:** I asked the AI to deploy the app to GitHub Pages with working Google OAuth.

**AI Output:** The AI configured Vite's base path to /Ashleewp/, added basename to BrowserRouter, wrote a GitHub Actions workflow (deploy.yml) with VITE_GOOGLE_CLIENT_ID injected as a repository secret, and added a 404.html SPA fallback so client-side routes don't break.

**My Decision:** I kept everything. Deployment configuration is mechanical — there's a correct answer and the AI got it right. I did have to manually complete three steps the AI couldn't do for me: adding my SSH key to GitHub, creating the repository secret, and authorizing https://cattyback.github.io in Google Cloud Console. The AI guided me through each step clearly.

### Record 6: Git Authentication Troubleshooting

**My Instructions:** I asked the AI to push code to GitHub. The push failed because HTTPS password authentication was disabled.

**AI Output:** The AI diagnosed the issue systematically: checked for gh CLI (not installed), found my existing SSH key (id_ed25519), tested SSH connectivity (failed — key wasn't added to GitHub), copied the public key to my clipboard, and then discovered a global .gitconfig rule (url.https://github.com/.insteadOf = git@github.com:) that was silently rewriting all SSH URLs to HTTPS.

**My Decision:** I followed the AI's guidance to add the SSH key to GitHub. The push ultimately succeeded via HTTPS + Windows Credential Manager. The insteadOf diagnosis was impressive — I wouldn't have found that on my own. This interaction was purely operational, not design-related, but it demonstrated the AI's value in debugging environment issues.
