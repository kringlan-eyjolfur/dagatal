// ===== Gögn (sýnidæmi – skiptu út fyrir raunveruleg gögn) =====
// stada: "stadfestur" | "ostadfestur"
const EVENTS = [
  { dags: "2027-01-08", titill: "Nýárstilboð", stada: "stadfestur", lysing: "Tilboð í völdum verslunum fyrstu vikur ársins.", mynd: "" },
  { dags: "2027-01-15", titill: "Vetrarútsölur hefjast", stada: "stadfestur", lysing: "Glæsileg vetrarútsala með tilboðum í öllum verslunum Kringlunnar.", mynd: "/img/vetrarutsala.jpg" },
  { dags: "2027-01-22", titill: "Kringluhjartað", stada: "ostadfestur", lysing: "Árleg góðgerðarvika í Kringlunni – saman gerum við meira.", mynd: "/img/hjarta.jpg" },
  { dags: "2027-01-29", titill: "Þorrastemning", stada: "ostadfestur", lysing: "Þorramatur og skemmtun á torginu.", mynd: "" },
  { dags: "2027-02-10", titill: "Öskudagur", stada: "stadfestur", lysing: "Börn í búningum syngja í verslunum.", mynd: "" },
  { dags: "2027-02-21", titill: "Konudagurinn", stada: "stadfestur", lysing: "Blóm og gjafir fyrir konudaginn.", mynd: "" },
  { dags: "2027-03-18", titill: "Páskaveisla", stada: "ostadfestur", lysing: "Páskaeggjaleit og fjör fyrir alla fjölskylduna.", mynd: "" },
];

// Fastir dagar (lokað / frí)
const FIXED = {
  "2027-01-01": "Nýársdagur – lokað",
  "2027-01-02": "Vörutalning – lokað",
  "2027-03-26": "Föstudagurinn langi – lokað",
  "2027-03-28": "Páskadagur – lokað",
};

const NEWS = [
  { dags: "2026-10-15", titill: "Nýtt markaðsár framundan", lysing: "Kynnum helstu áherslur í markaðsstarfi 2027.", mynd: "/img/frett-markadsar.jpg" },
  { dags: "2026-10-10", titill: "Jól í Kringlunni", lysing: "Undirbúningur hafinn – fleiri góðar stundir í desember.", mynd: "/img/frett-jol.jpg" },
  { dags: "2026-10-05", titill: "Frábær þátttaka á Ljósanótt", lysing: "Takk fyrir frábæra helgi í Kringlunni!", mynd: "/img/frett-ljosanott.jpg" },
];

// ===== Hjálparföll =====
const $ = (s) => document.querySelector(s);
const MANUDIR = ["Janúar", "Febrúar", "Mars", "Apríl", "Maí", "Júní", "Júlí", "Ágúst", "September", "Október", "Nóvember", "Desember"];
const DAGAR = ["MÁN", "ÞRI", "MIÐ", "FIM", "FÖS", "LAU", "SUN"];
const pad = (n) => String(n).padStart(2, "0");
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return { y, m: m - 1, d }; };
const langtDags = (s) => { const { y, m, d } = parse(s); return `${d}. ${MANUDIR[m].toLowerCase()} ${y}`; };
const stuttDags = (s) => { const { y, m, d } = parse(s); return `${d}. ${MANUDIR[m].slice(0, 3).toLowerCase()}. ${y}`; };
const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const STADA = { stadfestur: "Staðfestur viðburður", ostadfestur: "Óstaðfestur viðburður" };

// ===== Staða =====
let view = { y: 2027, m: 0 };
let selected = "2027-01-15";
let showAll = false;

// ===== Dagatal =====
function renderCalendar() {
  const { y, m } = view;
  $("#month-title").textContent = `${MANUDIR[m]} ${y}`;
  const first = new Date(Date.UTC(y, m, 1));
  const offset = (first.getUTCDay() + 6) % 7; // mánudagur fyrstur
  const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  const prevDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = Math.ceil((offset + daysInMonth) / 7) * 7;

  let html = DAGAR.map((d) => `<div class="dow">${d}</div>`).join("");
  for (let i = 0; i < cells; i++) {
    const n = i - offset + 1;
    if (n < 1 || n > daysInMonth) {
      const label = n < 1 ? prevDays + n : n - daysInMonth;
      html += `<div class="day out"><span class="num">${label}</span></div>`;
      continue;
    }
    const k = key(y, m, n);
    const ev = EVENTS.filter((e) => e.dags === k);
    const cls = ["day"];
    if (FIXED[k]) cls.push("fixed");
    if (k === selected) cls.push("selected");
    const dot = ev.length ? `<span class="dot ${ev.some((e) => e.stada === "stadfestur") ? "confirmed" : "tentative"}"></span>` : "";
    const aria = [`${n}. ${MANUDIR[m].toLowerCase()}`, FIXED[k], ...ev.map((e) => e.titill)].filter(Boolean).join(", ");
    html += `<button class="${cls.join(" ")}" data-k="${k}" aria-label="${esc(aria)}"><span class="num">${n}</span>${dot}</button>`;
  }
  $("#cal").innerHTML = html;
  renderDayInfo();
}

