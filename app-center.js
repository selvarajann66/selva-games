/* =========================================
   SELVA WEB — APP CENTER
   Doodle Jump Astro
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
       ===================================== */

    const backgroundVideo =
        document.getElementById("appCenterBackground");

    const backButton =
        document.getElementById("backButton");

    const gameCenterButton =
        document.getElementById("gameCenterButton");

    const installButton =
        document.getElementById("installButton");

    const installModal =
        document.getElementById("installModal");

    const modalClose =
        document.getElementById("modalClose");

    const downloadButton =
        document.getElementById("downloadButton");

    const downloadMessage =
        document.getElementById("downloadMessage");

    const downloadCount =
        document.getElementById("downloadCount");

    const downloadStatus =
        document.getElementById("downloadStatus");


    /* =====================================
       GITHUB RELEASE
       ===================================== */

    const RELEASE_API =
        "https://api.github.com/repos/selvarajann66/selva-games/releases/tags/v1.0.0";

    const APK_URL =
        "https://github.com/selvarajann66/selva-games/releases/download/v1.0.0/doodle-jump-astro.apk";


    /* =====================================
       BACKGROUND VIDEO
       ===================================== */

    if (backgroundVideo) {

        backgroundVideo.muted = true;

        backgroundVideo.play().catch(() => {
            /*
             * Some browsers block autoplay temporarily.
             * The video remains available and can start
             * after browser interaction.
             */
        });

        backgroundVideo.addEventListener(
            "error",
            () => {
                console.warn(
                    "SELVA App Center background video could not be loaded."
                );
            }
        );
    }


    /* =====================================
       NAVIGATION
       ===================================== */

    if (backButton) {

        backButton.addEventListener("click", () => {
            window.location.href = "home.html";
        });

    }


    if (gameCenterButton) {

        gameCenterButton.addEventListener("click", () => {
            window.location.href = "game-center.html";
        });

    }


    /* =====================================
       OPEN INSTALL MODAL
       ===================================== */

    if (installButton) {

        installButton.addEventListener("click", () => {

            installModal.classList.remove("hidden");

            document.body.style.overflow = "hidden";

        });

    }


    /* =====================================
       CLOSE MODAL
       ===================================== */

    function closeModal() {

        installModal.classList.add("hidden");

        document.body.style.overflow = "";

    }


    if (modalClose) {

        modalClose.addEventListener(
            "click",
            closeModal
        );

    }


    /* =====================================
       CLICK OUTSIDE MODAL
       ===================================== */

    if (installModal) {

        installModal.addEventListener(
            "click",
            (event) => {

                if (event.target === installModal) {
                    closeModal();
                }

            }
        );

    }


    /* =====================================
       ESCAPE KEY
       ===================================== */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                !installModal.classList.contains("hidden")
            ) {
                closeModal();
            }

        }
    );


    /* =====================================
       DOWNLOAD APK
       ===================================== */

    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            () => {

                downloadMessage.textContent =
                    "Starting official APK download...";

                const link =
                    document.createElement("a");

                link.href = APK_URL;

                link.download =
                    "doodle-jump-astro.apk";

                link.target = "_blank";

                link.rel = "noopener";

                document.body.appendChild(link);

                link.click();

                link.remove();

                downloadMessage.textContent =
                    "APK download started. Android may ask for permission before installation.";

            }
        );

    }


    /* =====================================
       GET GITHUB DOWNLOAD COUNT
       ===================================== */

    async function loadDownloadCount() {

        try {

            downloadStatus.textContent =
                "Checking GitHub Releases...";

            const response =
                await fetch(RELEASE_API, {
                    headers: {
                        "Accept":
                            "application/vnd.github+json"
                    }
                });

            if (!response.ok) {
                throw new Error(
                    "GitHub release unavailable"
                );
            }

            const release =
                await response.json();

            const asset =
                release.assets.find(
                    item =>
                        item.name ===
                        "doodle-jump-astro.apk"
                );

            if (!asset) {

                downloadCount.textContent = "0";

                downloadStatus.textContent =
                    "APK release asset not found.";

                return;
            }

            downloadCount.textContent =
                Number(asset.download_count).toLocaleString();

            downloadStatus.textContent =
                "Downloads from GitHub Releases";

        } catch (error) {

            console.warn(
                "Could not load GitHub download count:",
                error
            );

            downloadCount.textContent = "—";

            downloadStatus.textContent =
                "Download count temporarily unavailable.";

        }

    }


    /* =====================================
       LOAD DOWNLOAD COUNT
       ===================================== */

    loadDownloadCount();

});