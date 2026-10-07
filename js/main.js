// ── Section loader ────────────────────────────────────────────────────────────
const NAV_SRC = 'sections/nav.html';
const FOOTER_SRC = 'sections/footer.html';

const SECTIONS = [
  'sections/hero.html',
  'sections/about.html',
  'sections/experience.html',
  'sections/projects.html',
  'sections/research.html',
  'sections/media.html',
  'sections/contributions.html',
  'sections/skills.html',
  'sections/awards.html',
  'sections/connect.html',
];

const load = src => fetch(src).then(r => {
  if (!r.ok) throw new Error(`${src}: ${r.status}`);
  return r.text();
});

function toFragment(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return tpl.content;
}

async function loadSections() {
  const mainContent = document.getElementById('main-content');
  try {
    const [navHTML, footerHTML, ...sectionHTMLs] = await Promise.all([
      load(NAV_SRC), load(FOOTER_SRC), ...SECTIONS.map(load),
    ]);
    document.getElementById('navbar').innerHTML = navHTML;
    sectionHTMLs.forEach(html => mainContent.appendChild(toFragment(html)));
    mainContent.after(toFragment(footerHTML));
  } catch (err) {
    console.error(err);
    mainContent.innerHTML =
      '<p class="wrap" style="padding-block:8rem">This page loads its sections with fetch(), so it needs to be served over HTTP (e.g. <code>python -m http.server</code>) rather than opened from disk.</p>';
    return;
  }
  initApp();
}

function initApp() {
  initNavbar();
  initMobileMenu();
  initTheme();
  initScrollReveal();
  initQuantumFact();
  initBellShots();
}

// ── Navbar: background on scroll + active section ────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const links = document.querySelectorAll('.nav-link');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -60% 0px' });

  document.querySelectorAll('main section[id]').forEach(s => obs.observe(s));
}

// ── Mobile menu ──────────────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const setOpen = open => {
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  };
  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}

// ── Theme toggle (follows the OS until the visitor picks one) ────────────────
function initTheme() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const root = document.documentElement;
  const isDark = () => root.getAttribute('data-theme')
    ? root.getAttribute('data-theme') === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;

  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

// ── Scroll reveal ────────────────────────────────────────────────────────────
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
  els.forEach(el => obs.observe(el));
}

// ── Random note from my work ─────────────────────────────────────────────────
function initQuantumFact() {
  const notes = [
    "Measure either half of a Bell pair and you get a random bit, but the two bits always agree. That is the whole circuit at the top of this page.",
    "Bernstein-Vazirani finds an n-bit hidden string with a single query, where a classical computer needs n. It is the cleanest place I know to watch interference do real work, which is why I teach it.",
    "Entanglement distillation spends many noisy Bell pairs to make a few good ones. I implemented two protocols for it, BBPSSW and DEJMPS, on real IonQ hardware at MIT iQuHack.",
    "In my QCNN comparison on MNIST, the hybrid model finished 8.57% ahead of the classical CNN, at 90.54% accuracy. Promising, on a benchmark that is small and friendly.",
    "Zero-noise extrapolation runs a circuit at deliberately higher noise levels, then extrapolates back to the noise-free answer. It is one of the four techniques in the Mitiq tutorial I wrote.",
    "Pauli twirling turns messy coherent noise into simpler stochastic Pauli noise, which is much easier to mitigate. It is another of the techniques in that Mitiq tutorial.",
    "Quantum state tomography rebuilds a state from measurements, and fidelity scores how close the rebuild is. 98% was the number from my QWorld internship.",
    "In my Manim tunneling animation, the wave packet splits at the barrier: part reflects, part passes through, and you can watch the probability density divide.",
    "One of my PennyLane fixes: the Tracker class printed as a raw memory address. A readable __repr__ is a tiny change that makes debugging much less painful.",
    "A variational quantum circuit can act as the policy in reinforcement learning. In my energy-grid poster, it learns generator dispatch that keeps voltage stable while holding cost down.",
  ];
  let last = -1;
  const btn  = document.getElementById('quantum-btn');
  const text = document.getElementById('fact-text');
  if (!btn || !text) return;

  btn.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * notes.length); } while (idx === last);
    last = idx;
    text.classList.remove('show');
    setTimeout(() => { text.textContent = notes[idx]; text.classList.add('show'); }, 180);
  });
}

// ── Bell pair: run 100 shots ─────────────────────────────────────────────────
// An ideal Bell pair measured in the computational basis: 00 or 11 with equal
// probability, never 01 or 10. Sampled client-side; the note under the chart
// says so.
function initBellShots() {
  const btn  = document.getElementById('shots-btn');
  const note = document.getElementById('shots-note');
  if (!btn) return;
  const SHOTS = 100;
  let runs = 0;

  btn.addEventListener('click', () => {
    const counts = { '00': 0, '01': 0, '10': 0, '11': 0 };
    for (let i = 0; i < SHOTS; i++) counts[Math.random() < 0.5 ? '00' : '11']++;

    Object.entries(counts).forEach(([k, n]) => {
      document.querySelector(`.hist i[data-k="${k}"]`).style.width = `${(n / SHOTS) * 100}%`;
      document.querySelector(`.hist [data-n="${k}"]`).textContent = n;
    });
    runs++;
    btn.textContent = 'Run again';
    note.textContent = `Run ${runs}: ${SHOTS} shots. 01 and 10 never occur. Simulated in your browser.`;
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
loadSections();
