// The signature visual: an animated torus ("Flow Ring") whose material
// color cycles from amber (sunrise) through blue (midday) to indigo (dusk),
// literally representing the tagline "Every workday, perfectly aligned."
// Rendered on the sign-in page inside .auth-visual__scene.

function createFlowRing(scene) {
  const geometry = new THREE.TorusKnotGeometry(1.15, 0.32, 180, 24, 2, 3);
  const material = new THREE.MeshStandardMaterial({
    color: 0xff8c42,
    metalness: 0.35,
    roughness: 0.25,
    emissive: 0x33418b,
    emissiveIntensity: 0.15,
  });

  const ring = new THREE.Mesh(geometry, material);
  scene.add(ring);

  // Small orbiting sphere = "the workday" moving through the ring's cycle.
  const orbGeometry = new THREE.SphereGeometry(0.18, 32, 32);
  const orbMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffe4cc, emissiveIntensity: 0.6 });
  const orb = new THREE.Mesh(orbGeometry, orbMaterial);
  scene.add(orb);

  const dayColors = [0xff8c42, 0x33418b, 0x232e68, 0xff8c42]; // sunrise -> blue -> dusk -> sunrise

  return {
    ring,
    orb,
    update(elapsed) {
      ring.rotation.x = elapsed * 0.18;
      ring.rotation.y = elapsed * 0.24;

      // Cycle the ring's emissive/base color slowly to suggest a day passing.
      const cyclePos = (elapsed * 0.05) % 1;
      const colorIndex = Math.floor(cyclePos * (dayColors.length - 1));
      const t = (cyclePos * (dayColors.length - 1)) - colorIndex;
      const c1 = new THREE.Color(dayColors[colorIndex]);
      const c2 = new THREE.Color(dayColors[colorIndex + 1] ?? dayColors[0]);
      material.color.copy(c1).lerp(c2, t);

      // Orbit the small sphere around the ring like a clock hand.
      const orbitRadius = 2.1;
      orb.position.set(
        Math.cos(elapsed * 0.4) * orbitRadius,
        Math.sin(elapsed * 0.4) * orbitRadius * 0.6,
        Math.sin(elapsed * 0.25) * 0.8
      );
    },
  };
}

// Boots the full sign-in scene: canvas + lights + ring + particles + render loop.
function initSignInScene(canvasId) {
  const canvasEl = document.getElementById(canvasId);
  if (!canvasEl || typeof THREE === 'undefined') return;

  const { scene, camera, renderer } = createScene(canvasEl);
  const flowRing = createFlowRing(scene);
  const particles = typeof createParticleField === 'function' ? createParticleField(scene) : null;

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    flowRing.update(elapsed);
    if (particles) particles.update(elapsed);
    renderer.render(scene, camera);
  }

  // Respect reduced-motion users: render one static frame instead of looping.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    flowRing.update(0.6);
    renderer.render(scene, camera);
  } else {
    animate();
  }
}
