/* Moteur 3D du site (WebGL maison, hors ligne, aucune bibliothèque).
   Ce fichier ne contient AUCUNE donnée de machine : chaque gamme décrit sa scène dans
   marques/<marque>/<gamme>/3d/scene.js (assemblé par construire.bat dans scenes.js). */
const SCENES={};
/* ====== Moteur 3D WebGL maison : fonctionne hors ligne, sans bibliothèque ====== */
const M4={
 id:()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),
 mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
 T(x,y,z){const m=M4.id();m[12]=x;m[13]=y;m[14]=z;return m},
 R(ax,deg){const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a),m=M4.id();
  if(ax==="x"){m[5]=c;m[6]=s;m[9]=-s;m[10]=c}else if(ax==="y"){m[0]=c;m[2]=-s;m[8]=s;m[10]=c}else{m[0]=c;m[1]=s;m[4]=-s;m[5]=c}return m},
 euler(r){return M4.mul(M4.R("z",r[2]||0),M4.mul(M4.R("y",r[1]||0),M4.R("x",r[0]||0)))},
 persp(f,asp,n,fa){const t=1/Math.tan(f/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(fa+n)/(n-fa);m[11]=-1;m[14]=2*fa*n/(n-fa);return m}
};
const V3={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],norm(a){const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]}};
function camLook(e,t){const z=V3.norm(V3.sub(e,t)),x=V3.norm(V3.cross([0,1,0],z)),y=V3.cross(z,x);
 return{m:new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,e),-V3.dot(y,e),-V3.dot(z,e),1]),x,y,z}}
