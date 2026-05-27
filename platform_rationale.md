# Platform Rationale

**Platform: React web application (Vite + React 18 + Tailwind CSS v4), deployed on GitHub Pages**

## Why a web app?

Ashlee works across devices — laptop at home, library computers, sometimes her phone. A web app requires no installation and is accessible from any browser. This is not a power tool that needs native performance; it's a view layer over Google Drive.

## Why React?

React is the shared language of this classroom, and the component model maps naturally to the UI: course cards, file lists, modals. React Router handles the two-view structure (landing → dashboard) cleanly.

## Why Google Drive integration (not local file system)?

Ashlee's interview revealed that when files aren't on her desktop, she goes to Google Docs. Google Drive is already her secondary file store. WorkPuzzle meets her where her files already live rather than asking her to migrate.

## Why GitHub Pages?

Free, automatic deployment on every push, and produces a stable public URL for submission and testing. The app is entirely client-side (Google OAuth + Drive API calls happen in the browser), so no server is needed.
