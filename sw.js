const C='pilotage-v97';const F=['./','./index.html','./plan.json','./plan_dessus.jpg','./zoning.json','./plan_clair.jpg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-180.png','./3d.html','./model-viewer.min.js','./meshopt_decoder.js','./draco_decoder.wasm','./draco_wasm_wrapper.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(F)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
const LOURD=/\.(glb|wasm)$|model-viewer\.min\.js$|draco_|meshopt_/;
/* Ouverture instantanée : on sert la copie de l'appareil tout de suite, et on met à jour en arrière-plan.
   Si l'application a changé, la page affiche « Nouvelle version prête ». */
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
 if(LOURD.test(u.pathname)&&!u.searchParams.has('r')){e.respondWith(caches.open(C).then(c=>c.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}))));return}
 if(u.searchParams.has('frais')){e.respondWith(fetch(e.request,{cache:'no-cache'}).catch(()=>caches.match(new Request(u.origin+u.pathname))));return}
 const cle=new Request(u.origin+u.pathname);
 e.respondWith(caches.open(C).then(async c=>{const m=await c.match(cle);
   const net=fetch(e.request,{cache:'no-cache'}).then(async r=>{if(r.ok){const old=m?await m.clone().text():null;const cp=r.clone();const nv=await cp.clone().text();await c.put(cle,cp);
     if(old!==null&&old!==nv&&/\.html$|\/$/.test(u.pathname)){const cl=await self.clients.matchAll();cl.forEach(x=>x.postMessage('maj'))}}return r}).catch(()=>m);
   if(m){e.waitUntil(net);return m}return net}))});
