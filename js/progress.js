/* ============================================================
   BerwynAI Academy: learner state (localStorage, no backend)

   Per browser, no login. Good enough to demonstrate the UX
   pattern; swap for a real API if this becomes a live product.

   Stored shape:
   {
     lessons:    { "lesson-1": true },
     quizScores: { "lesson-1": { correct: 3, total: 3 } },
     scenarios:  { "lesson-1": 2 },              // index of choice made
     exam:       { score, total, passed, date },
     certName:   "",
     xpEvents:   { "lesson-1:complete": 100 },   // keyed so XP never double-counts
     badges:     { "first-steps": "2026-08-14T..." },
     streak:     { days: ["2026-08-14"] }
   }
   ============================================================ */

const CourseProgress = (function () {
  const EMPTY = {
    lessons: {},
    quizScores: {},
    scenarios: {},
    activities: {},
    exam: null,
    certName: "",
    xpEvents: {},
    badges: {},
    streak: { days: [] },
  };

  function storageKey(courseId) {
    return "berwynai_progress_" + courseId;
  }

  /* Merges stored data over defaults so progress saved by an older
     version of this file keeps loading after the schema grows. */
  function load(courseId) {
    try {
      const raw = localStorage.getItem(storageKey(courseId));
      if (!raw) return JSON.parse(JSON.stringify(EMPTY));
      const parsed = JSON.parse(raw);
      return {
        lessons: parsed.lessons || {},
        quizScores: parsed.quizScores || {},
        scenarios: parsed.scenarios || {},
        activities: parsed.activities || {},
        exam: parsed.exam || null,
        certName: parsed.certName || "",
        xpEvents: parsed.xpEvents || {},
        badges: parsed.badges || {},
        streak: parsed.streak && Array.isArray(parsed.streak.days)
          ? parsed.streak
          : { days: [] },
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(EMPTY));
    }
  }

  function save(courseId, data) {
    localStorage.setItem(storageKey(courseId), JSON.stringify(data));
  }

  /* ---------- Lessons ---------- */

  function markLessonComplete(courseId, lessonId) {
    const data = load(courseId);
    data.lessons[lessonId] = true;
    save(courseId, data);
  }

  function isLessonComplete(courseId, lessonId) {
    return !!load(courseId).lessons[lessonId];
  }

  function completedCount(courseId) {
    const lessons = load(courseId).lessons;
    return Object.keys(lessons).filter((k) => lessons[k]).length;
  }

  function percent(courseId, totalLessons) {
    if (!totalLessons) return 0;
    return Math.round((completedCount(courseId) / totalLessons) * 100);
  }

  /* ---------- Quiz scores (drives the mastery badges) ---------- */

  function setQuizScore(courseId, lessonId, correct, total) {
    const data = load(courseId);
    const prev = data.quizScores[lessonId];
    // Keep the learner's best attempt rather than their most recent one.
    if (!prev || correct > prev.correct) {
      data.quizScores[lessonId] = { correct: correct, total: total };
      save(courseId, data);
    }
  }

  function getQuizScore(courseId, lessonId) {
    return load(courseId).quizScores[lessonId] || null;
  }

  /* ---------- Scenario exercises ---------- */

  function setScenarioChoice(courseId, lessonId, choiceIndex) {
    const data = load(courseId);
    data.scenarios[lessonId] = choiceIndex;
    save(courseId, data);
  }

  function getScenarioChoice(courseId, lessonId) {
    const value = load(courseId).scenarios[lessonId];
    return typeof value === "number" ? value : null;
  }

  function scenarioCount(courseId) {
    return Object.keys(load(courseId).scenarios).length;
  }

  /* ---------- Interactive activities ----------
     Kept separate from quizzes and scenarios so a course built from different
     interaction types can still report progress without either count being
     inflated by the other. */

  function setActivityResult(courseId, activityId, payload) {
    const data = load(courseId);
    data.activities[activityId] = payload || true;
    save(courseId, data);
  }

  function getActivityResult(courseId, activityId) {
    return load(courseId).activities[activityId] || null;
  }

  function activityCount(courseId) {
    return Object.keys(load(courseId).activities).length;
  }

  /* ---------- Exam and certificate ---------- */

  function setExamResult(courseId, score, total, passed) {
    const data = load(courseId);
    data.exam = { score: score, total: total, passed: passed, date: new Date().toISOString() };
    save(courseId, data);
  }

  function getExamResult(courseId) {
    return load(courseId).exam;
  }

  function setCertName(courseId, name) {
    const data = load(courseId);
    data.certName = name;
    save(courseId, data);
  }

  function getCertName(courseId) {
    return load(courseId).certName;
  }

  function reset(courseId) {
    localStorage.removeItem(storageKey(courseId));
  }

  /* ---------- XP (event keyed, so replays never double-count) ---------- */

  function awardXp(courseId, eventKey, points) {
    const data = load(courseId);
    if (data.xpEvents[eventKey]) return false;
    data.xpEvents[eventKey] = points;
    save(courseId, data);
    return true;
  }

  function totalXp(courseId) {
    const events = load(courseId).xpEvents;
    return Object.keys(events).reduce((sum, k) => sum + (events[k] || 0), 0);
  }

  /* ---------- Badges ---------- */

  function awardBadge(courseId, badgeId) {
    const data = load(courseId);
    if (data.badges[badgeId]) return false;
    data.badges[badgeId] = new Date().toISOString();
    save(courseId, data);
    return true;
  }

  function hasBadge(courseId, badgeId) {
    return !!load(courseId).badges[badgeId];
  }

  function earnedBadges(courseId) {
    return Object.keys(load(courseId).badges);
  }

  /* ---------- Streak (distinct days of activity) ---------- */

  function todayStamp() {
    const d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function recordVisit(courseId) {
    const data = load(courseId);
    const today = todayStamp();
    if (data.streak.days.indexOf(today) === -1) {
      data.streak.days.push(today);
      data.streak.days.sort();
      save(courseId, data);
    }
  }

  /* Counts consecutive days ending today or yesterday. Returns 0 if the
     learner has not been active within the last day, so the flame resets. */
  function currentStreak(courseId) {
    const days = load(courseId).streak.days;
    if (!days.length) return 0;

    const oneDay = 86400000;
    const parse = (s) => {
      const parts = s.split("-");
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).getTime();
    };

    const todayMs = parse(todayStamp());
    const lastMs = parse(days[days.length - 1]);
    const gap = Math.round((todayMs - lastMs) / oneDay);
    if (gap > 1) return 0;

    let streak = 1;
    for (let i = days.length - 1; i > 0; i--) {
      const step = Math.round((parse(days[i]) - parse(days[i - 1])) / oneDay);
      if (step === 1) streak++;
      else break;
    }
    return streak;
  }

  function streakDayCount(courseId) {
    return load(courseId).streak.days.length;
  }

  /* ---------- Shared rendering helpers ---------- */

  /* Container needs [data-progress-fill] and [data-progress-label] children. */
  function renderBar(container, courseId, totalLessons) {
    if (!container) return;
    const pct = percent(courseId, totalLessons);
    const fill = container.querySelector("[data-progress-fill]");
    const label = container.querySelector("[data-progress-label]");
    if (fill) fill.style.width = pct + "%";
    if (label) {
      label.textContent =
        completedCount(courseId) + " of " + totalLessons + " lessons complete (" + pct + "%)";
    }
  }

  /* Decorates sidebar lesson links with done, current, and locked state. */
  function renderSidebar(sidebarEl, courseId, currentLessonId) {
    if (!sidebarEl) return;
    sidebarEl.querySelectorAll("[data-lesson-id]").forEach(function (link) {
      const id = link.getAttribute("data-lesson-id");
      const dot = link.querySelector(".step-dot");
      const done = isLessonComplete(courseId, id);
      const isCurrent = id === currentLessonId;
      const locked = typeof Gamification !== "undefined" &&
        !isCurrent && Gamification.isLessonLocked(courseId, id);

      link.classList.toggle("is-current", isCurrent);
      link.classList.toggle("is-locked", locked);

      if (dot) {
        dot.classList.toggle("is-done", done && !isCurrent);
        dot.classList.toggle("is-active", isCurrent);
        dot.classList.toggle("is-locked", locked && !done);
        dot.textContent = done ? "✓" : (locked ? "●" : "");
      }
    });
  }

  return {
    load, save, reset,
    markLessonComplete, isLessonComplete, completedCount, percent,
    setQuizScore, getQuizScore,
    setScenarioChoice, getScenarioChoice, scenarioCount,
    setActivityResult, getActivityResult, activityCount,
    setExamResult, getExamResult, setCertName, getCertName,
    awardXp, totalXp,
    awardBadge, hasBadge, earnedBadges,
    recordVisit, currentStreak, streakDayCount,
    renderBar, renderSidebar,
  };
})();
