# BerwynAI Academy

A static course catalog built to demonstrate instructional design and front
end engineering, for job applications and as a preview of the BerwynAI course
offering.

No build step, no dependencies, no backend, no hosting cost. Progress
tracking, quiz grading, scenario exercises and the full gamification layer all
run client side through `localStorage`.

## What is here

Five courses are listed. One is fully built.

**AI Fundamentals: Basic Understanding** (complete)

- Seven measurable learning objectives on the course page, each mapped to
  content that actually appears in a lesson
- Five lessons, roughly 1,200 to 1,400 words each
- A video, a narration slot and generated image slots per lesson
- Hand built SVG diagrams that render whenever generated art is absent
- A decision scenario per lesson, where each of three choices produces its
  own consequence rather than a right or wrong mark
- A mastery gated quiz per lesson, requiring 2 of 3 to advance
- A 12 question certification exam at 80% to pass, which recommends the
  specific lessons behind any wrong answers
- A printable certificate showing final level, exam score and earned badges

The other four courses are deliberate placeholders.

## Adaptive and gamification behaviour

This is a static site, so there is no AI driven personalisation. What it does
have is rule based adaptivity, which is honest about its mechanism and still
demonstrates the pattern.

- **Per question remediation.** A wrong answer shows a written explanation of
  why the correct answer is correct, rather than only highlighting it.
- **Mastery gating.** A lesson only completes at 2 of 3 or better. Below that,
  the continue button is replaced by a retry.
- **Sequential unlocking.** Each lesson requires the previous one passed.
  Locked lessons show an interstitial rather than a hard redirect, and include
  a skip link so a reviewer clicking around is never trapped.
- **Targeted exam remediation.** Each exam question maps to a source lesson.
  A failed attempt lists exactly which lessons to reread.
- **XP and levels.** 100 for a lesson, 50 for a perfect quiz, 25 per scenario,
  300 for passing the exam, 200 for a perfect exam. 1,375 available across
  five levels from Novice to AI Fluent. XP is keyed per event, so retaking
  anything never double counts. The level panel lives only on the catalog
  page, where it shows a running total summed across every course so
  additional courses fold in automatically.
- **Certifications.** One tile per course on the catalog page, unlocked by
  passing that course's exam and stamped with the date.
- **Leaderboard.** A mock standings panel on the catalog page. The peer rows
  are fixed sample data and only the "You" row reflects real XP, which is
  stated on the panel itself. It demonstrates the pattern without pretending
  a backend exists.
- **Six badges** in a trophy case, ordered easy to hard so there is always a
  next one within reach, with unlock criteria visible while still locked.
  Deliberately kept small, since the progress bar already covers milestones.
- **Streak tracking** across distinct days of activity.

## Files

```
index.html                      catalog, shows in progress state per course
ASSETS.md                       image prompts and narration scripts
css/styles.css                  design system, all tokens at the top
js/progress.js                  localStorage state and rendering helpers
js/gamification.js              XP, levels, badges, streaks, unlocking
js/quiz.js                      grading, explanations, missed question tracking
js/scenario.js                  decision exercises
assets/images/                  drop generated images here
assets/audio/                   drop generated narration here
courses/ai-fundamentals/        the built course
courses/ai-everyday/            placeholder
courses/ai-workplace/           placeholder
courses/ai-productivity/        placeholder
courses/ai-custom-tooling/      placeholder
```

## Running it locally

Open `index.html` directly for a quick look, but use a local server for real
testing. Embedded YouTube players fail with a configuration error when a page
is loaded over `file://`, because there is no origin for YouTube to validate.

```
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploying to GitHub Pages

1. Create a repository and push:

   ```
   git init
   git add .
   git commit -m "BerwynAI Academy course catalog"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. In the repository, go to Settings, then Pages. Set the source to "Deploy
   from a branch", branch `main`, folder `/ (root)`. Save.
3. The site goes live at `https://<username>.github.io/<repo>/` within a
   couple of minutes.

Video embeds work correctly once deployed, because GitHub Pages serves over
HTTPS with a real origin.

### Serving it from a BerwynAI subdomain

GitHub Pages supports custom domains at no extra cost.

1. Add a file named `CNAME` at the repository root containing only the
   subdomain, for example `academy.berwynai.com`.
2. At whichever DNS provider hosts the BerwynAI domain, add a CNAME record
   pointing `academy` to `<username>.github.io`.
3. Back in Settings, then Pages, enter the same domain and enable "Enforce
   HTTPS" once the DNS check passes.

## Adding images, audio and video

See `ASSETS.md`. It lists every slot with its exact target filename,
dimensions, the literal prompt to paste into an image model, and a full
narration script per lesson.

Missing assets are handled gracefully. Images that fail to load are replaced
by the built in SVG diagram, and audio players hide themselves. You can add
media in any order, or never.

## Rebranding

Every colour, radius, shadow and font sits in the `:root` block at the top of
`css/styles.css`. Change the values there and the whole site follows.

## Building out the remaining courses

Copy `courses/ai-fundamentals/` as a template. Update the lesson prose,
quizzes, scenarios and exam, then change that course's card in `index.html`
from `is-soon` with a `badge-soon` to a live link with a `badge-live`. The
gamification layer keys off the course id, so each course tracks its own
progress independently with no extra work.

## Favicon, social preview and 404

- `favicon.svg` sits at the site root and is linked from every page.
- Every page carries Open Graph and Twitter card tags, and
  `assets/images/og-card.jpg` (1200x630) is the preview image, so pasting a
  link into LinkedIn, Slack or an email renders a real card rather than a
  blank box.
- `404.html` is served automatically by GitHub Pages for unknown paths. Its
  styles are inlined rather than linked, because Pages serves this one file for
  misses at any depth: a relative link would resolve differently depending on
  which URL missed, and an absolute one breaks on a project site served from
  `/repo/`. It therefore needs no adjustment wherever the site is deployed.
- The `og:image` paths are relative. Most platforms resolve them, but a few
  require absolute URLs. After deploying, if the preview card does not appear,
  make them absolute in one pass:

  ```
  grep -rl 'og:image' . --include=*.html | xargs sed -i '' \
    's#content="\(\.\./\)*assets/images/og-card.jpg"#content="https://YOUR-DOMAIN/assets/images/og-card.jpg"#'
  ```

## Accessibility

- A skip link is the first focusable element on every page.
- Every interactive control is a real `<button>` or `<a>`, so the quizzes,
  hands on exercises, charter builder and coaching simulator are all keyboard
  operable, and `:focus-visible` gives them a visible ring.
- `js/reveal.js` fades content in on scroll, and does nothing at all for
  anyone whose system asks for reduced motion. Content is visible by default;
  the animation classes are only applied once support is confirmed, so
  JavaScript failing never leaves a blank page.
