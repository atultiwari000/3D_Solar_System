import * as THREE from "three";

export function setupLighting(scene, sun) {
  const sunLight = new THREE.PointLight(0xffffff, 5.0, 1000);
  sunLight.position.copy(sun.position); 
  sunLight.castShadow = true;
  
  // Tweak shadow quality:
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 0.1;
  sunLight.shadow.camera.far = 2000;
  scene.add(sunLight);

  const ambientLight = new THREE.AmbientLight(
    0xffffff,
    0.5
  );
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(
    0xffffff,
    1500
  );
  scene.add(pointLight)

  const fillLight = new THREE.PointLight(0xffffff, 0.1, 1000);
  fillLight.position.set(50, 50, 50);
  scene.add(fillLight);
}
