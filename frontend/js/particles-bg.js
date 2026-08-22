// Creates a soft floating-particle field used behind the sign-in "Flow Ring"
// scene — small dust-mote points drifting slowly, evoking a calm morning.

function createParticleField(scene, count = 140) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffe4cc,
    size: 0.035,
    transparent: true,
    opacity: 0.7,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  return {
    points,
    update(elapsed) {
      points.rotation.y = elapsed * 0.02;
      points.rotation.x = Math.sin(elapsed * 0.05) * 0.05;
    },
  };
}
