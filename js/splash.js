/* =============================================
   HEXAWARE - Splash Page
   ============================================= */
'use strict';

let splashGlobe = null;
let splashAnimId = null;
let splashInited = false;

window.initSplash = function() {
  if (splashInited) return;
  splashInited = true;
  initGlobe();
  startProgressBar();
};

/* ─── Three.js Globe ─── */
function initGlobe() {
  const canvas = document.getElementById('splash-canvas');
  if (!canvas || !window.THREE) { console.warn('Three.js or canvas not found'); return; }

  const W = canvas.clientWidth, H = canvas.clientHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
  camera.position.z = 3.2;

  // Globe sphere
  const globeGeo  = new THREE.SphereGeometry(1.2, 48, 48);
  const globeMat  = new THREE.MeshBasicMaterial({ color: 0x050A1A, wireframe: false, transparent: true, opacity: 0.0 });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Wireframe overlay
  const wireMat  = new THREE.MeshBasicMaterial({ color: 0x00D4FF, wireframe: true, transparent: true, opacity: 0.12 });
  const wireframe = new THREE.Mesh(globeGeo, wireMat);
  globe.add(wireframe);

  // Glowing equator ring
  const ringGeo = new THREE.TorusGeometry(1.25, 0.008, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);

  // Second ring (tilted)
  const ring2 = ring.clone();
  ring2.rotation.x = Math.PI / 4;
  ring2.material = ring2.material.clone();
  ring2.material.color.set(0x7B2FFF);
  ring2.material.opacity = 0.35;
  scene.add(ring2);

  // Consultant node dots on globe surface
  const nodeGroup = new THREE.Group();
  scene.add(nodeGroup);

  const nodePositions = [
    [0.3, 0.8],  [1.1, 0.4], [2.5, 0.6], [4.0, 0.3], [5.0, 0.7],
    [0.8, 1.2],  [2.0, 1.1], [3.5, 0.9], [4.8, 1.3], [1.5, 0.2],
    [3.0, 0.5],  [5.5, 0.4], [0.5, 0.5], [2.8, 1.0], [4.3, 0.8]
  ];

  const nodeColors = [0x00D4FF, 0x7B2FFF, 0x00FFB3, 0xFFB800];

  nodePositions.forEach(([lon, lat]) => {
    const phi   = lat * 0.5;
    const theta = lon;
    const x = 1.21 * Math.sin(phi) * Math.cos(theta);
    const y = 1.21 * Math.cos(phi);
    const z = 1.21 * Math.sin(phi) * Math.sin(theta);

    const geo  = new THREE.SphereGeometry(0.025, 8, 8);
    const col  = nodeColors[Math.floor(Math.random() * nodeColors.length)];
    const mat  = new THREE.MeshBasicMaterial({ color: col });
    const node = new THREE.Mesh(geo, mat);
    node.position.set(x, y, z);
    node.userData = { pulseFactor: Math.random() * Math.PI * 2, baseScale: 0.8 + Math.random() * 0.8 };
    nodeGroup.add(node);

    // Connecting line from center
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, y, z)
    ]);
    const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.12 });
    nodeGroup.add(new THREE.Line(lineGeo, lineMat));
  });

  // Ambient glow (point light simulation via additive sphere)
  const glowGeo = new THREE.SphereGeometry(1.35, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x00D4FF, transparent: true, opacity: 0.04, side: THREE.BackSide });
  scene.add(new THREE.Mesh(glowGeo, glowMat));

  // Particle field
  const particleCount = 300;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i*3]   = (Math.random() - 0.5) * 8;
    pPositions[i*3+1] = (Math.random() - 0.5) * 6;
    pPositions[i*3+2] = (Math.random() - 0.5) * 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0x1E6FFF, size: 0.025, transparent: true, opacity: 0.5 });
  scene.add(new THREE.Points(pGeo, pMat));

  // Animate
  let t = 0;
  function animate() {
    splashAnimId = requestAnimationFrame(animate);
    t += 0.008;

    globe.rotation.y = t * 0.5;
    nodeGroup.rotation.y = t * 0.5;

    ring.rotation.z  = t * 0.3;
    ring2.rotation.y = t * 0.2;

    // Pulse nodes
    nodeGroup.children.forEach((child, i) => {
      if (child.userData && child.userData.pulseFactor !== undefined) {
        const scale = child.userData.baseScale + Math.sin(t * 2 + child.userData.pulseFactor) * 0.4;
        child.scale.setScalar(scale);
      }
    });

    renderer.render(scene, camera);
  }
  animate();

  // Resize
  const resizeObs = new ResizeObserver(() => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });
  resizeObs.observe(canvas);

  splashGlobe = { renderer, scene, camera, animId: splashAnimId };
}

/* ─── Progress Bar ─── */
function startProgressBar() {
  const labels = [
    'Initializing Agents...',
    'Loading Resume Agent...',
    'Syncing Attendance Agent...',
    'Activating Opportunity Agent...',
    'Deploying Training Agent...',
    'Activating AI Framework...',
    'System Ready ✦'
  ];
  const fill    = document.getElementById('splash-fill');
  const labelEl = document.getElementById('splash-label');
  const pctEl   = document.getElementById('splash-pct');
  if (!fill || !labelEl) return;

  let step = 0;
  const totalSteps = labels.length;

  function updateStep() {
    if (step >= totalSteps) {
      // Complete — advance to home
      setTimeout(() => {
        window.navigateTo('home');
      }, 600);
      return;
    }
    const pct = Math.round((step / (totalSteps - 1)) * 100);
    labelEl.style.opacity = '0';
    setTimeout(() => {
      labelEl.textContent = labels[step];
      labelEl.style.opacity = '1';
    }, 200);
    fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    step++;
    setTimeout(updateStep, 600 + Math.random() * 300);
  }

  setTimeout(updateStep, 800);
}
