(() => {
"use strict";

const $ = id => document.getElementById(id);

const splash = $("splash");
const portal = $("portal");
const gameScreen = $("gameScreen");
const canvas = $("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const W = { w: 0, h: 0, dpr: 1 };

const ASSET = "assets/doodle_jump/";

const imgCache = {};

function img(path) {
    if (!imgCache[path]) {
        const i = new Image();
        i.src = ASSET + path;
        imgCache[path] = i;
    }
    return imgCache[path];
}

/* =========================
   DIFFICULTIES
========================= */

const difficulties = {
    EASY: {
        gravity: 1800,
        jump: -850,
        speed: 430,
        minW: 140,
        maxW: 200,
        minGap: 85,
        maxGap: 130,
        scroll: 0.85,
        moving: 0.05
    },

    NORMAL: {
        gravity: 2100,
        jump: -900,
        speed: 520,
        minW: 110,
        maxW: 180,
        minGap: 95,
        maxGap: 150,
        scroll: 1,
        moving: 0.20
    },

    HARD: {
        gravity: 2300,
        jump: -930,
        speed: 580,
        minW: 95,
        maxW: 150,
        minGap: 110,
        maxGap: 165,
        scroll: 1.20,
        moving: 0.40
    },

    "ULTRA HARD": {
        gravity: 2500,
        jump: -960,
        speed: 630,
        minW: 80,
        maxW: 130,
        minGap: 120,
        maxGap: 180,
        scroll: 1.40,
        moving: 0.60
    }
};

let difficulty = "NORMAL";
let cfg = difficulties.NORMAL;

/* =========================
   GAME STATE
========================= */

let state = "READY";

let score = 0;
let best = Number(
    localStorage.getItem("doodle_best_NORMAL") || 0
);

let coins = Number(
    localStorage.getItem("doodle_coins") || 0
);

let gems = Number(
    localStorage.getItem("doodle_gems") || 0
);

let hearts = Number(
    localStorage.getItem("doodle_hearts") || 0
);

let shields = Number(
    localStorage.getItem("doodle_shields") || 0
);

let jetpacks = Number(
    localStorage.getItem("doodle_jetpacks") || 0
);

let devJetpack = false;

let shopOpen = false;
let devOpen = false;

let left = false;
let right = false;

let last = performance.now();

let worldY = 0;
let maxHeight = 0;
let starBonus = 0;

let platforms = [];
let items = [];
let enemies = [];
let particles = [];

/* =========================
   PLAYER
========================= */

let player = {
    x: 0,
    y: 0,
    w: 58,
    h: 58,
    vx: 0,
    vy: 0,
    inv: 0,
    shield: 0,
    magnet: 0,
    jet: 0
};

/* =========================
   IMAGE PRELOAD
========================= */

const preload = [
    "player/player_idle.png",
    "player/player_idle2.png",
    "player/player_rise.png",
    "player/player_rise2.png",
    "player/player_fall.png",
    "player/player_fall2.png",
    "player/player_boost.png",
    "player/player_jetpack.png",

    "collectibles/coin_01.png",
    "collectibles/coin_02.png",
    "collectibles/coin_03.png",
    "collectibles/coin_04.png",
    "collectibles/gem.png",
    "collectibles/heart.png",
    "collectibles/star.png",
    "collectibles/star_2.png",
    "collectibles/star_special.png",

    "powerups/spring.png",
    "powerups/rocket_powerup.png",
    "powerups/shield.png",
    "powerups/magnet.png",

    "enemies/enemy_alien.png",
    "enemies/enemy_bat.png",
    "enemies/enemy_bat_purple.png",
    "enemies/enemy_bee.png",
    "enemies/enemy_monster.png",
    "enemies/enemy_spike.png",
    "enemies/enemy_ufo.png",

    "environment/moon.png",
    "environment/mountain.png",
    "environment/space_city.png",
    "environment/cloud_large.png",
    "environment/cloud_medium.png"
];

preload.forEach(img);

/* =========================
   SAVE DATA
========================= */

function save() {

    localStorage.setItem(
        "doodle_best_" + difficulty,
        best
    );

    localStorage.setItem(
        "doodle_coins",
        coins
    );

    localStorage.setItem(
        "doodle_gems",
        gems
    );

    localStorage.setItem(
        "doodle_hearts",
        hearts
    );

    localStorage.setItem(
        "doodle_shields",
        shields
    );

    localStorage.setItem(
        "doodle_jetpacks",
        jetpacks
    );
}

/* =========================
   RESIZE
========================= */

function resize() {

    W.dpr = Math.min(2, devicePixelRatio || 1);

    W.w = innerWidth;
    W.h = innerHeight;

    canvas.width =
        Math.floor(W.w * W.dpr);

    canvas.height =
        Math.floor(W.h * W.dpr);

    canvas.style.width =
        W.w + "px";

    canvas.style.height =
        W.h + "px";

    ctx.setTransform(
        W.dpr,
        0,
        0,
        W.dpr,
        0,
        0
    );

    if (player.x === 0) {
        player.x =
            W.w / 2 -
            player.w / 2;
    }
}

addEventListener("resize", resize);

resize();

/* =========================
   SCREEN SWITCHING
========================= */

function show(screen) {

    [
        splash,
        portal,
        gameScreen
    ].forEach(s =>
        s.classList.remove("active")
    );

    screen.classList.add("active");
}

/* =========================
   SPLASH
========================= */

setTimeout(() => {

    show(portal);

    updatePortalBest();

}, 1800);

/* =========================
   PORTAL
========================= */

function updatePortalBest() {

    let highest = 0;

    Object.keys(difficulties)
        .forEach(k => {

            highest = Math.max(
                highest,
                Number(
                    localStorage.getItem(
                        "doodle_best_" + k
                    ) || 0
                )
            );

        });

    $("portalBest").textContent =
        "BEST: " +
        String(highest).padStart(5, "0");
}

$("portalPlay").onclick = () => {

    show(gameScreen);

    reset();

};

$("portalBack").onclick = () => {

    show(splash);

    setTimeout(
        () => show(portal),
        400
    );

};

/* =========================
   HELPERS
========================= */

function rand(a, b) {

    return a +
        Math.random() *
        (b - a);
}

function choice(array) {

    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];
}

/* =========================
   RESET GAME
========================= */

function reset() {

    cfg = difficulties[difficulty];

    state = "READY";

    score = 0;
    maxHeight = 0;
    starBonus = 0;
    worldY = 0;

    platforms = [];
    items = [];
    enemies = [];
    particles = [];

    player = {

        x: W.w / 2 - 29,

        y: W.h - 150,

        w: 58,
        h: 58,

        vx: 0,
        vy: 0,

        inv: 0,
        shield: 0,
        magnet: 0,
        jet: 0
    };

    platforms.push({

        x: W.w * .5 - 100,

        y: W.h - 70,

        w: 200,

        h: 22,

        kind: "grass",

        moving: false,

        dx: 0
    });

    let y = W.h - 180;

    for (let i = 0; i < 18; i++) {

        spawnPlatform(y);

        y -= rand(
            cfg.minGap,
            cfg.maxGap
        );
    }

    updatePortalBest();
}

/* =========================
   PLATFORM GENERATION
========================= */

function spawnPlatform(y) {

    const w = rand(
        cfg.minW,
        cfg.maxW
    );

    const x = rand(
        10,
        Math.max(
            11,
            W.w - w - 10
        )
    );

    platforms.push({

        x,
        y,

        w,
        h: 18,

        kind: choice([
            "grass",
            "wood",
            "stone",
            "ice",
            "metal"
        ]),

        moving:
            Math.random() <
            cfg.moving,

        dx:
            Math.random() < .5
                ? 65
                : -65,

        baseX: x
    });

    if (Math.random() < .42) {

        spawnItem(
            x + w / 2,
            y - 30
        );
    }

    if (Math.random() < .12) {

        spawnEnemy(
            x + w / 2,
            y - 70
        );
    }
}

/* =========================
   ITEMS
========================= */

function spawnItem(x, y) {

    const r = Math.random();

    let type;

    if (r < .55)
        type = "coin";

    else if (r < .64)
        type = "gem";

    else if (r < .70)
        type = "heart";

    else if (r < .77)
        type = "star";

    else if (r < .83)
        type = "star2";

    else if (r < .87)
        type = "special";

    else if (r < .91)
        type = "spring";

    else if (r < .94)
        type = "rocket";

    else if (r < .97)
        type = "shield";

    else
        type = "magnet";

    items.push({

        x: x - 15,
        y,

        w: 30,
        h: 30,

        type,

        spin: 0,

        dead: false
    });
}

/* =========================
   ENEMIES
========================= */

function spawnEnemy(x, y) {

    enemies.push({

        x: x - 24,
        y,

        w: 48,
        h: 48,

        type: choice([
            "alien",
            "bat",
            "bee",
            "monster",
            "spike"
        ]),

        t: Math.random() * 6,

        dead: false
    });
}

/* =========================
   START
========================= */

function startGame() {

    if (state === "READY") {

        state = "PLAYING";

        player.vy = cfg.jump;
    }
}

/* =========================
   UPDATE
========================= */

function update(dt) {

    if (state !== "PLAYING")
        return;

    dt = Math.min(
        dt,
        .033
    );

    player.inv =
        Math.max(
            0,
            player.inv - dt
        );

    player.shield =
        Math.max(
            0,
            player.shield - dt
        );

    player.magnet =
        Math.max(
            0,
            player.magnet - dt
        );

    if (!devJetpack) {

        player.jet =
            Math.max(
                0,
                player.jet - dt
            );
    }

    const accel =
        cfg.speed * 5;

    if (left)
        player.vx -=
            accel * dt;

    if (right)
        player.vx +=
            accel * dt;

    if (!left && !right) {

        player.vx *=
            Math.pow(
                .85,
                dt * 60
            );
    }

    player.vx =
        Math.max(
            -cfg.speed,
            Math.min(
                cfg.speed,
                player.vx
            )
        );

    player.x +=
        player.vx * dt;

    if (player.x < 0)
        player.x = 0;

    if (player.x + player.w > W.w)
        player.x =
            W.w - player.w;

    /* JETPACK */

    if (devJetpack) {

        player.vy = -1300;

    } else if (player.jet > 0) {

        player.vy = -1500;

    } else {

        player.vy +=
            cfg.gravity * dt;
    }

    const oldBottom =
        player.y + player.h;

    player.y +=
        player.vy * dt;

    /* MOVING PLATFORMS */

    platforms.forEach(p => {

        if (!p.moving)
            return;

        p.x +=
            p.dx * dt;

        if (
            p.x < 5 ||
            p.x + p.w >
            W.w - 5
        ) {

            p.dx *= -1;
        }
    });

    /* PLATFORM COLLISION */

    if (player.vy > 0) {

        for (const p of platforms) {

            if (

                oldBottom <=
                p.y + 4 &&

                player.y +
                player.h >=
                p.y &&

                player.x +
                player.w - 8 >
                p.x &&

                player.x + 8 <
                p.x + p.w

            ) {

                player.y =
                    p.y -
                    player.h;

                player.vy =
                    cfg.jump;

                break;
            }
        }
    }

    /* CAMERA */

    if (player.y < W.h * .38) {

        const shift =
            W.h * .38 -
            player.y;

        player.y += shift;

        worldY += shift;

        maxHeight =
            Math.max(
                maxHeight,
                worldY
            );

        platforms.forEach(
            p => p.y += shift
        );

        items.forEach(
            o => o.y += shift
        );

        enemies.forEach(
            e => e.y += shift
        );
    }

    /* REMOVE OLD PLATFORMS */

    while (

        platforms.length &&
        platforms[0].y >
        W.h + 120

    ) {

        platforms.shift();
    }

    /* GENERATE MORE */

    while (
        platforms.length < 20
    ) {

        const top =
            Math.min(
                ...platforms.map(
                    p => p.y
                )
            );

        spawnPlatform(
            top -
            rand(
                cfg.minGap,
                cfg.maxGap
            )
        );
    }

    /* ANIMATION */

    items.forEach(
        o => o.spin += dt * 5
    );

    enemies.forEach(e => {

        e.t += dt;

        if (
            e.type === "bat" ||
            e.type === "bee"
        ) {

            e.x +=
                Math.sin(
                    e.t * 2
                ) *
                35 *
                dt;
        }
    });

    collectItems();

    hitEnemies();

    particles =
        particles.filter(
            p =>
                (p.life -= dt) > 0
        );

    particles.forEach(p => {

        p.x += p.vx * dt;

        p.y += p.vy * dt;

        p.vy +=
            300 * dt;
    });

    if (
        player.y >
        W.h + 80
    ) {

        die();
    }

    score = Math.max(
        0,
        Math.floor(
            maxHeight /
            10 *
            cfg.scroll +
            starBonus
        )
    );

    if (score > best) {

        best = score;

        save();
    }
}

/* =========================
   COLLISION
========================= */

function overlap(a, b) {

    return (

        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );
}

/* =========================
   ITEM COLLECTION
========================= */

function collectItems() {

    for (const o of items) {

        if (o.dead)
            continue;

        const near =
            player.magnet > 0 &&
            Math.hypot(
                o.x - player.x,
                o.y - player.y
            ) < 170;

        if (near) {

            o.x +=
                (
                    player.x +
                    player.w / 2 -
                    o.x
                ) * .12;

            o.y +=
                (
                    player.y +
                    player.h / 2 -
                    o.y
                ) * .12;
        }

        if (overlap(player, o)) {

            o.dead = true;

            if (o.type === "coin")
                coins++;

            if (o.type === "gem")
                gems++;

            if (o.type === "heart")
                hearts++;

            if (o.type === "star")
                starBonus += 100;

            if (o.type === "star2")
                starBonus += 250;

            if (o.type === "special")
                starBonus += 500;

            if (o.type === "spring")
                player.vy =
                    cfg.jump * 1.5;

            if (o.type === "rocket") {

                if (devJetpack)
                    player.jet = 3;
                else
                    jetpacks++;
            }

            if (o.type === "shield") {

                if (devJetpack)
                    player.shield = 10;
                else
                    shields++;
            }

            if (o.type === "magnet")
                player.magnet = 10;

            burst(
                o.x + 15,
                o.y + 15
            );

            save();
        }
    }

    items =
        items.filter(
            o =>
                !o.dead &&
                o.y <
                W.h + 80
        );
}

/* =========================
   ENEMY COLLISION
========================= */

function hitEnemies() {

    for (const e of enemies) {

        if (e.dead)
            continue;

        if (overlap(player, e)) {

            if (player.inv > 0)
                continue;

            if (player.shield > 0) {

                player.shield = 0;

                e.dead = true;

                burst(
                    e.x + 24,
                    e.y + 24
                );

                continue;
            }

            if (shields > 0) {

                shields--;

                player.shield = 10;

                e.dead = true;

                burst(
                    e.x + 24,
                    e.y + 24
                );

                save();

                continue;
            }

            die();

            return;
        }
    }

    enemies =
        enemies.filter(
            e =>
                !e.dead &&
                e.y <
                W.h + 100
        );
}

/* =========================
   DEATH / REVIVE
========================= */

function die() {

    if (player.inv > 0)
        return;

    if (hearts > 0) {

        hearts--;

        player.inv = 3;

        player.y =
            W.h * .55;

        player.vy = -600;

        save();

        return;
    }

    state = "GAME_OVER";

    save();
}

/* =========================
   PARTICLES
========================= */

function burst(x, y) {

    for (let i = 0; i < 12; i++) {

        particles.push({

            x,
            y,

            vx: rand(-100, 100),

            vy: rand(-180, -40),

            life: .55
        });
    }
}

/* =========================
   DRAW IMAGE
========================= */

function drawImage(
    path,
    x,
    y,
    w,
    h,
    alpha = 1
) {

    const im = img(path);

    if (!im.complete)
        return;

    ctx.save();

    ctx.globalAlpha =
        alpha;

    ctx.drawImage(
        im,
        x,
        y,
        w,
        h
    );

    ctx.restore();
}

/* =========================
   BACKGROUND
========================= */

function drawBackground() {

    ctx.fillStyle =
        "#9fd7fa";

    ctx.fillRect(
        0,
        0,
        W.w,
        W.h
    );

    const moon =
        img(
            "environment/moon.png"
        );

    if (moon.complete) {

        ctx.drawImage(
            moon,
            W.w - 125,
            55,
            90,
            90
        );
    }

    ctx.globalAlpha = .22;

    for (
        let i = 0;
        i < 18;
        i++
    ) {

        const x =
            (i * 97) % W.w;

        const y =
            (
                i * 151 +
                worldY * .12
            ) % W.h;

        ctx.fillStyle = "#fff";

        ctx.beginPath();

        ctx.arc(
            x,
            y,
            2 + (i % 3),
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.globalAlpha = 1;

    const mountain =
        img(
            "environment/mountain.png"
        );

    if (mountain.complete) {

        ctx.globalAlpha = .55;

        ctx.drawImage(
            mountain,
            0,
            W.h - 210,
            W.w,
            240
        );

        ctx.globalAlpha = 1;
    }

    const city =
        img(
            "environment/space_city.png"
        );

    if (city.complete) {

        ctx.globalAlpha = .45;

        ctx.drawImage(
            city,
            0,
            W.h - 125,
            W.w,
            150
        );

        ctx.globalAlpha = 1;
    }
}

/* =========================
   PLATFORM DRAW
========================= */

function platformColor(kind) {

    return {

        grass: "#4caf50",
        wood: "#9a6b35",
        stone: "#66717d",
        ice: "#9ee8ff",
        metal: "#8e98a5"

    }[kind] || "#4caf50";
}

/* =========================
   MAIN DRAW
========================= */

function draw() {

    drawBackground();

    /* PLATFORMS */

    for (const p of platforms) {

        ctx.fillStyle =
            platformColor(
                p.kind
            );

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            p.h
        );

        ctx.fillStyle =
            "rgba(255,255,255,.28)";

        ctx.fillRect(
            p.x,
            p.y,
            p.w,
            3
        );
    }

    /* ITEMS */

    for (const o of items) {

        if (o.type === "coin") {

            drawImage(
                "collectibles/coin_0" +
                (
                    1 +
                    Math.floor(
                        o.spin
                    ) % 4
                ) +
                ".png",

                o.x,
                o.y,
                o.w,
                o.h
            );

        } else {

            const map = {

                gem:
                    "collectibles/gem.png",

                heart:
                    "collectibles/heart.png",

                star:
                    "collectibles/star.png",

                star2:
                    "collectibles/star_2.png",

                special:
                    "collectibles/star_special.png",

                spring:
                    "powerups/spring.png",

                rocket:
                    "powerups/rocket_powerup.png",

                shield:
                    "powerups/shield.png",

                magnet:
                    "powerups/magnet.png"
            };

            drawImage(
                map[o.type],
                o.x,
                o.y,
                o.w,
                o.h
            );
        }
    }

    /* ENEMIES */

    for (const e of enemies) {

        const map = {

            alien:
                "enemies/enemy_alien.png",

            bat:
                "enemies/enemy_bat.png",

            bee:
                "enemies/enemy_bee.png",

            monster:
                "enemies/enemy_monster.png",

            spike:
                "enemies/enemy_spike.png"
        };

        drawImage(
            map[e.type],
            e.x,
            e.y,
            e.w,
            e.h
        );
    }

    /* PLAYER */

    let playerImage;

    if (
        devJetpack ||
        player.jet > 0
    ) {

        playerImage =
            "player/player_jetpack.png";

    } else if (player.vy < 0) {

        playerImage =
            "player/player_rise.png";

    } else if (player.vy > 250) {

        playerImage =
            "player/player_fall.png";

    } else {

        playerImage =
            "player/player_idle.png";
    }

    drawImage(
        playerImage,
        player.x,
        player.y,
        player.w,
        player.h,
        player.inv > 0
            ? (
                Math.floor(
                    performance.now() / 100
                ) % 2
                    ? .45
                    : 1
            )
            : 1
    );

    /* PARTICLES */

    for (const p of particles) {

        ctx.fillStyle = "#fff";

        ctx.fillRect(
            p.x,
            p.y,
            4,
            4
        );
    }

    drawHud();

    if (state === "READY")
        drawReady();

    if (state === "PAUSED")
        drawPause();

    if (state === "GAME_OVER")
        drawGameOver();
}
/* =========================
   TEXT
========================= */

function txt(
    text,
    x,
    y,
    size,
    color = "#fff",
    align = "left",
    weight = "800"
) {

    ctx.font =
        `${weight} ${size}px Arial`;

    ctx.fillStyle = color;

    ctx.textAlign = align;

    ctx.fillText(
        text,
        x,
        y
    );
}

/* =========================
   HUD
========================= */

function drawHud() {

    txt(
        "SCORE " +
        String(score).padStart(5, "0"),

        14,
        28,
        14,
        "#111",
        "left",
        "900"
    );

    txt(
        "HI " +
        String(best).padStart(5, "0"),

        14,
        47,
        11,
        "#333",
        "left",
        "700"
    );

    txt(
        "🪙 " + coins,

        14,
        72,
        13,
        "#111",
        "left",
        "800"
    );

    txt(
        "❤️ " + hearts,

        14,
        94,
        13,
        "#111",
        "left",
        "800"
    );

    const inventory = [

        ["🛡️", shields],

        ["💎", gems],

        [
            "🚀",
            devJetpack
                ? "∞"
                : jetpacks
        ]
    ];

    inventory.forEach(
        (value, index) => {

            txt(

                value[0] +
                " " +
                value[1],

                W.w - 14,

                28 +
                index * 22,

                13,

                "#111",

                "right",

                "800"
            );
        }
    );

    if (player.shield > 0) {

        txt(

            "SHIELD " +
            player.shield.toFixed(1),

            W.w / 2,

            28,

            11,

            "#0b6170",

            "center",

            "900"
        );
    }

    if (devJetpack) {

        txt(

            "JETPACK ON • ∞",

            W.w / 2,

            48,

            11,

            "#7a20b5",

            "center",

            "900"
        );
    }

    if (state === "PLAYING") {

        ctx.fillStyle =
            "rgba(0,0,0,.32)";

        ctx.beginPath();

        ctx.roundRect(
            W.w - 82,
            10,
            68,
            34,
            9
        );

        ctx.fill();

        txt(
            "PAUSE",
            W.w - 48,
            32,
            10,
            "#fff",
            "center",
            "900"
        );
    }
}

/* =========================
   READY SCREEN
========================= */

function drawReady() {

    panel();

    txt(
        "DOODLE JUMP",

        W.w / 2,
        W.h * .18,

        30,

        "#facc15",

        "center",

        "900"
    );

    txt(
        "SELECT DIFFICULTY & TAP TO JUMP",

        W.w / 2,
        W.h * .18 + 28,

        11,

        "#fff",

        "center",

        "700"
    );

    const names = [
        "EASY",
        "NORMAL",
        "HARD",
        "ULTRA HARD"
    ];

    const bw =
        Math.min(
            190,
            W.w * .72
        );

    const bh = 42;
    const gap = 10;

    const start =
        W.h * .34;

    names.forEach(
        (name, index) => {

            const y =
                start +
                index *
                (bh + gap);

            ctx.fillStyle =
                name === difficulty
                    ? "#facc15"
                    : "rgba(255,255,255,.12)";

            ctx.strokeStyle =
                name === difficulty
                    ? "#facc15"
                    : "rgba(255,255,255,.28)";

            ctx.lineWidth = 1;

            ctx.beginPath();

            ctx.roundRect(
                W.w / 2 -
                bw / 2,

                y,

                bw,
                bh,

                10
            );

            ctx.fill();
            ctx.stroke();

            txt(
                name,

                W.w / 2,

                y + 27,

                12,

                name === difficulty
                    ? "#050505"
                    : "#fff",

                "center",

                "900"
            );
        }
    );

    const shopY =
        start +
        4 *
        (bh + gap);

    ctx.fillStyle =
        "rgba(0,0,0,.7)";

    ctx.beginPath();

    ctx.roundRect(
        W.w / 2 - 70,
        shopY,
        140,
        40,
        10
    );

    ctx.fill();

    txt(
        "SHOP",

        W.w / 2,
        shopY + 26,

        11,

        "#55eaff",

        "center",

        "900"
    );

    txt(
        "DEV",

        W.w - 18,
        W.h - 18,

        10,

        "#222",

        "right",

        "900"
    );
}

/* =========================
   PAUSE
========================= */

function drawPause() {

    panel();

    txt(
        "GAME PAUSED",

        W.w / 2,
        W.h * .35,

        28,

        "#55eaff",

        "center",

        "900"
    );

    button(
        "RESUME",
        W.h * .46
    );

    button(
        "RESTART",
        W.h * .46 + 54
    );

    button(
        "BACK TO PORTAL",
        W.h * .46 + 108
    );
}

/* =========================
   GAME OVER
========================= */

function drawGameOver() {

    panel();

    txt(
        "GAME OVER",

        W.w / 2,
        W.h * .30,

        30,

        "#facc15",

        "center",

        "900"
    );

    if (score >= best) {

        txt(
            "NEW BEST",

            W.w / 2,
            W.h * .35,

            12,

            "#55eaff",

            "center",

            "900"
        );
    }

    txt(
        "DIFFICULTY: " +
        difficulty,

        W.w / 2,
        W.h * .40,

        12,

        "#fff",

        "center",

        "700"
    );

    txt(
        "SCORE " +
        score +
        " • BEST " +
        best,

        W.w / 2,
        W.h * .45,

        13,

        "#fff",

        "center",

        "800"
    );

    button(
        "RESTART",
        W.h * .55
    );

    button(
        "BACK TO PORTAL",
        W.h * .55 + 54
    );
}
/* =========================
   PANEL
========================= */

function panel() {

    ctx.fillStyle =
        "rgba(0,0,0,.64)";

    ctx.fillRect(
        0,
        0,
        W.w,
        W.h
    );
}

/* =========================
   BUTTON
========================= */

function button(
    label,
    y
) {

    const bw =
        Math.min(
            210,
            W.w * .65
        );

    ctx.fillStyle =
        "#facc15";

    ctx.beginPath();

    ctx.roundRect(
        W.w / 2 -
        bw / 2,

        y,

        bw,
        42,

        10
    );

    ctx.fill();

    txt(
        label,

        W.w / 2,

        y + 27,

        11,

        "#050505",

        "center",

        "900"
    );
}

/* =========================
   HIT TEST
========================= */

function hitButton(
    x,
    y,
    rect
) {

    return (

        x >= rect.x &&
        x <= rect.x + rect.w &&
        y >= rect.y &&
        y <= rect.y + rect.h
    );
}

/* =========================
   TOUCH / POINTER
========================= */

function pointer(x, y) {

    if (shopOpen || devOpen)
        return;

    /* PLAYING */

    if (state === "PLAYING") {

        /* PAUSE */

        if (
            x > W.w - 92 &&
            y < 72
        ) {

            state = "PAUSED";

            left = false;
            right = false;

            return;
        }

        /*
         Large mobile touch zones.
         Left half = move left.
         Right half = move right.
        */

        if (x < W.w / 2)
            left = true;
        else
            right = true;

        return;
    }

    /* READY */

    if (state === "READY") {

        const bw =
            Math.min(
                190,
                W.w * .72
            );

        const bh = 42;
        const gap = 10;

        const start =
            W.h * .34;

        const names = [
            "EASY",
            "NORMAL",
            "HARD",
            "ULTRA HARD"
        ];

        for (
            let i = 0;
            i < 4;
            i++
        ) {

            const rect = {

                x:
                    W.w / 2 -
                    bw / 2,

                y:
                    start +
                    i *
                    (bh + gap),

                w: bw,
                h: bh
            };

            if (
                hitButton(
                    x,
                    y,
                    rect
                )
            ) {

                difficulty =
                    names[i];

                cfg =
                    difficulties[
                        difficulty
                    ];

                best =
                    Number(
                        localStorage.getItem(
                            "doodle_best_" +
                            difficulty
                        ) || 0
                    );

                reset();

                return;
            }
        }

        /* SHOP */

        const shopY =
            start +
            4 *
            (bh + gap);

        if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 - 70,

                    y: shopY,

                    w: 140,
                    h: 40
                }
            )
        ) {

            openShop();

            return;
        }

        /* DEV */

        if (
            x > W.w - 75 &&
            y > W.h - 70
        ) {

            openDev();

            return;
        }

        /* TAP TO START */

        startGame();

        return;
    }

    /* PAUSED */

    if (state === "PAUSED") {

        const y0 =
            W.h * .46;

        const bw =
            Math.min(
                210,
                W.w * .65
            );

        if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 -
                        bw / 2,

                    y: y0,

                    w: bw,
                    h: 42
                }
            )
        ) {

            state = "PLAYING";
        }

        else if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 -
                        bw / 2,

                    y:
                        y0 + 54,

                    w: bw,
                    h: 42
                }
            )
        ) {

            reset();

            startGame();
        }

        else if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 -
                        bw / 2,

                    y:
                        y0 + 108,

                    w: bw,
                    h: 42
                }
            )
        ) {

            show(portal);

            reset();
        }

        return;
    }

    /* GAME OVER */

    if (state === "GAME_OVER") {

        const y0 =
            W.h * .55;

        const bw =
            Math.min(
                210,
                W.w * .65
            );

        if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 -
                        bw / 2,

                    y: y0,

                    w: bw,
                    h: 42
                }
            )
        ) {

            reset();

            startGame();
        }

        else if (
            hitButton(
                x,
                y,
                {
                    x:
                        W.w / 2 -
                        bw / 2,

                    y:
                        y0 + 54,

                    w: bw,
                    h: 42
                }
            )
        ) {

            show(portal);

            reset();
        }
    }
}

