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
    tilt.rotation.x = 16.1;   // leans forward/back
    tilt.rotation.z = 4.7;   // leans left/right

    // starting angle of the spin
    pivot.rotation.y = 2;

    // where it sits on screen
    pivot.position.set(0, 0, 0);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);

// Renderer
const container = document.getElementById('container3d');

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
container.appendChild(renderer.domElement);

function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);   // false: CSS controls the canvas size
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

window.addEventListener('resize', resize);
resize();

                          // Camera
camera.position.z = 4;
camera.position.y = 0.3;
camera.position.x = 0;

                            // Lights
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(100, 200, 200);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);


const spinSpeed = 0.01;   // radians per frame

function animate() {
  requestAnimationFrame(animate);

  pivot.rotation.y += spinSpeed;   // constant spin

  renderer.render(scene, camera);
}



// Start
animate();