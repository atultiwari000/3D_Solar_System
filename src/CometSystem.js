import * as THREE from "three";

export function createCometSystem(scene) {
  const comets = [];
  let cometSpawnTimer = 0;
  const maxTrailPoints = 20;

  // Spawns a comet (a sprite with a trail)
  function spawnComet() {
    const cometTexture = new THREE.TextureLoader().load("./textures/stars/circle.png");
    const cometMaterial = new THREE.SpriteMaterial({
      map: cometTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
    });
    const cometHead = new THREE.Sprite(cometMaterial);
    cometHead.scale.set(1, 1, 1);

    // Set a random starting position (above the scene)
    const startX = (Math.random() - 0.5) * 100;
    const startY = 50 + Math.random() * 20;
    const startZ = (Math.random() - 0.5) * 100;
    cometHead.position.set(startX, startY, startZ);

    // Set a velocity vector (mostly downward)
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.2,
      -(0.5 + Math.random() * 0.5),
      (Math.random() - 0.5) * 0.2
    );

    // Create a trail for the comet using a line geometry
    const trailPositions = [];
    for (let i = 0; i < maxTrailPoints; i++) {
      trailPositions.push(cometHead.position.x, cometHead.position.y, cometHead.position.z);
    }
    const trailGeometry = new THREE.BufferGeometry();
    trailGeometry.setAttribute("position", new THREE.Float32BufferAttribute(trailPositions, 3));
    const trailMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.5,
      linewidth: 2,
    });
    const trailLine = new THREE.Line(trailGeometry, trailMaterial);

    // Group the comet head and trail together
    const cometGroup = new THREE.Group();
    cometGroup.add(cometHead);
    cometGroup.add(trailLine);
    scene.add(cometGroup);

    return {
      group: cometGroup,
      head: cometHead,
      velocity: velocity,
      trailLine: trailLine,
      trailPositions: trailPositions,
      maxTrailPoints: maxTrailPoints,
    };
  }

  // Update existing comets: move them and update their trails
  function updateComets() {
    for (let i = comets.length - 1; i >= 0; i--) {
      const comet = comets[i];
      // Update the comet head position
      comet.head.position.add(comet.velocity);

      // Update the trail positions
      comet.trailPositions.push(comet.head.position.x, comet.head.position.y, comet.head.position.z);
      while (comet.trailPositions.length > comet.maxTrailPoints * 3) {
        comet.trailPositions.splice(0, 3);
      }
      comet.trailLine.geometry.setAttribute("position", new THREE.Float32BufferAttribute(comet.trailPositions, 3));
      comet.trailLine.geometry.attributes.position.needsUpdate = true;

      // Remove comet if it goes below a set Y-coordinate
      if (comet.head.position.y < -50) {
        scene.remove(comet.group);
        comets.splice(i, 1);
      }
    }
  }

  // Update method to spawn and update comets over time
  function update(delta) {
    cometSpawnTimer -= delta;
    if (cometSpawnTimer <= 0) {
      comets.push(spawnComet());
      cometSpawnTimer = Math.random() * 5 + 3;
    }
    updateComets();
  }

  return {
    update,
  };
}
