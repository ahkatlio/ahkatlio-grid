// ── Section loader ────────────────────────────────────────────────────────────
const NAV_SRC = 'sections/nav.html';

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
  'sections/footer.html',
];

async function loadSections() {
  const [navHTML, ...sectionHTMLs] = await Promise.all([
    fetch(NAV_SRC).then(r => r.text()),
    ...SECTIONS.map(src => fetch(src).then(r => r.text())),
  ]);

  document.getElementById('navbar').innerHTML = navHTML;

  const mainContent = document.getElementById('main-content');
  sectionHTMLs.forEach(html => {
    const tpl = document.createElement('template');
    tpl.innerHTML = html.trim();
    mainContent.appendChild(tpl.content);
  });

  initApp();
}

// ── App init (runs after all sections are in the DOM) ─────────────────────────
function initApp() {
  initParticles();
  initTypewriter();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initBackToTop();
  initQuantumBtn();
}

// ── tsParticles ───────────────────────────────────────────────────────────────
async function initParticles() {
  await tsParticles.load('tsparticles', {
    background: { color: { value: 'transparent' } },
    fpsLimit: 60,
    interactivity: {
      events: {
        onHover: { enable: true, mode: ['repulse', 'connect'] },
        onClick: { enable: true, mode: 'push' },
        resize: true,
      },
      modes: {
        repulse: { distance: 100, duration: 0.4 },
        connect: { distance: 80, links: { opacity: 0.5 }, radius: 60 },
        push: { quantity: 2 },
      },
    },
    particles: {
      color: { value: ['#00f5ff', '#c026d3', '#22d3ee', '#f0f0f5'] },
      links: { color: '#00f5ff', distance: 120, enable: true, opacity: 0.15, width: 1 },
      collisions: { enable: false },
      move: {
        direction: 'none',
        enable: true,
        outModes: { default: 'bounce' },
        random: true,
        speed: 0.6,
        straight: false,
        attract: { enable: true, rotateX: 600, rotateY: 1200 },
      },
      number: { density: { enable: true, area: 900 }, value: 80 },
      opacity: {
        value: { min: 0.15, max: 0.6 },
        animation: { enable: true, speed: 0.8, minimumValue: 0.1, sync: false },
      },
      shape: {
        type: ['circle', 'char'],
        options: {
          char: [
            { value: '|0⟩', font: 'Orbitron', style: '', weight: '400', fill: true },
            { value: '|1⟩', font: 'Orbitron', style: '', weight: '400', fill: true },
            { value: '⊗',   font: 'Orbitron', style: '', weight: '400', fill: true },
          ],
        },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: { enable: true, speed: 2, minimumValue: 0.5, sync: false },
      },
    },
    detectRetina: true,
  });
}

// ── Typewriter ────────────────────────────────────────────────────────────────
function initTypewriter() {
  const lines = [
    'Quantum Computing Researcher & AI Enthusiast',
    'Navigating the Quantum Grid from Dhaka',
    'IBM Qiskit Advocate | MIT iQuHack Winner',
    'Open Source Contributor | Quantum Educator',
  ];
  let lineIdx = 0, charIdx = 0, deleting = false;
  const tw = document.getElementById('typewriter-text');

  function step() {
    const line = lines[lineIdx];
    if (!deleting) {
      tw.textContent = line.slice(0, charIdx + 1);
      charIdx++;
      if (charIdx === line.length) { deleting = true; setTimeout(step, 2200); return; }
      setTimeout(step, 48);
    } else {
      tw.textContent = line.slice(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        deleting = false;
        lineIdx = (lineIdx + 1) % lines.length;
        setTimeout(step, 400);
        return;
      }
      setTimeout(step, 22);
    }
  }
  setTimeout(step, 800);
}

// ── Navbar scroll + active link ───────────────────────────────────────────────
function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });

  const navLinks = document.querySelectorAll('.nav-link');
  const sectionEls = document.querySelectorAll('section[id]');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.35 });

  sectionEls.forEach(s => obs.observe(s));
}

// ── Mobile hamburger ──────────────────────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
    });
  });
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'),
          entry.target.dataset.delay || 0);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 80;
    obs.observe(el);
  });
}

// ── Back to top ───────────────────────────────────────────────────────────────
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 600));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ── Quantum Randomness ────────────────────────────────────────────────────────
function initQuantumBtn() {
  const facts = [
    "⚛️ A qubit can exist in a superposition of |0⟩ and |1⟩ simultaneously, until you look at it. Schrödinger's bit.",
    "🌀 Quantum entanglement allows two particles to be correlated instantly across any distance. Einstein called it 'spooky action at a distance.'",
    "🔬 If a quantum computer were the size of a grain of sand, it could perform more computations simultaneously than there are atoms in the observable universe.",
    "🎲 True randomness in nature? Look no further than quantum measurement. The outcome is fundamentally unpredictable.",
    "🧲 Quantum tunneling is why the sun shines: protons tunnel through the Coulomb barrier to fuse in the solar core.",
    "💻 Shor's algorithm can factor large numbers exponentially faster than any classical algorithm, making it a direct threat to RSA encryption.",
    "🌊 The double-slit experiment revealed that particles interfere with themselves when unobserved, behaving like waves.",
    "🔐 Quantum Key Distribution (QKD) uses the laws of physics to guarantee eavesdropping is always detectable. Security by nature.",
    "🎭 The many-worlds interpretation says every quantum measurement spawns a new parallel universe. You're in all of them.",
    "📡 Quantum teleportation has been demonstrated over 1,200 km via satellite. No information exceeds light speed, but the quantum state does transfer.",
  ];
  let lastIdx = -1;
  const btn    = document.getElementById('quantum-btn');
  const bubble = document.getElementById('fact-bubble');
  if (!btn || !bubble) return;

  btn.addEventListener('click', () => {
    let idx;
    do { idx = Math.floor(Math.random() * facts.length); } while (idx === lastIdx);
    lastIdx = idx;
    bubble.classList.remove('show');
    setTimeout(() => { bubble.textContent = facts[idx]; bubble.classList.add('show'); }, 200);
  });
}

// ── Boot ──────────────────────────────────────────────────────────────────────
loadSections();
