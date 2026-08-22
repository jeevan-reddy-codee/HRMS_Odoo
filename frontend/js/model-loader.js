// Optional helper for loading external .glb/.gltf models (e.g. a branded
// 3D mascot or office-building model) if you add one to /assets/models.
// Not required for the built-in Flow Ring, which is pure procedural geometry.
// Requires GLTFLoader: https://cdnjs.cloudflare.com/.../GLTFLoader.js

function loadModel(scene, url, { scale = 1, onLoad, onError } = {}) {
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.warn('[model-loader] THREE.GLTFLoader is not loaded — include the GLTFLoader script before calling loadModel().');
    return;
  }

  const loader = new THREE.GLTFLoader();
  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(scale);
      scene.add(model);
      if (onLoad) onLoad(model);
    },
    undefined,
    (err) => {
      console.error(`[model-loader] Failed to load ${url}:`, err);
      if (onError) onError(err);
    }
  );
}
