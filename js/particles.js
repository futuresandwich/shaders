window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

var WIDTH = 800,
	HEIGHT = 800;
	
var VIEW_ANGLE = 45,
	ASPECT = WIDTH/HEIGHT,
	NEAR = 0.1,
	FAR = 10000;	

var renderer = new THREE.WebGLRenderer();

renderer.setSize(WIDTH,HEIGHT);

var scene = new THREE.Scene();		

function createCamera()
{
	var camera = new THREE.PerspectiveCamera(
					VIEW_ANGLE,
					ASPECT,
					NEAR,
					FAR
				);
	camera.position.z = 300;
	return camera;
}

var light = new THREE.PointLight ( 0xFFFFFF );
light.position.x = 10;
light.position.y = 50;
light.position.z = 130;

var camera = createCamera();
var uniforms;
var particleSystem;

var particleCount = 1800,
    particles = new THREE.Geometry();

function main()
{
	var $container = $('#main');
	$container.append(renderer.domElement);	
	
	renderer.domElement.onmousemove = function() {
		light.position.x = window.event.clientX- WIDTH/2;
		light.position.y = HEIGHT/2 - window.event.clientY;
	};
	
	var attributes = {
		displacement: {
			type: 'f', // a float
			value: [] // an empty array
		}
	};
	  
	  // add a uniform for the amplitude
	uniforms = {
		amplitude: {
			type: 'f', // a float
			value: 0
		}
	};
	
	// create the material and now
	// include the attributes property
	var shaderMaterial = new THREE.ShaderMaterial({
		uniforms:		uniforms,
		attributes:     attributes,
		vertexShader:   $('#vertexshader').text(),
		fragmentShader: $('#fragmentshader').text()
	});
	
	// create the particle variables
	var pMaterial =
	  new THREE.ParticleBasicMaterial({
		color: 0xFFFFFF,
		size: 10,
		map: THREE.ImageUtils.loadTexture(
		  "img/particle.png"
		),
		blending: THREE.AdditiveBlending,
		transparent: true
	  });

	

	// now create the individual particles
	for(var p = 0; p < particleCount; p++) {
	  // create a particle with random
	  // position values, -250 -> 250
		var pX = Math.random() * 500 - 250,
		  pY = Math.random() * 500 - 250,
		  pZ = Math.random() * 500 - 250,
		particle = new THREE.Vector3(pX, pY, pZ);
		  // create a velocity vector
		particle.velocity = new THREE.Vector3(
		  0,              // x
		  Math.random(), // y: random vel
		  0);             // z

	  // add it to the geometry
	  particles.vertices.push(particle);
	}

	// create the particle system
	particleSystem =
	  new THREE.ParticleSystem(
		particles,
		pMaterial);

	// also update the particle system to
	// sort the particles which enables
	// the behaviour we want
	particleSystem.sortParticles = true;
	
	// add it to the scene
	scene.add(particleSystem);
	scene.add(light);	
	
	renderLoop();
}

function mouseMoveHandler()
{
	light.position.x = window.event.clientX;
	light.position.y = window.event.clientY;
}

var frame = 0;
function renderLoop()
{
	uniforms.amplitude.value = Math.sin(frame);
	var pCount = particleCount;
	while(pCount--) {

	// get the particle
	var particle =
	  particles.vertices[pCount];

	// check if we need to reset
	if(particle.y < (-1*HEIGHT/2)) {
	  particle.y = HEIGHT;
	  particle.velocity.y = Math.random()
	}

	// update the velocity with
	// a splat of randomniz
	particle.velocity.y +=
	  Math.random() * .1-0.05;
	    
	

	// and the position
	particle.addSelf(
	  particle.velocity);
	}

	// flag to the particle system
	// that we've changed its vertices.
	particleSystem.
		geometry.
		__dirtyVertices = true;
	
	frame += 0.1;
	renderer.render(scene, camera);
	requestAnimFrame(renderLoop);
}

$(document).ready(function () { main(); });