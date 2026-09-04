/* ============================================================
   THREE.js — animated constellation background
   Renders into #bg-canvas. Degrades silently if WebGL/module
   loading is unavailable — the CSS gradient blobs remain as
   the fallback background.
   ============================================================ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 700;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 480;

  const COUNT = isSmall ? 90 : 210;
  const SPREAD = 900;
  const LINK_DIST = isSmall ? 110 : 130;

  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const speeds = new Float32Array(COUNT);

  const palette = [
    new THREE.Color('#5b8cff'),
    new THREE.Color('#a855f7'),
    new THREE.Color('#ec4899'),
  ];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * SPREAD;
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 0.65;
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 0.6;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;

    speeds[i] = 0.15 + Math.random() * 0.35;
  }

  // soft round sprite for glowing points
  function makeDotTexture() {
    const size = 64;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.6)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(c);
  }

  const pointsGeo = new THREE.BufferGeometry();
  pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const pointsMat = new THREE.PointsMaterial({
    size: isSmall ? 4.2 : 5.2,
    map: makeDotTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(pointsGeo, pointsMat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  // connecting lines
  const maxLines = COUNT * 6;
  const linePositions = new Float32Array(maxLines * 2 * 3);
  const lineColors = new Float32Array(maxLines * 2 * 3);
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
  lineGeo.setDrawRange(0, 0);
  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // focal wireframe centerpiece — sits off to the right, roughly behind the hero photo
  const centerpiece = new THREE.Group();
  centerpiece.position.set(isSmall ? 0 : 230, 20, -120);
  const wireGeo = new THREE.IcosahedronGeometry(isSmall ? 70 : 110, 1);
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x7ea2ff, wireframe: true, transparent: true, opacity: 0.35 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  centerpiece.add(wireMesh);
  const coreGeo = new THREE.IcosahedronGeometry(isSmall ? 40 : 62, 1);
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending, depthWrite: false });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  centerpiece.add(coreMesh);
  scene.add(centerpiece);

  function rebuildLinks() {
    let idx = 0;
    for (let i = 0; i < COUNT && idx < maxLines; i++) {
      for (let j = i + 1; j < COUNT && idx < maxLines; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < LINK_DIST) {
          const a = idx * 6;
          linePositions[a]     = positions[i * 3];
          linePositions[a + 1] = positions[i * 3 + 1];
          linePositions[a + 2] = positions[i * 3 + 2];
          linePositions[a + 3] = positions[j * 3];
          linePositions[a + 4] = positions[j * 3 + 1];
          linePositions[a + 5] = positions[j * 3 + 2];
          lineColors[a] = 0.36; lineColors[a + 1] = 0.55; lineColors[a + 2] = 1;
          lineColors[a + 3] = 0.66; lineColors[a + 4] = 0.33; lineColors[a + 5] = 0.97;
          idx++;
        }
      }
    }
    lineGeo.attributes.position.needsUpdate = true;
    lineGeo.attributes.color.needsUpdate = true;
    lineGeo.setDrawRange(0, idx * 2);
  }
  rebuildLinks();

  let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);

  let frame = 0;
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) animate();
  });

  function animate() {
    if (!running) return;
    frame++;

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3 + 1] += Math.sin(frame * 0.01 + i) * speeds[i] * 0.05;
      positions[i * 3] += Math.cos(frame * 0.008 + i) * speeds[i] * 0.04;
    }
    pointsGeo.attributes.position.needsUpdate = true;

    if (frame % 6 === 0) rebuildLinks();

    wireMesh.rotation.x += 0.0018;
    wireMesh.rotation.y += 0.0026;
    coreMesh.rotation.x -= 0.001;
    coreMesh.rotation.y += 0.0014;
    centerpiece.position.y = 20 + Math.sin(frame * 0.006) * 14;

    targetRotX += (mouseY * 0.25 - targetRotX) * 0.02;
    targetRotY += (mouseX * 0.35 - targetRotY) * 0.02;
    group.rotation.x = targetRotX;
    group.rotation.y += 0.0006 + targetRotY * 0.001;
    camera.position.x += (mouseX * 60 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 40 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
    if (!reduceMotion) requestAnimationFrame(animate);
  }

  renderer.render(scene, camera);
  if (!reduceMotion) requestAnimationFrame(animate);
})();
