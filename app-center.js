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

    const privateVaultApp =
        document.getElementById("privateVaultApp");

    const doodleJumpApp =
        document.getElementById("doodleJumpApp");

    const musicApp =
        document.getElementById("musicApp");

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
       DETAILS ELEMENTS
       ===================================== */

    const detailsIcon =
        document.getElementById("detailsIcon");

    const detailsTitle =
        document.getElementById("detailsTitle");

    const detailsDeveloper =
        document.getElementById("detailsDeveloper");

    const detailsTags =
        document.getElementById("detailsTags");

    const detailsVersion =
        document.getElementById("detailsVersion");

    const detailsDescription =
        document.getElementById("detailsDescription");

    const detailsWhatsNew =
        document.getElementById("detailsWhatsNew");

    const safeDownloadText =
        document.getElementById("safeDownloadText");

    const modalIcon =
        document.getElementById("modalIcon");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalSubtitle =
        document.getElementById("modalSubtitle");


    /* =====================================
       APP DATA
       ===================================== */

    const APPS = {

        privateVault: {

            name: "Private Vault",

            icon: "🔐",

            version: "1.0.1",

            category: [
                "PRIVACY",
                "STORAGE",
                "ANDROID"
            ],

            description:
                "Private Vault is a personal Android app for securely storing private files, images, videos and audio.",

            whatsNew:
                "Private Vault v1.0.1.",

            releaseTag:
                "v1.0.1",

            apkName:
                "private-vault.apk"

        },


        doodleJump: {

            name: "Doodle Jump Astro",

            icon: "★",

            version: "1.0.0",

            category: [
                "ARCADE",
                "ADVENTURE",
                "ANDROID"
            ],

            description:
                "Doodle Jump Astro is an arcade adventure game from SELVA.",

            whatsNew:
                "Initial release of Doodle Jump Astro.",

            releaseTag:
                "v1.0.0",

            apkName:
                "doodle-jump-astro.apk"

        },


        music: {

            name: "Music",

            icon: "🎵",

            version: "1",

            category: [
                "MUSIC",
                "ENTERTAINMENT",
                "ANDROID"
            ],

            description:
                "Music is an offline-first Android music player designed for anime music lovers, with library, playlists, albums, artists, folders, history, lyrics, favorites and Game Center integration.",

            whatsNew:
                "Music v1 — initial release.",

            releaseTag:
                "v1",

            apkName:
                "music.apk"

        }

    };


    /* =====================================
       CURRENT APP
       ===================================== */

    let currentApp =
        APPS.privateVault;


    /* =====================================
       GITHUB
       ===================================== */

    const GITHUB_REPOSITORY =
        "selvarajann66/selva-games";


    /* =====================================
       BUILD APK URL
       ===================================== */

    function getApkUrl(app) {

        return (
            "https://github.com/" +
            GITHUB_REPOSITORY +
            "/releases/download/" +
            app.releaseTag +
            "/" +
            app.apkName
        );

    }


    /* =====================================
       BUILD RELEASE API URL
       ===================================== */

    function getReleaseApiUrl(app) {

        return (
            "https://api.github.com/repos/" +
            GITHUB_REPOSITORY +
            "/releases/tags/" +
            app.releaseTag
        );

    }


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

        appDetailsScreen.classList.remove(
            "active"
        );

        appListScreen.classList.add(
            "active"
        );

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }


    /* =====================================
       UPDATE DETAILS
       ===================================== */

    function updateDetails(app) {

        currentApp = app;


        detailsIcon.textContent =
            app.icon;


        detailsTitle.innerHTML =
            app.name +
            ' <span class="verified">✓</span>';


        detailsDeveloper.textContent =
            "SELVA";


        detailsTags.innerHTML =
            app.category
                .map(tag => `<span>${tag}</span>`)
                .join("");


        detailsVersion.textContent =
            "Version " +
            app.version;


        detailsDescription.textContent =
            app.description;


        detailsWhatsNew.textContent =
            app.whatsNew;


        safeDownloadText.textContent =
            "Official " +
            app.name +
            " APK hosted through SELVA's GitHub Release.";


        modalIcon.textContent =
            app.icon;


        modalTitle.textContent =
            app.name;


        modalSubtitle.textContent =
            "SELVA • Android • v" +
            app.version;


        downloadMessage.textContent =
            "Android will handle the APK installation after the download.";

    }


    /* =====================================
       SHOW APP DETAILS
       ===================================== */

    function showAppDetails(app) {

        updateDetails(app);

        appListScreen.classList.remove(
            "active"
        );

        appDetailsScreen.classList.add(
            "active"
        );

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

        loadDownloadCount();

    }


    /* =====================================
       PRIVATE VAULT CARD
       ===================================== */

    if (privateVaultApp) {

        privateVaultApp.addEventListener(
            "click",
            () => {

                showAppDetails(
                    APPS.privateVault
                );

            }
        );

    }


    /* =====================================
       DOODLE JUMP CARD
       ===================================== */

    if (doodleJumpApp) {

        doodleJumpApp.addEventListener(
            "click",
            () => {

                showAppDetails(
                    APPS.doodleJump
                );

            }
        );

    }


    /* =====================================
       MUSIC CARD
       ===================================== */

    if (musicApp) {

        musicApp.addEventListener(
            "click",
            () => {

                showAppDetails(
                    APPS.music
                );

            }
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

                window.location.href =
                    "home.html";

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

                window.location.href =
                    "game-center.html";

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

                installModal.classList.remove(
                    "hidden"
                );

                document.body.style.overflow =
                    "hidden";

            }
        );

    }


    /* =====================================
       CLOSE MODAL
       ===================================== */

    function closeModal() {

        installModal.classList.add(
            "hidden"
        );

        document.body.style.overflow =
            "";

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
                    event.target ===
                    installModal
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
                !installModal.classList.contains(
                    "hidden"
                )
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

                const apkUrl =
                    getApkUrl(currentApp);


                downloadMessage.textContent =
                    "Starting APK download...";


                const link =
                    document.createElement("a");


                link.href =
                    apkUrl;


                link.download =
                    currentApp.apkName;


                link.target =
                    "_blank";


                link.rel =
                    "noopener noreferrer";


                document.body.appendChild(
                    link
                );


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


        downloadCount.textContent =
            "—";


        downloadStatus.textContent =
            "Checking GitHub Releases...";


        try {

            const response =
                await fetch(
                    getReleaseApiUrl(
                        currentApp
                    ),
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
                        currentApp.apkName
                );


            if (!asset) {

                downloadCount.textContent =
                    "0";


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


            downloadCount.textContent =
                "—";


            downloadStatus.textContent =
                "Download count unavailable.";

        }

    }


    /* =====================================
       INITIAL LOAD
       ===================================== */

    updateDetails(
        APPS.privateVault
    );


    loadDownloadCount();

});