/* boîte à angles arrondis (grille repliée sur une sphère aux coins) */
function rboxData(w,h,d,r){
 const hx=w/2,hy=h/2,hz=d/2;r=Math.max(.05,Math.min(r,hx*.98,hy*.98,hz*.98));
 const I=[hx-r,hy-r,hz-r],H=[hx,hy,hz];
 const nd=k=>{const a=[];[0,.4,.75,1].forEach(t=>a.push(-H[k]+r*t));[0,.25,.6,1].forEach(t=>a.push(I[k]+r*t));return a};
 const AX=[nd(0),nd(1),nd(2)],pos=[],uv=[],idx=[];
 [[0,1,2,1],[0,1,2,-1],[2,1,0,1],[2,1,0,-1],[0,2,1,1],[0,2,1,-1]].forEach(([a,b,c,sg])=>{
  const base=pos.length/6,A=AX[a],B=AX[b],na=A.length,nb=B.length;
  for(let j=0;j<nb;j++)for(let i=0;i<na;i++){
   const q=[0,0,0];q[a]=A[i];q[b]=B[j];q[c]=sg*H[c];
   const cl=[0,1,2].map(k=>Math.max(-I[k],Math.min(I[k],q[k])));
   const v=[q[0]-cl[0],q[1]-cl[1],q[2]-cl[2]],l=Math.hypot(v[0],v[1],v[2])||1,n=[v[0]/l,v[1]/l,v[2]/l];
   pos.push(cl[0]+n[0]*r,cl[1]+n[1]*r,cl[2]+n[2]*r,n[0],n[1],n[2]);
   uv.push((q[a]+H[a])/(2*H[a]),1-(q[b]+H[b])/(2*H[b]));
  }
  for(let j=0;j<nb-1;j++)for(let i=0;i<na-1;i++){const p0=base+j*na+i,p1=p0+1,p2=p0+na,p3=p2+1;idx.push(p0,p1,p3,p0,p3,p2)}
 });
 const nv=pos.length/6,vb=new Float32Array(nv*8);
 for(let i=0;i<nv;i++){vb.set(pos.slice(i*6,i*6+6),i*8);vb[i*8+6]=uv[i*2];vb[i*8+7]=uv[i*2+1]}
 for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2];
  const P=k=>[vb[k*8],vb[k*8+1],vb[k*8+2]],pa=P(a),e1=V3.sub(P(b),pa),e2=V3.sub(P(c),pa),g=V3.cross(e1,e2);
  if(V3.dot(g,[vb[a*8+3]+vb[b*8+3]+vb[c*8+3],vb[a*8+4]+vb[b*8+4]+vb[c*8+4],vb[a*8+5]+vb[b*8+5]+vb[c*8+5]])<0){idx[t+1]=c;idx[t+2]=b}}
 return{vb,ib:new Uint16Array(idx)};
}
const MAT={
 L:{c:[216,218,226],spec:.35,gloss:36},W:{c:[238,240,246],spec:.4,gloss:48},M:{c:[168,173,188],spec:.3,gloss:28},
 D:{c:[50,52,66],spec:.32,gloss:26},K:{c:[20,21,28],spec:.12,gloss:12},N:{c:[34,48,92],spec:.5,gloss:70},
 G:{c:[10,20,40],spec:1,gloss:160},S:{c:[255,255,255],tex:"ui",em:1,spec:.5,gloss:120},T:{c:[40,235,205],em:1},
 C:{c:[40,150,225],spec:.3,gloss:30},Mg:{c:[214,52,142],spec:.3,gloss:30},Y:{c:[246,208,44],spec:.3,gloss:30},
 O:{c:[240,128,34],spec:.3,gloss:30},P:{c:[250,250,252],spec:.05,gloss:8},X:{c:[196,201,212],spec:.9,gloss:90,metal:1}
};
function texUI(){
 const c=document.createElement("canvas");c.width=512;c.height=320;const x=c.getContext("2d");
 const g=x.createLinearGradient(0,0,0,320);g.addColorStop(0,"#1c2c58");g.addColorStop(1,"#0a1022");x.fillStyle=g;x.fillRect(0,0,512,320);
 x.fillStyle="#0c1430";x.fillRect(0,0,512,38);x.fillStyle="#eaf0ff";x.font="bold 19px sans-serif";x.fillText("Accueil",16,26);
 x.fillStyle="#7ee0ff";x.font="15px sans-serif";x.fillText("10:42",440,25);
 const T=[["Copie","#19c3e8"],["Courriel","#e0489a"],["Numériser","#f2b134"],["Fax","#8a6cff"],["Impression","#2ec27e"],["Dépannage","#ff6a4d"],["Travaux","#4aa3ff"],["Appareil","#9aa7c7"]];
 T.forEach((t,i)=>{const cx=16+(i%4)*122,cy=56+Math.floor(i/4)*126;
  x.fillStyle="#17264a";x.strokeStyle="#2c4278";x.lineWidth=2;x.beginPath();x.roundRect?x.roundRect(cx,cy,112,114,12):x.rect(cx,cy,112,114);x.fill();x.stroke();
  x.fillStyle=t[1];x.beginPath();x.arc(cx+56,cy+44,24,0,7);x.fill();x.fillStyle="rgba(255,255,255,.85)";x.beginPath();x.arc(cx+56,cy+44,10,0,7);x.fill();
  x.fillStyle="#e8eefc";x.font="bold 15px sans-serif";x.textAlign="center";x.fillText(t[0],cx+56,cy+98);x.textAlign="left"});
 x.fillStyle="#0c1430";x.fillRect(0,298,512,22);x.fillStyle="#2ec27e";x.beginPath();x.arc(14,309,5,0,7);x.fill();x.fillStyle="#9fb2d8";x.font="12px sans-serif";x.fillText("Prêt à imprimer",26,314);
 return c;
}
const VS=`attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;uniform mat4 uM,uVP,uSh;varying vec3 vP,vN;varying vec2 vU;
void main(){vec4 w=uM*vec4(aP,1.);vP=w.xyz;vN=(uM*vec4(aN,0.)).xyz;vU=aU;gl_Position=uVP*w;}`;
const FS=`precision mediump float;varying vec3 vP,vN;varying vec2 vU;uniform vec3 uEye,uCol;uniform float uSpec,uGloss,uMetal,uHot,uEm,uHasTex;uniform sampler2D uTex;
vec3 env(vec3 r){float h=r.y*.5+.5;vec3 c=mix(vec3(.09,.06,.15),vec3(.58,.62,.76),smoothstep(.15,.95,h));
 c+=vec3(1.,.96,.9)*smoothstep(.5,.88,dot(r,normalize(vec3(-.5,.8,.6))))*1.7;
 c+=vec3(.7,.82,1.)*smoothstep(.6,.92,dot(r,normalize(vec3(.8,.4,.3))))*1.0;
 c+=vec3(.95,.5,1.)*smoothstep(.7,.95,dot(r,normalize(vec3(.1,.3,-.9))))*.9;return c;}
void main(){
 vec3 N=normalize(vN),V=normalize(uEye-vP);vec3 base=uCol;if(uHasTex>.5)base=texture2D(uTex,vU).rgb;
 if(uEm>.5){vec3 R0=reflect(-V,N);float f0=pow(1.-max(dot(N,V),0.),3.);vec3 col=base*1.05+env(R0)*(.06+f0*.25)*uSpec;gl_FragColor=vec4(mix(col,vec3(1.,.3,.43),uHot*.45),1.);return;}
 vec3 L1=normalize(vec3(-.45,.85,.55)),L2=normalize(vec3(.8,.35,.4)),L3=normalize(vec3(.1,.4,-.9));
 float d1=max(dot(N,L1),0.),d2=max(dot(N,L2),0.),d3=max(dot(N,L3),0.);
 vec3 amb=mix(vec3(.2,.15,.3),vec3(.55,.58,.7),N.y*.5+.5);
 float ao=mix(.5,1.,smoothstep(0.,160.,vP.y));
 vec3 diff=base*(amb*ao+vec3(1.,.97,.92)*d1*.72+vec3(.55,.65,.95)*d2*.34+vec3(.85,.5,1.)*d3*.28);
 vec3 R=reflect(-V,N);float fr=pow(1.-max(dot(N,V),0.),4.);
 float sp=pow(max(dot(N,normalize(L1+V)),0.),uGloss)*uSpec;
 float rf=uSpec*(.18+fr*.7);vec3 e=env(R)*mix(vec3(1.),base*1.3,uMetal);
 vec3 col=diff*(1.-rf*(1.-uMetal*.6))+e*rf*.55+vec3(sp)*(.6+.4*uMetal);
 col=mix(col,vec3(1.,.28,.45),uHot*.5)+vec3(.1,.8,1.)*fr*uHot*.5;
 col=col/(1.+col*.12);gl_FragColor=vec4(pow(col,vec3(.92)),1.);}`;
