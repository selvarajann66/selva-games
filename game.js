javascript
"use strict";


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

const splashScreen =
    document.getElementById("splashScreen");

const gameCenter =
    document.getElementById("gameCenter");

const gameScreen =
    document.getElementById("gameScreen");

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


/* =========================================================
   ASSET LOADER
   ========================================================= */

const imageCache = {};

function image(path) {

    if (!imageCache[path]) {

        const img = new Image();

        img.src =
            "assets/doodle_jump/" + path;

        imageCache[path] = img;
    }

    return imageCache[path];
}


/* PLAYER */

const playerImages = {

    idle:
        image("player/player_idle.png"),

    idle2:
        image("player/player_idle2.png"),

    rise:
        image("player/player_rise.png"),

    rise2:
        image("player/player_rise2.png"),

    fall:
        image("player/player_fall.png"),

    fall2:
        image("player/player_fall2.png"),

    boost:
        image("player/player_boost.png"),

    jetpack:
        image("player/player_jetpack.png")
};


/* ENVIRONMENT */

const environment = {

    city:
        image("environment/space_city.png"),

    mountain:
        image("environment/mountain.png"),

    moon:
        image("environment/moon.png"),

    cloudLarge:
        image("environment/cloud_large.png"),

    cloudMedium:
        image("environment/cloud_medium.png"),

    cloudSmall1:
        image("environment/cloud_small_01.png"),

    cloudSmall2:
        image("environment/cloud_small_02.png"),

    islandLarge:
        image("environment/floating_island_large.png"),

    islandSmall1:
        image("environment/floating_island_small_01.png"),

    islandSmall2:
        image("environment/floating_island_small_02.png"),

    islandSmall3:
        image("environment/floating_island_small_03.png")
};


/* DECORATION */

const decoration = {

    blueStar:
        image("decoration/blue_star.png"),

    pinkStar:
        image("decoration/pink_star.png"),

    purpleStar:
        image("decoration/purple_star.png")
};


/* POWERUPS */

const powerups = {

    spring:
        image("powerups/spring.png"),

    rocket:
        image("powerups/rocket_powerup.png"),

    shield:
        image("powerups/shield.png"),

    magnet:
        image("powerups/magnet.png")
};


/* COLLECTIBLES */

const collectibles = {

    gem:
        image("collectibles/gem.png"),

    heart:
        image("collectibles/heart.png"),

    star:
        image("collectibles/star.png"),

    star2:
        image("collectibles/star_2.png"),

    specialStar:
        image("collectibles/star_special.png")
};


const coins = [
    image("collectibles/coin_01.png"),
    image("collectibles/coin_02.png"),
    image("collectibles/coin_03.png"),
    image("collectibles/coin_04.png")
];


/* ENEMIES */

const enemiesImages = {

    alien:
        image("enemies/enemy_alien.png"),

    bat:
        image("enemies/enemy_bat.png"),

    purpleBat:
        image("enemies/enemy_bat_purple.png"),

    bee:
        image("enemies/enemy_bee.png"),

    monster:
        image("enemies/enemy_monster.png"),

    spike:
        image("enemies/enemy_spike.png"),

    ufo:
        image("enemies/enemy_ufo.png")
};


/* EFFECTS */

const effects = {

    explosion:
        image("effects/explosion.png"),

    projectile:
        image("effects/enemy_projectile.png")
};


/* =========================================================
   PLATFORM ASSETS
   ========================================================= */

const platformNames = [

    "grass_01",
    "grass_02",
    "grass_03",
    "grass_04",

    "wood_01",
    "wood_02",
    "wood_03",
    "wood_04",

    "stone_01",
    "stone_02",
    "stone_03",
    "stone_04",

    "cloud_01",
    "cloud_02",

    "ice_01",
    "ice_02",

    "metal_01",
    "metal_02",

    "lava_01",
    "lava_02",

    "alien_01",
    "alien_02"
];

const platformsImages = {};

platformNames.forEach(name => {

    platformsImages[name] =
        image("platforms/platform_" + name + ".png");

});


/* =========================================================
   DIFFICULTIES
   ========================================================= */

const DIFFICULTIES = {

    EASY: {

        name: "EASY",

        gravity: 1800,

        jumpVelocity: -850,

        moveSpeed: 430,

        minPlatformWidth: 140,

        maxPlatformWidth: 200,

        minGap: 85,

        maxGap: 130,

        scrollSpeed: 0.85,

        movingChance: 0.05
    },

    NORMAL: {

        name: "NORMAL",

        gravity: 2100,

        jumpVelocity: -900,

        moveSpeed: 520,

        minPlatformWidth: 110,

        maxPlatformWidth: 180,

        minGap: 95,

        maxGap: 150,

        scrollSpeed: 1,

        movingChance: 0.20
    },

    HARD: {

        name: "HARD",

        gravity: 2300,

        jumpVelocity: -930,

        moveSpeed: 580,

        minPlatformWidth: 95,

        maxPlatformWidth: 150,

        minGap: 110,

        maxGap: 165,

        scrollSpeed: 1.2,

        movingChance: 0.40
    },

    ULTRA_HARD: {

        name: "ULTRA HARD",

        gravity: 2500,

        jumpVelocity: -960,

        moveSpeed: 630,

        minPlatformWidth: 80,

        maxPlatformWidth: 130,

        minGap: 120,

        maxGap: 180,

        scrollSpeed: 1.4,

        movingChance: 0.60
    }
};


/* =========================================================
   STORAGE
   ========================================================= */

function numberStorage(key, fallback = 0) {

    const value =
        Number(localStorage.getItem(key));

    return Number.isFinite(value)
        ? value
        : fallback;
}


let difficultyKey =
    localStorage.getItem(
        "doodle_jump_difficulty"
    ) || "NORMAL";


let difficulty =
    DIFFICULTIES[difficultyKey]
    || DIFFICULTIES.NORMAL;


let coins =
    numberStorage("coin_balance");

let gems =
    numberStorage("gem_balance");

let hearts =
    numberStorage("heart_balance");

let shields =
    numberStorage("shield_balance");

let jetpacks =
    numberStorage("jetpack_balance");


let highScore =
    numberStorage(
        "doodle_jump_high_score_" +
        difficulty.name.toLowerCase().replaceAll(" ", "_")
    );


function saveInventory() {

    localStorage.setItem(
        "coin_balance",
        coins
    );

    localStorage.setItem(
        "gem_balance",
        gems
    );

    localStorage.setItem(
        "heart_balance",
        hearts
    );

    localStorage.setItem(
        "shield_balance",
        shields
    );

    localStorage.setItem(
        "jetpack_balance",
        jetpacks
    );

    localStorage.setItem(
        "doodle_jump_difficulty",
        difficultyKey
    );

    localStorage.setItem(
        "doodle_jump_high_score_" +
        difficulty.name.toLowerCase().replaceAll(" ", "_"),
        highScore
    );

    updateBestScore();
}


