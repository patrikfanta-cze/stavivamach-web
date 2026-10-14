// 3D jeřáb v pozadí stránky (three.js, hostované lokálně).
// Plátno je pevně přes celé okno, kamera jede se scrollem, takže jeřáb působí jako součást stránky:
// nahoře rameno s kabinou, věž po pravé straně, dole základ nad patičkou. 1 jednotka = 1 CSS px.
import * as THREE from 'three';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';

const HEAD = 72;            // výška hlavičky (dokumentová y, kde začíná scéna)
const FOV = 30;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = document.createElement('canvas');
canvas.className = 'crane3d';
canvas.setAttribute('aria-hidden', 'true');
document.body.prepend(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.92;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
scene.add(new THREE.HemisphereLight(0xffffff, 0x6a675f, 0.7));
const sun = new THREE.DirectionalLight(0xfff4e0, 2.4);
sun.position.set(-1, 1.4, 1.2);
scene.add(sun);

const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 20000);

// ---------- materiály ----------
const yellow = new THREE.MeshStandardMaterial({ color: 0xf0ae00, metalness: 0.45, roughness: 0.38 });
const yellowDark = new THREE.MeshStandardMaterial({ color: 0xd99a00, metalness: 0.4, roughness: 0.5 });
const steel = new THREE.MeshStandardMaterial({ color: 0x2a2b2e, metalness: 0.8, roughness: 0.35 });
const concrete = new THREE.MeshStandardMaterial({ color: 0x6f6d67, metalness: 0, roughness: 0.95 });
const glass = new THREE.MeshStandardMaterial({ color: 0x23394a, metalness: 0.9, roughness: 0.08 });
const lamp = new THREE.MeshStandardMaterial({ color: 0x550000, emissive: 0xff2a1a, emissiveIntensity: 2 });

function stripeTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = '#f2b400'; g.fillRect(0, 0, 256, 32);
  g.fillStyle = '#1b1c1e';
  for (let x = -32; x < 256; x += 32) { g.beginPath(); g.moveTo(x, 32); g.lineTo(x + 16, 32); g.lineTo(x + 48, 0); g.lineTo(x + 32, 0); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping;
  return t;
}
const stripes = new THREE.MeshStandardMaterial({ map: stripeTexture(), metalness: 0.3, roughness: 0.5 });

// ---------- pruty jako instance válců ----------
const unitCyl = new THREE.CylinderGeometry(1, 1, 1, 8, 1);
class Bars {
  constructor() { this.list = []; }
  add(a, b, r) { this.list.push([a, b, r]); }
  mesh(mat) {
    const m = new THREE.InstancedMesh(unitCyl, mat, this.list.length);
    const up = new THREE.Vector3(0, 1, 0), d = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), M = new THREE.Matrix4();
    this.list.forEach(([a, b, r], i) => {
      d.subVectors(b, a); const len = d.length();
      q.setFromUnitVectors(up, d.normalize());
      s.set(r, len, r); p.addVectors(a, b).multiplyScalar(0.5);
      m.setMatrixAt(i, M.compose(p, q, s));
    });
    return m;
  }
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const box = (w, h, d, mat, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };

// ---------- stavba jeřábu ----------
let crane, slew, trolley, hook, cables, light, layout = {};

