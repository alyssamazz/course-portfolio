/* ============================================================
   Module video slots

   Each module carries roughly 120MB of source video, which is well past
   GitHub's 100MB per file limit, so the masters stay out of the repo and are
   ignored by git. That leaves three situations to handle, and one element in
   the page markup that handles all of them:

     data-youtube  set   -> embed the hosted copy, which is what a deployed
                            site should do
     local file    found -> play it directly, so the course is fully working
                            when run from a laptop during a demo
     neither             -> the styled placeholder, naming the source file it
                            is waiting on

   Usage:
     <div class="video-slot" data-video="0_communication.mp4"
          data-label="Module 1: Communication"></div>

   Add data-youtube="VIDEO_ID" to a slot once that video is hosted and the
   embed takes over automatically.
   ============================================================ */

function initVideoSlots(options) {
  const opts = options || {};
  const base = opts.base || "../videos/";

  document.querySelectorAll(".video-slot").forEach(function (slot) {
    const file = slot.getAttribute("data-video") || "";
    const label = slot.getAttribute("data-label") || "";
    const youtube = slot.getAttribute("data-youtube");
    const poster = slot.getAttribute("data-poster") || "";
    const draft = slot.hasAttribute("data-draft");

    if (youtube) {
      slot.innerHTML =
        '<div class="video-frame"><iframe src="https://www.youtube.com/embed/' + youtube + '" ' +
        'title="' + label + '" frameborder="0" allowfullscreen ' +
        'allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"></iframe></div>';
      return;
    }

    /* Fall back to the placeholder whenever the local master is not sitting
       next to the page, which is the normal state of a deployed copy. */
    function placeholder(note) {
      slot.innerHTML =
        '<div class="video-placeholder">' +
          '<div class="play-btn">' +
            '<svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"></path></svg>' +
          '</div>' +
          '<div class="video-caption">' +
            '<span>Source: ' + file + '</span>' +
            '<span>' + note + '</span>' +
          '</div>' +
        '</div>';
    }

    if (!file) {
      placeholder("No source assigned");
      return;
    }

    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;
    video.className = "module-video";
    if (poster) video.poster = poster;
    video.src = base + file;

    /* Fires once the browser has given up on the source, which covers both a
       missing file and an unplayable one. */
    video.addEventListener("error", function () {
      placeholder("Awaiting hosted copy");
    });

    slot.innerHTML = "";
    slot.appendChild(video);

    /* A cut that still has placeholder slates in it must say so on its face.
       A reviewer who mistakes a draft for a finished film gives you useless
       feedback, and a client who does is a worse problem. */
    if (draft) {
      const tag = document.createElement("span");
      tag.className = "draft-badge";
      tag.textContent = "Rough cut";
      slot.appendChild(tag);
      slot.classList.add("is-draft");
    }
  });
}