const VSS=`attribute vec3 aP;uniform mat4 uM,uVP,uSh;void main(){gl_Position=uVP*uSh*uM*vec4(aP,1.);}`;
const FSS=`precision mediump float;uniform float uA;void main(){gl_FragColor=vec4(.02,0.,.06,uA);}`;
const VSF=`attribute vec3 aP;uniform mat4 uVP;varying vec3 vP;void main(){vP=aP;gl_Position=uVP*vec4(aP,1.);}`;
const FSF=`precision mediump float;varying vec3 vP;uniform float uR;
void main(){float r=length(vP.xz)/uR;vec3 c=mix(vec3(.17,.08,.32),vec3(.03,.01,.08),smoothstep(0.,1.,r));
 vec2 g=abs(fract(vP.xz/150.+.5)-.5)*150.;float l=1.-smoothstep(0.,1.6,min(g.x,g.y));c+=vec3(.45,.3,1.)*l*.28*(1.-smoothstep(.2,1.,r));
 gl_FragColor=vec4(c,1.-smoothstep(.7,1.,r));}`;
function mkS(){const S={parts:[],groups:{},labs:[],cur:null,has:{}};
 S.box=(z,x,y,zz,w,h,d,m,o)=>{o=o||{};S.parts.push({z,p:[x,y,zz],s:[w,h,d],m,r:o.r!=null?o.r:Math.min(7,Math.min(w,h,d)*.45),rot:o.rot,g:S.cur,hk:o.hk,vis:o.vis,hid:o.hid})};
 S.grp=(name,def,fn)=>{S.groups[name]=def;S.cur=name;fn();S.cur=null};
 S.lab=(n,x,y,z)=>S.labs.push({n,p:[x,y,z]});
 return S}
const ease=t=>t*t*(3-2*t);

