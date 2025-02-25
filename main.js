import * as THREE from './libs/three.module.js';
import { OrbitControls } from './libs/OrbitControls.js';
import * as CANNON from './libs/cannon-es.js';


// Initialize Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Orbit Controls for camera interaction
const controls = new OrbitControls(camera, renderer.domElement);

// Initialize Cannon.js Physics World
const world = new CANNON.World();
world.gravity.set(0, -9.8, 0); // Gravity acts downward

// Create a Static Ground Plane
const groundMaterial = new CANNON.Material();
const groundBody = new CANNON.Body({
    mass: 0, // Mass 0 means static object
    shape: new CANNON.Plane(),
    material: groundMaterial
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotate plane to lay flat
world.addBody(groundBody);

// Create a Ground Plane for Rendering
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterialThree = new THREE.MeshStandardMaterial({ color: 0x808080, side: THREE.DoubleSide });
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterialThree);
groundMesh.rotation.x = -Math.PI / 2; // Rotate to match physics ground
scene.add(groundMesh);

// Add a Directional Light Source
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Function to Create a Falling Sphere
function createFallingSphere() {
    const radius = 0.3; // Sphere size
    
    // Create Physics Sphere
    const sphereMaterial = new CANNON.Material();
    const sphereBody = new CANNON.Body({
        mass: 1, // Give mass so it falls
        shape: new CANNON.Sphere(radius),
        position: new CANNON.Vec3((Math.random() - 0.5) * 5, 5, (Math.random() - 0.5) * 5), // Random spawn location
        material: sphereMaterial
    });
    world.addBody(sphereBody);

    // Create Visual Sphere in Three.js
    const sphereGeometry = new THREE.SphereGeometry(radius);
    const sphereMaterialThree = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }); // Random color
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterialThree);
    scene.add(sphereMesh);

    return { body: sphereBody, mesh: sphereMesh };
}

const spheres = []; // Store created spheres

// Event Listener to Create a Sphere on Click
document.addEventListener('click', () => {
    spheres.push(createFallingSphere());
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    world.step(1 / 60); // Step physics simulation

    // Sync physics bodies with Three.js meshes
    spheres.forEach(obj => {
        obj.mesh.position.copy(obj.body.position);
        obj.mesh.quaternion.copy(obj.body.quaternion);
    });

    renderer.render(scene, camera);
}

animate(); // Start animation loop
