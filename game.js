(() => {
'use strict';
const $=id=>document.getElementById(id);
const splash=$('splash'),portal=$('portal'),gameScreen=$('gameScreen'),canvas=$('gameCanvas'),ctx=canvas.getContext('2d');
const W={w:0,h:0,dpr:1};
const ASSET='assets/doodle_jump/'; const cache={};
function img(p){if(!cache[p]){const i=new Image();i.src=ASSET+p;cache[p]=i}return cache[p]}
const ASSET_GROUPS={
player:['player_idle.png','player_idle2.png','player_rise.png','player_rise2.png','player_fall.png','player_fall2.png','player_boost.png','player_jetpack.png'],
collectibles:['coin_01.png','coin_02.png','coin_03.png','coin_04.png','gem.png','heart.png','star.png','star_2.png','star_special.png'],
powerups:['spring.png','rocket_powerup.png','shield.png','magnet.png'],
enemies:['enemy_alien.png','enemy_bat.png','enemy_bat_purple.png','enemy_bee.png','enemy_monster.png','enemy_spike.png','enemy_ufo.png'],
environment:['moon.png','mountain.png','space_city.png','cloud_large.png','cloud_medium.png','cloud_small_01.png','cloud_small_02.png','floating_island_large.png','floating_island_small_01.png','floating_island_small_02.png','floating_island_small_03.png'],
effects:['enemy_projectile.png','explosion.png'],
decoration:['blue_star.png','pink_star.png','purple_star.png'],
platforms:['platform_alien_01.png','platform_alien_02.png','platform_cloud_01.png','platform_cloud_02.png','platform_grass_01.png','platform_grass_02.png','platform_grass_03.png','platform_grass_04.png','platform_ice_01.png','platform_ice_02.png','platform_lava_01.png','platform_lava_02.png','platform_metal_01.png','platform_metal_02.png','platform_stone_01.png','platform_stone_02.png','platform_stone_03.png','platform_stone_04.png','platform_wood_01.png','platform_wood_02.png','platform_wood_03.png','platform_wood_04.png']
};
Object.entries(ASSET_GROUPS).forEach(([group,names])=>names.forEach(n=>img(group+'/'+n)));
const platformPools={
 grass:['platforms/platform_grass_01.png','platforms/platform_grass_02.png','platforms/platform_grass_03.png','platforms/platform_grass_04.png'],
 wood:['platforms/platform_wood_01.png','platforms/platform_wood_02.png','platforms/platform_wood_03.png','platforms/platform_wood_04.png'],
 stone:['platforms/platform_stone_01.png','platforms/platform_stone_02.png','platforms/platform_stone_03.png','platforms/platform_stone_04.png'],
 ice:['platforms/platform_ice_01.png','platforms/platform_ice_02.png'],
 metal:['platforms/platform_metal_01.png','platforms/platform_metal_02.png'],
 alien:['platforms/platform_alien_01.png','platforms/platform_alien_02.png'],
 cloud:['platforms/platform_cloud_01.png','platforms/platform_cloud_02.png'],
 lava:['platforms/platform_lava_01.png','platforms/platform_lava_02.png']
};
const enemyPools={alien:['enemies/enemy_alien.png'],bat:['enemies/enemy_bat.png','enemies/enemy_bat_purple.png'],bee:['enemies/enemy_bee.png'],monster:['enemies/enemy_monster.png'],spike:['enemies/enemy_spike.png'],ufo:['enemies/enemy_ufo.png']};
const platformKinds=['grass','wood','stone','ice','metal','alien','cloud','lava'];
const decorationPaths=['decoration/blue_star.png','decoration/pink_star.png','decoration/purple_star.png'];
const environmentPaths=['environment/cloud_large.png','environment/cloud_medium.png','environment/cloud_small_01.png','environment/cloud_small_02.png','environment/floating_island_large.png','environment/floating_island_small_01.png','environment/floating_island_small_02.png','environment/floating_island_small_03.png'];
const difficulties={EASY:{gravity:1800,jump:-850,speed:430,minW:140,maxW:200,minGap:85,maxGap:130,scroll:.85,moving:.05},NORMAL:{gravity:2100,jump:-900,speed:520,minW:110,maxW:180,minGap:95,maxGap:150,scroll:1,moving:.2},HARD:{gravity:2300,jump:-930,speed:580,minW:95,maxW:150,minGap:110,maxGap:165,scroll:1.2,moving:.4},'ULTRA HARD':{gravity:2500,jump:-960,speed:630,minW:80,maxW:130,minGap:120,maxGap:180,scroll:1.4,moving:.6}};
let difficulty='NORMAL',cfg=difficulties.NORMAL,state='READY',score=0,best=0,coins=+localStorage.doodle_coins||0,gems=+localStorage.doodle_gems||0,hearts=+localStorage.doodle_hearts||0,shields=+localStorage.doodle_shields||0,jetpacks=+localStorage.doodle_jetpacks||0,devJetpack=false,worldY=0,maxHeight=0,starBonus=0,left=false,right=false,platforms=[],items=[],enemies=[],particles=[],decorations=[],effects=[],environmentObjects=[],last=performance.now();
let player={x:0,y:0,w:58,h:58,vx:0,vy:0,inv:0,shield:0,magnet:0,jet:0};
function save(){localStorage.doodle_coins=coins;localStorage.doodle_gems=gems;localStorage.doodle_hearts=hearts;localStorage.doodle_shields=shields;localStorage.doodle_jetpacks=jetpacks;localStorage['doodle_best_'+difficulty]=best}
function loadBest(){best=+(localStorage['doodle_best_'+difficulty]||0)}
function resize(){W.dpr=Math.min(2,devicePixelRatio||1);W.w=innerWidth;W.h=innerHeight;canvas.width=W.w*W.dpr;canvas.height=W.h*W.dpr;canvas.style.width=W.w+'px';canvas.style.height=W.h+'px';ctx.setTransform(W.dpr,0,0,W.dpr,0,0)}addEventListener('resize',resize);resize();
function show(s){[splash,portal,gameScreen].forEach(x=>x.classList.add('hidden'));s.classList.remove('hidden')}
function rand(a,b){return a+Math.random()*(b-a)}function choice(a){return a[(Math.random()*a.length)|0]}
function updatePortalBest(){let hi=0;Object.keys(difficulties).forEach(k=>hi=Math.max(hi,+(localStorage['doodle_best_'+k]||0)));$('portalBest').textContent='BEST: '+String(hi).padStart(5,'0')}
setTimeout(()=>{show(portal);updatePortalBest()},1500);
$('portalPlay').onclick=()=>{show(gameScreen);reset()};$('portalBack').onclick=()=>show(splash);$('gameBack').onclick=()=>{show(portal);updatePortalBest()};$('pauseBtn').onclick=()=>{if(state==='PLAYING'){state='PAUSED';left=right=false}};
function reset(){cfg=difficulties[difficulty];loadBest();state='READY';score=0;worldY=0;maxHeight=0;starBonus=0;platforms=[];items=[];enemies=[];particles=[];decorations=[];effects=[];environmentObjects=[];player={x:W.w/2-29,y:W.h-150,w:58,h:58,vx:0,vy:0,inv:0,shield:0,magnet:0,jet:0};platforms.push({x:W.w/2-100,y:W.h-70,w:200,h:22,kind:'grass',asset:choice(platformPools.grass),moving:false,dx:0});let y=W.h-180;for(let i=0;i<20;i++){spawnPlatform(y);y-=rand(cfg.minGap,cfg.maxGap)}syncUI();showReady()}
function spawnPlatform(y){
 const w=rand(cfg.minW,cfg.maxW),x=rand(8,Math.max(9,W.w-w-8));
 const kind=choice(platformKinds), asset=choice(platformPools[kind]);
 platforms.push({x,y,w,h:18,kind,asset,moving:Math.random()<cfg.moving,dx:Math.random()<.5?65:-65,baseX:x});
 if(Math.random()<.42)spawnItem(x+w/2,y-30);
 if(Math.random()<.16)spawnEnemy(x+w/2,y-70);
 if(Math.random()<.45)spawnDecoration(x+w/2,y-rand(70,170));
 if(Math.random()<.18)spawnEnvironment(y-rand(90,220));
}
function spawnItem(x,y){const r=Math.random();let type=r<.55?'coin':r<.64?'gem':r<.70?'heart':r<.77?'star':r<.83?'star2':r<.87?'special':r<.91?'spring':r<.94?'rocket':r<.97?'shield':'magnet';items.push({x:x-15,y,w:30,h:30,type,spin:0,dead:false})}
function spawnEnemy(x,y){const type=choice(['alien','bat','bee','monster','spike','ufo']);enemies.push({x:x-24,y,w:48,h:48,type,asset:choice(enemyPools[type]),t:Math.random()*6,dead:false,shot:Math.random()*2});}
function spawnDecoration(x,y){decorations.push({x:Math.max(5,Math.min(W.w-50,x+rand(-90,90))),y,w:rand(22,42),h:rand(22,42),asset:choice(decorationPaths),spin:rand(0,6),alpha:rand(.45,.9)});}
function spawnEnvironment(y){const path=choice(environmentPaths);const size=path.includes('island')?rand(70,150):rand(55,120);environmentObjects.push({x:rand(-20,Math.max(0,W.w-size+20)),y,w:size,h:size*.55,asset:path,alpha:rand(.25,.6)});}

function startGame(){if(state==='READY'){state='PLAYING';player.vy=cfg.jump}}
function update(dt){if(state!=='PLAYING')return;dt=Math.min(dt,.033);player.inv=Math.max(0,player.inv-dt);player.shield=Math.max(0,player.shield-dt);player.magnet=Math.max(0,player.magnet-dt);if(!devJetpack)player.jet=Math.max(0,player.jet-dt);const accel=cfg.speed*5;if(left)player.vx-=accel*dt;if(right)player.vx+=accel*dt;if(!left&&!right)player.vx*=Math.pow(.85,dt*60);player.vx=Math.max(-cfg.speed,Math.min(cfg.speed,player.vx));player.x=Math.max(0,Math.min(W.w-player.w,player.x+player.vx*dt));if(devJetpack)player.vy=-1300;else if(player.jet>0)player.vy=-1500;else player.vy+=cfg.gravity*dt;const oldBottom=player.y+player.h;player.y+=player.vy*dt;platforms.forEach(p=>{if(!p.moving)return;p.x+=p.dx*dt;if(p.x<5||p.x+p.w>W.w-5)p.dx*=-1});if(player.vy>0){for(const p of platforms){if(oldBottom<=p.y+5&&player.y+player.h>=p.y&&player.x+player.w-8>p.x&&player.x+8<p.x+p.w){player.y=p.y-player.h;player.vy=cfg.jump;break}}}if(player.y<W.h*.38){const shift=W.h*.38-player.y;player.y+=shift;worldY+=shift;maxHeight=Math.max(maxHeight,worldY);[platforms,items,enemies,decorations,effects,environmentObjects].forEach(arr=>arr.forEach(o=>o.y+=shift))}platforms=platforms.filter(p=>p.y<W.h+130);while(platforms.length<22){const top=Math.min(...platforms.map(p=>p.y));spawnPlatform(top-rand(cfg.minGap,cfg.maxGap))}items.forEach(o=>o.spin+=dt*5);enemies.forEach(e=>{e.t+=dt;if(e.type==='bat'||e.type==='bee'||e.type==='ufo')e.x+=Math.sin(e.t*2)*35*dt;if(e.type==='ufo'){e.shot-=dt;if(e.shot<=0){e.shot=2.5;spawnProjectile(e.x+24,e.y+48)}}});collectItems();hitEnemies();particles=particles.filter(p=>(p.life-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt});if(player.y>W.h+80)die();score=Math.max(0,Math.floor(maxHeight/10*cfg.scroll+starBonus));if(score>best){best=score;save()}syncUI()}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function collectItems(){for(const o of items){if(o.dead)continue;if(player.magnet>0&&Math.hypot(o.x-player.x,o.y-player.y)<170){o.x+=(player.x+player.w/2-o.x)*.12;o.y+=(player.y+player.h/2-o.y)*.12}if(overlap(player,o)){o.dead=true;if(o.type==='coin')coins++;if(o.type==='gem')gems++;if(o.type==='heart')hearts++;if(o.type==='star')starBonus+=100;if(o.type==='star2')starBonus+=250;if(o.type==='special')starBonus+=500;if(o.type==='spring')player.vy=cfg.jump*1.5;if(o.type==='rocket'){if(devJetpack)player.jet=3;else jetpacks++}if(o.type==='shield'){if(devJetpack)player.shield=10;else shields++}if(o.type==='magnet')player.magnet=10;burst(o.x+15,o.y+15);save()}}items=items.filter(o=>!o.dead&&o.y<W.h+100)}
function hitEnemies(){for(const e of enemies){if(e.dead||!overlap(player,e)||player.inv>0)continue;if(player.shield>0){player.shield=0;e.dead=true;burst(e.x+24,e.y+24);spawnExplosion(e.x+24,e.y+24);continue}if(shields>0){shields--;player.shield=10;e.dead=true;burst(e.x+24,e.y+24);spawnExplosion(e.x+24,e.y+24);save();continue}die();return}enemies=enemies.filter(e=>!e.dead&&e.y<W.h+120)}
function die(){if(player.inv>0)return;if(hearts>0){hearts--;player.inv=3;player.y=W.h*.55;player.vy=-600;save();return}state='GAME_OVER';save();showGameOver()}
function burst(x,y){for(let i=0;i<12;i++)particles.push({x,y,vx:rand(-100,100),vy:rand(-180,-40),life:.55})}
function spawnExplosion(x,y){effects.push({x:x-30,y:y-30,w:60,h:60,asset:'effects/explosion.png',life:.45,max:.45});}
function spawnProjectile(x,y){effects.push({x:x-12,y:y-12,w:24,h:24,asset:'effects/enemy_projectile.png',life:1.2,max:1.2,vy:80});}
function drawImage(p,x,y,w,h,a=1){const im=img(p);if(!im.complete||!im.naturalWidth)return;ctx.save();ctx.globalAlpha=a;ctx.drawImage(im,x,y,w,h);ctx.restore()}
function drawBackground(){ctx.fillStyle='#9fd7fa';ctx.fillRect(0,0,W.w,W.h);drawImage('environment/moon.png',W.w-115,50,82,82,.9);ctx.globalAlpha=.22;for(let i=0;i<18;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((i*97)%W.w,(i*151+worldY*.12)%W.h,2+i%3,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;drawImage('environment/mountain.png',0,W.h-210,W.w,240,.55);drawImage('environment/space_city.png',0,W.h-125,W.w,150,.45)}
const itemMap={gem:'collectibles/gem.png',heart:'collectibles/heart.png',star:'collectibles/star.png',star2:'collectibles/star_2.png',special:'collectibles/star_special.png',spring:'powerups/spring.png',rocket:'powerups/rocket_powerup.png',shield:'powerups/shield.png',magnet:'powerups/magnet.png'};
function draw(){
 drawBackground();
 for(const o of environmentObjects)drawImage(o.asset,o.x,o.y,o.w,o.h,o.alpha);
 for(const p of platforms){const path=p.asset||choice(platformPools[p.kind]||platformPools.grass);if(cache[path]&&cache[path].naturalWidth)drawImage(path,p.x,p.y,p.w,p.h);else{ctx.fillStyle='#4caf50';ctx.fillRect(p.x,p.y,p.w,p.h)}}
 for(const o of decorations){ctx.save();ctx.globalAlpha=o.alpha;ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(Math.sin(o.spin+worldY*.01)*.15);const im=img(o.asset);if(im.complete&&im.naturalWidth)ctx.drawImage(im,-o.w/2,-o.h/2,o.w,o.h);ctx.restore()}
 for(const o of items){if(o.type==='coin')drawImage('collectibles/coin_0'+(1+Math.floor(o.spin)%4)+'.png',o.x,o.y,o.w,o.h);else drawImage(itemMap[o.type],o.x,o.y,o.w,o.h)}
 for(const e of enemies)drawImage(e.asset||enemyPools[e.type][0],e.x,e.y,e.w,e.h);
 for(const e of effects){e.life-=0.016;if(e.vy)e.y+=e.vy*.016;drawImage(e.asset,e.x,e.y,e.w,e.h,Math.max(0,e.life/e.max))}
 let pi=devJetpack||player.jet>0?'player/player_jetpack.png':player.vy<0?(Math.abs(Math.floor(performance.now()/140))%2?'player/player_rise.png':'player/player_rise2.png'):player.vy>250?(Math.abs(Math.floor(performance.now()/140))%2?'player/player_fall.png':'player/player_fall2.png'):(Math.abs(Math.floor(performance.now()/180))%2?'player/player_idle.png':'player/player_idle2.png');
 if(player.jet>0&&!devJetpack&&Math.floor(performance.now()/120)%2===0)pi='player/player_boost.png';
 drawImage(pi,player.x,player.y,player.w,player.h,player.inv>0&&Math.floor(performance.now()/100)%2?.45:1);
 for(const p of particles){ctx.fillStyle='#fff';ctx.fillRect(p.x,p.y,4,4)}
}
function syncUI(){$('scoreText').textContent=String(score).padStart(5,'0');$('hiText').textContent='HI '+String(best).padStart(5,'0');$('shieldCount').textContent=shields+(player.shield>0?' +1':'');$('gemCount').textContent=gems;$('jetpackCount').textContent=devJetpack?'∞':jetpacks;$('shopCoins').textContent=coins}
function showReady(){$('readyOverlay').classList.remove('hidden');$('pauseOverlay').classList.add('hidden');$('gameOverOverlay').classList.add('hidden');document.querySelectorAll('[data-difficulty]').forEach(b=>b.classList.toggle('selected',b.dataset.difficulty===difficulty))}
function showGameOver(){$('readyOverlay').classList.add('hidden');$('pauseOverlay').classList.add('hidden');$('gameOverOverlay').classList.remove('hidden');$('finalScore').textContent='SCORE '+score+' • BEST '+best}
function hideOverlays(){$('readyOverlay').classList.add('hidden');$('pauseOverlay').classList.add('hidden');$('gameOverOverlay').classList.add('hidden')}
function pause(){if(state==='PLAYING'){state='PAUSED';left=right=false;$('pauseOverlay').classList.remove('hidden')}}
$('startBtn').onclick=()=>{startGame();if(state==='PLAYING')hideOverlays()};document.querySelectorAll('[data-difficulty]').forEach(b=>b.onclick=()=>{difficulty=b.dataset.difficulty;cfg=difficulties[difficulty];reset()});$('resumeBtn').onclick=()=>{state='PLAYING';$('pauseOverlay').classList.add('hidden')};$('restartBtn').onclick=()=>{reset();startGame();hideOverlays()};$('pausePortalBtn').onclick=()=>{show(portal);updatePortalBest();reset()};$('gameOverRestart').onclick=()=>{reset();startGame();hideOverlays()};$('gameOverPortal').onclick=()=>{show(portal);updatePortalBest();reset()};
function setMove(dir,on){if(dir==='left')left=on;else right=on}
[['leftControl','left'],['rightControl','right']].forEach(([id,dir])=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();setMove(dir,true);b.setPointerCapture?.(e.pointerId)});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>setMove(dir,false)))})
canvas.addEventListener('pointerdown',e=>{if(state==='READY'){startGame();hideOverlays();return}if(state==='PLAYING'){if(e.clientX<W.w*.45)setMove('left',true);else if(e.clientX>W.w*.55)setMove('right',true)}});['pointerup','pointercancel','pointerleave'].forEach(ev=>canvas.addEventListener(ev,()=>{left=right=false}));
addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')right=true;if((e.key===' '||e.key==='Enter')&&state==='READY'){startGame();hideOverlays()}if(e.key==='Escape')pause()});addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')right=false});
$('shopOpen').onclick=()=>{$('shopOverlay').classList.remove('hidden');syncUI()};$('shopClose').onclick=()=>{$('shopOverlay').classList.add('hidden')};document.querySelectorAll('.shop-item').forEach(b=>b.onclick=()=>{const type=b.dataset.buy,cost={gem:100,heart:150,shield:200,jetpack:250}[type];if(coins<cost){b.animate([{transform:'translateX(-3px)'},{transform:'translateX(3px)'},{transform:'translateX(0)'}],180);return}coins-=cost;if(type==='gem')gems++;if(type==='heart')hearts++;if(type==='shield')shields++;if(type==='jetpack')jetpacks++;save();syncUI()});
$('devOpen').onclick=()=>{$('devOverlay').classList.remove('hidden')};$('devClose').onclick=()=>{$('devOverlay').classList.add('hidden')};$('jetpackToggle').onclick=()=>{devJetpack=!devJetpack;$('jetpackToggle').textContent='JETPACK MODE: '+(devJetpack?'ON':'OFF');syncUI()};
addEventListener('contextmenu',e=>e.preventDefault());function loop(now){const dt=(now-last)/1000;last=now;update(dt);draw();requestAnimationFrame(loop)}
loadBest();reset();requestAnimationFrame(loop);
})();