var PROCS=window.PROCS||{};
function glStage(el){
 const cv=document.createElement("canvas");let gl=null;
 try{gl=cv.getContext("webgl",{antialias:true,stencil:true,alpha:true})}catch(e){}
 if(!gl)return false;
 const sc=el.querySelector(".sc");sc.innerHTML="";sc.classList.add("gl");sc.appendChild(cv);
 const mk=(vs,fs)=>{const p=gl.createProgram();[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(([t,s])=>{const h=gl.createShader(t);gl.shaderSource(h,s);gl.compileShader(h);if(!gl.getShaderParameter(h,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(h));gl.attachShader(p,h)});
  gl.bindAttribLocation(p,0,"aP");gl.bindAttribLocation(p,1,"aN");gl.bindAttribLocation(p,2,"aU");gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
  const u={};for(let i=0,n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name)}return{p,u}};
 let PM,PS,PF;try{PM=mk(VS,FS);PS=mk(VSS,FSS);PF=mk(VSF,FSF)}catch(e){console.warn("WebGL:",e);return false}
 const G={cv,gl,parts:[],groups:{},labs:[],labEls:[],hz:0,T:{},V:{},HL:null,A:{lid:0,door:0,trays:0},raf:0,tw:null,last:0,bnd:null,geo:new Map(),tex:{}};
 const getGeo=(w,h,d,r)=>{const k=[w,h,d,r].map(v=>Math.round(v*10)).join(",");let g=G.geo.get(k);if(g)return g;
  const o=rboxData(w,h,d,r),vb=gl.createBuffer(),ib=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,o.vb,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,o.ib,gl.STATIC_DRAW);
  g={vb,ib,n:o.ib.length};G.geo.set(k,g);return g};
 const getTex=n=>{if(G.tex[n])return G.tex[n];const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,n==="ui"?texUI():texUI());
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return G.tex[n]=t};
 const fq=gl.createBuffer();
 G.build=o=>{
  const S=mkS();SCENES[el.dataset.gen].build(S,o);
  if(G.curProc)G.stop();G.parts=S.parts;G.groups=S.groups;G.has=S.has;if(G.cons)G.cons.innerHTML=!Object.keys(PROCS).length?"":`<span class="mh">Remplacer un consommable :</span>`+Object.keys(PROCS).filter(k=>!PROCS[k].need||S.has[PROCS[k].need]).map(k=>`<button class="mod" data-cons="${k}"><i style="background:${PROCS[k].c};border-color:${PROCS[k].c}"></i>${esc(PROCS[k].l)}</button>`).join("");
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  S.parts.forEach(p=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],p.p[k]-p.s[k]/2);mx[k]=Math.max(mx[k],p.p[k]+p.s[k]/2)}});
  mn[1]=0;G.bnd={mn,mx};
  sc.querySelectorAll(".lb").forEach(l=>l.remove());G.labs=S.labs;
  G.labEls=S.labs.map(l=>{const d=document.createElement("div");d.className="lb";d.dataset.p=l.n;d.innerHTML=`<span>${l.n}</span>`;sc.appendChild(d);return d});
  G.kick()};
 const gmat=n=>{const d=G.groups[n],t=ease(G.A[d.k]||0);let m=M4.id();
  if(d.ang!=null)m=M4.mul(M4.T(d.p[0],d.p[1],d.p[2]),M4.mul(M4.R(d.ax,d.ang*t),M4.T(-d.p[0],-d.p[1],-d.p[2])));
  if(d.tr){const bs=d.base||[0,0,0];m=M4.mul(M4.T(bs[0]+d.tr[0]*t,bs[1]+d.tr[1]*t,bs[2]+d.tr[2]*t),m)}return m};
 const vis=p=>!((p.vis&&!G.V[p.vis])||(p.hid&&G.V[p.hid]));
 const model=(p,gm)=>{let m=M4.T(p.p[0],p.p[1],p.p[2]);if(p.rot)m=M4.mul(m,M4.euler(p.rot));return p.g?M4.mul(gm[p.g],m):m};
 const cam=()=>{const st=el._st,b=G.bnd,w=cv.clientWidth||600,h=cv.clientHeight||400,asp=w/h,fov=28*Math.PI/180;
  const az=st.ry*Math.PI/180,elv=Math.max(2,Math.min(88,-st.rx))*Math.PI/180;
  const bw=b.mx[0]-b.mn[0],bh=b.mx[1]-b.mn[1],bd=b.mx[2]-b.mn[2];
  const wa=bw*Math.abs(Math.cos(az))+bd*Math.abs(Math.sin(az)),ha=bh*Math.cos(elv)+(bd*Math.abs(Math.cos(az))+bw*Math.abs(Math.sin(az)))*Math.sin(elv);
  const tv=Math.tan(fov/2),dist=Math.max(ha*.56/tv,wa*.56/(tv*asp))*1.02/st.s+bd*.5;
  const tg=[(b.mn[0]+b.mx[0])/2,bh*.44,(b.mn[2]+b.mx[2])/2];
  const eye=[tg[0]-dist*Math.cos(elv)*Math.sin(az),tg[1]+dist*Math.sin(elv),tg[2]+dist*Math.cos(elv)*Math.cos(az)];
  const L=camLook(eye,tg),P=M4.persp(fov,asp,dist*.05,dist*8);return{eye,L,P,VP:M4.mul(P,L.m),w,h,asp,tv,dist,tg}};
 G.draw=fast=>{
  const w=cv.clientWidth,h=cv.clientHeight;if(!w||!h||!G.bnd)return;
  const dpr=Math.min(window.devicePixelRatio||1,2);
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
  gl.viewport(0,0,cv.width,cv.height);gl.clearColor(0,0,0,0);gl.clearStencil(0);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.BLEND);gl.disable(gl.STENCIL_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT|gl.STENCIL_BUFFER_BIT);
  const C=cam(),gm={};Object.keys(G.groups).forEach(n=>gm[n]=gmat(n));
  const ms=G.parts.map(p=>model(p,gm));
  // sol
  const FR=Math.max(G.bnd.mx[0]-G.bnd.mn[0],G.bnd.mx[2]-G.bnd.mn[2])*1.2;
  gl.useProgram(PF.p);gl.uniformMatrix4fv(PF.u.uVP,false,C.VP);gl.uniform1f(PF.u.uR,FR);
  gl.bindBuffer(gl.ARRAY_BUFFER,fq);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-FR,0,-FR,FR,0,-FR,FR,0,FR,-FR,0,-FR,FR,0,FR,-FR,0,FR]),gl.DYNAMIC_DRAW);
  gl.disableVertexAttribArray(1);gl.disableVertexAttribArray(2);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.drawArrays(gl.TRIANGLES,0,6);
  // ombres douces (plusieurs directions, pochoir contre le double noircissement)
  gl.useProgram(PS.p);gl.uniformMatrix4fv(PS.u.uVP,false,C.VP);gl.depthMask(false);gl.enable(gl.STENCIL_TEST);gl.stencilFunc(gl.EQUAL,0,255);gl.stencilOp(gl.KEEP,gl.KEEP,gl.INCR);
  gl.enableVertexAttribArray(0);
  const dirs=[[-.25,.95,.35],[-.1,.98,.2],[-.45,.88,.45],[-.05,1,.45],[-.4,.92,.1],[-.2,.97,.6],[-.55,.85,.3],[.05,1,.15],[-.3,.93,.25]];
  const sh=L=>new Float32Array([1,0,0,0,-L[0]/L[1],0,-L[2]/L[1],0,0,0,1,0,0,.6,0,1]);
  (fast?dirs.slice(0,3):dirs).forEach(L=>{gl.clear(gl.STENCIL_BUFFER_BIT);gl.uniformMatrix4fv(PS.u.uSh,false,sh(L));gl.uniform1f(PS.u.uA,fast?.22:.1);
   G.parts.forEach((p,i)=>{if(!vis(p))return;const g=getGeo(p.s[0],p.s[1],p.s[2],p.r);
    gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ib);
    gl.uniformMatrix4fv(PS.u.uM,false,ms[i]);gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0)})});
  gl.disable(gl.STENCIL_TEST);gl.disable(gl.BLEND);gl.depthMask(true);
  // pièces
  gl.useProgram(PM.p);gl.uniformMatrix4fv(PM.u.uVP,false,C.VP);gl.uniform3fv(PM.u.uEye,C.eye);gl.uniform1i(PM.u.uTex,0);
  gl.enableVertexAttribArray(0);gl.enableVertexAttribArray(1);gl.enableVertexAttribArray(2);
  G.parts.forEach((p,i)=>{if(!vis(p))return;const m=MAT[p.m]||MAT.L,g=getGeo(p.s[0],p.s[1],p.s[2],p.r);
   gl.bindBuffer(gl.ARRAY_BUFFER,g.vb);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,g.ib);
   gl.uniformMatrix4fv(PM.u.uM,false,ms[i]);gl.uniform3f(PM.u.uCol,m.c[0]/255,m.c[1]/255,m.c[2]/255);
   gl.uniform1f(PM.u.uSpec,m.spec||.2);gl.uniform1f(PM.u.uGloss,m.gloss||20);gl.uniform1f(PM.u.uMetal,m.metal||0);gl.uniform1f(PM.u.uEm,m.em?1:0);
   gl.uniform1f(PM.u.uHot,(p.z&&p.z===G.hz)||(p.hk&&p.hk===G.HL)?1:0);
   if(m.tex){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,getTex(m.tex));gl.uniform1f(PM.u.uHasTex,1)}else gl.uniform1f(PM.u.uHasTex,0);
   gl.drawElements(gl.TRIANGLES,g.n,gl.UNSIGNED_SHORT,0)});
  // pastilles numérotées
  G.labs.forEach((l,i)=>{const p=l.p,v=C.VP,x=v[0]*p[0]+v[4]*p[1]+v[8]*p[2]+v[12],y=v[1]*p[0]+v[5]*p[1]+v[9]*p[2]+v[13],ww=v[3]*p[0]+v[7]*p[1]+v[11]*p[2]+v[15],e=G.labEls[i];
   if(ww<=0){e.style.display="none";return}e.style.display="";e.style.transform=`translate(${((x/ww)*.5+.5)*C.w}px,${(1-((y/ww)*.5+.5))*C.h}px)`});
  G.C=C;G.ms=ms;
 };
 G.frame=t=>{
  G.raf=0;const dt=Math.min(.05,(t-(G.last||t))/1000);G.last=t;let busy=false;
  const cls={lid:el.classList.contains("open")?1:0,door:el.classList.contains("open2")?1:0,trays:el.classList.contains("open3")?1:0},tg={};
  Object.keys(cls).concat(Object.keys(G.T),Object.keys(G.A)).forEach(k=>{tg[k]=G.T[k]!=null?G.T[k]:(cls[k]||0)});
  for(const k in tg){const a=G.A[k]||0;if(a!==tg[k]){const s=Math.sign(tg[k]-a)*dt/.85;G.A[k]=Math.abs(tg[k]-a)<=Math.abs(s)?tg[k]:a+s;busy=true}}
  if(G.tw){const q=Math.min(1,(t-G.tw.t0)/600),e=ease(q),s=el._st;s.rx=G.tw.a[0]+(G.tw.b[0]-G.tw.a[0])*e;s.ry=G.tw.a[1]+(G.tw.b[1]-G.tw.a[1])*e;s.s=G.tw.a[2]+(G.tw.b[2]-G.tw.a[2])*e;if(q>=1)G.tw=null;else busy=true}
  G.busyNow=busy;G.draw(busy);if(busy)G.kick(true);
 };
 G.kick=again=>{if(!G.raf)G.raf=requestAnimationFrame(G.frame);if(!again)G.last=0};
 G.tween=(rx,ry,z)=>{const s=el._st;G.tw={a:[s.rx,s.ry,s.s],b:[rx,ry,z==null?s.s:z],t0:performance.now()};G.kick()};
 G.setHz=n=>{if(G.hz!==n){G.hz=n;G.kick()}};
 // sélection à la souris
 const pick=(cx,cy)=>{if(!G.C)return 0;const r=cv.getBoundingClientRect(),C=G.C,nx=((cx-r.left)/r.width)*2-1,ny=1-((cy-r.top)/r.height)*2;
  const dir=V3.norm([C.L.z[0]*-1+C.L.x[0]*nx*C.tv*C.asp+C.L.y[0]*ny*C.tv,-C.L.z[1]+C.L.x[1]*nx*C.tv*C.asp+C.L.y[1]*ny*C.tv,-C.L.z[2]+C.L.x[2]*nx*C.tv*C.asp+C.L.y[2]*ny*C.tv]);
  let best=0,bt=1e12;
  G.parts.forEach((p,i)=>{if(!p.z||!vis(p))return;const m=G.ms[i];
   const R=[[m[0],m[4],m[8]],[m[1],m[5],m[9]],[m[2],m[6],m[10]]],t=[m[12],m[13],m[14]];
   const rel=V3.sub(C.eye,t),o=[R[0][0]*rel[0]+R[1][0]*rel[1]+R[2][0]*rel[2],R[0][1]*rel[0]+R[1][1]*rel[1]+R[2][1]*rel[2],R[0][2]*rel[0]+R[1][2]*rel[1]+R[2][2]*rel[2]];
   const d=[R[0][0]*dir[0]+R[1][0]*dir[1]+R[2][0]*dir[2],R[0][1]*dir[0]+R[1][1]*dir[1]+R[2][1]*dir[2],R[0][2]*dir[0]+R[1][2]*dir[1]+R[2][2]*dir[2]];
   let t0=-1e12,t1=1e12;
   for(let k=0;k<3;k++){const h=p.s[k]/2;if(Math.abs(d[k])<1e-9){if(o[k]<-h||o[k]>h){t0=1e13;break}}else{let a=(-h-o[k])/d[k],b=(h-o[k])/d[k];if(a>b){const q=a;a=b;b=q}t0=Math.max(t0,a);t1=Math.min(t1,b)}}
   if(t0<=t1&&t1>0&&t0<bt){bt=t0;best=p.z}});
  return best};
 G.pick=pick;let pk=0;
 cv.addEventListener("pointermove",e=>{if(e.buttons)return;if(pk)return;pk=requestAnimationFrame(()=>{pk=0;const z=pick(e.clientX,e.clientY);if(z!==G.hz)G.hover(z)})});
 cv.addEventListener("pointerleave",()=>G.hover(0));
 cv.addEventListener("click",e=>{if(window.__dragged)return;const z=pick(e.clientX,e.clientY);if(z)openPlan(z)});
 G.hover=n=>{G.setHz(n);cv.style.cursor=n?"pointer":"";const root=el.closest(".zx");if(!root)return;
  root.querySelectorAll("[data-p]").forEach(x=>x.classList.toggle("hot",!!n&&+x.dataset.p===n));
  const tip=root.querySelector(".ztip"),pl=curPlan()[n-1];if(tip)tip.textContent=n&&pl?pl.t:"Survolez une zone"};

 const ov=document.createElement("div");ov.className="proc";ov.hidden=true;el.appendChild(ov);
 const pane=el.parentElement,mods=pane&&pane.querySelector(".mods");let cons=pane&&pane.querySelector(".cons");
 if(!cons&&mods){cons=document.createElement("div");cons.className="cons";mods.insertAdjacentElement("afterend",cons)}
 G.cons=cons;G.curProc=null;
 const upd=()=>{const p=G.curProc;if(!p){ov.hidden=true;return}ov.hidden=false;const P=p.P,n=P.steps.length;
  ov.innerHTML=p.done?`<div class="pt"><b>${esc(P.t)}</b><span class="pn">Terminé</span></div><p>✔ Remplacement terminé. Rien d’autre à faire sur la machine.</p><div class="pb"><button data-pp="replay">↻ Rejouer</button><button data-pp="fiche">Voir la fiche</button><button data-pp="x">Fermer</button></div>`:
  `<div class="pt"><b>${esc(P.t)}</b><span class="pn">Étape ${p.i+1} / ${n}</span></div><p>${esc(P.steps[p.i].t)}</p><div class="pb"><button data-pp="prev">◀ Précédent</button><button data-pp="play">${p.auto?"❚❚ Pause":"▶ Lecture"}</button><button data-pp="next">Suivant ▶</button><button data-pp="fiche">Voir la fiche</button><button data-pp="x">✕</button></div><small>Gestes indicatifs : suivez la fiche officielle pour les détails de votre modèle.</small>`};
 G.apply=i=>{const P=G.curProc.P,T={},V={};let HL=null,cam=null;
  for(let j=0;j<=i;j++){const st=P.steps[j];Object.assign(T,st.T||{});Object.assign(V,st.V||{});if("HL" in st)HL=st.HL;if(st.cam)cam=st.cam}
  G.T=T;G.V=V;G.HL=HL;return cam};
 G.clear=()=>{clearTimeout(G.tm);G.T={};G.V={};G.HL=null;Object.keys(G.A).forEach(k=>{if(k!=="lid"&&k!=="door"&&k!=="trays")G.A[k]=0});G.kick()};
 G.stop=()=>{G.curProc=null;el.classList.remove("procon");G.clear();upd()};
 G.go=i=>{const p=G.curProc;if(!p)return;clearTimeout(G.tm);
  if(i>=p.P.steps.length){p.done=true;G.clear();upd();return}
  i=Math.max(0,i);p.i=i;p.done=false;const cam=G.apply(i);if(cam)G.tween(cam[0],cam[1],cam[2]);upd();G.kick();if(p.auto)G.wait()};
 G.wait=()=>{clearTimeout(G.tm);G.tm=setTimeout(function w(){const p=G.curProc;if(!p||!p.auto||p.done)return;if(G.busyNow||G.tw){G.tm=setTimeout(w,250);return}G.tm=setTimeout(()=>{if(G.curProc===p&&p.auto)G.go(p.i+1)},1300)},500)};
 G.run=id=>{const P=PROCS[id];if(!P)return;G.stop();G.curProc={id,P,i:0,auto:true,done:false};el.classList.add("procon");G.go(0)};
 ov.addEventListener("click",e=>{const b=e.target.closest("[data-pp]");const p=G.curProc;if(!b||!p)return;const a=b.dataset.pp;
  if(a==="x")G.stop();else if(a==="fiche"){const q=p.P.q;$("#q").value=q;search(q)}
  else if(a==="prev"){p.auto=false;G.go(p.i-1)}else if(a==="next"){p.auto=false;G.go(p.i+1)}
  else if(a==="play"){p.auto=!p.auto;upd();if(p.auto)G.wait()}else if(a==="replay")G.run(p.id)});
 if(cons)cons.addEventListener("click",e=>{const b=e.target.closest("[data-cons]");if(b)G.run(b.dataset.cons)});
 if(window.ResizeObserver)new ResizeObserver(()=>G.kick()).observe(el);
 new MutationObserver(()=>G.kick()).observe(el,{attributes:true,attributeFilter:["class"]});
 el._gl=G;G.build(el._opt);return true;
}
/* ====== scènes 3D (mm réels) : un seul squelette, deux jeux de dimensions ====== */
function glCart(S,key,pull,from,fn){
 S.grp(key,{k:key,tr:pull},()=>fn({hk:key,hid:"hide_"+key}));
 S.grp("nw_"+key,{k:"nw_"+key,base:from,tr:from.map(v=>-v)},()=>fn({hk:key,vis:"nw_"+key}));
}
function glDoorB(S,P){
 const b=S.box,{W,D,wh,baseH,z}=P,x=-W/2,y=wh+baseH*.55,ob=(r,q)=>Object.assign({r},q);
 b(0,x-.2,y,0,.8,baseH*.6,D*.7,"D",{r:.3});
 S.grp("doorB",{k:"doorB",p:[x-1,0,D*.35],ax:"y",ang:100},()=>{b(z,x-1,y,0,4,baseH*.6,D*.7,"W",{r:2});b(z,x-3,wh+baseH*.66,D*.26,4,baseH*.14,12,"D",{r:2})});
 glCart(S,"btr",[-200,0,0],[-270,60,0],q=>{b(0,x+95,wh+baseH*.62,0,170,30,300,"K",ob(6,q));b(0,x+8,wh+baseH*.62,0,12,28,110,"O",ob(4,q))});
 glCart(S,"cleaner",[-200,0,0],[-270,60,0],q=>{b(0,x+95,wh+baseH*.34,0,170,36,300,"M",ob(6,q));b(0,x+8,wh+baseH*.34,0,12,30,110,"O",ob(4,q))});
}
function glEngine(S,P){
 const b=S.box,{W,D,y0,h,z}=P,fz=D/2,cH=h-30,cy=y0+10+cH/2;
 b(0,-W*.485,y0+h/2,0,W*.03,h,D,"L",{r:6});b(0,W*.485,y0+h/2,0,W*.03,h,D,"L",{r:6});
 b(0,0,y0+5,0,W,10,D,"L",{r:4});b(0,0,y0+h-10,0,W,20,D,"L",{r:4});
 b(0,0,cy,fz-375,W*.94,cH,20,"M",{r:2});
 const ty=y0+h-70,tz=fz-190,ob=(r,q)=>Object.assign({r},q);
 [["K","K",-.31],["C","C",-.14],["Mg","Mg",.03],["Y","Y",.2]].forEach(([c,m,fx])=>glCart(S,"tn_"+c,[0,0,340],[0,90,440],q=>{b(0,fx*W,ty,tz,W*.15,64,300,m,ob(12,q));b(0,fx*W,ty,tz+156,W*.09,34,18,"O",ob(6,q))}));
 glCart(S,"drum",[0,0,340],[0,80,440],q=>{b(0,0,y0+100,fz-200,W*.78,58,290,"K",ob(10,q));b(0,-W*.3,y0+100,fz-52,W*.1,30,16,"O",ob(5,q))});
 glCart(S,"waste",[0,0,300],[0,60,420],q=>{b(0,W*.27,y0+38,fz-140,W*.3,40,230,"D",ob(8,q));b(0,W*.27,y0+38,fz-20,W*.14,22,14,"O",ob(5,q))});
 S.grp("door",{k:"door",p:[0,y0+10,fz+2],ax:"x",ang:82},()=>{
  b(z,0,y0+10+cH/2,fz+2,W*.94,cH,8,"L",{r:6});
  b(z,0,y0+10+cH*.62,fz+7,W*.13,24,4,"K",{r:6});b(z,0,y0+10+cH*.62,fz+9.5,W*.09,6,2,"W",{r:2});
  b(z,0,y0+10+cH*.05,fz+5,W*.94,12,4,"M",{r:3});
  b(z,0,y0+10+cH/2,fz-2.5,W*.9,cH*.92,2,"M",{r:2});
 });
}
function glTrays(S,P){
 const b=S.box,{W,D,wh,rows,z}=P,fz=D/2;let acc=wh+8;
 S.grp("tray",{k:"trays",tr:[0,0,D*.5]},()=>{
  rows.forEach(r=>{const rh=r[0],y=acc+rh/2;acc+=rh;
   (r[1]?[[-.2,.57],[.29,.36]]:[[0,1]]).forEach(([cx,q])=>{const w=r[1]?W*q:W-26,xx=cx*W;
    b(z,xx,y,fz+1,w,rh-6,12,"W",{r:5});
    b(z,xx,y+rh*.12,fz+7.5,Math.min(w*.34,220),Math.min(rh*.22,20),3,"K",{r:5});
    b(z,xx-w*.4,y-rh*.14,fz+7.5,Math.min(60,w*.12),Math.min(rh*.2,18),2,"M",{r:2});
    b(z,xx,y-rh*.2,fz-D*.37,w-14,rh*.5,D*.74,"M",{r:6});
    b(z,xx,y+rh*.05,fz-D*.37,w-30,rh*.12,D*.7,"P",{r:2})})});
 });
 let a=wh+8;b(0,0,a,fz+3,W-8,4,4,"K",{r:1.5});rows.forEach(r=>{a+=r[0];b(0,0,a-3,fz+3,W-8,4,4,"K",{r:1.5})});
}
function glTop(S,P){
 const b=S.box,{W,D,scanY,scanH,dadfH,px,scanMat,zn}=P,fz=D/2,topY=scanY+scanH;
 b(0,0,scanY+scanH/2,0,W,scanH,D,scanMat,{r:8});
 b(zn.glass,0,topY+1.2,0,W*.8,2.4,D*.72,"G",{r:1.2});
 b(zn.panel,px,topY-8,fz-36,W*.36,24,104,"N",{r:8});b(0,W*.22,scanY+scanH/2,fz-12,W*.56,scanH-6,28,"N",{r:5});
 const ang=-62,ny=Math.sin(-ang*Math.PI/180),nz=Math.cos(ang*Math.PI/180),pc=[px,topY+70,fz-40];
 b(zn.panel,pc[0],pc[1],pc[2],290,172,14,"D",{r:8,rot:[ang,0,0]});
 b(zn.panel,pc[0],pc[1]+ny*8.5,pc[2]+nz*8.5,258,150,2,"S",{r:1,rot:[ang,0,0]});
 b(zn.pwr,-W*.37,topY-8,fz-2,26,26,12,"T",{r:8});
 const pv=-D*.36;
 S.grp("lid",{k:"lid",p:[0,topY,pv],ax:"x",ang:-64},()=>{
  const z=zn.dadf,hy=topY+dadfH*.62;
  b(z,0,topY+dadfH*.31,0,W*.99,dadfH*.62,D*.72,"W",{r:14});
  b(z,0,hy-3,0,W*.9,4,D*.66,"M",{r:2});
  b(z,-W*.1,hy+10,D*.12,W*.5,8,D*.4,"M",{r:3,rot:[8,0,0]});
  [-1,1].forEach(q=>b(z,-W*.1+q*W*.24,hy+22,D*.12,6,22,D*.36,"D",{r:3}));
  b(z,-W*.1,topY+dadfH*.86,-D*.08,W*.5,dadfH*.2,10,"N",{r:4});
  b(z,W*.27,topY+dadfH*.5,D*.05,W*.3,dadfH*.2,D*.46,"L",{r:6});
 });
}
function glFinUnit(S,z,x0,w,h,D,main){
 const b=S.box,cx=x0+w/2,fz=D*.47;
 b(z,cx,h/2,0,w,h,D*.94,"L",{r:9});
 if(main){S.has.stp=1;
  b(0,cx,h*.42,fz+.4,w*.8,h*.5,1,"D",{r:.3});
  S.grp("fdoor",{k:"fdoor",p:[cx-w*.4,h*.42,fz+1],ax:"y",ang:-100},()=>{b(z,cx,h*.42,fz+1,w*.8,h*.5,4,"M",{r:3});b(z,cx-w*.3,h*.5,fz+5,w*.05,h*.14,5,"D",{r:2})});
  glCart(S,"stp",[0,0,170],[0,50,200],q=>{b(0,cx+w*.12,h*.4,fz-88,w*.34,60,160,"W",Object.assign({r:6},q));b(0,cx+w*.12,h*.4,fz-6,w*.2,30,16,"O",Object.assign({r:5},q))});
 }else{b(z,cx,h*.42,fz+1,w*.8,h*.5,4,"M",{r:3});b(z,cx-w*.3,h*.5,fz+5,w*.05,h*.14,5,"D",{r:2})}
 b(z,cx,h*.1,fz+2,w*.7,h*.07,5,"K",{r:3});
 b(z,cx,h+4,0,w*.9,8,D*.7,"M",{r:3});
 [-.3,.3].forEach(q=>b(z,cx+q*w,22,D*.34,36,44,36,"K",{r:14}));
}

