import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- 1. COOL BACKGROUND ANIMATION (Starfield) ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 3000;
const posArray = new Float32Array(starCount * 3);

for(let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0xffffff });
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// --- 2. THE MAIN OBJECTS ---
const textureLoader = new THREE.TextureLoader();

const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true })
);
scene.add(sphere);

const torus = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.2, 0.4, 100, 16),
    new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.8, roughness: 0.1 })
);
torus.position.x = 30; 
scene.add(torus);

const cubeImg = textureLoader.load('https://drive.google.com/uc?export=view&id=1BY_aOeVS9yY0EMhG40TKfOUVnbwBpObB');
const cube = new THREE.Mesh(
    new THREE.BoxGeometry(3, 3, 3),
    new THREE.MeshStandardMaterial({ map: cubeImg })
);
cube.position.y = -30;
scene.add(cube);

const light = new THREE.PointLight(0xffffff, 100);
light.position.set(5, 5, 5);
scene.add(light, new THREE.AmbientLight(0xffffff, 0.4));
camera.position.z = 8;

// --- 3. THEME & PARTICLES ---
let scrollVelocity = 0;
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];

class Particle {
    constructor(x, y) {
        this.x = Math.random() * pCanvas.width;
        this.y = Math.random() * pCanvas.height;
        this.dest = { x, y };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.color = "#facc15"; 
    }
    update() {
        this.acc.x = (this.dest.x - this.x) / 300;
        this.acc.y = (this.dest.y - this.y) / 300;
        this.vel.x = (this.vel.x + this.acc.x) * 0.9;
        this.vel.y = (this.vel.y + this.acc.y) * 0.9;
        this.x += this.vel.x; this.y += this.vel.y;
    }
    draw() {
        pCtx.fillStyle = this.color;
        pCtx.fillRect(this.x, this.y, 2.5, 2.5);
    }
}

function initParticles() {
    pCanvas.width = window.innerWidth;
    pCanvas.height = 500;
    pCtx.font = "bold " + (pCanvas.width / 10) + "px Arial";
    pCtx.textAlign = "center";
    pCtx.fillText("MADE BY SADRITA", pCanvas.width / 2, pCanvas.height / 2);
    const data = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height).data;
    particles = [];
    for (let i = 0; i < pCanvas.width; i += 5) {
        for (let j = 0; j < pCanvas.height; j += 5) {
            if (data[(i + j * pCanvas.width) * 4 + 3] > 128) particles.push(new Particle(i, j));
        }
    }
}

// --- 4. THEME TOGGLE ---
const themeBtn = document.getElementById('theme-switch');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    document.getElementById('theme-icon').setAttribute('data-lucide', isLight ? 'sun' : 'moon');
    stars.visible = !isLight;
    lucide.createIcons();
});

// --- 5. ANIMATION LOOP ---
window.addEventListener('scroll', (e) => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;
    scrollVelocity = 2; // Trigger warp effect on scroll

    sphere.position.x = -(scrollY / vh) * 15;
    if (scrollY > vh * 0.8) {
        torus.position.x = 5 - ((scrollY - vh) / vh) * 10;
    } else { torus.position.x = 30; }

    if (scrollY > vh * 1.8) {
        cube.position.y = 0;
    } else { cube.position.y = -30; }
});

document.getElementById('box-slider').addEventListener('input', (e) => {
    cube.rotation.y = e.target.value;
});

function animate() {
    requestAnimationFrame(animate);
    
    // Background Warp Effect
    stars.rotation.y += 0.001 + (scrollVelocity * 0.02);
    scrollVelocity *= 0.95; // Gradually slow down warp

    sphere.rotation.y += 0.01;
    torus.rotation.z += 0.01;
    
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    
    renderer.render(scene, camera);
}

initParticles();
animate();
lucide.createIcons();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    initParticles();
});