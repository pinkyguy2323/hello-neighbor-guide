/* Community mini-wiki: localStorage first, cloud if configured (Firebase / Supabase) */
(function(){
  const LS_KEY="hn-en-community-v1";
  const SEED=[
    {id:"seed1",title:"My first working key-door",author:"Guide team",cat:"Puzzles",tags:"door,HasKey,Timeline",body:"Tip: keep HasKey on the PLAYER and IsLocked on the DOOR. If the door still says 'need key', add Print String right after pickup to see the value. 90% of the time the Cast goes to the wrong pawn class.",created:Date.now()-86400000*2,likes:12},
    {id:"seed2",title:"Shark stays in pool fix",author:"Guide team",cat:"Water",tags:"shark,Clamp,Tick",body:"Clamp X/Y every Tick and lock Z to depth. Multiply by DeltaTime or shark speed depends on FPS. Check WaterDrained flag before chasing or it keeps biting after drain.",created:Date.now()-86400000,likes:9},
    {id:"seed3",title:"Build lighting went dark — checklist",author:"Guide team",cat:"Lighting",tags:"Build,Lightmass,Static",body:"1) Add Lightmass Importance Volume around house 2) Preview quality 3) Rebuild. If still dark, switch lights to Movable to confirm it is a bake issue, then fix Static setup.",created:Date.now()-3600000*5,likes:15}
  ];
  function loadLocal(){try{const a=JSON.parse(localStorage.getItem(LS_KEY)||"null");if(Array.isArray(a)&&a.length)return a;}catch(e){}
    try{localStorage.setItem(LS_KEY,JSON.stringify(SEED));}catch(e){} return SEED.slice();}
  function saveLocal(a){try{localStorage.setItem(LS_KEY,JSON.stringify(a));}catch(e){}}
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function timeStr(t){try{return new Date(t).toLocaleString();}catch(e){return "";}}

  let CLOUD={mode:"local"};
  function detectCloud(){
    const cfg=(window.HN_CONFIG||{});
    if(cfg.firebase&&cfg.firebase.projectId){CLOUD={mode:"firebase",cfg:cfg.firebase};return;}
    if(cfg.supabase&&cfg.supabase.url){CLOUD={mode:"supabase",cfg:cfg.supabase};return;}
    CLOUD={mode:"local"};
  }

  // ---- Firebase (compat CDN loaded lazily) ----
  let fbDb=null;
  function fbInit(){
    return new Promise((resolve)=>{
      if(fbDb)return resolve(fbDb);
      const c=CLOUD.cfg;
      const load=(src)=>new Promise((res,rej)=>{const s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});
      load("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js").then(()=>
        load("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js")).then(()=>{
        try{
          if(!firebase.apps.length)firebase.initializeApp(c);
          fbDb=firebase.firestore();resolve(fbDb);
        }catch(e){resolve(null);}
      }).catch(()=>resolve(null));
    });
  }
  async function cloudList(){
    if(CLOUD.mode==="firebase"){
      const db=await fbInit();if(!db)return null;
      const snap=await db.collection("hn_posts").orderBy("created","desc").limit(100).get();
      return snap.docs.map(d=>Object.assign({id:d.id},d.data()));
    }
    if(CLOUD.mode==="supabase"){
      const c=CLOUD.cfg;
      const r=await fetch(c.url+"/rest/v1/"+(c.table||"hn_posts")+"?select=*&order=created.desc&limit=100",
        {headers:{apikey:c.anonKey,Authorization:"Bearer "+c.anonKey}});
      if(!r.ok)return null;
      return await r.json();
    }
    return null;
  }
  async function cloudAdd(post){
    if(CLOUD.mode==="firebase"){
      const db=await fbInit();if(!db)return false;
      await db.collection("hn_posts").add({title:post.title,author:post.author,cat:post.cat,tags:post.tags,body:post.body,created:post.created,likes:post.likes||0});
      return true;
    }
    if(CLOUD.mode==="supabase"){
      const c=CLOUD.cfg;
      const r=await fetch(c.url+"/rest/v1/"+(c.table||"hn_posts"),{method:"POST",
        headers:{apikey:c.anonKey,Authorization:"Bearer "+c.anonKey,"Content-Type":"application/json",Prefer:"return=minimal"},
        body:JSON.stringify({title:post.title,author:post.author,cat:post.cat,tags:post.tags,body:post.body,created:post.created,likes:post.likes||0})});
      return r.ok;
    }
    return false;
  }

  document.addEventListener("DOMContentLoaded",async ()=>{
    detectCloud();
    const list=document.getElementById("posts"),status=document.getElementById("cloudStatus");
    const q=document.getElementById("q"),cat=document.getElementById("fcat");
    if(!list)return;
    let posts=loadLocal();
    const setStatus=(t)=>{if(status)status.textContent=t;};
    setStatus(CLOUD.mode==="local"?"Mode: local (only you see posts — add Export/Import to share, or configure Firebase/Supabase, see Hosting page).":"Mode: "+CLOUD.mode+" (shared for everyone).");
    try{
      const cloud=await cloudList();
      if(cloud&&Array.isArray(cloud)&&cloud.length){posts=cloud;}
      else if(cloud&&cloud.length===0){/* keep local seeds until someone posts */}
      else if(CLOUD.mode!=="local")setStatus("Cloud configured but unreachable — showing local copy.");
    }catch(e){ if(CLOUD.mode!=="local")setStatus("Cloud error — showing local copy."); }

    function render(){
      const query=(q&&q.value||"").toLowerCase(),c=(cat&&cat.value||"");
      const f=posts.filter(p=>{
        if(c&&p.cat!==c)return false;
        if(!query)return true;
        return ((p.title||"")+" "+(p.body||"")+" "+(p.tags||"")).toLowerCase().includes(query);
      }).sort((a,b)=>(b.created||0)-(a.created||0));
      if(!f.length){list.innerHTML="<p style='color:var(--muted)'>No posts yet. Be the first — form below.</p>";return;}
      list.innerHTML=f.map(p=>
        "<article class='post'><h4>"+esc(p.title)+"</h4>"+
        "<div class='pmeta'>👤 "+esc(p.author||"anon")+" • "+esc(p.cat||"General")+" • "+esc(timeStr(p.created))+" • ❤ "+(p.likes||0)+"</div>"+
        "<p>"+esc(p.body)+"</p>"+
        (p.tags?"<div class='ptags'>#"+esc(String(p.tags).split(",").map(s=>s.trim()).join(" #"))+"</div>":"")+
        "<div style='margin-top:8px;display:flex;gap:8px'><button class='btn' data-like='"+esc(p.id)+"'>❤ Like</button></div></article>"
      ).join("");
      list.querySelectorAll("[data-like]").forEach(b=>b.addEventListener("click",()=>{
        const id=b.getAttribute("data-like");
        const it=posts.find(x=>String(x.id)===String(id));if(it){it.likes=(it.likes||0)+1;saveLocal(posts);render();}
      }));
    }
    if(q)q.addEventListener("input",render);
    if(cat)cat.addEventListener("change",render);
    render();

    const form=document.getElementById("postForm");
    if(form)form.addEventListener("submit",async (e)=>{
      e.preventDefault();
      const post={id:"l"+Date.now(),title:document.getElementById("ptitle").value.trim(),
        author:document.getElementById("pauthor").value.trim()||"anon",
        cat:document.getElementById("pcat").value,tags:document.getElementById("ptags").value.trim(),
        body:document.getElementById("pbody").value.trim(),created:Date.now(),likes:0};
      if(!post.title||!post.body){alert("Title and body required.");return;}
      let ok=false;
      if(CLOUD.mode!=="local"){try{ok=await cloudAdd(post);}catch(err){ok=false;}}
      posts.unshift(post);saveLocal(posts);render();form.reset();
      setStatus(ok?"Published to shared cloud ✓ (visible to everyone).":"Saved locally ✓."+(CLOUD.mode!=="local"?" Cloud write failed — check keys/table.":" To share with everyone, see Hosting page."));
      document.getElementById("posts").scrollIntoView({behavior:"smooth"});
    });

    const exp=document.getElementById("exportBtn"),imp=document.getElementById("importFile");
    if(exp)exp.addEventListener("click",()=>{
      const blob=new Blob([JSON.stringify(posts,null,2)],{type:"application/json"});
      const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="hn-community.json";a.click();
    });
    if(imp)imp.addEventListener("change",()=>{
      const f=imp.files[0];if(!f)return;
      const r=new FileReader();r.onload=()=>{try{const a=JSON.parse(r.result);if(Array.isArray(a)){posts=a;saveLocal(posts);render();}}catch(err){alert("Bad JSON");}};r.readAsText(f);
    });
  });
})();
