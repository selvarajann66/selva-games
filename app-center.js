/* =========================================================
   SELVA WEB
   APP CENTER
   app-center.js

   App:
   Doodle Jump Astro

   APK:
   doodle-jump-astro.apk

   GitHub:
   selvarajann66/selva-games
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const GITHUB_API =
    "https://api.github.com/repos/selvarajann66/selva-games/releases/latest";

const APK_NAME =
    "doodle-jump-astro.apk";

const FALLBACK_DOWNLOAD_URL =
    "https://github.com/selvarajann66/selva-games/releases/latest/download/doodle-jump-astro.apk";


/* =========================================================
   PAGE ELEMENTS
   ========================================================= */

const installModal =
    document.getElementById("installModal");

const closeInstall =
    document.getElementById("closeInstall");

const downloadInstall =
    document.getElementById("downloadInstall");

const downloadCount =
    document.getElementById("downloadCount");

const appVersion =
    document.getElementById("appVersion");

const whatsNew =
    document.getElementById("whatsNew");

const downloadProgress =
    document.getElementById("downloadProgress");

const progressBar =
    document.getElementById("progressBar");

const downloadStatus =
    document.getElementById("downloadStatus");

const appCenterBackground =
    document.getElementById("appCenterBackground");


/* =========================================================
   GLOBAL DOWNLOAD URL
   ========================================================= */

let apkDownloadURL =
    FALLBACK_DOWNLOAD_URL;


/* =========================================================
   OPEN INSTALL MODAL
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

    resetDownloadUI();
}


/* =========================================================
   CLOSE INSTALL MODAL
   ========================================================= */

function closeInstallModal() {

    if (!installModal) {
        return;
    }

    installModal.classList.remove("show");

    installModal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

if (closeInstall) {

    closeInstall.addEventListener(
        "click",
        closeInstallModal
    );

}


/* =========================================================
   CLICK OUTSIDE MODAL
   ========================================================= */

if (installModal) {

    installModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === installModal
            ) {
                closeInstallModal();
            }

        }
    );

}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {
            closeInstallModal();
        }

    }
);


/* =========================================================
   RESET DOWNLOAD UI
   ========================================================= */

function resetDownloadUI() {

    if (downloadProgress) {

        downloadProgress.style.display =
            "none";

    }


    if (progressBar) {

        progressBar.style.width =
            "0%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Ready to download Doodle Jump Astro.";

    }


    if (downloadInstall) {

        downloadInstall.disabled =
            false;

        downloadInstall.textContent =
            "DOWNLOAD & INSTALL";

    }

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

    return Number(
        number || 0
    ).toLocaleString("en-IN");

}


/* =========================================================
   LOAD LATEST GITHUB RELEASE
   ========================================================= */

async function loadReleaseInfo() {

    try {

        const response =
            await fetch(
                GITHUB_API,
                {
                    method: "GET",

                    headers: {
                        "Accept":
                            "application/vnd.github+json"
                    },

                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "GitHub API error: " +
                response.status
            );

        }


        const release =
            await response.json();


        /* -----------------------------------------
           VERSION
           ----------------------------------------- */

        if (appVersion) {

            appVersion.textContent =
                release.tag_name ||
                "v1.0.0";

        }


        /* -----------------------------------------
           FIND DOODLE JUMP ASTRO APK
           ----------------------------------------- */

        const apkAsset =
            Array.isArray(release.assets)
                ? release.assets.find(
                    function (asset) {

                        return (
                            asset.name ===
                            APK_NAME
                        );

                    }
                )
                : null;


        /* -----------------------------------------
           APK FOUND
           ----------------------------------------- */

        if (apkAsset) {

            /* Real GitHub download count */

            if (downloadCount) {

                downloadCount.textContent =
                    formatNumber(
                        apkAsset.download_count
                    );

            }


            /* Real GitHub browser URL */

            if (
                apkAsset.browser_download_url
            ) {

                apkDownloadURL =
                    apkAsset.browser_download_url;

            }


            /* Release notes */

            if (
                whatsNew &&
                release.body
            ) {

                whatsNew.textContent =
                    release.body;

            }

        }


        /* -----------------------------------------
           APK NOT FOUND
           ----------------------------------------- */

        else {

            if (downloadCount) {

                downloadCount.textContent =
                    "0";

            }


            apkDownloadURL =
                FALLBACK_DOWNLOAD_URL;

        }

    }


    /* ---------------------------------------------
       ERROR
       --------------------------------------------- */

    catch (error) {

        console.error(
            "GitHub release loading failed:",
            error
        );


        if (downloadCount) {

            downloadCount.textContent =
                "0";

        }


        if (appVersion) {

            appVersion.textContent =
                "v1.0.0";

        }


        apkDownloadURL =
            FALLBACK_DOWNLOAD_URL;

    }

}


