(() => {
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const read = async path => { const response = await fetch(path); if (!response.ok) throw new Error("Could not load " + path); return response.json(); };
  const renderNewsItem = item => {
    let media = "";
    if (item.icon === "reading") media = '<svg class="news-symbol" viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reading and discussing research"><g fill="none" stroke="#325c70" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M90 35C72 23 53 24 35 30v58c20-6 37-4 55 7 18-11 35-13 55-7V30c-18-6-37-7-55 5v60"/><path d="M48 43c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m26-28c10-5 19-7 29-5m-29 19c10-5 19-7 29-5m-29 19c10-5 19-7 29-5"/></g></svg>';
    else if (item.image) { const img = '<img class="' + esc(item.image_class || "news-image") + '" src="' + esc(item.image) + '" alt="' + esc(item.image_alt || "") + '"' + (item.width ? ' width="' + esc(item.width) + '"' : "") + (item.height ? ' height="' + esc(item.height) + '"' : "") + ' loading="lazy">'; media = item.image_link ? '<a href="' + esc(item.image_link) + '">' + img + '</a>' : img; }
    return '<article class="news-item">' + media + '<div><time datetime="' + esc(item.date) + '">' + esc(item.date_label) + '</time><h3>' + esc(item.title) + '</h3><p>' + (item.body_html || "") + '</p></div></article>';
  };
  const newsRoot = document.querySelector("[data-news-list]");
  if (newsRoot) read("data/news.json").then(items => {
    items.sort((a,b) => b.date.localeCompare(a.date)); const limit = Number(newsRoot.dataset.limit || 0), selected = limit ? items.slice(0,limit) : items;
    if (limit) newsRoot.innerHTML = selected.map(renderNewsItem).join("");
    else { const years = [...new Set(selected.map(x => x.date.slice(0,4)))]; newsRoot.innerHTML = years.map(year => '<h2 class="news-year">' + esc(year) + '</h2>' + selected.filter(x => x.date.startsWith(year)).map(renderNewsItem).join("")).join(""); }
  }).catch(error => { newsRoot.textContent = "News could not be loaded."; console.error(error); });
  const projectsRoot = document.querySelector("[data-projects]");
  if (projectsRoot) read("data/projects.json").then(data => {
    const link = (name,url) => url ? '<a href="' + esc(url) + '">' + esc(name) + '</a>' : esc(name);
    const cards = list => list.map(item => '<article class="project"><h2>' + link(item.name,item.url) + '</h2>' +
      (item.role ? '<span class="meta">' + esc(item.role) + '</span>' : "") +
      (item.title ? '<h3>' + esc(item.title) + '</h3>' : "") +
      (item.description ? '<p>' + esc(item.description) + '</p>' : "") +
      (item.details_url ? '<a href="' + esc(item.details_url) + '">' + esc(item.details_label || "Project details →") + '</a>' : "") +
      '</article>').join("");
    projectsRoot.innerHTML = cards(data.current) + '<h2 class="pub-year">Earlier funded projects</h2>' + cards(data.earlier) +
      '<h3 class="subheading">Other European projects</h3><ul class="service-list">' + data.other_european.map(item => '<li><strong>' + esc(item.name) + '</strong> — ' + esc(item.details) + '</li>').join("") + '</ul>' +
      '<h2 class="pub-year">Research systems &amp; tools</h2><ul class="service-list">' + data.systems.map(item => '<li>' + (item.url ? '<a href="' + esc(item.url) + '">' + esc(item.name) + '</a>' : esc(item.name)) + ' — ' + esc(item.description) + '</li>').join("") + '</ul>';
  }).catch(error => { projectsRoot.textContent = "Projects could not be loaded."; console.error(error); });
  const papersRoot = document.querySelector("[data-publications]");
  if (papersRoot) read("publications.json").then(items => {
    items.sort((a,b) => b.year-a.year || a.title.localeCompare(b.title)); const years = [...new Set(items.map(item => item.year))];
    const nav = '<nav class="years" aria-label="Publication years">' + years.map(year => '<a href="#year-' + year + '">' + year + '</a>').join("") + '</nav>';
    const sections = years.map(year => '<h2 class="pub-year" id="year-' + year + '">' + year + '</h2><ul class="publications">' + items.filter(item => item.year === year).map(item => '<li><a class="paper-title" href="' + esc(item.url) + '">' + esc(item.title) + '</a><span class="authors">' + esc(item.authors) + '</span><span class="pub-venue">' + esc(item.venue) + '</span></li>').join("") + '</ul>').join("");
    papersRoot.innerHTML = nav + sections;
  }).catch(error => { papersRoot.textContent = "Publications could not be loaded."; console.error(error); });
})();