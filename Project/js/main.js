import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);

let object;
const objToRender = 'esp';

// Groups: pivot (spins) -> tilt (fixed slant) -> object (stood up once)
const pivot = new THREE.Group();
const tilt = new THREE.Group();
pivot.add(tilt);
scene.add(pivot);

// Drag / momentum state
let isDragging = false;
let lastX = 0;
let velocityY = 0;
const friction = 0.95;

const loader = new GLTFLoader();

// Load the file
loader.load(
  `model/${objToRender}/esp.gltf`,
  function (gltf) {
    object = gltf.scene;

    // stand the board up once
    object.rotation.x = Math.PI / 2;

    // center the model
    object.updateMatrixWorld(true);
    const center = new THREE.Box3().setFromObject(object).getCenter(new THREE.Vector3());
    object.position.sub(center);

    tilt.add(object);

    // the fixed slant (radians)
    tilt.rotation.x = 16;   // leans forward/back
    tilt.rotation.z = 4.32;   // leans left/right

    // starting angle of the spin
    pivot.rotation.y = 2;

    // where it sits on screen
    pivot.position.set(2, 0.1, 0);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);

// Renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3d').appendChild(renderer.domElement);

// Camera
camera.position.z = 4;
camera.position.y = 0.3;
camera.position.x = 0.5;

// Lights
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(100, 200, 200);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

// Render loop with momentum
function animate() {
  requestAnimationFrame(animate);

  if (!isDragging) {
    pivot.rotation.y += velocityY;
    velocityY *= friction;
    if (Math.abs(velocityY) < 0.0001) velocityY = 0;
  }

  renderer.render(scene, camera);
}

// Resize
window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Drag to spin
window.addEventListener('pointerdown', (e) => {
  isDragging = true;
  lastX = e.clientX;
  velocityY = 0;
});

window.addEventListener('pointerup', () => {
  isDragging = false;
});

window.addEventListener('pointermove', (e) => {
  if (!isDragging) return;

  const dx = e.clientX - lastX;
  velocityY = dx * 0.01;
  pivot.rotation.y += velocityY;   // spin the pivot, never the model
  lastX = e.clientX;
});

// Start
animate();