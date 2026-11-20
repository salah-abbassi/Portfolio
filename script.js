const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* ---------- Theme ---------- */
const themeBtn = $('.theme-toggle');
const profileImg = $('.profile-img');
function applyTheme() {
    const light = root.classList.contains('light');
    themeBtn.innerHTML = `<i class="fas fa-${light ? 'sun' : 'moon'}"></i>`;
    profileImg.src = light ? './main-light.jpg' : './main.jpg';
    window.dispatchEvent(new Event('themechange'));
}
themeBtn.addEventListener('click', () => {
    root.classList.toggle('light');
    try { localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark'); } catch (e) {}
    applyTheme();
});
applyTheme();

/* ---------- Split hero title into chars ---------- */
let ci = 0;
$$('.split').forEach(line => {
    const text = line.textContent;
    line.setAttribute('aria-label', text);
    line.textContent = '';
    text.split(' ').forEach((word, wi) => {
        if (wi) line.append(' ');
        const w = document.createElement('span');
        w.className = 'word'; // keeps a word's letters on one line
        for (const ch of word) {
            const s = document.createElement('span');
            s.className = 'char';
            s.setAttribute('aria-hidden', 'true');
            s.style.setProperty('--i', ci++);
            s.textContent = ch;
            w.appendChild(s);
        }
        line.appendChild(w);
    });
});

/* ---------- Icons for project/experience tags and soft-skill pills ---------- */
const tagIcons = {
    'TimesFM': ['fas fa-chart-line'], 'Séries temporelles': ['fas fa-wave-square'],
    'Python': ['devicon-python-plain'], 'Simulation': ['fas fa-sliders'],
    'ETL': ['fas fa-shuffle'], 'Power BI': ['fas fa-chart-column'],
    'DAX': ['fas fa-square-root-variable'], 'API Python': ['fas fa-plug'],
    'Streaming': ['fas fa-tower-broadcast'], 'LangGraph': ['fas fa-diagram-project'],
    'Agents IA': ['fas fa-robot'], 'LLM': ['fas fa-comments'],
    'Data Viz': ['fas fa-chart-pie'], 'Django': ['devicon-django-plain'],
    'React': ['devicon-react-original'], 'UML': ['fas fa-sitemap'],
    'SQL': ['fas fa-database'], 'Modélisation': ['fas fa-cubes'],
    'Gestion du temps': ['fas fa-hourglass-half'], "Esprit d'équipe": ['fas fa-people-group'],
    'Endurance': ['fas fa-battery-full'], 'Patience': ['fas fa-seedling'],
    'Veille techno': ['fas fa-satellite-dish'], 'Montage vidéo': ['fas fa-film'],
    'Football': ['fas fa-futbol'], 'Callisthénie': ['fas fa-dumbbell'],
};
$$('.tags span, .pills span').forEach(s => {
    const [icon] = tagIcons[s.textContent] || ['fas fa-circle'];
    s.insertAdjacentHTML('afterbegin', `<i class="${icon}" aria-hidden="true"></i>`);
});

/* ---------- Loader ---------- */
const loader = $('.loader');
const count = $('.loader-count');
const bar = $('.loader-bar i');
let p = 0;
const tick = setInterval(() => {
    p = Math.min(100, p + Math.ceil(Math.random() * 9));
    count.textContent = p;
    bar.style.width = p + '%';
    if (p === 100) {
        clearInterval(tick);
        setTimeout(() => { loader.classList.add('done'); document.body.classList.add('ready'); }, 250);
    }
}, reduced ? 1 : 35);

/* ---------- Typing ---------- */
const roles = ['Business Intelligence & Analytics', 'Machine Learning & Séries Temporelles', 'Agents IA & Systèmes Multi-Agents', 'Data Engineering · ETL · Power BI'];
const typed = $('.typed');
let ri = 0, ti = 0, del = false;
(function type() {
    const word = roles[ri];
    typed.textContent = word.slice(0, ti += del ? -1 : 1);
    let wait = del ? 35 : 70;
    if (!del && ti === word.length) { del = true; wait = 1800; }
    else if (del && ti === 0) { del = false; ri = (ri + 1) % roles.length; wait = 400; }
    setTimeout(type, wait);
})();

/* ---------- Header: hide on scroll down, progress bar, active link ---------- */
const header = $('.header');
const progress = $('.progress');
const navLinks = $$('.nav a');
let lastY = 0;
addEventListener('scroll', () => {
    const y = scrollY;
    header.classList.toggle('hide', y > lastY && y > 200);
    lastY = y;
    progress.style.transform = `scaleX(${y / (document.documentElement.scrollHeight - innerHeight || 1)})`;
}, { passive: true });

const spy = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
}), { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

/* ---------- Mobile menu ---------- */
const menuBtn = $('.menu-btn');
const nav = $('#nav');
function setMenu(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.innerHTML = `<i class="fas fa-${open ? 'xmark' : 'bars'}"></i>`;
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
navLinks.forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('click', e => { if (!header.contains(e.target)) setMenu(false); });

/* ---------- Reveal on scroll (staggered) + heading scramble + counters ---------- */
const chars = '!<>-_\\/[]{}—=+*^?#01';
function scramble(el) {
    const final = el.textContent;
    let frame = 0;
    const total = final.length * 3;
    const run = () => {
        el.textContent = [...final].map((c, i) => (i < frame / 3 ? c : chars[(Math.random() * chars.length) | 0])).join('');
        if (++frame <= total) requestAnimationFrame(run); else el.textContent = final;
    };
    run();
}
function countUp(el) {
    const target = +el.dataset.count, suffix = el.dataset.suffix || '';
    const t0 = performance.now();
    const step = now => {
        const k = Math.min(1, (now - t0) / 1400);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + (k === 1 ? suffix : '');
        if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}
const revealer = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('in');
    if (!reduced) $$('.scramble', el).forEach(scramble);
    $$('[data-count]', el).forEach(countUp);
    revealer.unobserve(el);
}), { threshold: 0.15 });
// stagger siblings that share a parent
$$('.reveal').forEach(el => {
    const sibs = $$(':scope > .reveal', el.parentElement);
    el.style.setProperty('--d', sibs.indexOf(el) * 0.1 + 's');
    revealer.observe(el);
});

