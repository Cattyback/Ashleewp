# Reflection

## 1. Can I defend this work? Can I explain every major decision in the project?

Yes. Every decision traces back to one person: Ashlee. The platform is a web app because Ashlee uses multiple devices and shouldn't need to install anything. The Google Drive integration exists because her interview revealed Drive is where her files end up when they're not on her desktop. The manual course-file association model exists because her filenames are too inconsistent for auto-detection. The flat sidebar exists because the whole point of the tool is to reduce complexity, not add another layer of it. The GitHub Pages deployment exists because I needed a live URL Ashlee could open without any setup on her end. None of these were default choices — each one responds to something I observed or she told me.

## 2. Is this my work? Does it reflect my creative direction, or was I essentially following the AI's lead?

This is my work. The AI wrote the code, but I defined what the code should do, how it should look, and what it should not do. The problem definition came from a real conversation with Ashlee. The three rejections in my Records of Resistance — auto-detection, complex sidebar, gapi library — are all cases where the AI offered a technically reasonable solution that I overruled because it didn't fit Ashlee's actual situation. The AI doesn't know Ashlee. I do. When the AI suggested auto-sorting files by course code, it was solving an abstract problem. When I rejected it, I was solving Ashlee's problem — she names files "final draft" and "homework 3," not "DIGI_130_Assignment_2."

## 3. Could I teach this to someone else? Is my understanding deep enough to explain it?

Yes. The system has three layers. Authentication: Google OAuth via @react-oauth/google produces an access token stored in React context. Data: the access token is passed to fetch() calls against the Google Drive API v3, which returns file metadata (name, type, modified date, web link). Presentation: React components read from a CourseContext that maps user-created course names to arrays of Drive file objects. The user creates courses, attaches files from their Drive, and sees them grouped. There is no backend — everything runs client-side. I can walk through the data flow from login to file display.

## 4. Is my documentation honest? Do my AI direction logs accurately describe what I asked and what I changed?

Yes. Every entry in the AI Direction Log describes a real interaction from my Claude Code sessions. The scaffolding prompt was my first message. The gapi rejection happened when I realized I was debugging two auth flows at once. The sidebar simplification happened after I looked at the AI's output and thought "Ashlee would never use half of this." The deployment logs include the actual git authentication troubleshooting — the insteadOf rule in my .gitconfig that was silently rewriting SSH to HTTPS. I didn't manufacture resistance to fill a requirement. These are real decisions I made for real reasons.

## 5. What would I do differently next time?

I would test earlier. I built too much before putting anything in front of Ashlee. A Figma mockup or even a hand-drawn wireframe shown in week one would have surfaced the thumbnail request sooner — Ashlee told me she remembers what documents look like more than what she named them. That insight should have shaped the file list component from the start, not emerged as a post-testing discovery. I would also add persistence for course-file associations from day one. The current version loses all organization on page refresh, which is acceptable for a prototype but made real testing awkward.