function updateBestScore() {

    const element =
        document.getElementById("bestScore");

    if (element) {

        element.textContent =
            "BEST: " +
            String(highScore).padStart(5, "0");
    }
}


/* =========================================================
   CANVAS
   ========================================================= */

let width = 0;
let height = 0;

function resizeCanvas() {

    width =
        window.innerWidth;

    height =
        window.innerHeight;

    const dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        width * dpr;

    canvas.height =
        height * dpr;

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );
}


/* =========================================================
   GAME STATE
   ========================================================= */

let gameState =
    "READY";

let score = 0;

let worldHeight = 0;

let starBonus = 0;

let lastTime = 0;

let animationFrame = 0;

let shopOpen = false;

let continuePrompt = false;

let developerMode = false;

let jetpackMode = false;

let notice = "";

let noticeTimer = 0;

let leftPressed = false;

let rightPressed = false;


/* =========================================================
   PLAYER
   ========================================================= */

const player = {

    x: 0,

    y: 0,

    width: 62,

    height: 62,

    velocityX: 0,

    velocityY: 0,

    invincible: 0,

    shieldActive: false,

    shieldTimer: 0,

    magnetActive: false,

    magnetTimer: 0,

    rocketTimer: 0,

    animationFrame: 0,

    animationTimer: 0,

    landingTimer: 0
};


/* =========================================================
   WORLD OBJECTS
   ========================================================= */

let platforms = [];

let items = [];

let enemies = [];

let decorations = [];


function random() {

    return Math.random();
}


function clamp(value, min, max) {

    return Math.max(
        min,
        Math.min(max, value)
    );
}


/* =========================================================
   NEW GAME
   ========================================================= */

function startNewGame() {

    score = 0;

    worldHeight = 0;

    starBonus = 0;

    platforms = [];

    items = [];

    enemies = [];

    decorations = [];

    player.x =
        width / 2 -
        player.width / 2;

    player.y =
        height * 0.68;

    player.velocityX = 0;

    player.velocityY =
        difficulty.jumpVelocity;

    player.invincible = 0;

    player.shieldActive = false;

    player.shieldTimer = 0;

    player.magnetActive = false;

    player.magnetTimer = 0;

    player.rocketTimer = 0;

    player.landingTimer = 0;


    /* DECORATION */

    for (let i = 0; i < 15; i++) {

        decorations.push({

            x: random() * width,

            y: random() * height,

            size: 20 + random() * 25,

            image:
                [
                    decoration.blueStar,
                    decoration.pinkStar,
                    decoration.purpleStar
                ][
                    Math.floor(random() * 3)
                ]
        });
    }


    /* START PLATFORM */

    platforms.push({

        x:
            width / 2 - 90,

        y:
            height * 0.86,

        width: 180,

        height: 28,

        image:
            platformsImages.grass_01,

        moving: false,

        speed: 0,

        active: true,

        type: "grass_01"
    });


    /* GENERATE INITIAL WORLD */

    for (let i = 0; i < 12; i++) {

        generatePlatform(
            platforms[platforms.length - 1]
        );
    }


    gameState = "READY";
}


/* =========================================================
   PLATFORM GENERATION
   ========================================================= */

function generatePlatform(previous) {

    const difficultyProgress =
        clamp(
            worldHeight / 5000,
            0,
            1
        );


    const gap =
        difficulty.minGap +
        random() *
        (
            difficulty.maxGap -
            difficulty.minGap
        );


    const platformWidth =
        difficulty.minPlatformWidth +
        random() *
        (
            difficulty.maxPlatformWidth -
            difficulty.minPlatformWidth
        );


    const jumpHeight =
        (
            Math.abs(
                difficulty.jumpVelocity
            ) ** 2
        ) /
        (
            2 *
            difficulty.gravity
        );


    const maxHorizontalReach =
        difficulty.moveSpeed *
        (
            Math.sqrt(
                Math.max(
                    0,
                    jumpHeight
                )
            )
        ) /
        3;


    const center =
        previous.x +
        previous.width / 2;


    const minX =
        clamp(
            center -
            maxHorizontalReach -
            platformWidth,
            0,
            width - platformWidth
        );


    const maxX =
        clamp(
            center +
            maxHorizontalReach,
            0,
            width - platformWidth
        );


    const x =
        minX <= maxX
            ? minX +
              random() *
              (
                  maxX - minX
              )
            : (width - platformWidth) / 2;


    let typeIndex;


    if (worldHeight < 1000) {

        typeIndex =
            Math.floor(
                random() * 4
            );

    } else if (worldHeight < 2000) {

        typeIndex =
            4 +
            Math.floor(
                random() * 4
            );

    } else if (worldHeight < 3000) {

        typeIndex =
            8 +
            Math.floor(
                random() * 4
            );

    } else if (worldHeight < 4000) {

        typeIndex =
            12 +
            Math.floor(
                random() * 6
            );

    } else {

        typeIndex =
            Math.floor(
                random() *
                platformNames.length
            );
    }


    typeIndex =
        clamp(
            typeIndex,
            0,
            platformNames.length - 1
        );


    const type =
        platformNames[typeIndex];


    const moving =
        random() <
        (
            difficulty.movingChance +
            difficultyProgress * 0.15
        );


    const platform = {

        x,

        y:
            previous.y - gap,

        width:
            platformWidth,

        height: 26,

        image:
            platformsImages[type],

        moving,

        speed:
            moving
                ? (
                    70 +
                    random() * 110
                ) *
                difficulty.scrollSpeed *
                (
                    random() < 0.5
                        ? -1
                        : 1
                )
                : 0,

        active: true,

        type
    };


    platforms.push(platform);


    /* POWERUPS / COLLECTIBLES */

    const roll =
        random();


    if (!moving) {

        if (roll < 0.07) {

            items.push({

                x:
                    platform.x +
                    platform.width / 2 -
                    16,

                y:
                    platform.y - 32,

                width: 32,

                height: 32,

                type: "SPRING",

                images:
                    [powerups.spring],

                frame: 0,

                active: true
            });

        } else if (roll < 0.11) {

            items.push({

                x:
                    platform.x +
                    platform.width / 2 -
                    18,

                y:
                    platform.y - 38,

                width: 36,

                height: 40,

                type: "ROCKET",

                images:
                    [powerups.rocket],

                frame: 0,

                active: true
            });

        } else if (roll < 0.15) {

            items.push({

                x:
                    platform.x +
                    platform.width / 2 -
                    17,

                y:
                    platform.y - 32,

                width: 34,

                height: 34,

                type: "SHIELD",

                images:
                    [powerups.shield],

                frame: 0,

                active: true
            });

        } else if (roll < 0.19) {

            items.push({

                x:
                    platform.x +
                    platform.width / 2 -
                    17,

                y:
                    platform.y - 32,

                width: 34,

                height: 34,

                type: "MAGNET",

                images:
                    [powerups.magnet],

                frame: 0,

                active: true
            });

        } else if (roll < 0.48) {

            generateCollectible(
                platform
            );
        }
    }


    /* ENEMY */

    if (
        worldHeight > 1000 &&
        random() <
        0.08 +
        difficultyProgress * 0.12
    ) {

        generateEnemy(
            platform
        );
    }
}


