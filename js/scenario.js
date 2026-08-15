/* ============================================================
   BerwynAI Academy: scenario decision exercises

   A realistic situation with three courses of action. Every choice
   produces a distinct consequence rather than a right or wrong mark.
   The first pick is recorded and earns XP; afterwards the learner can
   open the other options to see how those would have played out, which
   is where most of the learning actually happens.

   Depends on CourseProgress and Gamification.

   Expected markup:
   <div class="scenario" data-scenario data-lesson-id="lesson-1">
     <span class="scenario-tag">Decision point</span>
     <h3 class="scenario-title">...</h3>
     <p class="scenario-setup">...</p>
     <div class="scenario-choices">
       <button type="button" class="scenario-choice"
               data-quality="poor" data-feedback="What happens next...">Option text</button>
       ...
     </div>
     <div class="scenario-result"></div>
   </div>
   ============================================================ */

function initScenario(options) {
  const root = document.querySelector("[data-scenario]");
  if (!root) return;

  const courseId = options.courseId;
  const lessonId = root.getAttribute("data-lesson-id") || options.lessonId;
  const choices = Array.from(root.querySelectorAll(".scenario-choice"));
  const result = root.querySelector(".scenario-result");

  const QUALITY_LABEL = {
    best: "Strongest move",
    ok: "Workable, with a catch",
    poor: "This one backfires",
  };

  function paint(index, isOriginalPick) {
    const btn = choices[index];
    const quality = btn.getAttribute("data-quality") || "ok";

    choices.forEach((c) => c.classList.remove("is-viewing"));
    btn.classList.add("is-viewing");

    result.className = "scenario-result is-visible quality-" + quality;
    result.innerHTML =
      '<div class="scenario-verdict">' + QUALITY_LABEL[quality] +
      (isOriginalPick ? ' <span class="scenario-yours">Your choice</span>' : "") +
      "</div>" +
      "<p>" + btn.getAttribute("data-feedback") + "</p>";
  }

  function lockIn(index) {
    root.classList.add("is-answered");
    choices.forEach(function (c, i) {
      c.classList.toggle("is-chosen", i === index);
    });
    const hint = root.querySelector(".scenario-hint");
    if (hint) hint.classList.add("is-visible");
  }

  const existing = CourseProgress.getScenarioChoice(courseId, lessonId);

  choices.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      const alreadyAnswered = CourseProgress.getScenarioChoice(courseId, lessonId) !== null;

      if (!alreadyAnswered) {
        CourseProgress.setScenarioChoice(courseId, lessonId, index);
        lockIn(index);
        paint(index, true);

        const xpGains = Gamification.awardScenarioXp(courseId, lessonId);
        const newBadges = Gamification.evaluateBadges(courseId);
        Gamification.showRewards(xpGains, newBadges);
      } else {
        paint(index, index === CourseProgress.getScenarioChoice(courseId, lessonId));
      }
    });
  });

  // Restore a previously recorded decision on revisit.
  if (existing !== null && choices[existing]) {
    lockIn(existing);
    paint(existing, true);
  }
}
