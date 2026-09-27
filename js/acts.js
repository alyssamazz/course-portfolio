/* ============================================================
   Act gating

   The module is three video acts with a checkpoint between each. An act stays
   closed until the checkpoint before it is answered correctly.

   This is the structural argument of the whole product. A learner can watch a
   twelve minute film and retain almost none of it, because watching is
   recognition and recognition feels like learning without being it. Forcing a
   retrieval attempt between acts is what converts the film into something that
   survives the week. The gate is not there to be difficult: the questions are
   three-option, the feedback explains the reasoning, and a wrong answer costs
   nothing but another attempt.

   Correctness is what opens the gate rather than mere engagement, because an
   unanswered or wrongly answered checkpoint means the act did not land, and
   the fix is to say why and let them try again while the footage is still
   fresh.

   Markup:
     <section class="act is-locked" data-act="2"> ... </section>
     <div class="checkpoint" data-checkpoint="1" data-opens="2"
          data-answer="b">
       <p class="cp-q">...</p>
       <button class="cp-option" data-choice="a" data-feedback="...">...</button>
       ...
       <div class="cp-result"></div>
     </div>
   ============================================================ */

function initActs(options) {
  const courseId = options.courseId;
  const moduleId = options.moduleId;

  const acts = [...document.querySelectorAll("[data-act]")];
  const checkpoints = [...document.querySelectorAll("[data-checkpoint]")];
  if (!acts.length) return;

  /* Restore anything already unlocked on a previous visit, so a learner who
     comes back does not have to re-answer what they already got right. */
  const saved = CourseProgress.getActivityResult(courseId, moduleId + ":acts") || { open: [] };
  const opened = new Set(saved.open || []);

  /* A checkpoint belongs to the act it follows, so checkpoint N stays hidden
     while act N is locked. Without this a learner could scroll past the
     locked acts, answer all three questions cold, and open everything without
     watching a frame — which would make the gate decorative. */
  function syncCheckpointVisibility() {
    checkpoints.forEach(function (cp) {
      const needs = cp.getAttribute("data-checkpoint");
      cp.classList.toggle("is-hidden", !opened.has(String(needs)));
    });
  }

  function openAct(n, scroll) {
    const act = acts.find((a) => a.getAttribute("data-act") === String(n));
    if (!act) return;
    act.classList.remove("is-locked");
    opened.add(String(n));
    CourseProgress.setActivityResult(courseId, moduleId + ":acts", { open: [...opened] });
    syncCheckpointVisibility();
    if (scroll) {
      requestAnimationFrame(() => act.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }

  /* Author preview. Adding ?preview=1 to the URL opens every act and reveals
     every checkpoint, so the course can be reviewed end to end without
     playing through it. It deliberately writes nothing to storage, so a
     reviewer's pass never looks like a learner's progress. */
  const previewing = new URLSearchParams(location.search).has("preview");
  if (previewing) {
    acts.forEach((a) => a.classList.remove("is-locked"));
    checkpoints.forEach((cp) => cp.classList.remove("is-hidden"));
    document.body.classList.add("is-preview");
    const flag = document.createElement("div");
    flag.className = "preview-flag";
    flag.textContent = "Preview mode — all acts unlocked, nothing saved";
    document.body.appendChild(flag);
    return;
  }

  /* Act 1 is always open. Anything unlocked previously reopens silently. */
  openAct(1, false);
  opened.forEach((n) => openAct(n, false));
  syncCheckpointVisibility();

  checkpoints.forEach(function (cp) {
    const answer = cp.getAttribute("data-answer");
    const opensAct = cp.getAttribute("data-opens");
    const result = cp.querySelector(".cp-result");
    const buttons = [...cp.querySelectorAll(".cp-option")];
    let solved = opened.has(opensAct);

    if (solved) {
      cp.classList.add("is-solved");
      result.innerHTML = '<p class="cp-correct"><strong>Answered.</strong> The next act is open below.</p>';
      result.classList.add("is-shown");
      buttons.forEach((b) => (b.disabled = true));
      buttons.filter((b) => b.getAttribute("data-choice") === answer)
             .forEach((b) => b.classList.add("is-answer"));
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (solved) return;
        const choice = btn.getAttribute("data-choice");
        const right = choice === answer;

        buttons.forEach((b) => b.classList.remove("is-picked", "is-wrong"));
        btn.classList.add(right ? "is-picked" : "is-wrong");

        result.innerHTML =
          '<p class="' + (right ? "cp-correct" : "cp-incorrect") + '">' +
            '<strong>' + (right ? "That's it." : "Not quite.") + '</strong> ' +
            btn.getAttribute("data-feedback") +
          '</p>' +
          (right ? "" : '<p class="cp-retry">Try another answer to continue.</p>');
        result.classList.add("is-shown");

        if (!right) return;

        solved = true;
        cp.classList.add("is-solved");
        buttons.forEach((b) => (b.disabled = true));
        btn.classList.add("is-answer");

        const gains = Gamification.awardActivityXp(
          courseId, moduleId + ":cp" + cp.getAttribute("data-checkpoint"), "Checkpoint cleared");
        Gamification.showRewards(gains, Gamification.evaluateBadges(courseId));

        openAct(opensAct, true);
      });
    });
  });
}