/* =========================================================
   COLLECTIBLES
   ========================================================= */

function generateCollectible(platform) {

    const roll =
        random();

    let type;
    let images;


    if (roll < 0.5) {

        type = "COIN";

        images = coins;

    } else if (roll < 0.65) {

        type = "GEM";

        images =
            [collectibles.gem];

    } else if (roll < 0.80) {

        type = "HEART";

        images =
            [collectibles.heart];

    } else if (roll < 0.90) {

        type = "STAR";

        images =
            [collectibles.star];

    } else if (roll < 0.96) {

        type = "STAR_2";

        images =
            [collectibles.star2];

    } else {

        type = "SPECIAL_STAR";

        images =
            [collectibles.specialStar];
    }


    items.push({

        x:
            platform.x +
            platform.width / 2 -
            16,

        y:
            platform.y - 36,

        width: 32,

        height: 32,

        type,

        images,

        frame: 0,

        active: true,

        animationTimer: 0
    });
}


/* =========================================================
   ENEMIES
   ========================================================= */

function generateEnemy(platform) {

    const types = [

        "ALIEN",
        "BAT",
        "PURPLE_BAT",
        "BEE",
        "MONSTER",
        "SPIKE",
        "UFO"
    ];


    const type =
        types[
            Math.floor(
                random() *
                types.length
            )
        ];


    const imageMap = {

        ALIEN:
            enemiesImages.alien,

        BAT:
            enemiesImages.bat,

        PURPLE_BAT:
            enemiesImages.purpleBat,

        BEE:
            enemiesImages.bee,

        MONSTER:
            enemiesImages.monster,

        SPIKE:
            enemiesImages.spike,

        UFO:
            enemiesImages.ufo
    };


    enemies.push({

        x:
            clamp(
                platform.x +
                platform.width / 2 -
                30,
                10,
                width - 70
            ),

        y:
            platform.y - 150,

        width: 60,

        height: 60,

        type,

        image:
            imageMap[type],

        baseX:
            platform.x +
            platform.width / 2 -
            30,

        time: 0,

        defeated: false,

        explosionTime: 0
    });
}


/* =========================================================
   COLLISION
   ========================================================= */

function intersects(a, b) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y
    );
}


/* =========================================================
   UPDATE
   ========================================================= */

function update(delta) {

    if (
        gameState !== "PLAYING" ||
        shopOpen ||
        continuePrompt
    ) {

        return;
    }


    delta =
        Math.min(
            delta,
            0.033
        );


    /* ANIMATION */

    player.animationTimer += delta;


    if (
        player.animationTimer >
        0.15
    ) {

        player.animationFrame =
            (
                player.animationFrame +
                1
            ) % 2;

        player.animationTimer = 0;
    }


    /* MOVEMENT */

    if (leftPressed) {

        player.velocityX -=
            difficulty.moveSpeed *
            5 *
            delta;
    }


    if (rightPressed) {

        player.velocityX +=
            difficulty.moveSpeed *
            5 *
            delta;
    }


    if (
        !leftPressed &&
        !rightPressed
    ) {

        player.velocityX *= 0.85;
    }


    player.velocityX =
        clamp(
            player.velocityX,
            -difficulty.moveSpeed,
            difficulty.moveSpeed
        );


    player.x +=
        player.velocityX *
        delta;


    /* SCREEN WRAP / BOUNDARY */

    if (player.x < 0) {

        player.x = 0;

        player.velocityX = 0;
    }


    if (
        player.x +
        player.width >
        width
    ) {

        player.x =
            width -
            player.width;

        player.velocityX = 0;
    }


    /* VERTICAL PHYSICS */

    if (jetpackMode) {

        player.velocityY =
            -1300;

    } else if (
        player.rocketTimer > 0
    ) {

        player.rocketTimer -= delta;

        player.velocityY =
            -1500;

    } else {

        player.velocityY +=
            difficulty.gravity *
            delta;
    }


    const oldBottom =
        player.y +
        player.height;


    player.y +=
        player.velocityY *
        delta;


    /* TIMERS */

    player.invincible =
        Math.max(
            0,
            player.invincible - delta
        );

    player.shieldTimer =
        Math.max(
            0,
            player.shieldTimer - delta
        );

    player.magnetTimer =
        Math.max(
            0,
            player.magnetTimer - delta
        );

    player.landingTimer =
        Math.max(
            0,
            player.landingTimer - delta
        );


    if (
        player.shieldTimer <= 0
    ) {

        player.shieldActive = false;
    }


    if (
        player.magnetTimer <= 0
    ) {

        player.magnetActive = false;
    }


    /* MOVING PLATFORMS */

    platforms.forEach(platform => {

        if (
            !platform.active ||
            !platform.moving
        ) {

            return;
        }


        platform.x +=
            platform.speed *
            delta;


        if (
            platform.x < 0 ||
            platform.x +
            platform.width >
            width
        ) {

            platform.speed *= -1;
        }


        platform.x =
            clamp(
                platform.x,
                0,
                width -
                platform.width
            );
    });


    /* ITEMS */

    items.forEach(item => {

        if (!item.active) {
            return;
        }


        item.animationTimer =
            (item.animationTimer || 0) +
            delta;


        if (
            item.animationTimer >
            0.12
        ) {

            item.frame =
                (
                    item.frame + 1
                ) %
                item.images.length;

            item.animationTimer = 0;
        }


        /* MAGNET */

        if (
            player.magnetActive
        ) {

            const dx =
                player.x +
                player.width / 2 -
                (
                    item.x +
                    item.width / 2
                );

            const dy =
                player.y +
                player.height / 2 -
                (
                    item.y +
                    item.height / 2
                );


            if (
                Math.abs(dx) < 300 &&
                Math.abs(dy) < 300
            ) {

                item.x +=
                    dx * 0.10;

                item.y +=
                    dy * 0.10;
            }
        }
    });


    /* ENEMIES */

    enemies.forEach(enemy => {

        if (enemy.defeated) {

            enemy.explosionTime +=
                delta;

            return;
        }


        enemy.time += delta;


        if (
            enemy.type === "BAT" ||
            enemy.type === "PURPLE_BAT"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time * 3
                ) *
                120;
        }


        if (
            enemy.type === "BEE"
        ) {

            enemy.x =
                enemy.baseX +
                Math.sin(
                    enemy.time * 2.5
                ) *
                90;
        }

    });


    handleCollisions(
        oldBottom
    );


    updateCamera();

    generateMoreWorld();

    removeOldObjects();


    if (
        player.y >
        height + 150
    ) {

        playerDeath();
    }


    noticeTimer =
        Math.max(
            0,
            noticeTimer - delta
        );

    if (
        noticeTimer === 0
    ) {

        notice = "";
    }
}


/* =========================================================
   COLLISIONS
   ========================================================= */

