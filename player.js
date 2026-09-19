// player.js — Anti-Download Video Engine, Resume Sync & Local Testing

let progressTimer = null;
let localBlobUrl = null;

function handleLocalVideoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  localBlobUrl = URL.createObjectURL(file);
  const player = document.getElementById("live-player");
  if (player) {
    player.src = localBlobUrl;
    player.play();
  }
}

function initVideoPlayer(lectureId, resumeSeconds) {
  const player = document.getElementById("live-player");
  const toast = document.getElementById("resume-toast");
  const timeStr = document.getElementById("resume-time-str");
  const statusText = document.getElementById("progress-status");
  if (!player) return;

  // Prevent right-click context menu to stop direct download
  player.oncontextmenu = (e) => {
    e.preventDefault();
    return false;
  };

  // Restore playback position on load
  player.onloadedmetadata = () => {
    if (resumeSeconds > 2) {
      player.currentTime = resumeSeconds;
      if (toast && timeStr) {
        const m = Math.floor(resumeSeconds / 60);
        const s = Math.floor(resumeSeconds % 60);
        timeStr.innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3200);
      }
    }
  };

  function recordProgress() {
    if (!state.currentUser) return;
    const cur = player.currentTime;
    const dur = player.duration || 1;
    const isCompleted = (cur / dur) >= 0.9;

    if (!state.progress[state.currentUser.email]) {
      state.progress[state.currentUser.email] = {};
    }

    const wasCompleted = state.progress[state.currentUser.email][lectureId]?.completed || false;

    state.progress[state.currentUser.email][lectureId] = {
      seconds: Math.floor(cur),
      completed: isCompleted || wasCompleted,
      updatedAt: new Date().toISOString()
    };
    saveState();

    if (statusText) {
      statusText.innerText = (isCompleted || wasCompleted)
        ? "Completed (100% finished)"
        : `${Math.round((cur / dur) * 100)}% watched (Auto-saved)`;
    }
  }

  if (progressTimer) clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!player.paused) recordProgress();
  }, 3000);

  player.onpause = recordProgress;
  player.onended = () => {
    recordProgress();
    renderNav();
  };
}