/* =========================================================
   DOWNLOAD APK
   ========================================================= */

async function downloadAPK() {

    if (!downloadInstall) {
        return;
    }


    /* ---------------------------------------------
       DISABLE BUTTON
       --------------------------------------------- */

    downloadInstall.disabled =
        true;

    downloadInstall.textContent =
        "STARTING...";


    /* ---------------------------------------------
       SHOW PROGRESS
       --------------------------------------------- */

    if (downloadProgress) {

        downloadProgress.style.display =
            "block";

    }


    if (progressBar) {

        progressBar.style.width =
            "5%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Preparing Doodle Jump Astro...";

    }


    await wait(300);


    /* ---------------------------------------------
       STEP 1
       --------------------------------------------- */

    if (progressBar) {

        progressBar.style.width =
            "25%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Connecting to GitHub...";

    }


    await wait(350);


    /* ---------------------------------------------
       STEP 2
       --------------------------------------------- */

    if (progressBar) {

        progressBar.style.width =
            "50%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Preparing APK download...";

    }


    await wait(350);


    /* ---------------------------------------------
       STEP 3
       --------------------------------------------- */

    if (progressBar) {

        progressBar.style.width =
            "75%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Starting Doodle Jump Astro download...";

    }


    await wait(300);


    /* ---------------------------------------------
       COMPLETE UI
       --------------------------------------------- */

    if (progressBar) {

        progressBar.style.width =
            "100%";

    }


    if (downloadStatus) {

        downloadStatus.textContent =
            "Download started. Android will handle the APK.";

    }


    /*
     * IMPORTANT:
     *
     * We navigate directly to GitHub's
     * browser_download_url.
     *
     * Do not fetch the APK through JavaScript.
     */

    window.location.href =
        apkDownloadURL;


    /* ---------------------------------------------
       RESTORE BUTTON
       --------------------------------------------- */

    setTimeout(
        function () {

            if (downloadInstall) {

                downloadInstall.disabled =
                    false;

                downloadInstall.textContent =
                    "DOWNLOAD AGAIN";

            }

        },
        2500
    );

}


/* =========================================================
   INSTALL BUTTON
   ========================================================= */

if (downloadInstall) {

    downloadInstall.addEventListener(
        "click",
        downloadAPK
    );

}


/* =========================================================
   WAIT HELPER
   ========================================================= */

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


/* =========================================================
   APP CENTER BACKGROUND VIDEO
   ========================================================= */

function startAppCenterBackground() {

    if (!appCenterBackground) {
        return;
    }


    appCenterBackground.muted =
        true;

    appCenterBackground.loop =
        true;

    appCenterBackground.autoplay =
        true;

    appCenterBackground.playsInline =
        true;


    const playPromise =
        appCenterBackground.play();


    if (
        playPromise &&
        typeof playPromise.catch === "function"
    ) {

        playPromise.catch(
            function () {

                /*
                 * Browser blocked autoplay.
                 * Try again after first user interaction.
                 */

                document.addEventListener(
                    "click",
                    function () {

                        appCenterBackground
                            .play()
                            .catch(
                                function () {}
                            );

                    },
                    {
                        once: true
                    }
                );

            }
        );

    }

}


/* =========================================================
   INITIALIZE PAGE
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            startAppCenterBackground();
            loadReleaseInfo();

        }
    );

}

else {

    startAppCenterBackground();
    loadReleaseInfo();

}


/* =========================================================
   GLOBAL FUNCTION
   ========================================================= */

window.openInstallModal =
    openInstallModal;