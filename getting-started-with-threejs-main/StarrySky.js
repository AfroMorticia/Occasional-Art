// import from the "import map" (see index.html)
import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

// set the size of the scene to the window dimensions
const w = window.innerWidth;
const h = window.innerHeight;
const renderer = new THREE.WebGLRenderer({antialias : true});
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

// CAMERA
// field of view is in degrees
const fov = 75;
// make the camera dimensions equal to the window's 
const aspect = w/h;
// how close (in meters) before things disappear 
const near = 0.1;
// how far (in meters) before things disappear (set further if things don't look right) 
const far = 10;
// instantiate camera
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
// set the camera back a bit, so the default 0 0 0  position is visible 
camera.position.z = 2;

// SCENE
const scene = new THREE.Scene(); 

// camera orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5


// create a geometry, material, mesh and add them to the scene
const geo = new THREE.IcosahedronGeometry(1.0,5
);
const mat  = new THREE.MeshStandardMaterial({color: 0xff00ff,
transparent: true,
opacity: 0.8,
flatShading: true    
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);


// add a second Icosahedron to the scene
const geo2 = new THREE.IcosahedronGeometry(0.9,1
);
const mat2  = new THREE.MeshStandardMaterial({color: 0xff00ff,
transparent: true,
opacity: 0.8,
flatShading: true    
});
const mesh2 = new THREE.Mesh(geo2, mat2);
scene.add(mesh2);

// Child sphere (smaller floating object)
const childGeo = new THREE.SphereGeometry(0.2, 16, 16);
const childMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00 });
const childMesh = new THREE.Mesh(childGeo, childMat);
scene.add(childMesh);

//Hemisphere light
const hemiLight = new THREE.HemisphereLight(0x008B8B, 0xFF8C00, 1);
scene.add(hemiLight);

// Shooting Stars (Particle System)
const starGeo = new THREE.BufferGeometry();
const starCount = 100;
const positions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10; // Spread stars across space
}
starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

function animate(t = 0){
    requestAnimationFrame(animate);

mesh.scale.x = 1 + 0.1 * Math.sin(t * 0.002);
mesh.scale.y = 1 + 0.15 * Math.sin(t * 0.002 + Math.PI / 2);
mesh.scale.z = 1 + 0.1 * Math.sin(t * 0.002 + Math.PI);

mesh.rotation.y += 0.005;
mesh2.rotation.y -= 0.005; // Counter-rotation for trippy feel

const orbitRadius = 1.5;
childMesh.position.x = orbitRadius * Math.cos(t * 0.001);
childMesh.position.y = 0.3 * Math.sin(t * 0.004);//bobbing effect
childMesh.position.z = orbitRadius * Math.sin(t * 0.001);

  // Slightly shift vertices to make it feel alive
  geo.attributes.position.array.forEach((v, i) => {
    geo.attributes.position.array[i] += 0.002 * Math.sin(t * 0.001 + i);
  });
  geo.attributes.position.needsUpdate = true;

  // Color shift effect
  const hue = Math.sin(t * 0.0005) * 0.5 + 0.5; // Smooth hue transition
  mat.color.setHSL(hue, 1, 0.5);
  mat2.color.setHSL(1 - hue, 1, 0.5); // Opposite hue for contrast
  childMat.emissive.setHSL(hue, 1, 0.8);

  const pos = starGeo.attributes.position.array;
  for (let i = 0; i < starCount; i += 3) {
    pos[i + 1] -= 0.02; // Move downward
    if (pos[i + 1] < -5) pos[i + 1] = 5; // Reset if below threshold
  }
  starGeo.attributes.position.needsUpdate = true;

// render the scene
renderer.render(scene, camera);
//console.log(t);
}
// update controls
controls.update;

animate();
