// ---------- Deep space background ----------
const cv = document.getElementById('space'), ctx = cv.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let W, H, scrollY = 0, t = 0;
const R = (a, b) => a + Math.random() * (b - a);

let stars = [], planets = [], clouds = [], disk = [];
function init() {
  W = cv.width = innerWidth; H = cv.height = innerHeight;
  stars = Array.from({ length: Math.min(260, W * H / 6000 | 0) }, () => ({
    x: R(0, W), y: R(0, H), z: R(.2, 1), p: R(0, 6.28), s: R(.5, 2)
  }));
  clouds = [[.2,.3,'#9303C5'],[.8,.7,'#5a0390'],[.55,.15,'#3a0563'],[.1,.85,'#7a02a6']]
    .map(([x, y, c]) => ({ x: x * W, y: y * H, r: Math.max(W, H) * R(.3, .5), c, p: R(0, 6.28) }));
  planets = [
    { x: W * .15, y: H * .75, r: Math.min(W, H) * .07, a: '#c21bff', b: '#2a0346', sp: .00007, d: .35, p: 0 },
    { x: W * .85, y: H * .25, r: Math.min(W, H) * .045, a: '#7a02a6', b: '#02060E', sp: -.0001, d: .55, p: 2 },
    { x: W * .5,  y: H * .9,  r: Math.min(W, H) * .03, a: '#e8a0ff', b: '#3a0563', sp: .00013, d: .8, p: 4 }
  ];
  disk = Array.from({ length: 420 }, () => ({ a: R(0, 6.28), r: R(1.15, 3.2), s: R(.3, 1.4) }));
}

function drawClouds() {
  clouds.forEach(c => {
    const x = c.x + Math.sin(t * .0002 + c.p) * 60, y = c.y + Math.cos(t * .00017 + c.p) * 40 - scrollY * .05;
    const g = ctx.createRadialGradient(x, y, 0, x, y, c.r);
    g.addColorStop(0, c.c + '40'); g.addColorStop(1, '#02060E00');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  });
}
function drawStars() {
  stars.forEach(s => {
    const y = ((s.y - scrollY * s.z * .25 + t * .004 * s.z) % H + H) % H;
    ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(t * .001 * s.z + s.p));
    ctx.fillStyle = s.z > .8 ? '#e8b8ff' : '#fff';
    ctx.beginPath(); ctx.arc(s.x, y, s.s * s.z, 0, 6.28); ctx.fill();
  });
  ctx.globalAlpha = 1;
}
function drawPlanets() {
  planets.forEach(p => {
    const ang = t * p.sp + p.p;
    const x = p.x + Math.cos(ang) * 70, y = p.y + Math.sin(ang) * 40 - scrollY * p.d * .3;
    const g = ctx.createRadialGradient(x - p.r * .4, y - p.r * .4, p.r * .1, x, y, p.r);
    g.addColorStop(0, p.a); g.addColorStop(1, p.b);
    ctx.shadowColor = p.a; ctx.shadowBlur = p.r * .8;
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.28); ctx.fill();
    ctx.shadowBlur = 0;
    if (p.r > H * .05) { // ring
      ctx.strokeStyle = p.a + '88'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(x, y, p.r * 1.7, p.r * .45, -.4, 0, 6.28); ctx.stroke();
    }
  });
}
function drawBlackHole() {
  const r = Math.min(W, H) * .13, x = W * (W < 800 ? .75 : .74), y = H * .42 - scrollY * .15;
  if (y < -r * 4 || y > H + r * 4) return;
  const halo = ctx.createRadialGradient(x, y, r, x, y, r * 4);
  halo.addColorStop(0, '#c21bffaa'); halo.addColorStop(.35, '#9303C533'); halo.addColorStop(1, '#02060E00');
  ctx.fillStyle = halo; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .32); ctx.rotate(-.25);
  disk.forEach(d => { // accretion disk, inner particles orbit faster
    const a = d.a + t * .0006 * d.s / d.r * 3, rr = r * d.r;
    ctx.fillStyle = `hsla(${285 + d.r * 10},100%,${80 - d.r * 14}%,${.9 - d.r * .22})`;
    ctx.fillRect(Math.cos(a) * rr, Math.sin(a) * rr, 2.2, 2.2);
  });
  ctx.restore();
  ctx.shadowColor = '#e45cff'; ctx.shadowBlur = 40; ctx.fillStyle = '#000';
  ctx.beginPath(); ctx.arc(x, y, r, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
  ctx.strokeStyle = '#f3b0ff'; ctx.lineWidth = 2; ctx.stroke(); // photon ring
}
function frame(ms) {
  t = ms;
  ctx.fillStyle = '#02060E'; ctx.fillRect(0, 0, W, H);
  drawClouds(); drawStars(); drawPlanets(); drawBlackHole();
  if (!reduce) requestAnimationFrame(frame);
}
addEventListener('resize', init);
addEventListener('scroll', () => { scrollY = pageYOffset; if (reduce) frame(0); }, { passive: true });
init(); requestAnimationFrame(frame);

// shooting star
if (!reduce) setInterval(() => {
  const s = document.createElement('i');
  s.style.cssText = `position:fixed;z-index:-1;top:${R(0, 40)}%;left:${R(30, 90)}%;width:120px;height:2px;background:linear-gradient(90deg,#fff,transparent);transform:rotate(-30deg);transition:transform 1.1s ease-in,opacity 1.1s;opacity:1`;
  document.body.append(s);
  requestAnimationFrame(() => { s.style.transform = 'translate(-500px,300px) rotate(-30deg)'; s.style.opacity = 0; });
  setTimeout(() => s.remove(), 1200);
}, 4500);

// ---------- Page behaviour ----------
document.querySelectorAll('.section').forEach(e => e.classList.add('reveal'));
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in'); io.unobserve(e.target);
  e.target.querySelectorAll('[data-n]').forEach(b => {
    const n = +b.dataset.n; let i = 0;
    const id = setInterval(() => { b.textContent = ++i + (i >= n ? '+' : ''); if (i >= n) clearInterval(id); }, 1400 / n);
  });
}), { threshold: .2 });
document.querySelectorAll('.reveal').forEach(e => io.observe(e));

document.getElementById('yr').textContent = new Date().getFullYear();
document.getElementById('form').addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(e.target);
  // Opens the visitor's email app. Replace the address with your own.
  location.href = `mailto:hello@visionagency.com?subject=${encodeURIComponent('Project from ' + d.get('name'))}&body=${encodeURIComponent(d.get('msg') + '\n\n' + d.get('email'))}`;
  document.getElementById('note').textContent = 'Opening your email app. You can also write to hello@visionagency.com.';
});