function build() {
  if (crane) { scene.remove(crane); crane.traverse(o => { if (o.geometry && o.geometry !== unitCyl) o.geometry.dispose(); }); }
  const W = document.documentElement.clientWidth;
  const foot = document.querySelector('.foot');
  const pageBottom = (foot ? foot.offsetTop : document.body.scrollHeight) - HEAD;
  const mr = Math.max(48, W / 2 - 620);
  const MW = W < 1100 ? 40 : 52;                 // šířka věže
  const mx = W / 2 - mr - MW / 2;                // střed věže (svět, x)
  const yJibTop = -14, yJibBot = -50;
  const yBase = -pageBottom;                     // spodek základu
  const baseH = 34;                              // betonový patek + kotevní deska
  const yMastTop = yJibBot - 14, yMastBot = yBase + baseH;
  layout = { W, mx, MW };

  crane = new THREE.Group();
  scene.add(crane);

  // věž (čtvercová příhradovina, lehce pootočená, ať je vidět do hloubky)
  const mast = new THREE.Group(); mast.position.x = mx; mast.rotation.y = 0.5; crane.add(mast);
  const mb = new Bars(), mbr = new Bars(), a = MW / 2;
  const C = [[-a, -a], [a, -a], [a, a], [-a, a]];
  C.forEach(([x, z]) => mb.add(V(x, yMastTop, z), V(x, yMastBot, z), MW * 0.06));
  const n = Math.max(1, Math.round((yMastTop - yMastBot) / MW)), s = (yMastTop - yMastBot) / n;
  for (let i = 0; i < n; i++) {
    const y0 = yMastTop - i * s, y1 = y0 - s;
    for (let k = 0; k < 4; k++) {
      const [x0, z0] = C[k], [x1, z1] = C[(k + 1) % 4];
      mbr.add(V(x0, y0, z0), V(x1, y0, z1), MW * 0.025);
      if (i % 2) mbr.add(V(x0, y0, z0), V(x1, y1, z1), MW * 0.028); else mbr.add(V(x1, y0, z1), V(x0, y1, z0), MW * 0.028);
    }
  }
  mast.add(mb.mesh(yellow), mbr.mesh(yellow));

  // otočná část: vše nad věží (rameno, protirameno, kabina, kočka)
  slew = new THREE.Group(); slew.position.x = mx; crane.add(slew);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(MW * 0.75, MW * 0.75, 12, 32), steel);
  ring.position.y = yJibBot - 6; slew.add(ring);
  const deck = box(MW * 1.5, 10, MW * 1.5, stripes, 0, yJibBot - 1, 0); slew.add(deck);

  // rameno – trojúhelníková příhradovina zprava doleva až za levý okraj
  const L = mx + W / 2 + 160, P = 48, zc = 20;
  const jb = new Bars(), jbr = new Bars();
  jb.add(V(0, yJibTop, 0), V(-L, yJibTop, 0), 3.2);
  jb.add(V(0, yJibBot, zc), V(-L, yJibBot, zc), 3.6);
  jb.add(V(0, yJibBot, -zc), V(-L, yJibBot, -zc), 3.6);
  for (let x0 = 0; x0 > -L; x0 -= P) {
    const xm = x0 - P / 2, x1 = x0 - P;
    for (const z of [zc, -zc]) { jbr.add(V(x0, yJibBot, z), V(xm, yJibTop, 0), 1.5); jbr.add(V(xm, yJibTop, 0), V(x1, yJibBot, z), 1.5); }
    jbr.add(V(x0, yJibBot, zc), V(x0, yJibBot, -zc), 1.2);
    jbr.add(V(x0, yJibBot, zc), V(x1, yJibBot, -zc), 1.1);
  }
  slew.add(jb.mesh(yellow), jbr.mesh(yellow));

  // protirameno s protizávažím (doprava za okraj)
  const Lc = mr + MW + 140, cb = new Bars();
  for (const z of [16, -16]) { cb.add(V(0, yJibTop - 6, z), V(Lc, yJibTop - 6, z), 3); cb.add(V(0, yJibBot + 8, z), V(Lc, yJibBot + 8, z), 3); }
  for (let x = 0; x < Lc; x += 36) for (const z of [16, -16]) cb.add(V(x, yJibBot + 8, z), V(x + 18, yJibTop - 6, z), 1.4);
  slew.add(cb.mesh(yellowDark));
  for (let i = 0; i < 3; i++) slew.add(box(26, 40, 44, concrete, MW + 46 + i * 28, yJibBot - 6, 0));
  slew.add(box(70, 22, 30, steel, MW + 10, yJibTop - 18, 0));   // naviják

  // kabina vlevo od věže, vpravo nahoře na stránce
  const cab = new THREE.Group(); cab.position.set(-MW * 0.5 - 26, yJibBot - 36, 18); slew.add(cab);
  cab.add(box(46, 40, 40, yellow, 0, 0, 0));
  cab.add(box(2, 26, 32, glass, -23.5, 4, 0));
  cab.add(box(30, 24, 2, glass, -4, 5, 20.5));
  cab.add(box(50, 4, 44, yellowDark, 0, 22, 0));

  // výstražné světlo na špici
  light = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), lamp);
  light.position.set(0, yJibTop + 8, 0); slew.add(light);
  slew.add(box(4, 10, 4, steel, 0, yJibTop + 2, 0));

  // kočka, lana a hák
  trolley = new THREE.Group(); trolley.position.y = yJibBot - 8; slew.add(trolley);
  trolley.add(box(34, 9, 48, steel, 0, 0, 0));
  hook = new THREE.Group(); trolley.add(hook);
  const block = box(22, 22, 14, stripes, 0, 0, 0); hook.add(block);
  const h = new THREE.Mesh(new THREE.TorusGeometry(7, 2.4, 10, 24, Math.PI * 1.4), steel);
  h.rotation.z = Math.PI * 0.8; h.position.y = -18; hook.add(h);
  cables = [];
  for (const dx of [-6, 6]) { const c = new THREE.Mesh(unitCyl, steel); c.scale.set(0.9, 1, 0.9); c.position.x = dx; trolley.add(c); cables.push(c); }

  // základ úplně dole: betonový patek, výstražný pás, kotevní deska a patky pod nohami věže
  const base = new THREE.Group(); base.position.y = yBase; mast.add(base);   // otočený spolu s věží
  const S = MW * 2.1;
  base.add(box(S, 22, S, concrete, 0, 11, 0));
  base.add(box(S + 1, 5, S + 1, stripes, 0, 19.5, 0));
  base.add(box(MW * 1.35, 6, MW * 1.35, steel, 0, 25, 0));
  C.forEach(([x, z]) => {
    base.add(box(MW * 0.26, 10, MW * 0.26, steel, x, 31, z));
    const br = new Bars();                                   // šikmé vzpěry od nohy k desce
    br.add(V(x, 30, z), V(x * 1.3, 24, z * 0.4), MW * 0.03);
    br.add(V(x, 30, z), V(x * 0.4, 24, z * 1.3), MW * 0.03);
    base.add(br.mesh(yellow));
  });
}

