# Post-Mortem

## What worked

The interview-first approach worked. Having three structured questions in Chinese (Ashlee's comfortable language) got honest, specific answers. Her response about searching by keyword revealed that she does have a retrieval strategy — it's just inefficient. That reframing, from "no system" to "bad system," made the design clearer: don't build a system from scratch, build a better lens on top of what already exists (Google Drive).

The platform choice proved correct. Ashlee tested the live URL on her own laptop without any setup. GitHub Pages deployment meant I could send her a link and she could use it immediately. No downloads, no accounts, no configuration — just Google sign-in, which she already knows how to do.

The manual course-file model worked better than I expected. I was worried Ashlee would find it tedious to associate files one by one. Instead, she moved quickly through it and said the act of associating files actually helped her remember what she had. The organization process became a form of review.

## What failed

The first version had no visual feedback when files were being loaded from Drive. Ashlee clicked a course card and thought it was broken because nothing happened for 2 seconds. I added a loading state after that test, but I should have anticipated it. API calls take time; the UI must communicate that.

I didn't build any persistence for course-file associations. Every time Ashlee refreshes the page, she has to re-add her courses and re-attach files. For a real product this would be unacceptable. For a prototype testing whether course-based grouping helps, it was sufficient — but barely. This was the single biggest limitation in testing.

I also underestimated the importance of visual recognition. Ashlee told me she remembers what documents look like, not what she named them. The file list currently shows only names and icons. Thumbnails would have made the tool significantly more useful, but the Drive API requires additional OAuth scopes for thumbnail access, and I ran out of time to implement it.

## What I learned

Designing for one person is harder than designing for a demographic. A demographic lets you average away edge cases. One person is an edge case. Ashlee's specific mix of habits — desktop dumping, Google Docs as backup, Chinese-language workflow, visual memory for documents — wouldn't appear in any persona template. That specificity forced better design decisions.

AI is a multiplier, not a substitute. It multiplied my ability to ship code, but it couldn't multiply my understanding of Ashlee's problem. That understanding had to come first, and it had to come from me. The moments where I directed the AI most effectively were the moments where I knew exactly what I wanted because I had listened to Ashlee.

The biggest gap between "prototype" and "product" is persistence. Almost everything about WorkPuzzle works in a single session. The moment you refresh, you start over. That single limitation — no saved state — is the difference between a tool someone uses once and a tool someone relies on.
