/* EN guide interactive: theme, nav, search, reveal */
(function(){
  const root=document.documentElement;
  try{root.setAttribute("data-theme",localStorage.getItem("hn-en-theme")||"dark");}catch(e){root.setAttribute("data-theme","dark");}
  document.addEventListener("DOMContentLoaded",()=>{
    const t=document.getElementById("themeToggle");
    const paint=()=>{if(t)t.textContent=(root.getAttribute("data-theme")==="dark")?"☀️ Light":"🌙 Dark";};
    paint();
    if(t)t.addEventListener("click",()=>{const n=root.getAttribute("data-theme")==="dark"?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("hn-en-theme",n);}catch(e){}paint();});
    const b=document.getElementById("burger"),n=document.getElementById("navList");
    if(b&&n)b.addEventListener("click",()=>{n.classList.toggle("open");b.textContent=n.classList.contains("open")?"✖ Close":"☰ Menu";});
    try{const pg=(location.pathname.split("/").pop()||"index.html").split("?")[0]||"index.html";
      document.querySelectorAll("#navList a, .topnav a").forEach(a=>{if(a.getAttribute("href")===pg)a.classList.add("active");});}catch(e){}
    const toTop=document.getElementById("toTop");
    const onS=()=>{if(toTop)toTop.classList.toggle("show",window.scrollY>500);};
    window.addEventListener("scroll",onS,{passive:true});onS();
    if(toTop)toTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
    document.querySelectorAll('[data-expand-all]').forEach(btn=>btn.addEventListener("click",()=>{
      const s=btn.closest(".article")||document;const all=s.querySelectorAll("details");
      const open=all.length&&Array.from(all).some(d=>!d.open);all.forEach(d=>d.open=open);
      btn.textContent=open?"Collapse all":"Expand all";}));
    document.querySelectorAll("[data-bp]").forEach(btn=>btn.addEventListener("click",()=>{
      const box=document.getElementById(btn.getAttribute("data-bp"));if(!box)return;
      const h=box.style.display==="none";box.style.display=h?"":"none";
      btn.textContent=h?"Hide node breakdown ▲":"Show node breakdown ▼";}));
    // reveal on scroll
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
    // search index
    const idx=[
      ["index.html","home landing start mod kit install UE 4.20.3"],
      ["basics.html","map sky light landscape relievo directional atmosphere fog build lighting"],
      ["building.html","static mesh house build walls collision pivot snap"],
      ["puzzles.html","door key keycard boards crowbar HasKey IsLocked timeline"],
      ["water.html","water shark drain pool valve WaterDrained"],
      ["blueprints-basic.html","blueprint beginplay tick branch delay cast node pin"],
      ["day-night.html","day night cycle widget text sun timeline"],
      ["custom-assets.html","fbx import model material texture collision tv"],
      ["blueprints-advanced.html","interface dispatcher function array struct enum power generator"],
      ["custom-neighbor.html","neighbor skeletal skeleton retarget t-pose anim"],
      ["troubleshooting.html","errors fix accessed none cast failed loop fps"],
      ["community.html","community wiki share posts users"],
      ["hosting.html","hosting free github netlify vercel cloudflare deploy"]
    ];
    const inp=document.getElementById("siteSearch"),out=document.getElementById("searchResults");
    if(inp&&out){const render=q=>{q=(q||"").toLowerCase().trim();
      if(q.length<2){out.innerHTML="Type 2+ chars, e.g. key, light, water, Timeline…";return;}
      const h=idx.filter(x=>q.split(/\s+/).every(w=>x[1].includes(w)));
      out.innerHTML=h.length?h.map(x=>'<a href="'+x[0)+'">📄 '+x[0]+"</a>").join(""):"No matches. Try door, shark, FBX, save.";};
      inp.addEventListener("input",()=>render(inp.value));out.innerHTML="Type 2+ chars, e.g. key, light, water, Timeline…";}
    try{const p=location.pathname.split("/").pop()||"index.html";let s=[];try{s=JSON.parse(localStorage.getItem("hn-en-seen")||"[]");}catch(e){}
      if(!s.includes(p)){s.push(p);try{localStorage.setItem("hn-en-seen",JSON.stringify(s));}catch(e){}}
      const bdg=document.getElementById("progressBadge");if(bdg)bdg.textContent="Visited: "+s.length+" / 13";}catch(e){}
  });
})();
