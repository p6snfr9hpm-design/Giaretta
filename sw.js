// Minerva: avvio veloce e funzionamento anche con rete scarsa
const C="minerva-v3";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./manifest.json","./icon-192.png","./icon-512.png"])).catch(()=>{}))});
self.addEventListener("activate",e=>{e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim()})())});
const put=(r,res)=>{if(res&&(res.ok||res.type==="opaque")){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res};
self.addEventListener("fetch",e=>{
  const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin===location.origin){
    // pagina: prima la rete (cosi vedi sempre l'ultima versione), se manca o e lenta usa la copia salvata
    e.respondWith((async()=>{const net=fetch(r).then(res=>put(r,res));
      const timeout=new Promise(res=>setTimeout(()=>res(null),3500));
      const first=await Promise.race([net.catch(()=>null),timeout]);
      return first||await caches.match(r)||await caches.match("./")||net})());return}
  if(/(^|\.)(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|unpkg\.com)$/.test(u.hostname)){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>put(r,res))))}
});
