/**
* Box Class handles movement of boxes
*/
function Box() {
	this.posn = new THREE.Vector3();
	this.rotation = new THREE.Vector3();
	this.speed = getRand(3, 20);
	this.init();
}

Box.ORIGIN = new THREE.Vector3();
Box.MAX_DISTANCE = 1000;
Box.INIT_POSN_RANGE = 500;
Box.FRONT_PLANE_Z = 1000;
Box.BACK_PLANE_Z = -1000;

Box.prototype.init = function() {
	this.posn.copy(Box.ORIGIN);
	this.posn.x = getRand(-Box.INIT_POSN_RANGE,Box.INIT_POSN_RANGE);
	this.posn.y = getRand(-Box.INIT_POSN_RANGE,Box.INIT_POSN_RANGE);
	this.posn.z = Box.BACK_PLANE_Z;
	this.rotation.x = (Math.random() * 360 ) * Math.PI / 180;
	this.rotation.y = (Math.random() * 360 ) * Math.PI / 180;
	this.rotation.z = (Math.random() * 360 ) * Math.PI / 180;
};

Box.prototype.update = function() {
	this.posn.z += this.speed * sketchParams.cubeSpeed * delta *0.05;
	if(this.posn.z > Box.FRONT_PLANE_Z) {
		this.init();
	}
	//this.rotation.x += 0.015;
};

//returns random number within a range
function getRand(minVal, maxVal) {
	return minVal + (Math.random() * (maxVal - minVal));
}