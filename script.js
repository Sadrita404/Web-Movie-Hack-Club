import * as THREE from 'three';

// --- SCENE SETUP (Sphere, Torus, Stars) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const starGeo = new THREE.BufferGeometry();
const starCount = 3000;
const starPos = new Float32Array(starCount * 3);
for(let i = 0; i < starCount * 3; i++) { starPos[i] = (Math.random() - 0.5) * 150; }
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.1, color: 0xffffff }));
scene.add(stars);

const sphere = new THREE.Mesh(new THREE.SphereGeometry(2, 32, 32), new THREE.MeshBasicMaterial({ color: 0x3b82f6, wireframe: true }));
scene.add(sphere);

const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(1, 0.4, 100, 16), new THREE.MeshStandardMaterial({ color: 0xec4899 }));
torus.position.x = 50; 
scene.add(torus);

// --- CUBE & SLIDER ---
const textureLoader = new THREE.TextureLoader();
const proxyUrl = 'https://images.weserv.nl/?url=drive.google.com/uc?id=1BY_aOeVS9yY0EMhG40TKfOUVnbwBpObB';
const cube = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
cube.position.y = -50;
scene.add(cube);
textureLoader.load(proxyUrl, (tex) => { cube.material.map = tex; cube.material.needsUpdate = true; });

scene.add(new THREE.DirectionalLight(0xffffff, 2), new THREE.AmbientLight(0xffffff, 0.5));
camera.position.z = 10;

let isUserRotating = false;
let targetRot = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY, vh = window.innerHeight;
    sphere.position.x = -(scrollY / vh) * 15;
    if (scrollY > vh * 0.7 && scrollY < vh * 1.8) torus.position.x = 8 - ((scrollY - vh) / vh) * 15;
    else torus.position.x = 50;
    if (scrollY > vh * 2.0 && scrollY < vh * 3.2) cube.position.y = 0;
    else cube.position.y = -50;
});

const slider = document.getElementById('box-slider');
slider.addEventListener('input', (e) => { 
    isUserRotating = true;
    targetRot = parseFloat(e.target.value); 
});

// --- THEME TOGGLE ---
const themeBtn = document.getElementById('theme-switch');
const themeIcon = document.getElementById('theme-icon');
themeBtn.addEventListener('click', () => {
    const body = document.body;
    if (body.classList.contains('dark-mode')) {
        body.classList.replace('dark-mode', 'light-mode');
        themeIcon.setAttribute('data-lucide', 'sun');
        stars.material.color.setHex(0x000000);
    } else {
        body.classList.replace('light-mode', 'dark-mode');
        themeIcon.setAttribute('data-lucide', 'moon');
        stars.material.color.setHex(0xffffff);
    }
    lucide.createIcons();
});

// --- NEW PARTICLE LOOP LOGIC ---
const pCanvas = document.getElementById('particle-canvas');
const pCtx = pCanvas.getContext('2d');
let particles = [];
let particleState = "assembling"; 
let stateTimer = 0;

function initParticles() {
    pCanvas.width = window.innerWidth; 
    pCanvas.height = 400;
    pCtx.font = "bold " + (Math.min(pCanvas.width / 10, 80)) + "px Arial";
    pCtx.textAlign = "center";
    pCtx.fillText("BY SADRITA", pCanvas.width / 2, pCanvas.height / 2);
    
    const data = pCtx.getImageData(0, 0, pCanvas.width, pCanvas.height).data;
    particles = [];
    for (let i = 0; i < pCanvas.width; i += 6) {
        for (let j = 0; j < pCanvas.height; j += 6) {
            if (data[(i + j * pCanvas.width) * 4 + 3] > 128) {
                particles.push({
                    x: Math.random() * pCanvas.width,
                    y: Math.random() * pCanvas.height,
                    originX: Math.random() * pCanvas.width,
                    originY: Math.random() * pCanvas.height,
                    targetX: i,
                    targetY: j
                });
            }
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.001;
    sphere.rotation.y += 0.005;

    if (!isUserRotating) {
        cube.rotation.y += 0.01;
        slider.value = cube.rotation.y % 6.28;
    } else {
        cube.rotation.y = THREE.MathUtils.lerp(cube.rotation.y, targetRot, 0.1);
    }
    
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    stateTimer++;

    particles.forEach(p => {
        let tx, ty;

        if (particleState === "assembling") {
            tx = p.targetX;
            ty = p.targetY;
            // 0.5 sec (30 frames)
            if (stateTimer > 30) { 
                particleState = "holding"; 
                stateTimer = 0; 
            }
        } 
        else if (particleState === "holding") {
            tx = p.targetX;
            ty = p.targetY;
            // 0.5 sec (30 frames)
            if (stateTimer > 30) { 
                particleState = "dispersing"; 
                stateTimer = 0; 
            }
        } 
        else if (particleState === "dispersing") {
            tx = p.originX;
            ty = p.originY;
            // 0.5 sec (30 frames)
            if (stateTimer > 30) { 
                particleState = "assembling"; 
                stateTimer = 0; 
                p.originX = Math.random() * pCanvas.width;
                p.originY = Math.random() * pCanvas.height;
            }
        }

        // Increased speed (0.15) for shorter duration
        p.x += (tx - p.x) * 0.15;
        p.y += (ty - p.y) * 0.15;

        pCtx.fillStyle = "#facc15";
        pCtx.fillRect(p.x, p.y, 2, 2);
    });

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