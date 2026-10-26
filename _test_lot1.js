window.capacite=function(){const S0=crSyn(),S=crSoldes()?Object.assign({},S0||{},crSoldes()):S0,P=trParam(),QB=bqAgg(),V=V6();if(!QB)return null;
  /* Paiements depuis la seule Caisse d'Épargne : la BPGO accumule la trésorerie et n'est pas utilisée */
  const solB=S&&S.tot?(S.sB||0):(V&&V.tresor?V.tresor.soldes.filter(s=>/BPGO/i.test(s.banque)).reduce((s,x)=>s+(x.solde||0),0):0);
  const sol=S&&S.tot?(S.sC||0):(V&&V.tresor?V.tresor.soldes.filter(s=>!/BPGO/i.test(s.banque)).reduce((s,x)=>s+(x.solde||0),0):0);
  const encCEm=(()=>{const L=QB.B.lignes.filter(l=>l.s==='E'&&/caisse/i.test(l.compte||'')&&l.cat!=='exceptionnel');const R=QB.B.ref||[1,2];return R.reduce((s,i)=>s+L.reduce((a,l)=>a+(l.m[i]||0),0),0)/R.length})();
  const inclB=!!P.payBpgo;const solCE=sol;const solT=inclB?sol+solB:sol;
  const dSol=S&&S.tot?(S.dateC||''):'';const dSolI=(()=>{const m=/^(\d{2})\/(\d{2})\/(\d{4})/.exec(dSol||'');return m?m[3]+'-'+m[2]+'-'+m[1]:(/^\d{4}-\d{2}-\d{2}/.test(dSol||'')?dSol.slice(0,10):'')})();/* 7.15 : le jour de la saisie compte si ses prélèvements n'étaient pas encore passés, et les jours entre la saisie et aujourd'hui sont déduits */const SJ=jsonEt('sol_jour',{})||{};const jourPasse=dSolI&&SJ.date===dSolI?SJ.passe!==false:true;const apres=(d,k)=>dSolI?(jourPasse?d>dSolI:d>=dSolI):k>0;let prem=true;const N=36,d0=auj(),enc=encCEm/21.7*0.9*margeFacteur(),ch=jsonEt('tr_charges',[]);const dDeb=dSolI&&dSolI<d0?dSolI:d0,nAv=dDeb<d0?Math.round((new Date(d0+'T12:00:00')-new Date(dDeb+'T12:00:00'))/864e5):0;
  const gros=(QB.S.find(x=>x.cat==='grossiste')||{moy:0}).moy,cerpM=P.cerp!=null&&P.cerp!==''?+P.cerp:Math.round(CERP_HIST.slice(-6).reduce((s,x)=>s+x[1],0)/6/100)*100;
  const C=A&&A.cerp&&!CERP_CMD_ANNULEES?A.cerp:null,cerpAtt=C?C.lignes.reduce((s,l)=>s+Math.max(0,(+l[2]||0)-(+l[4]||0)),0)*1.021:0;
  const cd=cerpDates(dDeb,N+nAv);const J=[],PASSE=[];let b=solT;
  for(let k=-nAv;k<N;k++){const d=ajJ(d0,k),wd=new Date(d+'T12:00:00').getDay(),j=+d.slice(8),fm=joursMois(d.slice(0,7)+'-01');const ev=[];
    const inc=apres(d,k),e=(wd>=1&&wd<=5&&inc)?enc:0;const ret=inc&&prem;if(inc)prem=false;
    ch.forEach(c=>{const cj=Math.min(+c.jour,fm);if(cj===j&&inc)ev.push([c.lib.replace(/\s*\(.*$/,''),+c.montant||0,c.cat])});
    if(inc)evtJour(d,ret).forEach(x=>ev.push(x));
    if(inc)Object.values(jsonEt('eng',{})).forEach(e=>{if(!e||e.statut!=='valide')return;const de=e.echeance||e.date;if(de===d||(ret&&de&&de<d))ev.push([(e.tiers||'Engagement')+' (engagement validé)',+e.ttc||0,e.cat||'aut'])});
    cd.filter(x=>x.prlv===d&&inc).forEach(x=>{const kn=CERP_CONNUS[x.prlv];ev.push(['CERP'+(kn?' (relevé du '+dfr(CERP_RELEVE).slice(0,5)+', montant exact)':' (estimé)'),kn||cerpM,'mes'])});
    const out=ev.reduce((s,x)=>s+x[1],0);b=b+e-out;(k<0?PASSE:J).push({d,k,enc:e,ev,out,bal:b})}
  const capAt=k=>Math.min(...J.slice(k).map(x=>x.bal))-P.reserve;const mn=J.reduce((m,x)=>x.bal<m.bal?x:m,J[0]);
  const cap=capAt(0),capRisque=cap-cerpAtt;
  /* 7.15 : une sortie prévue (charge, changement de gestion, engagement) qui a le même tiers et le même montant qu'un dossier ouvert du suivi RJ est peut-être comptée deux fois : signalée, jamais retirée d'office */
  const LRJ=(S&&S.L||[]).filter(l=>(+l.du||0)>0),mot=x=>trNorm(String(x||'').replace(/\(.*$/,'')).split(' ').filter(w=>w.length>=4);
  const DOUBLES=[];[...J,...PASSE].forEach(x=>x.ev.forEach(e=>{if(!(e[1]>0))return;const m=mot(e[0]);const l=LRJ.find(l=>Math.abs((+l.du||0)-e[1])<=1&&mot(l.tiers).some(w=>m.includes(w)));if(l&&!DOUBLES.some(z=>z.lib===e[0]&&z.d===x.d))DOUBLES.push({d:x.d,lib:e[0],mt:e[1],rj:l.tiers})}));
  // factures du suivi RJ, dans l'ordre : priorité 1, validées par l'administrateur, puis les plus anciennes
  const F=(S&&S.L||[]).filter(l=>(+l.du||0)>0).map(l=>({tiers:l.tiers,du:+l.du,p1:/1/.test(String(l.priorite||'')),val:!!String(l.validation||'').trim()||/valid/i.test(l.statut||''),dt:dIso(l.dateCommande||l.date)||'9999',statut:l.statut||''}))
    .sort((a,b)=>(b.p1-a.p1)||(b.val-a.val)||String(a.dt).localeCompare(String(b.dt)));
  let cum=0;F.forEach(f=>{cum+=f.du;f.cum=cum;let kk=-1;for(let k=0;k<N;k++){if(capAt(k)>=cum){kk=k;break}}f.des=kk});
  return {DOUBLES,PASSE,jourPasse,sol,solCE,solT,inclB,solB,encCEm,dSol,dSolI,dSolB:S&&S.tot?(S.dateB||''):'',srcSol:S&&S.tot?'saisi':'ancien',detC:S&&S.C,detB:S&&S.B,J,mn,cap,capRisque,cerpM,cerpAtt,F,P,enc,cd,N,QB}}
window.trBanque=function(tiers,mt,dRef){if(!mt)return null;const t=trNorm(tiers);const ok=l=>Math.abs(l[1]-mt)<=0.005;const C=BQ_RAP.L.filter(l=>ok(l)&&t.indexOf(l[0])>=0);const L=C.length?C:BQ_RAP.L.filter(l=>ok(l)&&crProche(tiers,l[0]));if(!L.length)return null;
  const ref=dRef&&/^\d{4}-\d{2}-\d{2}/.test(dRef)?dRef.slice(0,10):'';const lim=ref?ajJ(ref,-3):'';const bon=L.filter(l=>l[2]==='non'||!ref||l[3]>=lim);
  const x=bon.length?bon.slice().sort((a,b)=>String(b[3]).localeCompare(String(a[3])))[0]:null;
  if(!x){const v=L.slice().sort((a,b)=>String(b[3]).localeCompare(String(a[3])))[0];return {st:'anterieur',d:v[3],p:v[4],note:'un paiement du même montant existe le '+dfr(v[3])+', avant la date de cette pièce ('+dfr(ref)+') : c’est probablement une échéance précédente, pas celle-ci'}}
  if(!ref&&(x[2]==='paye'||x[2]==='avant'))return {st:'ecart',d:x[3],p:x[4],note:'même tiers et même montant payés le '+dfr(x[3])+', mais la date de la pièce est inconnue : vérifier que ce n’est pas une échéance précédente'};
  return {st:x[2],d:x[3],p:x[4],note:x[5]}}
window.semainesTreso=function(){const V=V6();if(!V)return null;const P=trParam(),T=V.tresor,ch=jsonEt('tr_charges',[]),E=jsonEt('eng',{});
  const CRS=crSyn(),vif=!!(CRS&&CRS.tot);
  const sol=vif?(CRS.sC||0)+(P.bpgo?(CRS.sB||0):0):T.soldes.filter(s=>P.bpgo||!/BPGO/i.test(s.banque)).reduce((s,x)=>s+(x.solde||0),0);
  const MM=(A.margeMensuelle||[]);const d0=lundi(auj());const W=[];
  const ref=m=>MM.find(z=>z.m===moisPlus(m,-12))||MM[MM.length-1];const encDef=m=>{const mm=ref(m);return mm?mm.ca/4.33:0};const achDef=m=>{const mm=ref(m);return mm?(mm.ca-mm.mg)/4.33:0};
  let s=sol;
  for(let i=0;i<13;i++){const deb=ajJ(d0,7*i),fin=ajJ(deb,6),mois=deb.slice(0,7)+'-01';
    const FC=caFacteurs();const enc=(P.enc!=null&&P.enc!==''?+P.enc*FC.rel:encDef(mois)*FC.n1)*(1+P.scenario/100)+(P.tva&&i===+P.tvaSem?25000:0);
    const ach=(P.ach!=null&&P.ach!==''?+P.ach*FC.rel:achDef(mois)*FC.n1)*(1+P.scenario/100);
    let prio=0,march=ach,autres=0;const det=[['Achats de marchandises habituels',ach,'mes']];
    if(!ch.length){const mm=ref(mois),fr=mm?(mm.mg*FRAIS_DEF)/4.33:0;autres+=fr;det.push(['Charges courantes estimées (salaires, loyer, impôts… : '+Math.round(FRAIS_DEF*100)+' % de la marge, en attendant vos relevés)',fr,'aut'])}
    ch.forEach(c=>{const jours=[];for(let k=0;k<7;k++){const d=ajJ(deb,k);if(+d.slice(8)===+c.jour)jours.push(d)}if(jours.length){const m=+c.montant||0;if(PRIO.includes(c.cat))prio+=m;else if(c.cat==='mes'||c.cat==='mco')march+=m;else autres+=m;det.push([c.lib,m,c.cat])}});
    if(i===0){const ouv=vif?Math.max(0,CRS.duNet):T.dossiers.reduce((a,x)=>a+(x.ttc||0),0);prio+=ouv;det.push([vif?'Dossiers ouverts du suivi RJ (en direct, '+new Date(CRS.t).toLocaleDateString('fr-FR')+')':'Dossiers ouverts du suivi RJ (au 15/10)',ouv,'det'])}
    Object.values(E).forEach(e=>{if(!e||e.statut!=='valide')return;const d=e.echeance||e.date;if(d>=deb&&d<=fin||(i===0&&d<deb)){const m=+e.ttc||0;if(PRIO.includes(e.cat))prio+=m;else if(e.cat==='mes'||e.cat==='mco')march+=m;else autres+=m;det.push([e.tiers+' (engagement)',m,e.cat])}});
    for(let k=0;k<7;k++){const d=ajJ(deb,k);if(d<auj())continue;evtJour(d,i===0&&d===auj()).forEach(x=>{if(x[1]>0)prio+=x[1];else autres+=x[1];det.push(x)})}
    const debut=s;s=s+enc-prio-march-autres;const env=Math.max(0,debut+enc-prio-autres-P.reserve);
    W.push({deb,fin,debut,enc,prio,march,autres,fin_:s,env,envReste:Math.max(0,env-march),det})}
  return {sol,W,P}}


const O=window.capacite;
const R=capacite();
const res={cap:Math.round(R.cap),dSolI:R.dSolI,jourPasse:R.jourPasse,passe:R.PASSE.length,doubles:R.DOUBLES.map(z=>z.lib+' '+z.mt+' '+z.d),J0:R.J.slice(0,2).map(x=>x.d+' out='+Math.round(x.out)+' bal='+Math.round(x.bal))};
// cas limite : solde saisi il y a 3 jours, un lundi, prélèvements non passés
const oldCS=window.crSoldes;
window.crSoldes=()=>({tot:1,sC:41293,sB:63321,dateC:'23/10/2026 10:00',dateB:'',C:null,B:null});
const R2=capacite();res.test3jours={cap:Math.round(R2.cap),passe:R2.PASSE.map(x=>x.d+' out='+Math.round(x.out)).join(' | ')};
window.crSoldes=()=>({tot:1,sC:-5000,sB:0,dateC:'26/10/2026 10:00',C:null,B:null});
const R3=capacite();res.testNeg={cap:Math.round(R3.cap)};
window.crSoldes=oldCS;
res.bq={edf_vieille:trBanque('EDF',1985.92,'2026-10-01'),edf_nouvelle:trBanque('EDF',1985.92,'2026-10-20'),edf_sansdate:trBanque('EDF',1985.92,''),perrigo:trBanque('PERRIGO',4157.51,'2026-09-01')};
const W=semainesTreso();res.w0={sol:Math.round(W.sol),fin0:Math.round(W.W[0].fin_)};
JSON.stringify(res)
