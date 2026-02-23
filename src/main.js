import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { initQMRGMode } from './qmrg_mode.js'

document.querySelector('#app').innerHTML = `
  <header class="title-card">
    <h1>Watch Paint Dry</h1>
    <p class="subtitle">Paint in 3D space • Mouse/Arrows to move • Scroll/W-S for depth • Space to paint</p>
  </header>
  <main>
    <div id="depth-indicator" aria-hidden="true">
      <div class="depth-bar">
        <div class="depth-marker"></div>
      </div>
      <span class="depth-label">Depth</span>
    </div>
    <div id="canvas-container" role="img" aria-label="3D Painting Canvas. Use mouse to paint, scroll for depth."></div>
    <nav class="controls" aria-label="Painting Controls">
      <button class="color-btn active" style="background: #FF1744" data-color="#FF1744" aria-label="Red Paint" title="Red Paint"></button>
      <button class="color-btn" style="background: #FF6F00" data-color="#FF6F00" aria-label="Orange Paint" title="Orange Paint"></button>
      <button class="color-btn" style="background: #00E5FF" data-color="#00E5FF" aria-label="Cyan Paint" title="Cyan Paint"></button>
      <button class="color-btn" style="background: #2979FF" data-color="#2979FF" aria-label="Blue Paint" title="Blue Paint"></button>
      <button class="color-btn" style="background: #D500F9" data-color="#D500F9" aria-label="Purple Paint" title="Purple Paint"></button>
      <button class="color-btn" style="background: #76FF03" data-color="#76FF03" aria-label="Green Paint" title="Green Paint"></button>
      <button class="color-btn" style="background: #000000" data-color="#000000" aria-label="Black Paint" title="Black Paint"></button>
      <button class="tool-btn" id="clear-btn" aria-label="Clear Canvas">Clear</button>
      <button class="tool-btn" id="rotate-btn" aria-label="Toggle Auto Rotate">Auto Rotate</button>
      <div class="speed-control">
        <label for="speed-slider" class="label">Speed</label>
        <input type="range" id="speed-slider" min="0" max="50" value="1" step="0.1" aria-label="Rotation Speed">
      </div>
    </nav>
  </main>
`

// Three.js setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 0;
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Orbit controls for 3D rotation
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotateSpeed = 1.0; // Slower, more cinematic
controls.minDistance = 2;
controls.maxDistance = 100;

// Lighting for 3D effect
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-5, 5, -5);
scene.add(pointLight);

// Add visual depth reference grids
function createDepthGrid(z, color, opacity) {
  const gridHelper = new THREE.GridHelper(20, 20, color, color);
  gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
  gridHelper.position.z = z;
  gridHelper.material.opacity = opacity;
  gridHelper.material.transparent = true;
  return gridHelper;
}

// Remove fixed grids for a cleaner experience, or make them very subtle points
function createCloudHelper() {
  const points = [];
  for (let i = 0; i < 500; i++) {
    points.push(new THREE.Vector3(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 30
    ));
  }
  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.PointsMaterial({ color: 0x444444, size: 0.05 });
  return new THREE.Points(geom, mat);
}
scene.add(createCloudHelper());

// Paint system
let currentColor = '#FF1744';
let isDrawing = false;
let brushSize = 0.3;
let strokePoints = [];
let paintStrokes = [];
let autoRotate = false;
let drawDistance = 15; // Distance from camera to painting plane (range: 5 to 40)

// Raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let mouseMoved = false;

// Brush cursor helper - MUCH LARGER and glowier
const cursorGeometry = new THREE.RingGeometry(0.8, 1.0, 32);
const cursorMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.8
});
const brushCursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
scene.add(brushCursor);

// Add a center dot to the cursor
const centerDotGeom = new THREE.SphereGeometry(0.15, 8, 8);
const centerDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
const centerDot = new THREE.Mesh(centerDotGeom, centerDotMat);
brushCursor.add(centerDot);

// Painting plane helper - MUCH MORE VISIBLE
const planeHelperGeom = new THREE.PlaneGeometry(30, 30);
const planeHelperMat = new THREE.MeshBasicMaterial({
  color: 0x444444,
  transparent: true,
  opacity: 0.1,
  side: THREE.DoubleSide,
  depthWrite: false,
  wireframe: true
});
const planeHelper = new THREE.Mesh(planeHelperGeom, planeHelperMat);
scene.add(planeHelper);

// Current intersection point for cursor
let currentIntersectPoint = new THREE.Vector3();

// Update depth indicator
function updateDepthIndicator() {
  const depthMarker = document.querySelector('.depth-marker');
  const percentage = ((drawDistance - 5) / 35) * 100; // Map 5-40 -> 0-100%
  depthMarker.style.bottom = `${100 - percentage}%`; // Invert so 'scrolling up' is 'deeper'
}
updateDepthIndicator();

