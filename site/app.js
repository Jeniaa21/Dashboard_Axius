/* Le site : lit catalogue.js (créé par construire.bat) et affiche marques > gammes > modèles. */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const norm=s=>String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const inline=s=>esc(s).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>");
const CAT=window.CATALOGUE||{marques:[]};
const S={marque:"",gamme:"",modele:"",ver:false,tab:"home",cat:"",fiche:null,q:"",list:null};
try{Object.assign(S,JSON.parse(localStorage.getItem("dep-etat2")||"{}"),{fiche:null,q:"",list:null})}catch(e){}
const save=()=>{try{localStorage.setItem("dep-etat2",JSON.stringify({marque:S.marque,gamme:S.gamme,modele:S.modele,ver:S.ver,tab:S.tab}))}catch(e){}};
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const LSset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const favs=()=>LS("dep-fav",[]),recs=()=>LS("dep-rec",[]);
function touchRec(id){LSset("dep-rec",[id].concat(recs().filter(x=>x!==id)).slice(0,8))}
function toggleFav(id){const f=favs();LSset("dep-fav",f.includes(id)?f.filter(x=>x!==id):f.concat(id))}
const M=()=>CAT.marques.find(m=>m.id===S.marque)||CAT.marques[0];
const G=()=>{const m=M();return m&&(m.gammes.find(g=>g.id===S.gamme)||m.gammes[0])};
const gkey=()=>M().id+"/"+G().id;
const visible=f=>(!S.ver||f.verifie)&&(!S.modele||f.modeles.includes("tous")||f.modeles.includes(S.modele));
const fiches=()=>G()?G().fiches.filter(visible):[];

/* ---------- en-tête ---------- */
function head(){
 if(!CAT.marques.length){$("#main").innerHTML=`<div class="vide"><b>Aucune donnée.</b><br>Double-cliquez sur <code>construire.bat</code> puis rechargez cette page.</div>`;return false}
 const m=M(),g=G();S.marque=m.id;S.gamme=g.id;
 if(S.modele&&!g.modeles.find(x=>x.id===S.modele))S.modele="";
 $("#marque").innerHTML=CAT.marques.map(x=>`<option value="${x.id}"${x.id===m.id?" selected":""}>${esc(x.nom)}</option>`).join("");
 $("#gamme").innerHTML=m.gammes.map(x=>`<option value="${x.id}"${x.id===g.id?" selected":""}>${esc(x.nom)}</option>`).join("");
 $("#modele").innerHTML=`<option value="">Tous les modèles</option>`+g.modeles.map(x=>`<option value="${x.id}"${x.id===S.modele?" selected":""}>${esc(x.nom)}</option>`).join("");
 $("#ver").checked=S.ver;
 const md=g.modeles.find(x=>x.id===S.modele);
 $("#sub").textContent=m.nom+" · "+g.nom+(md?" · "+md.nom:"");
 document.title=$("#sub").textContent+" — Dépannage";
 return true;
}

/* ---------- onglets ---------- */
function tabs(){
 const n=fiches().length;
 return `<div class="tabs"><button class="zt${S.tab==="home"?" on":""}" data-tab="home">Accueil</button><button class="zt${S.tab==="3d"?" on":""}" data-tab="3d">Plan 3D</button><button class="zt${S.tab==="fiches"?" on":""}" data-tab="fiches">Fiches (${n})</button><button class="zt${S.tab==="modeles"?" on":""}" data-tab="modeles">Modèles de la gamme</button></div>`;
}
function render(){
 if(!head())return;
 const main=$("#main");
 if(S.fiche){main.innerHTML=ficheHTML(S.fiche);return}
 if(S.q){main.innerHTML=tabs()+searchHTML(S.q);return}
 if(S.list){main.innerHTML=listPage();return}
 let body="";
 if(S.tab==="home")body=homeHTML();else if(S.tab==="3d")body=pane3d();else if(S.tab==="fiches")body=listHTML();else body=modelesHTML();
 main.innerHTML=tabs()+body;
 if(S.tab==="3d")initStages(main);
}
function go(tab){S.tab=tab;S.list=null;S.fiche=null;S.q="";$("#q").value="";S.cat="";save();render();scrollTo(0,0)}

