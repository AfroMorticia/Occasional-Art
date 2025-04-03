import * as THREE from "three";
import { OrbitControls } from "jsm/controls/OrbitControls.js";
import { getBody, getMouseBall } from "./getBodies.js";
import RAPIER from 'https://cdn.skypack.dev/@dimforge/rapier3d-compat@0.11.2';
import { EffectComposer } from "jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "jsm/postprocessing/UnrealBloomPass.js";

// set the size of the scene to the window dimensions
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 7;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

let mousePos = new THREE.Vector2();
let world, bodies = [], mouseBall, composer;

// Initialize Rapier and Physics World
(async function init() {
    await RAPIER.init();
    const gravity = { x: 0.0, y: 0, z: 0.0 };
    world = new RAPIER.World(gravity);

    const numBodies = 100;
    for (let i = 0; i < numBodies; i++) {
        const body = getBody(RAPIER, world);
        bodies.push(body);
        scene.add(body.mesh);
    }

    mouseBall = getMouseBall(RAPIER, world);
    scene.add(mouseBall.mesh);

    animate();
})();

// Set up post-processing
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(w, h), 2.0, 0.0, 0.005);
composer = new EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Hemisphere light
const hemiLight = new THREE.HemisphereLight(0x00bbff, 0xaa00ff);
hemiLight.intensity = 0.2;
scene.add(hemiLight);

// Camera orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.5;

// Create a geometry, material, and mesh
const geo = new THREE.IcosahedronGeometry(2.0, 5);
const mat = new THREE.MeshStandardMaterial({
    color: 0xff00ff,
    transparent: true,
   // opacity: 0.8,
    flatShading: true
});
const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

// Child sphere (smaller floating object)
const childGeo = new THREE.SphereGeometry(0.2, 16, 16);
const childMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffcc00 });
const childMesh = new THREE.Mesh(childGeo, childMat);
scene.add(childMesh);

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

function animate(t = 0) {
    requestAnimationFrame(animate);
    world.step();

    mouseBall.update(mousePos);
    bodies.forEach(b => b.update());
    controls.update();
    composer.render();

    // Scaling animation for the mesh
    mesh.scale.x = 1 + 0.1 * Math.sin(t * 0.002);
    mesh.scale.y = 1 + 0.15 * Math.sin(t * 0.002 + Math.PI / 2);
    mesh.scale.z = 1 + 0.1 * Math.sin(t * 0.002 + Math.PI);
    mesh.rotation.y += 0.005;

    // Orbiting child sphere
    const orbitRadius = 2.5;
    childMesh.position.x = orbitRadius * Math.cos(t * 0.001);
    childMesh.position.y = 0.3 * Math.sin(t * 0.004); // Bobbing effect
    childMesh.position.z = orbitRadius * Math.sin(t * 0.001);

    // Vertex wobble effect
    geo.attributes.position.array.forEach((v, i) => {
        geo.attributes.position.array[i] += 0.002 * Math.sin(t * 0.001 + i);
    });
    geo.attributes.position.needsUpdate = true;

    // Color shift effect
    const hue = Math.sin(t * 0.0005) * 0.5 + 0.5;
    mat.color.setHSL(hue, 1, 0.5);
    childMat.emissive.setHSL(hue, 1, 0.8);

    // Shooting stars movement
    const pos = starGeo.attributes.position.array;
    for (let i = 0; i < starCount * 3; i += 3) {
        pos[i + 1] -= 0.02; // Move downward
        if (pos[i + 1] < -5) pos[i + 1] = 5; // Reset if below threshold
    }
    starGeo.attributes.position.needsUpdate = true;
}

// Handle window resize
function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

// Handle mouse movement
function handleMouseMove(evt) {
    mousePos.x = (evt.clientX / window.innerWidth) * 2 - 1;
    mousePos.y = -(evt.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', handleMouseMove, false);