/* =========================
   POINTER EVENTS
========================= */

canvas.addEventListener(
    "pointerdown",
    e => {

        e.preventDefault();

        pointer(
            e.clientX,
            e.clientY
        );
    }
);

canvas.addEventListener(
    "pointerup",
    e => {

        left = false;
        right = false;
    }
);

canvas.addEventListener(
    "pointercancel",
    e => {

        left = false;
        right = false;
    }
);

/* =========================
   KEYBOARD
========================= */

addEventListener(
    "keydown",
    e => {

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        )
            left = true;

        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        )
            right = true;

        if (
            e.key === " " ||
            e.key === "Enter"
        )
            startGame();

        if (
            e.key === "Escape" &&
            state === "PLAYING"
        )
            state = "PAUSED";
    }
);

addEventListener(
    "keyup",
    e => {

        if (
            e.key === "ArrowLeft" ||
            e.key === "a"
        )
            left = false;

        if (
            e.key === "ArrowRight" ||
            e.key === "d"
        )
            right = false;
    }
);

/* =========================
   SHOP
========================= */

function openShop() {

    shopOpen = true;

    $("shop")
        .classList
        .remove("hidden");

    $("shopCoins")
        .textContent = coins;
}

function closeShop() {

    shopOpen = false;

    $("shop")
        .classList
        .add("hidden");
}

