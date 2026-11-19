(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const A = (p) => "assets/" + p;
  const byId = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
  const HAS_ICON = new Set(["curator"]);
  const hasIcon = (p) => p.group !== "docker" || HAS_ICON.has(p.id);
  const hasFanart = (p) => p.group !== "docker";
  const verChip = (p) => (p.version ? `<span class="chip ver" data-ver="${p.id}">${esc(p.version)}</span>` : "");

  /* ---------- cards ---------- */
  function card(p) {
    const art = hasFanart(p)
      ? `<img src="${A(p.id + "/fanart.webp")}" alt="" loading="lazy" width="1600" height="900">`
      : p.shots.length
        ? `<img src="${A(p.shots[0][0])}" alt="" loading="lazy" width="1600" height="870">`
        : `<div class="plate">${esc(p.name)}</div>`;
    const icon = hasIcon(p)
      ? `<img class="card-icon" src="${A(p.id + "/icon.webp")}" alt="" loading="lazy" width="64" height="64">`
      : `<span class="card-icon none"></span>`;
    return `<a class="card" href="#/${p.id}">
      <div class="card-art">${art}</div>
      <div class="card-body">${icon}
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.tagline)}</p>
        <div class="card-meta"><span class="chip">${esc(p.kind)}</span>${verChip(p)}</div>
      </div></a>`;
  }
  for (const g of ["kodi", "aeon", "docker"]) {
    $("#grid-" + g).innerHTML = PROJECTS.filter((p) => p.group === g && !p.band).map(card).join("");
  }

  /* ---------- lightbox ---------- */
  const lb = $("#lightbox");
  let lbSet = [], lbAt = 0, lbFrom = null;
  function lbShow(i) {
    lbAt = (i + lbSet.length) % lbSet.length;
    $("#lb-img").src = A(lbSet[lbAt][0]);
    $("#lb-img").alt = lbSet[lbAt][1];
    $("#lb-cap").textContent = `${lbSet[lbAt][1]}  (${lbAt + 1} / ${lbSet.length})`;
    const many = lbSet.length > 1;
    $(".lb-prev").hidden = $(".lb-next").hidden = !many;
  }
  function lbOpen(set, i, from) { lbSet = set; lbFrom = from; lbShow(i); lb.showModal(); }
  $(".lb-close").onclick = () => lb.close();
  $(".lb-prev").onclick = () => lbShow(lbAt - 1);
  $(".lb-next").onclick = () => lbShow(lbAt + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.tagName === "FIGURE") lb.close(); });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") lbShow(lbAt - 1);
    if (e.key === "ArrowRight") lbShow(lbAt + 1);
  });
  lb.addEventListener("close", () => lbFrom && lbFrom.focus());
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-shot]");
    if (!b) return;
    lbOpen(byId[b.dataset.pid].shots, +b.dataset.shot, b);
  });
  /* pictures under /aeon/ have an 800 px thumbnail in /aeon/t/; the lightbox loads the full one */
  const thumb = (path) => (path.includes("/aeon/") ? path.replace(/([^/]+)$/, "t/$1") : path);
  const shotBtn = (p, i, cls = "shot") =>
    `<button type="button" class="${cls}" data-pid="${p.id}" data-shot="${i}" aria-label="Enlarge: ${esc(p.shots[i][1])}"><img src="${A(thumb(p.shots[i][0]))}" alt="${esc(p.shots[i][1])}" loading="lazy"></button>`;
  const idx = (p, name) => p.shots.findIndex((s) => s[0].includes("/" + name + "."));

  /* ---------- feature bands: Aeon Fuse (flagship), then Skippy, then Curator ---------- */
  function band(p, eyebrow, big, small, cta) {
    return `
    <div class="flag-body">
      <p class="eyebrow">${eyebrow} ${verChip(p)}</p>
      <div class="flag-title"><img src="${A(p.id + "/icon.webp")}" alt="" width="84" height="84"><h2 id="${p.group}-band-h">${esc(p.name)}</h2></div>
      <p class="sub">${esc(p.tagline)}</p>
      <ul>${(p.highlights || p.features.slice(0, 4)).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
      <div class="actions"><a class="btn primary" href="#/${p.id}">${cta}</a><a class="btn" href="${GH}${p.id}" rel="noopener">GitHub</a></div>
    </div>
    <div class="flag-shots">
      ${shotBtn(p, big, "")}
      <div class="row">${small.map((i) => shotBtn(p, i, "")).join("")}</div>
    </div>`;
  }
  const skin = byId["skin.aeon.fuse"], sk = byId["service.skippy"];
  $("#band-aeon").innerHTML = band(skin, "Flagship · Kodi skin", idx(skin, "aeon_movies_list"), [idx(skin, "fg_shows_523"), idx(skin, "music_home_nowplaying")], "About Aeon Fuse");
  $("#band-skippy").innerHTML = band(sk, "Kodi service", 6, [0, 11], "About Skippy");
  const cur = byId["curator"];
  $("#band-curator").innerHTML = band(cur, "Docker app", 1, [0], "About Curator");
  $("#aeon-strip").innerHTML = skin.strip.map((n) => shotBtn(skin, idx(skin, n))).join("");

  /* ---------- hero screen ---------- */
  const slides = [
    ["skin.aeon.fuse", "aeon_movies_list"], ["service.skippy", 9], ["skin.aeon.fuse", "fg_movies_520"], ["kodi-nowplaying-multi", 1], ["curator", 1], ["skin.aeon.fuse", "music_strip_player"],
  ].map(([id, k]) => {
    const p = byId[id], i = typeof k === "number" ? k : idx(p, k);
    return { p, src: A(p.shots[i][0]), cap: p.shots[i][1] };
  });
  const frame = $("#screen-frame"), dots = $("#screen-dots"), cap = $("#screen-cap");
  frame.innerHTML = slides.map((s, i) => `<img src="${s.src}" alt="${i ? "" : esc(s.p.name + ": " + s.cap)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} width="1600" height="900">`).join("");
  dots.innerHTML = slides.map((s, i) => `<button type="button" aria-label="Show screenshot ${i + 1}: ${esc(s.p.name)}"></button>`).join("");
  let at = -1, timer = 0;
  function slide(i) {
    at = (i + slides.length) % slides.length;
    [...frame.children].forEach((im, n) => { im.classList.toggle("on", n === at); im.alt = n === at ? slides[n].p.name + ": " + slides[n].cap : ""; });
    [...dots.children].forEach((d, n) => d.setAttribute("aria-current", n === at));
    cap.innerHTML = `<b>${esc(slides[at].p.name)}</b> · ${esc(slides[at].cap)}`;
    cap.href = "#/" + slides[at].p.id;
  }
  const stop = () => { clearInterval(timer); timer = 0; };
  const play = () => { if (!timer && !matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => slide(at + 1), 5500); };
  dots.addEventListener("click", (e) => { const n = [...dots.children].indexOf(e.target.closest("button")); if (n >= 0) { stop(); slide(n); } });
  $("#screen").addEventListener("pointerenter", stop);
  $("#screen").addEventListener("pointerleave", play);
  $("#screen").addEventListener("focusin", stop);
  slide(0); play();

  /* ---------- detail ---------- */
  function links(p) {
    const out = [];
    if (p.inRepo) out.push(`<a class="btn primary" href="#install" data-home>Install from the Skippy Repo</a>`);
    if (!p.noGithub) out.push(`<a class="btn${p.inRepo ? "" : " primary"}" href="${GH}${p.id}" rel="noopener">GitHub repository</a>`);
    if (p.releases) out.push(`<a class="btn" href="${GH}${p.id}/releases" rel="noopener">Releases</a>`);
    if (p.inRepo) out.push(`<a class="btn" href="${REPO_TREE}${p.id}" rel="noopener">Zip files</a>`);
    if (!p.noGithub) out.push(`<a class="btn" href="${GH}${p.id}#readme" rel="noopener">Full README</a>`);
    return out.join("");
  }
  function installPanel(p) {
    if (p.run) return `<div class="panel"><h2>Run it</h2><ol>${p.run.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`;
    if (p.inRepo) return `<div class="panel"><h2>Install</h2><ol>
        <li>Install the <a href="#install" data-home>Skippy Repo</a> in Kodi.</li>
        <li>Open Add-ons › Install from repository › Skippy Repo.</li>
        <li>Choose ${esc(p.name)} and install.</li></ol></div>`;
    return `<div class="panel"><h2>Install</h2><p class="alt">Not in the Skippy Repo yet. The source is on GitHub.</p></div>`;
  }
  /* a project whose shots carry a group name (third item) gets one heading per group */
  function gallery(p) {
    if (!p.shots[0][2]) return `<div class="gallery">${p.shots.map((_, i) => shotBtn(p, i)).join("")}</div>`;
    let out = "", cur = null;
    p.shots.forEach((s, i) => {
      if (s[2] !== cur) {
        if (cur !== null) out += "</div>";
        cur = s[2];
        out += `<h3 class="gal-h">${esc(cur)}</h3><div class="gallery">`;
      }
      out += shotBtn(p, i);
    });
    return out + "</div>";
  }
  function detail(p) {
    /* fanart that carries the add-on's own name would repeat the title behind it */
    const named = ["service.audio.enforcer", "service.subtitle.enforcer", "script.ratings.updatarr", "skin.aeon.fuse", "script.aeon.helper", "screensaver.aeon.fuse"];
    const bg = named.includes(p.id) ? "" : hasFanart(p) ? A(p.id + "/fanart.webp") : p.shots.length ? A(p.shots[0][0]) : "";
    const facts = [...p.facts];
    if (p.license) facts.push(["Licence", p.license]);
    if (p.group !== "docker") facts.push(["Add-on id", p.id]);
    const others = PROJECTS.filter((o) => o.group === p.group && o.id !== p.id).slice(0, 3);
    return `
    <div class="d-hero">${bg ? `<img class="bg" src="${bg}" alt="">` : ""}
      <div class="d-head">
        <a class="back" href="#/" data-back>← All projects</a>
        <p class="eyebrow">${esc(p.kind)} ${verChip(p)}</p>
        <div class="d-title">${hasIcon(p) ? `<img src="${A(p.id + "/icon.webp")}" alt="" width="96" height="96">` : ""}<h1 tabindex="-1">${esc(p.name)}</h1></div>
        <p class="sub">${esc(p.tagline)}</p>
      </div>
    </div>
    <div class="d-cols">
      <div class="prose">
        <h2>What it does</h2>
        ${p.about.map((t) => `<p>${esc(t)}</p>`).join("")}
        ${p.note ? `<p class="note">${esc(p.note)}</p>` : ""}
        ${p.features.length ? `<h2>Features</h2><ul>${p.features.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}
        <h2>Screenshots</h2>
        ${p.shots.length ? gallery(p) : `<p class="empty">No screenshots of ${esc(p.name)} yet.</p>`}
      </div>
      <aside class="side" aria-label="Install and links">
        ${installPanel(p)}
        <div class="panel"><h2>Links</h2><div class="links">${links(p)}</div></div>
        ${facts.length ? `<div class="panel"><h2>Details</h2><dl class="facts">${facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>` : ""}
      </aside>
    </div>
    ${others.length ? `<div class="d-more"><h2>More ${p.group === "docker" ? "Docker apps" : "for Kodi"}</h2><div class="grid">${others.map(card).join("")}</div></div>` : ""}`;
  }

  /* ---------- routing ---------- */
  const home = $("#home"), det = $("#detail");
  let homeY = 0, pendingAnchor = "";
  function route() {
    const h = location.hash;
    const id = h.startsWith("#/") ? decodeURIComponent(h.slice(2)) : "";
    const p = byId[id];
    if (p) {
      if (det.hidden) homeY = scrollY;
      home.hidden = true; det.hidden = false;
      det.innerHTML = detail(p);
      applyVersions();
      document.title = `${p.name} · jonnypuma`;
      scrollTo(0, 0);
      $("h1", det).focus({ preventScroll: true });
    } else {
      const was = !det.hidden;
      det.hidden = true; home.hidden = false; det.innerHTML = "";
      document.title = "jonnypuma · Kodi add-ons and media apps";
      const target = pendingAnchor || (h.length > 2 && !h.startsWith("#/") ? h : "");
      pendingAnchor = "";
      if (target && $(target)) $(target).scrollIntoView();
      else if (was) scrollTo(0, homeY);
    }
  }
  /* section links (#install …) clicked while a detail page is open */
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || det.hidden) return;
    const h = a.getAttribute("href");
    if (h.startsWith("#/")) return;
    e.preventDefault();
    pendingAnchor = h;
    if (location.hash === h) route(); else location.hash = h;
  });
  addEventListener("hashchange", route);

  /* ---------- copy ---------- */
  document.addEventListener("click", async (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const text = $(b.dataset.copy).textContent.trim();
    try { await navigator.clipboard.writeText(text); b.textContent = "Copied"; }
    catch { const r = document.createRange(); r.selectNodeContents($(b.dataset.copy)); getSelection().removeAllRanges(); getSelection().addRange(r); b.textContent = "Selected"; }
    setTimeout(() => (b.textContent = "Copy"), 1800);
  });

  /* ---------- live versions from the Kodi repository ---------- */
  const live = {};
  const cmp = (a, b) => { const x = a.split(".").map(Number), y = b.split(".").map(Number); for (let i = 0; i < 4; i++) { const d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; };
  function applyVersions() {
    document.querySelectorAll("[data-ver]").forEach((el) => { if (live[el.dataset.ver]) el.textContent = live[el.dataset.ver]; });
    const rv = live[REPO_ID];
    if (rv) {
      $("#repo-ver").textContent = rv;
      const z = $("#repo-zip"), name = `${REPO_ID}-${rv}.zip`;
      z.href = `${REPO_RAW}zips/${REPO_ID}/${name}`; z.textContent = name;
    }
  }
  fetch(REPO_RAW + "addons.xml").then((r) => (r.ok ? r.text() : Promise.reject())).then((t) => {
    const doc = new DOMParser().parseFromString(t, "application/xml");
    doc.querySelectorAll("addon").forEach((a) => {
      const id = a.getAttribute("id"), v = a.getAttribute("version");
      if (id && v && (!live[id] || cmp(v, live[id]) > 0)) live[id] = v;
    });
    /* never show a version older than the one this page was written for */
    for (const p of PROJECTS) if (live[p.id] && p.version && cmp(live[p.id], p.version) < 0) delete live[p.id];
    applyVersions();
  }).catch(() => {});

  route();
})();
