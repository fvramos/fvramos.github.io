(() => {
  "use strict";
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const read = async path => { const response = await fetch(path); if (!response.ok) throw new Error("Could not load " + path); return response.json(); };
  const link = (label, url, cls) => url ? '<a' + (cls ? ' class="' + esc(cls) + '"' : '') + ' href="' + esc(url) + '">' + esc(label) + '</a>' : esc(label);
  const runs = list => (list || []).map(x => x.url ? link(x.text, x.url) : esc(x.text)).join("");
  const sectionHeading = (title, href, label) => '<div class="sect"><h2>' + esc(title) + '</h2>' + (href ? '<a class="section-more" href="' + esc(href) + '">' + esc(label || "More →") + '</a>' : "") + '</div>';
  function renderProfile(d) {
    return '<section id="about"><div class="hero"><img class="portrait" src="' + esc(d.cover_image) + '" alt="' + esc(d.cover_alt) + '"><div><h1>' + esc(d.name) + '</h1><p class="role">' + esc(d.role) + '</p><p class="role">' + esc(d.secondary_role) + '</p><p class="affil">' + (d.affiliations || []).map((x,i) => (i ? '<span aria-hidden="true"> · </span>' : '') + link(x.name,x.url)).join("") + '</p><p class="bio">' + esc(d.intro) + '</p></div></div></section>';
  }
  function renderBiography(d) { return '<section id="biography">' + sectionHeading(d.title) + (d.paragraphs || []).map(p => '<p>' + runs(p) + '</p>').join("") + '</section>'; }
  function renderContact(d) { return '<section id="contact">' + sectionHeading(d.title) + '<dl class="contact"><div><dt>Email</dt><dd><a href="mailto:' + esc(d.email) + '">' + esc(d.email) + '</a></dd></div><div><dt>Office</dt><dd>' + esc(d.office) + '<br>' + (d.address || []).map(esc).join("<br>") + '</dd></div></dl></section>'; }
  function renderTeachingPreview(d) { return '<section id="teaching">' + sectionHeading(d.title,"teaching.html","Teaching history →") + '<ul class="teaching">' + (d.courses || []).map(c => '<li>' + link(c.name,c.url) + '<span class="course-year">' + esc(c.academic_year) + '</span></li>').join("") + '</ul><p>' + esc(d.programme_coordination) + '</p><p class="student-note">For Computer Organization (OC) students: ' + link(d.cache_simulation.label,d.cache_simulation.url) + ' to explore cache behavior.</p></section>'; }
  function renderTeam(d) {
    const phd = (d.phd_students || []).map(p => '<article>' + (p.photo ? '<img class="person-photo" src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" width="88" height="88" loading="lazy">' : '') + '<h3>' + link(p.name,p.url) + '</h3><span class="meta">' + esc(p.status) + '</span><p>' + esc(p.summary) + (p.co_advisers?.length ? '<br>Co-advised with ' + p.co_advisers.map(c => link(c.name,c.url) + ' (' + esc(c.affiliation) + ')').join(" and ") + '.' : '') + '</p></article>').join("");
    const msc = (d.msc_groups || []).map(g => '<h4 class="team-theme">' + esc(g.theme) + '</h4><div class="people msc-people">' + g.students.map(s => '<article>' + (s.photo ? '<img class="person-photo" src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" width="88" height="88" loading="lazy">' : '') + '<h5>' + esc(s.name) + '</h5><span class="meta">' + esc(s.project) + '</span><p>' + esc(s.summary) + '</p></article>').join("") + '</div>').join("");
    return '<section id="lab">' + sectionHeading(d.title) + '<h3 class="team-heading">PhD students</h3><div class="people">' + phd + '</div><div class="msc-team" id="msc-students"><h3 class="team-heading">Current MSc students</h3>' + msc + '</div><p class="team-note">' + link(d.alumni_link.label,d.alumni_link.url) + ' →</p></section>';
  }
  function renderAlumniCard(x) {
    return '<li data-year="' + esc(x.year || "") + '">' + (x.photo ? '<img class="person-photo" src="' + esc(x.photo) + '" alt="' + esc(x.photo_alt || x.name) + '" width="88" height="88" loading="lazy">' : '') + '<h3>' + esc(x.name) + '</h3><p><span class="meta">' + esc(x.degree) + ' thesis · ' + esc(x.year || "") + ' · ' + esc(x.institution || "") + '</span> ' + (x.thesis_url ? link(x.thesis_title,x.thesis_url) : esc(x.thesis_title || "")) + '</p>' + (x.advisers?.length ? '<p class="supervision">Co-advised with ' + x.advisers.map(a => esc(a.name) + ' (' + esc(a.affiliation) + ')').join("; ") + '.</p>' : x.supervision ? '<p class="supervision">' + esc(x.supervision) + '</p>' : '') + (x.award ? '<p class="award-highlight">' + esc(x.award) + '</p>' : '') + (x.additional_links?.length ? '<p>' + x.additional_links.map(a => link(a.label,a.url)).join(" · ") + '</p>' : '') + '</li>';
  }
  function renderRecentAlumni(d, alumni) {
    const all = [...(alumni.graduates?.PhD || []), ...(alumni.graduates?.MSc || [])].sort((a,b) => (b.year || 0) - (a.year || 0)).slice(0,d.count || 3);
    const years = [...new Set(all.map(x => x.year))];
    return '<section id="recent-alumni">' + sectionHeading(d.title,"alumni.html","All alumni →") + years.map(y => '<span class="meta">' + esc(y) + '</span><ul class="alumni-list recent-alumni">' + all.filter(x => x.year === y).map(renderAlumniCard).join("") + '</ul>').join("") + '</section>';
  }
  function renderHighlights(d) { return '<section id="highlights">' + sectionHeading(d.title) + '<div class="highlights">' + d.items.map(x => '<article>' + (x.figures?.length === 1 ? '<a class="research-figure" href="' + esc(x.figures[0].src) + '" aria-label="Enlarge figure"><img class="research-image" src="' + esc(x.figures[0].src) + '" alt="' + esc(x.figures[0].alt) + '" loading="lazy"></a>' : x.figures?.length > 1 ? '<div class="peregrine-figures">' + x.figures.map(f => '<a class="research-figure" href="' + esc(f.src) + '" aria-label="Enlarge figure"><img class="research-image" src="' + esc(f.src) + '" alt="' + esc(f.alt) + '" loading="lazy"></a>').join("") + '</div>' : '') + '<span class="meta">' + esc(x.tag) + '</span><h3>' + link(x.title,x.url) + '</h3><p>' + esc(x.summary) + '</p>' + (x.links?.length ? link(x.links.at(-1).label,x.links.at(-1).url) : '') + '</article>').join("") + '</div></section>'; }
  function renderService(d) { return '<section id="service">' + sectionHeading(d.title,"community.html","All community service →") + d.groups.map(g => '<h3 class="subheading">' + esc(g.title) + '</h3><ul class="service-list">' + g.items.map(i => '<li>' + runs(i) + '</li>').join("") + '</ul>').join("") + '</section>'; }
  function renderNewsItem(item) {
    let media = "";
    if (item.icon === "reading") media = '<svg class="news-symbol" viewBox="0 0 180 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Reading and discussing research"><g fill="none" stroke="#325c70" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M90 35C72 23 53 24 35 30v58c20-6 37-4 55 7 18-11 35-13 55-7V30c-18-6-37-7-55 5v60"/><path d="M48 43c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m-29 9c10-2 19 0 29 5m26-28c10-5 19-7 29-5m-29 19c10-5 19-7 29-5m-29 19c10-5 19-7 29-5"/></g></svg>';
    else if (item.image) { const img = '<img class="' + esc(item.image_class || "news-image") + '" src="' + esc(item.image) + '" alt="' + esc(item.image_alt || "") + '"' + (item.width ? ' width="' + esc(item.width) + '"' : "") + (item.height ? ' height="' + esc(item.height) + '"' : "") + ' loading="lazy">'; media = item.image_link ? '<a href="' + esc(item.image_link) + '">' + img + '</a>' : img; }
    return '<article class="news-item">' + media + '<div><time datetime="' + esc(item.date) + '">' + esc(item.date_label) + '</time><h3>' + esc(item.title) + '</h3><p>' + runs(item.body) + '</p></div></article>';
  }
  async function renderNews(root, limit) {
    const data = await read("data/news.json"), items = data.items.slice().sort((a,b) => b.date.localeCompare(a.date)), selected = limit ? items.slice(0,limit) : items;
    if (limit) root.innerHTML = selected.map(renderNewsItem).join("");
    else { const years = [...new Set(selected.map(x => x.date.slice(0,4)))]; root.innerHTML = years.map(y => '<h2 class="news-year">' + esc(y) + '</h2>' + selected.filter(x => x.date.startsWith(y)).map(renderNewsItem).join("")).join(""); }
  }
  async function renderPublications(root) {
    const data = await read("data/publications.json"), items = data.items.slice().sort((a,b) => b.year-a.year || a.title.localeCompare(b.title)), years = [...new Set(items.map(x => x.year))];
    const nav = '<nav class="years" aria-label="Publication years">' + years.map(y => '<a href="#year-' + esc(y) + '">' + esc(y) + '</a>').join("") + '</nav>';
    const content = years.map(y => '<h2 class="pub-year" id="year-' + esc(y) + '">' + esc(y) + '</h2><ul class="publications">' + items.filter(x => x.year===y).map(x => '<li><a class="paper-title" href="' + esc(x.url) + '">' + esc(x.title) + '</a><span class="authors">' + (Array.isArray(x.authors) ? x.authors.map(esc).join(", ") : esc(x.authors)) + '</span><span class="pub-venue">' + esc(x.venue) + '</span></li>').join("") + '</ul>').join("");
    root.innerHTML = nav + content;
  }
  async function renderProjects(root) {
    const d = await read("data/projects.json"), linkName = (name,url) => url ? link(name,url) : esc(name);
    const cards = list => list.map(x => '<article class="project"><h2>' + linkName(x.name,x.url) + '</h2>' + (x.role ? '<span class="meta">' + esc(x.role) + '</span>' : '') + (x.title ? '<h3>' + esc(x.title) + '</h3>' : '') + (x.description ? '<p>' + esc(x.description) + '</p>' : '') + (x.details_url ? link(x.details_label || "Project details →",x.details_url) : '') + '</article>').join("");
    root.innerHTML = cards(d.current) + '<h2 class="pub-year">Earlier funded projects</h2>' + cards(d.earlier) + '<h3 class="subheading">Other European projects</h3><ul class="service-list">' + d.other_european.map(x => '<li><strong>' + esc(x.name) + '</strong> — ' + esc(x.details) + '</li>').join("") + '</ul><h2 class="pub-year">Research systems &amp; tools</h2><ul class="service-list">' + d.systems.map(x => '<li>' + linkName(x.name,x.url) + ' — ' + esc(x.description) + '</li>').join("") + '</ul>';
  }
  function renderGenericPage(d) {
    return '<h1 class="page-title">' + esc(d.title) + '</h1>' + (d.intro ? '<p>' + esc(d.intro) + '</p>' : '') + (d.links?.length ? '<p>' + d.links.map(x => link(x.label + " →",x.url)).join(" · ") + '</p>' : '') + (d.sections || []).map(s => '<section><h2 class="pub-year">' + esc(s.title) + '</h2>' + (s.groups || []).map(g => (g.title ? '<h3 class="subheading">' + esc(g.title) + '</h3>' : '') + (g.items?.length ? '<ul class="service-list">' + g.items.map(i => '<li>' + runs(i.content) + '</li>').join("") + '</ul>' : '')).join("") + '</section>').join("");
  }
  function renderAlumniPage(d) {
    const yearsFor = list => [...new Set(list.map(x => x.year))].sort((a,b) => b-a);
    const section = (degree,list) => '<section><h2 class="alumni-degree">' + esc(degree) + ' alumni</h2>' + yearsFor(list).map(y => '<section class="alumni-year"><h3 class="pub-year">' + esc(y) + '</h3><ul class="alumni-list">' + list.filter(x => x.year===y).map(renderAlumniCard).join("") + '</ul></section>').join("") + '</section>';
    const researchers = '<section><h2 class="alumni-degree">Former researchers</h2><ul class="alumni-list">' + (d.researchers || []).map(x => '<li><h3>' + link(x.name,x.url) + '</h3><p class="meta">' + esc(x.role) + '</p><p>' + esc(x.summary) + '</p>' + (x.previous_work ? '<p>' + esc(x.previous_work) + '</p>' : '') + '</li>').join("") + '</ul></section>';
    return '<h1 class="page-title">' + esc(d.title) + '</h1><p>' + esc(d.intro) + '</p>' + researchers + section("PhD",d.graduates.PhD || []) + section("MSc",d.graduates.MSc || []);
  }
  function renderCache(d) {
    const c = d.copy;
    const controls = d.controls.map(x => '<label>' + esc(x.label) + '<select id="' + esc(x.id) + '">' + x.options.map(o => '<option value="' + esc(o.value) + '"' + (o.selected ? ' selected' : '') + '>' + esc(o.label) + '</option>').join("") + '</select></label>').join("");
    const speeds = d.speed.options.map(o => '<option value="' + esc(o.value) + '"' + (o.selected ? ' selected' : '') + '>' + esc(o.label) + '</option>').join("");
    const buttons = d.transport.map(b => '<button id="' + esc(b.id) + '"' + (b.class ? ' class="' + esc(b.class) + '"' : '') + '>' + esc(b.label) + '</button>').join("");
    return '<h1>' + esc(d.title) + '</h1><p class="intro">' + esc(d.intro) + '</p><div class="presets"><span class="small">' + esc(c.try_example) + '</span>' + d.presets.map(p => '<button data-preset="' + esc(p.id) + '">' + esc(p.label) + '</button>').join("") + '</div><div class="controls">' + controls + '</div><div class="transport">' + buttons + '<label>' + esc(c.animation_speed) + '<select id="speed">' + speeds + '</select></label><span id="progress"></span></div><div class="panel status" id="status" role="status" aria-live="polite"><div id="phase"></div><p id="detail"></p></div><div class="scene" id="scene"><section class="panel"><h2>' + esc(c.memory_title) + '</h2><p class="small">' + esc(c.memory_description) + '</p><div id="memory" class="memory"></div><div class="legend"><span><i class="key"></i>' + esc(c.resident_label) + '</span><span><i class="key blue"></i>' + esc(c.selected_label) + '</span></div></section><section class="panel"><h2>' + esc(c.cache_title) + '</h2><p id="geometry" class="small"></p><div class="tablewrap"><table><thead><tr>' + c.table_headers.map(x => '<th>' + esc(x) + '</th>').join("") + '</tr></thead><tbody id="cache"></tbody></table></div><p class="small">' + esc(c.cache_dirty_note) + '</p></section><svg class="flow" id="flow" aria-hidden="true"><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8" style="fill:#2359c4;stroke:none;animation:none"/></marker></defs><path id="flowpath" marker-end="url(#arrow)"/></svg></div><div class="below"><section class="panel"><h2>' + esc(c.accesses_title) + '</h2><div id="trace"></div><p id="mapping" class="small"></p><p class="small">' + esc(c.accesses_note) + '</p></section><section class="panel"><h2>' + esc(c.results_title) + '</h2><div class="metrics">' + c.result_labels.map((x,i) => '<div>' + esc(x) + '<strong id="' + ["hits","misses","rate","wb"][i] + '">' + ["0","0","—","0"][i] + '</strong></div>').join("") + '</div><div id="passstats" class="small" style="margin-top:12px"></div></section></div><details class="panel"><summary>' + esc(d.guide.title) + '</summary>' + d.guide.paragraphs.map(p => '<p>' + runs(p) + '</p>').join("") + '</details>';
  }
  async function renderHomeSlot(slot) {
    const id = slot.dataset.homeSection, d = await read("data/home/" + id + ".json");
    let html = "";
    if (d.type === "profile") html = renderProfile(d);
    else if (d.type === "news_preview") html = '<section id="news">' + sectionHeading(d.title,d.all_news_url,"All news →") + '<div data-news-list data-limit="' + esc(d.limit) + '" aria-live="polite"></div></section>';
    else if (d.type === "team") html = renderTeam(d);
    else if (d.type === "alumni_preview") { const alumni = await read("data/alumni.json"); html = renderRecentAlumni(d,alumni); }
    else if (d.type === "teaching_preview") html = renderTeachingPreview(d);
    else if (d.type === "research_highlights") html = renderHighlights(d);
    else if (d.type === "service_preview") html = renderService(d);
    else if (d.type === "contact") html = renderContact(d);
    else if (d.type === "biography") html = renderBiography(d);
    slot.outerHTML = html;
  }
  async function renderPage(main) {
    const id = main.dataset.jsonPage;
    let data, html = "";
    if (id === "cache-explorer") {
      data = await read("data/cache-explorer.json");
      html = renderCache(data);
    } else if (id === "alumni") {
      data = await read("data/alumni.json");
      html = renderAlumniPage(data);
    } else if (id === "teaching" || id === "community" || id === "awards-talks") {
      data = await read("data/" + id + ".json");
      html = renderGenericPage(data);
    } else if (id === "news") {
      data = await read("data/news.json");
      html = '<h1 class="page-title">' + esc(data.title || "All news") + '</h1>' + (data.intro ? '<p>' + esc(data.intro) + '</p>' : '') + '<div data-news-list aria-live="polite"></div>';
    } else if (id === "papers") {
      data = await read("data/publications.json");
      html = '<h1 class="page-title">' + esc(data.title) + '</h1><p>' + esc(data.intro) + '</p><p>' + data.links.map(x => link(x.label + " →",x.url)).join(" · ") + '</p><div data-publications aria-live="polite"></div>';
    } else if (id === "projects") {
      data = await read("data/projects.json");
      html = '<h1 class="page-title">' + esc(data.title) + '</h1><p>' + esc(data.intro) + '</p><div data-projects></div>';
    }
    main.innerHTML = html;
    document.dispatchEvent(new Event("site:content-loaded"));
  }
  async function initialize() {
    const slots = [...document.querySelectorAll("[data-home-section]")];
    await Promise.all(slots.map(async slot => { try { await renderHomeSlot(slot); } catch (error) { slot.textContent = "This section could not be loaded."; console.error(error); } }));
    const main = document.querySelector("main[data-json-page]");
    if (main) { try { await renderPage(main); } catch (error) { main.textContent = "This page could not be loaded."; console.error(error); } }
    const newsRoot = document.querySelector("[data-news-list]");
    if (newsRoot) { try { await renderNews(newsRoot,Number(newsRoot.dataset.limit || 0)); } catch (error) { newsRoot.textContent = "News could not be loaded."; console.error(error); } }
    const pubRoot = document.querySelector("[data-publications]");
    if (pubRoot) { try { await renderPublications(pubRoot); } catch (error) { pubRoot.textContent = "Publications could not be loaded."; console.error(error); } }
    const projectRoot = document.querySelector("[data-projects]");
    if (projectRoot) { try { await renderProjects(projectRoot); } catch (error) { projectRoot.textContent = "Projects could not be loaded."; console.error(error); } }
  }
  initialize();
})();