function handleCollisions(oldBottom) {

    const playerBox = {

        x:
            player.x +
            player.width * 0.15,

        y:
            player.y +
            player.height * 0.10,

        width:
            player.width * 0.70,

        height:
            player.height * 0.85
    };


    /* ITEMS */

    items.forEach(item => {

        if (
            !item.active
        ) {

            return;
        }


        if (
            intersects(
                playerBox,
                item
            )
        ) {

            item.active = false;

            collectItem(
                item.type
            );
        }
    });


    /* PLATFORM LANDING */

    if (
        player.velocityY > 0 &&
        !jetpackMode &&
        player.rocketTimer <= 0
    ) {

        platforms.forEach(platform => {

            if (
                !platform.active
            ) {

                return;
            }


            const currentBottom =
                player.y +
                player.height;


            if (

                playerBox.x <
                platform.x +
                platform.width &&

                playerBox.x +
                playerBox.width >
                platform.x &&

                oldBottom <=
                platform.y &&

                currentBottom >=
                platform.y

            ) {

                player.y =
                    platform.y -
                    player.height;

                bounce();


                if (
                    platform.type ===
                    "cloud_01" ||
                    platform.type ===
                    "cloud_02"
                ) {

                    platform.active = false;
                }
            }
        });
    }


    /* ENEMIES */

    if (
        player.invincible <= 0
    ) {

        enemies.forEach(enemy => {

            if (
                enemy.defeated
            ) {

                return;
            }


            if (
                intersects(
                    playerBox,
                    enemy
                )
            ) {

                /* STOMP */

                if (
                    player.velocityY > 0 &&
                    playerBox.y +
                    playerBox.height <
                    enemy.y +
                    enemy.height * 0.55
                ) {

                    defeatEnemy(enemy);

                    bounce();

                    return;
                }


                /* SHIELD */

                if (
                    player.shieldActive
                ) {

                    player.shieldActive =
                        false;

                    player.shieldTimer =
                        0;

                    defeatEnemy(enemy);

                    return;
                }


                /* STORED SHIELD */

                if (
                    shields > 0
                ) {

                    shields--;

                    saveInventory();

                    activateShield(10);

                    defeatEnemy(enemy);

                    showNotice(
                        "SHIELD DEPLOYED!",
                        true
                    );

                    return;
                }


                playerDeath();
            }
        });
    }
}


/* =========================================================
   ITEM COLLECTION
   ========================================================= */

function collectItem(type) {

    switch (type) {

        case "COIN":

            coins++;

            saveInventory();

            showNotice(
                "+1 COIN"
            );

            break;


        case "GEM":

            gems++;

            saveInventory();

            showNotice(
                "+1 GEM",
                true
            );

            break;


        case "HEART":

            hearts++;

            saveInventory();

            showNotice(
                "+1 HEART",
                true
            );

            break;


        case "STAR":

            starBonus +=
                100;

            showNotice(
                "+100"
            );

            break;


        case "STAR_2":

            starBonus +=
                250;

            showNotice(
                "+250"
            );

            break;


        case "SPECIAL_STAR":

            starBonus +=
                500;

            showNotice(
                "+500"
            );

            break;


        case "SPRING":

            player.velocityY =
                difficulty.jumpVelocity *
                1.5;

            player.landingTimer =
                0.18;

            break;


        case "ROCKET":

            if (jetpackMode) {

                activateRocket(3);

            } else {

                jetpacks++;

                saveInventory();

                showNotice(
                    "JETPACK STORED",
                    true
                );
            }

            break;


        case "SHIELD":

            if (jetpackMode) {

                activateShield(10);

            } else {

                shields++;

                saveInventory();

                showNotice(
                    "SHIELD STORED",
                    true
                );
            }

            break;


        case "MAGNET":

            player.magnetActive =
                true;

            player.magnetTimer =
                10;

            showNotice(
                "MAGNET ACTIVE",
                true
            );

            break;
    }
}


/* =========================================================
   BOUNCE
   ========================================================= */

function bounce() {

    player.velocityY =
        difficulty.jumpVelocity;

    player.landingTimer =
        0.12;
}


function activateRocket(seconds) {

    player.rocketTimer =
        seconds;

    player.velocityY =
        -1500;
}


function activateShield(seconds) {

    player.shieldActive =
        true;

    player.shieldTimer =
        seconds;
}


function defeatEnemy(enemy) {

    enemy.defeated =
        true;

    enemy.explosionTime =
        0;
}


/* =========================================================
   DEATH
   ========================================================= */

function playerDeath() {

    if (
        gameState !== "PLAYING"
    ) {

        return;
    }


    if (
        player.invincible > 0
    ) {

        findSafePlatform();

        return;
    }


    /* HEART REVIVE */

    if (
        hearts > 0
    ) {

        hearts--;

        saveInventory();

        findSafePlatform();

        player.invincible =
            3;

        showNotice(
            "HEART REVIVE",
            true
        );

        return;
    }


    /* GEM CONTINUE */

    if (
        gems > 0
    ) {

        continuePrompt =
            true;

        return;
    }


    gameState =
        "GAME_OVER";


    if (
        score > highScore
    ) {

        highScore =
            score;

        saveInventory();
    }
}


function findSafePlatform() {

    let closest = null;

    let closestDistance =
        Infinity;


    platforms.forEach(platform => {

        if (
            !platform.active
        ) {

            return;
        }


        const distance =
            Math.abs(
                platform.y -
                height * 0.50
            );


        if (
            distance <
            closestDistance
        ) {

            closest =
                platform;

            closestDistance =
                distance;
        }
    });


    if (closest) {

        player.x =
            closest.x +
            (
                closest.width -
                player.width
            ) / 2;

        player.y =
            closest.y -
            player.height;

        player.velocityY =
            -600;
    }
}


/* =========================================================
   CAMERA
   ========================================================= */

function updateCamera() {

    const cameraLine =
        height * 0.38;


    if (
        player.y <
        cameraLine
    ) {

        const movement =
            cameraLine -
            player.y;


        player.y +=
            movement;


        platforms.forEach(
            platform =>
                platform.y +=
                movement
        );


        items.forEach(
            item =>
                item.y +=
                movement
        );


        enemies.forEach(
            enemy =>
                enemy.y +=
                movement
        );


        decorations.forEach(
            object =>
                object.y +=
                movement * 0.2
        );


        worldHeight +=
            movement;


        if (
            worldHeight >
            0
        ) {

            score =
                Math.floor(
                    (
                        worldHeight /
                        10
                    ) *
                    difficulty.scrollSpeed
                ) +
                starBonus;


            if (
                score >
                highScore
            ) {

                highScore =
                    score;

                saveInventory();
            }
        }
    }
}


/* =========================================================
   WORLD GENERATION
   ========================================================= */

