document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       ELEMENTS
       ===================================== */

    const backgroundVideo =
        document.getElementById("appCenterBackground");

    const appListScreen =
        document.getElementById("appListScreen");

    const appDetailsScreen =
        document.getElementById("appDetailsScreen");

    const backButton =
        document.getElementById("backButton");

    const gameCenterButton =
        document.getElementById("gameCenterButton");

    const doodleJumpApp =
        document.getElementById("doodleJumpApp");

    const detailsBackButton =
        document.getElementById("detailsBackButton");

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
            console.log(
                "Background autoplay waiting for browser permission."
            );
        });

    }


    /* =====================================
       SHOW APP LIST
       ===================================== */

    function showAppList() {

        appDetailsScreen.classList.remove("active");

        appListScreen.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }


    /* =====================================
       SHOW APP DETAILS
       ===================================== */

    function showAppDetails() {

        appListScreen.classList.remove("active");

        appDetailsScreen.classList.add("active");

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

        loadDownloadCount();

    }


    /* =====================================
       APP CARD CLICK
       ===================================== */

    if (doodleJumpApp) {

        doodleJumpApp.addEventListener(
            "click",
            showAppDetails
        );

    }


    /* =====================================
       BACK TO APP CENTER
       ===================================== */

    if (detailsBackButton) {

        detailsBackButton.addEventListener(
            "click",
            showAppList
        );

    }


    /* =====================================
       MAIN BACK
       ===================================== */

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {
                window.location.href = "home.html";
            }
        );

    }


    /* =====================================
       GAME CENTER
       ===================================== */

    if (gameCenterButton) {

        gameCenterButton.addEventListener(
            "click",
            () => {
                window.location.href = "game-center.html";
            }
        );

    }


    /* =====================================
       INSTALL MODAL
       ===================================== */

    if (installButton) {

        installButton.addEventListener(
            "click",
            () => {

                installModal.classList.remove("hidden");

                document.body.style.overflow =
                    "hidden";

            }
        );

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

                if (
                    event.target === installModal
                ) {
                    closeModal();
                }

            }
        );

    }


    /* =====================================
       ESCAPE
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
                    "Starting APK download...";


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
                    "Download started. Android will handle the installation step.";

            }
        );

    }


    /* =====================================
       GITHUB DOWNLOAD COUNT
       ===================================== */

    async function loadDownloadCount() {

        if (!downloadCount) {
            return;
        }

        downloadCount.textContent = "—";

        downloadStatus.textContent =
            "Checking GitHub Releases...";


        try {

            const response =
                await fetch(
                    RELEASE_API,
                    {
                        headers: {
                            "Accept":
                                "application/vnd.github+json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "GitHub API request failed"
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
                    "APK asset not found.";

                return;

            }


            downloadCount.textContent =
                Number(
                    asset.download_count
                ).toLocaleString();


            downloadStatus.textContent =
                "Downloads from GitHub Releases";


        } catch (error) {

            console.warn(
                "Download count error:",
                error
            );


            downloadCount.textContent = "—";

            downloadStatus.textContent =
                "Download count unavailable.";

        }

    }


    /* =====================================
       INITIAL LOAD
       ===================================== */

    loadDownloadCount();

});