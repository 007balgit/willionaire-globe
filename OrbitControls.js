
// OrbitControls from Three.js r152 (non-module version)
THREE.OrbitControls = function (object, domElement) {
  const scope = this;
  this.object = object;
  this.domElement = domElement !== undefined ? domElement : document;
  this.enabled = true;
  this.target = new THREE.Vector3();
  this.minDistance = 0;
  this.maxDistance = Infinity;
  this.autoRotate = false;
  this.autoRotateSpeed = 2.0;
  this.enableZoom = true;
  this.zoomSpeed = 1.0;
  this.enableRotate = true;
  this.rotateSpeed = 1.0;
  this.enablePan = true;
  this.panSpeed = 1.0;
  this.screenSpacePanning = true;
  this.keyPanSpeed = 7.0;
  this.enableDamping = false;
  this.dampingFactor = 0.05;
  this.update = function () {
    object.lookAt(scope.target);
  };
  this.dispose = function () {
    // No-op for minimal version
  };