// ---------- kamera podle scrollu ----------
function place() {
  const H = innerHeight, W = document.documentElement.clientWidth;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  const D = H / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)));
  camera.position.set(0, -(scrollY + H / 2 - HEAD), D);
  camera.lookAt(0, camera.position.y, 0);
  camera.updateProjectionMatrix();
}

// ---------- animace ----------
const clock = new THREE.Clock();
function frame() {
  const t = clock.getElapsedTime();
  if (!reduce) {
    const { W, mx } = layout;
    const left = -W / 2 + 140, right = mx - 140;          // kočka jezdí po viditelné části ramena
    const k = (Math.sin(t * 0.18) + 1) / 2;
    trolley.position.x = left + (right - left) * k - mx;
    const drop = 46 + 22 * (Math.sin(t * 0.31) + 1) / 2;   // délka lana
    hook.position.y = -drop;
    hook.rotation.z = Math.sin(t * 1.3) * 0.05;
    cables.forEach(c => { c.scale.y = drop - 10; c.position.y = -(drop - 10) / 2 - 4; });
    slew.rotation.y = Math.sin(t * 0.12) * 0.035;          // rameno se lehce natáčí
    lamp.emissiveIntensity = (t % 1.4) < 0.7 ? 2.2 : 0.15;
  } else if (!frame.once) {
    trolley.position.x = -layout.W * 0.25 - layout.mx; hook.position.y = -56;
    cables.forEach(c => { c.scale.y = 46; c.position.y = -27; });
    frame.once = true;
  }
  place();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

let pending;
const rebuild = () => { clearTimeout(pending); pending = setTimeout(() => { build(); frame.once = false; }, 120); };
build();
document.documentElement.classList.add('has-crane3d');
new ResizeObserver(rebuild).observe(document.body);
addEventListener('resize', rebuild);
frame();
