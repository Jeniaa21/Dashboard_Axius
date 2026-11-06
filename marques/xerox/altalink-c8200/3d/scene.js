/* Scène 3D : Xerox AltaLink C8200 (C8230 · C8235 · C8245 · C8255 · C8270)
   Dimensions en millimètres, d'après les photos de référence et le configurateur Xerox.
   Pour changer la forme de la machine, c'est ici et nulle part ailleurs. */
(function(){
function glSides(S,P){
 const b=S.box,{W,D,wh,baseH,doorY,doorH,recY}=P,xr=W/2+.6,zr=-D/2-.6,t=1.6,yc=doorY+doorH*.15,h=330,w=D*.56;
 [h/2,-h/2].forEach(dy=>b(0,xr,yc+dy,D*.04,t,t,w,"K",{r:.5}));
 [-w/2,w/2].forEach(dz=>b(0,xr,yc,dz+D*.04,t,h,t,"K",{r:.5}));
 b(0,xr,yc+h/2-40,D*.04+w*.34,t,26,70,"D",{r:3});
 [-1,1].forEach(q=>b(0,xr,recY+60,D*.04+q*40,t,40,50,"D",{r:2}));
 [wh+baseH*.2,wh+baseH*.7].forEach(y=>b(0,xr,y,0,t,t,D*.62,"K",{r:.5}));[-1,1].forEach(q=>b(0,xr,wh+baseH*.45,q*D*.31,t,baseH*.5+t,t,"K",{r:.5}));
 [[-W*.3,doorY+doorH*.55,W*.2,150],[W*.12,recY+20,W*.2,110]].forEach(([x,y,ww,hh])=>b(0,x,y,zr,ww,hh,t,"D",{r:3}));
 b(0,-W*.33,wh+baseH*.55,zr,70,60,t*2,"K",{r:4});b(0,W*.05,doorY+doorH*.6,zr,W*.3,doorH*.8,t,"M",{r:4});
}
function gl82(S,o){
 const b=S.box,lb=S.lab,W=620,D=o.m70?793:723,GAP=14,wh=25,baseH=355,doorH=270,recH=185,scanH=105,dadfH=190+(o.m70?39:0);
 const fz=D/2,doorY=wh+baseH,recY=doorY+doorH,scanY=recY+recH,topY=scanY+scanH,x0m=-W/2;
 const fin=o.fin,TRW=fin===1?190:0,TRH=960,F=fin===1?585:fin===2?587:0,FH=fin===1?1000:fin===2?860:0;
 const BK=fin&&o.booklet?(fin===1?101:150):0,CZ=fin===1&&o.cz?136:0,HW=476,HH=433;
 [[-.4,-.38],[.4,-.38],[-.4,.38],[.4,.38]].forEach(q=>b(0,q[0]*W,12,q[1]*D,36,24,36,"K",{r:11}));
 b(0,0,wh+baseH/2,0,W,baseH,D,"L",{r:12});
 const rows=o.tandem?[[150,2],[97],[97]]:[[86],[86],[86],[86]];
 glTrays(S,{W,D,wh,rows,z:6});
 glDoorB(S,{W,D,wh,baseH,z:9});
 glEngine(S,{W,D,y0:doorY,h:doorH,z:5});
 glSides(S,{W,D,wh,baseH,doorY,doorH,recY});
 b(0,W*.135,recY+recH/2,-D/2+12,W*.73,recH,20,"N",{r:3});b(0,W/2-8,recY+recH/2,0,16,recH,D,"L",{r:3});b(0,W/2-17,recY+recH/2,0,2,recH-6,D-30,"N",{r:1});[[58,-6],[112,-9]].forEach(([y,a])=>b(0,W*.16,recY+y,-D*.02,W*.52,5,D*.62,"D",{r:2,rot:[-a*-.6,0,0]}));
 b(8,x0m+W*.135,recY+116,0,W*.27,232,D,"L",{r:9});b(8,x0m+W*.135,recY+120,fz+3,12,112,4,"K",{r:3});b(8,x0m+W*.135,recY+226,fz+3,W*.27,4,4,"M",{r:1});
 glTop(S,{W,D,scanY,scanH,dadfH,px:W*.2,scanMat:"L",zn:{glass:2,panel:3,pwr:4,dadf:1}});
 const by=recY+120;
 b(7,x0m-150,by,0,300,8,D*.5,"W",{r:3});b(7,x0m-150,by+10,-D*.25,300,12,4,"M",{r:2});b(7,x0m-150,by+10,D*.25,300,12,4,"M",{r:2});
 b(7,x0m-4,by+12,0,8,26,D*.5,"D",{r:3});b(7,x0m-330,by+14,0,150,5,D*.28,"M",{r:2,rot:[0,0,-8]});
 if(o.left===0){b(10,x0m-100,topY-125,0,199,8,D*.46,"W",{r:3,rot:[0,0,-12]});b(10,x0m-196,topY-98,0,6,34,D*.46,"M",{r:2});lb(10,x0m-100,topY-55,D*.2)}
 else if(o.left===1){b(10,x0m-170,topY-30,0,340,14,D*.6,"W",{r:5});b(10,x0m-130,topY+8,0,100,70,110,"W",{r:8});b(10,x0m-130,topY+14,56,60,26,3,"D",{r:2});lb(10,x0m-170,topY+60,D*.2)}
 if(o.hcf){const x=x0m-GAP-HW/2,zc=fz-309;
  b(12,x,HH/2,zc,HW,HH,618,"L",{r:10});b(12,x,HH+3,zc,HW,6,618,"M",{r:3});
  b(12,x,HH*.4,zc-60,HW*.86,HH*.7,480,"M",{r:6});b(12,x,HH*.62,zc-60,HW*.8,HH*.2,460,"P",{r:2});
  S.grp("hcf",{k:"trays",p:[x-HW/2,0,fz+2],ax:"y",ang:-105},()=>{b(12,x-HW*.05,HH*.46,fz+3,HW*.9,HH*.88,6,"W",{r:5});b(12,x+HW*.36,HH*.46,fz+8,10,70,6,"D",{r:3})});
  b(12,x0m-GAP/2,HH*.7,0,GAP+6,30,D*.4,"D",{r:3});lb(12,x,HH+60,fz+30)}
 let l11=null;
 if(fin){let x0=W/2+GAP;
  if(TRW){b(11,W/2+GAP/2,doorY+doorH*.55,0,GAP+6,70,D*.5,"D",{r:3});glFinUnit(S,11,x0,TRW,TRH,D);x0+=TRW+GAP}
  glFinUnit(S,11,x0,F,FH,D,true);l11=[x0+F/2,FH*.78,fz+60];let end=x0+F;
  if(BK){x0=end+GAP;const bh=FH*.72;glFinUnit(S,13,x0,BK,bh,D);b(13,x0-GAP/2,bh*.55,0,GAP+4,40,D*.4,"D",{r:3});lb(13,x0+BK/2,bh*.7,fz+60);end=x0+BK}
  if(CZ){x0=end+GAP;const ch=FH*.85;glFinUnit(S,14,x0,CZ,ch,D);b(14,x0-GAP/2,ch*.5,0,GAP+4,40,D*.4,"D",{r:3});lb(14,x0+CZ/2,ch*.8,fz+60);end=x0+CZ}
  (fin===1?[.88,.64,.4]:[.45]).forEach(f=>{b(11,end+118,FH*f,0,250,6,D*.5,"M",{r:2,rot:[0,0,15]});b(11,end+236,FH*f+36,0,5,50,D*.5,"D",{r:2})})}
 lb(1,W*.2,topY+dadfH+70,D*.3);lb(2,-W*.34,topY+60,fz-70);lb(3,W*.1,topY+170,fz-20);lb(4,-W*.37,topY+50,fz+40);
 lb(5,0,doorY+doorH*.55,fz+70);lb(6,0,wh+baseH*.55,fz+70);lb(7,x0m-150,by+60,D*.26);lb(8,x0m-60,recY+160,D*.3);lb(9,x0m-60,wh+baseH*.75,D*.3);
 if(l11)lb(11,l11[0],l11[1],l11[2]);
}

const MODS82={fin:["Aucune finition","Finisseur Business Ready","Finisseur Office"],left:["Finisseur Office intégré (bac 500 feuilles)","Plan de travail + agrafeuse","Côté gauche libre"]};
SCENES["xerox/altalink-c8200"]={
 options:()=>({fin:0,left:1,tandem:true,hcf:false,booklet:false,cz:false,m70:false}),
 build:gl82,
 mods(o){
  const c=[`<button class="mod on" data-opt="fin"><i></i>Finition : ${MODS82.fin[o.fin]} ↻</button>`,`<button class="mod on" data-opt="left"><i></i>${MODS82.left[o.left]} ↻</button>`,
   `<button class="mod${o.m70?" on":""}" data-opt="m70"><i></i>Châssis C8270 (plus haut et plus profond)</button>`,`<button class="mod${o.tandem?" on":""}" data-opt="tandem"><i></i>Bacs 3 et 4 tandem</button>`,`<button class="mod${o.hcf?" on":""}" data-opt="hcf"><i></i>Bac grande capacité</button>`];
  if(o.fin)c.push(`<button class="mod${o.booklet?" on":""}" data-opt="booklet"><i></i>Module livret</button>`);
  if(o.fin===1)c.push(`<button class="mod${o.cz?" on":""}" data-opt="cz"><i></i>Module de pliage C/Z</button>`);
  return `<span class="mh">Modules :</span>`+c.join("");
 },
 click(o,k){
  if(k==="fin"){o.fin=(o.fin+1)%3;if(!o.fin){o.booklet=false;o.cz=false}else if(o.fin!==1)o.cz=false}
  else if(k==="left")o.left=(o.left+1)%3;else o[k]=!o[k];
 }
};
})();
