/* ============================================================
   BerwynAI Academy: quiz and exam grading (client side, no backend)

   Expected markup:
   <form data-quiz-form>
     <div class="quiz-question" data-correct="1">
       <p class="q-text">...</p>
       <div class="quiz-options">
         <label class="quiz-option"><input type="radio" name="q1" value="0">...</label>
         <label class="quiz-option"><input type="radio" name="q1" value="1">...</label>
       </div>
       <div class="quiz-feedback"></div>
     </div>
     ...
     <button type="submit" class="btn btn-primary">Submit</button>
   </form>
   <div data-quiz-summary class="quiz-summary">
     <div class="score" data-quiz-score></div>
     <p data-quiz-summary-text></p>
   </div>
   ============================================================ */

function initQuiz(options) {
  const form = document.querySelector(options.formSelector);
  const summary = document.querySelector(options.summarySelector);
  if (!form) return;

  const questions = Array.from(form.querySelectorAll(".quiz-question"));

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    let unanswered = 0;
    let correctCount = 0;
    const missedIndices = [];

    questions.forEach((q, idx) => {
      const name = "q" + (idx + 1);
      const selected = form.querySelector('input[name="' + name + '"]:checked');
      const correctValue = q.getAttribute("data-correct");
      const feedback = q.querySelector(".quiz-feedback");
      const options = q.querySelectorAll(".quiz-option");

      options.forEach((opt) => opt.classList.remove("is-correct", "is-incorrect"));

      if (!selected) {
        unanswered++;
        return;
      }

      const isCorrect = selected.value === correctValue;
      if (isCorrect) {
        correctCount++;
      } else {
        missedIndices.push(idx);
      }

      const chosenLabel = selected.closest(".quiz-option");
      const correctInput = q.querySelector('input[value="' + correctValue + '"]');
      const correctLabel = correctInput ? correctInput.closest(".quiz-option") : null;

      if (isCorrect) {
        chosenLabel.classList.add("is-correct");
      } else {
        chosenLabel.classList.add("is-incorrect");
        if (correctLabel) correctLabel.classList.add("is-correct");
      }

      if (feedback) {
        if (isCorrect) {
          feedback.textContent = "Correct.";
        } else {
          const explain = q.getAttribute("data-explain");
          feedback.innerHTML =
            "Not quite. The correct answer is highlighted above." +
            (explain ? '<div class="quiz-explain">' + explain + "</div>" : "");
        }
        feedback.classList.add("is-visible", isCorrect ? "is-correct" : "is-incorrect");
      }
    });

    if (unanswered > 0) {
      alert("Please answer all " + questions.length + " questions before submitting.");
      return;
    }

    const total = questions.length;
    const ratio = total ? correctCount / total : 0;
    const passThreshold = options.passRatio || 0;
    const passed = ratio >= passThreshold;

    if (summary) {
      const scoreEl = summary.querySelector("[data-quiz-score]");
      const textEl = summary.querySelector("[data-quiz-summary-text]");
      if (scoreEl) scoreEl.textContent = correctCount + " / " + total;
      if (textEl) {
        textEl.textContent = passed
          ? (options.passMessage || "Nice work, you passed.")
          : (options.failMessage || "Review the material above and try again.");
      }
      summary.classList.add("is-visible");
      summary.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    if (typeof options.onComplete === "function") {
      options.onComplete({ correctCount, total, ratio, passed, missedIndices });
    }
  });
}
