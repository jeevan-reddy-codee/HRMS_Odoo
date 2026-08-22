// Sets up the shared Three.js "stage" — camera, renderer, lighting —
// that other 3D files (flow-ring, particles-bg) render into.
// Loaded via <script src="https://cdnjs.cloudflare.com/.../three.min.js">
// before this file, so the global THREE is available.

function createScene(canvasEl) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    canvasEl.clientWidth / canvasEl.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);

  // Soft key + fill lighting — no harsh shadows, matches the flat/soft UI style.
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);

  const fillLight = new THREE.AmbientLight(0xfff1e0, 0.6);
  scene.add(fillLight);

  function handleResize() {
    const { clientWidth, clientHeight } = canvasEl;
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(clientWidth, clientHeight);
  }
  window.addEventListener('resize', handleResize);

  return { scene, camera, renderer, handleResize };
}
