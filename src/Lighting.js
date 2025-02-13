import * as THREE from "three";

export function setupLighting(scene, sun) {
  // Increase light intensity and improve shadow quality
  const sunLight = new THREE.DirectionalLight(0xffffff, 5.0);
  sunLight.position.copy(sun.position).add(new THREE.Vector3(0, 0, 10));
  sunLight.castShadow = true;
  
  // Better shadow resolution
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.far = 500;

  scene.add(sunLight);
  scene.add(sunLight.target);

  // Brighter ambient light
  const ambientLight = new THREE.AmbientLight(
  0xffffff,
  0.3
)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(
  0xffffff,
  1000
)
scene.add(pointLight)
}
