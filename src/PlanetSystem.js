import * as THREE from "three";

export function createPlanetSystem(scene, textureLoader, sphereGeometry, planetTextures) {
    const {
    mercuryTexture,
    venusTexture,
    earthTexture,
    marsTexture,
    moonTexture,
    jupiterTexture,
    saturnTexture
   } = planetTextures;

  const planets = [
    {
      name: "Mercury",
      radius: 0.5,
      distance: 10,
      tilt: 0.01,
      revolutionSpeed: 0.01,
      rotationSpeed: 0.02,
      material: new THREE.MeshStandardMaterial({ map: mercuryTexture }),
      moons: [],
    },
    {
      name: "Venus",
      radius: 0.8,
      distance: 15,
      tilt: 2.64,
      revolutionSpeed: 0.007,
      rotationSpeed: 0.015,
      material: new THREE.MeshStandardMaterial({ map: venusTexture }),
      moons: [],
    },
    {
      name: "Earth",
      radius: 1,
      distance: 20,
      tilt: 23.4,
      revolutionSpeed: 0.005,
      rotationSpeed: 0.05,
      material: new THREE.MeshStandardMaterial({ map: earthTexture }),
      moons: [
        {
          name: "Moon",
          radius: 0.3,
          distance: 3,
          tilt: 6.68,
          revolutionSpeed: 0.015,
          rotationSpeed: 0.02,
          material: new THREE.MeshStandardMaterial({ map: moonTexture }),
        },
      ],
    },
    {
      name: "Mars",
      radius: 0.7,
      distance: 25,
      tilt: 25.19,
      revolutionSpeed: 0.003,
      rotationSpeed: 0.03,
      material: new THREE.MeshStandardMaterial({ map: marsTexture }),
      moons: [
        {
          name: "Phobos",
          radius: 0.1,
          distance: 2,
          tilt: 0,
          revolutionSpeed: 0.02,
          rotationSpeed: 0.01,
          material: new THREE.MeshStandardMaterial({ map: moonTexture }),
        },
        {
          name: "Deimos",
          radius: 0.2,
          distance: 3,
          tilt: 0,
          revolutionSpeed: 0.015,
          rotationSpeed: 0.01,
          material: new THREE.MeshStandardMaterial({ map: moonTexture }),
        },
      ],
    },
    {
      name: "Jupiter",
      radius: 4,
      distance: 30,
      tilt: 3.13,
      revolutionSpeed: 0.001,
      rotationSpeed: 0.1,
      material: new THREE.MeshStandardMaterial({ map: jupiterTexture }),
      moons: [],
    },
    {
      name: "Saturn",
      radius: 4,
      distance: 40,
      tilt: 26.73,
      revolutionSpeed: 0.001,
      rotationSpeed: 0.09,
      material: new THREE.MeshStandardMaterial({ map: saturnTexture }),
      moons: [],
    },
  ];

  const planetObjects = [];

  // Create each planet using nested groups:
  // - An outer group (orbitPivot) for revolution around the sun.
  // - An inner group (planetPivot) for self‑rotation.
  planets.forEach((planet) => {
    const orbitPivot = new THREE.Object3D();
    scene.add(orbitPivot);

    const planetPivot = new THREE.Object3D();
    planetPivot.position.set(planet.distance, 0, 0);
    orbitPivot.add(planetPivot);

    const planetMesh = new THREE.Mesh(sphereGeometry, planet.material);
    planetMesh.scale.setScalar(planet.radius);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    // Apply axial tilt (converted from degrees to radians)
    planetMesh.rotation.z = THREE.MathUtils.degToRad(planet.tilt);
    planetPivot.add(planetMesh);

    planet.orbitPivot = orbitPivot;
    planet.planetPivot = planetPivot;
    planet.planetMesh = planetMesh;

    // Create moons (if any) with similar group logic
    planet.moons.forEach((moon) => {
      const moonOrbitPivot = new THREE.Object3D();
      planetPivot.add(moonOrbitPivot);

      const moonMesh = new THREE.Mesh(sphereGeometry, moon.material);
      moonMesh.scale.setScalar(moon.radius);
      moonMesh.castShadow = true;
      moonMesh.receiveShadow = true;
      moonMesh.rotation.z = THREE.MathUtils.degToRad(moon.tilt || 0);
      moonMesh.position.set(moon.distance, 0, 0);
      moonOrbitPivot.add(moonMesh);

      moon.orbitPivot = moonOrbitPivot;
      moon.moonMesh = moonMesh;
    });

    planetObjects.push(planetMesh);
  });

  return {
    planets,
    planetObjects,
    // Update method to animate revolution and self-rotation
    update: function (delta) {
      planets.forEach((planet) => {
        planet.orbitPivot.rotation.y += planet.revolutionSpeed;
        planet.planetPivot.rotation.y += planet.rotationSpeed;
        planet.moons.forEach((moon) => {
          if (moon.orbitPivot) {
            moon.orbitPivot.rotation.y += moon.revolutionSpeed;
            if (moon.moonMesh) {
              moon.moonMesh.rotation.y += moon.rotationSpeed;
            }
          }
        });
      });
    },
  };
}
