/* ============================================================
   Redaction exercise

   The learner reads a sample notice containing identifying data and writes the
   prompt they would actually send to an AI tool. Their text is then scanned
   for the things that should never have left the firm.

   The scanning is plain pattern matching, not a model, and that is a feature
   rather than a limitation. A regular expression that finds a nine digit
   number is exactly the kind of check a firm could run on its own outbound
   traffic, so the exercise doubles as a demonstration of what data loss
   prevention tooling does. It also means nothing the learner types leaves the
   browser, which is the correct behaviour for a module about not leaking
   client data into somebody else's system.

   Two kinds of check run:

     leak      something identifying made it into the prompt
     useful    the prompt is general but still specific enough to get a real
               answer, since "what does my notice mean" with everything
               stripped out is safe and worthless

   Both matter. A learner who deletes everything passes the privacy test and
   fails the job, and saying so is the difference between a compliance tick
   box and actual training.
   ============================================================ */

const RedactExercise = (function () {

  /* Deliberately fabricated. The name is invented, the SSN uses the 900 range
     which is never issued, and the EIN prefix is unassigned. Nothing here
     resembles a real taxpayer record. */
  const SAMPLE = {
    name: "Marcus Webb",
    ssn: "900-55-0148",
    ein: "00-7734521",
    notice: "CP2000",
    year: "2024",
    reported: "$84,200",
    thirdParty: "$91,750",
  };

  const CHECKS = [
    {
      id: "ssn",
      kind: "leak",
      label: "No Social Security number",
      test: (t) => !/\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/.test(t) && !/\b\d{9}\b/.test(t),
      fail: "There is a Social Security number in your prompt. An SSN identifies a person on its own, with or without a name attached — removing the name does not make it anonymous.",
    },
    {
      id: "ein",
      kind: "leak",
      label: "No EIN",
      test: (t) => !/\b\d{2}-\d{7}\b/.test(t),
      fail: "There is an EIN in your prompt. A business tax ID is identifying in exactly the way an SSN is, and it is the one people most often forget to strip.",
    },
    {
      id: "name",
      kind: "leak",
      label: "No client name",
      test: (t) => {
        const low = t.toLowerCase();
        return !low.includes("marcus") && !low.includes("webb");
      },
      fail: "The client's name is in your prompt. Nothing about the tax question requires the AI to know who the client is.",
    },
    {
      id: "money",
      kind: "leak",
      label: "No specific dollar figures",
      test: (t) => !/\$\s?\d[\d,]{2,}/.test(t) && !/\b\d{2,3},\d{3}\b/.test(t),
      fail: "Specific income figures are in your prompt. Paired with a notice type and a tax year, reported income is client financial data — and the general answer does not change based on the exact amount.",
    },
    {
      id: "possessive",
      kind: "soft",
      label: "Framed as a general question",
      test: (t) => !/\bmy client\b|\bclient's\b|\bher return\b|\bhis return\b/i.test(t),
      fail: "You framed this as your client's specific case. It is not a disclosure on its own, but the habit matters: a question written generally is one you never have to check twice before sending.",
    },
    {
      id: "notice",
      kind: "useful",
      label: "Names the notice type",
      test: (t) => /\bcp\s?-?\s?2000\b/i.test(t),
      fail: "You stripped out the notice type. That is the one detail the AI genuinely needs — without it you get a generic answer about IRS letters instead of an explanation of what a CP2000 actually is.",
    },
    {
      id: "substance",
      kind: "useful",
      label: "Describes the underlying situation",
      test: (t) => /(discrepanc|mismatch|differ|1099|third[- ]party|under[- ]?report)/i.test(t),
      fail: "The prompt does not describe what the notice is about. Saying that there is a mismatch between reported income and third-party reporting is general — it could be any taxpayer — and it is what makes the answer useful.",
    },
  ];

  function evaluate(text) {
    const t = (text || "").trim();
    const results = CHECKS.map((c) => ({ ...c, passed: c.test(t) }));
    const leaks = results.filter((r) => r.kind === "leak" && !r.passed);
    const softs = results.filter((r) => r.kind === "soft" && !r.passed);
    const gaps = results.filter((r) => r.kind === "useful" && !r.passed);
    return { results, leaks, softs, gaps, empty: t.length < 15 };
  }

  function verdict(ev) {
    if (ev.empty) {
      return { tone: "warn", head: "Nothing to check yet.",
        body: "Write the prompt you would actually send, then run the check." };
    }
    if (ev.leaks.length) {
      return { tone: "bad", head: "This prompt would have leaked client data.",
        body: "In a firm with monitoring, this is the message that triggers the alert. Fix the items in red and run it again — that is the whole skill." };
    }
    if (ev.gaps.length === CHECKS.filter((c) => c.kind === "useful").length) {
      return { tone: "warn", head: "Safe, but it would not help you.",
        body: "Nothing identifying is in here, which is the important half. But you also stripped out what the question was about, so the answer would be too generic to use. Safe and useless is not the goal." };
    }
    if (ev.gaps.length) {
      return { tone: "warn", head: "Safe, and nearly there.",
        body: "No client data in this prompt. Add the missing detail below and it would get you a genuinely useful answer." };
    }
    if (ev.softs.length) {
      return { tone: "ok", head: "Safe to send.",
        body: "No identifying data, and specific enough to be useful. One habit worth tightening, noted below." };
    }
    return { tone: "good", head: "This is the prompt.",
      body: "Nothing identifying, and specific enough to get a real answer. This is exactly the rewrite the module is teaching." };
  }

  function init(options) {
    const root = document.querySelector("[data-redact]");
    if (!root) return;

    const courseId = options.courseId;
    const moduleId = options.moduleId;
    const input = root.querySelector("[data-redact-input]");
    const btn = root.querySelector("[data-redact-check]");
    const out = root.querySelector("[data-redact-result]");
    const modelWrap = root.querySelector("[data-redact-model]");

    input.addEventListener("input", function () {
      btn.disabled = input.value.trim().length < 5;
    });
    btn.disabled = true;

    btn.addEventListener("click", function () {
      const ev = evaluate(input.value);
      const v = verdict(ev);

      const row = (r) =>
        '<li class="' + (r.passed ? "rc-pass" : "rc-fail rc-" + r.kind) + '">' +
          '<span class="rc-mark">' + (r.passed ? "&#10003;" : "&#10007;") + '</span>' +
          '<span><strong>' + r.label + '</strong>' +
            (r.passed ? "" : '<span class="rc-why">' + r.fail + '</span>') +
          '</span>' +
        '</li>';

      out.innerHTML =
        '<div class="redact-verdict is-' + v.tone + '">' +
          '<h4>' + v.head + '</h4><p>' + v.body + '</p>' +
        '</div>' +
        (ev.empty ? "" :
          '<ul class="redact-checks">' + ev.results.map(row).join("") + '</ul>');
      out.classList.add("is-shown");

      if (ev.empty) return;

      modelWrap.classList.add("is-shown");

      /* Awarded for making a real attempt. The learning is in the per item
         feedback and in rewriting, so paying only for a perfect first try
         would push people to guess rather than to revise. */
      const gains = Gamification.awardActivityXp(courseId, moduleId + ":redact", "Exercise complete");
      Gamification.showRewards(gains, Gamification.evaluateBadges(courseId));
      CourseProgress.setActivityResult(courseId, moduleId + ":redact", {
        leaks: ev.leaks.map((l) => l.id),
        gaps: ev.gaps.map((g) => g.id),
        clean: ev.leaks.length === 0,
      });
    });
  }

  return { SAMPLE, CHECKS, evaluate, verdict, init };
})();
