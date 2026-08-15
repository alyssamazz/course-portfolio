/* ============================================================
   BerwynAI Academy: XP, levels, badges, streaks, lesson unlocking

   Depends on CourseProgress (js/progress.js), which must load first.
   All state is per browser via localStorage. No backend, no accounts.
   ============================================================ */

const Gamification = (function () {
  /* Fallback module list. Any course can override it via COURSE_META.lessons,
     which is how courses of different lengths coexist. */
  const DEFAULT_LESSONS = ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5"];

  function lessonsFor(courseId) {
    const meta = COURSE_META[courseId];
    return (meta && meta.lessons) || DEFAULT_LESSONS;
  }

  /* Only one course is ever open on a page. Remembering which one lets
     refreshUi run without every caller having to pass it back in. */
  let activeCourse = null;
  function remember(courseId) {
    if (courseId) activeCourse = courseId;
    return courseId;
  }

  const XP = {
    LESSON_COMPLETE: 100,
    PERFECT_QUIZ: 50,
    SCENARIO: 25,
    EXAM_PASS: 300,
    PERFECT_EXAM: 200,
  };

  /* Thresholds are scaled to the XP available across all live courses, so
     finishing a single course no longer maxes out the ladder. Level names are
     topic neutral because the academy now spans more than AI. */
  const LEVELS = [
    { level: 1, name: "Novice", at: 0 },
    { level: 2, name: "Explorer", at: 400 },
    { level: 3, name: "Practitioner", at: 1100 },
    { level: 4, name: "Specialist", at: 2000 },
    { level: 5, name: "Expert", at: 2900 },
  ];

  const ICONS = {
    flag: "M4 2v20M4 3h13l-2 4 2 4H4",
    check: "M20 6L9 17l-5-5",
    crown: "M3 18h18M3 18l1-10 5 4 3-7 3 7 5-4 1 10",
    seal: "M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z M8 17v5l4-2 4 2v-5",
    compass: "M12 2a10 10 0 100 20 10 10 0 000-20zM16 8l-2.5 5.5L8 16l2.5-5.5z",
    flame: "M12 2c2 4-3 5-3 9a3 3 0 006 0c0-1.5-.7-2.4-.7-2.4S17 11 17 14a5 5 0 01-10 0C7 8 12 7 12 2z",
  };

  /* Six badges, ordered easy to hard so there is always a next one in reach.
     Kept deliberately small: progress milestones are already covered by the
     progress bar, so badges only mark things the bar cannot show. */
  const BADGES = [
    {
      id: "first-steps", name: "First Steps", icon: ICONS.flag,
      how: "Finish your first lesson",
      earned: (c) => CourseProgress.isLessonComplete(c, "lesson-1"),
    },
    {
      id: "scenario-solver", name: "Scenario Solver", icon: ICONS.compass,
      how: "Work through every decision scenario",
      earned: (c) => CourseProgress.scenarioCount(c) >= lessonsFor(c).length,
    },
    {
      id: "course-complete", name: "Course Complete", icon: ICONS.check,
      how: "Finish every lesson",
      earned: (c) => CourseProgress.completedCount(c) >= lessonsFor(c).length,
    },
    {
      id: "certified", name: "Certified", icon: ICONS.seal,
      how: "Pass the certification exam",
      earned: (c) => {
        const e = CourseProgress.getExamResult(c);
        return !!(e && e.passed);
      },
    },
    {
      id: "flawless", name: "Flawless", icon: ICONS.crown,
      how: "Score full marks on every lesson quiz",
      earned: (c) => lessonsFor(c).every((id) => {
        const s = CourseProgress.getQuizScore(c, id);
        return s && s.correct === s.total;
      }),
    },
    {
      id: "consistent", name: "Consistent", icon: ICONS.flame,
      how: "Study on three days in a row",
      earned: (c) => CourseProgress.currentStreak(c) >= 3,
    },
  ];

  /* ---------- Levels ---------- */

  function levelInfo(xp) {
    let current = LEVELS[0];
    for (let i = 0; i < LEVELS.length; i++) {
      if (xp >= LEVELS[i].at) current = LEVELS[i];
    }
    const next = LEVELS.find((l) => l.at > xp) || null;
    const span = next ? next.at - current.at : 1;
    const into = next ? xp - current.at : 1;
    return {
      level: current.level,
      name: current.name,
      xp: xp,
      nextAt: next ? next.at : null,
      nextName: next ? next.name : null,
      pct: next ? Math.round((into / span) * 100) : 100,
    };
  }

  /* ---------- Unlocking ---------- */

  function isLessonLocked(courseId, lessonId) {
    const order = lessonsFor(courseId);
    const idx = order.indexOf(lessonId);
    if (idx <= 0) return false;
    return !CourseProgress.isLessonComplete(courseId, order[idx - 1]);
  }

  function requiredLessonFor(courseId, lessonId) {
    const order = lessonsFor(courseId);
    const idx = order.indexOf(lessonId);
    return idx > 0 ? order[idx - 1] : null;
  }

  /* ---------- Badge evaluation ---------- */

  /* Awards every newly qualifying badge and returns those that just unlocked,
     so the caller can show a toast. Safe to call as often as you like. */
  function evaluateBadges(courseId) {
    remember(courseId);
    const unlocked = [];
    BADGES.forEach(function (badge) {
      if (CourseProgress.hasBadge(courseId, badge.id)) return;
      if (badge.earned(courseId)) {
        CourseProgress.awardBadge(courseId, badge.id);
        unlocked.push(badge);
      }
    });
    return unlocked;
  }

  /* ---------- Award helpers used by lesson and exam pages ---------- */

  function awardLessonXp(courseId, lessonId, quizCorrect, quizTotal) {
    const gained = [];
    if (CourseProgress.awardXp(courseId, lessonId + ":complete", XP.LESSON_COMPLETE)) {
      gained.push({ label: "Lesson complete", points: XP.LESSON_COMPLETE });
    }
    if (quizCorrect === quizTotal &&
        CourseProgress.awardXp(courseId, lessonId + ":perfect", XP.PERFECT_QUIZ)) {
      gained.push({ label: "Perfect quiz", points: XP.PERFECT_QUIZ });
    }
    return gained;
  }

  function awardScenarioXp(courseId, lessonId) {
    const gained = [];
    if (CourseProgress.awardXp(courseId, lessonId + ":scenario", XP.SCENARIO)) {
      gained.push({ label: "Scenario solved", points: XP.SCENARIO });
    }
    return gained;
  }

  function awardExamXp(courseId, correct, total, passed) {
    const gained = [];
    if (passed && CourseProgress.awardXp(courseId, "exam:pass", XP.EXAM_PASS)) {
      gained.push({ label: "Exam passed", points: XP.EXAM_PASS });
    }
    if (passed && correct === total &&
        CourseProgress.awardXp(courseId, "exam:perfect", XP.PERFECT_EXAM)) {
      gained.push({ label: "Perfect exam", points: XP.PERFECT_EXAM });
    }
    return gained;
  }

  /* ---------- Academy wide totals (used on the catalog page) ---------- */

  const ALL_COURSES = [
    "ai-fundamentals",
    "ai-everyday",
    "ai-workplace",
    "ai-productivity",
    "ai-custom-tooling",
  ];

  const COURSE_META = {
    "ai-fundamentals": {
      name: "AI Fundamentals", emoji: "\u{1F9E0}", live: true,
      lessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-5"],
    },
    "ai-everyday":      { name: "AI Everyday",       emoji: "\u{1F3E1}", live: false },
    "ai-workplace":     { name: "AI Workplace",      emoji: "\u{1F4BC}", live: false },
    "ai-productivity":  { name: "AI Productivity",   emoji: "\u{26A1}",  live: false },
    "ai-custom-tooling":{ name: "AI Custom Tooling", emoji: "\u{1F6E0}", live: false },
  };

  /* Sums XP across every course so the catalog can show one running level
     rather than a per course figure. Only AI Fundamentals contributes today,
     and the rest fold in automatically as they are built. */
  function academyXp() {
    return ALL_COURSES.reduce(function (sum, id) {
      return sum + CourseProgress.totalXp(id);
    }, 0);
  }

  /* ---------- Rendering ---------- */

  function paintXpBar(el, xp) {
    if (!el) return;
    const info = levelInfo(xp);
    const nextLabel = info.nextAt
      ? info.nextAt - info.xp + " XP to " + info.nextName
      : "Top level reached";
    el.innerHTML =
      '<div class="xp-head">' +
        '<span class="xp-level">Level ' + info.level + ': ' + info.name + '</span>' +
        '<span class="xp-total">' + info.xp + ' XP</span>' +
      '</div>' +
      '<div class="xp-track"><div class="xp-fill" style="width:' + info.pct + '%"></div></div>' +
      '<div class="xp-next">' + nextLabel + '</div>';
  }

  function renderXpBar(el, courseId) {
    remember(courseId);
    paintXpBar(el, CourseProgress.totalXp(courseId));
  }

  function renderAcademyXpBar(el) {
    paintXpBar(el, academyXp());
  }

  /* One certification tile per course, unlocked by passing that course's
     exam. Courses still in development show as upcoming rather than failed. */
  function renderCertifications(el) {
    if (!el) return;
    el.innerHTML = ALL_COURSES.map(function (id) {
      const meta = COURSE_META[id];
      const exam = CourseProgress.getExamResult(id);
      const passed = !!(exam && exam.passed);

      let status = "Not yet earned";
      if (passed) {
        status = "Passed " + new Date(exam.date).toLocaleDateString(undefined, {
          month: "short", day: "numeric", year: "numeric",
        });
      } else if (!meta.live) {
        status = "Course in development";
      }

      return '<div class="cert-tile' + (passed ? " is-earned" : "") +
        (meta.live ? "" : " is-upcoming") + '">' +
        '<div class="cert-seal">' +
          (passed
            ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
              'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="' + ICONS.seal + '"/></svg>'
            : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
              'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
              '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>') +
        '</div>' +
        '<div class="cert-body">' +
          '<div class="cert-name"><i class="emo">' + meta.emoji + '</i>' + meta.name + '</div>' +
          '<div class="cert-status">' + status + '</div>' +
        '</div>' +
      '</div>';
    }).join("");
  }

  /* Mock standings. There is no backend and no real competition here: the
     peer rows are fixed sample data, and only the "You" row reflects real XP.
     It exists to show the gamification pattern, not to report anything true. */
  const MOCK_PEERS = [
    { name: "Priya R.", xp: 1580, emoji: "\u{1F947}" },
    { name: "Marcus T.", xp: 1420, emoji: "\u{1F948}" },
    { name: "Dana K.", xp: 1205, emoji: "\u{1F949}" },
    { name: "Sam O.", xp: 890, emoji: "\u{1F4DA}" },
    { name: "Lea M.", xp: 640, emoji: "\u{1F331}" },
    { name: "Chris B.", xp: 415, emoji: "\u{1F423}" },
  ];

  function renderLeaderboard(el) {
    if (!el) return;
    const mine = academyXp();
    const rows = MOCK_PEERS.concat([{ name: "You", xp: mine, emoji: "\u{2B50}", isYou: true }])
      .sort(function (a, b) { return b.xp - a.xp; });

    const myRank = rows.findIndex(function (r) { return r.isYou; }) + 1;
    const top = rows[0].xp;

    el.innerHTML =
      '<div class="lb-head">' +
        '<span class="lb-rank-big">#' + myRank + '</span>' +
        '<span class="lb-rank-note">of ' + rows.length + ' learners this month</span>' +
      '</div>' +
      '<ul class="lb-list">' +
        rows.map(function (r) {
          const pct = top ? Math.max(3, Math.round((r.xp / top) * 100)) : 3;
          return '<li class="lb-row' + (r.isYou ? " is-you" : "") + '">' +
            '<span class="lb-who"><i class="emo">' + r.emoji + '</i>' + r.name + '</span>' +
            '<span class="lb-bar"><i style="width:' + pct + '%"></i></span>' +
            '<span class="lb-xp">' + r.xp + '</span>' +
          '</li>';
        }).join("") +
      '</ul>' +
      '<p class="lb-note">Sample standings for design purposes. Only your own score is real.</p>';
  }

  function renderStreak(el, courseId) {
    if (!el) return;
    const streak = CourseProgress.currentStreak(courseId);
    const dayWord = streak === 1 ? "day" : "days";
    el.innerHTML =
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + ICONS.flame + '"/></svg>' +
      '<span>' + streak + ' ' + dayWord + ' in a row</span>';
    el.classList.toggle("is-active", streak > 0);
  }

  function renderTrophyCase(el, courseId) {
    if (!el) return;
    el.innerHTML = BADGES.map(function (badge) {
      const earned = CourseProgress.hasBadge(courseId, badge.id);
      return '<div class="badge-tile' + (earned ? " is-earned" : "") + '" title="' + badge.how + '">' +
        '<div class="badge-icon">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" ' +
          'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + badge.icon + '"/></svg>' +
        '</div>' +
        '<div class="badge-name">' + badge.name + '</div>' +
        '<div class="badge-how">' + (earned ? "Unlocked" : badge.how) + '</div>' +
      '</div>';
    }).join("");
  }

  /* Re-renders whichever gamification widgets exist on the current page.
     Called after any award so XP, streak and badges never go stale. */
  function refreshUi(courseId) {
    const id = courseId || activeCourse;
    if (!id) return;
    renderXpBar(document.getElementById("xp-panel"), id);
    renderStreak(document.getElementById("streak-chip"), id);
    renderTrophyCase(document.getElementById("trophy-case"), id);
  }

  /* Slides in a toast per XP gain and badge unlock, stacked and auto dismissed. */
  function showRewards(xpGains, newBadges) {
    const items = [];
    (xpGains || []).forEach((g) => items.push({ kind: "xp", text: "+" + g.points + " XP", sub: g.label }));
    (newBadges || []).forEach((b) => items.push({ kind: "badge", text: "Badge unlocked", sub: b.name, icon: b.icon }));
    if (!items.length) return;

    refreshUi();

    let host = document.getElementById("reward-toasts");
    if (!host) {
      host = document.createElement("div");
      host.id = "reward-toasts";
      host.className = "reward-toasts";
      document.body.appendChild(host);
    }

    items.forEach(function (item, i) {
      const toast = document.createElement("div");
      toast.className = "reward-toast reward-" + item.kind;
      const icon = item.icon
        ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" ' +
          'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + item.icon + '"/></svg>'
        : "";
      toast.innerHTML = icon + '<div><strong>' + item.text + '</strong><span>' + item.sub + '</span></div>';
      setTimeout(function () {
        host.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("is-in"));
        setTimeout(function () {
          toast.classList.remove("is-in");
          setTimeout(() => toast.remove(), 400);
        }, 3600);
      }, i * 450);
    });
  }

  return {
    XP, LEVELS, BADGES, ALL_COURSES, COURSE_META,
    lessonsFor, levelInfo, isLessonLocked, requiredLessonFor,
    evaluateBadges, academyXp,
    awardLessonXp, awardScenarioXp, awardExamXp,
    renderXpBar, renderAcademyXpBar, renderStreak, renderTrophyCase,
    renderCertifications, renderLeaderboard,
    refreshUi, showRewards,
  };
})();