// Convert hex to THREE.Color
function hexToThreeColor(hex) {
  return new THREE.Color(hex);
}

// Create a 3D paint stroke mesh
function createPaintStroke(points, color) {
  if (points.length < 2) return null;

  // Create a tube geometry from the points
  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 2, brushSize, 8, false);

  // Hyperrealistic material with wetness
  const material = new THREE.MeshStandardMaterial({
    color: color,
    metalness: 0.6,
    roughness: 0.1,
    emissive: color,
    emissiveIntensity: 0.2,
  });

  const mesh = new THREE.Mesh(tubeGeometry, material);
  mesh.userData = {
    wetness: 1.0,
    baseColor: color.clone(),
    creationTime: Date.now()
  };

  return mesh;
}

function getMousePosition(event) {
  if (event.isKeyboard) return; // Skip for keyboard navigation
  const rect = renderer.domElement.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;

  mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

  updateCursor();
}

function updateCursor() {
  // Always update raycaster
  raycaster.setFromCamera(mouse, camera);

  // Plane perpendicular to camera direction
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);

  const planeNormal = cameraDir.clone().negate();

  // Plane point is 'drawDistance' units away from camera
  const planePoint = camera.position.clone().add(cameraDir.clone().multiplyScalar(drawDistance));
  const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(planeNormal, planePoint);

  raycaster.ray.intersectPlane(plane, currentIntersectPoint);

  if (currentIntersectPoint) {
    // Positioning the cursor
    brushCursor.position.copy(currentIntersectPoint);
    brushCursor.lookAt(camera.position); // Always face camera
    const scale = drawDistance * 0.05; // Make cursor feel consistent in size
    brushCursor.scale.set(scale, scale, scale);
    brushCursor.visible = true;
    brushCursor.material.color.set(currentColor);

    // Position and rotate the plane helper
    planeHelper.position.copy(currentIntersectPoint);
    planeHelper.lookAt(camera.position);
    planeHelper.visible = true;
    planeHelper.material.opacity = isDrawing ? 0.3 : 0.1;
    planeHelper.material.color.set(currentColor);
  } else {
    brushCursor.visible = false;
    planeHelper.visible = false;
  }
}

function startDrawing(event) {
  event.preventDefault();
  getMousePosition(event);

  // Check if not clicking on controls
  if (event.target.closest('.controls') || event.target.closest('#depth-indicator')) return;

  isDrawing = true;
  mouseMoved = false;
  strokePoints = [];
  controls.enabled = false; // Disable orbit while drawing

  updateCursor();
  if (currentIntersectPoint) {
    strokePoints.push(currentIntersectPoint.clone());
  }
}

function draw(event) {
  if (!isDrawing) return;
  if (!event.isKeyboard) event.preventDefault();
  mouseMoved = true;

  getMousePosition(event);
  updateCursor();

  if (!currentIntersectPoint) return;

  // Only add point if it's far enough from last point
  if (strokePoints.length === 0 || currentIntersectPoint.distanceTo(strokePoints[strokePoints.length - 1]) > 0.1) {
    strokePoints.push(currentIntersectPoint.clone());

    // Live preview - update stroke in real-time
    if (strokePoints.length >= 2) {
      // Remove previous preview
      const previews = scene.children.filter(child => child.userData.isPreview);
      previews.forEach(preview => scene.remove(preview));

      // Add new preview
      const previewStroke = createPaintStroke(strokePoints, hexToThreeColor(currentColor));
      if (previewStroke) {
        previewStroke.userData.isPreview = true;
        scene.add(previewStroke);
      }
    }
  }
}


function stopDrawing(event) {
  if (!isDrawing) return;
  event.preventDefault();

  isDrawing = false;
  controls.enabled = true; // Re-enable orbit

  // Remove preview
  const previews = scene.children.filter(child => child.userData.isPreview);
  previews.forEach(preview => scene.remove(preview));

  // Create final stroke
  if (strokePoints.length >= 2 && mouseMoved) {
    const stroke = createPaintStroke(strokePoints, hexToThreeColor(currentColor));
    if (stroke) {
      scene.add(stroke);
      paintStrokes.push(stroke);
      saveStrokes(); // Persistent save
    }
  }

  strokePoints = [];
}

// Persistence logic
function saveStrokes() {
  const serializedStrokes = paintStrokes.map(stroke => ({
    points: stroke.geometry.parameters.path.points.map(p => ({ x: p.x, y: p.y, z: p.z })),
    color: `#${stroke.material.color.getHexString()}`
  }));
  localStorage.setItem('paint3d_strokes', JSON.stringify(serializedStrokes));
}

