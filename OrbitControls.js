// OrbitControls from Three.js r152 (non-module version)
THREE.OrbitControls = function (object, domElement) {
  const scope = this;
  this.object = object;
  this.domElement = domElement !== undefined ? domElement : document;

  this.enabled = true;
  this.target = new THREE.Vector3();

  this.minDistance = 0;
  this.maxDistance = Infinity;

  this.enableZoom = true;
  this.zoomSpeed = 1.0;

  this.enableRotate = true;
  this.rotateSpeed = 1.0;

  this.enablePan = false;

  this.autoRotate = true;
  this.autoRotateSpeed = 0.4;

  this.update = function () {
    object.lookAt(scope.target);
  };

  this.dispose = function () {
    // minimal version – no-op
  };
};
