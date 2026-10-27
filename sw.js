/* v99 (20/10/2026) : correction — depuis la v6.43, la page n'était plus jamais mise à jour sur l'appareil.
   Cause : fetch(requête de navigation, {options}) est refusé par le navigateur (TypeError), donc la mise à jour
   en arrière-plan échouait toujours et l'ancienne copie était servie indéfiniment.
   Désormais : la page (HTML) est lue sur le réseau en premier (3 s maximum), la copie de l'appareil ne sert
   qu'en secours (hors ligne ou réseau trop lent) ; les gros fichiers 3D restent en cache. */
const C='pilotage-v155';
const ESSENTIEL=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(ESSENTIEL.map(u=>fetch(u,{cache:'no-store'}).then(r=>{if(r.ok)return c.put(u,r)}).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const LOURD=/\.(glb|wasm)$|model-viewer\.min\.js$|draco_|meshopt_/;
const HTML=u=>/\.html$|\/$/.test(u.pathname);
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
  const cle=u.origin+u.pathname;
  if(LOURD.test(u.pathname)&&!u.searchParams.has('r')){e.respondWith(caches.open(C).then(c=>c.match(cle).then(m=>m||fetch(u.href).then(r=>{if(r.ok)c.put(cle,r.clone());return r}))));return}
  /* réseau d'abord (URL simple, jamais l'objet requête de navigation avec des options), copie en secours */
  e.respondWith((async()=>{const c=await caches.open(C);
    const net=fetch(u.href,{cache:'no-store',credentials:'same-origin'}).then(r=>{if(r.ok)c.put(cle,r.clone());return r});
    if(!HTML(u)&&!u.searchParams.has('frais')){const m=await c.match(cle);if(m){e.waitUntil(net.catch(()=>{}));return m}return net}
    const lent=new Promise(ok=>setTimeout(ok,3000,null));
    try{const r=await Promise.race([net,lent]);if(r)return r}catch(err){}
    const m=await c.match(cle);if(m){e.waitUntil(net.catch(()=>{}));return m}return net})());
});