function generateMoreWorld() {

    if (
        platforms.length === 0
    ) {

        return;
    }


    let highest =
        platforms[0];


    platforms.forEach(platform => {

        if (
            platform.y <
            highest.y
        ) {

            highest =
                platform;
        }
    });


    while (
        highest.y >
        -height
    ) {

        generatePlatform(
            highest
        );


        highest =
            platforms.reduce(
                (a, b) =>
                    a.y <
                    b.y
                        ? a
                        : b
            );
    }
}


/* =========================================================
   REMOVE OLD
   ========================================================= */

function removeOldObjects() {

    platforms =
        platforms.filter(
            platform =>
                platform.y <
                height + 250
        );


    items =
        items.filter(
            item =>
                item.active &&
                item.y <
                height + 250
        );


    enemies =
        enemies.filter(
            enemy =>
                enemy.y <
                height + 300 &&
                (
                    !enemy.defeated ||
                    enemy.explosionTime <
                    0.35
                )
        );
}


/* =========================================================
   DRAW HELPERS
   ========================================================= */

function drawImage(
    img,
    x,
    y,
    w,
    h
) {

    if (
        img &&
        img.complete &&
        img.naturalWidth > 0
    ) {

        ctx.drawImage(
            img,
            x,
            y,
            w,
            h
        );
    }
}


function drawText(
    value,
    x,
    y,
    size,
    align = "left",
    color = "#fff",
    bold = false
) {

    ctx.font =
        (
            bold
                ? "700 "
                : ""
        ) +
        size +
        "px Arial";

    ctx.textAlign =
        align;

    ctx.fillStyle =
        color;

    ctx.fillText(
        value,
        x,
        y
    );
}


/* =========================================================
   DRAW BACKGROUND
   ========================================================= */

function drawBackground() {

    ctx.fillStyle =
        "#9fd7fa";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawImage(
        environment.mountain,
        0,
        height * 0.52,
        width,
        height * 0.48
    );


    drawImage(
        environment.city,
        0,
        height * 0.62,
        width,
        height * 0.38
    );


    drawImage(
        environment.moon,
        width - 140,
        40,
        110,
        110
    );


    drawImage(
        environment.cloudLarge,
        -80,
        height * 0.16,
        270,
        110
    );


    drawImage(
        environment.cloudMedium,
        width * 0.45,
        height * 0.30,
        220,
        90
    );


    drawImage(
        environment.islandLarge,
        20,
        height * 0.22,
        150,
        100
    );
}


/* =========================================================
   DRAW DECORATION
   ========================================================= */

function drawDecorations() {

    decorations.forEach(
        object => {

            drawImage(
                object.image,
                object.x,
                object.y,
                object.size,
                object.size
            );
        }
    );
}


/* =========================================================
   DRAW PLATFORMS
   ========================================================= */

function drawPlatforms() {

    platforms.forEach(
        platform => {

            if (
                platform.active
            ) {

                drawImage(
                    platform.image,
                    platform.x,
                    platform.y,
                    platform.width,
                    platform.height
                );
            }
        }
    );
}


/* =========================================================
   DRAW ITEMS
   ========================================================= */

function drawItems() {

    items.forEach(item => {

        if (
            item.active
        ) {

            drawImage(
                item.images[
                    item.frame %
                    item.images.length
                ],
                item.x,
                item.y,
                item.width,
                item.height
            );
        }
    });
}


/* =========================================================
   DRAW ENEMIES
   ========================================================= */

function drawEnemies() {

    enemies.forEach(enemy => {

        if (
            enemy.defeated
        ) {

            drawImage(
                effects.explosion,
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );

        } else {

            drawImage(
                enemy.image,
                enemy.x,
                enemy.y,
                enemy.width,
                enemy.height
            );
        }
    });
}


/* =========================================================
   DRAW PLAYER
   ========================================================= */

function drawPlayer() {

    if (
        player.invincible > 0 &&
        Math.floor(
            Date.now() / 100
        ) % 2 === 0
    ) {

        return;
    }


    let img =
        playerImages.idle;


    if (
        jetpackMode ||
        player.rocketTimer > 0
    ) {

        img =
            player.animationFrame
                ? playerImages.boost
                : playerImages.jetpack;

    } else if (
        player.landingTimer > 0
    ) {

        img =
            player.animationFrame
                ? playerImages.idle2
                : playerImages.idle;

    } else if (
        player.velocityY < -100
    ) {

        img =
            player.animationFrame
                ? playerImages.rise2
                : playerImages.rise;

    } else if (
        player.velocityY > 100
    ) {

        img =
            player.animationFrame
                ? playerImages.fall2
                : playerImages.fall;

    } else {

        img =
            player.animationFrame
                ? playerImages.idle2
                : playerImages.idle;
    }


    drawImage(
        img,
        player.x,
        player.y,
        player.width,
        player.height
    );


    /* SHIELD EFFECT */

    if (
        player.shieldActive
    ) {

        ctx.beginPath();

        ctx.arc(
            player.x +
            player.width / 2,

            player.y +
            player.height / 2,

            40,

            0,
            Math.PI * 2
        );

        ctx.strokeStyle =
            "rgba(0,255,255,.8)";

        ctx.lineWidth = 3;

        ctx.stroke();
    }
}


/* =========================================================
   HUD
   ========================================================= */

function drawHUD() {

    drawText(
        "SCORE " + score,
        18,
        38,
        22,
        "left",
        "#fff",
        true
    );


    drawText(
        "HI " + highScore,
        width - 18,
        38,
        22,
        "right",
        "#fff",
        true
    );


    drawText(
        "🪙 " + coins,
        18,
        70,
        18
    );


    drawText(
        "❤️ " + hearts,
        width - 18,
        70,
        18,
        "right"
    );


    /* BACK */

    drawPanel(
        15,
        15,
        70,
        40
    );

    drawText(
        "‹",
        50,
        44,
        30,
        "center"
    );


    /* DEV */

    drawPanel(
        width - 95,
        15,
        80,
        40
    );

    drawText(
        jetpackMode
            ? "JETPACK"
            : developerMode
                ? "DEV"
                : "DEV",
        width - 55,
        41,
        12,
        "center"
    );


    /* PAUSE */

    if (
        gameState ===
        "PLAYING"
    ) {

        drawPanel(
            width - 95,
            62,
            80,
            38
        );

        drawText(
            "PAUSE",
            width - 55,
            87,
            13,
            "center"
        );
    }


    /* INVENTORY */

    const stripWidth =
        Math.min(
            330,
            width - 30
        );

    const stripHeight = 48;

    const stripX =
        (
            width -
            stripWidth
        ) / 2;

    const stripY =
        height - 62;


    drawPanel(
        stripX,
        stripY,
        stripWidth,
        stripHeight
    );


    const spacing =
        stripWidth / 3;


    drawImage(
        powerups.shield,
        stripX + 10,
        stripY + 9,
        29,
        29
    );

    drawText(
        "x" + shields,
        stripX + 43,
        stripY + 31,
        17
    );


    drawImage(
        collectibles.gem,
        stripX + spacing + 5,
        stripY + 9,
        29,
        29
    );

    drawText(
        "x" + gems,
        stripX + spacing + 38,
        stripY + 31,
        17
    );


    drawImage(
        powerups.rocket,
        stripX +
        spacing * 2 +
        5,
        stripY + 9,
        29,
        29
    );

    drawText(
        jetpackMode
            ? "∞"
            : "x" + jetpacks,

        stripX +
        spacing * 2 +
        38,

        stripY + 31,

        17
    );


    if (notice) {

        drawText(
            notice,
            width / 2,
            160,
            Math.min(
                26,
                width / 15
            ),
            "center",
            "#fff",
            true
        );
    }
}