/* ---------- plan 3D ---------- */
const zones=()=>(G()&&G().zones)||[];
const curPlan=()=>zones().map(z=>({t:z.nom}));
function pane3d(){
 const z=zones();
 return `<div class="zx"><div class="ztabs"><span class="ztip">Survolez une zone</span></div>${stage3dHTML(gkey())}
  ${z.length?`<h2 class="lt" style="margin-top:16px">Zones de la machine</h2><div class="tiles">${z.map(x=>{const n=fiches().filter(f=>f.zones.includes(x.n)).length;return `<button class="tile" data-p="${x.n}"><b><span class="zn">${x.n}</span> ${esc(x.nom)}</b><small>${n?n+(n>1?" fiches":" fiche"):"aucune fiche"}</small></button>`}).join("")}</div>`:""}
  <div class="zpanel" id="zpanel"></div></div>`;
}
function openPlan(n){
 const z=zones().find(x=>x.n==n);if(!z)return;
 const L=fiches().filter(f=>f.zones.includes(+n));
 $("#zpanel").innerHTML=`<h3>Zone ${n} · ${esc(z.nom)}</h3>`+(L.length?`<div class="list">${L.map(rowHTML).join("")}</div>`:`<div class="vide">Aucune fiche pour cette zone pour l’instant${S.ver?" (filtre « vérifiées seulement » actif)":""}.</div>`);
 $("#zpanel").scrollIntoView({behavior:"smooth",block:"nearest"});
}


/* ---------- accueil par situation ---------- */
const tail=f=>f.id.split("/commun/")[1].replace("guide/","");
function resolveTile(t){
 const all=fiches();
 if(t.cat)return all.filter(f=>f.cat===t.cat);
 const out=[];t.f.forEach(p=>all.filter(f=>tail(f).startsWith(p)).forEach(f=>{if(!out.includes(f))out.push(f)}));
 return out;
}
function sections(){
 const g=G();if(g.parcours)return g.parcours;
 return [{titre:"Par catégorie",tuiles:Object.keys(g.categories).map(c=>({t:g.categories[c],cat:c,sub:""}))}];
}
function homeHTML(){
 const g=G(),byId=id=>g.fiches.find(f=>f.id===id);
 const chips=(ids)=>ids.map(byId).filter(f=>f&&visible(f)).map(f=>`<button class="chip" data-fiche="${esc(f.id)}">${esc(f.titre)}</button>`).join("");
 const fv=chips(favs()),rc=chips(recs().filter(x=>!favs().includes(x)).slice(0,6));
 let h=`<p class="hint">Tapez un <b>code d'erreur</b> (ex. 71-530-00) ou décrivez le problème dans la barre du haut, ou choisissez ci-dessous.</p>`;
 if(fv)h+=`<section class="hs"><h2>★ Mes favoris</h2><div class="chips">${fv}</div></section>`;
 if(rc)h+=`<section class="hs"><h2>Consultées récemment</h2><div class="chips">${rc}</div></section>`;
 sections().forEach((s,si)=>{
  const tl=s.tuiles.map((t,ti)=>({t,ti,n:resolveTile(t).length})).filter(x=>x.n);
  if(!tl.length)return;
  h+=`<section class="hs"><h2>${esc(s.titre)}</h2><div class="tiles">${tl.map(x=>`<button class="tile" data-tile="${si},${x.ti}"><b>${esc(x.t.t)}</b>${x.t.sub?`<small>${esc(x.t.sub)}</small>`:`<small>${x.n>1?x.n+" fiches":"1 fiche"}</small>`}</button>`).join("")}</div></section>`;
 });
 return h;
}
function openTile(si,ti){
 const t=sections()[si].tuiles[ti],L=resolveTile(t);
 if(L.length===1){S.fiche=L[0].id;render();scrollTo(0,0);return}
 S.list={titre:t.t,ids:L.map(f=>f.id)};render();scrollTo(0,0);
}
function listPage(){
 const g=G();
 return `<button class="back" data-tab="home">← Accueil</button><h2 class="lt">${esc(S.list.titre)}</h2><div class="list">${S.list.ids.map(id=>g.fiches.find(f=>f.id===id)).filter(Boolean).map(f=>rowHTML(f)).join("")}</div>`;
}