$("shopClose").onclick =
    closeShop;

document
    .querySelectorAll(".shop-item")
    .forEach(button => {

        button.onclick = () => {

            const type =
                button.dataset.buy;

            const cost = {

                gem: 100,
                heart: 150,
                shield: 200,
                jetpack: 250

            }[type];

            if (coins < cost)
                return;

            coins -= cost;

            if (type === "gem")
                gems++;

            if (type === "heart")
                hearts++;

            if (type === "shield")
                shields++;

            if (type === "jetpack")
                jetpacks++;

            save();

            $("shopCoins")
                .textContent =
                coins;
        };
    });

/* =========================
   DEVELOPER MODE
========================= */

function openDev() {

    const password =
        prompt(
            "DEVELOPER PASSWORD"
        );

    if (
        password !==
        "dev_selvarajan"
    ) {

        if (password !== null)
            alert(
                "Incorrect password"
            );

        return;
    }

    devOpen = true;

    $("devModal")
        .classList
        .remove("hidden");
}

$("devClose").onclick = () => {

    devOpen = false;

    $("devModal")
        .classList
        .add("hidden");
};

$("jetpackToggle").onclick =
    () => {

        devJetpack =
            !devJetpack;

        $("jetpackToggle")
            .textContent =
            "JETPACK MODE: " +
            (
                devJetpack
                    ? "ON"
                    : "OFF"
            );
    };

/* =========================
   BLOCK CONTEXT MENU
========================= */

addEventListener(
    "contextmenu",
    e => e.preventDefault()
);

/* =========================
   GAME LOOP
========================= */

function loop(now) {

    const dt =
        (now - last) / 1000;

    last = now;

    update(dt);

    draw();

    requestAnimationFrame(
        loop
    );
}

reset();

requestAnimationFrame(
    loop
);

})();
