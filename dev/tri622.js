(function(){

/* ===== 6.22 : Traiter en série — preuves (banque, doublon, suivi RJ), lecture du mail, proposition modifiable ===== */
/* Rapprochement bancaire ligne par ligne du 18/10/2026 (Caisse d'Épargne depuis le 01/07, BPGO 1 et 2 depuis fin mai).
   st : paye = payé ; ecart = payé avec un écart ; avant = payé avant le jugement du 30/06 ; non = aucun paiement trouvé ; doute = paiements proches, rien d'exact */
const BQ_RAP={date:'2026-10-18',perim:"Caisse d'Épargne depuis le 01/07/2026, BPGO (2 comptes) depuis fin mai 2026",
 L:[['TRAJECTOIRE',8495.21,'paye','2026-10-05',8495.21,'virement'],['PERRIGO',4157.51,'paye','2026-09-15',4157.51,''],['ABBOTT',4037.13,'paye','2026-08-26',4037.13,'facture 3303235802'],
 ['PIERRE FABRE',3023.89,'paye','2026-10-08',3023.89,''],['CAUDALIE',2938.41,'paye','2026-09-15',2938.39,'2 centimes d’écart'],['EDF',1985.92,'paye','2026-10-05',1985.92,'prélèvement'],
 ['JANSSEN',1711.19,'paye','2026-09-07',1711.19,''],['SANTE AU TRAVAIL',1233.60,'paye','2026-09-23',1233.60,'virement'],['SANTE AU TRAVAIL',1233.62,'paye','2026-09-23',1233.60,'2 centimes d’écart, même facture'],
 ['COSSEDU',754.00,'ecart','2026-09-24',740.00,'payé 740 € : il manque 14 €'],['ABBVIE',597.11,'paye','2026-10-15',597.11,'payé DEUX fois le 15/10 (voir Trésorerie › payé deux fois)'],
 ['OPELLA',371.68,'ecart','2026-09-15',371.28,'payé 371,28 € : 0,40 € d’écart'],['DE LAGE LANDEN',190.80,'avant','2026-06-26',190.80,'payé avant le jugement'],['MESOIGNER',238.80,'avant','2026-06-12',238.80,'payé avant le jugement'],
 ['SIVAN',97.19,'paye','2026-07-08',97.19,''],['NHCO',93.02,'paye','2026-09-29',93.02,''],['ALLIANCE',14.61,'paye','2026-09-02',14.61,''],['GOOGLE',4.99,'paye','2026-09-23',4.99,''],
 ['COOPER',6305.30,'paye','2026-09-29',6305.30,'factures C608776134 / 135 / 136'],['BIOCODEX',2929.93,'paye','2026-10-15',2929.93,'commande 55778334-00'],['ARAGAN',1540.05,'paye','2026-10-08',1540.05,'virement libellé proforma 40010087 : vérifier que c’est la même pièce'],
 ['LEASECOM',4305.60,'avant','2026-06-23',4305.60,'même montant prélevé le 05/06 et le 23/06, avant le jugement : relève du passif'],
 ['KLESIA',3247.04,'non','','',"cotisations de juillet jamais prélevées : le prélèvement du 25/09 (5 834,04 €) correspond à août (libellé 202608M). 3 247,04 € = 3 091,04 € + 156 € de majorations : même dette"],
 ['KLESIA',3091.04,'non','','',"cotisations de juillet jamais prélevées (le prélèvement du 25/09 correspond à août) ; la relance de 3 247,04 € porte sur la même dette, majorations comprises"],
 ['THUASNE',188.34,'doute','','','des paiements à Thuasne existent, mais aucun de ce montant exact'],['ORLIMAN',21.55,'doute','','','des paiements à Orliman existent, mais aucun de ce montant exact'],
 ...[['URGO',36.90],['VITRY',83.45],['ORKYN',26.75],['OSPHAREA',55.75],['GRIMBERG',286.39],['OPELLA',62.02],['ALLIANZ',9700.94],['COOPER',295.31],['COOPER',12.34],['BOIRON',1301.22],['URGO',48.38],['LEASECOM',17222.40],['LEASECOM',4383.72],['DOCTOLIB',1.28],['SOLOCAL',528.00],['SIEMENS',4190.07],['SAPEC',35.00],['ASCA',356.40],['OREAL',85.55],['OREAL',1844.35],['OREAL',1690.24],['ARAGAN',2109.00],['GIMED',102.44],['BIODERMA',70.08],['NUXE',450.14],['ORANGE',26.97],['UPSA',3469.24],['NUXE',182.40],['ORANGE',17.98],['PHARMA',1.02],['NUXE',2101.00],['IDES',527.27],['ULYS',30.00],['KREME',536.86],['EXPANSCIENCE',1693.69],['RETIF',205988.04],['ANAVEO',273.68],['BOIRON',88.85],['SANOFI',3051.77],['SITOUR',2720.80],['PLUXEE',190.00],['BIOCODEX',2539.44],['ABBOTT',5290.86],['BOIRON',6.62],['BAYER',6315.85],['URIAGE',2067.08],['NHCO',1620.27],['MEME',1265.57],['MEME',222.65],['UPSA',87.99],['GREFFE',468.54],['PILEJE',1722.70]].map(x=>[x[0],x[1],'non','','',''])]};
const trNorm=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
function trBanque(tiers,mt){if(!mt)return null;const t=trNorm(tiers);const x=BQ_RAP.L.find(l=>Math.abs(l[1]-mt)<=0.005&&t.indexOf(l[0])>=0)||BQ_RAP.L.find(l=>Math.abs(l[1]-mt)<=0.005&&crProche(tiers,l[0]));
  return x?{st:x[2],d:x[3],p:x[4],note:x[5]}:null}
const trRefs=t=>(String(t||'').toUpperCase().match(/[A-Z0-9][A-Z0-9-]{4,}/g)||[]).filter(x=>(x.match(/\d/g)||[]).length>=5).map(x=>x.replace(/^0+/,'')).filter((x,i,a)=>x.length>=5&&a.indexOf(x)===i);
let TR_CODES=null,TR_CODES_N=-1;
function trCodes(F,L){if(TR_CODES&&TR_CODES_N===F.length)return Object.assign({},TR_CODES);const c={},re=/(?:client|compte|code|cc)(?:[^A-Za-z0-9]{1,6}(?:client|compte|n°|no|numéro|num))*[^A-Za-z0-9]{0,8}([A-Z0-9][A-Z0-9-]{4,}(?:\s*[–\/-]\s*[A-Z0-9][A-Z0-9-]{4,})?)/gi;
  const tx=F.map(g=>[g['Références'],g['Objet'],g['Résumé'],g['Note de Claude'],g['Tiers']].join(' \n '));L.forEach(l=>tx.push(l.refs+' \n '+(l.commentaire||'')));
  tx.forEach(t=>{let m;re.lastIndex=0;while((m=re.exec(t)))trRefs(m[1]).forEach(r=>c[r]=1)});TR_CODES=c;TR_CODES_N=F.length;return Object.assign({},c)}
/* Même logique que la Boîte mail : la pièce la plus ancienne est l'original, la relance est le doublon */
function trDoublons(f,F,L){const src=[];
  L.forEach(l=>src.push({suivi:true,l,tiers:l.tiers,refs:String(l.refs||''),mt:l.montantTTC!=null?+l.montantTTC:(l.du!=null?+l.du:null)}));
  F.forEach(g=>{if(g===f)return;if(String(g['Date mail'])>String(f['Date mail']))return;if(String(g['Date mail'])===String(f['Date mail'])&&String(g['ID'])>String(f['ID']))return;
    if(g['Statut']!=='À valider'&&!/^(Suivi RJ|Déjà au suivi RJ)$/.test(g['Décision finale']||''))return;src.push({suivi:false,g,tiers:g['Tiers'],refs:g['Références']+' '+g['Objet'],mt:crNb(g['Montant TTC'])})});
  const codes=trCodes(F,L);trRefs(f['Tiers']).forEach(r=>codes[r]=1);const sans=t=>trRefs(t).filter(r=>!codes[r]);const mes=sans(f['Références']+' '+f['Objet']),mm=crNb(f['Montant TTC']);const res=[];
  src.forEach(s=>{const leurs=sans(s.refs).filter(r=>trRefs(s.tiers).indexOf(r)<0);let com=leurs.filter(r=>mes.indexOf(r)>=0);
    if(com.length&&mes.some(r=>com.indexOf(r)<0)&&leurs.some(r=>com.indexOf(r)<0))com=[];
    const memeMt=mm!=null&&mm>0&&s.mt!=null&&Math.abs(mm-s.mt)<0.005&&crProche(f['Tiers'],s.tiers);
    if(com.length||memeMt)res.push({...s,pourquoi:com.length?'même référence '+com.join(', '):'même tiers et même montant '+eur2(mm)})});
  return res}
const TR_DEC=['Déjà payé','Suivi RJ','Déjà au suivi RJ','Créance antérieure','Prestataire à payer','À vérifier','Action à faire','Information','Doublon','Sans intérêt'];
const TR_LIB={'Déjà payé':'✅ Déjà payé — rien à payer','Suivi RJ':'💶 À payer — ajouter au suivi RJ','Déjà au suivi RJ':'💶 Déjà au suivi RJ — rien à ajouter','Créance antérieure':'⛔ Avant le 30/06 — ne pas payer (passif)','Prestataire à payer':'💶 Prestataire à payer','À vérifier':'❓ À vérifier par vous','Action à faire':'✍️ Action à faire (répondre, appeler, signer)','Information':'ℹ️ Information — rien à faire','Doublon':'🔁 Doublon — rien à faire','Sans intérêt':'🗑️ Publicité / notification'};
const TR_L1=/^(Déjà payé|Information|Sans intérêt|Doublon|Déjà au suivi RJ)$/,TR_L2=/^(Suivi RJ|Prestataire à payer|Créance antérieure)$/;
let TRS=(()=>{try{return JSON.parse(localStorage.getItem('pil_tri')||'{}')}catch(e){return {}}})();TRS.c=TRS.c||{};TRS.k=TRS.k||{};TRS.m=TRS.m||{};TRS.f=TRS.f||'l1';
const trSauver=()=>{try{localStorage.setItem('pil_tri',JSON.stringify(TRS))}catch(e){}};
/* Analyse d'une fiche : preuves + nouvelle proposition */
function trAnalyse(f,F,L){const mt=mtF(f),bq=trBanque(f['Tiers'],mt),db=trDoublons(f,F,L),dec0=f['Décision proposée']||'À vérifier';let dec=dec0,pourquoi='',alerte='',com='';
  if(bq&&(bq.st==='paye'||bq.st==='avant')){dec='Déjà payé';com=`DÉJÀ PAYÉ le ${dfr(bq.d)} : ${eur2(bq.p)}${bq.note?' ('+bq.note+')':''} — rapprochement bancaire du ${dfr(BQ_RAP.date)}`;
    if(dec0!=='Déjà payé')pourquoi='Nouvelle proposition : la banque montre que ce montant est déjà payé.'}
  else if(bq&&bq.st==='ecart'){dec='À vérifier';pourquoi='Nouvelle proposition : un paiement existe, mais pas du montant exact.';com=`Paiement trouvé le ${dfr(bq.d)} : ${eur2(bq.p)} (${bq.note})`}
  else if(/^(Doublon|Déjà au suivi RJ)$/.test(dec0)&&!db.length){alerte=`La proposition dit « ${dec0} », mais je ne retrouve pas l'autre exemplaire parmi les fiches et le suivi RJ ouverts${bq&&bq.st==='non'?" et aucun paiement n'apparaît en banque":''}. Lisez le mail avant de valider.`}
  else if(dec0==='Suivi RJ'&&db.some(x=>x.suivi)){dec='Déjà au suivi RJ';pourquoi='Nouvelle proposition : cette pièce est déjà dans le suivi RJ (détail ci-dessous).'}
  else if(dec0==='Suivi RJ'&&db.length){dec='Doublon';pourquoi='Nouvelle proposition : une fiche plus ancienne porte déjà cette pièce (détail ci-dessous).'}
  if(bq&&bq.st==='non'&&/^(Doublon|Information|Sans intérêt)$/.test(dec)&&mt>=50)alerte=(alerte?alerte+' ':'')+`⚠ ${eur2(mt)} réclamés et aucun paiement trouvé en banque : vérifiez que l'original est bien suivi.`;
  const ch=TRS.c[f.ID]||dec;return {f,mt,bq,db,dec0,dec,ch,pourquoi,alerte,com:TRS.m[f.ID]!=null?TRS.m[f.ID]:com,lot:TR_L1.test(ch)?1:TR_L2.test(ch)?2:3}}
function trTout(){const S=crSyn();if(!S)return null;const F=S.F,L=S.L||[],av=F.filter(f=>f['Statut']==='À valider');TR_CODES=null;
  const A=av.map(f=>trAnalyse(f,F,L)).sort((a,b)=>(PRI_ORD[a.f['Priorité']]??4)-(PRI_ORD[b.f['Priorité']]??4)||String(a.f['Date mail']).localeCompare(String(b.f['Date mail'])));
  return {A,F,L,S}}
function lotsMails(){const T=trTout();if(!T)return null;return {F:T.A.map(a=>a.f),l1:T.A.filter(a=>a.lot===1).map(a=>a.f),l2:T.A.filter(a=>a.lot===2).map(a=>a.f),l3:T.A.filter(a=>a.lot===3).map(a=>a.f)}}

const trEtatDossier=l=>[l.statut&&'statut : '+l.statut,l.demande&&'demande de virement '+dfr(crISO(l.demande)),l.validation&&'validé '+dfr(crISO(l.validation)),l.preuve&&'preuve envoyée '+dfr(crISO(l.preuve)),l.verse?'versé '+eur2(l.verse):'',l.du!=null?'reste dû '+eur2(l.du):''].filter(Boolean).join(' · ');
function trCarte(a){const f=a.f,id=esc(f.ID),coche=TRS.k[f.ID]!=null?TRS.k[f.ID]:(a.lot===1&&!a.alerte),bq=a.bq;
  const bqH=!a.mt?'':!bq?`<div class="sub w">🏦 <b>Banque :</b> montant non encore rapproché (fiche arrivée après le rapprochement du ${dfr(BQ_RAP.date)}).</div>`
    :bq.st==='paye'?`<div class="w" style="color:var(--vert2)">🏦 <b>Déjà payé le ${dfr(bq.d)} : ${eur2(bq.p)}</b>${bq.note?' — '+esc(bq.note):''}</div>`
    :bq.st==='avant'?`<div class="w" style="color:var(--vert2)">🏦 <b>Payé le ${dfr(bq.d)}, avant le jugement : ${eur2(bq.p)}</b>${bq.note?' — '+esc(bq.note):''}</div>`
    :bq.st==='ecart'?`<div class="w" style="color:var(--orange)">🏦 <b>Paiement trouvé le ${dfr(bq.d)} : ${eur2(bq.p)}</b> — ${esc(bq.note)}</div>`
    :bq.st==='doute'?`<div class="w" style="color:var(--orange)">🏦 <b>Je ne peux pas conclure :</b> ${esc(bq.note)}</div>`
    :`<div class="w">🏦 <b>Aucun paiement trouvé</b> de ce montant à ce tiers${bq.note?' — '+esc(bq.note):''}</div>`;
  const dbH=a.db.map(x=>x.suivi?`<div class="w" style="margin-top:4px">📁 <b>Déjà au suivi RJ</b> (${esc(x.pourquoi)}) : ${esc(x.l.tiers)} — ${esc(x.l.refs)}${x.mt!=null?' — '+eur2(x.mt):''}<div class="sub w">${esc(trEtatDossier(x.l))}${trBanque(x.l.tiers,x.l.du||x.mt)&&trBanque(x.l.tiers,x.l.du||x.mt).st==='paye'?' · <b style="color:var(--vert2)">la banque montre ce dossier payé le '+dfr(trBanque(x.l.tiers,x.l.du||x.mt).d)+' : à solder dans Paiements RJ</b>':''}</div>
      <div class="prb"><button class="mini" data-go="cou:rj">Voir dans Paiements RJ ›</button>${x.l.lien?`<a class="mini" href="${esc(x.l.lien)}" target="_blank" rel="noopener" style="text-decoration:none">Pièce du dossier ›</a>`:''}</div></div>`
    :`<div class="w" style="margin-top:4px">🔁 <b>Autre exemplaire</b> (${esc(x.pourquoi)}) : fiche reçue le ${esc(String(x.g['Date mail']).slice(0,10))} — ${esc(x.g['Tiers'])} — ${esc(x.g['Type']||'')} ${x.g['Montant TTC']?'— '+esc(x.g['Montant TTC']):''} ${x.g['Statut']!=='À valider'?'('+esc(x.g['Statut'])+', '+esc(x.g['Décision finale']||'')+')':''}<div class="sub w">${esc(String(x.g['Objet']||'').slice(0,140))}</div>
      <div class="prb">${x.g['Statut']==='À valider'?`<button class="mini trVoir" data-id="${esc(x.g.ID)}">Voir cette fiche ›</button>`:''}<button class="mini trLire" data-id="${esc(x.g.ID)}" data-cible="${id}">📧 Lire ce mail</button></div></div>`).join('');
  return `<div class="prl trC" data-mid="${id}" id="tr_${id}" style="display:block;${TRS.ok&&TRS.ok[f.ID]?'opacity:.35':''}"><div style="display:flex;gap:8px;align-items:flex-start">
   <input type="checkbox" class="mCh" data-id="${id}" ${coche?'checked':''} style="width:22px;height:22px;margin-top:2px;flex:none">
   <div class="grow"><b>${esc(f['Tiers']||'—')}</b> <span class="badge">${esc(f['Type']||'')}</span>${/Urgente|Haute/.test(f['Priorité'])?` <span class="badge" style="color:var(--rouge);border-color:var(--rouge)">${esc(f['Priorité'])}</span>`:''}
    <div class="sub w">${esc(String(f['Objet']||''))}${f['Montant TTC']?' · <b style="color:var(--txt)">'+esc(f['Montant TTC'])+'</b>':''} · reçu ${esc(String(f['Date mail']||'').slice(0,10))}${f['Références']?' · réf. '+esc(f['Références']):''}${f['Antériorité']?' · '+esc(f['Antériorité']):''}</div></div></div>
   <div style="margin:6px 0 0 30px">
    <div class="sub w" style="margin-bottom:4px">${esc(String(f['Résumé']||''))}</div>
    <div style="border-left:3px solid var(--bord,#ccc);padding-left:8px;margin:6px 0"><div class="sub" style="font-weight:600">Ce que j'ai vérifié</div>${bqH}${dbH}
     ${a.alerte?`<div class="w" style="color:var(--orange);margin-top:4px">${esc(a.alerte)}</div>`:''}
     ${f['Vérification']?`<div class="sub w" style="margin-top:4px"><b>Contrôle du passage automatique :</b> ${esc(f['Vérification'])}</div>`:''}</div>
    ${a.pourquoi?`<div class="w" style="color:var(--bleu,#2e6fd8);font-weight:600">${esc(a.pourquoi)} (proposition d'origine : ${esc(a.dec0)})</div>`:''}
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:4px"><b>Décision :</b><select class="trDec" data-id="${id}" style="max-width:100%">${TR_DEC.map(d=>`<option value="${esc(d)}"${d===a.ch?' selected':''}>${esc(TR_LIB[d])}${d===a.dec?' (proposé)':''}</option>`).join('')}</select></div>
    <input class="trCom" data-id="${id}" value="${esc(a.com)}" placeholder="Commentaire (facultatif)" style="width:100%;margin-top:4px">
    <div class="prb"><button class="mini trLire" data-id="${id}" data-cible="${id}">📧 Lire le mail en entier</button><button class="mini mOk" data-id="${id}">✓ Valider</button><button class="mini mNo" data-id="${id}">✗ À revoir</button>${f['Lien Gmail']?`<a class="mini" href="${esc(f['Lien Gmail'])}" target="_blank" rel="noopener" style="text-decoration:none" title="Le mail sera marqué comme lu">Ouvrir dans Gmail ›</a>`:''}</div>
    <div class="trMail" id="trm_${id}"></div></div></div>`}
function vueTriSerie(){const T=trTout();if(!T)return `<div class="carte"><b>Courrier non chargé</b><div class="sub w">Ouvrez « 📬 Boîte mail » et entrez le code de Tri & RJ.</div></div>`;
  const A=T.A,n=k=>A.filter(k).length,paye=a=>a.ch==='Déjà payé',dbl=a=>a.db.length>0||/^(Doublon|Déjà au suivi RJ)$/.test(a.ch),alr=a=>!!a.alerte,nouv=a=>!!a.pourquoi;
  const FL=[['l1','1. Rien à faire',a=>a.lot===1],['l2','2. À payer / suivi RJ',a=>a.lot===2],['l3','3. À vérifier / action',a=>a.lot===3],['paye','✅ Déjà payé',paye],['dbl','🔁 Doublons / déjà suivis',dbl],['nouv','🆕 Proposition changée',nouv],['alr','⚠ À regarder',alr],['tout','Toutes',a=>true]];
  const fl=FL.find(x=>x[0]===TRS.f)||FL[0],q=trNorm(TRS.q||''),V=A.filter(fl[2]).filter(a=>!q||trNorm([a.f.Tiers,a.f.Objet,a.f['Références'],a.f['Montant TTC']].join(' ')).indexOf(q)>=0);
  const tot2=A.filter(a=>a.lot===2).reduce((s,a)=>s+a.mt,0);
  return `<div class="carte al b"><b class="t">${A.length} mails à décider</b><div class="sub w">Chaque fiche montre ce que j'ai vérifié : <b>banque</b> (rapprochement ligne par ligne du ${dfr(BQ_RAP.date)} : ${esc(BQ_RAP.perim)}), <b>autre exemplaire</b> (fiche ou dossier du suivi RJ, avec le lien), et le contrôle fait au tri. Vous pouvez <b>changer la décision</b> de chaque fiche, <b>lire le mail en entier</b> (sans le marquer comme lu), puis valider en masse les fiches cochées. Rien n'est supprimé.</div>
   <div class="kpis" style="margin-top:8px"><div class="kpi"><div class="l">1. Rien à faire</div><div class="v">${n(a=>a.lot===1)}</div><div class="sub">dont ${n(paye)} déjà payés</div></div><div class="kpi"><div class="l">2. À payer / suivi RJ</div><div class="v">${n(a=>a.lot===2)}</div><div class="sub">${eur(tot2)}</div></div><div class="kpi"><div class="l">3. À vérifier / action</div><div class="v">${n(a=>a.lot===3)}</div></div></div></div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin:8px 0" id="trF">${FL.map(x=>`<button class="mini${x[0]===fl[0]?' on':''}" data-f="${x[0]}" style="${x[0]===fl[0]?'background:var(--txt);color:var(--fond)':''}">${x[1]} (${n(x[2])})</button>`).join('')}</div>
  <input id="trQ" placeholder="Rechercher un tiers, une référence, un montant…" value="${esc(TRS.q||'')}" style="width:100%;margin-bottom:6px">
  <div class="carte prc" style="position:sticky;top:0;z-index:5"><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn" id="mL1">✓ Valider les <span id="mN">0</span> fiches cochées</button><button class="btn sec" id="mTout">Tout cocher / décocher (cette liste)</button></div>
   <div class="sub w">Chaque fiche cochée est validée avec la décision affichée sur sa ligne (et son commentaire). « Déjà payé » est enregistré comme « Information » avec la preuve de paiement en commentaire.</div><div id="mProg" class="sub"></div></div>
  <div class="titre">${esc(fl[1])} (${V.length})</div>
  <div class="carte prc">${V.map(trCarte).join('')||'<div class="sub">Aucune fiche.</div>'}</div>`}
async function trLire(id,cible){const z=document.getElementById('trm_'+cible);if(!z)return;if(z.dataset.ouvert===id){z.innerHTML='';z.dataset.ouvert='';return}z.dataset.ouvert=id;
  if(/^C-/.test(id)){z.innerHTML=`<div class="sub w">Courrier papier scanné : <button class="mini" data-go="cou:cr">ouvrir Courrier / PDF ›</button></div>`;brancherLiens();return}
  const J=crJeton();if(!J){z.innerHTML='<div class="sub w">Entrez d\'abord le code dans « 📬 Boîte mail ».</div>';return}
  z.innerHTML='<div class="sub">Lecture du mail…</div>';
  try{const r=await crAppel('mob_mail',[J,id]);z.innerHTML=`<div style="border:1px solid var(--bord,#ccc);border-radius:8px;padding:8px;margin-top:6px;max-height:70vh;overflow:auto">${id!==cible?'<div class="sub"><b>Autre exemplaire</b></div>':''}${(r.messages||[]).map((m,mi)=>`<div style="border-bottom:1px solid var(--bord,#ddd);padding:6px 0"><div class="sub"><b>${esc(m.de)}</b> · ${esc(m.date)}</div><div class="sub">À : ${esc(m.a)}</div>
     ${(m.pjs||[]).map(p=>`<button class="mini trPj" data-id="${esc(id)}" data-mi="${p.mi}" data-ai="${p.ai}">📎 ${esc(p.nom)} (${Math.ceil(p.taille/1024)} Ko)</button>`).join(' ')}<pre style="white-space:pre-wrap;font:inherit;font-size:13px;margin:6px 0">${esc(m.corps)}</pre></div>`).join('')}<div class="trPjZ"></div><button class="mini trFerme">Fermer le mail</button></div>`;
    z.querySelector('.trFerme').onclick=()=>{z.innerHTML='';z.dataset.ouvert='';document.getElementById('tr_'+cible).scrollIntoView({block:'start'})};
    z.querySelectorAll('.trPj').forEach(b=>b.onclick=async()=>{const pz=z.querySelector('.trPjZ');pz.innerHTML='<div class="sub">Chargement de la pièce jointe…</div>';
      try{const p=await crAppel('mob_pj',[J,b.dataset.id,+b.dataset.mi,+b.dataset.ai]);const bin=atob(p.b64);
        if(/pdf/i.test(p.type)||/\.pdf$/i.test(p.nom)){const o=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)o[i]=bin.charCodeAt(i);await trPdf(o,pz)}
        else if(/^image\//i.test(p.type))pz.innerHTML=`<img style="max-width:100%" src="data:${esc(p.type)};base64,${p.b64}">`;
        else pz.innerHTML=`<a class="mini" download="${esc(p.nom)}" href="data:${esc(p.type)};base64,${p.b64}">Télécharger ${esc(p.nom)}</a>`}catch(e){pz.innerHTML='<div class="sub">Pièce jointe illisible : '+esc(e.message)+'</div>'}})}
  catch(e){z.innerHTML='<div class="sub w">Lecture impossible : '+esc(e.message)+'</div>'}}
async function trPdf(o,zone){if(!window.pdfjsLib)await new Promise((ok,ko)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=ok;s.onerror=ko;document.head.appendChild(s)});
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const doc=await pdfjsLib.getDocument({data:o}).promise;zone.innerHTML=`<div class="sub">${doc.numPages} page(s)</div>`;
  for(let n=1;n<=doc.numPages;n++){const pg=await doc.getPage(n),vp=pg.getViewport({scale:1.6}),c=document.createElement('canvas');c.width=vp.width;c.height=vp.height;c.style.width='100%';zone.appendChild(c);await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise}}
function brancherTriSerie(){const maj=()=>{const n=document.querySelectorAll('.mCh:checked').length,e=$('#mN');if(e)e.textContent=n};maj();
  const re=()=>{const y=scrollY;courrier();scrollTo(0,y)};
  document.querySelectorAll('#trF button').forEach(b=>b.onclick=()=>{TRS.f=b.dataset.f;trSauver();courrier()});
  const q=$('#trQ');if(q)q.onchange=()=>{TRS.q=q.value;trSauver();re()};
  document.querySelectorAll('.mCh').forEach(c=>c.onchange=()=>{TRS.k[c.dataset.id]=c.checked;trSauver();maj()});
  document.querySelectorAll('.trDec').forEach(s=>s.onchange=()=>{TRS.c[s.dataset.id]=s.value;delete TRS.m[s.dataset.id];trSauver();re()});
  document.querySelectorAll('.trCom').forEach(s=>s.onchange=()=>{TRS.m[s.dataset.id]=s.value;trSauver()});
  document.querySelectorAll('.trLire').forEach(b=>b.onclick=()=>trLire(b.dataset.id,b.dataset.cible));
  document.querySelectorAll('.trVoir').forEach(b=>b.onclick=()=>{TRS.f='tout';TRS.q='';trSauver();courrier();setTimeout(()=>{const e=document.getElementById('tr_'+b.dataset.id);if(e){e.scrollIntoView({block:'start'});e.style.outline='3px solid var(--orange)';setTimeout(()=>e.style.outline='',4000)}},50)});
  const tt=$('#mTout');if(tt)tt.onclick=()=>{const all=[...document.querySelectorAll('.mCh')],on=all.some(c=>!c.checked);all.forEach(c=>{c.checked=on;TRS.k[c.dataset.id]=on});trSauver();maj()};
  const valeur=id=>{const s=document.querySelector(`.trDec[data-id="${CSS.escape(id)}"]`),c=document.querySelector(`.trCom[data-id="${CSS.escape(id)}"]`);let d=s?s.value:'',m=c?c.value.trim():'';if(d==='Déjà payé'){d='Information';if(!/PAY/i.test(m))m='DÉJÀ PAYÉ'+(m?' — '+m:'')}return [d,m]};
  const dec=async(id,st)=>{const J=crJeton();if(!J)throw new Error('code Tri & RJ à saisir dans « Boîte mail »');const [d,m]=st==='Validé'?valeur(id):['',(document.querySelector(`.trCom[data-id="${CSS.escape(id)}"]`)||{}).value||''];
    const r=await crAppel('mob_decider',[J,id,st,d,'',m]);const f=(CR.fiches||[]).find(x=>x['ID']===id);if(f){f['Statut']=r&&r.statut||st;f['Décision finale']=r&&r.finale||d;f['Commentaire Pierre']=m}
    TRS.ok=TRS.ok||{};TRS.ok[id]=1;const el=document.getElementById('tr_'+id);if(el)el.style.opacity='.35'};
  const b=$('#mL1');if(b)b.onclick=async()=>{const ids=[...document.querySelectorAll('.mCh:checked')].map(c=>c.dataset.id);if(!ids.length)return;
    const sr=ids.filter(id=>valeur(id)[0]==='Suivi RJ');if(sr.length&&!confirm(`${sr.length} fiche(s) cochée(s) seront AJOUTÉES au suivi RJ (à payer). Continuer ?`))return;b.disabled=true;let ok=0,ko=0;
    for(const id of ids){try{await dec(id,'Validé');ok++}catch(e){ko++;$('#mProg').textContent=e.message}$('#mProg').textContent=`${ok+ko} / ${ids.length} traitées${ko?' · '+ko+' en erreur':''}`}
    toast(ok+' fiche(s) validée(s)');b.disabled=false;ids.forEach(id=>{delete TRS.k[id]});trSauver();setTimeout(()=>{chargerCR(true).then(()=>{if(vue==='cou'&&sousCou==='tri')re()})},300)};
  document.querySelectorAll('.mOk,.mNo').forEach(x=>x.onclick=async()=>{x.disabled=true;try{await dec(x.dataset.id,x.classList.contains('mOk')?'Validé':'Refusé');toast(x.classList.contains('mOk')?'Validé':'Gardé à revoir')}catch(e){toast('Non enregistré : '+e.message);x.disabled=false}});
  brancherLiens()}


Object.assign(window,{trTout:trTout,vueTriSerie:vueTriSerie,brancherTriSerie:brancherTriSerie,lotsMails:lotsMails,trAnalyse:trAnalyse,trBanque:trBanque,trDoublons:trDoublons,trCarte:trCarte,_TRS:TRS});})();