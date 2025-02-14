import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createPlanetSystem } from "./PlanetSystem.js";
import { createCometSystem } from "./CometSystem.js";
import { setupLighting } from "./Lighting.js";

const scene = new THREE.Scene();

// Initialize texture loaders first
const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
cubeTextureLoader.setPath('/textures/cubemap/');

// Load textures first
const mercuryTexture = textureLoader.load("./textures/2k_mercury.jpg");
mercuryTexture.colorSpace = THREE.SRGBColorSpace;
const venusTexture = textureLoader.load("/textures/2k_venus_surface.jpg");
venusTexture.colorSpace = THREE.SRGBColorSpace;
const earthTexture = textureLoader.load("/textures/2k_earth_daymap.jpg");
earthTexture.colorSpace = THREE.SRGBColorSpace;
const marsTexture = textureLoader.load("/textures/2k_mars.jpg");
marsTexture.colorSpace = THREE.SRGBColorSpace;
const moonTexture = textureLoader.load("/textures/2k_moon.jpg");
moonTexture.colorSpace = THREE.SRGBColorSpace;
const jupiterTexture = textureLoader.load("/textures/8k_jupiter.jpg");
jupiterTexture.colorSpace = THREE.SRGBColorSpace;
const saturnTexture = textureLoader.load("/textures/saturn.jpg");
saturnTexture.colorSpace = THREE.SRGBColorSpace;

// Create planetTextures object AFTER loading textures
const planetTextures = {
  mercuryTexture,
  venusTexture,
  earthTexture,
  marsTexture,
  moonTexture,
  jupiterTexture,
  saturnTexture
};

// Initialize geometry and materials AFTER textures are loaded
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);

// Create sun and background AFTER textures
const sunTexture = textureLoader.load("/textures/2k_sun.jpg");
sunTexture.colorSpace = THREE.SRGBColorSpace;
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sun = new THREE.Mesh(sphereGeometry, sunMaterial);
sun.position.set(0, 0, 0);
sun.scale.setScalar(7);
sun.castShadow = false;
scene.add(sun);

setupLighting(scene, sun); 

// Initialize systems AFTER dependencies are ready
const planetSystem = createPlanetSystem(
  scene, 
  textureLoader, 
  sphereGeometry,
  planetTextures
);

const cometSystem = createCometSystem(scene, sun);

// Store references AFTER planet system is created
const planets = planetSystem.planets;
const planetMeshes = planetSystem.planetObjects;

const ringGeometry = new THREE.RingGeometry(2, 4, 64);
const ringMaterial = new THREE.MeshStandardMaterial({
  map: saturnTexture,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.5,
});

const ring = new THREE.Mesh(ringGeometry, ringMaterial);
ring.rotation.x = Math.PI / 2;
ring.position.y = 0;

// const stars = getStarfield({ numStars: 500 });
// scene.add(stars);

// add camera
const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  400
);
camera.position.z = 60;
camera.position.y = 5;

const backgroundCubemap = cubeTextureLoader
.load( [
  'px.png',
  'nx.png',
  'py.png',
  'ny.png',
  'pz.png',
  'nz.png'
] );

scene.background = backgroundCubemap

// add renderer
const canvas = document.querySelector("canvas.threejs");
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true});  // use powerPreference: "high-performance" here if needed
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

// Enable shadows
renderer.shadowMap.enabled = true;
// For softer shadows:
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// ad controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxDistance = 200;
controls.minDistance = 20;


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedPlanet = null;
let isResetting = false;

// Store the initial camera position and target
const initialCameraPosition = camera.position.clone();
const initialTarget = controls.target.clone();

window.panToPlanet = panToPlanet;
window.resetView = resetView;

function panToPlanet(planetName) {
  planetName = planetName.charAt(0).toUpperCase() + planetName.slice(1).toLowerCase();
  const planetIndex = planets.findIndex(p => p.name === planetName);
  if (planetIndex === -1) {
    console.warn(`Planet ${planetName} not found!`);
    return;
  }
  
  selectedPlanet = planetMeshes[planetIndex];
}

window.addEventListener('load', () => {
  document.querySelector('.loading').classList.add('hidden');
});

window.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(planetMeshes, true);

  if (intersects.length > 0) {
    selectedPlanet = intersects[0].object;
  } else {
    selectedPlanet = null;
    controls.enableDamping = true;
  }
});

function resetView() {
  selectedPlanet = null;
  isResetting = true;
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Update the planetary system and comet system
  planetSystem.update(delta);
  cometSystem.update(delta);

  // Smoothly adjust camera if a planet is selected
  if (selectedPlanet) {
    const planetWorldPos = new THREE.Vector3();
    selectedPlanet.getWorldPosition(planetWorldPos);
    const planetRadius = selectedPlanet.scale.x;
    const distance = planetRadius * 5;
    const offset = new THREE.Vector3(distance * 1.5, distance * 0.5, distance);
    const cameraTargetPos = planetWorldPos.clone().add(offset);
    camera.position.lerp(cameraTargetPos, 0.1);
    controls.target.lerp(planetWorldPos, 0.1);
  } else if (isResetting) {
    camera.position.lerp(initialCameraPosition, 0.1);
    controls.target.lerp(initialTarget, 0.1);
    if (camera.position.distanceTo(initialCameraPosition) < 0.1) {
      isResetting = false;
    }
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleNav = document.getElementById('toggleNav');
  const planetNav = document.querySelector('.planet-nav');

  toggleNav.addEventListener('click', () => {
    planetNav.classList.toggle('show');
  });
});