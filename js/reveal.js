/* ============================================================
   Reveal on scroll

   Fades and lifts diagrams, exercises and figures as they come into view.
   Everything is visible by default and the class is only added once the
   observer confirms it is supported, so a browser without IntersectionObserver
   or a user with JavaScript disabled sees the finished page rather than a
   blank one.

   Anyone who has asked their operating system to reduce motion gets the page
   with no animation at all. This is checked before anything is marked for
   reveal, so the elements never receive the starting transform.
   ============================================================ */

(function () {
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  var SELECTOR = [
    ".media-figure",
    ".lesson-illustration",
    ".practice",
    ".scenario",
    ".builder",
    ".dialogue",
    ".myth-grid",
    ".key-takeaways",
    ".short-version",
    ".track-card",
    ".course-card",
    ".cert-tile",
    ".badge-tile",
  ].join(",");

  var targets = [].slice.call(document.querySelectorAll(SELECTOR));
  if (!targets.length) return;

  targets.forEach(function (el) { el.classList.add("reveal"); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.06 });

  targets.forEach(function (el) { io.observe(el); });

  /* Anything already in view on load should not wait for a scroll event. */
  requestAnimationFrame(function () {
    targets.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add("is-visible");
        io.unobserve(el);
      }
    });
  });
})();
