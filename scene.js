// 3D background: ~14k particles that morph sphere -> torus knot -> data wave as you scroll.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.getElementById('bg3d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 768;
const N = mobile ? 6000 : 14000;

let renderer;
try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
} catch (e) {
    canvas.remove(); // no WebGL: the page works without the background
    throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 7);

/* ---------- Three target shapes ---------- */
const sphere = new Float32Array(N * 3), knot = new Float32Array(N * 3), wave = new Float32Array(N * 3), rnd = new Float32Array(N);
const side = Math.ceil(Math.sqrt(N));
for (let i = 0; i < N; i++) {
    const k = i * 3;
    // Fibonacci sphere
    const phi = Math.acos(1 - 2 * (i + 0.5) / N), th = Math.PI * (1 + Math.sqrt(5)) * i, r = 2.4;
    sphere[k] = r * Math.sin(phi) * Math.cos(th);
    sphere[k + 1] = r * Math.sin(phi) * Math.sin(th);
    sphere[k + 2] = r * Math.cos(phi);
    // (2,3) torus knot with a fuzzy tube
    const t = (i / N) * Math.PI * 2 * 1, p = 2, q = 3;
    const R = 1.7 + 0.7 * Math.cos(q * t);
    const a = Math.random() * Math.PI * 2, tube = 0.28 * Math.sqrt(Math.random());
    knot[k] = R * Math.cos(p * t) + tube * Math.cos(a);
    knot[k + 1] = R * Math.sin(p * t) + tube * Math.sin(a);
    knot[k + 2] = 0.7 * Math.sin(q * t) * 1.6 + tube * Math.sin(a * 2);
    // wave surface ("data landscape")
    const gx = (i % side) / side - 0.5, gz = Math.floor(i / side) / side - 0.5;
    wave[k] = gx * 11;
    wave[k + 1] = 0;
    wave[k + 2] = gz * 11;
    rnd[i] = Math.random();
}
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(sphere, 3));
geo.setAttribute('aKnot', new THREE.BufferAttribute(knot, 3));
geo.setAttribute('aWave', new THREE.BufferAttribute(wave, 3));
geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 1));

const css = () => getComputedStyle(document.documentElement);
const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uMouse: { value: new THREE.Vector2() },
    uSize: { value: (mobile ? 22 : 26) * renderer.getPixelRatio() },
    uC1: { value: new THREE.Color() },
    uC2: { value: new THREE.Color() },
    uAlpha: { value: 1 },
};
const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */`
        attribute vec3 aKnot; attribute vec3 aWave; attribute float aRnd;
        uniform float uTime, uMorph, uSize; uniform vec2 uMouse;
        varying float vRnd; varying float vDepth;
        void main() {
            vec3 w = aWave;
            w.y = sin(w.x * 0.8 + uTime) * 0.45 + cos(w.z * 0.9 + uTime * 0.8) * 0.45 - 1.6;
            float m1 = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
            float m2 = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));
            vec3 p = mix(mix(position, aKnot, m1), w, m2);
            // breathing noise
            p += 0.06 * vec3(sin(uTime * 1.3 + aRnd * 40.0), cos(uTime * 1.1 + aRnd * 30.0), sin(uTime * 0.9 + aRnd * 20.0));
            // mouse repulsion in view space
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            vec2 d = mv.xy - uMouse * vec2(4.5, 2.6);
            mv.xy += normalize(d + 1e-4) * 0.6 * exp(-dot(d, d) * 1.6);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = uSize * (0.35 + aRnd * 0.65) / -mv.z;
            vRnd = aRnd; vDepth = -mv.z;
        }`,
    fragmentShader: /* glsl */`
        uniform vec3 uC1, uC2; uniform float uAlpha;
        varying float vRnd; varying float vDepth;
        void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float a = smoothstep(0.5, 0.0, d) * uAlpha * clamp(9.0 / vDepth - 0.4, 0.15, 1.0);
            gl_FragColor = vec4(mix(uC1, uC2, vRnd), a);
        }`,
});
const points = new THREE.Points(geo, material);
scene.add(points);

function syncTheme() {
    const s = css();
    const light = document.documentElement.classList.contains('light');
    uniforms.uC1.value.set(s.getPropertyValue('--c1').trim());
    uniforms.uC2.value.set(s.getPropertyValue('--c2').trim());
    material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    uniforms.uAlpha.value = light ? 0.75 : 0.9;
    material.needsUpdate = true;
}
syncTheme();
addEventListener('themechange', syncTheme);

/* ---------- Interaction ---------- */
const mouse = new THREE.Vector2(), mouseTarget = new THREE.Vector2();
addEventListener('pointermove', e => mouseTarget.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)), { passive: true });
addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});

let visible = true;
document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

const clock = new THREE.Clock();
let morph = 0;
function frame() {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = reduced ? 0 : clock.getElapsedTime();
    const max = document.documentElement.scrollHeight - innerHeight || 1;
    const sp = scrollY / max;                                    // 0..1 page progress
    morph += (Math.min(2, sp * 3) - morph) * 0.05;               // sphere -> knot -> wave by ~2/3 of the page
    mouse.lerp(mouseTarget, 0.06);

    uniforms.uTime.value = t;
    uniforms.uMorph.value = morph;
    uniforms.uMouse.value.copy(mouse);

    const flat = Math.max(0, morph - 1);                          // wave: tilt to a landscape view
    points.rotation.y = t * 0.08 * (1 - flat) + mouse.x * 0.35;
    points.rotation.x = mouse.y * 0.2 + flat * 0.35;
    points.rotation.z = t * 0.03 * (1 - flat);
    // hero: cloud sits right of the text on desktop, centered elsewhere
    points.position.x = mobile ? 0 : THREE.MathUtils.lerp(2.2, 0, Math.min(1, sp * 6));
    camera.position.z = 7 - sp * 1.5;
    renderer.render(scene, camera);
}
frame();
