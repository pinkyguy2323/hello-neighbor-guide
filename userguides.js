/* User guides mini-wiki: full tutorials added in-browser, no repo edits.
   Shared across EN+RU via same cloud backend (lang field). Local fallback. */
(function(){
  const LS="hn-userguides-v1";
  const isRU=(document.documentElement.lang||"en").toLowerCase().indexOf("ru")===0;
  const T=isRU?{
    all:"Все языки", needTitleBody:"Нужны заголовок и текст.", savedLocal:"Сохранено локально ✓.",
    cloudOk:"Опубликовано в общее облако ✓ (видно всем).", cloudFail:"Запись в облако не удалась — проверьте ключи/таблицу.",
    modeLocal:"Режим: локальный (гайд видите только вы — экспорт/импорт или настройте Firebase/Supabase, см. Hosting/Хостинг).",
    noPosts:"Пока пусто. Станьте первым — форма ниже.", beFirst:"", like:"❤ Полезно", nFound:"Ничего не найдено."
  }:{
    all:"All languages", needTitleBody:"Title and body required.", savedLocal:"Saved locally ✓.",
    cloudOk:"Published to shared cloud ✓ (visible to everyone).", cloudFail:"Cloud write failed — check keys/table.",
    modeLocal:"Mode: local (only you see guides — export/import or configure Firebase/Supabase, see Hosting).",
    noPosts:"Empty yet. Be the first — form below.", beFirst:"", like:"❤ Useful", nFound:"Nothing found."
  };
  const SEED=[
    {id:"ug-seed1",title:isRU?"Пример: бесшумный гудок-пугалка":"Example: silent scare-horn",author:"Guide team",lang:isRU?"ru":"en",cat:"Interaction",diff:isRU?"Средне":"Medium",tags:isRU?"гудок,ЛКМ,AI":"horn,LMB,AI",body:isRU?"Шаг 1: Fire = ЛКМ. Шаг 2: проверка HasItem + HeldRef. Шаг 3: Play Sound at Location + Make Noise 1.0 — сосед идёт проверять. Кулдаун 0.4с.":"Step 1: Fire = LMB. Step 2: HasItem + HeldRef gate. Step 3: Play Sound at Location + Make Noise 1.0 — Neighbor investigates. Cooldown 0.4s.",created:Date.now()-86400000,likes:7},
    {id:"ug-seed2",title:isRU?"Пример: меню мода за 10 минут":"Example: mod menu in 10 minutes",author:"Guide team",lang:isRU?"ru":"en",cat:"Menu",diff:isRU?"Средне":"Medium",tags:"UMG,Open Level,Quit",body:isRU?"W_MainMenu: Canvas + 3 кнопки. Play → Open Level (точное имя!) → Remove from Parent. MenuMap: BeginPlay → Create → Viewport → UI Only + курсор. GameMode с пустой пешкой.":"W_MainMenu: Canvas + 3 buttons. Play → Open Level (exact name!) → Remove from Parent. MenuMap: BeginPlay → Create → Viewport → UI Only + cursor. GameMode with empty pawn.",created:Date.now()-3600000*6,likes:5}
  ];
  function load(){try{const a=JSON.parse(localStorage.getItem(LS)||"null");if(Array.isArray(a)&&a.length)return a;}catch(e){}
    try{localStorage.setItem(LS,JSON.stringify(SEED));}catch(e){}return SEED.slice();}
  function save(a){try{localStorage.setItem(LS,JSON.stringify(a));}catch(e){}}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function ts(t){try{return new Date(t).toLocaleString();}catch(e){return "";}}
  let CLOUD={mode:"local"};
  function detect(){const c=(window.HN_CONFIG||{});if(c.firebase&&c.firebase.projectId)CLOUD={mode:"firebase",cfg:c.firebase};
    else if(c.supabase&&c.supabase.url)CLOUD={mode:"supabase",cfg:c.supabase};else CLOUD={mode:"local"};}
  let fbDb=null;
  function fbInit(){return new Promise(res=>{if(fbDb)return res(fbDb);
    const l=s=>new Promise((a,b)=>{const e=document.createElement("script");e.src=s;e.onload=a;e.onerror=b;document.head.appendChild(e);});
    l("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js").then(()=>l("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js")).then(()=>{try{if(!firebase.apps.length)firebase.initializeApp(CLOUD.cfg);fbDb=firebase.firestore();res(fbDb);}catch(e){res(null);}}).catch(()=>res(null));});}
  function colName(){const c=(window.HN_CONFIG||{});return (c.guides&&(c.guides.collection||c.guides.table))||(CLOUD.mode==="supabase"?((CLOUD.cfg&&CLOUD.cfg.guidesTable)||"hn_userguides"):"hn_userguides");}
  async function cloudList(){if(CLOUD.mode==="firebase"){const db=await fbInit();if(!db)return null;
      const s=await db.collection(colName()).orderBy("created","desc").limit(100).get();
      return s.docs.map(d=>Object.assign({id:d.id},d.data()));}
    if(CLOUD.mode==="supabase"){const c=CLOUD.cfg;
      const r=await fetch(c.url+"/rest/v1/"+colName()+"?select=*&order=created.desc&limit=100",{headers:{apikey:c.anonKey,Authorization:"Bearer "+c.anonKey}});
      if(!r.ok)return null;return await r.json();}return null;}
  async function cloudAdd(p){if(CLOUD.mode==="firebase"){const db=await fbInit();if(!db)return false;
      await db.collection(colName()).add({title:p.title,author:p.author,lang:p.lang,cat:p.cat,diff:p.diff,tags:p.tags,body:p.body,created:p.created,likes:0});return true;}
    if(CLOUD.mode==="supabase"){const c=CLOUD.cfg;
      const r=await fetch(c.url+"/rest/v1/"+colName(),{method:"POST",headers:{apikey:c.anonKey,Authorization:"Bearer "+c.anonKey,"Content-Type":"application/json",Prefer:"return=minimal"},body:JSON.stringify({title:p.title,author:p.author,lang:p.lang,cat:p.cat,diff:p.diff,tags:p.tags,body:p.body,created:p.created,likes:0})});
      return r.ok;}return false;}
  document.addEventListener("DOMContentLoaded",async ()=>{
    detect();
    const list=document.getElementById("uguides"),status=document.getElementById("ugStatus");
    if(!list)return;
    const q=document.getElementById("ugq"),cat=document.getElementById("ugcat"),langF=document.getElementById("uglang");
    let posts=load();
    const setS=t=>{if(status)status.textContent=t;};
    setS(CLOUD.mode==="local"?T.modeLocal:"Mode: "+CLOUD.mode+" (shared).");
    try{const c=await cloudList();if(c&&c.length)posts=c;else if(CLOUD.mode!=="local")setS("Cloud OK but empty — showing local seeds. Publish to fill it.");}catch(e){if(CLOUD.mode!=="local")setS("Cloud error — local copy shown.");}
    function render(){
      const query=((q&&q.value)||"").toLowerCase(),c=(cat&&cat.value)||"",lf=(langF&&langF.value)||(isRU?"ru":"all");
      const f=posts.filter(p=>{if(c&&p.cat!==c)return false;if(lf!=="all"&&(p.lang||"en")!==lf)return false;
        if(!query)return true;return ((p.title||"")+" "+(p.body||"")+" "+(p.tags||"")).toLowerCase().includes(query);})
        .sort((a,b)=>(b.created||0)-(a.created||0));
      if(!f.length){list.innerHTML="<p style='color:var(--muted)'>"+(query?T.nFound:T.noPosts)+"</p>";return;}
      list.innerHTML=f.map(p=>"<article class='post'><h4>"+esc(p.title)+"</h4>"+
        "<div class='pmeta'>👤 "+esc(p.author||"anon")+" • "+esc(p.lang==="ru"?"RU":"EN")+" • "+esc(p.cat||"")+" • "+esc(p.diff||"")+" • "+esc(ts(p.created))+" • ❤ "+(p.likes||0)+"</div>"+
        "<p>"+esc(p.body)+"</p>"+(p.tags?"<div class='ptags'>#"+esc(String(p.tags).split(",").map(s=>s.trim()).filter(Boolean).join(" #"))+"</div>":"")+
        "<div style='margin-top:8px'><button class='btn' data-uglike='"+esc(p.id)+"'>"+T.like+" ("+(p.likes||0)+")</button></div></article>").join("");
      list.querySelectorAll("[data-uglike]").forEach(b=>b.addEventListener("click",()=>{const it=posts.find(x=>String(x.id)===String(b.getAttribute("data-uglike")));if(it){it.likes=(it.likes||0)+1;save(posts);render();}}));
    }
    if(q)q.addEventListener("input",render);if(cat)cat.addEventListener("change",render);if(langF)langF.addEventListener("change",render);
    render();
    const form=document.getElementById("ugform");
    if(form)form.addEventListener("submit",async e=>{e.preventDefault();
      const p={id:"u"+Date.now(),title:document.getElementById("ugtitle").value.trim(),author:document.getElementById("ugauthor").value.trim()||"anon",
        lang:document.getElementById("uglang2").value,cat:document.getElementById("ugcat2").value,diff:document.getElementById("ugdiff").value,
        tags:document.getElementById("ugtags").value.trim(),body:document.getElementById("ugbody").value.trim(),created:Date.now(),likes:0};
      if(!p.title||!p.body){alert(T.needTitleBody);return;}
      let ok=false;if(CLOUD.mode!=="local"){try{ok=await cloudAdd(p);}catch(err){ok=false;}}
      posts.unshift(p);save(posts);render();form.reset();
      setS(ok?T.cloudOk:T.savedLocal+(CLOUD.mode!=="local"?" "+T.cloudFail:""));
      list.scrollIntoView({behavior:"smooth"});});
    const ex=document.getElementById("ugexport"),im=document.getElementById("ugimport");
    if(ex)ex.addEventListener("click",()=>{const b=new Blob([JSON.stringify(posts,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="hn-userguides.json";a.click();});
    if(im)im.addEventListener("change",()=>{const f=im.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const a=JSON.parse(r.result);if(Array.isArray(a)){posts=a;save(posts);render();}}catch(err){alert("Bad JSON");}};r.readAsText(f);});
  });
})();
