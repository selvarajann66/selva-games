/* =========================================================
   SELVA WEB - APP CENTER
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURATION
   ========================================================= */

const APK_URL =
    "https://github.com/selvarajann66/selva-games/releases/latest/download/doodle-jump-astro.apk";

const APK_FILE_NAME =
    "doodle-jump-astro.apk";


/* =========================================================
   DOM
   ========================================================= */

const backgroundVideo =
    document.getElementById("appCenterBackground");

const installModal =
    document.getElementById("installModal");

const downloadStatus =
    document.getElementById("downloadStatus");

const progressContainer =
    document.getElementById("progressContainer");

const progressBar =
    document.getElementById("progressBar");

const downloadButton =
    document.getElementById("downloadButton");


/* =========================================================
   BACKGROUND VIDEO
   ========================================================= */

function startBackgroundVideo() {

    if (!backgroundVideo) {
        return;
    }

    backgroundVideo.muted = true;
    backgroundVideo.loop = true;
    backgroundVideo.playsInline = true;

    const playPromise =
        backgroundVideo.play();

    if (playPromise !== undefined) {

        playPromise.catch(() => {

            /*
             * Some browsers block autoplay.
             * The video remains available and can
             * start after the first user interaction.
             */

        });

    }

}


document.addEventListener(
    "DOMContentLoaded",
    startBackgroundVideo
);


document.addEventListener(
    "pointerdown",
    () => {

        if (
            backgroundVideo &&
            backgroundVideo.paused
        ) {

            backgroundVideo.muted = true;

            backgroundVideo.play().catch(() => {});

        }

    },
    {
        once: true,
        passive: true
    }
);


/* =========================================================
   NAVIGATION
   ========================================================= */

function goHome() {

    window.location.href =
        "home.html";

}


function goGameCenter() {

    window.location.href =
        "game-center.html";

}


/*
 * Make functions available to inline HTML buttons.
 */

window.goHome =
    goHome;

window.goGameCenter =
    goGameCenter;


/* =========================================================
   INSTALL MODAL
   ========================================================= */

function openInstallModal() {

    if (!installModal) {
        return;
    }

    installModal.classList.add("show");

    installModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

    resetDownloadState();

}


function closeInstallModal() {

    if (!installModal) {
        return;
    }

    installModal.classList.remove("show");

    installModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


window.openInstallModal =
    openInstallModal;


window.closeInstallModal =
    closeInstallModal;


/* =========================================================
   RESET DOWNLOAD UI
   ========================================================= */

function resetDownloadState() {

    if (downloadStatus) {

        downloadStatus.textContent =
            "Ready to download";

    }

    if (progressContainer) {

        progressContainer.classList.remove(
            "show"
        );

    }

    if (progressBar) {

        progressBar.style.width =
            "0%";

    }

    if (downloadButton) {

        downloadButton.disabled =
            false;

        downloadButton.textContent =
            "DOWNLOAD & INSTALL";

    }

}


/* =========================================================
   START DOWNLOAD
   ========================================================= */

async function startDownload() {

    if (!downloadButton) {
        return;
    }

    downloadButton.disabled =
        true;

    downloadButton.textContent =
        "CHECKING...";


    if (downloadStatus) {

        downloadStatus.textContent =
            "Checking latest release...";

    }


    if (progressContainer) {

        progressContainer.classList.add(
            "show"
        );

    }


    try {

        /*
         * Check whether GitHub's latest-release
         * URL responds.
         *
         * HEAD is only a validation request.
         */

        let available = false;

        try {

            const response =
                await fetch(
                    APK_URL,
                    {
                        method: "HEAD",
                        cache: "no-store",
                        redirect: "follow"
                    }
                );

            available =
                response.ok;

        } catch (error) {

            /*
             * Some browsers block cross-origin HEAD.
             * The actual download URL can still work,
             * so continue instead of treating it as
             * a failed APK.
             */

            available = true;

        }


        if (!available) {

            throw new Error(
                "APK is not available"
            );

        }


        /*
         * Show a short UI progress animation.
         * This is NOT the real network percentage.
         */

        await animateDownloadProgress();


        if (downloadStatus) {

            downloadStatus.textContent =
                "Opening APK download...";

        }


        /*
         * Use an invisible anchor so the browser
         * handles the APK download normally.
         */

        const link =
            document.createElement("a");

        link.href =
            APK_URL;

        link.download =
            APK_FILE_NAME;

        link.target =
            "_blank";

        link.rel =
            "noopener";

        document.body.appendChild(link);

        link.click();

        link.remove();


        if (downloadStatus) {

            downloadStatus.textContent =
                "Download started. Android will handle installation.";

        }


        downloadButton.textContent =
            "DOWNLOAD STARTED";


        /*
         * Keep the modal open briefly so the
         * user can read the message.
         */

        setTimeout(
            () => {

                downloadButton.disabled =
                    false;

                downloadButton.textContent =
                    "DOWNLOAD AGAIN";

            },
            2500
        );


    } catch (error) {

        console.error(
            "APK download error:",
            error
        );


        if (downloadStatus) {

            downloadStatus.textContent =
                "Download could not be started.";

        }


        if (progressBar) {

            progressBar.style.width =
                "0%";

        }


        downloadButton.disabled =
            false;

        downloadButton.textContent =
            "TRY AGAIN";

    }

}


window.startDownload =
    startDownload;


/* =========================================================
   DOWNLOAD PROGRESS ANIMATION
   ========================================================= */

function animateDownloadProgress() {

    return new Promise(
        (resolve) => {

            let progress =
                0;


            const timer =
                setInterval(
                    () => {

                        /*
                         * Slow down near the end.
                         */

                        if (progress < 55) {

                            progress += 8;

                        } else if (progress < 82) {

                            progress += 4;

                        } else if (progress < 95) {

                            progress += 2;

                        } else {

                            progress += 1;

                        }


                        if (progress > 96) {

                            progress =
                                96;

                        }


                        if (progressBar) {

                            progressBar.style.width =
                                progress + "%";

                        }


                        if (downloadStatus) {

                            downloadStatus.textContent =
                                "Preparing APK... " +
                                Math.round(progress) +
                                "%";

                        }


                        if (progress >= 96) {

                            clearInterval(
                                timer
                            );

                            setTimeout(
                                () => {

                                    if (progressBar) {

                                        progressBar.style.width =
                                            "100%";

                                    }

                                    resolve();

                                },
                                180
                            );

                        }

                    },
                    90
                );

        }
    );

}


/* =========================================================
   MODAL KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            installModal &&
            installModal.classList.contains("show")
        ) {

            closeInstallModal();

        }

    }
);


/* =========================================================
   VIDEO ERROR DEBUGGING
   ========================================================= */

if (backgroundVideo) {

    backgroundVideo.addEventListener(
        "error",
        () => {

            console.error(
                "SELVA App Center background video failed to load:",
                "assets/live_wallpaper_appcenter.mp4"
            );

        }
    );


    backgroundVideo.addEventListener(
        "loadeddata",
        () => {

            console.log(
                "SELVA App Center background video loaded."
            );

        }
    );

}