function drawPanel(
    x,
    y,
    w,
    h
) {

    ctx.fillStyle =
        "rgba(20,25,35,.60)";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );

    ctx.strokeStyle =
        "rgba(255,255,255,.65)";

    ctx.lineWidth = 1.5;

    ctx.strokeRect(
        x,
        y,
        w,
        h
    );
}


/* =========================================================
   READY SCREEN
   ========================================================= */

function drawReady() {

    drawText(
        "DOODLE JUMP",
        width / 2,
        height * 0.27,
        Math.min(
            44,
            width / 10
        ),
        "center",
        "#fff",
        true
    );


    drawText(
        "SELECT DIFFICULTY",
        width / 2,
        height * 0.34,
        18,
        "center",
        "#fff"
    );


    /* SHOP */

    drawPanel(
        20,
        105,
        95,
        42
    );

    drawText(
        "SHOP",
        67,
        132,
        16,
        "center",
        "#fff",
        true
    );


    const buttonWidth =
        Math.min(
            width * 0.70,
            420
        );

    const buttonHeight = 50;

    const gap = 12;

    const startX =
        (
            width -
            buttonWidth
        ) / 2;

    const startY =
        height * 0.44;


    const modes = [

        DIFFICULTIES.EASY,

        DIFFICULTIES.NORMAL,

        DIFFICULTIES.HARD,

        DIFFICULTIES.ULTRA_HARD
    ];


    modes.forEach(
        (mode, index) => {

            const y =
                startY +
                index *
                (
                    buttonHeight +
                    gap
                );


            const selected =
                mode === difficulty;


            ctx.fillStyle =
                selected
                    ? "#4caf50"
                    : "rgba(20,25,35,.70)";


            ctx.fillRect(
                startX,
                y,
                buttonWidth,
                buttonHeight
            );


            ctx.strokeStyle =
                "#fff";

            ctx.lineWidth =
                selected
                    ? 3
                    : 1;


            ctx.strokeRect(
                startX,
                y,
                buttonWidth,
                buttonHeight
            );


            drawText(
                mode.name,
                width / 2,
                y + 32,
                21,
                "center",
                "#fff",
                selected
            );
        }
    );
}


/* =========================================================
   PAUSE
   ========================================================= */

function drawPause() {

    ctx.fillStyle =
        "rgba(0,0,0,.62)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawText(
        "GAME PAUSED",
        width / 2,
        height * 0.32,
        40,
        "center",
        "#fff",
        true
    );


    const buttonWidth =
        Math.min(
            width * 0.60,
            360
        );

    const x =
        (
            width -
            buttonWidth
        ) / 2;


    drawButton(
        "RESUME",
        x,
        height * 0.43,
        buttonWidth,
        58
    );


    drawButton(
        "RESTART",
        x,
        height * 0.56,
        buttonWidth,
        58
    );


    drawButton(
        "BACK TO GAME CENTER",
        x,
        height * 0.69,
        buttonWidth,
        58
    );
}


/* =========================================================
   GAME OVER
   ========================================================= */

function drawGameOver() {

    ctx.fillStyle =
        "rgba(0,0,0,.55)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawText(
        "GAME OVER",
        width / 2,
        height * 0.30,
        42,
        "center",
        "#fff",
        true
    );


    drawText(
        "SCORE: " + score,
        width / 2,
        height * 0.42,
        26,
        "center"
    );


    drawText(
        "BEST: " + highScore,
        width / 2,
        height * 0.48,
        24,
        "center"
    );


    drawText(
        difficulty.name,
        width / 2,
        height * 0.54,
        20,
        "center",
        "#facc15"
    );


    drawButton(
        "RESTART",
        width * 0.25,
        height * 0.64,
        width * 0.50,
        60
    );
}


/* =========================================================
   CONTINUE
   ========================================================= */

function drawContinue() {

    ctx.fillStyle =
        "rgba(0,0,0,.75)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    drawText(
        "CONTINUE?",
        width / 2,
        height * 0.38,
        40,
        "center",
        "#fff",
        true
    );


    drawText(
        "COST: 1 GEM",
        width / 2,
        height * 0.46,
        22,
        "center",
        "#facc15"
    );


    drawText(
        "GEMS: " + gems,
        width / 2,
        height * 0.51,
        18,
        "center"
    );


    drawButton(
        "YES",
        width * 0.25,
        height * 0.61,
        width * 0.50,
        60
    );


    drawText(
        "Tap elsewhere to exit",
        width / 2,
        height * 0.80,
        16,
        "center",
        "#ddd"
    );
}


function drawButton(
    label,
    x,
    y,
    w,
    h
) {

    ctx.fillStyle =
        "#4caf50";

    ctx.fillRect(
        x,
        y,
        w,
        h
    );


    drawText(
        label,
        x + w / 2,
        y + h / 2 + 9,
        19,
        "center",
        "#fff",
        true
    );
}


/* =========================================================
   SHOP
   ========================================================= */

function drawShop() {

    ctx.fillStyle =
        "rgba(0,0,0,.80)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const panelWidth =
        Math.min(
            width * 0.90,
            650
        );

    const panelHeight =
        Math.min(
            height * 0.80,
            620
        );


    const x =
        (
            width -
            panelWidth
        ) / 2;

    const y =
        (
            height -
            panelHeight
        ) / 2;


    ctx.fillStyle =
        "rgba(15,20,35,.98)";

    ctx.fillRect(
        x,
        y,
        panelWidth,
        panelHeight
    );


    ctx.strokeStyle =
        "rgba(0,255,255,.8)";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x,
        y,
        panelWidth,
        panelHeight
    );


    drawText(
        "SPACE SHOP",
        width / 2,
        y + 48,
        30,
        "center",
        "#fff",
        true
    );


    drawText(
        "COINS: " + coins,
        width / 2,
        y + 82,
        18,
        "center",
        "#facc15"
    );


    const shopItems = [

        {
            name: "GEM",
            price: 100,
            image:
                collectibles.gem
        },

        {
            name: "HEART",
            price: 150,
            image:
                collectibles.heart
        },

        {
            name: "SHIELD",
            price: 200,
            image:
                powerups.shield
        },

        {
            name: "JETPACK",
            price: 250,
            image:
                powerups.rocket
        }
    ];


    const cardHeight =
        Math.min(
            82,
            (
                panelHeight -
                160
            ) / 4
        );


    shopItems.forEach(
        (item, index) => {

            const cardY =
                y +
                105 +
                index *
                (
                    cardHeight +
                    10
                );


            ctx.fillStyle =
                "rgba(30,45,70,.85)";

            ctx.fillRect(
                x + 15,
                cardY,
                panelWidth - 30,
                cardHeight
            );


            drawImage(
                item.image,
                x + 28,
                cardY + 10,
                cardHeight - 20,
                cardHeight - 20
            );


            drawText(
                item.name,
                x + 105,
                cardY + 30,
                17,
                "left",
                "#fff",
                true
            );


            drawText(
                item.price +
                " COINS",
                x + 105,
                cardY + 54,
                13,
                "left",
                "#facc15"
            );


            ctx.fillStyle =
                coins >= item.price
                    ? "#4caf50"
                    : "#555";


            ctx.fillRect(
                x +
                panelWidth -
                105,

                cardY +
                cardHeight / 2 -
                22,

                80,
                44
            );


            drawText(
                "BUY",
                x +
                panelWidth -
                65,

                cardY +
                cardHeight / 2 +
                7,

                15,
                "center"
            );
        }
    );


    drawText(
        "TAP OUTSIDE TO CLOSE",
        width / 2,
        y + panelHeight - 18,
        13,
        "center",
        "#aaa"
    );
}


