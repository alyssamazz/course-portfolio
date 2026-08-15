# Asset production brief

Everything the course needs in order to swap its built in SVG fallbacks for
generated media. Drop files into the paths below and they appear
automatically. Nothing else needs editing.

If a file is absent the page detects the failed load and shows the hand built
SVG version instead, so the course always looks finished. You can produce
these in any order, or skip any of them permanently.

---

## Read this before generating images

Image models garble text. Any picture that needs legible labels, arrows
tied to specific words, or numbers in the right boxes will come back wrong,
and fixing it takes more iterations than it saves.

That splits the image list in two:

- **Tier 1, worth generating.** Abstract or illustrative hero images with no
  text in them. Nano Banana handles these well.
- **Tier 2, keep the SVG.** The five explanatory diagrams. They already
  render crisply at any size, they are accessible to screen readers, they
  restyle instantly if you change the brand palette, and they cost nothing.
  Only replace one if you rebuild it in a real design tool such as Figma or
  Illustrator and export a PNG. Do not try to generate these from a prompt.

Brand palette for anything you produce: indigo `#4f46e5`, teal `#14b8a6`,
near white background `#fafafa`, near black text `#18181b`.

---

## Tier 1: hero images

Five images, one per lesson, sitting directly under the lesson title.

They display as a **slim banner strip about 150 px tall at full content
width**, cropped from the centre of whatever you supply. So the practical
rule is: keep the subject vertically centred, and expect the top and bottom
of your source art to be cut off. A tall or square image still works, you
just lose more of it.

Export around **1400 x 600 px**. Anything wider and shorter wastes less, and
a 16:9 render from most tools crops perfectly well.

Append this to every prompt:

> Clean modern editorial illustration, flat vector style, indigo #4f46e5 and
> teal #14b8a6 on an off white #fafafa background, generous negative space,
> no text, no words, no letters, no numbers, wide horizontal composition,
> minimal and uncluttered, professional educational tone.

### 1. `assets/images/lesson-1-hero.png`

> An abstract network of glowing connected nodes arranged in loose layers
> flowing left to right, suggesting signals combining into a single
> conclusion. Some connections brighter than others.

### 2. `assets/images/lesson-2-hero.png`

> A circular flow of four abstract stages forming a continuous loop, each
> stage a simple geometric shape, conveying a process repeating endlessly
> and refining slightly with every pass.

### 3. `assets/images/lesson-3-hero.png`

> Five distinct abstract tool shapes arranged in a neat row, each visually
> different from the others, suggesting a curated toolkit where every item
> has a specific purpose.

### 4. `assets/images/lesson-4-hero.png`

> Three abstract pillars or shields standing together, one warm red, one
> amber, one green, conveying careful judgment and safeguarding without any
> literal warning symbols.

### 5. `assets/images/lesson-5-hero.png`

> Three overlapping speech bubbles progressing from small and rough to large
> and refined, suggesting a conversation improving through iteration.

---

## Tier 2: diagrams (keep the built in SVG)

These five slots already work. Listed so you know what exists and where a
replacement would go, should you ever rebuild them in a design tool.

| Slot | Path | What it shows |
| --- | --- | --- |
| Lesson 1 | `assets/images/lesson-1-spam-pipeline.png` | Labelled emails feeding training, producing a model that scores new mail |
| Lesson 2 | `assets/images/lesson-2-tokens.png` | A sentence split into four tokens with numeric ids |
| Lesson 3 | `assets/images/lesson-3-decision-tree.png` | Output needed mapped to tool category |
| Lesson 4 | `assets/images/lesson-4-data-gradient.png` | Three tiers of data sensitivity |
| Lesson 5 | `assets/images/lesson-5-prompt-anatomy.png` | A prompt colour coded into task, context, format, constraints |

Export at **1400 px wide**, PNG with a transparent or `#fafafa` background,
if you do replace any.

---

## Audio narration

Five files, one per lesson, appearing as a "Listen to this lesson" player
under the hero image.

- Path: `assets/audio/lesson-N-narration.mp3`
- Format: MP3, mono is fine, 128 kbps is plenty
- Voice: pick one and use it for all five. A warm, measured, unhurried
  delivery suits this material. Avoid anything overly bright or salesy.