/* ---------- 3D tilt + glare ---------- */
if (finePointer && !reduced) {
    $$('[data-tilt]').forEach(el => {
        const max = el.classList.contains('portrait') ? 14 : 8;
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
            el.classList.add('tilting');
            el.style.setProperty('--ry', (x - 0.5) * max * 2 + 'deg');
            el.style.setProperty('--rx', (0.5 - y) * max * 2 + 'deg');
            el.style.setProperty('--gx', x * 100 + '%');
            el.style.setProperty('--gy', y * 100 + '%');
        });
        el.addEventListener('pointerleave', () => {
            el.classList.remove('tilting');
            el.style.setProperty('--rx', '0deg');
            el.style.setProperty('--ry', '0deg');
        });
    });
    /* Magnetic buttons */
    $$('[data-magnetic]').forEach(el => {
        el.addEventListener('pointermove', e => {
            const r = el.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.3}px, ${(e.clientY - r.top - r.height / 2) * 0.4}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    /* Custom cursor */
    const dot = $('.cursor-dot'), ring = $('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    document.body.classList.add('has-cursor');
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
    (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a, button, [data-tilt], input, textarea')));
}

/* ---------- Skills globe (true CSS 3D: wireframe + orbiting chips) ---------- */
const sphere = $('.tag-sphere');
const skills = [
    ['Python', 'devicon-python-plain'], ['SQL', 'fas fa-database'], ['Power BI', 'fas fa-chart-column'],
    ['DAX', 'fas fa-square-root-variable'], ['Machine Learning', 'fas fa-brain'], ['Deep Learning', 'fas fa-circle-nodes'],
    ['PyTorch', 'devicon-pytorch-plain'], ['Scikit-Learn', 'devicon-scikitlearn-plain'], ['SpaCy', 'fas fa-language'],
    ['TimesFM', 'fas fa-chart-line'], ['LangGraph', 'fas fa-diagram-project'], ['Agents IA', 'fas fa-robot'],
    ['PySpark', 'devicon-apachespark-plain'], ['Hadoop', 'devicon-hadoop-plain'], ['Databricks', 'fas fa-layer-group'],
    ['SSIS', 'fas fa-shuffle'], ['Django', 'devicon-django-plain'], ['React', 'devicon-react-original'],
    ['Docker', 'devicon-docker-plain'], ['Git', 'devicon-git-plain'], ['GitHub', 'devicon-github-original'],
    ['n8n', 'fas fa-gears'], ['UML', 'fas fa-sitemap'], ['NLP', 'fas fa-comments'],
    ['Data Viz', 'fas fa-chart-pie'], ['Data Warehouse', 'fas fa-warehouse'],
];
const stage = document.createElement('div');
stage.className = 'globe-stage';
stage.innerHTML = '<canvas class="globe-cloud"></canvas><span class="globe-hint"><i class="fas fa-hand-pointer"></i> Glissez pour faire tourner</span>';
sphere.appendChild(stage);
const cloud = $('.globe-cloud', stage), cx2d = cloud.getContext('2d');
const fib = (i, n) => { const phi = Math.acos(1 - 2 * (i + 0.5) / n), th = Math.PI * (1 + Math.sqrt(5)) * i; return [Math.sin(phi) * Math.cos(th), Math.sin(phi) * Math.sin(th), Math.cos(phi)]; };
// point cloud: fuzzy shell around the sphere
const PTS = innerWidth < 768 ? 800 : 1600;
const pts = Array.from({ length: PTS }, (_, i) => { const r = 0.75 + Math.random() * 0.4; return { b: fib(i, PTS).map(v => v * r), c: Math.random() < 0.6 ? 0 : 1, s: 0.8 + Math.random() * 1.4, f: 0.4 + Math.random() * 1.6, ph: Math.random() * 6.283 }; });
const tags = skills.map(([name, icon], i) => {
    const el = document.createElement('span');
    el.className = 'gtag';
    el.innerHTML = `<i class="${icon}"></i>${name}`;
    stage.appendChild(el);
    el.addEventListener('pointerenter', () => { hovered = el; });
    el.addEventListener('pointerleave', () => { hovered = null; });
    return { el, b: fib(i, skills.length) };
});
// network links: each skill to its 2 nearest neighbours
const links = [];
tags.forEach((t, i) => tags.map((u, j) => [j, Math.hypot(...t.b.map((v, k) => v - u.b[k]))]).filter(([j]) => j !== i)
    .sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => { if (!links.some(([a, b]) => a === j && b === i)) links.push([i, j]); }));

let colors = ['#e50914', '#ff4a3d'];
const syncColors = () => { const cs = getComputedStyle(root); colors = ['--c1', '--c2'].map(v => cs.getPropertyValue(v).trim()); };
syncColors();
addEventListener('themechange', syncColors);

// M = cumulative rotation (row-major 3x3) shared by points, links and chips
let M = [1, 0, 0, 0, 1, 0, 0, 0, 1];
const mul = (A, B) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map(k => { const r = (k / 3) | 0, c = k % 3; return A[r * 3] * B[c] + A[r * 3 + 1] * B[3 + c] + A[r * 3 + 2] * B[6 + c]; });
const rot = (ax, ay) => {
    const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
    return mul([cy, 0, sy, 0, 1, 0, -sy, 0, cy], [1, 0, 0, 0, cx, -sx, 0, sx, cx]);
};
const apply = ([a, b, c]) => [M[0] * a + M[1] * b + M[2] * c, M[3] * a + M[4] * b + M[5] * c, M[6] * a + M[7] * b + M[8] * c];
function orthonormalize() { // stops float drift from skewing the globe over time
    let [a, b] = [[M[0], M[3], M[6]], [M[1], M[4], M[7]]];
    const n = v => { const l = Math.hypot(...v); return v.map(x => x / l); };
    a = n(a); const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = n(b.map((x, i) => x - d * a[i]));
    const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    M = [a[0], b[0], c[0], a[1], b[1], c[1], a[2], b[2], c[2]];
}

const IDLE = 0.0025; // always spins: it signals the globe can be turned
let vx = 0, vy = IDLE, drag = null, hovered = null, over = false, sphereVisible = false, grow = reduced ? 1 : 0, frameN = 0;
new IntersectionObserver(([e]) => { sphereVisible = e.isIntersecting; }).observe(sphere);
// drag rotates the globe directly (so you can bring the back skills to the front); release keeps inertia
sphere.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; sphere.setPointerCapture(e.pointerId); sphere.classList.add('dragging', 'used'); });
sphere.addEventListener('pointermove', e => {
    if (!drag) return;
    const k = 3 / sphere.clientWidth; // full width drag ≈ half a turn
    vy = (e.clientX - drag.x) * k; vx = -(e.clientY - drag.y) * k;
    M = mul(rot(vx, vy), M);
    drag = { x: e.clientX, y: e.clientY };
});
const endDrag = () => { drag = null; sphere.classList.remove('dragging'); };
sphere.addEventListener('pointerup', endDrag);
sphere.addEventListener('pointerenter', () => { over = true; });
sphere.addEventListener('pointerleave', () => { over = false; });
sphere.addEventListener('pointercancel', endDrag);

const P = 1100; // perspective distance (px) shared by points, links and chips
let cf = 0; // centrifugal spread, grows with spin speed
(function spin() {
    requestAnimationFrame(spin);
    if (!sphereVisible) return;
    if (!drag) {
        const stop = over || hovered; // cursor on the cloud pauses it; leaving resumes the spin
        const k = stop ? 0.12 : 0.03;
        vx += (0 - vx) * k;
        vy += ((stop ? 0 : IDLE) - vy) * k;
        if (stop && Math.abs(vx) + Math.abs(vy) < 1e-4) vx = vy = 0; // full stop, not an endless crawl
        M = mul(rot(vx, vy), M);
    }
    if (++frameN % 300 === 0) orthonormalize();
    const now = performance.now() / 1000;
    grow = 1 - grow < 0.001 ? 1 : grow + (1 - grow) * 0.04;
    const W = sphere.clientWidth, R = W * 0.36 * (0.2 + 0.8 * grow);

    // centrifuge: fast spin flings everything away from the rotation axis, then it springs back
    const spd = Math.hypot(vx, vy);
    cf += (Math.min(spd * 9, 0.9) - cf) * (spd * 9 > cf ? 0.25 : 0.06);
    const ax = spd > 1e-6 ? [vx / spd, vy / spd, 0] : [0, 1, 0];
    const proj = (b, f) => {
        let [x, y, z] = apply(b);
        if (cf > 0.001) {
            const d = x * ax[0] + y * ax[1], k = cf * f; // perpendicular-to-axis component grows
            x += (x - d * ax[0]) * k; y += (y - d * ax[1]) * k; z += z * k;
        }
        const s = P / (P - z * R);
        return [x * R * s, y * R * s, Math.max(-1, Math.min(1, z)), s];
    };

    // --- canvas: points + links, depth-shaded
    const dpr = Math.min(devicePixelRatio, 2);
    const px = Math.round(W * dpr);
    if (cloud.width !== px) { cloud.width = cloud.height = px; }
    cx2d.setTransform(dpr, 0, 0, dpr, px / 2, px / 2); // translation is in device pixels
    cx2d.clearRect(-W / 2, -W / 2, W, W);
    const chipPos = tags.map(t => proj(t.b, 0.7));
    cx2d.lineWidth = 1;
    cx2d.strokeStyle = colors[1];
    for (const [i, j] of links) {
        const [x1, y1, z1] = chipPos[i], [x2, y2, z2] = chipPos[j];
        cx2d.globalAlpha = (0.08 + 0.25 * ((z1 + z2) / 2 + 1) / 2) * grow;
        cx2d.beginPath(); cx2d.moveTo(x1, y1); cx2d.lineTo(x2, y2); cx2d.stroke();
    }
    for (const p of pts) {
        const w = 1 + 0.07 * Math.sin(now * 1.3 + p.ph), d = 0.05;
        const [x, y, z, s] = proj([p.b[0] * w + d * Math.sin(now * 0.9 + p.ph * 3), p.b[1] * w + d * Math.cos(now * 1.1 + p.ph * 2), p.b[2] * w], p.f), f = (z + 1) / 2;
        cx2d.globalAlpha = (0.12 + 0.75 * f) * grow;
        cx2d.fillStyle = colors[p.c];
        cx2d.beginPath(); cx2d.arc(x, y, p.s * s * (0.5 + f * 0.8), 0, 6.283); cx2d.fill();
    }
    cx2d.globalAlpha = 1;

    // --- chips: placed at the exact projected point (2D), stacked by depth
    tags.forEach((t, i) => {
        const [x, y, z, s] = chipPos[i];
        const front = (z + 1) / 2; // 0 back .. 1 front
        const hov = t.el === hovered;
        t.el.style.transform = `translate(-50%,-50%) translate(${x}px,${y}px) scale(${hov ? 1.3 : (0.55 + front * 0.45) * s})`;
        t.el.style.opacity = hov ? 1 : (0.3 + 0.7 * front) * grow;
        t.el.style.zIndex = hov ? 999 : Math.round(front * 100);
        t.el.style.pointerEvents = front > 0.5 && !drag ? 'auto' : 'none';
    });
})();

/* ---------- Contact form (EmailJS, same service/template as before) ---------- */
const form = $('#contact-form');
const status = $('.form-status', form);
const sendBtn = $('#send-btn');
try { emailjs.init('S0VRYwF-tZiWjpYRj'); } catch (e) {}
form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const fd = new FormData(form);
    $('.btn-text', sendBtn).hidden = true;
    $('.btn-loading', sendBtn).hidden = false;
    sendBtn.disabled = true;
    status.className = 'form-status';
    status.textContent = '';
    try {
        const res = await emailjs.send('service_domdn8h', 'template_3bjklln', {
            from_name: fd.get('fullName'),
            from_email: fd.get('email'),
            subject: fd.get('subject'),
            message: fd.get('message'),
            to_email: 'abbassi049@gmail.com'
        });
        if (res.status !== 200) throw new Error('send failed');
        status.classList.add('ok');
        status.textContent = '✓ Message envoyé ! Je vous répondrai très bientôt.';
        form.reset();
    } catch (err) {
        console.error(err);
        status.classList.add('err');
        status.textContent = "Erreur d'envoi. Écrivez-moi directement à salaheddine_abbassi@um5.ac.ma";
    } finally {
        $('.btn-text', sendBtn).hidden = false;
        $('.btn-loading', sendBtn).hidden = true;
        sendBtn.disabled = false;
    }
});