function loadStrokes() {
  const saved = localStorage.getItem('paint3d_strokes');
  if (!saved) return;

  try {
    const serialized = JSON.parse(saved);
    serialized.forEach(s => {
      const points = s.points.map(p => new THREE.Vector3(p.x, p.y, p.z));
      const stroke = createPaintStroke(points, hexToThreeColor(s.color));
      if (stroke) {
        scene.add(stroke);
        paintStrokes.push(stroke);
      }
    });
  } catch (e) {
    console.error('Failed to load strokes', e);
  }
}
loadStrokes();

// Event listeners
renderer.domElement.addEventListener('mousedown', startDrawing);
renderer.domElement.addEventListener('mousemove', draw);
renderer.domElement.addEventListener('mouseup', stopDrawing);
renderer.domElement.addEventListener('mouseleave', stopDrawing);

renderer.domElement.addEventListener('touchstart', startDrawing);
renderer.domElement.addEventListener('touchmove', draw);
renderer.domElement.addEventListener('touchend', stopDrawing);

// Keyboard navigation for accessibility
window.addEventListener('keydown', (event) => {
  const step = 0.5;
  let moved = false;

  if (event.key === 'ArrowLeft') {
    mouse.x = Math.max(-1, mouse.x - 0.05);
    moved = true;
  } else if (event.key === 'ArrowRight') {
    mouse.x = Math.min(1, mouse.x + 0.05);
    moved = true;
  } else if (event.key === 'ArrowUp') {
    mouse.y = Math.min(1, mouse.y + 0.05);
    moved = true;
  } else if (event.key === 'ArrowDown') {
    mouse.y = Math.max(-1, mouse.y - 0.05);
    moved = true;
  } else if (event.key === ' ' || event.key === 'Enter') {
    if (!isDrawing) {
      startDrawing({ preventDefault: () => { }, target: renderer.domElement, clientX: 0, clientY: 0, isKeyboard: true });
    }
  } else if (event.key === 'w' || event.key === 'W') {
    drawDistance = Math.min(40, drawDistance + 1);
    updateDepthIndicator();
    moved = true;
  } else if (event.key === 's' || event.key === 'S') {
    drawDistance = Math.max(5, drawDistance - 1);
    updateDepthIndicator();
    moved = true;
  }

  if (moved) {
    updateCursor();
    if (isDrawing) {
      // Simulate a draw event
      draw({ preventDefault: () => { }, isKeyboard: true });
    }
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key === ' ' || event.key === 'Enter') {
    stopDrawing({ preventDefault: () => { } });
  }
});

// Scroll wheel for depth control
renderer.domElement.addEventListener('wheel', (event) => {
  event.preventDefault();
  const delta = event.deltaY * 0.05; // Adjusted sensitivity
  drawDistance = Math.max(5, Math.min(40, drawDistance + delta));
  updateDepthIndicator();
}, { passive: false });

// Window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // No manual scene rotation, we use controls.autoRotate

  // Drying effect - gradually reduce metalness and emissive
  const currentTime = Date.now();
  paintStrokes.forEach(stroke => {
    const age = (currentTime - stroke.userData.creationTime) / 1000; // seconds
    const wetness = Math.max(0, 1 - age / 30); // Dry over 30 seconds

    stroke.userData.wetness = wetness;
    stroke.material.metalness = 0.1 + wetness * 0.5;
    stroke.material.roughness = 0.5 - wetness * 0.4;
    stroke.material.emissiveIntensity = wetness * 0.2;
    stroke.material.needsUpdate = true;
  });

  controls.update();
  updateCursor(); // Keep cursor following camera/depth
  renderer.render(scene, camera);
}

animate();

// Controls
document.querySelectorAll('.color-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.color-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentColor = btn.dataset.color;
  });
});

document.getElementById('clear-btn').addEventListener('click', () => {
  paintStrokes.forEach(stroke => scene.remove(stroke));
  paintStrokes = [];
  localStorage.removeItem('paint3d_strokes');
});

document.getElementById('rotate-btn').addEventListener('click', () => {
  autoRotate = !autoRotate;
  controls.autoRotate = autoRotate;

  if (autoRotate && paintStrokes.length > 0) {
    // Calculate bounding center of all strokes
    const box = new THREE.Box3();
    paintStrokes.forEach(stroke => {
      stroke.geometry.computeBoundingBox();
      box.expandByPoint(stroke.position);
      const strokeBox = stroke.geometry.boundingBox.clone();
      strokeBox.applyMatrix4(stroke.matrixWorld);
      box.union(strokeBox);
    });

    const center = new THREE.Vector3();
    box.getCenter(center);
    controls.target.copy(center);
  }

  document.getElementById('rotate-btn').style.background = autoRotate
    ? 'rgba(255, 255, 255, 0.2)'
    : 'transparent';
});

// Speed control listener
document.getElementById('speed-slider').addEventListener('input', (event) => {
  const speed = parseFloat(event.target.value);
  controls.autoRotateSpeed = speed;
});

// Initialize QMRG Mode
const qmrgMode = initQMRGMode(scene, camera, renderer);