- Pace: slightly slower than conversational. These are explanations, and
  learners will be absorbing new vocabulary.

Each script below runs roughly three minutes and is written to be spoken
rather than read, so it deliberately does not match the on page wording.

### `assets/audio/lesson-1-narration.mp3`

> Ask ten people what AI means and you will get ten different answers. One
> pictures a robot. One pictures ChatGPT. One pictures the feed that keeps
> them scrolling past midnight. All three are partly right, and that is
> exactly why the word feels so slippery.
>
> So let us fix that with a definition you can actually use. Artificial
> intelligence is software that learns patterns from data, and then uses
> those patterns to make predictions or decisions. That is the whole idea.
> What makes modern systems remarkable is not the concept. It is the scale.
>
> Here is the clearest way to see it. Imagine building a spam filter twice.
>
> The first way, a programmer writes rules. If the subject line contains the
> phrase free money, mark it as spam. If the sender is not in your contacts,
> raise suspicion. Rules like these break constantly. Spammers adapt within
> days, every new trick needs a new rule, and eventually the rules start
> contradicting each other.
>
> The second way, you show the system a few hundred thousand emails that
> people have already sorted into spam and not spam. The system works out for
> itself which combinations of words, sending patterns and link structures
> separate the two groups. Nobody writes those rules down. The system derives
> them, and it catches tricks the programmer never imagined.
>
> There are five terms that unlock most AI conversations. A model is the
> trained system itself, the finished product of the learning process.
> Machine learning is the umbrella technique, learning from examples rather
> than instructions. Training data is the set of examples the model learned
> from, and its coverage and its blind spots shape everything that comes
> later. Generative AI is the branch that creates new content rather than
> just sorting existing content. And a large language model is a generative
> model trained on an enormous body of text. Claude and ChatGPT are the
> familiar examples.
>
> One more distinction really matters. Every AI system in commercial use
> today is narrow. It does one class of task. A model that plays chess at
> superhuman level cannot read your email. Skill in one domain does not
> transfer to another. General AI, a system that could learn anything a
> person can, does not exist. Whether it will, and when, is a genuine open
> debate among researchers, and when a headline blurs those two ideas
> together, that is your cue to read more carefully.
>
> One last thought. You have almost certainly been using AI for years without
> calling it that. Your keyboard predicting the next word. Your bank flagging
> an odd transaction. Your photo app finding every picture of the same face.
> Once a technology works reliably, people stop calling it AI and start
> calling it the feature name. Researchers have a nickname for that. They
> call it the AI effect.

### `assets/audio/lesson-2-narration.mp3`

> You do not need the mathematics to use AI well. You do need a rough mental
> model, because it tells you what these systems are good at, where they fail,
> and why they fail in the particular ways they do.
>
> Let us start with training. A model begins completely useless. Its internal
> settings, called parameters, are effectively random, and its first
> predictions are nonsense. Training fixes that with a loop that is
> surprisingly simple. Show the model an example. Let it predict. Measure how
> wrong it was. Nudge every parameter slightly in the direction that would
> have made it less wrong. Then repeat.
>
> One pass changes almost nothing. Scale is what does the work. A frontier
> language model has hundreds of billions of parameters, and it runs that
> loop across trillions of words. What emerges is a system that has absorbed
> grammar, factual associations, reasoning patterns and writing styles,
> without anyone having written a single rule about any of it.
>
> Now, models do arithmetic, so language has to become numbers first. Text
> gets chopped into tokens, chunks roughly three quarters the length of an
> average English word. Common words are usually one token. Longer or rarer
> words split into several. This is why AI services bill per token, and why
> token counts never quite match word counts.
>
> Here is the part that explains the most. When you send a prompt, the model
> does not compose a whole answer and hand it over. It predicts the single
> most likely next token, adds it, then rereads everything including what it
> just wrote, and predicts the next one. That loop runs until the response is
> done.
>
> At each step it produces a probability across its entire vocabulary. Given
> the capital of France is, the token Paris might carry ninety seven percent
> of the probability, with the rest spread thin across thousands of
> alternatives.
>
> If the model always took the top option, output would be identical every
> time, and noticeably flat. So instead it samples from that distribution.
> A setting called temperature controls how adventurous the sampling is. Low
> temperature stays close to the most likely token, which suits factual work
> and code. Higher temperature reaches further down the list, which gives you
> more varied writing and more chances to go wrong.
>
> This is why running the same prompt twice can give you two different
> answers. It is designed behaviour, not a malfunction. If a colleague tells
> you the tool is broken because it will not repeat itself, that is the
> misunderstanding to clear up.
>
> Finally, the context window. A model can only consider a fixed amount of
> text at once. Your prompt, any document you paste, and the model's own
> replies all compete for that space. Anything outside the window does not
> exist as far as the model is concerned. That is why a very long
> conversation starts losing details from the beginning. The model has not
> forgotten in any human sense. Those tokens simply fell out of view.

