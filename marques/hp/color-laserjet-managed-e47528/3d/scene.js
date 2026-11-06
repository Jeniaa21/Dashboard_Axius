/* Scène 3D : HP Color LaserJet Managed MFP E47528f (A4, 415 × 472 × 400 mm)
   Proportions tirées des dimensions de la fiche HP : à affiner avec des photos de référence. */
(function(){
function glHp(S,o){
 const b=S.box,lb=S.lab,W=415,D=472,wh=14,fz=D/2;
 const rows=o.tray3?[[130],[100]]:[[100]];
 const trH=rows.reduce((a,r)=>a+r[0],0),doorY=wh+8+trH,doorH=120,recY=doorY+doorH,recH=48,scanY=recY+recH,scanH=42,topY=scanY+scanH,dadfH=62;
 [[-.4,-.38],[.4,-.38],[-.4,.38],[.4,.38]].forEach(q=>b(0,q[0]*W,wh/2,q[1]*D,26,wh,26,"K",{r:8}));
 b(0,0,wh+8+trH/2,0,W,trH,D,"L",{r:10});
 glTrays(S,{W,D,wh,rows,z:6});
 /* moteur + porte avant des cartouches */
 const cH=doorH-20,cy=doorY+10+cH/2,ob=(r,q)=>Object.assign({r},q);
 b(0,0,doorY+doorH/2,0,W,doorH,D,"L",{r:8});
 b(0,0,doorY+doorH/2,fz-250,W*.92,cH,16,"M",{r:2});
 const ty=doorY+doorH-55,tz=fz-130;
 [["K","K",-.3],["C","C",-.1],["Mg","Mg",.1],["Y","Y",.3]].forEach(([c,m,fx])=>glCart(S,"tn_"+c,[0,0,260],[0,70,330],q=>{b(0,fx*W,ty,tz,W*.17,44,200,m,ob(8,q));b(0,fx*W,ty,tz+104,W*.1,24,12,"O",ob(4,q))}));
 S.grp("door",{k:"door",p:[0,doorY+10,fz+2],ax:"x",ang:80},()=>{
  b(5,0,doorY+10+cH/2,fz+2,W*.92,cH,8,"L",{r:5});
  b(5,0,doorY+10+cH*.55,fz+7,W*.14,18,4,"K",{r:5});
  b(5,0,doorY+10+cH/2,fz-2.5,W*.88,cH*.9,2,"M",{r:2});
 });
 /* bac 1 multifonction (volet replié sur la face avant, côté droit) */
 b(7,W*.27,doorY+22,fz+5,W*.36,24,6,"D",{r:4});b(7,W*.27,doorY+22,fz+9,W*.2,6,3,"K",{r:3});
 /* zone de sortie sous le scanner */
 b(0,0,recY+recH/2,-D/2+10,W*.96,recH,20,"N",{r:3});b(0,W/2-5,recY+recH/2,0,10,recH,D,"L",{r:3});b(0,-W/2+5,recY+recH/2,0,10,recH,D,"L",{r:3});
 b(8,0,recY+8,-10,W*.9,6,D*.78,"D",{r:3,rot:[-3,0,0]});
 /* scanner, panneau, chargeur */
 b(0,0,scanY+scanH/2,0,W,scanH,D,"L",{r:8});
 b(2,0,topY+1.2,0,W*.82,2.4,D*.62,"G",{r:1.2});
 const px=W*.2,ang=-40,pc=[px,topY+6,fz-60];
 b(3,pc[0],pc[1],pc[2],150,84,10,"D",{r:6,rot:[ang,0,0]});
 b(3,pc[0],pc[1]+3.5,pc[2]+3,120,68,2,"S",{r:1,rot:[ang,0,0]});
 b(4,-W*.38,scanY+scanH*.5,fz+1,18,18,8,"T",{r:6});
 S.grp("lid",{k:"lid",p:[0,topY,-D*.36],ax:"x",ang:-62},()=>{
  b(1,0,topY+dadfH*.4,0,W*.99,dadfH*.8,D*.74,"W",{r:10});
  b(1,0,topY+dadfH*.8,D*.05,W*.7,6,D*.5,"M",{r:3});
  b(1,0,topY+dadfH*.3,-D*.2,W*.6,dadfH*.3,10,"D",{r:3});
 });
 lb(1,0,topY+dadfH+40,D*.1);lb(2,-W*.3,topY+30,D*.3);lb(3,W*.2,topY+60,fz-40);lb(4,-W*.38,scanY+scanH*.5+30,fz+20);
 lb(5,0,doorY+doorH*.5,fz+50);lb(6,0,wh+8+trH*.5,fz+50);lb(7,W*.27,doorY+50,fz+30);lb(8,0,recY+40,fz*.3);
}
SCENES["hp/color-laserjet-managed-e47528"]={
 options:()=>({tray3:false}),
 build:glHp,
 mods(o){return `<span class="mh">Modules :</span><button class="mod${o.tray3?" on":""}" data-opt="tray3"><i></i>Bac 3 optionnel 550 feuilles (CF404A)</button>`},
 click(o,k){o[k]=!o[k]}
};
})();