/* ---------- fiches ---------- */
function rowHTML(f,snip){
 const cats=(G().categories||{});
 return `<button class="row" data-fiche="${esc(f.id)}"><b>${esc(f.titre)}</b><small><span class="tag ${f.verifie?"ok":"no"}">${f.verifie?"vérifiée":"à vérifier"}</span>${esc(cats[f.cat]||f.cat)}${f.modeles.includes("tous")?"":" · "+f.modeles.map(x=>x.toUpperCase()).join(", ")}</small>${snip?`<p>${snip}</p>`:""}</button>`;
}
function listHTML(){
 const g=G(),all=fiches();
 if(!g.fiches.length)return `<div class="vide"><b>Aucune fiche pour l’instant.</b><br>Envoyez-moi des documents et je les range ici.</div>`;
 const cats=[...new Set(all.map(f=>f.cat))],name=c=>(g.categories||{})[c]||c;
 if(!S.cat||!cats.includes(S.cat))return `<div class="tiles">${cats.map(c=>{const n=all.filter(f=>f.cat===c).length;return `<button class="tile" data-cat="${esc(c)}"><b>${esc(name(c))}</b><small>${n} fiche${n>1?"s":""}</small></button>`}).join("")||`<div class="vide">Aucune fiche avec ces filtres.</div>`}</div>`;
 return `<button class="back" data-cat="">← Catégories</button><h2 class="lt">${esc(name(S.cat))}</h2><div class="list">${all.filter(f=>f.cat===S.cat).map(f=>rowHTML(f)).join("")}</div>`;
}
function ficheHTML(id){
 const f=G().fiches.find(x=>x.id===id);if(!f)return "";touchRec(id);
 let h="",ul="",ol="",olN=0;
 const flush=()=>{if(ul){h+=`<ul>${ul}</ul>`;ul=""}if(ol){h+=`<ol start="${olN-ol.split("<li>").length+2}">${ol}</ol>`;ol=""}};
 f.blocks.forEach(b=>{
  if(b.t==="img"){if(ul)flush();h+=`</ol>`.slice(0,0);flush();h+=`<figure><img loading="lazy" src="${esc(b.src)}" alt="${esc(b.alt)}"><figcaption>${esc(b.alt)}</figcaption></figure>`;return}
  if(b.t==="li"){if(ol)flush();ul+=`<li>${inline(b.x)}</li>`;return}
  if(b.t==="step"){if(ul)flush();olN++;ol+=`<li>${inline(b.x)}</li>`;return}
  flush();if(b.t==="h")olN=0;
  if(b.t==="h")h+=`<h3>${esc(b.x)}</h3>`;else if(b.t==="warn")h+=`<div class="warn">${inline(b.x)}</div>`;else if(b.t==="note")h+=`<div class="note">${inline(b.x)}</div>`;else h+=`<p>${inline(b.x)}</p>`;
 });flush();
 const cats=G().categories||{};
 return `<button class="back" data-back>← Retour</button><article class="fiche"><h1>${esc(f.titre)}</h1><button class="star${favs().includes(id)?" on":""}" data-star="${esc(id)}">${favs().includes(id)?"★ Dans mes favoris":"☆ Ajouter aux favoris"}</button><div class="meta"><span class="tag ${f.verifie?"ok":"no"}">${f.verifie?"vérifiée":"à vérifier"}</span>${esc(cats[f.cat]||f.cat)} · ${f.modeles.includes("tous")?"tous les modèles":f.modeles.map(x=>x.toUpperCase()).join(", ")}${f.source?" · Source : "+esc(f.source):""}</div>${h}</article>`;
}
function modelesHTML(){
 const g=G(),ms=g.modeles;
 if(!ms.length)return `<div class="vide">Aucun modèle décrit pour cette gamme.</div>`;
 const keys=[];ms.forEach(m=>(m.caracteristiques||[]).forEach(([k])=>{if(!keys.includes(k))keys.push(k)}));
 return `${g.description?`<p>${esc(g.description)}</p>`:""}<div class="overflow"><table class="mt"><tr><th></th>${ms.map(m=>`<th>${esc(m.nom)}</th>`).join("")}</tr>${keys.map(k=>`<tr><td>${esc(k)}</td>${ms.map(m=>{const c=(m.caracteristiques||[]).find(x=>x[0]===k);return `<td>${c?esc(c[1]):"—"}</td>`}).join("")}</tr>`).join("")}</table></div>`;
}