/* =========================================================
   NOTICE
   ========================================================= */

function showNotice(
    message,
    important = false
) {

    if (
        important ||
        noticeTimer < 0.5
    ) {

        notice =
            message;

        noticeTimer =
            2.3;
    }
}


/* =========================================================
   DRAW
   ========================================================= */

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawBackground();

    drawDecorations();

    drawPlatforms();

    drawItems();

    drawEnemies();

    drawPlayer();


    if (
        gameState ===
        "PLAYING"
    ) {

        drawHUD();

    } else if (
        gameState ===
        "READY"
    ) {

        drawHUD();

        drawReady();

    } else if (
        gameState ===
        "PAUSED"
    ) {

        drawHUD();

        drawPause();

    } else if (
        gameState ===
        "GAME_OVER"
    ) {

        drawHUD();

        drawGameOver();
    }


    if (
        continuePrompt
    ) {

        drawContinue();
    }


    if (
        shopOpen
    ) {

        drawShop();
    }
}


/* =========================================================
   GAME LOOP
   ========================================================= */

function gameLoop(time) {

    const delta =
        (
            time -
            lastTime
        ) / 1000;


    lastTime =
        time;


    update(delta);

    draw();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   ENTER GAME
   ========================================================= */

function enterDoodleJump() {

    gameCenter.classList.add(
        "hidden"
    );

    gameScreen.classList.remove(
        "hidden"
    );


    resizeCanvas();

    startNewGame();


    cancelAnimationFrame(
        animationFrame
    );


    lastTime =
        performance.now();


    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================================
   EXIT GAME
   ========================================================= */

function exitGame() {

    cancelAnimationFrame(
        animationFrame
    );


    gameScreen.classList.add(
        "hidden"
    );

    gameCenter.classList.remove(
        "hidden"
    );


    updateBestScore();
}


/* =========================================================
   DIFFICULTY
   ========================================================= */

function selectDifficulty(
    key
) {

    difficultyKey =
        key;

    difficulty =
        DIFFICULTIES[key];


    highScore =
        numberStorage(
            "doodle_jump_high_score_" +
            difficulty.name
                .toLowerCase()
                .replaceAll(" ", "_")
        );


    saveInventory();

    startNewGame();
}


/* =========================================================
   TOUCH / POINTER
   ========================================================= */

function handlePointerDown(
    event
) {

    event.preventDefault();


    const x =
        event.clientX;

    const y =
        event.clientY;


    /* SHOP */

    if (shopOpen) {

        handleShopTouch(
            x,
            y
        );

        return;
    }


    /* CONTINUE */

    if (continuePrompt) {

        if (
            x >= width * 0.25 &&
            x <= width * 0.75 &&
            y >= height * 0.61 &&
            y <= height * 0.71
        ) {

            if (gems > 0) {

                gems--;

                saveInventory();

                continuePrompt =
                    false;

                findSafePlatform();

                player.invincible =
                    3;
            }

        } else {

            continuePrompt =
                false;

            gameState =
                "GAME_OVER";
        }

        return;
    }


    /* DEV */

    if (
        x >
        width - 110 &&
        y < 55
    ) {

        if (
            developerMode
        ) {

            openDeveloperMenu();

        } else {

            openDeveloperDialog();
        }

        return;
    }


    /* BACK */

    if (
        x < 95 &&
        y < 60
    ) {

        if (
            gameState ===
            "PLAYING"
        ) {

            gameState =
                "PAUSED";

        } else {

            exitGame();
        }

        return;
    }


    /* PAUSE */

    if (
        gameState ===
        "PLAYING" &&
        x >
        width - 110 &&
        y >= 60 &&
        y <= 110
    ) {

        gameState =
            "PAUSED";

        leftPressed =
            false;

        rightPressed =
            false;

        return;
    }


    /* PAUSE MENU */

    if (
        gameState ===
        "PAUSED"
    ) {

        const buttonWidth =
            Math.min(
                width * 0.60,
                360
            );

        const bx =
            (
                width -
                buttonWidth
            ) / 2;


        if (
            x >= bx &&
            x <= bx + buttonWidth
        ) {

            if (
                y >= height * 0.43 &&
                y <= height * 0.43 + 58
            ) {

                gameState =
                    "PLAYING";

                lastTime =
                    performance.now();

                return;
            }


            if (
                y >= height * 0.56 &&
                y <= height * 0.56 + 58
            ) {

                startNewGame();

                gameState =
                    "PLAYING";

                return;
            }


            if (
                y >= height * 0.69 &&
                y <= height * 0.69 + 58
            ) {

                exitGame();

                return;
            }
        }


        return;
    }


    /* GAME OVER */

    if (
        gameState ===
        "GAME_OVER"
    ) {

        if (
            x >= width * 0.25 &&
            x <= width * 0.75 &&
            y >= height * 0.64 &&
            y <= height * 0.74
        ) {

            startNewGame();

            gameState =
                "PLAYING";
        }

        return;
    }


    /* READY */

    if (
        gameState ===
        "READY"
    ) {

        /* SHOP */

        if (
            x >= 20 &&
            x <= 115 &&
            y >= 105 &&
            y <= 150
        ) {

            shopOpen =
                true;

            return;
        }


        /* DIFFICULTIES */

        const buttonWidth =
            Math.min(
                width * 0.70,
                420
            );

        const buttonHeight =
            50;

        const gap =
            12;

        const startX =
            (
                width -
                buttonWidth
            ) / 2;

        const startY =
            height * 0.44;


        const modes = [

            "EASY",
            "NORMAL",
            "HARD",
            "ULTRA_HARD"
        ];


        for (
            let i = 0;
            i < modes.length;
            i++
        ) {

            const buttonY =
                startY +
                i *
                (
                    buttonHeight +
                    gap
                );


            if (

                x >= startX &&
                x <=
                    startX +
                    buttonWidth &&

                y >= buttonY &&
                y <=
                    buttonY +
                    buttonHeight

            ) {

                selectDifficulty(
                    modes[i]
                );

                return;
            }
        }


        /* TAP = START */

        gameState =
            "PLAYING";

        lastTime =
            performance.now();

        return;
    }


    /* PLAY */

    if (
        gameState ===
        "PLAYING"
    ) {

        if (
            x <
            width / 2
        ) {

            leftPressed =
                true;

        } else {

            rightPressed =
                true;
        }
    }
}


/* =========================================================
   POINTER MOVE
   ========================================================= */

function handlePointerMove(
    event
) {

    if (
        gameState !==
        "PLAYING"
    ) {

        return;
    }


    if (
        event.buttons
    ) {

        if (
            event.clientX <
            width / 2
        ) {

            leftPressed =
                true;

            rightPressed =
                false;

        } else {

            rightPressed =
                true;

            leftPressed =
                false;
        }
    }
}


/* =========================================================
   POINTER UP
   ========================================================= */

function handlePointerUp(
    event
) {

    event.preventDefault();

    leftPressed =
        false;

    rightPressed =
        false;
}


/* =========================================================
   SHOP TOUCH
   ========================================================= */

function handleShopTouch(
    x,
    y
) {

    const panelWidth =
        Math.min(
            width * 0.90,
            650
        );

    const panelHeight =
        Math.min(
            height * 0.80,
            620
        );


    const px =
        (
            width -
            panelWidth
        ) / 2;

    const py =
        (
            height -
            panelHeight
        ) / 2;


    if (

        x < px ||
        x > px + panelWidth ||
        y < py ||
        y > py + panelHeight

    ) {

        shopOpen =
            false;

        return;
    }


    const cardHeight =
        Math.min(
            82,
            (
                panelHeight -
                160
            ) / 4
        );


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const cardY =
            py +
            105 +
            i *
            (
                cardHeight +
                10
            );


        const buttonX =
            px +
            panelWidth -
            105;


        if (

            x >= buttonX &&
            x <= buttonX + 80 &&

            y >= cardY &&
            y <= cardY + cardHeight

        ) {

            purchaseItem(i);

            return;
        }
    }
}


/* =========================================================
   SHOP PURCHASE
   ========================================================= */

function purchaseItem(
    index
) {

    const prices = [
        100,
        150,
        200,
        250
    ];


    const price =
        prices[index];


    if (
        coins < price
    ) {

        showNotice(
            "NOT ENOUGH COINS",
            true
        );

        return;
    }


    coins -=
        price;


    if (index === 0) {

        gems++;

    } else if (index === 1) {

        hearts++;

    } else if (index === 2) {

        shields++;

    } else {

        jetpacks++;
    }


    saveInventory();


    showNotice(
        "PURCHASED!",
        true
    );
}


/* =========================================================
   DEVELOPER MODE
   ========================================================= */

function openDeveloperDialog() {

    const dialog =
        document.getElementById(
            "developerDialog"
        );

    dialog.classList.remove(
        "hidden"
    );


    const input =
        document.getElementById(
            "developerPassword"
        );

    input.value = "";

    setTimeout(
        () => input.focus(),
        50
    );
}


function openDeveloperMenu() {

    const menu =
        document.getElementById(
            "developerMenu"
        );

    menu.classList.remove(
        "hidden"
    );


    updateJetpackButton();
}


function updateJetpackButton() {

    document.getElementById(
        "jetpackButton"
    ).textContent =
        "JETPACK MODE: " +
        (
            jetpackMode
                ? "ON"
                : "OFF"
        );
}


/* =========================================================
   DEVELOPER EVENTS
   ========================================================= */

document
    .getElementById(
        "developerCancel"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "developerDialog"
                )
                .classList.add(
                    "hidden"
                );
        }
    );


