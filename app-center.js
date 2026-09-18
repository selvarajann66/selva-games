/* =========================================================
   SELVA WEB — APP CENTER
   Real GitHub Release Download Tracker
   ========================================================= */

const GITHUB_OWNER = "selvarajann66";
const GITHUB_REPO = "selva-games";

/*
 * APK filename used in the GitHub Release.
 */
const APK_NAME = "doodle-jump-astro.apk";

/*
 * Latest GitHub Release API.
 */
const RELEASE_API =
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;


/* =========================================================
   ELEMENTS
   ========================================================= */

const appVersion =
    document.getElementById("appVersion");

const appDownloads =
    document.getElementById("appDownloads");

const appDate =
    document.getElementById("appDate");

const whatsNew =
    document.getElementById("whatsNew");

const installButton =
    document.getElementById("installButton");


/* =========================================================
   VARIABLES
   ========================================================= */

let latestRelease = null;
let apkAsset = null;


/* =========================================================
   FORMAT DOWNLOAD COUNT
   ========================================================= */

function formatDownloads(number) {

    number = Number(number || 0);

    if (number >= 1000000) {
        return (
            number / 1000000
        ).toFixed(1) + "M";
    }

    if (number >= 1000) {
        return (
            number / 1000
        ).toFixed(1) + "K";
    }

    return number.toString();
}


/* =========================================================
   FORMAT RELEASE DATE
   ========================================================= */

function formatDate(dateString) {

    if (!dateString) {
        return "Unknown";
    }

    const date =
        new Date(dateString);

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
}


/* =========================================================
   SET LOADING STATE
   ========================================================= */

function setLoadingState() {

    if (appVersion) {
        appVersion.textContent =
            "Loading...";
    }

    if (appDownloads) {
        appDownloads.textContent =
            "Loading...";
    }

    if (appDate) {
        appDate.textContent =
            "Loading...";
    }

    if (whatsNew) {
        whatsNew.textContent =
            "Loading release information...";
    }

    if (installButton) {

        installButton.disabled = true;

        installButton.textContent =
            "LOADING...";
    }
}


/* =========================================================
   SET ERROR STATE
   ========================================================= */

function setErrorState(message) {

    console.error(message);

    if (appVersion) {
        appVersion.textContent =
            "Unavailable";
    }

    if (appDownloads) {
        appDownloads.textContent =
            "Download count unavailable";
    }

    if (appDate) {
        appDate.textContent =
            "Unavailable";
    }

    if (whatsNew) {
        whatsNew.textContent =
            "Release information could not be loaded.";
    }

    if (installButton) {

        installButton.disabled = true;

        installButton.textContent =
            "DOWNLOAD UNAVAILABLE";
    }
}


/* =========================================================
   LOAD GITHUB RELEASE
   ========================================================= */

async function loadLatestRelease() {

    try {

        const response =
            await fetch(
                RELEASE_API,
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
                `GitHub API error: ${response.status}`
            );
        }


        latestRelease =
            await response.json();


        /* -------------------------------------------------
           FIND APK
           ------------------------------------------------- */

        apkAsset =
            latestRelease.assets.find(
                asset =>
                    asset.name.toLowerCase() ===
                    APK_NAME.toLowerCase()
            );


        if (!apkAsset) {

            throw new Error(
                `APK "${APK_NAME}" was not found in the latest release.`
            );
        }


        /* -------------------------------------------------
           VERSION
           ------------------------------------------------- */

        if (appVersion) {

            appVersion.textContent =
                latestRelease.tag_name ||
                "Unknown";
        }


        /* -------------------------------------------------
           DOWNLOAD COUNT
           ------------------------------------------------- */

        if (appDownloads) {

            appDownloads.textContent =
                `${formatDownloads(
                    apkAsset.download_count
                )} downloads`;
        }


        /* -------------------------------------------------
           RELEASE DATE
           ------------------------------------------------- */

        if (appDate) {

            appDate.textContent =
                formatDate(
                    latestRelease.published_at
                );
        }


        /* -------------------------------------------------
           WHAT'S NEW
           ------------------------------------------------- */

        if (whatsNew) {

            const releaseNotes =
                latestRelease.body?.trim();


            if (releaseNotes) {

                whatsNew.textContent =
                    releaseNotes;

            } else {

                whatsNew.textContent =
                    "Initial SELVA WEB release.";
            }
        }


        /* -------------------------------------------------
           ENABLE DOWNLOAD BUTTON
           ------------------------------------------------- */

        if (installButton) {

            installButton.disabled = false;

            installButton.textContent =
                "DOWNLOAD & INSTALL";
        }


        console.log(
            "SELVA App Center release loaded:",
            latestRelease.tag_name
        );

        console.log(
            "APK:",
            apkAsset.name
        );

        console.log(
            "Downloads:",
            apkAsset.download_count
        );

    } catch (error) {

        setErrorState(
            error.message
        );
    }
}


/* =========================================================
   DOWNLOAD APK
   ========================================================= */

function downloadAPK() {

    if (!apkAsset) {

        alert(
            "Doodle Jump Astro APK is currently unavailable."
        );

        return;
    }


    /*
     * GitHub's real release asset URL.
     *
     * This is NOT a fake counter or simulated download.
     * GitHub handles the actual APK download.
     */
    const downloadURL =
        apkAsset.browser_download_url;


    /*
     * Send the user directly to the APK.
     */
    window.location.href =
        downloadURL;
}


/* =========================================================
   INSTALL BUTTON
   ========================================================= */

if (installButton) {

    installButton.addEventListener(
        "click",
        downloadAPK
    );
}


/* =========================================================
   INITIAL LOAD
   ========================================================= */

setLoadingState();

loadLatestRelease();


/* =========================================================
   AUTOMATIC REFRESH
   =========================================================

   Refresh the GitHub download count every 60 seconds.
   ========================================================= */

setInterval(
    loadLatestRelease,
    60000
);