/* ---------- recherche par mots-clés ---------- */
const SYN={bourrage:["coince","coincee","coinces","blocage","bloque","papier"],toner:["cartouche","poudre"],tambour:["photorecepteur","drum"],agrafe:["agrafeuse","agrafage","agrafes"],ecran:["panneau","tactile"],scanner:["numeriser","glace","vitre"],magasin:["bac","tiroir"],bac:["magasin","tiroir"],finisseur:["finition","module"]};
const stem=w=>w.length>4?w.replace(/(s|x)$/,""):w;
function tokens(q){return norm(q).split(/[^a-z0-9]+/).filter(w=>w.length>1).map(stem)}
function expand(t){return [t].concat(SYN[t]||[]).map(stem)}
function rank(q,pool0){
 const T=tokens(q);if(!T.length)return [];
 const pool=(pool0||fiches()).map(f=>({f,tt:norm(f.titre),tx:norm(f.texte)}));
 const score=(p,all)=>{let s=0,hit=0;T.forEach(t=>{const ex=expand(t);let h=0;ex.forEach((w,i)=>{if(p.tt.includes(w))h+=(i?2:6);const c=p.tx.split(w).length-1;if(c)h+=Math.min(c,4)*(i?.5:1)});if(h)hit++;s+=h});return (all&&hit<T.length)?0:s};
 let R=pool.map(p=>({p,s:score(p,true)})).filter(r=>r.s>0);
 if(!R.length)R=pool.map(p=>({p,s:score(p,false)})).filter(r=>r.s>0);
 return R.sort((a,b)=>b.s-a.s).map(r=>({f:r.p.f,s:r.s,p:r.p}));
}
const snipOf=(p,T)=>{const raw=p.f.texte,n=norm(raw);let i=-1;for(const t of T){i=n.indexOf(t);if(i>=0)break}if(i<0)return "";const a=Math.max(0,i-50);return esc((a?"… ":"")+raw.slice(a,a+170)+"…")};
/* ---------- code d'erreur ---------- */
function parseCode(q){
 const m=norm(q).replace(/^(code|erreur|incident|defaut|panne)\s*/,"").match(/^(\d{2,3})(?:[\s.\-_:]*(\d{3}))?(?:[\s.\-_:]*(\d{2}))?$/);
 if(!m)return null;
 const a=m[1].length===3?m[1].slice(1):m[1];
 return {fam:a,txt:[m[1],m[2],m[3]].filter(Boolean).join("-")};
}
function codeHTML(c){
 const g=G(),fam=(g.codes||[]).find(x=>x.p===c.fam);
 if(!fam)return `<div class="codecard"><h2>Code ${esc(c.txt)}</h2><p>Les deux chiffres « ${esc(c.fam)} » ne figurent pas dans la liste des familles de codes connue pour cette gamme. Voici la marche à suivre générale.</p><ol><li>Notez le code complet tel qu'affiché.</li><li>Redémarrez l'imprimante.</li><li>Si le code revient, contactez le service Xerox en lui donnant ce code.</li></ol></div>`;
 const all=fiches();
 const byZone=all.filter(f=>f.zones.some(z=>fam.zones.includes(z)));
 const byText=rank(fam.q).map(r=>r.f).filter(f=>!byZone.includes(f));
 const L=(byZone.length>=2?byZone.slice(0,5):byZone.concat(byText).slice(0,4));
 return `<div class="codecard"><h2>Code ${esc(c.txt)} · ${esc(fam.nom)}</h2><p>${esc(fam.sens)}</p>
 <h3>Que faire</h3><ol>${fam.conseil.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
 ${fam.zones.length?`<p>${fam.zones.map(z=>{const zz=zones().find(x=>x.n==z);return `<button class="zt" data-showzone="${z}">Voir sur le plan 3D : ${z} · ${esc(zz?zz.nom:"")}</button>`}).join(" ")}</p>`:""}
 <h3>Procédures conseillées</h3>${L.length?`<div class="list">${L.map(f=>rowHTML(f)).join("")}</div>`:`<div class="vide">Aucune fiche liée pour l'instant.</div>`}
 <p class="cmeta">La cause exacte de chaque code n'est pas dans la documentation disponible : seule la zone concernée (2 premiers chiffres) est connue.</p></div>`;
}
function searchHTML(q){
 const c=parseCode(q);if(c)return codeHTML(c);
 const T=tokens(q);if(!T.length)return "";
 const R=rank(q);
 if(!R.length)return `<div class="vide">Aucune fiche ne correspond à « ${esc(q)} ».${S.ver?"<br>Le filtre « vérifiées seulement » est actif.":""}<br>Cette information n’est peut-être pas encore dans la base.</div>`;
 return `<p style="color:var(--mute)">${R.length} résultat${R.length>1?"s":""} pour « ${esc(q)} »</p><div class="list">${R.slice(0,40).map(r=>rowHTML(r.f,snipOf(r.p,T))).join("")}</div>`;
}

