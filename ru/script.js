/* RU guide interactive: unified with EN v2 (theme, nav, search, reveal, bp toggles) */
(function(){
  const root=document.documentElement;
  try{root.setAttribute("data-theme",localStorage.getItem("hn-theme")||"dark");}catch(e){root.setAttribute("data-theme","dark");}
  document.addEventListener("DOMContentLoaded",()=>{
    const t=document.getElementById("themeToggle");
    const paint=()=>{if(t)t.textContent=(root.getAttribute("data-theme")==="dark")?"☀️ Светлая":"🌙 Тёмная";};
    paint();
    if(t)t.addEventListener("click",()=>{const n=root.getAttribute("data-theme")==="dark"?"light":"dark";root.setAttribute("data-theme",n);try{localStorage.setItem("hn-theme",n);}catch(e){}paint();});
    const b=document.getElementById("burger"),n=document.getElementById("navList");
    if(b&&n)b.addEventListener("click",()=>{n.classList.toggle("open");b.textContent=n.classList.contains("open")?"✖ Закрыть":"☰ Меню";});
    try{const pg=(location.pathname.split("/").pop()||"index.html").split("?")[0]||"index.html";
      document.querySelectorAll("#navList a").forEach(a=>{if(a.getAttribute("href")===pg)a.classList.add("active");});}catch(e){}
    const toTop=document.getElementById("toTop");
    const onS=()=>{if(toTop)toTop.classList.toggle("show",window.scrollY>500);};
    window.addEventListener("scroll",onS,{passive:true});onS();
    if(toTop)toTop.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
    document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",(ev)=>{
      const id=a.getAttribute("href");if(id.length>1){const el=document.querySelector(id);
        if(el){ev.preventDefault();el.scrollIntoView({behavior:"smooth"});history.replaceState(null,"",id);}}}));
    // both toggle styles: RU data-bp-toggle + EN data-bp
    document.querySelectorAll("[data-bp-toggle]").forEach(btn=>btn.addEventListener("click",()=>{
      const box=document.getElementById(btn.getAttribute("data-bp-toggle"));if(!box)return;
      const h=box.style.display==="none";box.style.display=h?"":"none";
      btn.textContent=h?"Скрыть разбор нод ▲":"Показать разбор нод ▼";}));
    document.querySelectorAll("[data-bp]").forEach(btn=>btn.addEventListener("click",()=>{
      const box=document.getElementById(btn.getAttribute("data-bp"));if(!box)return;
      const h=box.style.display==="none";box.style.display=h?"":"none";
      btn.textContent=h?"Скрыть разбор нод ▲":"Показать разбор нод ▼";}));
    document.querySelectorAll("[data-expand-all]").forEach(btn=>btn.addEventListener("click",()=>{
      const s=btn.closest(".article")||document;const all=s.querySelectorAll("details");
      const open=all.length&&Array.from(all).some(d=>!d.open);all.forEach(d=>d.open=open);
      btn.textContent=open?"Свернуть все спойлеры":"Развернуть все спойлеры";}));
    // reveal on scroll (new, harmless if no .reveal)
    try{
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.08});
      document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
    }catch(e){}
    const idx=[
      ["index.html","главная база знаний установка mod kit 4.20.3"],
      ["basics.html","карта небо свет рельеф landscape directional build lighting"],
      ["building.html","строительство дом static mesh collision pivot snap"],
      ["puzzles.html","двери ключи карты доски лом haskey islocked timeline"],
      ["water.html","вода акула слив бассейн waterdrained"],
      ["blueprints-basic.html","blueprint beginplay tick branch delay cast ноды"],
      ["day-night.html","день ночь виджет текст таймер widget"],
      ["custom-assets.html","fbx модель материал текстура collision телевизор"],
      ["blueprints-advanced.html","interface dispatcher function array struct enum генератор"],
      ["custom-neighbor.html","сосед skeletal skeleton retarget t-pose анимации"],
      ["troubleshooting.html","ошибки accessed none cast failed loop fps"],
      ["spawn-acts.html","спавн акты f объект spawn actor оригинальные уровни"],
      ["custom-interaction.html","интеракт лкм предмет звук удерживаемый"],
      ["custom-menu.html","меню мод виджет umg play quit"],
      ["guides.html","гайды пользователей вики добавить свой"]
    ];
    const inp=document.getElementById("siteSearch"),out=document.getElementById("searchResults");
    if(inp&&out){const render=q=>{q=(q||"").toLowerCase().trim();
      if(q.length<2){out.innerHTML="Введите 2+ символа: ключ, свет, вода, спавн, меню…";return;}
      const h=idx.filter(x=>q.split(/\s+/).every(w=>x[1].includes(w)));
      out.innerHTML=h.length?h.map(x=>'<a href="'+x[0]+'">📄 '+x[0]+"</a>").join(""):"Ничего. Попробуйте: дверь, акула, FBX, меню.";};
      inp.addEventListener("input",()=>render(inp.value));out.innerHTML="Введите 2+ символа: ключ, свет, вода, спавн, меню…";}
    try{const p=location.pathname.split("/").pop()||"index.html";let s=[];try{s=JSON.parse(localStorage.getItem("hn-seen")||"[]");}catch(e){}
      if(!s.includes(p)){s.push(p);try{localStorage.setItem("hn-seen",JSON.stringify(s));}catch(e){}}
      const bdg=document.getElementById("progressBadge");if(bdg)bdg.textContent="Пройдено разделов: "+s.length+" / 15";}catch(e){}
  });
})();