function renderDayInfo() {
  const ev = EVENTS.filter((e) => e.dags === selected);
  const parts = [];
  if (FIXED[selected]) parts.push(FIXED[selected]);
  ev.forEach((e) => parts.push(`${e.titill} (${STADA[e.stada].split(" ")[0].toLowerCase()})`));
  $("#day-info").innerHTML = `<strong>${langtDags(selected)}:</strong> ${parts.length ? esc(parts.join(" · ")) : "Engir viðburðir þennan dag."}`;
}

// ===== Viðburðir =====
const placeholder = (t) => `<div class="ph" aria-hidden="true">${esc(t.charAt(0))}</div>`;

function renderEvents() {
  const upcoming = EVENTS.filter((e) => e.dags >= selected).sort((a, b) => a.dags.localeCompare(b.dags));
  const list = showAll ? [...EVENTS].sort((a, b) => a.dags.localeCompare(b.dags)) : upcoming.slice(0, 2);
  $("#events-title").textContent = showAll ? "Allir viðburðir" : `Næstu ${list.length} viðburðir`;
  $("#toggle-events").innerHTML = showAll ? "Sýna næstu 2 <span>→</span>" : `<span class="long">Skoða alla viðburði</span><span class="short">Sjá alla</span> <span>→</span>`;
  $("#events").innerHTML = list.length ? list.map((e) => `
    <article class="event" data-k="${e.dags}" tabindex="0">
      ${e.mynd ? `<img src="${e.mynd}" alt="" loading="lazy">` : placeholder(e.titill)}
      <div class="ev-body">
        <p class="ev-date">${langtDags(e.dags)}</p>
        <h3>${esc(e.titill)}</h3>
        <p class="ev-status"><span class="sw ${e.stada === "stadfestur" ? "confirmed" : "tentative"}"></span>${STADA[e.stada]}</p>
        <p class="ev-desc">${esc(e.lysing)}</p>
      </div>
      <span class="chev" aria-hidden="true">›</span>
    </article>`).join("") : `<p class="empty">Engir fleiri viðburðir á dagskrá.</p>`;
}

// ===== Fréttir =====
function renderNews() {
  $("#news").innerHTML = NEWS.map((n) => `
    <article class="news-item">
      <img src="${n.mynd}" alt="" loading="lazy">
      <div>
        <p class="news-date">${stuttDags(n.dags)}</p>
        <h3>${esc(n.titill)}</h3>
        <p class="news-desc">${esc(n.lysing)}</p>
      </div>
    </article>`).join("");
}

// ===== Atburðir =====
function select(k) {
  selected = k;
  const { y, m } = parse(k);
  view = { y, m };
  renderCalendar();
  renderEvents();
}

$("#cal").addEventListener("click", (e) => {
  const b = e.target.closest("button.day");
  if (b) select(b.dataset.k);
});
$("#prev").addEventListener("click", () => { view.m--; if (view.m < 0) { view.m = 11; view.y--; } renderCalendar(); });
$("#next").addEventListener("click", () => { view.m++; if (view.m > 11) { view.m = 0; view.y++; } renderCalendar(); });
$("#toggle-events").addEventListener("click", () => { showAll = !showAll; renderEvents(); });
$("#events").addEventListener("click", (e) => {
  const a = e.target.closest(".event");
  if (!a) return;
  select(a.dataset.k);
  $("#dagatal").scrollIntoView({ behavior: "smooth" });
});
$("#events").addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.closest(".event")?.click(); });

// Valmynd
const drawer = $("#drawer"), scrim = $("#scrim"), menuBtn = $("#menu-btn");
function setMenu(open) {
  drawer.classList.toggle("open", open);
  scrim.hidden = !open;
  menuBtn.setAttribute("aria-expanded", open);
  document.body.classList.toggle("no-scroll", open);
}
menuBtn.addEventListener("click", () => setMenu(true));
$("#tab-more").addEventListener("click", (e) => { e.preventDefault(); setMenu(true); });
$("#close-btn").addEventListener("click", () => setMenu(false));
scrim.addEventListener("click", () => setMenu(false));
drawer.addEventListener("click", (e) => { if (e.target.tagName === "A") setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

renderCalendar();
renderEvents();
renderNews();
