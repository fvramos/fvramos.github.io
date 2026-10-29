(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const read = async path => { const response = await fetch(path); if (!response.ok) throw new Error("Could not load " + path); return response.json(); };
  async function initialize() {
    const homeSections = [...document.querySelectorAll("[data-home-section]")];
    await Promise.all(homeSections.map(async slot => {
      try { const data = await read("data/home/" + slot.dataset.homeSection + ".json"); slot.outerHTML = data.html; }
      catch (error) { slot.textContent = "This section could not be loaded."; console.error(error); }
    }));
    const main = document.querySelector("main[data-json-page]");
    if (main) {
      try { const data = await read("data/pages/" + main.dataset.jsonPage + ".json"); main.innerHTML = data.html; document.dispatchEvent(new Event("site:content-loaded")); }
      catch (error) { main.textContent = "This page could not be loaded."; console.error(error); }
    }
    renderNews(); renderPublications(); renderProjects();
  }
  const renderNewsItem = item => {
    let media = "";
    if (item.icon === "reading") media = '<svg class="news-symbol" viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reading and discussing research"><g fill="none" stroke="#325c70" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M90 35C72 23 53 24 35 30v58c20-6 37-4 55 7 18-11 35-13 55-7V30c-18-6-37-7-55 5v60"/><path d="M48 43c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m26-28c10-5 19-7 29-5m-29 19c10-5 19-7 29-5m-29 19c10-5 19-7 29-5"/></g></svg>';
    else if (item.image) { const img = '<img class="' + esc(item.image_class || "news-image") + '" src="' + esc(item.image) + '" alt="' + esc(item.image_alt || "") + '"' + (item.width ? ' width="' + esc(item.width) + '"' : "") + (item.height ? ' height="' + esc(item.height) + '"' : "") + ' loading="lazy">'; media = item.image_link ? '<a href="' + esc(item.image_link) + '">' + img + '</a>' : img; }
    return '<article class="news-item">' + media + '<div><time datetime="' + esc(item.date) + '">' + esc(item.date_label) + '</time><h3>' + esc(item.title) + '</h3><p>' + (item.body_html || "") + '</p></div></article>';
  };
  function renderNews() {
    const root = document.querySelector("[data-news-list]"); if (!root) return;
    read("data/news.json").then(items => {
      items.sort((a,b) => b.date.localeCompare(a.date)); const limit = Number(root.dataset.limit || 0), selected = limit ? items.slice(0,limit) : items;
      if (limit) root.innerHTML = selected.map(renderNewsItem).join("");
      else { const years = [...new Set(selected.map(x => x.date.slice(0,4)))]; root.innerHTML = years.map(year => '<h2 class="news-year">' + esc(year) + '</h2>' + selected.filter(x => x.date.startsWith(year)).map(renderNewsItem).join("")).join(""); }
    }).catch(error => { root.textContent = "News could not be loaded."; console.error(error); });
  }
  function renderPublications() {
    const root=document.querySelector("[data-publications]"); if(!root)return;
    read("publications.json").then(items=>{
      items.sort((a,b)=>b.year-a.year||a.title.localeCompare(b.title)); const years=[...new Set(items.map(x=>x.year))];
      const nav='<nav class="years" aria-label="Publication years">'+years.map(y=>'<a href="#year-'+y+'">'+y+'</a>').join("")+'</nav>';
      const content=years.map(y=>'<h2 class="pub-year" id="year-'+y+'">'+y+'</h2><ul class="publications">'+items.filter(x=>x.year===y).map(x=>'<li><a class="paper-title" href="'+esc(x.url)+'">'+esc(x.title)+'</a><span class="authors">'+esc(x.authors)+'</span><span class="pub-venue">'+esc(x.venue)+'</span></li>').join("")+'</ul>').join("");
      root.innerHTML=nav+content;
    }).catch(error=>{root.textContent="Publications could not be loaded.";console.error(error);});
  }
  function renderProjects() {
    const root=document.querySelector("[data-projects]"); if(!root)return;
    read("data/projects.json").then(data=>{
      const link=(name,url)=>url?'<a href="'+esc(url)+'">'+esc(name)+'</a>':esc(name);
      const cards=list=>list.map(x=>'<article class="project"><h2>'+link(x.name,x.url)+'</h2>'+(x.role?'<span class="meta">'+esc(x.role)+'</span>':"")+(x.title?'<h3>'+esc(x.title)+'</h3>':"")+(x.description?'<p>'+esc(x.description)+'</p>':"")+(x.details_url?'<a href="'+esc(x.details_url)+'">'+esc(x.details_label||"Project details →")+'</a>':"")+'</article>').join("");
      root.innerHTML=cards(data.current)+'<h2 class="pub-year">Earlier funded projects</h2>'+cards(data.earlier)+'<h3 class="subheading">Other European projects</h3><ul class="service-list">'+data.other_european.map(x=>'<li><strong>'+esc(x.name)+'</strong> — '+esc(x.details)+'</li>').join("")+'</ul><h2 class="pub-year">Research systems &amp; tools</h2><ul class="service-list">'+data.systems.map(x=>'<li>'+(x.url?'<a href="'+esc(x.url)+'">'+esc(x.name)+'</a>':esc(x.name))+' — '+esc(x.description)+'</li>').join("")+'</ul>';
    }).catch(error=>{root.textContent="Projects could not be loaded.";console.error(error);});
  }
  initialize();
})();