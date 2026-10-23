(() => {
const data=window.PORTFOLIO_DATA;
const $=s=>document.querySelector(s);
const screens={home:$('#homeScreen'),past:$('#pastScreen'),gallery:$('#galleryScreen'),models:$('#modelsScreen'),present:$('#presentScreen'),future:$('#futureScreen')};
let current='home',historyStack=[],galleryState={folder:'',items:[],index:0},presentIndex=0,lightboxItems=[],lightboxIndex=0,zoomed=false,identityTimer=null;
const pretty=s=>s.replace(/_/g,' ').replace(/\s+/g,' ').trim();
const safe=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const imgSrc=s=>s.split('/').map((p,i)=>i===0?p:encodeURIComponent(p)).join('/');
function setScreen(name,push=true){
 if(push&&current!==name)historyStack.push(current);
 Object.entries(screens).forEach(([k,el])=>el.classList.toggle('active',k===name));
 current=name;window.scrollTo({top:0,behavior:'smooth'});
 $('#backBtn').style.opacity=(name==='home'?' .4':'1');
 $('#backBtn').disabled=(name==='home');
}
function pageHead(kicker,title,desc=''){return `<div class="page-head"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1></div>${desc?`<p>${desc}</p>`:''}</div>`}
function sketchPlan(){
 return `<svg viewBox="0 0 1000 570" aria-label="Hand sketched museum floor plan"><g fill="none" stroke="#282a28" stroke-linecap="round" stroke-linejoin="round">
 <path d="M100 78 L495 40 L900 80 L915 450 L500 518 L83 450 Z" stroke-width="2.2"/>
 <path d="M105 84 L493 50 L892 87 L905 444 L499 508 L92 444 Z" stroke-width=".8" opacity=".55"/>
 <path d="M100 78 L100 220 L305 238 L305 80 M305 238 L305 470 M305 238 L500 260 L500 518 M500 260 L705 235 L705 485 M705 235 L900 220 L900 80 M100 220 L500 260 L900 220 M83 450 L305 470 L500 518 L705 485 L915 450" stroke-width="2"/>
 <path d="M130 112 L278 103 L278 210 L130 197 Z M345 94 L474 108 L474 235 L345 220 Z M530 107 L670 94 L670 218 L530 235 Z M730 103 L867 112 L867 197 L730 210 Z" stroke-width="1.4"/>
 <path d="M130 112 L278 103 M345 94 L474 108 M530 107 L670 94 M730 103 L867 112" opacity=".3"/>
 <path d="M130 300 L275 313 L275 430 L130 412 Z M340 310 L474 330 L474 480 L340 455 Z M530 330 L675 310 L675 455 L530 480 Z M730 313 L868 300 L868 412 L730 430 Z" stroke-width="1.4"/>
 <path d="M160 325 L245 334 M160 340 L245 350 M365 345 L450 357 M555 356 L645 344 M750 334 L835 325" opacity=".5"/>
 <path d="M100 220 L130 197 M305 238 L345 220 M500 260 L530 235 M705 235 L730 210 M305 470 L340 455 M474 480 L500 518 M500 518 L530 480 M675 455 L705 485" stroke-width="1.2"/>
 </g><g fill="#72a9e8" opacity=".32"><path d="M100 78 L305 80 L305 94 L100 92 Z"/><path d="M500 260 L530 235 L530 248 L500 274 Z"/><path d="M83 450 L305 470 L305 482 L83 462 Z"/><path d="M705 235 L900 220 L900 232 L705 247 Z"/></g><g stroke="#72a9e8" stroke-width="2" fill="none" opacity=".65"><path d="M111 84 L296 86 M316 244 L490 264 M510 264 L696 240 M314 475 L490 512 M515 512 L695 480"/></g>
 <g fill="#6b6b63" font-family="Montserrat" font-size="10" letter-spacing="2"><text x="500" y="550" text-anchor="middle">A FLOOR PLAN, DRAWN FROM MEMORY</text></g></svg>`;
}
function renderPast(){
 const rooms=['Digital paintings','Models','Pencil','Sketches','Vietnamese Lacquered Painting (Son Mai)','Others'];
 screens.past.innerHTML=pageHead('01 / THE ARCHIVE','What I did','Six rooms, six ways of seeing. Wander through the work collected so far.')+
 `<div class="floorplan">${sketchPlan()}${rooms.map((r,i)=>`<button class="room-select" data-room="${safe(r)}"><b><span class="num">0${i+1}</span>${safe(r)}</b><span>${r==='Models'?'TWO WORLDS TO BUILD':`${(data.past[r]||[]).length} WORKS · ENTER ROOM`}</span></button>`).join('')}</div><div class="floor-note">SELECT A ROOM TO EXPLORE THE COLLECTION ↗</div>`;
 screens.past.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{const r=b.dataset.room;if(r==='Models'){renderModels();setScreen('models')}else{openGallery(r,data.past[r]||[],'past')}}));
}
function openGallery(folder,items,from='past',index=0){
 galleryState={folder,items,index,from};renderGallery();setScreen('gallery');
}
function renderGallery(){
 const {folder,items,index}=galleryState;
 const item=items[index];
 if(!item){screens.gallery.innerHTML=pageHead('THE COLLECTION',folder,'')+`<div class="empty-note">No artworks were found in this room.</div>`;return}
 const hasArrows=items.length>1;
 screens.gallery.innerHTML=pageHead(`01 / PAST · ${safe(folder.toUpperCase())}`,safe(pretty(item.title)),`${String(index+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')} — selected from the archive.`)+
 `<div class="gallery-layout"><div class="art-stage">${hasArrows?`<button class="gallery-arrow prev" id="prevArt" aria-label="Previous artwork">‹</button>`:''}<div class="art-frame"><img id="mainArt" src="${imgSrc(item.src)}" alt="${safe(item.title)}"></div>${hasArrows?`<button class="gallery-arrow next" id="nextArt" aria-label="Next artwork">›</button>`:''}</div><div class="art-info"><div class="index">PLATE ${String(index+1).padStart(2,'0')} / ${items.length}</div><h2>${safe(pretty(item.title))}</h2><p>An original piece from the ${safe(folder)} collection. Presented here as part of a growing visual archive.</p><div class="fine-line"></div><div class="hint">ORIGINAL ARTWORK · ${item.kind.toUpperCase()}</div>${hasArrows?`<div class="thumbnail-strip">${items.map((it,i)=>`<button class="thumb ${i===index?'active':''}" data-index="${i}" title="${safe(it.title)}"><img src="${imgSrc(it.src)}" alt=""></button>`).join('')}</div>`:''}<div style="margin-top:26px"><button class="back-link" id="backToRooms">${galleryState.from==='models'?'← BACK TO MODEL PLINTHS':'← BACK TO THE FLOOR PLAN'}</button></div></div></div>`;
 if(hasArrows){$('#prevArt').onclick=()=>changeGallery(-1);$('#nextArt').onclick=()=>changeGallery(1);screens.gallery.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{galleryState.index=+b.dataset.index;renderGallery()})}
 $('#mainArt').onclick=()=>openLightbox(items,index);
 $('#backToRooms').onclick=()=>{if(galleryState.from==='models'){renderModels();setScreen('models')}else{renderPast();setScreen('past')}};
}
function changeGallery(n){galleryState.index=(galleryState.index+n+galleryState.items.length)%galleryState.items.length;renderGallery()}
function renderModels(){
 const models=data.models;const keys=Object.keys(models);
 screens.models.innerHTML=pageHead('01 / THE ARCHIVE · MODELS','Built worlds','Two miniature worlds, each with its own story. Select a plinth to open its portfolio sheet.')+
 `<div class="model-stage">${keys.map((key,i)=>{let item=models[key][0];return `<button class="pedestal" data-model="${safe(key)}"><div class="pedestal-art"><img src="${imgSrc(item.src)}" alt="${safe(key)}"></div><div class="pedestal-plinth"></div><b>${safe(pretty(key.replace(/_s/g,"’s")))}</b><small>MODEL 0${i+1} · VIEW PROJECT ↗</small></button>`}).join('')}</div><div class="floor-note">A SMALL STUDY IN SPACE, SCALE AND STORY</div>`;
 screens.models.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{const key=b.dataset.model;openGallery(key,models[key],'models')});
}
function constructionSvg(){return `<svg viewBox="0 0 1100 550" aria-label="Sketch of a room under construction"><g fill="none" stroke="#292b28" stroke-linecap="round" stroke-linejoin="round">
<path d="M80 65 L550 150 L1020 65 M80 65 V390 L550 510 L1020 390 V65 M80 390 L550 510 L1020 390" stroke-width="2"/>
<path d="M110 90 L550 172 L990 90 M110 370 L550 475 L990 370" opacity=".5"/>
<path d="M210 88 L210 365 M235 92 L235 372 M875 91 L875 364 M900 87 L900 356" opacity=".5"/>
<path d="M330 112 L470 138 L470 250 L330 226 Z M630 138 L770 112 L770 226 L630 250 Z" stroke-width="1.6"/>
<path d="M352 126 L352 230 M375 130 L375 234 M652 130 L652 234 M675 126 L675 230" opacity=".6"/>
<path d="M490 151 L610 151 L610 322 L490 322 Z M505 168 L595 168 L595 305 L505 305 Z" stroke-width="1.5"/>
<path d="M510 172 L510 301 M590 172 L590 301" opacity=".5"/>
<path d="M750 370 L750 248 L800 222 L800 350 M750 270 L800 245 M750 292 L800 267 M750 314 L800 289 M750 336 L800 311 M750 358 L800 333" stroke-width="2"/>
<path d="M700 386 L750 370 M800 350 L850 365" stroke-width="1.5"/>
<path d="M120 405 L280 443 L280 475 L120 436 Z M305 455 L420 483 L420 510 L305 480 Z M650 456 L735 435 L735 476 L650 497 Z M840 420 L955 390 L955 438 L840 468 Z" stroke-width="1.5"/>
<path d="M120 405 L280 443 L280 475 L120 436 Z M305 455 L420 483 L420 510 L305 480 Z" fill="#72a9e8" fill-opacity=".35" stroke="#72a9e8"/>
<path d="M650 456 L735 435 L735 476 L650 497 Z M840 420 L955 390 L955 438 L840 468 Z" fill="#72a9e8" fill-opacity=".27" stroke="#72a9e8"/>
<path d="M70 425 l28 -5 M990 450 l36 -9 M180 60 l-4 -20 M910 54 l8 -18" opacity=".6"/>
</g><g fill="#72a9e8" opacity=".35"><path d="M80 390 L550 510 L550 527 L80 407 Z"/><path d="M1020 390 L550 510 L550 527 L1020 407 Z"/></g><g fill="#6c6d66" font-family="Montserrat" font-size="10" letter-spacing="2"><text x="550" y="540" text-anchor="middle">WORK IN PROGRESS · PLEASE MIND THE WET PAINT</text></g></svg>`}
function renderPresent(){
 screens.present.innerHTML=pageHead('02 / IN PROGRESS','What I’m doing','A room in the middle of becoming. The marked crates hold the work currently on my desk.')+
 `<div class="construction">${constructionSvg()}<button class="hotspot one" data-box="0" aria-label="Open Models sketches 1"><span>01 · OBJECTS</span></button><button class="hotspot two" data-box="1" aria-label="Open Pattern 1"><span>02 · PATTERNS</span></button><button class="hotspot three" data-box="2" aria-label="Open Project Idea Concept"><span>03 · CONCEPT</span></button><button class="hotspot four" data-box="3" aria-label="Open The Ludo King board design"><span>04 · LUDO KING</span></button></div><div class="floor-note">CLICK A BLUE-WASHED CRATE TO OPEN THE PROJECT</div>`;
 screens.present.querySelectorAll('[data-box]').forEach(b=>b.onclick=()=>{presentIndex=+b.dataset.box;renderPresentProject();setScreen('present')});
}
function renderPresentProject(){
 const items=data.present;const item=items[presentIndex];
 screens.present.innerHTML=pageHead('02 / IN PROGRESS · PROJECT FILE',safe(pretty(item.title)),`${String(presentIndex+1).padStart(2,'0')} / ${items.length} — a work in motion.`)+
 `<div class="project-gallery"><div class="art-stage">${items.length>1?`<button class="gallery-arrow prev" id="pPrev">‹</button>`:''}<div class="art-frame"><img id="presentArt" src="${imgSrc(item.src)}" alt="${safe(item.title)}"></div>${items.length>1?`<button class="gallery-arrow next" id="pNext">›</button>`:''}</div><div class="art-info"><div class="index">PROJECT NOTE</div><h2>Everyday things,<br>new possibilities.</h2><div class="brief"><p>This project transforms everyday stationery into a functional board game, where pen caps become chess pieces, erasers become dice, and notebooks become game boards, featuring illustrations inspired by Thần Đồng Đất Việt. By bringing childhood memories back into our daily routines, the project explores how familiar objects can keep the past within sight, allowing forgotten memories to be rediscovered through the things we use every day.</p></div><div class="thumbnail-strip">${items.map((it,i)=>`<button class="thumb ${i===presentIndex?'active':''}" data-pindex="${i}"><img src="${imgSrc(it.src)}" alt=""></button>`).join('')}</div><div style="margin-top:24px"><button class="back-link" id="backToRoom">← BACK TO THE WORKROOM</button></div></div></div>`;
 if(items.length>1){$('#pPrev').onclick=()=>{presentIndex=(presentIndex-1+items.length)%items.length;renderPresentProject()};$('#pNext').onclick=()=>{presentIndex=(presentIndex+1)%items.length;renderPresentProject()}}
 screens.present.querySelectorAll('[data-pindex]').forEach(b=>b.onclick=()=>{presentIndex=+b.dataset.pindex;renderPresentProject()});
 $('#presentArt').onclick=()=>openLightbox(items,presentIndex);
 $('#backToRoom').onclick=()=>{renderPresent();setScreen('present')};
}
function renderFuture(){
 const orbit=data.future['The Inner Orbits']||[], humane=(data.future['The Humane Chaos']||[])[0];
 screens.future.innerHTML=pageHead('03 / THE UNWRITTEN','What I plan to do','A sketchbook of future directions. Some ideas are still orbiting; one has begun to take shape.')+
 `<div class="future-book"><div class="book-page left"><div class="book-label">STUDIES · THE INNER ORBITS</div><div class="orbit-grid">${orbit.slice(0,9).map((it,i)=>`<button class="orbit-thumb" style="--rot:${[-2,1.5,-1,1,-1.8,2,-1.2,1.7,-.6][i]}deg" data-orbit="${i}" title="${safe(it.title)}"><img src="${imgSrc(it.src)}" alt="${safe(it.title)}"></button>`).join('')}</div><p style="font-family:Georgia,serif;font-size:15px;font-style:italic;color:#666;margin-top:25px">“Everything is connected by an invisible line.”</p></div><div class="book-page right"><div class="book-label">FEATURED DIRECTION · 01</div><div class="humane-card"><button id="humaneOpen"><img src="${humane?imgSrc(humane.src):''}" alt="The Humane Chaos"></button><span>THE HUMANE CHAOS ↗</span></div></div></div><div class="book-caption">A FEW THINGS I HAVEN’T FINISHED THINKING ABOUT YET</div>`;
 screens.future.querySelectorAll('[data-orbit]').forEach(b=>b.onclick=()=>openLightbox(orbit,+b.dataset.orbit));
 if(humane)$('#humaneOpen').onclick=()=>openLightbox([humane],0);
}
function openLightbox(items,index){
 lightboxItems=items;lightboxIndex=index;zoomed=false;showLightboxItem();
 $('#lightbox').classList.add('open');$('#lightbox').setAttribute('aria-hidden','false');
}
function showLightboxItem(){
 const it=lightboxItems[lightboxIndex];$('#lightboxImg').src=imgSrc(it.src);$('#lightboxImg').alt=it.title;$('#lightboxTitle').textContent=pretty(it.title);$('#lightboxImg').style.transform='scale(1)';zoomed=false;$('#zoomBtn').textContent='＋';
}
function closeLightbox(){$('#lightbox').classList.remove('open');$('#lightbox').setAttribute('aria-hidden','true')}
$('#closeLightbox').onclick=closeLightbox;
$('#lightbox').addEventListener('click',e=>{if(e.target===$('#lightbox'))closeLightbox()});
$('#zoomBtn').onclick=()=>{zoomed=!zoomed;$('#lightboxImg').style.transform=zoomed?'scale(1.6)':'scale(1)';$('#lightboxImg').style.cursor=zoomed?'zoom-out':'zoom-in';$('#zoomBtn').textContent=zoomed?'−':'＋'};
$('#lightboxImg').onclick=()=>$('#zoomBtn').click();
$('#backBtn').onclick=()=>{if($('#lightbox').classList.contains('open'))return closeLightbox();if(current==='gallery'&&galleryState.from==='models'){renderModels();return setScreen('models',false)}const prev=historyStack.pop()||'home';if(prev==='past')renderPast();if(prev==='present')renderPresent();setScreen(prev,false)};
$('#homeBtn').onclick=()=>{historyStack=[];setScreen('home',false);$('#entryCard').classList.remove('entered');$('#entryCard').style.opacity='1'};
$('#enterBtn').onclick=()=>{const card=$('#entryCard');card.classList.add('entered');setTimeout(()=>{card.style.opacity='.92';},500);$('#identity').classList.add('visible');clearTimeout(identityTimer);identityTimer=setTimeout(()=>$('#identity').classList.add('compact'),5000)};
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
function go(where){if(where==='past'){renderPast();setScreen('past')}if(where==='present'){renderPresent();setScreen('present')}if(where==='future'){renderFuture();setScreen('future')}}
// The identity card is revealed by the entrance interaction, then docks after five seconds.
$('#backBtn').disabled=true;$('#backBtn').style.opacity='.4';
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLightbox();if($('#lightbox').classList.contains('open')){if(e.key==='ArrowRight'){lightboxIndex=(lightboxIndex+1)%lightboxItems.length;showLightboxItem()}if(e.key==='ArrowLeft'){lightboxIndex=(lightboxIndex-1+lightboxItems.length)%lightboxItems.length;showLightboxItem()}}else if(current==='gallery'){if(e.key==='ArrowRight')changeGallery(1);if(e.key==='ArrowLeft')changeGallery(-1)}});
})();