document
    .getElementById(
        "developerLogin"
    )
    .addEventListener(
        "click",
        () => {

            const password =
                document
                    .getElementById(
                        "developerPassword"
                    )
                    .value;


            document
                .getElementById(
                    "developerDialog"
                )
                .classList.add(
                    "hidden"
                );


            if (
                password ===
                "dev_selvarajan"
            ) {

                developerMode =
                    true;

                openDeveloperMenu();

            } else {

                alert(
                    "Invalid Password"
                );
            }
        }
    );


document
    .getElementById(
        "developerClose"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "developerMenu"
                )
                .classList.add(
                    "hidden"
                );
        }
    );


document
    .getElementById(
        "jetpackButton"
    )
    .addEventListener(
        "click",
        () => {

            jetpackMode =
                !jetpackMode;

            updateJetpackButton();


            if (
                jetpackMode &&
                gameState ===
                "READY"
            ) {

                gameState =
                    "PLAYING";

                lastTime =
                    performance.now();
            }
        }
    );


/* =========================================================
   MAIN BUTTONS
   ========================================================= */

document
    .getElementById(
        "playDoodle"
    )
    .addEventListener(
        "click",
        enterDoodleJump
    );


document
    .getElementById(
        "backButton"
    )
    .addEventListener(
        "click",
        () => {

            /* Game Center root */
            return;
        }
    );


/* =========================================================
   CANVAS INPUT
   ========================================================= */

canvas.addEventListener(
    "pointerdown",
    handlePointerDown,
    {
        passive: false
    }
);


canvas.addEventListener(
    "pointermove",
    handlePointerMove,
    {
        passive: false
    }
);


canvas.addEventListener(
    "pointerup",
    handlePointerUp,
    {
        passive: false
    }
);


canvas.addEventListener(
    "pointercancel",
    handlePointerUp,
    {
        passive: false
    }
);


/* =========================================================
   KEYBOARD
   ========================================================= */

window.addEventListener(
    "keydown",
    event => {

        if (
            event.key ===
            "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            leftPressed =
                true;
        }


        if (
            event.key ===
            "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            rightPressed =
                true;
        }


        if (
            event.key ===
            "Escape"
        ) {

            if (
                gameState ===
                "PLAYING"
            ) {

                gameState =
                    "PAUSED";
            }
        }
    }
);


window.addEventListener(
    "keyup",
    event => {

        if (
            event.key ===
            "ArrowLeft" ||
            event.key.toLowerCase() === "a"
        ) {

            leftPressed =
                false;
        }


        if (
            event.key ===
            "ArrowRight" ||
            event.key.toLowerCase() === "d"
        ) {

            rightPressed =
                false;
        }
    }
);


/* =========================================================
   RESIZE
   ========================================================= */

window.addEventListener(
    "resize",
    resizeCanvas
);


/* =========================================================
   STARTUP
   ========================================================= */

resizeCanvas();

updateBestScore();


setTimeout(
    () => {

        splashScreen.classList.add(
            "hidden"
        );

        gameCenter.classList.remove(
            "hidden"
        );

        updateBestScore();

    },
    1300
);