/* ---------- vue 3D : états, souris, boutons ---------- */
const VIEWS={defaut:[-16,34],face:[-8,0],gauche:[-10,80],droite:[-10,-80],dessus:[-72,20]};
function stage3dHTML(key){
 const S=SCENES[key];if(!S)return `<div class="vide">Le plan 3D de cette gamme n’est pas encore disponible.</div>`;
 return `<div class="stage" data-stage data-gen="${key}"><div class="sc"></div><div class="sctl"><button data-view="defaut">Vue d’ensemble</button><button data-view="face">Face</button><button data-view="gauche">Côté gauche</button><button data-view="droite">Côté droit</button><button data-view="dessus">Dessus</button><button data-lid>Ouvrir le capot du chargeur</button><button data-door>Ouvrir la porte avant</button><button data-trays>Ouvrir les bacs</button><em>Glissez pour tourner · molette pour zoomer</em></div></div><div class="mods">${S.mods(S.options())}</div><div class="cons"></div>`;
}
function applyStage(el){if(el._gl)el._gl.kick()}
function setView(el,name,anim){const v=VIEWS[name];if(el._gl&&anim){el._gl.tween(v[0],v[1]);return}el._st.rx=v[0];el._st.ry=v[1];applyStage(el)}
function redrawStage(st){
 const S=SCENES[st.dataset.gen];if(st._gl)st._gl.build(st._opt);
 st.parentElement.querySelector(".mods").innerHTML=S.mods(st._opt);
}
function optClick(st,k){SCENES[st.dataset.gen].click(st._opt,k);redrawStage(st)}
function initStages(root){
 (root||document).querySelectorAll("[data-stage]").forEach(el=>{
  if(el._st)return;
  const S=SCENES[el.dataset.gen];if(!S)return;
  el._st={rx:0,ry:0,s:1};el._opt=S.options();setView(el,"defaut",false);
  let ok=false;try{ok=glStage(el)}catch(e){console.warn(e)}
  if(!ok){el.innerHTML=`<div class="vide">Ce navigateur ne peut pas afficher la 3D (WebGL indisponible).</div>`;return}
  let d=null;
  el.addEventListener("pointerdown",e=>{if(e.target.closest("button,.proc"))return;d={x:e.clientX,y:e.clientY,rx:el._st.rx,ry:el._st.ry,m:false};window.__dragged=false});
  el.addEventListener("pointermove",e=>{if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;
   if(!d.m&&Math.abs(dx)+Math.abs(dy)<6)return;d.m=true;window.__dragged=true;
   el._st.ry=d.ry+dx*.45;el._st.rx=Math.max(-90,Math.min(10,d.rx-dy*.35));applyStage(el)});
  const end=()=>{d=null};el.addEventListener("pointerup",end);el.addEventListener("pointerleave",end);el.addEventListener("pointercancel",end);
  el.addEventListener("wheel",e=>{e.preventDefault();el._st.s=Math.max(.6,Math.min(1.8,el._st.s*(e.deltaY<0?1.08:.93)));applyStage(el)},{passive:false});
 });
}