### `assets/audio/lesson-3-narration.mp3`

> Almost everything sold as an AI tool falls into one of five categories.
> Learning the categories matters far more than learning product names,
> because products churn constantly while the categories have stayed stable.
>
> First, conversational assistants. Claude and ChatGPT are the familiar
> examples. You describe what you need in ordinary language and you get a
> response. These are the generalists, and they cover a genuinely wide range.
> Drafting and editing, summarising, explaining unfamiliar material,
> brainstorming, reformatting messy data, translating, and thinking through a
> problem out loud. If you only ever learn one category, learn this one.
>
> Second, image and video generators. Midjourney, DALL-E and Google's image
> models turn a description into a picture. Strong for concept art,
> illustration, mockups and marketing visuals. Two limits are worth knowing
> upfront. Text inside generated images comes out garbled, and precise
> composition takes real iteration. Treat the first result as a starting
> point.
>
> Third, coding assistants. These live inside an editor or terminal and are
> tuned for software work. The key difference from pasting snippets into a
> chat window is that they read your existing code for context.
>
> Fourth, embedded features. Increasingly the AI is inside a product you
> already pay for. Drafting an email reply, summarising a recorded meeting,
> suggesting a spreadsheet formula. These are often the easiest wins in an
> organisation, because there is no new tool to procure and no new vendor
> relationship to review.
>
> Fifth, agents. This is the newest category. An agent gets a goal rather than
> a single instruction, and it takes multiple steps on its own. Searching,
> calling other software, checking its own work, retrying. Capability here is
> moving fast and reliability varies a lot by task. The sensible posture is
> genuine interest paired with close supervision, especially anywhere an agent
> could take an action that is hard to undo.
>
> So how do you choose? Start from the output, not the product. Name what you
> need to end up with, and the category becomes obvious. Words or analysis
> points to a chat assistant. A picture points to an image generator. Working
> code points to a coding assistant. A task inside an app you already use
> points to an embedded feature. A multi step goal points to an agent.
>
> There is a second question running underneath all five. How much of the
> tool is yours. Off the shelf means you sign up and start today. Configured
> means you add your own documents and rules, which takes weeks. Custom built
> means months and real engineering. Control and cost both rise as you move
> along that line. Start at the left, and only move right when something
> specific forces you to. Most requirements that feel unique turn out to be
> met by an off the shelf tool with a good prompt and a few uploaded
> documents.

### `assets/audio/lesson-4-narration.mp3`

