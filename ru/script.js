/* Hello Neighbor Guide — интерактив */
(function(){
  const root = document.documentElement;
  // Тема: localStorage
  try{
    const saved = localStorage.getItem('hn-theme');
    if(saved) root.setAttribute('data-theme', saved);
    else root.setAttribute('data-theme','dark');
  }catch(e){ root.setAttribute('data-theme','dark'); }

  document.addEventListener('DOMContentLoaded', ()=>{
    // Переключатель темы
    const themeBtn = document.getElementById('themeToggle');
    if(themeBtn){
      const paint = ()=>{
        const cur = root.getAttribute('data-theme') || 'dark';
        themeBtn.textContent = cur === 'dark' ? '☀️ Светлая' : '🌙 Тёмная';
      };
      paint();
      themeBtn.addEventListener('click', ()=>{
        const cur = root.getAttribute('data-theme') || 'dark';
        const next = cur === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try{ localStorage.setItem('hn-theme', next); }catch(e){}
        paint();
      });
    }

    // Мобильное меню
    const burger = document.getElementById('burger');
    const navList = document.getElementById('navList');
    if(burger && navList){
      burger.addEventListener('click', ()=>{
        navList.classList.toggle('open');
        burger.textContent = navList.classList.contains('open') ? '✖ Закрыть' : '☰ Меню';
      });
    }

    // Подсветка активной страницы
    try{
      const page = (location.pathname.split('/').pop() || 'index.html').split('?')[0].split('#')[0] || 'index.html';
      document.querySelectorAll('#navList a').forEach(a=>{
        const href = a.getAttribute('href');
        if(href === page) a.classList.add('active');
      });
    }catch(e){}

    // Кнопка наверх + плавный скролл
    const toTop = document.getElementById('toTop');
    const onScroll = ()=>{
      if(!toTop) return;
      if(window.scrollY > 500) toTop.classList.add('show');
      else toTop.classList.remove('show');
    };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    if(toTop) toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (ev)=>{
        const id = a.getAttribute('href');
        if(id.length > 1){
          const el = document.querySelector(id);
          if(el){ ev.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); history.replaceState(null,'',id); }
        }
      });
    });

    // Сворачивание Blueprint-примеров
    document.querySelectorAll('[data-bp-toggle]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const targetId = btn.getAttribute('data-bp-toggle');
        const box = document.getElementById(targetId);
        if(!box) return;
        const hidden = box.style.display === 'none';
        box.style.display = hidden ? '' : 'none';
        btn.textContent = hidden ? 'Скрыть разбор нод ▲' : 'Показать разбор нод ▼';
      });
    });

    // Раскрывающиеся блоки: details уже нативные, добавим «открыть все / закрыть все»
    document.querySelectorAll('[data-expand-all]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const scope = btn.closest('.article') || document;
        const all = scope.querySelectorAll('details');
        const needOpen = Array.from(all).some(d=>!d.open);
        all.forEach(d=>{ d.open = needOpen; });
        btn.textContent = needOpen ? 'Свернуть все спойлеры' : 'Развернуть все спойлеры';
      });
    });

    // Простой поиск по материалам сайта (по индексу страниц)
    const index = [
      {f:'index.html', t:'Главная — Hello Neighbor Mod Kit большая база знаний'},
      {f:'basics.html', t:'Основы карты: небо свет рельеф Landscape Directional Light Sky Light Build Lighting'},
      {f:'building.html', t:'Объекты строительство дома Static Mesh Collision Pivot Snap'},
      {f:'puzzles.html', t:'Головоломки двери ключи ключ-карты доски лом HasKey IsLocked Timeline'},
      {f:'water.html', t:'Вода акула слив воды бассейн Post Process AI MoveTo WaterDrained'},
      {f:'blueprints-basic.html', t:'Blueprint для новичков Event BeginPlay Tick Branch Delay Print String Cast'},
      {f:'day-night.html', t:'День ночь таймеры текст Widget Print String Directional Light Timeline'},
      {f:'custom-assets.html', t:'Свои 3D-модели FBX импорт текстуры материал Collision телевизор'},
      {f:'blueprints-advanced.html', t:'Продвинутые Blueprint Interface Event Dispatcher Function Array Struct Enum электричество генератор'},
      {f:'custom-neighbor.html', t:'Как заменить соседа Skeletal Mesh Skeleton Retargeting T-Pose Animation Blueprint'},
      {f:'troubleshooting.html', t:'Частые ошибки Accessed None Cast Failed Infinite Loop свет Build Lighting розовый материал'}
    ];
    const input = document.getElementById('siteSearch');
    const out = document.getElementById('searchResults');
    if(input && out){
      const render = (q)=>{
        q = (q||'').trim().toLowerCase();
        if(q.length < 2){ out.innerHTML = '<span style="opacity:.7">Введите минимум 2 символа. Пример: ключ, свет, Timeline, вода, сосед…</span>'; return; }
        const words = q.split(/\s+/);
        const hits = index.filter(e=> words.every(w=> e.t.toLowerCase().includes(w)));
        if(!hits.length){ out.innerHTML = 'Ничего не найдено. Попробуйте: <b>дверь</b>, <b>свет</b>, <b>вода</b>, <b>Timeline</b>, <b>Collision</b>.'; return; }
        out.innerHTML = hits.map(h=>'<a href="'+h.f+'">📄 '+h.f+' — '+h.t.slice(0,120)+'</a>').join('');
      };
      input.addEventListener('input', ()=> render(input.value));
      out.innerHTML = '<span style="opacity:.7">Введите минимум 2 символа. Пример: ключ, свет, Timeline, вода, сосед…</span>';
    }

    // Сохранение прогресса прочтения (какая страница посещена)
    try{
      const page = location.pathname.split('/').pop() || 'index.html';
      let seen = JSON.parse(localStorage.getItem('hn-seen')||'[]');
      if(!seen.includes(page)){ seen.push(page); localStorage.setItem('hn-seen', JSON.stringify(seen)); }
      const badge = document.getElementById('progressBadge');
      if(badge) badge.textContent = 'Пройдено разделов: ' + seen.length + ' / 11';
    }catch(e){}
  });
})();
