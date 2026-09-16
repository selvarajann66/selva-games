document.addEventListener("DOMContentLoaded", () => {
  const back = document.getElementById("backButton");
  const games = document.getElementById("gameCenterButton");
  const music = document.getElementById("musicButton");
  const toast = document.getElementById("toast");

  back.addEventListener("click", () => location.href = "home.html");
  games.addEventListener("click", () => location.href = "game-center.html");

  music.addEventListener("click", () => {
    showToast("Music app selected");
    // Add your real Music app URL here when it is ready.
  });

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  }
});
