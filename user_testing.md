# User Testing Evidence

## Test Session — First Contact with Ashlee Wang
#photorecord:https://docs.google.com/document/d/1KfT_RS0DHbR6VvWimlVFkgWq7DtUimwN6IcFiW0lhwA/edit?usp=sharing 

**Setting:** Video call. Ashlee opened the live URL (https://cattyback.github.io/Ashleewp/) on her laptop.

### Observations

- Ashlee signed in with Google without hesitation — the OAuth flow was familiar to her
- She immediately understood the course card layout: "这就是我的课对吧？" ("These are my courses, right?")
- She created three courses matching her current quarter schedule within 30 seconds
- When attaching files, she paused — the file list from Drive was long and unsorted. She scrolled looking for specific files
- She asked: "能不能看到文件的样子？名字我记不住" ("Can I see what the file looks like? I can't remember names") — this revealed a need for thumbnails/previews I hadn't anticipated
- After attaching files to courses, she said the grouped view "比我自己整理好多了" ("is way better than organizing myself")

### What surprised me

- Visual recognition matters more than filename recall for Ashlee
- She didn't try to use the search/keyword approach she described in the interview — the course grouping replaced that behavior entirely
- The loading delay when fetching files from Drive API confused her briefly before the spinner appeared

### Iteration based on testing

- Added loading indicators for Drive API calls
- Explored adding file thumbnails (partial — Drive API provides thumbnailLink but requires additional scopes)
- Identified persistence as the critical missing feature: course-file associations reset on page refresh

(Screen recordings and additional photos available upon request)
