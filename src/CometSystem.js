import * as THREE from "three";

export function createCometSystem(scene) {
  const comets = [];
  let cometSpawnTimer = 0;
  const maxTrailPoints = 30;
  const SUN_RADIUS = 10;  // Adjust based on how large your sun is

  function randomSpherePoint(radius) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  }

  function spawnComet() {
    // Start from a random sphere boundary around the scene
    const startPos = randomSpherePoint(100 + Math.random() * 50);
    
    const randomDir = randomSpherePoint(1).normalize();
    const speed = 0.5 + Math.random() * 0.5; // some random speed
    const velocity = randomDir.multiplyScalar(speed);


    // Comet sprite
    const cometTexture = new THREE.TextureLoader().load("./textures/stars/circle.png");
    const cometMaterial = new THREE.SpriteMaterial({
      map: cometTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const cometHead = new THREE.Sprite(cometMaterial);
    cometHead.scale.set(1.5, 1.5, 1.5);
    cometHead.position.copy(startPos);
    cometHead.castShadow = true;

    // Build the trail geometry
    const trailPositions = [];
    const trailAlphas = [];
    for (let i = 0; i < maxTrailPoints; i++) {
      trailPositions.push(startPos.x, startPos.y, startPos.z);
      trailAlphas.push(1.0);
    }

    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute("position", new THREE.Float32BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute("alpha", new THREE.Float32BufferAttribute(trailAlphas, 1));

    // ShaderMaterial for a fading line
    const trailMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: `
        attribute float alpha;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 color;
        void main() {
          gl_FragColor = vec4(color, vAlpha);
        }
      `,
      uniforms: {
        color: { value: new THREE.Color(0xffffff) },
      }
    });

    const trailLine = new THREE.Line(trailGeometry, trailMaterial);
    trailLine.frustumCulled = false;

    // Group
    const cometGroup = new THREE.Group();
    cometGroup.add(cometHead);
    cometGroup.add(trailLine);
    scene.add(cometGroup);

    return {
      group: cometGroup,
      head: cometHead,
      velocity: velocity,
      trailLine,
      trailPositions,
      trailAlphas,
      maxTrailPoints,
    };
  }

  function updateComets(delta) {
    for (let i = comets.length - 1; i >= 0; i--) {
      const comet = comets[i];
      comet.head.position.addScaledVector(comet.velocity, delta * 10);

      comet.trailPositions.push(comet.head.position.x, comet.head.position.y, comet.head.position.z);
      comet.trailAlphas.push(1.0);

      while (comet.trailPositions.length > comet.maxTrailPoints * 3) {
        comet.trailPositions.splice(0, 3);
        comet.trailAlphas.splice(0, 1);
      }

      // Fade older points
      for (let j = 0; j < comet.trailAlphas.length; j++) {
        comet.trailAlphas[j] *= 0.95;
      }

      // Update geometry
      comet.trailLine.geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(comet.trailPositions, 3)
      );
      comet.trailLine.geometry.setAttribute(
        "alpha",
        new THREE.Float32BufferAttribute(comet.trailAlphas, 1)
      );
      comet.trailLine.geometry.attributes.position.needsUpdate = true;
      comet.trailLine.geometry.attributes.alpha.needsUpdate = true;

      // Check if comet is inside the sun
      const distFromCenter = comet.head.position.length();
      if (distFromCenter < SUN_RADIUS) {
        // Remove the comet from the scene
        scene.remove(comet.group);
        comets.splice(i, 1);
        continue;
      }
    }
  }

  function update(delta) {
    cometSpawnTimer -= delta;
    if (cometSpawnTimer <= 0) {
      comets.push(spawnComet());
      cometSpawnTimer = Math.random() * 5 + 3;
    }
    updateComets(delta);
  }

  return {
    update,
  };
}
