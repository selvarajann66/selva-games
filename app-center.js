(function () {
    "use strict";

    const backButton = document.getElementById("backButton");
    const gameCenterButton = document.getElementById("gameCenterButton");
    const appCount = document.getElementById("appCount");
    const toast = document.getElementById("toast");

    function goTo(page) {
        window.location.href = page;
    }

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        window.clearTimeout(showToast.timer);
        showToast.timer = window.setTimeout(function () {
            toast.classList.remove("show");
        }, 2200);
    }

    if (backButton) {
        backButton.addEventListener("click", function () {
            goTo("home.html");
        });
    }

    if (gameCenterButton) {
        gameCenterButton.addEventListener("click", function () {
            goTo("game-center.html");
        });
    }

    document.querySelectorAll(".open-app").forEach(function (button) {
        button.addEventListener("click", function () {
            const action = button.dataset.action;

            if (action === "music") {
                // The web project does not currently have a confirmed public Music URL.
                // Keep the card functional without inventing a destination.
                showToast("MUSIC — Android app link can be added here.");
            }
        });
    });

    const cards = document.querySelectorAll(".app-card");
    if (appCount) {
        const count = String(cards.length).padStart(2, "0");
        appCount.textContent = count + (cards.length === 1 ? " APP" : " APPS");
    }
})();
