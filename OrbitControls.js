// OrbitControls.js (non-module, for r152 and earlier)
THREE.OrbitControls = function (object, domElement) {
    this.object = object;
    this.domElement = domElement || document;

    // API
    this.enabled = true;
    this.target = new THREE.Vector3();
    this.minDistance = 0;
    this.maxDistance = Infinity;
    this.enableZoom = true;
    this.zoomSpeed = 1.0;
    this.enableRotate = true;
    this.rotateSpeed = 1.0;
    this.enablePan = true;
    this.panSpeed = 1.0;
    this.autoRotate = false;
    this.autoRotateSpeed = 2.0;

    var scope = this;
    var changeEvent = { type: 'change' };
    var EPS = 0.000001;

    var spherical = new THREE.Spherical();
    var sphericalDelta = new THREE.Spherical();

    var scale = 1;
    var panOffset = new THREE.Vector3();
    var zoomChanged = false;

    var rotateStart = new THREE.Vector2();
    var rotateEnd = new THREE.Vector2();
    var rotateDelta = new THREE.Vector2();

    var zoomStart = new THREE.Vector2();
    var zoomEnd = new THREE.Vector2();
    var zoomDelta = new THREE.Vector2();

    var panStart = new THREE.Vector2();
    var panEnd = new THREE.Vector2();
    var panDelta = new THREE.Vector2();

    var STATE = { NONE: -1, ROTATE: 0, DOLLY: 1, PAN: 2 };
    var state = STATE.NONE;

    function getPolarAngle() {
        return spherical.phi;
    }

    function getAzimuthalAngle() {
        return spherical.theta;
    }

    function rotateLeft(angle) {
        sphericalDelta.theta -= angle;
    }

    function rotateUp(angle) {
        sphericalDelta.phi -= angle;
    }

    function dollyIn(dollyScale) {
        scale /= dollyScale;
    }

    function dollyOut(dollyScale) {
        scale *= dollyScale;
    }

    function panLeft(distance, objectMatrix) {
        var v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 0);
        v.multiplyScalar(-distance);
        panOffset.add(v);
    }

    function panUp(distance, objectMatrix) {
        var v = new THREE.Vector3();
        v.setFromMatrixColumn(objectMatrix, 1);
        v.multiplyScalar(distance);
        panOffset.add(v);
    }

    function pan(deltaX, deltaY) {
        var element = scope.domElement === document ? scope.domElement.body : scope.domElement;
        if (scope.object.isPerspectiveCamera) {
            var position = scope.object.position;
            var offset = position.clone().sub(scope.target);
            var targetDistance = offset.length();
            targetDistance *= Math.tan((scope.object.fov / 2) * Math.PI / 180.0);
            panLeft(2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix);
            panUp(2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix);
        }
    }

    function onMouseDown(event) {
        if (!scope.enabled) return;
        event.preventDefault();

        if (event.button === 0 && scope.enableRotate) {
            rotateStart.set(event.clientX, event.clientY);
            state = STATE.ROTATE;
        } else if (event.button === 1 && scope.enableZoom) {
            zoomStart.set(event.clientX, event.clientY);
            state = STATE.DOLLY;
        } else if (event.button === 2 && scope.enablePan) {
            panStart.set(event.clientX, event.clientY);
            state = STATE.PAN;
        }

        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
    }

    function onMouseMove(event) {
        if (!scope.enabled) return;

        if (state === STATE.ROTATE) {
            rotateEnd.set(event.clientX, event.clientY);
            rotateDelta.subVectors(rotateEnd, rotateStart);
            rotateLeft(2 * Math.PI * rotateDelta.x / domElement.clientHeight * scope.rotateSpeed);
            rotateUp(2 * Math.PI * rotateDelta.y / domElement.clientHeight * scope.rotateSpeed);
            rotateStart.copy(rotateEnd);
        } else if (state === STATE.DOLLY) {
            zoomEnd.set(event.clientX, event.clientY);
            zoomDelta.subVectors(zoomEnd, zoomStart);
            if (zoomDelta.y > 0) {
                dollyOut(Math.pow(0.95, scope.zoomSpeed));
            } else {
                dollyIn(Math.pow(0.95, scope.zoomSpeed));
            }
            zoomStart.copy(zoomEnd);
        } else if (state === STATE.PAN) {
            panEnd.set(event.clientX, event.clientY);
            panDelta.subVectors(panEnd, panStart);
            pan(panDelta.x, panDelta.y);
            panStart.copy(panEnd);
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove, false);
        document.removeEventListener('mouseup', onMouseUp, false);
        state = STATE.NONE;
    }

    function onMouseWheel(event) {
        if (!scope.enabled || !scope.enableZoom) return;
        event.preventDefault();
        if (event.deltaY < 0) {
            dollyIn(Math.pow(0.95, scope.zoomSpeed));
        } else {
            dollyOut(Math.pow(0.95, scope.zoomSpeed));
        }
    }

    this.update = function () {
        var offset = new THREE.Vector3();
        var quat = new THREE.Quaternion().setFromUnitVectors(object.up, new THREE.Vector3(0, 1, 0));
        var quatInverse = quat.clone().invert();

        var position = scope.object.position;
        offset.copy(position).sub(scope.target);
        offset.applyQuaternion(quat);
        spherical.setFromVector3(offset);

        if (scope.autoRotate && state === STATE.NONE) {
            rotateLeft(2 * Math.PI / 60 / 60 * scope.autoRotateSpeed);
        }

        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;
        spherical.makeSafe();
        spherical.radius *= scale;

        offset.setFromSpherical(spherical);
        offset.applyQuaternion(quatInverse);
        position.copy(scope.target).add(offset);
        scope.object.lookAt(scope.target);

        sphericalDelta.set(0, 0, 0);
        scale = 1;
        panOffset.set(0, 0, 0);
    };

    domElement.addEventListener('mousedown', onMouseDown, false);
    domElement.addEventListener('wheel', onMouseWheel, false);
};