/* ---------- événements ---------- */
let TM;
$("#q").addEventListener("input",e=>{clearTimeout(TM);TM=setTimeout(()=>{S.q=e.target.value.trim();S.fiche=null;S.list=null;render()},150)});
$("#marque").addEventListener("change",e=>{S.marque=e.target.value;S.gamme="";S.modele="";S.cat="";S.fiche=null;S.list=null;save();render()});
$("#gamme").addEventListener("change",e=>{S.gamme=e.target.value;S.modele="";S.cat="";S.fiche=null;S.list=null;save();render()});
$("#modele").addEventListener("change",e=>{S.modele=e.target.value;S.fiche=null;S.list=null;save();render()});
$("#ver").addEventListener("change",e=>{S.ver=e.target.checked;S.fiche=null;S.list=null;save();render()});
document.addEventListener("click",e=>{
 if(window.__dragged){window.__dragged=false;return}
 const t=e.target;
 const tl=t.closest("[data-tile]");if(tl){const [si,ti]=tl.dataset.tile.split(",").map(Number);return openTile(si,ti)}
 const st=t.closest("[data-star]");if(st){toggleFav(st.dataset.star);S.fiche=st.dataset.star;return render()}
 const tb=t.closest("[data-tab]");if(tb)return go(tb.dataset.tab);
 const ct=t.closest("[data-cat]");if(ct){S.cat=ct.dataset.cat;return render()}
 const fi=t.closest("[data-fiche]");if(fi){S.fiche=fi.dataset.fiche;render();return scrollTo(0,0)}
 if(t.closest("[data-back]")){S.fiche=null;return render()}
 const lid=t.closest("[data-lid]");if(lid){const st=lid.closest("[data-stage]"),o=st.classList.toggle("open");lid.textContent=o?"Fermer le capot du chargeur":"Ouvrir le capot du chargeur";return}
 const dr=t.closest("[data-door]");if(dr){const st=dr.closest("[data-stage]"),o=st.classList.toggle("open2");dr.textContent=o?"Fermer la porte avant":"Ouvrir la porte avant";return}
 const tr=t.closest("[data-trays]");if(tr){const st=tr.closest("[data-stage]"),o=st.classList.toggle("open3");tr.textContent=o?"Fermer les bacs":"Ouvrir les bacs";return}
 const vb=t.closest("[data-view]");if(vb)return setView(vb.closest("[data-stage]"),vb.dataset.view,true);
 const op=t.closest("[data-opt]");if(op)return optClick(op.closest(".zx").querySelector("[data-stage]"),op.dataset.opt);
 const sz=t.closest("[data-showzone]");if(sz){const n=sz.dataset.showzone;S.q="";$("#q").value="";S.fiche=null;S.tab="3d";save();render();const st=document.querySelector("[data-stage]");if(st&&st._gl)st._gl.setHz(+n);openPlan(n);return}
 const pl=t.closest("[data-p]");if(pl)return openPlan(pl.dataset.p);
});
function hotZone(e,on){
 const z=e.target.closest&&e.target.closest("[data-p]");if(!z)return;
 const root=z.closest(".zx");if(!root)return;
 const v=z.dataset.p;
 root.querySelectorAll('[data-p="'+v+'"]').forEach(x=>x.classList.toggle("hot",on));
 const stg=root.querySelector("[data-stage]");if(stg&&stg._gl)stg._gl.setHz(on?+v:0);
 const zz=zones().find(x=>x.n==v);
 const tip=root.querySelector(".ztip");if(tip)tip.textContent=on&&zz?v+" · "+zz.nom:"Survolez une zone";
}
document.addEventListener("mouseover",e=>hotZone(e,true));
document.addEventListener("mouseout",e=>hotZone(e,false));
render();