> This is the lesson that keeps you out of trouble. AI tools are genuinely
> useful, and they fail in specific, predictable ways. Once you know where
> the failures cluster, you can check the right things without slowing
> yourself down checking everything.
>
> Start with hallucinations. A hallucination is confident output that is
> simply false. The cause goes back to how these models work. They produce
> statistically plausible continuations, and plausible is not the same as
> true. When the training data thins out, the model does not stop or express
> doubt. It generates the shape of an answer and fills it with something that
> fits the pattern.
>
> The useful part is that hallucinations are not evenly spread. They cluster
> around a handful of things. Citations and references, because paper titles,
> case law and page numbers follow rigid formats that are easy to fabricate
> convincingly. Precise figures and dates. URLs, where a plausible looking
> link to a page that never existed is extremely common. Quotes attributed to
> people, especially quotes that sound exactly like something that person
> would say. And niche or very recent topics, where the training coverage is
> thin.
>
> Notice what is not on that list. Rewriting text you supplied. Summarising a
> document you pasted in. Changing tone. Brainstorming. Those are all
> comparatively low risk, because the model is working from material right in
> front of it.
>
> So match your checking to the stakes. For brainstorming and first drafts, a
> skim is fine. For anything you are sharing with colleagues, check every
> factual claim. For anything published, legal, medical, financial or
> binding, verify at the original source. Checking everything at the same
> intensity is exhausting, and it is exactly how people quietly stop checking
> anything at all.
>
> Now privacy. Public AI tools may retain conversation data, and terms vary by
> provider and by plan. Rather than memorising policies, sort what you are
> about to paste. Public information, your own draft writing and general
> questions are generally fine. Internal documents, unreleased plans and
> proprietary code sit in a middle tier where your organisation's policy
> actually matters. And customer personal data, health records, passwords,
> API keys and anything under an NDA should not go into a public tool at all.
>
> A quick test that works well. Would you be comfortable if this text turned
> up in a screenshot shared outside your organisation? If the honest answer is
> no, check the policy before you paste, not after. Data cannot be unsent.
>
> One more thing. Models learn from text produced by people, and that text
> carries the assumptions and imbalances of the world that produced it.
> Developers work hard to reduce this and none of them have eliminated it. The
> practical implication is narrow and important. Be especially careful using
> AI output to make or justify decisions about people. Hiring, lending,
> admissions, performance reviews. Use it to gather and structure
> information, and keep the judgement, and the accountability, with a human.

### `assets/audio/lesson-5-narration.mp3`

> You know what AI is, roughly how it works, which tools exist and how to use
> them without causing problems. What is left is the part that only comes
> from doing it.
>
> A prompt is just the instruction you give. The most useful way to think
> about it is delegation. You are handing a task to a capable new colleague
> who is quick and widely read, but who has never met you, does not know your
> company, cannot see your screen, and will not ask a follow up question
> unless you invite one. Everything they need has to be in the message.
>
> Nearly every weak prompt is missing one of four ingredients.
>
> Task. The specific thing to produce. Write, summarise, compare, rewrite,
> find the problems in.
>
> Context. Who it is for, what it is part of, what has already happened, what
> matters here.
>
> Format. Length, structure and tone. A table, five bullets, three sentences,
> plain language for a non specialist.
>
> Constraints. The boundaries. No jargon, do not invent statistics, stay
> under two hundred words, do not mention pricing.
>
> Compare two versions. Write something about my product launch. Against:
> write a three sentence LinkedIn post announcing our new budgeting app for
> freelancers, friendly and upbeat, no hashtags, ending with an invitation to
> try the free version. The second one has all four ingredients, so there is
> almost nothing left to guess.
>
> Now, the first response is a draft. Experienced users rarely get what they
> want on the first try, and they do not start over. They correct. But
> specific corrections work far better than general dissatisfaction. Make it
> better gives the model nothing to act on. Cut it to half the length, drop
> the opening pleasantry, and make the second paragraph concrete with an
> example gives it four clear instructions. And if something in the draft was
> good, say so, because otherwise a rewrite may quietly throw it away.
>
> Two more techniques worth having. If you need a particular voice or
> structure, paste an example of what good looks like rather than describing
> it. One concrete example beats three paragraphs of description, because the
> model is pattern matching and a pattern is less ambiguous than an adjective.
> And for anything involving multiple steps or comparison, ask the model to
> work through its reasoning before giving an answer. It improves quality, and
> it gives you something you can audit when the conclusion looks wrong.
>
> Finally, know when to start fresh. Long conversations accumulate context and
> not all of it helps. If a thread has wandered, or the model keeps returning
> to an early misunderstanding, a new conversation with a clean prompt is
> usually faster than trying to steer the old one back.

---

## Video

Each lesson currently embeds a relevant public video from TED-Ed, IBM
Technology or Anthropic, with on page attribution. These work as they are.

To swap in your own recording, replace the `src` on that lesson's `iframe`
with your unlisted YouTube or Vimeo embed URL and delete the
`<p class="video-credit">` block directly beneath it. Keep the
`referrerpolicy="strict-origin-when-cross-origin"` attribute, since YouTube's
player throws a configuration error without it.

Suggested length is six to nine minutes per lesson. The narration scripts
above double as video scripts if you want the two to match.
