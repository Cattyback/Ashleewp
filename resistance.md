# Records of Resistance

### Resistance 1: Rejected Auto-Detection of Courses from Filenames

**What AI produced:** When building the course-file mapping, the AI suggested scanning filenames and contents for course codes (like "ARTH 101" or "DIGI 130") to automatically sort files into courses. It generated a regex-based parser that would extract patterns from file names and metadata.

**Why I rejected it:** Ashlee doesn't name her files consistently. Some are "final draft," some are "homework 3," some are untitled Google Docs with auto-generated names. Auto-detection would misclassify files and erode trust in the tool. A system that guesses wrong is worse than one that asks you to do it yourself — especially when the consequence is losing track of your work, which is the exact problem we're trying to solve.

**What I did instead:** Kept the manual course creation + file attachment model. The user creates courses by name, then explicitly selects which Drive files belong to each course. It requires more effort upfront but is always accurate. Ashlee confirmed during testing that she preferred this — she said she knows which files go where, she just needs a place to put them.

### Resistance 2: Rejected Complex Sidebar Navigation

**What AI produced:** A sidebar with nested navigation sections: course categories, a "Recent Files" section, a favorites/starred section, and a collapsible settings panel. It looked polished but introduced three levels of hierarchy.

**Why I rejected it:** Ashlee's core problem is that she can't find files because they're scattered everywhere with no structure. Adding more navigation layers — categories within categories, favorites on top of courses — recreates the complexity problem inside the tool that's supposed to solve it. The cognitive load of "where did I put this in WorkPuzzle?" should be zero.

**What I did instead:** Stripped the sidebar to a flat list of course names. One click shows that course's files. No nesting, no settings, no favorites, no recent section. Two levels total: courses → files. That's it.

### Resistance 3: Rejected gapi Client Library for Drive API

**What AI produced:** Used Google's gapi client library to interact with the Drive API. This required loading an external script tag, calling gapi.load('client'), initializing the client with API keys, and managing a separate authentication state from our React OAuth flow.

**Why I rejected it:** Two authentication systems in one small app is a maintenance problem and a debugging nightmare. The gapi library manages its own token state, which can fall out of sync with the @react-oauth/google token stored in our AuthContext. When something breaks, you're debugging two auth flows instead of one. The library is also heavyweight — we only need to list files and get metadata, not the full Drive SDK.

**What I did instead:** Direct fetch() calls to https://www.googleapis.com/drive/v3/files with the OAuth access token in the Authorization header. One token, one auth flow, one place to debug. The code is shorter, the dependency count is lower, and it does exactly what we need.
