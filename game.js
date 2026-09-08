const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const A="assets/doodle_jump/";
const DIFF={
 EASY:{name:"EASY",g:1800,j:-850,s:430,minW:140,maxW:200,minG:85,maxG:130,scroll:.85,move:.05},
 NORMAL:{name:"NORMAL",g:2100,j:-900,s:520,minW:110,maxW:180,minG:95,maxG:150,scroll:1,move:.20},
 HARD:{name:"HARD",g:2300,j:-930,s:580,minW:95,maxW:150,minG:110,maxG:165,scroll:1.2,move:.40},
 ULTRA_HARD:{name:"ULTRA HARD",g:2500,j:-960,s:630,minW:80,maxW:130,minG:120,maxG:180,scroll:1.4,move:.60}
};
const platformTypes=["grass_01","grass_02","grass_03","grass_04","wood_01","wood_02","wood_03","wood_04","stone_01","stone_02","stone_03","stone_04","cloud_01","cloud_02","ice_01","ice_02","metal_01","metal_02","lava_01","lava_02","alien_01","alien_02"];
const enemies=["alien","bat","bat_purple","bee","monster","spike","ufo"];
const imgCache=new Map();
const assetErrors=new Set();
let assetsLoaded=0, assetsTotal=0, assetsReady=false;
function img(path){
  if(!imgCache.has(path)){
    const i=new Image();
    i.decoding="async";
    i.onload=()=>{assetsLoaded++;};
    i.onerror=()=>{assetErrors.add(path); console.warn("Doodle Jump asset failed to load:", A+path);};
    i.src=A+path;
    imgCache.set(path,i);
  }
  return imgCache.get(path);
}
const PRELOAD_ASSETS=[
  ...["mountain","space_city","moon","cloud_small_01","cloud_small_02","cloud_medium","cloud_large","floating_island_small_01","floating_island_small_02","floating_island_small_03","floating_island_large"].map(n=>`environment/${n}.png`),
  ...["grass_01","grass_02","grass_03","grass_04","wood_01","wood_02","wood_03","wood_04","stone_01","stone_02","stone_03","stone_04","cloud_01","cloud_02","ice_01","ice_02","metal_01","metal_02","lava_01","lava_02","alien_01","alien_02"].map(n=>`platforms/platform_${n}.png`),
  ...["coin_01","coin_02","coin_03","coin_04","gem","heart","star","star_2","star_special"].map(n=>`collectibles/${n}.png`),
  ...["blue_star","pink_star","purple_star"].map(n=>`decoration/${n}.png`),
  ...["enemy_projectile","explosion"].map(n=>`effects/${n}.png`),
  ...["alien","bat","bat_purple","bee","monster","spike","ufo"].map(n=>`enemies/enemy_${n}.png`),
  ...["spring","magnet","rocket_powerup","shield"].map(n=>`powerups/${n}.png`),
  ...["player_rise","player_idle2","player_fall2","player_boost","player_fall","player_jetpack","player_idle","player_rise2"].map(n=>`player/${n}.png`)
];
function preloadAssets(){
  assetsTotal=PRELOAD_ASSETS.length;
  PRELOAD_ASSETS.forEach(path=>img(path));
}
const asset=(cat,n)=>img(`${cat}/${n}.png`);
const state={w:0,h:0,mode:"READY",difficulty:localStorage.doodleDifficulty||"NORMAL",score:0,hi:0,world:0,maxH:0,starBonus:0,coins:0,gems:0,hearts:0,shield:0,jetpack:0,dev:false,jetMode:false,shop:false,continuePrompt:false,left:false,right:false,note:"",noteT:0,last:0};
const player={x:0,y:0,w:64,h:64,vx:0,vy:0,gravity:2100,jump:-900,speed:520,jetTimer:0,inv:0,shield:false,shieldT:0,magnet:false,magnetT:0,frame:0,animT:0};
let platforms=[],items=[],foes=[],decor=[];
function resize(){const d=Math.min(devicePixelRatio||1,2);state.w=innerWidth;state.h=innerHeight;canvas.width=state.w*d;canvas.height=state.h*d;ctx.setTransform(d,0,0,d,0,0); layout(); if(!state.started) reset()}
function layout(){}
addEventListener("resize",resize);
function save(){localStorage.doodleDifficulty=state.difficulty;["coins","gems","hearts","shield","jetpack"].forEach(k=>localStorage[k]=state[k]);["EASY","NORMAL","HARD","ULTRA_HARD"].forEach(k=>{state.hi=0});}
function load(){for(const k of ["coins","gems","hearts","shield","jetpack"])state[k]=+(localStorage[k]||0);state.hi=+(localStorage["hi_"+state.difficulty]||0)}
function setDiff(k){state.difficulty=k;Object.assign(player,{gravity:DIFF[k].g,jump:DIFF[k].j,speed:DIFF[k].s});load();reset()}
function reset(){state.started=true;state.mode="READY";state.score=0;state.starBonus=0;state.world=0;state.maxH=0;state.continuePrompt=false;platforms=[];items=[];foes=[];decor=[];player.x=state.w/2-32;player.y=state.h*.7;player.vx=0;player.vy=DIFF[state.difficulty].j;player.jetTimer=0;player.inv=0;player.shield=false;player.magnet=false;
 for(let i=0;i<12;i++)decor.push({x:Math.random()*state.w,y:Math.random()*state.h,w:24,h:24,type:["blue_star","pink_star","purple_star"][Math.floor(Math.random()*3)],sp:.08});
 for(let i=0;i<4;i++)decor.push({x:Math.random()*state.w,y:Math.random()*state.h,w:90,h:60,type:Math.random()<.5?"cloud_small_01":"cloud_small_02",sp:.25});
 for(let i=0;i<3;i++)decor.push({x:Math.random()*state.w,y:Math.random()*state.h,w:100,h:70,type:"cloud_medium",sp:.35});
 for(let i=0;i<2;i++)decor.push({x:Math.random()*state.w,y:Math.random()*state.h,w:110,h:70,type:["floating_island_small_01","floating_island_small_02","floating_island_small_03"][Math.floor(Math.random()*3)],sp:.15});
 platforms.push({x:state.w/2-90,y:state.h*.86,w:180,h:28,type:"grass_01",move:0,minX:0,maxX:state.w,active:true});
 for(let i=0;i<12;i++)genPlatform(platforms[platforms.length-1]);
}
function genPlatform(prev){const d=DIFF[state.difficulty],progress=Math.min(state.maxH/5000,1),v=Math.abs(d.j),g=d.g,maxH=v*v/(2*g);
 const gap=d.minG+Math.random()*(Math.min(d.maxG+progress*20,maxH*.85)-d.minG),y=prev.y-gap,flight=(v+Math.sqrt(Math.max(0,v*v-2*g*gap)))/g,reach=d.s*flight*.8;
 const pw=Math.max(80,Math.min(d.minW+Math.random()*(d.maxW-d.minW),state.w*.5));
 const minX=Math.max(0,prev.x+prev.w/2-reach-pw),maxX=Math.min(state.w-pw,prev.x+prev.w/2+reach);
 const x=minX<maxX?minX+Math.random()*(maxX-minX):(state.w-pw)/2;
 let idx=state.maxH<1000?Math.floor(Math.random()*4):state.maxH<2000?4+Math.floor(Math.random()*4):state.maxH<3000?8+Math.floor(Math.random()*4):state.maxH<4000?12+Math.floor(Math.random()*6):Math.floor(Math.random()*22);
 const type=platformTypes[Math.min(idx,21)], moving=type.startsWith("metal")||Math.random()<(d.move+progress*.15);
 const p={x,y,w:pw,h:26,type,move:moving?(80+Math.random()*100)*d.scroll*(Math.random()<.5?-1:1):0,minX:0,maxX:state.w,active:true};platforms.push(p);
 if(!moving){const r=Math.random();if(r<.08)addItem(p,"spring");else if(r<.12)addItem(p,"rocket");else if(r<.15)addItem(p,"shield");else if(r<.18)addItem(p,"magnet");else if(r<.45)spawnCollect(p)}
 if(state.maxH>1000&&Math.random()<.08+progress*.12)spawnEnemy(p);
}
function addItem(p,type){let wh=type==="rocket"?[36,40]:[34,34];items.push({x:p.x+(p.w-wh[0])/2,y:p.y-wh[1],w:wh[0],h:wh[1],type,active:true})}
function spawnCollect(p){const r=Math.random();let type=r<.5?"coin":r<.65?"gem":r<.8?"heart":r<.9?"star":r<.96?"star_2":"star_special";items.push({x:p.x+(p.w-32)/2,y:p.y-36,w:32,h:32,type,active:true})}
function spawnEnemy(p){const type=enemies[Math.floor(Math.random()*enemies.length)];foes.push({x:Math.max(10,Math.min(state.w-70,p.x+p.w/2-30)),y:p.y-150,w:60,h:60,type,active:true,dead:false,t:0,px:-100,py:-100,shot:false})}
function rect(a){return{x:a.x+ (a===player?10:0),y:a.y+(a===player?7:0),w:a===player?44:a.w,h:a===player?53:a.h}}
function overlap(a,b){const A=rect(a),B=rect(b);return A.x<B.x+B.w&&A.x+A.w>B.x&&A.y<B.y+B.h&&A.y+A.h>B.y}
function note(s){state.note=s;state.noteT=2.5}
function update(dt){if(state.mode!=="PLAYING"||state.shop||state.continuePrompt)return;
 if(state.noteT>0)state.noteT-=dt;
 const oldBottom=player.y+player.h*.95;
 player.animT+=dt;if(player.animT>.15){player.animT=0;player.frame=(player.frame+1)%2}
 if(state.left)player.vx-=player.speed*5*dt;if(state.right)player.vx+=player.speed*5*dt;if(!state.left&&!state.right)player.vx*=.85;
 player.vx=Math.max(-player.speed,Math.min(player.speed,player.vx));player.x+=player.vx*dt;player.x=Math.max(0,Math.min(state.w-player.w,player.x));
 if(state.jetMode)player.vy=-1300;else if(player.jetTimer>0){player.jetTimer-=dt;player.vy=-1500}else player.vy+=player.gravity*dt;
 player.y+=player.vy*dt;if(player.inv>0)player.inv-=dt;if(player.shieldT>0&& (player.shieldT-=dt)<=0)player.shield=false;if(player.magnetT>0&&(player.magnetT-=dt)<=0)player.magnet=false;
 for(const p of platforms){if(p.move){p.x+=p.move*dt;if(p.x<p.minX||p.x+p.w>p.maxX){p.x=Math.max(p.minX,Math.min(p.maxX-p.w,p.x));p.move=-p.move}}}
 for(const f of foes)updateEnemy(f,dt); checkCollisions(oldBottom);camera();genAbove();platforms=platforms.filter(p=>p.y<state.h+200);items=items.filter(i=>i.active&&i.y<state.h+200);foes=foes.filter(f=>f.active&&f.y<state.h+300);if(player.y>state.h+100)death()
}
function updateEnemy(f,dt){if(!f.active)return;if(f.dead){f.t+=dt;if(f.t>.35)f.active=false;return}f.t+=dt;if(f.type==="bat"||f.type==="bat_purple")f.x+=Math.sin(f.t*3)*120-f.x+f.x; // corrected below
 if(f.type==="bat"||f.type==="bat_purple")f.x=(f.baseX??(f.baseX=f.x))+Math.sin(f.t*3)*120;
 if(f.type==="bee"){f.x=(f.baseX??(f.baseX=f.x))+Math.sin(f.t*2.5)*90;f.y+=Math.sin(f.t*5)*1.5}
 if(f.type==="ufo"&&!f.shot&&f.t>1.5&&(f.t%3<.05)){f.shot=true;f.px=f.x+18;f.py=f.y+f.h}
 if(f.shot){f.py+=280*dt;if(f.py>f.y+1000)f.shot=false}
}
function checkCollisions(oldBottom){const pr=rect(player),bottom=pr.y+pr.h;
 for(const i of items){if(!i.active)continue;if(player.magnet){const dx=player.x+32-(i.x+i.w/2),dy=player.y+32-(i.y+i.h/2);if(Math.abs(dx)<300&&Math.abs(dy)<300){i.x+=dx*.1;i.y+=dy*.1}}
 if(overlap(player,i)){i.active=false;switch(i.type){case"coin":state.coins++;note("+1 COIN 🪙");break;case"gem":state.gems++;note("+1 GEM 💎");break;case"heart":state.hearts++;note("+1 HEART ❤️");break;case"star":state.starBonus+=100;note("+100 ⭐");break;case"star_2":state.starBonus+=250;note("+250 ⭐");break;case"star_special":state.starBonus+=500;note("+500 ⭐");break;case"spring":bounce(1.5);break;case"rocket":if(state.jetMode)player.jetTimer=3;else{state.jetpack++;note("JETPACK STORED 🚀")}break;case"shield":if(state.jetMode)activateShield(10);else{state.shield++;note("SHIELD STORED 🛡️")}break;case"magnet":player.magnet=true;player.magnetT=10;note("MAGNET ACQUIRED 🧲")}}}
 if(!state.jetMode&&player.jetTimer<=0&&player.inv<=0){
 for(const f of foes){if(!f.active||f.dead)continue;if(overlap(player,f)){if(player.vy>0&&pr.y+pr.h<f.y+f.h*.5){f.dead=true;bounce(1)}else if(player.shield){f.dead=true;player.shield=false}else if(state.shield>0){state.shield--;f.dead=true;activateShield(10);note("SHIELD DEPLOYED! 🛡️")}else death()}else if(f.shot&&overlap(player,{x:f.px,y:f.py,w:24,h:24})){f.shot=false;if(player.shield)player.shield=false;else if(state.shield>0){state.shield--;activateShield(10)}else death()}}}
 // Reliable swept landing collision: only land while falling and only when the
 // player's collision box crosses the platform top during this frame. A small
 // tolerance prevents tunneling caused by high downward velocity.
 if(player.vy>0){
   const playerLeft=pr.x+2, playerRight=pr.x+pr.w-2;
   for(const p of platforms){
     if(!p.active) continue;
     const horizontal=playerRight>p.x && playerLeft<p.x+p.w;
     const crossedTop=oldBottom<=p.y+4 && bottom>=p.y-2;
     if(horizontal && crossedTop){
       // Put the collision box exactly on the platform top.
       player.y=p.y-60;
       bounce(1);
       if(p.type==="cloud_01"||p.type==="cloud_02") p.active=false;
       break;
     }
   }
 }
}
function bounce(mult=1){if(!state.jetMode&&player.jetTimer<=0){player.vy=player.jump*mult;player.grounded=true}}
function activateShield(sec){player.shield=true;player.shieldT=sec}
function activateJetpack(){
 if(state.mode!=="PLAYING" || state.jetMode || player.jetTimer>0) return false;
 if(state.jetpack>0){state.jetpack--;player.jetTimer=4;player.vy=-1500;note("JETPACK ACTIVATED! 🚀");save();return true}
 note("NO JETPACK STORED 🚀");return false;
}
function death(){if(state.mode!=="PLAYING"||state.continuePrompt)return;if(player.inv>0){if(player.y>state.h)revive();return}if(state.hearts>0){state.hearts--;revive();player.inv=3;note("HEART USED ❤️");return}if(state.gems>0){state.continuePrompt=true;return}state.mode="GAME_OVER";state.hi=Math.max(state.hi,state.score);localStorage["hi_"+state.difficulty]=state.hi}
function revive(){const p=platforms.filter(p=>p.active).sort((a,b)=>Math.abs(a.y-state.h*.5)-Math.abs(b.y-state.h*.5))[0];if(p){player.x=p.x+(p.w-player.w)/2;player.y=p.y-player.h;player.vy=-600}else{player.y=state.h*.4;player.vy=-800}}
function camera(){const line=state.h*.38;if(player.y<line){const d=line-player.y;player.y+=d;platforms.forEach(p=>p.y+=d);items.forEach(i=>i.y+=d);foes.forEach(f=>{f.y+=d;if(f.shot)f.py+=d});decor.forEach(x=>{x.y+=d*x.sp;if(x.y>state.h+200){x.y=-200;x.x=Math.random()*state.w}});state.world+=d;if(state.world>state.maxH){state.maxH=state.world;state.score=Math.floor(state.maxH/10*DIFF[state.difficulty].scroll)+state.starBonus}}}
function genAbove(){if(!platforms.length)return;let top=platforms.reduce((a,b)=>a.y<b.y?a:b);while(top.y>-state.h){genPlatform(top);top=platforms.reduce((a,b)=>a.y<b.y?a:b)}}
function drawImg(i,x,y,w,h){if(!i)return;if(i.complete&&i.naturalWidth>0){try{ctx.drawImage(i,x,y,w,h)}catch(e){}}}
function draw(){const w=state.w,h=state.h;ctx.clearRect(0,0,w,h);
 ctx.fillStyle="#a0d7fa";ctx.fillRect(0,0,w,h);
 const m=asset("environment","mountain"),c=asset("environment","space_city");drawImg(m,0,h-w/(m.naturalWidth/m.naturalHeight)+(state.world*.05%(h+1)),w,w/(m.naturalWidth/m.naturalHeight));drawImg(c,0,h-w/(c.naturalWidth/c.naturalHeight)+(state.world*.15%(h+1)),w,w/(c.naturalWidth/c.naturalHeight));
 drawImg(asset("environment","moon"),w-140,40+(state.world*.02%(h+200)),120,120);
 for(const d of decor)drawImg(d.type.startsWith("cloud")?asset("environment",d.type):d.type.startsWith("floating")?asset("environment",d.type):asset("decoration",d.type),d.x,d.y,d.w,d.h);
 drawImg(asset("environment","cloud_large"),state.world*.1%w-200,h*.15,300,120);drawImg(asset("environment","cloud_medium"),state.world*.18%w-150,h*.32,230,90);
 for(const p of platforms)if(p.active!==false)drawImg(asset("platforms","platform_"+p.type),p.x,p.y,p.w,p.h);
 for(const i of items)if(i.active!==false){let n=i.type==="coin"?"coin_01":i.type;let cat=["spring","rocket","shield","magnet"].includes(i.type)?"powerups":"collectibles";drawImg(asset(cat,n),i.x,i.y,i.w,i.h)}
 for(const f of foes)if(f.active!==false){drawImg(asset("enemies","enemy_"+f.type),f.x,f.y,f.w,f.h);if(f.dead)drawImg(asset("effects","explosion"),f.x,f.y,f.w,f.h);if(f.shot)drawImg(asset("effects","enemy_projectile"),f.px,f.py,24,24)}
 let pn=state.jetMode||player.jetTimer>0?(player.frame?"player_boost":"player_jetpack"):player.vy<-100?(player.frame?"player_rise2":"player_rise"):player.vy>100?(player.frame?"player_fall2":"player_fall"):(player.frame?"player_idle2":"player_idle");let pi=asset("player",pn);
 if(player.inv>0&&Math.floor(performance.now()/100)%2===0){}else drawImg(pi,player.x,player.y,player.w,player.h);
 if(player.shield){ctx.strokeStyle="#6cf";ctx.lineWidth=4;ctx.beginPath();ctx.arc(player.x+32,player.y+32,43,0,Math.PI*2);ctx.stroke()}
 if(state.mode!=="READY"||state.shop)hud();if(state.mode==="READY"&&!state.shop)ready();if(state.mode==="PAUSED")pause();if(state.mode==="GAME_OVER")gameover();if(state.shop)shop();if(state.continuePrompt)cont();
}
function panel(){ctx.fillStyle="#0009";ctx.fillRect(0,0,state.w,state.h)}
function txt(s,x,y,size=24,align="center"){ctx.font=`${size}px system-ui`;ctx.textAlign=align;ctx.fillStyle="#fff";ctx.fillText(s,x,y)}
function btn(x,y,w,h,label,sel=false){ctx.fillStyle=sel?"#4caf50":"#182033cc";ctx.fillRect(x,y,w,h);ctx.strokeStyle="#fff";ctx.strokeRect(x,y,w,h);txt(label,x+w/2,y+h/2+9,24)}
function jetpackHit(){const x=Math.max(150,state.w-180);return{x,y:112,w:150,h:72}}
function hud(){const jb=jetpackHit();txt("SCORE "+state.score,125,55,36,"left");txt("HI "+state.hi,state.w-130,55,36,"right");txt("🪙 "+state.coins,125,100,24,"left");txt("❤️ x"+state.hearts,state.w-130,100,24,"right");btn(20,15,90,40,"BACK");btn(state.w-110,15,90,40,state.jetMode?"JETPACK ON":state.dev?"DEV ON":"DEV");if(state.mode==="PLAYING")btn(state.w-110,65,90,40,"PAUSE");ctx.fillStyle="#141e3277";ctx.fillRect(20,120,340,50);drawImg(asset("powerups","shield"),35,128,34,34);txt("x"+state.shield,74,153,22,"left");drawImg(asset("collectibles","gem"),145,128,34,34);txt("x"+state.gems,184,153,22,"left");drawImg(asset("powerups","rocket_powerup"),jb.x+8,128,34,34);txt(state.jetMode?"∞":"x"+state.jetpack,jb.x+47,153,22,"left");if(state.noteT>0)txt(state.note,state.w/2,220,34);if(state.mode==="READY")btn(20,120,130,50,"SHOP")}
function ready(){const mobile=state.w<700;const titleSize=mobile?30:52;const subSize=mobile?14:28;const bw=Math.min(state.w*.62,500);const bx=(state.w-bw)/2;const bh=mobile?48:54;const gap=mobile?56:68;txt("DOODLE JUMP",state.w/2,state.h*(mobile?.25:.28),titleSize);txt(mobile?"SELECT DIFFICULTY & TAP TO JUMP":"SELECT DIFFICULTY & TAP TO JUMP",state.w/2,state.h*(mobile?.31:.36),subSize);["EASY","NORMAL","HARD","ULTRA_HARD"].forEach((k,i)=>btn(bx,state.h*(mobile?.43:.5)+i*gap,bw,bh,DIFF[k].name,k===state.difficulty))}
function pause(){panel();txt("PAUSED",state.w/2,state.h*.32,52);btn(state.w*.25,state.h*.45,state.w*.5,70,"RESUME");btn(state.w*.25,state.h*.58,state.w*.5,70,"RESTART");btn(state.w*.25,state.h*.71,state.w*.5,70,"MENU")}
function gameover(){panel();txt("GAME OVER",state.w/2,state.h*.4,54);txt("SCORE "+state.score,state.w/2,state.h*.48,30);btn(state.w*.3,state.h*.58,state.w*.4,state.h*.1,"RESTART")}
function shop(){panel();const pw=state.w*.9,ph=state.h*.8,x=(state.w-pw)/2,y=(state.h-ph)/2;ctx.fillStyle="#0f1423f5";ctx.fillRect(x,y,pw,ph);ctx.strokeStyle="#0ff";ctx.strokeRect(x,y,pw,ph);txt("SPACE SHOP",state.w/2,y+80,50);txt("🪙 COINS: "+state.coins,state.w/2,y+130,28);[["gem","GEM","Continue",100],["heart","HEART","Extra Life",150],["shield","SHIELD","Protection",200],["rocket","JETPACK","Power Flight",250]].forEach((a,i)=>{let yy=y+180+i*145;ctx.fillStyle="#1e2d4677";ctx.fillRect(x+30,yy,pw-60,120);drawImg(asset(a[0]==="rocket"?"powerups":"collectibles",a[0]==="rocket"?"rocket_powerup":a[0]),x+50,yy+20,80,80);txt(a[1],x+150,yy+45,30,"left");txt(a[2],x+150,yy+75,20,"left");txt(a[3]+" Coins",x+150,yy+105,20,"left");btn(x+pw-180,yy+25,125,70,"BUY",state.coins>=a[3])});txt("TAP OUTSIDE TO CLOSE",state.w/2,y+ph-40,22)}
function cont(){panel();txt("CONTINUE?",state.w/2,state.h*.45,48);txt("COST: 1 GEM (Owned: "+state.gems+")",state.w/2,state.h*.52,28);btn(state.w*.25,state.h*.65,state.w*.5,state.h*.1,"YES");txt("TAP ELSEWHERE TO EXIT",state.w/2,state.h*.85,22)}
function hit(x,y,rx,ry,rw,rh){return x>=rx&&x<=rx+rw&&y>=ry&&y<=ry+rh}
function input(x,y,down){if(state.shop){if(!down)return;const pw=state.w*.9,ph=state.h*.8,sx=(state.w-pw)/2,sy=(state.h-ph)/2;if(x<sx||x>sx+pw||y<sy||y>sy+ph){state.shop=false;return}for(let i=0;i<4;i++){const yy=sy+180+i*145;if(hit(x,y,sx+pw-180,yy+25,125,70)){const prices=[100,150,200,250];if(state.coins>=prices[i]){state.coins-=prices[i];if(i===0)state.gems++;if(i===1)state.hearts++;if(i===2)state.shield++;if(i===3)state.jetpack++;save();note("PURCHASED");}return}}return}
 if(state.continuePrompt){if(down&&hit(x,y,state.w*.25,state.h*.65,state.w*.5,state.h*.1)&&state.gems>0){state.gems--;state.continuePrompt=false;revive();player.inv=3;state.mode="PLAYING";save()}else if(down){state.continuePrompt=false;state.mode="GAME_OVER"}return}
 if(!down)return;
 if(hit(x,y,state.w-110,15,90,40)){devAuth();return} if(hit(x,y,20,15,90,40)){location.hash="";state.mode="READY";return}
 if(state.mode==="PLAYING"&&hit(x,y,state.w-110,65,90,40)){state.mode="PAUSED";state.left=state.right=false;return}
 const jb=jetpackHit();if(state.mode==="PLAYING"&&hit(x,y,jb.x,jb.y,jb.w,jb.h)){activateJetpack();return}
 if(state.mode==="PAUSED"){if(hit(x,y,state.w*.25,state.h*.45,state.w*.5,70))state.mode="PLAYING";else if(hit(x,y,state.w*.25,state.h*.58,state.w*.5,70)){reset();state.mode="PLAYING"}else if(hit(x,y,state.w*.25,state.h*.71,state.w*.5,70))state.mode="READY";return}
 if(state.mode==="READY"){if(hit(x,y,20,120,130,50)){state.shop=true;return}for(const [k,i] of [["EASY",0],["NORMAL",1],["HARD",2],["ULTRA_HARD",3]])if(hit(x,y,state.w*.16,state.h*.5+i*68,state.w*.68,54)){setDiff(k);return}state.mode="PLAYING";return}
 if(state.mode==="GAME_OVER"&&hit(x,y,state.w*.3,state.h*.58,state.w*.4,state.h*.1)){reset();state.mode="PLAYING";return}
}
function devAuth(){if(!state.dev){const p=prompt("Developer Mode password:");if(p==="dev_selvarajan"){state.dev=true;alert("Developer Mode authenticated.")}else if(p!==null)alert("Invalid Password")}else{state.jetMode=!state.jetMode;player.isJetpackFlightActive=state.jetMode;alert("Jetpack Mode "+(state.jetMode?"ON":"OFF"));if(state.jetMode&&state.mode==="READY")state.mode="PLAYING"}}
canvas.addEventListener("pointerdown",e=>{e.preventDefault();const r=canvas.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;input(x,y,true);const jb=jetpackHit();const onJetpackButton=state.mode==="PLAYING"&&hit(x,y,jb.x,jb.y,jb.w,jb.h);if(state.mode==="PLAYING"&&!onJetpackButton){if(x<state.w/2)state.left=true;else state.right=true}});
canvas.addEventListener("pointermove",e=>{if(state.mode==="PLAYING"&&e.buttons){const r=canvas.getBoundingClientRect();const x=(e.clientX-r.left)*(state.w/r.width);state.left=x<state.w/2;state.right=!state.left}});
addEventListener("pointerup",()=>{state.left=state.right=false});
addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")state.left=true;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")state.right=true;if(e.key==="Escape"&&state.mode==="PLAYING")state.mode="PAUSED"});
addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key.toLowerCase()==="a")state.left=false;if(e.key==="ArrowRight"||e.key.toLowerCase()==="d")state.right=false});
let prev=performance.now();preloadAssets();load();resize();function loop(now){const dt=Math.min((now-prev)/1000,.033);prev=now;assetsReady=(assetsLoaded+assetErrors.size)>=assetsTotal;if(!assetsReady){ctx.clearRect(0,0,state.w,state.h);ctx.fillStyle="#a0d7fa";ctx.fillRect(0,0,state.w,state.h);txt("LOADING ASSETS…",state.w/2,state.h*.45,36);txt(`${assetsLoaded}/${assetsTotal}`,state.w/2,state.h*.52,24);requestAnimationFrame(loop);return}update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
